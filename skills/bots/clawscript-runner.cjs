'use strict';
const fs = require('fs');
const path = require('path');

const SCRIPT_FILE = process.argv[2];
if (!SCRIPT_FILE) {
  console.error('[cs-runner] Usage: node clawscript-runner.cjs <script.cs>');
  process.exit(1);
}

const SCRIPT_ID = process.env.CS_SCRIPT_ID || path.basename(SCRIPT_FILE, '.cs');
const LOG_DIR = path.join(process.cwd(), '.openclaw', 'clawscript-logs');
const LOG_FILE = path.join(LOG_DIR, `${SCRIPT_ID}.log`);
const DATA_DIR = path.join(process.cwd(), '.openclaw');

try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

let paused = false;
let running = true;
let iteration = 0;

function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
}

function statusLine(state, extra) {
  const obj = { type: 'status', scriptId: SCRIPT_ID, state, iteration, paused, ...extra };
  console.log(JSON.stringify(obj));
}

process.on('SIGUSR1', () => {
  paused = true;
  log('INFO', 'Script PAUSED');
  statusLine('paused');
});

process.on('SIGUSR2', () => {
  paused = false;
  log('INFO', 'Script RESUMED');
  statusLine('running');
});

process.on('SIGTERM', () => {
  log('INFO', 'Script stopping (SIGTERM)');
  running = false;
  statusLine('stopping');
  setTimeout(() => process.exit(0), 500);
});

process.on('SIGINT', () => {
  running = false;
  process.exit(0);
});

let parser, automation;
try {
  parser = require('./clawscript-parser.cjs');
} catch (e) {
  log('ERROR', `Failed to load parser: ${e.message}`);
  process.exit(1);
}
try {
  automation = require('./openclaw-automation.cjs');
} catch (e) {
  log('WARN', `Automation module not loaded: ${e.message}`);
}

let scriptCode;
try {
  const absPath = path.isAbsolute(SCRIPT_FILE) ? SCRIPT_FILE : path.join(process.cwd(), SCRIPT_FILE);
  scriptCode = fs.readFileSync(absPath, 'utf8');
} catch (e) {
  log('ERROR', `Failed to read script file: ${e.message}`);
  process.exit(1);
}

log('INFO', `Starting script: ${SCRIPT_ID} (${SCRIPT_FILE})`);
log('INFO', `Script size: ${scriptCode.length} chars`);

let parsed;
try {
  parsed = parser.parseAndGenerate(scriptCode);
} catch (e) {
  log('ERROR', `Parse error: ${e.message}`);
  process.exit(1);
}

log('INFO', `Compiled: ${parsed.ast?.body?.length || 0} AST nodes, ${parsed.js?.length || 0} chars JS`);

const generatedJS = parsed.js || '';

const hasLoop = /\bLOOP\b|\bWHILE\b|\bSCHEDULE\b|\bCRON_CREATE\b/.test(scriptCode);
const hasTrade = /\bBUY\b|\bSELL\b|\bEXIT\b|\bTRAILSTOP\b/.test(scriptCode);

const INTERVAL_MS = hasTrade ? 30000 : 60000;

function buildSandbox() {
  const sandbox = {
    console: {
      log: (...args) => log('INFO', args.join(' ')),
      warn: (...args) => log('WARN', args.join(' ')),
      error: (...args) => log('ERROR', args.join(' ')),
    },
    require: (mod) => {
      if (mod === './base-strategy.cjs' || mod.includes('base-strategy')) {
        return require(path.join(process.cwd(), 'skills', 'bots', 'strategies', 'base-strategy.cjs'));
      }
      if (mod === '../indicators.cjs' || mod.includes('indicators')) {
        return require(path.join(process.cwd(), 'skills', 'bots', 'indicators.cjs'));
      }
      if (mod === '../openclaw-trade.cjs' || mod.includes('openclaw-trade')) {
        return {
          buy: (size, opts) => { log('TRADE', `BUY size=${size} ${JSON.stringify(opts || {})}`); return { ok: true, simulated: true }; },
          sell: (size, opts) => { log('TRADE', `SELL size=${size} ${JSON.stringify(opts || {})}`); return { ok: true, simulated: true }; },
          exit: (opts) => { log('TRADE', `EXIT ${JSON.stringify(opts || {})}`); return { ok: true, simulated: true }; },
        };
      }
      if (mod === '../openclaw-automation.cjs' || mod.includes('openclaw-automation')) {
        return automation || {};
      }
      return require(mod);
    },
    setTimeout, setInterval, clearTimeout, clearInterval,
    Date, Math, JSON, Array, Object, String, Number, Boolean,
    Map, Set, Promise, RegExp, Error,
    Buffer, process: { env: process.env, cwd: () => process.cwd() },
    fetch: globalThis.fetch,
    __filename: SCRIPT_FILE,
    __dirname: path.dirname(path.resolve(SCRIPT_FILE)),
  };
  return sandbox;
}

let strategyClass = null;
try {
  const sandbox = buildSandbox();
  const wrappedCode = `(function(module, exports, require, console, setTimeout, setInterval, clearTimeout, clearInterval, Date, Math, JSON, Array, Object, String, Number, Boolean, Map, Set, Promise, RegExp, Error, Buffer, process, fetch, __filename, __dirname) { ${generatedJS}\nreturn module.exports; })`;
  const mod = { exports: {} };
  const factory = eval(wrappedCode);
  strategyClass = factory(
    mod, mod.exports, sandbox.require, sandbox.console,
    setTimeout, setInterval, clearTimeout, clearInterval,
    Date, Math, JSON, Array, Object, String, Number, Boolean,
    Map, Set, Promise, RegExp, Error, Buffer, sandbox.process, sandbox.fetch,
    sandbox.__filename, sandbox.__dirname
  );
  if (strategyClass && typeof strategyClass === 'function') {
    log('INFO', 'Strategy class loaded successfully');
  } else {
    log('INFO', 'Script compiled (no strategy class export)');
  }
} catch (e) {
  log('ERROR', `Failed to load generated JS: ${e.message}`);
  log('INFO', 'Will run in source-execution mode');
}

async function executeIteration() {
  iteration++;
  log('INFO', `--- Iteration #${iteration} ---`);

  try {
    if (strategyClass && typeof strategyClass === 'function') {
      const config = {
        enabled: true,
        size: 1,
        stopDistance: 20,
        limitDistance: 40,
        scriptId: SCRIPT_ID,
      };
      const instance = new strategyClass(config);
      
      const mockTicks = [];
      const basePrice = 50000 + Math.random() * 2000;
      for (let i = 0; i < 100; i++) {
        mockTicks.push({
          mid: basePrice + (Math.random() - 0.5) * 500,
          close: basePrice + (Math.random() - 0.5) * 500,
          price: basePrice + (Math.random() - 0.5) * 500,
          timestamp: Date.now() - (100 - i) * 60000,
        });
      }

      if (typeof instance.evaluateEntry === 'function') {
        const signal = await instance.evaluateEntry(mockTicks, { iteration });
        if (signal && signal.signal) {
          log('TRADE', `Signal: ${signal.direction} size=${signal.size} type=${signal.orderType} reason="${signal.reason || 'auto'}"`);
        } else {
          log('INFO', 'No trade signal');
        }
      }

      if (typeof instance.evaluateExit === 'function') {
        const exitResult = await instance.evaluateExit(null, mockTicks, { iteration });
        if (exitResult && exitResult.close) {
          log('TRADE', `Exit signal: ${exitResult.reason || 'auto'}`);
        }
      }
    } else {
      log('INFO', 'Running automation commands...');
      if (automation && typeof automation.taskLog === 'function') {
        await automation.taskLog(`Iteration #${iteration} for ${SCRIPT_ID}`, 'info');
      }
    }
  } catch (e) {
    log('ERROR', `Iteration error: ${e.message}`);
  }
}

async function main() {
  statusLine('running');
  log('INFO', `Script runner started. Mode: ${hasLoop ? 'loop' : 'periodic'}, interval: ${INTERVAL_MS}ms`);

  await executeIteration();

  if (!hasLoop && !hasTrade) {
    log('INFO', 'Single-run script completed. Staying alive for monitoring...');
    statusLine('idle');
  }

  const loop = setInterval(async () => {
    if (!running) {
      clearInterval(loop);
      log('INFO', 'Script runner stopped');
      statusLine('stopped');
      process.exit(0);
    }
    if (paused) {
      return;
    }
    await executeIteration();
    statusLine('running', { iteration });
  }, INTERVAL_MS);
}

main().catch(e => {
  log('ERROR', `Fatal: ${e.message}`);
  process.exit(1);
});
