# Polish & Complete: Image Paste Fix + Easy Feature Flags

Date: 2026-04-01

## Overview

Two workstreams to improve stability and unlock gated features in this unbundled Claude Code fork:

1. **Fix the image paste freeze** — a concrete bug where pasting clipboard images freezes the terminal
2. **Implement 15 easy broken feature flags** — each needs a single missing source file to compile

## Workstream 1: Image Paste Freeze Fix

### Problem

Pasting an image into the terminal freezes the prompt indefinitely. The root cause is in `src/utils/imagePaste.ts`: the `execa` calls to `osascript` have no timeout. When the macOS clipboard manager blocks (e.g. binary clipboard data that osascript can't parse as a pasteboard format), the process hangs forever.

### Freeze path

```
User pastes image (Cmd+V)
  -> Terminal sends empty bracketed paste sequence
  -> usePasteHandler.ts detects: isPasted=true, input.length=0, isMacOS
  -> checkClipboardForImage() called
  -> getImageFromClipboard() awaited
  -> execa('osascript ...', { shell: true, reject: false })  // NO TIMEOUT
  -> osascript blocks on clipboard manager
  -> FREEZE
```

### Fix

Add a timeout to all three `execa` calls in `imagePaste.ts`:

- `hasImageInClipboard()` — the `checkImage` osascript call (line 117-121)
- `getImageFromClipboard()` — the `checkImage` call (line 189-192) and `saveImage` call (line 198-201)
- `getImagePathFromClipboard()` — the `getPath` call (line 249-252)

Use a 5-second timeout. Clipboard operations should complete in under 1 second; 5 seconds is generous while still preventing indefinite hangs. On timeout, return `null`/`false` (same as failure path).

The codebase has `execFileNoThrowWithCwd` with a 600s default, but that's too long for clipboard ops and uses a different calling convention. Simplest fix: add `timeout: 5000` to the existing `execa` options.

### Files changed

- `src/utils/imagePaste.ts` — add `timeout: 5000` to 4 execa calls

### Scope

~4 lines changed. No new files. No behavioral change except hanging operations now fail gracefully after 5 seconds.

## Workstream 2: Easy Broken Feature Flags

### Approach

Each of the 15 flags fails because a single file is missing. The surrounding code (imports, feature gates, UI wiring) already exists. For each flag, we create the missing file with the expected exports, implementing real functionality where the surrounding context makes behavior clear, and providing minimal no-op stubs where the intended behavior is ambiguous or depends on missing external systems.

### Tier A — Most useful, simplest

#### 1. TORCH — `src/commands/torch.js`

- **Expected export:** `default` (command object)
- **What it does:** Single slash command. Need to examine other command patterns to determine purpose.
- **Implementation:** Stub command following the pattern of other simple commands in `src/commands/`.

#### 2. HISTORY_SNIP — `src/commands/force-snip.js`

- **Expected export:** `default` (command object)
- **What it does:** Manual history snip/truncation command. Pairs with existing SnipTool.
- **Implementation:** Command that triggers the existing snip/compaction machinery via `snipModule` in `src/query.ts`.
- **Also referenced in:** `src/tools.ts` (SnipTool), `src/query.ts` (snipModule)

#### 3. AUTO_THEME — `src/utils/systemThemeWatcher.js`

- **Expected export:** Named `watchSystemTheme(querier, setSystemTheme)` returning cleanup function
- **What it does:** Watches terminal theme changes via OSC 11 protocol. `src/utils/systemTheme.ts` already has `themeFromOscColor()` and `getSystemThemeName()`.
- **Implementation:** Set up an interval or terminal event listener that queries terminal background color via OSC 11 escape sequence, parses it with existing helpers, and calls `setSystemTheme()` on changes.

#### 4. BUDDY — `src/commands/buddy/index.js`

- **Expected export:** `default` (command object)
- **What it does:** Buddy command. UI components and prompt-input hooks already exist.
- **Implementation:** Command registration following standard pattern.

#### 5. FORK_SUBAGENT — `src/commands/fork/index.js`

- **Expected export:** `default` (command object)
- **What it does:** Fork current conversation into a subagent. Message rendering support exists.
- **Implementation:** Command that spawns a new agent with the current conversation context.

### Tier B — Useful but more involved

#### 6. BG_SESSIONS — `src/cli/bg.js`

- **Expected exports:** `psHandler(args)`, `logsHandler(id)`, `attachHandler(id)`, `killHandler(id)`, `handleBgFlag(args)`
- **What it does:** Background session management — list, view logs, attach, kill background CLI sessions.
- **Implementation:** Use the existing session/history infrastructure to manage detached sessions. Needs process management (spawn detached, PID tracking, log tailing).

#### 7. TEMPLATES — `src/cli/handlers/templateJobs.js`

- **Expected export:** Named `templatesMain(args: string[]): Promise<void>`
- **What it does:** Template job CLI commands (new, list, reply). Fast-path dispatch in `cli.tsx`.
- **Implementation:** Template system for reusable prompt/project templates.

#### 8. COMMIT_ATTRIBUTION — `src/utils/attributionHooks.js`

- **Expected exports:** Hook functions called from `src/setup.ts`, `src/commands/clear/caches.ts`, `src/services/compact/postCompactCleanup.ts`
- **What it does:** Tracks commit attribution (which commits were made by the CLI).
- **Implementation:** Hook that records git commit metadata for attribution tracking. Setup/teardown in session lifecycle.

#### 9. MCP_SKILLS — `src/skills/mcpSkills.js`

- **Expected exports:** MCP skill discovery/loading functions
- **What it does:** Load skills from connected MCP servers. `mcpSkillBuilders.ts` already exists.
- **Implementation:** Registry layer that queries MCP servers for skill definitions and registers them via the existing skill system.

#### 10. RUN_SKILL_GENERATOR — `src/skills/bundled/runSkillGenerator.js` (note: imported from bundled/)

- **Expected export:** Named `registerRunSkillGeneratorSkill()`
- **What it does:** Interactive skill creation/generation tool.
- **Implementation:** Bundled skill that walks the user through creating a new skill file with proper frontmatter and content.

#### 11. TRANSCRIPT_CLASSIFIER — prompt text files

- **Missing files:**
  - `src/utils/permissions/yolo-classifier-prompts/auto_mode_system_prompt.txt`
  - `src/utils/permissions/yolo-classifier-prompts/permissions_external.txt`
- **What it does:** System prompts for YOLO/auto-mode permission classifier. The classifier engine, parser, and settings already exist.
- **Implementation:** Write classifier prompts that instruct the LLM to evaluate tool permission requests (allow/deny) based on risk level, command content, and context.

### Tier C — Niche / low-priority

#### 12. MEMORY_SHAPE_TELEMETRY — `src/memdir/memoryShapeTelemetry.js`

- **Expected exports:** `logMemoryWriteShape(...)`, `logMemoryRecallShape(memories, selected)`
- **What it does:** Telemetry for memory access patterns. Since telemetry is stripped in this fork, this should be a no-op stub.
- **Implementation:** Export the two functions as no-ops. Enables the flag to compile without adding any actual telemetry.

#### 13. OVERFLOW_TEST_TOOL — `src/tools/OverflowTestTool/OverflowTestTool.js`

- **Expected exports:** `OverflowTestTool` (Tool class), `OVERFLOW_TEST_TOOL_NAME` (string)
- **What it does:** Test tool for overflow conditions. Dev/test only.
- **Implementation:** Minimal Tool subclass that generates large output for testing context overflow handling.

#### 14. KAIROS_GITHUB_WEBHOOKS — `src/tools/SubscribePRTool/SubscribePRTool.js`

- **Expected export:** `SubscribePRTool` (Tool class)
- **What it does:** Subscribe to GitHub PR webhooks for notifications.
- **Implementation:** Tool that uses GitHub API to set up webhook subscriptions on PRs. Depends on Kairos notification infrastructure which is partially missing.

#### 15. KAIROS_PUSH_NOTIFICATION — `src/tools/PushNotificationTool/PushNotificationTool.js`

- **Expected export:** `PushNotificationTool` (Tool class)
- **What it does:** Send push notifications. Part of Kairos stack.
- **Implementation:** Tool stub. Full functionality depends on the Kairos notification backend which isn't in this snapshot.

#### 16. BUILDING_CLAUDE_APPS — `src/skills/bundled/claude-api/csharp/claude-api.md`

- **Expected content:** Markdown documentation for Claude API usage in C#
- **What it does:** Part of the Claude API skill. Other language docs (Python, Go, Java, PHP, Ruby) already exist.
- **Implementation:** Write C# API documentation following the pattern of existing language docs.

## Implementation Order

1. Image paste fix (standalone, immediate value)
2. Tier A flags (5 flags, highest value-to-effort)
3. Tier B flags (6 flags, more implementation work)
4. Tier C flags (5 flags, stubs and niche features)

## Success Criteria

- Pasting images no longer freezes the terminal (timeout after 5s, graceful fallback)
- All 15 easy flags compile cleanly with `bun run build:dev:full`
- No regressions in existing functionality
- Each new file follows the patterns established by surrounding code
