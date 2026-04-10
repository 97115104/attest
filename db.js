import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'attest.db');

let db;

export function getDb() {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Short URL storage
  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Every attestation created
  db.exec(`
    CREATE TABLE IF NOT EXISTS attestations (
      id TEXT PRIMARY KEY,
      content_name TEXT,
      authorship_type TEXT,
      model TEXT,
      role TEXT,
      author TEXT,
      content_hash TEXT,
      short_id TEXT,
      platform TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Every verification hit
  db.exec(`
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attestation_id TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Agent scrape tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      user_agent TEXT,
      agent_name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration: add platform column if missing
  const cols = db.prepare("PRAGMA table_info(attestations)").all();
  if (!cols.find(c => c.name === 'platform')) {
    db.exec("ALTER TABLE attestations ADD COLUMN platform TEXT");
  }

  return db;
}

// ── Known agent signatures ───────────────────────────────────────────
const AGENT_PATTERNS = [
  { pattern: /claude/i, name: 'Claude' },
  { pattern: /chatgpt|openai/i, name: 'ChatGPT/OpenAI' },
  { pattern: /gpt/i, name: 'GPT' },
  { pattern: /copilot/i, name: 'GitHub Copilot' },
  { pattern: /gemini/i, name: 'Gemini' },
  { pattern: /perplexity/i, name: 'Perplexity' },
  { pattern: /anthropic/i, name: 'Anthropic' },
  { pattern: /cohere/i, name: 'Cohere' },
  { pattern: /huggingface|hf-/i, name: 'HuggingFace' },
  { pattern: /cursor/i, name: 'Cursor' },
  { pattern: /windsurf/i, name: 'Windsurf' },
  { pattern: /devin/i, name: 'Devin' },
  { pattern: /aider/i, name: 'Aider' },
  { pattern: /continue/i, name: 'Continue' },
  { pattern: /bot|crawl|spider|scrape|fetch/i, name: 'Bot/Crawler' },
];

export function detectAgent(userAgent) {
  if (!userAgent) return null;
  for (const { pattern, name } of AGENT_PATTERNS) {
    if (pattern.test(userAgent)) return name;
  }
  return null;
}

export function trackAgentVisit(path, userAgent) {
  const agent = detectAgent(userAgent);
  if (!agent) return;
  const d = getDb();
  d.prepare('INSERT INTO agent_visits (path, user_agent, agent_name) VALUES (?, ?, ?)').run(path, userAgent, agent);
}

export function trackAttestation(attestation, shortId) {
  const d = getDb();
  d.prepare(`INSERT OR IGNORE INTO attestations (id, content_name, authorship_type, model, role, author, content_hash, short_id, platform)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    attestation.id, attestation.content_name, attestation.authorship_type,
    attestation.model, attestation.role, attestation.author,
    attestation.content_hash || null, shortId || null, attestation.platform || null
  );
}

export function trackVerification(attestationId, userAgent) {
  const d = getDb();
  d.prepare('INSERT INTO verifications (attestation_id, user_agent) VALUES (?, ?)').run(attestationId || 'unknown', userAgent || '');
}

export function getMetrics() {
  const d = getDb();

  const totalAttestations = d.prepare('SELECT COUNT(*) as count FROM attestations').get().count;
  const totalVerifications = d.prepare('SELECT COUNT(*) as count FROM verifications').get().count;
  const totalAgentVisits = d.prepare('SELECT COUNT(*) as count FROM agent_visits').get().count;
  const uniqueAgents = d.prepare('SELECT COUNT(DISTINCT agent_name) as count FROM agent_visits').get().count;

  const topModel = d.prepare(`SELECT model, COUNT(*) as count FROM attestations
    WHERE model != 'Human' GROUP BY model ORDER BY count DESC LIMIT 1`).get();

  const topType = d.prepare(`SELECT authorship_type, COUNT(*) as count FROM attestations
    GROUP BY authorship_type ORDER BY count DESC LIMIT 1`).get();

  const topAuthor = d.prepare(`SELECT author, COUNT(*) as count FROM attestations
    GROUP BY author ORDER BY count DESC LIMIT 1`).get();

  const agentBreakdown = d.prepare(`SELECT agent_name, COUNT(*) as count FROM agent_visits
    GROUP BY agent_name ORDER BY count DESC LIMIT 10`).all();

  const typeBreakdown = d.prepare(`SELECT authorship_type, COUNT(*) as count FROM attestations
    GROUP BY authorship_type ORDER BY count DESC`).all();

  const recentAttestations = d.prepare(`SELECT id, content_name, authorship_type, model, author, short_id, created_at
    FROM attestations ORDER BY created_at DESC LIMIT 10`).all();

  const dailyRate = d.prepare(`SELECT COUNT(*) as count FROM attestations
    WHERE created_at >= datetime('now', '-24 hours')`).get().count;

  // Platform breakdown: which platforms are most used
  const platformBreakdown = d.prepare(`SELECT platform, COUNT(*) as count FROM attestations
    WHERE platform IS NOT NULL AND platform != '' GROUP BY platform ORDER BY count DESC LIMIT 10`).all();

  // Platform by type: what each platform is used for
  const platformByType = d.prepare(`SELECT platform, authorship_type, COUNT(*) as count FROM attestations
    WHERE platform IS NOT NULL AND platform != '' GROUP BY platform, authorship_type ORDER BY count DESC LIMIT 20`).all();

  // Top platform
  const topPlatform = d.prepare(`SELECT platform, COUNT(*) as count FROM attestations
    WHERE platform IS NOT NULL AND platform != '' GROUP BY platform ORDER BY count DESC LIMIT 1`).get();

  return {
    total_attestations: totalAttestations,
    total_verifications: totalVerifications,
    total_agent_visits: totalAgentVisits,
    unique_agents: uniqueAgents,
    top_model: topModel || { model: 'none', count: 0 },
    top_type: topType || { authorship_type: 'none', count: 0 },
    top_author: topAuthor || { author: 'none', count: 0 },
    top_platform: topPlatform || { platform: 'none', count: 0 },
    agent_breakdown: agentBreakdown,
    type_breakdown: typeBreakdown,
    platform_breakdown: platformBreakdown,
    platform_by_type: platformByType,
    recent_attestations: recentAttestations,
    attestations_24h: dailyRate,
  };
}
