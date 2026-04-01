# Claude Agent SDK — Python Patterns

## Subagents

```python
from claude_agent_sdk import Agent

researcher = Agent(
    model="claude-sonnet-4-6-20250514",
    system_prompt="You are a research specialist."
)

writer = Agent(
    model="claude-sonnet-4-6-20250514",
    system_prompt="You are a technical writer."
)

async def research_and_write(topic: str) -> str:
    research = await researcher.run(f"Research: {topic}")
    article = await writer.run(f"Write an article based on: {research}")
    return article
```

## Streaming Results

```python
async for chunk in agent.run_stream("Explain recursion"):
    print(chunk, end="", flush=True)
```

## Memory and Context

```python
agent = Agent(
    model="claude-sonnet-4-6-20250514",
    max_context_tokens=50_000
)

# Conversation persists across run() calls
await agent.run("My name is Alice.")
response = await agent.run("What is my name?")
print(response)  # "Your name is Alice."
```

## Error Handling

```python
from claude_agent_sdk.exceptions import AgentError, ContextLimitError

try:
    result = await agent.run(very_long_task)
except ContextLimitError:
    # Compact context and retry
    await agent.compact()
    result = await agent.run(very_long_task)
except AgentError as e:
    print(f"Agent error: {e}")
```
