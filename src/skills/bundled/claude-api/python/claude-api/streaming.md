# Claude API — Python Streaming

## Basic Streaming

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a short story."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Collecting the Full Response

```python
with client.messages.stream(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain async/await."}]
) as stream:
    full_text = stream.get_final_text()

print(full_text)
```

## Async Streaming

```python
import asyncio
import anthropic

async def main():
    client = anthropic.AsyncAnthropic()

    async with client.messages.stream(
        model="claude-sonnet-4-6-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Count to 10."}]
    ) as stream:
        async for text in stream.text_stream:
            print(text, end="", flush=True)

asyncio.run(main())
```

## Raw Event Stream

```python
with client.messages.stream(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
) as stream:
    for event in stream:
        print(event.type)
```
