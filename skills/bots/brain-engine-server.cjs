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
  volume:     { start: 40, count: 15, desc: 'Volume/trade activity' },
  spread:     { start: 55, count: 10, desc: 'Spread width / liquidity' },
  momentum:   { start: 65, count: 10, desc: 'Price momentum / acceleration' },
  antenna:    { start: 75, count: 25, desc: 'Pressure sensing (vol spikes, rapid moves)' },
};

let antennaSubGroups = {
  tickVelocity:   { offset: 0, count: 5, desc: 'Tick rate / speed of market' },
  volumeAccel:    { offset: 5, count: 4, desc: 'Volume acceleration (increasing/decreasing)' },
  buySellPressure:{ offset: 9, count: 4, desc: 'Uptick vs downtick ratio' },
  absorption:     { offset: 13, count: 3, desc: 'High volume + small price move' },
  flashCrash:     { offset: 16, count: 3, desc: 'Flash crash / breakout spike' },
  deadCat:        { offset: 19, count: 3, desc: 'Dead cat bounce / falling knife' },
  divergence:     { offset: 22, count: 3, desc: 'Volume-price divergence' },
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
  const priceUp = Math.max(4, Math.floor(n * 0.18));
  const priceDown = Math.max(4, Math.floor(n * 0.18));
  const vol = Math.max(4, Math.floor(n * 0.14));
  const spr = Math.max(2, Math.floor(n * 0.10));
  const mom = Math.max(2, Math.floor(n * 0.10));
  const ant = Math.max(7, n - priceUp - priceDown - vol - spr - mom);

  let offset = 0;
  sensoryAssignments.price_up   = { ...sensoryAssignments.price_up,   start: offset, count: priceUp };   offset += priceUp;
  sensoryAssignments.price_down = { ...sensoryAssignments.price_down, start: offset, count: priceDown }; offset += priceDown;
  sensoryAssignments.volume     = { ...sensoryAssignments.volume,     start: offset, count: vol };        offset += vol;
  sensoryAssignments.spread     = { ...sensoryAssignments.spread,     start: offset, count: spr };        offset += spr;
  sensoryAssignments.momentum   = { ...sensoryAssignments.momentum,   start: offset, count: mom };        offset += mom;
  sensoryAssignments.antenna    = { ...sensoryAssignments.antenna,    start: offset, count: ant };

  recalcAntennaSubGroups();
}

function recalcAntennaSubGroups() {
  const ant = sensoryAssignments.antenna;
  const n = ant.count;
  const tv = Math.max(1, Math.floor(n * 0.20));
  const va = Math.max(1, Math.floor(n * 0.16));
  const bp = Math.max(1, Math.floor(n * 0.16));
  const ab = Math.max(1, Math.floor(n * 0.12));
  const fc = Math.max(1, Math.floor(n * 0.12));
  const dc = Math.max(1, Math.floor(n * 0.12));
  const dv = Math.max(1, n - tv - va - bp - ab - fc - dc);
  let off = 0;
  antennaSubGroups.tickVelocity    = { offset: off, count: tv, desc: antennaSubGroups.tickVelocity.desc };    off += tv;
  antennaSubGroups.volumeAccel     = { offset: off, count: va, desc: antennaSubGroups.volumeAccel.desc };     off += va;
  antennaSubGroups.buySellPressure = { offset: off, count: bp, desc: antennaSubGroups.buySellPressure.desc }; off += bp;
  antennaSubGroups.absorption      = { offset: off, count: ab, desc: antennaSubGroups.absorption.desc };      off += ab;
  antennaSubGroups.flashCrash      = { offset: off, count: fc, desc: antennaSubGroups.flashCrash.desc };      off += fc;
  antennaSubGroups.deadCat         = { offset: off, count: dc, desc: antennaSubGroups.deadCat.desc };         off += dc;
  antennaSubGroups.divergence      = { offset: off, count: dv, desc: antennaSubGroups.divergence.desc };
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
  const pressure = priceData.pressure || {};
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
  }

  if (spread) {
    const spreadIntensity = spread * 1000;
    for (let i = spr.start; i < spr.start + spr.count; i++) {
      inputs.push([i, spreadIntensity]);
    }
  }

  encodeAntennaPressure(inputs, ant, pressure, volume);

  const stepsToRun = 10;
  for (let s = 0; s < stepsToRun; s++) {
    step(inputs);
  }
  const rates = getMotorRates();

  let alerts = {};
  if (pressure.flashCrashScore > 0 || pressure.deadCatScore > 0 || pressure.absorptionScore > 0 || pressure.divergenceScore > 0) {
    alerts = {
      flashCrash: pressure.flashCrashScore || 0,
      deadCat: pressure.deadCatScore || 0,
      absorption: pressure.absorptionScore || 0,
      divergence: pressure.divergenceScore || 0,
      tickVelocity: pressure.tickVelocity || 0,
      volumeAccel: pressure.volumeAccel || 0,
      buySellRatio: pressure.buySellRatio || 0.5,
    };
  }
  rates.antenna_alerts = alerts;
  rates.pressure_fed = Object.keys(pressure).length > 0;

  if (epic) recordPattern(epic, price, rates);
  return rates;
}

function encodeAntennaPressure(inputs, ant, pressure, volumeFallback) {
  const antStart = ant.start;
  const sg = antennaSubGroups;

  const tvI = Math.min((pressure.tickVelocity || 0) * 50, 500);
  for (let i = 0; i < sg.tickVelocity.count; i++) {
    inputs.push([antStart + sg.tickVelocity.offset + i, tvI]);
  }

  const vaRaw = pressure.volumeAccel || 0;
  const vaI = Math.min(Math.abs(vaRaw) * 100, 500) * (vaRaw >= 0 ? 1 : 0.3);
  for (let i = 0; i < sg.volumeAccel.count; i++) {
    inputs.push([antStart + sg.volumeAccel.offset + i, vaI]);
  }

  const bsRatio = pressure.buySellRatio != null ? pressure.buySellRatio : 0.5;
  const bsBias = (bsRatio - 0.5) * 2;
  const bsI = Math.abs(bsBias) * 200;
  for (let i = 0; i < sg.buySellPressure.count; i++) {
    const half = Math.floor(sg.buySellPressure.count / 2);
    const isBuyNeuron = i < half;
    const w = isBuyNeuron ? (bsBias > 0 ? bsI * 1.5 : bsI * 0.3) : (bsBias < 0 ? bsI * 1.5 : bsI * 0.3);
    inputs.push([antStart + sg.buySellPressure.offset + i, w]);
  }

  const absI = Math.min((pressure.absorptionScore || 0) * 150, 500);
  for (let i = 0; i < sg.absorption.count; i++) {
    inputs.push([antStart + sg.absorption.offset + i, absI]);
  }

  const fcI = Math.min((pressure.flashCrashScore || 0) * 200, 500);
  for (let i = 0; i < sg.flashCrash.count; i++) {
    inputs.push([antStart + sg.flashCrash.offset + i, fcI]);
  }

  const dcI = Math.min((pressure.deadCatScore || 0) * 200, 500);
  for (let i = 0; i < sg.deadCat.count; i++) {
    inputs.push([antStart + sg.deadCat.offset + i, dcI]);
  }

  const dvI = Math.min((pressure.divergenceScore || 0) * 150, 500);
  for (let i = 0; i < sg.divergence.count; i++) {
    inputs.push([antStart + sg.divergence.offset + i, dvI]);
  }

  if (!Object.keys(pressure).length && volumeFallback && volumeFallback > 500) {
    const spikeI = Math.min(volumeFallback / 50, 500);
    for (let i = antStart; i < antStart + ant.count; i++) {
      inputs.push([i, spikeI]);
    }
  }
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
    antenna_sub_groups: antennaSubGroups,
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

const MAX_BACKUPS = 5;
const BACKUP_INTERVAL_MS = 5 * 60 * 1000;
let lastBackupTime = 0;

function sanitizeEpic(epic) {
  return encodeURIComponent(epic).replace(/%/g, '_');
}

function atomicWrite(fpath, data) {
  const tmp = fpath + '.tmp';
  const fd = fs.openSync(tmp, 'w');
  fs.writeSync(fd, data);
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  fs.renameSync(tmp, fpath);
}

function saveInstrumentPatterns(epic) {
  try {
    const mem = patternMemory[epic];
    if (!mem) return;
    const fname = sanitizeEpic(epic) + '.json';
    const fpath = path.join(PATTERNS_DIR, fname);
    const data = {
      epic,
      tick_count: mem.tick_count || 0,
      last_price: mem.last_price,
      last_signal: mem.last_signal,
      learned_at: mem.learned_at,
      ticks: mem.ticks || [],
      signals: mem.signals || [],
      savedAt: new Date().toISOString(),
    };
    atomicWrite(fpath, JSON.stringify(data));
  } catch (e) { console.error('[brain-engine] Failed to save patterns for ' + epic + ':', e.message); }
}

function loadInstrumentPatterns() {
  try {
    const files = fs.readdirSync(PATTERNS_DIR).filter(f => f.endsWith('.json') && !f.includes('.backup-'));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(PATTERNS_DIR, f), 'utf8'));
        if (data.epic) {
          patternMemory[data.epic] = {
            ticks: data.ticks || [],
            signals: data.signals || [],
            learned_at: data.learned_at || Date.now(),
            last_price: data.last_price,
            last_signal: data.last_signal,
            tick_count: data.tick_count || 0,
          };
        }
      } catch (_) {}
    }
    console.log('[brain-engine] Loaded per-instrument patterns: ' + Object.keys(patternMemory).length + ' instruments from ' + files.length + ' files');
  } catch (_) {}
}

function backupInstrumentPatterns() {
  const now = Date.now();
  if (now - lastBackupTime < BACKUP_INTERVAL_MS) return;
  lastBackupTime = now;
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  try {
    for (const epic of Object.keys(patternMemory)) {
      const base = sanitizeEpic(epic);
      const src = path.join(PATTERNS_DIR, base + '.json');
      if (!fs.existsSync(src)) continue;
      const backupName = base + '.backup-' + ts + '.json';
      fs.copyFileSync(src, path.join(PATTERNS_DIR, backupName));
      rotateBackups(base);
    }
    const stateBackup = path.join(DATA_DIR, 'brain-state.backup-' + ts + '.json');
    if (fs.existsSync(BRAIN_STATE_FILE)) {
      fs.copyFileSync(BRAIN_STATE_FILE, stateBackup);
      rotateStateBackups();
    }
    console.log('[brain-engine] Backups created at ' + ts + ' for ' + Object.keys(patternMemory).length + ' instruments + state');
  } catch (e) { console.error('[brain-engine] Backup error:', e.message); }
}

function rotateBackups(base) {
  try {
    const files = fs.readdirSync(PATTERNS_DIR)
      .filter(f => f.startsWith(base + '.backup-') && f.endsWith('.json'))
      .sort();
    while (files.length > MAX_BACKUPS) {
      fs.unlinkSync(path.join(PATTERNS_DIR, files.shift()));
    }
  } catch (_) {}
}

function rotateStateBackups() {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('brain-state.backup-') && f.endsWith('.json'))
      .sort();
    while (files.length > MAX_BACKUPS) {
      fs.unlinkSync(path.join(DATA_DIR, files.shift()));
    }
  } catch (_) {}
}

function saveSynapseWeights() {
  try {
    if (!synapses || !synapses.length) return;
    const compact = synapses.map(s => [s.pre, s.post, +s.w.toFixed(6), +s.base_w.toFixed(6)]);
    const wpath = path.join(DATA_DIR, 'brain-weights.json');
    atomicWrite(wpath, JSON.stringify({
      architecture: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
      count: compact.length,
      weights: compact,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) { console.error('[brain-engine] Failed to save weights:', e.message); }
}

function loadSynapseWeights() {
  try {
    const wpath = path.join(DATA_DIR, 'brain-weights.json');
    if (!fs.existsSync(wpath)) return false;
    const data = JSON.parse(fs.readFileSync(wpath, 'utf8'));
    if (!data.weights || !data.architecture) return false;
    if (data.architecture.sensory !== N_SENSORY || data.architecture.inter !== N_INTER || data.architecture.motor !== N_MOTOR) {
      console.log('[brain-engine] Architecture changed (' +
        data.architecture.sensory + '/' + data.architecture.inter + '/' + data.architecture.motor +
        ' -> ' + N_SENSORY + '/' + N_INTER + '/' + N_MOTOR + '), weights discarded');
      return false;
    }
    for (var vi = 0; vi < data.weights.length; vi++) {
      var row = data.weights[vi];
      if (!Array.isArray(row) || row.length !== 4 ||
          !Number.isFinite(row[0]) || !Number.isFinite(row[1]) ||
          !Number.isFinite(row[2]) || !Number.isFinite(row[3]) ||
          row[0] < 0 || row[0] >= N_TOTAL || row[1] < 0 || row[1] >= N_TOTAL) {
        console.error('[brain-engine] Corrupt weight at index ' + vi + ', discarding all weights');
        return false;
      }
    }
    synapses = data.weights.map(w => ({ pre: w[0], post: w[1], w: w[2], base_w: w[3] }));
    console.log('[brain-engine] Restored ' + synapses.length + ' synapse weights from disk (saved ' + data.savedAt + ')');
    return true;
  } catch (e) {
    console.error('[brain-engine] Failed to load weights:', e.message);
    return false;
  }
}

function saveState() {
  try {
    const state = {
      stepCount,
      currentParams,
      trainingFeedbackLog: trainingFeedbackLog.slice(-100),
      architecture: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
      sensoryAssignments,
      mushroomBody,
      instrumentList: Object.keys(patternMemory),
      savedAt: new Date().toISOString(),
    };
    atomicWrite(BRAIN_STATE_FILE, JSON.stringify(state));
    saveSynapseWeights();
    for (const epic of Object.keys(patternMemory)) {
      saveInstrumentPatterns(epic);
    }
    backupInstrumentPatterns();
  } catch (_) {}
}

function loadState() {
  try {
    if (fs.existsSync(BRAIN_STATE_FILE)) {
      const state = JSON.parse(fs.readFileSync(BRAIN_STATE_FILE, 'utf8'));
      if (state.currentParams) currentParams = { ...currentParams, ...state.currentParams };
      if (state.patternMemory) {
        patternMemory = state.patternMemory;
        console.log('[brain-engine] Migrating inline patternMemory to per-instrument files...');
        for (const epic of Object.keys(patternMemory)) {
          saveInstrumentPatterns(epic);
        }
      }
      if (state.trainingFeedbackLog) trainingFeedbackLog = state.trainingFeedbackLog;
      if (state.architecture) {
        N_SENSORY = state.architecture.sensory || N_SENSORY;
        N_INTER = state.architecture.inter || N_INTER;
        N_MOTOR = state.architecture.motor || N_MOTOR;
        N_TOTAL = N_SENSORY + N_INTER + N_MOTOR;
      }
      if (state.sensoryAssignments) sensoryAssignments = { ...sensoryAssignments, ...state.sensoryAssignments };
      if (state.mushroomBody) mushroomBody = { ...mushroomBody, ...state.mushroomBody };
      if (state.stepCount) stepCount = state.stepCount;
      console.log('[brain-engine] Restored state: ' + (state.stepCount || 0) + ' steps, arch=' + N_SENSORY + '/' + N_INTER + '/' + N_MOTOR);
    }
    loadInstrumentPatterns();
    console.log('[brain-engine] Pattern memory: ' + Object.keys(patternMemory).length + ' instruments loaded');
  } catch (e) { console.error('[brain-engine] loadState error:', e.message); }
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
  } else {
    recalcAntennaSubGroups();
  }
  initNeurons();
  var weightsRestored = loadSynapseWeights();
  if (!weightsRestored) {
    initSynapses();
    console.log('[brain-engine] Generated fresh random synapses (no saved weights found or architecture changed)');
  }
  isBooted = true;
  bootTime = Date.now();
  if (!weightsRestored) stepCount = 0;
  spikeHistory = [];

  saveState();

  console.log('[brain-engine] Booted: ' + N_TOTAL + ' neurons, ' + synapses.length + ' synapses (S=' + N_SENSORY + ' I=' + N_INTER + ' M=' + N_MOTOR + ')' + (weightsRestored ? ' [WEIGHTS RESTORED]' : ' [FRESH WEIGHTS]'));
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
      pattern_instruments: Object.keys(patternMemory),
      weights_file: fs.existsSync(path.join(DATA_DIR, 'brain-weights.json')) ? 'brain-weights.json' : null,
      training_mode: trainingMode,
      sensory_assignments: sensoryAssignments,
      antenna_sub_groups: antennaSubGroups,
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
      saveSynapseWeights();
      initSynapses();
      console.log('[brain-engine] Rebuilt synapses after architecture update: ' + synapses.length + ' synapses [old weights backed up]');
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
    const minHoldCandles = Math.max(0, parseInt(body.minHoldCandles) || 0);
    const signalThreshold = Math.max(0, parseFloat(body.signalThreshold) || 5);
    const confirmCandles = Math.max(1, parseInt(body.confirmCandles) || 1);

    if (!candles.length) return respond(res, 400, { error: 'No candles provided' });

    const antennaEnabled = body.antennaEnabled || false;

    const results = {
      total_candles: candles.length,
      trades: [],
      total_pnl: 0,
      sugar_count: 0,
      pain_count: 0,
      steps_run: 0,
      signals: [],
      antenna_used: antennaEnabled,
    };

    let prevPrice = null;
    let openTrade = null;
    let consecutiveSignal = null;
    let consecutiveCount = 0;
    let prevVol = 0;
    let volHistory = [];

    for (let ci = 0; ci < candles.length; ci++) {
      const c = candles[ci];
      const closePrice = c.closePrice ? (c.closePrice.bid + c.closePrice.ask) / 2 :
                         c.close || c.mid || ((c.high || 0) + (c.low || 0)) / 2;
      const highPrice = c.highPrice ? (c.highPrice.bid + c.highPrice.ask) / 2 : c.high || closePrice;
      const lowPrice = c.lowPrice ? (c.lowPrice.bid + c.lowPrice.ask) / 2 : c.low || closePrice;
      const vol = c.lastTradedVolume || c.volume || 0;

      if (!closePrice || closePrice <= 0) continue;

      let pressure = {};
      if (antennaEnabled && prevPrice) {
        const priceDelta = closePrice - prevPrice;
        const priceRange = highPrice - lowPrice;
        const priceVelocity = Math.abs(priceDelta);
        volHistory.push(vol);
        if (volHistory.length > 10) volHistory.shift();
        const avgVol = volHistory.reduce((a, b) => a + b, 0) / volHistory.length;
        const volumeAccel = prevVol > 0 ? (vol - prevVol) / prevVol : 0;
        const buySellRatio = priceDelta > 0 ? 0.6 + Math.min(Math.abs(priceDelta) / (priceRange + 0.001) * 0.2, 0.2) :
                             priceDelta < 0 ? 0.4 - Math.min(Math.abs(priceDelta) / (priceRange + 0.001) * 0.2, 0.2) : 0.5;
        const absorptionScore = vol > avgVol * 1.5 && priceRange < Math.abs(priceDelta) * 3 ?
                                Math.min((vol / (avgVol + 1)) * (1 / (priceRange + 0.01)), 3.0) : 0;
        const flashCrashScore = priceVelocity > 0 && vol > avgVol * 2 ?
                                Math.min(priceVelocity * (vol / (avgVol + 1)) / 20, 5.0) : 0;
        let deadCatScore = 0;
        if (ci >= 3) {
          const prevPrev = candles[ci - 2];
          const pp2Price = prevPrev.closePrice ? (prevPrev.closePrice.bid + prevPrev.closePrice.ask) / 2 : prevPrev.close || prevPrev.mid || 0;
          if (pp2Price > prevPrice && closePrice > prevPrice && closePrice < pp2Price) {
            const drop = pp2Price - prevPrice;
            const bounce = closePrice - prevPrice;
            const bounceRatio = drop > 0 ? bounce / drop : 0;
            if (bounceRatio > 0.1 && bounceRatio < 0.5 && vol < prevVol * 0.7) {
              deadCatScore = Math.min((1 - bounceRatio) * 2, 3.0);
            }
          }
        }
        const fallingKnifeScore = priceDelta < 0 && volumeAccel > 0.3 ?
                                  Math.min(Math.abs(priceDelta) * volumeAccel / 5, 3.0) : 0;
        const divergenceScore = ci >= 5 ? (() => {
          const recent5 = candles.slice(Math.max(0, ci - 4), ci + 1);
          const prices5 = recent5.map(cc => cc.closePrice ? (cc.closePrice.bid + cc.closePrice.ask) / 2 : cc.close || cc.mid || 0);
          const vols5 = recent5.map(cc => cc.lastTradedVolume || cc.volume || 0);
          const priceUp = prices5[prices5.length - 1] > prices5[0];
          const volDown = vols5[vols5.length - 1] < vols5[0] * 0.8;
          return priceUp && volDown ? Math.min(Math.abs(1 - vols5[vols5.length - 1] / (vols5[0] + 1)) * 2, 3.0) : 0;
        })() : 0;

        pressure = {
          tickVelocity: priceVelocity * 10,
          volumeAccel,
          buySellRatio,
          absorptionScore,
          flashCrashScore,
          deadCatScore,
          fallingKnifeScore,
          divergenceScore,
          priceVelocity,
          priceDelta,
        };
      }
      prevVol = vol;

      const rates = stimulateFromPrice({
        price: closePrice,
        prevPrice: prevPrice || closePrice,
        volume: vol,
        spread: c.spread || 0,
        epic: epic,
        pressure: pressure,
      });
      results.steps_run += 10;

      const signal = rates.buy_signal > rates.sell_signal && rates.buy_signal > rates.hold_signal
        ? 'BUY' : rates.sell_signal > rates.buy_signal && rates.sell_signal > rates.hold_signal
        ? 'SELL' : 'HOLD';

      if (signal !== 'HOLD' && signal === consecutiveSignal) {
        consecutiveCount++;
      } else if (signal !== 'HOLD') {
        consecutiveSignal = signal;
        consecutiveCount = 1;
      } else {
        consecutiveCount = 0;
      }

      results.signals.push({ idx: ci, price: closePrice, signal, buy: rates.buy_signal, sell: rates.sell_signal, hold: rates.hold_signal });

      if (openTrade) {
        openTrade.candlesHeld = (openTrade.candlesHeld || 0) + 1;
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

        if (signal !== openTrade.direction && signal !== 'HOLD' && !exitPrice && openTrade.candlesHeld >= minHoldCandles) {
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
            candles_held: openTrade.candlesHeld,
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

      const signalConfirmed = consecutiveCount >= confirmCandles;
      if (!openTrade && signal !== 'HOLD' && signalConfirmed && (rates.buy_signal > signalThreshold || rates.sell_signal > signalThreshold)) {
        openTrade = { direction: signal, entry: closePrice, entry_idx: ci, candlesHeld: 0 };
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
    const minHoldCandles = Math.max(0, parseInt(body.minHoldCandles) || 0);
    const signalThreshold = Math.max(0, parseFloat(body.signalThreshold) || 5);
    const confirmCandles = Math.max(1, parseInt(body.confirmCandles) || 1);

    if (!candle || !candle.close) return respond(res, 400, { error: 'Candle with close price required' });

    const closePrice = candle.close;
    const highPrice = candle.high || closePrice;
    const lowPrice = candle.low || closePrice;
    const vol = candle.volume || 0;
    const prevPrice = candle.prevClose || closePrice;

    const pressure = body.pressure || {};

    const rates = stimulateFromPrice({
      price: closePrice,
      prevPrice: prevPrice,
      volume: vol,
      spread: candle.spread || 0,
      epic: epic,
      pressure: pressure,
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
      antenna_alerts: rates.antenna_alerts || {},
      pressure_fed: rates.pressure_fed || false,
    };

    if (body.openTrade) {
      const ot = body.openTrade;
      const candlesHeld = (ot.candlesHeld || 0) + 1;
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

      if (signal !== ot.direction && signal !== 'HOLD' && !exitPrice && candlesHeld >= minHoldCandles) {
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
          candles_held: candlesHeld,
        };
        if (pnl > 0) {
          applyFeedback('sugar', { target: 'motor' });
          applyFeedback('sugar', { target: 'mushroom' });
          result.feedback = 'sugar';
        } else {
          applyFeedback('pain', { target: 'motor' });
          result.feedback = 'pain';
        }
      } else {
        result.held_trade = { direction: ot.direction, entry: ot.entry, candlesHeld: candlesHeld };
      }
    }

    const liveConfirmCount = body.consecutiveCount || 0;
    let newConsecutiveSignal = body.consecutiveSignal || null;
    let newConsecutiveCount = liveConfirmCount;
    if (signal !== 'HOLD' && signal === newConsecutiveSignal) {
      newConsecutiveCount++;
    } else if (signal !== 'HOLD') {
      newConsecutiveSignal = signal;
      newConsecutiveCount = 1;
    } else {
      newConsecutiveCount = 0;
    }
    result.consecutiveSignal = newConsecutiveSignal;
    result.consecutiveCount = newConsecutiveCount;

    const signalConfirmed = newConsecutiveCount >= confirmCandles;
    if (!body.openTrade && signal !== 'HOLD' && signalConfirmed && (rates.buy_signal > signalThreshold || rates.sell_signal > signalThreshold)) {
      result.open_trade = { direction: signal, entry: closePrice, candlesHeld: 0 };
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
    saveSynapseWeights();
    isBooted = false;
    bootTime = null;
    neurons = null;
    synapses = null;
    spikeHistory = [];
    return respond(res, 200, { message: 'Brain restarted (weights saved)' });
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
