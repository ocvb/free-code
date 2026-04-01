# Claude API — TypeScript Tool Use

## Define and Call Tools

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City and state, e.g. San Francisco, CA'
        }
      },
      required: ['location']
    }
  }
];

function getWeather(location: string): string {
  return JSON.stringify({ temperature: 22, condition: 'sunny', location });
}

const messages: Anthropic.MessageParam[] = [
  { role: 'user', content: "What's the weather in Tokyo?" }
];

// Agentic loop
while (true) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 1024,
    tools,
    messages,
  });

  messages.push({ role: 'assistant', content: response.content });

  if (response.stop_reason === 'end_turn') break;

  if (response.stop_reason === 'tool_use') {
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const input = block.input as { location: string };
        const result = getWeather(input.location);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  } else {
    break;
  }
}

// Print the final answer
const lastAssistant = messages.findLast(m => m.role === 'assistant');
if (Array.isArray(lastAssistant?.content)) {
  for (const block of lastAssistant.content) {
    if (block.type === 'text') console.log(block.text);
  }
}
```
