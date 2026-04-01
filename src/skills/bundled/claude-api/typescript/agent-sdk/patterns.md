# Claude Agent SDK — TypeScript Patterns

## Streaming Output

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({ model: 'claude-sonnet-4-6-20250514' });

for await (const chunk of agent.runStream('Explain TypeScript generics')) {
  process.stdout.write(chunk);
}
```

## Subagents

```typescript
const researcher = new Agent({
  model: 'claude-sonnet-4-6-20250514',
  systemPrompt: 'You are a research specialist.',
});

const writer = new Agent({
  model: 'claude-sonnet-4-6-20250514',
  systemPrompt: 'You are a technical writer.',
});

async function researchAndWrite(topic: string): Promise<string> {
  const research = await researcher.run(`Research: ${topic}`);
  return writer.run(`Write an article based on: ${research}`);
}
```

## Session Persistence

```typescript
const agent = new Agent({
  model: 'claude-sonnet-4-6-20250514',
  maxContextTokens: 50_000,
});

await agent.run('My name is Bob.');
const response = await agent.run('What is my name?');
console.log(response); // "Your name is Bob."
```

## Error Handling

```typescript
import { AgentError, ContextLimitError } from '@anthropic-ai/claude-agent-sdk';

try {
  const result = await agent.run(complexTask);
} catch (error) {
  if (error instanceof ContextLimitError) {
    await agent.compact();
    const result = await agent.run(complexTask);
  } else if (error instanceof AgentError) {
    console.error(`Agent error: ${error.message}`);
  }
}
```
