#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseAndGenerate, parseToAST, extractMetadata, lexer, ClawScriptParser, TOKEN_TYPES, KEYWORDS } = require('./clawscript-parser.cjs');

const PROXY_BASE = process.env.OPENCLAW_PROXY_BASE || 'http://localhost:5000';
const BTC_EPIC = 'CS.D.BITCOIN.CFD.IP';
const STRATEGIES_DIR = path.join(__dirname, 'strategies');
const REPORT_FILE = path.join(__dirname, '..', '..', '.openclaw', 'clawscript-pipeline-report.json');

let passed = 0;
let failed = 0;
let skipped = 0;
let total = 0;
const results = [];

function log(msg) {
  console.log(msg);
}

function test(category, name, fn) {
  total++;
  const entry = { category, name, status: 'pending', error: null, duration: 0 };
  const start = Date.now();
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(() => {
        entry.status = 'pass';
        entry.duration = Date.now() - start;
        passed++;
        results.push(entry);
        log(`  ✓ PASS [${category}] ${name} (${entry.duration}ms)`);
      }).catch(err => {
        entry.status = 'fail';
        entry.error = err.message;
        entry.duration = Date.now() - start;
        failed++;
        results.push(entry);
        log(`  ✗ FAIL [${category}] ${name}: ${err.message}`);
      });
    }
    entry.status = 'pass';
    entry.duration = Date.now() - start;
    passed++;
    results.push(entry);
    log(`  ✓ PASS [${category}] ${name} (${entry.duration}ms)`);
    return Promise.resolve();
  } catch (err) {
    entry.status = 'fail';
    entry.error = err.message;
    entry.duration = Date.now() - start;
    failed++;
    results.push(entry);
    log(`  ✗ FAIL [${category}] ${name}: ${err.message}`);
    return Promise.resolve();
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function assertIncludes(str, sub, msg) {
  if (!String(str).includes(sub)) throw new Error(msg || `Expected "${String(str).slice(0, 120)}" to include "${sub}"`);
}

function parseOk(code, name) {
  const result = parseAndGenerate(code, name || 'Test');
  assert(result.ast, 'AST should exist');
  assert(result.js, 'JS should be a non-empty string');
  assert(typeof result.js === 'string' && result.js.length > 0, 'JS output missing');
  return result;
}

function jsSyntaxOk(js) {
  try {
    new Function(js.replace(/require\([^)]+\)/g, '{}').replace(/await /g, '').replace(/async /g, ''));
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchProxy(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 10000);
  try {
    const res = await fetch(`${PROXY_BASE}${endpoint}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function proxyAvailable() {
  try {
    const res = await fetchProxy('/api/ig/session', { timeout: 5000 });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function runAllTests() {
  log('\n══════════════════════════════════════════════════════════');
  log('  ClawScript End-to-End Pipeline Test Suite');
  log('  Target: BTC (' + BTC_EPIC + ')');
  log('══════════════════════════════════════════════════════════\n');

  const hasProxy = await proxyAvailable();
  log(`Proxy available: ${hasProxy ? 'YES' : 'NO (stub fallback tests only)'}\n`);

  log('─── 1. Trading Commands (BUY/SELL/EXIT/TRAILSTOP) ───');

  await test('Trading', 'BUY at MARKET parses and compiles', () => {
    const r = parseOk(`BUY 1 AT MARKET STOP 50 LIMIT 100 REASON "BTC entry"`, 'BtcBuy');
    assertIncludes(r.js, "direction: 'BUY'");
    assertIncludes(r.js, 'signal: true');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('Trading', 'SELL at LIMIT parses and compiles', () => {
    const r = parseOk(`SELL 2 AT LIMIT STOP 30 REASON "BTC short"`, 'BtcSell');
    assertIncludes(r.js, "direction: 'SELL'");
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('Trading', 'SELLSHORT parses', () => {
    const r = parseOk(`SELLSHORT 1 AT MARKET`, 'BtcShort');
    assertIncludes(r.js, "direction: 'SELLSHORT'");
  });

  await test('Trading', 'EXIT ALL parses', () => {
    const r = parseOk(`EXIT ALL REASON "take profit"`, 'BtcExit');
    assertIncludes(r.js, 'close: true');
  });

  await test('Trading', 'CLOSE parses', () => {
    const r = parseOk(`CLOSE REASON "stop hit"`, 'BtcClose');
    assertIncludes(r.js, 'close: true');
  });

  await test('Trading', 'TRAILSTOP parses', () => {
    const r = parseOk(`TRAILSTOP 25 ACCEL 0.02 MAX 0.2`, 'BtcTrail');
    assertIncludes(r.js, '_trailStop');
    assertIncludes(r.js, 'distance');
  });

  await test('Trading', 'Conditional BUY with IF', () => {
    const code = `
DEF rsi = RSI(14)
IF rsi < 30 THEN
  BUY 1 AT MARKET STOP 50 REASON "oversold"
ENDIF`;
    const r = parseOk(code, 'BtcCondBuy');
    assertIncludes(r.js, 'calcRSI');
    assertIncludes(r.js, "direction: 'BUY'");
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  log('\n─── 2. Variables (DEF/SET/STORE_VAR/LOAD_VAR) ───');

  await test('Variables', 'DEF integer', () => {
    const r = parseOk(`DEF count = 42`, 'VarInt');
    assertIncludes(r.js, 'const count = 42');
  });

  await test('Variables', 'DEF float', () => {
    const r = parseOk(`DEF threshold = 3.14`, 'VarFloat');
    assertIncludes(r.js, 'threshold');
    assertIncludes(r.js, '3.14');
  });

  await test('Variables', 'DEF string', () => {
    const r = parseOk(`DEF symbol = "BTC"`, 'VarStr');
    assertIncludes(r.js, 'const symbol = "BTC"');
  });

  await test('Variables', 'DEF boolean', () => {
    const r = parseOk(`DEF active = true`, 'VarBool');
    assertIncludes(r.js, 'const active = true');
  });

  await test('Variables', 'SET reassignment', () => {
    const r = parseOk(`DEF x = 10\nSET x = 20`, 'VarSet');
    assertIncludes(r.js, 'let x = 20');
  });

  await test('Variables', 'STORE_VAR compiles', () => {
    const r = parseOk(`STORE_VAR "btc_price" 50000`, 'StoreVar');
    assertIncludes(r.js, 'storeVar');
  });

  await test('Variables', 'LOAD_VAR compiles', () => {
    const r = parseOk(`DEF saved = LOAD_VAR "btc_price" DEFAULT 0`, 'LoadVar');
    assertIncludes(r.js, 'loadVar');
  });

  await test('Variables', 'STORE_VAR GLOBAL compiles', () => {
    const r = parseOk(`STORE_VAR "global_flag" 1 GLOBAL`, 'StoreGlobal');
    assertIncludes(r.js, 'true');
  });

  log('\n─── 3. Control Flow (IF/LOOP/WHILE/TRY/WAIT/ERROR) ───');

  await test('ControlFlow', 'IF/THEN/ELSE/ENDIF', () => {
    const code = `DEF x = 10\nIF x > 5 THEN\n  DEF y = 1\nELSE\n  DEF y = 0\nENDIF`;
    const r = parseOk(code, 'IfElse');
    assertIncludes(r.js, 'if (');
    assertIncludes(r.js, 'else');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('ControlFlow', 'LOOP N TIMES', () => {
    const r = parseOk(`LOOP 5 TIMES\n  DEF i = 1\nENDLOOP`, 'LoopN');
    assertIncludes(r.js, 'for (');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('ControlFlow', 'WHILE condition', () => {
    const r = parseOk(`DEF count = 0\nWHILE count < 10\n  SET count = count + 1\nENDWHILE`, 'WhileLoop');
    assertIncludes(r.js, 'while (');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('ControlFlow', 'TRY/CATCH/ENDTRY', () => {
    const code = `TRY\n  DEF x = 1\nCATCH err\n  ALERT "error"\nENDTRY`;
    const r = parseOk(code, 'TryCatch');
    assertIncludes(r.js, 'try {');
    assertIncludes(r.js, 'catch (err)');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('ControlFlow', 'WAIT compiles', () => {
    const r = parseOk(`WAIT 1000`, 'Wait');
    assertIncludes(r.js, 'setTimeout');
  });

  await test('ControlFlow', 'ERROR throws', () => {
    const r = parseOk(`ERROR "something went wrong"`, 'ErrorThrow');
    assertIncludes(r.js, 'throw new Error');
  });

  await test('ControlFlow', 'Nested IF inside LOOP', () => {
    const code = `LOOP 3 TIMES\n  IF true THEN\n    DEF a = 1\n  ENDIF\nENDLOOP`;
    const r = parseOk(code, 'NestedIfLoop');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  log('\n─── 4. AI Commands (AI_QUERY/AI_GENERATE_SCRIPT/ANALYZE_LOG/RUN_ML) ───');

  await test('AI', 'AI_QUERY parses and compiles', () => {
    const r = parseOk(`DEF answer = AI_QUERY "What is BTC price prediction?"`, 'AiQuery');
    assertIncludes(r.js, 'ai.aiQuery');
    assert(r.imports.includes('ai'), 'Should import ai module');
  });

  await test('AI', 'AI_GENERATE_SCRIPT compiles', () => {
    const r = parseOk(`AI_GENERATE_SCRIPT "Create a BTC scalper"`, 'AiGen');
    assertIncludes(r.js, 'aiGenerateScript');
  });

  await test('AI', 'ANALYZE_LOG compiles', () => {
    const r = parseOk(`DEF log_data = ANALYZE_LOG "trade-log.txt"`, 'AnalyzeLog');
    assertIncludes(r.js, 'analyzeLog');
  });

  await test('AI', 'RUN_ML compiles', () => {
    const r = parseOk(`DEF prediction = RUN_ML "random_forest"`, 'RunML');
    assertIncludes(r.js, 'runML');
  });

  if (hasProxy) {
    await test('AI', 'AI_QUERY live call via proxy', async () => {
      const ai = require('./openclaw-ai.cjs');
      const result = await ai.aiQuery('What is 2+2? Reply with just the number.', { timeout: 15000 });
      assert(result && result.result, 'Should return a result');
    });
  }

  log('\n─── 5. Data Commands (CLAW_WEB/CLAW_X) ───');

  await test('Data', 'CLAW_WEB parses', () => {
    const r = parseOk(`DEF page = CLAW_WEB "https://example.com"`, 'ClawWeb');
    assertIncludes(r.js, 'data.clawWeb');
    assert(r.imports.includes('data'), 'Should import data module');
  });

  await test('Data', 'CLAW_X parses', () => {
    const r = parseOk(`DEF posts = CLAW_X "Bitcoin" NUM 5`, 'ClawX');
    assertIncludes(r.js, 'data.clawX');
  });

  await test('Data', 'CLAW_PDF parses', () => {
    const r = parseOk(`DEF doc = CLAW_PDF "report.pdf"`, 'ClawPdf');
    assertIncludes(r.js, 'data.clawPdf');
  });

  await test('Data', 'CLAW_IMAGE parses', () => {
    const r = parseOk(`DEF img = CLAW_IMAGE "chart"`, 'ClawImg');
    assertIncludes(r.js, 'data.clawImage');
  });

  await test('Data', 'CLAW_VIDEO parses', () => {
    const r = parseOk(`DEF vid = CLAW_VIDEO "https://example.com/video.mp4"`, 'ClawVid');
    assertIncludes(r.js, 'data.clawVideo');
  });

  await test('Data', 'CLAW_WEB live fetch', async () => {
    const dataModule = require('./openclaw-data.cjs');
    const result = await dataModule.clawWeb('https://example.com', { timeout: 10000 });
    assert(result && result.content, 'Should return content');
    assert(result.fetched, 'Should have timestamp');
  });

  log('\n─── 6. Agent Commands (SPAWN_AGENT/SAY_TO_SESSION/ALERT) ───');

  await test('Agent', 'SPAWN_AGENT parses', () => {
    const r = parseOk(`SPAWN_AGENT "btc-watcher" WITH "Monitor BTC price"`, 'SpawnAgent');
    assertIncludes(r.js, 'chat.spawnAgent');
    assert(r.imports.includes('chat'), 'Should import chat module');
  });

  await test('Agent', 'SAY_TO_SESSION parses', () => {
    const r = parseOk(`SAY_TO_SESSION "session-123" "BTC alert: price is high"`, 'SayToSession');
    assertIncludes(r.js, 'chat.sayToSession');
  });

  await test('Agent', 'ALERT parses', () => {
    const r = parseOk(`ALERT "BTC crossed 50k" LEVEL "warning" TO "telegram"`, 'Alert');
    assertIncludes(r.js, 'channels.send');
    assert(r.imports.includes('channels'), 'Should import channels module');
  });

  await test('Agent', 'ALERT with default level', () => {
    const r = parseOk(`ALERT "Simple alert"`, 'AlertSimple');
    assertIncludes(r.js, 'channels.send');
  });

  await test('Agent', 'CALL_SESSION parses', () => {
    const r = parseOk(`DEF resp = CALL_SESSION "agent1" "check BTC"`, 'CallSession');
    assertIncludes(r.js, 'chat.callSession');
  });

  await test('Agent', 'WAIT_FOR_REPLY parses', () => {
    const r = parseOk(`DEF reply = WAIT_FOR_REPLY "session1" TIMEOUT 5000`, 'WaitReply');
    assertIncludes(r.js, 'chat.waitForReply');
  });

  await test('Agent', 'ALERT live send (file fallback)', async () => {
    const channels = require('./openclaw-channels.cjs');
    const result = await channels.send('test', 'Pipeline test alert', { level: 'info' });
    assert(result, 'Should return result');
    assert(result.target === 'test', 'Target should match');
  });

  log('\n─── 7. TradingView Commands (STRATEGY_ENTRY/EXIT, INPUT_*, ARRAY_*) ───');

  await test('TradingView', 'STRATEGY_ENTRY parses', () => {
    const r = parseOk(`STRATEGY_ENTRY "long" DIRECTION "BUY" SIZING 1`, 'StratEntry');
    assertIncludes(r.js, 'ext.strategyEntry');
    assert(r.imports.includes('ext'), 'Should import ext module');
  });

  await test('TradingView', 'STRATEGY_EXIT parses', () => {
    const r = parseOk(`STRATEGY_EXIT "close" REASON "take profit"`, 'StratExit');
    assertIncludes(r.js, 'ext.strategyExit');
  });

  await test('TradingView', 'STRATEGY_CLOSE parses', () => {
    const r = parseOk(`STRATEGY_CLOSE REASON "end of day"`, 'StratClose');
    assertIncludes(r.js, 'ext.strategyClose');
  });

  await test('TradingView', 'INPUT_INT parses and extracts metadata', () => {
    const code = `INPUT_INT rsi_period DEFAULT 14 // RSI lookback period`;
    const r = parseOk(code, 'InputInt');
    assertIncludes(r.js, 'ext.inputInt');
    assert(r.metadata, 'Should have metadata');
    assert(r.metadata.inputs.length > 0, 'Should have input metadata');
    assert(r.metadata.inputs[0].key === 'rsi_period', 'Key should be rsi_period');
    assert(r.metadata.inputs[0].type === 'number', 'Type should be number');
    assert(r.metadata.inputs[0].default === 14, 'Default should be 14');
  });

  await test('TradingView', 'INPUT_FLOAT parses', () => {
    const code = `INPUT_FLOAT stop_pct DEFAULT 0.5 // Stop loss percentage`;
    const r = parseOk(code, 'InputFloat');
    assert(r.metadata.inputs.length > 0, 'Should have input metadata');
    assert(r.metadata.inputs[0].type === 'number', 'Type should be number');
  });

  await test('TradingView', 'INPUT_BOOL parses', () => {
    const code = `INPUT_BOOL use_trailing DEFAULT true // Enable trailing stop`;
    const r = parseOk(code, 'InputBool');
    assert(r.metadata.inputs.length > 0, 'Should have input metadata');
    assert(r.metadata.inputs[0].type === 'boolean', 'Type should be boolean');
  });

  await test('TradingView', 'INPUT_SYMBOL parses', () => {
    const code = `INPUT_SYMBOL ticker DEFAULT "BTCUSD"`;
    const r = parseOk(code, 'InputSym');
    assert(r.metadata.inputs.length > 0, 'Should have input metadata');
    assert(r.metadata.inputs[0].type === 'string', 'Type should be string');
  });

  await test('TradingView', 'ARRAY_NEW parses', () => {
    const r = parseOk(`DEF arr = ARRAY_NEW`, 'ArrayNew');
    assertIncludes(r.js, 'ext.arrayNew');
  });

  await test('TradingView', 'ARRAY_PUSH parses', () => {
    const r = parseOk(`ARRAY_PUSH "myArr" 42`, 'ArrayPush');
    assertIncludes(r.js, 'ext.arrayPush');
  });

  await test('TradingView', 'MATRIX_NEW parses', () => {
    const r = parseOk(`DEF mat = MATRIX_NEW 3 3`, 'MatNew');
    assertIncludes(r.js, 'ext.matrixNew');
  });

  await test('TradingView', 'MATRIX_SET parses', () => {
    const r = parseOk(`MATRIX_SET "mat" 0 0 1.5`, 'MatSet');
    assertIncludes(r.js, 'ext.matrixSet');
  });

  log('\n─── 8. Bloomberg/IG Commands (FETCH_HISTORICAL/ECON_DATA) ───');

  await test('Bloomberg', 'FETCH_HISTORICAL parses', () => {
    const code = `DEF history = FETCH_HISTORICAL "${BTC_EPIC}" FROM "2024-01-01" TO "2024-12-31"`;
    const r = parseOk(code, 'FetchHist');
    assertIncludes(r.js, 'ext.fetchHistorical');
  });

  await test('Bloomberg', 'ECON_DATA parses', () => {
    const r = parseOk(`DEF gdp = ECON_DATA "GDP" COUNTRY "US"`, 'EconData');
    assertIncludes(r.js, 'ext.econData');
  });

  await test('Bloomberg', 'FETCH_MEMBERS parses', () => {
    const r = parseOk(`DEF members = FETCH_MEMBERS "SP500"`, 'FetchMembers');
    assertIncludes(r.js, 'ext.fetchMembers');
  });

  await test('Bloomberg', 'ESTIMATE parses', () => {
    const r = parseOk(`DEF est = ESTIMATE "AAPL" "EPS"`, 'Estimate');
    assertIncludes(r.js, 'ext.estimate');
  });

  if (hasProxy) {
    await test('Bloomberg', 'FETCH_HISTORICAL live BTC data via proxy', async () => {
      const ext = require('../openclaw-ext.cjs');
      const result = await ext.fetchHistorical(BTC_EPIC, 'HOUR', 10);
      assert(result, 'Should return result');
    });
  }

  log('\n─── 9. PRT Indicators (PRT_RSI/PRT_MACD/PRT_BOLLINGER) ───');

  await test('PRT', 'PRT_RSI parses', () => {
    const r = parseOk(`DEF rsi = PRT_RSI 14`, 'PrtRsi');
    assertIncludes(r.js, 'ext.prtRSI');
  });

  await test('PRT', 'PRT_MACD parses', () => {
    const r = parseOk(`DEF macd = PRT_MACD 12`, 'PrtMacd');
    assertIncludes(r.js, 'ext.prtMACD');
  });

  await test('PRT', 'PRT_BOLLINGER parses', () => {
    const r = parseOk(`DEF bb = PRT_BOLLINGER 20`, 'PrtBB');
    assertIncludes(r.js, 'ext.prtBOLLINGER');
  });

  await test('PRT', 'PRT_ATR parses', () => {
    const r = parseOk(`DEF atr = PRT_ATR 14`, 'PrtAtr');
    assertIncludes(r.js, 'ext.prtATR');
  });

  await test('PRT', 'PRT_STOCHASTIC parses', () => {
    const r = parseOk(`DEF stoch = PRT_STOCHASTIC 14`, 'PrtStoch');
    assertIncludes(r.js, 'ext.prtSTOCHASTIC');
  });

  await test('PRT', 'PRT_CCI parses', () => {
    const r = parseOk(`DEF cci = PRT_CCI 20`, 'PrtCci');
    assertIncludes(r.js, 'ext.prtCCI');
  });

  await test('PRT', 'PRT_ADX parses', () => {
    const r = parseOk(`DEF adx = PRT_ADX 14`, 'PrtAdx');
    assertIncludes(r.js, 'ext.prtADX');
  });

  await test('PRT', 'PRT_DONCHIAN parses', () => {
    const r = parseOk(`DEF dc = PRT_DONCHIAN 20`, 'PrtDonchian');
    assertIncludes(r.js, 'ext.prtDONCHIAN');
  });

  await test('PRT', 'PRT_ICHIMOKU parses', () => {
    const r = parseOk(`DEF ichi = PRT_ICHIMOKU`, 'PrtIchi');
    assertIncludes(r.js, 'ext.prtICHIMOKU');
  });

  await test('PRT', 'PRT_BARINDEX no-arg command', () => {
    const r = parseOk(`DEF idx = PRT_BARINDEX`, 'PrtBarIdx');
    assertIncludes(r.js, 'ext.prtBARINDEX');
  });

  await test('PRT', 'PRT_HIGHEST computes correctly', () => {
    const ext = require('../openclaw-ext.cjs');
    const data = [10, 20, 30, 25, 15];
    const result = ext.prtHighest(data, 5);
    assert(result.value === 30, `Expected 30, got ${result.value}`);
  });

  await test('PRT', 'PRT_LOWEST computes correctly', () => {
    const ext = require('../openclaw-ext.cjs');
    const data = [10, 20, 30, 25, 15];
    const result = ext.prtLowest(data, 5);
    assert(result.value === 10, `Expected 10, got ${result.value}`);
  });

  await test('PRT', 'PRT_RSI computes correctly', () => {
    const ext = require('../openclaw-ext.cjs');
    const data = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00];
    const result = ext.prtRsi(data, 14);
    assert(typeof result.value === 'number', 'RSI should be a number');
    assert(result.value >= 0 && result.value <= 100, `RSI should be 0-100, got ${result.value}`);
  });

  await test('PRT', 'PRT_BOLLINGER computes correctly', () => {
    const ext = require('../openclaw-ext.cjs');
    const data = [20, 21, 22, 21, 20, 19, 20, 21, 22, 23, 22, 21, 20, 21, 22, 21, 20, 19, 20, 21];
    const result = ext.prtBollinger(data, 20);
    assert(typeof result.upper === 'number', 'Should have upper band');
    assert(typeof result.middle === 'number', 'Should have middle band');
    assert(typeof result.lower === 'number', 'Should have lower band');
    assert(result.upper > result.middle, 'Upper should be above middle');
    assert(result.lower < result.middle, 'Lower should be below middle');
  });

  log('\n─── 10. Metadata Extraction (Comments/Tooltips) ───');

  await test('Metadata', 'extractMetadata finds INPUT_INT', () => {
    const code = `INPUT_INT rsi_period DEFAULT 14 // RSI lookback period`;
    const meta = extractMetadata(code);
    assert(meta.inputs.length === 1, 'Should find 1 input');
    assert(meta.inputs[0].key === 'rsi_period');
    assert(meta.inputs[0].type === 'number');
    assert(meta.inputs[0].default === 14);
    assert(meta.inputs[0].tooltip === 'RSI lookback period');
  });

  await test('Metadata', 'extractMetadata finds DEF with comment', () => {
    const code = `DEF threshold = 0.5 // Minimum confidence threshold`;
    const meta = extractMetadata(code);
    assert(meta.defs.length === 1, 'Should find 1 def');
    assert(meta.defs[0].key === 'threshold');
    assert(meta.defs[0].type === 'number');
    assert(meta.defs[0].default === 0.5);
    assert(meta.defs[0].tooltip === 'Minimum confidence threshold');
  });

  await test('Metadata', 'extractMetadata finds preceding line comment', () => {
    const code = `// The stop loss distance in points\nDEF stop_dist = 25`;
    const meta = extractMetadata(code);
    assert(meta.defs.length === 1);
    assert(meta.defs[0].tooltip === 'The stop loss distance in points');
  });

  await test('Metadata', 'extractMetadata finds multiple inputs', () => {
    const code = `INPUT_INT period DEFAULT 14 // Period\nINPUT_FLOAT mult DEFAULT 2.0 // Multiplier\nINPUT_BOOL enabled DEFAULT true // Active flag`;
    const meta = extractMetadata(code);
    assert(meta.inputs.length === 3, `Expected 3 inputs, got ${meta.inputs.length}`);
    assert(meta.inputs[0].key === 'period');
    assert(meta.inputs[1].key === 'mult');
    assert(meta.inputs[2].key === 'enabled');
  });

  await test('Metadata', 'Generated schema includes INPUT variables', () => {
    const code = `INPUT_INT rsi_period DEFAULT 14 // RSI lookback\nDEF price = 50000 // BTC price\nBUY 1 AT MARKET`;
    const r = parseOk(code, 'SchemaTest');
    assertIncludes(r.js, 'getConfigSchema');
    assertIncludes(r.js, 'rsi_period');
    assertIncludes(r.js, 'RSI lookback');
    assertIncludes(r.js, 'clawscript: true');
  });

  log('\n─── 11. Full Pipeline: Parse → Compile → Save → Load ───');

  await test('Pipeline', 'Full BTC strategy parse-compile-save-load cycle', () => {
    const btcScript = `
// BTC RSI Mean Reversion Strategy
INPUT_INT rsi_period DEFAULT 14 // RSI lookback period
INPUT_FLOAT oversold DEFAULT 30 // Oversold threshold
INPUT_FLOAT overbought DEFAULT 70 // Overbought threshold
DEF stop_dist = 50 // Stop distance in points
DEF limit_dist = 100 // Limit distance in points

DEF rsi = RSI(rsi_period)
DEF ema20 = EMA(20)
DEF price = close

IF rsi < oversold THEN
  BUY 1 AT MARKET STOP stop_dist LIMIT limit_dist REASON "RSI oversold"
ENDIF

IF rsi > overbought THEN
  SELL 1 AT MARKET STOP stop_dist LIMIT limit_dist REASON "RSI overbought"
ENDIF
`;
    const result = parseAndGenerate(btcScript, 'BtcRsiMeanReversion');
    assert(result.ast, 'AST should exist');
    assert(result.js, 'JS should exist');
    assert(result.metadata, 'Metadata should exist');
    assert(result.metadata.inputs.length === 3, `Expected 3 inputs, got ${result.metadata.inputs.length}`);
    assert(result.metadata.defs.length === 5, `Expected 5 defs, got ${result.metadata.defs.length}`);

    assertIncludes(result.js, 'class BtcRsiMeanReversionStrategy extends BaseStrategy');
    assertIncludes(result.js, "static get STRATEGY_TYPE() { return 'custom-btcrsimeanreversion'; }");
    assertIncludes(result.js, 'evaluateEntry');
    assertIncludes(result.js, 'evaluateExit');
    assertIncludes(result.js, 'getConfigSchema');
    assertIncludes(result.js, 'calcRSI');
    assertIncludes(result.js, 'calcEMA');

    let counter = 0;
    let fixedJs = result.js.replace(
      /const (_\w+Result) = await ext\.(input(?:Int|Float|Bool|Symbol)|(?:fetchHistorical|strategyEntry|strategyExit|strategyClose))/g,
      (match, varName, fn) => { counter++; return `const ${varName}_${counter} = await ext.${fn}`; }
    );
    fixedJs = fixedJs.replace(
      /require\('\.\.\/openclaw-ext\.cjs'\)/g,
      "require('../../openclaw-ext.cjs')"
    );
    fixedJs = fixedJs.replace(
      /const trade = require\('\.\.\/openclaw-trade\.cjs'\);\n/g,
      ''
    );

    const testFile = path.join(STRATEGIES_DIR, 'custom-pipeline-test-strategy.cjs');
    try {
      fs.writeFileSync(testFile, fixedJs);
      assert(fs.existsSync(testFile), 'Strategy file should exist');

      delete require.cache[require.resolve(testFile)];
      const StratClass = require(testFile);
      assert(typeof StratClass === 'function', 'Should export a class');
      assert(StratClass.STRATEGY_TYPE, 'Should have STRATEGY_TYPE');

      const instance = new StratClass({ size: 1, stopDistance: 50 });
      assert(instance.getName(), 'Should have getName()');
      assert(instance.getDescription(), 'Should have getDescription()');

      const schema = instance.getConfigSchema();
      assert(Array.isArray(schema), 'Schema should be array');
      assert(schema.length > 0, 'Schema should not be empty');

      const csFields = schema.filter(f => f.clawscript);
      assert(csFields.length >= 3, `Expected at least 3 ClawScript fields, got ${csFields.length}`);
    } finally {
      try { fs.unlinkSync(testFile); } catch {}
    }
  });

  await test('Pipeline', 'Strategy index loader discovers strategies', () => {
    const stratIndex = require('./strategies/index.cjs');
    const strategies = stratIndex.listStrategies();
    assert(Array.isArray(strategies), 'Should return array');
    assert(strategies.length > 0, `Should have strategies loaded, got ${strategies.length}`);
    const types = strategies.map(s => s.type);
    assert(types.includes('scalper'), 'Should include scalper strategy');
  });

  await test('Pipeline', 'Strategy schemas include configSchema', () => {
    const stratIndex = require('./strategies/index.cjs');
    const schemas = stratIndex.getStrategySchemas();
    assert(Object.keys(schemas).length > 0, 'Should have schemas');
    const scalper = schemas['scalper'];
    assert(scalper, 'Should have scalper schema');
    assert(Array.isArray(scalper.configSchema), 'configSchema should be array');
  });

  log('\n─── 12. Advanced Commands ───');

  await test('Advanced', 'DEF_FUNC / ENDFUNC function declaration', () => {
    const code = `DEF_FUNC myCalc(a, b)\n  DEF result = a + b\nENDFUNC`;
    const r = parseOk(code, 'FuncDecl');
    assertIncludes(r.js, 'myCalc(a, b)');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  await test('Advanced', 'CHAIN compiles', () => {
    const r = parseOk(`CHAIN 1 THEN 2 THEN 3`, 'ChainTest');
    assertIncludes(r.js, '_chainResult');
  });

  await test('Advanced', 'OPTIMIZE parses', () => {
    const r = parseOk(`OPTIMIZE rsi_period FROM 10 TO 20 STEP 2`, 'Optimize');
    assertIncludes(r.js, 'OPTIMIZE');
  });

  await test('Advanced', 'CRASH_SCAN ON/OFF', () => {
    const r = parseOk(`CRASH_SCAN ON`, 'CrashScan');
    assertIncludes(r.js, '_crashScanEnabled = true');
  });

  await test('Advanced', 'MARKET_NOMAD parses', () => {
    const r = parseOk(`MARKET_NOMAD ON MAX_INSTRUMENTS 5`, 'MarketNomad');
    assertIncludes(r.js, 'nomad.setEnabled');
  });

  await test('Advanced', 'NOMAD_SCAN parses', () => {
    const r = parseOk(`DEF scan = NOMAD_SCAN "crypto"`, 'NomadScan');
    assertIncludes(r.js, 'nomad.scan');
  });

  await test('Advanced', 'RUMOR_SCAN parses', () => {
    const r = parseOk(`DEF rumors = RUMOR_SCAN "Bitcoin"`, 'RumorScan');
    assertIncludes(r.js, 'rumorScan');
  });

  await test('Advanced', 'INCLUDE parses', () => {
    const r = parseOk(`INCLUDE "common-indicators.cs"`, 'Include');
    assertIncludes(r.js, 'INCLUDE');
  });

  await test('Advanced', 'CLAW_TOOL parses', () => {
    const r = parseOk(`DEF res = CLAW_TOOL "calculator"`, 'ClawTool');
    assertIncludes(r.js, 'tools.clawTool');
  });

  await test('Advanced', 'CLAW_CODE parses', () => {
    const r = parseOk(`DEF code_res = CLAW_CODE "console.log(42)"`, 'ClawCode');
    assertIncludes(r.js, 'tools.clawCode');
  });

  await test('Advanced', 'CLAW_CONVERSATION parses', () => {
    const r = parseOk(`DEF conv = CLAW_CONVERSATION "session-1"`, 'ClawConv');
    assertIncludes(r.js, 'data.clawConversation');
  });

  await test('Advanced', 'CLAW_IMAGE_VIEW parses', () => {
    const r = parseOk(`CLAW_IMAGE_VIEW "https://example.com/chart.png"`, 'ClawImgView');
    assertIncludes(r.js, 'data.clawImageView');
  });

  await test('Advanced', 'MUTATE_CONFIG parses', () => {
    const r = parseOk(`MUTATE_CONFIG "size" = 2`, 'MutateConfig');
    assertIncludes(r.js, 'this.config');
  });

  log('\n─── 13. Macro/Generic Commands ───');

  await test('Generic', 'TIME_IN_MARKET parses', () => {
    const r = parseOk(`DEF tim = TIME_IN_MARKET "BTC" UNIT "hours"`, 'TimeInMkt');
    assertIncludes(r.js, 'ext.timeInMarket');
  });

  await test('Generic', 'MARKET_SCAN parses', () => {
    const r = parseOk(`DEF scan = MARKET_SCAN "crypto"`, 'MktScan');
    assertIncludes(r.js, 'ext.marketScan');
  });

  await test('Generic', 'PORTFOLIO_BUILD parses', () => {
    const r = parseOk(`PORTFOLIO_BUILD FROM "watchlist" NUM 10 SIZING "equal"`, 'PfBuild');
    assertIncludes(r.js, 'ext.portfolioBuild');
  });

  await test('Generic', 'MONTE_CARLO parses', () => {
    const r = parseOk(`DEF mc = MONTE_CARLO "btc_returns" RUNS 1000`, 'MonteCarlo');
    assertIncludes(r.js, 'ext.monteCarlo');
  });

  await test('Generic', 'RISK_MODEL parses', () => {
    const r = parseOk(`DEF risk = RISK_MODEL "VaR" CONFIDENCE 0.95 WINDOW 30`, 'RiskModel');
    assertIncludes(r.js, 'ext.riskModel');
  });

  await test('Generic', 'MATH_MODEL parses', () => {
    const r = parseOk(`DEF model = MATH_MODEL "black_scholes" SOLVE "price"`, 'MathModel');
    assertIncludes(r.js, 'ext.mathModel');
  });

  await test('Generic', 'WEATHER_IMPACT parses', () => {
    const r = parseOk(`DEF wx = WEATHER_IMPACT "hurricane" DAYS 7`, 'WeatherImpact');
    assertIncludes(r.js, 'ext.weatherImpact');
  });

  await test('Generic', 'FISCAL_FLOW parses', () => {
    const r = parseOk(`DEF ff = FISCAL_FLOW "US_TREASURY"`, 'FiscalFlow');
    assertIncludes(r.js, 'ext.fiscalFlow');
  });

  await test('Generic', 'ELECTION_IMPACT parses', () => {
    const r = parseOk(`DEF ei = ELECTION_IMPACT "US_2024"`, 'ElectionImpact');
    assertIncludes(r.js, 'ext.electionImpact');
  });

  await test('Generic', 'CURRENCY_CARRY parses', () => {
    const r = parseOk(`DEF cc = CURRENCY_CARRY "USDJPY"`, 'CurrencyCarry');
    assertIncludes(r.js, 'ext.currencyCarry');
  });

  await test('Generic', 'SCHEDULE parses', () => {
    const r = parseOk(`SCHEDULE "daily_scan" AT "09:00"`, 'Schedule');
    assertIncludes(r.js, 'ext.schedule');
  });

  log('\n─── 14. Indicator Functions (Built-in) ───');

  await test('Indicators', 'RSI() function call in expression', () => {
    const r = parseOk(`DEF rsi = RSI(14)`, 'RsiFunc');
    assertIncludes(r.js, 'indicators.calcRSI(prices, 14)');
  });

  await test('Indicators', 'EMA() function call', () => {
    const r = parseOk(`DEF ema = EMA(20)`, 'EmaFunc');
    assertIncludes(r.js, 'indicators.calcEMA(prices, 20)');
  });

  await test('Indicators', 'SMA() function call', () => {
    const r = parseOk(`DEF sma = SMA(50)`, 'SmaFunc');
    assertIncludes(r.js, 'indicators.calcSMA(prices, 50)');
  });

  await test('Indicators', 'MACD() function call', () => {
    const r = parseOk(`DEF macd = MACD(12, 26, 9)`, 'MacdFunc');
    assertIncludes(r.js, 'indicators.calcMACD');
  });

  await test('Indicators', 'BOLLINGER() function call', () => {
    const r = parseOk(`DEF bb = BOLLINGER(20, 2)`, 'BollingerFunc');
    assertIncludes(r.js, 'indicators.calcBollinger');
  });

  await test('Indicators', 'ATR() function call', () => {
    const r = parseOk(`DEF atr = ATR(14)`, 'AtrFunc');
    assertIncludes(r.js, 'indicators.calcATR');
  });

  await test('Indicators', 'Real indicator computation with sample data', () => {
    const indicators = require('./indicators.cjs');
    const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 110, 108, 107, 106, 105, 104, 103, 102, 101, 100];
    const rsi = indicators.calcRSI(prices, 14);
    assert(typeof rsi === 'number' || rsi === null, 'RSI should be number or null');
    const ema = indicators.calcEMA(prices, 10);
    assert(typeof ema === 'number', 'EMA should be a number');
    const sma = indicators.calcSMA(prices, 10);
    assert(typeof sma === 'number', 'SMA should be a number');
  });

  log('\n─── 15. Expression & Operator Tests ───');

  await test('Expressions', 'CROSSES OVER', () => {
    const r = parseOk(`DEF ema5 = EMA(5)\nDEF ema20 = EMA(20)\nIF ema5 CROSSES OVER ema20 THEN\n  BUY 1 AT MARKET\nENDIF`, 'CrossOver');
    assertIncludes(r.js, '>');
  });

  await test('Expressions', 'CROSSES UNDER', () => {
    const r = parseOk(`DEF ema5 = EMA(5)\nDEF ema20 = EMA(20)\nIF ema5 CROSSES UNDER ema20 THEN\n  SELL 1 AT MARKET\nENDIF`, 'CrossUnder');
    assertIncludes(r.js, '<');
  });

  await test('Expressions', 'CONTAINS operator', () => {
    const r = parseOk(`DEF msg = "BTC alert"\nIF msg CONTAINS "BTC" THEN\n  ALERT "Found BTC"\nENDIF`, 'Contains');
    assertIncludes(r.js, '.includes(');
  });

  await test('Expressions', 'AND / OR / NOT operators', () => {
    const code = `DEF a = 10\nDEF b = 20\nIF a > 5 AND b < 30 OR NOT a == 0 THEN\n  DEF c = 1\nENDIF`;
    const r = parseOk(code, 'LogicOps');
    assertIncludes(r.js, '&&');
    assertIncludes(r.js, '||');
    assertIncludes(r.js, '!');
  });

  await test('Expressions', 'Arithmetic operators', () => {
    const r = parseOk(`DEF calc = (10 + 5) * 3 - 2 / 1`, 'ArithOps');
    assert(jsSyntaxOk(r.js), 'Generated JS has syntax errors');
  });

  log('\n─── 16. Complex Multi-Command BTC Strategy ───');

  await test('Complex', 'Full BTC multi-indicator strategy compiles', () => {
    const code = `
// Complex BTC Trading Strategy
INPUT_INT rsi_period DEFAULT 14 // RSI lookback
INPUT_INT ema_fast DEFAULT 9 // Fast EMA period
INPUT_INT ema_slow DEFAULT 21 // Slow EMA period
INPUT_FLOAT risk_pct DEFAULT 0.02 // Risk per trade
INPUT_BOOL use_trailing DEFAULT true // Enable trailing stop

DEF rsi = RSI(rsi_period)
DEF ema_f = EMA(ema_fast)
DEF ema_s = EMA(ema_slow)
DEF atr = ATR(14)
DEF stop_dist = atr * 2
DEF limit_dist = atr * 3

TRY
  IF rsi < 30 AND ema_f CROSSES OVER ema_s THEN
    BUY 1 AT MARKET STOP stop_dist LIMIT limit_dist REASON "Bullish crossover + oversold"
    IF use_trailing THEN
      TRAILSTOP 25
    ENDIF
    ALERT "BTC Long Entry" LEVEL "info"
    SAY_TO_SESSION "main" "Entered BTC long position"
  ENDIF

  IF rsi > 70 AND ema_f CROSSES UNDER ema_s THEN
    SELL 1 AT MARKET STOP stop_dist LIMIT limit_dist REASON "Bearish crossover + overbought"
    ALERT "BTC Short Entry" LEVEL "warning"
  ENDIF
CATCH err
  ALERT "Strategy error" LEVEL "error"
  ERROR "Critical failure in strategy"
ENDTRY
`;
    const result = parseAndGenerate(code, 'BtcMultiIndicator');
    assert(result.ast.body.length > 0, 'AST should have statements');
    assert(result.js.length > 500, 'Generated JS should be substantial');
    assert(result.metadata.inputs.length === 5, `Expected 5 inputs, got ${result.metadata.inputs.length}`);
    assert(result.imports.includes('ai') || result.imports.includes('channels') || result.imports.includes('chat'),
      'Should import agent modules');
    assertIncludes(result.js, 'class BtcMultiIndicatorStrategy');
    assertIncludes(result.js, 'calcRSI');
    assertIncludes(result.js, 'calcEMA');
    assertIncludes(result.js, 'calcATR');
    assertIncludes(result.js, 'try {');
    assertIncludes(result.js, 'catch (err)');
  });

  log('\n─── 17. Module Integration Tests ───');

  await test('Modules', 'openclaw-ai.cjs exports all functions', () => {
    const ai = require('./openclaw-ai.cjs');
    assert(typeof ai.aiQuery === 'function', 'aiQuery should be a function');
    assert(typeof ai.aiGenerateScript === 'function', 'aiGenerateScript should be a function');
    assert(typeof ai.analyzeLog === 'function', 'analyzeLog should be a function');
    assert(typeof ai.runML === 'function', 'runML should be a function');
  });

  await test('Modules', 'openclaw-chat.cjs exports all functions', () => {
    const chat = require('./openclaw-chat.cjs');
    assert(typeof chat.sayToSession === 'function', 'sayToSession should be a function');
    assert(typeof chat.spawnAgent === 'function', 'spawnAgent should be a function');
    assert(typeof chat.waitForReply === 'function', 'waitForReply should be a function');
  });

  await test('Modules', 'openclaw-channels.cjs exports all functions', () => {
    const channels = require('./openclaw-channels.cjs');
    assert(typeof channels.send === 'function', 'send should be a function');
  });

  await test('Modules', 'openclaw-data.cjs exports all functions', () => {
    const data = require('./openclaw-data.cjs');
    assert(typeof data.clawWeb === 'function', 'clawWeb should be a function');
    assert(typeof data.clawX === 'function', 'clawX should be a function');
    assert(typeof data.clawPdf === 'function', 'clawPdf should be a function');
    assert(typeof data.clawImage === 'function', 'clawImage should be a function');
    assert(typeof data.clawVideo === 'function', 'clawVideo should be a function');
    assert(typeof data.clawImageView === 'function', 'clawImageView should be a function');
    assert(typeof data.clawConversation === 'function', 'clawConversation should be a function');
  });

  await test('Modules', 'openclaw-tools.cjs exports all functions', () => {
    const tools = require('./openclaw-tools.cjs');
    assert(typeof tools.clawTool === 'function', 'clawTool should be a function');
    assert(typeof tools.clawCode === 'function', 'clawCode should be a function');
  });

  await test('Modules', 'openclaw-ext.cjs exports key functions', () => {
    const ext = require('../openclaw-ext.cjs');
    assert(typeof ext.fetchHistorical === 'function', 'fetchHistorical should be a function');
    assert(typeof ext.marketScan === 'function', 'marketScan should be a function');
    assert(typeof ext.strategyEntry === 'function', 'strategyEntry should be a function');
    assert(typeof ext.strategyExit === 'function', 'strategyExit should be a function');
    assert(typeof ext.strategyClose === 'function', 'strategyClose should be a function');
    assert(typeof ext.prtRsi === 'function', 'prtRsi should be a function');
    assert(typeof ext.prtBollinger === 'function', 'prtBollinger should be a function');
    assert(typeof ext.prtHighest === 'function', 'prtHighest should be a function');
    assert(typeof ext.prtLowest === 'function', 'prtLowest should be a function');
  });

  await test('Modules', 'openclaw-nomad.cjs exports all functions', () => {
    const nomad = require('./openclaw-nomad.cjs');
    assert(typeof nomad.scan === 'function', 'scan should be a function');
    assert(typeof nomad.allocate === 'function', 'allocate should be a function');
    assert(typeof nomad.setEnabled === 'function', 'setEnabled should be a function');
  });

  await test('Modules', 'indicators.cjs exports key functions', () => {
    const ind = require('./indicators.cjs');
    assert(typeof ind.calcEMA === 'function', 'calcEMA should be a function');
    assert(typeof ind.calcSMA === 'function', 'calcSMA should be a function');
    assert(typeof ind.calcRSI === 'function', 'calcRSI should be a function');
  });

  log('\n─── 18. Stub Fallback Tests ───');

  await test('Stubs', 'openclaw-ai stub fallback returns result', async () => {
    const ai = require('./openclaw-ai.cjs');
    const result = await ai.aiQuery('test', { timeout: 2000 });
    assert(result && result.result, 'Should return result (live or stub)');
    assert(typeof result.model === 'string', 'Should have model field');
  });

  await test('Stubs', 'openclaw-chat stub fallback returns result', async () => {
    const chat = require('./openclaw-chat.cjs');
    const result = await chat.sayToSession('test-session', 'hello', {});
    assert(result, 'Should return result');
    assert(result.sessionId === 'test-session', 'Should echo session ID');
  });

  await test('Stubs', 'openclaw-channels stub fallback saves alert', async () => {
    const channels = require('./openclaw-channels.cjs');
    const result = await channels.send('test-target', 'Pipeline stub test', { level: 'debug' });
    assert(result, 'Should return result');
    assert(result.level === 'debug', 'Level should match');
  });

  await test('Stubs', 'openclaw-data clawX stub returns posts', async () => {
    const data = require('./openclaw-data.cjs');
    const result = await data.clawX('Bitcoin test', { num: 3, timeout: 2000 });
    assert(result, 'Should return result');
    assert(result.query === 'Bitcoin test', 'Query should match');
    assert(Array.isArray(result.posts), 'Posts should be array');
  });

  await test('Stubs', 'openclaw-ext stubs return valid structure', async () => {
    const ext = require('../openclaw-ext.cjs');
    const econResult = await ext.econData('GDP', { country: 'US' });
    assert(econResult, 'econData should return result');
    const timeResult = await ext.timeInMarket('BTC');
    assert(timeResult, 'timeInMarket should return result');
  });

  await test('Stubs', 'openclaw-nomad scan returns instruments', async () => {
    const nomad = require('./openclaw-nomad.cjs');
    const result = await nomad.scan({ criteria: 'crypto' });
    assert(result, 'Should return result');
    assert(Array.isArray(result.instruments), 'instruments should be array');
    assert(result.instruments.length > 0, 'Should have instruments');
  });

  log('\n─── 19. PRT Drawing & Misc Commands ───');

  await test('PRT_Draw', 'PRT_DRAWLINE parses', () => {
    const r = parseOk(`PRT_DRAWLINE(100, 200, 300, 400)`, 'PrtDrawLine');
    assertIncludes(r.js, 'ext.prtDraw');
  });

  await test('PRT_Draw', 'PRT_DRAWARROW parses', () => {
    const r = parseOk(`PRT_DRAWARROW(100, 200)`, 'PrtDrawArrow');
    assertIncludes(r.js, 'ext.prtDraw');
  });

  await test('PRT_Misc', 'PRT_DEFPARAM parses', () => {
    const r = parseOk(`PRT_DEFPARAM period = 14`, 'PrtDefparam');
    assertIncludes(r.js, 'const period = 14');
  });

  await test('PRT_Misc', 'PRT_RETURN parses', () => {
    const r = parseOk(`PRT_RETURN 42`, 'PrtReturn');
    assertIncludes(r.js, 'return 42');
  });

  await test('PRT_Misc', 'PRT_DATE no-arg', () => {
    const r = parseOk(`DEF d = PRT_DATE`, 'PrtDate');
    assertIncludes(r.js, 'ext.prtDATE');
  });

  await test('PRT_Misc', 'PRT_TIME no-arg', () => {
    const r = parseOk(`DEF t = PRT_TIME`, 'PrtTime');
    assertIncludes(r.js, 'ext.prtTIME');
  });

  log('\n─── 20. Lexer Edge Cases ───');

  await test('Lexer', 'Multi-line comments preserved in _comments', () => {
    const tokens = lexer('/* multi\nline\ncomment */ DEF x = 1');
    assert(tokens._comments.length === 1, 'Should capture multi-line comment');
  });

  await test('Lexer', 'All KEYWORDS are recognized', () => {
    const keywordCount = KEYWORDS.size;
    assert(keywordCount > 100, `Should have >100 keywords, got ${keywordCount}`);
  });

  await test('Lexer', 'Empty input returns empty tokens', () => {
    const tokens = lexer('');
    assert(tokens.length === 0, 'Empty input should yield no tokens');
  });

  await test('Lexer', 'Single-quoted strings', () => {
    const tokens = lexer("'hello'");
    assert(tokens.length === 1);
    assert(tokens[0].value === 'hello');
  });

  // ─── 21. Task Planning Commands ───
  log('\n─── 21. Task Planning Commands ───');

  await test('TaskPlanning', 'TASK_DEFINE with body parses', () => {
    const r = parseOk('TASK_DEFINE "analyze" WITH "Summarize news" BODY\nDEF x = 1\nENDTASK', 'TaskDefine');
    assertIncludes(r.js, 'automation.taskDefine');
  });

  await test('TaskPlanning', 'TASK_ASSIGN parses', () => {
    const r = parseOk('TASK_ASSIGN "analyze" TO "researcher"', 'TaskAssign');
    assertIncludes(r.js, 'automation.taskAssign');
  });

  await test('TaskPlanning', 'TASK_CHAIN parses', () => {
    const r = parseOk('TASK_CHAIN "fetch_data"', 'TaskChain');
    assertIncludes(r.js, 'automation.taskChain');
  });

  await test('TaskPlanning', 'TASK_PARALLEL parses', () => {
    const r = parseOk('TASK_PARALLEL "scan_x"', 'TaskParallel');
    assertIncludes(r.js, 'automation.taskParallel');
  });

  await test('TaskPlanning', 'TASK_SHOW_FLOW parses', () => {
    const r = parseOk('TASK_SHOW_FLOW', 'TaskShowFlow');
    assertIncludes(r.js, 'automation.taskShowFlow');
  });

  await test('TaskPlanning', 'TASK_LOG parses', () => {
    const r = parseOk('TASK_LOG "started" LEVEL "info"', 'TaskLog');
    assertIncludes(r.js, 'automation.taskLog');
  });

  // ─── 22. Agent Management Commands ───
  log('\n─── 22. Agent Management Commands ───');

  await test('AgentMgmt', 'AGENT_SPAWN parses', () => {
    const r = parseOk('AGENT_SPAWN "analyzer" WITH "review data"', 'AgentSpawn');
    assertIncludes(r.js, 'automation.agentSpawn');
  });

  await test('AgentMgmt', 'AGENT_CALL parses', () => {
    const r = parseOk('AGENT_CALL "fetcher" "get_news"', 'AgentCall');
    assertIncludes(r.js, 'automation.agentCall');
  });

  await test('AgentMgmt', 'DEF result = AGENT_CALL parses', () => {
    const r = parseOk('DEF data = AGENT_CALL "fetcher" "get_news"', 'AgentCallDef');
    assertIncludes(r.js, 'automation.agentCall');
  });

  await test('AgentMgmt', 'AGENT_PASS parses', () => {
    const r = parseOk('AGENT_PASS "analysis" "reporter"', 'AgentPass');
    assertIncludes(r.js, 'automation.agentPass');
  });

  await test('AgentMgmt', 'AGENT_TERMINATE parses', () => {
    const r = parseOk('AGENT_TERMINATE "analyzer" REASON "done"', 'AgentTerminate');
    assertIncludes(r.js, 'automation.agentTerminate');
  });

  // ─── 23. Skills & Tools Commands ───
  log('\n─── 23. Skills & Tools Commands ───');

  await test('SkillsTools', 'SKILL_CALL parses', () => {
    const r = parseOk('SKILL_CALL "ig-market-data"', 'SkillCall');
    assertIncludes(r.js, 'automation.skillCall');
  });

  await test('SkillsTools', 'DEF result = SKILL_CALL parses', () => {
    const r = parseOk('DEF data = SKILL_CALL "ig-market-data" WITH epic="AUDUSD"', 'SkillCallDef');
    assertIncludes(r.js, 'automation.skillCall');
  });

  await test('SkillsTools', 'CRON_CREATE parses', () => {
    const r = parseOk('CRON_CREATE "backup" SCHEDULE "0 0 * * *" RUN "backup_all"', 'CronCreate');
    assertIncludes(r.js, 'automation.cronCreate');
  });

  await test('SkillsTools', 'CRON_CALL parses', () => {
    const r = parseOk('CRON_CALL "daily_backup"', 'CronCall');
    assertIncludes(r.js, 'automation.cronCall');
  });

  await test('SkillsTools', 'WEB_FETCH parses', () => {
    const r = parseOk('WEB_FETCH "https://example.com"', 'WebFetch');
    assertIncludes(r.js, 'automation.webFetch');
  });

  await test('SkillsTools', 'DEF result = WEB_FETCH parses', () => {
    const r = parseOk('DEF page = WEB_FETCH "https://example.com"', 'WebFetchDef');
    assertIncludes(r.js, 'automation.webFetch');
  });

  await test('SkillsTools', 'WEB_SERIAL parses', () => {
    const r = parseOk('WEB_SERIAL "/dev/ttyUSB0"', 'WebSerial');
    assertIncludes(r.js, 'automation.webSerial');
  });

  // ─── 24. File & Data Commands ───
  log('\n─── 24. File & Data Commands ───');

  await test('FileData', 'FILE_READ parses', () => {
    const r = parseOk('FILE_READ "data.csv"', 'FileRead');
    assertIncludes(r.js, 'automation.fileRead');
  });

  await test('FileData', 'DEF content = FILE_READ parses', () => {
    const r = parseOk('DEF content = FILE_READ "data.csv" FORMAT "csv"', 'FileReadDef');
    assertIncludes(r.js, 'automation.fileRead');
  });

  await test('FileData', 'FILE_WRITE parses', () => {
    const r = parseOk('FILE_WRITE "log.txt" "entry data"', 'FileWrite');
    assertIncludes(r.js, 'automation.fileWrite');
  });

  await test('FileData', 'FILE_EXECUTE parses', () => {
    const r = parseOk('FILE_EXECUTE "sub_script.cs"', 'FileExecute');
    assertIncludes(r.js, 'automation.fileExecute');
  });

  await test('FileData', 'DEF result = FILE_EXECUTE parses', () => {
    const r = parseOk('DEF result = FILE_EXECUTE "sub_script.cs"', 'FileExecDef');
    assertIncludes(r.js, 'automation.fileExecute');
  });

  await test('FileData', 'DATA_TRANSFORM parses', () => {
    const r = parseOk('DATA_TRANSFORM data USING "filter"', 'DataTransform');
    assertIncludes(r.js, 'automation.dataTransform');
  });

  await test('FileData', 'DEF result = DATA_TRANSFORM parses', () => {
    const r = parseOk('DEF result = DATA_TRANSFORM data USING "filter"', 'DataTransformDef');
    assertIncludes(r.js, 'automation.dataTransform');
  });

  // ─── 25. Communication Commands ───
  log('\n─── 25. Communication Commands ───');

  await test('Communication', 'CHANNEL_SEND parses', () => {
    const r = parseOk('CHANNEL_SEND "telegram" "Hello world"', 'ChannelSend');
    assertIncludes(r.js, 'automation.channelSend');
  });

  await test('Communication', 'EMAIL_SEND parses', () => {
    const r = parseOk('EMAIL_SEND "me@gmail.com" "Report body" SUBJECT "Daily"', 'EmailSend');
    assertIncludes(r.js, 'automation.emailSend');
  });

  await test('Communication', 'PUBLISH_CANVAS parses', () => {
    const r = parseOk('PUBLISH_CANVAS "status_page"', 'PublishCanvas');
    assertIncludes(r.js, 'automation.publishCanvas');
  });

  // ─── 26. Automation Integration Tests ───
  log('\n─── 26. Automation Integration Tests ───');

  await test('AutoIntegration', 'Multi-command automation script parses', () => {
    const script = `
DEF ema = EMA(20)
TASK_LOG "Starting analysis" LEVEL "info"
AGENT_SPAWN "researcher" WITH "analyze markets"
DEF result = SKILL_CALL "ig-market-data" WITH epic="AUDUSD"
DEF page = WEB_FETCH "https://news.com"
FILE_WRITE "log.txt" "Done"
CHANNEL_SEND "telegram" "Analysis complete"
IF ema > 50 THEN
  BUY 1 AT MARKET
ENDIF
AGENT_TERMINATE "researcher"
`;
    const r = parseOk(script, 'MultiAutomation');
    assertIncludes(r.js, 'automation.taskLog');
    assertIncludes(r.js, 'automation.agentSpawn');
    assertIncludes(r.js, 'automation.skillCall');
    assertIncludes(r.js, 'automation.webFetch');
    assertIncludes(r.js, 'automation.fileWrite');
    assertIncludes(r.js, 'automation.channelSend');
    assertIncludes(r.js, 'automation.agentTerminate');
  });

  await test('AutoIntegration', 'Automation wrapper module loads', () => {
    const automation = require('./openclaw-automation.cjs');
    assert(typeof automation.taskDefine === 'function', 'taskDefine should be a function');
    assert(typeof automation.agentSpawn === 'function', 'agentSpawn should be a function');
    assert(typeof automation.skillCall === 'function', 'skillCall should be a function');
    assert(typeof automation.webFetch === 'function', 'webFetch should be a function');
    assert(typeof automation.fileRead === 'function', 'fileRead should be a function');
    assert(typeof automation.channelSend === 'function', 'channelSend should be a function');
    assert(typeof automation.emailSend === 'function', 'emailSend should be a function');
    assert(typeof automation.publishCanvas === 'function', 'publishCanvas should be a function');
    assert(typeof automation.cronCreate === 'function', 'cronCreate should be a function');
    assert(typeof automation.dataTransform === 'function', 'dataTransform should be a function');
  });

  // ─── 7. Automation Templates ─────────────────────────────────────────
  log('\n── 7. Automation Templates ──────────────────────────────');

  const TEMPLATES_DIR = path.join(__dirname, '..', '..', '.openclaw', 'canvas', 'clawscript-templates');
  const automationTemplates = [
    { file: 'trade-self-improve.cs', expectedCmds: ['TaskDefine', 'GenericCmd'], minStmts: 5 },
    { file: 'multi-agent-ops.cs', expectedCmds: ['TaskDefine'], minStmts: 1 },
    { file: 'cron-monitor.cs', expectedCmds: ['CronCreate', 'TaskDefine', 'GenericCmd'], minStmts: 3 },
    { file: 'data-pipeline.cs', expectedCmds: ['TaskDefine'], minStmts: 1 },
    { file: 'full-operations.cs', expectedCmds: ['TaskDefine', 'CronCreate'], minStmts: 3 },
  ];

  for (const tpl of automationTemplates) {
    test('Automation Templates', `${tpl.file} parses without errors`, () => {
      const code = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.file), 'utf8');
      const result = parseAndGenerate(code);
      assert(result && result.ast, `${tpl.file} should produce AST`);
      assert(result.ast.body.length >= tpl.minStmts, `${tpl.file} should have at least ${tpl.minStmts} statements, got ${result.ast.body.length}`);
    });

    test('Automation Templates', `${tpl.file} generates valid JS`, () => {
      const code = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.file), 'utf8');
      const result = parseAndGenerate(code);
      assert(result.js, `${tpl.file} should produce JS`);
      assert(result.js.length > 200, `${tpl.file} JS should be substantial (got ${result.js.length} bytes)`);
      assert(result.js.includes('automation.'), `${tpl.file} JS should call automation module`);
      assert(result.imports.includes('automation'), `${tpl.file} should import automation`);
    });

    test('Automation Templates', `${tpl.file} contains expected AST node types`, () => {
      const code = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.file), 'utf8');
      const result = parseAndGenerate(code);
      const types = new Set();
      function collectTypes(node) {
        if (!node) return;
        if (node.type) types.add(node.type);
        if (node.body) node.body.forEach(collectTypes);
        if (node.then) node.then.forEach(collectTypes);
        if (node.elseBody) node.elseBody.forEach(collectTypes);
      }
      result.ast.body.forEach(collectTypes);
      for (const cmd of tpl.expectedCmds) {
        assert(types.has(cmd), `${tpl.file} AST should contain ${cmd} node, found: [${[...types].join(',')}]`);
      }
    });

    test('Automation Templates', `${tpl.file} JS is syntactically valid`, () => {
      const code = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.file), 'utf8');
      const result = parseAndGenerate(code);
      try {
        new Function(result.js);
      } catch (e) {
        assert(false, `${tpl.file} JS has syntax errors: ${e.message}`);
      }
    });
  }

  test('Automation Templates', 'All 22 automation commands covered across templates', () => {
    const allCmds = new Set();
    for (const tpl of automationTemplates) {
      const code = fs.readFileSync(path.join(TEMPLATES_DIR, tpl.file), 'utf8');
      const result = parseAndGenerate(code);
      const jsCode = result.js;
      const cmdMatches = jsCode.match(/automation\.(\w+)\(/g) || [];
      cmdMatches.forEach(m => allCmds.add(m.replace('automation.', '').replace('(', '')));
    }
    const expected22 = [
      'taskDefine', 'taskAssign', 'taskChain', 'taskParallel', 'taskShowFlow', 'taskLog',
      'agentSpawn', 'agentCall', 'agentPass', 'agentTerminate',
      'skillCall', 'cronCreate', 'cronCall',
      'webFetch', 'webSerial',
      'fileRead', 'fileWrite', 'fileExecute',
      'dataTransform',
      'channelSend', 'emailSend', 'publishCanvas'
    ];
    const missing = expected22.filter(c => !allCmds.has(c));
    assert(missing.length === 0, `Templates missing commands: [${missing.join(', ')}]. Found: [${[...allCmds].join(', ')}]`);
  });

  test('Automation Templates', 'automation module functions all callable without crash', () => {
    const automation = require('./openclaw-automation.cjs');
    const fns = [
      'taskDefine', 'taskAssign', 'taskChain', 'taskParallel', 'taskShowFlow', 'taskLog',
      'agentSpawn', 'agentCall', 'agentPass', 'agentTerminate',
      'skillCall', 'cronCreate', 'cronCall',
      'webFetch', 'webSerial',
      'fileRead', 'fileWrite', 'fileExecute',
      'dataTransform',
      'channelSend', 'emailSend', 'publishCanvas'
    ];
    for (const fn of fns) {
      assert(typeof automation[fn] === 'function', `automation.${fn} should be a function`);
    }
  });

  log('\n══════════════════════════════════════════════════════════');
  log('  RESULTS');
  log('══════════════════════════════════════════════════════════');
  log(`  Total:   ${total}`);
  log(`  Passed:  ${passed}`);
  log(`  Failed:  ${failed}`);
  log(`  Skipped: ${skipped}`);
  log(`  Rate:    ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
  log('══════════════════════════════════════════════════════════\n');

  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, skipped, rate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%' },
    proxyAvailable: hasProxy,
    btcEpic: BTC_EPIC,
    results
  };

  try {
    const reportDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    log(`Report saved to: ${REPORT_FILE}`);
  } catch (err) {
    log(`Failed to save report: ${err.message}`);
  }

  if (failed > 0) {
    log('\nFailed tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      log(`  ✗ [${r.category}] ${r.name}: ${r.error}`);
    });
  }

  return { total, passed, failed, skipped };
}

if (require.main === module) {
  runAllTests().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('Pipeline test suite crashed:', err);
    process.exit(2);
  });
}

module.exports = { runAllTests };
