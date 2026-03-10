'use strict';

const PROXY_BASE = process.env.OPENCLAW_PROXY_BASE || 'http://localhost:5000';
const fs = require('fs');
const path = require('path');

const ALERTS_FILE = path.join(__dirname, '..', '..', 'ig-alerts.json');

function appendAlert(alert) {
  try {
    let data = { alerts: [] };
    try { data = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8')); } catch {}
    if (!Array.isArray(data.alerts)) data.alerts = [];
    data.alerts.push(alert);
    if (data.alerts.length > 500) data.alerts = data.alerts.slice(-500);
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(`[openclaw-channels] Failed to write alert file: ${err.message}`);
  }
}

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

async function send(target, message, options = {}) {
  const level = options.level || 'info';
  const channel = options.channel || 'default';
  console.log(`[openclaw-channels] send target="${target}" level=${level} msg="${String(message).slice(0, 80)}"`);

  const alert = {
    type: 'clawscript_alert',
    target,
    message: String(message),
    level,
    channel,
    timestamp: new Date().toISOString()
  };
  appendAlert(alert);

  try {
    const result = await proxyPost('/api/chat', {
      text: `[${level.toUpperCase()}] ${String(message)}`,
      from: `ClawScript → ${target}`
    });
    return {
      sent: true,
      channel,
      target,
      level,
      messageId: result.id || `ch_${Date.now()}`,
      timestamp: result.ts || new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-channels] send proxy unavailable (${err.message}), alert saved to file`);
    return {
      sent: false,
      channel,
      target,
      level,
      messageId: `ch_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: err.message,
      savedToFile: true
    };
  }
}

module.exports = { send };
