#!/usr/bin/env node
"use strict";

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), ".openclaw", "ig-monitor-config.json");
const ALERTS_PATH = path.join(process.cwd(), ".openclaw", "ig-alerts.json");
const CANVAS_DIR = path.join(process.cwd(), ".openclaw", "canvas");
const TEST_MODE = process.argv.includes("--test");

const priceHistory = {};
let cst = null;
let xSecurityToken = null;
let sessionActive = false;
let rateLimitBackoffUntil = 0;
const apiCallTimestamps = [];

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function getRateLimitConfig(config) {
  return {
    apiDelayMs: config.apiDelayMs != null ? config.apiDelayMs : 3000,
    maxApiCallsPerMinute: config.maxApiCallsPerMinute != null ? config.maxApiCallsPerMinute : 10,
    rateLimitBackoffMs: config.rateLimitBackoffMs != null ? config.rateLimitBackoffMs : 300000,
  };
}

async function rateLimitedSleep(config) {
  const rl = getRateLimitConfig(config);
  if (rl.apiDelayMs > 0) {
    await new Promise((r) => setTimeout(r, rl.apiDelayMs));
  }
}

function trackApiCall() {
  const now = Date.now();
  apiCallTimestamps.push(now);
  const oneMinuteAgo = now - 60000;
  while (apiCallTimestamps.length > 0 && apiCallTimestamps[0] < oneMinuteAgo) {
    apiCallTimestamps.shift();
  }
}

async function checkApiQuota(config) {
  const now = Date.now();
  if (rateLimitBackoffUntil > now) {
    const waitSec = Math.ceil((rateLimitBackoffUntil - now) / 1000);
    log(`RATE LIMIT: Backing off for ${waitSec}s more (hit IG quota)`);
    await new Promise((r) => setTimeout(r, rateLimitBackoffUntil - now));
  }
  const rl = getRateLimitConfig(config);
  if (apiCallTimestamps.length >= rl.maxApiCallsPerMinute) {
    const waitMs = 60000 - (now - apiCallTimestamps[0]) + 1000;
    if (waitMs > 0) {
      log(`RATE LIMIT: ${apiCallTimestamps.length} calls in last minute, pausing ${Math.ceil(waitMs / 1000)}s`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
}

function handleRateLimitError(status, body, config) {
  if (status === 403 && body && body.includes("exceeded-api-key-allowance")) {
    const rl = getRateLimitConfig(config);
    rateLimitBackoffUntil = Date.now() + rl.rateLimitBackoffMs;
    log(`RATE LIMIT HIT: IG API quota exceeded (403). Backing off for ${rl.rateLimitBackoffMs / 1000}s. Adjust apiDelayMs/maxApiCallsPerMinute in config for less aggressive polling.`);
    return true;
  }
  return false;
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

function request(method, urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === "https:" ? https : http;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    };
    const req = mod.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        resolve({ status: res.statusCode, headers: res.headers, body: raw });
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function getEnv(name) {
  const v = process.env[name];
  if (!v) {
    log(`Missing environment variable: ${name}`);
    process.exit(1);
  }
  return v;
}

async function authenticate(config) {
  const baseUrl = getEnv("IG_BASE_URL");
  const apiKey = getEnv("IG_API_KEY");
  const username = getEnv("IG_USERNAME");
  const password = getEnv("IG_PASSWORD");

  trackApiCall();
  log("Authenticating with IG API...");
  const res = await request("POST", `${baseUrl}/session`, {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
    "X-IG-API-KEY": apiKey,
    Version: "2",
  }, JSON.stringify({ identifier: username, password }));

  if (res.status !== 200) {
    if (handleRateLimitError(res.status, res.body, config || {})) return false;
    log(`Authentication failed (${res.status}): ${res.body}`);
    sessionActive = false;
    return false;
  }

  cst = res.headers["cst"] || res.headers["CST"];
  xSecurityToken = res.headers["x-security-token"] || res.headers["X-SECURITY-TOKEN"];

  if (!cst || !xSecurityToken) {
    log("Authentication succeeded but missing session tokens in headers");
    sessionActive = false;
    return false;
  }

  sessionActive = true;
  log("Authenticated successfully");
  return true;
}

function authHeaders() {
  return {
    "X-IG-API-KEY": getEnv("IG_API_KEY"),
    CST: cst,
    "X-SECURITY-TOKEN": xSecurityToken,
    "Content-Type": "application/json; charset=UTF-8",
  };
}

async function fetchPrice(epic, config) {
  const baseUrl = getEnv("IG_BASE_URL");
  await checkApiQuota(config || {});
  trackApiCall();
  const res = await request("GET", `${baseUrl}/markets/${epic}`, authHeaders());

  if (res.status === 401) {
    log("Session expired, re-authenticating...");
    const ok = await authenticate(config);
    if (!ok) return null;
    await rateLimitedSleep(config || {});
    trackApiCall();
    const retry = await request("GET", `${baseUrl}/markets/${epic}`, authHeaders());
    if (retry.status !== 200) return null;
    return JSON.parse(retry.body);
  }

  if (handleRateLimitError(res.status, res.body, config || {})) return null;

  if (res.status !== 200) {
    log(`Failed to fetch price for ${epic} (${res.status}): ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
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

function detectSignals(instrument, config) {
  const epic = instrument.epic;
  const history = priceHistory[epic];
  if (!history || history.length < 2) return [];

  const signals = [];
  const latest = history[history.length - 1];
  const windowMs = (config.signals.windowSeconds || 30) * 1000;
  const cutoff = latest.time - windowMs;

  const windowTicks = history.filter((t) => t.time >= cutoff);
  if (windowTicks.length < 2) return signals;

  const oldest = windowTicks[0];
  const pctChange = ((latest.mid - oldest.mid) / oldest.mid) * 100;

  const dropThreshold = config.signals.dropPercent || 0.5;
  const spikeThreshold = config.signals.spikePercent || 0.5;

  if (pctChange <= -dropThreshold) {
    signals.push({
      timestamp: new Date().toISOString(),
      epic,
      name: instrument.name,
      type: "drop",
      message: `${instrument.name} dropped ${Math.abs(pctChange).toFixed(2)}% in ${config.signals.windowSeconds}s`,
      bid: latest.bid,
      offer: latest.offer,
      mid: latest.mid,
    });
  }

  if (pctChange >= spikeThreshold) {
    signals.push({
      timestamp: new Date().toISOString(),
      epic,
      name: instrument.name,
      type: "spike",
      message: `${instrument.name} spiked ${pctChange.toFixed(2)}% in ${config.signals.windowSeconds}s`,
      bid: latest.bid,
      offer: latest.offer,
      mid: latest.mid,
    });
  }

  if (instrument.breakoutAbove != null && latest.mid > instrument.breakoutAbove) {
    signals.push({
      timestamp: new Date().toISOString(),
      epic,
      name: instrument.name,
      type: "breakout_above",
      message: `${instrument.name} broke above ${instrument.breakoutAbove} (mid: ${latest.mid})`,
      bid: latest.bid,
      offer: latest.offer,
      mid: latest.mid,
    });
  }

  if (instrument.breakoutBelow != null && latest.mid < instrument.breakoutBelow) {
    signals.push({
      timestamp: new Date().toISOString(),
      epic,
      name: instrument.name,
      type: "breakout_below",
      message: `${instrument.name} broke below ${instrument.breakoutBelow} (mid: ${latest.mid})`,
      bid: latest.bid,
      offer: latest.offer,
      mid: latest.mid,
    });
  }

  const spread = latest.offer - latest.bid;
  if (instrument.maxSpread != null && spread > instrument.maxSpread) {
    signals.push({
      timestamp: new Date().toISOString(),
      epic,
      name: instrument.name,
      type: "spread",
      message: `${instrument.name} spread ${spread.toFixed(4)} exceeds max ${instrument.maxSpread}`,
      bid: latest.bid,
      offer: latest.offer,
      mid: latest.mid,
    });
  }

  return signals;
}

async function pollCycle(config) {
  const allSignals = [];

  for (let i = 0; i < config.instruments.length; i++) {
    const instrument = config.instruments[i];
    if (i > 0) await rateLimitedSleep(config);
    const data = await fetchPrice(instrument.epic, config);
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

  if (!config.enabled) {
    log("Monitor is disabled in config. Set enabled=true to start.");
    process.exit(0);
  }

  if (!config.instruments || config.instruments.length === 0) {
    log("No instruments configured.");
    process.exit(1);
  }

  const ok = await authenticate(config);
  if (!ok) {
    log("Failed to authenticate. Exiting.");
    process.exit(1);
  }

  const rl = getRateLimitConfig(config);
  log(`Rate limiting: ${rl.apiDelayMs}ms between calls, max ${rl.maxApiCallsPerMinute}/min, backoff ${rl.rateLimitBackoffMs / 1000}s on quota hit`);

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
