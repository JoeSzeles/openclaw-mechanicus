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
  updateCrewFile();
});

setInterval(() => {
  let changed = false;
  for (const [id, w] of workers) {
    if (Date.now() - w.lastSeen > 300000) { workers.delete(id); changed = true; }
  }
  updateBeesFile();
  updateCrewFile();
}, 60000);
