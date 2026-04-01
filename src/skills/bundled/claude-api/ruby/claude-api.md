# Claude API — Ruby

## Installation

```bash
gem install anthropic
```

Or in your `Gemfile`:

```ruby
gem "anthropic"
```

## Basic Usage

```ruby
require "anthropic"

client = Anthropic::Client.new(api_key: ENV["ANTHROPIC_API_KEY"])

message = client.messages.create(
  model: "claude-sonnet-4-6-20250514",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Hello, Claude!" }
  ]
)

puts message.content.first.text
```

## Streaming

```ruby
client.messages.stream(
  model: "claude-sonnet-4-6-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a poem." }]
) do |event|
  print event.text if event.respond_to?(:text)
end
```

## System Prompt

```ruby
message = client.messages.create(
  model: "claude-sonnet-4-6-20250514",
  max_tokens: 1024,
  system: "You are a helpful assistant.",
  messages: [{ role: "user", content: "What is Ruby?" }]
)
```

## Error Handling

```ruby
begin
  message = client.messages.create(params)
rescue Anthropic::RateLimitError => e
  puts "Rate limited: #{e.message}"
  sleep 60
  retry
rescue Anthropic::APIError => e
  puts "API error #{e.status}: #{e.message}"
  raise
end
```
