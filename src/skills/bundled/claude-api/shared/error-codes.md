# Claude API — Error Codes

## HTTP Status Codes

| Code | Name | Description | Retry? |
|------|------|-------------|--------|
| 400 | Bad Request | Invalid request body, missing required field | No |
| 401 | Unauthorized | Invalid or missing API key | No |
| 403 | Forbidden | Permissions error | No |
| 404 | Not Found | Resource not found | No |
| 422 | Unprocessable Entity | Request understood but invalid (e.g. too many tokens) | No |
| 429 | Too Many Requests | Rate limit exceeded | Yes (with backoff) |
| 500 | Internal Server Error | Unexpected server error | Yes (with backoff) |
| 529 | Overloaded | API temporarily overloaded | Yes (with backoff) |

## Retry Strategy

Only retry on 429 and 5xx errors. Use exponential backoff:

- Wait 1s, then 2s, then 4s, then 8s...
- Add jitter to avoid thundering herd
- Respect `retry-after` header when present

## Error Response Format

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded. Please retry after 60 seconds."
  }
}
```

## Common Error Types

- `invalid_request_error` — malformed request (400)
- `authentication_error` — bad API key (401)
- `permission_error` — not allowed (403)
- `not_found_error` — resource missing (404)
- `rate_limit_error` — too many requests (429)
- `api_error` — server-side error (500/529)
- `overloaded_error` — temporary overload (529)
