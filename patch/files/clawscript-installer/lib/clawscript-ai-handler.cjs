'use strict';

const AI_PROVIDERS = [
  { name: 'groq', envKey: 'GROQ_API_KEY', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  { name: 'openai', envKey: 'OPENAI_API_KEY', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  { name: 'xai', envKey: 'XAI_API_KEY', url: 'https://api.x.ai/v1/chat/completions', model: 'grok-2-latest' },
];

function getProvider() {
  for (const p of AI_PROVIDERS) {
    if (process.env[p.envKey]) return { ...p, apiKey: process.env[p.envKey] };
  }
  return null;
}

async function handleClawScriptAiChat(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const provider = getProvider();
  if (!provider) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'No AI API key configured. Set one of: GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY as an environment variable.'
    }));
    return;
  }

  let body = '';
  for await (const chunk of req) { body += chunk; }
  let parsed;
  try { parsed = JSON.parse(body); } catch(e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const messages = parsed.messages || [];
  if (!messages.length) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No messages provided' }));
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);

    const apiRes = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + provider.apiKey
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        max_tokens: 4096,
        temperature: 0.3
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error('[clawscript-ai] API error:', data.error || apiRes.status);
      res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (data.error && data.error.message) || 'AI API error' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));

  } catch(err) {
    console.error('[clawscript-ai] Request failed:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'AI request failed: ' + err.message }));
  }
}

module.exports = { handleClawScriptAiChat, getProvider, AI_PROVIDERS };
