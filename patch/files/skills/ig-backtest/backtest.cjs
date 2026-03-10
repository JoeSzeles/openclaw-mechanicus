#!/usr/bin/env node
"use strict";

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CANVAS_DIR = path.join(process.cwd(), ".openclaw", "canvas");
const RESULTS_PATH = path.join(CANVAS_DIR, "ig-backtest-results.json");
const MANIFEST_PATH = path.join(CANVAS_DIR, "manifest.json");

let sessionTokens = { cst: null, securityToken: null };

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
      args[key] = val;
      if (val !== "true") i++;
    }
  }
  return args;
}

function request(method, urlPath, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const baseUrl = process.env.IG_BASE_URL || "https://demo-api.ig.com/gateway/deal";
    const full = baseUrl.replace(/\/+$/, "") + urlPath;
    const parsed = new URL(full);
    const isHttps = parsed.protocol === "https:";
    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      "X-IG-API-KEY": process.env.IG_API_KEY || "",
      ...(sessionTokens.cst ? { CST: sessionTokens.cst } : {}),
      ...(sessionTokens.securityToken ? { "X-SECURITY-TOKEN": sessionTokens.securityToken } : {}),
      ...(extraHeaders || {})
    };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers
    };
    const mod = isHttps ? https : http;
    const req = mod.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function authenticate() {
  const res = await request("POST", "/session", {
    identifier: process.env.IG_USERNAME,
    password: process.env.IG_PASSWORD
  }, { Version: "2" });
  if (res.status !== 200) throw new Error(`Auth failed: ${res.body?.errorCode || res.status}`);
  sessionTokens.cst = res.headers["cst"] || res.headers["CST"];
  sessionTokens.securityToken = res.headers["x-security-token"] || res.headers["X-SECURITY-TOKEN"];
  if (!sessionTokens.cst) throw new Error("Auth succeeded but no session tokens");
  console.log("Authenticated with IG API");
}

async function fetchPrices(epic, resolution, numPoints) {
  const urlPath = `/prices/${epic}/${resolution}/${numPoints}`;
  console.log(`Fetching ${numPoints} ${resolution} candles for ${epic}...`);
  const res = await request("GET", urlPath, null, { Version: "3" });
  if (res.status === 401) {
    await authenticate();
    return fetchPrices(epic, resolution, numPoints);
  }
  if (res.status !== 200) {
    throw new Error(`Failed to fetch prices: ${res.body?.errorCode || res.status}`);
  }
  const prices = res.body?.prices || [];
  console.log(`Received ${prices.length} candles`);
  return prices.map((p) => ({
    time: new Date(p.snapshotTimeUTC || p.snapshotTime).getTime() / 1000,
    timeStr: p.snapshotTimeUTC || p.snapshotTime,
    open: p.openPrice?.mid || p.openPrice?.bid || 0,
    high: p.highPrice?.mid || p.highPrice?.bid || 0,
    low: p.lowPrice?.mid || p.lowPrice?.bid || 0,
    close: p.closePrice?.mid || p.closePrice?.bid || 0,
    volume: p.lastTradedVolume || 0
  }));
}

function calcSMA(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    result.push(sum / period);
  }
  return result;
}

function calcEMA(data, period) {
  const result = [];
  const k = 2 / (period + 1);
  let ema = null;
  for (let i = 0; i < data.length; i++) {
    if (ema === null) {
      if (i < period - 1) { result.push(null); continue; }
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      ema = sum / period;
    } else {
      ema = data[i] * k + ema * (1 - k);
    }
    result.push(ema);
  }
  return result;
}

function calcStdDev(data, period) {
  const sma = calcSMA(data, period);
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) { result.push(null); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += Math.pow(data[j] - sma[i], 2);
    result.push(Math.sqrt(sumSq / period));
  }
  return result;
}

function calcRSI(closes, period) {
  const result = [];
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < closes.length; i++) {
    if (i === 0) { result.push(null); continue; }
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i === period) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      } else {
        result.push(null);
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

function calcATR(candles, period) {
  const trs = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { trs.push(candles[i].high - candles[i].low); continue; }
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trs.push(tr);
  }
  return calcSMA(trs, period);
}

function getStrategy(name) {
  switch (name) {
    case "bb-squeeze": return bbSqueezeStrategy;
    case "rsi-reversal": return rsiReversalStrategy;
    case "ma-crossover": return maCrossoverStrategy;
    case "breakout": return breakoutStrategy;
    default: return maCrossoverStrategy;
  }
}

function bbSqueezeStrategy(candles, i) {
  if (i < 20) return null;
  const closes = candles.slice(0, i + 1).map(c => c.close);
  const sma20 = calcSMA(closes, 20);
  const std20 = calcStdDev(closes, 20);
  const atr20 = calcATR(candles.slice(0, i + 1), 20);
  const smaVal = sma20[sma20.length - 1];
  const stdVal = std20[std20.length - 1];
  const atrVal = atr20[atr20.length - 1];
  if (!smaVal || !stdVal || !atrVal) return null;
  const bbUpper = smaVal + 2 * stdVal;
  const bbLower = smaVal - 2 * stdVal;
  const kcUpper = smaVal + 1.5 * atrVal;
  const kcLower = smaVal - 1.5 * atrVal;
  const squeezed = bbUpper < kcUpper && bbLower > kcLower;
  if (i > 20 && squeezed) return null;
  const prevSma = sma20[sma20.length - 2];
  const prevStd = std20[std20.length - 2];
  const prevAtr = atr20[atr20.length - 2];
  if (!prevSma || !prevStd || !prevAtr) return null;
  const prevBBU = prevSma + 2 * prevStd;
  const prevBBL = prevSma - 2 * prevStd;
  const prevKCU = prevSma + 1.5 * prevAtr;
  const prevKCL = prevSma - 1.5 * prevAtr;
  const wasSqueezed = prevBBU < prevKCU && prevBBL > prevKCL;
  if (wasSqueezed && !squeezed) {
    if (candles[i].close > smaVal) return "BUY";
    if (candles[i].close < smaVal) return "SELL";
  }
  return null;
}

function rsiReversalStrategy(candles, i) {
  if (i < 14) return null;
  const closes = candles.slice(0, i + 1).map(c => c.close);
  const rsi = calcRSI(closes, 14);
  const rsiVal = rsi[rsi.length - 1];
  const prevRsi = rsi[rsi.length - 2];
  if (rsiVal === null || prevRsi === null) return null;
  if (prevRsi < 30 && rsiVal >= 30) return "BUY";
  if (prevRsi > 70 && rsiVal <= 70) return "SELL";
  return null;
}

function maCrossoverStrategy(candles, i) {
  if (i < 26) return null;
  const closes = candles.slice(0, i + 1).map(c => c.close);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const fast = ema12[ema12.length - 1];
  const slow = ema26[ema26.length - 1];
  const prevFast = ema12[ema12.length - 2];
  const prevSlow = ema26[ema26.length - 2];
  if (!fast || !slow || !prevFast || !prevSlow) return null;
  if (prevFast <= prevSlow && fast > slow) return "BUY";
  if (prevFast >= prevSlow && fast < slow) return "SELL";
  return null;
}

function breakoutStrategy(candles, i) {
  if (i < 20) return null;
  const lookback = candles.slice(i - 20, i);
  const high = Math.max(...lookback.map(c => c.high));
  const low = Math.min(...lookback.map(c => c.low));
  if (candles[i].close > high) return "BUY";
  if (candles[i].close < low) return "SELL";
  return null;
}

function runBacktest(candles, strategyFn, opts) {
  const stopLoss = parseFloat(opts.stopLoss || 20);
  const takeProfit = parseFloat(opts.takeProfit || 40);
  const size = parseFloat(opts.size || 1);
  const direction = opts.direction || "both";
  const initialCapital = 10000;
  let capital = initialCapital;
  let position = null;
  const trades = [];
  const equity = [initialCapital];

  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];
    if (position) {
      const priceDiff = position.direction === "BUY"
        ? candle.close - position.entryPrice
        : position.entryPrice - candle.close;
      const stopHit = priceDiff <= -stopLoss;
      const targetHit = priceDiff >= takeProfit;
      let exitReason = null;
      if (stopHit) exitReason = "stop-loss";
      else if (targetHit) exitReason = "take-profit";
      else {
        const signal = strategyFn(candles, i);
        if (signal && signal !== position.direction) exitReason = "signal-reversal";
      }
      if (exitReason) {
        const pnl = priceDiff * size;
        capital += pnl;
        trades.push({
          direction: position.direction,
          entryPrice: position.entryPrice,
          entryTime: position.entryTime,
          entryTimeStr: position.entryTimeStr,
          exitPrice: candle.close,
          exitTime: candle.time,
          exitTimeStr: candle.timeStr,
          pnl: Math.round(pnl * 100) / 100,
          exitReason
        });
        position = null;
      }
    } else {
      const signal = strategyFn(candles, i);
      if (signal === "BUY" && (direction === "both" || direction === "long")) {
        position = { direction: "BUY", entryPrice: candle.close, entryTime: candle.time, entryTimeStr: candle.timeStr };
      } else if (signal === "SELL" && (direction === "both" || direction === "short")) {
        position = { direction: "SELL", entryPrice: candle.close, entryTime: candle.time, entryTimeStr: candle.timeStr };
      }
    }
    equity.push(Math.round(capital * 100) / 100);
  }

  if (position) {
    const last = candles[candles.length - 1];
    const priceDiff = position.direction === "BUY" ? last.close - position.entryPrice : position.entryPrice - last.close;
    const pnl = priceDiff * size;
    capital += pnl;
    trades.push({
      direction: position.direction,
      entryPrice: position.entryPrice,
      entryTime: position.entryTime,
      entryTimeStr: position.entryTimeStr,
      exitPrice: last.close,
      exitTime: last.time,
      exitTimeStr: last.timeStr,
      pnl: Math.round(pnl * 100) / 100,
      exitReason: "end-of-data"
    });
    equity.push(Math.round(capital * 100) / 100);
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  let maxDrawdown = 0, peak = initialCapital;
  for (const eq of equity) {
    if (eq > peak) peak = eq;
    const dd = ((peak - eq) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const returns = [];
  for (let i = 1; i < equity.length; i++) {
    returns.push((equity[i] - equity[i - 1]) / equity[i - 1]);
  }
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdReturn = returns.length > 1 ? Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 0;
  const sharpe = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

  let maxConsecLosses = 0, consecLosses = 0;
  for (const t of trades) {
    if (t.pnl < 0) { consecLosses++; if (consecLosses > maxConsecLosses) maxConsecLosses = consecLosses; }
    else consecLosses = 0;
  }

  return {
    totalPnl: Math.round(totalPnl * 100) / 100,
    totalTrades: trades.length,
    winRate: Math.round(winRate * 100) / 100,
    wins: wins.length,
    losses: losses.length,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    sharpe: Math.round(sharpe * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxConsecLosses,
    initialCapital,
    finalCapital: Math.round(capital * 100) / 100,
    returnPct: Math.round(((capital - initialCapital) / initialCapital) * 10000) / 100,
    equity,
    trades
  };
}

function generateResultsPage(results, meta) {
  const equityLabels = JSON.stringify(results.equity.map((_, i) => i));
  const equityData = JSON.stringify(results.equity);
  const tradesJSON = JSON.stringify(results.trades);
  const candlesJSON = JSON.stringify(meta.candles.map(c => ({ time: c.timeStr, open: c.open, high: c.high, low: c.low, close: c.close })));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backtest: ${meta.name}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; padding-top: 64px; }
.container { max-width: 1200px; margin: 0 auto; }
.header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 4px; }
h1 { color: #58a6ff; font-size: 22px; }
.back { color: #8b949e; text-decoration: none; font-size: 13px; }
.back:hover { color: #58a6ff; }
.meta { color: #8b949e; font-size: 13px; margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; }
.stat-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px; text-align: center; }
.stat-value { font-size: 22px; font-weight: 700; }
.stat-label { font-size: 11px; color: #8b949e; margin-top: 4px; }
.positive { color: #2dc653; }
.negative { color: #f85149; }
.neutral { color: #58a6ff; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.card h2 { color: #8b949e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px; }
.chart-container { position: relative; height: 300px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #21262d; }
th { color: #8b949e; font-weight: 600; font-size: 11px; text-transform: uppercase; }
tr:hover { background: rgba(88,166,255,0.04); }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.badge-buy { background: #1b4332; color: #2dc653; }
.badge-sell { background: #3d1a1a; color: #f85149; }
.badge-stop { background: #3d1f00; color: #f0883e; }
.badge-tp { background: #1c2541; color: #79c0ff; }
.badge-signal { background: #2d1b4e; color: #bc8cff; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${meta.name}</h1>
    <a href="/__openclaw__/canvas/ig-dashboard.html" class="back">Dashboard</a>
    <a href="/__openclaw__/canvas/" class="back">Canvas</a>
  </div>
  <p class="meta">${meta.epic} | ${meta.resolution} | ${meta.points} candles | Strategy: ${meta.strategy} | ${new Date().toISOString().split("T")[0]}</p>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value ${results.totalPnl >= 0 ? 'positive' : 'negative'}">${results.totalPnl >= 0 ? '+' : ''}${results.totalPnl}</div><div class="stat-label">Total P&L</div></div>
    <div class="stat-card"><div class="stat-value ${results.returnPct >= 0 ? 'positive' : 'negative'}">${results.returnPct}%</div><div class="stat-label">Return</div></div>
    <div class="stat-card"><div class="stat-value neutral">${results.totalTrades}</div><div class="stat-label">Total Trades</div></div>
    <div class="stat-card"><div class="stat-value ${results.winRate >= 50 ? 'positive' : 'negative'}">${results.winRate}%</div><div class="stat-label">Win Rate</div></div>
    <div class="stat-card"><div class="stat-value neutral">${results.sharpe}</div><div class="stat-label">Sharpe Ratio</div></div>
    <div class="stat-card"><div class="stat-value negative">${results.maxDrawdown}%</div><div class="stat-label">Max Drawdown</div></div>
    <div class="stat-card"><div class="stat-value neutral">${results.profitFactor}</div><div class="stat-label">Profit Factor</div></div>
    <div class="stat-card"><div class="stat-value positive">+${results.avgWin}</div><div class="stat-label">Avg Win</div></div>
    <div class="stat-card"><div class="stat-value negative">-${results.avgLoss}</div><div class="stat-label">Avg Loss</div></div>
    <div class="stat-card"><div class="stat-value negative">${results.maxConsecLosses}</div><div class="stat-label">Max Consec. Losses</div></div>
  </div>

  <div class="card">
    <h2>Equity Curve</h2>
    <div class="chart-container"><canvas id="equityChart"></canvas></div>
  </div>

  <div class="card">
    <h2>Price Chart with Trades</h2>
    <div class="chart-container"><canvas id="priceChart"></canvas></div>
  </div>

  <div class="card">
    <h2>Trade List (${results.totalTrades} trades)</h2>
    <div id="tradeList"></div>
  </div>
</div>

<script>
var equityData = ${equityData};
var tradesData = ${tradesJSON};
var candlesData = ${candlesJSON};

var eqCtx = document.getElementById('equityChart').getContext('2d');
new Chart(eqCtx, {
  type: 'line',
  data: {
    labels: equityData.map(function(_, i) { return i; }),
    datasets: [{
      label: 'Equity',
      data: equityData,
      borderColor: equityData[equityData.length - 1] >= equityData[0] ? '#2dc653' : '#f85149',
      backgroundColor: equityData[equityData.length - 1] >= equityData[0] ? 'rgba(45,198,83,0.1)' : 'rgba(248,81,73,0.1)',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1, titleColor: '#c9d1d9', bodyColor: '#8b949e' } },
    scales: {
      x: { display: false },
      y: { ticks: { color: '#484f58', font: { size: 10 } }, grid: { color: 'rgba(48,54,61,0.5)' } }
    }
  }
});

var priceLabels = candlesData.map(function(c) { return c.time ? c.time.split('T')[0] + ' ' + (c.time.split('T')[1] || '').slice(0,5) : ''; });
var closePrices = candlesData.map(function(c) { return c.close; });

var buyPoints = new Array(closePrices.length).fill(null);
var sellPoints = new Array(closePrices.length).fill(null);
tradesData.forEach(function(t) {
  var entryIdx = candlesData.findIndex(function(c) { return c.time === t.entryTimeStr; });
  var exitIdx = candlesData.findIndex(function(c) { return c.time === t.exitTimeStr; });
  if (t.direction === 'BUY' && entryIdx >= 0) buyPoints[entryIdx] = t.entryPrice;
  if (t.direction === 'SELL' && entryIdx >= 0) sellPoints[entryIdx] = t.entryPrice;
  if (exitIdx >= 0) {
    if (t.direction === 'BUY') sellPoints[exitIdx] = t.exitPrice;
    else buyPoints[exitIdx] = t.exitPrice;
  }
});

var pCtx = document.getElementById('priceChart').getContext('2d');
new Chart(pCtx, {
  type: 'line',
  data: {
    labels: priceLabels,
    datasets: [
      { label: 'Close', data: closePrices, borderColor: '#58a6ff', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.1 },
      { label: 'Buy', data: buyPoints, borderColor: '#2dc653', backgroundColor: '#2dc653', pointRadius: 6, pointStyle: 'triangle', showLine: false },
      { label: 'Sell', data: sellPoints, borderColor: '#f85149', backgroundColor: '#f85149', pointRadius: 6, pointStyle: 'triangle', rotation: 180, showLine: false }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#8b949e', font: { size: 11 } } }, tooltip: { backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1, titleColor: '#c9d1d9', bodyColor: '#8b949e' } },
    scales: {
      x: { ticks: { color: '#484f58', maxTicksLimit: 12, font: { size: 9 } }, grid: { color: 'rgba(48,54,61,0.5)' } },
      y: { ticks: { color: '#484f58', font: { size: 10 } }, grid: { color: 'rgba(48,54,61,0.5)' } }
    }
  }
});

function renderTrades() {
  var el = document.getElementById('tradeList');
  if (tradesData.length === 0) { el.innerHTML = '<p style="color:#484f58;font-style:italic;text-align:center;padding:20px">No trades generated</p>'; return; }
  var html = '<table><tr><th>#</th><th>Dir</th><th>Entry</th><th>Entry Time</th><th>Exit</th><th>Exit Time</th><th>P&L</th><th>Reason</th></tr>';
  tradesData.forEach(function(t, i) {
    var dirBadge = t.direction === 'BUY' ? '<span class="badge badge-buy">BUY</span>' : '<span class="badge badge-sell">SELL</span>';
    var reasonBadge = 'badge-signal';
    if (t.exitReason === 'stop-loss') reasonBadge = 'badge-stop';
    else if (t.exitReason === 'take-profit') reasonBadge = 'badge-tp';
    var pnlColor = t.pnl >= 0 ? 'color:#2dc653' : 'color:#f85149';
    var entryTime = t.entryTimeStr ? t.entryTimeStr.replace('T', ' ').slice(0, 16) : '-';
    var exitTime = t.exitTimeStr ? t.exitTimeStr.replace('T', ' ').slice(0, 16) : '-';
    html += '<tr><td>' + (i + 1) + '</td><td>' + dirBadge + '</td><td>' + (t.entryPrice || '-') + '</td><td style="font-size:11px">' + entryTime + '</td><td>' + (t.exitPrice || '-') + '</td><td style="font-size:11px">' + exitTime + '</td><td style="' + pnlColor + ';font-weight:600">' + (t.pnl >= 0 ? '+' : '') + t.pnl + '</td><td><span class="badge ' + reasonBadge + '">' + t.exitReason + '</span></td></tr>';
  });
  html += '</table>';
  el.innerHTML = html;
}
renderTrades();
</script>
</body>
</html>`;
}

function updateManifest(filename, name) {
  try {
    let manifest = [];
    if (fs.existsSync(MANIFEST_PATH)) {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    }
    const exists = manifest.some(e => e.file === filename);
    if (!exists) {
      manifest.push({ name, file: filename, description: `Backtest results — ${new Date().toISOString().split("T")[0]}`, category: "Trading" });
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      console.log(`Registered ${filename} in manifest.json`);
    }
  } catch (e) {
    console.warn("Failed to update manifest:", e.message);
  }
}

async function main() {
  const args = parseArgs();
  const epic = args.epic;
  const resolution = args.resolution || "HOUR";
  const points = parseInt(args.points || "200");
  const strategyName = args.strategy || "ma-crossover";
  const name = args.name || `${epic} ${strategyName} ${resolution}`;
  const testMode = args.test === "true";

  if (!epic && !testMode) {
    console.error("Usage: node backtest.cjs --epic <EPIC> --resolution <RES> --points <N> [--strategy <name>]");
    process.exit(1);
  }

  console.log(`\n=== IG Backtest ===`);
  console.log(`Epic: ${epic || "TEST"}`);
  console.log(`Resolution: ${resolution}`);
  console.log(`Points: ${points}`);
  console.log(`Strategy: ${strategyName}`);
  console.log(`Stop Loss: ${args.stopLoss || 20} pts`);
  console.log(`Take Profit: ${args.takeProfit || 40} pts\n`);

  let candles;
  if (testMode) {
    console.log("Using test data...");
    candles = [];
    let price = 100;
    for (let i = 0; i < points; i++) {
      price += (Math.random() - 0.48) * 2;
      const t = new Date(Date.now() - (points - i) * 3600000);
      candles.push({
        time: t.getTime() / 1000,
        timeStr: t.toISOString(),
        open: price - Math.random(),
        high: price + Math.random() * 2,
        low: price - Math.random() * 2,
        close: price,
        volume: Math.floor(Math.random() * 1000)
      });
    }
  } else {
    if (!process.env.IG_API_KEY || !process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
      console.error("Missing IG credentials. Set IG_API_KEY, IG_USERNAME, IG_PASSWORD env vars.");
      process.exit(1);
    }
    await authenticate();
    candles = await fetchPrices(epic, resolution, points);
    if (candles.length === 0) {
      console.error("No price data returned from IG API");
      process.exit(1);
    }
  }

  const strategyFn = getStrategy(strategyName);
  const results = runBacktest(candles, strategyFn, args);

  console.log(`\n=== Results ===`);
  console.log(`Total Trades: ${results.totalTrades}`);
  console.log(`Win Rate: ${results.winRate}%`);
  console.log(`Total P&L: ${results.totalPnl}`);
  console.log(`Return: ${results.returnPct}%`);
  console.log(`Sharpe Ratio: ${results.sharpe}`);
  console.log(`Max Drawdown: ${results.maxDrawdown}%`);
  console.log(`Profit Factor: ${results.profitFactor}`);

  if (!fs.existsSync(CANVAS_DIR)) fs.mkdirSync(CANVAS_DIR, { recursive: true });

  const ts = Date.now();
  const safeEpic = (epic || "test").replace(/\./g, "-");
  const filename = `bt-${safeEpic}-${strategyName}-${ts}.html`;
  const meta = { epic: epic || "TEST", resolution, points, strategy: strategyName, name, candles };
  const html = generateResultsPage(results, meta);
  fs.writeFileSync(path.join(CANVAS_DIR, filename), html);
  console.log(`\nResults page: ${filename}`);

  const summaryResults = { ...results };
  delete summaryResults.equity;
  const savedResults = { timestamp: new Date().toISOString(), meta: { epic: epic || "TEST", resolution, points, strategy: strategyName, name }, results: summaryResults };
  let existing = [];
  try { if (fs.existsSync(RESULTS_PATH)) existing = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8")); } catch (_) {}
  existing.push(savedResults);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(existing.slice(-20), null, 2));

  updateManifest(filename, name);
  console.log(`\nDone. View at: /__openclaw__/canvas/${filename}`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
