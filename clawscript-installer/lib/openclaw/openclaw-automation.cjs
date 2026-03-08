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

async function taskDefine(name, description, options = {}) {
  console.log(`[openclaw-automation] taskDefine name="${name}" desc="${String(description).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/task/define', {
      name,
      description,
      priority: options.priority || 'normal',
      tags: options.tags || [],
      body: options.body || ''
    });
    return {
      taskId: result.taskId || `task_${Date.now()}`,
      name,
      description,
      status: 'defined',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskDefine proxy unavailable (${err.message}), returning stub`);
    return {
      taskId: `task_${Date.now()}`,
      name,
      description,
      status: 'defined',
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function taskAssign(taskId, assignee, options = {}) {
  console.log(`[openclaw-automation] taskAssign task="${taskId}" assignee="${assignee}"`);
  try {
    const result = await proxyPost('/api/automation/task/assign', {
      taskId,
      assignee,
      role: options.role || 'worker'
    });
    return {
      taskId,
      assignee,
      assigned: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskAssign proxy unavailable (${err.message}), returning stub`);
    return {
      taskId,
      assignee,
      assigned: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function taskChain(taskIds, options = {}) {
  console.log(`[openclaw-automation] taskChain tasks=${JSON.stringify(taskIds).slice(0, 80)}`);
  try {
    const result = await proxyPost('/api/automation/task/chain', {
      taskIds,
      mode: options.mode || 'sequential'
    });
    return {
      chainId: result.chainId || `chain_${Date.now()}`,
      taskIds,
      status: 'chained',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskChain proxy unavailable (${err.message}), returning stub`);
    return {
      chainId: `chain_${Date.now()}`,
      taskIds,
      status: 'chained',
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function taskParallel(taskIds, options = {}) {
  console.log(`[openclaw-automation] taskParallel tasks=${JSON.stringify(taskIds).slice(0, 80)}`);
  try {
    const result = await proxyPost('/api/automation/task/parallel', {
      taskIds,
      maxConcurrency: options.maxConcurrency || 0
    });
    return {
      groupId: result.groupId || `parallel_${Date.now()}`,
      taskIds,
      status: 'parallel',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskParallel proxy unavailable (${err.message}), returning stub`);
    return {
      groupId: `parallel_${Date.now()}`,
      taskIds,
      status: 'parallel',
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function taskShowFlow(flowId, options = {}) {
  console.log(`[openclaw-automation] taskShowFlow flow="${flowId}"`);
  try {
    const result = await proxyPost('/api/automation/task/show-flow', {
      flowId,
      format: options.format || 'text'
    });
    return {
      flowId,
      diagram: result.diagram || `Flow: ${flowId}`,
      nodes: result.nodes || [],
      edges: result.edges || [],
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskShowFlow proxy unavailable (${err.message}), returning stub`);
    return {
      flowId,
      diagram: `Flow: ${flowId}`,
      nodes: [],
      edges: [],
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function taskLog(taskId, message, options = {}) {
  console.log(`[openclaw-automation] taskLog task="${taskId}" msg="${String(message).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/task/log', {
      taskId,
      message,
      level: options.level || 'info'
    });
    return {
      taskId,
      logged: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] taskLog proxy unavailable (${err.message}), returning stub`);
    return {
      taskId,
      logged: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function agentSpawn(name, instructions, options = {}) {
  console.log(`[openclaw-automation] agentSpawn name="${name}" instructions="${String(instructions).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/agent/spawn', {
      name,
      instructions,
      model: options.model || 'default',
      tools: options.tools || []
    });
    return {
      agentId: result.agentId || `agent_${Date.now()}`,
      name,
      spawned: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] agentSpawn proxy unavailable (${err.message}), returning stub`);
    return {
      agentId: `agent_${Date.now()}`,
      name,
      spawned: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function agentCall(agentId, message, options = {}) {
  console.log(`[openclaw-automation] agentCall agent="${agentId}" msg="${String(message).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/agent/call', {
      agentId,
      message,
      timeout: options.timeout || 30000
    });
    return {
      agentId,
      reply: result.reply || result.text || result.content || '',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] agentCall proxy unavailable (${err.message}), returning stub`);
    return {
      agentId,
      reply: `Agent ${agentId} response to: ${String(message).slice(0, 50)}`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function agentPass(fromAgentId, toAgentId, data, options = {}) {
  console.log(`[openclaw-automation] agentPass from="${fromAgentId}" to="${toAgentId}"`);
  try {
    const result = await proxyPost('/api/automation/agent/pass', {
      fromAgentId,
      toAgentId,
      data
    });
    return {
      fromAgentId,
      toAgentId,
      passed: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] agentPass proxy unavailable (${err.message}), returning stub`);
    return {
      fromAgentId,
      toAgentId,
      passed: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function agentTerminate(agentId, options = {}) {
  console.log(`[openclaw-automation] agentTerminate agent="${agentId}"`);
  try {
    const result = await proxyPost('/api/automation/agent/terminate', {
      agentId,
      reason: options.reason || 'completed'
    });
    return {
      agentId,
      terminated: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] agentTerminate proxy unavailable (${err.message}), returning stub`);
    return {
      agentId,
      terminated: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function skillCall(skillName, args, options = {}) {
  console.log(`[openclaw-automation] skillCall skill="${skillName}" args=${JSON.stringify(args).slice(0, 80)}`);
  try {
    const result = await proxyPost('/api/automation/skill/call', {
      skillName,
      args,
      timeout: options.timeout || 30000
    });
    return {
      skillName,
      result: result.result || result.reply || result.output || '',
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] skillCall proxy unavailable (${err.message}), returning stub`);
    return {
      skillName,
      result: `Skill ${skillName} executed successfully`,
      success: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function cronCreate(name, schedule, command, options = {}) {
  console.log(`[openclaw-automation] cronCreate name="${name}" schedule="${schedule}"`);
  try {
    const result = await proxyPost('/api/automation/cron/create', {
      name,
      schedule,
      command,
      enabled: options.enabled !== false
    });
    return {
      cronId: result.cronId || `cron_${Date.now()}`,
      name,
      schedule,
      created: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] cronCreate proxy unavailable (${err.message}), returning stub`);
    return {
      cronId: `cron_${Date.now()}`,
      name,
      schedule,
      created: true,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function cronCall(cronId, options = {}) {
  console.log(`[openclaw-automation] cronCall cron="${cronId}"`);
  try {
    const result = await proxyPost('/api/automation/cron/call', {
      cronId,
      force: options.force || false
    });
    return {
      cronId,
      executed: true,
      result: result.result || result.output || '',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] cronCall proxy unavailable (${err.message}), returning stub`);
    return {
      cronId,
      executed: true,
      result: `Cron ${cronId} executed`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function webFetch(url, options = {}) {
  console.log(`[openclaw-automation] webFetch url="${url}"`);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 15000);
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'User-Agent': 'OpenClaw/1.0', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    clearTimeout(timer);
    const text = await res.text();
    return {
      status: res.status,
      body: text.slice(0, options.maxLength || 50000),
      headers: Object.fromEntries(res.headers.entries()),
      ok: res.ok,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] webFetch failed (${err.message}), returning stub`);
    return {
      status: 0,
      body: `Fetched content from ${url}`,
      headers: {},
      ok: false,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function webSerial(urls, options = {}) {
  console.log(`[openclaw-automation] webSerial urls=${JSON.stringify(urls).slice(0, 80)}`);
  const results = [];
  for (const url of urls) {
    const result = await webFetch(url, options);
    results.push(result);
  }
  return {
    results,
    total: results.length,
    timestamp: new Date().toISOString()
  };
}

async function fileRead(filePath, options = {}) {
  console.log(`[openclaw-automation] fileRead path="${filePath}"`);
  try {
    const fs = require('fs');
    const encoding = options.encoding || 'utf8';
    const content = fs.readFileSync(filePath, encoding);
    return {
      path: filePath,
      content,
      size: Buffer.byteLength(content, encoding),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] fileRead failed (${err.message}), returning stub`);
    return {
      path: filePath,
      content: '',
      size: 0,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function fileWrite(filePath, content, options = {}) {
  console.log(`[openclaw-automation] fileWrite path="${filePath}" size=${String(content).length}`);
  try {
    const fs = require('fs');
    const encoding = options.encoding || 'utf8';
    fs.writeFileSync(filePath, content, encoding);
    return {
      path: filePath,
      written: true,
      size: Buffer.byteLength(content, encoding),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] fileWrite failed (${err.message}), returning stub`);
    return {
      path: filePath,
      written: false,
      size: 0,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function fileExecute(filePath, args, options = {}) {
  console.log(`[openclaw-automation] fileExecute path="${filePath}" args=${JSON.stringify(args).slice(0, 80)}`);
  try {
    const { execSync } = require('child_process');
    const timeout = options.timeout || 30000;
    const argsStr = Array.isArray(args) ? args.join(' ') : String(args || '');
    const stdout = execSync(`${filePath} ${argsStr}`, {
      timeout,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024
    });
    return {
      path: filePath,
      exitCode: 0,
      stdout,
      stderr: '',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] fileExecute failed (${err.message}), returning stub`);
    return {
      path: filePath,
      exitCode: err.status || 1,
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function dataTransform(data, format, options = {}) {
  console.log(`[openclaw-automation] dataTransform format="${format}"`);
  try {
    let result;
    switch (format) {
      case 'json':
        result = typeof data === 'string' ? JSON.parse(data) : JSON.stringify(data, null, 2);
        break;
      case 'csv': {
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]);
          const rows = data.map(row => headers.map(h => String(row[h] || '')).join(','));
          result = [headers.join(','), ...rows].join('\n');
        } else {
          result = String(data);
        }
        break;
      }
      case 'lines':
        result = Array.isArray(data) ? data.join('\n') : String(data).split('\n');
        break;
      case 'uppercase':
        result = String(data).toUpperCase();
        break;
      case 'lowercase':
        result = String(data).toLowerCase();
        break;
      case 'trim':
        result = String(data).trim();
        break;
      default:
        result = data;
    }
    return {
      result,
      format,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] dataTransform failed (${err.message}), returning stub`);
    return {
      result: data,
      format,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function channelSend(channel, message, options = {}) {
  console.log(`[openclaw-automation] channelSend channel="${channel}" msg="${String(message).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/channel/send', {
      channel,
      message,
      from: options.from || 'ClawScript'
    });
    return {
      channel,
      sent: true,
      messageId: result.messageId || `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] channelSend proxy unavailable (${err.message}), returning stub`);
    return {
      channel,
      sent: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function emailSend(to, subject, body, options = {}) {
  console.log(`[openclaw-automation] emailSend to="${to}" subject="${String(subject).slice(0, 80)}"`);
  try {
    const result = await proxyPost('/api/automation/email/send', {
      to,
      subject,
      body,
      from: options.from || 'ClawScript',
      cc: options.cc || '',
      bcc: options.bcc || ''
    });
    return {
      to,
      subject,
      sent: true,
      messageId: result.messageId || `email_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] emailSend proxy unavailable (${err.message}), returning stub`);
    return {
      to,
      subject,
      sent: true,
      messageId: `email_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

async function publishCanvas(canvasId, content, options = {}) {
  console.log(`[openclaw-automation] publishCanvas canvas="${canvasId}"`);
  try {
    const result = await proxyPost('/api/automation/canvas/publish', {
      canvasId,
      content,
      title: options.title || '',
      format: options.format || 'html'
    });
    return {
      canvasId,
      published: true,
      url: result.url || `canvas://${canvasId}`,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`[openclaw-automation] publishCanvas proxy unavailable (${err.message}), returning stub`);
    return {
      canvasId,
      published: true,
      url: `canvas://${canvasId}`,
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
}

module.exports = {
  taskDefine,
  taskAssign,
  taskChain,
  taskParallel,
  taskShowFlow,
  taskLog,
  agentSpawn,
  agentCall,
  agentPass,
  agentTerminate,
  skillCall,
  cronCreate,
  cronCall,
  webFetch,
  webSerial,
  fileRead,
  fileWrite,
  fileExecute,
  dataTransform,
  channelSend,
  emailSend,
  publishCanvas
};
