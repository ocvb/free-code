# Claude API — TypeScript Files API

## Upload a File

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const client = new Anthropic();

const fileData = readFileSync('document.pdf');
const blob = new Blob([fileData], { type: 'application/pdf' });

const uploadedFile = await client.beta.files.upload({
  file: new File([blob], 'document.pdf', { type: 'application/pdf' }),
});

console.log(`File ID: ${uploadedFile.id}`);
```

## Use a File in a Message

```typescript
const message = await client.beta.messages.create({
  model: 'claude-sonnet-4-6-20250514',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'file',
            file_id: uploadedFile.id,
          },
        },
        { type: 'text', text: 'What is this document about?' },
      ],
    },
  ],
  betas: ['files-api-2025-04-14'],
});

console.log(message.content[0].type === 'text' ? message.content[0].text : '');
```

## List and Delete Files

```typescript
const files = await client.beta.files.list();
for (const file of files.data) {
  console.log(`${file.id}: ${file.filename}`);
}

await client.beta.files.delete(uploadedFile.id);
```
