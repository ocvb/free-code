# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Unbundled fork of Anthropic's Claude Code CLI (v2.1.87). Telemetry stripped, security-prompt guardrails removed, 45+ experimental feature flags unlocked. Single compiled binary, zero callbacks home.

## Build & Run Commands

```bash
bun install                          # Install dependencies
bun run build                        # Production binary → ./cli (VOICE_MODE only)
bun run build:dev                    # Dev binary → ./cli-dev (dev version stamp)
bun run build:dev:full               # Dev binary with ALL 45+ experimental flags → ./cli-dev
bun run compile                      # Alternative output → ./dist/cli
bun run dev                          # Run from source without compiling (slower)

# Enable specific feature flags
bun run ./scripts/build.ts --feature=ULTRAPLAN --feature=ULTRATHINK
bun run ./scripts/build.ts --dev --feature=BRIDGE_MODE

# Run the binary
./cli                                # Interactive REPL
./cli -p "prompt"                    # One-shot mode
./cli --model claude-sonnet-4-6-20250514  # Specific model
```

There are no tests, no test framework, and no CI/CD configured.

## Architecture

### Runtime & Build

- **Runtime:** Bun >= 1.3.11 (not Node)
- **Language:** TypeScript (strict disabled, allowJs, skipLibCheck)
- **UI:** React 19 + Ink 6.8 (terminal UI framework)
- **Build:** `scripts/build.ts` uses `bun build --compile` to produce standalone bytecode binaries
- **Feature flags:** Compile-time via `bun:bundle` — `feature('FLAG_NAME')` calls are dead-code-eliminated when disabled. See FEATURES.md for the full 88-flag audit.

### Key Entry Points

- `src/entrypoints/cli.tsx` — Bootstrap entrypoint with zero-import fast paths (--version, --dump-system-prompt), then delegates to `src/main.tsx`
- `src/main.tsx` (785 KB) — Full CLI launcher: auth, plugins, MCP servers, skills, tools, commands assembly → renders Ink app
- `src/screens/REPL.tsx` (876 KB) — Main interactive REPL screen

### Core Systems

| System | Key Files | Role |
|--------|-----------|------|
| **Query Engine** | `QueryEngine.ts`, `query.ts` | LLM conversation loop, tool execution, context compaction, token budget |
| **Tools** | `Tool.ts`, `tools.ts`, `tools/` | Tool base class (Zod-typed I/O), registry with feature-gated lazy imports |
| **Commands** | `commands.ts`, `commands/` | Slash command registry and implementations |
| **State** | `state/AppState.tsx`, `state/AppStateStore.ts` | Global app state (React context-free store) |
| **Permissions** | `hooks/useCanUseTool.tsx`, `utils/permissions/` | Tool permission checking and gating |
| **MCP** | `services/mcp/` | Model Context Protocol client (stdio/SSE) |
| **API Client** | `services/api/`, `utils/api.ts`, `utils/auth.ts` | Anthropic Claude API + AWS/GCP/Azure backends |

### Source Layout

```
src/
  entrypoints/cli.tsx    # Bootstrap
  main.tsx               # Full launcher
  screens/               # Full-screen React/Ink UIs (REPL, Doctor)
  commands/              # /slash command implementations (50+)
  tools/                 # Agent tool implementations (30+: Bash, Read, Edit, Grep, Agent, MCP, etc.)
  components/            # Ink/React terminal UI components (170+ files)
  hooks/                 # React hooks (90+ files)
  services/              # Business logic: API, MCP, OAuth, analytics (stubbed), compaction
  state/                 # Global state store
  utils/                 # Utilities (60+ files)
  skills/, plugins/      # Skill and plugin systems
  bridge/                # IDE bridge (VS Code, JetBrains)
  voice/                 # Voice input system
  vim/                   # Vi keybinding support
  ink/                   # Custom Ink wrapper with layout/render engine
```

### Architectural Patterns

- **Feature-gated imports:** Commands, tools, and tasks use lazy `require()` behind `feature('FLAG')` checks. This is intentional for dead-code elimination and breaking circular deps.
- **Compile-time defines:** `MACRO.VERSION`, `MACRO.BUILD_TIME`, `MACRO.PACKAGE_URL`, etc. are injected via `--define` at build time.
- **Externalized packages:** `@ant/*`, `audio-capture-napi`, `image-processor-napi`, `modifiers-napi`, `url-handler-napi` are marked external — they don't exist in this snapshot.
- **`process.env.USER_TYPE`** is always `'external'` — code gated on `'ant'` (Anthropic-internal) is unreachable.

### Feature Flag System

54 of 88 flags compile cleanly. 34 fail due to missing source files. The build script (`scripts/build.ts`) defines a `fullExperimentalFeatures` array of 35 flags used by `--feature-set=dev-full`. Individual flags can be toggled with `--feature=FLAG`. See FEATURES.md for per-flag status and reconstruction guidance.

## Environment

- `ANTHROPIC_API_KEY` — Required for API access
- Alternative: `./cli /login` for Claude.ai OAuth
- AWS/GCP/Azure credential env vars supported for Bedrock/Vertex/Foundry backends
