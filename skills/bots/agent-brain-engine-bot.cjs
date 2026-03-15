const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const HOME = process.env.HOME || "/home/runner";
const AGENT_BRAIN_DIR = path.join(HOME, ".openclaw", "agent-brain");
const PORT_FILENAME = "agent-brain-engine-port";
const PORT_FILE = path.join(HOME, ".openclaw", PORT_FILENAME);

try { fs.mkdirSync(AGENT_BRAIN_DIR, { recursive: true }); } catch (_) {}

let brainProcess = null;
let running = false;
let autoRestart = true;
let restartCount = 0;
let lastStartedAt = null;
let lastStoppedAt = null;
let logs = [];
let statusCheckTimer = null;
let actualPort = 0;
const MAX_RESTARTS = 10;

function log(level, msg) {
  const ts = new Date().toISOString();
  logs.unshift({ ts, level, msg });
  if (logs.length > 500) logs.pop();
  if (level === "ERROR") console.error(`[agent-brain] ${msg}`);
  else console.log(`[agent-brain] ${msg}`);
}

function isRunning() {
  return running && brainProcess && !brainProcess.killed;
}

async function checkHealth() {
  if (!actualPort) return null;
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${actualPort}/status`, { timeout: 3000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (_) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

function start() {
  if (isRunning()) {
    log("WARN", "Agent brain already running (PID " + brainProcess.pid + ")");
    return { ok: false, error: "Already running" };
  }

  const scriptPath = path.join(__dirname, "brain-engine-server.cjs");
  if (!fs.existsSync(scriptPath)) {
    log("ERROR", "brain-engine-server.cjs not found at " + scriptPath);
    return { ok: false, error: "brain-engine-server.cjs not found" };
  }

  log("INFO", "Starting agent brain engine: " + scriptPath);
  log("INFO", "Data dir: " + AGENT_BRAIN_DIR);

  try {
    brainProcess = spawn("node", [scriptPath], {
      cwd: __dirname,
      env: {
        ...process.env,
        BRAIN_PORT: "0",
        BRAIN_INSTANCE_ID: "agent",
        BRAIN_DATA_DIR: AGENT_BRAIN_DIR,
        BRAIN_PORT_FILENAME: PORT_FILENAME,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    running = true;
    lastStartedAt = new Date().toISOString();

    brainProcess.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((l) => {
        log("INFO", l);
        const portMatch = l.match(/listening on 127\.0\.0\.1:(\d+)/);
        if (portMatch) {
          actualPort = parseInt(portMatch[1]);
          log("INFO", "Agent brain port detected: " + actualPort);
        }
      });
    });

    brainProcess.stderr.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((l) => log("WARN", l));
    });

    brainProcess.on("exit", (code, signal) => {
      running = false;
      lastStoppedAt = new Date().toISOString();
      log("INFO", "Agent brain exited (code=" + code + ", signal=" + signal + ")");
      if (autoRestart && code !== 0 && restartCount < MAX_RESTARTS) {
        restartCount++;
        log("INFO", "Auto-restarting agent brain (attempt " + restartCount + "/" + MAX_RESTARTS + ")...");
        setTimeout(() => start(), 3000);
      } else if (autoRestart && restartCount >= MAX_RESTARTS) {
        log("ERROR", "Max restarts (" + MAX_RESTARTS + ") reached. Auto-restart disabled.");
        autoRestart = false;
      }
    });

    brainProcess.on("error", (err) => {
      running = false;
      log("ERROR", "Agent brain spawn error: " + err.message);
    });

    startStatusCheck();
    return { ok: true, pid: brainProcess.pid, dataDir: AGENT_BRAIN_DIR };
  } catch (e) {
    log("ERROR", "Failed to start agent brain: " + e.message);
    return { ok: false, error: e.message };
  }
}

function stop() {
  if (!isRunning()) {
    log("WARN", "Agent brain not running");
    return { ok: false, error: "Not running" };
  }

  log("INFO", "Stopping agent brain (PID " + brainProcess.pid + ")...");
  const proc = brainProcess;
  brainProcess.kill("SIGTERM");
  setTimeout(() => {
    try {
      process.kill(proc.pid, 0);
      log("WARN", "Force killing agent brain...");
      proc.kill("SIGKILL");
    } catch (_) {}
  }, 5000);

  running = false;
  lastStoppedAt = new Date().toISOString();
  stopStatusCheck();
  return { ok: true };
}

function restart() {
  stop();
  return new Promise((resolve) => {
    setTimeout(() => resolve(start()), 2000);
  });
}

function setAutoRestart(enabled) {
  autoRestart = enabled;
  log("INFO", "Auto-restart " + (enabled ? "enabled" : "disabled"));
}

function startStatusCheck() {
  stopStatusCheck();
  statusCheckTimer = setInterval(async () => {
    const health = await checkHealth();
    if (!health && running) {
      log("WARN", "Agent brain health check failed");
    }
  }, 15000);
}

function stopStatusCheck() {
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer);
    statusCheckTimer = null;
  }
}

function getStatus() {
  return {
    running: isRunning(),
    pid: brainProcess ? brainProcess.pid : null,
    autoRestart,
    restartCount,
    lastStartedAt,
    lastStoppedAt,
    logCount: logs.length,
    port: actualPort,
    dataDir: AGENT_BRAIN_DIR,
    portFile: PORT_FILE,
  };
}

function getLogs(limit) {
  return logs.slice(0, limit || 100);
}

function getPort() {
  if (actualPort) return actualPort;
  try { return parseInt(fs.readFileSync(PORT_FILE, "utf8").trim()); } catch (_) { return 0; }
}

function cleanup() {
  if (isRunning()) {
    log("INFO", "Parent exiting, stopping agent brain...");
    try { brainProcess.kill("SIGTERM"); } catch (_) {}
  }
  stopStatusCheck();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

module.exports = { start, stop, restart, setAutoRestart, getStatus, getLogs, isRunning, checkHealth, log, getPort };
