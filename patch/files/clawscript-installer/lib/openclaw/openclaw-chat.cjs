'use strict';

async function sayToSession(sessionId, message, options = {}) {
  const channel = options.channel || 'default';
  console.log(`[openclaw-chat] sayToSession session="${sessionId}" channel=${channel} msg="${String(message).slice(0, 80)}"`);
  return {
    sent: true,
    sessionId,
    channel,
    messageId: `msg_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

async function waitForReply(sessionId, timeout, filter) {
  timeout = timeout || 30000;
  console.log(`[openclaw-chat] waitForReply session="${sessionId}" timeout=${timeout} filter=${filter || 'none'}`);
  return {
    reply: `Mock reply from session ${sessionId}`,
    sessionId,
    fromUser: 'mock_user',
    timestamp: new Date().toISOString(),
    timedOut: false
  };
}

async function spawnAgent(name, prompt, options = {}) {
  console.log(`[openclaw-chat] spawnAgent name="${name}" prompt="${String(prompt || '').slice(0, 80)}"`);
  return {
    agentId: `agent_${Date.now()}`,
    name,
    spawned: true,
    timestamp: new Date().toISOString()
  };
}

async function callSession(agentName, command, options = {}) {
  console.log(`[openclaw-chat] callSession agent="${agentName}" command="${String(command || '').slice(0, 80)}"`);
  return {
    agentName,
    reply: `Session response from ${agentName}: ${String(command || '').slice(0, 50)}`,
    timestamp: new Date().toISOString()
  };
}

module.exports = { sayToSession, waitForReply, spawnAgent, callSession };
