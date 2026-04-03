# attest

Open-source protocol for transparent AI content attribution.

Declare whether content was written by a human, co-authored with AI, or fully AI-generated — in one line.

## Quick start

```bash
./run-service.sh
# → http://localhost:3000
```

## One-line attestation

Add to any markdown frontmatter:

```yaml
attribution: collab claude opus 4
```

Values: `human` · `collab <model>` · `ai <model>`

## API

```bash
# Create an attestation
curl "http://localhost:3000/api/create?content_name=My+Post&model=claude-opus-4&role=collaborated"

# Shorten a verify URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"data":"eyJ2ZXJzaW9uIjoiMi4wIi..."}'
```

## Project structure

```
attest/
├── server.js          # Node.js HTTP server (API + static)
├── db.js              # SQLite database (short URLs)
├── index.html         # Homepage
├── style.css          # Win95 design system
├── verify/index.html  # Verification page
├── developers/        # Developer documentation
├── run-service.sh     # Start script
└── data/              # SQLite DB (auto-created, gitignored)
```

## License

MIT
