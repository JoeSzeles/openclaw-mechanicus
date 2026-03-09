const http = require("http");
const db = require("./ig-scalper-db.cjs");
const strategyLoader = require("./strategies/index.cjs");
const ind = require("./indicators.cjs");

const PROXY_PORT = process.env.PORT || 5000;
const TOKEN = process.env.CEO_TOKEN || "";

function proxyFetch(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "127.0.0.1",
      port: PROXY_PORT,
      path,
      method: "GET",
      headers: { Authorization: "Bearer " + TOKEN }
    };
    const req = http.request(opts, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

function parsePrices(prices) {
  return prices.map((p) => {
    const om = p.openPrice || {};
    const hm = p.highPrice || {};
    const lm = p.lowPrice || {};
    const cm = p.closePrice || {};
    let rawTime = p.snapshotTimeUTC || p.snapshotTime || "";
    if (typeof rawTime === "string") rawTime = rawTime.replace(/\//g, "-");
    return {
      time: Math.floor(new Date(rawTime).getTime() / 1000),
      open: ((om.bid || 0) + (om.ask || 0)) / 2 || om.mid || 0,
      high: ((hm.bid || 0) + (hm.ask || 0)) / 2 || hm.mid || 0,
      low: ((lm.bid || 0) + (lm.ask || 0)) / 2 || lm.mid || 0,
      close: ((cm.bid || 0) + (cm.ask || 0)) / 2 || cm.mid || 0,
      volume: p.lastTradedVolume || 0
    };
  });
}

const BATCH_SIZE = 2000;
const BATCH_DELAY_MS = 1500;

async function fetchCandles(epic, resolution, max) {
  try {
    const stored = await db.getStoredCandles(epic, resolution, max);
    if (stored.length >= max) {
      const candles = stored.slice(-max).map(r => ({
        time: parseInt(r.ts), open: parseFloat(r.open), high: parseFloat(r.high),
        low: parseFloat(r.low), close: parseFloat(r.close), volume: parseInt(r.volume) || 0
      }));
      console.log(`[backtest] Using ${candles.length} cached candles from DB for ${epic} ${resolution}`);
      return candles;
    }
    if (stored.length > 0) {
      console.log(`[backtest] DB has ${stored.length}/${max} candles for ${epic} ${resolution}, fetching remainder from IG`);
    }
  } catch (dbErr) {
    console.log(`[backtest] DB cache check failed: ${dbErr.message}`);
  }

  if (max <= BATCH_SIZE) {
    const data = await proxyFetch(`/api/ig/pricehistory/${epic}?resolution=${resolution}&max=${max}`);
    if (!data || !data.prices || data.prices.length === 0) {
      console.log(`[backtest] IG API returned no data for ${epic} ${resolution}, trying stream fallback`);
      return fetchStreamCandles(epic, resolution, max);
    }
    return parsePrices(data.prices).sort((a, b) => a.time - b.time);
  }

  let allCandles = [];
  let toDate = "";
  let batches = 0;
  const maxBatches = Math.ceil(max / BATCH_SIZE) + 1;

  while (allCandles.length < max && batches < maxBatches) {
    let url = `/api/ig/pricehistory/${epic}?resolution=${resolution}&max=${BATCH_SIZE}`;
    if (toDate) url += `&to=${encodeURIComponent(toDate)}`;

    const data = await proxyFetch(url);
    if (!data || !data.prices || data.prices.length === 0) break;

    const candles = parsePrices(data.prices);
    if (candles.length === 0) break;

    allCandles = allCandles.concat(candles);
    batches++;

    const earliest = candles.reduce((min, c) => c.time < min ? c.time : min, candles[0].time);
    const newTo = new Date((earliest - 1) * 1000).toISOString().replace(/\.\d{3}Z$/, "");
    if (newTo === toDate) break;
    toDate = newTo;

    if (allCandles.length < max) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  if (allCandles.length === 0) {
    console.log(`[backtest] No data from IG API batches for ${epic} ${resolution}, trying stream fallback`);
    return fetchStreamCandles(epic, resolution, max);
  }

  if (allCandles.length < max && batches > 0) {
    console.log(`[backtest] Batch fetch stopped early: got ${allCandles.length}/${max} candles in ${batches} batches for ${epic} ${resolution}`);
  }

  const seen = new Set();
  const deduped = [];
  for (const c of allCandles) {
    if (!seen.has(c.time)) { seen.add(c.time); deduped.push(c); }
  }
  deduped.sort((a, b) => a.time - b.time);
  return deduped.slice(-max);
}

const RESOLUTION_SECONDS = { SECOND: 1, SECOND_2: 2, SECOND_5: 5, SECOND_10: 10, SECOND_20: 20, SECOND_30: 30, SECOND_40: 40, MINUTE: 60, MINUTE_5: 300, MINUTE_15: 900, HOUR: 3600, HOUR_4: 14400, DAY: 86400, WEEK: 604800 };

function aggregateCandles(candles, targetResSec) {
  if (!candles || candles.length === 0) return [];
  const buckets = new Map();
  for (const c of candles) {
    const bucketTs = Math.floor(c.time / targetResSec) * targetResSec;
    if (!buckets.has(bucketTs)) {
      buckets.set(bucketTs, { time: bucketTs, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0 });
    } else {
      const b = buckets.get(bucketTs);
      b.high = Math.max(b.high, c.high);
      b.low = Math.min(b.low, c.low);
      b.close = c.close;
      b.volume += c.volume || 0;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

async function fetchStreamCandles(epic, resolution, max) {
  const targetSec = RESOLUTION_SECONDS[resolution] || 60;
  const streamResolutions = ["SECOND", "SECOND_2", "SECOND_5", "SECOND_10", "SECOND_20", "SECOND_30", "SECOND_40", "MINUTE", "MINUTE_5", "MINUTE_15", "HOUR", "HOUR_4", "DAY"];
  let bestRes = resolution;
  const targetIdx = streamResolutions.indexOf(resolution);
  if (targetIdx < 0) bestRes = "SECOND";
  for (let i = targetIdx; i >= 0; i--) {
    bestRes = streamResolutions[i];
    break;
  }
  try {
    const data = await proxyFetch(`/api/ig/stream/candles?epic=${encodeURIComponent(epic)}&resolution=${encodeURIComponent(bestRes)}&max=${max * 10}`);
    if (!data || !data.prices || data.prices.length === 0) return [];
    let candles = parsePrices(data.prices).filter(c => c.time > 0).sort((a, b) => a.time - b.time);
    const bestSec = RESOLUTION_SECONDS[bestRes] || 1;
    if (bestSec < targetSec) {
      candles = aggregateCandles(candles, targetSec);
    }
    console.log(`[backtest] Stream fallback: ${candles.length} ${resolution} candles from ${bestRes} stream data for ${epic}`);
    return candles.slice(-max);
  } catch (e) {
    console.log(`[backtest] Stream fallback failed: ${e.message}`);
    return [];
  }
}

function calcEMA(prices, period) {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(prices, period) {
  if (prices.length < period + 1) return null;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function calcMACD(prices, fast, slow, signalPeriod) {
  if (prices.length < slow + signalPeriod) return null;
  const k = 2 / (fast + 1);
  const ks = 2 / (slow + 1);
  let fEma = prices.slice(0, fast).reduce((s, v) => s + v, 0) / fast;
  let sEma = prices.slice(0, slow).reduce((s, v) => s + v, 0) / slow;
  const macdSeries = [];
  for (let i = slow; i < prices.length; i++) {
    if (i >= fast) fEma = prices[i] * k + fEma * (1 - k);
    sEma = prices[i] * ks + sEma * (1 - ks);
    macdSeries.push(fEma - sEma);
  }
  if (macdSeries.length < signalPeriod) return null;
  const sigK = 2 / (signalPeriod + 1);
  let sig = macdSeries.slice(0, signalPeriod).reduce((s, v) => s + v, 0) / signalPeriod;
  for (let i = signalPeriod; i < macdSeries.length; i++) {
    sig = macdSeries[i] * sigK + sig * (1 - sigK);
  }
  return { macdLine: macdSeries[macdSeries.length - 1], signalLine: sig, histogram: macdSeries[macdSeries.length - 1] - sig };
}

function checkIndicators(closePrices, direction, strat) {
  if (strat.rsiEnabled) {
    const rsi = calcRSI(closePrices, strat.rsiPeriod || 14);
    if (rsi !== null) {
      if (direction === "BUY" && rsi > (strat.rsiOverbought || 70)) return false;
      if (direction === "SELL" && rsi < (strat.rsiOversold || 30)) return false;
    } else return false;
  }
  if (strat.emaEnabled) {
    const shortEma = calcEMA(closePrices, strat.emaShort || 9);
    const longEma = calcEMA(closePrices, strat.emaLong || 21);
    if (shortEma !== null && longEma !== null) {
      if (direction === "BUY" && shortEma <= longEma) return false;
      if (direction === "SELL" && shortEma >= longEma) return false;
    } else return false;
  }
  if (strat.macdEnabled) {
    const macd = calcMACD(closePrices, strat.macdFast || 12, strat.macdSlow || 26, strat.macdSignal || 9);
    if (macd !== null) {
      if (direction === "BUY" && macd.histogram < 0) return false;
      if (direction === "SELL" && macd.histogram > 0) return false;
    } else return false;
  }
  return true;
}

function igResolution(tf) {
  if (tf === "TICK") return "SECOND";
  const secondVariants = { SECOND_2: "SECOND", SECOND_5: "SECOND", SECOND_10: "SECOND", SECOND_20: "SECOND", SECOND_30: "SECOND", SECOND_40: "SECOND" };
  if (secondVariants[tf]) return secondVariants[tf];
  return tf;
}

async function runBacktest(strategyId, options = {}) {
  const strat = await db.getStrategy(strategyId);
  if (!strat) throw new Error("Strategy not found: " + strategyId);

  const timeframe = options.timeframe || strat.timeframe || "MINUTE";
  const candleCount = options.candleCount || 500;
  const fetchResolution = igResolution(timeframe);

  const candles = await fetchCandles(strat.instrument, fetchResolution, candleCount);
  if (candles.length < 20) throw new Error("Insufficient candle data: " + candles.length + " (resolution=" + fetchResolution + ")");

  const strategyType = strat.strategyType || "scalper";
  const stratInstance = strategyLoader.createInstance(strategyType, strat);
  const minMom = strat.minMomentumPct || 0.03;
  const tickWindow = strat.tickWindow || 15;
  const cooldownBars = Math.max(1, Math.round((strat.cooldownMs || 6000) / resolutionMs(timeframe)));
  const cs = strat.contractSize || 1;
  const size = strat.size || 1;
  const stopDist = strat.stopDistance || 0;
  const limitDist = strat.limitDistance || 0;
  const trailingStop = strat.trailingStop || 0;
  const profitTarget = strat.profitTarget || 0;

  const trades = [];
  let openTrade = null;
  let lastEntryBar = -cooldownBars;
  let peakPnl = 0;
  const equityCurve = [];

  const warmupBars = stratInstance
    ? Math.max(stratInstance.getRequiredBufferSize(), 10)
    : Math.max(tickWindow, strat.macdEnabled ? ((strat.macdSlow || 26) + (strat.macdSignal || 9) + 5) : 0, strat.emaEnabled ? ((strat.emaLong || 21) + 5) : 0, strat.rsiEnabled ? ((strat.rsiPeriod || 14) + 5) : 0);

  const hasExitParams = stopDist > 0 || limitDist > 0 || trailingStop > 0 || profitTarget > 0;
  console.log(`[backtest] Running strategy="${strategyType}" warmup=${warmupBars} candles=${candles.length} stop=${stopDist} limit=${limitDist} trail=${trailingStop} pt=${profitTarget} momentum=${minMom} tw=${tickWindow} dir=${strat.direction || "BOTH"} hasExitParams=${hasExitParams}`);

  let _debugSignals = 0, _debugNoMom = 0, _debugNoExit = 0, _debugCooldown = 0, _debugIndBlock = 0;

  for (let i = warmupBars; i < candles.length; i++) {
    const c = candles[i];

    if (openTrade) {
      const dir = openTrade.direction;
      const entryPrice = openTrade.entryPrice;
      const eStopDist = openTrade.stopDist || stopDist;
      const eLimitDist = openTrade.limitDist || limitDist;

      let exitPrice = null;
      let reason = null;

      if (eStopDist > 0) {
        const sl = dir === "BUY" ? entryPrice - eStopDist : entryPrice + eStopDist;
        if (dir === "BUY" && c.low <= sl) { exitPrice = sl; reason = "SL"; }
        if (dir === "SELL" && c.high >= sl) { exitPrice = sl; reason = "SL"; }
      }

      if (!reason && eLimitDist > 0) {
        const tp = dir === "BUY" ? entryPrice + eLimitDist : entryPrice - eLimitDist;
        if (dir === "BUY" && c.high >= tp) { exitPrice = tp; reason = "TP"; }
        if (dir === "SELL" && c.low <= tp) { exitPrice = tp; reason = "TP"; }
      }

      if (!reason && trailingStop > 0) {
        const unrealised = dir === "BUY" ? (c.high - entryPrice) : (entryPrice - c.low);
        if (unrealised > peakPnl) peakPnl = unrealised;
        if (peakPnl > trailingStop && (peakPnl - unrealised) > trailingStop * 0.5) {
          exitPrice = dir === "BUY" ? (c.high - trailingStop * 0.5) : (c.low + trailingStop * 0.5);
          reason = "TRAIL";
        }
      }

      if (!reason && profitTarget > 0) {
        const tSize = openTrade.size || size;
        const rawPnl = dir === "BUY" ? (c.close - entryPrice) * tSize * cs : (entryPrice - c.close) * tSize * cs;
        if (rawPnl >= profitTarget) { exitPrice = c.close; reason = "PT"; }
      }

      if (exitPrice !== null) {
        const tSize = openTrade.size || size;
        const pnl = dir === "BUY" ? (exitPrice - entryPrice) * tSize * cs : (entryPrice - exitPrice) * tSize * cs;
        const roundedPnl = Math.round(pnl * 100) / 100;
        trades.push({
          entryTime: openTrade.entryTime,
          entryBar: openTrade.entryBar,
          entryPrice: openTrade.entryPrice,
          exitTime: c.time,
          exitBar: i,
          exitPrice,
          direction: dir,
          pnl: roundedPnl,
          reason,
          size: openTrade.size || size
        });
        const cumPnl = trades.reduce((s, t) => s + t.pnl, 0);
        equityCurve.push({ time: c.time, pnl: roundedPnl, cumPnl: Math.round(cumPnl * 100) / 100, bar: i });
        openTrade = null;
        peakPnl = 0;
        lastEntryBar = i;
      }
      continue;
    }

    if (i - lastEntryBar < cooldownBars) { _debugCooldown++; continue; }

    let direction = null;
    let signalStopDist = stopDist;
    let signalLimitDist = limitDist;
    let signalSize = size;

    if (stratInstance) {
      const pseudoTicks = candles.slice(Math.max(0, i - warmupBars), i + 1).map(x => ({
        bid: x.close, offer: x.close, mid: x.close,
        spread: x.high - x.low, ts: x.time * 1000
      }));
      const spread = c.high - c.low;
      const context = { htfBias: null, accountBalance: 0, accountMargin: 0, spread, epic: strat.instrument, config: strat, breakEvenBuffer: 1.5 };
      let signal = stratInstance.safeEvaluateEntry(pseudoTicks, context);
      if (signal && typeof signal.then === "function") {
        try { signal = await signal; } catch (e) { signal = null; }
      }
      if (signal && signal.signal && signal.direction) {
        direction = signal.direction;
        if (signal.stopDist) signalStopDist = signal.stopDist;
        if (signal.limitDist) signalLimitDist = signal.limitDist;
        if (signal.size) signalSize = signal.size;
        _debugSignals++;
      }
    } else {
      const windowStart = Math.max(0, i - tickWindow);
      const firstClose = candles[windowStart].close;
      const lastClose = c.close;
      const momentumPct = ((lastClose - firstClose) / firstClose) * 100;
      const absMomentum = Math.abs(momentumPct);

      if (absMomentum < minMom) { _debugNoMom++; continue; }

      if (strat.direction === "BUY") {
        if (momentumPct > 0) direction = "BUY";
      } else if (strat.direction === "SELL") {
        if (momentumPct < 0) direction = "SELL";
      } else {
        if (momentumPct > minMom) direction = "BUY";
        else if (momentumPct < -minMom) direction = "SELL";
      }

      if (direction) {
        const closePrices = candles.slice(Math.max(0, i - 60), i + 1).map(x => x.close);
        if (!checkIndicators(closePrices, direction, strat)) { _debugIndBlock++; direction = null; }
        else _debugSignals++;
      }
    }

    if (!direction) continue;

    if (signalStopDist <= 0 && signalLimitDist <= 0 && trailingStop <= 0 && profitTarget <= 0) {
      const spread = c.high - c.low;
      if (spread > 0) {
        signalStopDist = spread * 3;
        signalLimitDist = spread * 4;
      } else {
        signalStopDist = c.close * 0.005;
        signalLimitDist = c.close * 0.007;
      }
    }

    openTrade = { direction, entryPrice: c.close, entryTime: c.time, entryBar: i, stopDist: signalStopDist, limitDist: signalLimitDist, size: signalSize };
    peakPnl = 0;
  }

  console.log(`[backtest] Diagnostics: signals=${_debugSignals} noMomentum=${_debugNoMom} indBlocked=${_debugIndBlock} cooldown=${_debugCooldown} trades=${trades.length}`);

  if (openTrade) {
    const lastCandle = candles[candles.length - 1];
    const tSize = openTrade.size || size;
    const pnl = openTrade.direction === "BUY"
      ? (lastCandle.close - openTrade.entryPrice) * tSize * cs
      : (openTrade.entryPrice - lastCandle.close) * tSize * cs;
    const roundedPnl = Math.round(pnl * 100) / 100;
    trades.push({
      entryTime: openTrade.entryTime,
      entryBar: openTrade.entryBar,
      entryPrice: openTrade.entryPrice,
      exitTime: lastCandle.time,
      exitBar: candles.length - 1,
      exitPrice: lastCandle.close,
      direction: openTrade.direction,
      pnl: roundedPnl,
      reason: "OPEN"
    });
    const cumPnl = trades.reduce((s, t) => s + t.pnl, 0);
    equityCurve.push({ time: lastCandle.time, pnl: roundedPnl, cumPnl: Math.round(cumPnl * 100) / 100, bar: candles.length - 1 });
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

  let maxDD = 0;
  let peak = 0;
  let equity = 0;
  for (const t of trades) {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDD) maxDD = dd;
  }

  const returns = trades.map(t => t.pnl);
  let sharpe = 0;
  if (returns.length > 1) {
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const std = Math.sqrt(variance);
    sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
  }

  const summary = {
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: Math.round(winRate * 10) / 10,
    totalPnl: Math.round(totalPnl * 100) / 100,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    sharpeRatio: Math.round(sharpe * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    candleCount: candles.length,
    timeframe,
    strategyType
  };

  return { trades, summary, equityCurve, candleData: candles, strategy: strat };
}

function resolutionMs(tf) {
  const map = {
    TICK: 1000, SECOND: 1000, MINUTE: 60000, MINUTE_2: 120000, MINUTE_3: 180000,
    MINUTE_5: 300000, MINUTE_10: 600000, MINUTE_15: 900000, MINUTE_30: 1800000,
    HOUR: 3600000, HOUR_2: 7200000, HOUR_3: 10800000, HOUR_4: 14400000,
    DAY: 86400000, WEEK: 604800000, MONTH: 2592000000
  };
  return map[tf] || 60000;
}

async function runAndSave(strategyId, options = {}) {
  const result = await runBacktest(strategyId, options);
  const strat = result.strategy;
  const s = result.summary;
  const saved = await db.saveBacktest({
    strategyId,
    timeframe: s.timeframe,
    candleCount: s.candleCount,
    totalTrades: s.totalTrades,
    winCount: s.winCount,
    lossCount: s.lossCount,
    winRate: s.winRate,
    totalPnl: s.totalPnl,
    maxDrawdown: s.maxDrawdown,
    sharpeRatio: s.sharpeRatio,
    avgWin: s.avgWin,
    avgLoss: s.avgLoss,
    trades: result.trades,
    configSnapshot: {
      instrument: strat.instrument,
      direction: strat.direction,
      strategyType: strat.strategyType || "scalper",
      size: strat.size,
      stopDistance: strat.stopDistance,
      limitDistance: strat.limitDistance,
      minMomentumPct: strat.minMomentumPct,
      cooldownMs: strat.cooldownMs,
      tickWindow: strat.tickWindow,
      profitTarget: strat.profitTarget,
      trailingStop: strat.trailingStop,
      rsiEnabled: strat.rsiEnabled, rsiPeriod: strat.rsiPeriod,
      emaEnabled: strat.emaEnabled, emaShort: strat.emaShort, emaLong: strat.emaLong,
      macdEnabled: strat.macdEnabled, macdFast: strat.macdFast, macdSlow: strat.macdSlow, macdSignal: strat.macdSignal
    }
  });
  return { id: saved.id, summary: s, trades: result.trades };
}

module.exports = { runBacktest, runAndSave };
