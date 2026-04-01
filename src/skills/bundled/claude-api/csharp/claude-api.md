# Claude API — C# / .NET

## Installation

Install the official Anthropic C# SDK via NuGet:

```bash
dotnet add package Anthropic.SDK
```

Or in your `.csproj`:

```xml
<PackageReference Include="Anthropic.SDK" Version="*" />
```

Set your API key as an environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Basic Usage

```csharp
using Anthropic.SDK;
using Anthropic.SDK.Messaging;

var client = new AnthropicClient();

var response = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = new List<Message>
        {
            new Message(RoleType.User, "Hello, Claude!")
        }
    });

Console.WriteLine(response.Content[0].ToString());
```

### Using the raw API key directly

```csharp
var client = new AnthropicClient("sk-ant-...");
```

---

## System Prompts

```csharp
var response = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        System = new List<SystemMessage>
        {
            new SystemMessage("You are a helpful assistant specialized in C# and .NET development.")
        },
        Messages = new List<Message>
        {
            new Message(RoleType.User, "What is dependency injection?")
        }
    });
```

---

## Multi-Turn Conversations

Maintain conversation history manually by appending messages:

```csharp
var messages = new List<Message>();

// First turn
messages.Add(new Message(RoleType.User, "What is LINQ?"));
var response1 = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = messages
    });

var assistantText = response1.Content[0].ToString();
messages.Add(new Message(RoleType.Assistant, assistantText));

// Second turn
messages.Add(new Message(RoleType.User, "Can you show me an example?"));
var response2 = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = messages
    });

Console.WriteLine(response2.Content[0].ToString());
```

---

## Streaming

Stream responses token-by-token for real-time display:

```csharp
using Anthropic.SDK.Messaging;

await foreach (var chunk in client.Messages.StreamClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = new List<Message>
        {
            new Message(RoleType.User, "Write a short story about a robot.")
        }
    }))
{
    if (chunk.Delta?.Text is { } text)
    {
        Console.Write(text);
    }
}
Console.WriteLine();
```

### Collecting the full streamed response

```csharp
var sb = new System.Text.StringBuilder();

await foreach (var chunk in client.Messages.StreamClaudeMessageAsync(parameters))
{
    if (chunk.Delta?.Text is { } text)
    {
        sb.Append(text);
        Console.Write(text); // live display
    }
}

string fullText = sb.ToString();
```

---

## Tool Use (Function Calling)

Define tools using JSON schema and handle tool calls in a loop:

```csharp
using Anthropic.SDK.Common;

// Define a tool
var tools = new List<Tool>
{
    new Tool
    {
        Name = "get_weather",
        Description = "Get the current weather for a location",
        InputSchema = new InputSchema
        {
            Type = "object",
            Properties = new Dictionary<string, Property>
            {
                ["location"] = new Property
                {
                    Type = "string",
                    Description = "City and state, e.g. 'San Francisco, CA'"
                },
                ["unit"] = new Property
                {
                    Type = "string",
                    Enum = new List<string> { "celsius", "fahrenheit" },
                    Description = "Temperature unit"
                }
            },
            Required = new List<string> { "location" }
        }
    }
};

var messages = new List<Message>
{
    new Message(RoleType.User, "What's the weather like in London?")
};

// Agentic loop
while (true)
{
    var response = await client.Messages.GetClaudeMessageAsync(
        new MessageParameters
        {
            Model = AnthropicModels.Claude35Sonnet,
            MaxTokens = 1024,
            Tools = tools,
            Messages = messages
        });

    // Append assistant response
    messages.Add(new Message(RoleType.Assistant, response.Content));

    if (response.StopReason == StopReason.EndTurn)
        break;

    if (response.StopReason == StopReason.ToolUse)
    {
        var toolResults = new List<ContentBase>();

        foreach (var block in response.Content)
        {
            if (block is ToolUseContent toolUse)
            {
                // Execute the tool
                string result = toolUse.Name switch
                {
                    "get_weather" => $"{{\"temperature\": 15, \"condition\": \"cloudy\", \"unit\": \"celsius\"}}",
                    _ => "{\"error\": \"Unknown tool\"}"
                };

                toolResults.Add(new ToolResultContent
                {
                    ToolUseId = toolUse.Id,
                    Content = result
                });
            }
        }

        messages.Add(new Message(RoleType.User, toolResults));
    }
    else
    {
        break;
    }
}

// Print final response
foreach (var block in messages.Last().Content)
{
    if (block is TextContent text)
        Console.WriteLine(text.Text);
}
```

---

## Vision (Image Input)

Send images alongside text:

```csharp
// From URL
var response = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = new List<Message>
        {
            new Message(RoleType.User, new List<ContentBase>
            {
                new ImageContent
                {
                    Source = new ImageSource
                    {
                        Type = ImageSourceType.Url,
                        Url = "https://example.com/chart.png"
                    }
                },
                new TextContent { Text = "Describe this chart." }
            })
        }
    });

// From base64
byte[] imageBytes = File.ReadAllBytes("screenshot.png");
string base64 = Convert.ToBase64String(imageBytes);

var response2 = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = new List<Message>
        {
            new Message(RoleType.User, new List<ContentBase>
            {
                new ImageContent
                {
                    Source = new ImageSource
                    {
                        Type = ImageSourceType.Base64,
                        MediaType = "image/png",
                        Data = base64
                    }
                },
                new TextContent { Text = "What does this show?" }
            })
        }
    });
```

---

## Error Handling

```csharp
using Anthropic.SDK.Exceptions;

try
{
    var response = await client.Messages.GetClaudeMessageAsync(parameters);
    Console.WriteLine(response.Content[0].ToString());
}
catch (AnthropicException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
{
    // Rate limit — implement exponential backoff
    Console.Error.WriteLine($"Rate limited: {ex.Message}");
    await Task.Delay(TimeSpan.FromSeconds(60));
}
catch (AnthropicException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
{
    Console.Error.WriteLine("Invalid API key.");
    throw;
}
catch (AnthropicException ex) when ((int)ex.StatusCode >= 500)
{
    // Transient server error — safe to retry with backoff
    Console.Error.WriteLine($"Server error ({ex.StatusCode}): {ex.Message}");
    throw;
}
catch (AnthropicException ex)
{
    // 4xx client errors (400 bad request, 404 not found, etc.) — do not retry
    Console.Error.WriteLine($"Client error ({ex.StatusCode}): {ex.Message}");
    throw;
}
```

### Retry helper using Polly

```csharp
using Polly;
using Polly.Retry;

var retryPolicy = Policy
    .Handle<AnthropicException>(ex =>
        ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
        (int)ex.StatusCode >= 500)
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
        onRetry: (ex, delay, attempt, _) =>
            Console.Error.WriteLine($"Retry {attempt} after {delay}: {ex.Message}"));

var response = await retryPolicy.ExecuteAsync(() =>
    client.Messages.GetClaudeMessageAsync(parameters));
```

---

## Dependency Injection (ASP.NET Core)

Register the client in `Program.cs`:

```csharp
using Anthropic.SDK;

var builder = WebApplication.CreateBuilder(args);

// Register as singleton — the client is thread-safe
builder.Services.AddSingleton<AnthropicClient>(_ =>
    new AnthropicClient(builder.Configuration["Anthropic:ApiKey"]
        ?? throw new InvalidOperationException("Anthropic API key not configured")));

var app = builder.Build();
```

In `appsettings.json`:

```json
{
  "Anthropic": {
    "ApiKey": "sk-ant-..."
  }
}
```

Using the client in a controller or service:

```csharp
public class ChatService
{
    private readonly AnthropicClient _client;

    public ChatService(AnthropicClient client)
    {
        _client = client;
    }

    public async Task<string> GetResponseAsync(string userMessage)
    {
        var response = await _client.Messages.GetClaudeMessageAsync(
            new MessageParameters
            {
                Model = AnthropicModels.Claude35Sonnet,
                MaxTokens = 1024,
                Messages = new List<Message>
                {
                    new Message(RoleType.User, userMessage)
                }
            });
        return response.Content[0].ToString() ?? string.Empty;
    }
}
```

---

## Models

Use the constants from `AnthropicModels` or pass model IDs directly:

| Constant | Model ID |
|---|---|
| `AnthropicModels.Claude35Sonnet` | `claude-sonnet-4-6-20250514` |
| `AnthropicModels.Claude3Opus` | `claude-opus-4-6` |
| `AnthropicModels.Claude3Haiku` | `claude-haiku-4-5` |

You can also pass a string directly:

```csharp
Model = "claude-sonnet-4-6-20250514"
```

---

## Token Counting

```csharp
var countResult = await client.Messages.CountTokensAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        Messages = new List<Message>
        {
            new Message(RoleType.User, "How many tokens is this?")
        }
    });

Console.WriteLine($"Input tokens: {countResult.InputTokens}");
```

---

## Prompt Caching

Mark large, reused content blocks with `CacheControl` to reduce latency and cost:

```csharp
var systemMessages = new List<SystemMessage>
{
    new SystemMessage(new List<ContentBase>
    {
        new TextContent
        {
            Text = longDocumentContent, // large static content
            CacheControl = new CacheControl { Type = CacheControlType.Ephemeral }
        }
    })
};

var response = await client.Messages.GetClaudeMessageAsync(
    new MessageParameters
    {
        Model = AnthropicModels.Claude35Sonnet,
        MaxTokens = 1024,
        System = systemMessages,
        Messages = new List<Message>
        {
            new Message(RoleType.User, "Summarize the document.")
        }
    });
```

The response usage will show `cache_creation_input_tokens` on the first call and `cache_read_input_tokens` on subsequent calls with the same content.
