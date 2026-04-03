import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { customAlphabet } from 'nanoid';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'attest.97115104.com';
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
};

function serve404(res) {
  try {
    const page = fs.readFileSync(path.join(__dirname, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(page);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

function serveStatic(res, req, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    const etag = '"' + crypto.createHash('md5').update(data).digest('hex') + '"';
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      return res.end();
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'ETag': etag,
    });
    res.end(data);
  } catch {
    serve404(res);
  }
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { resolve(null); }
    });
    req.on('error', reject);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ── Multipart parser (minimal) ───────────────────────────────────────
function parseMultipart(buf, boundary) {
  const parts = {};
  const sep = '--' + boundary;
  const str = buf.toString('latin1');
  const segments = str.split(sep).slice(1, -1);
  for (const seg of segments) {
    const headerEnd = seg.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const header = seg.slice(0, headerEnd);
    const body = seg.slice(headerEnd + 4).replace(/\r\n$/, '');
    const nameMatch = header.match(/name="([^"]+)"/);
    const fileMatch = header.match(/filename="([^"]*)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    if (fileMatch) {
      // file field — get binary content via byte offsets
      const hdrBytes = Buffer.byteLength(seg.slice(0, headerEnd + 4), 'latin1');
      const fullBytes = Buffer.from(seg, 'latin1');
      const fileBytes = fullBytes.slice(hdrBytes, fullBytes.length - 2);
      parts[name] = { filename: fileMatch[1], data: fileBytes };
    } else {
      parts[name] = body;
    }
  }
  return parts;
}

// ── Shared attestation helpers ───────────────────────────────────────
function generateId() {
  return new Date().toISOString().split('T')[0] + '-' + crypto.randomBytes(3).toString('hex');
}

function deriveType(role) {
  if (role === 'authored') return 'human';
  if (role === 'generated') return 'ai';
  return 'collab';
}

function buildAttestation({ contentName, model, role, author, contentHash, extras }) {
  const authorship_type = extras?.authorship_type || deriveType(role);
  const id = generateId();
  const attestation = {
    version: '2.0',
    id,
    content_name: contentName,
    model: role === 'authored' ? 'Human' : model,
    role,
    authorship_type,
    timestamp: new Date().toISOString(),
    platform: HOST,
    author,
    ...extras,
  };
  if (contentHash) attestation.content_hash = contentHash;
  return attestation;
}

function signAttestation(attestation) {
  const { content_hash, model, timestamp, authorship_type, role } = attestation;
  const dataToSign = JSON.stringify({ content_hash, model, timestamp, authorship_type, role });
  const signingKey = 'attest-97115104-' + attestation.id;
  const sig = crypto.createHmac('sha256', signingKey).update(dataToSign).digest('hex');
  attestation.signature = { type: 'hmac-sha256', algorithm: 'HMAC-SHA256', value: sig, data_to_sign: dataToSign };
  attestation.signer = { name: attestation.author, id: attestation.author.toLowerCase().replace(/\s+/g, '') };
  return attestation;
}

function createShortUrl(encoded) {
  const db = getDb();
  let shortId;
  for (let i = 0; i < 10; i++) {
    shortId = nanoid();
    if (!db.prepare('SELECT id FROM urls WHERE id = ?').get(shortId)) break;
  }
  db.prepare('INSERT INTO urls (id, data) VALUES (?, ?)').run(shortId, encoded);
  return { shortUrl: `https://${HOST}/s/${shortId}`, shortId };
}

function encodeAndUrl(attestation) {
  const encoded = Buffer.from(JSON.stringify(attestation)).toString('base64');
  const longUrl = `https://${HOST}/verify/?data=${encodeURIComponent(encoded)}`;
  return { encoded, longUrl };
}

// ── API: Create attestation ──────────────────────────────────────────
function handleCreate(query) {
  const contentName = query.get('content_name');
  if (!contentName) return { error: 'content_name is required' };

  const model = query.get('model') || 'gpt-4';
  const role = query.get('role') || 'collaborated';
  const author = query.get('author') || 'Anonymous';
  const content = query.get('content');
  const contentHash = content ? 'sha256:' + crypto.createHash('sha256').update(content).digest('hex') : null;

  // Collect additional custom fields (anything beyond the core params)
  const reserved = new Set(['content_name', 'model', 'role', 'author', 'content', 'authorship_type']);
  const extras = {};
  if (query.get('authorship_type')) extras.authorship_type = query.get('authorship_type');
  for (const [key, value] of query.entries()) {
    if (!reserved.has(key)) extras[key] = value;
  }

  const attestation = buildAttestation({
    contentName, model, role, author, contentHash, extras,
  });
  signAttestation(attestation);

  const { encoded, longUrl } = encodeAndUrl(attestation);
  const { shortUrl } = createShortUrl(encoded);
  return { success: true, attestation, urls: { verify: longUrl, short: shortUrl } };
}

// ── API: Shorten URL ─────────────────────────────────────────────────
function handleShorten(body) {
  if (!body || !body.data) return { error: 'Missing "data" in request body (base64 attestation)' };
  return createShortUrl(body.data);
}

// ── Router ───────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // API routes
  if (pathname === '/api/create') {
    return json(res, 200, handleCreate(url.searchParams));
  }

  if (pathname === '/api/create-upload' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return json(res, 400, { error: 'Multipart boundary required' });

    const raw = await readRawBody(req);
    const parts = parseMultipart(raw, boundaryMatch[1]);

    const file = parts.file;
    if (!file || !file.filename) return json(res, 400, { error: 'File upload required' });

    const contentName = (typeof parts.content_name === 'string' && parts.content_name) || file.filename;
    const model = (typeof parts.model === 'string' && parts.model) || 'gpt-4';
    const role = (typeof parts.role === 'string' && parts.role) || 'collaborated';
    const author = (typeof parts.author === 'string' && parts.author) || 'Anonymous';
    const contentHash = 'sha256:' + crypto.createHash('sha256').update(file.data).digest('hex');

    const attestation = buildAttestation({
      contentName, model, role, author, contentHash,
      extras: {
        ...(typeof parts.authorship_type === 'string' && parts.authorship_type ? { authorship_type: parts.authorship_type } : {}),
        document_type: path.extname(file.filename).replace('.', '') || 'unknown',
      },
    });
    signAttestation(attestation);

    const { encoded, longUrl } = encodeAndUrl(attestation);
    const { shortUrl } = createShortUrl(encoded);

    return json(res, 200, { success: true, attestation, urls: { verify: longUrl, short: shortUrl } });
  }

  if (pathname === '/api/create-url' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body || !body.url) return json(res, 400, { error: 'url is required' });

    let pageUrl;
    try {
      pageUrl = new URL(body.url);
      if (!['http:', 'https:'].includes(pageUrl.protocol)) {
        return json(res, 400, { error: 'Only http and https URLs are supported' });
      }
    } catch {
      return json(res, 400, { error: 'Invalid URL' });
    }

    let pageContent;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const fetchRes = await fetch(pageUrl.href, {
        signal: controller.signal,
        headers: { 'User-Agent': `attest/2.0 (+https://${HOST})` },
        redirect: 'follow',
      });
      clearTimeout(timeout);
      if (!fetchRes.ok) return json(res, 502, { error: `Failed to fetch URL (HTTP ${fetchRes.status})` });
      pageContent = Buffer.from(await fetchRes.arrayBuffer());
    } catch (err) {
      return json(res, 502, { error: 'Could not fetch URL: ' + (err.name === 'AbortError' ? 'request timed out' : err.message) });
    }

    const contentName = body.content_name || pageUrl.hostname + pageUrl.pathname;
    const model = body.model || 'gpt-4';
    const role = body.role || 'collaborated';
    const author = body.author || 'Anonymous';
    const contentHash = 'sha256:' + crypto.createHash('sha256').update(pageContent).digest('hex');

    const attestation = buildAttestation({
      contentName, model, role, author, contentHash,
      extras: {
        ...(body.authorship_type ? { authorship_type: body.authorship_type } : {}),
        source_url: pageUrl.href,
        document_type: 'webpage',
      },
    });
    signAttestation(attestation);

    const { encoded, longUrl } = encodeAndUrl(attestation);
    const { shortUrl } = createShortUrl(encoded);

    return json(res, 200, { success: true, attestation, urls: { verify: longUrl, short: shortUrl } });
  }

  if (pathname === '/api/shorten' && req.method === 'POST') {
    const body = await readBody(req);
    const result = handleShorten(body);
    return json(res, result.error ? 400 : 200, result);
  }

  // Short URL redirect
  const shortMatch = pathname.match(/^\/s\/([a-z0-9]+)$/);
  if (shortMatch) {
    const db = getDb();
    const row = db.prepare('SELECT data FROM urls WHERE id = ?').get(shortMatch[1]);
    if (!row) return json(res, 404, { error: 'Not found' });
    const verifyUrl = `/verify/?data=${encodeURIComponent(row.data)}`;
    res.writeHead(302, { Location: verifyUrl });
    return res.end();
  }

  // Static files
  let filePath;
  if (pathname === '/') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname.endsWith('/')) {
    filePath = path.join(__dirname, pathname, 'index.html');
  } else if (path.extname(pathname)) {
    filePath = path.join(__dirname, pathname);
  } else {
    // try with /index.html
    filePath = path.join(__dirname, pathname, 'index.html');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, pathname + '.html');
    }
  }

  // Prevent path traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(__dirname))) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  serveStatic(res, req, resolved);
});

// Init DB then start
getDb();
server.listen(PORT, () => {
  console.log(`⬡ attest server running → http://localhost:${PORT}`);
});
