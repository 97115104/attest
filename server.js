import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
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

// ── API: Create attestation ──────────────────────────────────────────
function handleCreate(query) {
  const content_name = query.get('content_name');
  if (!content_name) return { error: 'content_name is required' };

  const model = query.get('model') || 'gpt-4';
  const role = query.get('role') || 'assisted';
  const author = query.get('author') || 'Anonymous';
  const content = query.get('content');
  const authorship_type = query.get('authorship_type') || (role === 'authored' ? 'human' : role === 'generated' ? 'ai' : 'collab');

  const id = new Date().toISOString().split('T')[0] + '-' + crypto.randomBytes(3).toString('hex');

  const attestation = {
    version: '2.0',
    id,
    content_name,
    model: role === 'authored' ? 'Human' : model,
    role,
    authorship_type,
    timestamp: new Date().toISOString(),
    platform: 'attest.97115104.com',
    author,
  };

  if (content) {
    attestation.content_hash = 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
  }

  const encoded = Buffer.from(JSON.stringify(attestation)).toString('base64');
  const dataUrl = `https://attest.97115104.com/verify/?data=${encodeURIComponent(encoded)}`;

  return { success: true, attestation, urls: { verify: dataUrl } };
}

// ── API: Shorten URL ─────────────────────────────────────────────────
async function handleShorten(body) {
  if (!body || !body.data) return { error: 'Missing "data" in request body (base64 attestation)' };

  const db = getDb();
  const { customAlphabet } = await import('nanoid');
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

  let shortId;
  for (let i = 0; i < 10; i++) {
    shortId = nanoid();
    const existing = db.prepare('SELECT id FROM urls WHERE id = ?').get(shortId);
    if (!existing) break;
  }

  db.prepare('INSERT INTO urls (id, data) VALUES (?, ?)').run(shortId, body.data);
  return { shortUrl: `https://attest.97115104.com/s/${shortId}`, shortId };
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

  if (pathname === '/api/shorten' && req.method === 'POST') {
    const body = await readBody(req);
    const result = await handleShorten(body);
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

  serveStatic(res, resolved);
});

// Init DB then start
getDb();
server.listen(PORT, () => {
  console.log(`⬡ attest server running → http://localhost:${PORT}`);
});
