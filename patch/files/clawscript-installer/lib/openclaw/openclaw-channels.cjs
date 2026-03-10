'use strict';

async function send(target, message, options = {}) {
  const level = options.level || 'info';
  const channel = options.channel || 'default';
  console.log(`[openclaw-channels] send target="${target}" level=${level} msg="${String(message).slice(0, 80)}"`);

  return {
    sent: true,
    channel,
    target,
    level,
    messageId: `ch_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

module.exports = { send };
