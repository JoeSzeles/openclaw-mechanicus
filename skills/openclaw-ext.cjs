'use strict';

const PROXY_BASE = process.env.OPENCLAW_PROXY_BASE || 'http://localhost:5000';

async function proxyGet(endpoint, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${PROXY_BASE}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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

function stub(name) {
  return async function (...args) {
    console.log(`[openclaw-ext] ${name}(${args.map(a => JSON.stringify(a)).join(', ')})`);
    return { result: null, command: name, args };
  };
}

async function fetchHistorical(epic, resolution, max) {
  console.log(`[openclaw-ext] fetchHistorical epic="${epic}" resolution="${resolution}" max=${max}`);
  try {
    const qs = new URLSearchParams({ resolution: resolution || 'HOUR', max: String(max || 50) });
    const result = await proxyGet(`/api/ig/pricehistory/${encodeURIComponent(epic)}?${qs}`);
    return result;
  } catch (err) {
    console.log(`[openclaw-ext] fetchHistorical proxy unavailable (${err.message}), returning stub`);
    return { result: null, command: 'fetchHistorical', args: [epic, resolution, max], error: err.message };
  }
}

async function marketScan(searchTerm, options) {
  console.log(`[openclaw-ext] marketScan searchTerm="${searchTerm}"`);
  try {
    const qs = searchTerm ? `?searchTerm=${encodeURIComponent(searchTerm)}` : '';
    const result = await proxyGet(`/api/ig/markets${qs}`);
    return result;
  } catch (err) {
    console.log(`[openclaw-ext] marketScan proxy unavailable (${err.message}), returning stub`);
    return { result: null, command: 'marketScan', args: [searchTerm, options], error: err.message };
  }
}

async function strategyEntry(epic, direction, size, options = {}) {
  console.log(`[openclaw-ext] strategyEntry epic="${epic}" dir="${direction}" size=${size}`);
  try {
    const result = await proxyPost('/api/ig/positions/open', {
      epic,
      direction: String(direction).toUpperCase(),
      size: Number(size),
      orderType: options.orderType || 'MARKET',
      currencyCode: options.currency || 'GBP',
      forceOpen: true,
      guaranteedStop: false,
      stopDistance: options.stopDistance || null,
      limitDistance: options.limitDistance || null
    });
    return result;
  } catch (err) {
    console.log(`[openclaw-ext] strategyEntry proxy unavailable (${err.message}), returning stub`);
    return { result: null, command: 'strategyEntry', args: [epic, direction, size, options], error: err.message };
  }
}

async function strategyExit(dealId, options = {}) {
  console.log(`[openclaw-ext] strategyExit dealId="${dealId}"`);
  try {
    const result = await proxyPost('/api/ig/positions/close', {
      dealId,
      size: options.size,
      direction: options.direction
    });
    return result;
  } catch (err) {
    console.log(`[openclaw-ext] strategyExit proxy unavailable (${err.message}), returning stub`);
    return { result: null, command: 'strategyExit', args: [dealId, options], error: err.message };
  }
}

async function strategyClose(dealId, options = {}) {
  console.log(`[openclaw-ext] strategyClose dealId="${dealId}"`);
  try {
    const result = await proxyPost('/api/ig/positions/close', {
      dealId,
      size: options.size,
      direction: options.direction
    });
    return result;
  } catch (err) {
    console.log(`[openclaw-ext] strategyClose proxy unavailable (${err.message}), returning stub`);
    return { result: null, command: 'strategyClose', args: [dealId, options], error: err.message };
  }
}

function computeIndicator(name, data, period) {
  if (!Array.isArray(data) || data.length === 0) return { value: null, command: name, period };
  const values = data.map(d => typeof d === 'number' ? d : (d.close || d.value || 0));
  const p = period || 14;
  const slice = values.slice(-p);
  if (slice.length === 0) return { value: null, command: name, period: p };

  switch (name) {
    case 'prtAverage': {
      const sum = slice.reduce((a, b) => a + b, 0);
      return { value: sum / slice.length, command: name, period: p };
    }
    case 'prtRsi': {
      if (slice.length < 2) return { value: 50, command: name, period: p };
      let gains = 0, losses = 0;
      for (let i = 1; i < slice.length; i++) {
        const diff = slice[i] - slice[i - 1];
        if (diff > 0) gains += diff; else losses -= diff;
      }
      const avgGain = gains / (slice.length - 1);
      const avgLoss = losses / (slice.length - 1);
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      return { value: 100 - (100 / (1 + rs)), command: name, period: p };
    }
    case 'prtBollinger': {
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
      const stdDev = Math.sqrt(variance);
      const mult = 2;
      return { upper: mean + mult * stdDev, middle: mean, lower: mean - mult * stdDev, command: name, period: p };
    }
    case 'prtHighest':
      return { value: Math.max(...slice), command: name, period: p };
    case 'prtLowest':
      return { value: Math.min(...slice), command: name, period: p };
    case 'prtSum':
      return { value: slice.reduce((a, b) => a + b, 0), command: name, period: p };
    case 'prtStd': {
      const m = slice.reduce((a, b) => a + b, 0) / slice.length;
      const v = slice.reduce((a, b) => a + (b - m) ** 2, 0) / slice.length;
      return { value: Math.sqrt(v), command: name, period: p };
    }
    default:
      return { value: null, command: name, period: p };
  }
}

module.exports = {
  timeInMarket: stub('timeInMarket'),
  timeSinceEvent: stub('timeSinceEvent'),
  schedule: stub('schedule'),
  waitUntil: stub('waitUntil'),
  marketScan,
  portfolioBuild: stub('portfolioBuild'),
  portfolioRebalance: stub('portfolioRebalance'),
  econData: stub('econData'),
  econIndicator: stub('econIndicator'),
  estimate: stub('estimate'),
  fetchHistorical,
  fetchMembers: stub('fetchMembers'),
  groupMembers: stub('groupMembers'),
  fiscalFlow: stub('fiscalFlow'),
  electionImpact: stub('electionImpact'),
  currencyCarry: stub('currencyCarry'),
  policySentiment: stub('policySentiment'),
  sanctionImpact: stub('sanctionImpact'),
  votePredict: stub('votePredict'),
  mathModel: stub('mathModel'),
  riskModel: stub('riskModel'),
  monteCarlo: stub('monteCarlo'),
  taskSchedule: stub('taskSchedule'),
  fileParse: stub('fileParse'),
  weatherImpact: stub('weatherImpact'),
  strategyEntry,
  strategyExit,
  strategyClose,
  inputInt: stub('inputInt'),
  inputFloat: stub('inputFloat'),
  inputBool: stub('inputBool'),
  inputSymbol: stub('inputSymbol'),
  timeframePeriod: stub('timeframePeriod'),
  timeframeIsDaily: stub('timeframeIsDaily'),
  arrayNew: stub('arrayNew'),
  arrayPush: stub('arrayPush'),
  matrixNew: stub('matrixNew'),
  matrixSet: stub('matrixSet'),
  prtAverage: (data, period) => computeIndicator('prtAverage', data, period),
  prtRsi: (data, period) => computeIndicator('prtRsi', data, period),
  prtMacd: stub('prtMacd'),
  prtBollinger: (data, period) => computeIndicator('prtBollinger', data, period),
  prtStochastic: stub('prtStochastic'),
  prtAtr: stub('prtAtr'),
  prtCci: stub('prtCci'),
  prtAdx: stub('prtAdx'),
  prtDonchian: stub('prtDonchian'),
  prtIchimoku: stub('prtIchimoku'),
  prtKeltnerchannel: stub('prtKeltnerchannel'),
  prtParabolicsar: stub('prtParabolicsar'),
  prtSupertrend: stub('prtSupertrend'),
  prtVolumebyprice: stub('prtVolumebyprice'),
  prtFibonacci: stub('prtFibonacci'),
  prtPivotpoint: stub('prtPivotpoint'),
  prtDemark: stub('prtDemark'),
  prtWilliams: stub('prtWilliams'),
  prtUltosc: stub('prtUltosc'),
  prtChaikin: stub('prtChaikin'),
  prtOnbalancevolume: stub('prtOnbalancevolume'),
  prtVwap: stub('prtVwap'),
  prtCum: stub('prtCum'),
  prtHighest: (data, period) => computeIndicator('prtHighest', data, period),
  prtLowest: (data, period) => computeIndicator('prtLowest', data, period),
  prtSum: (data, period) => computeIndicator('prtSum', data, period),
  prtStd: (data, period) => computeIndicator('prtStd', data, period),
  prtCorrelation: stub('prtCorrelation'),
  prtRegression: stub('prtRegression'),
  prtSummation: stub('prtSummation'),
  prtHistogram: stub('prtHistogram'),
  prtCross: stub('prtCross'),
  prtBarssince: stub('prtBarssince'),
  prtBarindex: stub('prtBarindex'),
  prtDate: stub('prtDate'),
  prtTime: stub('prtTime'),
  prtDefparam: stub('prtDefparam'),
  prtReturn: stub('prtReturn'),
  prtDrawline: stub('prtDrawline'),
  prtDrawarrow: stub('prtDrawarrow'),
  prtTimeframe: stub('prtTimeframe'),
};
