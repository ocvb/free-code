# Claude API — Java

## Installation (Maven)

```xml
<dependency>
    <groupId>com.anthropic</groupId>
    <artifactId>anthropic-java</artifactId>
    <version>LATEST</version>
</dependency>
```

## Basic Usage

```java
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.Message;
import com.anthropic.models.MessageCreateParams;
import com.anthropic.models.Model;

AnthropicClient client = AnthropicOkHttpClient.builder()
    .apiKey(System.getenv("ANTHROPIC_API_KEY"))
    .build();

MessageCreateParams params = MessageCreateParams.builder()
    .model(Model.CLAUDE_SONNET_4_6_20250514)
    .maxTokens(1024)
    .addUserMessage("Hello, Claude!")
    .build();

Message message = client.messages().create(params);
System.out.println(message.content().get(0).text().get().text());
```

## Streaming

```java
client.messages().createStreaming(params).subscribe(event -> {
    event.contentBlockDelta().ifPresent(delta ->
        delta.delta().text().ifPresent(text -> System.out.print(text.text())));
});
```

## Error Handling

```java
try {
    Message msg = client.messages().create(params);
} catch (AnthropicException e) {
    System.err.println("API error: " + e.statusCode() + " " + e.getMessage());
}
```
