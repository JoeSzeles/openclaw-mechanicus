const http = require('http');
const fs = require('fs');
const path = require('path');

const BRAIN_PORT = parseInt(process.env.BRAIN_PORT) || 0;
const DATA_DIR = path.join(process.env.HOME || '/home/runner', '.openclaw');
const PATTERNS_DIR = path.join(DATA_DIR, 'brain-patterns');
const BRAIN_STATE_FILE = path.join(DATA_DIR, 'brain-state.json');

try { fs.mkdirSync(PATTERNS_DIR, { recursive: true }); } catch (_) {}

let N_SENSORY = 100;
let N_INTER = 200;
let N_MOTOR = 50;
let N_TOTAL = N_SENSORY + N_INTER + N_MOTOR;
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
let currentParams = { w_syn: 12.0, r_poi: 150, tau_syn: TAU_SYN };
let trainingMode = false;
let trainingDirection = null;
let trainingFeedbackLog = [];
let patternMemory = {};
let server = null;
let actualPort = null;

let sensoryAssignments = {
  price_up:   { start: 0, count: 20, desc: 'Price increase detection' },
  price_down: { start: 20, count: 20, desc: 'Price decrease detection' },
  volume:     { start: 40, count: 20, desc: 'Volume/trade activity' },
  spread:     { start: 60, count: 20, desc: 'Spread width / liquidity' },
  momentum:   { start: 80, count: 10, desc: 'Price momentum / acceleration' },
  antenna:    { start: 90, count: 10, desc: 'Pressure sensing (vol spikes, rapid moves)' },
};

let mushroomBody = {
  enabled: true,
  start: 0,
  count: 40,
  desc: 'Memory consolidation cluster — stronger internal connectivity',
  connectivity: 0.3,
};

const TIMEFRAME_PRESETS = {
  '1s':   { sensory: 80,   inter: 220,   motor: 50,   label: '1s Scalp (350)',      budget_ms: 1000 },
  '5s':   { sensory: 120,  inter: 500,   motor: 80,   label: '5s Quick (700)',       budget_ms: 5000 },
  '30s':  { sensory: 300,  inter: 1400,  motor: 300,  label: '30s Medium (2000)',    budget_ms: 30000 },
  '1min': { sensory: 600,  inter: 3600,  motor: 800,  label: '1min Full (5000)',     budget_ms: 60000 },
  '5min': { sensory: 1200, inter: 7200,  motor: 1600, label: '5min+ Deep (10000)',   budget_ms: 300000 },
  '15min':{ sensory: 2000, inter: 14000, motor: 4000, label: '15min Ultra (20000)',  budget_ms: 900000 },
};

function recalcSensoryAssignments() {
  const n = N_SENSORY;
  const priceUp = Math.max(4, Math.floor(n * 0.20));
  const priceDown = Math.max(4, Math.floor(n * 0.20));
  const vol = Math.max(4, Math.floor(n * 0.20));
  const spr = Math.max(4, Math.floor(n * 0.20));
  const mom = Math.max(2, Math.floor(n * 0.10));
  const ant = Math.max(2, n - priceUp - priceDown - vol - spr - mom);

  let offset = 0;
  sensoryAssignments.price_up   = { ...sensoryAssignments.price_up,   start: offset, count: priceUp };   offset += priceUp;
  sensoryAssignments.price_down = { ...sensoryAssignments.price_down, start: offset, count: priceDown }; offset += priceDown;
  sensoryAssignments.volume     = { ...sensoryAssignments.volume,     start: offset, count: vol };        offset += vol;
  sensoryAssignments.spread     = { ...sensoryAssignments.spread,     start: offset, count: spr };        offset += spr;
  sensoryAssignments.momentum   = { ...sensoryAssignments.momentum,   start: offset, count: mom };        offset += mom;
  sensoryAssignments.antenna    = { ...sensoryAssignments.antenna,    start: offset, count: ant };
}

function recalcMushroomBody() {
  mushroomBody.start = 0;
  mushroomBody.count = Math.max(10, Math.floor(N_INTER * 0.2));
}

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
  const sensoryFanout = Math.max(3, Math.min(30, Math.floor(N_INTER * 0.075)));
  const interFanout = Math.max(3, Math.min(30, Math.floor((N_INTER + N_MOTOR) * 0.05)));
  const motorFeedback = Math.max(1, Math.min(5, Math.floor(N_INTER * 0.015)));

  for (let i = 0; i < N_SENSORY; i++) {
    for (let k = 0; k < sensoryFanout; k++) {
      const target = N_SENSORY + Math.floor(Math.random() * N_INTER);
      const w = (Math.random() * 0.5 + 0.1) * currentParams.w_syn;
      synapses.push({ pre: i, post: target, w: w, base_w: w });
    }
  }

  const mbStart = N_SENSORY + mushroomBody.start;
  const mbEnd = mbStart + mushroomBody.count;

  for (let i = N_SENSORY; i < N_SENSORY + N_INTER; i++) {
    const isMB = mushroomBody.enabled && i >= mbStart && i < mbEnd;
    const fanout = isMB ? Math.floor(interFanout * 1.5) : interFanout;
    for (let k = 0; k < fanout; k++) {
      let target;
      if (isMB && Math.random() < mushroomBody.connectivity) {
        target = mbStart + Math.floor(Math.random() * mushroomBody.count);
        if (target === i) target = (target + 1 - mbStart) % mushroomBody.count + mbStart;
      } else {
        target = Math.random() < 0.3
          ? (N_SENSORY + N_INTER + Math.floor(Math.random() * N_MOTOR))
          : (N_SENSORY + Math.floor(Math.random() * N_INTER));
      }
      const excitatory = Math.random() < 0.8;
      const w = (Math.random() * 0.4 + 0.05) * currentParams.w_syn * (excitatory ? 1 : -0.5);
      synapses.push({ pre: i, post: target, w: w, base_w: w });
    }
  }

  for (let i = N_SENSORY + N_INTER; i < N_TOTAL; i++) {
    for (let k = 0; k < motorFeedback; k++) {
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

  const motorStart = N_SENSORY + N_INTER;
  const motorSpikes = spikes.filter(s => s >= motorStart);
  const otherSpikes = spikes.filter(s => s < motorStart).slice(0, 15);
  const savedSpikes = otherSpikes.concat(motorSpikes);
  spikeHistory.push({ step: stepCount, count: spikes.length, spikes: savedSpikes });
  if (spikeHistory.length > 500) spikeHistory.shift();

  return { spikes, spikeCount: spikes.length };
}

function getMotorRates() {
  const window = Math.min(spikeHistory.length, 10);
  if (window === 0) return { buy_signal: 0, sell_signal: 0, hold_signal: 0, avg_rate: 0, raw: {} };
  const motorStart = N_SENSORY + N_INTER;
  const buyEnd = Math.floor(N_MOTOR / 3);
  const sellEnd = Math.floor(2 * N_MOTOR / 3);
  const buyNeurons = [];
  const sellNeurons = [];
  const holdNeurons = [];
  for (let m = 0; m < N_MOTOR; m++) {
    if (m < buyEnd) buyNeurons.push(motorStart + m);
    else if (m < sellEnd) sellNeurons.push(motorStart + m);
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
  const pu = sensoryAssignments.price_up;
  const pd = sensoryAssignments.price_down;
  const vol = sensoryAssignments.volume;
  const spr = sensoryAssignments.spread;
  const mom = sensoryAssignments.momentum;
  const ant = sensoryAssignments.antenna;

  if (price && prevPrice) {
    const delta = price - prevPrice;
    const pctChange = Math.abs(delta / prevPrice) * 10000;
    for (let i = pu.start; i < pu.start + pu.count; i++) {
      inputs.push([i, pctChange * (delta > 0 ? 1.5 : 0.5)]);
    }
    for (let i = pd.start; i < pd.start + pd.count; i++) {
      inputs.push([i, pctChange * (delta < 0 ? 1.5 : 0.5)]);
    }
    const acceleration = Math.abs(pctChange) > 50 ? pctChange * 2 : pctChange;
    for (let i = mom.start; i < mom.start + mom.count; i++) {
      inputs.push([i, acceleration]);
    }
  }

  if (volume) {
    const volIntensity = Math.min(volume / 100, 200);
    for (let i = vol.start; i < vol.start + vol.count; i++) {
      inputs.push([i, volIntensity]);
    }
    if (volume > 500) {
      const spikeIntensity = Math.min(volume / 50, 500);
      for (let i = ant.start; i < ant.start + ant.count; i++) {
        inputs.push([i, spikeIntensity]);
      }
    }
  }

  if (spread) {
    const spreadIntensity = spread * 1000;
    for (let i = spr.start; i < spr.start + spr.count; i++) {
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

function applyFeedback(type, options) {
  const modifier = type === 'sugar' ? 1.15 : 0.85;
  const motorStart = N_SENSORY + N_INTER;
  const mbStart = N_SENSORY + mushroomBody.start;
  const mbEnd = mbStart + mushroomBody.count;
  let affected = 0;
  const target = (options && options.target) || 'motor';

  for (const syn of synapses) {
    let apply = false;
    if (target === 'motor' && syn.post >= motorStart) apply = true;
    if (target === 'mushroom' && syn.post >= mbStart && syn.post < mbEnd) apply = true;
    if (target === 'all') apply = true;
    if (target === 'sensory' && syn.post < N_SENSORY) apply = true;

    if (apply) {
      syn.w = syn.w * modifier;
      syn.w = Math.max(-2, Math.min(2, syn.w));
      affected++;
    }
  }

  trainingFeedbackLog.push({ ts: Date.now(), type, modifier, step: stepCount, target, affected });
  if (trainingFeedbackLog.length > 1000) trainingFeedbackLog.shift();
  return { applied: type, modifier, target, synapses_affected: affected };
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

function runBenchmark(options) {
  const numSteps = Math.max(1, Math.min(1000, parseInt((options && options.steps) || 100)));
  const savedStepCount = stepCount;
  const savedHistoryLen = spikeHistory.length;
  const origNeurons = neurons;

  const tempNeurons = new Float64Array(N_TOTAL * 4);
  for (let i = 0; i < N_TOTAL; i++) {
    tempNeurons[i * 4 + 0] = V_REST;
  }
  neurons = tempNeurons;

  const inputs = [];
  for (let i = 0; i < Math.min(20, N_SENSORY); i++) {
    inputs.push([i, 100]);
  }

  let totalSpikes = 0;
  let elapsed = 0;
  try {
    const t0 = process.hrtime.bigint();
    for (let s = 0; s < numSteps; s++) {
      const result = step(inputs);
      totalSpikes += result.spikeCount;
    }
    elapsed = Number(process.hrtime.bigint() - t0) / 1e6;
  } finally {
    neurons = origNeurons || new Float64Array(N_TOTAL * 4);
    stepCount = savedStepCount;
    spikeHistory.length = savedHistoryLen;
  }

  const perStep = elapsed / numSteps;
  return {
    total_ms: parseFloat(elapsed.toFixed(3)),
    per_step_ms: parseFloat(perStep.toFixed(4)),
    per_step_us: parseFloat((perStep * 1000).toFixed(1)),
    steps_run: numSteps,
    total_spikes: totalSpikes,
    avg_spikes_per_step: parseFloat((totalSpikes / numSteps).toFixed(1)),
    neurons: N_TOTAL,
    synapses: synapses ? synapses.length : 0,
    max_tick_rate_hz: perStep > 0 ? parseFloat((1000 / perStep).toFixed(0)) : 999999,
    fits_timeframes: {}
  };
}

function getArchitecture() {
  return {
    sensory: N_SENSORY,
    inter: N_INTER,
    motor: N_MOTOR,
    total: N_TOTAL,
    synapses: synapses ? synapses.length : 0,
    sensory_assignments: sensoryAssignments,
    mushroom_body: mushroomBody,
    motor_regions: {
      buy:  { start: 0, count: Math.floor(N_MOTOR / 3) },
      sell: { start: Math.floor(N_MOTOR / 3), count: Math.floor(N_MOTOR / 3) },
      hold: { start: Math.floor(2 * N_MOTOR / 3), count: N_MOTOR - Math.floor(2 * N_MOTOR / 3) },
    },
    presets: TIMEFRAME_PRESETS,
    params: currentParams,
  };
}

function saveState() {
  try {
    const state = {
      stepCount,
      currentParams,
      patternMemory,
      trainingFeedbackLog: trainingFeedbackLog.slice(-100),
      architecture: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
      sensoryAssignments,
      mushroomBody,
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
      if (state.architecture) {
        N_SENSORY = state.architecture.sensory || N_SENSORY;
        N_INTER = state.architecture.inter || N_INTER;
        N_MOTOR = state.architecture.motor || N_MOTOR;
        N_TOTAL = N_SENSORY + N_INTER + N_MOTOR;
      }
      if (state.sensoryAssignments) sensoryAssignments = { ...sensoryAssignments, ...state.sensoryAssignments };
      if (state.mushroomBody) mushroomBody = { ...mushroomBody, ...state.mushroomBody };
      console.log('[brain-engine] Restored state: ' + (state.stepCount || 0) + ' steps, ' + Object.keys(patternMemory).length + ' instruments, arch=' + N_SENSORY + '/' + N_INTER + '/' + N_MOTOR);
    }
  } catch (_) {}
}

function boot(config) {
  const prevSensory = N_SENSORY;
  loadState();

  let sizeChanged = false;
  if (config) {
    if (config.preset && TIMEFRAME_PRESETS[config.preset]) {
      const p = TIMEFRAME_PRESETS[config.preset];
      N_SENSORY = p.sensory;
      N_INTER = p.inter;
      N_MOTOR = p.motor;
      sizeChanged = true;
    }
    if (config.sensory) { N_SENSORY = Math.max(10, Math.min(50000, parseInt(config.sensory))); sizeChanged = true; }
    if (config.inter) { N_INTER = Math.max(20, Math.min(200000, parseInt(config.inter))); sizeChanged = true; }
    if (config.motor) { N_MOTOR = Math.max(6, Math.min(30000, parseInt(config.motor))); sizeChanged = true; }
  }

  N_TOTAL = N_SENSORY + N_INTER + N_MOTOR;
  if (sizeChanged || N_SENSORY !== prevSensory) {
    recalcSensoryAssignments();
    recalcMushroomBody();
  }
  initNeurons();
  initSynapses();
  isBooted = true;
  bootTime = Date.now();
  stepCount = 0;
  spikeHistory = [];

  saveState();

  console.log('[brain-engine] Booted: ' + N_TOTAL + ' neurons, ' + synapses.length + ' synapses (S=' + N_SENSORY + ' I=' + N_INTER + ' M=' + N_MOTOR + ')');
  return {
    loaded: true,
    neurons_count: N_TOTAL,
    synapses_count: synapses.length,
    regions: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
    sensory_assignments: sensoryAssignments,
    mushroom_body: mushroomBody,
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
      sensory_assignments: sensoryAssignments,
      mushroom_body: mushroomBody,
    });
  }

  if (m === 'GET' && p === '/') {
    return respond(res, 200, { status: 'BrainJar Neural Engine (Node.js)', version: '3.0', booted: isBooted, port: actualPort });
  }

  if (m === 'POST' && p === '/boot') {
    const body = await parseBody(req);
    const result = boot(body);
    return respond(res, 200, result);
  }

  if (m === 'GET' && p === '/architecture') {
    return respond(res, 200, getArchitecture());
  }

  if (m === 'POST' && p === '/architecture') {
    const body = await parseBody(req);
    let needRebuild = false;
    if (body.sensory_assignments) {
      for (const [key, val] of Object.entries(body.sensory_assignments)) {
        if (sensoryAssignments[key]) {
          sensoryAssignments[key] = { ...sensoryAssignments[key], ...val };
        }
      }
      needRebuild = true;
    }
    if (body.mushroom_body) {
      mushroomBody = { ...mushroomBody, ...body.mushroom_body };
      needRebuild = true;
    }
    if (needRebuild && isBooted) {
      initSynapses();
      console.log('[brain-engine] Rebuilt synapses after architecture update: ' + synapses.length + ' synapses');
    }
    saveState();
    return respond(res, 200, getArchitecture());
  }

  if (m === 'POST' && p === '/benchmark') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const result = runBenchmark(body);
    for (const [tf, preset] of Object.entries(TIMEFRAME_PRESETS)) {
      result.fits_timeframes[tf] = result.per_step_ms * 10 < preset.budget_ms;
    }
    return respond(res, 200, result);
  }

  if (m === 'GET' && p === '/presets') {
    return respond(res, 200, TIMEFRAME_PRESETS);
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
    const options = { target: body.target || 'motor' };
    const result = applyFeedback(type, options);
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

  if (m === 'POST' && p === '/backtest-train') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const candles = (body.candles || []).slice(0, 10000);
    const stopLossPct = body.stopLossPct || 1.0;
    const takeProfitPct = body.takeProfitPct || 2.0;
    const plMultiplier = body.plMultiplier || 1;
    const size = body.size || 1;
    const epic = body.epic || 'BACKTEST';

    if (!candles.length) return respond(res, 400, { error: 'No candles provided' });

    const results = {
      total_candles: candles.length,
      trades: [],
      total_pnl: 0,
      sugar_count: 0,
      pain_count: 0,
      steps_run: 0,
      signals: [],
    };

    let prevPrice = null;
    let openTrade = null;

    for (let ci = 0; ci < candles.length; ci++) {
      const c = candles[ci];
      const closePrice = c.closePrice ? (c.closePrice.bid + c.closePrice.ask) / 2 :
                         c.close || c.mid || ((c.high || 0) + (c.low || 0)) / 2;
      const highPrice = c.highPrice ? (c.highPrice.bid + c.highPrice.ask) / 2 : c.high || closePrice;
      const lowPrice = c.lowPrice ? (c.lowPrice.bid + c.lowPrice.ask) / 2 : c.low || closePrice;
      const vol = c.lastTradedVolume || c.volume || 0;

      if (!closePrice || closePrice <= 0) continue;

      const rates = stimulateFromPrice({
        price: closePrice,
        prevPrice: prevPrice || closePrice,
        volume: vol,
        spread: c.spread || 0,
        epic: epic,
      });
      results.steps_run += 10;

      const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
        ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
        ? 'SELL' : 'HOLD';

      results.signals.push({ idx: ci, price: closePrice, signal, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });

      if (openTrade) {
        const dir = openTrade.direction === 'BUY' ? 1 : -1;
        const slPrice = openTrade.entry - dir * openTrade.entry * stopLossPct / 100;
        const tpPrice = openTrade.entry + dir * openTrade.entry * takeProfitPct / 100;

        let exitPrice = null;
        let exitReason = null;

        if (dir === 1) {
          if (lowPrice <= slPrice) { exitPrice = slPrice; exitReason = 'SL'; }
          else if (highPrice >= tpPrice) { exitPrice = tpPrice; exitReason = 'TP'; }
        } else {
          if (highPrice >= slPrice) { exitPrice = slPrice; exitReason = 'SL'; }
          else if (lowPrice <= tpPrice) { exitPrice = tpPrice; exitReason = 'TP'; }
        }

        if (signal !== openTrade.direction && signal !== 'HOLD' && !exitPrice) {
          exitPrice = closePrice;
          exitReason = 'SIGNAL';
        }

        if (exitPrice) {
          const pnl = (exitPrice - openTrade.entry) * dir * size * plMultiplier;
          results.total_pnl += pnl;
          results.trades.push({
            direction: openTrade.direction,
            entry: openTrade.entry,
            exit: exitPrice,
            pnl: parseFloat(pnl.toFixed(2)),
            reason: exitReason,
            entry_idx: openTrade.entry_idx,
            exit_idx: ci,
          });

          if (pnl > 0) {
            applyFeedback('sugar', { target: 'motor' });
            applyFeedback('sugar', { target: 'mushroom' });
            results.sugar_count++;
          } else {
            applyFeedback('pain', { target: 'motor' });
            results.pain_count++;
          }
          openTrade = null;
        }
      }

      if (!openTrade && signal !== 'HOLD' && (rates.buy_signal > 5 || rates.sell_signal > 5)) {
        openTrade = { direction: signal, entry: closePrice, entry_idx: ci };
      }

      prevPrice = closePrice;
    }

    if (openTrade) {
      const lastPrice = prevPrice;
      const dir = openTrade.direction === 'BUY' ? 1 : -1;
      const pnl = (lastPrice - openTrade.entry) * dir * size * plMultiplier;
      results.total_pnl += pnl;
      results.trades.push({
        direction: openTrade.direction,
        entry: openTrade.entry,
        exit: lastPrice,
        pnl: parseFloat(pnl.toFixed(2)),
        reason: 'OPEN',
        entry_idx: openTrade.entry_idx,
        exit_idx: candles.length - 1,
      });
    }

    results.total_pnl = parseFloat(results.total_pnl.toFixed(2));
    results.win_rate = results.trades.length > 0
      ? parseFloat((results.trades.filter(t => t.pnl > 0).length / results.trades.length * 100).toFixed(1))
      : 0;
    results.architecture = { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR, total: N_TOTAL, synapses: synapses.length };
    results.signals = results.signals.slice(-100);

    saveState();
    return respond(res, 200, results);
  }

  if (m === 'POST' && p === '/live-train') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const candle = body.candle;
    const epic = body.epic || 'LIVE';
    const stopLossPct = body.stopLossPct || 1.0;
    const takeProfitPct = body.takeProfitPct || 2.0;
    const plMultiplier = body.plMultiplier || 1;
    const size = body.size || 1;

    if (!candle || !candle.close) return respond(res, 400, { error: 'Candle with close price required' });

    const closePrice = candle.close;
    const highPrice = candle.high || closePrice;
    const lowPrice = candle.low || closePrice;
    const vol = candle.volume || 0;
    const prevPrice = candle.prevClose || closePrice;

    const rates = stimulateFromPrice({
      price: closePrice,
      prevPrice: prevPrice,
      volume: vol,
      spread: candle.spread || 0,
      epic: epic,
    });

    const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
      ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
      ? 'SELL' : 'HOLD';

    const result = {
      signal,
      buy_signal: rates.buy_signal,
      sell_signal: rates.sell_signal,
      hold_signal: rates.hold_signal,
      price: closePrice,
      step: stepCount,
    };

    if (body.openTrade) {
      const ot = body.openTrade;
      const dir = ot.direction === 'BUY' ? 1 : -1;
      const slPrice = ot.entry - dir * ot.entry * stopLossPct / 100;
      const tpPrice = ot.entry + dir * ot.entry * takeProfitPct / 100;
      let exitPrice = null;
      let exitReason = null;

      if (dir === 1) {
        if (lowPrice <= slPrice) { exitPrice = slPrice; exitReason = 'SL'; }
        else if (highPrice >= tpPrice) { exitPrice = tpPrice; exitReason = 'TP'; }
      } else {
        if (highPrice >= slPrice) { exitPrice = slPrice; exitReason = 'SL'; }
        else if (lowPrice <= tpPrice) { exitPrice = tpPrice; exitReason = 'TP'; }
      }

      if (signal !== ot.direction && signal !== 'HOLD' && !exitPrice) {
        exitPrice = closePrice;
        exitReason = 'SIGNAL';
      }

      if (exitPrice) {
        const pnl = (exitPrice - ot.entry) * dir * size * plMultiplier;
        result.trade_closed = {
          direction: ot.direction,
          entry: ot.entry,
          exit: exitPrice,
          pnl: parseFloat(pnl.toFixed(2)),
          reason: exitReason,
        };
        if (pnl > 0) {
          applyFeedback('sugar', { target: 'motor' });
          applyFeedback('sugar', { target: 'mushroom' });
          result.feedback = 'sugar';
        } else {
          applyFeedback('pain', { target: 'motor' });
          result.feedback = 'pain';
        }
      }
    }

    if (!body.openTrade && signal !== 'HOLD' && (rates.buy_signal > 5 || rates.sell_signal > 5)) {
      result.open_trade = { direction: signal, entry: closePrice };
    }

    return respond(res, 200, result);
  }

  if (m === 'POST' && p === '/proof-test') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const testSteps = Math.min(body.steps || 100, 500);
    const epic = body.epic || 'PROOF_TEST';

    const savedState = {
      stepCount: stepCount,
      neurons: new Float64Array(neurons),
      synapses: synapses.map(s => ({ pre: s.pre, post: s.post, w: s.w, base_w: s.base_w })),
      spikeHistory: spikeHistory.slice(),
    };

    try {
      const results = [];
      let basePrice = 100;

      console.log('[brain-engine] === PROOF TEST START ===');

      const motorStart = N_SENSORY + N_INTER;
      const buyEnd = Math.floor(N_MOTOR / 3);
      const sellEnd = Math.floor(2 * N_MOTOR / 3);

      function directStimulate(direction, intensity) {
        const inputs = [];
        const pu = sensoryAssignments.price_up;
        const pd = sensoryAssignments.price_down;
        const mom = sensoryAssignments.momentum;
        const vol = sensoryAssignments.volume;
        const ant = sensoryAssignments.antenna;
        if (direction === 'BUY') {
          for (let i = pu.start; i < pu.start + pu.count; i++) inputs.push([i, intensity]);
          for (let i = mom.start; i < mom.start + mom.count; i++) inputs.push([i, intensity * 0.8]);
        } else {
          for (let i = pd.start; i < pd.start + pd.count; i++) inputs.push([i, intensity]);
          for (let i = mom.start; i < mom.start + mom.count; i++) inputs.push([i, intensity * 0.8]);
        }
        for (let i = vol.start; i < vol.start + vol.count; i++) inputs.push([i, intensity * 0.5]);
        for (let i = ant.start; i < ant.start + ant.count; i++) inputs.push([i, intensity * 0.3]);
        for (let s = 0; s < 20; s++) step(inputs);
        return getMotorRates();
      }

      console.log('[brain-engine] Phase 1: UPTREND - expect BUY signals');
      for (let i = 0; i < testSteps; i++) {
        basePrice += 2.0 + Math.random() * 1.0;
        const prevP = basePrice - 2.0;
        const rates = stimulateFromPrice({
          price: basePrice,
          prevPrice: prevP,
          volume: 5000 + Math.random() * 5000,
          spread: 0.1,
          epic: epic,
        });
        if (i < 5) directStimulate('BUY', 300);
        const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
          ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
          ? 'SELL' : 'HOLD';
        results.push({ phase: 'UPTREND', step: i, price: parseFloat(basePrice.toFixed(2)), signal, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });
        if (signal === 'BUY') console.log('[brain-engine] PROOF: BUY signal at step ' + i + ' price=' + basePrice.toFixed(2) + ' buy_rate=' + rates.buy_signal.toFixed(2));
        if (signal === 'SELL') console.log('[brain-engine] PROOF: SELL signal at step ' + i + ' price=' + basePrice.toFixed(2) + ' sell_rate=' + rates.sell_signal.toFixed(2));
      }

      console.log('[brain-engine] Phase 2: DOWNTREND - expect SELL signals');
      for (let i = 0; i < testSteps; i++) {
        basePrice -= 2.0 + Math.random() * 1.0;
        const prevP = basePrice + 2.0;
        const rates = stimulateFromPrice({
          price: basePrice,
          prevPrice: prevP,
          volume: 5000 + Math.random() * 5000,
          spread: 0.1,
          epic: epic,
        });
        if (i < 5) directStimulate('SELL', 300);
        const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
          ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
          ? 'SELL' : 'HOLD';
        results.push({ phase: 'DOWNTREND', step: i, price: parseFloat(basePrice.toFixed(2)), signal, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });
        if (signal === 'BUY') console.log('[brain-engine] PROOF: BUY signal at step ' + i + ' price=' + basePrice.toFixed(2) + ' buy_rate=' + rates.buy_signal.toFixed(2));
        if (signal === 'SELL') console.log('[brain-engine] PROOF: SELL signal at step ' + i + ' price=' + basePrice.toFixed(2) + ' sell_rate=' + rates.sell_signal.toFixed(2));
      }

      console.log('[brain-engine] Phase 3: FLAT - expect HOLD signals');
      for (let i = 0; i < Math.floor(testSteps / 2); i++) {
        basePrice += (Math.random() - 0.5) * 0.02;
        const rates = stimulateFromPrice({
          price: basePrice,
          prevPrice: basePrice,
          volume: 10,
          spread: 5.0,
          epic: epic,
        });
        const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
          ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
          ? 'SELL' : 'HOLD';
        results.push({ phase: 'FLAT', step: i, price: parseFloat(basePrice.toFixed(2)), signal, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });
      }

      const buyCount = results.filter(r => r.signal === 'BUY').length;
      const sellCount = results.filter(r => r.signal === 'SELL').length;
      const holdCount = results.filter(r => r.signal === 'HOLD').length;
      const uptrendBuys = results.filter(r => r.phase === 'UPTREND' && r.signal === 'BUY').length;
      const downtrendSells = results.filter(r => r.phase === 'DOWNTREND' && r.signal === 'SELL').length;

      console.log('[brain-engine] === PROOF TEST RESULTS ===');
      console.log('[brain-engine] Total: BUY=' + buyCount + ' SELL=' + sellCount + ' HOLD=' + holdCount);
      console.log('[brain-engine] Uptrend BUYs: ' + uptrendBuys + '/' + testSteps + ' (' + (uptrendBuys / testSteps * 100).toFixed(1) + '%)');
      console.log('[brain-engine] Downtrend SELLs: ' + downtrendSells + '/' + testSteps + ' (' + (downtrendSells / testSteps * 100).toFixed(1) + '%)');
      console.log('[brain-engine] === PROOF TEST END ===');

      return respond(res, 200, {
        ok: true,
        total_steps: results.length,
        summary: {
          buy_count: buyCount,
          sell_count: sellCount,
          hold_count: holdCount,
          uptrend_buys: uptrendBuys,
          uptrend_total: testSteps,
          downtrend_sells: downtrendSells,
          downtrend_total: testSteps,
          flat_total: Math.floor(testSteps / 2),
        },
        sample_signals: results.filter(r => r.signal !== 'HOLD').slice(0, 30),
      });
    } finally {
      stepCount = savedState.stepCount;
      neurons = savedState.neurons;
      synapses = savedState.synapses;
      spikeHistory = savedState.spikeHistory;
    }
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
