---
attribution: collab claude opus 4
attestation: https://attest.97115104.com/s/vwznd9t4
---

# attest

Free, open-source protocol for transparent AI content attribution.

Declare whether content was written by a human, co-authored with AI, or fully AI-generated — with a single HTTP call. No API keys. No auth tokens. No cost.

**Website:** [attest.97115104.com](https://attest.97115104.com)

## How it works

1. **Create** an attestation when you publish content — via the [web UI](https://attest.97115104.com/create/) or the API.
2. **Store** the returned verify URL or attestation data alongside your content.
3. **Verify** any attestation by visiting its verify link — anyone can check it.

## One-line attestation

Add a single line to any markdown frontmatter:

```yaml
attribution: collab claude opus 4
```

Values: `human` · `collab <model>` · `ai <model>`

## Create via the web

Go to [attest.97115104.com/create](https://attest.97115104.com/create/) — upload a file, pick the authorship type, and get a signed attestation with a shareable verify link.

## Create via the API

A single GET request is all you need:

```bash
curl "https://attest.97115104.com/api/create?content_name=My+Post&model=claude-opus-4&role=collaborated&author=your-name"
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `content_name` | yes | Title or filename of the content |
| `model` | no | AI model used (e.g. `claude-opus-4`, `gpt-4`) |
| `role` | no | `authored` · `collaborated` · `generated` |
| `author` | no | Author or agent name |
| `content` | no | Raw content string — used to generate a SHA-256 hash |

### Roles

- **`authored`** — entirely human-written
- **`collaborated`** — human directed the work, AI assisted
- **`generated`** — fully AI-generated

### File upload

You can also upload a file directly to hash its content:

```bash
curl -F "file=@myfile.md" -F "role=collaborated" -F "model=claude-opus-4" \
  https://attest.97115104.com/api/create-upload
```

### Shorten a verify URL

```bash
curl -X POST https://attest.97115104.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"data":"eyJ2ZXJzaW9uIjoiMi4wIi..."}'
```

## Where to store attestations

- **HTML meta tag:** `<meta name="attestation" content="{base64 attestation JSON}">`
- **Markdown frontmatter:** `attestation: https://attest.97115104.com/s/abc12345`
- **JSON sidecar file:** `/attestations/filename.json`
- **Commit message / PR:** append the verify URL

## AI agent integration

If you're building an AI agent or tool, see [`/llms.txt`](https://attest.97115104.com/llms.txt) for structured integration instructions, or visit the [developer docs](https://attest.97115104.com/developers/).

## Self-hosting

Clone the repo and install dependencies:

```bash
git clone https://github.com/97115104/attest.git
cd attest
npm install
npm start
```

Requires Node.js. The SQLite database is created automatically in `data/`.

## License

MIT
