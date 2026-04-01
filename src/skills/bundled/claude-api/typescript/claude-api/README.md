# Claude API — TypeScript / Node.js

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Basic Usage

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

const message = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello, Claude!' }
  ],
});

console.log(message.content[0].type === 'text' ? message.content[0].text : '');
```

## System Prompt

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  system: 'You are a helpful TypeScript expert.',
  messages: [
    { role: 'user', content: 'What are generics?' }
  ],
});
```

## Multi-Turn Conversation

```typescript
const messages: Anthropic.MessageParam[] = [];

messages.push({ role: 'user', content: 'What is a Promise?' });
const response1 = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages,
});

const assistantText = response1.content[0].type === 'text' ? response1.content[0].text : '';
messages.push({ role: 'assistant', content: assistantText });
messages.push({ role: 'user', content: 'Show me an example.' });

const response2 = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages,
});
```

## Prompt Caching

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: largeDocument,
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: 'Summarize.' }],
});
```
