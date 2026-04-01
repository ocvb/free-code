# Claude API — Go

## Installation

```bash
go get github.com/anthropics/anthropic-sdk-go
```

## Basic Usage

```go
package main

import (
    "context"
    "fmt"
    "github.com/anthropics/anthropic-sdk-go"
    "github.com/anthropics/anthropic-sdk-go/option"
)

func main() {
    client := anthropic.NewClient(
        option.WithAPIKey("sk-ant-..."), // or use ANTHROPIC_API_KEY env var
    )

    msg, err := client.Messages.New(context.Background(), anthropic.MessageNewParams{
        Model:     anthropic.F(anthropic.ModelClaude_Sonnet_4_6_20250514),
        MaxTokens: anthropic.Int(1024),
        Messages: anthropic.F([]anthropic.MessageParam{
            anthropic.UserMessageParam(anthropic.NewTextBlock("Hello, Claude!")),
        }),
    })
    if err != nil {
        panic(err)
    }

    fmt.Println(msg.Content[0].(anthropic.TextBlock).Text)
}
```

## Streaming

```go
stream := client.Messages.NewStreaming(context.Background(), anthropic.MessageNewParams{
    Model:     anthropic.F(anthropic.ModelClaude_Sonnet_4_6_20250514),
    MaxTokens: anthropic.Int(1024),
    Messages: anthropic.F([]anthropic.MessageParam{
        anthropic.UserMessageParam(anthropic.NewTextBlock("Write a poem.")),
    }),
})

for stream.Next() {
    event := stream.Current()
    switch delta := event.Delta.(type) {
    case anthropic.TextDelta:
        fmt.Print(delta.Text)
    }
}

if err := stream.Err(); err != nil {
    panic(err)
}
```

## Error Handling

```go
msg, err := client.Messages.New(ctx, params)
if err != nil {
    var apiErr *anthropic.Error
    if errors.As(err, &apiErr) {
        fmt.Printf("API error %d: %s\n", apiErr.StatusCode, apiErr.Message)
    }
    return err
}
```
