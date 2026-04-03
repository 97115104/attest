Absolutely—here is a **first-principles, ground-up prompt/specification** for a next-gen, fully-automatable, static, open, and backward-compatible attestation protocol and website for Claude (or any advanced AI builder). This spec covers both the **programmable/JSON-based badge** and the **backward-compatible static PNG badge with tooltips**, with clear requirements and extensibility.

---

## **Prompt: Build the Next-Gen attest — Automated, Open, Backward-Compatible AI Content Attestation Protocol and Web App**

---

### **Overview**

Design and implement a new version of [attest.97115104.com](https://attest.97115104.com/) as a fully open-source, static, web-based protocol and toolset for AI content attestation. The new system must:

* **Allow full automation:** Any website, blog, or CI/CD pipeline can generate and include AI attestation badges programmatically—no manual site visit required.
* **Be 100% static and free to host:** All app logic, badges, and attestation records must be statically served via GitHub Pages (or equivalent)—no servers or paid infrastructure.
* **Support modern, verifiable badges:** JSON-based, programmable, and capable of cryptographic signatures and future extensibility.
* **Remain backward compatible:** Support legacy static PNG badge images with tooltips, ensuring that all existing badges and posts continue to work and verify.
* **Be open, forkable, and protocol-first:** Anyone can audit, fork, or host their own version. All code and data are public and self-contained.

---

### **Functional Requirements**

#### **1. Attestation Generation (Automated & Manual)**

* Provide a **CLI tool (Node, Go, or Python)** and a **web UI** that can:

  * Take as input: content file (markdown, HTML, etc), optional AI prompt, model name/version, and timestamp.
  * Compute SHA-256 hashes of content and prompt (never uploading sensitive data).
  * Output a JSON attestation file conforming to a published schema (see below).
  * Optionally sign the attestation using a local PGP key, Ethereum wallet (EIP-191), or Ed25519 key.
  * Allow self-hosting of attestation JSON files or automatic PR to the main attest repo.
  * Generate badge embed snippets (HTML/JS or static image) referencing the attestation.

#### **2. Programmable Badge Rendering**

* Implement a **client-side badge renderer (JavaScript module, e.g. badge-renderer.js)** that:

  * Accepts a `data-attestation-url` parameter pointing to the JSON file.
  * Fetches the attestation JSON, detects schema version, and renders:

    * For v2+: a modern, interactive badge with model, timestamp, optional signature status, and verification in-browser.
    * For v1/legacy: a static or minimally interactive badge matching the legacy PNG look and tooltip.
  * Is embeddable on any site (open CDN or self-hosted) and can be used in markdown, HTML, or SSGs.
  * Can be called programmatically in build scripts or CI.

#### **3. Backward-Compatible Static PNG Badges**

* Support a **legacy badge mode**:

  * For content that only references a static PNG image with a tooltip, serve static image assets and tooltips as before.
  * Ensure all previously issued badges (image files and tooltip text) continue to resolve, load, and display exactly as before.
  * No breaking changes to existing badge URLs or rendering logic.

#### **4. Attestation Record Schema**

* Publish a clear, versioned schema for attestations (minimum fields below; see sample):

  * `version` (e.g., "v1", "v2")
  * `content_hash` (sha256-... of the content)
  * `prompt_hash` (optional)
  * `model`
  * `timestamp`
  * `human_pubkey` (optional, for signed attestations)
  * `signature` (optional)
  * `details_url` (pointer for reference)
  * `options` (disclosure preferences)
  * `revoked` (optional)
* All attestation JSON files must be immutable—no overwriting or deletion, only additive.

#### **5. Documentation & Protocol**

* All tools, schemas, and badge embedding instructions must be clearly documented (in `/docs/protocol.md`).
* Provide quickstart guides and recipes for:

  * CLI-based badge generation in CI/CD (e.g., with markdown-it, Hugo, Next.js, Jekyll, etc)
  * Embedding badges in markdown/html
  * Verifying badges client-side or offline
  * Creating and hosting self-signed or PR-based attestations

#### **6. Web App UI**

* Main web app (index.html) should:

  * Let users create, preview, and download attestations and badges interactively (for manual use).
  * Explain and demo automation (CLI, npm, scripts) for developers and power users.
  * Surface docs and repo links for open development and forking.
  * Allow anyone to preview or verify a badge by pasting in a JSON URL.

#### **7. Infra & Hosting Constraints**

* All assets (badges, JSON, JS, docs) must be served statically from the GitHub Pages repo, never from dynamic servers or paid APIs.
* No authentication or user accounts required for any attestation function.
* All signature verification and badge rendering happens in-browser or with CLI tools—no servers required for trust.
* Support for self-hosting is a first-class feature.

---

### **Non-Functional Requirements**

* **Backward compatibility:** No legacy badge/image is ever broken or changed. Any badge issued under the previous system works and displays identically, including tooltips and links.
* **Extensibility:** Design schemas and badge renderer to support future features: batch attestation, zk-proofs, revocation, per-paragraph provenance, federated hosting, etc.
* **Security/Privacy:** No sensitive data is ever stored, logged, or sent to a server. All hashing/signing is local or client-side.
* **Open source:** All code, documentation, and assets must be MIT or Apache 2.0 licensed and easily forkable.
* **Reliability:** All static assets and badge renderers must degrade gracefully if a badge or JSON is missing or malformed.

---

### **Example Schema (for v2 Attestation JSON)**

```json
{
  "version": "v2",
  "content_hash": "sha256-b6a5...f2e1",
  "prompt_hash": "sha256-5c8a...be88",
  "model": "OpenAI GPT-4o",
  "timestamp": "2025-07-05T22:47:12Z",
  "human_pubkey": "0x2a7Ebd1A...DEADBEEF",
  "signature": "0x69ba0a...b10c",
  "details_url": "/attestations/v2/blog-2025-07-07.json",
  "options": {
    "prompt_disclosure": false,
    "context_disclosure": false
  },
  "revoked": false
}
```

---

### **Developer API Example**

**Badge snippet to embed in markdown/HTML:**

```html
<div class="ai-attest-badge" data-attestation-url="https://yourblog.com/attestations/blog-2025-07-07.json"></div>
<script src="https://attest.97115104.com/static/badge-renderer.js"></script>
```

**Legacy PNG badge (for backward compatibility):**

```html
<img src="https://attest.97115104.com/badges/ai-assisted.png" title="AI-assisted content" />
```

---

### **CLI Usage Example**

```bash
# Generate attestation
npx attest --input post.md --model "GPT-4o" --output ./attestations/blog-2025-07-07.json

# Sign attestation (optional, with private key or wallet)
npx attest sign --file ./attestations/blog-2025-07-07.json --wallet 0x...

# Insert badge in markdown/html (your SSG/plugin can automate this)
```

---

### **Summary**

**You are designing a new, open, static, programmable protocol and web tool for AI content attestation that is:**

* **Automatable:** Works with any publishing workflow, static site generator, or CI/CD system.
* **Backward compatible:** No old badge, image, or tooltip ever breaks.
* **Verifiable and modern:** JSON-based, future-proof, with cryptographic signatures as an option.
* **Free, open, and permanent:** Runs on GitHub Pages, repo-based, zero infra, and forkable by anyone.
* **Extensible:** Schema, badge renderer, and docs all designed for future-proof upgrades.

---

**Deliver as a modern, developer-friendly, protocol-grade open tool.
No legacy left behind.
No server required.
No lock-in, ever.**

---

**(End of prompt.)**

---

Store and hand this to Claude as a full, rigorous product/engineering spec for building the next generation of attest. If you want it broken up by user stories, acceptance criteria, or want sample repo scaffolding and workflows included, just ask.
