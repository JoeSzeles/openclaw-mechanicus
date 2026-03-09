const fs = require("fs");
const path = require("path");
const http = require("http");

const DATA_DIR = path.join(process.cwd(), ".openclaw");
const DEFAULTS_FILE = path.join(DATA_DIR, "ig-scalper-defaults.json");
const CONFIG_FILE = path.join(DATA_DIR, "ig-scalper-config.json");
const ALERTS_FILE = path.join(DATA_DIR, "ig-alerts.json");
const REJECTIONS_FILE = path.join(DATA_DIR, "canvas", "ig-rejections.json");

const strategyLoader = require("./strategies/index.cjs");

let db;
let dbAvailable = false;

async function initDb() {
  try {
    db = require("./ig-scalper-db.cjs");
    const cfg = await db.getConfig();
    if (cfg) { dbAvailable = true; log("INFO", "Database connected for Trade Claw config"); }
    if (db.ensureNewColumns) {
      try { await db.ensureNewColumns(); } catch (e) { log("WARN", "Column migration: " + e.message); }
    }
  } catch (e) {
    log("WARN", "Database not available, falling back to JSON config: " + e.message);
    dbAvailable = false;
  }
}

const STRATEGY_DEFAULTS = {
  direction: "BOTH",
  enabled: false,
  strategyType: "scalper",
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
let strategyInstances = {};

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
  console.log(`[${ts}] [trade-claw] [${level}] ${msg}`);
}

function logRejection(rejection) {
  try {
    const canvasDir = path.join(DATA_DIR, "canvas");
    if (!fs.existsSync(canvasDir)) fs.mkdirSync(canvasDir, { recursive: true });
    let existing = [];
    try {
      if (fs.existsSync(REJECTIONS_FILE)) {
        existing = JSON.parse(fs.readFileSync(REJECTIONS_FILE, "utf8"));
      }
    } catch (_) {}
    existing.push(rejection);
    if (existing.length > 200) existing = existing.slice(-200);
    fs.writeFileSync(REJECTIONS_FILE, JSON.stringify(existing, null, 2));
  } catch (_) {}
}

function writeAlertNotification(alertEntry) {
  try {
    let alerts = [];
    try {
      if (fs.existsSync(ALERTS_FILE)) {
        alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, "utf8"));
      }
    } catch (_) {}
    alerts.push(alertEntry);
    if (alerts.length > 500) alerts = alerts.slice(-500);
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  } catch (_) {}
}

function getStrategyInstance(strat) {
  const type = strat.strategyType || "scalper";
  const key = `${strat.id}_${type}`;
  if (!strategyInstances[key]) {
    try {
      strategyInstances[key] = strategyLoader.createInstance(type, strat);
      log("DEBUG", `Strategy instance created: ${type} for "${strat.name}" (id=${strat.id})`);
    } catch (e) {
      log("ERROR", `STRATEGY LOAD FAILED: "${type}" for "${strat.name}" (id=${strat.id}): ${e.message}. Strategy will be SKIPPED — no silent fallback.`);
      strategyInstances[key] = null;
    }
  } else if (strategyInstances[key]) {
    strategyInstances[key].config = strat;
  }
  return strategyInstances[key];
}

function requiredBufferSize(strat) {
  const instance = getStrategyInstance(strat);
  if (instance) {
    try { return instance.getRequiredBufferSize(); } catch (_) {}
  }
  const hasInd = strat.rsiEnabled || strat.emaEnabled || strat.macdEnabled;
  const indMax = hasInd ? Math.max(
    (strat.macdSlow || 26) + (strat.macdSignal || 9) + 10,
    (strat.emaLong || 21) * 3,
    (strat.rsiPeriod || 14) * 4,
    80
  ) : 50;
  return Math.max(strat.tickWindow || 15, indMax);
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
        demoMode: cfg.demoMode !== undefined ? !!cfg.demoMode : true,
        demoRejectPct: parseFloat(cfg.demoRejectPct) || 5,
        demoSlippageMin: parseFloat(cfg.demoSlippageMin) || 0.1,
        demoSlippageMax: parseFloat(cfg.demoSlippageMax) || 0.5,
        strategies: strategies.map(s => ({
          id: s.id,
          instrument: s.instrument,
          name: s.name || s.instrument,
          direction: s.direction || "BOTH",
          strategyType: s.strategyType || "scalper",
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
          adxEnabled: !!s.adxEnabled, adxPeriod: parseInt(s.adxPeriod) || 14, adxThreshold: parseFloat(s.adxThreshold) || 25,
          bollingerEnabled: !!s.bollingerEnabled, bollingerPeriod: parseInt(s.bollingerPeriod) || 20, bollingerSd: parseFloat(s.bollingerSd) || 2,
          stochasticEnabled: !!s.stochasticEnabled, stochasticK: parseInt(s.stochasticK) || 14, stochasticD: parseInt(s.stochasticD) || 3,
          stochasticOb: parseInt(s.stochasticOb) || 80, stochasticOs: parseInt(s.stochasticOs) || 20,
          atrEnabled: !!s.atrEnabled, atrPeriod: parseInt(s.atrPeriod) || 14, atrMultiplier: parseFloat(s.atrMultiplier) || 2,
          rocEnabled: !!s.rocEnabled, rocPeriod: parseInt(s.rocPeriod) || 12, rocThreshold: parseFloat(s.rocThreshold) || 5,
          cciEnabled: !!s.cciEnabled, cciPeriod: parseInt(s.cciPeriod) || 20, cciThreshold: parseFloat(s.cciThreshold) || 100,
          williamsEnabled: !!s.williamsEnabled, williamsPeriod: parseInt(s.williamsPeriod) || 14,
          keltnerEnabled: !!s.keltnerEnabled, keltnerPeriod: parseInt(s.keltnerPeriod) || 20, keltnerAtrMult: parseFloat(s.keltnerAtrMult) || 1.5,
          ichimokuEnabled: !!s.ichimokuEnabled, ichimokuTenkan: parseInt(s.ichimokuTenkan) || 9,
          ichimokuKijun: parseInt(s.ichimokuKijun) || 26, ichimokuSenkou: parseInt(s.ichimokuSenkou) || 52,
          parabolicSarEnabled: !!s.parabolicSarEnabled, sarAccel: parseFloat(s.sarAccel) || 0.02, sarMax: parseFloat(s.sarMax) || 0.2,
          aroonEnabled: !!s.aroonEnabled, aroonPeriod: parseInt(s.aroonPeriod) || 25,
          obvEnabled: !!s.obvEnabled, vwapEnabled: !!s.vwapEnabled,
          zscoreEnabled: !!s.zscoreEnabled, zscorePeriod: parseInt(s.zscorePeriod) || 20, zscoreThreshold: parseFloat(s.zscoreThreshold) || 2,
          fibEnabled: !!s.fibEnabled, fibLookback: parseInt(s.fibLookback) || 50,
          gridLevels: parseInt(s.gridLevels) || 5, gridSpacing: parseFloat(s.gridSpacing) || 0,
          kellyEnabled: !!s.kellyEnabled, sentimentEnabled: !!s.sentimentEnabled,
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
          strategyType: s.strategyType || "scalper",
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
        minMomentumPct: s.minMomentumPct, dealId: s.dealId, strategyType: s.strategyType
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
      log("WARN", `Max drawdown hit (realized=${realizedPnl.toFixed(2)}, exposure=${openRisk.toFixed(2)}, effective=${effectiveDrawdown.toFixed(2)} <= -${config.maxDrawdown}). Engine paused.`);
      config._drawdownTripped = true;
    }
    return;
  }

  const htfBias = getHigherTimeframeBias(epic);
  const spread = latest.spread;

  const instance = getStrategyInstance(strat);
  if (!instance) return;

  const context = {
    htfBias,
    accountBalance,
    accountMargin,
    spread,
    epic,
    config: strat,
    breakEvenBuffer: config.breakEvenBuffer || 1.5
  };

  const signal = instance.safeEvaluateEntry(ticks, context);
  if (!signal || !signal.signal || !signal.direction) return;

  const direction = signal.direction;
  const stopDist = signal.stopDist || strat.stopDistance || (spread * 3);
  const limitDist = signal.limitDist || strat.limitDistance || (spread * 4);

  const minMove = spread * (config.breakEvenBuffer || 1.5);
  if (limitDist < minMove) return;

  let size = signal.size || strat.size || 1;
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

  if (totalScalperRisk + riskAmount > (config.budget || 5000)) return;

  if (accountBalance > 0) {
    const marginPct = ((totalScalperRisk + riskAmount) / accountBalance) * 100;
    if (marginPct > (config.maxMarginPct || 10)) return;
  }

  cooldowns[cooldownKey] = Date.now();

  const reason = signal.reason || "";
  log("TRADE", `Signal [${strat.strategyType || "scalper"}]: ${direction} ${epic} | ${reason} | spread=${spread.toFixed(2)} | size=${size} stop=${stopDist.toFixed(2)} limit=${limitDist.toFixed(2)}`);

  try {
    await openTrade(strat, epic, direction, size, stopDist, limitDist, latest, reason, htfBias);
  } catch (e) {
    const errMsg = `Trade execution failed: ${e.message} | strategy="${strat.name || epic}" type="${strat.strategyType || "scalper"}" instrument=${epic} direction=${direction} size=${size} stop=${stopDist.toFixed(2)} limit=${limitDist.toFixed(2)}`;
    log("ERROR", errMsg);
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "trade-claw-engine",
      strategyName: strat.name || epic,
      strategyType: strat.strategyType || "scalper",
      instrument: epic,
      direction,
      size,
      stopDistance: stopDist,
      limitDistance: limitDist,
      reason: "Execution error: " + e.message,
      igErrorCode: "EXECUTION_ERROR",
      details: errMsg
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic, name: strat.name || epic, message: errMsg, mid: latest.mid });
    tradeLog.push({ type: "rejection", timestamp: new Date().toISOString(), epic, direction, size, reason: "Execution error: " + e.message, strategyName: strat.name || epic });
    saveTradeLog();
  }
}

const marketDetailsCache = {};

async function fetchMarketDetails(epic) {
  if (marketDetailsCache[epic] && (Date.now() - marketDetailsCache[epic]._ts < 300000)) {
    return marketDetailsCache[epic];
  }
  try {
    const data = await proxyGet("/api/ig/markets/" + epic);
    if (data && data.instrument) {
      const vop = parseFloat(data.instrument.valueOfOnePip) || 1;
      const sf = parseFloat(data.snapshot?.scalingFactor) || parseFloat(data.instrument?.scalingFactor) || 1;
      const spread = data.snapshot ? (data.snapshot.offer - data.snapshot.bid) : 0;
      const controlledRiskExtra = data.snapshot?.controlledRiskExtraSpread || 0;
      const minNormal = data.dealingRules?.minNormalStopOrLimitDistance?.value || null;
      const minControlled = data.dealingRules?.minControlledRiskStopDistance?.value || null;
      const price = data.snapshot ? ((data.snapshot.bid + data.snapshot.offer) / 2) : 0;
      const details = {
        plMultiplier: vop * sf,
        spread,
        controlledRiskExtra,
        minNormalStop: minNormal,
        minControlledStop: minControlled,
        price,
        _ts: Date.now()
      };
      marketDetailsCache[epic] = details;
      return details;
    }
  } catch (_) {}
  return { plMultiplier: 1, spread: 0, controlledRiskExtra: 0, minNormalStop: null, minControlledStop: null, price: 0, _ts: Date.now() };
}

async function fetchPlMultiplier(epic) {
  const details = await fetchMarketDetails(epic);
  return details.plMultiplier;
}

function computeMinStopDistance(details) {
  const candidates = [];
  if (details.minNormalStop) candidates.push(details.minNormalStop);
  if (details.controlledRiskExtra > 0) candidates.push(details.controlledRiskExtra + details.spread + 10);
  if (details.spread > 0) candidates.push(details.spread * 8);
  if (details.price > 10000) candidates.push(details.price * 0.01);
  if (candidates.length === 0) return 0;
  return Math.max(...candidates);
}

async function openTrade(strat, epic, direction, size, stopDist, limitDist, tick, reason, htfBias) {
  if (config.demoMode) {
    const rejectChance = config.demoRejectPct || 5;
    if (Math.random() * 100 < rejectChance) {
      const rejMsg = `Simulated rejection for ${direction} ${epic} size=${size} stop=${stopDist} limit=${limitDist} strategy="${strat.name || epic}" type="${strat.strategyType || "scalper"}" (${rejectChance}% chance)`;
      log("ERROR", `TRADE REJECTED (demo): ${rejMsg}`);
      const rejection = {
        timestamp: new Date().toISOString(),
        type: "trade_rejected",
        source: "trade-claw-engine",
        engine: "demo",
        strategyName: strat.name || epic,
        strategyType: strat.strategyType || "scalper",
        instrument: epic,
        direction,
        size,
        stopDistance: stopDist,
        limitDistance: limitDist,
        reason: "Demo simulated rejection",
        igErrorCode: "DEMO_REJECT",
        details: rejMsg
      };
      logRejection(rejection);
      writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic, name: strat.name || epic, message: rejMsg, mid: tick.mid });
      tradeLog.push({ type: "rejection", timestamp: new Date().toISOString(), epic, direction, size, reason: "Demo simulated rejection", strategyName: strat.name || epic });
      saveTradeLog();
      return;
    }
  }

  const mktDetails = await fetchMarketDetails(epic);
  const minStop = computeMinStopDistance(mktDetails);
  if (minStop > 0) {
    if (stopDist < minStop) {
      log("INFO", `Auto-adjusting stopDistance ${stopDist.toFixed(1)} -> ${Math.ceil(minStop)} for ${epic} (minRequired=${minStop.toFixed(1)}, spread=${mktDetails.spread}, crExtra=${mktDetails.controlledRiskExtra})`);
      stopDist = Math.ceil(minStop);
    }
    if (limitDist < minStop) {
      log("INFO", `Auto-adjusting limitDistance ${limitDist.toFixed(1)} -> ${Math.ceil(minStop)} for ${epic}`);
      limitDist = Math.ceil(minStop);
    }
  }

  const body = {
    epic,
    direction,
    size,
    orderType: "MARKET",
    forceOpen: true,
    stopDistance: stopDist,
    limitDistance: limitDist
  };

  let result;
  try {
    result = await proxyPost("/api/ig/positions/open", body);
  } catch (apiErr) {
    const errMsg = `API error opening trade: ${apiErr.message} | strategy="${strat.name || epic}" type="${strat.strategyType || "scalper"}" instrument=${epic} direction=${direction} size=${size}`;
    log("ERROR", errMsg);
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "trade-claw-engine",
      strategyName: strat.name || epic,
      strategyType: strat.strategyType || "scalper",
      instrument: epic,
      direction,
      size,
      stopDistance: stopDist,
      limitDistance: limitDist,
      reason: "API network error: " + apiErr.message,
      igErrorCode: "NETWORK_ERROR",
      details: errMsg
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic, name: strat.name || epic, message: errMsg, mid: tick.mid });
    tradeLog.push({ type: "rejection", timestamp: new Date().toISOString(), epic, direction, size, reason: "API error: " + apiErr.message, strategyName: strat.name || epic });
    saveTradeLog();
    return;
  }

  if (!result) {
    const errMsg = `No response from trade API | strategy="${strat.name || epic}" type="${strat.strategyType || "scalper"}" instrument=${epic} direction=${direction} size=${size} stop=${stopDist} limit=${limitDist}`;
    log("ERROR", errMsg);
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "trade-claw-engine",
      strategyName: strat.name || epic,
      strategyType: strat.strategyType || "scalper",
      instrument: epic,
      direction,
      size,
      stopDistance: stopDist,
      limitDistance: limitDist,
      reason: "No response from trade API",
      igErrorCode: "NO_RESPONSE",
      details: errMsg
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic, name: strat.name || epic, message: errMsg, mid: tick.mid });
    tradeLog.push({ type: "rejection", timestamp: new Date().toISOString(), epic, direction, size, reason: "No API response", strategyName: strat.name || epic });
    saveTradeLog();
    return;
  }

  const plMultiplier = await fetchPlMultiplier(epic);

  const conf = result.confirmation || result;
  if (conf && conf.dealStatus === "ACCEPTED") {
    let entry = conf.level || tick.mid;
    if (config.demoMode) {
      const slipMin = config.demoSlippageMin || 0.1;
      const slipMax = config.demoSlippageMax || 0.5;
      const slip = slipMin + Math.random() * (slipMax - slipMin);
      const slipDir = direction === "BUY" ? 1 : -1;
      entry += slip * slipDir;
      log("DEMO", `Simulated slippage ${slip.toFixed(3)} pts on ${direction} ${epic} (entry adjusted to ${entry.toFixed(5)})`);
    }
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
      reason: reason || "",
      htfBias: htfBias || "neutral",
      status: "open",
      strategyId: strat.id,
      strategyName: strat.name || epic,
      strategyType: strat.strategyType || "scalper"
    };
    scalperPositions.push(pos);
    tradeCount++;

    strat.dealId = conf.dealId;
    await saveStrategyField(strat, "dealId", conf.dealId);

    log("TRADE", `OPENED ${direction} ${size} ${epic} @ ${entry} dealId=${conf.dealId} [${strat.strategyType || "scalper"}]`);

    const tradeEntry = {
      type: "open",
      dealId: conf.dealId,
      epic,
      direction,
      size,
      entry,
      stop: direction === "BUY" ? entry - stopDist : entry + stopDist,
      limit: direction === "BUY" ? entry + limitDist : entry - limitDist,
      reason,
      htfBias,
      timestamp: new Date().toISOString()
    };
    tradeLog.push(tradeEntry);
    saveTradeLog();
    await logTradeToDb({ dealId: conf.dealId, epic, direction, size, entryPrice: entry, type: "OPEN", strategyName: strat.name || epic, openedAt: new Date().toISOString() });
  } else {
    const rejectReason = conf ? (conf.reason || conf.dealStatus || "unknown") : "no confirmation";
    const igErrorCode = conf ? (conf.reason || conf.dealStatus || "UNKNOWN") : "NO_CONFIRMATION";
    const rejMsg = `TRADE REJECTED by IG: strategy="${strat.name || epic}" type="${strat.strategyType || "scalper"}" instrument=${epic} direction=${direction} size=${size} stop=${stopDist.toFixed(2)} limit=${limitDist.toFixed(2)} reason="${rejectReason}" igErrorCode="${igErrorCode}" dealRef=${conf ? (conf.dealReference || conf.dealId || "none") : "none"}`;
    log("ERROR", rejMsg);
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "trade-claw-engine",
      strategyName: strat.name || epic,
      strategyType: strat.strategyType || "scalper",
      instrument: epic,
      direction,
      size,
      stopDistance: stopDist,
      limitDistance: limitDist,
      reason: rejectReason,
      igErrorCode,
      dealReference: conf ? (conf.dealReference || conf.dealId || null) : null,
      details: rejMsg,
      rawResponse: conf
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic, name: strat.name || epic, message: rejMsg, mid: tick.mid });
    tradeLog.push({ type: "rejection", timestamp: new Date().toISOString(), epic, direction, size, reason: rejectReason, igErrorCode, strategyName: strat.name || epic });
    saveTradeLog();
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
    log("INFO", "Trade Claw already running, preserving state (reconnect-safe)");
    return;
  }

  await initDb();
  await loadConfig();

  strategyLoader.loadStrategies();

  if (!config.enabled) {
    config.enabled = true;
    await saveConfig();
    log("INFO", "Trade Claw auto-enabled via start()");
  }
  await loadTradeLog();

  const hadOpenPositions = scalperPositions.filter(p => p.status === "open").length;
  const isRestart = hadOpenPositions > 0;

  if (!isRestart) {
    scalperPositions = [];
    cooldowns = {};
    tickBuffers = {}; candleBuffers = {}; currentCandles = {};
    strategyInstances = {};

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
  const types = [...new Set(enabledStrategies.map(s => s.strategyType || "scalper"))];
  log("INFO", `Trade Claw STARTED${isRestart ? " (reconnect)" : ""} | ${enabledStrategies.length} strategies (types: ${types.join(", ")}) | budget=$${config.budget} maxDD=$${config.maxDrawdown} | db=${dbAvailable ? "YES" : "file"} | openPos=${hadOpenPositions}`);
}

async function stop() {
  running = false;
  startedAt = null;
  if (positionCheckInterval) { clearInterval(positionCheckInterval); positionCheckInterval = null; }
  if (balanceCheckInterval) { clearInterval(balanceCheckInterval); balanceCheckInterval = null; }
  tickBuffers = {}; candleBuffers = {}; currentCandles = {};
  cooldowns = {};
  strategyInstances = {};
  if (config) { config.enabled = false; await saveConfig(); }
  log("INFO", "Trade Claw STOPPED");
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
    demoMode: config ? !!config.demoMode : true,
    openPositions: openPositions.length,
    positions: openPositions,
    accountBalance,
    accountMargin,
    strategies: config ? config.strategies : [],
    allTrades,
    recentTrades: (Array.isArray(allTrades) ? allTrades.slice(-20).reverse() : []),
    dbAvailable,
    availableStrategyTypes: strategyLoader.listStrategies()
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
    strategyType: body.strategyType || "scalper",
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
  const previousType = (config?.strategies || []).find(s => s.id === id || s.id === parseInt(id))?.strategyType;
  const newType = body.strategyType;
  if (newType && previousType && newType !== previousType) {
    const strat = (config?.strategies || []).find(s => s.id === id || s.id === parseInt(id));
    if (strat && strat.enabled) {
      log("WARN", `Strategy type changed from "${previousType}" to "${newType}" on enabled strategy "${strat.name}" — auto-disabling for safety`);
      body.enabled = false;
    }
    const instanceKey = `${id}_${previousType}`;
    delete strategyInstances[instanceKey];
  }

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
  if (body.strategyType !== undefined) s.strategyType = body.strategyType;
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
