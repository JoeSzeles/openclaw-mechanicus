import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DATA_DIR = join(homedir(), '.openclaw');
const IG_CONFIG_FILE = join(DATA_DIR, 'ig-config.json');
const TEMPLATES_DIR = join(DATA_DIR, 'ig-strategy-templates');
const CS_SCRIPTS_DIR = join(DATA_DIR, 'clawscript-scripts');
const CS_LOGS_DIR = join(DATA_DIR, 'clawscript-logs');
const CLAWSCRIPT_META_FILE = join(DATA_DIR, 'clawscript-strategies.json');
const CLAWSCRIPT_LOGBOOK_FILE = join(DATA_DIR, 'clawscript-logbook.json');

try { mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
try { mkdirSync(TEMPLATES_DIR, { recursive: true }); } catch (_) {}
try { mkdirSync(CS_SCRIPTS_DIR, { recursive: true }); } catch (_) {}
try { mkdirSync(CS_LOGS_DIR, { recursive: true }); } catch (_) {}

let igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: null };
const IG_SESSION_TTL = 5 * 60 * 1000;
let igSessionStatus = 'disconnected';
let igSessionError = null;
let igSessionLastRefresh = 0;
const igResponseCache = new Map();
const IG_CACHE_TTL = 30000;
const marketDetailsCache = new Map();
let csLastResults = null;

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function loadIgConfig() {
  try {
    if (existsSync(IG_CONFIG_FILE)) return JSON.parse(readFileSync(IG_CONFIG_FILE, 'utf8'));
  } catch (_) {}
  return null;
}

function saveIgConfig(config) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(IG_CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getDefaultIgConfig() {
  return {
    activeProfile: 'demo',
    timezone: 'Australia/Brisbane',
    profiles: {
      demo: { label: 'Demo Account', baseUrl: 'https://demo-api.ig.com/gateway/deal', apiKey: '', username: '', password: '', accountId: '' },
      live: { label: 'Live Account', baseUrl: 'https://api.ig.com/gateway/deal', apiKey: '', username: '', password: '', accountId: '' }
    }
  };
}

function ensureIgConfig() {
  let config = loadIgConfig();
  if (config && !config.timezone) config.timezone = 'Australia/Brisbane';
  if (!config) config = getDefaultIgConfig();
  if (process.env.IG_API_KEY || process.env.IG_USERNAME || process.env.IG_PASSWORD || process.env.IG_ACCOUNT_ID || process.env.IG_BASE_URL) {
    const profile = (process.env.IG_BASE_URL || '').includes('demo-api') || !(process.env.IG_BASE_URL || '').includes('api.ig.com') ? 'demo' : 'live';
    if (!config.profiles) config.profiles = {};
    if (!config.profiles[profile]) config.profiles[profile] = {};
    const p = config.profiles[profile];
    if (!p.apiKey) p.apiKey = process.env.IG_API_KEY || '';
    if (!p.username) p.username = process.env.IG_USERNAME || '';
    if (!p.password) p.password = process.env.IG_PASSWORD || '';
    if (!p.accountId) p.accountId = process.env.IG_ACCOUNT_ID || '';
    if (!p.baseUrl) p.baseUrl = process.env.IG_BASE_URL || (profile === 'live' ? 'https://api.ig.com/gateway/deal' : 'https://demo-api.ig.com/gateway/deal');
    if (!config.activeProfile) config.activeProfile = profile;
  }
  saveIgConfig(config);
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

async function igRequest(method, urlPath, headers, body, baseUrlOverride) {
  const profile = getActiveIgProfile();
  const base = baseUrlOverride || (profile && profile.baseUrl) || '';
  const fullUrl = urlPath.startsWith('http') ? urlPath : base + urlPath;
  const resp = await fetch(fullUrl, {
    method,
    headers: headers || {},
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const respBody = await resp.text();
  const respHeaders = {};
  resp.headers.forEach((v, k) => { respHeaders[k.toLowerCase()] = v; });
  return { status: resp.status, headers: respHeaders, body: respBody };
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
    igSessionStatus = 'not_configured';
    igSessionError = 'No active IG profile configured';
    throw new Error(igSessionError);
  }
  igSessionStatus = 'connecting';
  igSessionError = null;
  console.log(`[ig-local-api] Logging in to ${profile.profileName} profile...`);
  const res = await igRequest('POST', '/session', {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
    'X-IG-API-KEY': profile.apiKey,
    'Version': '2',
  }, JSON.stringify({ identifier: profile.username, password: profile.password }));
  if (res.status !== 200) {
    let errDetail = res.body || '';
    if (errDetail.includes('<html') || errDetail.includes('<HTML')) {
      if (res.status === 503) errDetail = 'IG API servers unavailable (503)';
      else errDetail = 'IG API returned HTTP ' + res.status;
    } else {
      try { const ej = JSON.parse(errDetail); errDetail = ej.errorCode || ej.error || errDetail; } catch (_) {}
    }
    igSessionStatus = 'error';
    igSessionError = errDetail;
    throw new Error('IG auth failed: ' + errDetail);
  }
  const cst = res.headers['cst'];
  const xst = res.headers['x-security-token'];
  if (!cst || !xst) throw new Error('IG auth missing tokens');
  let lsEndpoint = null;
  try { const b = JSON.parse(res.body); lsEndpoint = b.lightstreamerEndpoint || null; } catch (_) {}
  igSession = { cst, xst, ts: Date.now(), lightstreamerEndpoint: lsEndpoint };
  igSessionStatus = 'connected';
  igSessionError = null;
  igSessionLastRefresh = Date.now();
  console.log(`[ig-local-api] Connected to ${profile.profileName} profile`);
  return { cst, xst };
}

function igHeaders(session) {
  const profile = getActiveIgProfile();
  return {
    'X-IG-API-KEY': (profile && profile.apiKey) || '',
    'CST': session.cst,
    'X-SECURITY-TOKEN': session.xst,
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8',
  };
}

function safeParseIgBody(body) {
  try { return JSON.parse(body); } catch (_) { return { _parseError: true, _raw: String(body).slice(0, 500) }; }
}

function igJsonResponse(res, statusCode, body) {
  const parsed = safeParseIgBody(body);
  if (parsed._parseError) return json(res, 502, { error: 'IG returned non-JSON response', detail: parsed._raw });
  return json(res, statusCode, parsed);
}

async function getMarketDetails(epic, session) {
  if (marketDetailsCache.has(epic)) return marketDetailsCache.get(epic);
  try {
    const r = await igRequest('GET', '/markets/' + epic, igHeaders(session));
    if (r.status === 200) {
      const d = JSON.parse(r.body);
      const inst = d?.instrument || {};
      const valueOfOnePip = parseFloat(inst.valueOfOnePip) || 1;
      const contractSize = parseFloat(inst.contractSize) || 1;
      const scalingFactor = parseFloat(d?.snapshot?.scalingFactor) || parseFloat(inst.scalingFactor) || 1;
      const plMultiplier = valueOfOnePip * scalingFactor;
      const details = { valueOfOnePip, contractSize, scalingFactor, plMultiplier };
      marketDetailsCache.set(epic, details);
      return details;
    }
  } catch (_) {}
  return { valueOfOnePip: 1, contractSize: 1, scalingFactor: 1, plMultiplier: 1 };
}

function loadJsonFile(filePath, defaults) {
  try {
    if (existsSync(filePath)) return { ...defaults, ...JSON.parse(readFileSync(filePath, 'utf8')) };
  } catch (_) {}
  return { ...defaults };
}

function saveJsonFile(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadClawScriptMeta() {
  try { return JSON.parse(readFileSync(CLAWSCRIPT_META_FILE, 'utf8')); } catch (_) { return { strategies: [] }; }
}

function saveClawScriptMeta(meta) {
  saveJsonFile(CLAWSCRIPT_META_FILE, meta);
}

function loadClawScriptLogbook() {
  try { return JSON.parse(readFileSync(CLAWSCRIPT_LOGBOOK_FILE, 'utf8')); } catch (_) { return { entries: [] }; }
}

function saveClawScriptLogbook(lb) {
  saveJsonFile(CLAWSCRIPT_LOGBOOK_FILE, lb);
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const m = req.method;

  if (m === 'OPTIONS' && p.startsWith('/api/')) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  if (!p.startsWith('/api/ig/') && !p.startsWith('/api/bots') && !p.startsWith('/api/processes') && !p.startsWith('/api/clawscript/')) {
    return false;
  }

  try {
    const handled = await routeRequest(req, res, p, m, url);
    return handled;
  } catch (err) {
    console.error(`[ig-local-api] Error handling ${m} ${p}:`, err.message);
    json(res, 500, { error: err.message });
    return true;
  }
}

async function routeRequest(req, res, p, m, url) {

  if (m === 'GET' && p === '/api/ig/config') {
    const config = ensureIgConfig();
    const safe = JSON.parse(JSON.stringify(config));
    for (const key of Object.keys(safe.profiles || {})) {
      const pr = safe.profiles[key];
      if (pr.password) pr.password = '••••••••';
      if (pr.apiKey) pr.apiKey = pr.apiKey.slice(0, 4) + '••••' + pr.apiKey.slice(-4);
    }
    return json(res, 200, safe), true;
  }

  if (m === 'POST' && p === '/api/ig/config') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const config = ensureIgConfig();
    if (body.activeProfile && config.profiles[body.activeProfile]) config.activeProfile = body.activeProfile;
    if (body.timezone) config.timezone = body.timezone;
    if (body.profile && body.profileName && config.profiles[body.profileName]) {
      const pr = config.profiles[body.profileName];
      if (body.profile.apiKey !== undefined) pr.apiKey = body.profile.apiKey;
      if (body.profile.username !== undefined) pr.username = body.profile.username;
      if (body.profile.password !== undefined) pr.password = body.profile.password;
      if (body.profile.accountId !== undefined) pr.accountId = body.profile.accountId;
      if (body.profile.baseUrl !== undefined) pr.baseUrl = body.profile.baseUrl;
    }
    if (body.profiles) {
      for (const k of Object.keys(body.profiles)) {
        if (!config.profiles[k]) continue;
        const s = body.profiles[k];
        if (s.apiKey !== undefined && !String(s.apiKey).includes('••••') && !String(s.apiKey).includes('****')) config.profiles[k].apiKey = s.apiKey;
        if (s.username !== undefined && !String(s.username).includes('••••') && !String(s.username).includes('****')) config.profiles[k].username = s.username;
        if (s.password !== undefined && !String(s.password).includes('••••') && !String(s.password).includes('****')) config.profiles[k].password = s.password;
        if (s.accountId !== undefined) config.profiles[k].accountId = s.accountId;
        if (s.baseUrl !== undefined) config.profiles[k].baseUrl = s.baseUrl;
      }
    }
    saveIgConfig(config);
    igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: igSession.lightstreamerEndpoint };
    return json(res, 200, { ok: true, activeProfile: config.activeProfile }), true;
  }

  if (m === 'POST' && p === '/api/ig/config/test') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const config = ensureIgConfig();
    const profName = body.profile || config.activeProfile || 'demo';
    const prof = config.profiles[profName];
    const profile = prof ? { ...prof, profileName: profName } : getActiveIgProfile();
    if (!profile || !profile.apiKey || !profile.username || !profile.password) {
      return json(res, 200, { ok: false, error: 'No credentials configured for ' + (profName || 'active') + ' profile', errorType: 'not_configured' }), true;
    }
    try {
      const loginRes = await igRequest('POST', '/session', {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
        'X-IG-API-KEY': profile.apiKey,
        'Version': '2',
      }, JSON.stringify({ identifier: profile.username, password: profile.password }), profile.baseUrl);
      if (loginRes.status !== 200) {
        let errDetail = loginRes.body;
        let errorType = 'auth_rejected';
        if (loginRes.status === 503) errorType = 'server_unavailable';
        else if (loginRes.status === 403) errorType = 'rate_limited';
        try { const ej = JSON.parse(errDetail); errDetail = ej.errorCode || errDetail; } catch (_) {}
        return json(res, 200, { ok: false, error: errDetail, errorType, status: loginRes.status }), true;
      }
      const cst = loginRes.headers['cst'];
      const xst = loginRes.headers['x-security-token'];
      const loginBody = safeParseIgBody(loginRes.body);
      let accountInfo = null;
      if (cst && xst) {
        try {
          const accRes = await igRequest('GET', '/accounts', {
            'X-IG-API-KEY': profile.apiKey, 'CST': cst, 'X-SECURITY-TOKEN': xst,
            'Accept': 'application/json; charset=UTF-8',
          }, undefined, profile.baseUrl);
          if (accRes.status === 200) accountInfo = safeParseIgBody(accRes.body);
        } catch (_) {}
      }
      igSession = { cst, xst, ts: Date.now(), lightstreamerEndpoint: loginBody.lightstreamerEndpoint || null };
      igSessionStatus = 'connected';
      igSessionError = null;
      igSessionLastRefresh = Date.now();
      return json(res, 200, { ok: true, profile: profName, accountInfo, lightstreamerEndpoint: loginBody.lightstreamerEndpoint }), true;
    } catch (err) {
      return json(res, 200, { ok: false, error: err.message, errorType: 'connection_error' }), true;
    }
  }

  if (m === 'GET' && p === '/api/ig/session') {
    return json(res, 200, {
      status: igSessionStatus,
      error: igSessionError,
      profile: getActiveIgProfile()?.profileName || null,
      connectedSince: igSession.ts > 0 ? new Date(igSession.ts).toISOString() : null,
      lastRefresh: igSessionLastRefresh > 0 ? new Date(igSessionLastRefresh).toISOString() : null,
      sessionAge: igSession.ts > 0 ? Math.round((Date.now() - igSession.ts) / 1000) : null,
      ttlRemaining: igSession.ts > 0 ? Math.max(0, Math.round((IG_SESSION_TTL - (Date.now() - igSession.ts)) / 1000)) : null,
      lightstreamerEndpoint: igSession.lightstreamerEndpoint || null
    }), true;
  }

  if (m === 'POST' && p === '/api/ig/session/refresh') {
    try {
      igSession = { cst: null, xst: null, ts: 0, lightstreamerEndpoint: igSession.lightstreamerEndpoint };
      const session = await igAuth();
      return json(res, 200, { ok: true, status: igSessionStatus }), true;
    } catch (err) {
      return json(res, 200, { ok: false, error: err.message }), true;
    }
  }

  if (m === 'GET' && p === '/api/ig/positions') {
    const cached = igCacheGet('positions');
    if (cached) return json(res, 200, cached), true;
    const session = await igAuth();
    const r = await igRequest('GET', '/positions', { ...igHeaders(session), Version: '2' });
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    const data = safeParseIgBody(r.body);
    if (data._parseError) return json(res, 502, { error: 'IG returned non-JSON', detail: data._raw }), true;
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
    igCacheSet('positions', data);
    return json(res, 200, data), true;
  }

  if (m === 'GET' && p === '/api/ig/account') {
    const cached = igCacheGet('account');
    if (cached) return json(res, 200, cached), true;
    const session = await igAuth();
    const r = await igRequest('GET', '/accounts', igHeaders(session));
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    const data = safeParseIgBody(r.body);
    if (data._parseError) return json(res, 502, { error: 'IG returned non-JSON', detail: data._raw }), true;
    igCacheSet('account', data);
    return json(res, 200, data), true;
  }

  if (m === 'GET' && p.startsWith('/api/ig/prices')) {
    const epics = url.searchParams.get('epics');
    if (!epics) return json(res, 400, { error: 'Missing ?epics= param' }), true;
    const epicList = epics.split(',').map(s => s.trim()).filter(Boolean);
    const cacheKey = 'prices:' + epicList.sort().join(',');
    const cached = igCacheGet(cacheKey);
    if (cached) return json(res, 200, cached), true;
    const session = await igAuth();
    const results = {};
    for (const epic of epicList) {
      try {
        const r = await igRequest('GET', '/markets/' + epic, igHeaders(session));
        if (r.status === 200) results[epic] = JSON.parse(r.body);
      } catch (_) {}
    }
    const data = { prices: results };
    igCacheSet(cacheKey, data);
    return json(res, 200, data), true;
  }

  if (m === 'POST' && p === '/api/ig/positions/open') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.epic || !body.direction || !body.size) {
      return json(res, 400, { error: 'Missing required fields: epic, direction, size' }), true;
    }
    const session = await igAuth();
    let currencyCode = body.currencyCode;
    if (!currencyCode) {
      try {
        const mr = await igRequest('GET', `/markets/${body.epic}`, igHeaders(session));
        if (mr.status === 200) {
          const md = JSON.parse(mr.body);
          const currs = md.instrument?.currencies;
          if (currs && currs.length > 0) currencyCode = currs[0].name || currs[0].code;
        }
      } catch (_) {}
      if (!currencyCode) currencyCode = 'AUD';
    }
    const orderBody = {
      epic: body.epic,
      direction: body.direction.toUpperCase(),
      size: String(body.size),
      orderType: body.orderType || 'MARKET',
      currencyCode,
      expiry: body.expiry || '-',
      forceOpen: body.forceOpen !== undefined ? body.forceOpen : true,
      guaranteedStop: body.guaranteedStop || false,
    };
    if (body.stopDistance) orderBody.stopDistance = body.stopDistance;
    if (body.limitDistance) orderBody.limitDistance = body.limitDistance;
    if (body.stopLevel) orderBody.stopLevel = body.stopLevel;
    if (body.limitLevel) orderBody.limitLevel = body.limitLevel;
    if (!orderBody.forceOpen) { delete orderBody.stopDistance; delete orderBody.limitDistance; delete orderBody.stopLevel; delete orderBody.limitLevel; }
    console.log(`[ig-local-api] Opening ${orderBody.direction} ${orderBody.size} ${orderBody.epic}`);
    const r = await igRequest('POST', '/positions/otc', { ...igHeaders(session), Version: '2' }, JSON.stringify(orderBody));
    igCacheInvalidate();
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status }), true;
    }
    let dealRef = null;
    try { dealRef = JSON.parse(r.body).dealReference; } catch (_) {}
    if (dealRef) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const conf = await igRequest('GET', '/confirms/' + dealRef, igHeaders(session));
        if (conf.status === 200) {
          return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) }), true;
        }
      } catch (_) {}
    }
    return json(res, 200, { ok: true, dealReference: dealRef }), true;
  }

  if (m === 'POST' && p === '/api/ig/positions/close') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.dealId) return json(res, 400, { error: 'Missing required field: dealId' }), true;
    const session = await igAuth();
    let direction = body.direction;
    let autoSize = null;
    let autoExpiry = null;
    if (!direction || !body.size) {
      try {
        const posRes = await igRequest('GET', '/positions', { ...igHeaders(session), Version: '2' });
        if (posRes.status === 200) {
          const allPos = JSON.parse(posRes.body).positions || [];
          const found = allPos.find(item => item.position && item.position.dealId === body.dealId);
          if (found) {
            if (!direction) direction = found.position.direction === 'BUY' ? 'SELL' : 'BUY';
            autoSize = found.position.size;
            autoExpiry = found.market?.expiry || '-';
          }
        }
      } catch (_) {}
    }
    if (!body.size && autoSize) body.size = autoSize;
    if (!direction) return json(res, 400, { error: 'Could not determine direction' }), true;
    if (!body.size) return json(res, 400, { error: 'Missing size' }), true;
    const closeBody = { dealId: body.dealId, direction: direction.toUpperCase(), size: String(body.size), orderType: body.orderType || 'MARKET', expiry: body.expiry || autoExpiry || '-' };
    console.log(`[ig-local-api] Closing ${closeBody.direction} ${closeBody.size} dealId=${closeBody.dealId}`);
    const r = await igRequest('POST', '/positions/otc', { ...igHeaders(session), '_method': 'DELETE', Version: '1' }, JSON.stringify(closeBody));
    igCacheInvalidate();
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status }), true;
    }
    let dealRef = null;
    try { dealRef = JSON.parse(r.body).dealReference; } catch (_) {}
    if (dealRef) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const conf = await igRequest('GET', '/confirms/' + dealRef, igHeaders(session));
        if (conf.status === 200) return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) }), true;
      } catch (_) {}
    }
    return json(res, 200, { ok: true, dealReference: dealRef }), true;
  }

  if (m === 'PUT' && p === '/api/ig/positions/update') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.dealId) return json(res, 400, { error: 'Missing required field: dealId' }), true;
    const updateBody = {};
    if (body.stopLevel !== undefined) updateBody.stopLevel = body.stopLevel;
    if (body.limitLevel !== undefined) updateBody.limitLevel = body.limitLevel;
    if (body.trailingStop !== undefined) updateBody.trailingStop = body.trailingStop;
    if (body.trailingStopDistance !== undefined) updateBody.trailingStopDistance = body.trailingStopDistance;
    if (body.trailingStopIncrement !== undefined) updateBody.trailingStopIncrement = body.trailingStopIncrement;
    if (Object.keys(updateBody).length === 0) return json(res, 400, { error: 'Nothing to update' }), true;
    const session = await igAuth();
    const r = await igRequest('PUT', '/positions/otc/' + body.dealId, { ...igHeaders(session), Version: '2' }, JSON.stringify(updateBody));
    igCacheInvalidate();
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status }), true;
    }
    let dealRef = null;
    try { dealRef = JSON.parse(r.body).dealReference; } catch (_) {}
    if (dealRef) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const conf = await igRequest('GET', '/confirms/' + dealRef, igHeaders(session));
        if (conf.status === 200) return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) }), true;
      } catch (_) {}
    }
    return json(res, 200, { ok: true, dealReference: dealRef }), true;
  }

  if (m === 'GET' && p === '/api/ig/workingorders') {
    const session = await igAuth();
    const r = await igRequest('GET', '/workingorders', { ...igHeaders(session), Version: '2' });
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'POST' && p === '/api/ig/workingorders/create') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.epic || !body.direction || !body.size || !body.level || !body.type) {
      return json(res, 400, { error: 'Missing required fields: epic, direction, size, level, type' }), true;
    }
    const session = await igAuth();
    let woCurrencyCode = body.currencyCode;
    if (!woCurrencyCode) {
      try {
        const mr = await igRequest('GET', `/markets/${body.epic}`, igHeaders(session));
        if (mr.status === 200) {
          const md = JSON.parse(mr.body);
          const currs = md.instrument?.currencies;
          if (currs && currs.length > 0) woCurrencyCode = currs[0].name || currs[0].code;
        }
      } catch (_) {}
      if (!woCurrencyCode) woCurrencyCode = 'AUD';
    }
    const orderBody = {
      epic: body.epic, direction: body.direction.toUpperCase(), size: body.size, level: body.level,
      type: body.type.toUpperCase(), currencyCode: woCurrencyCode, expiry: body.expiry || '-',
      forceOpen: body.forceOpen !== undefined ? body.forceOpen : true, guaranteedStop: body.guaranteedStop || false,
      timeInForce: body.timeInForce || 'GOOD_TILL_CANCELLED',
    };
    if (body.stopDistance) orderBody.stopDistance = body.stopDistance;
    if (body.limitDistance) orderBody.limitDistance = body.limitDistance;
    if (body.stopLevel) orderBody.stopLevel = body.stopLevel;
    if (body.limitLevel) orderBody.limitLevel = body.limitLevel;
    if (body.goodTillDate) orderBody.goodTillDate = body.goodTillDate;
    const r = await igRequest('POST', '/workingorders/otc', { ...igHeaders(session), Version: '2' }, JSON.stringify(orderBody));
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail, statusCode: r.status }), true;
    }
    let dealRef = null;
    try { dealRef = JSON.parse(r.body).dealReference; } catch (_) {}
    if (dealRef) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const conf = await igRequest('GET', '/confirms/' + dealRef, igHeaders(session));
        if (conf.status === 200) return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) }), true;
      } catch (_) {}
    }
    return json(res, 200, { ok: true, dealReference: dealRef }), true;
  }

  if (m === 'PUT' && p === '/api/ig/workingorders/update') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.dealId) return json(res, 400, { error: 'Missing required field: dealId' }), true;
    const updateBody = {};
    if (body.level !== undefined) updateBody.level = body.level;
    if (body.size !== undefined) updateBody.size = body.size;
    if (body.stopDistance !== undefined) updateBody.stopDistance = body.stopDistance;
    if (body.limitDistance !== undefined) updateBody.limitDistance = body.limitDistance;
    if (body.stopLevel !== undefined) updateBody.stopLevel = body.stopLevel;
    if (body.limitLevel !== undefined) updateBody.limitLevel = body.limitLevel;
    if (body.goodTillDate !== undefined) updateBody.goodTillDate = body.goodTillDate;
    if (body.timeInForce !== undefined) updateBody.timeInForce = body.timeInForce;
    if (body.type !== undefined) updateBody.type = body.type;
    const session = await igAuth();
    const r = await igRequest('PUT', '/workingorders/otc/' + body.dealId, { ...igHeaders(session), Version: '2' }, JSON.stringify(updateBody));
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail }), true;
    }
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'DELETE' && p === '/api/ig/workingorders/delete') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.dealId) return json(res, 400, { error: 'Missing dealId' }), true;
    const session = await igAuth();
    const r = await igRequest('POST', '/workingorders/otc/' + body.dealId, { ...igHeaders(session), '_method': 'DELETE', Version: '2' }, '{}');
    igCacheInvalidate();
    if (r.status !== 200) {
      let detail = r.body;
      try { detail = JSON.parse(r.body); } catch (_) {}
      return json(res, 200, { ok: false, error: typeof detail === 'object' ? (detail.errorCode || JSON.stringify(detail)) : detail }), true;
    }
    let dealRef = null;
    try { dealRef = JSON.parse(r.body).dealReference; } catch (_) {}
    if (dealRef) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const conf = await igRequest('GET', '/confirms/' + dealRef, igHeaders(session));
        if (conf.status === 200) return json(res, 200, { ok: true, dealReference: dealRef, confirmation: JSON.parse(conf.body) }), true;
      } catch (_) {}
    }
    return json(res, 200, { ok: true, dealReference: dealRef }), true;
  }

  if (m === 'GET' && p === '/api/ig/history') {
    const type = url.searchParams.get('type') || 'ALL';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    let qs = `?type=${type}`;
    if (from) qs += `&from=${from}`;
    if (to) qs += `&to=${to}`;
    const session = await igAuth();
    const r = await igRequest('GET', '/history/transactions' + qs, { ...igHeaders(session), Version: '2' });
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'GET' && p === '/api/ig/activity') {
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    let qs = '?';
    if (from) qs += `from=${from}&`;
    if (to) qs += `to=${to}&`;
    qs = qs.replace(/[&?]$/, '');
    const session = await igAuth();
    const r = await igRequest('GET', '/history/activity' + (qs.length > 1 ? qs : ''), { ...igHeaders(session), Version: '3' });
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'GET' && p.startsWith('/api/ig/markets/')) {
    const epic = p.replace('/api/ig/markets/', '');
    if (!epic) return json(res, 400, { error: 'Missing epic' }), true;
    const cacheKey = 'market:' + epic;
    const cached = igCacheGet(cacheKey);
    if (cached) return json(res, 200, cached), true;
    const session = await igAuth();
    const r = await igRequest('GET', '/markets/' + epic, igHeaders(session));
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    const data = safeParseIgBody(r.body);
    if (data._parseError) return json(res, 502, { error: 'IG returned non-JSON', detail: data._raw }), true;
    igCacheSet(cacheKey, data);
    return json(res, 200, data), true;
  }

  if (m === 'GET' && p === '/api/ig/markets') {
    const searchTerm = url.searchParams.get('searchTerm') || url.searchParams.get('q') || '';
    if (!searchTerm) return json(res, 400, { error: 'Missing searchTerm or q param' }), true;
    const session = await igAuth();
    const r = await igRequest('GET', '/markets?searchTerm=' + encodeURIComponent(searchTerm), igHeaders(session));
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'GET' && p.startsWith('/api/ig/marketnavigation')) {
    const nodeId = p.replace('/api/ig/marketnavigation', '').replace(/^\//, '');
    const session = await igAuth();
    const igPath = nodeId ? '/marketnavigation/' + nodeId : '/marketnavigation';
    const r = await igRequest('GET', igPath, igHeaders(session));
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'GET' && p.startsWith('/api/ig/pricehistory/')) {
    const epic = p.replace('/api/ig/pricehistory/', '');
    if (!epic) return json(res, 400, { error: 'Missing epic' }), true;
    const resolution = url.searchParams.get('resolution') || 'HOUR';
    const max = parseInt(url.searchParams.get('max') || '50', 10);
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const cacheKey = `prices:${epic}:${resolution}:${max}:${from}:${to}`;
    const cached = igCacheGet(cacheKey);
    if (cached) return json(res, 200, cached), true;
    const session = await igAuth();
    let igPath = `/prices/${epic}?resolution=${resolution}&max=${max}&pageSize=${max}`;
    if (from) igPath += `&from=${from}`;
    if (to) igPath += `&to=${to}`;
    const r = await igRequest('GET', igPath, { ...igHeaders(session), Version: '3' });
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    const data = safeParseIgBody(r.body);
    if (data._parseError) return json(res, 502, { error: 'IG returned non-JSON', detail: data._raw }), true;
    igCacheSet(cacheKey, data);
    return json(res, 200, data), true;
  }

  if (m === 'GET' && p === '/api/ig/watchlists') {
    const session = await igAuth();
    const r = await igRequest('GET', '/watchlists', igHeaders(session));
    if (r.status !== 200) return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
    return igJsonResponse(res, 200, r.body), true;
  }

  if (m === 'POST' && p === '/api/ig/refresh-snapshots') {
    return json(res, 200, { ok: true, message: 'Snapshots refreshed (local mode)' }), true;
  }

  if (m === 'GET' && p === '/api/ig/stream/prices') {
    return json(res, 200, { streaming: false, polling: false, method: 'none', prices: {}, _localMode: true, _hint: 'Lightstreamer streaming requires ceo-proxy. Use REST polling via price history endpoints.' }), true;
  }

  if (m === 'GET' && p === '/api/ig/stream/status') {
    return json(res, 200, {
      status: 'disconnected', connectedEpics: [], priceCount: 0,
      activeProfile: getActiveIgProfile()?.profileName || null,
      lightstreamerEndpoint: igSession.lightstreamerEndpoint || null,
      liveAccountClient: false, hybridPolling: false,
      streamingSource: getActiveIgProfile()?.profileName || 'demo',
      priceSource: 'none', priceMethod: 'LOCAL MODE — No Lightstreamer (use price history)',
      reconnect: { attempts: 0, maxAttempts: 0, pending: false },
      metrics: { connectedAt: null, uptimeMs: null, totalUpdates: 0, updatesPerSec: null },
      instruments: {}, _localMode: true
    }), true;
  }

  if (m === 'GET' && p === '/api/ig/stream/candles') {
    const epic = url.searchParams.get('epic');
    const resolution = url.searchParams.get('resolution') || 'MINUTE';
    const max = parseInt(url.searchParams.get('max') || '100', 10);
    if (!epic) return json(res, 400, { error: 'Missing ?epic= parameter' }), true;
    try {
      const session = await igAuth();
      let igPath = `/prices/${epic}?resolution=${resolution}&max=${max}&pageSize=${max}`;
      const r = await igRequest('GET', igPath, { ...igHeaders(session), Version: '3' });
      if (r.status === 200) {
        const data = safeParseIgBody(r.body);
        return json(res, 200, { prices: data.prices || [], instrumentType: 'CURRENCIES', metadata: { size: (data.prices || []).length, source: 'ig-rest' } }), true;
      }
    } catch (_) {}
    return json(res, 200, { prices: [], instrumentType: 'CURRENCIES', metadata: { size: 0, source: 'local-empty' } }), true;
  }

  if (m === 'GET' && p === '/api/ig/stream/candle-stats') {
    return json(res, 200, { stats: {}, resolutions: ['SECOND', 'MINUTE', 'MINUTE_5', 'MINUTE_15', 'MINUTE_30', 'HOUR', 'HOUR_4', 'DAY'] }), true;
  }

  if (m === 'POST' && (p === '/api/ig/stream/connect-live' || p === '/api/ig/stream/disconnect-live')) {
    return json(res, 200, { ok: false, _localMode: true, message: 'Lightstreamer streaming requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/ig/proofread') {
    const cfgPath = join(DATA_DIR, 'ig-proofread-config.json');
    const defaults = { enabled: true, maxStalenessSeconds: 120, spreadLimitPctHigh: 0.5, spreadLimitPctLow: 1.0, spreadThresholdMid: 100, minRiskReward: 1.0, maxRiskPct: 2.0, maxEntryDeviationPct: 5.0, allowDuplicatePositions: false, requireStopLoss: true, requireTakeProfit: true };
    return json(res, 200, loadJsonFile(cfgPath, defaults)), true;
  }

  if (m === 'PUT' && p === '/api/ig/proofread') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-proofread-config.json');
    const defaults = { enabled: true, maxStalenessSeconds: 120, spreadLimitPctHigh: 0.5, spreadLimitPctLow: 1.0, spreadThresholdMid: 100, minRiskReward: 1.0, maxRiskPct: 2.0, maxEntryDeviationPct: 5.0, allowDuplicatePositions: false, requireStopLoss: true, requireTakeProfit: true };
    const cfg = loadJsonFile(cfgPath, defaults);
    if (body.enabled !== undefined) cfg.enabled = !!body.enabled;
    if (body.maxStalenessSeconds !== undefined) { const v = Number(body.maxStalenessSeconds); if (!Number.isFinite(v) || v < 5 || v > 600) return json(res, 400, { error: 'maxStalenessSeconds must be 5-600' }), true; cfg.maxStalenessSeconds = v; }
    if (body.spreadLimitPctHigh !== undefined) { const v = Number(body.spreadLimitPctHigh); if (!Number.isFinite(v) || v <= 0 || v > 10) return json(res, 400, { error: 'spreadLimitPctHigh must be 0-10' }), true; cfg.spreadLimitPctHigh = v; }
    if (body.spreadLimitPctLow !== undefined) { const v = Number(body.spreadLimitPctLow); if (!Number.isFinite(v) || v <= 0 || v > 10) return json(res, 400, { error: 'spreadLimitPctLow must be 0-10' }), true; cfg.spreadLimitPctLow = v; }
    if (body.spreadThresholdMid !== undefined) { const v = Number(body.spreadThresholdMid); if (!Number.isFinite(v) || v < 0) return json(res, 400, { error: 'spreadThresholdMid must be >= 0' }), true; cfg.spreadThresholdMid = v; }
    if (body.minRiskReward !== undefined) { const v = Number(body.minRiskReward); if (!Number.isFinite(v) || v < 0.1 || v > 10) return json(res, 400, { error: 'minRiskReward must be 0.1-10' }), true; cfg.minRiskReward = v; }
    if (body.maxRiskPct !== undefined) { const v = Number(body.maxRiskPct); if (!Number.isFinite(v) || v <= 0 || v > 50) return json(res, 400, { error: 'maxRiskPct must be 0-50' }), true; cfg.maxRiskPct = v; }
    if (body.maxEntryDeviationPct !== undefined) { const v = Number(body.maxEntryDeviationPct); if (!Number.isFinite(v) || v <= 0 || v > 50) return json(res, 400, { error: 'maxEntryDeviationPct must be 0-50' }), true; cfg.maxEntryDeviationPct = v; }
    if (body.allowDuplicatePositions !== undefined) cfg.allowDuplicatePositions = !!body.allowDuplicatePositions;
    if (body.requireStopLoss !== undefined) cfg.requireStopLoss = !!body.requireStopLoss;
    if (body.requireTakeProfit !== undefined) cfg.requireTakeProfit = !!body.requireTakeProfit;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, ...cfg }), true;
  }

  if (m === 'GET' && p === '/api/ig/strategies') {
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 200, { strategies: [], enabled: false, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 }), true;
    return json(res, 200, JSON.parse(readFileSync(cfgPath, 'utf8'))), true;
  }

  if (m === 'POST' && p === '/api/ig/strategies/global') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : { strategies: [], enabled: true, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 };
    if (body.enabled !== undefined) cfg.enabled = !!body.enabled;
    if (body.maxOpenPositions !== undefined) { const v = Number(body.maxOpenPositions); if (!Number.isFinite(v) || v < 1 || v > 100) return json(res, 400, { error: 'maxOpenPositions must be 1-100' }), true; cfg.maxOpenPositions = v; }
    if (body.maxRiskPercent !== undefined) { const v = Number(body.maxRiskPercent); if (!Number.isFinite(v) || v < 0.1 || v > 100) return json(res, 400, { error: 'maxRiskPercent must be 0.1-100' }), true; cfg.maxRiskPercent = v; }
    if (body.checkIntervalSeconds !== undefined) { const v = Number(body.checkIntervalSeconds); if (!Number.isFinite(v) || v < 5 || v > 3600) return json(res, 400, { error: 'checkIntervalSeconds must be 5-3600' }), true; cfg.checkIntervalSeconds = v; }
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, ...cfg }), true;
  }

  if (m === 'POST' && p === '/api/ig/strategies') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (!body.instrument || typeof body.instrument !== 'string') return json(res, 400, { error: "Missing or invalid 'instrument'" }), true;
    if (!body.direction || (body.direction !== 'BUY' && body.direction !== 'SELL')) return json(res, 400, { error: "Missing or invalid 'direction'" }), true;
    if (body.size === undefined || !Number.isFinite(Number(body.size)) || Number(body.size) <= 0) return json(res, 400, { error: "Missing or invalid 'size'" }), true;
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : { strategies: [], enabled: false, maxOpenPositions: 6, maxRiskPercent: 10, checkIntervalSeconds: 60 };
    if (!Array.isArray(cfg.strategies)) cfg.strategies = [];
    const newStrategy = {
      instrument: String(body.instrument).trim(),
      name: body.name ? String(body.name).trim() : String(body.instrument).trim(),
      direction: body.direction,
      size: Number(body.size),
      enabled: body.enabled !== undefined ? !!body.enabled : false,
    };
    if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'stopDistance must be positive' }), true; newStrategy.stopDistance = v; }
    if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'limitDistance must be positive' }), true; newStrategy.limitDistance = v; }
    if (body.entryBelow !== undefined) { const v = Number(body.entryBelow); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'entryBelow must be positive' }), true; newStrategy.entryBelow = v; }
    if (body.entryAbove !== undefined) { const v = Number(body.entryAbove); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'entryAbove must be positive' }), true; newStrategy.entryAbove = v; }
    if (body.dealId) newStrategy.dealId = String(body.dealId);
    if (body.paused) newStrategy.paused = true;
    cfg.strategies.push(newStrategy);
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: cfg.strategies.length - 1, strategy: newStrategy }), true;
  }

  const strategyMatch = p.match(/^\/api\/ig\/strategies\/(\d+)$/);
  const strategyToggleMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/toggle$/);
  const strategyAttachMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/attach$/);
  const strategyDetachMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/detach$/);
  const strategyPauseMatch = p.match(/^\/api\/ig\/strategies\/(\d+)\/pause$/);

  if (m === 'POST' && strategyToggleMatch) {
    const idx = parseInt(strategyToggleMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    cfg.strategies[idx].enabled = !cfg.strategies[idx].enabled;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, enabled: cfg.strategies[idx].enabled, strategy: cfg.strategies[idx] }), true;
  }

  if (m === 'POST' && strategyAttachMatch) {
    const idx = parseInt(strategyAttachMatch[1], 10);
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (!body.dealId) return json(res, 400, { error: 'Missing dealId' }), true;
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    cfg.strategies[idx].dealId = String(body.dealId);
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, strategy: cfg.strategies[idx] }), true;
  }

  if (m === 'POST' && strategyDetachMatch) {
    const idx = parseInt(strategyDetachMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    delete cfg.strategies[idx].dealId;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, strategy: cfg.strategies[idx] }), true;
  }

  if (m === 'POST' && strategyPauseMatch) {
    const idx = parseInt(strategyPauseMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    cfg.strategies[idx].paused = !cfg.strategies[idx].paused;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, strategy: cfg.strategies[idx] }), true;
  }

  if (m === 'PUT' && strategyMatch) {
    const idx = parseInt(strategyMatch[1], 10);
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    const s = cfg.strategies[idx];
    if (body.name !== undefined) { if (!String(body.name).trim()) return json(res, 400, { error: 'Name cannot be empty' }), true; s.name = String(body.name).trim(); }
    if (body.enabled !== undefined) s.enabled = !!body.enabled;
    if (body.size !== undefined) { const v = Number(body.size); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'Size must be positive' }), true; s.size = v; }
    if (body.stopDistance !== undefined) { const v = Number(body.stopDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'Stop distance must be positive' }), true; s.stopDistance = v; }
    if (body.limitDistance !== undefined) { const v = Number(body.limitDistance); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'Limit distance must be positive' }), true; s.limitDistance = v; }
    if (body.entryBelow !== undefined) { const v = Number(body.entryBelow); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'Entry level must be positive' }), true; s.entryBelow = v; delete s.entryAbove; }
    if (body.entryAbove !== undefined) { const v = Number(body.entryAbove); if (!Number.isFinite(v) || v <= 0) return json(res, 400, { error: 'Entry level must be positive' }), true; s.entryAbove = v; delete s.entryBelow; }
    if (body.direction !== undefined) { if (body.direction !== 'BUY' && body.direction !== 'SELL') return json(res, 400, { error: 'Direction must be BUY or SELL' }), true; s.direction = body.direction; }
    if (body.instrument !== undefined) s.instrument = String(body.instrument);
    if (body.dealId !== undefined) { if (body.dealId) s.dealId = String(body.dealId); else delete s.dealId; }
    if (body.paused !== undefined) s.paused = !!body.paused;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, strategy: s }), true;
  }

  if (m === 'DELETE' && strategyMatch) {
    const idx = parseInt(strategyMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-strategy.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No strategy config' }), true;
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    if (idx < 0 || idx >= cfg.strategies.length) return json(res, 404, { error: 'Strategy index out of range' }), true;
    const removed = cfg.strategies.splice(idx, 1)[0];
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, removed }), true;
  }

  if (m === 'GET' && p === '/api/ig/strategy-templates') {
    if (!existsSync(TEMPLATES_DIR)) return json(res, 200, { templates: [] }), true;
    const files = readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json')).sort();
    const templates = [];
    for (const f of files) {
      try {
        const data = JSON.parse(readFileSync(join(TEMPLATES_DIR, f), 'utf8'));
        templates.push({ id: f.replace(/\.json$/, ''), filename: f, ...data });
      } catch (_) {}
    }
    return json(res, 200, { templates }), true;
  }

  if (m === 'POST' && p === '/api/ig/strategy-templates') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (!body.name) return json(res, 400, { error: 'Template name is required' }), true;
    if (!existsSync(TEMPLATES_DIR)) mkdirSync(TEMPLATES_DIR, { recursive: true });
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 50);
    const filename = slug + '.json';
    const template = {};
    for (const key of ['name', 'description', 'instrument', 'instrumentName', 'direction', 'entryBelow', 'entryAbove', 'stopDistance', 'limitDistance', 'size']) {
      if (body[key] !== undefined) template[key] = body[key];
    }
    saveJsonFile(join(TEMPLATES_DIR, filename), template);
    return json(res, 200, { ok: true, id: slug, filename, template }), true;
  }

  const templateDeleteMatch = p.match(/^\/api\/ig\/strategy-templates\/([a-z0-9-]+)$/);
  if (m === 'DELETE' && templateDeleteMatch) {
    const id = templateDeleteMatch[1];
    const filePath = join(TEMPLATES_DIR, id + '.json');
    if (!existsSync(filePath)) return json(res, 404, { error: 'Template not found' }), true;
    unlinkSync(filePath);
    return json(res, 200, { ok: true, deleted: id }), true;
  }

  if (m === 'GET' && p === '/api/ig/watchedlist') {
    const cfgPath = join(DATA_DIR, 'ig-monitor-config.json');
    const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
    return json(res, 200, loadJsonFile(cfgPath, defaults)), true;
  }

  if (m === 'POST' && p === '/api/ig/watchedlist') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (!body.epic || typeof body.epic !== 'string') return json(res, 400, { error: 'Missing epic' }), true;
    const cfgPath = join(DATA_DIR, 'ig-monitor-config.json');
    const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
    let cfg = loadJsonFile(cfgPath, defaults);
    if (!Array.isArray(cfg.instruments)) cfg.instruments = [];
    if (cfg.instruments.some(i => i.epic === body.epic)) return json(res, 409, { error: 'Instrument already in watchlist' }), true;
    const inst = { epic: body.epic, name: body.name || body.epic };
    cfg.instruments.push(inst);
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, instrument: inst, instruments: cfg.instruments }), true;
  }

  if (m === 'DELETE' && p.startsWith('/api/ig/watchedlist/')) {
    const idx = parseInt(p.replace('/api/ig/watchedlist/', ''), 10);
    const cfgPath = join(DATA_DIR, 'ig-monitor-config.json');
    if (!existsSync(cfgPath)) return json(res, 404, { error: 'No watchlist config' }), true;
    const defaults = { instruments: [], signals: { dropPercent: 0.5, spikePercent: 0.5, windowSeconds: 30 }, intervalSeconds: 15, enabled: true };
    let cfg = loadJsonFile(cfgPath, defaults);
    if (!Array.isArray(cfg.instruments)) cfg.instruments = [];
    if (isNaN(idx) || idx < 0 || idx >= cfg.instruments.length) return json(res, 404, { error: 'Index out of range' }), true;
    const removed = cfg.instruments.splice(idx, 1)[0];
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, removed, instruments: cfg.instruments }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper') {
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const defaults = { enabled: false, strategies: [], riskPerTrade: 1, maxConcurrentTrades: 3, cooldownSeconds: 60 };
    return json(res, 200, loadJsonFile(cfgPath, defaults)), true;
  }

  if (m === 'PUT' && p === '/api/ig/scalper') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const defaults = { enabled: false, strategies: [], riskPerTrade: 1, maxConcurrentTrades: 3, cooldownSeconds: 60 };
    const cfg = loadJsonFile(cfgPath, defaults);
    if (body.riskPerTrade !== undefined) cfg.riskPerTrade = Number(body.riskPerTrade);
    if (body.maxConcurrentTrades !== undefined) cfg.maxConcurrentTrades = Number(body.maxConcurrentTrades);
    if (body.cooldownSeconds !== undefined) cfg.cooldownSeconds = Number(body.cooldownSeconds);
    if (body.enabled !== undefined) cfg.enabled = !!body.enabled;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, ...cfg }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/status') {
    return json(res, 200, { running: false, _localMode: true, message: 'Scalper engine requires ceo-proxy for real-time execution', activeTrades: [], stats: { totalTrades: 0, winRate: 0, profitLoss: 0 } }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/start') {
    return json(res, 200, { ok: false, _localMode: true, error: 'Scalper engine requires ceo-proxy for real-time execution. Use start-mechanicus.ps1 instead.' }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/stop') {
    return json(res, 200, { ok: true, running: false }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/reset') {
    return json(res, 200, { ok: true, reset: true }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/strategies') {
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const cfg = loadJsonFile(cfgPath, { strategies: [] });
    return json(res, 200, { strategies: cfg.strategies || [] }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/strategies') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const defaults = { enabled: false, strategies: [], riskPerTrade: 1, maxConcurrentTrades: 3, cooldownSeconds: 60 };
    const cfg = loadJsonFile(cfgPath, defaults);
    if (!Array.isArray(cfg.strategies)) cfg.strategies = [];
    const strat = {
      instrument: body.instrument || '',
      name: body.name || body.instrument || 'New Strategy',
      type: body.type || 'ema-crossover',
      enabled: body.enabled !== undefined ? !!body.enabled : false,
      size: Number(body.size) || 1,
      params: body.params || {},
    };
    cfg.strategies.push(strat);
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: cfg.strategies.length - 1, strategy: strat }), true;
  }

  const scalperStratMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)$/);
  const scalperToggleMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/toggle$/);

  if (m === 'POST' && scalperToggleMatch) {
    const idx = parseInt(scalperToggleMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const cfg = loadJsonFile(cfgPath, { strategies: [] });
    if (!cfg.strategies || idx < 0 || idx >= cfg.strategies.length) return json(res, 400, { error: 'Invalid index' }), true;
    cfg.strategies[idx].enabled = !cfg.strategies[idx].enabled;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, enabled: cfg.strategies[idx].enabled }), true;
  }

  if (m === 'PUT' && scalperStratMatch) {
    const idx = parseInt(scalperStratMatch[1], 10);
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const cfg = loadJsonFile(cfgPath, { strategies: [] });
    if (!cfg.strategies || idx < 0 || idx >= cfg.strategies.length) return json(res, 400, { error: 'Invalid index' }), true;
    const s = cfg.strategies[idx];
    if (body.name !== undefined) s.name = body.name;
    if (body.enabled !== undefined) s.enabled = !!body.enabled;
    if (body.size !== undefined) s.size = Number(body.size);
    if (body.type !== undefined) s.type = body.type;
    if (body.instrument !== undefined) s.instrument = body.instrument;
    if (body.params !== undefined) s.params = body.params;
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, index: idx, strategy: s }), true;
  }

  if (m === 'DELETE' && scalperStratMatch) {
    const idx = parseInt(scalperStratMatch[1], 10);
    const cfgPath = join(DATA_DIR, 'ig-scalper-config.json');
    const cfg = loadJsonFile(cfgPath, { strategies: [] });
    if (!cfg.strategies || idx < 0 || idx >= cfg.strategies.length) return json(res, 400, { error: 'Invalid index' }), true;
    const removed = cfg.strategies.splice(idx, 1)[0];
    saveJsonFile(cfgPath, cfg);
    return json(res, 200, { ok: true, removed }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/strategy-schemas') {
    return json(res, 200, { schemas: { 'ema-crossover': { name: 'EMA Crossover', params: { fastPeriod: 9, slowPeriod: 21, size: 1 } }, 'rsi-reversal': { name: 'RSI Reversal', params: { period: 14, overbought: 70, oversold: 30, size: 1 } }, 'bollinger-bounce': { name: 'Bollinger Bounce', params: { period: 20, stdDev: 2, size: 1 } } } }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/backtests') {
    const backtestDir = join(DATA_DIR, 'ig-scalper-backtests');
    if (!existsSync(backtestDir)) return json(res, 200, { backtests: [] }), true;
    const files = readdirSync(backtestDir).filter(f => f.endsWith('.json')).sort().reverse();
    const backtests = [];
    for (const f of files.slice(0, 50)) {
      try { backtests.push(JSON.parse(readFileSync(join(backtestDir, f), 'utf8'))); } catch (_) {}
    }
    return json(res, 200, { backtests }), true;
  }

  if (m === 'DELETE' && p === '/api/ig/scalper/backtests') {
    const backtestDir = join(DATA_DIR, 'ig-scalper-backtests');
    if (existsSync(backtestDir)) {
      for (const f of readdirSync(backtestDir)) { try { unlinkSync(join(backtestDir, f)); } catch (_) {} }
    }
    return json(res, 200, { ok: true, message: 'All backtests deleted' }), true;
  }

  const backtestListMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/backtests$/);
  if (m === 'GET' && backtestListMatch) {
    return json(res, 200, { backtests: [] }), true;
  }

  const backtestRunMatch = p.match(/^\/api\/ig\/scalper\/strategies\/(\d+)\/backtest$/);
  if (m === 'POST' && backtestRunMatch) {
    return json(res, 200, { ok: false, _localMode: true, error: 'Backtesting requires ceo-proxy with scalper engine' }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/batch-backtest') {
    return json(res, 200, { ok: false, _localMode: true, error: 'Batch backtesting requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/batch-backtest') {
    return json(res, 200, { batches: [] }), true;
  }

  const batchDetailMatch = p.match(/^\/api\/ig\/scalper\/batch-backtest\/([^/]+)$/);
  if (m === 'GET' && batchDetailMatch) {
    return json(res, 200, { batchId: batchDetailMatch[1], results: [] }), true;
  }
  if (m === 'DELETE' && batchDetailMatch) {
    return json(res, 200, { ok: true }), true;
  }

  if (m === 'POST' && p === '/api/ig/scalper/optimize') {
    return json(res, 200, { ok: false, _localMode: true, error: 'Optimization requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/ig/scalper/optimization-memory') {
    return json(res, 200, { memories: [] }), true;
  }

  const optMemInstrMatch = p.match(/^\/api\/ig\/scalper\/optimization-memory\/([\w.]+)$/);
  if (m === 'GET' && optMemInstrMatch) {
    return json(res, 200, { memories: [] }), true;
  }
  if (m === 'DELETE' && (p === '/api/ig/scalper/optimization-memory' || optMemInstrMatch)) {
    return json(res, 200, { ok: true }), true;
  }

  if (p === '/api/ig/logs/scalper-trades') {
    const filePath = join(DATA_DIR, 'ig-scalper-trades.json');
    if (!existsSync(filePath)) return json(res, 200, []), true;
    try {
      const trades = JSON.parse(readFileSync(filePath, 'utf8'));
      return json(res, 200, Array.isArray(trades) ? trades : []), true;
    } catch (_) {
      return json(res, 200, []), true;
    }
  }

  if (m === 'GET' && p === '/api/clawscript/strategies') {
    const meta = loadClawScriptMeta();
    return json(res, 200, meta), true;
  }

  if (m === 'POST' && p === '/api/clawscript/strategies') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    const { name, filename, code, js, variables, imports, metadata } = body;
    if (!name || !filename || !js) return json(res, 400, { error: 'Missing name, filename, or js' }), true;
    const safeFilename = filename.replace(/[^a-zA-Z0-9_\-.]/g, '');
    if (!safeFilename.endsWith('-strategy.cjs')) return json(res, 400, { error: 'Filename must end with -strategy.cjs' }), true;
    const typeMatch = js.match(/STRATEGY_TYPE\(\)\s*\{\s*return\s*['"]([^'"]+)['"]/);
    const strategyType = typeMatch ? typeMatch[1] : 'custom-' + name.toLowerCase().replace(/\s+/g, '-');
    const meta = loadClawScriptMeta();
    const existing = meta.strategies.findIndex(s => s.filename === safeFilename);
    const entry = { name, filename: safeFilename, strategyType, variables: variables || [], imports: imports || [], metadata: metadata || null, clawscript: true, savedAt: new Date().toISOString(), sourceCode: code || '' };
    if (existing >= 0) meta.strategies[existing] = entry;
    else meta.strategies.push(entry);
    saveClawScriptMeta(meta);
    return json(res, 200, { ok: true, entry }), true;
  }

  const csDeleteMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)$/);
  if (m === 'DELETE' && csDeleteMatch) {
    const target = decodeURIComponent(csDeleteMatch[1]);
    const meta = loadClawScriptMeta();
    const idx = meta.strategies.findIndex(s => s.filename === target || s.name === target);
    if (idx < 0) return json(res, 404, { error: 'Strategy not found' }), true;
    meta.strategies.splice(idx, 1);
    saveClawScriptMeta(meta);
    return json(res, 200, { ok: true, deleted: target }), true;
  }

  const csSchemaMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)\/schema$/);
  if (m === 'GET' && csSchemaMatch) {
    const target = decodeURIComponent(csSchemaMatch[1]);
    const meta = loadClawScriptMeta();
    const entry = meta.strategies.find(s => s.filename === target || s.strategyType === target || s.name === target);
    if (!entry) return json(res, 404, { error: 'Strategy not found' }), true;
    return json(res, 200, { name: entry.name, type: entry.strategyType, schema: {}, variables: entry.variables, metadata: entry.metadata || null, sourceCode: entry.sourceCode }), true;
  }

  const csSourceMatch = p.match(/^\/api\/clawscript\/strategies\/([^/]+)\/source$/);
  if (m === 'GET' && csSourceMatch) {
    const target = decodeURIComponent(csSourceMatch[1]);
    const meta = loadClawScriptMeta();
    const entry = meta.strategies.find(s => s.filename === target || s.name === target);
    if (!entry) return json(res, 404, { error: 'Strategy not found' }), true;
    return json(res, 200, { name: entry.name, sourceCode: entry.sourceCode || '' }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/compile') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript compiler requires ceo-proxy with clawscript-parser.cjs. Use start-mechanicus.ps1 for full ClawScript support.' }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/backtest') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript backtesting requires ceo-proxy' }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/run') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript execution requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/clawscript/results') {
    return json(res, 200, { results: csLastResults || null }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/results') {
    try {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      if (body.backtest) csLastResults = body.backtest;
      else if (body.simulation) csLastResults = body.simulation;
      return json(res, 200, { ok: true }), true;
    } catch (_) {
      return json(res, 400, { error: 'Invalid JSON' }), true;
    }
  }

  if (m === 'POST' && p === '/api/clawscript/ai') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript AI requires ceo-proxy with XAI_API_KEY configured' }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/ai/chat') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript AI chat requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/clawscript/ai/config') {
    return json(res, 200, { model: 'grok-4-1-fast-reasoning', available: false, _localMode: true }), true;
  }

  if (m === 'GET' && p === '/api/clawscript/scripts') {
    return json(res, 200, { scripts: [] }), true;
  }

  if (m === 'GET' && p === '/api/clawscript/templates') {
    return json(res, 200, { templates: [] }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/templates') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript template saving requires ceo-proxy' }), true;
  }

  const csTemplateDeleteMatch = p.match(/^\/api\/clawscript\/templates\/([^/]+)$/);
  if (m === 'DELETE' && csTemplateDeleteMatch) {
    return json(res, 200, { ok: true }), true;
  }

  if (m === 'POST' && p === '/api/clawscript/sync') {
    return json(res, 200, { ok: false, _localMode: true, error: 'ClawScript sync requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/clawscript/logbook') {
    return json(res, 200, loadClawScriptLogbook()), true;
  }

  if (m === 'POST' && p === '/api/clawscript/logbook') {
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (!body.message) return json(res, 400, { error: 'Missing message' }), true;
    const lb = loadClawScriptLogbook();
    const entry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      type: body.type || 'error',
      epic: body.epic || null,
      strategy: body.strategy || null,
      message: body.message,
      details: body.details || null,
      resolved: false,
    };
    lb.entries.push(entry);
    saveClawScriptLogbook(lb);
    return json(res, 200, { ok: true, entry }), true;
  }

  const logbookPatchMatch = p.match(/^\/api\/clawscript\/logbook\/([^/]+)$/);
  if (m === 'PATCH' && logbookPatchMatch) {
    const targetId = decodeURIComponent(logbookPatchMatch[1]);
    const lb = loadClawScriptLogbook();
    const entry = lb.entries.find(e => e.id === targetId);
    if (!entry) return json(res, 404, { error: 'Logbook entry not found' }), true;
    let body; try { body = JSON.parse((await readBody(req)).toString() || '{}'); } catch (_) { return json(res, 400, { error: 'Invalid JSON' }), true; }
    if (body.resolved !== undefined) entry.resolved = !!body.resolved;
    if (body.message) entry.message = body.message;
    if (body.details) entry.details = body.details;
    entry.updatedAt = new Date().toISOString();
    saveClawScriptLogbook(lb);
    return json(res, 200, { ok: true, entry }), true;
  }

  const csScriptMatch = p.match(/^\/api\/clawscript\/scripts\/([^/]+)\/(stop|start|restart|pause|resume|logs)$/);
  if (csScriptMatch) {
    const action = csScriptMatch[2];
    if (action === 'logs') return json(res, 200, { scriptId: csScriptMatch[1], lines: [], total: 0 }), true;
    return json(res, 200, { ok: false, _localMode: true, error: 'Script management requires ceo-proxy' }), true;
  }

  if (m === 'GET' && p === '/api/bots') {
    const regPath = join(DATA_DIR, 'bot-registry.json');
    let registry = [];
    try { if (existsSync(regPath)) registry = JSON.parse(readFileSync(regPath, 'utf8')); } catch (_) {}
    const bots = registry.map(b => ({
      id: b.id, cmd: b.cmd, enabled: b.enabled, running: false,
      pid: null, restarts: 0, addedBy: b.addedBy || 'unknown', addedAt: b.addedAt || null,
    }));
    return json(res, 200, { bots }), true;
  }

  if (m === 'POST' && p === '/api/bots/register') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    if (!body.id || !body.cmd) return json(res, 400, { error: 'id and cmd required' }), true;
    const regPath = join(DATA_DIR, 'bot-registry.json');
    let registry = [];
    try { if (existsSync(regPath)) registry = JSON.parse(readFileSync(regPath, 'utf8')); } catch (_) {}
    const existing = registry.find(b => b.id === body.id);
    if (existing) { existing.cmd = body.cmd; existing.enabled = true; }
    else registry.push({ id: body.id, cmd: body.cmd, enabled: true, addedBy: body.addedBy || 'api', addedAt: new Date().toISOString() });
    saveJsonFile(regPath, registry);
    return json(res, 200, { ok: true, bot: registry.find(b => b.id === body.id), _localMode: true, message: 'Bot registered but cannot be spawned in local mode' }), true;
  }

  const botIdMatch = p.match(/^\/api\/bots\/([^/]+)\/?(start|stop)?$/);
  if (botIdMatch) {
    const action = botIdMatch[2];
    if (m === 'POST' && (action === 'start' || action === 'stop')) {
      return json(res, 200, { ok: false, _localMode: true, error: 'Bot process management requires ceo-proxy' }), true;
    }
    if (m === 'DELETE' && !action) {
      const botId = decodeURIComponent(botIdMatch[1]);
      const regPath = join(DATA_DIR, 'bot-registry.json');
      let registry = [];
      try { if (existsSync(regPath)) registry = JSON.parse(readFileSync(regPath, 'utf8')); } catch (_) {}
      const newReg = registry.filter(b => b.id !== botId);
      saveJsonFile(regPath, newReg);
      return json(res, 200, { ok: true, removed: botId }), true;
    }
    if (m === 'PATCH' && !action) {
      const botId = decodeURIComponent(botIdMatch[1]);
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const regPath = join(DATA_DIR, 'bot-registry.json');
      let registry = [];
      try { if (existsSync(regPath)) registry = JSON.parse(readFileSync(regPath, 'utf8')); } catch (_) {}
      const bot = registry.find(b => b.id === botId);
      if (!bot) return json(res, 404, { error: 'Bot not found' }), true;
      if (typeof body.enabled === 'boolean') bot.enabled = body.enabled;
      saveJsonFile(regPath, registry);
      return json(res, 200, { ok: true, id: botId, enabled: bot.enabled }), true;
    }
  }

  if (m === 'GET' && p === '/api/processes') {
    return json(res, 200, { processes: [], _localMode: true }), true;
  }

  if (m === 'POST' && p === '/api/processes/kill') {
    return json(res, 200, { ok: false, _localMode: true, error: 'Process management requires ceo-proxy' }), true;
  }

  return false;
}
