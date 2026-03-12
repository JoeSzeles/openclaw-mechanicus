const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const BRAIN_PORT = 8000;
const BRAIN_HOST = "127.0.0.1";
const STATUS_CHECK_INTERVAL = 15000;

let brainProcess = null;
let running = false;
let autoRestart = false;
let restartCount = 0;
let lastStartedAt = null;
let lastStoppedAt = null;
let logs = [];
let statusCheckTimer = null;
const MAX_RESTARTS = 10;

function log(level, msg) {
  const ts = new Date().toISOString();
  const entry = { ts, level, msg };
  logs.unshift(entry);
  if (logs.length > 500) logs.pop();
  if (level === "ERROR") console.error(`[brain-engine] ${msg}`);
  else console.log(`[brain-engine] ${msg}`);
}

function findBrainScript() {
  const candidates = [
    path.join(process.cwd(), "brain_engine.py"),
    path.join(process.cwd(), ".openclaw", "brain_engine.py"),
    path.join(process.cwd(), "BrainJar", "brain_engine.py"),
    path.join(process.cwd(), "openclaw-mechanicus-patches", "brain_engine.py"),
    path.join(process.cwd(), "openclaw-mechanicus-patches", "brainjar", "brain_engine.py"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function isRunning() {
  return running && brainProcess && !brainProcess.killed;
}

async function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://${BRAIN_HOST}:${BRAIN_PORT}/status`, { timeout: 3000 }, (res) => {
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

function start(scriptPath) {
  if (isRunning()) {
    log("WARN", "Brain engine already running (PID " + brainProcess.pid + ")");
    return { ok: false, error: "Already running" };
  }

  const resolvedPath = scriptPath || findBrainScript();
  if (!resolvedPath) {
    log("ERROR", "brain_engine.py not found in known locations");
    return { ok: false, error: "brain_engine.py not found" };
  }

  log("INFO", "Starting brain engine: " + resolvedPath);

  try {
    brainProcess = spawn("python3", [resolvedPath], {
      cwd: path.dirname(resolvedPath),
      env: { ...process.env, BRAIN_PORT: String(BRAIN_PORT) },
      stdio: ["pipe", "pipe", "pipe"],
    });

    running = true;
    lastStartedAt = new Date().toISOString();

    brainProcess.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((l) => log("INFO", l));
    });

    brainProcess.stderr.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((l) => log("WARN", l));
    });

    brainProcess.on("exit", (code, signal) => {
      running = false;
      lastStoppedAt = new Date().toISOString();
      log("INFO", "Brain engine exited (code=" + code + ", signal=" + signal + ")");
      if (autoRestart && code !== 0 && restartCount < MAX_RESTARTS) {
        restartCount++;
        log("INFO", "Auto-restarting (attempt " + restartCount + "/" + MAX_RESTARTS + ")...");
        setTimeout(() => start(resolvedPath), 3000);
      } else if (autoRestart && restartCount >= MAX_RESTARTS) {
        log("ERROR", "Max restarts (" + MAX_RESTARTS + ") reached. Auto-restart disabled.");
        autoRestart = false;
      }
    });

    brainProcess.on("error", (err) => {
      running = false;
      log("ERROR", "Brain engine spawn error: " + err.message);
    });

    startStatusCheck();
    return { ok: true, pid: brainProcess.pid, script: resolvedPath };
  } catch (e) {
    log("ERROR", "Failed to start brain engine: " + e.message);
    return { ok: false, error: e.message };
  }
}

function stop() {
  if (!isRunning()) {
    log("WARN", "Brain engine not running");
    return { ok: false, error: "Not running" };
  }

  log("INFO", "Stopping brain engine (PID " + brainProcess.pid + ")...");
  const proc = brainProcess;
  brainProcess.kill("SIGTERM");
  setTimeout(() => {
    try {
      process.kill(proc.pid, 0);
      log("WARN", "Force killing brain engine...");
      proc.kill("SIGKILL");
    } catch (_) {}
  }, 5000);

  running = false;
  lastStoppedAt = new Date().toISOString();
  stopStatusCheck();
  return { ok: true };
}

function restart(scriptPath) {
  stop();
  return new Promise((resolve) => {
    setTimeout(() => resolve(start(scriptPath)), 2000);
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
      log("WARN", "Brain engine health check failed");
    }
  }, STATUS_CHECK_INTERVAL);
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
    port: BRAIN_PORT,
  };
}

function getLogs(limit) {
  return logs.slice(0, limit || 100);
}

function cleanup() {
  if (isRunning()) {
    log("INFO", "Parent exiting, stopping brain engine...");
    try { brainProcess.kill("SIGTERM"); } catch (_) {}
  }
  stopStatusCheck();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

module.exports = { start, stop, restart, setAutoRestart, getStatus, getLogs, isRunning, checkHealth, log, findBrainScript };
