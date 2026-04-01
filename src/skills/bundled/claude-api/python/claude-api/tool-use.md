# Claude API — Python Tool Use

## Basic Tool Definition

```python
import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state, e.g. 'San Francisco, CA'"
                }
            },
            "required": ["location"]
        }
    }
]

def get_weather(location: str) -> str:
    return json.dumps({"temperature": 22, "condition": "sunny"})

messages = [{"role": "user", "content": "What's the weather in Paris?"}]

# Agentic loop
while True:
    response = client.messages.create(
        model="claude-sonnet-4-6-20250514",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )

    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "end_turn":
        break

    if response.stop_reason == "tool_use":
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = get_weather(**block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })
        messages.append({"role": "user", "content": tool_results})
    else:
        break

# Extract final text
for block in response.content:
    if hasattr(block, "text"):
        print(block.text)
```
