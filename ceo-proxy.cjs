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
const TASKS_FILE = path.join(DATA_DIR, "worker-tasks.json");
const CHAT_FILE = path.join(DATA_DIR, "ceo-chat.json");
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

let gatewayWs = null;
let gwReqCounter = 0;
let gwSessionKey = null;

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
        if (msg.type === "event" && msg.event === "chat" && msg.payload) {
          const pm = msg.payload.message;
          const runId = msg.payload.runId || "";
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
              let foundWorker = null;
              let foundWid = null;
              for (const [id, wr] of workers) {
                if (wr.name.toLowerCase() === wName.toLowerCase()) {
                  foundWorker = wr;
                  foundWid = id;
                  break;
                }
              }
              if (!foundWorker) continue;
              const now = Date.now();
              if (lastAutoDispatch[foundWorker.name] && now - lastAutoDispatch[foundWorker.name] < 30000) {
                console.log("[ceo-proxy] Skipping auto-dispatch to", foundWorker.name, "(cooldown)");
                continue;
              }
              lastAutoDispatch[foundWorker.name] = now;
              const bodyMatch = text.match(new RegExp("@" + wName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+([\\s\\S]+)"));
              const body = bodyMatch ? bodyMatch[1] : text;
              console.log("[ceo-proxy] CEO agent mentioned worker:", foundWorker.name, "- auto-dispatching");
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
      setTimeout(connectGateway, 5000);
    });
    ws.on("error", () => {
      gatewayWs = null;
      gwConnecting = false;
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

if (!fs.existsSync(API_KEYS_FILE)) {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify({ keys: [] }, null, 2));
}
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [], results: [] }, null, 2));
}
if (!fs.existsSync(CHAT_FILE)) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify({ messages: [] }, null, 2));
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { return fallback; }
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const workers = new Map();

function authGateway(req) {
  const h = req.headers["authorization"];
  if (!h) return false;
  return h.replace(/^Bearer\s+/i, "") === GATEWAY_TOKEN;
}

function authWorker(req) {
  const h = req.headers["authorization"];
  if (!h) return null;
  const tok = h.replace(/^Bearer\s+/i, "");
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
    const wid = apiKey.id;
    workers.set(wid, {
      name: body.name || apiKey.name,
      agentId: body.agentId || "default",
      platform: body.platform || "unknown",
      version: body.version || "unknown",
      lastSeen: Date.now(),
      connectedAt: workers.has(wid) ? workers.get(wid).connectedAt : Date.now(),
    });
    const data = loadJson(API_KEYS_FILE, { keys: [] });
    const k = data.keys.find((x) => x.id === apiKey.id);
    if (k) { k.lastUsed = new Date().toISOString(); saveJson(API_KEYS_FILE, data); }
    return json(res, 200, { workerId: wid, status: "registered" });
  }

  if (req.method === "POST" && p === "/api/workers/heartbeat") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    if (workers.has(apiKey.id)) workers.get(apiKey.id).lastSeen = Date.now();
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET" && p === "/api/workers/poll") {
    const apiKey = authWorker(req);
    if (!apiKey) return json(res, 401, { error: "Invalid API key" });
    if (workers.has(apiKey.id)) workers.get(apiKey.id).lastSeen = Date.now();
    const data = loadJson(TASKS_FILE, { tasks: [], results: [] });
    const pending = data.tasks.filter((t) => t.assignedTo === apiKey.id && t.status === "pending");
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
    data.results.push({
      taskId: body.taskId, workerId: apiKey.id,
      result: body.result || "", completedAt: new Date().toISOString(),
    });
    saveJson(TASKS_FILE, data);

    const workerName = workers.has(apiKey.id) ? workers.get(apiKey.id).name : apiKey.name;
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
    }

    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE" && p.match(/^\/api\/workers\/[^/]+$/)) {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    const wid = p.split("/")[3];
    if (workers.has(wid)) {
      workers.delete(wid);
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: "Worker not found" });
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
    const body = JSON.parse((await readBody(req)).toString());
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
    const msg = {
      id: crypto.randomUUID(),
      from: body.from || (isGw ? "CEO" : (apiKey ? apiKey.name : "unknown")),
      role: isGw ? "ceo" : "worker",
      text: body.text || body.message || "",
      ts: new Date().toISOString(),
    };
    const data = loadJson(CHAT_FILE, { messages: [] });
    data.messages.push(msg);
    if (data.messages.length > 500) data.messages = data.messages.slice(-500);
    saveJson(CHAT_FILE, data);
    return json(res, 201, msg);
  }

  if (req.method === "DELETE" && p === "/api/chat") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" });
    saveJson(CHAT_FILE, { messages: [] });
    return json(res, 200, { ok: true });
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

  if (p === "/api/dispatch" && req.method === "POST") {
    if (!authGateway(req)) return json(res, 401, { error: "Unauthorized" }), true;
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const workerName = body.workerName;
    const message = body.message || "";
    if (!workerName) return json(res, 400, { error: "workerName required" }), true;
    let w = null;
    let wid = null;
    for (const [id, wr] of workers) { if (wr.name.toLowerCase() === workerName.toLowerCase()) { w = wr; wid = id; break; } }
    if (!w) return json(res, 404, { error: "Worker not found: " + workerName }), true;
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

  if (p.startsWith("/api/keys")) { await handleApiKeys(req, res, p); return true; }
  if (p.startsWith("/api/workers")) { await handleWorkers(req, res, p); return true; }
  if (p.startsWith("/api/tasks")) { await handleTasks(req, res, p); return true; }
  if (p.startsWith("/api/exchange")) { await handleExchange(req, res, p); return true; }
  if (p.startsWith("/api/chat")) { await handleChat(req, res, p); return true; }
  return false;
}

function proxyReq(req, res) {
  const opts = {
    hostname: "127.0.0.1",
    port: GATEWAY_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: "127.0.0.1:" + GATEWAY_PORT },
  };
  const noCache = /\/(worker-chat|nav-inject|token-init|workers)\.(js|css|html)/.test(req.url);
  const p = http.request(opts, (pr) => {
    const headers = { ...pr.headers };
    if (noCache) {
      headers["cache-control"] = "no-cache, no-store, must-revalidate";
      headers["pragma"] = "no-cache";
      headers["expires"] = "0";
    }
    res.writeHead(pr.statusCode, headers);
    pr.pipe(res);
  });
  p.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Bad Gateway - OpenClaw gateway starting...");
    }
  });
  req.pipe(p);
}

const server = http.createServer(async (req, res) => {
  try {
    if (!(await handleApi(req, res))) proxyReq(req, res);
  } catch (err) {
    console.error("[ceo-proxy] error:", err);
    if (!res.headersSent) json(res, 500, { error: "Internal server error" });
  }
});

server.on("upgrade", (req, socket, head) => {
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
});

setInterval(() => {
  for (const [id, w] of workers) {
    if (Date.now() - w.lastSeen > 300000) workers.delete(id);
  }
}, 60000);
