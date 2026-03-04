const fs = require("fs");
const path = require("path");
const http = require("http");

const DATA_DIR = path.join(process.cwd(), ".openclaw");
const CONFIG_FILE = path.join(DATA_DIR, "ig-scalper-config.json");
const ALERTS_FILE = path.join(DATA_DIR, "ig-alerts.json");
const TRADE_LOG_FILE = path.join(DATA_DIR, "ig-scalper-trades.json");

const DEFAULT_CONFIG = {
  enabled: false,
  budget: 5000,
  maxMarginPct: 10,
  maxDrawdown: 200,
  breakEvenBuffer: 1.5,
  maxOpenPositions: 2,
  cooldownMs: 10000,
  tickWindow: 15,
  minMomentumPct: 0.03,
  minSize: 0.5,
  maxSize: 10,
  profitTarget: 0,
  trailingStop: 0,
  warmupMs: 60000,
  indicators: {
    rsi: { enabled: false, period: 14, overbought: 70, oversold: 30 },
    ema: { enabled: false, shortPeriod: 9, longPeriod: 21 },
    macd: { enabled: false, fast: 12, slow: 26, signal: 9 }
  },
  strategies: []
};

let running = false;
let config = null;
let tickBuffers = {};
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

function log(level, msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] [scalper] [${level}] ${msg}`);
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      config = { ...DEFAULT_CONFIG, ...raw };
    } else {
      config = { ...DEFAULT_CONFIG };
    }
  } catch (e) {
    log("ERROR", "Failed to load config: " + e.message);
    config = { ...DEFAULT_CONFIG };
  }
  return config;
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (e) {
    log("ERROR", "Failed to save config: " + e.message);
  }
}

function loadTradeLog() {
  try {
    if (fs.existsSync(TRADE_LOG_FILE)) {
      tradeLog = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, "utf8"));
      if (!Array.isArray(tradeLog)) tradeLog = [];
    }
  } catch (_) { tradeLog = []; }
}

function saveTradeLog() {
  try {
    if (tradeLog.length > 200) tradeLog = tradeLog.slice(-200);
    const data = JSON.stringify(tradeLog, null, 2);
    fs.writeFileSync(TRADE_LOG_FILE, data);
    const canvasDir = path.join(DATA_DIR, "canvas");
    if (fs.existsSync(canvasDir)) {
      fs.writeFileSync(path.join(canvasDir, "all-scalper-trades-data.json"), data);
    }
  } catch (_) {}
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

function evaluateIndicators(ticks, direction) {
  const ind = config.indicators || {};
  const rsiPeriod = (ind.rsi && ind.rsi.period) || 14;
  const barPrices = downsampleTicks(ticks, Math.max(rsiPeriod * 3, 40));
  const prices = ticks.map(t => t.mid);
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
  const hasInd = config.indicators && (
    (config.indicators.rsi && config.indicators.rsi.enabled) ||
    (config.indicators.ema && config.indicators.ema.enabled) ||
    (config.indicators.macd && config.indicators.macd.enabled)
  );
  const indMax = hasInd ? Math.max(
    (config.indicators?.macd?.slow || 26) + (config.indicators?.macd?.signal || 9) + 10,
    (config.indicators?.ema?.longPeriod || 21) * 3,
    (config.indicators?.rsi?.period || 14) * 4,
    80
  ) : 50;
  const maxTicks = Math.max(config.tickWindow || 15, indMax);
  if (buf.length > maxTicks) buf.splice(0, buf.length - maxTicks);

  const matchingStrategies = (config.strategies || []).filter(s =>
    s.enabled && s.instrument === epic && !s.dealId
  );

  for (const strat of matchingStrategies) {
    evaluateEntry(strat, epic, buf);
  }
}

async function evaluateEntry(strat, epic, ticks) {
  if (ticks.length < 5) return;

  const warmup = config.warmupMs || 60000;
  if (startedAt && (Date.now() - startedAt) < warmup) return;

  const stratIdx = config.strategies.indexOf(strat);
  const cooldownKey = `${epic}_${stratIdx}`;
  if (cooldowns[cooldownKey] && Date.now() - cooldowns[cooldownKey] < (config.cooldownMs || 10000)) return;

  const latest = ticks[ticks.length - 1];
  if (!latest.mid || !latest.bid || !latest.offer) return;
  if (latest.spread <= 0) return;

  const openScalperCount = scalperPositions.filter(p => p.status === "open").length;
  if (openScalperCount >= (config.maxOpenPositions || 2)) return;

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

  const window = Math.min(ticks.length, config.tickWindow || 15);
  const recentTicks = ticks.slice(-window);
  const firstMid = recentTicks[0].mid;
  const lastMid = recentTicks[recentTicks.length - 1].mid;
  const momentumPct = ((lastMid - firstMid) / firstMid) * 100;
  const absMomentum = Math.abs(momentumPct);

  const minMom = strat.minMomentumPct || config.minMomentumPct || 0.03;
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

  const hasIndicators = config.indicators && (
    (config.indicators.rsi && config.indicators.rsi.enabled) ||
    (config.indicators.ema && config.indicators.ema.enabled) ||
    (config.indicators.macd && config.indicators.macd.enabled)
  );
  if (hasIndicators) {
    const indResult = evaluateIndicators(ticks, direction);
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
  const minSize = config.minSize || 0.5;
  const maxSize = config.maxSize || 10;
  if (size < minSize) size = minSize;
  if (size > maxSize) size = maxSize;
  const riskAmount = stopDist * size;

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
    await openScalperTrade(strat, stratIdx, epic, direction, size, stopDist, limitDist, latest, momentumPct, htfBias);
  } catch (e) {
    log("ERROR", `Trade failed: ${e.message}`);
  }
}

async function fetchContractSize(epic) {
  try {
    const data = await proxyGet("/api/ig/markets/" + epic);
    if (data && data.instrument && data.instrument.valueOfOnePip) {
      return parseFloat(data.instrument.valueOfOnePip) || 1;
    }
    if (data && data.instrument && data.instrument.contractSize) {
      return parseFloat(data.instrument.contractSize) || 1;
    }
  } catch (_) {}
  return 1;
}

async function openScalperTrade(strat, stratIdx, epic, direction, size, stopDist, limitDist, tick, momentum, htfBias) {
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

  const contractSize = await fetchContractSize(epic);

  const conf = result.confirmation || result;
  if (conf && conf.dealStatus === "ACCEPTED") {
    const entry = conf.level || tick.mid;
    const pos = {
      dealId: conf.dealId,
      epic,
      direction,
      size,
      entry,
      contractSize,
      stopDistance: stopDist,
      limitDistance: limitDist,
      riskAmount: stopDist * size * contractSize,
      openedAt: new Date().toISOString(),
      momentum: momentum.toFixed(4),
      htfBias: htfBias || "neutral",
      status: "open",
      strategyIndex: stratIdx,
      strategyName: strat.name || epic
    };
    scalperPositions.push(pos);
    tradeCount++;

    if (stratIdx >= 0 && config.strategies[stratIdx]) {
      config.strategies[stratIdx].dealId = conf.dealId;
      saveConfig();
    }

    log("TRADE", `OPENED ${direction} ${size} ${epic} @ ${entry} dealId=${conf.dealId}`);

    tradeLog.push({
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
    });
    saveTradeLog();
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

        const stratIdx = sp.strategyIndex;
        if (stratIdx >= 0 && config.strategies[stratIdx] && config.strategies[stratIdx].dealId === sp.dealId) {
          delete config.strategies[stratIdx].dealId;
          saveConfig();
        }

        log("TRADE", `CLOSED ${sp.direction} ${sp.epic} | P&L: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} | Total: ${realizedPnl.toFixed(2)}`);

        tradeLog.push({
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
        });
        saveTradeLog();
        continue;
      }

      const igPos = igPosMap[sp.dealId];
      if (!igPos) continue;
      const mkt = igPos.market || {};
      const pos = igPos.position || {};
      const currentPrice = sp.direction === "BUY" ? (mkt.bid || 0) : (mkt.offer || 0);
      if (!currentPrice) continue;

      if (!sp.contractSize && mkt.valueOfOnePip) {
        sp.contractSize = parseFloat(mkt.valueOfOnePip) || 1;
      } else if (!sp.contractSize && mkt.contractSize) {
        sp.contractSize = parseFloat(mkt.contractSize) || 1;
      }
      const cs = sp.contractSize || 1;

      const unrealized = sp.direction === "BUY"
        ? (currentPrice - sp.entry) * sp.size * cs
        : (sp.entry - currentPrice) * sp.size * cs;
      sp.unrealizedPnl = Math.round(unrealized * 100) / 100;

      const profitTarget = config.profitTarget || 0;
      if (profitTarget > 0 && unrealized >= profitTarget) {
        log("TRADE", `PROFIT TARGET hit: ${sp.epic} unrealized=${unrealized.toFixed(2)} >= target=${profitTarget}. Closing...`);
        try {
          await proxyPost("/api/ig/positions/close", { dealId: sp.dealId });
        } catch (e) {
          log("ERROR", `Failed to close for profit target: ${e.message}`);
        }
        continue;
      }

      const trailingStop = config.trailingStop || 0;
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

function start() {
  if (running) {
    log("INFO", "Scalper already running, preserving state (reconnect-safe)");
    return;
  }
  loadConfig();
  if (!config.enabled) {
    config.enabled = true;
    saveConfig();
    log("INFO", "Scalper auto-enabled via start()");
  }
  loadTradeLog();

  const hadOpenPositions = scalperPositions.filter(p => p.status === "open").length;
  const isRestart = hadOpenPositions > 0;

  if (!isRestart) {
    realizedPnl = 0;
    tradeCount = 0;
    winCount = 0;
    lossCount = 0;
    scalperPositions = [];
    cooldowns = {};
    tickBuffers = {};

    const restoredPnl = tradeLog
      .filter(t => t.type === "close")
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
    realizedPnl = restoredPnl;
    tradeCount = tradeLog.filter(t => t.type === "open").length;
    winCount = tradeLog.filter(t => t.type === "close" && t.pnl >= 0).length;
    lossCount = tradeLog.filter(t => t.type === "close" && t.pnl < 0).length;
  } else {
    log("INFO", `Preserving ${hadOpenPositions} open position(s) across restart`);
    tickBuffers = {};
    cooldowns = {};
  }

  running = true;
  startedAt = startedAt || Date.now();
  config._drawdownTripped = false;

  fetchBalance();
  if (positionCheckInterval) clearInterval(positionCheckInterval);
  if (balanceCheckInterval) clearInterval(balanceCheckInterval);
  positionCheckInterval = setInterval(checkPositions, 5000);
  balanceCheckInterval = setInterval(fetchBalance, 30000);

  const warmupSec = Math.round((config.warmupMs || 60000) / 1000);
  const indList = [];
  if (config.indicators?.rsi?.enabled) indList.push("RSI");
  if (config.indicators?.ema?.enabled) indList.push("EMA");
  if (config.indicators?.macd?.enabled) indList.push("MACD");
  log("INFO", `Scalper STARTED${isRestart ? " (reconnect)" : ""} | ${config.strategies.filter(s => s.enabled).length} strategies | budget=$${config.budget} maxDD=$${config.maxDrawdown} | warmup=${warmupSec}s | indicators=${indList.length ? indList.join(",") : "none"} | openPos=${hadOpenPositions}`);
}

function stop() {
  running = false;
  startedAt = null;
  if (positionCheckInterval) { clearInterval(positionCheckInterval); positionCheckInterval = null; }
  if (balanceCheckInterval) { clearInterval(balanceCheckInterval); balanceCheckInterval = null; }
  tickBuffers = {};
  cooldowns = {};
  if (config) { config.enabled = false; saveConfig(); }
  log("INFO", "Scalper STOPPED");
}

function getStatus() {
  loadConfig();
  const openPositions = scalperPositions.filter(p => p.status === "open");
  const unrealizedPnl = openPositions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
  const uptimeMs = startedAt ? Date.now() - startedAt : 0;
  const winRate = (winCount + lossCount) > 0 ? Math.round((winCount / (winCount + lossCount)) * 100) : 0;

  return {
    running,
    enabled: config ? config.enabled : false,
    uptimeMs,
    budget: config ? config.budget : 0,
    maxDrawdown: config ? config.maxDrawdown : 0,
    maxMarginPct: config ? config.maxMarginPct : 0,
    breakEvenBuffer: config ? config.breakEvenBuffer : 0,
    cooldownMs: config ? config.cooldownMs : 0,
    maxOpenPositions: config ? config.maxOpenPositions : 0,
    tickWindow: config ? config.tickWindow : 0,
    minMomentumPct: config ? config.minMomentumPct : 0,
    minSize: config ? config.minSize : 0.5,
    maxSize: config ? config.maxSize : 10,
    profitTarget: config ? config.profitTarget : 0,
    trailingStop: config ? config.trailingStop : 0,
    warmupMs: config ? config.warmupMs : 60000,
    warmupRemaining: (running && startedAt) ? Math.max(0, (config?.warmupMs || 60000) - (Date.now() - startedAt)) : 0,
    indicators: config ? config.indicators : DEFAULT_CONFIG.indicators,
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
    allTrades: tradeLog,
    recentTrades: tradeLog.slice(-20).reverse()
  };
}

function getConfig() {
  loadConfig();
  return config;
}

function updateConfig(updates) {
  loadConfig();
  if (updates.budget !== undefined) { const v = Number(updates.budget); if (Number.isFinite(v) && v > 0) config.budget = v; }
  if (updates.maxMarginPct !== undefined) { const v = Number(updates.maxMarginPct); if (Number.isFinite(v) && v > 0 && v <= 100) config.maxMarginPct = v; }
  if (updates.maxDrawdown !== undefined) { const v = Number(updates.maxDrawdown); if (Number.isFinite(v) && v > 0) config.maxDrawdown = v; }
  if (updates.breakEvenBuffer !== undefined) { const v = Number(updates.breakEvenBuffer); if (Number.isFinite(v) && v > 0) config.breakEvenBuffer = v; }
  if (updates.maxOpenPositions !== undefined) { const v = Number(updates.maxOpenPositions); if (Number.isFinite(v) && v >= 1 && v <= 20) config.maxOpenPositions = Math.floor(v); }
  if (updates.cooldownMs !== undefined) { const v = Number(updates.cooldownMs); if (Number.isFinite(v) && v >= 1000 && v <= 300000) config.cooldownMs = v; }
  if (updates.tickWindow !== undefined) { const v = Number(updates.tickWindow); if (Number.isFinite(v) && v >= 3 && v <= 100) config.tickWindow = Math.floor(v); }
  if (updates.minMomentumPct !== undefined) { const v = Number(updates.minMomentumPct); if (Number.isFinite(v) && v > 0 && v < 10) config.minMomentumPct = v; }
  if (updates.minSize !== undefined) { const v = Number(updates.minSize); if (Number.isFinite(v) && v >= 0.1 && v <= 100) config.minSize = v; }
  if (updates.maxSize !== undefined) { const v = Number(updates.maxSize); if (Number.isFinite(v) && v >= 0.1 && v <= 1000) config.maxSize = v; }
  if (updates.profitTarget !== undefined) { const v = Number(updates.profitTarget); if (Number.isFinite(v) && v >= 0) config.profitTarget = v; }
  if (updates.trailingStop !== undefined) { const v = Number(updates.trailingStop); if (Number.isFinite(v) && v >= 0) config.trailingStop = v; }
  if (updates.warmupMs !== undefined) { const v = Number(updates.warmupMs); if (Number.isFinite(v) && v >= 0 && v <= 600000) config.warmupMs = v; }
  if (updates.indicators !== undefined && typeof updates.indicators === "object") {
    if (!config.indicators) config.indicators = JSON.parse(JSON.stringify(DEFAULT_CONFIG.indicators));
    const ui = updates.indicators;
    if (ui.rsi && typeof ui.rsi === "object") {
      if (ui.rsi.enabled !== undefined) config.indicators.rsi.enabled = !!ui.rsi.enabled;
      if (ui.rsi.period !== undefined) { const v = Number(ui.rsi.period); if (Number.isFinite(v) && v >= 2 && v <= 50) config.indicators.rsi.period = Math.floor(v); }
      if (ui.rsi.overbought !== undefined) { const v = Number(ui.rsi.overbought); if (Number.isFinite(v) && v > 50 && v <= 100) config.indicators.rsi.overbought = v; }
      if (ui.rsi.oversold !== undefined) { const v = Number(ui.rsi.oversold); if (Number.isFinite(v) && v >= 0 && v < 50) config.indicators.rsi.oversold = v; }
    }
    if (ui.ema && typeof ui.ema === "object") {
      if (ui.ema.enabled !== undefined) config.indicators.ema.enabled = !!ui.ema.enabled;
      if (ui.ema.shortPeriod !== undefined) { const v = Number(ui.ema.shortPeriod); if (Number.isFinite(v) && v >= 2 && v <= 50) config.indicators.ema.shortPeriod = Math.floor(v); }
      if (ui.ema.longPeriod !== undefined) { const v = Number(ui.ema.longPeriod); if (Number.isFinite(v) && v >= 5 && v <= 200) config.indicators.ema.longPeriod = Math.floor(v); }
    }
    if (ui.macd && typeof ui.macd === "object") {
      if (ui.macd.enabled !== undefined) config.indicators.macd.enabled = !!ui.macd.enabled;
      if (ui.macd.fast !== undefined) { const v = Number(ui.macd.fast); if (Number.isFinite(v) && v >= 2 && v <= 50) config.indicators.macd.fast = Math.floor(v); }
      if (ui.macd.slow !== undefined) { const v = Number(ui.macd.slow); if (Number.isFinite(v) && v >= 5 && v <= 200) config.indicators.macd.slow = Math.floor(v); }
      if (ui.macd.signal !== undefined) { const v = Number(ui.macd.signal); if (Number.isFinite(v) && v >= 2 && v <= 50) config.indicators.macd.signal = Math.floor(v); }
    }
  }
  if (updates.enabled !== undefined) config.enabled = !!updates.enabled;
  saveConfig();
  return config;
}

function addStrategy(body) {
  loadConfig();
  if (!body.instrument) return { error: "Missing instrument (epic)" };
  if (!body.size || Number(body.size) <= 0) return { error: "Missing or invalid size" };
  const strat = {
    instrument: String(body.instrument).trim(),
    name: body.name ? String(body.name).trim() : String(body.instrument).trim(),
    direction: (body.direction === "BUY" || body.direction === "SELL") ? body.direction : "BOTH",
    size: Number(body.size),
    enabled: body.enabled !== undefined ? !!body.enabled : false,
  };
  if (body.stopDistance) { const v = Number(body.stopDistance); if (Number.isFinite(v) && v > 0) strat.stopDistance = v; }
  if (body.limitDistance) { const v = Number(body.limitDistance); if (Number.isFinite(v) && v > 0) strat.limitDistance = v; }
  if (body.minMomentumPct) { const v = Number(body.minMomentumPct); if (Number.isFinite(v) && v > 0) strat.minMomentumPct = v; }
  config.strategies.push(strat);
  saveConfig();
  return { ok: true, index: config.strategies.length - 1, strategy: strat };
}

function updateStrategy(idx, body) {
  loadConfig();
  if (idx < 0 || idx >= config.strategies.length) return { error: "Index out of range" };
  const s = config.strategies[idx];
  if (body.name !== undefined) s.name = String(body.name).trim();
  if (body.size !== undefined) { const v = Number(body.size); if (Number.isFinite(v) && v > 0) s.size = v; }
  if (body.direction !== undefined) s.direction = body.direction;
  if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (Number.isFinite(v) && v > 0) s.stopDistance = v; }
  if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (Number.isFinite(v) && v > 0) s.limitDistance = v; }
  if (body.minMomentumPct !== undefined) { const v = Number(body.minMomentumPct); if (Number.isFinite(v) && v > 0) s.minMomentumPct = v; }
  if (body.enabled !== undefined) s.enabled = !!body.enabled;
  if (body.instrument !== undefined) s.instrument = String(body.instrument).trim();
  saveConfig();
  return { ok: true, index: idx, strategy: s };
}

function deleteStrategy(idx) {
  loadConfig();
  if (idx < 0 || idx >= config.strategies.length) return { error: "Index out of range" };
  const removed = config.strategies.splice(idx, 1)[0];
  saveConfig();
  return { ok: true, removed };
}

function toggleStrategy(idx) {
  loadConfig();
  if (idx < 0 || idx >= config.strategies.length) return { error: "Index out of range" };
  config.strategies[idx].enabled = !config.strategies[idx].enabled;
  saveConfig();
  return { ok: true, index: idx, enabled: config.strategies[idx].enabled };
}

function resetStats() {
  realizedPnl = 0;
  tradeCount = 0;
  winCount = 0;
  lossCount = 0;
  scalperPositions = [];
  tradeLog = [];
  saveTradeLog();
  if (config) {
    config._drawdownTripped = false;
    for (const s of (config.strategies || [])) {
      if (s.dealId) delete s.dealId;
    }
    saveConfig();
  }
  log("INFO", "Stats reset (all strategy dealIds cleared)");
  return { ok: true };
}

module.exports = {
  processTick,
  start,
  stop,
  getStatus,
  getConfig,
  updateConfig,
  addStrategy,
  updateStrategy,
  deleteStrategy,
  toggleStrategy,
  resetStats,
  loadConfig
};
