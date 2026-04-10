// attest-client — SDK for the attest open attribution protocol
// https://attest.97115104.com

const DEFAULT_HOST = 'https://attest.97115104.com';

export function createClient(options = {}) {
  const host = (options.host || DEFAULT_HOST).replace(/\/+$/, '');
  const author = options.author || 'Anonymous';
  const headers = { 'User-Agent': `attest-client/3.0.0` };

  async function create({ content_name, model, role, author: overrideAuthor, content, authorship_type, platform, prompt, prompt_type }) {
    if (!content_name) throw new Error('attest-client: content_name is required');

    const params = new URLSearchParams();
    params.set('content_name', content_name);
    if (model) params.set('model', model);
    if (role) params.set('role', role);
    params.set('author', overrideAuthor || author);
    if (content) params.set('content', content);
    if (authorship_type) params.set('authorship_type', authorship_type);
    if (platform) params.set('platform', platform);
    if (prompt) params.set('prompt', prompt);
    if (prompt_type) params.set('prompt_type', prompt_type);

    const res = await fetch(`${host}/api/create?${params}`, { headers });
    if (!res.ok) throw new Error(`attest-client: HTTP ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data.success) throw new Error(`attest-client: ${data.error || 'unknown error'}`);
    return data;
  }

  async function createFromUrl({ url, model, role, author: overrideAuthor, platform, prompt, prompt_type }) {
    if (!url) throw new Error('attest-client: url is required');

    const body = { url, model, role, author: overrideAuthor || author, platform, prompt, prompt_type };
    const res = await fetch(`${host}/api/create-url`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`attest-client: HTTP ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data.success) throw new Error(`attest-client: ${data.error || 'unknown error'}`);
    return data;
  }

  async function metrics() {
    const res = await fetch(`${host}/api/metrics`, { headers });
    if (!res.ok) throw new Error(`attest-client: HTTP ${res.status} ${res.statusText}`);
    return res.json();
  }

  async function discover() {
    const res = await fetch(`${host}/.well-known/attest.json`, { headers });
    if (!res.ok) throw new Error(`attest-client: HTTP ${res.status} ${res.statusText}`);
    return res.json();
  }

  return { create, createFromUrl, metrics, discover };
}

// Convenience: one-shot attestation without creating a client
export async function attest(options) {
  const { host, author, ...params } = options;
  const client = createClient({ host, author });
  return client.create(params);
}

export default attest;
