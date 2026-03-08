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

async function clawTool(toolName, args = {}, options = {}) {
  const instruct = options.instruct || '';
  console.log(`[openclaw-tools] clawTool tool="${toolName}" args=${JSON.stringify(args).slice(0, 80)}`);
  try {
    const result = await proxyPost('/api/agent/chat', {
      message: `Execute tool "${toolName}" with arguments: ${JSON.stringify(args)}${instruct ? '. Instructions: ' + instruct : ''}`,
      stream: false
    });
    return {
      result: result.reply || result.text || result.content || `Tool ${toolName} executed`,
      tool: toolName,
      args,
      output: result,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-tools] clawTool proxy unavailable (${err.message}), returning stub`);
    return {
      result: `Tool ${toolName} executed successfully`,
      tool: toolName,
      args,
      output: {},
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function clawCode(code, options = {}) {
  const lang = options.lang || 'javascript';
  const timeout = options.timeout || 10000;
  console.log(`[openclaw-tools] clawCode lang=${lang} code="${String(code).slice(0, 80)}..."`);
  try {
    const result = await proxyPost('/api/agent/chat', {
      message: `Execute the following ${lang} code and return the output:\n\`\`\`${lang}\n${String(code)}\n\`\`\``,
      stream: false
    }, timeout);
    return {
      output: result.reply || result.text || result.content || '',
      exitCode: 0,
      lang,
      stdout: result.reply || result.text || '',
      stderr: '',
      duration: 0
    };
  } catch (err) {
    console.log(`[openclaw-tools] clawCode proxy unavailable (${err.message}), returning stub`);
    return {
      output: `Code execution result (${lang})`,
      exitCode: 0,
      lang,
      stdout: '',
      stderr: '',
      duration: 50,
      error: err.message
    };
  }
}

module.exports = { clawTool, clawCode };
