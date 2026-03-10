#!/usr/bin/env node
'use strict';

const { parseAndGenerate, parseToAST, lexer, ClawScriptParser, TOKEN_TYPES, KEYWORDS } = require('./clawscript-parser.cjs');

let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL: ${name}`);
    console.log(`        ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertIncludes(str, substr, msg) {
  if (!str.includes(substr)) throw new Error(msg || `Expected "${str.substring(0, 80)}..." to include "${substr}"`);
}

function assertNoThrow(fn, msg) {
  try { fn(); } catch (e) { throw new Error(msg || `Expected no error but got: ${e.message}`); }
}

function assertThrows(fn, msg) {
  try { fn(); throw new Error(msg || 'Expected an error but none thrown'); } catch (e) {
    if (e.message === (msg || 'Expected an error but none thrown')) throw e;
  }
}

function parseOk(code, name) {
  const result = parseAndGenerate(code, name || 'Test');
  assert(result.ast, 'AST should exist');
  assert(result.js, 'JS should exist');
  assert(typeof result.js === 'string', 'JS should be string');
  return result;
}

function jsSyntaxOk(js) {
  try {
    new Function(js.replace(/require\([^)]+\)/g, '{}').replace(/await /g, ''));
    return true;
  } catch (e) {
    return false;
  }
}

console.log('\n=== ClawScript Parser Test Suite ===\n');

console.log('--- 1. Lexer Tests ---');

test('Lexer: tokenizes identifiers', () => {
  const tokens = lexer('DEF foo = 42');
  assert(tokens.length >= 4, 'Should have at least 4 tokens');
  assert(tokens[0].type === TOKEN_TYPES.KEYWORD, 'DEF should be keyword');
  assert(tokens[0].value === 'DEF', 'First token should be DEF');
});

test('Lexer: tokenizes strings', () => {
  const tokens = lexer('"hello world"');
  assert(tokens.length === 1);
  assert(tokens[0].type === TOKEN_TYPES.STRING);
  assert(tokens[0].value === 'hello world');
});

test('Lexer: tokenizes numbers', () => {
  const tokens = lexer('42 3.14');
  assert(tokens.length === 2);
  assert(tokens[0].value === 42);
  assert(tokens[1].value === 3.14);
});

test('Lexer: skips comments', () => {
  const tokens = lexer('DEF x = 1 // this is a comment');
  const commentTokens = tokens.filter(t => t.type === TOKEN_TYPES.COMMENT);
  assert(commentTokens.length === 0, 'Comments should be filtered');
});

test('Lexer: recognizes operators', () => {
  const tokens = lexer('> < >= <= == != + - * /');
  const ops = tokens.filter(t => t.type === TOKEN_TYPES.OPERATOR);
  assert(ops.length >= 8, 'Should have operators');
});

test('Lexer: recognizes keywords case-insensitive', () => {
  const tokens = lexer('buy SELL If then');
  assert(tokens.every(t => t.type === TOKEN_TYPES.KEYWORD), 'All should be keywords');
});

console.log('\n--- 2. Variable Declaration Tests ---');

test('DEF simple number', () => {
  const r = parseOk('DEF risk = 2');
  assert(r.ast.body.length === 1);
  assert(r.ast.body[0].type === 'VarDecl');
  assert(r.ast.body[0].isDef === true);
  assert(r.ast.body[0].name === 'risk');
  assertIncludes(r.js, 'const risk = 2');
});

test('DEF string value', () => {
  const r = parseOk('DEF name = "hello"');
  assertIncludes(r.js, 'const name = "hello"');
});

test('SET variable', () => {
  const r = parseOk('SET risk = 5');
  assert(r.ast.body[0].isDef === false);
  assertIncludes(r.js, 'let risk = 5');
});

test('DEF with expression', () => {
  const r = parseOk('DEF val = 2 + 3 * 4');
  assert(r.ast.body[0].type === 'VarDecl');
  assertIncludes(r.js, 'const val =');
});

test('DEF with AI_QUERY', () => {
  const r = parseOk('DEF result = AI_QUERY "analyze this"');
  assert(r.ast.body[0].value.type === 'AIQuery');
  assertIncludes(r.js, 'ai.aiQuery');
});

console.log('\n--- 3. Trading Command Tests ---');

test('BUY simple', () => {
  const r = parseOk('BUY 1 AT MARKET');
  assert(r.ast.body[0].type === 'Trade');
  assert(r.ast.body[0].command === 'BUY');
  assertIncludes(r.js, "direction: 'BUY'");
});

test('BUY with condition and stop/limit', () => {
  const r = parseOk('BUY 1 AT MARKET IF RSI(14) < 30 STOP 10 LIMIT 20 REASON "Low RSI"');
  const trade = r.ast.body[0];
  assert(trade.type === 'Trade');
  assert(trade.stop !== null);
  assert(trade.limit !== null);
  assert(trade.reason !== null);
  assertIncludes(r.js, 'signal: true');
  assertIncludes(r.js, 'stopDist: 10');
});

test('SELL command', () => {
  const r = parseOk('SELL 2 AT MARKET REASON "Overbought"');
  assert(r.ast.body[0].command === 'SELL');
  assertIncludes(r.js, "direction: 'SELL'");
});

test('SELLSHORT command', () => {
  const r = parseOk('SELLSHORT AT MARKET');
  assert(r.ast.body[0].command === 'SELLSHORT');
});

test('EXIT ALL', () => {
  const r = parseOk('EXIT ALL IF PROFIT > 50 REASON "Take profit"');
  assert(r.ast.body[0].type === 'Exit');
  assert(r.ast.body[0].exitType === 'ALL');
  assertIncludes(r.js, 'close: true');
});

test('CLOSE command', () => {
  const r = parseOk('CLOSE ALL');
  assert(r.ast.body[0].type === 'Exit');
});

test('TRAILSTOP', () => {
  const r = parseOk('TRAILSTOP 10 ACCEL 0.02 MAX 0.2');
  assert(r.ast.body[0].type === 'TrailStop');
  assertIncludes(r.js, '_trailStop');
});

console.log('\n--- 4. Control Flow Tests ---');

test('IF/THEN/ENDIF', () => {
  const r = parseOk('IF x > 5 THEN\n  DEF y = 10\nENDIF');
  assert(r.ast.body[0].type === 'IfStatement');
  assert(r.ast.body[0].thenBody.length === 1);
  assertIncludes(r.js, 'if (');
});

test('IF/ELSE/ENDIF', () => {
  const r = parseOk('IF x > 5 THEN\n  DEF y = 10\nELSE\n  DEF y = 20\nENDIF');
  assert(r.ast.body[0].elseBody.length === 1);
  assertIncludes(r.js, 'else');
});

test('ELSE IF chain', () => {
  const r = parseOk('IF x > 10 THEN\n  DEF a = 1\nELSE IF x > 5 THEN\n  DEF a = 2\nELSE\n  DEF a = 3\nENDIF');
  assert(r.ast.body[0].type === 'IfStatement');
  assert(r.ast.body[0].elseBody[0].type === 'IfStatement');
});

test('LOOP N TIMES', () => {
  const r = parseOk('LOOP 3 TIMES\n  DEF x = 1\nENDLOOP');
  assert(r.ast.body[0].type === 'Loop');
  assert(r.ast.body[0].loopType === 'LOOP');
  assertIncludes(r.js, 'for (let i = 0; i < 3');
});

test('LOOP FOREVER', () => {
  const r = parseOk('LOOP FOREVER\n  WAIT 1000\nENDLOOP');
  assert(r.ast.body[0].isForever === true);
  assertIncludes(r.js, 'while (true)');
});

test('WHILE loop', () => {
  const r = parseOk('WHILE risk > 0\n  SET risk = risk - 1\nENDWHILE');
  assert(r.ast.body[0].type === 'Loop');
  assert(r.ast.body[0].loopType === 'WHILE');
  assertIncludes(r.js, 'while (');
});

test('TRY/CATCH/ENDTRY', () => {
  const r = parseOk('TRY\n  DEF x = 1\nCATCH err\n  ALERT "Error"\nENDTRY');
  assert(r.ast.body[0].type === 'TryCatch');
  assert(r.ast.body[0].catchVar === 'err');
  assertIncludes(r.js, 'try {');
  assertIncludes(r.js, 'catch (err)');
});

test('ERROR throw', () => {
  const r = parseOk('ERROR "Something went wrong"');
  assert(r.ast.body[0].type === 'ErrorThrow');
  assertIncludes(r.js, 'throw new Error');
});

test('WAIT command', () => {
  const r = parseOk('WAIT 5000');
  assert(r.ast.body[0].type === 'Wait');
  assertIncludes(r.js, 'setTimeout');
});

console.log('\n--- 5. AI/Analysis Command Tests ---');

test('AI_QUERY basic', () => {
  const r = parseOk('AI_QUERY "analyze market"');
  assert(r.ast.body[0].type === 'AIQuery');
  assertIncludes(r.js, 'ai.aiQuery');
});

test('AI_QUERY with TOOL and ARG', () => {
  const r = parseOk('AI_QUERY "optimize" TOOL "code_execution" ARG "code=analyze.py"');
  assert(r.ast.body[0].tool !== null);
  assert(r.ast.body[0].arg !== null);
});

test('DEF var = AI_QUERY', () => {
  const r = parseOk('DEF analysis = AI_QUERY "what is RSI?"');
  assert(r.ast.body[0].type === 'VarDecl');
  assert(r.ast.body[0].value.type === 'AIQuery');
});

test('AI_GENERATE_SCRIPT', () => {
  const r = parseOk('AI_GENERATE_SCRIPT "mean reversion" TO "mean_rev_v1"');
  assert(r.ast.body[0].type === 'AIGenerate');
  assertIncludes(r.js, 'ai.aiGenerateScript');
});

test('ANALYZE_LOG', () => {
  const r = parseOk('DEF reason = ANALYZE_LOG "drawdown cause" LIMIT 10');
  assert(r.ast.body[0].value.type === 'AnalyzeLog');
  assertIncludes(r.js, 'ai.analyzeLog');
});

test('RUN_ML', () => {
  const r = parseOk('DEF pred = RUN_ML "lstm_predict.py" ON last_ticks');
  assert(r.ast.body[0].value.type === 'RunML');
  assertIncludes(r.js, 'ai.runML');
});

console.log('\n--- 6. Data Fetch Command Tests ---');

test('CLAW_WEB', () => {
  const r = parseOk('DEF news = CLAW_WEB "https://news.com" INSTRUCT "summarize"');
  assert(r.ast.body[0].value.type === 'ClawWeb');
  assertIncludes(r.js, 'data.clawWeb');
});

test('CLAW_X', () => {
  const r = parseOk('DEF posts = CLAW_X "BTC sentiment" LIMIT 5 MODE "Latest"');
  assert(r.ast.body[0].value.type === 'ClawX');
  assertIncludes(r.js, 'data.clawX');
});

test('CLAW_PDF', () => {
  const r = parseOk('DEF summary = CLAW_PDF "report.pdf" QUERY "risk" PAGES "1-5"');
  assert(r.ast.body[0].value.type === 'ClawPdf');
  assertIncludes(r.js, 'data.clawPdf');
});

test('CLAW_IMAGE', () => {
  const r = parseOk('DEF img = CLAW_IMAGE "chart" NUM 3');
  assert(r.ast.body[0].value.type === 'ClawImage');
  assertIncludes(r.js, 'data.clawImage');
});

test('CLAW_VIDEO', () => {
  const r = parseOk('DEF vid = CLAW_VIDEO "https://video.com/v1"');
  assert(r.ast.body[0].value.type === 'ClawVideo');
  assertIncludes(r.js, 'data.clawVideo');
});

test('CLAW_IMAGE_VIEW', () => {
  const r = parseOk('CLAW_IMAGE_VIEW "chart_123"');
  assert(r.ast.body[0].type === 'ClawImageView');
  assertIncludes(r.js, 'data.clawImageView');
});

test('CLAW_CONVERSATION', () => {
  const r = parseOk('DEF old = CLAW_CONVERSATION "previous RSI ideas"');
  assert(r.ast.body[0].value.type === 'ClawConversation');
  assertIncludes(r.js, 'data.clawConversation');
});

test('CLAW_CODE', () => {
  const r = parseOk('DEF result = CLAW_CODE "import numpy; return numpy.mean([1,2,3])"');
  assert(r.ast.body[0].value.type === 'ClawCode');
  assertIncludes(r.js, 'tools.clawCode');
});

test('CLAW_TOOL', () => {
  const r = parseOk('DEF result = CLAW_TOOL "browse_page"');
  assert(r.ast.body[0].value.type === 'ClawTool');
  assertIncludes(r.js, 'tools.clawTool');
});

console.log('\n--- 7. Agent/Orchestration Command Tests ---');

test('SPAWN_AGENT', () => {
  const r = parseOk('SPAWN_AGENT "analyzer" WITH "review trades"');
  assert(r.ast.body[0].type === 'SpawnAgent');
  assertIncludes(r.js, 'chat.spawnAgent');
});

test('CALL_SESSION', () => {
  const r = parseOk('DEF update = CALL_SESSION "optimizer" "re-optimize RSI"');
  assert(r.ast.body[0].value.type === 'CallSession');
  assertIncludes(r.js, 'chat.callSession');
});

test('MUTATE_CONFIG', () => {
  const r = parseOk('MUTATE_CONFIG "rsiOverbought" = 75');
  assert(r.ast.body[0].type === 'MutateConfig');
  assertIncludes(r.js, 'this.config');
});

test('ALERT basic', () => {
  const r = parseOk('ALERT "Drawdown exceeded"');
  assert(r.ast.body[0].type === 'Alert');
  assertIncludes(r.js, 'channels.send');
});

test('ALERT with LEVEL and TO', () => {
  const r = parseOk('ALERT "crash" LEVEL "error" TO "telegram"');
  assertIncludes(r.js, '"telegram"');
  assertIncludes(r.js, '"error"');
});

test('SAY_TO_SESSION', () => {
  const r = parseOk('SAY_TO_SESSION "ceo" "market update"');
  assert(r.ast.body[0].type === 'SayToSession');
  assertIncludes(r.js, 'chat.sayToSession');
});

test('WAIT_FOR_REPLY', () => {
  const r = parseOk('DEF reply = WAIT_FOR_REPLY "ceo" TIMEOUT 60 FILTER "ok"');
  assert(r.ast.body[0].value.type === 'WaitForReply');
  assertIncludes(r.js, 'chat.waitForReply');
});

console.log('\n--- 8. Storage & Config Tests ---');

test('STORE_VAR', () => {
  const r = parseOk('STORE_VAR "last_rsi" 14 GLOBAL');
  assert(r.ast.body[0].type === 'StoreVar');
  assert(r.ast.body[0].isGlobal === true);
  assertIncludes(r.js, 'tools.storeVar');
});

test('LOAD_VAR', () => {
  const r = parseOk('DEF rsi = LOAD_VAR "last_rsi" DEFAULT 14');
  assert(r.ast.body[0].value.type === 'LoadVar');
  assertIncludes(r.js, 'tools.loadVar');
});

test('INCLUDE', () => {
  const r = parseOk('INCLUDE "common_indicators"');
  assert(r.ast.body[0].type === 'Include');
  assertIncludes(r.js, 'INCLUDE');
});

test('OPTIMIZE', () => {
  const r = parseOk('OPTIMIZE rsiPeriod FROM 10 TO 20 STEP 2 USING 30');
  assert(r.ast.body[0].type === 'Optimize');
  assertIncludes(r.js, 'OPTIMIZE');
});

console.log('\n--- 9. Advanced Command Tests ---');

test('CRASH_SCAN ON', () => {
  const r = parseOk('CRASH_SCAN ON');
  assert(r.ast.body[0].type === 'CrashScan');
  assert(r.ast.body[0].state === 'ON');
  assertIncludes(r.js, '_crashScanEnabled = true');
});

test('CRASH_SCAN OFF', () => {
  const r = parseOk('CRASH_SCAN OFF');
  assertIncludes(r.js, '_crashScanEnabled = false');
});

test('MARKET_NOMAD', () => {
  const r = parseOk('MARKET_NOMAD ON MAX_INSTRUMENTS 4 SCAN_INTERVAL 15');
  assert(r.ast.body[0].type === 'MarketNomad');
  assertIncludes(r.js, 'nomad.setEnabled');
});

test('NOMAD_SCAN', () => {
  const r = parseOk('DEF top = NOMAD_SCAN "commodities" LIMIT 3');
  assert(r.ast.body[0].value.type === 'NomadScan');
  assertIncludes(r.js, 'nomad.scan');
});

test('NOMAD_ALLOCATE', () => {
  const r = parseOk('NOMAD_ALLOCATE TO candidates SIZING "kelly"');
  assert(r.ast.body[0].type === 'NomadAllocate');
  assertIncludes(r.js, 'nomad.allocate');
});

test('RUMOR_SCAN', () => {
  const r = parseOk('DEF rumors = RUMOR_SCAN "AUD crash" SOURCES "both" LIMIT 5 FILTER "negative"');
  assert(r.ast.body[0].value.type === 'RumorScan');
  assertIncludes(r.js, 'tools.rumorScan');
});

test('INDICATOR call', () => {
  const r = parseOk('DEF rsi_val = INDICATOR(RSI, 14)');
  assert(r.ast.body[0].value.type === 'IndicatorCall');
  assertIncludes(r.js, 'indicators.calcRSI');
});

console.log('\n--- 10. Function & Chain Tests ---');

test('DEF_FUNC / ENDFUNC', () => {
  const r = parseOk('DEF_FUNC safe_buy(size, cond)\n  BUY size AT MARKET\nENDFUNC');
  assert(r.ast.body[0].type === 'FunctionDecl');
  assert(r.ast.body[0].name === 'safe_buy');
  assert(r.ast.body[0].params.length === 2);
});

test('CHAIN command', () => {
  const r = parseOk('CHAIN x THEN y THEN z');
  assert(r.ast.body[0].type === 'Chain');
  assert(r.ast.body[0].steps.length === 3);
  assertIncludes(r.js, '_chainResult');
});

console.log('\n--- 11. Expression Tests ---');

test('Binary expressions: arithmetic', () => {
  const r = parseOk('DEF x = 2 + 3 * 4 - 1');
  assertIncludes(r.js, 'const x =');
});

test('Comparison operators', () => {
  const r = parseOk('IF x > 5 THEN DEF y = 1 ENDIF');
  assertIncludes(r.js, 'if (');
});

test('AND / OR operators', () => {
  const r = parseOk('IF x > 5 AND y < 10 THEN DEF z = 1 ENDIF');
  assertIncludes(r.js, '&&');
});

test('CONTAINS operator', () => {
  const r = parseOk('IF reply CONTAINS "yes" THEN DEF ok = 1 ENDIF');
  assertIncludes(r.js, '.includes(');
});

test('CROSSES OVER operator', () => {
  const r = parseOk('IF price CROSSES OVER EMA(20) THEN BUY 1 AT MARKET ENDIF');
  assertIncludes(r.js, '>');
});

test('Function call in expression: RSI(14)', () => {
  const r = parseOk('DEF x = RSI(14)');
  assertIncludes(r.js, 'indicators.calcRSI(prices, 14)');
});

test('Member access: obj.property', () => {
  const r = parseOk('DEF x = result.upper');
  assertIncludes(r.js, 'result.upper');
});

test('String concatenation', () => {
  const r = parseOk('DEF msg = "value: " + x');
  assertIncludes(r.js, '+');
});

console.log('\n--- 12. Complex Script Tests ---');

test('Full loop with try-catch and trades', () => {
  const code = `
DEF risk = 2

LOOP 3 TIMES
  TRY
    DEF rsi_val = INDICATOR(RSI, 14)
    IF rsi_val < 30 THEN
      BUY 1 AT MARKET STOP 10 LIMIT 20 REASON "Low RSI"
    ENDIF
    AI_QUERY "Analyze" TOOL "tool" ARG "arg"
  CATCH err
    ALERT "Error" LEVEL "error" TO "telegram"
    ERROR "Failed"
  ENDTRY
  WAIT 1000
ENDLOOP

WHILE risk > 0
  SET risk = risk - 1
ENDWHILE
`;
  const r = parseOk(code, 'FullTest');
  assert(r.ast.body.length >= 3, 'Should have multiple statements');
  assertIncludes(r.js, 'for (let i = 0');
  assertIncludes(r.js, 'try {');
  assertIncludes(r.js, 'catch (err)');
  assertIncludes(r.js, 'while (');
});

test('Nested IF with trades', () => {
  const code = `
IF RSI(14) < 30 THEN
  IF ATR(14) > 1.5 THEN
    BUY 1 AT MARKET STOP 10
  ELSE
    ALERT "Low vol"
  ENDIF
ELSE IF RSI(14) > 70 THEN
  SELL 1 AT MARKET
ENDIF
`;
  const r = parseOk(code, 'NestedIF');
  assertIncludes(r.js, 'if (');
  assertIncludes(r.js, 'else');
});

test('Flash crash scanner excerpt', () => {
  const code = `
DEF crash_threshold = -5
DEF current_mid = 100
DEF price_change = -6

IF price_change < crash_threshold THEN
  SAY_TO_SESSION "ceo" "CRASH DETECTED"
  ALERT "Crash alert!" LEVEL "error" TO "telegram"
  DEF analysis = AI_QUERY "Analyze crash"
  DEF reply = WAIT_FOR_REPLY "ceo" TIMEOUT 120 FILTER "proceed"
  IF reply CONTAINS "pause" THEN
    MUTATE_CONFIG "enabled" = false
  ENDIF
ENDIF
`;
  const r = parseOk(code, 'CrashScanner');
  assertIncludes(r.js, 'chat.sayToSession');
  assertIncludes(r.js, 'channels.send');
  assertIncludes(r.js, 'ai.aiQuery');
  assertIncludes(r.js, 'chat.waitForReply');
});

test('Nomadic portfolio excerpt', () => {
  const code = `
MARKET_NOMAD ON MAX_INSTRUMENTS 4
DEF candidates = NOMAD_SCAN "all" LIMIT 10
NOMAD_ALLOCATE TO candidates SIZING "vol_parity"
CRASH_SCAN ON
`;
  const r = parseOk(code, 'NomadicPortfolio');
  assertIncludes(r.js, 'nomad.setEnabled');
  assertIncludes(r.js, 'nomad.scan');
  assertIncludes(r.js, 'nomad.allocate');
  assertIncludes(r.js, '_crashScanEnabled = true');
});

test('Variable usage in trades', () => {
  const code = `
DEF risk_pct = 1.5
DEF rsi_period = 14
DEF base_size = 0.5
IF RSI(rsi_period) < 30 THEN
  BUY base_size AT MARKET STOP 10 LIMIT 20 REASON "Oversold"
ENDIF
`;
  const r = parseOk(code, 'VarTrades');
  assertIncludes(r.js, 'const risk_pct = 1.5');
  assertIncludes(r.js, 'const rsi_period = 14');
});

test('SAY_TO_SESSION with variable concat', () => {
  const code = `
DEF pnl = -500
SAY_TO_SESSION "ceo" "Warning: PnL is " + pnl
`;
  const r = parseOk(code, 'SayTest');
  assertIncludes(r.js, 'chat.sayToSession');
});

console.log('\n--- 13. Generated JS Validity ---');

test('Generated JS is syntactically valid (simple)', () => {
  const r = parseOk('DEF x = 42', 'Simple');
  assert(jsSyntaxOk(r.js), 'JS should be syntactically valid');
});

test('Generated JS is syntactically valid (complex)', () => {
  const code = `
DEF risk = 2
IF risk > 1 THEN
  DEF msg = "high risk"
  ALERT msg LEVEL "warn"
ELSE
  DEF msg = "low risk"
ENDIF
LOOP 3 TIMES
  SET risk = risk - 1
ENDLOOP
`;
  const r = parseOk(code, 'ComplexValid');
  assert(jsSyntaxOk(r.js), 'Complex JS should be syntactically valid');
});

test('Generated strategy has correct class structure', () => {
  const r = parseOk('DEF x = 1', 'MyStrat');
  assertIncludes(r.js, 'class MyStratStrategy extends BaseStrategy');
  assertIncludes(r.js, 'evaluateEntry');
  assertIncludes(r.js, 'evaluateExit');
  assertIncludes(r.js, 'getRequiredBufferSize');
  assertIncludes(r.js, 'getConfigSchema');
  assertIncludes(r.js, "STRATEGY_TYPE");
  assertIncludes(r.js, "'custom-mystrat'");
  assertIncludes(r.js, 'module.exports = MyStratStrategy');
});

test('Imports tracked correctly', () => {
  const code = `
AI_QUERY "test"
CLAW_WEB "url" INSTRUCT "x"
SAY_TO_SESSION "ceo" "msg"
ALERT "test" TO "telegram"
`;
  const r = parseOk(code, 'ImportTest');
  assert(r.imports.includes('ai'), 'Should have ai import');
  assert(r.imports.includes('data'), 'Should have data import');
  assert(r.imports.includes('chat'), 'Should have chat import');
  assert(r.imports.includes('channels'), 'Should have channels import');
});

console.log('\n--- 14. BTC Test Strategy ---');

test('BTC RSI+EMA Strategy compiles', () => {
  const code = `
DEF rsi_period = 14
DEF ema_fast = 9
DEF ema_slow = 21
DEF stop_mult = 2

DEF rsi = RSI(rsi_period)
DEF ema_f = EMA(ema_fast)
DEF ema_s = EMA(ema_slow)
DEF atr = ATR(14)

IF rsi < 30 AND ema_f > ema_s THEN
  BUY 1 AT MARKET STOP atr * stop_mult LIMIT atr * 4 REASON "RSI oversold + EMA cross"
ENDIF

IF rsi > 70 AND ema_f < ema_s THEN
  SELL 1 AT MARKET STOP atr * stop_mult LIMIT atr * 4 REASON "RSI overbought + EMA cross"
ENDIF

EXIT ALL IF PROFIT > 100 REASON "Target hit"
`;
  const r = parseOk(code, 'BTCTest');
  assertIncludes(r.js, 'indicators.calcRSI');
  assertIncludes(r.js, 'indicators.calcEMA');
  assertIncludes(r.js, 'indicators.calcATR');
  assertIncludes(r.js, "direction: 'BUY'");
  assertIncludes(r.js, "direction: 'SELL'");
  assert(jsSyntaxOk(r.js), 'BTC strategy JS should be valid');
});

console.log('\n--- 15. parseToAST standalone ---');

test('parseToAST returns AST without JS', () => {
  const ast = parseToAST('DEF x = 1');
  assert(ast.type === 'Program');
  assert(ast.body.length === 1);
  assert(ast.body[0].type === 'VarDecl');
});

console.log('\n\n=== RESULTS ===');
console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log(failed === 0 ? 'ALL TESTS PASSED!' : `${failed} test(s) failed.`);
process.exit(failed > 0 ? 1 : 0);
