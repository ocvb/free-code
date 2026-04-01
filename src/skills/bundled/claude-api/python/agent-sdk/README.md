# Claude Agent SDK — Python

## Installation

```bash
pip install claude-agent-sdk
```

## Basic Agent

```python
import asyncio
from claude_agent_sdk import Agent

async def main():
    agent = Agent(
        model="claude-sonnet-4-6-20250514",
        system_prompt="You are a helpful assistant with access to tools."
    )
    result = await agent.run("What files are in the current directory?")
    print(result)

asyncio.run(main())
```

## Custom Tools

```python
from claude_agent_sdk import Agent, tool

@tool
def read_file(path: str) -> str:
    """Read a file from disk."""
    with open(path) as f:
        return f.read()

agent = Agent(
    model="claude-sonnet-4-6-20250514",
    tools=[read_file]
)
```

See `patterns.md` for advanced patterns including subagents, memory, and long-running tasks.
