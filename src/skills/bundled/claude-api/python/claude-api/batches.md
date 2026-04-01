# Claude API — Python Batch Processing

## Create a Batch

```python
import anthropic

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-sonnet-4-6-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Summarize: The quick brown fox..."}]
            }
        },
        {
            "custom_id": "request-2",
            "params": {
                "model": "claude-sonnet-4-6-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Translate to French: Hello world"}]
            }
        }
    ]
)

print(f"Batch ID: {batch.id}")
print(f"Status: {batch.processing_status}")
```

## Poll for Results

```python
import time

while True:
    batch = client.messages.batches.retrieve(batch.id)
    if batch.processing_status == "ended":
        break
    print(f"Processing... ({batch.request_counts.processing} remaining)")
    time.sleep(10)

# Retrieve results
for result in client.messages.batches.results(batch.id):
    print(f"{result.custom_id}: {result.result.message.content[0].text}")
```
