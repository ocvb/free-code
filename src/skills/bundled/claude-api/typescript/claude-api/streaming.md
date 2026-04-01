# Claude API — TypeScript Streaming

## Basic Streaming

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a short story.' }],
});

for await (const chunk of stream) {
  if (
    chunk.type === 'content_block_delta' &&
    chunk.delta.type === 'text_delta'
  ) {
    process.stdout.write(chunk.delta.text);
  }
}
```

## Using the Helper Stream

```typescript
const stream = client.messages.stream({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Explain closures.' }],
});

stream.on('text', (text) => {
  process.stdout.write(text);
});

const finalMessage = await stream.finalMessage();
console.log('\nTotal tokens:', finalMessage.usage.input_tokens + finalMessage.usage.output_tokens);
```

## Async Generator

```typescript
async function* streamText(prompt: string) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}

for await (const text of streamText('Count to 5')) {
  process.stdout.write(text);
}
```
