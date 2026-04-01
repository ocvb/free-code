# Claude Agent SDK — TypeScript

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## Basic Agent

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  model: 'claude-sonnet-4-6-20250514',
  systemPrompt: 'You are a helpful assistant with tool access.',
});

const result = await agent.run('List files in the current directory');
console.log(result);
```

## With Custom Tools

```typescript
import { Agent, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const readFileTool = tool({
  name: 'read_file',
  description: 'Read a file from disk',
  parameters: z.object({ path: z.string() }),
  execute: async ({ path }) => {
    const { readFileSync } = await import('fs');
    return readFileSync(path, 'utf-8');
  },
});

const agent = new Agent({
  model: 'claude-sonnet-4-6-20250514',
  tools: [readFileTool],
});

const result = await agent.run('Read and summarize package.json');
console.log(result);
```

See `patterns.md` for advanced patterns.
