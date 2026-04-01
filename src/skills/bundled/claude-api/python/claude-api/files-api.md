# Claude API — Python Files API

## Upload a File

```python
import anthropic

client = anthropic.Anthropic()

with open("document.pdf", "rb") as f:
    uploaded_file = client.beta.files.upload(
        file=("document.pdf", f, "application/pdf")
    )

print(f"File ID: {uploaded_file.id}")
```

## Use a File in a Message

```python
message = client.beta.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "file",
                        "file_id": uploaded_file.id
                    }
                },
                {"type": "text", "text": "What is this document about?"}
            ]
        }
    ],
    betas=["files-api-2025-04-14"]
)

print(message.content[0].text)
```

## List and Delete Files

```python
# List uploaded files
files = client.beta.files.list()
for f in files.data:
    print(f"{f.id}: {f.filename} ({f.size} bytes)")

# Delete a file
client.beta.files.delete(uploaded_file.id)
```
