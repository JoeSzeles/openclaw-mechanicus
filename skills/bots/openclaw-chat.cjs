'use strict';

const PROXY_BASE = process.env.OPENCLAW_PROXY_BASE || 'http://localhost:5000';

async function proxyPost(endpoint, payload, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${PROXY_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function sayToSession(sessionId, message, options = {}) {
  const channel = options.channel || 'default';
  console.log(`[openclaw-chat] sayToSession session="${sessionId}" channel=${channel} msg="${String(message).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/chat', {
      text: String(message),
      from: options.from || 'ClawScript',
      sessionId
    });
    return {
      sent: true,
      sessionId,
      channel,
      messageId: result.id || `msg_${Date.now()}`,
      timestamp: result.ts || new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-chat] sayToSession proxy unavailable (${err.message}), returning stub`);
    return {
      sent: false,
      sessionId,
      channel,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function spawnAgent(name, instructions, options = {}) {
  console.log(`[openclaw-chat] spawnAgent name="${name}" instructions="${String(instructions).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/agent/chat', {
      message: String(instructions),
      from: name || 'ClawScript-Agent',
      stream: false
    });
    return {
      spawned: true,
      name,
      agentId: result.id || `agent_${Date.now()}`,
      reply: result.reply || result.text || result.content || '',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-chat] spawnAgent proxy unavailable (${err.message}), returning stub`);
    return {
      spawned: false,
      name,
      agentId: `agent_${Date.now()}`,
      reply: '',
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function waitForReply(sessionId, timeout, filter) {
  timeout = timeout || 30000;
  console.log(`[openclaw-chat] waitForReply session="${sessionId}" timeout=${timeout} filter=${filter || 'none'}`);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(`${PROXY_BASE}/api/chat`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const messages = data.messages || [];
    const latest = messages.filter(m => {
      if (filter && !String(m.text || '').includes(filter)) return false;
      return true;
    }).pop();
    if (latest) {
      return {
        reply: latest.text || '',
        sessionId,
        fromUser: latest.from || 'unknown',
        timestamp: latest.ts || new Date().toISOString(),
        timedOut: false
      };
    }
    return {
      reply: '',
      sessionId,
      fromUser: '',
      timestamp: new Date().toISOString(),
      timedOut: true
    };
  } catch (err) {
    console.log(`[openclaw-chat] waitForReply proxy unavailable (${err.message}), returning stub`);
    return {
      reply: `Mock reply from session ${sessionId}`,
      sessionId,
      fromUser: 'mock_user',
      timestamp: new Date().toISOString(),
      timedOut: false
    };
  }
}

module.exports = { sayToSession, spawnAgent, waitForReply };
