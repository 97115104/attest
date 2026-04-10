#!/usr/bin/env node

// attest-client CLI
// Usage: npx attest-client --content README.md --model claude-opus-4 --role collaborated

const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  return args[i + 1];
}

const help = args.includes('--help') || args.includes('-h');
if (help) {
  console.log(`attest — open protocol for AI content attribution

Usage:
  attest --content <name> [options]
  attest --discover
  attest --metrics

Options:
  --content <name>    Content name or filename (required for attestation)
  --model <model>     AI model used (default: gpt-4)
  --role <role>       authored | collaborated | generated (default: collaborated)
  --author <name>     Author or agent name (default: Anonymous)
  --type <type>       human | collab | ai (overrides role)
  --platform <name>   Tool/interface (e.g. "GitHub Copilot VS Code", "Claude Code", "ChatGPT")
  --prompt <text>     The prompt used to generate the content
  --prompt-type <t>   single | multi-prompt (default: single)
  --host <url>        API host (default: https://attest.97115104.com)
  --discover          Show API discovery info
  --metrics           Show platform metrics
  --json              Output raw JSON
  --help, -h          Show this help`);
  process.exit(0);
}

const host = flag('host') || 'https://attest.97115104.com';
const headers = { 'User-Agent': 'attest-client/3.0.0 cli' };

async function run() {
  if (args.includes('--discover')) {
    const res = await fetch(`${host}/.well-known/attest.json`, { headers });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (args.includes('--metrics')) {
    const res = await fetch(`${host}/api/metrics`, { headers });
    const data = await res.json();
    if (args.includes('--json')) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`attestations: ${data.total_attestations}`);
      console.log(`verifications: ${data.total_verifications}`);
      console.log(`agent visits: ${data.total_agent_visits}`);
      console.log(`top model: ${data.top_model?.model || 'none'} (${data.top_model?.count || 0})`);
      console.log(`top type: ${data.top_type?.authorship_type || 'none'} (${data.top_type?.count || 0})`);
    }
    return;
  }

  const content_name = flag('content');
  if (!content_name) {
    console.error('error: --content is required. Use --help for usage.');
    process.exit(1);
  }

  const params = new URLSearchParams();
  params.set('content_name', content_name);
  const model = flag('model');
  if (model) params.set('model', model);
  const role = flag('role');
  if (role) params.set('role', role);
  const author = flag('author');
  if (author) params.set('author', author);
  const type = flag('type');
  if (type) params.set('authorship_type', type);
  const platform = flag('platform');
  if (platform) params.set('platform', platform);
  const prompt = flag('prompt');
  if (prompt) params.set('prompt', prompt);
  const promptType = flag('prompt-type');
  if (promptType) params.set('prompt_type', promptType);

  const res = await fetch(`${host}/api/create?${params}`, { headers });
  const data = await res.json();

  if (!data.success) {
    console.error(`error: ${data.error || 'unknown error'}`);
    process.exit(1);
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`attested: ${data.attestation.content_name}`);
    console.log(`type: ${data.attestation.authorship_type}`);
    console.log(`model: ${data.attestation.model}`);
    console.log(`id: ${data.attestation.id}`);
    console.log(`short: ${data.urls.short}`);
    console.log(`verify: ${data.urls.verify}`);
  }
}

run().catch(err => {
  console.error(`error: ${err.message}`);
  process.exit(1);
});
