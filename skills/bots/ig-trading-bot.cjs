#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), ".openclaw");
const STRATEGY_PATH = path.join(DATA_DIR, "ig-strategy.json");
const LOG_PATH = path.join(DATA_DIR, "ig-bot-log.json");
const ALERTS_PATH = path.join(DATA_DIR, "ig-alerts.json");
const DASHBOARD_DIR = path.join(process.cwd(), ".openclaw", "canvas");
const DASHBOARD_PATH = path.join(DASHBOARD_DIR, "ig-bot-status.html");
const IG_CONFIG_FILE = path.join(process.cwd(), ".openclaw", "ig-config.json");

const TEST_MODE = process.argv.includes("--test");

const PROXY_BASE = "http://localhost:5000";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

let openPositions = [];
let botLog = [];
let accountBalance = null;
let startupProfile = null;

let currentConfig = {};

function log(level, message, data) {
  const entry = { timestamp: new Date().toISOString(), level, message, ...(data ? { data } : {}) };
  botLog.push(entry);
  const prefix = level === "ERROR" ? "ERROR" : level === "WARN" ? "WARN " : "INFO ";
  console.log(`[${entry.timestamp}] ${prefix} ${message}`);
  if (data && (level === "ERROR" || level === "TRADE")) {
    console.log(JSON.stringify(data, null, 2));
  }
  saveLog();
}

function saveLog() {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const trimmed = botLog.slice(-500);
    fs.writeFileSync(LOG_PATH, JSON.stringify(trimmed, null, 2));
  } catch (_) {}
}

function loadConfig() {
  if (!fs.existsSync(STRATEGY_PATH)) {
    const defaultConfig = {
      strategies: [
        {
          instrument: "CS.D.EURUSD.CFD.IP",
          name: "EUR/USD Example",
          direction: "BUY",
          entryBelow: 1.08,
          stopDistance: 15,
          limitDistance: 30,
          size: 0.5,
          enabled: false
        }
      ],
      maxOpenPositions: 3,
      maxRiskPercent: 1,
      checkIntervalSeconds: 15,
      enabled: false
    };
    const dir = path.dirname(STRATEGY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STRATEGY_PATH, JSON.stringify(defaultConfig, null, 2));
    log("INFO", `Created default strategy config at ${STRATEGY_PATH}`);
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(STRATEGY_PATH, "utf8"));
}

function loadAlerts() {
  try {
    if (fs.existsSync(ALERTS_PATH)) {
      return JSON.parse(fs.readFileSync(ALERTS_PATH, "utf8"));
    }
  } catch (_) {}
  return [];
}

function getIgProfile() {
  try {
    if (fs.existsSync(IG_CONFIG_FILE)) {
      const igCfg = JSON.parse(fs.readFileSync(IG_CONFIG_FILE, "utf8"));
      const profile = igCfg.profiles[igCfg.activeProfile];
      if (profile) {
        return { profile: igCfg.activeProfile, baseUrl: profile.baseUrl || "" };
      }
    }
  } catch (_) {}
  return { profile: "env", baseUrl: process.env.IG_BASE_URL || "" };
}

function isLiveProfile(info) {
  return info.profile === "live" || (!info.baseUrl.includes("demo"));
}

function checkLiveSafety(config) {
  const info = getIgProfile();
  const isLive = isLiveProfile(info);

  if (startupProfile && info.profile !== startupProfile) {
    log("WARN", `PROFILE CHANGED mid-run: was "${startupProfile}", now "${info.profile}". Stopping bot for safety. Restart the bot manually after confirming the switch.`);
    return { safe: false, reason: "profile_changed" };
  }

  if (isLive && !config.allowLive) {
    log("WARN", `LIVE TRADING BLOCKED: Profile is "${info.profile}" (${info.baseUrl}) but strategy config does not have "allowLive": true. Add "allowLive": true to ig-strategy.json to enable live trading. Bot will monitor only, no trades.`);
    return { safe: false, reason: "live_not_allowed" };
  }

  return { safe: true, isLive };
}

function proxyRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const full = PROXY_BASE + apiPath;
    const parsed = new URL(full);
    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      Authorization: "Bearer " + GATEWAY_TOKEN,
    };

    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);

    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method,
      headers
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, body: json, raw: data });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function fetchStreamedPrice(epic) {
  try {
    const res = await proxyRequest("GET", "/api/ig/stream/prices");
    if (res.status === 200 && res.body) {
      if (res.body.streaming && res.body.prices && res.body.prices[epic]) {
        const p = res.body.prices[epic];
        if (p.bid && p.offer && (Date.now() - p.timestamp) < 60000) {
          return {
            snapshot: {
              bid: p.bid, offer: p.offer, marketStatus: p.marketState || "TRADEABLE",
              updateTime: new Date(p.timestamp).toISOString()
            }
          };
        }
      }
    }
  } catch (_) {}
  return null;
}

async function fetchAccounts() {
  const res = await proxyRequest("GET", "/api/ig/account");
  if (res.status !== 200) {
    log("ERROR", "Failed to fetch accounts", { status: res.status, error: res.body?.error });
    return null;
  }
  return res.body;
}

async function fetchPositions() {
  const res = await proxyRequest("GET", "/api/ig/positions");
  if (res.status !== 200) {
    log("ERROR", "Failed to fetch positions", { status: res.status, error: res.body?.error });
    return [];
  }
  return res.body?.positions || [];
}

async function fetchPrice(epic) {
  const res = await proxyRequest("GET", `/api/ig/markets/${epic}`);
  if (res.status !== 200) {
    log("ERROR", `Failed to fetch price for ${epic}`, { status: res.status, error: res.body?.error });
    return null;
  }
  return res.body;
}

const REJECTIONS_FILE = path.join(DASHBOARD_DIR, "ig-rejections.json");
const VERIFY_LOG_PATH = path.join(DASHBOARD_DIR, "ig-verify-log.json");

function logRejection(rejection) {
  try {
    if (!fs.existsSync(DASHBOARD_DIR)) fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
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
      if (fs.existsSync(ALERTS_PATH)) {
        alerts = JSON.parse(fs.readFileSync(ALERTS_PATH, "utf8"));
      }
    } catch (_) {}
    alerts.push(alertEntry);
    if (alerts.length > 500) alerts = alerts.slice(-500);
    fs.writeFileSync(ALERTS_PATH, JSON.stringify(alerts, null, 2));
  } catch (_) {}
}

function loadVerifyLog() {
  try {
    if (fs.existsSync(VERIFY_LOG_PATH)) {
      return JSON.parse(fs.readFileSync(VERIFY_LOG_PATH, "utf8"));
    }
  } catch (_) {}
  return [];
}

function saveVerifyLog(entry) {
  try {
    const existing = loadVerifyLog();
    existing.push(entry);
    const trimmed = existing.slice(-50);
    if (!fs.existsSync(DASHBOARD_DIR)) fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
    fs.writeFileSync(VERIFY_LOG_PATH, JSON.stringify(trimmed, null, 2));
  } catch (_) {}
}

async function proofReadTrade(strategy, marketData) {
  const checks = [];
  let pass = true;
  const timestamp = new Date().toISOString();

  let proofCfg = {};
  try {
    proofCfg = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "ig-proofread-config.json"), "utf8"));
  } catch (_) {}

  const snapshot = marketData?.snapshot;
  if (!snapshot) {
    checks.push({ check: "Market data", pass: false, detail: "No snapshot available" });
    saveVerifyLog({ timestamp, instrument: strategy.instrument, verdict: "REJECTED", checks });
    return { approved: false, checks, reason: "No market data available" };
  }

  const bid = snapshot.bid;
  const offer = snapshot.offer;
  const mid = (bid + offer) / 2;
  const spread = offer - bid;
  const spreadPct = mid > 0 ? (spread / mid) * 100 : 999;

  if (snapshot.marketStatus !== "TRADEABLE") {
    checks.push({ check: "Market tradeable", pass: false, detail: `Status: ${snapshot.marketStatus}` });
    pass = false;
  } else {
    checks.push({ check: "Market tradeable", pass: true, detail: `Status: TRADEABLE` });
  }

  if (bid == null || offer == null || bid <= 0 || offer <= 0) {
    checks.push({ check: "Price validity", pass: false, detail: `Bid: ${bid}, Offer: ${offer}` });
    pass = false;
  } else {
    checks.push({ check: "Price validity", pass: true, detail: `Bid: ${bid}, Offer: ${offer}, Mid: ${mid.toFixed(5)}` });
  }

  const updateTime = snapshot.updateTime || snapshot.updateTimeUTC;
  if (updateTime) {
    let updateMs = new Date(updateTime).getTime();
    if (isNaN(updateMs) && /^\d{2}:\d{2}:\d{2}$/.test(updateTime)) {
      const today = new Date().toISOString().slice(0, 11);
      updateMs = new Date(today + updateTime + "Z").getTime();
    }
    const ageSeconds = (Date.now() - updateMs) / 1000;
    if (isNaN(ageSeconds) || ageSeconds > 120) {
      checks.push({ check: "Price staleness", pass: false, detail: `Snapshot age ${isNaN(ageSeconds) ? 'unknown' : Math.round(ageSeconds) + 's'} exceeds 120s limit — data may be stale` });
      pass = false;
    } else {
      checks.push({ check: "Price staleness", pass: true, detail: `Snapshot age ${Math.round(ageSeconds)}s (< 120s limit)` });
    }
  } else {
    checks.push({ check: "Price staleness", pass: true, detail: "No updateTime in snapshot — assuming fresh (just fetched)" });
  }

  const maxSpreadPct = mid > 100 ? 0.5 : 1.0;
  if (spreadPct > maxSpreadPct) {
    checks.push({ check: "Spread limit", pass: false, detail: `Spread ${spread.toFixed(5)} (${spreadPct.toFixed(3)}%) exceeds ${maxSpreadPct}% limit` });
    pass = false;
  } else {
    checks.push({ check: "Spread limit", pass: true, detail: `Spread ${spread.toFixed(5)} (${spreadPct.toFixed(3)}%)` });
  }

  if (!strategy.stopDistance || strategy.stopDistance <= 0) {
    checks.push({ check: "Stop-loss set", pass: false, detail: "No stop-loss distance configured" });
    pass = false;
  } else if (strategy.stopDistance <= spread) {
    checks.push({ check: "Stop-loss vs spread", pass: false, detail: `Stop ${strategy.stopDistance} <= spread ${spread.toFixed(5)} — instant stop-out risk` });
    pass = false;
  } else {
    checks.push({ check: "Stop-loss set", pass: true, detail: `${strategy.stopDistance} pts (> spread ${spread.toFixed(5)})` });
  }

  if (!strategy.limitDistance || strategy.limitDistance <= 0) {
    checks.push({ check: "Take-profit set", pass: false, detail: "No take-profit distance configured" });
    pass = false;
  } else {
    const rr = strategy.limitDistance / strategy.stopDistance;
    if (rr < 1.0) {
      checks.push({ check: "Risk:reward ratio", pass: false, detail: `1:${rr.toFixed(2)} — below 1:1 minimum` });
      pass = false;
    } else {
      checks.push({ check: "Risk:reward ratio", pass: true, detail: `1:${rr.toFixed(2)}` });
    }
  }

  if (!strategy.size || strategy.size <= 0) {
    checks.push({ check: "Position size", pass: false, detail: "Size is zero or negative" });
    pass = false;
  } else {
    checks.push({ check: "Position size", pass: true, detail: `${strategy.size} contracts` });
  }

  if (accountBalance && strategy.stopDistance && strategy.size) {
    const vop = parseFloat(marketData?.instrument?.valueOfOnePip) || 1;
    const sf = parseFloat(marketData?.snapshot?.scalingFactor) || parseFloat(marketData?.instrument?.scalingFactor) || 1;
    const plMultiplier = vop * sf;
    const tradeRisk = strategy.stopDistance * strategy.size * plMultiplier;
    const riskPct = (tradeRisk / accountBalance) * 100;
    if (riskPct > 2) {
      checks.push({ check: "Risk % of balance", pass: false, detail: `${riskPct.toFixed(2)}% exceeds 2% safety limit (risk: ${tradeRisk.toFixed(2)}, balance: ${accountBalance.toFixed(2)})` });
      pass = false;
    } else {
      checks.push({ check: "Risk % of balance", pass: true, detail: `${riskPct.toFixed(2)}% (risk: ${tradeRisk.toFixed(2)}, balance: ${accountBalance.toFixed(2)})` });
    }
  } else {
    checks.push({ check: "Risk % of balance", pass: false, detail: "Cannot calculate — missing balance, stop, or size" });
    pass = false;
  }

  const existingOnInstrument = openPositions.filter(
    (p) => (p.market?.epic === strategy.instrument) && (p.position?.direction === strategy.direction)
  );
  if (existingOnInstrument.length > 0) {
    if (proofCfg.allowDuplicatePositions) {
      checks.push({ check: "No duplicate position", pass: true, detail: `${existingOnInstrument.length} existing — duplicates allowed by config` });
    } else {
      checks.push({ check: "No duplicate position", pass: false, detail: `Already ${existingOnInstrument.length} ${strategy.direction} position(s) on ${strategy.instrument}` });
      pass = false;
    }
  } else {
    checks.push({ check: "No duplicate position", pass: true, detail: "No existing position in same direction" });
  }

  if (strategy.direction === "BUY" && strategy.entryBelow != null) {
    const priceDiffPct = Math.abs(mid - strategy.entryBelow) / mid * 100;
    if (priceDiffPct > 5) {
      checks.push({ check: "Entry price sanity", pass: false, detail: `Entry ${strategy.entryBelow} is ${priceDiffPct.toFixed(2)}% from mid ${mid.toFixed(5)} — possible stale/hallucinated value` });
      pass = false;
    } else {
      checks.push({ check: "Entry price sanity", pass: true, detail: `Entry ${strategy.entryBelow} within ${priceDiffPct.toFixed(2)}% of mid ${mid.toFixed(5)}` });
    }
  }
  if (strategy.direction === "SELL" && strategy.entryAbove != null) {
    const priceDiffPct = Math.abs(mid - strategy.entryAbove) / mid * 100;
    if (priceDiffPct > 5) {
      checks.push({ check: "Entry price sanity", pass: false, detail: `Entry ${strategy.entryAbove} is ${priceDiffPct.toFixed(2)}% from mid ${mid.toFixed(5)} — possible stale/hallucinated value` });
      pass = false;
    } else {
      checks.push({ check: "Entry price sanity", pass: true, detail: `Entry ${strategy.entryAbove} within ${priceDiffPct.toFixed(2)}% of mid ${mid.toFixed(5)}` });
    }
  }

  const verdict = pass ? "APPROVED" : "REJECTED";
  const entry = {
    timestamp,
    instrument: strategy.instrument,
    name: strategy.name || strategy.instrument,
    direction: strategy.direction,
    size: strategy.size,
    stopDistance: strategy.stopDistance,
    limitDistance: strategy.limitDistance,
    liveBid: bid,
    liveOffer: offer,
    spread: spread,
    verdict,
    checks
  };

  saveVerifyLog(entry);

  const checkSummary = checks.map(c => `  ${c.pass ? "✅" : "❌"} ${c.check}: ${c.detail}`).join("\n");
  log(pass ? "INFO" : "WARN", `PROOF READ ${verdict}: ${strategy.name || strategy.instrument}\n${checkSummary}`);

  if (!pass) {
    const failures = checks.filter(c => !c.pass).map(c => c.check + ": " + c.detail);
    return { approved: false, checks, reason: failures.join("; ") };
  }
  return { approved: true, checks };
}

async function openPosition(strategy) {
  const body = {
    epic: strategy.instrument,
    direction: strategy.direction,
    size: strategy.size,
    orderType: "MARKET",
    expiry: "-",
    forceOpen: true,
    guaranteedStop: false,
    stopDistance: strategy.stopDistance,
    limitDistance: strategy.limitDistance
  };
  const cc = strategy.currencyCode || currentConfig.currencyCode;
  if (cc) body.currencyCode = cc;

  log("TRADE", `Opening ${strategy.direction} position on ${strategy.name || strategy.instrument}`, body);

  if (TEST_MODE) {
    log("INFO", "[TEST] Would place order — skipping in test mode.", body);
    return { dealReference: "TEST-" + Date.now(), testMode: true };
  }

  let res;
  try {
    res = await proxyRequest("POST", "/api/ig/positions/open", body);
  } catch (apiErr) {
    const errMsg = `API network error opening position: ${apiErr.message} | strategy="${strategy.name || strategy.instrument}" instrument=${strategy.instrument} direction=${strategy.direction} size=${strategy.size}`;
    log("ERROR", errMsg, { error: apiErr.message, strategy: strategy.name, instrument: strategy.instrument });
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "ig-trading-bot",
      strategyName: strategy.name || strategy.instrument,
      instrument: strategy.instrument,
      direction: strategy.direction,
      size: strategy.size,
      stopDistance: strategy.stopDistance,
      limitDistance: strategy.limitDistance,
      reason: "API network error: " + apiErr.message,
      igErrorCode: "NETWORK_ERROR",
      details: errMsg
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic: strategy.instrument, name: strategy.name || strategy.instrument, message: errMsg });
    return null;
  }

  if (res.status !== 200 || !res.body?.ok) {
    const igError = res.body?.error || res.body?.errorCode || "unknown";
    const errMsg = `TRADE REJECTED: Failed to open position | strategy="${strategy.name || strategy.instrument}" instrument=${strategy.instrument} direction=${strategy.direction} size=${strategy.size} stop=${strategy.stopDistance} limit=${strategy.limitDistance} httpStatus=${res.status} igError="${igError}"`;
    log("ERROR", errMsg, { status: res.status, error: igError, body: res.body });
    const rejection = {
      timestamp: new Date().toISOString(),
      type: "trade_rejected",
      source: "ig-trading-bot",
      strategyName: strategy.name || strategy.instrument,
      instrument: strategy.instrument,
      direction: strategy.direction,
      size: strategy.size,
      stopDistance: strategy.stopDistance,
      limitDistance: strategy.limitDistance,
      reason: "IG API rejected: " + igError,
      igErrorCode: String(igError),
      httpStatus: res.status,
      details: errMsg,
      rawResponse: res.body
    };
    logRejection(rejection);
    writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic: strategy.instrument, name: strategy.name || strategy.instrument, message: errMsg });
    return null;
  }

  const dealRef = res.body.dealReference;
  const confirmation = res.body.confirmation;
  if (confirmation) {
    if (confirmation.dealStatus !== "ACCEPTED") {
      const rejReason = confirmation.reason || confirmation.dealStatus || "unknown";
      const rejMsg = `TRADE REJECTED by IG confirmation: strategy="${strategy.name || strategy.instrument}" instrument=${strategy.instrument} direction=${strategy.direction} size=${strategy.size} dealStatus="${confirmation.dealStatus}" reason="${rejReason}" dealId=${confirmation.dealId || "none"}`;
      log("ERROR", rejMsg, { dealId: confirmation.dealId, status: confirmation.dealStatus, reason: rejReason });
      const rejection = {
        timestamp: new Date().toISOString(),
        type: "trade_rejected",
        source: "ig-trading-bot",
        strategyName: strategy.name || strategy.instrument,
        instrument: strategy.instrument,
        direction: strategy.direction,
        size: strategy.size,
        stopDistance: strategy.stopDistance,
        limitDistance: strategy.limitDistance,
        reason: rejReason,
        igErrorCode: confirmation.dealStatus,
        dealReference: dealRef,
        details: rejMsg,
        rawResponse: confirmation
      };
      logRejection(rejection);
      writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic: strategy.instrument, name: strategy.name || strategy.instrument, message: rejMsg });
      return null;
    }
    log("TRADE", `Deal confirmed: ${confirmation.dealStatus}`, {
      dealId: confirmation.dealId,
      status: confirmation.dealStatus,
      reason: confirmation.reason,
      level: confirmation.level
    });
  } else {
    log("INFO", `Order placed, dealReference: ${dealRef}`);
  }
  return confirmation || res.body;
}

function evaluateStrategy(strategy, marketData) {
  if (!strategy.enabled) return { trigger: false, reason: "Strategy disabled" };

  const snapshot = marketData?.snapshot;
  if (!snapshot) return { trigger: false, reason: "No snapshot data" };

  const bid = snapshot.bid;
  const offer = snapshot.offer;
  if (bid == null || offer == null) return { trigger: false, reason: "No bid/offer" };

  const mid = (bid + offer) / 2;
  const marketStatus = snapshot.marketStatus;

  if (marketStatus !== "TRADEABLE") {
    return { trigger: false, reason: `Market not tradeable (${marketStatus})` };
  }

  if (strategy.direction === "BUY" && strategy.entryBelow != null) {
    if (mid < strategy.entryBelow) {
      return { trigger: true, reason: `Mid ${mid} below entry ${strategy.entryBelow}`, mid, bid, offer };
    }
    return { trigger: false, reason: `Mid ${mid} above entry ${strategy.entryBelow}`, mid };
  }

  if (strategy.direction === "SELL" && strategy.entryAbove != null) {
    if (mid > strategy.entryAbove) {
      return { trigger: true, reason: `Mid ${mid} above entry ${strategy.entryAbove}`, mid, bid, offer };
    }
    return { trigger: false, reason: `Mid ${mid} below entry ${strategy.entryAbove}`, mid };
  }

  return { trigger: false, reason: "No entry condition matched" };
}

function checkRiskLimits(strategy, config, positions, marketData) {
  if (positions.length >= (config.maxOpenPositions || 3)) {
    return { allowed: false, reason: `Max open positions reached (${positions.length}/${config.maxOpenPositions || 3})` };
  }

  const sameInstrument = positions.filter(
    (p) => p.market?.epic === strategy.instrument || p.market?.instrumentName === strategy.instrument
  );
  const sameDirDupes = sameInstrument.filter(
    (p) => p.position?.direction === strategy.direction
  );
  if (sameDirDupes.length > 0) {
    let allowDupes = false;
    try {
      const prCfg = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "ig-proofread-config.json"), "utf8"));
      allowDupes = prCfg.allowDuplicatePositions === true;
    } catch (_) {}
    if (!allowDupes) {
      return { allowed: false, reason: `Already have ${sameDirDupes.length} ${strategy.direction} position(s) on ${strategy.instrument} (set Allow Duplicates = Yes to override)` };
    }
    log("WARN", `Duplicate ${strategy.direction} position on ${strategy.instrument} — allowed by proofread config`);
  }

  if (accountBalance && strategy.stopDistance && strategy.size) {
    const vop = parseFloat(marketData?.instrument?.valueOfOnePip) || 1;
    const sf = parseFloat(marketData?.snapshot?.scalingFactor) || parseFloat(marketData?.instrument?.scalingFactor) || 1;
    const plMultiplier = vop * sf;
    const maxRiskPct = config.maxRiskPercent || 1;
    const maxRiskAmount = accountBalance * (maxRiskPct / 100);
    const tradeRisk = strategy.stopDistance * strategy.size * plMultiplier;
    if (tradeRisk > maxRiskAmount) {
      return { allowed: false, reason: `Trade risk ${tradeRisk} exceeds max ${maxRiskAmount.toFixed(2)} (${maxRiskPct}% of ${accountBalance})` };
    }
  }

  return { allowed: true };
}

function checkSignalAlerts(instrument) {
  const alerts = loadAlerts();
  if (!Array.isArray(alerts) || alerts.length === 0) return null;

  const cutoff = Date.now() - 5 * 60 * 1000;
  const recent = alerts.filter(
    (a) => a.epic === instrument && new Date(a.timestamp).getTime() > cutoff
  );
  return recent.length > 0 ? recent[recent.length - 1] : null;
}

function writeCanvasSnapshots(config) {
  try {
    if (!fs.existsSync(DASHBOARD_DIR)) fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
    fs.writeFileSync(path.join(DASHBOARD_DIR, "ig-strategy-snapshot.json"), JSON.stringify(config, null, 2));
    fs.writeFileSync(path.join(DASHBOARD_DIR, "ig-bot-log-snapshot.json"), JSON.stringify(botLog.slice(-100), null, 2));
  } catch (_) {}
}

function writeDashboard(config, positions, lastCycle) {
  try {
    if (!fs.existsSync(DASHBOARD_DIR)) fs.mkdirSync(DASHBOARD_DIR, { recursive: true });

    const strategiesHtml = (config.strategies || [])
      .map((s) => {
        const status = s.enabled ? "🟢 Enabled" : "⚪ Disabled";
        return `<tr><td>${s.name || s.instrument}</td><td>${s.instrument}</td><td>${s.direction}</td><td>${s.size}</td><td>${status}</td></tr>`;
      })
      .join("\n");

    const positionsHtml = positions
      .map((p) => {
        const m = p.market || {};
        const pos = p.position || {};
        return `<tr><td>${m.instrumentName || m.epic || "?"}</td><td>${pos.direction || "?"}</td><td>${pos.size || "?"}</td><td>${pos.level || "?"}</td><td>${m.bid || "?"}</td></tr>`;
      })
      .join("\n") || "<tr><td colspan='5'>No open positions</td></tr>";

    const recentLogs = botLog
      .slice(-20)
      .reverse()
      .map((e) => `<tr><td>${e.timestamp}</td><td>${e.level}</td><td>${e.message}</td></tr>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="30">
<title>IG Trading Bot Status</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 960px; margin: 0 auto; padding: 20px; background: #0d1117; color: #c9d1d9; }
h1 { color: #58a6ff; }
h2 { color: #8b949e; border-bottom: 1px solid #30363d; padding-bottom: 8px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #21262d; }
th { background: #161b22; color: #8b949e; font-weight: 600; }
tr:hover { background: #161b22; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.on { background: #1b4332; color: #2dc653; }
.off { background: #3d1f00; color: #f0883e; }
.test { background: #1c2541; color: #79c0ff; }
.meta { color: #8b949e; font-size: 14px; }
</style>
</head>
<body>
<h1>IG Trading Bot</h1>
<p class="meta">Last updated: ${new Date().toISOString()} ${TEST_MODE ? '<span class="status test">TEST MODE</span>' : config.enabled ? '<span class="status on">LIVE</span>' : '<span class="status off">DISABLED</span>'}</p>

<h2>Strategies</h2>
<table>
<tr><th>Name</th><th>Instrument</th><th>Direction</th><th>Size</th><th>Status</th></tr>
${strategiesHtml}
</table>

<h2>Open Positions</h2>
<table>
<tr><th>Instrument</th><th>Direction</th><th>Size</th><th>Entry</th><th>Current Bid</th></tr>
${positionsHtml}
</table>

<h2>Recent Activity</h2>
<table>
<tr><th>Time</th><th>Level</th><th>Message</th></tr>
${recentLogs}
</table>

<p class="meta">Account balance: ${accountBalance != null ? accountBalance.toFixed(2) : "N/A"} | Max positions: ${config.maxOpenPositions || 3} | Risk limit: ${config.maxRiskPercent || 1}%</p>
</body>
</html>`;

    fs.writeFileSync(DASHBOARD_PATH, html);
  } catch (e) {
    log("WARN", `Failed to write dashboard: ${e.message}`);
  }
}

async function attachStrategy(strategyIndex, dealId) {
  try {
    const res = await proxyRequest("POST", `/api/ig/strategies/${strategyIndex}/attach`, { dealId });
    if (res.status === 200 && res.body?.ok) {
      log("INFO", `Strategy #${strategyIndex} attached to deal ${dealId}`);
      return true;
    }
    log("WARN", `Failed to attach strategy #${strategyIndex} to deal ${dealId}: ${res.body?.error || res.raw}`);
  } catch (e) {
    log("ERROR", `Attach error: ${e.message}`);
  }
  return false;
}

async function detachStrategy(strategyIndex) {
  try {
    const res = await proxyRequest("POST", `/api/ig/strategies/${strategyIndex}/detach`);
    if (res.status === 200 && res.body?.ok) {
      log("INFO", `Strategy #${strategyIndex} detached (position closed)`);
      return true;
    }
    log("WARN", `Failed to detach strategy #${strategyIndex}: ${res.body?.error || res.raw}`);
  } catch (e) {
    log("ERROR", `Detach error: ${e.message}`);
  }
  return false;
}

async function runCycle(config) {
  let proofCfgSummary = "disabled";
  try {
    const pc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "ig-proofread-config.json"), "utf8"));
    proofCfgSummary = pc.enabled ? `ON (dupes:${pc.allowDuplicatePositions ? 'yes' : 'no'}, maxRisk:${pc.maxRiskPct}%)` : "OFF";
  } catch (_) {}

  const allStrategies = config.strategies || [];
  const enabledWithIndex = allStrategies
    .map((s, idx) => ({ strategy: s, originalIndex: idx }))
    .filter((e) => e.strategy.enabled);

  if (enabledWithIndex.length === 0) {
    log("INFO", `No enabled strategies. ProofReader: ${proofCfgSummary}`);
    return;
  }

  openPositions = await fetchPositions();
  log("INFO", `Open positions: ${openPositions.length}. ProofReader: ${proofCfgSummary}`);

  const openDealIds = new Set(openPositions.map((p) => p.position?.dealId).filter(Boolean));

  for (const { strategy, originalIndex } of enabledWithIndex) {
    if (strategy.dealId) {
      if (!openDealIds.has(strategy.dealId)) {
        log("INFO", `Strategy "${strategy.name || strategy.instrument}" was attached to deal ${strategy.dealId} which is now closed. Detaching.`);
        await detachStrategy(originalIndex);
      } else if (strategy.paused) {
        log("INFO", `Strategy "${strategy.name || strategy.instrument}" is paused (attached to ${strategy.dealId}). Skipping.`);
      }
      continue;
    }

    if (strategy.paused) {
      log("INFO", `Strategy "${strategy.name || strategy.instrument}" is paused. Skipping.`);
      continue;
    }

    log("INFO", `Evaluating: ${strategy.name || strategy.instrument}`);

    let marketData = null;
    let priceSource = "REST";
    if (config.useStreaming !== false) {
      marketData = await fetchStreamedPrice(strategy.instrument);
      if (marketData) priceSource = "STREAM";
    }
    if (!marketData) {
      if (originalIndex > 0) await new Promise((r) => setTimeout(r, 1000));
      marketData = await fetchPrice(strategy.instrument);
    }
    if (!marketData) {
      log("WARN", `Skipping ${strategy.instrument} — could not fetch price.`);
      continue;
    }

    const eval_ = evaluateStrategy(strategy, marketData);
    log("INFO", `${strategy.instrument} [${priceSource}]: ${eval_.reason}`);

    if (!eval_.trigger) continue;

    const risk = checkRiskLimits(strategy, config, openPositions, marketData);
    if (!risk.allowed) {
      const rejMsg = `TRADE BLOCKED by risk limits: strategy="${strategy.name || strategy.instrument}" instrument=${strategy.instrument} direction=${strategy.direction} size=${strategy.size} | ${risk.reason}`;
      log("ERROR", rejMsg);
      const rejection = {
        timestamp: new Date().toISOString(),
        type: "trade_rejected",
        source: "ig-trading-bot",
        engine: "risk-limits",
        strategyName: strategy.name || strategy.instrument,
        instrument: strategy.instrument,
        direction: strategy.direction,
        size: strategy.size,
        reason: "Risk limit: " + risk.reason,
        igErrorCode: "RISK_LIMIT",
        details: rejMsg
      };
      logRejection(rejection);
      writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic: strategy.instrument, name: strategy.name || strategy.instrument, message: rejMsg });
      continue;
    }

    const signal = checkSignalAlerts(strategy.instrument);
    if (signal) {
      log("INFO", `Signal alert found for ${strategy.instrument}: ${signal.type || signal.signal}`);
    }

    let prEnabled = true;
    try {
      const prc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "ig-proofread-config.json"), "utf8"));
      prEnabled = prc.enabled !== false;
    } catch (_) {}

    if (prEnabled) {
      const verification = await proofReadTrade(strategy, marketData);
      if (!verification.approved) {
        const failedChecks = (verification.checks || []).filter(c => !c.pass);
        const failedDetails = failedChecks.map(c => `${c.check}: ${c.detail}`).join("; ");
        const rejMsg = `TRADE BLOCKED by proof reader: strategy="${strategy.name || strategy.instrument}" instrument=${strategy.instrument} direction=${strategy.direction} size=${strategy.size} | Failed checks: ${failedDetails}`;
        log("ERROR", rejMsg, { instrument: strategy.instrument, failedChecks });
        const rejection = {
          timestamp: new Date().toISOString(),
          type: "trade_rejected",
          source: "ig-trading-bot",
          engine: "proof-reader",
          strategyName: strategy.name || strategy.instrument,
          instrument: strategy.instrument,
          direction: strategy.direction,
          size: strategy.size,
          stopDistance: strategy.stopDistance,
          limitDistance: strategy.limitDistance,
          reason: "Proof reader: " + verification.reason,
          igErrorCode: "PROOF_READ_FAIL",
          failedChecks: failedChecks.map(c => ({ check: c.check, detail: c.detail })),
          details: rejMsg
        };
        logRejection(rejection);
        writeAlertNotification({ timestamp: new Date().toISOString(), type: "trade_rejected", epic: strategy.instrument, name: strategy.name || strategy.instrument, message: rejMsg });
        continue;
      }
      log("INFO", `TRADE APPROVED by proof reader: ${strategy.instrument}`);
    } else {
      log("INFO", `Proof reader OFF — skipping checks for ${strategy.instrument}`);
    }

    const result = await openPosition(strategy);
    if (result) {
      log("TRADE", `Position opened on ${strategy.instrument}`, result);
      const dealId = result.dealId;
      if (dealId && !result.testMode) {
        await attachStrategy(originalIndex, dealId);
      }
      openPositions = await fetchPositions();
    }
  }

  writeCanvasSnapshots(config);
  writeDashboard(config, openPositions, new Date().toISOString());
}

async function main() {
  const info = getIgProfile();
  const isLive = isLiveProfile(info);
  startupProfile = info.profile;
  console.log(`\n=== IG Trading Bot ${TEST_MODE ? "(TEST MODE)" : "(LIVE)"} ===`);
  console.log(`Using IG profile: ${info.profile} (${isLive ? "LIVE" : "DEMO"}) — via proxy at ${PROXY_BASE}`);
  if (isLive) console.log(`*** LIVE ACCOUNT — real money at risk ***\n`);
  else console.log(``);

  const config = loadConfig();
  currentConfig = config;

  if (!config.enabled && !TEST_MODE) {
    log("INFO", 'Bot is disabled in config. Set "enabled": true in ig-strategy.json to start trading.');
    writeDashboard(config, [], null);
    return;
  }

  if (!TEST_MODE) {
    const safety = checkLiveSafety(config);
    if (!safety.safe) {
      if (safety.reason === "live_not_allowed") {
        log("INFO", "Bot will start in MONITOR-ONLY mode (no trades on live). Add \"allowLive\": true to ig-strategy.json and restart to enable live trading.");
      } else {
        return;
      }
    }
  }

  log("INFO", "Using centralized proxy session (no direct IG auth)");

  if (!GATEWAY_TOKEN) {
    log("ERROR", "OPENCLAW_GATEWAY_TOKEN not set. Bot cannot authenticate with the proxy.");
    process.exit(1);
  }

  const accounts = await fetchAccounts();
  if (accounts?.accounts?.length > 0) {
    const igCfg = getIgProfile();
    let accountId = null;
    try {
      const cfgFile = JSON.parse(fs.readFileSync(IG_CONFIG_FILE, "utf8"));
      const profile = cfgFile.profiles[cfgFile.activeProfile];
      if (profile) accountId = profile.accountId;
    } catch (_) {}
    const acct = (accountId && accounts.accounts.find((a) => a.accountId === accountId)) || accounts.accounts[0];
    accountBalance = acct.balance?.balance || acct.balance?.available || null;
    log("INFO", `Account: ${acct.accountId}, Balance: ${accountBalance}`);
  }

  if (TEST_MODE) {
    log("INFO", "Running single test cycle...");
    await runCycle(config);
    log("INFO", "Test cycle complete.");
    return;
  }

  const interval = (config.checkIntervalSeconds || 15) * 1000;
  log("INFO", `Starting bot loop (interval: ${config.checkIntervalSeconds || 15}s). Press Ctrl+C to stop.`);

  const loop = async () => {
    try {
      const freshConfig = loadConfig();
      currentConfig = freshConfig;

      const safety = checkLiveSafety(freshConfig);
      if (!safety.safe) {
        if (safety.reason === "profile_changed") {
          log("WARN", "Bot shutting down due to profile change. Restart manually after confirming.");
          writeDashboard(freshConfig, openPositions, null);
          process.exit(0);
          return;
        }
        if (safety.reason === "live_not_allowed") {
          writeDashboard(freshConfig, openPositions, null);
          setTimeout(loop, interval);
          return;
        }
      }

      if (!freshConfig.enabled) {
        log("INFO", "Bot disabled via config. Pausing...");
        writeDashboard(freshConfig, openPositions, null);
      } else {
        await runCycle(freshConfig);
      }
    } catch (e) {
      log("ERROR", `Cycle error: ${e.message}`);
    }
    setTimeout(loop, interval);
  };

  await loop();
}

main().catch((e) => {
  log("ERROR", `Fatal: ${e.message}`);
  process.exit(1);
});
