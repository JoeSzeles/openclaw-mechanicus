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
const TASKS_FILE = path.join(DATA_DIR, "worker-tasks.json");
const CHAT_FILE = path.join(DATA_DIR, "ceo-chat.json");
const BEES_FILE = path.join(DATA_DIR, "available-bees.json");
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";
const CANVAS_DIR = path.join(DATA_DIR, "canvas");
const BOT_REGISTRY_FILE = path.join(DATA_DIR, "bot-registry.json");
const https = require("https");

const LOGIN_USER = process.env.OPENCLAW_LOGIN_USER || "";
const LOGIN_PASS = process.env.OPENCLAW_LOGIN_PASSWORD || "";
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
  if (!h || !h.startsWith("Bearer ")) return false;
  const tok = h.slice(7);
  if (tok === GATEWAY_TOKEN) return true;
  const keys = loadJson(API_KEYS_FILE, { keys: [] });
  return keys.keys.some(k => k.active && k.key === tok);
}
function isLoginExempt(req) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  if (p === "/api/login" || p === "/api/logout") return true;
  if (p === "/login.html" || p === "/login") return true;
  if (p.startsWith("/api/workers") || p.startsWith("/api/tasks") || p.startsWith("/api/heartbeat") ||
      p.startsWith("/api/exchange") || p.startsWith("/api/sharedspace") || p.startsWith("/api/chat") || p.startsWith("/api/agent/chat")) {
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
let lsSubscription = null;
let lsStatus = "disconnected";
let lsConnectedEpics = [];
const streamedPrices = new Map();

function getStreamedPrices() {
  const result = {};
  for (const [epic, data] of streamedPrices) {
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
  return [...epics].slice(0, 40);
}

async function startLightstreamer() {
  if (!igConfigured()) { lsStatus = "not_configured"; return; }
  try {
    const { LightstreamerClient, Subscription } = require("lightstreamer-client-node");
    const session = await igAuth();
    if (!igSession.lightstreamerEndpoint) {
      console.log("[lightstreamer] No endpoint from session, skipping");
      lsStatus = "no_endpoint";
      return;
    }
    if (lsClient) { try { lsClient.disconnect(); } catch (_) {} }

    const client = new LightstreamerClient(igSession.lightstreamerEndpoint, "DEFAULT");
    const profile = getActiveIgProfile();
    client.connectionDetails.setUser(profile.accountId);
    client.connectionDetails.setPassword(`CST-${session.cst}|XST-${session.xst}`);

    client.addListener({
      onStatusChange: (status) => {
        console.log("[lightstreamer] Status:", status);
        if (status.startsWith("CONNECTED")) lsStatus = "connected";
        else if (status.startsWith("DISCONNECTED")) lsStatus = "disconnected";
        else if (status.startsWith("CONNECTING") || status.startsWith("STALLED")) lsStatus = "reconnecting";
      },
      onServerError: (code, msg) => {
        console.log("[lightstreamer] Server error:", code, msg);
        lsStatus = "error";
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

    const items = epics.map(e => `L1:${e}`);
    const fields = ["BID", "OFFER", "HIGH", "LOW", "MID_OPEN", "MARKET_STATE", "UPDATE_TIME"];
    const sub = new Subscription("MERGE", items, fields);
    sub.setRequestedSnapshot("yes");
    sub.addListener({
      onSubscription: () => {
        console.log(`[lightstreamer] Subscribed to ${epics.length} instruments`);
        lsConnectedEpics = epics;
      },
      onSubscriptionError: (code, msg) => {
        console.error(`[lightstreamer] Subscription error: ${code} ${msg}`);
        if (msg && msg.includes("Invalid account type")) {
          console.log("[lightstreamer] This IG account type does not support streaming. Prices will use REST polling instead.");
          lsStatus = "unsupported";
        }
      },
      onItemUpdate: (info) => {
        const epicFull = info.getItemName();
        const epic = epicFull.startsWith("L1:") ? epicFull.slice(3) : epicFull;
        const bid = parseFloat(info.getValue("BID")) || null;
        const offer = parseFloat(info.getValue("OFFER")) || null;
        const mid = (bid && offer) ? (bid + offer) / 2 : null;
        streamedPrices.set(epic, {
          bid, offer, mid,
          high: parseFloat(info.getValue("HIGH")) || null,
          low: parseFloat(info.getValue("LOW")) || null,
          midOpen: parseFloat(info.getValue("MID_OPEN")) || null,
          marketState: info.getValue("MARKET_STATE") || null,
          updateTime: info.getValue("UPDATE_TIME") || null,
          timestamp: Date.now()
        });
      },
      onUnsubscription: () => {
        console.log("[lightstreamer] Unsubscribed");
        lsConnectedEpics = [];
      },
      onCommandSecondLevelSubscriptionError: (code, msg) => {
        console.error(`[lightstreamer] 2nd level error: ${code} ${msg}`);
      }
    });
    client.subscribe(sub);
    lsSubscription = sub;
    console.log(`[lightstreamer] Connecting to ${igSession.lightstreamerEndpoint}, subscribing to ${epics.length} instruments`);
  } catch (e) {
    console.error("[lightstreamer] Error starting:", e.message);
    lsStatus = "error";
  }
}

function stopLightstreamer() {
  if (lsClient) {
    try {
      if (lsSubscription) lsClient.unsubscribe(lsSubscription);
      lsClient.disconnect();
    } catch (_) {}
    lsClient = null;
    lsSubscription = null;
    lsStatus = "disconnected";
    lsConnectedEpics = [];
    streamedPrices.clear();
    console.log("[lightstreamer] Disconnected");
  }
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
      stopLightstreamer();
      setTimeout(() => startLightstreamer(), 1000);
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
      stopLightstreamer();
      setTimeout(() => startLightstreamer(), 1000);
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

async function handleIgApi(req, res, p) {
  if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });

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
      masked.streaming = { status: lsStatus, connectedEpics: lsConnectedEpics, priceCount: streamedPrices.size };
      masked.session = getIgSessionInfo();
      return json(res, 200, masked);
    }

    if (req.method === "POST" && p === "/api/ig/config") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      const config = ensureIgConfig();
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
      return json(res, 200, { streaming: lsStatus === "connected", prices });
    }

    if (req.method === "GET" && p === "/api/ig/stream/status") {
      return json(res, 200, {
        status: lsStatus,
        connectedEpics: lsConnectedEpics,
        priceCount: streamedPrices.size,
        activeProfile: getActiveIgProfile()?.profileName || null,
        lightstreamerEndpoint: igSession.lightstreamerEndpoint || null
      });
    }

    if (req.method === "GET" && p === "/api/ig/session") {
      return json(res, 200, getIgSessionInfo());
    }

    if (req.method === "POST" && p === "/api/ig/session/refresh") {
      if (!igConfigured()) return json(res, 400, { error: "No credentials configured for active profile" });
      try {
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
      const data = JSON.parse(r.body);
      igCacheSet("positions", data);
      return json(res, 200, data);
    }

    if (req.method === "GET" && p === "/api/ig/account") {
      const cached = igCacheGet("account");
      if (cached) return json(res, 200, cached);
      const session = await igAuth();
      const r = await igRequest("GET", "/accounts", igHeaders(session));
      if (r.status !== 200) return json(res, r.status, { error: "IG API error", detail: r.body });
      const data = JSON.parse(r.body);
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

    return json(res, 404, { error: "Unknown IG endpoint" });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}

function writeConfigSnapshots() {
  try {
    if (!fs.existsSync(CANVAS_DIR)) fs.mkdirSync(CANVAS_DIR, { recursive: true });
    const monitorCfg = path.join(DATA_DIR, "ig-monitor-config.json");
    if (fs.existsSync(monitorCfg)) {
      fs.writeFileSync(path.join(CANVAS_DIR, "ig-monitor-config-snapshot.json"), fs.readFileSync(monitorCfg));
    }
    const strategyCfg = path.join(DATA_DIR, "ig-strategy.json");
    if (fs.existsSync(strategyCfg)) {
      fs.writeFileSync(path.join(CANVAS_DIR, "ig-strategy-snapshot.json"), fs.readFileSync(strategyCfg));
    }
    const alerts = path.join(DATA_DIR, "ig-alerts.json");
    if (fs.existsSync(alerts)) {
      fs.writeFileSync(path.join(CANVAS_DIR, "ig-alerts-snapshot.json"), fs.readFileSync(alerts));
    }
    const botLog = path.join(DATA_DIR, "ig-bot-log.json");
    if (fs.existsSync(botLog)) {
      fs.writeFileSync(path.join(CANVAS_DIR, "ig-bot-log-snapshot.json"), fs.readFileSync(botLog));
    }
    console.log("[ceo-proxy] Config snapshots written to canvas");
  } catch (e) {
    console.error("[ceo-proxy] Snapshot write error:", e.message);
  }
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
    env: { ...process.env },
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
    const files = fs.readdirSync(BOTS_DIR).filter(f => f.endsWith(".cjs"));
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
            gwSessionKey = msg.payload.sessionKey || "agent:main:main";
            console.log("[ceo-proxy] Gateway session:", gwSessionKey);
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

          if (!runId || processedRunIds[runId]) return;
          if (runId.startsWith("inject-")) return;
          if (!pm || pm.role !== "assistant") return;
          if (msg.payload.state !== "final") return;
          processedRunIds[runId] = true;
          if (!pm.content || !pm.content.length) return;
          for (const part of pm.content) {
            if (part.type !== "text" || !part.text) continue;
            const text = part.text;
            const mentions = text.match(/@(\S+)/g);
            if (!mentions) continue;
            for (const mention of mentions) {
              const wName = mention.slice(1);
              if (wName.toLowerCase() === "ceo") continue;
              const foundMatch = findWorkerByName(wName);
              if (!foundMatch) continue;
              const foundWorker = foundMatch.worker;
              const foundWid = foundMatch.id;
              const now = Date.now();
              if (lastAutoDispatch[foundWorker.name] && now - lastAutoDispatch[foundWorker.name] < 30000) {
                console.log("[ceo-proxy] Skipping auto-dispatch to", foundWorker.name, "(cooldown)");
                continue;
              }
              lastAutoDispatch[foundWorker.name] = now;
              const nameEsc = foundWorker.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const bodyMatch = text.match(new RegExp("@" + nameEsc + "\\s+([\\s\\S]+)", "i"));
              const body = bodyMatch ? bodyMatch[1].trim() : text;
              console.log("[ceo-proxy] CEO agent @mentioned worker:", foundWorker.name, "- auto-dispatching");
              const task = {
                id: crypto.randomUUID(),
                assignedTo: foundWid,
                type: "message",
                message: "@CEO: " + body,
                filePath: null,
                status: "pending",
                createdAt: new Date().toISOString(),
                completedAt: null,
                result: null,
              };
              const taskData = loadJson(TASKS_FILE, { tasks: [], results: [] });
              taskData.tasks.push(task);
              saveJson(TASKS_FILE, taskData);
              injectToGateway("CEO \u2192 " + foundWorker.name, body);
              console.log("[ceo-proxy] Auto-dispatched task to", foundWorker.name, "taskId:", task.id);
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

function injectToGateway(label, message) {
  if (!gatewayWs || gatewayWs.readyState !== WebSocket.OPEN) {
    console.log("[ceo-proxy] No gateway WS for inject");
    return;
  }
  const sessionKey = gwSessionKey || "agent:main:main";
  const id = "gw-inject-" + (++gwReqCounter) + "-" + Date.now();
  const frame = {
    type: "req", id, method: "chat.inject",
    params: { sessionKey, message, label },
  };
  gatewayWs.send(JSON.stringify(frame));
  console.log("[ceo-proxy] Injected to gateway chat:", label, message.slice(0, 60));
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

function routeAtMentions(text, senderName) {
  const mentions = text.match(/@(\S+)/g);
  if (!mentions) return;
  for (const mention of mentions) {
    const targetName = mention.slice(1);
    if (targetName.toLowerCase() === "ceo") {
      const nameEsc = "CEO";
      const bodyMatch = text.match(/@CEO\s+([\s\S]+)/i);
      const body = bodyMatch ? bodyMatch[1].trim() : text;
      console.log(`[ceo-proxy] Worker "${senderName}" @CEO - injecting question to gateway`);
      injectToGateway(senderName + " → CEO", body);
      continue;
    }
    const found = findWorkerByName(targetName);
    if (!found) continue;
    const nameEsc2 = found.worker.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const bodyMatch2 = text.match(new RegExp("@" + nameEsc2 + "\\s+([\\s\\S]+)", "i"));
    const body2 = bodyMatch2 ? bodyMatch2[1].trim() : text;
    console.log(`[ceo-proxy] Worker "${senderName}" -> @${found.worker.name} - dispatching inter-bee task`);
    const task = {
      id: crypto.randomUUID(),
      assignedTo: found.id,
      type: "message",
      message: "@" + senderName + ": " + body2,
      filePath: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
    };
    const taskData = loadJson(TASKS_FILE, { tasks: [], results: [] });
    taskData.tasks.push(task);
    saveJson(TASKS_FILE, taskData);
    injectToGateway(senderName + " → " + found.worker.name, body2);
  }
}

function authGateway(req) {
  const h = req.headers["authorization"];
  if (!h) return false;
  return h.replace(/^Bearer\s+/i, "") === GATEWAY_TOKEN;
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

  if (p.startsWith("/api/ig/")) { await handleIgApi(req, res, p); return true; }
  if (p.startsWith("/api/bots")) { await handleBotsApi(req, res, p); return true; }
  if (p.startsWith("/api/processes")) { await handleProcesses(req, res, p); return true; }
  if (p.startsWith("/api/canvas")) { await handleCanvasApi(req, res, p); return true; }
  if (p.startsWith("/api/keys")) { await handleApiKeys(req, res, p); return true; }
  if (p.startsWith("/api/workers")) { await handleWorkers(req, res, p); return true; }
  if (p.startsWith("/api/tasks")) { await handleTasks(req, res, p); return true; }
  if (p.startsWith("/api/exchange")) { await handleExchange(req, res, p); return true; }
  if (p.startsWith("/api/sharedspace")) { await handleSharedspace(req, res, p); return true; }
  if (p === "/api/agent/chat" || p === "/api/agent/chat/") { await handleAgentChat(req, res); return true; }
  if (p.startsWith("/api/chat")) { await handleChat(req, res, p); return true; }
  return false;
}

const LOADING_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OpenClaw Cloud</title>
<meta http-equiv="refresh" content="3">
<style>body{background:#1a1a2e;color:#e0e0e0;font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
.c{text-align:center}.s{font-size:48px;animation:spin 1s linear infinite;display:inline-block}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style></head>
<body><div class="c"><div class="s">🦞</div><h2>OpenClaw Gateway Starting...</h2><p>This page will auto-refresh in a few seconds.</p></div></body></html>`;

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

function serveCanvas(req, res) {
  const url = new URL(req.url, "http://localhost");
  const prefix = "/__openclaw__/canvas/";
  if (req.method !== "GET" || !url.pathname.startsWith(prefix)) return false;
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
        });
        res.end(data);
        return true;
      }
    }
    const raw = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const isHtml = ext === ".html" || ext === ".htm";
    const data = isHtml ? injectNavIntoHtml(raw, filePath) : raw;
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Content-Length": data.length,
      "Access-Control-Allow-Origin": "*",
    });
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
    await igSessionStartup();
    startLightstreamer();
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
}, 30000);
