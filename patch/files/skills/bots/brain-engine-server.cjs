const http = require('http');
const fs = require('fs');
const path = require('path');

const BRAIN_PORT = parseInt(process.env.BRAIN_PORT) || 0;
const BRAIN_INSTANCE_ID = process.env.BRAIN_INSTANCE_ID || 'trading';
const IS_AGENT_BRAIN = BRAIN_INSTANCE_ID === 'agent';
const DATA_DIR = process.env.BRAIN_DATA_DIR || path.join(process.env.HOME || '/home/runner', '.openclaw');
const PORT_FILENAME = process.env.BRAIN_PORT_FILENAME || 'brain-engine-port';
const PATTERNS_DIR = path.join(DATA_DIR, 'brain-patterns');
const BRAIN_STATE_FILE = path.join(DATA_DIR, 'brain-state.json');

try { fs.mkdirSync(PATTERNS_DIR, { recursive: true }); } catch (_) {}

const AGENT_DEFAULTS = { sensory: 2000, inter: 14000, motor: 4000, total: 20000 };
const TRADING_DEFAULTS = { sensory: 600, inter: 3600, motor: 800, total: 5000 };
const DEFAULTS = IS_AGENT_BRAIN ? AGENT_DEFAULTS : TRADING_DEFAULTS;

let N_SENSORY = DEFAULTS.sensory;
let N_INTER = DEFAULTS.inter;
let N_MOTOR = DEFAULTS.motor;
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
  if (IS_AGENT_BRAIN) {
    const content   = Math.max(6, Math.floor(n * 0.22));
    const behavior  = Math.max(6, Math.floor(n * 0.18));
    const style     = Math.max(6, Math.floor(n * 0.18));
    const personality = Math.max(6, Math.floor(n * 0.18));
    const identity  = Math.max(4, Math.floor(n * 0.10));
    const meta      = Math.max(4, n - content - behavior - style - personality - identity);
    let offset = 0;
    sensoryAssignments = {};
    sensoryAssignments.content_features     = { start: offset, count: content,     desc: 'Content analysis (length, code, data, errors, complexity)' }; offset += content;
    sensoryAssignments.behavior_features    = { start: offset, count: behavior,    desc: 'Behavioral signals (proactivity, questions, speed)' };         offset += behavior;
    sensoryAssignments.style_features       = { start: offset, count: style,       desc: 'Style detection (formality, lists, emojis, visuals)' };        offset += style;
    sensoryAssignments.personality_features = { start: offset, count: personality,  desc: 'Personality axes (risk, humor, confidence, tone, cultural)' };  offset += personality;
    sensoryAssignments.identity_features    = { start: offset, count: identity,    desc: 'Agent identity signals (agent ID, topic hash)' };              offset += identity;
    sensoryAssignments.meta_features        = { start: offset, count: meta,        desc: 'Meta/auxiliary dimension signals' };                           offset += meta;
    antennaSubGroups = {};
  } else {
    const priceUp = Math.max(4, Math.floor(n * 0.18));
    const priceDown = Math.max(4, Math.floor(n * 0.18));
    const vol = Math.max(4, Math.floor(n * 0.14));
    const spr = Math.max(2, Math.floor(n * 0.10));
    const mom = Math.max(2, Math.floor(n * 0.10));
    const pref = Math.max(6, Math.floor(n * 0.20));
    const ant = Math.max(7, n - priceUp - priceDown - vol - spr - mom - pref);

    let offset = 0;
    sensoryAssignments.price_up   = { ...sensoryAssignments.price_up,   start: offset, count: priceUp };   offset += priceUp;
    sensoryAssignments.price_down = { ...sensoryAssignments.price_down, start: offset, count: priceDown }; offset += priceDown;
    sensoryAssignments.volume     = { ...sensoryAssignments.volume,     start: offset, count: vol };        offset += vol;
    sensoryAssignments.spread     = { ...sensoryAssignments.spread,     start: offset, count: spr };        offset += spr;
    sensoryAssignments.momentum   = { ...sensoryAssignments.momentum,   start: offset, count: mom };        offset += mom;
    sensoryAssignments.antenna    = { ...sensoryAssignments.antenna,    start: offset, count: ant };        offset += ant;
    sensoryAssignments.preference = { start: offset, count: pref, desc: 'User preference learning (neural feedback)' };

    recalcAntennaSubGroups();
  }
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
  const window = Math.min(spikeHistory.length, 20);
  const motorStart = N_SENSORY + N_INTER;
  const third = Math.floor(N_MOTOR / 3);
  const regionLabels = IS_AGENT_BRAIN
    ? ['reinforce', 'adjust', 'explore']
    : ['buy', 'sell', 'hold'];
  const regionBounds = [
    { start: 0, end: third },
    { start: third, end: 2 * third },
    { start: 2 * third, end: N_MOTOR },
  ];
  if (window === 0) {
    const result = { avg_rate: 0, raw: {} };
    regionLabels.forEach(l => { result[l + '_signal'] = 0; result.raw[l] = 0; });
    result.raw.total = 0;
    return result;
  }
  const counts = [0, 0, 0];
  let totalCount = 0;
  for (let i = spikeHistory.length - window; i < spikeHistory.length; i++) {
    const entry = spikeHistory[i];
    for (const s of entry.spikes) {
      if (s >= motorStart && s < motorStart + N_MOTOR) {
        const m = s - motorStart;
        for (let r = 0; r < 3; r++) {
          if (m >= regionBounds[r].start && m < regionBounds[r].end) { counts[r]++; break; }
        }
        totalCount++;
      }
    }
  }
  const scale = 1000 / (window * DT);
  const result = {
    avg_rate: parseFloat((totalCount * scale / N_MOTOR).toFixed(2)),
    motor_rates: parseFloat((totalCount * scale / N_MOTOR).toFixed(2)),
    raw: { total: totalCount },
  };
  regionLabels.forEach((l, i) => {
    const regionSize = regionBounds[i].end - regionBounds[i].start;
    result[l + '_signal'] = parseFloat((counts[i] * scale / regionSize).toFixed(2));
    result.raw[l] = counts[i];
  });
  return result;
}

function stimulateFromPrice(priceData) {
  const inputs = [];
  const { price, prevPrice, volume, spread, epic } = priceData;
  const pressure = priceData.pressure || {};
  const boost = priceData.boost || 1;
  const stepsOverride = priceData.steps || 10;
  const pu = sensoryAssignments.price_up;
  const pd = sensoryAssignments.price_down;
  const vol = sensoryAssignments.volume;
  const spr = sensoryAssignments.spread;
  const mom = sensoryAssignments.momentum;
  const ant = sensoryAssignments.antenna;

  if (price && prevPrice) {
    const delta = price - prevPrice;
    const pctChange = Math.abs(delta / prevPrice) * 10000;
    const boostedPct = pctChange * boost;
    for (let i = pu.start; i < pu.start + pu.count; i++) {
      inputs.push([i, boostedPct * (delta > 0 ? 1.5 : 0.5)]);
    }
    for (let i = pd.start; i < pd.start + pd.count; i++) {
      inputs.push([i, boostedPct * (delta < 0 ? 1.5 : 0.5)]);
    }
    const acceleration = Math.abs(boostedPct) > 50 ? boostedPct * 2 : boostedPct;
    for (let i = mom.start; i < mom.start + mom.count; i++) {
      inputs.push([i, acceleration]);
    }
  }

  if (volume) {
    const volIntensity = Math.min(volume / 100, 200) * boost;
    for (let i = vol.start; i < vol.start + vol.count; i++) {
      inputs.push([i, volIntensity]);
    }
  }

  const effectiveSpread = spread || (price && prevPrice ? Math.abs(price - prevPrice) : 0);
  if (effectiveSpread) {
    const spreadIntensity = effectiveSpread * 1000 * boost;
    for (let i = spr.start; i < spr.start + spr.count; i++) {
      inputs.push([i, spreadIntensity]);
    }
  }

  encodeAntennaPressure(inputs, ant, pressure, volume);

  for (let s = 0; s < stepsOverride; s++) {
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

function computeFeedbackModifier(type, strength) {
  const REF_SYNAPSES = 4290;
  const BASE_SUGAR = 0.15;
  const BASE_PAIN = 0.15;
  const totalSyn = synapses ? synapses.length : REF_SYNAPSES;
  const scale = Math.sqrt(REF_SYNAPSES / Math.max(1, totalSyn));
  const mag = typeof strength === 'number' && strength > 0 ? Math.min(3, 1 + Math.log(1 + strength)) : 1;
  const delta = type === 'sugar'
    ? BASE_SUGAR * scale * mag
    : BASE_PAIN * scale * mag;
  return type === 'sugar' ? (1 + delta) : (1 - delta);
}

function applyFeedback(type, options) {
  const strength = (options && options.strength) || undefined;
  const modifier = computeFeedbackModifier(type, strength);
  const wClamp = Math.max(2, currentParams.w_syn * 0.25);
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
      syn.w = Math.max(-wClamp, Math.min(wClamp, syn.w));
      const minFloor = Math.abs(syn.base_w) * 0.25;
      if (minFloor > 0 && Math.abs(syn.w) < minFloor) {
        syn.w = syn.w >= 0 ? minFloor : -minFloor;
      }
      affected++;
    }
  }

  trainingFeedbackLog.push({ ts: Date.now(), type, modifier: +modifier.toFixed(6), step: stepCount, target, affected, synapse_count: synapses ? synapses.length : 0, w_clamp: wClamp });
  if (trainingFeedbackLog.length > 1000) trainingFeedbackLog.shift();
  return { applied: type, modifier: +modifier.toFixed(6), target, synapses_affected: affected, synapse_total: synapses ? synapses.length : 0, w_clamp: wClamp };
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

const PREFERENCE_FEATURES = [
  'response_length', 'tool_count', 'had_code', 'had_data',
  'topic_hash', 'was_proactive', 'agent_id_hash',
  'response_time', 'had_error', 'complexity'
];

function stimulateFromPreference(data) {
  const pref = IS_AGENT_BRAIN
    ? { start: 0, count: N_SENSORY }
    : sensoryAssignments.preference;
  if (!pref || pref.count < 6) return { error: 'Preference zone too small or not configured' };
  const features = data.features || {};
  const feedback = data.feedback;
  const stepsToRun = data.steps || 5;
  const inputs = [];

  const featureKeys = Object.keys(features).length > 0 ? Object.keys(features) : PREFERENCE_FEATURES;
  const neuronsPerFeature = Math.max(1, Math.floor(pref.count / featureKeys.length));

  for (let fi = 0; fi < featureKeys.length; fi++) {
    const key = featureKeys[fi];
    const val = parseFloat(features[key]) || 0;
    const featureStart = pref.start + fi * neuronsPerFeature;
    const featureEnd = Math.min(featureStart + neuronsPerFeature, pref.start + pref.count);
    const intensity = Math.abs(val) * 100;
    for (let ni = featureStart; ni < featureEnd; ni++) {
      if (ni < N_SENSORY) {
        inputs.push([ni, intensity * (0.5 + Math.random() * 0.5)]);
      }
    }
  }

  spikeHistory = [];
  for (let s = 0; s < stepsToRun; s++) step(inputs);
  const rates = getMotorRates();

  if (feedback === 'sugar' || feedback === 'pain') {
    const fbOpts = { strength: data.strength };
    applyFeedback(feedback, { target: 'mushroom', ...fbOpts });
    applyFeedback(feedback, { target: 'motor', ...fbOpts });
  }

  return {
    timestamp: Date.now(),
    step_count: stepCount,
    preference_neurons: { start: pref.start, count: pref.count },
    features_used: Object.keys(features).length,
    inputs_injected: inputs.length,
    feedback_applied: feedback || 'none',
    ...rates
  };
}

function replayTradingPatterns() {
  const replayed = {};
  let totalTicks = 0;
  for (const [epic, mem] of Object.entries(patternMemory)) {
    const ticks = (mem.ticks || []).slice(-200);
    if (ticks.length < 2) continue;
    let prevPrice = ticks[0].price;
    for (let i = 1; i < ticks.length; i++) {
      const t = ticks[i];
      stimulateFromPrice({
        price: t.price,
        prevPrice: prevPrice,
        volume: 50,
        spread: Math.abs(t.price - prevPrice) || 0.01,
        epic: epic,
        steps: 5,
        boost: 1
      });
      prevPrice = t.price;
      totalTicks++;
    }
    replayed[epic] = ticks.length;
  }

  const feedbackLog = trainingFeedbackLog.slice(-50);
  let sugarCount = 0, painCount = 0;
  for (const entry of feedbackLog) {
    if (entry.type === 'sugar') {
      applyFeedback('sugar', { target: 'motor' });
      sugarCount++;
    } else if (entry.type === 'pain') {
      applyFeedback('pain', { target: 'motor' });
      painCount++;
    }
  }

  console.log('[brain-engine] Replayed trading patterns: ' + totalTicks + ' ticks across ' + Object.keys(replayed).length + ' instruments, ' + sugarCount + ' sugar + ' + painCount + ' pain');
  return { replayed, total_ticks: totalTicks, sugar_replayed: sugarCount, pain_replayed: painCount };
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
    feedback_formula: {
      sugar_modifier: +computeFeedbackModifier('sugar').toFixed(6),
      pain_modifier: +computeFeedbackModifier('pain').toFixed(6),
      w_clamp: Math.max(2, currentParams.w_syn * 0.25),
      ref_synapses: 4290,
      actual_synapses: synapses ? synapses.length : 0,
    },
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
    motor_regions: IS_AGENT_BRAIN ? {
      reinforce: { start: 0, count: Math.floor(N_MOTOR / 3), desc: 'Strengthen current preferences' },
      adjust:    { start: Math.floor(N_MOTOR / 3), count: Math.floor(N_MOTOR / 3), desc: 'Modify/adapt preferences' },
      explore:   { start: Math.floor(2 * N_MOTOR / 3), count: N_MOTOR - Math.floor(2 * N_MOTOR / 3), desc: 'Try new response patterns' },
    } : {
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
const MAX_DAILY_BACKUPS = 30;
const DAILY_BACKUP_DIR = path.join(DATA_DIR, 'daily-backups');
let lastDailyBackupDate = '';
try { fs.mkdirSync(DAILY_BACKUP_DIR, { recursive: true }); } catch (_) {}
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

function dailyBackup() {
  const today = new Date().toISOString().slice(0, 10);
  if (today === lastDailyBackupDate) return;
  lastDailyBackupDate = today;
  try {
    const dayDir = path.join(DAILY_BACKUP_DIR, today);
    fs.mkdirSync(dayDir, { recursive: true });
    if (fs.existsSync(BRAIN_STATE_FILE)) {
      fs.copyFileSync(BRAIN_STATE_FILE, path.join(dayDir, 'brain-state.json'));
    }
    const wpath = path.join(DATA_DIR, 'brain-weights.json');
    if (fs.existsSync(wpath)) {
      fs.copyFileSync(wpath, path.join(dayDir, 'brain-weights.json'));
    }
    for (const epic of Object.keys(patternMemory)) {
      const fname = sanitizeEpic(epic) + '.json';
      const src = path.join(PATTERNS_DIR, fname);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dayDir, fname));
    }
    const cortexPath = path.join(DATA_DIR, 'cortex-state.json');
    if (fs.existsSync(cortexPath)) {
      fs.copyFileSync(cortexPath, path.join(dayDir, 'cortex-state.json'));
    }
    const days = fs.readdirSync(DAILY_BACKUP_DIR).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    while (days.length > MAX_DAILY_BACKUPS) {
      const old = days.shift();
      const oldDir = path.join(DAILY_BACKUP_DIR, old);
      try { fs.rmSync(oldDir, { recursive: true, force: true }); } catch (_) {}
    }
    console.log('[brain-engine] Daily backup created: ' + today + ' (' + Object.keys(patternMemory).length + ' instruments, weights, state, cortex)');
  } catch (e) { console.error('[brain-engine] Daily backup error:', e.message); }
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
    dailyBackup();
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
  recalcSensoryAssignments();
  if (sizeChanged || N_SENSORY !== prevSensory) {
    recalcMushroomBody();
  }
  initNeurons();
  var weightsRestored = loadSynapseWeights();
  if (!weightsRestored) {
    initSynapses();
    console.log('[brain-engine] Generated fresh random synapses (no saved weights found or architecture changed)');
  }
  if (weightsRestored) {
    const motorStart = N_SENSORY + N_INTER;
    const i2m = synapses.filter(s => s.pre >= N_SENSORY && s.pre < motorStart && s.post >= motorStart && s.w > 0);
    if (i2m.length > 0) {
      const avgW = i2m.reduce((a, s) => a + s.w, 0) / i2m.length;
      const avgBase = i2m.reduce((a, s) => a + Math.abs(s.base_w), 0) / i2m.length;
      if (avgBase > 0 && avgW / avgBase < 0.4) {
        console.log('[brain-engine] Auto-rehab: I->M avg weight ' + avgW.toFixed(4) + ' is < 20% of base ' + avgBase.toFixed(4));
        let healed = 0;
        for (const syn of synapses) {
          if (syn.post >= motorStart || (syn.pre >= N_SENSORY && syn.pre < motorStart)) {
            const target = syn.base_w * 0.5;
            if (Math.abs(syn.w) < Math.abs(target)) {
              syn.w = syn.base_w >= 0 ? Math.abs(target) : -Math.abs(target);
              healed++;
            }
          }
        }
        console.log('[brain-engine] Auto-rehab healed ' + healed + ' synapses to 50% of base');
      }
    }
  }

  isBooted = true;
  bootTime = Date.now();
  if (!weightsRestored) {
    stepCount = 0;
    if (Object.keys(patternMemory).length > 0) {
      console.log('[brain-engine] Architecture changed — auto-replaying trading patterns...');
      const tradeReplay = replayTradingPatterns();
      console.log('[brain-engine] Trade replay complete: ' + tradeReplay.total_ticks + ' ticks replayed');
    }
  }
  spikeHistory = [];

  saveState();
  if (weightsRestored) saveSynapseWeights();

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
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const arch = getArchitecture();
    const rates = isBooted ? getMotorRates() : {};
    return respond(res, 200, {
      instance_id: BRAIN_INSTANCE_ID,
      loaded: isBooted,
      boot_time_ms: bootTime ? Date.now() - bootTime : null,
      step_count: stepCount,
      neurons_count: N_TOTAL,
      synapses_count: synapses ? synapses.length : 0,
      running: isBooted,
      regions: { sensory: N_SENSORY, inter: N_INTER, motor: N_MOTOR },
      params: currentParams,
      motor_regions: arch.motor_regions,
      motor_rates: rates,
      patterns: Object.keys(patternMemory).length,
      pattern_instruments: Object.keys(patternMemory),
      weights_file: fs.existsSync(path.join(DATA_DIR, 'brain-weights.json')) ? 'brain-weights.json' : null,
      training_mode: trainingMode,
      sensory_assignments: sensoryAssignments,
      antenna_sub_groups: antennaSubGroups,
      mushroom_body: mushroomBody,
      feedback_formula: {
        sugar_modifier: +computeFeedbackModifier('sugar').toFixed(6),
        pain_modifier: +computeFeedbackModifier('pain').toFixed(6),
        w_clamp: Math.max(2, currentParams.w_syn * 0.25),
        ref_synapses: 4290,
        actual_synapses: synapses ? synapses.length : 0,
      },
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

  if (IS_AGENT_BRAIN && (p === '/stimulate-price' || p === '/replay-trading' || p === '/backtest-train' || p === '/live-train' || p === '/proof-test' || p.startsWith('/cortex-'))) {
    return respond(res, 404, { error: 'Trading-only endpoint not available on agent brain' });
  }

  if (m === 'POST' && p === '/stimulate-price') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const price = body.price || 0;
    const prevPrice = body.prevPrice || price;
    const priceLevel = Math.max(price, prevPrice, 1);
    const autoBoost = Math.max(1, Math.min(50, priceLevel / 100));
    if (!body.boost) body.boost = autoBoost;
    if (!body.volume && !body.spread) {
      body.spread = Math.abs(price - prevPrice) || priceLevel * 0.0001;
    }
    if (!body.steps) body.steps = 30;
    spikeHistory = [];
    const rates = stimulateFromPrice(body);
    return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
  }

  if (m === 'POST' && p === '/stimulate-preference') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const result = stimulateFromPreference(body);
    if (result.error) return respond(res, 400, result);
    saveSynapseWeights();
    return respond(res, 200, result);
  }

  if (m === 'POST' && p === '/replay-trading') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const result = replayTradingPatterns();
    saveSynapseWeights();
    saveState();
    return respond(res, 200, result);
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

  if (m === 'POST' && p === '/rehab') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const ratio = Math.max(0.3, Math.min(1.0, body.ratio || 0.5));
    const motorStart = N_SENSORY + N_INTER;
    let healed = 0, total = 0;
    for (const syn of synapses) {
      if (syn.post >= motorStart || (syn.pre >= N_SENSORY && syn.pre < motorStart)) {
        total++;
        const target = syn.base_w * ratio;
        if (Math.abs(syn.w) < Math.abs(target)) {
          syn.w = syn.base_w >= 0 ? Math.abs(target) : -Math.abs(target);
          healed++;
        }
      }
    }
    spikeHistory = [];
    saveSynapseWeights();
    saveState();
    return respond(res, 200, { ok: true, healed, total, ratio, message: 'Weights rehabilitated to ' + (ratio*100).toFixed(0) + '% of base' });
  }

  if (m === 'POST' && p === '/feedback') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const type = body.type || 'sugar';
    const options = { target: body.target || 'motor' };
    if (body.strength !== undefined) options.strength = parseFloat(body.strength) || undefined;
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

  if (m === 'GET' && p === '/patterns/export') {
    const epic = url.searchParams.get('epic') || '';
    if (epic) {
      if (!patternMemory[epic]) return respond(res, 404, { error: 'No patterns for ' + epic });
      const mem = patternMemory[epic];
      const exportData = { epic, ticks: mem.ticks || [], signals: mem.signals || [], learned_at: mem.learned_at, last_price: mem.last_price, last_signal: mem.last_signal, tick_count: mem.tick_count || 0 };
      return respond(res, 200, exportData);
    }
    const allExport = {};
    for (const [e, mem] of Object.entries(patternMemory)) {
      allExport[e] = { epic: e, ticks: mem.ticks || [], signals: mem.signals || [], learned_at: mem.learned_at, last_price: mem.last_price, last_signal: mem.last_signal, tick_count: mem.tick_count || 0 };
    }
    return respond(res, 200, allExport);
  }

  if (m === 'POST' && p === '/patterns/import') {
    const body = await parseBody(req);
    let imported = 0;
    if (body && body.epic && body.ticks) {
      patternMemory[body.epic] = { ticks: body.ticks || [], signals: body.signals || [], learned_at: body.learned_at || Date.now(), last_price: body.last_price, last_signal: body.last_signal, tick_count: body.tick_count || (body.ticks || []).length };
      saveInstrumentPatterns(body.epic);
      imported = 1;
    } else if (body && typeof body === 'object') {
      for (const [epic, data] of Object.entries(body)) {
        if (data && data.ticks) {
          patternMemory[epic] = { ticks: data.ticks || [], signals: data.signals || [], learned_at: data.learned_at || Date.now(), last_price: data.last_price, last_signal: data.last_signal, tick_count: data.tick_count || (data.ticks || []).length };
          saveInstrumentPatterns(epic);
          imported++;
        }
      }
    }
    return respond(res, 200, { ok: true, imported, total_instruments: Object.keys(patternMemory).length });
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
    const stopLossPips = body.stopLossPips || 0;
    const takeProfitPips = body.takeProfitPips || 0;
    const stopLossPct = stopLossPips ? 0 : (body.stopLossPct || 1.0);
    const takeProfitPct = takeProfitPips ? 0 : (body.takeProfitPct || 2.0);
    const usePips = stopLossPips > 0 || takeProfitPips > 0;
    const plMultiplier = body.plMultiplier || 1;
    const size = body.size || 1;
    const epic = body.epic || 'BACKTEST';
    const minHoldCandles = Math.max(0, parseInt(body.minHoldCandles) || 0);
    const signalThreshold = Math.max(0, parseFloat(body.signalThreshold) || 5);
    const confirmCandles = Math.max(1, parseInt(body.confirmCandles) || 1);
    const timeframe = body.timeframe || '';

    if (!candles.length) return respond(res, 400, { error: 'No candles provided' });

    const antennaEnabled = body.antennaEnabled || false;
    const dryRun = !!body.dryRun;

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

      const candleRange = highPrice - lowPrice;
      const syntheticSpread = c.spread || candleRange || Math.abs(closePrice - (prevPrice || closePrice));
      const syntheticVolume = vol || Math.max(1, Math.round(candleRange * 10));
      spikeHistory = [];
      const rates = stimulateFromPrice({
        price: closePrice,
        prevPrice: prevPrice || closePrice,
        volume: syntheticVolume,
        spread: syntheticSpread,
        epic: epic,
        pressure: pressure,
        boost: 25,
        steps: 50,
      });
      results.steps_run += 50;

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
        const slPrice = usePips ? (openTrade.entry - dir * stopLossPips) : (openTrade.entry - dir * openTrade.entry * stopLossPct / 100);
        const tpPrice = usePips ? (openTrade.entry + dir * takeProfitPips) : (openTrade.entry + dir * openTrade.entry * takeProfitPct / 100);

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
            if (!dryRun) { applyFeedback('sugar', { target: 'motor' }); applyFeedback('sugar', { target: 'mushroom' }); }
            results.sugar_count++;
          } else {
            if (!dryRun) applyFeedback('pain', { target: 'motor' });
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
    results.dry_run = dryRun;

    if (!dryRun) saveState();
    return respond(res, 200, results);
  }

  if (m === 'POST' && p === '/live-train') {
    if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
    const body = await parseBody(req);
    const candle = body.candle;
    const epic = body.epic || 'LIVE';
    const stopLossPips = body.stopLossPips || 0;
    const takeProfitPips = body.takeProfitPips || 0;
    const stopLossPct = stopLossPips ? 0 : (body.stopLossPct || 1.0);
    const takeProfitPct = takeProfitPips ? 0 : (body.takeProfitPct || 2.0);
    const usePips = stopLossPips > 0 || takeProfitPips > 0;
    const plMultiplier = body.plMultiplier || 1;
    const size = body.size || 1;
    const minHoldCandles = Math.max(0, parseInt(body.minHoldCandles) || 0);
    const signalThreshold = Math.max(0, parseFloat(body.signalThreshold) || 5);
    const confirmCandles = Math.max(1, parseInt(body.confirmCandles) || 1);
    const timeframe = body.timeframe || '';

    if (!candle || !candle.close) return respond(res, 400, { error: 'Candle with close price required' });

    const closePrice = candle.close;
    const highPrice = candle.high || closePrice;
    const lowPrice = candle.low || closePrice;
    const vol = candle.volume || 0;
    const prevPrice = candle.prevClose || closePrice;

    const pressure = body.pressure || {};
    const candleRange = highPrice - lowPrice;
    const syntheticSpread = candle.spread || candleRange || Math.abs(closePrice - prevPrice);
    const syntheticVolume = vol || Math.max(1, Math.round(candleRange * 10));

    spikeHistory = [];
    const rates = stimulateFromPrice({
      price: closePrice,
      prevPrice: prevPrice,
      volume: syntheticVolume,
      spread: syntheticSpread,
      epic: epic,
      pressure: pressure,
      boost: 25,
      steps: 50,
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
      const slPrice = usePips ? (ot.entry - dir * stopLossPips) : (ot.entry - dir * ot.entry * stopLossPct / 100);
      const tpPrice = usePips ? (ot.entry + dir * takeProfitPips) : (ot.entry + dir * ot.entry * takeProfitPct / 100);
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

  const CORTEX_STATE_FILE = path.join(DATA_DIR, 'cortex-state.json');

  if (m === 'GET' && p === '/cortex-state') {
    try {
      if (fs.existsSync(CORTEX_STATE_FILE)) {
        const raw = fs.readFileSync(CORTEX_STATE_FILE, 'utf-8');
        return respond(res, 200, JSON.parse(raw));
      }
      return respond(res, 200, { tradeLog: [], openPosition: null, decisionLog: [] });
    } catch (e) {
      return respond(res, 200, { tradeLog: [], openPosition: null, decisionLog: [] });
    }
  }

  if (m === 'POST' && p === '/cortex-state') {
    const state = await parseBody(req);
    try {
      state.savedAt = new Date().toISOString();
      const tmp = CORTEX_STATE_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(state));
      fs.renameSync(tmp, CORTEX_STATE_FILE);
      return respond(res, 200, { ok: true, savedAt: state.savedAt });
    } catch (e) {
      return respond(res, 500, { error: e.message });
    }
  }

  if (m === 'GET' && p === '/cortex-params') {
    try {
      if (fs.existsSync(CORTEX_STATE_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CORTEX_STATE_FILE, 'utf-8'));
        return respond(res, 200, {
          params: raw.params || {},
          autoTradeState: raw.autoTradeState || {},
          calibAutoPass: raw.calibAutoPass || false,
          calibAutoPassInterval: raw.calibAutoPassInterval || 30,
          savedAt: raw.savedAt || null,
          hasOpenPosition: !!(raw.openPosition && raw.openPosition.dealId),
        });
      }
      return respond(res, 200, { params: {}, autoTradeState: {}, calibAutoPass: false, calibAutoPassInterval: 30 });
    } catch (e) {
      return respond(res, 500, { error: e.message });
    }
  }

  if (m === 'POST' && p === '/cortex-params') {
    const newParams = await parseBody(req);
    try {
      let state = {};
      if (fs.existsSync(CORTEX_STATE_FILE)) {
        state = JSON.parse(fs.readFileSync(CORTEX_STATE_FILE, 'utf-8'));
      }
      if (!state.params) state.params = {};
      Object.assign(state.params, newParams.params || {});
      if (newParams.calibAutoPass !== undefined) state.calibAutoPass = newParams.calibAutoPass;
      if (newParams.calibAutoPassInterval !== undefined) state.calibAutoPassInterval = newParams.calibAutoPassInterval;
      state.savedAt = new Date().toISOString();
      state.lastModifiedBy = newParams._source || 'agent';
      const tmp = CORTEX_STATE_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(state));
      fs.renameSync(tmp, CORTEX_STATE_FILE);
      return respond(res, 200, { ok: true, savedAt: state.savedAt, paramsUpdated: Object.keys(newParams.params || {}) });
    } catch (e) {
      return respond(res, 500, { error: e.message });
    }
  }

  if (m === 'DELETE' && p === '/cortex-state') {
    try {
      if (fs.existsSync(CORTEX_STATE_FILE)) fs.unlinkSync(CORTEX_STATE_FILE);
      return respond(res, 200, { ok: true, cleared: true });
    } catch (e) {
      return respond(res, 500, { error: e.message });
    }
  }

  respond(res, 404, { error: 'Not found: ' + p });
}

function startServer(callback) {
  server = http.createServer(handleRequest);
  server.listen(BRAIN_PORT, '127.0.0.1', () => {
    actualPort = server.address().port;
    console.log('[brain-engine] Server listening on 127.0.0.1:' + actualPort);
    try { fs.writeFileSync(path.join(DATA_DIR, PORT_FILENAME), String(actualPort)); } catch (_) {}
    try {
      const wsDir = path.join(process.env.OPENCLAW_HOME || process.cwd(), '.openclaw');
      fs.mkdirSync(wsDir, { recursive: true });
      fs.writeFileSync(path.join(wsDir, PORT_FILENAME), String(actualPort));
    } catch (_) {}
    console.log('[brain-engine] Instance: ' + BRAIN_INSTANCE_ID + ', data: ' + DATA_DIR + ', port-file: ' + PORT_FILENAME);
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

const BRAIN_CRASH_FILE = path.join(DATA_DIR, 'brain-crash-last.json');

function writeCrashReport(type, err) {
  try {
    const report = {
      type,
      message: err ? (err.message || String(err)) : 'unknown',
      stack: err ? (err.stack || '') : '',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      neurons: N_TOTAL,
      synapses: synapses ? synapses.length : 0,
      steps: stepCount,
      pid: process.pid,
    };
    fs.writeFileSync(BRAIN_CRASH_FILE, JSON.stringify(report, null, 2));
    console.error('[brain-engine] CRASH REPORT written to ' + BRAIN_CRASH_FILE);
    console.error('[brain-engine] ' + type + ': ' + report.message);
  } catch (e2) {
    console.error('[brain-engine] Failed to write crash report:', e2.message);
  }
}

process.on('uncaughtException', (err) => {
  writeCrashReport('uncaughtException', err);
  try { saveState(); } catch (_) {}
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  writeCrashReport('unhandledRejection', reason);
  try { saveState(); } catch (_) {}
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[brain-engine] SIGTERM received, saving state...');
  try { saveState(); } catch (_) {}
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = { startServer, getPort, getServer, boot, step, getMotorRates, stimulateFromPrice, stimulateFromPreference, applyFeedback, replayTradingPatterns };
