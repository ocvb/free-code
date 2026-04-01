# Multi-LLM Support: OpenAI + HuggingFace

Date: 2026-04-01

## Overview

Add provider-independent LLM support so the CLI can run against OpenAI, HuggingFace, or any OpenAI-compatible endpoint (Ollama, Groq, Together AI, LM Studio, etc.) as a drop-in alternative to Anthropic's Claude API.

## Approach

Duck-typed shim pattern. Each provider implements a client that looks like the Anthropic SDK to the rest of the codebase. The shim translates message formats, streaming events, and tool calls at the boundary. The core query pipeline (`claude.ts`, `QueryEngine.ts`) stays untouched.

Reference: OpenClaude project uses this same approach with a ~700 line shim.

## Architecture

```
/provider command → providerRegistry → client.ts
                                          │
                    ┌─────────────────────┼──────────────────────┐
                    │                     │                      │
              AnthropicSDK         openaiShim.ts         huggingfaceShim.ts
              (existing)         (duck-types SDK)       (duck-types SDK)
                    │                     │                      │
              Claude API         OpenAI-compatible API    HF Inference API
```

## Components

### 1. Provider Registry (`src/services/api/providerRegistry.ts`)

Central registry for provider management.

```typescript
type ProviderName = 'anthropic' | 'openai' | 'huggingface'

type ProviderCapabilities = {
  streaming: boolean
  toolCalling: boolean
  vision: boolean
  thinking: boolean
  promptCaching: boolean
  structuredOutput: boolean
  maxOutputTokens: number
}

type ProviderConfig = {
  name: ProviderName
  displayName: string
  apiKey: string | null       // null = not configured
  baseUrl: string             // default per provider, overridable
  defaultModel: string
  models: string[]            // known models for this provider
  capabilities: (model: string) => ProviderCapabilities
}
```

State:
- Active provider stored in `~/.claude/settings.json` under `provider` key
- API keys stored in `~/.claude/settings.json` under `providerKeys` key
- Environment variables override stored config: `OPENAI_API_KEY`, `HF_TOKEN`, `OPENAI_BASE_URL`, `HF_BASE_URL`

Functions:
- `getActiveProvider(): ProviderName` — returns current provider
- `setActiveProvider(name: ProviderName): void` — switches provider
- `getProviderConfig(name: ProviderName): ProviderConfig`
- `setProviderApiKey(name: ProviderName, key: string): void`
- `getProviderCapabilities(name: ProviderName, model: string): ProviderCapabilities`
- `listProviders(): ProviderConfig[]`

### 2. OpenAI Shim (`src/services/api/openaiShim.ts`)

Duck-types as Anthropic SDK client. Handles:

**Message translation (Anthropic → OpenAI):**
- System prompt: Anthropic's `system` array of text blocks → OpenAI `system` message string
- User messages: Anthropic content blocks (text, image, tool_result) → OpenAI messages (user, tool)
- Assistant messages: Anthropic content blocks (text, tool_use) → OpenAI messages with `tool_calls`
- Images: Anthropic `{ type: 'image', source: { type: 'base64', data, media_type } }` → OpenAI `{ type: 'image_url', image_url: { url: 'data:...' } }`

**Tool translation:**
- Anthropic `{ name, description, input_schema }` → OpenAI `{ type: 'function', function: { name, description, parameters } }`
- `tool_choice`: Anthropic `{ type: 'auto' }` → OpenAI `'auto'`; `{ type: 'tool', name }` → `{ type: 'function', function: { name } }`; `{ type: 'any' }` → `'required'`

**Streaming translation (OpenAI SSE → Anthropic events):**
- `message_start` — emitted at stream start with empty usage
- `content_block_start` / `content_block_delta` / `content_block_stop` — translated from OpenAI `delta.content` and `delta.tool_calls`
- `input_json_delta` — tool call arguments streamed as partial JSON
- `message_delta` — stop reason translation: `'tool_calls'` → `'tool_use'`, `'length'` → `'max_tokens'`, `'stop'` → `'end_turn'`
- `message_stop` — emitted at stream end

**Usage translation:**
- OpenAI `prompt_tokens` → Anthropic `input_tokens`
- OpenAI `completion_tokens` → Anthropic `output_tokens`
- `cache_creation_input_tokens` and `cache_read_input_tokens` always 0

**Disabled features:**
- Extended thinking (no equivalent in OpenAI standard API)
- Prompt caching (Anthropic-specific)
- Beta headers (stripped)
- Server tool use / advisor (Anthropic-specific)

**Supported providers via base URL:**
- OpenAI: `https://api.openai.com/v1` (default)
- Ollama: `http://localhost:11434/v1`
- LM Studio: `http://localhost:1234/v1`
- Groq: `https://api.groq.com/openai/v1`
- Together AI: `https://api.together.xyz/v1`
- Any OpenAI-compatible endpoint

### 3. HuggingFace Shim (`src/services/api/huggingfaceShim.ts`)

Same duck-typing approach for HuggingFace Inference API.

HF's chat completion endpoint (`/models/{model}/v1/chat/completions`) speaks OpenAI-compatible format for most models. The shim can reuse most of the OpenAI translation logic, with HF-specific additions:

- Different base URL: `https://api-inference.huggingface.co`
- Auth header: `Authorization: Bearer {HF_TOKEN}` (same as OpenAI format)
- Model in URL path instead of request body for some endpoints
- Some models don't support tool calling — capability matrix handles this

Since HF's chat API is OpenAI-compatible, the HF shim can extend or wrap the OpenAI shim with HF-specific URL routing and auth.

### 4. Client Integration (`src/services/api/client.ts` — modify)

Add provider check before existing Bedrock/Vertex/Foundry cascade:

```typescript
// At top of getAnthropicClient():
const activeProvider = getActiveProvider()

if (activeProvider === 'openai' || isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENAI)) {
  const { createOpenAIShimClient } = await import('./openaiShim.js')
  return createOpenAIShimClient({ defaultHeaders, maxRetries, timeout }) as unknown as Anthropic
}

if (activeProvider === 'huggingface' || isEnvTruthy(process.env.CLAUDE_CODE_USE_HUGGINGFACE)) {
  const { createHuggingFaceShimClient } = await import('./huggingfaceShim.js')
  return createHuggingFaceShimClient({ defaultHeaders, maxRetries, timeout }) as unknown as Anthropic
}

// ... existing Bedrock/Vertex/Foundry/Anthropic cascade
```

### 5. Provider Command (`src/commands/provider/`)

Interactive `/provider` command:

**No args:** Opens interactive picker showing:
```
  Provider          Model              Status
▸ Anthropic        claude-sonnet-4-6   ✓ Active
  OpenAI           gpt-4o              ✓ Key set
  HuggingFace      meta-llama/...      ✗ No key
```

**With args:** `/provider openai` switches directly.

**Key prompt:** When switching to a provider with no API key configured, prompts:
```
Enter your OpenAI API key: sk-...
Key saved. Switched to OpenAI (gpt-4o).
```

**Model auto-switch:** When switching providers, the model automatically changes to that provider's default. User can then `/model` to pick a different one from that provider's list.

### 6. Model Awareness (`src/utils/model/` — modify)

- `providers.ts`: Add `'openai' | 'huggingface'` to `APIProvider` type
- `model.ts`: `getDefaultModel()` returns provider-appropriate default
- Model validation: Skip Anthropic-specific validation for non-Anthropic providers
- Model rendering: Show provider prefix in status bar (e.g., `openai/gpt-4o`)

### 7. Capability-Gated UI

Features that check capabilities before showing UI:

- Thinking toggle: Only show when `capabilities.thinking === true`
- Tool calling: Disable tool execution when `capabilities.toolCalling === false` (text-only mode)
- Vision/images: Disable image paste when `capabilities.vision === false`
- Token display: Adapt token counting to provider's usage format

## Provider Capability Matrix

| Capability | Anthropic | OpenAI | HuggingFace |
|-----------|-----------|--------|-------------|
| Streaming | Yes | Yes | Most models |
| Tool calling | Yes | Yes (GPT-4+) | Some models |
| Vision | Yes | Yes (GPT-4o+) | Some models |
| Thinking | Yes | No (o1/o3 have reasoning but different format) | No |
| Prompt caching | Yes | No | No |
| Structured output | Yes | Yes | No |
| Max output tokens | 128K | 16K (model-dependent) | Model-dependent |

## Configuration Storage

In `~/.claude/settings.json`:
```json
{
  "activeProvider": "openai",
  "providerKeys": {
    "openai": "sk-...",
    "huggingface": "hf_..."
  },
  "providerModels": {
    "openai": "gpt-4o",
    "huggingface": "meta-llama/Llama-3-70B-Instruct"
  },
  "providerBaseUrls": {
    "openai": "https://api.openai.com/v1"
  }
}
```

Environment variables override stored config:
- `OPENAI_API_KEY` overrides `providerKeys.openai`
- `HF_TOKEN` overrides `providerKeys.huggingface`
- `OPENAI_BASE_URL` overrides `providerBaseUrls.openai`
- `OPENAI_MODEL` overrides `providerModels.openai`
- `CLAUDE_CODE_USE_OPENAI=1` forces OpenAI provider regardless of stored setting

## Implementation Order

1. Provider registry + settings storage
2. OpenAI shim (message translation, streaming, tool calling)
3. Client integration (routing)
4. `/provider` command (interactive picker)
5. Model awareness (provider-specific model lists)
6. HuggingFace shim (builds on OpenAI shim)
7. Capability-gated UI

## Success Criteria

- `./cli` with OpenAI provider can: start conversation, execute tools (Bash, Read, Edit, Write, Grep, Glob), run multi-step agentic tasks, paste images (GPT-4o+)
- `./cli` with HuggingFace provider can: start conversation, execute tools (on capable models)
- `/provider` switches between providers interactively
- API keys persist across sessions
- Features gracefully degrade based on provider capabilities
- Existing Anthropic functionality is unaffected
