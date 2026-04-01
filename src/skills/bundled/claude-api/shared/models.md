# Claude API — Models

## Current Models

| Model | ID | Context | Best For |
|-------|-----|---------|----------|
| Claude Sonnet | {{SONNET_ID}} | 200K | Balanced capability and speed |
| Claude Opus | {{OPUS_ID}} | 200K | Most capable, complex tasks |
| Claude Haiku | {{HAIKU_ID}} | 200K | Fast and lightweight |

## Model ID Conventions

Use the base model ID (e.g., `claude-sonnet-4-6`) to always get the latest version, or include the full date-stamped ID (e.g., `claude-sonnet-4-6-20250514`) to pin to a specific version.

**Do not** append date suffixes manually — use the IDs exactly as shown above.

## Selecting a Model

- Default to `{{SONNET_ID}}` for most tasks
- Use `{{OPUS_ID}}` for complex reasoning, long analysis, or where quality is critical
- Use `{{HAIKU_ID}}` for high-throughput, low-latency, or cost-sensitive use cases

## Context Window

All current models support a 200,000-token context window. The maximum output is 8,192 tokens by default; some models support extended output via a beta header.

## Legacy Models

Older Claude 3 model IDs are still available but not recommended for new projects:
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`
- `claude-3-opus-20240229`
