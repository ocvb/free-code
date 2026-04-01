# Claude API — Tool Use Concepts

## Overview

Tool use (also called function calling) lets Claude call external functions, APIs, or services during a response. Claude decides when to call a tool based on the conversation context.

## How It Works

1. You define tools with names, descriptions, and JSON-schema parameter definitions
2. Claude receives the tools list alongside the conversation
3. When Claude wants to call a tool, it returns `stop_reason: "tool_use"` with one or more `tool_use` content blocks
4. You execute the tool and return results as `tool_result` blocks
5. Claude continues the response incorporating the tool results
6. Repeat until `stop_reason: "end_turn"`

## Tool Definition Structure

```json
{
  "name": "tool_name",
  "description": "What this tool does — be specific and detailed",
  "input_schema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Description of param1"
      },
      "param2": {
        "type": "integer",
        "description": "Description of param2"
      }
    },
    "required": ["param1"]
  }
}
```

## Forcing Tool Use

```json
"tool_choice": {"type": "tool", "name": "get_weather"}
```

Options:
- `{"type": "auto"}` — Claude decides (default)
- `{"type": "any"}` — Claude must use at least one tool
- `{"type": "tool", "name": "..."}` — Claude must use the specified tool

## Parallel Tool Calls

Claude may call multiple tools in a single response. Handle all `tool_use` blocks before continuing.

## Best Practices

- Write clear, detailed tool descriptions — Claude relies on them to decide when to call
- Return structured data (JSON) from tools when possible
- Include error information in tool results if execution fails
- Keep tools focused on single responsibilities
