#!/usr/bin/env node
"use strict";
const fs = require('fs/promises');
const path = require('path');

const SHARED_PATH = '/home/runner/workspace/.openclaw/sharedspace/btc-ticks.jsonl';
const LOG_PATH = path.join(process.cwd(), '../../.openclaw/btc-receiver-log.json');
const POLL_MS = 500;
const MAX_TICKS = 100;

let lastTs = 0;
let ticks = [];
let signals = [];

async function loadTicks() {
  try {
    const data = await fs.readFile(SHARED_PATH, 'utf8');
    const lines = data.trim().split('\\n').filter(Boolean);
    const newTicks = lines.slice(-MAX_TICKS).map(line => JSON.parse(line)).filter(t => t.ts > lastTs);
    if (newTicks.length) {
      lastTs = newTicks[newTicks.length - 1].ts;
      ticks = [...ticks, ...newTicks].slice(-MAX_TICKS);
      checkSignals(newTicks[newTicks.length - 1]);
      console.log(`RECEIVED ${newTicks.length} ticks. Latest: ${newTicks[newTicks.length - 1].price} EMA20: ${newTicks[newTicks.length - 1].ema20}`);
      fs.writeFile(LOG_PATH, JSON.stringify({ticks: ticks.slice(-5), signals, status: 'live'}));
    }
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('Poll err:', e);
  }
}

function checkSignals(tick) {
  const price = tick.price;
  const ema20 = parseFloat(tick.ema20);
  if (price > ema20 * 1.002) {
    signals.push({ts: tick.ts, signal: 'BREAKOUT_BUY', price, ema20});
    console.log('🚨 IG ARB: BTC breakout BUY @' + price);
  }
  if (price < ema20 * 0.998) {
    signals.push({ts: tick.ts, signal: 'DIP_SELL', price, ema20});
    console.log('🚨 IG ARB: BTC dip SELL @' + price);
  }
  if (signals.length > 10) signals = signals.slice(-10);
}

if (process.argv.includes('--test')) {
  console.log('TEST: Mock load');
  process.exit(0);
}

setInterval(loadTicks, POLL_MS);
console.log('Binance Receiver LIVE - polling SharedSpace btc-ticks.jsonl');
