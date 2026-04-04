<!-- ---
attribution: collab claude opus 4
attestation: https://attest.97115104.com/s/y52ru5lq
--- -->

```
        _   _            _
   __ _| |_| |_ ___  ___| |_
  / _` |  _|  _/ -_)(_-<  _|
  \__,_|\__|\__\___|/__/\__|
```

[![attested: collab claude opus 4](https://img.shields.io/badge/attested-collab%20claude%20opus%204-blue)](https://attest.97115104.com/s/y52ru5lq)

Free, open protocol for transparent AI content attribution. One HTTP call. No API keys, no auth tokens, no cost.

**Website:** [attest.97115104.com](https://attest.97115104.com)

## What is attest?

attest creates cryptographically signed records of who made something, what model was used, and how much was human vs. machine. You attach the record to your work and anyone can verify it later.

Three authorship types:

| Type | Meaning |  
|------|---------|  
| **human** | a person wrote this, no AI involved |  
| **collab** | human + AI worked on it together |  
| **ai** | fully AI generated |

## Quick start

### For agents

One GET request. The response includes a signed attestation and both a long verify URL and an auto-generated short link.

```bash
curl "https://attest.97115104.com/api/create?content_name=README.md&model=claude-opus-4&role=collaborated&author=my-agent"
```

The short URL is created automatically on every call, no extra step needed.

### For humans

Go to [attest.97115104.com/humans](https://attest.97115104.com/humans/) to create attestations through the web UI.

If your AI agent doesn't have internet access, the humans page has a "copy prompt to clipboard" button that gives your agent everything it needs to walk you through creating an attestation together.

## API

### `GET /api/create`

Creates an attestation. Returns the signed attestation, a verify URL, and an auto-generated short URL.

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content_name` | **yes** | | Title or filename |
| `model` | no | `gpt-4` | AI model used |
| `role` | no | `collaborated` | `authored` · `collaborated` · `generated` |
| `author` | no | `Anonymous` | Author or agent name |
| `content` | no | | Raw content for SHA-256 hash |
| `authorship_type` | no | auto | `human` · `collab` · `ai` (overrides role) |

### `POST /api/create-upload`

Upload a file to hash and attest. Content-Type: `multipart/form-data`.

```bash
curl -F "file=@myfile.md" -F "role=collaborated" -F "model=claude-opus-4" \
  https://attest.97115104.com/api/create-upload
```

### `POST /api/create-url`

Fetch a URL, hash its content, create attestation. Content-Type: `application/json`.

```bash
curl -X POST https://attest.97115104.com/api/create-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","role":"collaborated","model":"claude-opus-4"}'
```

### `POST /api/shorten`

Shorten an existing verify URL. Takes `{"data":"base64..."}`.

### `GET /api/metrics`

Live platform metrics: total attestations, verifications, agent visits, breakdowns by type and agent.

### `GET /.well-known/attest.json`

Machine-readable API spec for agent discovery.

## Response format

Every create endpoint returns the same structure:

```json
{
  "success": true,
  "attestation": {
    "version": "2.0",
    "id": "2026-04-03-a1b2c3",
    "content_name": "README.md",
    "model": "claude-opus-4",
    "role": "collaborated",
    "authorship_type": "collab",
    "timestamp": "2026-04-03T12:00:00.000Z",
    "platform": "attest.97115104.com",
    "author": "my-agent",
    "signature": { "type": "hmac-sha256", "..." : "..." }
  },
  "urls": {
    "verify": "https://attest.97115104.com/verify/?data=eyJ2ZXJz...",
    "short": "https://attest.97115104.com/s/abc12345"
  }
}
```

The `urls.short` field is always present. Short URLs are generated automatically.

## Where to store attestations

| Method | Example |
|--------|---------|
| HTML meta tag | `<meta name="attestation-verify" content="https://attest.97115104.com/s/ID">` |
| Markdown frontmatter | `attestation: https://attest.97115104.com/s/ID` |
| JSON sidecar | `/attestations/filename.json` |
| Commit message | append the short URL |
| Shields.io badge | see below |

## Add a badge to your repo

```markdown
[![attested: collab claude opus 4](https://img.shields.io/badge/attested-collab%20claude%20opus%204-blue)](https://attest.97115104.com/s/YOUR_SHORT_ID)
```

| Authorship | Badge |
|------------|-------|
| Human | `![attested: human](https://img.shields.io/badge/attested-human-green)` |
| Collab | `![attested: collab model](https://img.shields.io/badge/attested-collab%20model-blue)` |
| AI | `![attested: ai model](https://img.shields.io/badge/attested-ai%20model-orange)` |

## Agent integration

Agents can discover the API at `/.well-known/attest.json` or read `/llms.txt` for integration instructions.

The [agents page](https://attest.97115104.com/agents/) has full endpoint documentation and examples.

## Features

- WebGL noise field background (adapts to light/dark mode)
- Live dashboard with donut charts for authorship type + agent activity
- First-visit welcome modal for human visitors
- Offline prompt for agents without internet access
- Supports `prefers-color-scheme` for automatic light/dark mode
- HMAC-SHA256 signed attestations
- SQLite storage with agent visit tracking

## Self-hosting

```bash
git clone https://github.com/97115104/attest.git
cd attest
npm install
npm start
```

Requires Node.js. SQLite database created automatically in `data/`.

Set `HOST` to your domain (default: `attest.97115104.com`).

## License

MIT
