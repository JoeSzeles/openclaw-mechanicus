const http = require('http');
const fs = require('fs');
const path = require('path');

const BRAIN_PORT = parseInt(process.env.BRAIN_PORT) || 0;
const DATA_DIR = path.join(process.env.HOME || '/home/runner', '.openclaw');
const PATTERNS_DIR = path.join(DATA_DIR, 'brain-patterns');
const BRAIN_STATE_FILE = path.join(DATA_DIR, 'brain-state.json');

try { fs.mkdirSync(PATTERNS_DIR, { recursive: true }); } catch (_) {}

const N_SENSORY = 100;
const N_INTER = 200;
const N_MOTOR = 50;
const N_TOTAL = N_SENSORY + N_INTER + N_MOTOR;
const DT = 1.0;
const V_REST = -52.0;
const V_THRESH = -45.0;
const V_RESET = -52.0;
const TAU_M = 20.0;
const TAU_SYN = 5.0;
const REFRAC_MS = 2.2;

let neurons = null;
let synapses = null;
let spikeHistory = [];
let stepCount = 0;
let isBooted = false;
let bootTime = null;
let currentParams = { w_syn: 0.275, r_poi: 150, tau_syn: TAU_SYN };
let trainingMode = false;
let trainingDirection = null;
let trainingFeedbackLog = [];
let patternMemory = {};
let server = null;
let actualPort = null;

function initNeurons() {
  neurons = new Float64Array(N_TOTAL * 4);
  for (let i = 0; i < N_TOTAL; i++) {
    neurons[i * 4 + 0] = V_REST;
    neurons[i * 4 + 1] = 0;
    neurons[i * 4 + 2] = 0;
    neurons[i * 4 + 3] = 0;
  }
}

function initSynapses() {
  synapses = [];
  const synPerNeuron = 15;
  for (let i = 0; i < N_SENSORY; i++) {
    for (let k = 0; k < synPerNeuron; k++) {
      const target = N_SENSORY + Math.floor(Math.random() * N_INTER);
      const w = (Math.random() * 0.5 + 0.1) * currentParams.w_syn;
      synapses.push({ pre: i, post: target, w: w, base_w: w });
    }
  }
  for (let i = N_SENSORY; i < N_SENSORY + N_INTER; i++) {
    for (let k = 0; k < synPerNeuron; k++) {
      const target = Math.random() < 0.3
        ? (N_SENSORY + N_INTER + Math.floor(Math.random() * N_MOTOR))
        : (N_SENSORY + Math.floor(Math.random() * N_INTER));
      const excitatory = Math.random() < 0.8;
      const w = (Math.random() * 0.4 + 0.05) * currentParams.w_syn * (excitatory ? 1 : -0.5);
      synapses.push({ pre: i, post: target, w: w, base_w: w });
    }
  }
  for (let i = N_SENSORY + N_INTER; i < N_TOTAL; i++) {
    for (let k = 0; k < 3; k++) {
      const target = N_SENSORY + Math.floor(Math.random() * N_INTER);
      const w = -0.2 * currentParams.w_syn;
      synapses.push({ pre: i, post: target, w: w, base_w: w });
    }
  }
}

function step(externalInput) {
  stepCount++;
  const spikes = [];
  const fired = new Uint8Array(N_TOTAL);

  if (externalInput) {
    for (const [neuronIdx, intensity] of externalInput) {
      if (neuronIdx >= 0 && neuronIdx < N_SENSORY) {
        const poissonRate = intensity * currentParams.r_poi / 100;
        if (Math.random() < poissonRate * DT / 1000) {
          neurons[neuronIdx * 4 + 1] += currentParams.w_syn * 250;
        }
      }
    }
  }

  for (let i = 0; i < N_TOTAL; i++) {
    const base = i * 4;
    const refrac = neurons[base + 3];
    if (refrac > 0) {
      neurons[base + 3] -= DT;
      continue;
    }
    const v = neurons[base + 0];
    const g = neurons[base + 1];
    const dv = (V_REST - v + g) / TAU_M * DT;
    const dg = -g / currentParams.tau_syn * DT;
    neurons[base + 0] = v + dv;
    neurons[base + 1] = g + dg;
    if (neurons[base + 0] > V_THRESH) {
      fired[i] = 1;
      spikes.push(i);
      neurons[base + 0] = V_RESET;
      neurons[base + 1] = 0;
      neurons[base + 3] = REFRAC_MS;
    }
  }

  for (const syn of synapses) {
    if (fired[syn.pre]) {
      neurons[syn.post * 4 + 1] += syn.w;
    }
  }

  spikeHistory.push({ step: stepCount, count: spikes.length, spikes: spikes.slice(0, 20) });
  if (spikeHistory.length > 500) spikeHistory.shift();

  return { spikes, spikeCount: spikes.length };
}

function getMotorRates() {
  const rates = {};
  const window = Math.min(spikeHistory.length, 10);
  if (window === 0) return { buy_signal: 0, sell_signal: 0, hold_signal: 0, avg_rate: 0, raw: {} };
  const motorStart = N_SENSORY + N_INTER;
  const buyNeurons = [];
  const sellNeurons = [];
  const holdNeurons = [];
  for (let m = 0; m < N_MOTOR; m++) {
    if (m < N_MOTOR / 3) buyNeurons.push(motorStart + m);
    else if (m < 2 * N_MOTOR / 3) sellNeurons.push(motorStart + m);
    else holdNeurons.push(motorStart + m);
  }
  let buyCount = 0, sellCount = 0, holdCount = 0, totalCount = 0;
  for (let i = spikeHistory.length - window; i < spikeHistory.length; i++) {
    const entry = spikeHistory[i];
    for (const s of entry.spikes) {
      if (buyNeurons.includes(s)) buyCount++;
      if (sellNeurons.includes(s)) sellCount++;
      if (holdNeurons.includes(s)) holdCount++;
      if (s >= motorStart) totalCount++;
    }
  }
  const scale = 1000 / (window * DT);
  return {
    buy_signal: buyCount * scale / buyNeurons.length,
    sell_signal: sellCount * scale / sellNeurons.length,
    hold_signal: holdCount * scale / holdNeurons.length,
    avg_rate: totalCount * scale / N_MOTOR,
    motor_rates: totalCount * scale / N_MOTOR,
    raw: { buy: buyCount, sell: sellCount, hold: holdCount, total: totalCount }
  };
}

function stimulateFromPrice(priceData) {
  const inputs = [];
  const { price, prevPrice, volume, spread, epic } = priceData;
  if (price && prevPrice) {
    const delta = price - prevPrice;
    const pctChange = Math.abs(delta / prevPrice) * 10000;
    for (let i = 0; i < 20; i++) {
      inputs.push([i, pctChange * (delta > 0 ? 1.5 : 0.5)]);
    }
    for (let i = 20; i < 40; i++) {
      inputs.push([i, pctChange * (delta < 0 ? 1.5 : 0.5)]);
    }
  }
  if (volume) {
    const volIntensity = Math.min(volume / 100, 200);
    for (let i = 40; i < 60; i++) {
      inputs.push([i, volIntensity]);
    }
  }
  if (spread) {
    const spreadIntensity = spread * 1000;
    for (let i = 60; i < 80; i++) {
      inputs.push([i, spreadIntensity]);
    }
  }
  const stepsToRun = 10;
  for (let s = 0; s < stepsToRun; s++) {
    step(inputs);
  }
  const rates = getMotorRates();
  if (epic) recordPattern(epic, price, rates);
  return rates;
}

function applyFeedback(type) {
  const modifier = type === 'sugar' ? 1.15 : 0.85;
  const motorStart = N_SENSORY + N_INTER;
  for (const syn of synapses) {
    if (syn.post >= motorStart) {
      if (type === 'sugar') {
        syn.w = syn.w * modifier;
      } else {
        syn.w = syn.w * modifier;
      }
      syn.w = Math.max(-2, Math.min(2, syn.w));
    }
  }
  trainingFeedbackLog.push({ ts: Date.now(), type, modifier, step: stepCount });
  if (trainingFeedbackLog.length > 1000) trainingFeedbackLog.shift();
  return { applied: type, modifier, synapses_affected: synapses.filter(s => s.post >= motorStart).length };
}

function recordPattern(epic, price, rates) {
  if (!patternMemory[epic]) patternMemory[epic] = { ticks: [], signals: [], learned_at: Date.now() };
  const mem = patternMemory[epic];
  mem.ticks.push({ ts: Date.now(), price, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });
  if (mem.ticks.length > 500) mem.ticks.shift();
  mem.last_price = price;
  mem.last_signal = rates;
  mem.tick_count = (mem.tick_count || 0) + 1;
}

function getPatterns() {
  const result = {};
  for (const [epic, mem] of Object.entries(patternMemory)) {
    result[epic] = {
      tick_count: mem.tick_count || 0,
      last_price: mem.last_price,
      last_signal: mem.last_signal,
      learned_at: mem.learned_at,
      recent_ticks: (mem.ticks || []).slice(-20),
    };
  }
  return result;
}

function exportPatternsCSV(epic) {
  const mem = patternMemory[epic];
  if (!mem || !mem.ticks.length) return 'timestamp,price,buy_signal,sell_signal,hold_signal\n';
  let csv = 'timestamp,price,buy_signal,sell_signal,hold_signal\n';
  for (const t of mem.ticks) {
    csv += `${new Date(t.ts).toISOString()},${t.price},${t.buy.toFixed(4)},${t.sell.toFixed(4)},${t.hold.toFixed(4)}\n`;
  }
  return csv;
}

function saveState() {
  try {
    const state = {
      stepCount,
      currentParams,
      patternMemory,
      trainingFeedbackLog: trainingFeedbackLog.slice(-100),
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(BRAIN_STATE_FILE, JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    if (fs.existsSync(BRAIN_STATE_FILE)) {
      const state = JSON.parse(fs.readFileSync(BRAIN_STATE_FILE, 'utf8'));
      if (state.currentParams) currentParams = { ...currentParams, ...state.currentParams };
      if (state.patternMemory) patternMemory = state.patternMemory;
      if (state.trainingFeedbackLog) trainingFeedbackLog = state.trainingFeedbackLog;
      console.log('[brain-engine] Restored state: ' + (state.stepCount || 0) + ' steps, ' + Object.keys(patternMemory).length + ' instruments');
    }
  } catch (_) {}
}

function boot() {
  loadState();
  initNeurons();
  initSynapses();
  isBooted = true;
  bootTime = Date.now();
  stepCount = 0;
  spikeHistory = [];
  console.log('[brain-engine] Booted: ' + N_TOTAL + ' neurons, ' + synapses.length + ' synapses');
  return {
    loaded: true,
    neurons_count: N_TOTAL,
    synapses_count: synapses.length,
    regions: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
    boot_time_ms: 0,
    step_count: 0,
  };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); }
    });
  });
}

function respond(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const m = req.method;

  if (m === 'OPTIONS') return respond(res, 200, {});

  if (m === 'GET' && p === '/status') {
    return respond(res, 200, {
      loaded: isBooted,
      boot_time_ms: bootTime ? Date.now() - bootTime : null,
      step_count: stepCount,
      neurons_count: N_TOTAL,
      synapses_count: synapses ? synapses.length : 0,
      running: isBooted,
      regions: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
      params: currentParams,
      patterns: Object.keys(patternMemory).length,
      training_mode: trainingMode,
    });
  }

  if (m === 'GET' && p === '/') {
    return respond(res, 200, { status: 'BrainJar Neural Engine (Node.js)', version: '2.0', booted: isBooted, port: actualPort });
  }

  if (m === 'POST' && p === '/boot') {
    const result = boot();
    return respond(res, 200, result);
  }

  if (m === 'POST' && p === '/stimulate') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const neuronIds = body.neuron_ids || [];
    const intensity = body.intensity || 100;
    const inputs = neuronIds.map((id, idx) => [idx % N_SENSORY, intensity]);
    const stepsToRun = body.steps || 10;
    for (let s = 0; s < stepsToRun; s++) step(inputs);
    const rates = getMotorRates();
    return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
  }

  if (m === 'POST' && p === '/stimulate-price') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const rates = stimulateFromPrice(body);
    return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
  }

  if (m === 'GET' && p === '/observe') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    for (let s = 0; s < 5; s++) step(null);
    const rates = getMotorRates();
    return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
  }

  if (m === 'POST' && p === '/config') {
    const body = await parseBody(req);
    if (body.w_syn !== undefined) currentParams.w_syn = body.w_syn;
    if (body.r_poi !== undefined) currentParams.r_poi = body.r_poi;
    if (body.tau_syn !== undefined) currentParams.tau_syn = body.tau_syn;
    return respond(res, 200, { ok: true, params: currentParams });
  }

  if (m === 'POST' && p === '/feedback') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const type = body.type || 'sugar';
    const result = applyFeedback(type);
    return respond(res, 200, result);
  }

  if (m === 'POST' && p === '/training') {
    const body = await parseBody(req);
    trainingMode = body.enabled !== false;
    trainingDirection = body.direction || null;
    return respond(res, 200, { training_mode: trainingMode, direction: trainingDirection });
  }

  if (m === 'GET' && p === '/patterns') {
    return respond(res, 200, getPatterns());
  }

  if (m === 'GET' && p === '/patterns/csv') {
    const epic = url.searchParams.get('epic') || '';
    const csv = exportPatternsCSV(epic);
    res.writeHead(200, { 'Content-Type': 'text/csv', 'Access-Control-Allow-Origin': '*' });
    return res.end(csv);
  }

  if (m === 'GET' && p === '/history') {
    return respond(res, 200, { spike_history: spikeHistory.slice(-50), feedback_log: trainingFeedbackLog.slice(-50) });
  }

  if (m === 'POST' && p === '/restart') {
    saveState();
    isBooted = false;
    bootTime = null;
    neurons = null;
    synapses = null;
    spikeHistory = [];
    stepCount = 0;
    return respond(res, 200, { message: 'Brain restarted' });
  }

  if (m === 'POST' && p === '/save') {
    saveState();
    return respond(res, 200, { ok: true, saved_at: new Date().toISOString() });
  }

  respond(res, 404, { error: 'Not found: ' + p });
}

function startServer(callback) {
  server = http.createServer(handleRequest);
  server.listen(BRAIN_PORT, '127.0.0.1', () => {
    actualPort = server.address().port;
    console.log('[brain-engine] Server listening on 127.0.0.1:' + actualPort);
    try { fs.writeFileSync(path.join(DATA_DIR, 'brain-engine-port'), String(actualPort)); } catch (_) {}
    try {
      const wsDir = path.join(process.env.OPENCLAW_HOME || process.cwd(), '.openclaw');
      fs.mkdirSync(wsDir, { recursive: true });
      fs.writeFileSync(path.join(wsDir, 'brain-engine-port'), String(actualPort));
    } catch (_) {}
    const result = boot();
    console.log('[brain-engine] Auto-booted: ' + result.neurons_count + ' neurons, ' + result.synapses_count + ' synapses');
    setInterval(saveState, 60000);
    if (callback) callback(actualPort);
  });
  server.on('error', (e) => {
    console.error('[brain-engine] Server error:', e.message);
  });
  return server;
}

function getPort() { return actualPort; }
function getServer() { return server; }

if (require.main === module) {
  startServer();
}

module.exports = { startServer, getPort, getServer, boot, step, getMotorRates, stimulateFromPrice, applyFeedback };
