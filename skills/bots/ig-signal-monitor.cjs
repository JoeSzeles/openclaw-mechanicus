#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), ".openclaw", "ig-monitor-config.json");
const ALERTS_PATH = path.join(process.cwd(), ".openclaw", "ig-alerts.json");
const CANVAS_DIR = path.join(process.cwd(), ".openclaw", "canvas");
const IG_CONFIG_FILE = path.join(process.cwd(), ".openclaw", "ig-config.json");
const TEST_MODE = process.argv.includes("--test");

const PROXY_BASE = "http://localhost:5000";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

const priceHistory = {};
const sessionHighLow = {};
const alertCooldowns = {};
const COOLDOWN_MS = 5 * 60 * 1000;

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function canAlert(epic, type) {
  const key = epic + ":" + type;
  const now = Date.now();
  if (alertCooldowns[key] && (now - alertCooldowns[key]) < COOLDOWN_MS) return false;
  alertCooldowns[key] = now;
  return true;
}


function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    log(`Config not found at ${CONFIG_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function loadAlerts() {
  if (!fs.existsSync(ALERTS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(ALERTS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveAlerts(alerts) {
  const dir = path.dirname(ALERTS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ALERTS_PATH, JSON.stringify(alerts, null, 2));
}

function proxyRequest(method, apiPath) {
  return new Promise((resolve, reject) => {
    const full = PROXY_BASE + apiPath;
    const parsed = new URL(full);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
        Authorization: "Bearer " + GATEWAY_TOKEN,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        let json = null;
        try { json = JSON.parse(raw); } catch (_) {}
        resolve({ status: res.statusCode, body: json, raw });
      });
    });
    req.on("error", reject);
    req.end();
  });
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

async function fetchPrice(epic) {
  const res = await proxyRequest("GET", `/api/ig/markets/${epic}`);
  if (res.status !== 200) {
    log(`Failed to fetch price for ${epic} (${res.status}): ${res.body?.error || res.raw}`);
    return null;
  }
  return res.body;
}

function recordTick(epic, bid, offer) {
  const now = Date.now();
  const mid = (bid + offer) / 2;
  if (!priceHistory[epic]) priceHistory[epic] = [];
  priceHistory[epic].push({ time: now, bid, offer, mid });
  if (priceHistory[epic].length > 500) {
    priceHistory[epic] = priceHistory[epic].slice(-250);
  }
}

function makeSignal(epic, name, type, message, latest) {
  return {
    timestamp: new Date().toISOString(),
    epic, name, type, message,
    bid: latest.bid, offer: latest.offer, mid: latest.mid,
  };
}

function detectSignals(instrument, config) {
  const epic = instrument.epic;
  const history = priceHistory[epic];
  if (!history || history.length < 2) return [];

  const signals = [];
  const latest = history[history.length - 1];
  const name = instrument.name;

  if (!sessionHighLow[epic]) {
    sessionHighLow[epic] = { high: latest.mid, low: latest.mid, highTime: latest.time, lowTime: latest.time };
  }
  const shl = sessionHighLow[epic];
  if (latest.mid > shl.high) { shl.high = latest.mid; shl.highTime = latest.time; }
  if (latest.mid < shl.low) { shl.low = latest.mid; shl.lowTime = latest.time; }

  const windowMs = (config.signals.windowSeconds || 30) * 1000;
  const cutoff = latest.time - windowMs;
  const windowTicks = history.filter((t) => t.time >= cutoff);

  if (windowTicks.length >= 2) {
    const oldest = windowTicks[0];
    const pctChange = ((latest.mid - oldest.mid) / oldest.mid) * 100;
    const dropThreshold = config.signals.dropPercent || 0.5;
    const spikeThreshold = config.signals.spikePercent || 0.5;

    if (pctChange <= -dropThreshold && canAlert(epic, "drop")) {
      signals.push(makeSignal(epic, name, "drop",
        `${name} dropped ${Math.abs(pctChange).toFixed(2)}% in ${config.signals.windowSeconds}s (${oldest.mid.toFixed(2)} → ${latest.mid.toFixed(2)})`, latest));
    }
    if (pctChange >= spikeThreshold && canAlert(epic, "spike")) {
      signals.push(makeSignal(epic, name, "spike",
        `${name} spiked ${pctChange.toFixed(2)}% in ${config.signals.windowSeconds}s (${oldest.mid.toFixed(2)} → ${latest.mid.toFixed(2)})`, latest));
    }
  }

  const trend5m = latest.time - 5 * 60 * 1000;
  const trend5Ticks = history.filter((t) => t.time >= trend5m);
  if (trend5Ticks.length >= 5) {
    const t5oldest = trend5Ticks[0];
    const t5pct = ((latest.mid - t5oldest.mid) / t5oldest.mid) * 100;
    let allUp = true, allDown = true;
    for (let i = 1; i < trend5Ticks.length; i++) {
      if (trend5Ticks[i].mid < trend5Ticks[i - 1].mid) allUp = false;
      if (trend5Ticks[i].mid > trend5Ticks[i - 1].mid) allDown = false;
    }
    if (allUp && t5pct > 0.05 && canAlert(epic, "trend_up")) {
      signals.push(makeSignal(epic, name, "trend_up",
        `${name} trending UP over ${trend5Ticks.length} ticks (+${t5pct.toFixed(3)}%, ${t5oldest.mid.toFixed(2)} → ${latest.mid.toFixed(2)})`, latest));
    }
    if (allDown && t5pct < -0.05 && canAlert(epic, "trend_down")) {
      signals.push(makeSignal(epic, name, "trend_down",
        `${name} trending DOWN over ${trend5Ticks.length} ticks (${t5pct.toFixed(3)}%, ${t5oldest.mid.toFixed(2)} → ${latest.mid.toFixed(2)})`, latest));
    }
  }

  if (history.length >= 10) {
    const recent20 = history.slice(-20);
    const mids = recent20.map(t => t.mid);
    const avg = mids.reduce((a, b) => a + b, 0) / mids.length;
    const variance = mids.reduce((s, m) => s + (m - avg) ** 2, 0) / mids.length;
    const stddev = Math.sqrt(variance);
    const volatilityPct = avg > 0 ? (stddev / avg) * 100 : 0;
    if (volatilityPct > 0.15 && canAlert(epic, "high_volatility")) {
      signals.push(makeSignal(epic, name, "high_volatility",
        `${name} high volatility: stddev ${stddev.toFixed(2)} (${volatilityPct.toFixed(3)}% of price) over ${recent20.length} ticks`, latest));
    }
  }

  const sessionRange = shl.high - shl.low;
  const minSessionRangePct = shl.high > 0 ? (sessionRange / shl.high) * 100 : 0;
  if (minSessionRangePct > 0.02 && history.length >= 20) {
    if (latest.mid === shl.high && canAlert(epic, "session_high")) {
      signals.push(makeSignal(epic, name, "session_high",
        `${name} new session HIGH ${latest.mid.toFixed(2)} (range: ${shl.low.toFixed(2)} – ${shl.high.toFixed(2)}, span: ${sessionRange.toFixed(2)})`, latest));
    }
    if (latest.mid === shl.low && canAlert(epic, "session_low")) {
      signals.push(makeSignal(epic, name, "session_low",
        `${name} new session LOW ${latest.mid.toFixed(2)} (range: ${shl.low.toFixed(2)} – ${shl.high.toFixed(2)}, span: ${sessionRange.toFixed(2)})`, latest));
    }
  }

  if (history.length >= 6) {
    const recentSlice = history.slice(-6);
    let peakIdx = 0, troughIdx = 0;
    for (let i = 1; i < recentSlice.length; i++) {
      if (recentSlice[i].mid > recentSlice[peakIdx].mid) peakIdx = i;
      if (recentSlice[i].mid < recentSlice[troughIdx].mid) troughIdx = i;
    }
    const minReversalPct = 0.03;
    if (peakIdx > 0 && peakIdx < recentSlice.length - 1) {
      const dropFromPeak = ((recentSlice[peakIdx].mid - latest.mid) / recentSlice[peakIdx].mid) * 100;
      if (dropFromPeak > minReversalPct && canAlert(epic, "reversal_down")) {
        signals.push(makeSignal(epic, name, "reversal_down",
          `${name} reversal DOWN: peaked at ${recentSlice[peakIdx].mid.toFixed(2)}, now ${latest.mid.toFixed(2)} (-${dropFromPeak.toFixed(3)}%)`, latest));
      }
    }
    if (troughIdx > 0 && troughIdx < recentSlice.length - 1) {
      const riseFromTrough = ((latest.mid - recentSlice[troughIdx].mid) / recentSlice[troughIdx].mid) * 100;
      if (riseFromTrough > minReversalPct && canAlert(epic, "reversal_up")) {
        signals.push(makeSignal(epic, name, "reversal_up",
          `${name} reversal UP: bottomed at ${recentSlice[troughIdx].mid.toFixed(2)}, now ${latest.mid.toFixed(2)} (+${riseFromTrough.toFixed(3)}%)`, latest));
      }
    }
  }

  if (instrument.breakoutAbove != null && latest.mid > instrument.breakoutAbove && canAlert(epic, "breakout_above")) {
    signals.push(makeSignal(epic, name, "breakout_above",
      `${name} broke above ${instrument.breakoutAbove} (mid: ${latest.mid.toFixed(2)})`, latest));
  }
  if (instrument.breakoutBelow != null && latest.mid < instrument.breakoutBelow && canAlert(epic, "breakout_below")) {
    signals.push(makeSignal(epic, name, "breakout_below",
      `${name} broke below ${instrument.breakoutBelow} (mid: ${latest.mid.toFixed(2)})`, latest));
  }

  const spread = latest.offer - latest.bid;
  if (instrument.maxSpread != null && spread > instrument.maxSpread && canAlert(epic, "spread")) {
    signals.push(makeSignal(epic, name, "spread",
      `${name} spread ${spread.toFixed(4)} exceeds max ${instrument.maxSpread}`, latest));
  }

  return signals;
}

async function pollCycle(config) {
  const allSignals = [];
  const useStreaming = config.useStreaming !== false;

  for (let i = 0; i < config.instruments.length; i++) {
    const instrument = config.instruments[i];
    let data = null;
    if (useStreaming) {
      data = await fetchStreamedPrice(instrument.epic);
      if (data) {
        // no need for rate limit sleep — streaming data is free
      }
    }
    if (!data) {
      if (i > 0) await new Promise((r) => setTimeout(r, 1000));
      data = await fetchPrice(instrument.epic);
    }
    if (!data || !data.snapshot) {
      log(`No data for ${instrument.name} (${instrument.epic})`);
      continue;
    }

    const bid = data.snapshot.bid;
    const offer = data.snapshot.offer;
    const mid = (bid + offer) / 2;

    log(`${instrument.name}: bid=${bid} offer=${offer} mid=${mid.toFixed(5)} status=${data.snapshot.marketStatus}`);

    recordTick(instrument.epic, bid, offer);
    const signals = detectSignals(instrument, config);

    for (const sig of signals) {
      allSignals.push(sig);
      log(`SIGNAL: ${sig.message}`);
    }
  }

  return allSignals;
}

function writeCanvasSnapshots(config) {
  try {
    if (!fs.existsSync(CANVAS_DIR)) fs.mkdirSync(CANVAS_DIR, { recursive: true });
    fs.writeFileSync(path.join(CANVAS_DIR, "ig-monitor-config-snapshot.json"), JSON.stringify(config, null, 2));
    const alerts = loadAlerts();
    fs.writeFileSync(path.join(CANVAS_DIR, "ig-alerts-snapshot.json"), JSON.stringify(alerts, null, 2));
    writePriceHistorySnapshot(config);
  } catch (_) {}
}

function writePriceHistorySnapshot(config) {
  try {
    const snapshot = {};
    for (const inst of (config.instruments || [])) {
      const epic = inst.epic;
      const history = priceHistory[epic];
      if (!history || history.length === 0) continue;
      const last100 = history.slice(-100);
      snapshot[epic] = {
        name: inst.name || epic,
        ticks: last100
      };
    }
    if (Object.keys(snapshot).length > 0) {
      fs.writeFileSync(path.join(CANVAS_DIR, "ig-price-history.json"), JSON.stringify(snapshot));
    }
  } catch (_) {}
}

async function run() {
  log(TEST_MODE ? "Starting in TEST mode (single cycle)" : "Starting signal monitor");

  const config = loadConfig();
  const info = getIgProfile();
  log(`Using IG profile: ${info.profile} (${info.baseUrl.includes("demo") ? "DEMO" : "LIVE"}) — via proxy at ${PROXY_BASE}`);

  if (!config.enabled) {
    log("Monitor is disabled in config. Set enabled=true to start.");
    process.exit(0);
  }

  if (!config.instruments || config.instruments.length === 0) {
    log("No instruments configured.");
    process.exit(1);
  }

  if (!GATEWAY_TOKEN) {
    log("OPENCLAW_GATEWAY_TOKEN not set. Monitor cannot authenticate with the proxy.");
    process.exit(1);
  }

  log("Using centralized proxy session (no direct IG auth)");

  if (TEST_MODE) {
    log("Running single poll cycle...");
    const signals = await pollCycle(config);
    if (signals.length === 0) {
      log("No signals triggered in test cycle (this is normal on first run with no price history).");
    } else {
      log(`${signals.length} signal(s) would fire:`);
      for (const s of signals) log(`  - ${s.message}`);
    }
    log("Test complete.");
    return;
  }

  const intervalMs = (config.intervalSeconds || 15) * 1000;

  const loop = async () => {
    while (true) {
      const currentConfig = loadConfig();

      if (!currentConfig.enabled) {
        log("Monitor disabled via config. Stopping.");
        break;
      }

      const signals = await pollCycle(currentConfig);

      if (signals.length > 0) {
        const existing = loadAlerts();
        const updated = existing.concat(signals);
        const maxAlerts = 500;
        const trimmed = updated.length > maxAlerts ? updated.slice(-maxAlerts) : updated;
        saveAlerts(trimmed);
        log(`Wrote ${signals.length} alert(s) to ${ALERTS_PATH}`);
      }

      writeCanvasSnapshots(currentConfig);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  await loop();
}

run().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
