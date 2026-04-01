# Claude API — Prompt Caching

## Overview

Prompt caching lets you cache large, reused portions of your prompt (e.g. system prompts, documents, few-shot examples) to reduce latency and cost.

- Cache hits save ~90% on input token costs for the cached portion
- Cache entries last at least 5 minutes (ephemeral) and are refreshed on each use
- Minimum cacheable size: 1024 tokens (Haiku) / 2048 tokens (Sonnet/Opus)

## How to Enable

Mark content with `"cache_control": {"type": "ephemeral"}` on the content block you want cached.

### Python

```python
response = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": large_static_document,
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[{"role": "user", "content": question}]
)

# Check cache usage
print(response.usage.cache_creation_input_tokens)  # tokens written to cache
print(response.usage.cache_read_input_tokens)       # tokens read from cache
```

### TypeScript

```typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: largeStaticDocument,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [{ role: 'user', content: question }],
});
```

## Best Practices

1. Place the cache breakpoint after your largest static content
2. Cache system prompts and large documents, not short dynamic content
3. You can have up to 4 cache breakpoints per request
4. The cache is per-model and per-API-key — not shared across accounts
5. Cache hits are not guaranteed but are typical after the first request with the same content
