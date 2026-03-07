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

module.exports = { sayToSession, waitForReply };
