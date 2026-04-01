# Claude API — PHP

## Installation

```bash
composer require anthropic-php/client
```

## Basic Usage

```php
<?php

require_once 'vendor/autoload.php';

use Anthropic\Anthropic;

$client = Anthropic::client(getenv('ANTHROPIC_API_KEY'));

$response = $client->messages()->create([
    'model' => 'claude-sonnet-4-6-20250514',
    'max_tokens' => 1024,
    'messages' => [
        ['role' => 'user', 'content' => 'Hello, Claude!'],
    ],
]);

echo $response->content[0]->text;
```

## Streaming

```php
$stream = $client->messages()->createStreamed([
    'model' => 'claude-sonnet-4-6-20250514',
    'max_tokens' => 1024,
    'messages' => [
        ['role' => 'user', 'content' => 'Write a poem.'],
    ],
]);

foreach ($stream as $response) {
    if ($response->type === 'content_block_delta') {
        echo $response->delta->text ?? '';
    }
}
```

## Error Handling

```php
use Anthropic\Exceptions\ErrorException;

try {
    $response = $client->messages()->create($params);
} catch (ErrorException $e) {
    echo "Error {$e->getCode()}: {$e->getMessage()}\n";
}
```
