# Claude API — Python

## Installation

```bash
pip install anthropic
```

## Basic Usage

```python
import anthropic

client = anthropic.Anthropic()  # uses ANTHROPIC_API_KEY env var

message = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

## System Prompt

```python
message = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    system="You are a helpful assistant.",
    messages=[
        {"role": "user", "content": "What is Python?"}
    ]
)
```

## Multi-Turn Conversation

```python
messages = []

# First turn
messages.append({"role": "user", "content": "What is a decorator?"})
response = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=messages
)
messages.append({"role": "assistant", "content": response.content[0].text})

# Second turn
messages.append({"role": "user", "content": "Show me an example."})
response2 = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=messages
)
print(response2.content[0].text)
```

## Prompt Caching

```python
message = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": large_document,
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[{"role": "user", "content": "Summarize this."}]
)
print(f"Cache created: {message.usage.cache_creation_input_tokens}")
print(f"Cache read: {message.usage.cache_read_input_tokens}")
```
