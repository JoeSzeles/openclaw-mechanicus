const fs = require("fs");
const path = require("path");
const http = require("http");

const DATA_DIR = path.join(process.cwd(), ".openclaw");
const DEFAULTS_FILE = path.join(DATA_DIR, "ig-scalper-defaults.json");
const CONFIG_FILE = path.join(DATA_DIR, "ig-scalper-config.json");
const ALERTS_FILE = path.join(DATA_DIR, "ig-alerts.json");

let db;
let dbAvailable = false;

async function initDb() {
  try {
    db = require("./ig-scalper-db.cjs");
    const cfg = await db.getConfig();
    if (cfg) { dbAvailable = true; log("INFO", "Database connected for scalper config"); }
  } catch (e) {
    log("WARN", "Database not available, falling back to JSON config: " + e.message);
    dbAvailable = false;
  }
}

const STRATEGY_DEFAULTS = {
  direction: "BOTH",
  enabled: false,
  size: 1,
  minMomentumPct: 0.03,
  cooldownMs: 6000,
  tickWindow: 15,
  maxOpenPositions: 2,
  minSize: 0.5,
  maxSize: 10,
  profitTarget: 0,
  trailingStop: 0,
  warmupMs: 60000,
  rsiEnabled: false, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30,
  emaEnabled: false, emaShort: 9, emaLong: 21,
  macdEnabled: false, macdFast: 12, macdSlow: 26, macdSignal: 9
};

let running = false;
let config = null;
let tickBuffers = {};
let candleBuffers = {};
let currentCandles = {};
let scalperPositions = [];
let realizedPnl = 0;
let tradeCount = 0;
let winCount = 0;
let lossCount = 0;
let cooldowns = {};
let accountBalance = 0;
let accountMargin = 0;
let lastBalanceFetch = 0;
let tradeLog = [];
let startedAt = null;
let proxyDeps = null;

const TIMEFRAME_MS = {
  TICK: 0, SECOND: 1000, SECOND_2: 2000, SECOND_5: 5000, SECOND_10: 10000,
  SECOND_20: 20000, SECOND_30: 30000, SECOND_40: 40000,
  MINUTE: 60000, MINUTE_2: 120000, MINUTE_3: 180000,
  MINUTE_5: 300000, MINUTE_10: 600000, MINUTE_15: 900000, MINUTE_30: 1800000,
  HOUR: 3600000, HOUR_2: 7200000, HOUR_3: 10800000, HOUR_4: 14400000,
  DAY: 86400000, WEEK: 604800000
};

function getCandlePeriodStart(ts, periodMs) {
  return Math.floor(ts / periodMs) * periodMs;
}

function aggregateTickToCandle(epic, tf, tickData) {
  const periodMs = TIMEFRAME_MS[tf];
  if (!periodMs || periodMs === 0) return null;

  const key = `${epic}:${tf}`;
  const now = tickData.timestamp || Date.now();
  const periodStart = getCandlePeriodStart(now, periodMs);

  if (!currentCandles[key] || currentCandles[key].periodStart !== periodStart) {
    const closedCandle = currentCandles[key] || null;
    currentCandles[key] = {
      periodStart,
      open: tickData.mid,
      high: tickData.mid,
      low: tickData.mid,
      close: tickData.mid,
      bid: tickData.bid,
      offer: tickData.offer,
      mid: tickData.mid,
      spread: tickData.offer - tickData.bid,
      ts: now,
      tickCount: 1
    };
    return closedCandle;
  }

  const c = currentCandles[key];
  if (tickData.mid > c.high) c.high = tickData.mid;
  if (tickData.mid < c.low) c.low = tickData.mid;
  c.close = tickData.mid;
  c.bid = tickData.bid;
  c.offer = tickData.offer;
  c.mid = tickData.mid;
  c.spread = tickData.offer - tickData.bid;
  c.ts = now;
  c.tickCount++;
  return null;
}

function candlesToTicks(candles) {
  return candles.map(c => ({
    bid: c.bid || c.close,
    offer: c.offer || c.close,
    mid: c.close,
    spread: c.spread || 0,
    ts: c.ts || c.periodStart
  }));
}

function log(level, msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] [scalper] [${level}] ${msg}`);
}

function stratIndicators(strat) {
  return {
    rsi: { enabled: !!strat.rsiEnabled, period: strat.rsiPeriod || 14, overbought: strat.rsiOverbought || 70, oversold: strat.rsiOversold || 30 },
    ema: { enabled: !!strat.emaEnabled, shortPeriod: strat.emaShort || 9, longPeriod: strat.emaLong || 21 },
    macd: { enabled: !!strat.macdEnabled, fast: strat.macdFast || 12, slow: strat.macdSlow || 26, signal: strat.macdSignal || 9 }
  };
}

async function loadConfig() {
  if (dbAvailable) {
    try {
      const cfg = await db.getConfig();
      const strategies = await db.getStrategies();
      config = {
        enabled: cfg.enabled !== false,
        budget: parseFloat(cfg.budget) || 5000,
        maxDrawdown: parseFloat(cfg.maxDrawdown) || 200,
        maxMarginPct: parseFloat(cfg.maxMarginPct) || 10,
        breakEvenBuffer: parseFloat(cfg.breakEvenBuffer) || 1.5,
        _drawdownTripped: !!cfg.drawdownTripped,
        strategies: strategies.map(s => ({
          id: s.id,
          instrument: s.instrument,
          name: s.name || s.instrument,
          direction: s.direction || "BOTH",
          enabled: s.enabled !== false,
          size: parseFloat(s.size) || 1,
          stopDistance: s.stopDistance ? parseFloat(s.stopDistance) : undefined,
          limitDistance: s.limitDistance ? parseFloat(s.limitDistance) : undefined,
          minMomentumPct: parseFloat(s.minMomentumPct) || 0.03,
          cooldownMs: parseInt(s.cooldownMs) || 6000,
          tickWindow: parseInt(s.tickWindow) || 15,
          maxOpenPositions: parseInt(s.maxOpenPositions) || 2,
          minSize: parseFloat(s.minSize) || 0.5,
          maxSize: parseFloat(s.maxSize) || 10,
          profitTarget: parseFloat(s.profitTarget) || 0,
          trailingStop: parseFloat(s.trailingStop) || 0,
          warmupMs: parseInt(s.warmupMs) || 60000,
          rsiEnabled: !!s.rsiEnabled, rsiPeriod: parseInt(s.rsiPeriod) || 14,
          rsiOverbought: parseInt(s.rsiOverbought) || 70, rsiOversold: parseInt(s.rsiOversold) || 30,
          emaEnabled: !!s.emaEnabled, emaShort: parseInt(s.emaShort) || 9, emaLong: parseInt(s.emaLong) || 21,
          macdEnabled: !!s.macdEnabled, macdFast: parseInt(s.macdFast) || 12,
          macdSlow: parseInt(s.macdSlow) || 26, macdSignal: parseInt(s.macdSignal) || 9,
          contractSize: s.contractSize ? parseFloat(s.contractSize) : undefined,
          dealId: s.dealId || undefined,
          timeframe: s.timeframe || "TICK"
        }))
      };
      return config;
    } catch (e) {
      log("ERROR", "DB loadConfig failed: " + e.message);
    }
  }
  return loadConfigFromFile();
}

function loadConfigFromFile() {
  try {
    const filePath = fs.existsSync(CONFIG_FILE) ? CONFIG_FILE : (fs.existsSync(DEFAULTS_FILE) ? DEFAULTS_FILE : null);
    if (filePath) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const globalInd = raw.indicators || {};
      config = {
        enabled: raw.enabled !== false,
        budget: raw.budget || 5000,
        maxDrawdown: raw.maxDrawdown || 200,
        maxMarginPct: raw.maxMarginPct || 10,
        breakEvenBuffer: raw.breakEvenBuffer || 1.5,
        _drawdownTripped: !!raw._drawdownTripped,
        strategies: (raw.strategies || []).map((s, i) => ({
          id: i,
          instrument: s.instrument,
          name: s.name || s.instrument,
          direction: s.direction || "BOTH",
          enabled: !!s.enabled,
          size: s.size || 1,
          stopDistance: s.stopDistance,
          limitDistance: s.limitDistance,
          minMomentumPct: s.minMomentumPct || raw.minMomentumPct || 0.03,
          cooldownMs: s.cooldownMs || raw.cooldownMs || 6000,
          tickWindow: s.tickWindow || raw.tickWindow || 15,
          maxOpenPositions: s.maxOpenPositions || raw.maxOpenPositions || 2,
          minSize: s.minSize || raw.minSize || 0.5,
          maxSize: s.maxSize || raw.maxSize || 10,
          profitTarget: s.profitTarget != null ? s.profitTarget : (raw.profitTarget || 0),
          trailingStop: s.trailingStop != null ? s.trailingStop : (raw.trailingStop || 0),
          warmupMs: s.warmupMs || raw.warmupMs || 60000,
          rsiEnabled: s.rsiEnabled != null ? s.rsiEnabled : !!(globalInd.rsi && globalInd.rsi.enabled),
          rsiPeriod: s.rsiPeriod || (globalInd.rsi && globalInd.rsi.period) || 14,
          rsiOverbought: s.rsiOverbought || (globalInd.rsi && globalInd.rsi.overbought) || 70,
          rsiOversold: s.rsiOversold || (globalInd.rsi && globalInd.rsi.oversold) || 30,
          emaEnabled: s.emaEnabled != null ? s.emaEnabled : !!(globalInd.ema && globalInd.ema.enabled),
          emaShort: s.emaShort || (globalInd.ema && globalInd.ema.shortPeriod) || 9,
          emaLong: s.emaLong || (globalInd.ema && globalInd.ema.longPeriod) || 21,
          macdEnabled: s.macdEnabled != null ? s.macdEnabled : !!(globalInd.macd && globalInd.macd.enabled),
          macdFast: s.macdFast || (globalInd.macd && globalInd.macd.fast) || 12,
          macdSlow: s.macdSlow || (globalInd.macd && globalInd.macd.slow) || 26,
          macdSignal: s.macdSignal || (globalInd.macd && globalInd.macd.signal) || 9,
          contractSize: s.contractSize,
          dealId: s.dealId,
          timeframe: s.timeframe || "TICK"
        }))
      };
    } else {
      config = { enabled: false, budget: 5000, maxDrawdown: 200, maxMarginPct: 10, breakEvenBuffer: 1.5, _drawdownTripped: false, strategies: [] };
    }
  } catch (e) {
    log("ERROR", "Failed to load config file: " + e.message);
    config = { enabled: false, budget: 5000, maxDrawdown: 200, maxMarginPct: 10, breakEvenBuffer: 1.5, _drawdownTripped: false, strategies: [] };
  }
  return config;
}

async function saveConfig() {
  if (dbAvailable) {
    try {
      await db.updateConfig({
        enabled: config.enabled,
        budget: config.budget,
        maxDrawdown: config.maxDrawdown,
        maxMarginPct: config.maxMarginPct,
        breakEvenBuffer: config.breakEvenBuffer,
        drawdownTripped: !!config._drawdownTripped
      });
    } catch (e) {
      log("ERROR", "DB saveConfig failed: " + e.message);
    }
    return;
  }
  try {
    const legacy = {
      enabled: config.enabled,
      budget: config.budget,
      maxMarginPct: config.maxMarginPct,
      maxDrawdown: config.maxDrawdown,
      breakEvenBuffer: config.breakEvenBuffer,
      _drawdownTripped: config._drawdownTripped,
      strategies: (config.strategies || []).map(s => ({
        instrument: s.instrument, name: s.name, direction: s.direction, size: s.size,
        enabled: s.enabled, stopDistance: s.stopDistance, limitDistance: s.limitDistance,
        minMomentumPct: s.minMomentumPct, dealId: s.dealId
      }))
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(legacy, null, 2));
  } catch (e) {
    log("ERROR", "Failed to save config file: " + e.message);
  }
}

async function saveStrategyField(strat, field, value) {
  if (dbAvailable && strat.id) {
    try { await db.updateStrategy(strat.id, { [field]: value }); } catch (e) { log("ERROR", "DB update strategy failed: " + e.message); }
  }
}

async function loadTradeLog() {
  const TRADE_LOG_FILE = path.join(DATA_DIR, "ig-scalper-trades.json");
  try {
    if (fs.existsSync(TRADE_LOG_FILE)) {
      const fileTrades = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, "utf8"));
      if (!Array.isArray(fileTrades) || fileTrades.length === 0) return;
      if (dbAvailable) {
        try {
          const dbTrades = await db.getTrades(1);
          if (dbTrades.length === 0 && fileTrades.length > 0) {
            log("INFO", `Importing ${fileTrades.length} file-based trades into DB`);
            for (const t of fileTrades) {
              try {
                const trade = {
                  type: (t.type || "").toUpperCase(),
                  dealId: t.dealId, epic: t.epic, direction: t.direction,
                  size: t.size, entryPrice: t.entry || t.entryPrice,
                  exitPrice: t.exit || t.exitPrice, pnl: t.pnl || 0,
                  strategyName: t.strategyName || t.strategy || null
                };
                if (t.timestamp || t.openedAt) trade.openedAt = t.timestamp || t.openedAt;
                if (t.closedAt) trade.closedAt = t.closedAt;
                await db.logTrade(trade);
              } catch (_) {}
            }
            log("INFO", "File trade import complete");
          }
        } catch (e) { log("WARN", "DB trade import check failed: " + e.message); }
        return;
      }
      tradeLog = fileTrades;
    }
  } catch (_) { tradeLog = []; }
}

function saveTradeLog() {
  if (dbAvailable) return;
  const TRADE_LOG_FILE = path.join(DATA_DIR, "ig-scalper-trades.json");
  try {
    if (tradeLog.length > 2000) tradeLog = tradeLog.slice(-2000);
    const data = JSON.stringify(tradeLog, null, 2);
    fs.writeFileSync(TRADE_LOG_FILE, data);
    const canvasDir = path.join(DATA_DIR, "canvas");
    if (fs.existsSync(canvasDir)) {
      fs.writeFileSync(path.join(canvasDir, "all-scalper-trades-data.json"), data);
    }
  } catch (_) {}
}

async function logTradeToDb(trade) {
  if (!dbAvailable) return;
  try { await db.logTrade(trade); } catch (e) { log("ERROR", "DB logTrade failed: " + e.message); }
}

function getHigherTimeframeBias(epic) {
  try {
    if (!fs.existsSync(ALERTS_FILE)) return null;
    const alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, "utf8"));
    if (!Array.isArray(alerts)) return null;
    const now = Date.now();
    const recent = alerts
      .filter(a => a.epic === epic && (now - new Date(a.timestamp).getTime()) < 5 * 60 * 1000)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let bullish = 0, bearish = 0;
    for (const a of recent) {
      if (a.type === "trend_up" || a.type === "reversal_up" || a.type === "breakout_above" || a.type === "session_high") bullish++;
      if (a.type === "trend_down" || a.type === "reversal_down" || a.type === "breakout_below" || a.type === "session_low") bearish++;
      if (a.type === "spike") bullish++;
      if (a.type === "drop") bearish++;
    }
    if (bullish > bearish && bullish >= 2) return "LONG";
    if (bearish > bullish && bearish >= 2) return "SHORT";
    return null;
  } catch (_) { return null; }
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

function downsampleTicks(ticks, numBars) {
  if (ticks.length <= numBars) return ticks.map(t => t.mid);
  const barSize = Math.floor(ticks.length / numBars);
  const bars = [];
  for (let i = 0; i < numBars; i++) {
    const start = i * barSize;
    const end = i === numBars - 1 ? ticks.length : (i + 1) * barSize;
    let sum = 0;
    for (let j = start; j < end; j++) sum += ticks[j].mid;
    bars.push(sum / (end - start));
  }
  return bars;
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
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
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
  const macdLine = macdSeries[macdSeries.length - 1];
  const histogram = macdLine - sig;
  return { macdLine, signalLine: sig, histogram };
}

function evaluateIndicators(ticks, direction, ind) {
  const rsiPeriod = (ind.rsi && ind.rsi.period) || 14;
  const barPrices = downsampleTicks(ticks, Math.max(rsiPeriod * 3, 40));
  const results = { passed: true, details: [] };

  if (ind.rsi && ind.rsi.enabled) {
    const rsi = calcRSI(barPrices, rsiPeriod);
    if (rsi !== null) {
      const ob = ind.rsi.overbought || 70;
      const os = ind.rsi.oversold || 30;
      if (direction === "BUY" && rsi > ob) {
        results.passed = false;
        results.details.push(`RSI=${rsi.toFixed(1)} overbought(>${ob}), blocking BUY`);
      } else if (direction === "SELL" && rsi < os) {
        results.passed = false;
        results.details.push(`RSI=${rsi.toFixed(1)} oversold(<${os}), blocking SELL`);
      } else {
        results.details.push(`RSI=${rsi.toFixed(1)} OK`);
      }
    } else {
      results.passed = false;
      results.details.push("RSI=insufficient data, blocking");
    }
  }

  if (ind.ema && ind.ema.enabled) {
    const shortEma = calcEMA(barPrices, ind.ema.shortPeriod || 9);
    const longEma = calcEMA(barPrices, ind.ema.longPeriod || 21);
    if (shortEma !== null && longEma !== null) {
      const emaBullish = shortEma > longEma;
      if (direction === "BUY" && !emaBullish) {
        results.passed = false;
        results.details.push(`EMA short(${shortEma.toFixed(2)})<long(${longEma.toFixed(2)}), blocking BUY`);
      } else if (direction === "SELL" && emaBullish) {
        results.passed = false;
        results.details.push(`EMA short(${shortEma.toFixed(2)})>long(${longEma.toFixed(2)}), blocking SELL`);
      } else {
        results.details.push(`EMA ${emaBullish ? "bullish" : "bearish"} OK`);
      }
    } else {
      results.passed = false;
      results.details.push("EMA=insufficient data, blocking");
    }
  }

  if (ind.macd && ind.macd.enabled) {
    const macd = calcMACD(barPrices, ind.macd.fast || 12, ind.macd.slow || 26, ind.macd.signal || 9);
    if (macd !== null) {
      if (direction === "BUY" && macd.histogram < 0) {
        results.passed = false;
        results.details.push(`MACD histogram=${macd.histogram.toFixed(4)}<0, blocking BUY`);
      } else if (direction === "SELL" && macd.histogram > 0) {
        results.passed = false;
        results.details.push(`MACD histogram=${macd.histogram.toFixed(4)}>0, blocking SELL`);
      } else {
        results.details.push(`MACD hist=${macd.histogram.toFixed(4)} OK`);
      }
    } else {
      results.passed = false;
      results.details.push("MACD=insufficient data, blocking");
    }
  }

  return results;
}

function requiredBufferSize(strat) {
  const ind = stratIndicators(strat);
  const hasInd = ind.rsi.enabled || ind.ema.enabled || ind.macd.enabled;
  const indMax = hasInd ? Math.max(
    (ind.macd.slow || 26) + (ind.macd.signal || 9) + 10,
    (ind.ema.longPeriod || 21) * 3,
    (ind.rsi.period || 14) * 4,
    80
  ) : 50;
  return Math.max(strat.tickWindow || 15, indMax);
}

function processTick(epic, tickData) {
  if (!running || !config || !config.enabled) return;

  if (!tickBuffers[epic]) tickBuffers[epic] = [];
  const buf = tickBuffers[epic];
  buf.push({
    bid: tickData.bid,
    offer: tickData.offer,
    mid: tickData.mid,
    spread: tickData.offer - tickData.bid,
    ts: tickData.timestamp || Date.now()
  });

  const matchingStrategies = (config.strategies || []).filter(s =>
    s.enabled && s.instrument === epic && !s.dealId
  );

  let maxTicks = 50;
  for (const strat of matchingStrategies) {
    const needed = requiredBufferSize(strat);
    if (needed > maxTicks) maxTicks = needed;
  }
  if (buf.length > maxTicks) buf.splice(0, buf.length - maxTicks);

  for (const strat of matchingStrategies) {
    const tf = strat.timeframe || "TICK";

    if (tf === "TICK" || !TIMEFRAME_MS[tf]) {
      evaluateEntry(strat, epic, buf);
      continue;
    }

    const closedCandle = aggregateTickToCandle(epic, tf, tickData);
    if (!closedCandle) continue;

    const cbKey = `${epic}:${tf}`;
    if (!candleBuffers[cbKey]) candleBuffers[cbKey] = [];
    candleBuffers[cbKey].push(closedCandle);
    const maxCandles = requiredBufferSize(strat);
    if (candleBuffers[cbKey].length > maxCandles) {
      candleBuffers[cbKey].splice(0, candleBuffers[cbKey].length - maxCandles);
    }

    const pseudoTicks = candlesToTicks(candleBuffers[cbKey]);
    evaluateEntry(strat, epic, pseudoTicks);
  }
}

async function evaluateEntry(strat, epic, ticks) {
  if (ticks.length < 5) return;

  const warmup = strat.warmupMs || 60000;
  if (startedAt && (Date.now() - startedAt) < warmup) return;

  const cooldownKey = `${epic}_${strat.id}`;
  if (cooldowns[cooldownKey] && Date.now() - cooldowns[cooldownKey] < (strat.cooldownMs || 6000)) return;

  const latest = ticks[ticks.length - 1];
  if (!latest.mid || !latest.bid || !latest.offer) return;
  if (latest.spread <= 0) return;

  const openScalperCount = scalperPositions.filter(p => p.status === "open").length;
  if (openScalperCount >= (strat.maxOpenPositions || 2)) return;

  const openRisk = scalperPositions
    .filter(p => p.status === "open")
    .reduce((sum, p) => sum + (p.riskAmount || 0), 0);
  const effectiveDrawdown = realizedPnl - openRisk;
  if (effectiveDrawdown <= -(config.maxDrawdown || 200) || realizedPnl <= -(config.maxDrawdown || 200)) {
    if (!config._drawdownTripped) {
      log("WARN", `Max drawdown hit (realized=${realizedPnl.toFixed(2)}, exposure=${openRisk.toFixed(2)}, effective=${effectiveDrawdown.toFixed(2)} <= -${config.maxDrawdown}). Scalper paused.`);
      config._drawdownTripped = true;
    }
    return;
  }

  const window = Math.min(ticks.length, strat.tickWindow || 15);
  const recentTicks = ticks.slice(-window);
  const firstMid = recentTicks[0].mid;
  const lastMid = recentTicks[recentTicks.length - 1].mid;
  const momentumPct = ((lastMid - firstMid) / firstMid) * 100;
  const absMomentum = Math.abs(momentumPct);

  const minMom = strat.minMomentumPct || 0.03;
  if (absMomentum < minMom) return;

  let direction = null;
  const htfBias = getHigherTimeframeBias(epic);

  if (strat.direction === "BUY") {
    if (momentumPct > 0) direction = "BUY";
  } else if (strat.direction === "SELL") {
    if (momentumPct < 0) direction = "SELL";
  } else {
    if (momentumPct > minMom) direction = "BUY";
    else if (momentumPct < -minMom) direction = "SELL";
    if (htfBias === "LONG" && direction === "SELL") return;
    if (htfBias === "SHORT" && direction === "BUY") return;
  }

  if (!direction) return;

  const ind = stratIndicators(strat);
  const hasIndicators = ind.rsi.enabled || ind.ema.enabled || ind.macd.enabled;
  if (hasIndicators) {
    const indResult = evaluateIndicators(ticks, direction, ind);
    if (!indResult.passed) {
      log("IND", `${epic} ${direction} blocked: ${indResult.details.join(", ")}`);
      return;
    }
    log("IND", `${epic} ${direction} confirmed: ${indResult.details.join(", ")}`);
  }

  const spread = latest.spread;
  const stopDist = strat.stopDistance || (spread * 3);
  const limitDist = strat.limitDistance || (spread * 4);

  const minMove = spread * (config.breakEvenBuffer || 1.5);
  if (limitDist < minMove) {
    return;
  }

  let size = strat.size || 1;
  const minSize = strat.minSize || 0.5;
  const maxSize = strat.maxSize || 10;
  if (size < minSize) size = minSize;
  if (size > maxSize) size = maxSize;
  let cs = strat.contractSize || 1;
  if (!strat.contractSize) {
    cs = await fetchPlMultiplier(strat.instrument || epic);
    strat.contractSize = cs;
    saveStrategyField(strat, "contractSize", cs);
  }
  const riskAmount = stopDist * size * cs;

  const totalScalperRisk = scalperPositions
    .filter(p => p.status === "open")
    .reduce((sum, p) => sum + (p.riskAmount || 0), 0);

  if (totalScalperRisk + riskAmount > (config.budget || 5000)) {
    return;
  }

  if (accountBalance > 0) {
    const marginPct = ((totalScalperRisk + riskAmount) / accountBalance) * 100;
    if (marginPct > (config.maxMarginPct || 10)) {
      return;
    }
  }

  cooldowns[cooldownKey] = Date.now();

  log("TRADE", `Signal: ${direction} ${epic} | momentum=${momentumPct.toFixed(4)}% | spread=${spread.toFixed(2)} | HTF=${htfBias || "neutral"} | size=${size} stop=${stopDist.toFixed(2)} limit=${limitDist.toFixed(2)}`);

  try {
    await openScalperTrade(strat, epic, direction, size, stopDist, limitDist, latest, momentumPct, htfBias);
  } catch (e) {
    log("ERROR", `Trade failed: ${e.message}`);
  }
}

async function fetchPlMultiplier(epic) {
  try {
    const data = await proxyGet("/api/ig/markets/" + epic);
    if (data && data.instrument) {
      const vop = parseFloat(data.instrument.valueOfOnePip) || 1;
      const sf = parseFloat(data.snapshot?.scalingFactor) || parseFloat(data.instrument?.scalingFactor) || 1;
      return vop * sf;
    }
  } catch (_) {}
  return 1;
}

async function openScalperTrade(strat, epic, direction, size, stopDist, limitDist, tick, momentum, htfBias) {
  const body = {
    epic,
    direction,
    size,
    orderType: "MARKET",
    forceOpen: true,
    stopDistance: stopDist,
    limitDistance: limitDist
  };

  const result = await proxyPost("/api/ig/positions/open", body);

  if (!result) {
    log("ERROR", "No response from trade API");
    return;
  }

  const plMultiplier = await fetchPlMultiplier(epic);

  const conf = result.confirmation || result;
  if (conf && conf.dealStatus === "ACCEPTED") {
    const entry = conf.level || tick.mid;
    const pos = {
      dealId: conf.dealId,
      epic,
      direction,
      size,
      entry,
      contractSize: plMultiplier,
      stopDistance: stopDist,
      limitDistance: limitDist,
      riskAmount: stopDist * size * plMultiplier,
      openedAt: new Date().toISOString(),
      momentum: momentum.toFixed(4),
      htfBias: htfBias || "neutral",
      status: "open",
      strategyId: strat.id,
      strategyName: strat.name || epic
    };
    scalperPositions.push(pos);
    tradeCount++;

    strat.dealId = conf.dealId;
    await saveStrategyField(strat, "dealId", conf.dealId);

    log("TRADE", `OPENED ${direction} ${size} ${epic} @ ${entry} dealId=${conf.dealId}`);

    const tradeEntry = {
      type: "open",
      dealId: conf.dealId,
      epic,
      direction,
      size,
      entry,
      stop: direction === "BUY" ? entry - stopDist : entry + stopDist,
      limit: direction === "BUY" ? entry + limitDist : entry - limitDist,
      momentum,
      htfBias,
      timestamp: new Date().toISOString()
    };
    tradeLog.push(tradeEntry);
    saveTradeLog();
    await logTradeToDb({ dealId: conf.dealId, epic, direction, size, entryPrice: entry, type: "OPEN", strategyName: strat.name || epic, openedAt: new Date().toISOString() });
  } else {
    const reason = conf ? (conf.reason || conf.dealStatus || "unknown") : "no confirmation";
    log("WARN", `Trade rejected: ${reason}`);
  }
}

async function checkPositions() {
  if (!running || scalperPositions.filter(p => p.status === "open").length === 0) return;

  try {
    const data = await proxyGet("/api/ig/positions");
    if (!data || !data.positions) {
      log("WARN", "Position check: no data from API (connection may be down), skipping");
      return;
    }

    if (!Array.isArray(data.positions)) return;

    const igPosMap = {};
    const openDealIds = new Set();
    for (const p of data.positions) {
      if (p.position && p.position.dealId) {
        openDealIds.add(p.position.dealId);
        igPosMap[p.position.dealId] = p;
      }
    }

    for (const sp of scalperPositions) {
      if (sp.status !== "open") continue;

      if (!openDealIds.has(sp.dealId)) {
        sp.status = "closed";
        sp.closedAt = new Date().toISOString();

        let exitPrice = sp.entry;
        const lastTick = tickBuffers[sp.epic];
        if (lastTick && lastTick.length > 0) {
          const lt = lastTick[lastTick.length - 1];
          exitPrice = sp.direction === "BUY" ? (lt.bid || sp.entry) : (lt.offer || sp.entry);
        }

        const cs = sp.contractSize || 1;
        const pnl = sp.direction === "BUY"
          ? (exitPrice - sp.entry) * sp.size * cs
          : (sp.entry - exitPrice) * sp.size * cs;

        sp.exitPrice = exitPrice;
        sp.pnl = pnl;
        realizedPnl += pnl;
        if (pnl >= 0) winCount++;
        else lossCount++;

        const strat = (config.strategies || []).find(s => s.dealId === sp.dealId);
        if (strat) {
          delete strat.dealId;
          await saveStrategyField(strat, "dealId", null);
        }

        log("TRADE", `CLOSED ${sp.direction} ${sp.epic} | P&L: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} | Total: ${realizedPnl.toFixed(2)}`);

        const tradeEntry = {
          type: "close",
          dealId: sp.dealId,
          epic: sp.epic,
          direction: sp.direction,
          size: sp.size,
          entry: sp.entry,
          exit: exitPrice,
          pnl,
          realizedTotal: realizedPnl,
          timestamp: new Date().toISOString()
        };
        tradeLog.push(tradeEntry);
        saveTradeLog();
        await logTradeToDb({ dealId: sp.dealId, epic: sp.epic, direction: sp.direction, size: sp.size, entryPrice: sp.entry, exitPrice, pnl, type: "CLOSE", strategyName: sp.strategyName, openedAt: sp.openedAt, closedAt: sp.closedAt });
        continue;
      }

      const igPos = igPosMap[sp.dealId];
      if (!igPos) continue;
      const mkt = igPos.market || {};
      const pos = igPos.position || {};
      const currentPrice = sp.direction === "BUY" ? (mkt.bid || 0) : (mkt.offer || 0);
      if (!currentPrice) continue;

      if (!sp.contractSize && mkt.plMultiplier) {
        sp.contractSize = parseFloat(mkt.plMultiplier) || 1;
      } else if (!sp.contractSize && mkt.valueOfOnePip && mkt.scalingFactor) {
        sp.contractSize = (parseFloat(mkt.valueOfOnePip) || 1) * (parseFloat(mkt.scalingFactor) || 1);
      } else if (!sp.contractSize && mkt.valueOfOnePip) {
        sp.contractSize = parseFloat(mkt.valueOfOnePip) || 1;
      }
      const cs = sp.contractSize || 1;

      const unrealized = sp.direction === "BUY"
        ? (currentPrice - sp.entry) * sp.size * cs
        : (sp.entry - currentPrice) * sp.size * cs;
      sp.unrealizedPnl = Math.round(unrealized * 100) / 100;

      const strat = (config.strategies || []).find(s => s.id === sp.strategyId);
      const profitTarget = strat ? (strat.profitTarget || 0) : 0;
      if (profitTarget > 0 && unrealized >= profitTarget) {
        log("TRADE", `PROFIT TARGET hit: ${sp.epic} unrealized=${unrealized.toFixed(2)} >= target=${profitTarget}. Closing...`);
        try {
          await proxyPost("/api/ig/positions/close", { dealId: sp.dealId });
        } catch (e) {
          log("ERROR", `Failed to close for profit target: ${e.message}`);
        }
        continue;
      }

      const trailingStop = strat ? (strat.trailingStop || 0) : 0;
      if (trailingStop > 0) {
        const priceMove = sp.direction === "BUY"
          ? currentPrice - sp.entry
          : sp.entry - currentPrice;

        if (priceMove > 0) {
          let newStop;
          if (sp.direction === "BUY") {
            newStop = currentPrice - trailingStop;
            const currentStop = pos.stopLevel || (sp.entry - sp.stopDistance);
            if (newStop > currentStop + 0.5) {
              log("TRAIL", `Moving stop UP for ${sp.epic}: ${currentStop.toFixed(2)} -> ${newStop.toFixed(2)} (price=${currentPrice.toFixed(2)})`);
              try {
                await proxyPut("/api/ig/positions/update", { dealId: sp.dealId, stopLevel: newStop });
                sp.trailingStopMoved = true;
              } catch (e) {
                log("ERROR", `Trailing stop update failed: ${e.message}`);
              }
            }
          } else {
            newStop = currentPrice + trailingStop;
            const currentStop = pos.stopLevel || (sp.entry + sp.stopDistance);
            if (newStop < currentStop - 0.5) {
              log("TRAIL", `Moving stop DOWN for ${sp.epic}: ${currentStop.toFixed(2)} -> ${newStop.toFixed(2)} (price=${currentPrice.toFixed(2)})`);
              try {
                await proxyPut("/api/ig/positions/update", { dealId: sp.dealId, stopLevel: newStop });
                sp.trailingStopMoved = true;
              } catch (e) {
                log("ERROR", `Trailing stop update failed: ${e.message}`);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    log("ERROR", "Position check failed: " + e.message);
  }
}

async function fetchBalance() {
  if (Date.now() - lastBalanceFetch < 30000) return;
  try {
    const data = await proxyGet("/api/ig/account");
    if (data && data.accounts) {
      const acct = data.accounts.find(a => a.preferred) || data.accounts[0];
      if (acct && acct.balance) {
        accountBalance = acct.balance.balance || 0;
        accountMargin = acct.balance.deposit || 0;
        lastBalanceFetch = Date.now();
      }
    }
  } catch (_) {}
}

function proxyGet(urlPath) {
  return new Promise((resolve) => {
    const opts = {
      hostname: "127.0.0.1",
      port: 5000,
      path: urlPath,
      method: "GET",
      headers: {
        "Authorization": "Bearer " + (process.env.OPENCLAW_GATEWAY_TOKEN || ""),
        "Accept": "application/json"
      },
      timeout: 10000
    };
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (_) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.end();
  });
}

function proxyPost(urlPath, body) {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname: "127.0.0.1",
      port: 5000,
      path: urlPath,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + (process.env.OPENCLAW_GATEWAY_TOKEN || ""),
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr)
      },
      timeout: 15000
    };
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (_) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(bodyStr);
    req.end();
  });
}

function proxyPut(urlPath, body) {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname: "127.0.0.1",
      port: 5000,
      path: urlPath,
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + (process.env.OPENCLAW_GATEWAY_TOKEN || ""),
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr)
      },
      timeout: 15000
    };
    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (_) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(bodyStr);
    req.end();
  });
}

let positionCheckInterval = null;
let balanceCheckInterval = null;

async function start() {
  if (running) {
    log("INFO", "Scalper already running, preserving state (reconnect-safe)");
    return;
  }

  await initDb();
  await loadConfig();

  if (!config.enabled) {
    config.enabled = true;
    await saveConfig();
    log("INFO", "Scalper auto-enabled via start()");
  }
  await loadTradeLog();

  const hadOpenPositions = scalperPositions.filter(p => p.status === "open").length;
  const isRestart = hadOpenPositions > 0;

  if (!isRestart) {
    scalperPositions = [];
    cooldowns = {};
    tickBuffers = {}; candleBuffers = {}; currentCandles = {};

    if (dbAvailable) {
      try {
        const stats = await db.getTradeStats();
        realizedPnl = stats.totalPnl;
        winCount = stats.wins;
        lossCount = stats.losses;
        tradeCount = stats.totalClosed;
      } catch (_) {
        realizedPnl = 0; tradeCount = 0; winCount = 0; lossCount = 0;
      }
    } else {
      const restoredPnl = tradeLog
        .filter(t => t.type === "close")
        .reduce((sum, t) => sum + (t.pnl || 0), 0);
      realizedPnl = restoredPnl;
      tradeCount = tradeLog.filter(t => t.type === "open").length;
      winCount = tradeLog.filter(t => t.type === "close" && t.pnl >= 0).length;
      lossCount = tradeLog.filter(t => t.type === "close" && t.pnl < 0).length;
    }
  } else {
    log("INFO", `Preserving ${hadOpenPositions} open position(s) across restart`);
    tickBuffers = {}; candleBuffers = {}; currentCandles = {};
    cooldowns = {};
  }

  try {
    const igData = await proxyGet("/api/ig/positions");
    if (igData && Array.isArray(igData.positions)) {
      const igDealIds = new Set(igData.positions.map(p => p.position?.dealId).filter(Boolean));
      for (const strat of (config.strategies || [])) {
        if (strat.dealId && !igDealIds.has(strat.dealId)) {
          log("INFO", `Clearing stale dealId ${strat.dealId} from strategy "${strat.name}" (position no longer open on IG)`);
          strat.dealId = null;
          if (dbAvailable) await saveStrategyField(strat, "dealId", null);
        }
      }
    }
  } catch (e) {
    log("WARN", `Stale dealId check failed: ${e.message}`);
  }

  running = true;
  startedAt = startedAt || Date.now();
  config._drawdownTripped = false;

  fetchBalance();
  if (positionCheckInterval) clearInterval(positionCheckInterval);
  if (balanceCheckInterval) clearInterval(balanceCheckInterval);
  positionCheckInterval = setInterval(checkPositions, 5000);
  balanceCheckInterval = setInterval(fetchBalance, 30000);

  const enabledStrategies = config.strategies.filter(s => s.enabled);
  log("INFO", `Scalper STARTED${isRestart ? " (reconnect)" : ""} | ${enabledStrategies.length} strategies | budget=$${config.budget} maxDD=$${config.maxDrawdown} | db=${dbAvailable ? "YES" : "file"} | openPos=${hadOpenPositions}`);
}

async function stop() {
  running = false;
  startedAt = null;
  if (positionCheckInterval) { clearInterval(positionCheckInterval); positionCheckInterval = null; }
  if (balanceCheckInterval) { clearInterval(balanceCheckInterval); balanceCheckInterval = null; }
  tickBuffers = {}; candleBuffers = {}; currentCandles = {};
  cooldowns = {};
  if (config) { config.enabled = false; await saveConfig(); }
  log("INFO", "Scalper STOPPED");
}

async function getStatus() {
  await loadConfig();
  const openPositions = scalperPositions.filter(p => p.status === "open");
  const unrealizedPnl = openPositions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
  const uptimeMs = startedAt ? Date.now() - startedAt : 0;
  const winRate = (winCount + lossCount) > 0 ? Math.round((winCount / (winCount + lossCount)) * 100) : 0;

  let allTrades = tradeLog;
  if (dbAvailable) {
    try { allTrades = await db.getTrades(200); } catch (_) {}
  }

  return {
    running,
    enabled: config ? config.enabled : false,
    uptimeMs,
    budget: config ? config.budget : 0,
    maxDrawdown: config ? config.maxDrawdown : 0,
    maxMarginPct: config ? config.maxMarginPct : 0,
    breakEvenBuffer: config ? config.breakEvenBuffer : 0,
    realizedPnl: Math.round(realizedPnl * 100) / 100,
    unrealizedPnl,
    tradeCount,
    winCount,
    lossCount,
    winRate,
    drawdownTripped: !!config?._drawdownTripped,
    openPositions: openPositions.length,
    positions: openPositions,
    accountBalance,
    accountMargin,
    strategies: config ? config.strategies : [],
    allTrades,
    recentTrades: (Array.isArray(allTrades) ? allTrades.slice(-20).reverse() : []),
    dbAvailable
  };
}

async function getConfigExport() {
  await loadConfig();
  return config;
}

async function updateConfigFromApi(updates) {
  await loadConfig();
  if (updates.budget !== undefined) { const v = Number(updates.budget); if (Number.isFinite(v) && v > 0) config.budget = v; }
  if (updates.maxMarginPct !== undefined) { const v = Number(updates.maxMarginPct); if (Number.isFinite(v) && v > 0 && v <= 100) config.maxMarginPct = v; }
  if (updates.maxDrawdown !== undefined) { const v = Number(updates.maxDrawdown); if (Number.isFinite(v) && v > 0) config.maxDrawdown = v; }
  if (updates.breakEvenBuffer !== undefined) { const v = Number(updates.breakEvenBuffer); if (Number.isFinite(v) && v > 0) config.breakEvenBuffer = v; }
  if (updates.enabled !== undefined) config.enabled = !!updates.enabled;
  await saveConfig();
  return config;
}

async function addStrategy(body) {
  if (!body.instrument) return { error: "Missing instrument (epic)" };
  if (!body.size || Number(body.size) <= 0) return { error: "Missing or invalid size" };

  const stratData = {
    instrument: String(body.instrument).trim(),
    name: body.name ? String(body.name).trim() : String(body.instrument).trim(),
    direction: (body.direction === "BUY" || body.direction === "SELL") ? body.direction : "BOTH",
    size: Number(body.size),
    enabled: body.enabled !== undefined ? !!body.enabled : false,
    stopDistance: body.stopDistance ? Number(body.stopDistance) : null,
    limitDistance: body.limitDistance ? Number(body.limitDistance) : null,
    minMomentumPct: body.minMomentumPct ? Number(body.minMomentumPct) : 0.03,
    cooldownMs: body.cooldownMs ? Number(body.cooldownMs) : 6000,
    tickWindow: body.tickWindow ? Number(body.tickWindow) : 15,
    maxOpenPositions: body.maxOpenPositions ? Number(body.maxOpenPositions) : 2,
    minSize: body.minSize ? Number(body.minSize) : 0.5,
    maxSize: body.maxSize ? Number(body.maxSize) : 10,
    profitTarget: body.profitTarget ? Number(body.profitTarget) : 0,
    trailingStop: body.trailingStop ? Number(body.trailingStop) : 0,
    warmupMs: body.warmupMs ? Number(body.warmupMs) : 60000,
    rsiEnabled: !!body.rsiEnabled, rsiPeriod: body.rsiPeriod ? Number(body.rsiPeriod) : 14,
    rsiOverbought: body.rsiOverbought ? Number(body.rsiOverbought) : 70, rsiOversold: body.rsiOversold ? Number(body.rsiOversold) : 30,
    emaEnabled: !!body.emaEnabled, emaShort: body.emaShort ? Number(body.emaShort) : 9, emaLong: body.emaLong ? Number(body.emaLong) : 21,
    macdEnabled: !!body.macdEnabled, macdFast: body.macdFast ? Number(body.macdFast) : 12,
    macdSlow: body.macdSlow ? Number(body.macdSlow) : 26, macdSignal: body.macdSignal ? Number(body.macdSignal) : 9
  };

  if (dbAvailable) {
    try {
      const row = await db.addStrategy(stratData);
      await loadConfig();
      return { ok: true, id: row.id, strategy: row };
    } catch (e) {
      return { error: "DB addStrategy failed: " + e.message };
    }
  }

  await loadConfig();
  const strat = { ...STRATEGY_DEFAULTS, ...stratData, id: config.strategies.length };
  config.strategies.push(strat);
  await saveConfig();
  return { ok: true, id: strat.id, strategy: strat };
}

async function updateStrategy(id, body) {
  if (dbAvailable) {
    try {
      const updated = await db.updateStrategy(id, body);
      if (!updated) return { error: "Strategy not found" };
      await loadConfig();
      return { ok: true, id, strategy: updated };
    } catch (e) {
      return { error: "DB updateStrategy failed: " + e.message };
    }
  }

  await loadConfig();
  const idx = config.strategies.findIndex(s => s.id === id || s.id === parseInt(id));
  if (idx < 0) return { error: "Strategy not found" };
  const s = config.strategies[idx];
  if (body.name !== undefined) s.name = String(body.name).trim();
  if (body.size !== undefined) { const v = Number(body.size); if (Number.isFinite(v) && v > 0) s.size = v; }
  if (body.direction !== undefined) s.direction = body.direction;
  if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (Number.isFinite(v) && v > 0) s.stopDistance = v; }
  if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (Number.isFinite(v) && v > 0) s.limitDistance = v; }
  if (body.minMomentumPct !== undefined) { const v = Number(body.minMomentumPct); if (Number.isFinite(v) && v > 0) s.minMomentumPct = v; }
  if (body.cooldownMs !== undefined) s.cooldownMs = Number(body.cooldownMs);
  if (body.tickWindow !== undefined) s.tickWindow = Number(body.tickWindow);
  if (body.maxOpenPositions !== undefined) s.maxOpenPositions = Number(body.maxOpenPositions);
  if (body.minSize !== undefined) s.minSize = Number(body.minSize);
  if (body.maxSize !== undefined) s.maxSize = Number(body.maxSize);
  if (body.profitTarget !== undefined) s.profitTarget = Number(body.profitTarget);
  if (body.trailingStop !== undefined) s.trailingStop = Number(body.trailingStop);
  if (body.warmupMs !== undefined) s.warmupMs = Number(body.warmupMs);
  if (body.enabled !== undefined) s.enabled = !!body.enabled;
  if (body.instrument !== undefined) s.instrument = String(body.instrument).trim();
  await saveConfig();
  return { ok: true, id, strategy: s };
}

async function deleteStrategy(id) {
  if (dbAvailable) {
    try {
      await db.deleteStrategy(id);
      await loadConfig();
      return { ok: true };
    } catch (e) {
      return { error: "DB deleteStrategy failed: " + e.message };
    }
  }

  await loadConfig();
  const idx = config.strategies.findIndex(s => s.id === id || s.id === parseInt(id));
  if (idx < 0) return { error: "Strategy not found" };
  const removed = config.strategies.splice(idx, 1)[0];
  await saveConfig();
  return { ok: true, removed };
}

async function toggleStrategy(id) {
  if (dbAvailable) {
    try {
      const updated = await db.toggleStrategy(id);
      if (!updated) return { error: "Strategy not found" };
      await loadConfig();
      return { ok: true, id, enabled: updated.enabled };
    } catch (e) {
      return { error: "DB toggleStrategy failed: " + e.message };
    }
  }

  await loadConfig();
  const idx = config.strategies.findIndex(s => s.id === id || s.id === parseInt(id));
  if (idx < 0) return { error: "Strategy not found" };
  config.strategies[idx].enabled = !config.strategies[idx].enabled;
  await saveConfig();
  return { ok: true, id, enabled: config.strategies[idx].enabled };
}

async function resetStats() {
  realizedPnl = 0;
  tradeCount = 0;
  winCount = 0;
  lossCount = 0;
  scalperPositions = [];
  tradeLog = [];
  saveTradeLog();
  if (dbAvailable) {
    try { await db.clearTrades(); } catch (e) { log("WARN", "DB clearTrades failed: " + e.message); }
  }
  if (config) {
    config._drawdownTripped = false;
    for (const s of (config.strategies || [])) {
      if (s.dealId) {
        delete s.dealId;
        await saveStrategyField(s, "dealId", null);
      }
    }
    await saveConfig();
  }
  log("INFO", "Stats reset (all strategy dealIds cleared, DB trades cleared)");
  return { ok: true };
}

module.exports = {
  processTick,
  start,
  stop,
  getStatus,
  getConfig: getConfigExport,
  updateConfig: updateConfigFromApi,
  addStrategy,
  updateStrategy,
  deleteStrategy,
  toggleStrategy,
  resetStats,
  loadConfig
};
