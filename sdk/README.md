# attest-client

Client SDK for [attest](https://attest.97115104.com), the open protocol for AI content attribution.

Create cryptographically signed records of who made what, enabling you to specify specific models, and how much was human vs. AI through a single API call. No signup is required, open-source for the win, free forever.

Zero dependencies. Works in Node.js 18+. ESM and CJS.

[![npm](https://img.shields.io/npm/v/attest-client)](https://www.npmjs.com/package/attest-client)
[![license](https://img.shields.io/npm/l/attest-client)](https://github.com/97115104/attest/blob/main/sdk/LICENSE)
[![attested](https://img.shields.io/badge/attested-collab-blueviolet)](https://attest.97115104.com/s/17xnitsk)

## Install

```bash
npm install attest-client
```

## Quick start

```js
import { attest } from 'attest-client';

const result = await attest({
  content_name: 'README.md',
  model: 'claude-opus-4',
  role: 'collaborated',
  author: 'your-name',
  platform: 'GitHub Copilot VS Code'
});

console.log(result.urls.short);   // https://attest.97115104.com/s/k7xm9pq2
console.log(result.urls.verify);  // full verify URL
```

The SDK returns exact server-generated URLs. No URL construction, no hallucination risk.

## API

### `attest(options)` — one-shot

Creates a single attestation. Shorthand for creating a client and calling `create()`.

```js
import { attest } from 'attest-client';

const result = await attest({
  content_name: 'my-file.md',       // required — title or filename
  model: 'claude-opus-4',            // AI model used (default: 'gpt-4')
  role: 'collaborated',              // 'authored' | 'collaborated' | 'generated'
  author: 'jane',                    // author name (default: 'Anonymous')
  platform: 'Claude Code',           // tool/interface (e.g. 'GitHub Copilot VS Code', 'ChatGPT')
  content: 'raw text here',          // optional — hashed with SHA-256 for verification
  prompt: 'Write a readme for...',   // optional — the prompt used
  prompt_type: 'single',             // 'single' | 'multi-prompt'
});
```

### `createClient(options)` — reusable client

```js
import { createClient } from 'attest-client';

const client = createClient({
  author: 'my-agent',     // default author for all attestations
  host: 'https://attest.97115104.com'  // optional, this is the default
});

// Create attestation from params
const r1 = await client.create({
  content_name: 'file1.md',
  model: 'claude-opus-4',
  role: 'collaborated',
  platform: 'GitHub Copilot VS Code'
});

// Attest a URL (fetches and hashes the content)
const r2 = await client.createFromUrl({
  url: 'https://example.com/post',
  model: 'gpt-4',
  role: 'generated',
  platform: 'ChatGPT'
});

// Get platform metrics
const metrics = await client.metrics();

// Get API spec
const spec = await client.discover();
```

### Response format

All create methods return:

```json
{
  "success": true,
  "attestation": {
    "version": "3.0",
    "id": "2026-04-10-a1b2c3",
    "content_name": "README.md",
    "model": "claude-opus-4",
    "role": "collaborated",
    "authorship_type": "collab",
    "timestamp": "2026-04-10T12:00:00.000Z",
    "platform": "GitHub Copilot VS Code",
    "author": "jane",
    "signature": {
      "type": "hmac-sha256",
      "algorithm": "HMAC-SHA256",
      "value": "4b2d5967..."
    }
  },
  "urls": {
    "verify": "https://attest.97115104.com/verify/?data=eyJ2ZXJz...",
    "short": "https://attest.97115104.com/s/k7xm9pq2"
  }
}
```

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `content_name` | Yes | Title or filename of the content |
| `model` | No | AI model used (default: `gpt-4`) |
| `role` | No | `authored` \| `collaborated` \| `generated` (default: `collaborated`) |
| `author` | No | Author name (default: `Anonymous`) |
| `content` | No | Raw content — SHA-256 hashed for verification |
| `authorship_type` | No | `human` \| `collab` \| `ai` — auto-derived from role if omitted |
| `platform` | No | Tool/interface the model was used through (e.g. `GitHub Copilot VS Code`, `Claude Code`, `ChatGPT`, `Cursor`). This identifies the environment, not the attest service. |
| `prompt` | No | The prompt used to generate the content |
| `prompt_type` | No | `single` \| `multi-prompt` (default: `single`) |

### Roles

| Role | Type | Meaning |
|---|---|---|
| `authored` | `human` | Entirely human-written |
| `collaborated` | `collab` | Human directed, AI assisted |
| `generated` | `ai` | Fully AI-generated |

## CLI

```bash
# Create attestation
npx attest-client --content README.md --model claude-opus-4 --role collaborated --platform "GitHub Copilot VS Code"

# With all options
npx attest-client --content file.md --model gpt-4 --role generated --author my-bot --platform ChatGPT --prompt "Summarize this" --prompt-type single

# Raw JSON output
npx attest-client --content file.md --json

# Platform metrics
npx attest-client --metrics

# API discovery
npx attest-client --discover
```

## CommonJS

```js
const { attest, createClient } = require('attest-client');

const result = await attest({
  content_name: 'output.md',
  model: 'claude-opus-4',
  role: 'generated',
  platform: 'Claude Code'
});
```

## What is platform?

The `platform` parameter identifies the tool or interface the AI model was accessed through — not the attest service itself. Examples:

- `GitHub Copilot VS Code` — using Copilot inside VS Code
- `Claude Code` — using Claude's CLI agent
- `ChatGPT` — using OpenAI's web interface
- `Cursor` — using Cursor IDE
- `API` — direct API access

This is important for analytics and for creating accurate attestations.

## Links

- [Website](https://attest.97115104.com)
- [Agent spec](https://attest.97115104.com/agents/)
- [API spec](https://attest.97115104.com/.well-known/attest.json)
- [llms.txt](https://attest.97115104.com/llms.txt)
- [GitHub](https://github.com/97115104/attest)

## License

MIT
