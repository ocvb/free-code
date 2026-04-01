# Claude API — TypeScript Batch Processing

## Create a Batch

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const batch = await client.messages.batches.create({
  requests: [
    {
      custom_id: 'request-1',
      params: {
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Translate to Spanish: Hello world' }],
      },
    },
    {
      custom_id: 'request-2',
      params: {
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Translate to French: Hello world' }],
      },
    },
  ],
});

console.log(`Batch ID: ${batch.id}`);
```

## Poll for Results

```typescript
let currentBatch = batch;

while (currentBatch.processing_status !== 'ended') {
  await new Promise(resolve => setTimeout(resolve, 10_000));
  currentBatch = await client.messages.batches.retrieve(batch.id);
  console.log(`Processing: ${currentBatch.request_counts.processing} remaining`);
}

// Retrieve results
for await (const result of await client.messages.batches.results(batch.id)) {
  if (result.result.type === 'succeeded') {
    const text = result.result.message.content[0];
    if (text.type === 'text') {
      console.log(`${result.custom_id}: ${text.text}`);
    }
  }
}
```
