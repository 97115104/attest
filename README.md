# <img src="assets/logo/circular-2-ai.svg" alt="attest" width="40" height="40" align="left"> attest - AI Content Attestation Protocol

[![AI Assisted](https://img.shields.io/badge/AI-Assisted-blue)](https://attest.97115104.com/verify/?data=eyJ2ZXJzaW9uIjoiMi4wIiwiaWQiOiIyMDI1LTA3LTE2LTM0ZXpucyIsImNvbnRlbnRfbmFtZSI6ImltcG9ydGVkLWNvbnRlbnQiLCJkb2N1bWVudF90eXBlIjoid2Vic2l0ZSIsIm1vZGVsIjoiY2xhdWRlLTQtb3B1cyIsInJvbGUiOiJhc3Npc3RlZCIsInRpbWVzdGFtcCI6IjIwMjUtMDctMTZUMDI6NTI6MDYuNjU1WiIsInBsYXRmb3JtIjoiYXR0ZXN0LmluayIsImNvbnRlbnRfaGFzaCI6InNoYTI1NjplNWUzMDJmMzczOWViZjU4MTI5YWM5NGJlZGU4OTQ0ZGJhOGVkYWM3N2FlYzBmOGM2ZWQ1ZmY5ZGExOWYwMGJmIiwiYXV0aG9yIjoiMHg0MiBSZXNlYXJjaCIsInNpZ25hdHVyZSI6eyJ0eXBlIjoiZXRoZXJldW0iLCJ2YWx1ZSI6IjB4OTExODcwMGYzZDBiMGQ5M2RiMDQ4YTRkODNlZTk4MTZlZjI0NzEyNWJiN2ExMzNiYzA1MWM2NmIzZGZjNWE4OTRmMWRlYzY1OTMyNWRlNTViMWYxNGIyZmQxYzg1MjlkZjExM2E2OGYyZGE1ZjFiMzUwYjc5YzllMzgyMGQ5NTYxYiIsInNpZ25lciI6IjB4NzlhNzJhMDJiOWIxOTNjNDUyMGYyMmYyY2QyZDYzYTM1NGRmZTRkMyIsIm1lc3NhZ2UiOiJ7XCJjb250ZW50X25hbWVcIjpcImltcG9ydGVkLWNvbnRlbnRcIixcIm1vZGVsXCI6XCJjbGF1ZGUtNC1vcHVzXCIsXCJ0aW1lc3RhbXBcIjpcIjIwMjUtMDctMTZUMDI6NTI6MDYuNjU1WlwiLFwiY29udGVudF9oYXNoXCI6XCJzaGEyNTY6ZTVlMzAyZjM3MzllYmY1ODEyOWFjOTRiZWRlODk0NGRiYThlZGFjNzdhZWMwZjhjNmVkNWZmOWRhMTlmMDBiZlwifSJ9fQ==)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-00E196)](https://attest.97115104.com)
[![GitHub stars](https://img.shields.io/github/stars/97115104/attest.svg?style=social)](https://github.com/97115104/attest)

A decentralized, privacy-preserving protocol for creating verifiable attestations about AI involvement in content creation. It works offline and there's no servers or blockchain implementation required.

## Overview

attest is an open-source protocol that enables transparent disclosure of AI involvement in content creation through:

- **Cryptographic Attestations**: Create tamper-proof records of AI usage
- **Beautiful Badges**: Display verification badges that link to cryptographic proofs
- **Complete Decentralization**: Works offline, no servers or blockchain required
- **Privacy-First**: Keep prompts private while proving AI involvement
- **Universal Compatibility**: Integrate with any platform or content type

## Key Features

### For Content Creators
- **Simple Creation**: Generate attestations in seconds at [attest.97115104.com/create](https://attest.97115104.com/create/)
- **Multiple AI Models**: Support for 100+ models from OpenAI, Anthropic, Google, Meta, and more
- **Flexible Roles**: Document if AI generated, assisted, or edited your content
- **File Support**: Attest any content type - text, code, images, audio, video
- **Digital Signatures**: Optional Ethereum wallet signatures for enhanced verification

### For Developers
- **Static Architecture**: Runs on Vercel, Netlify, or any static host
- **Client-Side Only**: All operations happen in the browser
- **Simple Integration**: One-line badge embedding
- **REST API**: Programmatic attestation creation via curl/HTTP
- **CI/CD Ready**: Easy automation for build pipelines
- **Open Protocol**: MIT licensed, no vendor lock-in

### For Verifiers
- **One-Click Verification**: Click any badge to verify authenticity
- **Content Hash Verification**: Verify content hasn't been modified
- **Signature Validation**: Verify digital signatures when present
- **Offline Verification**: Download and verify attestations locally

## Quick Start

### 1. Create an Attestation

#### Web Interface
Visit [attest.97115104.com/create](https://attest.97115104.com/create/) and fill out the form.

#### API / Automation
```bash
# Create attestation via curl
curl -s "https://attest.97115104.com/api/create.html?content_name=My%20Blog%20Post&model=gpt-4&role=assisted&output=curl"

# With content hash
curl -s "https://attest.97115104.com/api/create.html?content_name=My%20Article&content=$(cat article.txt | jq -sRr @uri)&model=claude-3-opus"

# Create permanent short URL (requires API key)
curl -X POST https://attest.97115104.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"dataUrl": "data:application/json;base64,...", "apiKey": "ak_..."}'
```

### 2. Embed a Badge

#### HTML
```html
<!-- Self-contained badge with full attestation data -->
<a href="https://attest.97115104.com/verify/?data=eyJ2ZXJzaW9uIj..." target="_blank">
    <img src="https://attest.97115104.com/assets/badges/gpt-4-generated.svg" alt="AI Generated with GPT-4" />
</a>
```

#### Markdown
```markdown
[![AI Generated](https://attest.97115104.com/assets/badges/ai-generated.svg)](https://attest.97115104.com/verify/?data=...)
```

#### Dynamic Loading
```html
<div class="ai-attest-badge" data-attestation-url="https://example.com/attestation.json"></div>
<script src="https://attest.97115104.com/static/badge-renderer.js"></script>
```

### 3. Verify Content

Click any attestation badge or visit [attest.97115104.com/verify](https://attest.97115104.com/verify/) to verify:
- Attestation format and schema validity
- Content hash (if original content provided)
- Digital signatures (if present)
- Timestamp and metadata

## Attestation Schema

### Version 2.0 (Current)
```json
{
  "version": "2.0",
  "id": "2025-01-16-abc123",
  "content_name": "My Blog Post About Quantum Computing",
  "content_hash": "sha256:b6a5c8d9e2f4a3b7c1d8e9f0a1b2c3d4...",
  "document_type": "markdown",
  "model": "gpt-4-turbo-2024-04-09",
  "role": "assisted",
  "author": "Dr. Jane Smith",
  "timestamp": "2025-01-16T10:30:00Z",
  "platform": "attest.97115104.com",
  "prompt": "Write an introduction to quantum computing",
  "prompt_hash": "sha256:a1b2c3d4...",
  "signature": {
    "type": "wallet",
    "value": "0x1234567890abcdef...",
    "signer": "0x742d35Cc6634C0532925a3b844Bc9e7595f06fD3",
    "message": "{\"content_hash\":\"sha256:...\",\"model\":\"gpt-4\",\"timestamp\":\"2025-01-16T10:30:00Z\"}"
  }
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Schema version (currently "2.0") |
| `id` | Yes | Unique identifier (format: YYYY-MM-DD-random) |
| `content_name` | Yes | Human-readable name/title of the content |
| `content_hash` | No | SHA-256 hash of the content (optional in v2.0) |
| `document_type` | Yes | Type of content (text, markdown, code, image, etc.) |
| `model` | Yes | AI model identifier |
| `role` | Yes | How AI was used: generated, assisted, or edited |
| `author` | No | Human author/creator name |
| `timestamp` | Yes | ISO 8601 timestamp of attestation creation |
| `platform` | Yes | Platform used to create attestation |
| `prompt` | No | The prompt used (can be kept private) |
| `prompt_hash` | No | SHA-256 hash of prompt if kept private |
| `signature` | No | Digital signature object |

### AI Roles

- **generated**: Content was primarily created by AI
- **assisted**: Human and AI collaborated on the content
- **edited**: AI refined or improved human-created content

## Badge Gallery

### Badge Styles

#### Glass Morphism Badges
Modern badges with blur and transparency effects:
- `badge-glass` - Default glass style
- `badge-glass-primary` - Primary color variant
- `badge-glass-minimal` - Subtle, minimal design

#### Legacy Badges
Classic badge designs:
- `badge-terminal` - Retro terminal style
- `badge-neon` - Animated neon glow
- `badge-rainbow` - Animated rainbow effect
- `badge-matrix` - Digital rain animation
- `badge-holographic` - Shimmer effect

#### SVG Badges
Pre-rendered badges for all major AI models:
```
https://attest.97115104.com/assets/badges/{model}-{role}.svg

Examples:
- gpt-4-generated.svg
- claude-assisted.svg
- midjourney-generated.svg
```

### Supported AI Models

Over 100 AI models across multiple providers:

- **OpenAI**: GPT-5 (Coming Soon), GPT-4, GPT-3.5, DALL-E 3, etc.
- **Anthropic**: Claude 4.1 Opus, Claude 4 Opus, Claude 3.5 Sonnet, Claude 3 Series
- **Google**: Gemini 1.5 Pro, Gemini Ultra, PaLM 2
- **Meta**: Llama 3 70B, Code Llama, Llama 2 Series
- **Stability AI**: SDXL 1.0, Stable Diffusion 2.1
- **Midjourney**: v6, v5.2, v5.1, Niji v6
- **Mistral AI**: Large, Medium, Mixtral 8x22B
- **Cohere**: Command R+, Command R
- **xAI**: Grok 1.5
- **And many more...**

View the complete gallery at [attest.97115104.com/showcase](https://attest.97115104.com/showcase/)

## Technical Architecture

### Project Structure
```
attest/
├── index.html              # Homepage
├── create/                 # Attestation creator
├── verify/                 # Attestation verifier
├── protocol/               # Protocol specification
├── showcase/               # Badge gallery
├── examples/               # Integration examples
├── api/                    # API endpoints
│   └── create.html        # Programmatic creation
├── static/
│   ├── attestation-tool.js # Core attestation logic
│   ├── badge-renderer.js   # Badge rendering engine
│   ├── ai-models.js        # AI model registry
│   ├── style.css          # Main styles
│   └── badge-styles.css   # Badge-specific styles
├── assets/
│   └── badges/            # Pre-rendered SVG badges
└── attestations/          # Stored attestations (optional)
```

### How It Works

1. **Content Hashing**: Uses Web Crypto API to generate SHA-256 hashes
2. **Data Storage**: Attestations encoded as base64 data URLs or JSON files
3. **Verification**: Client-side validation of hashes and signatures
4. **No Backend**: Everything runs in the browser using JavaScript

### Premium Features

### Permanent Short URLs
Create permanent short URLs for your attestations with lifetime access:
- One-time payment of $20 for unlimited URLs
- URLs never expire
- API access for automation
- Automatic receipt emails with API key

### Features Include
- Professional email receipts with invoice
- California sales tax calculation (ZIP code based)
- Secure payment processing via Stripe
- API key for programmatic access

## API Reference

#### Create Attestation
```
GET https://attest.97115104.com/api/create.html

Parameters:
- content_name (required): Name of the content
- content: The actual content (for hash generation)
- model: AI model used (default: gpt-4)
- role: generated|assisted|edited (default: assisted)
- document_type: Type of content (default: text)
- author: Author name
- prompt: The prompt used
- prompt_private: true/false to hash the prompt
- output: json|curl (default: json)
```

#### Shorten URL (Premium)
```
POST https://attest.97115104.com/api/shorten

Headers:
- Content-Type: application/json

Body:
{
  "dataUrl": "data:application/json;base64,...",
  "apiKey": "ak_..." // Required for permanent URLs
}

Response:
{
  "shortUrl": "https://attest.97115104.com/s/abc123",
  "shortId": "abc123"
}
```

#### JavaScript API
```javascript
// Create badge programmatically
const badge = AttestInk.createBadgeSVG('gpt-4', 'generated');

// Get badge URL
const url = AttestInk.getBadgeUrl('claude-3-opus');

// Render all badges on page
AttestInk.renderBadges();
```

## Development

### Local Development
```bash
# Clone repository
git clone https://github.com/97115104/attest.git
cd attest

# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000
```

### Testing
- Open http://localhost:8000
- Create test attestations
- Verify badges render correctly
- Test verification flow

### Deployment
The site automatically deploys to Vercel when changes are pushed to the main branch.

To deploy elsewhere:
1. Build not required (pure static files)
2. Upload all files to your static host
3. Configure your domain and environment variables:
   - `STRIPE_SECRET_KEY` - For payment processing (optional)
   - `SMTP_*` - For email notifications (optional)
   - `REDIS_URL` - For short URL storage (optional)
4. No server configuration needed for basic features

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Ways to Contribute
- Add new AI models to the registry
- Improve badge designs
- Add language translations
- Write integration guides
- Report bugs or suggest features

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Documentation

### Core Documentation
- [Protocol Specification](https://attest.97115104.com/protocol/) - Technical protocol details
- [Badge Gallery](https://attest.97115104.com/showcase/) - Complete badge collection
- [Integration Examples](https://attest.97115104.com/examples/) - Real-world usage examples
- [API Reference](docs/api-reference.html) - Complete API documentation
- [CI/CD Automation Guide](docs/ci-cd-automation.html) - Pipeline integration guide

### Integration Guides

### CI/CD Automation

#### GitHub Actions
```yaml
name: AI Attestation
on: [push]

jobs:
  attest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create AI Attestation
        run: |
          # Generate attestation for your README
          ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html?content_name=README&content=$(cat README.md | jq -sRr @uri)&model=gpt-4&role=assisted&output=json")
          
          # Extract the data URL
          DATA_URL=$(echo $ATTESTATION | jq -r '.dataUrl')
          
          # Add badge to README
          echo -e "\n\n[![AI Assisted](https://attest.97115104.com/assets/badges/ai-assisted.svg)]($DATA_URL)" >> README.md
          
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git commit -am "Add AI attestation badge"
          git push
```

#### GitLab CI/CD
```yaml
attest:
  stage: deploy
  script:
    - |
      # Create attestation for documentation
      CONTENT=$(cat docs/*.md | base64 -w 0)
      ATTESTATION=$(curl -X POST https://attest.97115104.com/api/create.html \
        -d "content_name=Documentation" \
        -d "content=$CONTENT" \
        -d "model=claude-3-opus" \
        -d "role=assisted")
      
      # Save attestation
      echo $ATTESTATION > attestation.json
  artifacts:
    paths:
      - attestation.json
```

#### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('AI Attestation') {
            steps {
                script {
                    // Create attestation for build artifacts
                    def content = readFile('dist/bundle.js')
                    def attestation = sh(
                        script: """curl -s 'https://attest.97115104.com/api/create.html?content_name=Build&model=github-copilot&role=assisted&content=\${content}'""",
                        returnStdout: true
                    ).trim()
                    
                    // Save attestation
                    writeFile file: 'dist/attestation.json', text: attestation
                }
            }
        }
    }
}
```

#### Node.js/npm Scripts
```json
{
  "scripts": {
    "build": "webpack",
    "attest": "node scripts/create-attestation.js",
    "postbuild": "npm run attest"
  }
}
```

```javascript
// scripts/create-attestation.js
const fs = require('fs');
const https = require('https');

async function createAttestation() {
  const content = fs.readFileSync('dist/main.js', 'utf8');
  const params = new URLSearchParams({
    content_name: 'Production Build',
    content: content,
    model: 'github-copilot',
    role: 'assisted',
    output: 'json'
  });
  
  const response = await fetch(`https://attest.97115104.com/api/create.html?${params}`);
  const attestation = await response.json();
  
  // Add badge to README
  const badge = `[![AI Assisted](https://attest.97115104.com/assets/badges/ai-assisted.svg)](${attestation.dataUrl})`;
  const readme = fs.readFileSync('README.md', 'utf8');
  fs.writeFileSync('README.md', readme + '\n\n' + badge);
}

createAttestation();
```

#### Python Build Script
```python
#!/usr/bin/env python3
import requests
import json
import hashlib

def create_attestation(file_path, model="gpt-4"):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Create attestation
    response = requests.get('https://attest.97115104.com/api/create.html', params={
        'content_name': file_path,
        'content': content,
        'model': model,
        'role': 'generated',
        'output': 'json'
    })
    
    attestation = response.json()
    
    # Save attestation
    with open(f'{file_path}.attestation.json', 'w') as f:
        json.dump(attestation, f, indent=2)
    
    return attestation['verifyUrl']

# Example usage in build script
if __name__ == '__main__':
    verify_url = create_attestation('src/main.py', 'github-copilot')
    print(f"Attestation created: {verify_url}")
```

### Framework Integrations

#### WordPress
```php
// In your theme or plugin
function add_ai_attestation_badge() {
    echo '<a href="https://attest.97115104.com/verify/?data=..." target="_blank">';
    echo '<img src="https://attest.97115104.com/assets/badges/ai-assisted.svg" alt="AI Assisted" />';
    echo '</a>';
}
```

#### React
```jsx
const AIBadge = ({ attestationUrl }) => (
    <a href={attestationUrl} target="_blank" rel="noopener noreferrer">
        <img src="https://attest.97115104.com/assets/badges/ai-generated.svg" alt="AI Generated" />
    </a>
);
```

#### Vue.js
```vue
<template>
  <a :href="attestationUrl" target="_blank">
    <img src="https://attest.97115104.com/assets/badges/ai-assisted.svg" alt="AI Assisted" />
  </a>
</template>

<script>
export default {
  props: ['attestationUrl']
}
</script>
```

#### Next.js
```jsx
import Image from 'next/image';

export default function AIBadge({ attestation }) {
  return (
    <a href={`https://attest.97115104.com/verify/?data=${attestation}`} target="_blank">
      <Image 
        src="/ai-assisted-badge.svg" 
        alt="AI Assisted"
        width={120}
        height={30}
      />
    </a>
  );
}
```

#### LaTeX
```latex
\usepackage{hyperref}
\href{https://attest.97115104.com/verify/?data=...}{%
    \includegraphics[width=3cm]{ai-attestation-badge.pdf}%
}
```

## Security & Privacy

### Security Features
- **Content Integrity**: SHA-256 hashes ensure content hasn't been modified
- **Digital Signatures**: Optional cryptographic signatures for proof of authorship
- **No Data Collection**: No analytics, tracking, or server-side storage
- **Open Source**: Fully auditable codebase

### Privacy Features
- **Private Prompts**: Keep prompts confidential while proving AI use
- **Local Processing**: All operations happen in your browser
- **No Account Required**: Create attestations anonymously
- **Data Portability**: Export and backup all attestations

## Use Cases

### Academic Papers
- Disclose AI assistance in research
- Maintain academic integrity
- Provide verifiable proof for journals

### Blog Posts & Articles
- Build trust with readers
- Comply with disclosure requirements
- Stand out with transparency

### Code & Documentation
- Document AI-assisted development
- Track AI contributions
- Maintain audit trails

### Creative Works
- Attribute AI-generated art
- Protect artistic integrity
- Enable proper crediting

## Statistics

- **100+** Supported AI models
- **15+** AI providers
- **10+** Badge styles
- **8** Content types
- **3** Attestation roles
- **0** Servers required

## Roadmap

### Planned Features
- [ ] Browser extension for one-click attestation
- [ ] WordPress plugin
- [ ] npm package for Node.js integration
- [ ] Python library
- [ ] Additional signature methods (PGP, DID)
- [ ] Batch attestation creation
- [ ] Attestation chains for derivative works

### Under Consideration
- IPFS integration for permanent storage
- ENS integration for human-readable attestation IDs
- WebAuthn support for hardware key signatures
- Multi-language interface translations

## FAQ

**Q: Do I need a blockchain wallet?**
A: No, digital signatures are optional. You can create attestations without any wallet.

**Q: Where is my data stored?**
A: Attestations are encoded in URLs or saved as JSON files. No central storage.

**Q: Can I verify attestations offline?**
A: Yes, download the attestation JSON and verify locally.

**Q: Is this free to use?**
A: Yes, completely free and open source under MIT license.

**Q: Can I self-host this?**
A: Yes, it's just static files. Host anywhere that serves HTML.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Created by [@97115104](https://github.com/97115104) + AI tools
- Built as a public good for the AI community
- Supported by [0x42 Research](https://0x42r.io/)
- Special thanks to all early adopters
- [Sponsors link if you're into it 🩵](https://github.com/sponsors/97115104)

## Contact

- **Email**: info@attest.97115104.com
- **GitHub**: [github.com/97115104/attest](https://github.com/97115104/attest)
- **Issues**: [Report bugs or request features](https://github.com/97115104/attest/issues)

---

<div align="center">
    <img src="https://attest.97115104.com/assets/badges/ai-assisted.svg" alt="AI Assisted" width="120" height="30" />
    <br>
    <em>This README was created with AI assistance and human oversight</em>
    <br>
    <strong>Made with transparency for the AI era</strong>
</div>
