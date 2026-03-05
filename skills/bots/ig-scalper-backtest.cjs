const http = require("http");
const db = require("./ig-scalper-db.cjs");

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
    return {
      time: Math.floor(new Date(p.snapshotTimeUTC || p.snapshotTime).getTime() / 1000),
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
  if (max <= BATCH_SIZE) {
    const data = await proxyFetch(`/api/ig/pricehistory/${epic}?resolution=${resolution}&max=${max}`);
    if (!data || !data.prices) return [];
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

  const warmupBars = Math.max(tickWindow, strat.macdEnabled ? ((strat.macdSlow || 26) + (strat.macdSignal || 9) + 5) : 0, strat.emaEnabled ? ((strat.emaLong || 21) + 5) : 0, strat.rsiEnabled ? ((strat.rsiPeriod || 14) + 5) : 0);

  for (let i = warmupBars; i < candles.length; i++) {
    const c = candles[i];

    if (openTrade) {
      const dir = openTrade.direction;
      const entryPrice = openTrade.entryPrice;

      let exitPrice = null;
      let reason = null;

      if (stopDist > 0) {
        const sl = dir === "BUY" ? entryPrice - stopDist : entryPrice + stopDist;
        if (dir === "BUY" && c.low <= sl) { exitPrice = sl; reason = "SL"; }
        if (dir === "SELL" && c.high >= sl) { exitPrice = sl; reason = "SL"; }
      }

      if (!reason && limitDist > 0) {
        const tp = dir === "BUY" ? entryPrice + limitDist : entryPrice - limitDist;
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
        const rawPnl = dir === "BUY" ? (c.close - entryPrice) * size * cs : (entryPrice - c.close) * size * cs;
        if (rawPnl >= profitTarget) { exitPrice = c.close; reason = "PT"; }
      }

      if (exitPrice !== null) {
        const pnl = dir === "BUY" ? (exitPrice - entryPrice) * size * cs : (entryPrice - exitPrice) * size * cs;
        trades.push({
          entryTime: openTrade.entryTime,
          entryBar: openTrade.entryBar,
          entryPrice: openTrade.entryPrice,
          exitTime: c.time,
          exitBar: i,
          exitPrice,
          direction: dir,
          pnl: Math.round(pnl * 100) / 100,
          reason
        });
        openTrade = null;
        peakPnl = 0;
        lastEntryBar = i;
      }
      continue;
    }

    if (i - lastEntryBar < cooldownBars) continue;

    const windowStart = Math.max(0, i - tickWindow);
    const firstClose = candles[windowStart].close;
    const lastClose = c.close;
    const momentumPct = ((lastClose - firstClose) / firstClose) * 100;
    const absMomentum = Math.abs(momentumPct);

    if (absMomentum < minMom) continue;

    let direction = null;
    if (strat.direction === "BUY") {
      if (momentumPct > 0) direction = "BUY";
    } else if (strat.direction === "SELL") {
      if (momentumPct < 0) direction = "SELL";
    } else {
      if (momentumPct > minMom) direction = "BUY";
      else if (momentumPct < -minMom) direction = "SELL";
    }
    if (!direction) continue;

    const closePrices = candles.slice(Math.max(0, i - 60), i + 1).map(x => x.close);
    if (!checkIndicators(closePrices, direction, strat)) continue;

    if (stopDist <= 0 && limitDist <= 0 && trailingStop <= 0 && profitTarget <= 0) continue;

    openTrade = { direction, entryPrice: c.close, entryTime: c.time, entryBar: i };
    peakPnl = 0;
  }

  if (openTrade) {
    const lastCandle = candles[candles.length - 1];
    const pnl = openTrade.direction === "BUY"
      ? (lastCandle.close - openTrade.entryPrice) * size * cs
      : (openTrade.entryPrice - lastCandle.close) * size * cs;
    trades.push({
      entryTime: openTrade.entryTime,
      entryBar: openTrade.entryBar,
      entryPrice: openTrade.entryPrice,
      exitTime: lastCandle.time,
      exitBar: candles.length - 1,
      exitPrice: lastCandle.close,
      direction: openTrade.direction,
      pnl: Math.round(pnl * 100) / 100,
      reason: "OPEN"
    });
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
    timeframe
  };

  return { trades, summary, candleData: candles, strategy: strat };
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
