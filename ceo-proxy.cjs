const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { WebSocket } = require("ws");

const GATEWAY_PORT = 5001;
const PROXY_PORT = 5000;
const OPENCLAW_HOME = process.env.OPENCLAW_HOME || "/home/runner/workspace";
const DATA_DIR = path.join(OPENCLAW_HOME, ".openclaw");
const API_KEYS_FILE = path.join(DATA_DIR, "api-keys.json");
const EXCHANGE_DIR = path.join(DATA_DIR, "exchange");
const SHAREDSPACE_DIR = path.join(DATA_DIR, "sharedspace");
const WORKSPACE_CEO_DIR = path.join(DATA_DIR, "workspace");
const WORKSPACE_IG_DIR = path.join(DATA_DIR, "workspace-ig");
const TASKS_FILE = path.join(DATA_DIR, "worker-tasks.json");
const CHAT_FILE = path.join(DATA_DIR, "ceo-chat.json");
const BEES_FILE = path.join(DATA_DIR, "available-bees.json");
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const CANVAS_DIR = path.join(DATA_DIR, "canvas");
const BOT_REGISTRY_FILE = path.join(DATA_DIR, "bot-registry.json");
const https = require("https");
const scalperEngine = require("./skills/bots/trade-claw-engine.cjs");

const LOGIN_USER = process.env.OPENCLAW_LOGIN_USER || "Josef_Szeles";
const LOGIN_PASS = process.env.OPENCLAW_LOGIN_PASSWORD || "NiDhRlT9xVeWoE32c3sSacA15Vq9pQKE";
const LOGIN_SESSION_FILE = path.join(DATA_DIR, "login-sessions.json");
const LOGIN_SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function loadLoginSessions() {
  try { if (fs.existsSync(LOGIN_SESSION_FILE)) return JSON.parse(fs.readFileSync(LOGIN_SESSION_FILE, "utf8")); } catch (_) {}
  return {};
}
function saveLoginSessions(sessions) {
  try { fs.writeFileSync(LOGIN_SESSION_FILE, JSON.stringify(sessions)); } catch (_) {}
}
function createLoginSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = loadLoginSessions();
  const now = Date.now();
  for (const k of Object.keys(sessions)) {
    if (now - sessions[k].created > LOGIN_SESSION_MAX_AGE) delete sessions[k];
  }
  sessions[token] = { created: now, user: LOGIN_USER };
  saveLoginSessions(sessions);
  return token;
}
function validateLoginSession(req) {
  if (!LOGIN_USER || !LOGIN_PASS) return true;
  const remote = req.socket.remoteAddress;
  const forwarded = req.headers["x-forwarded-for"];
  const isLocal = (remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1");
  if (isLocal && !forwarded) return true;

  const cookies = (req.headers.cookie || "").split(";").map(c => c.trim());
  for (const c of cookies) {
    if (c.startsWith("openclaw_session=")) {
      const tok = c.slice("openclaw_session=".length);
      const sessions = loadLoginSessions();
      const s = sessions[tok];
      if (s && Date.now() - s.created < LOGIN_SESSION_MAX_AGE) return true;
    }
  }
  return false;
}
function hasValidBearerToken(req) {
  const h = req.headers["authorization"];
  if (h && h.startsWith("Bearer ")) {
    const tok = h.slice(7);
    if (tok === GATEWAY_TOKEN) return true;
    const keys = loadJson(API_KEYS_FILE, { keys: [] });
    if (keys.keys.some(k => k.active && k.key === tok)) return true;
  }
  const url = new URL(req.url, "http://localhost");
  const qToken = url.searchParams.get("_token");
  if (qToken && qToken === GATEWAY_TOKEN) return true;
  return false;
}
function isLoginExempt(req) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  if (p === "/api/login" || p === "/api/logout") return true;
  if (p === "/login.html" || p === "/login") return true;
  if (p.startsWith("/api/workers") || p.startsWith("/api/tasks") || p.startsWith("/api/heartbeat") ||
      p.startsWith("/api/workspace") || p.startsWith("/api/exchange") || p.startsWith("/api/sharedspace") || p.startsWith("/api/chat") || p.startsWith("/api/agent/chat") ||
      p.startsWith("/api/ig/positions") || p.startsWith("/api/ig/prices") || p.startsWith("/api/ig/account") ||
      p.startsWith("/api/ig/confirms") || p.startsWith("/api/ig/history") || p.startsWith("/api/ig/stream") ||
      p.startsWith("/api/ig/workingorders") || p.startsWith("/api/ig/markets") || p.startsWith("/api/ig/marketnavigation") ||
      p.startsWith("/api/ig/pricehistory") || p.startsWith("/api/ig/watchlists") || p.startsWith("/api/ig/activity") ||
      p.startsWith("/api/ig/session") || p === "/api/ig/refresh-snapshots" ||
      p.startsWith("/api/ig/config") || p.startsWith("/api/ig/strategies") || p.startsWith("/api/ig/strategy-templates") || p.startsWith("/api/ig/proofread") || p.startsWith("/api/ig/watchedlist") || p.startsWith("/api/ig/scalper") ||
      p.startsWith("/api/agents/") || p.startsWith("/api/clawscript/") || p.startsWith("/api/voice/") ||
      p.startsWith("/api/bots") || p.startsWith("/api/processes")) {
    if (hasValidBearerToken(req)) return true;
  }
  if (p.startsWith("/__openclaw__/canvas/")) return true;
  return false;
}
function serveLoginPage(req, res) {
  const loginPath = path.join(__dirname, "dist", "control-ui", "login.html");
  try {
    const html = fs.readFileSync(loginPath, "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Login page not found");
  }
}

// IG API persistent session
let igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
const IG_SESSION_TTL = 5 * 60 * 1000;
const IG_SESSION_REFRESH_INTERVAL = 4 * 60 * 1000;
let igSessionStatus = "disconnected";
let igSessionError = null;
let igSessionLastRefresh = 0;
let igSessionRefreshTimer = null;

// IG response cache
const igResponseCache = new Map();
const IG_CACHE_TTL = 30000;

// Long-lived market details cache (contract sizes / pip values don't change)
const marketDetailsCache = new Map();
async function getMarketDetails(epic, session) {
  if (marketDetailsCache.has(epic)) return marketDetailsCache.get(epic);
  try {
    const r = await igRequest("GET", "/markets/" + epic, igHeaders(session));
    if (r.status === 200) {
      const d = safeParseIgBody(r.body);
      const inst = d?.instrument || {};
      const valueOfOnePip = parseFloat(inst.valueOfOnePip) || 1;
      const contractSize = parseFloat(inst.contractSize) || 1;
      const scalingFactor = parseFloat(d?.snapshot?.scalingFactor) || parseFloat(inst.scalingFactor) || 1;
      const plMultiplier = valueOfOnePip * scalingFactor;
      console.log(`[market-details] ${epic}: contractSize=${contractSize}, valueOfOnePip=${valueOfOnePip}, scalingFactor=${scalingFactor}, plMultiplier=${plMultiplier}`);
      const details = {
        valueOfOnePip,
        contractSize,
        scalingFactor,
        plMultiplier
      };
      marketDetailsCache.set(epic, details);
      return details;
    }
  } catch (_) {}
  return { valueOfOnePip: 1, contractSize: 1, scalingFactor: 1, plMultiplier: 1 };
}

function igCacheGet(key) {
  const entry = igResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > IG_CACHE_TTL) { igResponseCache.delete(key); return null; }
  return entry.data;
}

function igCacheSet(key, data) {
  igResponseCache.set(key, { data, ts: Date.now() });
}

function igCacheInvalidate() {
  igResponseCache.clear();
}

// IG credential profiles
const IG_CONFIG_FILE = path.join(DATA_DIR, "ig-config.json");

function loadIgConfig() {
  try {
    if (fs.existsSync(IG_CONFIG_FILE)) return JSON.parse(fs.readFileSync(IG_CONFIG_FILE, "utf8"));
  } catch (_) {}
  return null;
}

function saveIgConfig(config) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(IG_CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getDefaultIgConfig() {
  return {
    activeProfile: "demo",
    timezone: "Australia/Brisbane",
    profiles: {
      demo: {
        label: "Demo Account",
        baseUrl: "https://demo-api.ig.com/gateway/deal",
        apiKey: "",
        username: "",
        password: "",
        accountId: ""
      },
      live: {
        label: "Live Account",
        baseUrl: "https://api.ig.com/gateway/deal",
        apiKey: "",
        username: "",
        password: "",
        accountId: ""
      }
    }
  };
}

function ensureIgConfig() {
  let config = loadIgConfig();
  if (config && !config.timezone) config.timezone = "Australia/Brisbane";
  if (!config) {
    config = getDefaultIgConfig();
    if (process.env.IG_API_KEY || process.env.IG_USERNAME) {
      const profile = (process.env.IG_BASE_URL || "").includes("demo-api") ? "demo" : "live";
      config.activeProfile = profile;
      config.profiles[profile].apiKey = process.env.IG_API_KEY || "";
      config.profiles[profile].username = process.env.IG_USERNAME || "";
      config.profiles[profile].password = process.env.IG_PASSWORD || "";
      config.profiles[profile].accountId = process.env.IG_ACCOUNT_ID || "";
      config.profiles[profile].baseUrl = process.env.IG_BASE_URL || config.profiles[profile].baseUrl;
      console.log(`[ig-config] Seeded ${profile} profile from env vars`);
    }
    saveIgConfig(config);
  }
  return config;
}

function getActiveIgProfile() {
  const config = ensureIgConfig();
  const profile = config.profiles[config.activeProfile];
  if (!profile) return null;
  return { ...profile, profileName: config.activeProfile };
}

function igConfigured() {
  const p = getActiveIgProfile();
  return !!(p && p.apiKey && p.username && p.password && p.baseUrl);
}

// Lightstreamer streaming
let lsClient = null;
let lsLiveClient = null;
let lsSubscription = null;
let lsStatus = "disconnected";
let lsConnectedEpics = [];
const streamedPrices = new Map();
let lsConnectedAt = null;
let lsUpdateCount = 0;
let lsUpdateCounts = {};
let lsLastUpdateTs = 0;
let lsUpdateIntervals = [];
let lsReconnectTimer = null;
let lsReconnectAttempts = 0;
let lsReconnectInFlight = false;
const LS_MAX_RECONNECT_ATTEMPTS = 20;
const LS_RECONNECT_BASE_DELAY = 5000;
const LS_RECONNECT_MAX_DELAY = 120000;
let lsHybridPollingTimer = null;

const STREAM_RESOLUTIONS = {
  SECOND: 1, SECOND_2: 2, SECOND_5: 5, SECOND_10: 10, SECOND_20: 20, SECOND_30: 30, SECOND_40: 40,
  MINUTE: 60, MINUTE_5: 300, MINUTE_15: 900, HOUR: 3600, HOUR_4: 14400, DAY: 86400
};
const streamCandleBuilders = new Map();
let streamCandleFlushTimer = null;

function getStreamCandleKey(epic, resolution) { return epic + ":" + resolution; }

function feedStreamTick(epic, mid, timestamp) {
  if (mid == null || isNaN(mid)) return;
  const tsSec = Math.floor(timestamp / 1000);
  for (const [res, resSec] of Object.entries(STREAM_RESOLUTIONS)) {
    const candleTs = Math.floor(tsSec / resSec) * resSec;
    const key = getStreamCandleKey(epic, res);
    let builder = streamCandleBuilders.get(key);
    if (!builder) {
      builder = { epic, resolution: res, resSec, current: null, completed: [] };
      streamCandleBuilders.set(key, builder);
    }
    if (builder.current && builder.current.ts === candleTs) {
      const c = builder.current;
      c.high = Math.max(c.high, mid);
      c.low = Math.min(c.low, mid);
      c.close = mid;
      c.ticks++;
    } else {
      if (builder.current && builder.current.ticks > 0) {
        builder.completed.push({ ...builder.current });
      }
      builder.current = { ts: candleTs, open: mid, high: mid, low: mid, close: mid, volume: 0, ticks: 1 };
    }
  }
}

function flushStreamCandles() {
  const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
  const allCandles = {};
  for (const [key, builder] of streamCandleBuilders) {
    if (builder.completed.length === 0) continue;
    const toStore = builder.completed.splice(0);
    const storeKey = builder.epic + ":" + builder.resolution;
    if (!allCandles[storeKey]) allCandles[storeKey] = { epic: builder.epic, resolution: builder.resolution, candles: [] };
    allCandles[storeKey].candles.push(...toStore);
  }
  for (const entry of Object.values(allCandles)) {
    if (entry.candles.length === 0) continue;
    scalperDb.storeCandles(entry.epic, entry.resolution, entry.candles).then(stored => {
      if (stored > 0) console.log(`[stream-candles] Stored ${stored} ${entry.resolution} candles for ${entry.epic}`);
    }).catch(err => {
      console.log(`[stream-candles] DB store failed for ${entry.epic} ${entry.resolution}: ${err.message}`);
    });
  }
}

function startStreamCandleFlush() {
  if (streamCandleFlushTimer) return;
  streamCandleFlushTimer = setInterval(flushStreamCandles, 10000);
  console.log("[stream-candles] Started candle aggregation (flush every 10s)");
}

function getStreamCandleStats() {
  const stats = {};
  for (const [key, builder] of streamCandleBuilders) {
    if (!stats[builder.epic]) stats[builder.epic] = {};
    stats[builder.epic][builder.resolution] = {
      currentTs: builder.current ? builder.current.ts : null,
      currentTicks: builder.current ? builder.current.ticks : 0,
      pendingCompleted: builder.completed.length
    };
  }
  return stats;
}

function getStreamCurrentCandles(epic, resolution, count) {
  const key = getStreamCandleKey(epic, resolution);
  const builder = streamCandleBuilders.get(key);
  if (!builder) return [];
  const result = [...builder.completed];
  if (builder.current && builder.current.ticks > 0) result.push(builder.current);
  return result.slice(-count);
}

let hybridPollErrorCount = 0;
function startHybridPricePolling() {
  if (lsHybridPollingTimer) return;
  hybridPollErrorCount = 0;
  startStreamCandleFlush();
  console.log("[lightstreamer] Starting hybrid price polling (L1 unavailable for CFD account)");
  function scheduleNext() {
    const delay = hybridPollErrorCount > 0 ? Math.min(30000, 5000 * hybridPollErrorCount) : 3000;
    lsHybridPollingTimer = setTimeout(pollOnce, delay);
  }
  async function pollOnce() {
    if (!lsHybridPollingTimer) return;
    const epics = collectInstrumentEpics();
    if (epics.length === 0) { scheduleNext(); return; }
    try {
      const session = await igAuth();
      for (let i = 0; i < epics.length; i += 20) {
        const chunk = epics.slice(i, i + 20);
        const url = `/markets?epics=${chunk.join(",")}`;
        const r = await igRequest("GET", url, { ...igHeaders(session), Version: "2" });
        if (r.status === 200) {
          const data = JSON.parse(r.body);
          if (data && data.marketDetails) {
            data.marketDetails.forEach(m => {
              const epic = m.instrument.epic;
              const snapshot = m.snapshot;
              if (!snapshot) return;
              const now = Date.now();
              const bid = snapshot.bid;
              const offer = snapshot.offer;
              const mid = (bid && offer) ? (bid + offer) / 2 : null;
              streamedPrices.set(epic, {
                bid, offer, mid,
                high: snapshot.high,
                low: snapshot.low,
                marketState: snapshot.marketStatus,
                updateTime: snapshot.updateTime,
                timestamp: now,
                isPolled: true
              });
              lsUpdateCount++;
              lsUpdateCounts[epic] = (lsUpdateCounts[epic] || 0) + 1;
              lsLastUpdateTs = now;
              try { scalperEngine.processTick(epic, { bid, offer, mid, spread: (offer && bid) ? offer - bid : 0, timestamp: now }); } catch (_) {}
              if (mid) feedStreamTick(epic, mid, now);
            });
          }
          hybridPollErrorCount = 0;
        } else if (r.status === 403 || r.status === 401) {
          hybridPollErrorCount++;
        }
      }
    } catch (e) {
      hybridPollErrorCount++;
      if (hybridPollErrorCount <= 3) console.error("[lightstreamer] Hybrid polling error:", e.message);
    }
    scheduleNext();
  }
  scheduleNext();
}

function stopHybridPricePolling() {
  if (lsHybridPollingTimer) {
    clearTimeout(lsHybridPollingTimer);
    lsHybridPollingTimer = null;
    console.log("[lightstreamer] Stopped hybrid price polling");
  }
}

function scheduleLsReconnect(reason) {
  if (lsReconnectTimer) clearTimeout(lsReconnectTimer);
  if (lsReconnectInFlight) {
    console.log("[lightstreamer] Reconnect already in-flight, skipping schedule");
    return;
  }
  if (lsReconnectAttempts >= LS_MAX_RECONNECT_ATTEMPTS) {
    console.log(`[lightstreamer] Max reconnect attempts (${LS_MAX_RECONNECT_ATTEMPTS}) reached. Use Force Reconnect button.`);
    lsStatus = "error";
    return;
  }
  const delay = Math.min(LS_RECONNECT_BASE_DELAY * Math.pow(1.5, lsReconnectAttempts), LS_RECONNECT_MAX_DELAY);
  lsReconnectAttempts++;
  console.log(`[lightstreamer] Scheduling reconnect attempt ${lsReconnectAttempts}/${LS_MAX_RECONNECT_ATTEMPTS} in ${Math.round(delay / 1000)}s (reason: ${reason})`);
  lsStatus = "reconnecting";
  lsReconnectTimer = setTimeout(async () => {
    lsReconnectTimer = null;
    if (lsReconnectInFlight) return;
    lsReconnectInFlight = true;
    try {
      if (lsLiveActive) {
        console.log("[lightstreamer] Reconnecting with live session refresh...");
        try { await liveStreamingLogin(); } catch (e) {
          console.log("[lightstreamer] Live session refresh failed during reconnect:", e.message);
        }
      } else if (igConfigured()) {
        console.log("[lightstreamer] Reconnecting with session refresh...");
        igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: igSession.lightstreamerEndpoint };
        try { await igSessionLogin(); } catch (e) {
          console.log("[lightstreamer] Session refresh failed during reconnect:", e.message);
          lsReconnectInFlight = false;
          scheduleLsReconnect("session_refresh_failed");
          return;
        }
      }
      stopLightstreamer(true);
      await startLightstreamer();
      lsReconnectInFlight = false;
      if (lsStatus === "connected" || lsStatus === "reconnecting") {
        console.log("[lightstreamer] Reconnect attempt initiated successfully");
      }
    } catch (e) {
      console.log("[lightstreamer] Reconnect attempt failed:", e.message);
      lsReconnectInFlight = false;
      scheduleLsReconnect("reconnect_error");
    }
  }, delay);
}

// Independent live streaming session (decoupled from trading profile)
let lsLiveSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
let lsLiveActive = false;
let lsLiveRefreshTimer = null;
const LS_LIVE_SESSION_REFRESH = 4 * 60 * 1000;

function getStreamedPrices() {
  const result = {};
  const config = ensureIgConfig();
  const activeProfile = config.activeProfile || "demo";
  for (const [epic, data] of streamedPrices) {
    if (epic === "__ACCOUNT__" && data.source !== activeProfile) continue;
    result[epic] = { ...data };
  }
  return result;
}

function collectInstrumentEpics() {
  const epics = new Set();
  try {
    const monCfg = path.join(DATA_DIR, "ig-monitor-config.json");
    if (fs.existsSync(monCfg)) {
      const cfg = JSON.parse(fs.readFileSync(monCfg, "utf8"));
      if (cfg.instruments) cfg.instruments.forEach(i => { if (i.epic) epics.add(i.epic); });
    }
  } catch (_) {}
  try {
    const strCfg = path.join(DATA_DIR, "ig-strategy.json");
    if (fs.existsSync(strCfg)) {
      const cfg = JSON.parse(fs.readFileSync(strCfg, "utf8"));
      if (cfg.strategies) cfg.strategies.forEach(s => { if (s.instrument) epics.add(s.instrument); });
    }
  } catch (_) {}
  try {
    const scalpCfg = path.join(DATA_DIR, "ig-scalper-config.json");
    if (fs.existsSync(scalpCfg)) {
      const cfg = JSON.parse(fs.readFileSync(scalpCfg, "utf8"));
      if (cfg.strategies) cfg.strategies.forEach(s => { if (s.instrument) epics.add(s.instrument); });
    }
  } catch (_) {}
  return [...epics].slice(0, 40);
}

async function startLightstreamer() {
  if (!igConfigured()) { lsStatus = "not_configured"; return; }
  try {
    const { LightstreamerClient, Subscription } = require("lightstreamer-client-node");

    let session = await igAuth();
    let endpoint = igSession.lightstreamerEndpoint;
    const activeProfile = getActiveIgProfile();
    let accountId = activeProfile ? activeProfile.accountId : null;
    let streamSource = activeProfile ? activeProfile.profileName : "demo";
    if (!endpoint) {
      console.log("[lightstreamer] No endpoint from session, skipping");
      lsStatus = "no_endpoint";
      return;
    }

    if (lsClient) { try { lsClient.disconnect(); } catch (_) {} }

    const client = new LightstreamerClient(endpoint, "DEFAULT");
    client.connectionDetails.setUser(accountId);
    client.connectionDetails.setPassword(`CST-${session.cst}|XST-${session.xst}`);
    console.log(`[lightstreamer] Connecting via ${streamSource} profile`);

    client.addListener({
      onStatusChange: async (status) => {
        console.log("[lightstreamer] Status:", status);
        if (status.startsWith("CONNECTED")) {
          lsStatus = "connected";
          lsReconnectAttempts = 0;
          if (lsReconnectTimer) { clearTimeout(lsReconnectTimer); lsReconnectTimer = null; }
          if (!lsConnectedAt) lsConnectedAt = Date.now();
          try {
            const sc = await scalperEngine.getConfig();
            const st = await scalperEngine.getStatus();
            if (sc && sc.enabled && !st.running) {
              await scalperEngine.start();
            }
          } catch(_) {}
        } else if (status === "DISCONNECTED:WILL-RETRY") {
          lsStatus = "reconnecting";
          console.log("[lightstreamer] Library will retry connection automatically");
        } else if (status.startsWith("DISCONNECTED")) {
          lsStatus = "disconnected";
          lsConnectedAt = null;
          if (!lsReconnectTimer) { scheduleLsReconnect("disconnected"); }
        } else if (status.startsWith("CONNECTING") || status.startsWith("STALLED")) {
          lsStatus = "reconnecting";
          if (status.startsWith("STALLED") && !lsReconnectTimer) { scheduleLsReconnect("stalled"); }
        }
      },
      onServerError: (code, msg) => {
        console.log("[lightstreamer] Server error:", code, msg);
        lsStatus = "error";
        if (!lsReconnectTimer) { scheduleLsReconnect("server_error_" + code); }
      }
    });

    client.connect();
    lsClient = client;

    const epics = collectInstrumentEpics();
    if (epics.length === 0) {
      console.log("[lightstreamer] No instruments to subscribe to");
      lsStatus = "connected";
      lsConnectedEpics = [];
      return;
    }

    const fields = ["BID", "OFFER", "HIGH", "LOW", "MID_OPEN", "MARKET_STATE", "UPDATE_TIME"];
    const items = epics.map(e => `L1:${e}`);
    const sub = new Subscription("MERGE", items, fields);
    sub.setRequestedSnapshot("yes");
    sub.addListener({
      onSubscription: () => {
        console.log(`[lightstreamer] Subscribed to ${epics.length} instruments via ${streamSource}`);
        lsConnectedEpics = epics;
        startStreamCandleFlush();
      },
      onSubscriptionError: (code, msg) => {
        console.error(`[lightstreamer] Subscription error: ${code} ${msg} | source=${streamSource} items=${JSON.stringify(items)}`);
        if (msg && msg.includes("Invalid account type")) {
          console.log("[lightstreamer] L1 not available for this account type — starting hybrid price polling");
          lsStatus = "connected";
          startHybridPricePolling();
        }
      },
      onItemUpdate: (info) => {
        const epicFull = info.getItemName();
        const epic = epicFull.includes(":") ? epicFull.split(":").slice(1).join(":") : epicFull;
        const bid = parseFloat(info.getValue("BID")) || null;
        const offer = parseFloat(info.getValue("OFFER")) || null;
        const mid = (bid && offer) ? (bid + offer) / 2 : null;
        const now = Date.now();
        streamedPrices.set(epic, {
          bid, offer, mid,
          high: parseFloat(info.getValue("HIGH")) || null,
          low: parseFloat(info.getValue("LOW")) || null,
          midOpen: parseFloat(info.getValue("MID_OPEN")) || null,
          marketState: info.getValue("MARKET_STATE") || null,
          updateTime: info.getValue("UPDATE_TIME") || null,
          timestamp: now
        });
        lsUpdateCount++;
        lsUpdateCounts[epic] = (lsUpdateCounts[epic] || 0) + 1;
        if (lsLastUpdateTs > 0) {
          lsUpdateIntervals.push(now - lsLastUpdateTs);
          if (lsUpdateIntervals.length > 200) lsUpdateIntervals = lsUpdateIntervals.slice(-100);
        }
        lsLastUpdateTs = now;
        try { scalperEngine.processTick(epic, { bid, offer, mid, spread: (offer && bid) ? offer - bid : 0, timestamp: now }); } catch (_) {}
        if (mid) feedStreamTick(epic, mid, now);
      },
      onUnsubscription: () => {
        console.log("[lightstreamer] Unsubscribed");
        lsConnectedEpics = [];
      }
    });
    client.subscribe(sub);
    lsSubscription = sub;

    const liveProfile = getLiveProfile();
    const hasLiveCreds = !!(liveProfile && liveProfile.apiKey && liveProfile.username && liveProfile.password && liveProfile.accountId);
    if (hasLiveCreds) {
      try {
        if (!lsLiveActive || !lsLiveSession.cst) {
          await liveStreamingLogin();
          lsLiveActive = true;
          scheduleLiveStreamingRefresh();
        }
        const liveEndpoint = lsLiveSession.lightstreamerEndpoint;
        const liveAccountId = lsLiveSession.accountId || liveProfile.accountId;
        if (liveEndpoint && lsLiveSession.cst) {
          if (lsLiveClient) { try { lsLiveClient.disconnect(); } catch (_) {} }
          const liveClient = new LightstreamerClient(liveEndpoint, "DEFAULT");
          liveClient.connectionDetails.setUser(liveAccountId);
          liveClient.connectionDetails.setPassword(`CST-${lsLiveSession.cst}|XST-${lsLiveSession.xst}`);
          liveClient.addListener({
            onStatusChange: (s) => { if (s.startsWith("CONNECTED")) console.log("[lightstreamer] Live ACCOUNT client connected"); },
            onServerError: (c, m) => console.log("[lightstreamer] Live ACCOUNT client error:", c, m)
          });
          liveClient.connect();
          const acctSub = new Subscription("MERGE", [`ACCOUNT:${liveAccountId}`], ["DEPOSIT", "PNL", "AVAILABLE_CASH", "FUNDS", "MARGIN", "EQUITY"]);
          acctSub.setRequestedSnapshot("yes");
          acctSub.addListener({
            onSubscription: () => console.log(`[lightstreamer] ACCOUNT subscription OK for ${liveAccountId}`),
            onSubscriptionError: (c2, m2) => console.error(`[lightstreamer] ACCOUNT subscription error: ${c2} ${m2}`),
            onItemUpdate: (info2) => {
              streamedPrices.set("__ACCOUNT__", {
                deposit: parseFloat(info2.getValue("DEPOSIT")) || null,
                pnl: parseFloat(info2.getValue("PNL")) || null,
                availableCash: parseFloat(info2.getValue("AVAILABLE_CASH")) || null,
                funds: parseFloat(info2.getValue("FUNDS")) || null,
                margin: parseFloat(info2.getValue("MARGIN")) || null,
                equity: parseFloat(info2.getValue("EQUITY")) || null,
                source: "live",
                timestamp: Date.now()
              });
            }
          });
          liveClient.subscribe(acctSub);
          lsLiveClient = liveClient;
          console.log(`[lightstreamer] Live ACCOUNT client connecting to ${liveEndpoint} for account ${liveAccountId}`);
        }
      } catch (e) {
        console.log("[lightstreamer] Live ACCOUNT streaming setup failed:", e.message);
      }
    }

    console.log(`[lightstreamer] Connecting to ${endpoint} (via ${streamSource}), subscribing to ${epics.length} instruments`);
  } catch (e) {
    console.error("[lightstreamer] Error starting:", e.message);
    lsStatus = "error";
    if (!lsReconnectTimer) {
      scheduleLsReconnect("start_error");
    }
  }
}

function stopLightstreamer(keepReconnect) {
  if (!keepReconnect) { if (lsReconnectTimer) { clearTimeout(lsReconnectTimer); lsReconnectTimer = null; } lsReconnectAttempts = 0; lsReconnectInFlight = false; }
  stopHybridPricePolling();
  if (lsLiveClient && lsLiveClient !== lsClient) {
    try { lsLiveClient.disconnect(); } catch (_) {}
  }
  lsLiveClient = null;
  if (lsClient) {
    try {
      if (lsSubscription) lsClient.unsubscribe(lsSubscription);
      lsClient.disconnect();
    } catch (_) {}
    lsClient = null;
    lsSubscription = null;
    lsStatus = "disconnected";
    lsConnectedEpics = [];
    lsConnectedAt = null;
    lsUpdateCount = 0;
    lsUpdateCounts = {};
    lsLastUpdateTs = 0;
    lsUpdateIntervals = [];
    console.log("[lightstreamer] Disconnected");
  }
}

function getLiveProfile() {
  const config = ensureIgConfig();
  const live = config.profiles && config.profiles.live;
  if (!live || !live.apiKey || !live.username || !live.password || !live.baseUrl) return null;
  return { ...live, profileName: "live" };
}

async function liveStreamingLogin() {
  const profile = getLiveProfile();
  if (!profile) throw new Error("No live profile credentials configured");
  console.log("[live-streaming] Authenticating with live account for streaming...");
  const res = await igRequest("POST", "/session", {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
    "X-IG-API-KEY": profile.apiKey,
    Version: "2",
  }, JSON.stringify({ identifier: profile.username, password: profile.password }), profile.baseUrl);
  if (res.status !== 200) {
    let errDetail = res.body || "";
    try { const ej = JSON.parse(errDetail); errDetail = ej.errorCode || ej.error || errDetail; } catch(_) {}
    throw new Error("Live auth failed: " + errDetail);
  }
  const cst = res.headers["cst"] || res.headers["CST"];
  const xst = res.headers["x-security-token"] || res.headers["X-SECURITY-TOKEN"];
  if (!cst || !xst) throw new Error("Live auth missing tokens");
  let sessionBody = {};
  try { sessionBody = JSON.parse(res.body); } catch (_) {}
  let lsEndpoint = sessionBody.lightstreamerEndpoint || null;
  if (!lsEndpoint) throw new Error("Live account did not return a Lightstreamer endpoint");
  let accountType = sessionBody.accountType || "CFD";
  let accountId = sessionBody.currentAccountId || profile.accountId;
  try {
    const acctRes = await igRequest("GET", "/accounts", {
      "X-IG-API-KEY": profile.apiKey,
      CST: cst,
      "X-SECURITY-TOKEN": xst,
      Version: "1",
    }, null, profile.baseUrl);
    if (acctRes.status === 200) {
      const acctBody = JSON.parse(acctRes.body);
      const accounts = acctBody.accounts || [];
      console.log("[live-streaming] Available accounts:", accounts.map(a => `${a.accountId}(${a.accountType}/${a.status})`).join(", "));
      const spreadbetAccount = accounts.find(a => a.accountType === "SPREADBET" && a.status === "ENABLED");
      if (spreadbetAccount && spreadbetAccount.accountId !== accountId) {
        console.log(`[live-streaming] Switching to spreadbet account ${spreadbetAccount.accountId} for L1 market data streaming`);
        const switchRes = await igRequest("PUT", "/session", {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
          "X-IG-API-KEY": profile.apiKey,
          CST: cst, "X-SECURITY-TOKEN": xst,
          Version: "1",
        }, JSON.stringify({ accountId: spreadbetAccount.accountId }), profile.baseUrl);
        if (switchRes.status === 200) {
          console.log("[live-streaming] Switched to spreadbet account successfully");
          accountId = spreadbetAccount.accountId;
          accountType = "SPREADBET";
        } else {
          console.log("[live-streaming] Account switch failed:", switchRes.status);
        }
      }
    }
  } catch (e) {
    console.log("[live-streaming] Accounts lookup failed:", e.message);
  }
  lsLiveSession = { cst, xst, ts: Date.now(), lightstreamerEndpoint: lsEndpoint, accountType, accountId };
  console.log("[live-streaming] Authenticated successfully, endpoint:", lsEndpoint, "accountType:", accountType, "accountId:", accountId);
  return { cst, xst, lightstreamerEndpoint: lsEndpoint };
}

function scheduleLiveStreamingRefresh() {
  if (lsLiveRefreshTimer) clearTimeout(lsLiveRefreshTimer);
  lsLiveRefreshTimer = setTimeout(async () => {
    if (!lsLiveActive) return;
    console.log("[live-streaming] Proactive token refresh...");
    try {
      await liveStreamingLogin();
      console.log("[live-streaming] Token refreshed (L1 prices via active profile, ACCOUNT via live client)");
      scheduleLiveStreamingRefresh();
    } catch (e) {
      console.log("[live-streaming] Refresh failed:", e.message, "— will retry in 60s");
      if (lsLiveRefreshTimer) clearTimeout(lsLiveRefreshTimer);
      lsLiveRefreshTimer = setTimeout(() => scheduleLiveStreamingRefresh(), 60000);
    }
  }, LS_LIVE_SESSION_REFRESH);
}

async function startLiveLightstreamer() {
  const profile = getLiveProfile();
  if (!profile) throw new Error("No live profile credentials configured");
  if (!profile.accountId) throw new Error("Live profile missing accountId");
  try {
    lsReconnectAttempts = 0;
    lsReconnectInFlight = false;
    if (lsReconnectTimer) { clearTimeout(lsReconnectTimer); lsReconnectTimer = null; }
    await liveStreamingLogin();
    lsLiveActive = true;
    persistLiveStreamingPref(true);
    stopLightstreamer();
    await startLightstreamer();
    scheduleLiveStreamingRefresh();
    return { ok: true, status: lsStatus, endpoint: lsLiveSession.lightstreamerEndpoint };
  } catch (e) {
    lsLiveActive = false;
    persistLiveStreamingPref(false);
    console.error("[live-streaming] Failed:", e.message);
    throw e;
  }
}

function stopLiveLightstreamer() {
  lsLiveActive = false;
  persistLiveStreamingPref(false);
  lsReconnectAttempts = 0;
  lsReconnectInFlight = false;
  if (lsReconnectTimer) { clearTimeout(lsReconnectTimer); lsReconnectTimer = null; }
  if (lsLiveRefreshTimer) { clearTimeout(lsLiveRefreshTimer); lsLiveRefreshTimer = null; }
  lsLiveSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
  stopLightstreamer();
  setTimeout(() => startLightstreamer(), 500);
  console.log("[live-streaming] Disconnected, reverting to active profile streaming");
}

function persistLiveStreamingPref(active) {
  try {
    const config = ensureIgConfig();
    config.liveStreamingAutoConnect = !!active;
    saveIgConfig(config);
  } catch (_) {}
}

function shouldAutoConnectLiveStreaming() {
  try {
    const config = ensureIgConfig();
    return !!config.liveStreamingAutoConnect;
  } catch (_) { return false; }
}

// Bot process manager
const botProcesses = new Map();

function igRequest(method, urlPath, headers, body, baseUrlOverride) {
  return new Promise((resolve, reject) => {
    const profile = getActiveIgProfile();
    const base = baseUrlOverride || (profile && profile.baseUrl) || process.env.IG_BASE_URL || "";
    const url = new URL(urlPath.startsWith("http") ? urlPath : base + urlPath);
    const mod = url.protocol === "https:" ? https : http;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
      timeout: 15000,
    };
    const req = mod.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() });
      });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("IG API request timed out (15s) — server not responding")); });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function igAuth() {
  if (igSession.cst && Date.now() - igSession.ts < IG_SESSION_TTL) {
    return { cst: igSession.cst, xst: igSession.xst };
  }
  return igSessionLogin();
}

async function igSessionLogin() {
  const profile = getActiveIgProfile();
  if (!profile) {
    igSessionStatus = "not_configured";
    igSessionError = "No active IG profile configured";
    throw new Error(igSessionError);
  }
  igSessionStatus = "connecting";
  igSessionError = null;
  console.log(`[ig-session] Logging in to ${profile.profileName} profile...`);
  try {
    const res = await igRequest("POST", "/session", {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      "X-IG-API-KEY": profile.apiKey,
      Version: "2",
    }, JSON.stringify({ identifier: profile.username, password: profile.password }));
    if (res.status !== 200) {
      let errDetail = res.body || "";
      if (errDetail.includes("<html") || errDetail.includes("<HTML")) {
        if (res.status === 503) errDetail = "IG API servers unavailable (503) — may be an outage or IP block";
        else if (res.status === 500) errDetail = "IG API internal server error (500)";
        else errDetail = "IG API returned HTTP " + res.status;
      } else {
        try { const ej = JSON.parse(errDetail); errDetail = ej.errorCode || ej.error || errDetail; } catch(_) {}
      }
      throw new Error("IG auth failed: " + errDetail);
    }
    const cst = res.headers["cst"] || res.headers["CST"];
    const xst = res.headers["x-security-token"] || res.headers["X-SECURITY-TOKEN"];
    if (!cst || !xst) throw new Error("IG auth missing tokens");
    let lsEndpoint = null;
    try {
      const body = JSON.parse(res.body);
      lsEndpoint = body.lightstreamerEndpoint || null;
    } catch (_) {}
    igSession = { cst, xst, ts: Date.now(), lightstreamerEndpoint: lsEndpoint };
    igSessionStatus = "connected";
    igSessionError = null;
    igSessionLastRefresh = Date.now();
    console.log(`[ig-session] Connected to ${profile.profileName} profile`);
    scheduleSessionRefresh();
    return { cst, xst };
  } catch (e) {
    igSessionStatus = "error";
    igSessionError = e.message;
    console.log(`[ig-session] Login failed: ${e.message}`);
    throw e;
  }
}

function scheduleSessionRefresh() {
  if (igSessionRefreshTimer) clearTimeout(igSessionRefreshTimer);
  igSessionRefreshTimer = setTimeout(async () => {
    if (!igConfigured()) return;
    console.log("[ig-session] Proactive token refresh...");
    try {
      igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: igSession.lightstreamerEndpoint };
      await igSessionLogin();
      if (lsLiveActive) {
        console.log("[ig-session] Live streaming active, skipping Lightstreamer restart (live has its own refresh)");
      } else {
        stopLightstreamer();
        setTimeout(() => startLightstreamer(), 1000);
      }
    } catch (e) {
      console.log("[ig-session] Refresh failed:", e.message, "— will retry in 60s");
      scheduleSessionRetry();
    }
  }, IG_SESSION_REFRESH_INTERVAL);
}

function scheduleSessionRetry() {
  if (igSessionRefreshTimer) clearTimeout(igSessionRefreshTimer);
  igSessionRefreshTimer = setTimeout(async () => {
    if (!igConfigured()) return;
    console.log("[ig-session] Retrying login...");
    try {
      await igSessionLogin();
      if (!lsLiveActive) {
        stopLightstreamer();
        setTimeout(() => startLightstreamer(), 1000);
      }
    } catch (e) {
      console.log("[ig-session] Retry failed:", e.message, "— will retry in 60s");
      scheduleSessionRetry();
    }
  }, 60000);
}

async function igSessionStartup() {
  if (!igConfigured()) {
    igSessionStatus = "not_configured";
    console.log("[ig-session] No credentials configured, skipping auto-login");
    return;
  }
  try {
    await igSessionLogin();
  } catch (e) {
    console.log("[ig-session] Startup login failed:", e.message, "— will retry in 60s");
    scheduleSessionRetry();
  }
}

function getIgSessionInfo() {
  const profile = getActiveIgProfile();
  return {
    status: igSessionStatus,
    error: igSessionError,
    profile: profile ? profile.profileName : null,
    connectedSince: igSession.ts > 0 ? new Date(igSession.ts).toISOString() : null,
    lastRefresh: igSessionLastRefresh > 0 ? new Date(igSessionLastRefresh).toISOString() : null,
    sessionAge: igSession.ts > 0 ? Math.round((Date.now() - igSession.ts) / 1000) : null,
    ttlRemaining: igSession.ts > 0 ? Math.max(0, Math.round((IG_SESSION_TTL - (Date.now() - igSession.ts)) / 1000)) : null,
    lightstreamerEndpoint: igSession.lightstreamerEndpoint || null
  };
}

function igHeaders(session) {
  const profile = getActiveIgProfile();
  return {
    "X-IG-API-KEY": (profile && profile.apiKey) || process.env.IG_API_KEY || "",
    CST: session.cst,
    "X-SECURITY-TOKEN": session.xst,
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
  };
}

function maskSecret(val) {
  if (!val || val.length < 4) return val ? "****" : "";
  return val.slice(0, 2) + "****" + val.slice(-2);
}

function safeParseIgBody(body) {
  try { return JSON.parse(body); } catch(_) { return { _parseError: true, _raw: String(body).slice(0, 500) }; }
}
function igJsonResponse(res, statusCode, body) {
  const parsed = safeParseIgBody(body);
  if (parsed._parseError) {
    return json(res, 502, { error: "IG returned non-JSON response", detail: parsed._raw });
  }
  return json(res, statusCode, parsed);
}

const CLAWSCRIPT_STRATEGIES_DIR = path.join(__dirname, "skills", "bots", "strategies");
const CLAWSCRIPT_META_FILE = path.join(DATA_DIR, "clawscript-strategies.json");
const CLAWSCRIPT_LOGBOOK_FILE = path.join(DATA_DIR, "clawscript-logbook.json");

function loadClawScriptLogbook() {
  try { return JSON.parse(fs.readFileSync(CLAWSCRIPT_LOGBOOK_FILE, "utf8")); } catch (_) { return { entries: [] }; }
}
function saveClawScriptLogbook(lb) {
  fs.writeFileSync(CLAWSCRIPT_LOGBOOK_FILE, JSON.stringify(lb, null, 2));
}

function loadClawScriptMeta() {
  try { return JSON.parse(fs.readFileSync(CLAWSCRIPT_META_FILE, "utf8")); } catch (_) { return { strategies: [] }; }
}
function saveClawScriptMeta(meta) {
  fs.writeFileSync(CLAWSCRIPT_META_FILE, JSON.stringify(meta, null, 2));
}

async function handleClawScriptApi(req, res, p) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (!authGateway(req) && !validateLoginSession(req)) return json(res, 401, { error: "Unauthorized" });

  if (req.method === "GET" && p === "/api/clawscript/strategies") {
    const meta = loadClawScriptMeta();
    meta.strategies = meta.strategies.filter(s => {
      const fp = path.join(CLAWSCRIPT_STRATEGIES_DIR, s.filename);
      return fs.existsSync(fp);
    });
    saveClawScriptMeta(meta);
    return json(res, 200, meta);
  }

  if (req.method === "POST" && p === "/api/clawscript/strategies") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { name, filename, code, js, variables, imports, metadata } = body;
    if (!name || !filename || !js) return json(res, 400, { error: "Missing name, filename, or js" });
    try {
      const { validateStrategyJS } = require("./skills/bots/clawscript-parser.cjs");
      const validation = validateStrategyJS(js);
      if (!validation.valid) {
        return json(res, 400, { error: "Strategy validation failed: " + validation.errors.join("; "), validation });
      }
    } catch (_) {}
    const safeFilename = filename.replace(/[^a-zA-Z0-9_\-.]/g, "");
    if (!safeFilename.endsWith("-strategy.cjs")) return json(res, 400, { error: "Filename must end with -strategy.cjs" });
    const filePath = path.join(CLAWSCRIPT_STRATEGIES_DIR, safeFilename);
    if (!filePath.startsWith(CLAWSCRIPT_STRATEGIES_DIR)) return json(res, 400, { error: "Invalid filename" });
    fs.writeFileSync(filePath, js);
    const typeMatch = js.match(/STRATEGY_TYPE\(\)\s*\{\s*return\s*['"]([^'"]+)['"]/);
    const strategyType = typeMatch ? typeMatch[1] : "custom-" + name.toLowerCase().replace(/\s+/g, "-");
    const meta = loadClawScriptMeta();
    const existing = meta.strategies.findIndex(s => s.filename === safeFilename);
    const entry = {
      name,
      filename: safeFilename,
      strategyType,
      variables: variables || [],
      imports: imports || [],
      metadata: metadata || null,
      clawscript: true,
      savedAt: new Date().toISOString(),
      sourceCode: code || ""
    };
    if (existing >= 0) meta.strategies[existing] = entry;
    else meta.strategies.push(entry);
    saveClawScriptMeta(meta);
    try {
      delete require.cache[require.resolve(filePath)];
      delete require.cache[require.resolve("./skills/bots/strategies/index.cjs")];
      const sl = require("./skills/bots/strategies/index.cjs");
      sl.loadStrategies(true);
    } catch (_) {}
    console.log(`[clawscript-api] Saved strategy "${name}" as ${safeFilename} (type: ${strategyType})`);
    return json(res, 200, { ok: true, entry });
  }

  const deleteMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    const target = decodeURIComponent(deleteMatch[1]);
    const meta = loadClawScriptMeta();
    const idx = meta.strategies.findIndex(s => s.filename === target || s.name === target);
    if (idx < 0) return json(res, 404, { error: "Strategy not found" });
    const entry = meta.strategies[idx];
    const filePath = path.join(CLAWSCRIPT_STRATEGIES_DIR, entry.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    meta.strategies.splice(idx, 1);
    saveClawScriptMeta(meta);
    delete require.cache[require.resolve("./skills/bots/strategies/index.cjs")];
    console.log(`[clawscript-api] Deleted strategy "${entry.name}" (${entry.filename})`);
    return json(res, 200, { ok: true, deleted: entry.name });
  }

  const schemaMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)\/schema$/);
  if (req.method === "GET" && schemaMatch) {
    const target = decodeURIComponent(schemaMatch[1]);
    const meta = loadClawScriptMeta();
    const entry = meta.strategies.find(s => s.filename === target || s.strategyType === target || s.name === target);
    if (!entry) return json(res, 404, { error: "Strategy not found" });
    const filePath = path.join(CLAWSCRIPT_STRATEGIES_DIR, entry.filename);
    if (!fs.existsSync(filePath)) return json(res, 404, { error: "Strategy file missing" });
    try {
      delete require.cache[filePath];
      const Cls = require(filePath);
      const instance = new Cls({});
      return json(res, 200, {
        name: entry.name,
        type: entry.strategyType,
        schema: instance.getConfigSchema(),
        variables: entry.variables,
        metadata: entry.metadata || null,
        sourceCode: entry.sourceCode
      });
    } catch (e) {
      return json(res, 500, { error: "Failed to load strategy: " + e.message });
    }
  }

  const sourceMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)\/source$/);
  if (req.method === "GET" && sourceMatch) {
    const target = decodeURIComponent(sourceMatch[1]);
    const meta = loadClawScriptMeta();
    const entry = meta.strategies.find(s => s.filename === target || s.name === target);
    if (!entry) return json(res, 404, { error: "Strategy not found" });
    return json(res, 200, { name: entry.name, sourceCode: entry.sourceCode || "" });
  }

  if (req.method === "POST" && p === "/api/clawscript/backtest") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { code, instrument, resolution, candleCount } = body;
    if (!code) return json(res, 400, { error: "Missing code (ClawScript source)" });
    const epic = instrument || "CS.D.BITCOIN.CFD.IP";
    const res_ = resolution || "HOUR";
    const max = candleCount || 1000;
    const isSubMinute = res_.startsWith("SECOND");

    try {
      const parser = require("./skills/bots/clawscript-parser.cjs");
      let parsed;
      try { parsed = parser.parseAndGenerate(code); }
      catch (parseErr) { return json(res, 400, { error: "Parse error: " + parseErr.message }); }
      if (!parsed || !parsed.ast) return json(res, 400, { error: "Parse error: " + (parsed ? parsed.error : "unknown") });
      const ast = parsed.ast;

      let candles = [];
      let dataSource = "none";

      if (isSubMinute) {
        try {
          const inMem = getStreamCurrentCandles(epic, res_, max);
          if (inMem.length > 0) {
            candles = inMem.map(c => ({
              ts: c.ts, time: c.ts,
              open: c.open, high: c.high, low: c.low, close: c.close,
              volume: c.volume || 0
            }));
            dataSource = "stream";
            console.log(`[clawscript-backtest] Using ${candles.length} stream candles for ${epic} ${res_}`);
          }
        } catch (_) {}
        if (candles.length === 0) {
          try {
            const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
            const stored = await scalperDb.getStoredCandles(epic, res_, max);
            if (stored.length > 0) {
              candles = stored.map(r => ({
                ts: parseInt(r.ts), time: parseInt(r.ts),
                open: parseFloat(r.open), high: parseFloat(r.high),
                low: parseFloat(r.low), close: parseFloat(r.close),
                volume: parseInt(r.volume) || 0
              }));
              dataSource = "db-cache";
              console.log(`[clawscript-backtest] Using ${candles.length} DB-cached stream candles for ${epic} ${res_}`);
            }
          } catch (_) {}
        }
      } else {
        try {
          const session = await igAuth();
          const igR = await igRequest("GET", "/prices/" + epic + "?resolution=" + res_ + "&max=" + max + "&pageSize=" + max, igHeaders(session));
          if (igR.status === 200) {
            const data = safeParseIgBody(igR.body);
            if (data && data.prices) {
              candles = data.prices.map(p => {
                let rawTime = p.snapshotTimeUTC || p.snapshotTime || "";
                if (typeof rawTime === "string") rawTime = rawTime.replace(/\//g, "-");
                const dt = new Date(rawTime);
                const om = p.openPrice || {}, hm = p.highPrice || {}, lm = p.lowPrice || {}, cm = p.closePrice || {};
                return {
                  ts: Math.floor(dt.getTime() / 1000),
                  time: Math.floor(dt.getTime() / 1000),
                  open: ((om.bid || 0) + (om.ask || om.offer || 0)) / 2,
                  high: ((hm.bid || 0) + (hm.ask || hm.offer || 0)) / 2,
                  low: ((lm.bid || 0) + (lm.ask || lm.offer || 0)) / 2,
                  close: ((cm.bid || 0) + (cm.ask || cm.offer || 0)) / 2,
                  volume: p.lastTradedVolume || 0
                };
              }).sort((a, b) => a.ts - b.ts);
              if (candles.length > 0) dataSource = "ig-api";
            }
          }
        } catch (igErr) {
          console.log(`[clawscript-backtest] IG API unavailable: ${igErr.message}`);
        }

        if (candles.length === 0) {
          try {
            const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
            const stored = await scalperDb.getStoredCandles(epic, res_, max);
            if (stored.length > 0) {
              candles = stored.map(r => ({
                ts: parseInt(r.ts), time: parseInt(r.ts),
                open: parseFloat(r.open), high: parseFloat(r.high),
                low: parseFloat(r.low), close: parseFloat(r.close),
                volume: parseInt(r.volume) || 0
              }));
              dataSource = "db-cache";
              console.log(`[clawscript-backtest] Using ${candles.length} DB-cached candles for ${epic} ${res_}`);
            }
          } catch (_) {}
        }

        if (candles.length === 0) {
          try {
            const inMem = getStreamCurrentCandles(epic, res_, max);
            if (inMem.length > 0) {
              candles = inMem.map(c => ({
                ts: c.ts, time: c.ts,
                open: c.open, high: c.high, low: c.low, close: c.close,
                volume: c.volume || 0
              }));
              dataSource = "stream";
              console.log(`[clawscript-backtest] Using ${candles.length} in-memory stream candles for ${epic} ${res_}`);
            }
          } catch (_) {}
        }
      }

      if (candles.length < 5) {
        const basePrice = epic.toLowerCase().includes("bitcoin") ? 50000 : epic.toLowerCase().includes("ether") ? 3000 : epic.toLowerCase().includes("gold") ? 2000 : 100;
        const now = Math.floor(Date.now() / 1000);
        const resSeconds = { "SECOND": 1, "SECOND_2": 2, "SECOND_5": 5, "SECOND_10": 10, "SECOND_20": 20, "SECOND_30": 30, "SECOND_40": 40, "MINUTE": 60, "MINUTE_2": 120, "MINUTE_3": 180, "MINUTE_5": 300, "MINUTE_10": 600, "MINUTE_15": 900, "MINUTE_30": 1800, "HOUR": 3600, "HOUR_2": 7200, "HOUR_3": 10800, "HOUR_4": 14400, "DAY": 86400, "WEEK": 604800, "MONTH": 2592000 };
        const interval = resSeconds[res_] || 3600;
        candles = [];
        for (let i = 0; i < max; i++) {
          const t = now - (max - i) * interval;
          const trend = Math.sin(i * 0.02) * basePrice * 0.1;
          const noise = (Math.random() - 0.5) * basePrice * 0.02;
          const o = basePrice + trend + noise;
          const h = o + Math.random() * basePrice * 0.015;
          const l = o - Math.random() * basePrice * 0.015;
          const c = o + (Math.random() - 0.5) * basePrice * 0.01;
          candles.push({ ts: t, time: t, open: Math.round(o * 100) / 100, high: Math.round(h * 100) / 100, low: Math.round(l * 100) / 100, close: Math.round(c * 100) / 100, volume: Math.floor(Math.random() * 1000) + 100 });
        }
        dataSource = "demo";
        console.log(`[clawscript-backtest] Using ${candles.length} generated demo candles for ${epic} ${res_}`);
      }

      const trades = [];
      let openTrade = null;
      let vars = {};
      const closePrices = candles.map(c => c.close);
      let totalPnl = 0;
      let peakEquity = 0;
      let maxDrawdown = 0;
      const equityCurve = [];

      function calcRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        let avgGain = 0, avgLoss = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
          const diff = prices[i] - prices[i - 1];
          if (diff > 0) avgGain += diff; else avgLoss -= diff;
        }
        if (avgLoss === 0) return 100;
        return 100 - (100 / (1 + (avgGain / period) / (avgLoss / period)));
      }

      function calcEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;
        const k = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period;
        for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
        return ema;
      }

      function calcSMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;
        let sum = 0;
        for (let i = prices.length - period; i < prices.length; i++) sum += prices[i];
        return sum / period;
      }

      function calcMACD(prices, fast, slow, sig) {
        fast = fast || 12; slow = slow || 26; sig = sig || 9;
        if (prices.length < slow) return 0;
        const emaF = calcEMA(prices, fast), emaS = calcEMA(prices, slow);
        return emaF - emaS;
      }

      function calcATR(prices, period) {
        if (prices.length < period + 1) return 0;
        let sum = 0;
        for (let i = prices.length - period; i < prices.length; i++) sum += Math.abs(prices[i] - prices[i-1]);
        return sum / period;
      }

      function calcADX(prices, period) {
        if (prices.length < period * 2) return 25;
        let plusDM = 0, minusDM = 0, tr = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
          const diff = prices[i] - prices[i-1];
          if (diff > 0) plusDM += diff; else minusDM += Math.abs(diff);
          tr += Math.abs(prices[i] - prices[i-1]);
        }
        if (tr === 0) return 0;
        const pdi = (plusDM / tr) * 100, ndi = (minusDM / tr) * 100;
        const dxSum = pdi + ndi;
        return dxSum > 0 ? Math.abs(pdi - ndi) / dxSum * 100 : 0;
      }

      function calcBollinger(prices, period, dev) {
        period = period || 20; dev = dev || 2;
        const sma = calcSMA(prices, period);
        if (prices.length < period) return { upper: sma, lower: sma, mid: sma };
        let variance = 0;
        for (let i = prices.length - period; i < prices.length; i++) variance += Math.pow(prices[i] - sma, 2);
        const std = Math.sqrt(variance / period);
        return { upper: sma + dev * std, lower: sma - dev * std, mid: sma };
      }

      function calcStochastic(prices, kPeriod) {
        kPeriod = kPeriod || 14;
        if (prices.length < kPeriod) return 50;
        const slice = prices.slice(-kPeriod);
        const high = Math.max(...slice), low = Math.min(...slice);
        return high === low ? 50 : ((prices[prices.length-1] - low) / (high - low)) * 100;
      }

      function calcROC(prices, period) {
        period = period || 12;
        if (prices.length < period + 1) return 0;
        const old = prices[prices.length - period - 1];
        return old !== 0 ? ((prices[prices.length-1] - old) / old) * 100 : 0;
      }

      function calcCCI(prices, period) {
        period = period || 20;
        const sma = calcSMA(prices, period);
        if (prices.length < period) return 0;
        let meanDev = 0;
        for (let i = prices.length - period; i < prices.length; i++) meanDev += Math.abs(prices[i] - sma);
        meanDev /= period;
        return meanDev !== 0 ? (prices[prices.length-1] - sma) / (0.015 * meanDev) : 0;
      }

      function calcWilliamsR(prices, period) {
        period = period || 14;
        if (prices.length < period) return -50;
        const slice = prices.slice(-period);
        const high = Math.max(...slice), low = Math.min(...slice);
        return high === low ? -50 : ((high - prices[prices.length-1]) / (high - low)) * -100;
      }

      function evalIndicator(name, args, pricesSlice) {
        const indicators = require("./skills/bots/indicators.cjs");
        if (name === 'RSI') return calcRSI(pricesSlice, args[0] || 14);
        if (name === 'EMA') return calcEMA(pricesSlice, args[0] || 20);
        if (name === 'SMA') return calcSMA(pricesSlice, args[0] || 20);
        if (name === 'MACD') return calcMACD(pricesSlice, args[0] || 12, args[1] || 26, args[2] || 9);
        if (name === 'ATR') return calcATR(pricesSlice, args[0] || 14);
        if (name === 'ADX') return calcADX(pricesSlice, args[0] || 14);
        if (name === 'BOLLINGER') return calcBollinger(pricesSlice, args[0] || 20, args[1] || 2);
        if (name === 'BOLLINGER_UPPER') { const bb = calcBollinger(pricesSlice, args[0] || 20, args[1] || 2); return bb.upper; }
        if (name === 'BOLLINGER_LOWER') { const bb = calcBollinger(pricesSlice, args[0] || 20, args[1] || 2); return bb.lower; }
        if (name === 'STOCHASTIC' || name === 'STOCHASTIC_K') return indicators.calcStochasticFromPrices(pricesSlice, args[0] || 14, args[1] || 3).k;
        if (name === 'STOCHASTIC_D') return indicators.calcStochasticFromPrices(pricesSlice, args[0] || 14, args[1] || 3).d;
        if (name === 'ROC') return calcROC(pricesSlice, args[0] || 12);
        if (name === 'CCI') return indicators.calcCCIFromPrices(pricesSlice, args[0] || 20);
        if (name === 'WILLIAMS_R') return indicators.calcWilliamsRFromPrices(pricesSlice, args[0] || 14);
        if (name === 'AROON_UP') { const ar = indicators.calcAroonFromPrices(pricesSlice, args[0] || 25); return ar.up; }
        if (name === 'AROON_DOWN') { const ar = indicators.calcAroonFromPrices(pricesSlice, args[0] || 25); return ar.down; }
        if (name === 'ICHIMOKU_TENKAN') { const ich = indicators.calcIchimokuFromPrices(pricesSlice, args[0] || 9, args[1] || 26, args[2] || 52); return ich.tenkan; }
        if (name === 'ICHIMOKU_KIJUN') { const ich = indicators.calcIchimokuFromPrices(pricesSlice, args[0] || 9, args[1] || 26, args[2] || 52); return ich.kijun; }
        if (name === 'PARABOLIC_SAR') return indicators.calcParabolicSARFromPrices(pricesSlice, args[0] || 0.02, args[1] || 0.2);
        if (name === 'KELTNER_UPPER') { const k = indicators.calcKeltner(pricesSlice, args[0] || 20, args[1] || 1.5, args[2] || 10); return k.upper; }
        if (name === 'KELTNER_LOWER') { const k = indicators.calcKeltner(pricesSlice, args[0] || 20, args[1] || 1.5, args[2] || 10); return k.lower; }
        if (name === 'DONCHIAN_HIGH') { const d = indicators.calcDonchianFromPrices(pricesSlice, args[0] || 20); return d.high; }
        if (name === 'DONCHIAN_LOW') { const d = indicators.calcDonchianFromPrices(pricesSlice, args[0] || 20); return d.low; }
        if (name === 'OBV') return 0;
        if (name === 'VWAP') return pricesSlice.length > 0 ? pricesSlice[pricesSlice.length - 1] : 0;
        if (name === 'CMF') return 0;
        if (name === 'ZSCORE') return indicators.calcZScore(pricesSlice, args[0] || 20);
        if (name === 'FIBONACCI') { const fib = indicators.calcFibonacci(pricesSlice, args[0] || 20); return fib.level_50 || 0; }
        if (name === 'SUPERTREND') return pricesSlice.length > 0 ? pricesSlice[pricesSlice.length - 1] : 0;
        if (name === 'ULTIMATE_OSC') return 50;
        if (name === 'CHAIKIN_VOL') return 0;
        if (name === 'LAST_PRICE') return pricesSlice.length > 0 ? pricesSlice[pricesSlice.length - 1] : 0;
        if (name === 'VOLUME') return 0;
        console.log(`[clawscript-backtest] Unknown indicator: ${name}, returning 0`);
        return 0;
      }

      function evalExpr(expr, pricesSlice) {
        if (!expr) return null;
        switch (expr.type) {
          case 'NumberLiteral': return expr.value;
          case 'StringLiteral': return expr.value;
          case 'BooleanLiteral': return expr.value;
          case 'NullLiteral': return null;
          case 'Identifier': return vars[expr.value] !== undefined ? vars[expr.value] : expr.value;
          case 'BinaryExpr': {
            const l = evalExpr(expr.left, pricesSlice), r = evalExpr(expr.right, pricesSlice);
            switch (expr.op) {
              case '+': return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : l + r;
              case '-': return l - r; case '*': return l * r;
              case '/': return r !== 0 ? l / r : 0; case '%': return l % r;
              case '>': return l > r; case '<': return l < r;
              case '>=': return l >= r; case '<=': return l <= r;
              case '==': return l == r; case '!=': return l != r;
              case '&&': return l && r; case '||': return l || r;
              default: return null;
            }
          }
          case 'UnaryExpr': { const v = evalExpr(expr.expr, pricesSlice); return expr.op === '-' ? -v : !v; }
          case 'ContainsExpr': return String(evalExpr(expr.left, pricesSlice)).includes(String(evalExpr(expr.right, pricesSlice)));
          case 'CrossesExpr': return expr.direction === 'OVER' ? evalExpr(expr.left, pricesSlice) > evalExpr(expr.right, pricesSlice) : evalExpr(expr.left, pricesSlice) < evalExpr(expr.right, pricesSlice);
          case 'FunctionCall': {
            const name = expr.name.toUpperCase();
            const args = expr.args.map(a => evalExpr(a, pricesSlice));
            return evalIndicator(name, args, pricesSlice);
          }
          case 'IndicatorCall': {
            const iname = expr.name.toUpperCase();
            const iparams = expr.params.map(a => evalExpr(a, pricesSlice));
            return evalIndicator(iname, iparams, pricesSlice);
          }
          case 'MemberExpr': { const obj = evalExpr(expr.object, pricesSlice); return obj && typeof obj === 'object' ? obj[expr.property] : null; }
          case 'LoopCount': return evalExpr(expr.num, pricesSlice);
          default: return null;
        }
      }

      function execStmt(stmt, pricesSlice, depth) {
        if (!stmt || depth > 50) return;
        switch (stmt.type) {
          case 'VarDecl': vars[stmt.name] = evalExpr(stmt.value, pricesSlice); break;
          case 'Assignment': vars[stmt.name] = evalExpr(stmt.value, pricesSlice); break;
          case 'Trade': {
            const cond = stmt.condition ? evalExpr(stmt.condition, pricesSlice) : true;
            if (cond) {
              const sz = stmt.size ? evalExpr(stmt.size, pricesSlice) : 1;
              const dir = stmt.command;
              const price = pricesSlice[pricesSlice.length - 1];
              if (!openTrade) {
                openTrade = { direction: dir, size: sz, entryPrice: price, entryTime: candles[Math.min(pricesSlice.length - 1, candles.length - 1)].ts };
              }
            }
            break;
          }
          case 'Exit': {
            const econd = stmt.condition ? evalExpr(stmt.condition, pricesSlice) : true;
            if (econd && openTrade) {
              const exitPrice = pricesSlice[pricesSlice.length - 1];
              const pnl = openTrade.direction === 'BUY' ? (exitPrice - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - exitPrice) * openTrade.size;
              totalPnl += pnl;
              trades.push({ direction: openTrade.direction, size: openTrade.size, entryPrice: openTrade.entryPrice, exitPrice, pnl: Math.round(pnl * 100) / 100, entryTime: openTrade.entryTime, exitTime: candles[Math.min(pricesSlice.length - 1, candles.length - 1)].ts });
              openTrade = null;
            }
            break;
          }
          case 'IfStatement': {
            const ifCond = evalExpr(stmt.condition, pricesSlice);
            const body = ifCond ? stmt.thenBody : stmt.elseBody;
            for (let i = 0; i < body.length; i++) execStmt(body[i], pricesSlice, depth + 1);
            break;
          }
          case 'Loop': {
            if (stmt.condition && stmt.condition.type === 'LoopCount') {
              const count = Math.min(evalExpr(stmt.condition.num, pricesSlice) || 0, 10);
              for (let i = 0; i < count; i++) { vars['i'] = i; for (let j = 0; j < stmt.body.length; j++) execStmt(stmt.body[j], pricesSlice, depth + 1); }
            }
            break;
          }
          default: break;
        }
      }

      for (let i = 20; i < candles.length; i++) {
        const pricesSlice = closePrices.slice(0, i + 1);
        vars['price'] = closePrices[i];
        vars['close'] = closePrices[i];
        vars['open'] = candles[i].open;
        vars['high'] = candles[i].high;
        vars['low'] = candles[i].low;
        vars['volume'] = candles[i].volume;
        vars['bar'] = i;

        for (let s = 0; s < ast.body.length; s++) {
          execStmt(ast.body[s], pricesSlice, 0);
        }

        if (openTrade) {
          const unrealized = openTrade.direction === 'BUY' ? (closePrices[i] - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - closePrices[i]) * openTrade.size;
          const equity = totalPnl + unrealized;
          if (equity > peakEquity) peakEquity = equity;
          const dd = peakEquity - equity;
          if (dd > maxDrawdown) maxDrawdown = dd;
          equityCurve.push({ ts: candles[i].ts, equity: Math.round(equity * 100) / 100 });
        } else {
          if (totalPnl > peakEquity) peakEquity = totalPnl;
          const dd = peakEquity - totalPnl;
          if (dd > maxDrawdown) maxDrawdown = dd;
          equityCurve.push({ ts: candles[i].ts, equity: Math.round(totalPnl * 100) / 100 });
        }
      }

      if (openTrade) {
        const lastPrice = closePrices[closePrices.length - 1];
        const pnl = openTrade.direction === 'BUY' ? (lastPrice - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - lastPrice) * openTrade.size;
        totalPnl += pnl;
        trades.push({ direction: openTrade.direction, size: openTrade.size, entryPrice: openTrade.entryPrice, exitPrice: lastPrice, pnl: Math.round(pnl * 100) / 100, entryTime: openTrade.entryTime, exitTime: candles[candles.length - 1].ts, openAtEnd: true });
        openTrade = null;
      }

      const wins = trades.filter(t => t.pnl > 0).length;
      const losses = trades.filter(t => t.pnl <= 0).length;
      const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 10000) / 100 : 0;

      console.log(`[clawscript-backtest] ${epic} ${res_}: ${trades.length} trades, P&L=${Math.round(totalPnl * 100) / 100}, winRate=${winRate}%, maxDD=${Math.round(maxDrawdown * 100) / 100}`);

      const btResult = {
        ok: true,
        instrument: epic,
        resolution: res_,
        candlesUsed: candles.length,
        dataSource,
        totalPnl: Math.round(totalPnl * 100) / 100,
        trades: trades.length,
        wins,
        losses,
        winRate,
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        tradeList: trades.slice(-100),
        equityCurve: equityCurve.length > 200 ? equityCurve.filter((_, i) => i % Math.ceil(equityCurve.length / 200) === 0) : equityCurve,
        timestamp: Date.now()
      };
      global._csLastResults = btResult;
      return json(res, 200, btResult);
    } catch (e) {
      console.log(`[clawscript-backtest] Error: ${e.message}`);
      return json(res, 500, { error: "Backtest failed: " + e.message });
    }
  }

  if (req.method === "POST" && p === "/api/clawscript/sync") {
    try {
      const { execSync } = require("child_process");
      const syncScript = require("path").join(__dirname, ".openclaw/canvas/sync-clawscript.sh");
      const out = execSync(`bash "${syncScript}"`, { cwd: __dirname, timeout: 10000 }).toString();
      return json(res, 200, { ok: true, output: out });
    } catch (e) {
      return json(res, 500, { error: "Sync failed: " + e.message });
    }
  }

  if (req.method === "GET" && p === "/api/clawscript/results") {
    return json(res, 200, { results: global._csLastResults || null });
  }

  if (req.method === "POST" && p === "/api/clawscript/results") {
    try {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (body.backtest) global._csLastResults = body.backtest;
      else if (body.simulation) global._csLastResults = body.simulation;
      global._csAllResults = body;
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
  }

  if (req.method === "POST" && p === "/api/clawscript/ai") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { messages, model } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) return json(res, 400, { error: "Missing messages array" });
    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) return json(res, 500, { error: "XAI_API_KEY not configured" });
    const modelId = model || "grok-4-1-fast-reasoning";
    let rulebookSnippet = "";
    try { rulebookSnippet = fs.readFileSync(path.join(__dirname, "skills/clawscript/CLAWSCRIPT-AI-REFERENCE.md"), "utf8"); } catch (_) {}
    const systemPrompt = `You are an expert ClawScript coding assistant for IG trading strategies. ClawScript is a domain-specific language (DSL) that compiles to JavaScript for automated trading.

CRITICAL RULES:
1. ALWAYS return COMPLETE corrected code inside a \`\`\`clawscript code block
2. Reference specific line numbers when pointing out errors
3. NEVER say "paste this" or "compile & save" — just provide the code block directly
4. The code block must contain the FULL corrected script, not just changed lines
5. Remove invalid lines (random text, unknown commands)
6. ONLY use commands listed below. Do NOT invent commands or syntax.

=== EXACT CLAWSCRIPT SYNTAX (DO NOT DEVIATE) ===

VARIABLES (use DEF, never VAR/LET/CONST):
  DEF myVar = 42
  DEF name = "hello"
  SET myVar = myVar + 1

CONFIGURABLE INPUTS (label string is REQUIRED):
  INPUT_INT rsiPeriod = 14 "RSI Period"
  INPUT_FLOAT stopDistance = 30.0 "Stop Distance"
  INPUT_BOOL enabled = true "Enabled"

INDICATORS (called with prices array as first arg):
  DEF rsi = RSI(prices, 14)
  DEF ema_fast = EMA(prices, 9)
  DEF ema_slow = EMA(prices, 21)
  DEF sma = SMA(prices, 20)
  DEF macd = MACD(prices, 12, 26, 9)
  DEF bb = BOLLINGER(prices, 20, 2)
  DEF atr = ATR(prices, 14)
  DEF adx = ADX(prices, 14)
  DEF stoch = STOCHASTIC(prices, 14, 3)
  DEF cci = CCI(prices, 20)

TRADING (always conditional, always inside IF):
  BUY MARKET SIZE 1
  SELL MARKET SIZE 1
  EXIT "reason text"

CONTROL FLOW:
  IF condition
    ...
  ENDIF

  IF condition
    ...
  ELSE
    ...
  ENDIF

  LOOP 10 TIMES
    ...
  ENDLOOP

  WHILE condition
    ...
  ENDWHILE

LOGICAL OPERATORS (use words, NOT symbols):
  AND    (not &&)
  OR     (not ||)
  NOT    (not !)

AGENT MANAGEMENT:
  AGENT_SPAWN "agent-name" WITH "instructions for the agent"
  DEF result = AGENT_CALL "agent-name" "task description"
  AGENT_PASS "data" "target-agent"
  AGENT_TERMINATE "agent-name"

VISUAL OUTPUT:
  NOTIFY "message" LEVEL "info"
  TOAST "message" DURATION 3000
  POPUP "Title" WITH "<h1>HTML content</h1>"
  DISPLAY data FORMAT "table"

DATA FETCHING:
  DEF data = CLAW_WEB "https://example.com"
  DEF posts = CLAW_X "search query"
  DEF history = FETCH_HISTORICAL "CS.D.BITCOIN.CFD.IP"

COMMUNICATION:
  ALERT "message" LEVEL "warn"
  SAY_TO_SESSION "session-name" "message"
  CHANNEL_SEND "target" "message"

TASK ORCHESTRATION:
  TASK_DEFINE "task-name" BODY
    ...
  ENDTASK
  TASK_ASSIGN "task-name" TO "agent-name"
  TASK_CHAIN "task1" "task2" "task3"

OTHER:
  WAIT 5000
  TRY ... CATCH ... ENDTRY
  ERROR "message"

=== COMMON MISTAKES TO AVOID ===
- Do NOT use: VAR, FOREACH, CONTINUE, BREAK, SLEEP, THEN, CLOSE(), POSITION(), PNL(), WIN_RATE(), SUM_PNL(), BB(), PRICES()
- Do NOT use curly braces {} for blocks — use ENDIF/ENDLOOP/ENDWHILE
- Do NOT use || or && — use OR and AND
- Do NOT use ?. or ?? — these are JavaScript, not ClawScript
- Do NOT call indicators without prices array: RSI(14) is WRONG, RSI(prices, 14) is CORRECT
- Do NOT use BOLLINGER as "BB" — the command is BOLLINGER
- Do NOT use dot notation on indicators: macd.line, macd.signal are WRONG — MACD returns a single number
- Do NOT use PRICES() as a function — prices is a built-in variable, use it directly: RSI(prices, 14)
- INPUT_INT/FLOAT/BOOL MUST have a label string: INPUT_INT x = 5 "Label"
- BUY/SELL must ALWAYS be inside an IF block with conditions
- Always null-check indicators: IF rsi != null

=== STRATEGY TEMPLATE ===
// Strategy Name
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT stopDistance = 30 "Stop Distance"
INPUT_INT limitDistance = 60 "Limit Distance"
INPUT_INT size = 1 "Position Size"

DEF rsi = RSI(prices, rsiPeriod)
DEF ema_fast = EMA(prices, 9)
DEF ema_slow = EMA(prices, 21)

IF rsi != null AND ema_fast != null AND ema_slow != null
  IF rsi < 30 AND ema_fast > ema_slow
    BUY MARKET SIZE size
  ENDIF
  IF rsi > 70 AND ema_fast < ema_slow
    SELL MARKET SIZE size
  ENDIF
ENDIF

${rulebookSnippet}`;
    const apiMessages = [{ role: "system", content: systemPrompt }, ...messages];
    try {
      const https = require("https");
      const postData = JSON.stringify({ model: modelId, messages: apiMessages, max_tokens: 4096, temperature: 0.3 });
      const result = await new Promise((resolve, reject) => {
        const req2 = https.request({
          hostname: "api.x.ai", port: 443, path: "/v1/chat/completions",
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + xaiKey, "Content-Length": Buffer.byteLength(postData) },
          timeout: 120000,
        }, (resp) => {
          const chunks = [];
          resp.on("data", (c) => chunks.push(c));
          resp.on("end", () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
            catch (e) { reject(new Error("Invalid API response")); }
          });
        });
        req2.on("error", reject);
        req2.on("timeout", () => { req2.destroy(); reject(new Error("API timeout")); });
        req2.write(postData);
        req2.end();
      });
      if (result.error) return json(res, 502, { error: result.error.message || "API error" });
      const reply = result.choices?.[0]?.message?.content || "";
      return json(res, 200, {
        id: result.id || "cs-ai-" + Date.now(),
        object: "chat.completion",
        choices: [{ index: 0, message: { role: "assistant", content: reply }, finish_reason: "stop" }],
        model: modelId,
      });
    } catch (e) {
      console.error("[clawscript-ai] Error:", e.message);
      return json(res, 502, { error: "AI request failed: " + e.message });
    }
  }

  if (req.method === "POST" && p === "/api/clawscript/compile") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { code } = body;
    if (!code) return json(res, 400, { error: "Missing code (ClawScript source)" });
    try {
      const parser = require("./skills/bots/clawscript-parser.cjs");
      let parsed;
      try { parsed = parser.parseAndGenerate(code); }
      catch (parseErr) {
        const lb = loadClawScriptLogbook();
        lb.entries.push({ id: "log-" + Date.now(), timestamp: new Date().toISOString(), type: "error", message: "Parse error: " + parseErr.message, details: { code: code.slice(0, 500) }, resolved: false });
        saveClawScriptLogbook(lb);
        return json(res, 400, { error: "Parse error: " + parseErr.message });
      }
      if (!parsed || !parsed.ast) {
        return json(res, 400, { error: "Parse error: " + (parsed ? parsed.error : "unknown") });
      }
      const validation = parsed.validation || { valid: true, errors: [], warnings: [] };
      return json(res, 200, { ok: true, ast: parsed.ast, js: parsed.js, variables: parsed.variables || [], imports: parsed.imports || [], validation });
    } catch (e) {
      return json(res, 500, { error: "Compile failed: " + e.message });
    }
  }

  if (req.method === "GET" && p === "/api/clawscript/logbook") {
    const lb = loadClawScriptLogbook();
    return json(res, 200, lb);
  }

  if (req.method === "POST" && p === "/api/clawscript/logbook") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { type, epic, strategy, message, details } = body;
    if (!message) return json(res, 400, { error: "Missing message" });
    const lb = loadClawScriptLogbook();
    const entry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      type: type || "error",
      epic: epic || null,
      strategy: strategy || null,
      message,
      details: details || null,
      resolved: false
    };
    lb.entries.push(entry);
    saveClawScriptLogbook(lb);
    console.log(`[clawscript-logbook] Added ${entry.type}: ${message.slice(0, 80)}`);
    return json(res, 200, { ok: true, entry });
  }

  const logbookPatchMatch = p.match(/^\/api\/clawscript\/logbook\/([^/]+)$/);
  if (req.method === "PATCH" && logbookPatchMatch) {
    const targetId = decodeURIComponent(logbookPatchMatch[1]);
    const lb = loadClawScriptLogbook();
    const entry = lb.entries.find(e => e.id === targetId);
    if (!entry) return json(res, 404, { error: "Logbook entry not found" });
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    if (body.resolved !== undefined) entry.resolved = !!body.resolved;
    if (body.message) entry.message = body.message;
    if (body.details) entry.details = body.details;
    entry.updatedAt = new Date().toISOString();
    saveClawScriptLogbook(lb);
    return json(res, 200, { ok: true, entry });
  }

  const CS_SCRIPTS_DIR = path.join(DATA_DIR, "clawscript-scripts");
  const CS_LOGS_DIR = path.join(DATA_DIR, "clawscript-logs");
  try { fs.mkdirSync(CS_SCRIPTS_DIR, { recursive: true }); } catch (_) {}
  try { fs.mkdirSync(CS_LOGS_DIR, { recursive: true }); } catch (_) {}

  if (req.method === "POST" && p === "/api/clawscript/run") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch (_) { return json(res, 400, { error: "Invalid JSON" }); }
    const { code, name, file } = body;
    if (!code && !file) return json(res, 400, { error: "Missing code or file" });
    const scriptName = (name || "script-" + Date.now()).replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const scriptId = "cs-script-" + scriptName;
    const scriptFile = path.join(CS_SCRIPTS_DIR, scriptName + ".cs");
    if (code) {
      fs.writeFileSync(scriptFile, code, "utf8");
    } else if (file) {
      const resolvedFile = path.resolve(process.cwd(), file);
      const allowedDirs = [path.resolve(process.cwd(), ".openclaw"), path.resolve(process.cwd(), "skills")];
      if (!allowedDirs.some(d => resolvedFile.startsWith(d + path.sep))) {
        return json(res, 400, { error: "File path must be within .openclaw/ or skills/" });
      }
      if (!fs.existsSync(resolvedFile)) return json(res, 400, { error: "File not found: " + file });
      fs.copyFileSync(resolvedFile, scriptFile);
    } else {
      return json(res, 400, { error: "Missing code or file" });
    }
    const relPath = path.relative(process.cwd(), scriptFile);
    const botCmd = `node skills/bots/clawscript-runner.cjs ${relPath}`;
    const registry = loadBotRegistry();
    let existing = registry.find(b => b.id === scriptId);
    if (existing) {
      stopBot(scriptId);
      existing.cmd = botCmd;
      existing.enabled = true;
    } else {
      existing = { id: scriptId, cmd: botCmd, enabled: true, addedBy: "clawscript-editor", addedAt: new Date().toISOString(), scriptFile: relPath, isClawScript: true };
      registry.push(existing);
    }
    existing.env = { CS_SCRIPT_ID: scriptName };
    saveBotRegistry(registry);
    spawnBot(existing);
    const entry = botProcesses.get(scriptId);
    const pid = entry && entry.proc ? entry.proc.pid : null;
    console.log(`[cs-runner] Started script: ${scriptId} (PID ${pid})`);
    return json(res, 200, { ok: true, scriptId, pid, name: scriptName });
  }

  if (req.method === "GET" && p === "/api/clawscript/scripts") {
    const registry = loadBotRegistry();
    const scripts = registry.filter(b => b.id.startsWith("cs-script-") || b.isClawScript).map(b => {
      const entry = botProcesses.get(b.id);
      const running = !!(entry && entry.proc && !entry.proc.killed);
      return {
        id: b.id,
        name: b.id.replace(/^cs-script-/, ""),
        cmd: b.cmd,
        enabled: b.enabled,
        running,
        pid: running ? entry.proc.pid : null,
        restarts: entry ? entry.restarts : 0,
        scriptFile: b.scriptFile || null,
        addedAt: b.addedAt,
      };
    });
    return json(res, 200, { scripts });
  }

  const csScriptMatch = p.match(/^\/api\/clawscript\/scripts\/([^/]+)\/(stop|start|restart|pause|resume|logs)$/);
  if (csScriptMatch) {
    const scriptId = decodeURIComponent(csScriptMatch[1]);
    const fullId = scriptId.startsWith("cs-script-") ? scriptId : "cs-script-" + scriptId;
    const action = csScriptMatch[2];

    if (req.method === "GET" && action === "logs") {
      const logName = fullId.replace(/^cs-script-/, "");
      const logFile = path.join(CS_LOGS_DIR, logName + ".log");
      try {
        const content = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "";
        const lines = content.split("\n").filter(Boolean);
        const tail = lines.slice(-200);
        return json(res, 200, { scriptId: fullId, lines: tail, total: lines.length });
      } catch (e) {
        return json(res, 200, { scriptId: fullId, lines: [], total: 0 });
      }
    }

    if (req.method === "POST" && action === "stop") {
      stopBot(fullId);
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === fullId);
      if (bot) { bot.enabled = false; saveBotRegistry(registry); }
      return json(res, 200, { ok: true, stopped: fullId });
    }

    if (req.method === "POST" && action === "start") {
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === fullId);
      if (!bot) return json(res, 404, { error: "Script not found" });
      bot.enabled = true;
      saveBotRegistry(registry);
      spawnBot(bot);
      return json(res, 200, { ok: true, started: fullId });
    }

    if (req.method === "POST" && action === "restart") {
      stopBot(fullId);
      await new Promise(r => setTimeout(r, 500));
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === fullId);
      if (!bot) return json(res, 404, { error: "Script not found" });
      bot.enabled = true;
      saveBotRegistry(registry);
      spawnBot(bot);
      return json(res, 200, { ok: true, restarted: fullId });
    }

    if (req.method === "POST" && action === "pause") {
      const entry = botProcesses.get(fullId);
      if (entry && entry.proc && !entry.proc.killed) {
        try { entry.proc.kill("SIGUSR1"); } catch (_) {}
        return json(res, 200, { ok: true, paused: fullId });
      }
      return json(res, 404, { error: "Script not running" });
    }

    if (req.method === "POST" && action === "resume") {
      const entry = botProcesses.get(fullId);
      if (entry && entry.proc && !entry.proc.killed) {
        try { entry.proc.kill("SIGUSR2"); } catch (_) {}
        return json(res, 200, { ok: true, resumed: fullId });
      }
      return json(res, 404, { error: "Script not running" });
    }
  }

  return json(res, 404, { error: "Unknown ClawScript API endpoint" });
}

async function handleIgApi(req, res, p) {
  if (!authGateway(req) && !validateLoginSession(req)) return json(res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET" && p === "/api/ig/config") {
      const config = ensureIgConfig();
      const masked = JSON.parse(JSON.stringify(config));
      for (const key of Object.keys(masked.profiles)) {
        const pr = masked.profiles[key];
        pr.apiKey = maskSecret(pr.apiKey);
        pr.username = maskSecret(pr.username);
        pr.password = maskSecret(pr.password);
        pr.hasCredentials = !!(config.profiles[key].apiKey && config.profiles[key].username && config.profiles[key].password);
      }
      masked.streaming = { status: lsStatus, connectedEpics: lsConnectedEpics, priceCount: streamedPrices.size, liveStreamingActive: !!lsLiveClient, streamingSource: lsLiveClient ? "live" : config.activeProfile, priceSource: lsLiveClient ? "live-api" : (lsConnectedEpics.length > 0 ? "active-profile" : "hybrid-polling"), reconnectAttempts: lsReconnectAttempts, reconnectPending: !!lsReconnectTimer };
      masked.session = getIgSessionInfo();
      return json(res, 200, masked);
    }

    if (req.method === "POST" && p === "/api/ig/config") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      const config = ensureIgConfig();
      if (body.timezone) {
        config.timezone = body.timezone;
      }
      if (body.activeProfile && config.profiles[body.activeProfile]) {
        const oldProfile = config.activeProfile;
        config.activeProfile = body.activeProfile;
        if (oldProfile !== body.activeProfile) {
          igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
          igSessionStatus = "disconnected";
          igSessionError = null;
          if (igSessionRefreshTimer) { clearTimeout(igSessionRefreshTimer); igSessionRefreshTimer = null; }
          igCacheInvalidate();
          stopLightstreamer();
          console.log(`[ig-config] Switched profile: ${oldProfile} -> ${body.activeProfile}`);
        }
      }
      if (body.profiles) {
        for (const key of Object.keys(body.profiles)) {
          if (!config.profiles[key]) continue;
          const src = body.profiles[key];
          if (src.apiKey !== undefined && !src.apiKey.includes("****")) config.profiles[key].apiKey = src.apiKey;
          if (src.username !== undefined && !src.username.includes("****")) config.profiles[key].username = src.username;
          if (src.password !== undefined && !src.password.includes("****")) config.profiles[key].password = src.password;
          if (src.accountId !== undefined) config.profiles[key].accountId = src.accountId;
        }
      }
      saveIgConfig(config);
      if (igConfigured()) {
        igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
        igCacheInvalidate();
        setTimeout(async () => {
          try { await igSessionLogin(); } catch (_) {}
          startLightstreamer();
        }, 1000);
      }
      return json(res, 200, { ok: true, activeProfile: config.activeProfile });
    }

    if (req.method === "POST" && p === "/api/ig/config/test") {
      const testBody = JSON.parse((await readBody(req)).toString() || "{}");
      const testProfileName = testBody.profile || null;
      if (testProfileName) {
        const config = ensureIgConfig();
        const prof = config.profiles[testProfileName];
        if (!prof || !prof.apiKey || !prof.username || !prof.password || !prof.baseUrl) {
          return json(res, 400, { error: "No credentials configured for " + testProfileName + " profile" });
        }
        try {
          const testRes = await igRequest("POST", "/session", {
            "Content-Type": "application/json; charset=UTF-8",
            Accept: "application/json; charset=UTF-8",
            "X-IG-API-KEY": prof.apiKey,
            Version: "2",
          }, JSON.stringify({ identifier: prof.username, password: prof.password }), prof.baseUrl);
          if (testRes.status !== 200) {
            let errDetail = testRes.body || "";
            let errorType = "unknown";
            try { const ej = JSON.parse(errDetail); errDetail = ej.errorCode || ej.error || errDetail; } catch(_) {
              errDetail = errDetail.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
            }
            if (testRes.status === 503 || testRes.status === 502) {
              errorType = "server_unavailable";
              errDetail = "IG servers returned " + testRes.status + " — this usually means IG is blocking connections from this server's IP range (cloud/datacenter IPs). Your credentials may be correct. Try testing from a residential IP or VPN.";
            } else if (testRes.status === 401 || testRes.status === 403) {
              errorType = "auth_rejected";
              if (errDetail.includes("exceeded-api-key-allowance")) {
                errDetail = "API rate limit exceeded — wait a few minutes and try again";
                errorType = "rate_limited";
              }
            } else if (testRes.status === 400) {
              errorType = "bad_credentials";
            }
            return json(res, 200, { ok: false, error: errDetail, errorType, statusCode: testRes.status });
          }
          let lsEndpoint = null;
          let sessionBody = {};
          try { sessionBody = JSON.parse(testRes.body); lsEndpoint = sessionBody.lightstreamerEndpoint || null; } catch(_) {}
          const testCst = testRes.headers["cst"] || "";
          const testXst = testRes.headers["x-security-token"] || "";
          let accountInfo = null;
          try {
            const acctRes = await igRequest("GET", "/accounts", {
              "Content-Type": "application/json; charset=UTF-8",
              Accept: "application/json; charset=UTF-8",
              "X-IG-API-KEY": prof.apiKey,
              CST: testCst,
              "X-SECURITY-TOKEN": testXst,
              Version: "1",
            }, null, prof.baseUrl);
            if (acctRes.status === 200) {
              const acctData = JSON.parse(acctRes.body);
              const accounts = acctData.accounts || [];
              const acct = accounts.find(a => a.accountId === prof.accountId) || accounts[0];
              if (acct && acct.balance) {
                accountInfo = {
                  accountId: acct.accountId,
                  accountName: acct.accountName,
                  balance: acct.balance.balance,
                  deposit: acct.balance.deposit,
                  profitLoss: acct.balance.profitLoss,
                  available: acct.balance.available,
                  currency: acct.currency
                };
              }
            }
          } catch (_) {}
          return json(res, 200, { ok: true, profile: testProfileName, lightstreamerEndpoint: lsEndpoint, account: accountInfo });
        } catch (e) {
          return json(res, 200, { ok: false, error: e.message });
        }
      }
      if (!igConfigured()) return json(res, 400, { error: "No credentials configured for active profile" });
      try {
        const session = await igAuth();
        const profile = getActiveIgProfile();
        return json(res, 200, { ok: true, profile: profile.profileName, lightstreamerEndpoint: igSession.lightstreamerEndpoint || null });
      } catch (e) {
        return json(res, 200, { ok: false, error: e.message });
      }
    }

    if (req.method === "GET" && p === "/api/ig/stream/prices") {
      const prices = getStreamedPrices();
      const isL1Streaming = lsStatus === "connected" && lsConnectedEpics.length > 0;
      const isHybridPolling = !!lsHybridPollingTimer;
      return json(res, 200, { streaming: isL1Streaming, polling: isHybridPolling, method: isL1Streaming ? "lightstreamer" : isHybridPolling ? "rest-polling" : "none", prices });
    }

    if (req.method === "GET" && p === "/api/ig/stream/status") {
      const avgInterval = lsUpdateIntervals.length > 0 ? Math.round(lsUpdateIntervals.reduce((a, b) => a + b, 0) / lsUpdateIntervals.length) : null;
      const minInterval = lsUpdateIntervals.length > 0 ? Math.min(...lsUpdateIntervals) : null;
      const maxInterval = lsUpdateIntervals.length > 0 ? Math.max(...lsUpdateIntervals) : null;
      const uptimeMs = lsConnectedAt ? Date.now() - lsConnectedAt : null;
      const updatesPerSec = uptimeMs && uptimeMs > 5000 ? Math.round((lsUpdateCount / (uptimeMs / 1000)) * 100) / 100 : null;
      const epicStats = {};
      for (const [epic, data] of streamedPrices) {
        if (epic === "__ACCOUNT__") continue;
        epicStats[epic] = { bid: data.bid, offer: data.offer, mid: data.mid, marketState: data.marketState, updateTime: data.updateTime, lastUpdate: data.timestamp, ageMs: Date.now() - data.timestamp, updates: lsUpdateCounts[epic] || 0 };
      }
      return json(res, 200, {
        status: lsStatus,
        connectedEpics: lsConnectedEpics,
        priceCount: streamedPrices.size,
        activeProfile: getActiveIgProfile()?.profileName || null,
        lightstreamerEndpoint: igSession.lightstreamerEndpoint || null,
        liveAccountClient: !!lsLiveClient,
        hybridPolling: !!lsHybridPollingTimer,
        streamingSource: getActiveIgProfile()?.profileName || "demo",
        priceSource: lsConnectedEpics.length > 0 ? "lightstreamer-" + (getActiveIgProfile()?.profileName || "demo") : (lsHybridPollingTimer ? "rest-polling" : "none"),
        priceMethod: lsConnectedEpics.length > 0 ? "LIGHTSTREAMER L1" : (lsHybridPollingTimer ? "REST POLLING (every 3s)" : "DISCONNECTED"),
        reconnect: {
          attempts: lsReconnectAttempts,
          maxAttempts: LS_MAX_RECONNECT_ATTEMPTS,
          pending: !!lsReconnectTimer
        },
        metrics: {
          connectedAt: lsConnectedAt,
          uptimeMs,
          totalUpdates: lsUpdateCount,
          updatesPerSec,
          avgIntervalMs: avgInterval,
          minIntervalMs: minInterval,
          maxIntervalMs: maxInterval,
          recentSamples: lsUpdateIntervals.length
        },
        instruments: epicStats
      });
    }

    if (req.method === "GET" && p === "/api/ig/stream/candles") {
      const u = new URL(req.url, "http://localhost");
      const epic = u.searchParams.get("epic");
      const resolution = u.searchParams.get("resolution") || "MINUTE";
      const max = parseInt(u.searchParams.get("max") || "100", 10);
      if (!epic) return json(res, 400, { error: "Missing ?epic= parameter" });
      const inMemory = getStreamCurrentCandles(epic, resolution, max);
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      try {
        const stored = await scalperDb.getStoredCandles(epic, resolution, max);
        const storedMap = new Map();
        for (const c of stored) storedMap.set(c.ts, c);
        for (const c of inMemory) storedMap.set(c.ts, c);
        const merged = Array.from(storedMap.values()).sort((a, b) => a.ts - b.ts).slice(-max);
        function candleToIgPrice(c) {
          const mid = (v) => ({ bid: v, ask: v, lastTraded: null });
          const t = new Date(c.ts * 1000);
          return { snapshotTime: t.toISOString().replace("T", " ").replace(/\.\d+Z$/, ""), snapshotTimeUTC: t.toISOString(), openPrice: mid(c.open), highPrice: mid(c.high), lowPrice: mid(c.low), closePrice: mid(c.close), lastTradedVolume: c.volume || 0 };
        }
        const prices = merged.map(candleToIgPrice);
        return json(res, 200, { prices, instrumentType: "CURRENCIES", metadata: { size: prices.length, source: "stream", storedCount: stored.length, inMemoryCount: inMemory.length } });
      } catch (err) {
        const prices = inMemory.map(c => {
          const mid = (v) => ({ bid: v, ask: v, lastTraded: null });
          const t = new Date(c.ts * 1000);
          return { snapshotTime: t.toISOString(), snapshotTimeUTC: t.toISOString(), openPrice: mid(c.open), highPrice: mid(c.high), lowPrice: mid(c.low), closePrice: mid(c.close), lastTradedVolume: 0 };
        });
        return json(res, 200, { prices, instrumentType: "CURRENCIES", metadata: { size: prices.length, source: "stream-memory", error: err.message } });
      }
    }

    if (req.method === "GET" && p === "/api/ig/stream/candle-stats") {
      return json(res, 200, { stats: getStreamCandleStats(), resolutions: Object.keys(STREAM_RESOLUTIONS) });
    }

    if (req.method === "POST" && p === "/api/ig/stream/connect-live") {
      try {
        const result = await startLiveLightstreamer();
        return json(res, 200, result);
      } catch (e) {
        return json(res, 400, { ok: false, error: e.message });
      }
    }

    if (req.method === "POST" && p === "/api/ig/stream/disconnect-live") {
      stopLiveLightstreamer();
      return json(res, 200, { ok: true, liveStreamingActive: false });
    }

    if (req.method === "GET" && p === "/api/ig/session") {
      return json(res, 200, getIgSessionInfo());
    }

    if (req.method === "POST" && p === "/api/ig/session/refresh") {
      if (!igConfigured()) return json(res, 400, { error: "No credentials configured for active profile" });
      try {
        lsReconnectAttempts = 0;
        lsReconnectInFlight = false;
        if (lsReconnectTimer) { clearTimeout(lsReconnectTimer); lsReconnectTimer = null; }
        igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: igSession.lightstreamerEndpoint };
        igCacheInvalidate();
        await igSessionLogin();
        stopLightstreamer();
        setTimeout(() => startLightstreamer(), 1000);
        return json(res, 200, { ok: true, ...getIgSessionInfo() });
      } catch (e) {
        return json(res, 200, { ok: false, error: e.message, ...getIgSessionInfo() });
      }
    }

    if (!igConfigured()) return json(res, 503, { error: "IG not configured — set credentials in Config page or env vars" });

    if (req.method === "GET" && p === "/api/ig/positions") {
      const cached = igCacheGet("positions");
      if (cached) return json(res, 200, cached);
      const session = await igAuth();
      const r = await igRequest("GET", "/positions", { ...igHeaders(session), Version: "2" });
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      const data = safeParseIgBody(r.body);
      if (data._parseError) return json(res, 502, { error: "IG returned non-JSON", detail: data._raw });
      const positions = data.positions || data;
      if (Array.isArray(positions)) {
        const epics = [...new Set(positions.map(p => p?.market?.epic).filter(Boolean))];
        const detailsMap = {};
        await Promise.all(epics.map(async epic => { detailsMap[epic] = await getMarketDetails(epic, session); }));
        for (const pos of positions) {
          const epic = pos?.market?.epic;
          if (epic && detailsMap[epic]) {
            pos.market.valueOfOnePip = detailsMap[epic].valueOfOnePip;
            pos.market.contractSize = detailsMap[epic].contractSize;
            pos.market.scalingFactor = detailsMap[epic].scalingFactor;
            pos.market.plMultiplier = detailsMap[epic].plMultiplier;
          }
        }
      }
      igCacheSet("positions", data);
      return json(res, 200, data);
    }

    if (req.method === "GET" && p === "/api/ig/account") {
      const cached = igCacheGet("account");
      if (cached) return json(res, 200, cached);
      const session = await igAuth();
      const r = await igRequest("GET", "/accounts", igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      const data = safeParseIgBody(r.body);
      if (data._parseError) return json(res, 502, { error: "IG returned non-JSON", detail: data._raw });
      igCacheSet("account", data);
      return json(res, 200, data);
    }

    if (req.method === "GET" && p.startsWith("/api/ig/prices")) {
      const url = new URL("http://localhost" + req.url);
      const epics = url.searchParams.get("epics");
      if (!epics) return json(res, 400, { error: "Missing ?epics= param" });
      const epicList = epics.split(",").map(s => s.trim()).filter(Boolean);
      const cacheKey = "prices:" + epicList.sort().join(",");
      const cached = igCacheGet(cacheKey);
      if (cached) return json(res, 200, cached);
      const session = await igAuth();
      const results = {};
      for (const epic of epicList) {
        try {
          const r = await igRequest("GET", "/markets/" + epic, igHeaders(session));
          if (r.status === 200) results[epic] = JSON.parse(r.body);
        } catch (_) {}
      }
      const data = { prices: results };
      igCacheSet(cacheKey, data);
      return json(res, 200, data);
    }

    if (req.method === "POST" && p === "/api/ig/refresh-snapshots") {
      writeConfigSnapshots();
      return json(res, 200, { ok: true, message: "Snapshots refreshed" });
    }

    if (req.method === "POST" && p === "/api/ig/positions/open") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.epic || !body.direction || !body.size) {
        return json(res, 400, { error: "Missing required fields: epic, direction, size" });
      }
      const session = await igAuth();
      let currencyCode = body.currencyCode;
      if (!currencyCode) {
        try {
          const mr = await igRequest("GET", `/markets/${body.epic}`, igHeaders(session));
          if (mr.status === 200) {
            const md = JSON.parse(mr.body);
            const currs = md.instrument?.currencies;
            if (currs && currs.length > 0) currencyCode = currs[0].name || currs[0].code;
          }
        } catch (_) {}
        if (!currencyCode) currencyCode = "AUD";
      }
      const orderBody = {
        epic: body.epic,
        direction: body.direction.toUpperCase(),
        size: String(body.size),
        orderType: body.orderType || "MARKET",
        currencyCode,
        expiry: body.expiry || "-",
        forceOpen: body.forceOpen !== undefined ? body.forceOpen : true,
        guaranteedStop: body.guaranteedStop || false,
      };
      if (body.stopDistance) orderBody.stopDistance = body.stopDistance;
      if (body.limitDistance) orderBody.limitDistance = body.limitDistance;
      if (body.stopLevel) orderBody.stopLevel = body.stopLevel;
      if (body.limitLevel) orderBody.limitLevel = body.limitLevel;
      if (!orderBody.forceOpen) { delete orderBody.stopDistance; delete orderBody.limitDistance; delete orderBody.stopLevel; delete orderBody.limitLevel; }
      console.log(`[ig-trade] Opening ${orderBody.direction} ${orderBody.size} ${orderBody.epic} forceOpen=${orderBody.forceOpen}`);
      const r = await igRequest("POST", "/positions/otc", { ...igHeaders(session), Version: "2" }, JSON.stringify(orderBody));
      igCacheInvalidate();
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        console.log(`[ig-trade] Open failed: HTTP ${r.status}`, detail);
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      console.log(`[ig-trade] Order placed, dealReference: ${dealRef}`);
      if (dealRef) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const conf = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
          if (conf.status === 200) {
            const cd = JSON.parse(conf.body);
            console.log(`[ig-trade] Confirmed: ${cd.dealStatus} dealId=${cd.dealId}`);
            return json(res, 200, { ok: true, dealReference: dealRef, confirmation: cd });
          }
        } catch(_) {}
      }
      return json(res, 200, { ok: true, dealReference: dealRef });
    }

    if (req.method === "POST" && p === "/api/ig/positions/close") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.dealId) {
        return json(res, 400, { error: "Missing required field: dealId. Get dealIds from GET /api/ig/positions" });
      }
      const session = await igAuth();
      let direction = body.direction;
      let autoSize = null;
      let autoExpiry = null;
      if (!direction || !body.size) {
        try {
          const posRes = await igRequest("GET", "/positions", { ...igHeaders(session), Version: "2" });
          if (posRes.status === 200) {
            const allPos = JSON.parse(posRes.body).positions || [];
            console.log(`[ig-trade] Looking for dealId=${body.dealId} among ${allPos.length} positions`);
            const found = allPos.find(item => item.position && item.position.dealId === body.dealId);
            if (found) {
              if (!direction) direction = found.position.direction === "BUY" ? "SELL" : "BUY";
              autoSize = found.position.size;
              autoExpiry = found.market?.expiry || "-";
              console.log(`[ig-trade] Auto-detected: direction=${direction} size=${autoSize} expiry=${autoExpiry}`);
            } else {
              console.log(`[ig-trade] dealId not found. Available: ${allPos.map(item => item.position?.dealId).join(", ")}`);
            }
          } else {
            console.log(`[ig-trade] Positions fetch failed: HTTP ${posRes.status}`);
          }
        } catch(e) { console.log(`[ig-trade] Error looking up position: ${e.message}`); }
      }
      if (!body.size && autoSize) body.size = autoSize;
      if (!direction) {
        return json(res, 400, { error: "Could not determine direction. Provide direction (opposite of position) or check dealId." });
      }
      if (!body.size) {
        return json(res, 400, { error: "Missing size. Provide the position size to close." });
      }
      const closeBody = {
        dealId: body.dealId,
        direction: direction.toUpperCase(),
        size: String(body.size),
        orderType: body.orderType || "MARKET",
        expiry: body.expiry || autoExpiry || "-",
      };
      console.log(`[ig-trade] Closing ${closeBody.direction} ${closeBody.size} dealId=${closeBody.dealId}`);
      const r = await igRequest("POST", "/positions/otc", { ...igHeaders(session), "_method": "DELETE", Version: "1" }, JSON.stringify(closeBody));
      igCacheInvalidate();
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        console.log(`[ig-trade] Close failed: HTTP ${r.status}`, detail);
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      console.log(`[ig-trade] Close order placed, dealReference: ${dealRef}`);
      if (dealRef) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const conf = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
          if (conf.status === 200) {
            const cd = JSON.parse(conf.body);
            console.log(`[ig-trade] Close confirmed: ${cd.dealStatus} dealId=${cd.dealId}`);
            return json(res, 200, { ok: true, dealReference: dealRef, confirmation: cd });
          }
        } catch(_) {}
      }
      return json(res, 200, { ok: true, dealReference: dealRef });
    }

    if (req.method === "PUT" && p === "/api/ig/positions/update") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.dealId) {
        return json(res, 400, { error: "Missing required field: dealId" });
      }
      const updateBody = {};
      if (body.stopLevel !== undefined) updateBody.stopLevel = body.stopLevel;
      if (body.limitLevel !== undefined) updateBody.limitLevel = body.limitLevel;
      if (body.trailingStop !== undefined) updateBody.trailingStop = body.trailingStop;
      if (body.trailingStopDistance !== undefined) updateBody.trailingStopDistance = body.trailingStopDistance;
      if (body.trailingStopIncrement !== undefined) updateBody.trailingStopIncrement = body.trailingStopIncrement;
      if (Object.keys(updateBody).length === 0) {
        return json(res, 400, { error: "Nothing to update. Provide stopLevel, limitLevel, or trailing stop params." });
      }
      console.log(`[ig-trade] Updating position ${body.dealId}`, updateBody);
      const session = await igAuth();
      const r = await igRequest("PUT", "/positions/otc/" + body.dealId, { ...igHeaders(session), Version: "2" }, JSON.stringify(updateBody));
      igCacheInvalidate();
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        console.log(`[ig-trade] Update failed: HTTP ${r.status}`, detail);
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      if (dealRef) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const conf = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
          if (conf.status === 200) {
            const cd = JSON.parse(conf.body);
            console.log(`[ig-trade] Update confirmed: ${cd.dealStatus}`);
            return json(res, 200, { ok: true, dealReference: dealRef, confirmation: cd });
          }
        } catch(_) {}
      }
      return json(res, 200, { ok: true, dealReference: dealRef });
    }

    if (req.method === "GET" && p === "/api/ig/workingorders") {
      const session = await igAuth();
      const r = await igRequest("GET", "/workingorders", { ...igHeaders(session), Version: "2" });
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "POST" && p === "/api/ig/workingorders/create") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.epic || !body.direction || !body.size || !body.level || !body.type) {
        return json(res, 400, { error: "Missing required fields: epic, direction, size, level, type (LIMIT or STOP)" });
      }
      const session = await igAuth();
      let woCurrencyCode = body.currencyCode;
      if (!woCurrencyCode) {
        try {
          const mr = await igRequest("GET", `/markets/${body.epic}`, igHeaders(session));
          if (mr.status === 200) {
            const md = JSON.parse(mr.body);
            const currs = md.instrument?.currencies;
            if (currs && currs.length > 0) woCurrencyCode = currs[0].name || currs[0].code;
          }
        } catch (_) {}
        if (!woCurrencyCode) woCurrencyCode = "AUD";
      }
      const orderBody = {
        epic: body.epic,
        direction: body.direction.toUpperCase(),
        size: body.size,
        level: body.level,
        type: body.type.toUpperCase(),
        currencyCode: woCurrencyCode,
        expiry: body.expiry || "-",
        forceOpen: body.forceOpen !== undefined ? body.forceOpen : true,
        guaranteedStop: body.guaranteedStop || false,
        timeInForce: body.timeInForce || "GOOD_TILL_CANCELLED",
      };
      if (body.stopDistance) orderBody.stopDistance = body.stopDistance;
      if (body.limitDistance) orderBody.limitDistance = body.limitDistance;
      if (body.stopLevel) orderBody.stopLevel = body.stopLevel;
      if (body.limitLevel) orderBody.limitLevel = body.limitLevel;
      if (body.goodTillDate) orderBody.goodTillDate = body.goodTillDate;
      console.log(`[ig-trade] Creating working order: ${orderBody.type} ${orderBody.direction} ${orderBody.size} ${orderBody.epic} @ ${orderBody.level}`);
      const r = await igRequest("POST", "/workingorders/otc", { ...igHeaders(session), Version: "2" }, JSON.stringify(orderBody));
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        console.log(`[ig-trade] Working order failed: HTTP ${r.status}`, detail);
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      console.log(`[ig-trade] Working order placed, dealReference: ${dealRef}`);
      if (dealRef) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const conf = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
          if (conf.status === 200) {
            return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) });
          }
        } catch(_) {}
      }
      return json(res, 200, { ok: true, dealReference: dealRef });
    }

    if (req.method === "PUT" && p === "/api/ig/workingorders/update") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.dealId) {
        return json(res, 400, { error: "Missing required field: dealId" });
      }
      const updateBody = {};
      if (body.level !== undefined) updateBody.level = body.level;
      if (body.size !== undefined) updateBody.size = body.size;
      if (body.stopDistance !== undefined) updateBody.stopDistance = body.stopDistance;
      if (body.limitDistance !== undefined) updateBody.limitDistance = body.limitDistance;
      if (body.stopLevel !== undefined) updateBody.stopLevel = body.stopLevel;
      if (body.limitLevel !== undefined) updateBody.limitLevel = body.limitLevel;
      if (body.timeInForce !== undefined) updateBody.timeInForce = body.timeInForce;
      if (body.goodTillDate !== undefined) updateBody.goodTillDate = body.goodTillDate;
      if (body.type !== undefined) updateBody.type = body.type;
      console.log(`[ig-trade] Updating working order ${body.dealId}`, updateBody);
      const session = await igAuth();
      const r = await igRequest("PUT", "/workingorders/otc/" + body.dealId, { ...igHeaders(session), Version: "2" }, JSON.stringify(updateBody));
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      if (dealRef) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const conf = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
          if (conf.status === 200) {
            return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) });
          }
        } catch(_) {}
      }
      return json(res, 200, { ok: true, dealReference: dealRef });
    }

    if (req.method === "DELETE" && p === "/api/ig/workingorders/delete") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      if (!body.dealId) {
        return json(res, 400, { error: "Missing required field: dealId" });
      }
      console.log(`[ig-trade] Deleting working order ${body.dealId}`);
      const session = await igAuth();
      const r = await igRequest("POST", "/workingorders/otc/" + body.dealId, { ...igHeaders(session), "_method": "DELETE", Version: "2" }, "{}");
      if (r.status !== 200) {
        let detail = r.body;
        try { detail = JSON.parse(r.body); } catch(_) {}
        return json(res, 200, { ok: false, error: typeof detail === "object" ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status });
      }
      let dealRef = null;
      try { dealRef = JSON.parse(r.body).dealReference; } catch(_) {}
      return json(res, 200, { ok: true, dealReference: dealRef, message: "Working order deleted" });
    }

    if (req.method === "GET" && p.startsWith("/api/ig/confirms/")) {
      const dealRef = p.split("/api/ig/confirms/")[1];
      if (!dealRef) return json(res, 400, { error: "Missing deal reference" });
      const session = await igAuth();
      const r = await igRequest("GET", "/confirms/" + dealRef, igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p === "/api/ig/history") {
      const url = new URL("http://localhost" + req.url);
      const type = url.searchParams.get("type") || "ALL";
      const from = url.searchParams.get("from") || "";
      const to = url.searchParams.get("to") || "";
      let qs = `?type=${type}`;
      if (from) qs += `&from=${from}`;
      if (to) qs += `&to=${to}`;
      const session = await igAuth();
      const r = await igRequest("GET", "/history/transactions" + qs, { ...igHeaders(session), Version: "2" });
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p === "/api/ig/activity") {
      const url = new URL("http://localhost" + req.url);
      const from = url.searchParams.get("from") || "";
      const to = url.searchParams.get("to") || "";
      let qs = "?";
      if (from) qs += `from=${from}&`;
      if (to) qs += `to=${to}&`;
      qs = qs.replace(/[&?]$/, "");
      const session = await igAuth();
      const r = await igRequest("GET", "/history/activity" + (qs.length > 1 ? qs : ""), { ...igHeaders(session), Version: "3" });
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p.startsWith("/api/ig/markets/")) {
      const epic = p.replace("/api/ig/markets/", "");
      if (!epic) return json(res, 400, { error: "Missing epic" });
      const cacheKey = "market:" + epic;
      const cached = igCacheGet(cacheKey);
      if (cached) return json(res, 200, cached);
      const session = await igAuth();
      const r = await igRequest("GET", "/markets/" + epic, igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      const data = safeParseIgBody(r.body);
      if (data._parseError) return json(res, 502, { error: "IG returned non-JSON", detail: data._raw });
      igCacheSet(cacheKey, data);
      return json(res, 200, data);
    }

    if (req.method === "GET" && p === "/api/ig/markets") {
      const url = new URL("http://localhost" + req.url);
      const searchTerm = url.searchParams.get("searchTerm") || url.searchParams.get("q") || "";
      if (!searchTerm) return json(res, 400, { error: "Missing searchTerm or q param" });
      const session = await igAuth();
      const r = await igRequest("GET", "/markets?searchTerm=" + encodeURIComponent(searchTerm), igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p.startsWith("/api/ig/marketnavigation")) {
      const nodeId = p.replace("/api/ig/marketnavigation", "").replace(/^\//, "");
      const session = await igAuth();
      const igPath = nodeId ? "/marketnavigation/" + nodeId : "/marketnavigation";
      const r = await igRequest("GET", igPath, igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p.startsWith("/api/ig/pricehistory/")) {
      const epic = p.replace("/api/ig/pricehistory/", "");
      if (!epic) return json(res, 400, { error: "Missing epic" });
      const url = new URL("http://localhost" + req.url);
      const resolution = url.searchParams.get("resolution") || "HOUR";
      const max = parseInt(url.searchParams.get("max") || "50", 10);
      const from = url.searchParams.get("from") || "";
      const to = url.searchParams.get("to") || "";
      const priceCacheKey = `prices:${epic}:${resolution}:${max}:${from}:${to}`;
      const priceCached = igCacheGet(priceCacheKey);
      if (priceCached) return json(res, 200, priceCached);

      const RESOLUTION_SECONDS = { SECOND: 1, MINUTE: 60, MINUTE_2: 120, MINUTE_3: 180, MINUTE_5: 300, MINUTE_10: 600, MINUTE_15: 900, MINUTE_30: 1800, HOUR: 3600, HOUR_2: 7200, HOUR_3: 10800, HOUR_4: 14400, DAY: 86400, WEEK: 604800, MONTH: 2592000 };
      const resSec = RESOLUTION_SECONDS[resolution] || 3600;

      function igPriceToCandle(p) {
        let rawTime = p.snapshotTimeUTC || p.snapshotTime || "";
        if (typeof rawTime === "string") rawTime = rawTime.replace(/\//g, "-");
        const dt = new Date(rawTime);
        const ts = Math.floor(dt.getTime() / 1000);
        const om = p.openPrice || {}, hm = p.highPrice || {}, lm = p.lowPrice || {}, cm = p.closePrice || {};
        return {
          ts,
          open: ((om.bid || 0) + (om.ask || om.offer || 0)) / 2,
          high: ((hm.bid || 0) + (hm.ask || hm.offer || 0)) / 2,
          low: ((lm.bid || 0) + (lm.ask || lm.offer || 0)) / 2,
          close: ((cm.bid || 0) + (cm.ask || cm.offer || 0)) / 2,
          volume: p.lastTradedVolume || 0
        };
      }
      function candleToIgPrice(c) {
        const mid = (v) => ({ bid: v, ask: v, lastTraded: null });
        const t = new Date(c.ts * 1000);
        return { snapshotTime: t.toISOString().replace("T", " ").replace(/\.\d+Z$/, ""), snapshotTimeUTC: t.toISOString(), openPrice: mid(c.open), highPrice: mid(c.high), lowPrice: mid(c.low), closePrice: mid(c.close), lastTradedVolume: c.volume || 0 };
      }

      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      let source = "ig";

      if (!from && !to) {
        try {
          const stored = await scalperDb.getStoredCandles(epic, resolution, max);
          if (stored.length >= max) {
            const latestTs = stored.length > 0 ? stored[stored.length - 1].ts : 0;
            const nowSec = Math.floor(Date.now() / 1000);
            const staleThreshold = resSec * 2;
            if (nowSec - latestTs < staleThreshold) {
              const prices = stored.slice(-max).map(candleToIgPrice);
              const result = { prices, instrumentType: "CURRENCIES", metadata: { size: prices.length, source: "db", storedCount: stored.length } };
              igCacheSet(priceCacheKey, result);
              return json(res, 200, result);
            }
          }
        } catch (dbErr) {
          console.log(`[ig-prices] DB cache read failed: ${dbErr.message}`);
        }
      }

      const session = await igAuth();
      let allPrices = [];

      if (from || to) {
        let pageNum = 1;
        const maxPages = Math.ceil(max / 20) + 1;
        while (pageNum <= maxPages && allPrices.length < max) {
          let qs = `?resolution=${resolution}&max=${max}&pageNumber=${pageNum}`;
          if (from) qs += `&from=${encodeURIComponent(from)}`;
          if (to) qs += `&to=${encodeURIComponent(to)}`;
          const r = await igRequest("GET", "/prices/" + epic + qs, { ...igHeaders(session), Version: "3" });
          if (r.status !== 200) {
            if (allPrices.length > 0) break;
            return json(res, r.status, { error: "IG API error", detail: r.body });
          }
          const body = safeParseIgBody(r.body);
          if (body._parseError) {
            if (allPrices.length > 0) break;
            return json(res, 502, { error: "IG returned non-JSON", detail: body._raw });
          }
          const prices = body.prices || [];
          allPrices = allPrices.concat(prices);
          const pd = body.metadata && body.metadata.pageData;
          if (!pd || pageNum >= pd.totalPages) break;
          pageNum++;
          if (pageNum <= maxPages) await new Promise(r => setTimeout(r, 200));
        }
      } else {
        let fetchMax = max;
        let latestStoredTs = null;
        let storedCandleCount = 0;
        try {
          latestStoredTs = await scalperDb.getLatestCandleTs(epic, resolution);
          if (latestStoredTs) storedCandleCount = await scalperDb.getCandleCount(epic, resolution);
        } catch (_) {}

        if (latestStoredTs && storedCandleCount >= max) {
          const gapCandles = Math.ceil((Date.now() / 1000 - latestStoredTs) / resSec) + 5;
          fetchMax = Math.min(Math.max(gapCandles, 20), max);
        }

        const igPath = `/prices/${epic}/${resolution}/${fetchMax}`;
        const r = await igRequest("GET", igPath, { ...igHeaders(session), Version: "2" });
        if (r.status !== 200) {
          console.log(`[ig-prices] Path-based request failed (${r.status}): ${igPath} — ${(r.body || "").substring(0, 200)}`);
          try {
            const fallback = await scalperDb.getStoredCandles(epic, resolution, max);
            const inMemStream = getStreamCurrentCandles(epic, resolution, max);
            const mergedMap = new Map();
            for (const c of fallback) mergedMap.set(c.ts, c);
            for (const c of inMemStream) mergedMap.set(c.ts, c);
            const merged = Array.from(mergedMap.values()).sort((a, b) => a.ts - b.ts).slice(-max);
            if (merged.length > 0) {
              const prices = merged.map(candleToIgPrice);
              const result = { prices, instrumentType: "CURRENCIES", metadata: { size: prices.length, source: "stream-fallback", storedCount: fallback.length, streamCount: inMemStream.length } };
              return json(res, 200, result);
            }
          } catch (_) {}
          return json(res, r.status, { error: "IG API error", detail: r.body });
        }
        const body = safeParseIgBody(r.body);
        if (body._parseError) {
          return json(res, 502, { error: "IG returned non-JSON", detail: body._raw });
        }
        allPrices = body.prices || [];
        source = (latestStoredTs && storedCandleCount >= max && fetchMax < max) ? "mixed" : "ig";
      }

      const freshCandles = allPrices.map(igPriceToCandle).filter(c => c.ts > 0);
      try {
        if (freshCandles.length > 0) {
          const stored = await scalperDb.storeCandles(epic, resolution, freshCandles);
          if (stored > 0) console.log(`[ig-prices] Stored ${stored} new candles for ${epic} ${resolution}`);
        }
      } catch (storeErr) {
        console.log(`[ig-prices] DB store failed: ${storeErr.message}`);
      }

      let finalPrices = allPrices.map(p => {
        if (!p.snapshotTimeUTC && p.snapshotTime) {
          const normalized = String(p.snapshotTime).replace(/\//g, "-").replace(" ", "T") + "Z";
          return { ...p, snapshotTimeUTC: new Date(normalized).toISOString() };
        }
        return p;
      });
      let storedCount = allPrices.length;
      if (!from && !to && source === "mixed") {
        try {
          const allStored = await scalperDb.getStoredCandles(epic, resolution, max);
          finalPrices = allStored.slice(-max).map(candleToIgPrice);
          storedCount = allStored.length;
          source = "mixed";
        } catch (_) {
          source = "ig";
        }
      }

      const result = { prices: finalPrices, instrumentType: "CURRENCIES", metadata: { size: finalPrices.length, source, storedCount } };
      igCacheSet(priceCacheKey, result);
      return json(res, 200, result);
    }

    if (req.method === "GET" && p === "/api/ig/watchlists") {
      const session = await igAuth();
      const r = await igRequest("GET", "/watchlists", igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p.startsWith("/api/ig/watchlists/")) {
      const wlId = p.replace("/api/ig/watchlists/", "");
      const session = await igAuth();
      const r = await igRequest("GET", "/watchlists/" + wlId, igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      return igJsonResponse(res, 200, r.body);
    }

    if (req.method === "GET" && p === "/api/ig/proofread") {
      const cfgPath = path.join(DATA_DIR, "ig-proofread-config.json");
      const defaults = { enabled: true, maxStalenessSeconds: 120, spreadLimitPctHigh: 0.5, spreadLimitPctLow: 1.0, spreadThresholdMid: 100, minRiskReward: 1.0, maxRiskPct: 2.0, maxEntryDeviationPct: 5.0, allowDuplicatePositions: false, requireStopLoss: true, requireTakeProfit: true };
      if (!fs.existsSync(cfgPath)) return json(res, 200, defaults);
      try { return json(res, 200, { ...defaults, ...JSON.parse(fs.readFileSync(cfgPath, "utf8")) }); } catch(_) { return json(res, 200, defaults); }
    }

    if (req.method === "PUT" && p === "/api/ig/proofread") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const cfgPath = path.join(DATA_DIR, "ig-proofread-config.json");
      const defaults = { enabled: true, maxStalenessSeconds: 120, spreadLimitPctHigh: 0.5, spreadLimitPctLow: 1.0, spreadThresholdMid: 100, minRiskReward: 1.0, maxRiskPct: 2.0, maxEntryDeviationPct: 5.0, allowDuplicatePositions: false, requireStopLoss: true, requireTakeProfit: true };
      const cfg = fs.existsSync(cfgPath) ? { ...defaults, ...JSON.parse(fs.readFileSync(cfgPath, "utf8")) } : { ...defaults };
      if (body.enabled !== undefined) cfg.enabled = !!body.enabled;
      if (body.maxStalenessSeconds !== undefined) { const v = Number(body.maxStalenessSeconds); if (!Number.isFinite(v) || v < 5 || v > 600) return json(res, 400, { error: "maxStalenessSeconds must be 5-600" }); cfg.maxStalenessSeconds = v; }
      if (body.spreadLimitPctHigh !== undefined) { const v = Number(body.spreadLimitPctHigh); if (!Number.isFinite(v) || v <= 0 || v > 10) return json(res, 400, { error: "spreadLimitPctHigh must be 0-10" }); cfg.spreadLimitPctHigh = v; }
      if (body.spreadLimitPctLow !== undefined) { const v = Number(body.spreadLimitPctLow); if (!Number.isFinite(v) || v <= 0 || v > 10) return json(res, 400, { error: "spreadLimitPctLow must be 0-10" }); cfg.spreadLimitPctLow = v; }
      if (body.spreadThresholdMid !== undefined) { const v = Number(body.spreadThresholdMid); if (!Number.isFinite(v) || v < 0) return json(res, 400, { error: "spreadThresholdMid must be >= 0" }); cfg.spreadThresholdMid = v; }
      if (body.minRiskReward !== undefined) { const v = Number(body.minRiskReward); if (!Number.isFinite(v) || v < 0.1 || v > 10) return json(res, 400, { error: "minRiskReward must be 0.1-10" }); cfg.minRiskReward = v; }
      if (body.maxRiskPct !== undefined) { const v = Number(body.maxRiskPct); if (!Number.isFinite(v) || v <= 0 || v > 50) return json(res, 400, { error: "maxRiskPct must be 0-50" }); cfg.maxRiskPct = v; }
      if (body.maxEntryDeviationPct !== undefined) { const v = Number(body.maxEntryDeviationPct); if (!Number.isFinite(v) || v <= 0 || v > 50) return json(res, 400, { error: "maxEntryDeviationPct must be 0-50" }); cfg.maxEntryDeviationPct = v; }
      if (body.allowDuplicatePositions !== undefined) cfg.allowDuplicatePositions = !!body.allowDuplicatePositions;
      if (body.requireStopLoss !== undefined) cfg.requireStopLoss = !!body.requireStopLoss;
      if (body.requireTakeProfit !== undefined) cfg.requireTakeProfit = !!body.requireTakeProfit;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      return json(res, 200, { ok: true, ...cfg });
    }

    if (req.method === "GET" && p === "/api/ig/strategies") {
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 200, { strategies: [], enabled: false, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      return json(res, 200, cfg);
    }

    if (req.method === "POST" && p === "/api/ig/strategies/global") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : { strategies: [], enabled: true, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 };
      if (body.enabled !== undefined) cfg.enabled = !!body.enabled;
      if (body.maxOpenPositions !== undefined) { const v = Number(body.maxOpenPositions); if (!Number.isFinite(v) || v < 1 || v > 100) return json(res, 400, { error: "maxOpenPositions must be 1-100" }); cfg.maxOpenPositions = v; }
      if (body.maxRiskPercent !== undefined) { const v = Number(body.maxRiskPercent); if (!Number.isFinite(v) || v < 0.1 || v > 100) return json(res, 400, { error: "maxRiskPercent must be 0.1-100" }); cfg.maxRiskPercent = v; }
      if (body.checkIntervalSeconds !== undefined) { const v = Number(body.checkIntervalSeconds); if (!Number.isFinite(v) || v < 5 || v > 3600) return json(res, 400, { error: "checkIntervalSeconds must be 5-3600" }); cfg.checkIntervalSeconds = v; }
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, ...cfg });
    }

    if (req.method === "POST" && p === "/api/ig/strategies") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      if (!body.instrument || typeof body.instrument !== "string") return json(res, 400, { error: "Missing or invalid 'instrument' (IG EPIC code)" });
      if (!body.direction || (body.direction !== "BUY" && body.direction !== "SELL")) return json(res, 400, { error: "Missing or invalid 'direction' (BUY or SELL)" });
      if (body.size === undefined || !Number.isFinite(Number(body.size)) || Number(body.size) <= 0) return json(res, 400, { error: "Missing or invalid 'size' (must be positive number)" });
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : { strategies: [], enabled: false, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 };
      if (!Array.isArray(cfg.strategies)) cfg.strategies = [];
      const newStrategy = {
        instrument: String(body.instrument).trim(),
        name: body.name ? String(body.name).trim() : String(body.instrument).trim(),
        direction: body.direction,
        size: Number(body.size),
        enabled: body.enabled !== undefined ? !!body.enabled : false,
        stopDistance: undefined,
        limitDistance: undefined,
      };
      if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "stopDistance must be a positive number" }); newStrategy.stopDistance = v; }
      if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "limitDistance must be a positive number" }); newStrategy.limitDistance = v; }
      if (body.entryBelow !== undefined) { const v = Number(body.entryBelow); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "entryBelow must be a positive number" }); newStrategy.entryBelow = v; }
      if (body.entryAbove !== undefined) { const v = Number(body.entryAbove); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "entryAbove must be a positive number" }); newStrategy.entryAbove = v; }
      if (body.dealId) newStrategy.dealId = String(body.dealId);
      if (body.paused) newStrategy.paused = true;
      Object.keys(newStrategy).forEach(k => { if (newStrategy[k] === undefined) delete newStrategy[k]; });
      cfg.strategies.push(newStrategy);
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: cfg.strategies.length - 1, strategy: newStrategy });
    }

    const strategyMatch = p.match(/^\/api\/ig\/strategies\/(\d+)$/);
    const strategyToggleMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/toggle$/);
    const strategyAttachMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/attach$/);
    const strategyDetachMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/detach$/);
    const strategyPauseMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/pause$/);

    if (req.method === "POST" && strategyAttachMatch) {
      const idx = parseInt(strategyAttachMatch[1], 10);
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      if (!body.dealId || typeof body.dealId !== "string") return json(res, 400, { error: "Missing dealId" });
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      if (cfg.strategies[idx].dealId && cfg.strategies[idx].dealId !== body.dealId) return json(res, 409, { error: "Strategy already linked to position " + cfg.strategies[idx].dealId + ". Detach first." });
      const existingLink = cfg.strategies.findIndex((s, i) => i !== idx && s.dealId === body.dealId);
      if (existingLink >= 0) {
        delete cfg.strategies[existingLink].dealId;
        delete cfg.strategies[existingLink].paused;
      }
      cfg.strategies[idx].dealId = body.dealId;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: idx, strategy: cfg.strategies[idx] });
    }

    if (req.method === "POST" && strategyDetachMatch) {
      const idx = parseInt(strategyDetachMatch[1], 10);
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      delete cfg.strategies[idx].dealId;
      delete cfg.strategies[idx].paused;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: idx, strategy: cfg.strategies[idx] });
    }

    if (req.method === "POST" && strategyPauseMatch) {
      const idx = parseInt(strategyPauseMatch[1], 10);
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { body = {}; }
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      cfg.strategies[idx].paused = body.paused !== undefined ? !!body.paused : !cfg.strategies[idx].paused;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: idx, paused: cfg.strategies[idx].paused, strategy: cfg.strategies[idx] });
    }

    if (req.method === "POST" && strategyToggleMatch) {
      const idx = parseInt(strategyToggleMatch[1], 10);
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      cfg.strategies[idx].enabled = !cfg.strategies[idx].enabled;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: idx, enabled: cfg.strategies[idx].enabled, strategy: cfg.strategies[idx] });
    }

    if (req.method === "PUT" && strategyMatch) {
      const idx = parseInt(strategyMatch[1], 10);
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      const s = cfg.strategies[idx];
      if (body.name !== undefined) { if (!String(body.name).trim()) return json(res, 400, { error: "Name cannot be empty" }); s.name = String(body.name).trim(); }
      if (body.enabled !== undefined) s.enabled = !!body.enabled;
      if (body.size !== undefined) { const v = Number(body.size); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "Size must be positive" }); s.size = v; }
      if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "Stop distance must be positive" }); s.stopDistance = v; }
      if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "Limit distance must be positive" }); s.limitDistance = v; }
      if (body.entryBelow !== undefined) { const v = Number(body.entryBelow); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "Entry level must be positive" }); s.entryBelow = v; delete s.entryAbove; }
      if (body.entryAbove !== undefined) { const v = Number(body.entryAbove); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: "Entry level must be positive" }); s.entryAbove = v; delete s.entryBelow; }
      if (body.direction !== undefined) { if (body.direction !== "BUY" && body.direction !== "SELL") return json(res, 400, { error: "Direction must be BUY or SELL" }); s.direction = body.direction; }
      if (body.instrument !== undefined) s.instrument = String(body.instrument);
      if (body.dealId !== undefined) { if (body.dealId) s.dealId = String(body.dealId); else delete s.dealId; }
      if (body.paused !== undefined) s.paused = !!body.paused;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, index: idx, strategy: s });
    }

    if (req.method === "DELETE" && strategyMatch) {
      const idx = parseInt(strategyMatch[1], 10);
      const cfgPath = path.join(DATA_DIR, "ig-strategy.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No strategy config" });
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: "Strategy index out of range" });
      const removed = cfg.strategies.splice(idx, 1)[0];
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, removed: removed });
    }

    const TEMPLATES_DIR = path.join(DATA_DIR, "ig-strategy-templates");

    if (req.method === "GET" && p === "/api/ig/strategy-templates") {
      if (!fs.existsSync(TEMPLATES_DIR)) return json(res, 200, { templates: [] });
      const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith(".json")).sort();
      const templates = [];
      for (const f of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, f), "utf8"));
          templates.push({ id: f.replace(/\.json$/, ""), filename: f, ...data });
        } catch (_) {}
      }
      return json(res, 200, { templates });
    }

    if (req.method === "POST" && p === "/api/ig/strategy-templates") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      if (!body.name) return json(res, 400, { error: "Template name is required" });
      if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 50);
      const filename = slug + ".json";
      const template = {};
      for (const key of ["name","description","instrument","instrumentName","direction","entryBelow","entryAbove","stopDistance","limitDistance","size"]) {
        if (body[key] !== undefined) template[key] = body[key];
      }
      fs.writeFileSync(path.join(TEMPLATES_DIR, filename), JSON.stringify(template, null, 2));
      return json(res, 200, { ok: true, id: slug, filename, template });
    }

    const templateDeleteMatch = p.match(/^\/api\/ig\/strategy-templates\/([a-z0-9-]+)$/);
    if (req.method === "DELETE" && templateDeleteMatch) {
      const id = templateDeleteMatch[1];
      const filePath = path.join(TEMPLATES_DIR, id + ".json");
      if (!fs.existsSync(filePath)) return json(res, 404, { error: "Template not found" });
      fs.unlinkSync(filePath);
      return json(res, 200, { ok: true, deleted: id });
    }

    if (req.method === "GET" && p === "/api/ig/watchedlist") {
      const cfgPath = path.join(DATA_DIR, "ig-monitor-config.json");
      const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
      if (!fs.existsSync(cfgPath)) return json(res, 200, defaults);
      try { return json(res, 200, { ...defaults, ...JSON.parse(fs.readFileSync(cfgPath, "utf8")) }); } catch(_) { return json(res, 200, defaults); }
    }

    if (req.method === "POST" && p === "/api/ig/watchedlist") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      if (!body.epic || typeof body.epic !== "string") return json(res, 400, { error: "Missing epic" });
      const cfgPath = path.join(DATA_DIR, "ig-monitor-config.json");
      const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
      let cfg;
      try { cfg = fs.existsSync(cfgPath) ? { ...defaults, ...JSON.parse(fs.readFileSync(cfgPath, "utf8")) } : { ...defaults }; } catch(_) { cfg = { ...defaults }; }
      if (!Array.isArray(cfg.instruments)) cfg.instruments = [];
      if (cfg.instruments.some(i => i.epic === body.epic)) return json(res, 409, { error: "Instrument already in watchlist" });
      const inst = { epic: body.epic, name: body.name || body.epic };
      cfg.instruments.push(inst);
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, instrument: inst, instruments: cfg.instruments });
    }

    if (req.method === "DELETE" && p.startsWith("/api/ig/watchedlist/")) {
      const idx = parseInt(p.replace("/api/ig/watchedlist/", ""), 10);
      const cfgPath = path.join(DATA_DIR, "ig-monitor-config.json");
      if (!fs.existsSync(cfgPath)) return json(res, 404, { error: "No watchlist config" });
      const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
      let cfg;
      try { cfg = { ...defaults, ...JSON.parse(fs.readFileSync(cfgPath, "utf8")) }; } catch(_) { return json(res, 500, { error: "Corrupt watchlist config" }); }
      if (!Array.isArray(cfg.instruments)) cfg.instruments = [];
      if (isNaN(idx) || idx < 0 || idx >= cfg.instruments.length) return json(res, 404, { error: "Index out of range" });
      const removed = cfg.instruments.splice(idx, 1)[0];
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
      writeConfigSnapshots();
      return json(res, 200, { ok: true, removed, instruments: cfg.instruments });
    }

    if (req.method === "GET" && p === "/api/ig/scalper") {
      return json(res, 200, await scalperEngine.getConfig());
    }
    if (req.method === "PUT" && p === "/api/ig/scalper") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const cfg = await scalperEngine.updateConfig(body);
      return json(res, 200, { ok: true, ...cfg });
    }
    if (req.method === "GET" && p === "/api/ig/scalper/status") {
      return json(res, 200, await scalperEngine.getStatus());
    }
    if (req.method === "POST" && p === "/api/ig/scalper/start") {
      await scalperEngine.start();
      return json(res, 200, { ok: true, running: true });
    }
    if (req.method === "POST" && p === "/api/ig/scalper/stop") {
      await scalperEngine.stop();
      return json(res, 200, { ok: true, running: false });
    }
    if (req.method === "POST" && p === "/api/ig/scalper/reset") {
      return json(res, 200, await scalperEngine.resetStats());
    }
    if (req.method === "GET" && p === "/api/ig/scalper/strategies") {
      const cfg = await scalperEngine.getConfig();
      return json(res, 200, { strategies: cfg.strategies || [] });
    }
    if (req.method === "POST" && p === "/api/ig/scalper/strategies") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const result = await scalperEngine.addStrategy(body);
      if (result.error) return json(res, 400, result);
      if (body.instrument && lsClient) {
        const currentEpics = new Set(lsConnectedEpics || []);
        if (!currentEpics.has(body.instrument)) {
          setTimeout(() => startLightstreamer(), 500);
        }
      }
      return json(res, 200, result);
    }
    const scalperStratMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)$/);
    const scalperToggleMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/toggle$/);
    if (req.method === "POST" && scalperToggleMatch) {
      const result = await scalperEngine.toggleStrategy(parseInt(scalperToggleMatch[1], 10));
      if (result.error) return json(res, 400, result);
      return json(res, 200, result);
    }
    if (req.method === "PUT" && scalperStratMatch) {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      const result = await scalperEngine.updateStrategy(parseInt(scalperStratMatch[1], 10), body);
      if (result.error) return json(res, 400, result);
      return json(res, 200, result);
    }
    if (req.method === "DELETE" && scalperStratMatch) {
      const result = await scalperEngine.deleteStrategy(parseInt(scalperStratMatch[1], 10));
      if (result.error) return json(res, 400, result);
      return json(res, 200, result);
    }

    const backtestRunMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/backtest$/);
    if (req.method === "POST" && backtestRunMatch) {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      try {
        const backtestEngine = require("./skills/bots/ig-scalper-backtest.cjs");
        const result = await backtestEngine.runAndSave(parseInt(backtestRunMatch[1], 10), {
          timeframe: body.timeframe,
          candleCount: parseInt(body.candleCount, 10) || 500
        });
        return json(res, 200, { ok: true, ...result });
      } catch (e) {
        return json(res, 500, { error: e.message });
      }
    }
    const backtestListMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/backtests$/);
    if (req.method === "GET" && backtestListMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const list = await scalperDb.getBacktests(parseInt(backtestListMatch[1], 10));
      return json(res, 200, { backtests: list });
    }
    if (req.method === "DELETE" && backtestListMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const result = await scalperDb.deleteBacktests(parseInt(backtestListMatch[1], 10));
      return json(res, 200, result);
    }
    if (req.method === "GET" && p === "/api/ig/scalper/strategy-schemas") {
      const sl = require("./skills/bots/strategies/index.cjs");
      return json(res, 200, sl.getStrategySchemas());
    }
    if (req.method === "GET" && p === "/api/ig/scalper/backtests") {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const list = await scalperDb.getAllBacktests(50);
      return json(res, 200, { backtests: list });
    }
    if (req.method === "DELETE" && p === "/api/ig/scalper/backtests") {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const result = await scalperDb.deleteAllBacktests();
      return json(res, 200, result);
    }
    const backtestDetailMatch = p.match(/^\/api\/ig\/scalper\/backtests\/(\d+)$/);
    if (req.method === "GET" && backtestDetailMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const bt = await scalperDb.getBacktest(parseInt(backtestDetailMatch[1], 10));
      if (!bt) return json(res, 404, { error: "Backtest not found" });
      return json(res, 200, bt);
    }

    if (req.method === "POST" && p === "/api/ig/scalper/batch-backtest") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      try {
        const backtestEngine = require("./skills/bots/ig-scalper-backtest.cjs");
        const result = await backtestEngine.runBatchBacktest({
          instrument: body.instrument,
          strategies: body.strategies || [],
          timeframes: body.timeframes || ["MINUTE"],
          candleCount: parseInt(body.candleCount, 10) || 500,
          useClawTraderConfigs: body.useClawTraderConfigs !== false
        });
        return json(res, 200, { ok: true, ...result });
      } catch (e) {
        var code = /required|invalid|missing/i.test(e.message) ? 400 : 500;
        return json(res, code, { error: e.message });
      }
    }

    if (req.method === "POST" && p === "/api/ig/scalper/optimize") {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      try {
        const backtestEngine = require("./skills/bots/ig-scalper-backtest.cjs");
        const result = await backtestEngine.runOptimizationBatch({
          instrument: body.instrument,
          strategies: body.strategies || [],
          timeframes: body.timeframes || ["MINUTE"],
          candleCount: parseInt(body.candleCount, 10) || 500,
          iterations: parseInt(body.iterations, 10) || 5,
          cycles: parseInt(body.cycles, 10) || 3,
          fixedKeys: body.fixedKeys || undefined,
          useClawTraderConfigs: body.useClawTraderConfigs !== false,
          useAiCalibration: !!body.useAiCalibration
        });
        return json(res, 200, { ok: true, ...result });
      } catch (e) {
        var errCode = /required|invalid|missing/i.test(e.message) ? 400 : 500;
        return json(res, errCode, { error: e.message });
      }
    }

    const optResultsMatch = p.match(/^\/api\/ig\/scalper\/optimize\/([\w-]+)$/);
    if (req.method === "GET" && optResultsMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const results = await scalperDb.getOptimizationResults(optResultsMatch[1]);
      return json(res, 200, { optimizationBatchId: optResultsMatch[1], results });
    }

    const optBestMatch = p.match(/^\/api\/ig\/scalper\/optimize\/([\w-]+)\/best$/);
    if (req.method === "GET" && optBestMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const results = await scalperDb.getBestOptimizationResults(optBestMatch[1], 10);
      return json(res, 200, { optimizationBatchId: optBestMatch[1], best: results });
    }

    if (req.method === "GET" && p === "/api/ig/scalper/optimization-memory") {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const memories = await scalperDb.getAllOptimizationMemories();
      return json(res, 200, { memories });
    }

    const optMemInstrMatch = p.match(/^\/api\/ig\/scalper\/optimization-memory\/([\w.]+)$/);
    if (req.method === "GET" && optMemInstrMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const memories = await scalperDb.getAllOptimizationMemories(decodeURIComponent(optMemInstrMatch[1]));
      return json(res, 200, { memories });
    }
    if (req.method === "DELETE" && p === "/api/ig/scalper/optimization-memory") {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const result = await scalperDb.deleteOptimizationMemory(null);
      return json(res, 200, result);
    }
    if (req.method === "DELETE" && optMemInstrMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const result = await scalperDb.deleteOptimizationMemory(decodeURIComponent(optMemInstrMatch[1]));
      return json(res, 200, result);
    }
    if (req.method === "GET" && p === "/api/ig/scalper/batch-backtest") {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const batches = await scalperDb.listBatches(20);
      return json(res, 200, { batches });
    }
    const batchDetailMatch = p.match(/^\/api\/ig\/scalper\/batch-backtest\/([^/]+)$/);
    if (req.method === "GET" && batchDetailMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const results = await scalperDb.getBatchResults(batchDetailMatch[1]);
      return json(res, 200, { batchId: batchDetailMatch[1], results });
    }
    if (req.method === "DELETE" && batchDetailMatch) {
      const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
      const result = await scalperDb.deleteBatch(batchDetailMatch[1]);
      return json(res, 200, result);
    }

    return json(res, 404, { error: "Unknown IG endpoint" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}

async function handleAgentsApi(req, res, p) {
  const agentBackupMatch = p.match(/^\/api\/agents\/([^/]+)\/backup$/);
  const agentBackupsMatch = p.match(/^\/api\/agents\/([^/]+)\/backups$/);
  const agentRestoreMatch = p.match(/^\/api\/agents\/([^/]+)\/restore\/(\d+)$/);
  const agentBackupDelMatch = p.match(/^\/api\/agents\/([^/]+)\/backup\/(\d+)$/);
  const agentMemoryMatch = p.match(/^\/api\/agents\/([^/]+)\/memory$/);
  const agentDailyListMatch = p.match(/^\/api\/agents\/([^/]+)\/memory\/daily$/);
  const agentDailyMatch = p.match(/^\/api\/agents\/([^/]+)\/memory\/daily\/(\d{4}-\d{2}-\d{2})$/);
  const agentMemSearchMatch = p.match(/^\/api\/agents\/([^/]+)\/memory\/search$/);
  const agentSubAllMatch = p.match(/^\/api\/agents\/([^/]+)\/subconscious$/);
  const agentSubReflectMatch = p.match(/^\/api\/agents\/([^/]+)\/subconscious\/reflect$/);
  const agentSubCatMatch = p.match(/^\/api\/agents\/([^/]+)\/subconscious\/([^/]+)$/);
  const agentSubEntryMatch = p.match(/^\/api\/agents\/([^/]+)\/subconscious\/([^/]+)\/(.+)$/);

  const scalperDb = require("./skills/bots/ig-scalper-db.cjs");
  try {
    if (req.method === "POST" && agentBackupMatch) {
      let body = {}; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) {}
      return json(res, 200, await scalperDb.backupAgent(agentBackupMatch[1], body.name));
    }
    if (req.method === "GET" && agentBackupsMatch) {
      return json(res, 200, { backups: await scalperDb.listAgentBackups(agentBackupsMatch[1]) });
    }
    if (req.method === "POST" && agentRestoreMatch) {
      return json(res, 200, await scalperDb.restoreAgentBackup(parseInt(agentRestoreMatch[2], 10)));
    }
    if (req.method === "DELETE" && agentBackupDelMatch) {
      return json(res, 200, await scalperDb.deleteAgentBackup(parseInt(agentBackupDelMatch[2], 10)));
    }
    if (req.method === "GET" && agentMemoryMatch) {
      return json(res, 200, await scalperDb.getAgentMemory(agentMemoryMatch[1]));
    }
    if (req.method === "PUT" && agentMemoryMatch) {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      return json(res, 200, await scalperDb.setAgentMemory(agentMemoryMatch[1], body.content || ""));
    }
    if (req.method === "GET" && agentDailyListMatch) {
      return json(res, 200, { entries: await scalperDb.listDailyMemories(agentDailyListMatch[1]) });
    }
    if (req.method === "GET" && agentDailyMatch) {
      return json(res, 200, await scalperDb.getDailyMemory(agentDailyMatch[1], agentDailyMatch[2]));
    }
    if (req.method === "PUT" && agentDailyMatch) {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      return json(res, 200, await scalperDb.setDailyMemory(agentDailyMatch[1], agentDailyMatch[2], body.content || ""));
    }
    if (req.method === "GET" && agentMemSearchMatch) {
      const searchUrl = new URL(req.url, "http://localhost");
      const q = searchUrl.searchParams.get("q") || "";
      if (!q) return json(res, 400, { error: "Missing ?q= search term" });
      return json(res, 200, { results: await scalperDb.searchMemory(agentMemSearchMatch[1], q) });
    }
    if (req.method === "GET" && agentSubReflectMatch) {
      return json(res, 200, { reflection: await scalperDb.reflectSubconscious(agentSubReflectMatch[1]) });
    }
    if (req.method === "GET" && agentSubAllMatch) {
      return json(res, 200, await scalperDb.getAllSubconscious(agentSubAllMatch[1]));
    }
    if (req.method === "GET" && agentSubCatMatch) {
      return json(res, 200, { entries: await scalperDb.getSubconscious(agentSubCatMatch[1], agentSubCatMatch[2]) });
    }
    if (req.method === "PUT" && agentSubEntryMatch) {
      let body; try { body = JSON.parse((await readBody(req)).toString() || "{}"); } catch(_) { return json(res, 400, { error: "Invalid JSON" }); }
      return json(res, 200, await scalperDb.setSubconscious(agentSubEntryMatch[1], agentSubEntryMatch[2], decodeURIComponent(agentSubEntryMatch[3]), body.value || ""));
    }
    if (req.method === "DELETE" && agentSubEntryMatch) {
      return json(res, 200, await scalperDb.deleteSubconscious(agentSubEntryMatch[1], agentSubEntryMatch[2], decodeURIComponent(agentSubEntryMatch[3])));
    }
    return json(res, 404, { error: "Unknown agent endpoint" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}

async function writeConfigSnapshots() {
  try {
    if (!fs.existsSync(CANVAS_DIR)) fs.mkdirSync(CANVAS_DIR, { recursive: true });
    const filesToCopy = [
      ["ig-monitor-config.json", "ig-monitor-config-snapshot.json"],
      ["ig-strategy.json", "ig-strategy-snapshot.json"],
      ["ig-alerts.json", "ig-alerts-snapshot.json"],
      ["ig-bot-log.json", "ig-bot-log-snapshot.json"],
    ];
    for (const [src, dst] of filesToCopy) {
      const srcPath = path.join(DATA_DIR, src);
      if (fs.existsSync(srcPath)) {
        fs.writeFileSync(path.join(CANVAS_DIR, dst), fs.readFileSync(srcPath));
      }
    }
    try {
      const scalperConfig = await scalperEngine.getConfigExport();
      if (scalperConfig) {
        fs.writeFileSync(path.join(CANVAS_DIR, "ig-scalper-config-snapshot.json"), JSON.stringify(scalperConfig, null, 2));
      }
      const scalperStatus = await scalperEngine.getStatus();
      if (scalperStatus && scalperStatus.allTrades) {
        fs.writeFileSync(path.join(CANVAS_DIR, "all-scalper-trades-data.json"), JSON.stringify(scalperStatus.allTrades, null, 2));
      }
    } catch (dbErr) {
      const fallbackConfig = path.join(DATA_DIR, "ig-scalper-config.json");
      if (fs.existsSync(fallbackConfig)) fs.writeFileSync(path.join(CANVAS_DIR, "ig-scalper-config-snapshot.json"), fs.readFileSync(fallbackConfig));
      const fallbackTrades = path.join(DATA_DIR, "ig-scalper-trades.json");
      if (fs.existsSync(fallbackTrades)) fs.writeFileSync(path.join(CANVAS_DIR, "all-scalper-trades-data.json"), fs.readFileSync(fallbackTrades));
    }
    writeDashboardSnapshot();
    console.log("[ceo-proxy] Config snapshots written to canvas");
  } catch (e) {
    console.error("[ceo-proxy] Snapshot write error:", e.message);
  }
}

let _snapshotAccountCache = null;
let _snapshotAccountCacheTs = 0;
let _snapshotAccountProfile = null;

async function fetchAccountForSnapshot() {
  const ic = loadIgConfig();
  const profileId = (ic && ic.activeProfile) || "demo";
  if (_snapshotAccountCache && _snapshotAccountProfile === profileId && Date.now() - _snapshotAccountCacheTs < 60000) return _snapshotAccountCache;
  try {
    const session = await igAuth();
    const r = await igRequest("GET", "/accounts", igHeaders(session));
    if (r.status === 200) {
      const data = safeParseIgBody(r.body);
      if (data && data.accounts) {
        const profiles = (ic && ic.profiles) || {};
        const prof = profiles[profileId] || {};
        const targetAccountId = prof.accountId || process.env.IG_ACCOUNT_ID || "Z3MJKY";
        const acct = data.accounts.find(a => a.accountId === targetAccountId) || data.accounts[0];
        if (acct) {
          _snapshotAccountCache = {
            accountId: acct.accountId,
            accountName: acct.accountName,
            accountType: acct.accountType,
            currency: acct.currency,
            balance: acct.balance ? acct.balance.balance : null,
            available: acct.balance ? acct.balance.available : null,
            deposit: acct.balance ? acct.balance.deposit : null,
            profitLoss: acct.balance ? acct.balance.profitLoss : null,
          };
          _snapshotAccountCacheTs = Date.now();
          _snapshotAccountProfile = profileId;
          return _snapshotAccountCache;
        }
      }
    }
  } catch (_) {}
  return _snapshotAccountCache;
}

function writeDashboardSnapshot() {
  writeDashboardSnapshotAsync().catch(e => console.error("[ceo-proxy] Dashboard snapshot error:", e.message));
}

async function writeDashboardSnapshotAsync() {
  if (!fs.existsSync(CANVAS_DIR)) fs.mkdirSync(CANVAS_DIR, { recursive: true });
  const prices = {};
  for (const [epic, data] of streamedPrices) {
    if (epic === "__ACCOUNT__") continue;
    prices[epic] = { bid: data.bid, offer: data.offer, mid: data.mid, status: data.marketState, timestamp: data.timestamp };
  }
  let scalperStatus;
  try { scalperStatus = await scalperEngine.getStatus(); } catch (_) { scalperStatus = {}; }
  let activeProfile = "unknown";
  try { const ic = loadIgConfig(); activeProfile = (ic && ic.activeProfile) || "unknown"; } catch (_) {}

  const acctData = await fetchAccountForSnapshot();

  const snapshot = {
    timestamp: new Date().toISOString(),
    account: {
      profile: activeProfile,
      accountId: acctData ? acctData.accountId : (process.env.IG_ACCOUNT_ID || "Z3MJKY"),
      accountType: acctData ? acctData.accountType : null,
      currency: acctData ? acctData.currency : null,
      balance: acctData ? acctData.balance : null,
      available: acctData ? acctData.available : null,
      deposit: acctData ? acctData.deposit : null,
      pnl: acctData ? acctData.profitLoss : null,
      source: activeProfile + "-rest-api",
    },
    streaming: {
      status: lsStatus,
      method: lsConnectedEpics.length > 0 ? "LIGHTSTREAMER" : (lsHybridPollingTimer ? "REST_POLLING" : "DISCONNECTED"),
      connectedEpics: lsConnectedEpics,
      priceCount: streamedPrices.size - (streamedPrices.has("__ACCOUNT__") ? 1 : 0),
    },
    prices,
    scalper: {
      running: scalperStatus.running,
      enabled: scalperStatus.enabled,
      realizedPnl: scalperStatus.realizedPnl,
      unrealizedPnl: scalperStatus.unrealizedPnl,
      tradeCount: scalperStatus.tradeCount,
      winCount: scalperStatus.winCount,
      lossCount: scalperStatus.lossCount,
      winRate: scalperStatus.winRate,
      openPositions: scalperStatus.openPositions,
      positions: scalperStatus.positions,
      drawdownTripped: scalperStatus.drawdownTripped,
      strategies: scalperStatus.strategies,
    },
  };
  fs.writeFileSync(path.join(CANVAS_DIR, "ig-dashboard-snapshot.json"), JSON.stringify(snapshot, null, 2));
}

// === Bot Process Manager ===

function loadBotRegistry() {
  try {
    if (fs.existsSync(BOT_REGISTRY_FILE)) return JSON.parse(fs.readFileSync(BOT_REGISTRY_FILE, "utf8"));
  } catch (_) {}
  return [];
}

function saveBotRegistry(registry) {
  fs.writeFileSync(BOT_REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

function spawnBot(bot) {
  if (botProcesses.has(bot.id) && botProcesses.get(bot.id).proc && !botProcesses.get(bot.id).proc.killed) {
    return;
  }
  const parts = bot.cmd.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  console.log("[bot-mgr] Starting bot:", bot.id, "cmd:", bot.cmd);
  const proc = spawn(cmd, args, {
    cwd: OPENCLAW_HOME,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...(bot.env || {}) },
    detached: false,
  });
  const entry = { proc, bot, restarts: 0, lastStart: Date.now(), backoff: 5000 };
  botProcesses.set(bot.id, entry);
  proc.stdout.on("data", (d) => process.stdout.write(`[${bot.id}] ${d}`));
  proc.stderr.on("data", (d) => process.stderr.write(`[${bot.id}] ${d}`));
  proc.on("exit", (code) => {
    console.log(`[bot-mgr] Bot ${bot.id} exited with code ${code}`);
    const registry = loadBotRegistry();
    const current = registry.find(b => b.id === bot.id);
    if (!current || !current.enabled) {
      botProcesses.delete(bot.id);
      return;
    }
    const e = botProcesses.get(bot.id);
    if (!e) return;
    e.restarts++;
    const delay = Math.min(e.backoff * Math.pow(2, Math.min(e.restarts - 1, 4)), 60000);
    console.log(`[bot-mgr] Restarting ${bot.id} in ${delay}ms (restart #${e.restarts})`);
    setTimeout(() => {
      const reg = loadBotRegistry();
      const b = reg.find(r => r.id === bot.id);
      if (b && b.enabled) spawnBot(b);
    }, delay);
  });
}

function stopBot(botId) {
  const entry = botProcesses.get(botId);
  if (!entry || !entry.proc) return;
  try {
    entry.proc.kill("SIGTERM");
    setTimeout(() => {
      try { if (!entry.proc.killed) entry.proc.kill("SIGKILL"); } catch (_) {}
    }, 3000);
  } catch (_) {}
  botProcesses.delete(botId);
}

function startRegisteredBots() {
  const registry = loadBotRegistry();
  for (const bot of registry) {
    if (bot.enabled) {
      spawnBot(bot);
    }
  }
  if (registry.length > 0) console.log(`[bot-mgr] Started ${registry.filter(b => b.enabled).length}/${registry.length} registered bots`);
}

const BOTS_DIR = path.join(process.cwd(), "skills", "bots");

function autoRegisterBotScripts() {
  if (!fs.existsSync(BOTS_DIR)) { try { fs.mkdirSync(BOTS_DIR, { recursive: true }); } catch (_) {} return; }
  const registry = loadBotRegistry();
  const newBots = [];
  try {
    const SKIP_BOTS = new Set(["ig-scalper-engine", "ig-scalper-db", "ig-scalper-backtest", "trade-claw-engine", "indicators", "clawscript-runner"]);
    const files = fs.readdirSync(BOTS_DIR).filter(f => f.endsWith(".cjs") && !SKIP_BOTS.has(f.replace(/\.cjs$/, "")));
    for (const file of files) {
      const id = file.replace(/\.cjs$/, "");
      if (registry.find(b => b.id === id)) continue;
      const relPath = `skills/bots/${file}`;
      const bot = { id, cmd: `node ${relPath}`, enabled: true, addedBy: "auto-scan", addedAt: new Date().toISOString() };
      registry.push(bot);
      newBots.push(bot);
      console.log(`[bot-mgr] Auto-registered bot: ${id}`);
    }
  } catch (e) {
    console.error(`[bot-mgr] Error scanning ${BOTS_DIR}:`, e.message);
  }
  if (newBots.length > 0) {
    saveBotRegistry(registry);
    for (const bot of newBots) spawnBot(bot);
  }
}

async function handleBotsApi(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });

  if (req.method === "GET" && p === "/api/bots") {
    const registry = loadBotRegistry();
    const bots = registry.map(b => {
      const entry = botProcesses.get(b.id);
      const running = !!(entry && entry.proc && !entry.proc.killed);
      return {
        id: b.id,
        cmd: b.cmd,
        enabled: b.enabled,
        running,
        pid: running ? entry.proc.pid : null,
        restarts: entry ? entry.restarts : 0,
        addedBy: b.addedBy || "unknown",
        addedAt: b.addedAt || null,
      };
    });
    return json(res, 200, { bots });
  }

  if (req.method === "POST" && p === "/api/bots/register") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    if (!body.id || !body.cmd) return json(res, 400, { error: "id and cmd required" });
    const registry = loadBotRegistry();
    const existing = registry.find(b => b.id === body.id);
    if (existing) {
      existing.cmd = body.cmd;
      existing.enabled = true;
    } else {
      registry.push({ id: body.id, cmd: body.cmd, enabled: true, addedBy: body.addedBy || "api", addedAt: new Date().toISOString() });
    }
    saveBotRegistry(registry);
    const bot = registry.find(b => b.id === body.id);
    spawnBot(bot);
    return json(res, 200, { ok: true, bot });
  }

  const idMatch = p.match(/^\/api\/bots\/([^/]+)\/?(start|stop)?$/);
  if (idMatch) {
    const botId = decodeURIComponent(idMatch[1]);
    const action = idMatch[2];

    if (req.method === "DELETE" && !action) {
      stopBot(botId);
      const registry = loadBotRegistry().filter(b => b.id !== botId);
      saveBotRegistry(registry);
      return json(res, 200, { ok: true, removed: botId });
    }

    if (req.method === "PATCH" && !action) {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === botId);
      if (!bot) return json(res, 404, { error: "Bot not found in registry" });
      if (typeof body.enabled === "boolean") bot.enabled = body.enabled;
      saveBotRegistry(registry);
      return json(res, 200, { ok: true, id: botId, enabled: bot.enabled });
    }

    if (req.method === "POST" && action === "start") {
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === botId);
      if (!bot) return json(res, 404, { error: "Bot not found in registry" });
      bot.enabled = true;
      saveBotRegistry(registry);
      spawnBot(bot);
      return json(res, 200, { ok: true, started: botId });
    }

    if (req.method === "POST" && action === "stop") {
      stopBot(botId);
      const registry = loadBotRegistry();
      const bot = registry.find(b => b.id === botId);
      if (bot) { bot.enabled = false; saveBotRegistry(registry); }
      return json(res, 200, { ok: true, stopped: botId });
    }
  }

  return json(res, 404, { error: "Not found" });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
};

let gatewayWs = null;
let gwReqCounter = 0;
let gwSessionKey = null;
let gwWebchatSessionKey = null;
let lastUserSessionKey = null;
const pendingAgentChats = new Map();

let gwConnecting = false;
function connectGateway() {
  if (gwConnecting) return;
  if (gatewayWs && gatewayWs.readyState === WebSocket.OPEN) return;
  gwConnecting = true;
  try {
    const ws = new WebSocket(`ws://127.0.0.1:${GATEWAY_PORT}`, {
      headers: { origin: "http://127.0.0.1:5000" },
    });
    ws.on("open", () => {
      const connectFrame = {
        type: "req", id: "gw-connect-" + Date.now(), method: "connect",
        params: {
          minProtocol: 3, maxProtocol: 3,
          client: { id: "openclaw-control-ui", mode: "webchat", version: "dev", platform: "linux" },
          auth: { token: GATEWAY_TOKEN },
          role: "operator",
          scopes: ["operator.admin"],
        },
      };
      ws.send(JSON.stringify(connectFrame));
      console.log("[ceo-proxy] Gateway WebSocket connected");
    });
    const processedRunIds = {};
    const lastAutoDispatch = {};
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "res" && msg.id && msg.id.startsWith("gw-connect-")) {
          console.log("[ceo-proxy] Gateway connect response:", JSON.stringify(msg).slice(0, 300));
          if (msg.ok !== false && msg.payload) {
            const snap = msg.payload.snapshot?.sessionDefaults;
            gwSessionKey = (snap && snap.mainSessionKey) || msg.payload.sessionKey || "agent:main:main";
            console.log("[ceo-proxy] Gateway session:", gwSessionKey);
            resolveWebchatSessionKey();
          }
        }
        if (msg.type === "res" && msg.id && msg.id.startsWith("gw-inject-")) {
          if (msg.ok === false) {
            console.error("[ceo-proxy] Gateway inject FAILED:", JSON.stringify(msg).slice(0, 500));
          } else {
            console.log("[ceo-proxy] Gateway inject OK:", msg.id);
          }
        }
        if (msg.type === "res" && msg.id && msg.id.startsWith("agent-chat-")) {
          const pending = pendingAgentChats.get(msg.id);
          if (pending) {
            if (msg.ok === false) {
              pending.reject(new Error(msg.errorMessage || "chat.send failed"));
              pendingAgentChats.delete(msg.id);
            } else {
              pending.sendAcked = true;
              if (msg.payload && msg.payload.runId) {
                pending.runId = msg.payload.runId;
              }
            }
          }
        }
        if (msg.type === "event" && msg.event === "chat" && msg.payload) {
          const pm = msg.payload.message;
          const runId = msg.payload.runId || "";
          const evtSessionKey = msg.payload.sessionKey || "";
          if (evtSessionKey && evtSessionKey.includes(":webchat:")) {
            gwWebchatSessionKey = evtSessionKey;
          }
          if (evtSessionKey && pm && (pm.role === "user" || pm.role === "assistant")) {
            const prev = lastUserSessionKey;
            lastUserSessionKey = evtSessionKey;
            if (prev !== evtSessionKey) {
              console.log("[ceo-proxy] Active session tracked:", evtSessionKey, "(was:", prev, ")");
            }
          }

          if (pm && pm.role === "assistant" && msg.payload.state === "final" && pm.content) {
            let fullText = "";
            for (const part of pm.content) {
              if (part.type === "text" && part.text) fullText += part.text;
            }
            for (const [reqId, pending] of pendingAgentChats) {
              if (!pending.sendAcked || pending.resolved) continue;
              if (pending.runId && pending.runId !== runId) continue;
              pending.resolved = true;
              pending.resolve(fullText);
              pendingAgentChats.delete(reqId);
              break;
            }
          }

          if (pm && pm.role === "user" && msg.payload.state === "final" && pm.content) {
            const msgId = runId || (pm.id || "");
            if (msgId && !processedRunIds["user-" + msgId]) {
              if (msgId) processedRunIds["user-" + msgId] = true;
              let userText = "";
              for (const part of pm.content) {
                if (part.type === "text" && part.text) userText += part.text;
              }
              const userMentions = userText.match(/@(\S+)/g);
              if (userMentions) {
                for (const mention of userMentions) {
                  const targetName = mention.slice(1);
                  const target = findTargetByName(targetName);
                  if (!target) continue;
                  const nameEsc = target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                  const bodyMatch = userText.match(new RegExp("@" + nameEsc + "\\s+([\\s\\S]+)", "i"));
                  const body = bodyMatch ? bodyMatch[1].trim() : userText;
                  console.log(`[ceo-proxy] User directly @mentioned ${target.type} ${target.name} - dispatching`);
                  dispatchToTarget(target, body, "User");
                  injectToGateway("User → " + target.name, body, evtSessionKey || undefined);
                }
              }
            }
          }

          if (!runId || processedRunIds[runId]) return;
          if (runId.startsWith("inject-")) return;
          if (!pm || !pm.content || !pm.content.length) return;
          if (msg.payload.state !== "final") return;
          processedRunIds[runId] = true;

          const sessionKey = msg.payload.sessionKey || "";
          const skParts = sessionKey.split(":");
          if (skParts.length < 2 || skParts[0] !== "agent") return;
          const agentId = skParts[1];
          const senderLabel = agentId.toUpperCase();

          for (const part of pm.content) {
            if (part.type !== "text" || !part.text) continue;
            const text = part.text;
            const mentions = text.match(/@(\S+)/g);
            if (!mentions) continue;
            for (const mention of mentions) {
              const targetName = mention.slice(1);
              if (targetName.toLowerCase() === agentId.toLowerCase()) continue;
              const target = findTargetByName(targetName);
              if (!target) continue;
              if (target.type === "agent" && target.agent.id.toLowerCase() === agentId.toLowerCase()) continue;
              const now = Date.now();
              const dispatchKey = senderLabel + ">" + target.name;
              if (lastAutoDispatch[dispatchKey] && now - lastAutoDispatch[dispatchKey] < 30000) {
                console.log("[ceo-proxy] Skipping auto-dispatch", dispatchKey, "(cooldown)");
                continue;
              }
              lastAutoDispatch[dispatchKey] = now;
              const nameEsc = target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const bodyMatch = text.match(new RegExp("@" + nameEsc + "\\s+([\\s\\S]+)", "i"));
              const body = bodyMatch ? bodyMatch[1].trim() : text;
              console.log(`[ceo-proxy] Agent ${senderLabel} @mentioned ${target.type} ${target.name} - dispatching`);
              dispatchToTarget(target, body, senderLabel);
              injectToGateway(senderLabel + " → " + target.name, body, evtSessionKey || undefined);
            }
          }
        }
      } catch {}
    });
    ws.on("close", () => {
      gatewayWs = null;
      gwConnecting = false;
      for (const [reqId, pending] of pendingAgentChats) {
        if (!pending.resolved) {
          pending.resolved = true;
          pending.reject(new Error("Gateway disconnected"));
        }
      }
      pendingAgentChats.clear();
      setTimeout(connectGateway, 5000);
    });
    ws.on("error", () => {
      gatewayWs = null;
      gwConnecting = false;
      for (const [reqId, pending] of pendingAgentChats) {
        if (!pending.resolved) {
          pending.resolved = true;
          pending.reject(new Error("Gateway connection error"));
        }
      }
      pendingAgentChats.clear();
      setTimeout(connectGateway, 5000);
    });
    gatewayWs = ws;
  } catch {
    gwConnecting = false;
    setTimeout(connectGateway, 5000);
  }
}

function resolveWebchatSessionKey() {
  try {
    const agentId = (gwSessionKey || "agent:ceo:main").split(":")[1] || "ceo";
    const sessFile = path.join(DATA_DIR, "agents", agentId, "sessions", "sessions.json");
    if (fs.existsSync(sessFile)) {
      const sessData = JSON.parse(fs.readFileSync(sessFile, "utf8"));
      const webchatKey = "agent:" + agentId + ":webchat:main";
      if (sessData[webchatKey]) {
        gwWebchatSessionKey = webchatKey;
        console.log("[ceo-proxy] Webchat session key:", gwWebchatSessionKey);
      }
    }
  } catch {}
}

function getActiveSessionKey() {
  if (lastUserSessionKey) return lastUserSessionKey;
  return gwWebchatSessionKey || gwSessionKey || "agent:ceo:main";
}

function injectToGateway(label, message, targetSession) {
  if (!gatewayWs || gatewayWs.readyState !== WebSocket.OPEN) {
    console.log("[ceo-proxy] No gateway WS for inject");
    return;
  }
  const sessionKey = targetSession || getActiveSessionKey();
  const id = "gw-inject-" + (++gwReqCounter) + "-" + Date.now();
  const frame = {
    type: "req", id, method: "chat.inject",
    params: { sessionKey, message, label },
  };
  gatewayWs.send(JSON.stringify(frame));
  console.log("[ceo-proxy] Injected to gateway chat (session:" + sessionKey + "):", label, message.slice(0, 60));
}

setTimeout(connectGateway, 3000);

fs.mkdirSync(EXCHANGE_DIR, { recursive: true });
fs.mkdirSync(SHAREDSPACE_DIR, { recursive: true });

if (!fs.existsSync(API_KEYS_FILE)) {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify({ keys: [] }, null, 2));
}
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [], results: [] }, null, 2));
}
if (!fs.existsSync(CHAT_FILE)) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify({ messages: [] }, null, 2));
}
if (!fs.existsSync(BEES_FILE)) {
  fs.writeFileSync(BEES_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), bees: [] }, null, 2));
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { return fallback; }
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const workers = new Map();

function updateBeesFile() {
  const list = [];
  for (const [id, w] of workers) {
    list.push({
      id,
      name: w.name,
      apiKeyId: w.apiKeyId,
      platform: w.platform,
      version: w.version,
      status: Date.now() - w.lastSeen < 60000 ? "online" : "stale",
      lastSeen: new Date(w.lastSeen).toISOString(),
      connectedAt: new Date(w.connectedAt).toISOString(),
    });
  }
  saveJson(BEES_FILE, { updatedAt: new Date().toISOString(), bees: list });
}

const CREW_FILE = path.join(DATA_DIR, "workspace", "CREW.md");

function updateCrewFile() {
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  let md = "# Connected Worker Bees\n\n";
  md += `**Last Updated:** ${ts}\n\n`;
  const bees = [];
  for (const [id, w] of workers) {
    const online = Date.now() - w.lastSeen < 60000;
    const lastSeen = new Date(w.lastSeen).toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const connectedAt = new Date(w.connectedAt).toISOString().replace("T", " ").slice(0, 19) + " UTC";
    bees.push({ name: w.name, platform: w.platform, online, lastSeen, connectedAt });
  }
  if (bees.length === 0) {
    md += "No worker bees currently connected.\n";
  } else {
    md += `| Worker | Status | Platform | Connected Since | Last Seen |\n`;
    md += `|--------|--------|----------|-----------------|-----------|\n`;
    for (const b of bees) {
      const status = b.online ? "ONLINE" : "STALE";
      md += `| ${b.name} | ${status} | ${b.platform} | ${b.connectedAt} | ${b.lastSeen} |\n`;
    }
    md += `\n**Total:** ${bees.length} worker(s), ${bees.filter(b => b.online).length} online\n`;
  }
  try {
    fs.mkdirSync(path.dirname(CREW_FILE), { recursive: true });
    fs.writeFileSync(CREW_FILE, md);
  } catch {}
}

function findWorkerByName(name) {
  const lower = name.toLowerCase();
  for (const [id, w] of workers) {
    if (w.name.toLowerCase() === lower) return { id, worker: w };
  }
  return null;
}

function findAgentById(name) {
  try {
    const cfg = loadJson(path.join(DATA_DIR, "openclaw.json"), {});
    const list = cfg.agents?.list || [];
    const lower = name.toLowerCase();
    for (const a of list) {
      if (a.id.toLowerCase() === lower) return a;
      if (a.identity?.name?.toLowerCase() === lower) return a;
    }
  } catch {}
  return null;
}

function findTargetByName(name) {
  const worker = findWorkerByName(name);
  if (worker) return { type: "worker", id: worker.id, worker: worker.worker, name: worker.worker.name };
  const agent = findAgentById(name);
  if (agent) return { type: "agent", agent, name: agent.identity?.name || agent.id };
  return null;
}

function dispatchToTarget(target, body, senderName) {
  if (target.type === "worker") {
    const task = {
      id: crypto.randomUUID(),
      assignedTo: target.id,
      type: "message",
      message: "@" + senderName + ": " + body,
      filePath: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
    };
    const taskData = loadJson(TASKS_FILE, { tasks: [], results: [] });
    taskData.tasks.push(task);
    saveJson(TASKS_FILE, taskData);
    console.log(`[ceo-proxy] Dispatched task to worker ${target.name} from ${senderName}, taskId: ${task.id}`);
    return true;
  }
  if (target.type === "agent") {
    const agentSession = "agent:" + target.agent.id.toLowerCase() + ":main";
    if (!gatewayWs || gatewayWs.readyState !== WebSocket.OPEN) return false;
    const id = "gw-inject-" + (++gwReqCounter) + "-" + Date.now();
    const frame = {
      type: "req", id, method: "chat.inject",
      params: { sessionKey: agentSession, message: body, label: senderName },
    };
    gatewayWs.send(JSON.stringify(frame));
    console.log(`[ceo-proxy] Injected message to agent ${target.agent.id} session from ${senderName}`);
    return true;
  }
  return false;
}

function routeAtMentions(text, senderName) {
  const mentions = text.match(/@(\S+)/g);
  if (!mentions) return;
  for (const mention of mentions) {
    const targetName = mention.slice(1);
    if (targetName.toLowerCase() === senderName.toLowerCase()) continue;
    if (targetName.toLowerCase() === "ceo") {
      const bodyMatch = text.match(/@CEO\s+([\s\S]+)/i);
      const body = bodyMatch ? bodyMatch[1].trim() : text;
      console.log(`[ceo-proxy] "${senderName}" @CEO - injecting to gateway`);
      injectToGateway(senderName + " → CEO", body);
      continue;
    }
    const target = findTargetByName(targetName);
    if (!target) continue;
    const nameEsc = target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const bodyMatch = text.match(new RegExp("@" + nameEsc + "\\s+([\\s\\S]+)", "i"));
    const body = bodyMatch ? bodyMatch[1].trim() : text;
    console.log(`[ceo-proxy] "${senderName}" -> @${target.name} - dispatching`);
    dispatchToTarget(target, body, senderName);
    injectToGateway(senderName + " → " + target.name, body);
  }
}

function authGateway(req) {
  const h = req.headers["authorization"];
  if (h && h.replace(/^Bearer\s+/i, "") === GATEWAY_TOKEN) return true;
  const url = new URL(req.url, "http://localhost");
  const qToken = url.searchParams.get("_token");
  if (qToken && qToken === GATEWAY_TOKEN) return true;
  return false;
}

function authWorker(req) {
  let tok = null;
  const h = req.headers["authorization"];
  if (h) {
    tok = h.replace(/^Bearer\s+/i, "");
  }
  if (!tok) {
    const u = new URL(req.url, "http://localhost");
    tok = u.searchParams.get("apiKey") || u.searchParams.get("apikey") || u.searchParams.get("key");
  }
  if (!tok) return null;
  const data = loadJson(API_KEYS_FILE, { keys: [] });
  return data.keys.find((k) => k.key === tok && k.active) || null;
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function handleApiKeys(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
  const data = loadJson(API_KEYS_FILE, { keys: [] });

  if (req.method === "GET" && p === "/api/keys") {
    return json(res, 200, {
      keys: data.keys.map((k) => ({
        id: k.id, name: k.name, created: k.created,
        lastUsed: k.lastUsed, active: k.active,
        keyPreview: k.key.slice(0, 8) + "..." + k.key.slice(-4),
      })),
    });
  }

  if (req.method === "POST" && p === "/api/keys") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const entry = {
      id: crypto.randomUUID(),
      name: body.name || "Worker " + Date.now(),
      key: "ocw_" + crypto.randomBytes(32).toString("hex"),
      created: new Date().toISOString(),
      lastUsed: null,
      active: true,
    };
    data.keys.push(entry);
    saveJson(API_KEYS_FILE, data);
    return json(res, 201, { id: entry.id, name: entry.name, key: entry.key, created: entry.created });
  }

  if (req.method === "POST" && p.match(/^\/api\/keys\/[^/]+\/reveal$/)) {
    const id = p.split("/")[3];
    const k = data.keys.find((x) => x.id === id);
    return k ? json(res, 200, { key: k.key }) : json(res, 404, { error: "Not found" });
  }

  if (req.method === "DELETE" && p.match(/^\/api\/keys\/[^/]+$/)) {
    const id = p.split("/")[3];
    const idx = data.keys.findIndex((x) => x.id === id);
    if (idx === -1) return json(res, 404, { error: "Not found" });
    data.keys.splice(idx, 1);
    saveJson(API_KEYS_FILE, data);
    return json(res, 200, { ok: true });
  }

  if (req.method === "PUT" && p.match(/^\/api\/keys\/[^/]+\/toggle$/)) {
    const id = p.split("/")[3];
    const k = data.keys.find((x) => x.id === id);
    if (!k) return json(res, 404, { error: "Not found" });
    k.active = !k.active;
    saveJson(API_KEYS_FILE, data);
    return json(res, 200, { id: k.id, active: k.active });
  }

  return json(res, 404, { error: "Not found" });
}

async function handleWorkers(req, res, p) {
  if (req.method === "GET" && p === "/api/workers") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    const list = [];
    for (const [id, w] of workers) {
      list.push({
        id, name: w.name, agentId: w.agentId, platform: w.platform,
        version: w.version,
        status: Date.now() - w.lastSeen < 60000 ? "online" : "stale",
        lastSeen: new Date(w.lastSeen).toISOString(),
        connectedAt: new Date(w.connectedAt).toISOString(),
      });
    }
    return json(res, 200, { workers: list });
  }

  if (req.method === "POST" && p === "/api/workers/register") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const workerName = body.name || apiKey.name;
    let wid = null;
    for (const [id, w] of workers) {
      if (w.name.toLowerCase() === workerName.toLowerCase() && w.apiKeyId === apiKey.id) {
        wid = id;
        break;
      }
    }
    if (!wid) {
      wid = "w-" + crypto.randomUUID().slice(0, 8) + "-" + Date.now();
    }
    workers.set(wid, {
      name: workerName,
      apiKeyId: apiKey.id,
      agentId: body.agentId || "default",
      platform: body.platform || "unknown",
      version: body.version || "unknown",
      lastSeen: Date.now(),
      connectedAt: workers.has(wid) ? workers.get(wid).connectedAt : Date.now(),
    });
    const data = loadJson(API_KEYS_FILE, { keys: [] });
    const k = data.keys.find((x) => x.id === apiKey.id);
    if (k) { k.lastUsed = new Date().toISOString(); saveJson(API_KEYS_FILE, data); }
    updateBeesFile();
    updateCrewFile();
    return json(res, 200, { workerId: wid, status: "registered" });
  }

  if (req.method === "POST" && p === "/api/workers/heartbeat") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    const url2 = new URL(req.url, "http://localhost");
    const hbWorkerId = url2.searchParams.get("workerId");
    if (hbWorkerId && workers.has(hbWorkerId)) {
      workers.get(hbWorkerId).lastSeen = Date.now();
    } else {
      for (const [id, w] of workers) {
        if (w.apiKeyId === apiKey.id) w.lastSeen = Date.now();
      }
    }
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET" && p === "/api/workers/poll") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    const url2 = new URL(req.url, "http://localhost");
    const pollWorkerId = url2.searchParams.get("workerId");
    if (pollWorkerId && workers.has(pollWorkerId)) {
      workers.get(pollWorkerId).lastSeen = Date.now();
    } else {
      for (const [id, w] of workers) {
        if (w.apiKeyId === apiKey.id) w.lastSeen = Date.now();
      }
    }
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    let pending;
    if (pollWorkerId) {
      pending = data.tasks.filter((t) => t.assignedTo === pollWorkerId && t.status === "pending");
    } else {
      const myWorkerIds = [];
      for (const [id, w] of workers) {
        if (w.apiKeyId === apiKey.id) myWorkerIds.push(id);
      }
      pending = data.tasks.filter((t) => myWorkerIds.includes(t.assignedTo) && t.status === "pending");
    }
    return json(res, 200, { tasks: pending });
  }

  if (req.method === "POST" && p === "/api/workers/result") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    const task = data.tasks.find((t) => t.id === body.taskId);
    if (task) {
      task.status = "completed";
      task.result = body.result || "";
      task.completedAt = new Date().toISOString();
    }
    if (!data.results) data.results = [];
    const submitterId = body.workerId || null;
    data.results.push({
      taskId: body.taskId, workerId: submitterId || apiKey.id,
      result: body.result || "", completedAt: new Date().toISOString(),
    });
    saveJson(TASKS_FILE, data);

    let workerName = apiKey.name;
    if (submitterId && workers.has(submitterId)) {
      workerName = workers.get(submitterId).name;
    } else {
      for (const [id, w] of workers) {
        if (w.apiKeyId === apiKey.id) { workerName = w.name; break; }
      }
    }
    const resultText = body.result || "";
    if (resultText) {
      const chatData = loadJson(CHAT_FILE, { messages: [] });
      chatData.messages.push({
        id: crypto.randomUUID(),
        from: workerName,
        role: "worker",
        text: resultText,
        ts: new Date().toISOString(),
      });
      if (chatData.messages.length > 500) chatData.messages = chatData.messages.slice(-500);
      saveJson(CHAT_FILE, chatData);
      console.log(`[ceo-proxy] Worker "${workerName}" result auto-posted to chat`);
      injectToGateway(workerName, resultText);

      routeAtMentions(resultText, workerName);
    }

    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE" && p.match(/^\/api\/workers\/[^/]+$/)) {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    const wid = p.split("/")[3];
    if (workers.has(wid)) {
      workers.delete(wid);
      updateBeesFile();
      updateCrewFile();
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: "Worker not found" });
  }

  if (req.method === "GET" && p === "/api/workers/available") {
    const isGw = authGateway(req);
    const apiKey = authWorker(req);
    if (!isGw && !apiKey) return json(res, 401, { error: "Unauthorized" });
    const list = [];
    for (const [id, w] of workers) {
      list.push({
        id, name: w.name, platform: w.platform,
        status: Date.now() - w.lastSeen < 60000 ? "online" : "stale",
      });
    }
    return json(res, 200, { bees: list, count: list.length });
  }

  return json(res, 404, { error: "Not found" });
}

async function handleTasks(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });

  if (req.method === "GET" && p === "/api/tasks") {
    return json(res, 200, loadJson(TASKS_FILE, { tasks: [], results: [] }));
  }

  if (req.method === "POST" && p === "/api/tasks") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const task = {
      id: crypto.randomUUID(),
      assignedTo: body.workerId,
      type: body.type || "message",
      message: body.message || "",
      filePath: body.filePath || null,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
    };
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    data.tasks.push(task);
    saveJson(TASKS_FILE, data);
    return json(res, 201, task);
  }

  if (req.method === "DELETE" && p === "/api/tasks") {
    saveJson(TASKS_FILE, { tasks: [], results: [] });
    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE" && p.match(/^\/api\/tasks\/[^/]+$/)) {
    const id = p.split("/")[3];
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    data.tasks = data.tasks.filter((t) => t.id !== id);
    saveJson(TASKS_FILE, data);
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: "Not found" });
}

async function handleExchange(req, res, p) {
  if (req.method === "GET" && p === "/api/exchange") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    const files = [];
    function walk(dir, prefix) {
      try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const rel = prefix ? prefix + "/" + e.name : e.name;
          if (e.isDirectory()) walk(path.join(dir, e.name), rel);
          else {
            const st = fs.statSync(path.join(dir, e.name));
            files.push({ name: rel, size: st.size, modified: st.mtime.toISOString() });
          }
        }
      } catch {}
    }
    walk(EXCHANGE_DIR, "");
    return json(res, 200, { files });
  }

  if (req.method === "GET" && p.startsWith("/api/exchange/download/")) {
    const fp = path.normalize(decodeURIComponent(p.slice("/api/exchange/download/".length)));
    const full = path.resolve(EXCHANGE_DIR, fp);
    if (!full.startsWith(EXCHANGE_DIR)) return json(res, 403, { error: "Forbidden" });
    try {
      const d = fs.readFileSync(full);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(fp)}"`,
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(d);
    } catch { return json(res, 404, { error: "File not found" }); }
  }

  if (req.method === "POST" && p === "/api/exchange/upload") {
    const apiKey = authWorker(req);
    const isGw = authGateway(req);
    if (!apiKey && !isGw) return json(res, 401, { error: "Unauthorized" });
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    const fn = path.normalize(body.fileName || "upload-" + Date.now() + ".txt");
    const target = path.resolve(EXCHANGE_DIR, fn);
    if (!target.startsWith(EXCHANGE_DIR)) return json(res, 403, { error: "Forbidden" });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (body.encoding === "base64") fs.writeFileSync(target, Buffer.from(body.content, "base64"));
    else fs.writeFileSync(target, body.content || "", "utf-8");
    return json(res, 201, { ok: true, fileName: fn, size: fs.statSync(target).size });
  }

  if (req.method === "DELETE" && p.startsWith("/api/exchange/")) {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    const fp = path.normalize(decodeURIComponent(p.slice("/api/exchange/".length)));
    const full = path.resolve(EXCHANGE_DIR, fp);
    if (!full.startsWith(EXCHANGE_DIR)) return json(res, 403, { error: "Forbidden" });
    try { fs.unlinkSync(full); return json(res, 200, { ok: true }); }
    catch { return json(res, 404, { error: "File not found" }); }
  }

  return json(res, 404, { error: "Not found" });
}

function isInsideDir(fullPath, baseDir) {
  const rel = path.relative(baseDir, fullPath);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

async function handleSharedspace(req, res, p) {
  if (req.method === "GET" && p.startsWith("/api/sharedspace/download/")) {
    const fp = path.normalize(decodeURIComponent(p.slice("/api/sharedspace/download/".length)));
    const full = path.resolve(SHAREDSPACE_DIR, fp);
    if (!isInsideDir(full, SHAREDSPACE_DIR)) return json(res, 403, { error: "Forbidden" });
    try {
      const d = fs.readFileSync(full);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(fp)}"`,
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(d);
    } catch { return json(res, 404, { error: "File not found" }); }
  }

  const isGw = authGateway(req);
  const apiKey = authWorker(req);
  if (!isGw && !apiKey) {
    console.log("[ceo-proxy] sharedspace 401:", req.method, p, "auth:", req.headers["authorization"] ? "header-present" : "no-header");
    return json(res, 401, { error: "Unauthorized" });
  }

  if (req.method === "GET" && p === "/api/sharedspace") {
    const files = [];
    function walk(dir, prefix) {
      try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const rel = prefix ? prefix + "/" + e.name : e.name;
          if (e.isDirectory()) walk(path.join(dir, e.name), rel);
          else {
            const st = fs.statSync(path.join(dir, e.name));
            files.push({ name: rel, size: st.size, modified: st.mtime.toISOString() });
          }
        }
      } catch {}
    }
    walk(SHAREDSPACE_DIR, "");
    return json(res, 200, { files });
  }

  if (req.method === "GET" && p.startsWith("/api/sharedspace/read/")) {
    const fp = path.normalize(decodeURIComponent(p.slice("/api/sharedspace/read/".length)));
    const full = path.resolve(SHAREDSPACE_DIR, fp);
    if (!isInsideDir(full, SHAREDSPACE_DIR)) return json(res, 403, { error: "Forbidden" });
    try {
      const buf = fs.readFileSync(full);
      let isText = true;
      for (let i = 0; i < Math.min(buf.length, 8192); i++) {
        if (buf[i] === 0) { isText = false; break; }
      }
      if (isText) {
        return json(res, 200, { path: fp, content: buf.toString("utf-8"), encoding: "utf-8" });
      } else {
        return json(res, 200, { path: fp, content: buf.toString("base64"), encoding: "base64" });
      }
    } catch { return json(res, 404, { error: "File not found" }); }
  }

  if (req.method === "POST" && p === "/api/sharedspace/write") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    if (!body.path) return json(res, 400, { error: "path is required" });
    const fp = path.normalize(body.path);
    const full = path.resolve(SHAREDSPACE_DIR, fp);
    if (!isInsideDir(full, SHAREDSPACE_DIR)) return json(res, 403, { error: "Forbidden" });
    fs.mkdirSync(path.dirname(full), { recursive: true });
    let content = body.content || "";
    if (typeof content === "object") content = JSON.stringify(content);
    if (body.encoding === "base64") {
      if (typeof body.content !== "string") return json(res, 400, { error: "base64 content must be a string" });
      fs.writeFileSync(full, Buffer.from(content, "base64"));
    } else {
      fs.writeFileSync(full, content, "utf-8");
    }
    return json(res, 201, { ok: true, path: fp, size: fs.statSync(full).size });
  }

  if (req.method === "POST" && p === "/api/sharedspace/mkdir") {
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    if (!body.path) return json(res, 400, { error: "path is required" });
    const fp = path.normalize(body.path);
    const full = path.resolve(SHAREDSPACE_DIR, fp);
    if (!isInsideDir(full, SHAREDSPACE_DIR)) return json(res, 403, { error: "Forbidden" });
    fs.mkdirSync(full, { recursive: true });
    return json(res, 201, { ok: true, path: fp });
  }

  if (req.method === "DELETE" && p.startsWith("/api/sharedspace/")) {
    const sub = p.slice("/api/sharedspace/".length);
    if (!sub || sub === "read" || sub === "write" || sub === "mkdir" || sub === "download") {
      return json(res, 400, { error: "Invalid path" });
    }
    const fp = path.normalize(decodeURIComponent(sub));
    const full = path.resolve(SHAREDSPACE_DIR, fp);
    if (!isInsideDir(full, SHAREDSPACE_DIR)) return json(res, 403, { error: "Forbidden" });
    try { fs.unlinkSync(full); return json(res, 200, { ok: true }); }
    catch { return json(res, 404, { error: "File not found" }); }
  }

  return json(res, 404, { error: "Not found" });
}

function getWorkspaceAgents() {
  const agents = [];
  try {
    for (const e of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
      if (e.isDirectory() && e.name === "workspace") {
        agents.push({ id: "ceo", name: "CEO", dir: path.join(DATA_DIR, "workspace") });
      } else if (e.isDirectory() && e.name.startsWith("workspace-")) {
        const agentId = e.name.slice("workspace-".length);
        agents.push({ id: agentId, name: agentId.toUpperCase(), dir: path.join(DATA_DIR, e.name) });
      }
    }
  } catch {}
  if (!agents.find(a => a.id === "ceo")) {
    fs.mkdirSync(path.join(DATA_DIR, "workspace"), { recursive: true });
    agents.unshift({ id: "ceo", name: "CEO", dir: path.join(DATA_DIR, "workspace") });
  }
  return agents;
}

function resolveAgentDir(agentId) {
  const agents = getWorkspaceAgents();
  const agent = agents.find(a => a.id === agentId);
  return agent ? agent.dir : null;
}

async function handleWorkspace(req, res, p) {
  if (req.method === "GET" && p === "/api/workspace/agents") {
    const agents = getWorkspaceAgents();
    return json(res, 200, { agents: agents.map(a => ({ id: a.id, name: a.name })) });
  }

  const dlMatch = p.match(/^\/api\/workspace\/([^/]+)\/download\/(.+)$/);
  if (req.method === "GET" && dlMatch) {
    const agentId = decodeURIComponent(dlMatch[1]);
    const filePath = decodeURIComponent(dlMatch[2]);
    const agentDir = resolveAgentDir(agentId);
    if (!agentDir) return json(res, 404, { error: "Agent not found" });
    const fp = path.normalize(filePath);
    const full = path.resolve(agentDir, fp);
    if (!isInsideDir(full, agentDir)) return json(res, 403, { error: "Forbidden" });
    try {
      const d = fs.readFileSync(full);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(fp)}"`,
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(d);
    } catch { return json(res, 404, { error: "File not found" }); }
  }

  const isGw = authGateway(req);
  const apiKey = authWorker(req);
  if (!isGw && !apiKey) {
    return json(res, 401, { error: "Unauthorized" });
  }

  const listMatch = p.match(/^\/api\/workspace\/([^/]+)$/);
  if (req.method === "GET" && listMatch) {
    const agentId = decodeURIComponent(listMatch[1]);
    const agentDir = resolveAgentDir(agentId);
    if (!agentDir) return json(res, 404, { error: "Agent not found" });
    const files = [];
    function walk(dir, prefix) {
      try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          if (e.name.startsWith(".")) continue;
          const rel = prefix ? prefix + "/" + e.name : e.name;
          if (e.isDirectory()) {
            files.push({ name: rel, size: 0, modified: "", isDir: true });
            walk(path.join(dir, e.name), rel);
          } else {
            const st = fs.statSync(path.join(dir, e.name));
            files.push({ name: rel, size: st.size, modified: st.mtime.toISOString(), isDir: false });
          }
        }
      } catch {}
    }
    walk(agentDir, "");
    return json(res, 200, { agent: agentId, files });
  }

  const uploadMatch = p.match(/^\/api\/workspace\/([^/]+)\/upload$/);
  if (req.method === "POST" && uploadMatch) {
    const agentId = decodeURIComponent(uploadMatch[1]);
    const agentDir = resolveAgentDir(agentId);
    if (!agentDir) return json(res, 404, { error: "Agent not found" });
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    const results = [];
    const items = Array.isArray(body) ? body : [body];
    for (const item of items) {
      if (!item.path) { results.push({ error: "path is required" }); continue; }
      const fp = path.normalize(item.path);
      const full = path.resolve(agentDir, fp);
      if (!isInsideDir(full, agentDir)) { results.push({ path: fp, error: "Forbidden" }); continue; }
      try {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        if (item.encoding === "base64") {
          fs.writeFileSync(full, Buffer.from(item.content || "", "base64"));
        } else {
          fs.writeFileSync(full, item.content || "", "utf-8");
        }
        const st = fs.statSync(full);
        results.push({ path: fp, size: st.size, ok: true });
      } catch (err) { results.push({ path: fp, error: err.message }); }
    }
    return json(res, 201, { ok: true, results });
  }

  const mkdirMatch = p.match(/^\/api\/workspace\/([^/]+)\/mkdir$/);
  if (req.method === "POST" && mkdirMatch) {
    const agentId = decodeURIComponent(mkdirMatch[1]);
    const agentDir = resolveAgentDir(agentId);
    if (!agentDir) return json(res, 404, { error: "Agent not found" });
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    if (!body.path) return json(res, 400, { error: "path is required" });
    const fp = path.normalize(body.path);
    const full = path.resolve(agentDir, fp);
    if (!isInsideDir(full, agentDir)) return json(res, 403, { error: "Forbidden" });
    fs.mkdirSync(full, { recursive: true });
    return json(res, 201, { ok: true, path: fp });
  }

  const delMatch = p.match(/^\/api\/workspace\/([^/]+)\/delete$/);
  if (req.method === "POST" && delMatch) {
    const agentId = decodeURIComponent(delMatch[1]);
    const agentDir = resolveAgentDir(agentId);
    if (!agentDir) return json(res, 404, { error: "Agent not found" });
    let body;
    try { body = JSON.parse((await readBody(req)).toString()); }
    catch { return json(res, 400, { error: "Invalid JSON body" }); }
    if (!body.path) return json(res, 400, { error: "path is required" });
    const fp = path.normalize(body.path);
    const full = path.resolve(agentDir, fp);
    if (!isInsideDir(full, agentDir)) return json(res, 403, { error: "Forbidden" });
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) fs.rmSync(full, { recursive: true });
      else fs.unlinkSync(full);
      return json(res, 200, { ok: true });
    } catch { return json(res, 404, { error: "File not found" }); }
  }

  return json(res, 404, { error: "Not found" });
}

async function handleChat(req, res, p) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && p === "/api/chat") {
    const isGw = authGateway(req);
    const apiKey = authWorker(req);
    if (!isGw && !apiKey) return json(res, 401, { error: "Unauthorized" });
    const data = loadJson(CHAT_FILE, { messages: [] });
    const since = url.searchParams.get("since");
    let msgs = data.messages || [];
    if (since) {
      const sinceTs = new Date(since).getTime();
      msgs = msgs.filter((m) => new Date(m.ts).getTime() > sinceTs);
    }
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);
    msgs = msgs.slice(-limit);
    return json(res, 200, { messages: msgs });
  }

  if (req.method === "POST" && p === "/api/chat") {
    const isGw = authGateway(req);
    const apiKey = authWorker(req);
    if (!isGw && !apiKey) return json(res, 401, { error: "Unauthorized" });
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const senderName = body.from || (isGw ? "CEO" : (apiKey ? apiKey.name : "unknown"));
    const msg = {
      id: crypto.randomUUID(),
      from: senderName,
      role: isGw ? "ceo" : "worker",
      text: body.text || body.message || "",
      ts: new Date().toISOString(),
    };
    const data = loadJson(CHAT_FILE, { messages: [] });
    data.messages.push(msg);
    if (data.messages.length > 500) data.messages = data.messages.slice(-500);
    saveJson(CHAT_FILE, data);

    if (!isGw && msg.text) {
      routeAtMentions(msg.text, senderName);
    }

    return json(res, 201, msg);
  }

  if (req.method === "DELETE" && p === "/api/chat") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    saveJson(CHAT_FILE, { messages: [] });
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: "Not found" });
}

async function handleAgentChat(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const isGw = authGateway(req);
  const apiKey = authWorker(req);
  if (!isGw && !apiKey) return json(res, 401, { error: "Unauthorized" });

  if (!gatewayWs || gatewayWs.readyState !== WebSocket.OPEN) {
    return json(res, 503, { error: "Gateway not connected" });
  }

  const body = JSON.parse((await readBody(req)).toString() || "{}");
  let message = "";
  if (body.messages && Array.isArray(body.messages)) {
    const last = body.messages[body.messages.length - 1];
    message = (last && last.content) || "";
  } else {
    message = body.message || body.text || "";
  }
  if (!message) return json(res, 400, { error: "No message provided" });

  const senderName = apiKey ? apiKey.name : "CEO";
  const label = senderName !== "CEO" ? "[" + senderName + " → CEO Agent]" : "";

  const sessionKey = gwSessionKey || "agent:main:main";
  const reqId = "agent-chat-" + (++gwReqCounter) + "-" + Date.now();
  const TIMEOUT_MS = 180000;

  const responsePromise = new Promise((resolve, reject) => {
    const entry = { resolve, reject, sendAcked: false, resolved: false };
    pendingAgentChats.set(reqId, entry);
    setTimeout(() => {
      if (!entry.resolved) {
        entry.resolved = true;
        pendingAgentChats.delete(reqId);
        reject(new Error("Agent response timeout"));
      }
    }, TIMEOUT_MS);
  });

  const fullMessage = label ? label + " " + message : message;
  const idempotencyKey = crypto.randomUUID();
  const frame = {
    type: "req", id: reqId, method: "chat.send",
    params: { sessionKey, message: fullMessage, idempotencyKey },
  };
  gatewayWs.send(JSON.stringify(frame));
  console.log("[ceo-proxy] Agent chat request from", senderName, ":", message.slice(0, 80));

  try {
    const responseText = await responsePromise;
    console.log("[ceo-proxy] Agent chat response:", responseText.slice(0, 80));
    return json(res, 200, {
      id: reqId,
      object: "chat.completion",
      choices: [{
        index: 0,
        message: { role: "assistant", content: responseText },
        finish_reason: "stop",
      }],
      model: "ceo-agent",
    });
  } catch (err) {
    console.error("[ceo-proxy] Agent chat error:", err.message);
    return json(res, 504, { error: err.message });
  }
}

const { execSync } = require("child_process");

function getRunningProcesses() {
  try {
    const registeredPids = new Set();
    for (const [, entry] of botProcesses) {
      if (entry && entry.proc && !entry.proc.killed && entry.proc.pid) {
        registeredPids.add(entry.proc.pid);
      }
    }

    const out = execSync("ps aux --sort=-start_time", { encoding: "utf-8", timeout: 5000 });
    const lines = out.trim().split("\n").slice(1);
    const procs = [];
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 11) continue;
      const pid = parseInt(parts[1]);
      if (registeredPids.has(pid)) continue;
      const cpu = parts[2];
      const mem = parts[3];
      const startTime = parts[8];
      const cmd = parts.slice(10).join(" ");
      if (cmd.includes("node ") && cmd.includes("skills/")) {
        let name = "Unknown Script";
        let type = "script";
        const m = cmd.match(/skills\/bots\/([^.\s]+)/);
        if (m) { name = m[1]; type = name.includes("monitor") ? "monitor" : "bot"; }
        else {
          const m2 = cmd.match(/skills\/([^/]+)\//);
          if (m2) name = m2[1];
        }
        procs.push({ pid, name, type, cpu, mem, startTime, cmd });
      }
    }
    return procs;
  } catch (_) { return []; }
}

async function handleCanvasApi(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
  const MANIFEST_PATH = path.join(CANVAS_DIR, "manifest.json");

  if (req.method === "DELETE" && p.startsWith("/api/canvas/page/")) {
    const filename = decodeURIComponent(p.slice("/api/canvas/page/".length));
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return json(res, 400, { error: "Invalid filename" });
    }
    try {
      let manifest = [];
      if (fs.existsSync(MANIFEST_PATH)) manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
      manifest = manifest.filter(e => e.file !== filename);
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      const filePath = path.join(CANVAS_DIR, filename);
      if (fs.existsSync(filePath) && filename !== "index.html" && filename !== "manifest.json" && filename !== "ig-dashboard.html") {
        fs.unlinkSync(filePath);
      }
      console.log("[ceo-proxy] Deleted canvas page:", filename);
      return json(res, 200, { ok: true, deleted: filename });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  if (req.method === "GET" && p === "/api/canvas/manifest") {
    try {
      let manifest = [];
      if (fs.existsSync(MANIFEST_PATH)) manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
      return json(res, 200, { pages: manifest });
    } catch (e) {
      return json(res, 200, { pages: [] });
    }
  }

  return json(res, 404, { error: "Not found" });
}

async function handleProcesses(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });

  if (req.method === "GET" && p === "/api/processes") {
    const procs = getRunningProcesses();
    return json(res, 200, { processes: procs });
  }

  if (req.method === "POST" && p === "/api/processes/kill") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const pid = parseInt(body.pid);
    if (!pid || isNaN(pid)) return json(res, 400, { error: "pid required" });
    const procs = getRunningProcesses();
    const found = procs.find(pr => pr.pid === pid);
    if (!found) return json(res, 404, { error: "Process not found or not a managed script" });
    try {
      process.kill(pid, "SIGTERM");
      setTimeout(() => { try { process.kill(pid, 0); process.kill(pid, "SIGKILL"); } catch (_) {} }, 3000);
      console.log("[ceo-proxy] Killed process:", found.name, "pid:", pid);
      return json(res, 200, { ok: true, killed: found.name, pid });
    } catch (err) {
      return json(res, 500, { error: "Failed to kill: " + err.message });
    }
  }

  return json(res, 404, { error: "Not found" });
}

async function handleApi(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  if (p === "/api/login" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const u = (body.username || "").trim();
    const pw = (body.password || "").trim();
    if (!LOGIN_USER || !LOGIN_PASS) return json(res, 200, { ok: false, error: "Login not configured" }), true;
    if (u !== LOGIN_USER || pw !== LOGIN_PASS) {
      console.log(`[login] Failed login attempt for user: ${u}`);
      return json(res, 200, { ok: false, error: "Invalid username or password" }), true;
    }
    const sessionToken = createLoginSession();
    const maxAgeSec = Math.floor(LOGIN_SESSION_MAX_AGE / 1000);
    const isSecure = (req.headers["x-forwarded-proto"] === "https") ? "; Secure" : "";
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": `openclaw_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${isSecure}`
    });
    res.end(JSON.stringify({ ok: true }));
    console.log(`[login] User ${u} logged in successfully`);
    return true;
  }

  if (p === "/api/logout" && req.method === "POST") {
    const cookies = (req.headers.cookie || "").split(";").map(c => c.trim());
    for (const c of cookies) {
      if (c.startsWith("openclaw_session=")) {
        const tok = c.slice("openclaw_session=".length);
        const sessions = loadLoginSessions();
        delete sessions[tok];
        saveLoginSessions(sessions);
      }
    }
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "openclaw_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    });
    res.end(JSON.stringify({ ok: true }));
    return true;
  }

  if (p === "/api/dispatch" && req.method === "POST") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" }), true;
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const workerName = body.workerName;
    const message = body.message || "";
    if (!workerName) return json(res, 400, { error: "workerName required" }), true;
    const found = findWorkerByName(workerName);
    if (!found) return json(res, 404, { error: "Worker not found: " + workerName }), true;
    const w = found.worker;
    const wid = found.id;
    const task = {
      id: crypto.randomUUID(),
      assignedTo: wid,
      type: "message",
      message: "@CEO: " + message,
      filePath: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
    };
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    data.tasks.push(task);
    saveJson(TASKS_FILE, data);
    injectToGateway("CEO \u2192 " + w.name, message);
    const chatData = loadJson(CHAT_FILE, { messages: [] });
    chatData.messages.push({ id: crypto.randomUUID(), from: "CEO", role: "ceo", text: "[CEO -> " + w.name + "] " + message, ts: new Date().toISOString() });
    if (chatData.messages.length > 500) chatData.messages = chatData.messages.slice(-500);
    saveJson(CHAT_FILE, chatData);
    console.log("[ceo-proxy] Dispatched task to", w.name, "taskId:", task.id);
    return json(res, 201, { ok: true, taskId: task.id, workerName: w.name }), true;
  }

  async function handleVoiceApi(req, res, p) {
    if (req.method === "POST" && p === "/api/voice/transcribe") {
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) return json(res, 500, { error: "GROQ_API_KEY not configured" });
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("multipart/form-data")) return json(res, 400, { error: "Expected multipart/form-data" });
      const contentLength = parseInt(req.headers["content-length"] || "0", 10);
      const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
      if (contentLength > MAX_AUDIO_SIZE) return json(res, 413, { error: "Audio file too large (max 10MB)" });
      try {
        const raw = await readBody(req, MAX_AUDIO_SIZE);
        if (raw.length > MAX_AUDIO_SIZE) return json(res, 413, { error: "Audio file too large (max 10MB)" });
        const boundary = contentType.split("boundary=")[1];
        if (!boundary) return json(res, 400, { error: "Missing boundary" });
        const parts = parseMultipart(raw, boundary);
        const audioPart = parts.find(p => p.name === "file");
        if (!audioPart || !audioPart.data || audioPart.data.length === 0) return json(res, 400, { error: "Missing audio file" });
        const https = require("https");
        const formBoundary = "----VoiceBoundary" + Date.now();
        const filename = audioPart.filename || "audio.webm";
        const mimeType = audioPart.contentType || "audio/webm";
        const header = Buffer.from(
          `--${formBoundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
        );
        const modelField = Buffer.from(
          `\r\n--${formBoundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n--${formBoundary}--\r\n`
        );
        const postBody = Buffer.concat([header, audioPart.data, modelField]);
        const result = await new Promise((resolve, reject) => {
          const r = https.request({
            hostname: "api.groq.com", port: 443, path: "/openai/v1/audio/transcriptions",
            method: "POST",
            headers: {
              "Authorization": "Bearer " + groqKey,
              "Content-Type": "multipart/form-data; boundary=" + formBoundary,
              "Content-Length": postBody.length,
            },
            timeout: 30000,
          }, (resp) => {
            const chunks = [];
            resp.on("data", c => chunks.push(c));
            resp.on("end", () => {
              try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
              catch (e) { reject(new Error("Invalid Groq response")); }
            });
          });
          r.on("error", reject);
          r.on("timeout", () => { r.destroy(); reject(new Error("Groq timeout")); });
          r.write(postBody);
          r.end();
        });
        if (result.error) return json(res, 502, { error: result.error.message || "Groq API error" });
        return json(res, 200, { text: result.text || "", ok: true });
      } catch (e) {
        console.error("[voice] Transcribe error:", e.message);
        return json(res, 500, { error: "Transcription failed: " + e.message });
      }
    }
    return json(res, 404, { error: "Not found" });
  }

  function parseMultipart(buf, boundary) {
    const parts = [];
    const boundaryBuf = Buffer.from("--" + boundary);
    let start = 0;
    const indices = [];
    for (let i = 0; i <= buf.length - boundaryBuf.length; i++) {
      if (buf.slice(i, i + boundaryBuf.length).equals(boundaryBuf)) indices.push(i);
    }
    for (let idx = 0; idx < indices.length - 1; idx++) {
      const partStart = indices[idx] + boundaryBuf.length + 2;
      const partEnd = indices[idx + 1];
      const partBuf = buf.slice(partStart, partEnd);
      const headerEnd = partBuf.indexOf("\r\n\r\n");
      if (headerEnd === -1) continue;
      const headerStr = partBuf.slice(0, headerEnd).toString();
      const data = partBuf.slice(headerEnd + 4, partBuf.length - 2);
      const nameMatch = headerStr.match(/name="([^"]+)"/);
      const filenameMatch = headerStr.match(/filename="([^"]+)"/);
      const ctMatch = headerStr.match(/Content-Type:\s*(.+)/i);
      parts.push({
        name: nameMatch ? nameMatch[1] : "",
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: ctMatch ? ctMatch[1].trim() : null,
        data,
      });
    }
    return parts;
  }

  if (p.startsWith("/api/ig/")) {
    if (p === "/api/ig/logs/scalper-trades") {
      try {
        const status = await scalperEngine.getStatus();
        const trades = status.allTrades || [];
        return json(res, 200, trades), true;
      } catch (_) {
        const filePath = path.join(DATA_DIR, "ig-scalper-trades.json");
        if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end("Not found"), true; }
        res.writeHead(200, { "Content-Type": "application/json" });
        return fs.createReadStream(filePath).pipe(res), true;
      }
    }
    if (p === "/api/ig/logs/bot-log") {
      const filePath = path.join(DATA_DIR, "ig-bot-log.json");
      if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end("Not found"), true; }
      res.writeHead(200, { "Content-Type": "application/json" });
      return fs.createReadStream(filePath).pipe(res), true;
    }
    await handleIgApi(req, res, p); return true;
  }
  if (p.startsWith("/api/clawscript/")) { await handleClawScriptApi(req, res, p); return true; }
  if (p.startsWith("/api/voice/")) { await handleVoiceApi(req, res, p); return true; }
  if (p.startsWith("/api/agents/")) { await handleAgentsApi(req, res, p); return true; }
  if (p.startsWith("/api/bots")) { await handleBotsApi(req, res, p); return true; }
  if (p.startsWith("/api/processes")) { await handleProcesses(req, res, p); return true; }
  if (p.startsWith("/api/canvas")) { await handleCanvasApi(req, res, p); return true; }
  if (p.startsWith("/api/keys")) { await handleApiKeys(req, res, p); return true; }
  if (p.startsWith("/api/workers")) { await handleWorkers(req, res, p); return true; }
  if (p.startsWith("/api/tasks")) { await handleTasks(req, res, p); return true; }
  if (p.startsWith("/api/workspace")) { await handleWorkspace(req, res, p); return true; }
  if (p.startsWith("/api/exchange")) { await handleExchange(req, res, p); return true; }
  if (p.startsWith("/api/sharedspace")) { await handleSharedspace(req, res, p); return true; }
  if (p === "/api/agent/chat" || p === "/api/agent/chat/") { await handleAgentChat(req, res); return true; }
  if (p.startsWith("/api/chat")) { await handleChat(req, res, p); return true; }
  return false;
}

const LOADING_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OpenClaw Cloud</title>
<style>body{background:#1a1a2e;color:#e0e0e0;font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
.c{text-align:center}h2{margin-bottom:8px}</style></head>
<body><div class="c"><h2>OpenClaw Cloud</h2><p style="color:#8b949e">Gateway is starting up. <a href="/" style="color:#58a6ff">Reload</a></p></div></body></html>`;

function proxyReq(req, res, retries = 3) {
  const opts = {
    hostname: "127.0.0.1",
    port: GATEWAY_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: "127.0.0.1:" + GATEWAY_PORT },
  };
  const noCache = /\/(worker-chat|nav-inject|token-init|workers|processes|model-config)\.(js|css|html)/.test(req.url);
  const isHtmlPage = req.url === '/' || req.url === '/index.html' || /^\/(chat|overview|channels|instances|sessions|usage|cron|agents|skills|nodes|config|debug)/i.test(req.url);
  const p = http.request(opts, (pr) => {
    const headers = { ...pr.headers };
    if (noCache) {
      headers["cache-control"] = "no-cache, no-store, must-revalidate";
      headers["pragma"] = "no-cache";
      headers["expires"] = "0";
    }
    const contentType = (pr.headers["content-type"] || "");
    if (isHtmlPage && contentType.includes("text/html")) {
      const chunks = [];
      pr.on("data", (c) => chunks.push(c));
      pr.on("end", () => {
        let html = Buffer.concat(chunks).toString("utf-8");
        if (!html.includes("nav-inject.js")) {
          const idx = html.indexOf("</body>");
          if (idx !== -1) {
            html = html.slice(0, idx) + NAV_INJECT_TAG + html.slice(idx);
          } else {
            html += NAV_INJECT_TAG;
          }
        }
        delete headers["content-length"];
        headers["transfer-encoding"] = "chunked";
        res.writeHead(pr.statusCode, headers);
        res.end(html);
      });
    } else {
      res.writeHead(pr.statusCode, headers);
      pr.pipe(res);
    }
  });
  p.on("error", (err) => {
    if (retries > 0 && !res.headersSent) {
      setTimeout(() => proxyReq(req, res, retries - 1), 2000);
    } else if (!res.headersSent) {
      const accept = (req.headers.accept || "");
      if (accept.includes("text/html")) {
        res.writeHead(503, { "Content-Type": "text/html" });
        res.end(LOADING_HTML);
      } else {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway - OpenClaw gateway starting...");
      }
    }
  });
  req.pipe(p);
}

const NAV_INJECT_TAG = '<script src="/nav-inject.js"></script>';

function unescapeHtmlEntities(html) {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&");
}

function needsUnescape(html) {
  return html.includes("&lt;html") || html.includes("&lt;!DOCTYPE") || html.includes("&lt;head")
    || html.includes("&#39;") || html.includes("&#x27;") || html.includes("&#34;");
}

function injectNavIntoHtml(buf, filePath) {
  let html = buf.toString("utf-8");
  if (needsUnescape(html)) {
    console.log("[canvas] Auto-fixing HTML-escaped canvas file:", filePath);
    html = unescapeHtmlEntities(html);
    if (filePath) { try { fs.writeFileSync(filePath, html); } catch (_) {} }
  }
  if (html.includes("nav-inject.js")) return Buffer.from(html);
  const idx = html.indexOf("</body>");
  if (idx === -1) return Buffer.from(html + NAV_INJECT_TAG);
  return Buffer.from(html.slice(0, idx) + NAV_INJECT_TAG + html.slice(idx));
}

function buildCanvasManifest() {
  let manifest = [];
  const manifestPath = path.join(CANVAS_DIR, "manifest.json");
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")); } catch (_) {}
  if (!Array.isArray(manifest)) manifest = [];
  const knownFiles = new Set(manifest.map(e => e.file));
  try {
    const files = fs.readdirSync(CANVAS_DIR);
    for (const f of files) {
      if (f === "index.html" || f === "manifest.json" || !f.endsWith(".html")) continue;
      if (knownFiles.has(f)) continue;
      manifest.push({ name: f.replace(/\.html$/, "").replace(/[-_]/g, " "), file: f, description: "", category: "Other" });
    }
  } catch (_) {}
  return manifest;
}

async function handleCanvasApiRoutes(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  if (!p.startsWith("/__openclaw__/canvas/api/")) return false;
  const route = p.slice("/__openclaw__/canvas/api/".length);

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization" });
    res.end();
    return true;
  }

  if (req.method !== "GET") {
    const apiKey = process.env.CANVAS_API_KEY;
    if (apiKey) {
      const provided = req.headers["x-api-key"] || url.searchParams.get("key") || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (provided !== apiKey) {
        json(res, 403, { error: "Invalid or missing API key. Provide via X-Api-Key header, ?key= param, or Authorization: Bearer token." });
        return true;
      }
    }
  }

  const configMap = {
    "scalper-config": "ig-scalper-config.json",
    "strategy": "ig-strategy.json",
    "monitor-config": "ig-monitor-config.json",
    "proofread-config": "ig-proofread-config.json",
  };

  if (route.startsWith("config/")) {
    const configKey = route.slice("config/".length);
    const fileName = configMap[configKey];
    if (!fileName) { json(res, 404, { error: "Unknown config: " + configKey, available: Object.keys(configMap) }); return true; }
    const filePath = path.join(DATA_DIR, fileName);

    if (req.method === "GET") {
      try {
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : {};
        json(res, 200, data);
      } catch (e) { json(res, 500, { error: e.message }); }
      return true;
    }

    if (req.method === "POST" || req.method === "PUT") {
      let body = "";
      req.on("data", c => body += c);
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (req.method === "PUT") {
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
            console.log(`[canvas-api] Config ${configKey} replaced by agent`);
          } else {
            let existing = {};
            try { existing = JSON.parse(fs.readFileSync(filePath, "utf8")); } catch (_) {}
            const merged = { ...existing, ...parsed };
            fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
            console.log(`[canvas-api] Config ${configKey} patched by agent`);
          }
          writeConfigSnapshots();
          json(res, 200, { ok: true, config: JSON.parse(fs.readFileSync(filePath, "utf8")) });
        } catch (e) { json(res, 400, { error: "Invalid JSON: " + e.message }); }
      });
      return true;
    }

    json(res, 405, { error: "Method not allowed" });
    return true;
  }

  if (route === "scalper/status" && req.method === "GET") {
    try {
      const status = await scalperEngine.getStatus();
      json(res, 200, status);
    } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  if (route === "scalper/start" && req.method === "POST") {
    try { await scalperEngine.start(false); json(res, 200, { ok: true }); } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  if (route === "scalper/stop" && req.method === "POST") {
    try { await scalperEngine.stop(); json(res, 200, { ok: true }); } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  if (route === "scalper/reset" && req.method === "POST") {
    try { await scalperEngine.resetStats(); json(res, 200, { ok: true }); } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  if (route === "clawscript/templates" && req.method === "GET") {
    try {
      const templatesDir = path.join(CANVAS_DIR, "templates");
      if (!fs.existsSync(templatesDir)) { json(res, 200, []); return true; }
      const files = fs.readdirSync(templatesDir).filter(f => f.endsWith(".cs"));
      const templates = files.map(f => {
        const content = fs.readFileSync(path.join(templatesDir, f), "utf8");
        const firstLine = content.split("\n").find(l => l.trim().startsWith("//")) || "";
        return { name: f.replace(/\.cs$/, ""), file: f, description: firstLine.replace(/^\/\/\s*/, "").trim() };
      });
      json(res, 200, templates);
    } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  if (route.startsWith("clawscript/templates/") && req.method === "GET") {
    const tplName = route.slice("clawscript/templates/".length);
    const templatesDir = path.join(CANVAS_DIR, "templates");
    const fileName = tplName.endsWith(".cs") ? tplName : tplName + ".cs";
    const filePath = path.join(templatesDir, fileName);
    if (!fs.existsSync(filePath)) { json(res, 404, { error: "Template not found: " + tplName }); return true; }
    try {
      const content = fs.readFileSync(filePath, "utf8");
      json(res, 200, { name: tplName.replace(/\.cs$/, ""), file: fileName, content: content });
    } catch (e) { json(res, 500, { error: e.message }); }
    return true;
  }

  json(res, 404, { error: "Unknown canvas API route", available: ["config/scalper-config", "config/strategy", "config/monitor-config", "config/proofread-config", "scalper/status", "scalper/start", "scalper/stop", "scalper/reset", "clawscript/templates"] });
  return true;
}

function serveCanvas(req, res) {
  const url = new URL(req.url, "http://localhost");
  const prefix = "/__openclaw__/canvas/";
  if (!url.pathname.startsWith(prefix)) return false;
  if (url.pathname.startsWith("/__openclaw__/canvas/api/")) return handleCanvasApiRoutes(req, res);
  if (req.method !== "GET") return false;
  const relPath = decodeURIComponent(url.pathname.slice(prefix.length)) || "index.html";
  if (relPath === "manifest.json") {
    const manifest = buildCanvasManifest();
    const data = Buffer.from(JSON.stringify(manifest));
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Content-Length": data.length, "Access-Control-Allow-Origin": "*" });
    res.end(data);
    return true;
  }
  const filePath = path.resolve(CANVAS_DIR, path.normalize(relPath));
  if (!isInsideDir(filePath, CANVAS_DIR) && filePath !== path.resolve(CANVAS_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return true;
  }
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const idx = path.join(filePath, "index.html");
      if (fs.existsSync(idx)) {
        const raw = fs.readFileSync(idx);
        const data = injectNavIntoHtml(raw, idx);
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Length": data.length,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        });
        res.end(data);
        return true;
      }
    }
    const raw = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const isHtml = ext === ".html" || ext === ".htm";
    const data = isHtml ? injectNavIntoHtml(raw, filePath) : raw;
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Content-Length": data.length,
      "Access-Control-Allow-Origin": "*",
    };
    if (isHtml) {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      headers["Pragma"] = "no-cache";
      headers["Expires"] = "0";
    }
    res.writeHead(200, headers);
    res.end(data);
    return true;
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return true;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!isLoginExempt(req) && !validateLoginSession(req)) {
      const url = new URL(req.url, "http://localhost");
      const p = url.pathname;
      if (p.startsWith("/api/")) {
        return json(res, 401, { error: "Not authenticated" });
      }
      return serveLoginPage(req, res);
    }
    if (serveCanvas(req, res)) return;
    if (!(await handleApi(req, res))) proxyReq(req, res);
  } catch (err) {
    console.error("[ceo-proxy] error:", err);
    if (!res.headersSent) json(res, 500, { error: "Internal server error" });
  }
});

server.on("upgrade", (req, socket, head) => {
  if (!validateLoginSession(req)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const opts = {
    hostname: "127.0.0.1",
    port: GATEWAY_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: "127.0.0.1:" + GATEWAY_PORT },
  };
  const p = http.request(opts);
  p.on("upgrade", (pr, ps, ph) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
      Object.entries(pr.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") +
      "\r\n\r\n"
    );
    if (ph.length > 0) socket.write(ph);
    ps.pipe(socket);
    socket.pipe(ps);
    ps.on("error", () => socket.destroy());
    socket.on("error", () => ps.destroy());
    ps.on("close", () => socket.destroy());
    socket.on("close", () => ps.destroy());
  });
  p.on("error", () => socket.destroy());
  p.end();
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`[ceo-proxy] listening on 0.0.0.0:${PROXY_PORT}, proxying to gateway:${GATEWAY_PORT}`);
  ensureIgConfig();
  updateCrewFile();
  writeConfigSnapshots();
  autoRegisterBotScripts();
  startRegisteredBots();
  setTimeout(async () => {
    try { const sdb = require("./skills/bots/ig-scalper-db.cjs"); await sdb.ensurePriceCandlesTable(); console.log("[startup] price_candles table ready"); } catch (e) { console.log("[startup] price_candles init failed:", e.message); }
    await igSessionStartup();
    if (shouldAutoConnectLiveStreaming()) {
      console.log("[startup] Auto-connecting to live streaming (was active before restart)");
      try {
        await startLiveLightstreamer();
      } catch (e) {
        console.log("[startup] Live streaming auto-connect failed:", e.message, "— falling back to active profile");
        startLightstreamer();
      }
    } else {
      startLightstreamer();
    }
  }, 3000);
});

setInterval(() => {
  let changed = false;
  for (const [id, w] of workers) {
    if (Date.now() - w.lastSeen > 300000) { workers.delete(id); changed = true; }
  }
  updateBeesFile();
  updateCrewFile();
  autoRegisterBotScripts();
  writeDashboardSnapshot();
}, 30000);
