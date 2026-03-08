(function() {
'use strict';

var TOKEN_TYPES = {
  KEYWORD: 'keyword', IDENTIFIER: 'identifier', STRING: 'string',
  NUMBER: 'number', OPERATOR: 'operator', PUNCTUATION: 'punctuation', COMMENT: 'comment'
};

var CS_KEYWORDS = [
  'DEF','SET','BUY','SELL','SELLSHORT','EXIT','CLOSE','TRAILSTOP',
  'IF','THEN','ELSE','ENDIF','LOOP','WHILE','ENDLOOP','ENDWHILE',
  'TIMES','FOREVER','AT','MARKET','LIMIT','STOP','REASON',
  'AI_QUERY','AI_GENERATE_SCRIPT','ANALYZE_LOG','RUN_ML',
  'CLAW_WEB','CLAW_X','CLAW_PDF','CLAW_IMAGE','CLAW_VIDEO',
  'CLAW_IMAGE_VIEW','CLAW_CONVERSATION','CLAW_TOOL','CLAW_CODE',
  'SPAWN_AGENT','CALL_SESSION','MUTATE_CONFIG','ALERT',
  'SAY_TO_SESSION','WAIT_FOR_REPLY',
  'STORE_VAR','LOAD_VAR','WAIT','TRY','CATCH','ENDTRY',
  'ERROR','INCLUDE','OPTIMIZE','INDICATOR',
  'CRASH_SCAN','MARKET_NOMAD','NOMAD_SCAN','NOMAD_ALLOCATE','RUMOR_SCAN',
  'DEF_FUNC','ENDFUNC','CHAIN',
  'AND','OR','NOT','CONTAINS','CROSSES','OVER','UNDER',
  'TOOL','ARG','INSTRUCT','MODE','QUERY','PAGES','NUM',
  'WITH','TO','LEVEL','OPTIONS','TIMEOUT','FILTER',
  'SOURCES','ON','OFF','GLOBAL','DEFAULT','PART','ALL',
  'ACCEL','MAX','FROM','STEP','USING','SIZING',
  'STRATEGY_ENTRY','STRATEGY_EXIT','STRATEGY_CLOSE',
  'INPUT_INT','INPUT_FLOAT','INPUT_BOOL','INPUT_SYMBOL',
  'TIMEFRAME_PERIOD','TIMEFRAME_IS_DAILY',
  'ARRAY_NEW','ARRAY_PUSH','MATRIX_NEW','MATRIX_SET',
  'FETCH_HISTORICAL','FETCH_MEMBERS','GROUP_MEMBERS',
  'ECON_DATA','ESTIMATE',
  'TIME_IN_MARKET','TIME_SINCE_EVENT','SCHEDULE','WAIT_UNTIL',
  'MARKET_SCAN','PORTFOLIO_BUILD','PORTFOLIO_REBALANCE',
  'ECON_INDICATOR','FISCAL_FLOW','ELECTION_IMPACT',
  'CURRENCY_CARRY','POLICY_SENTIMENT','SANCTION_IMPACT','VOTE_PREDICT',
  'MATH_MODEL','RISK_MODEL','MONTE_CARLO',
  'TASK_SCHEDULE','FILE_PARSE','WEATHER_IMPACT',
  'UNIT','REPEAT','COUNTRY','DATE','WINDOW','REGION',
  'COMMODITY','POLL_SOURCE','SOLVE','PARAMS','CONFIDENCE',
  'RUNS','EVERY','RUN','FORMAT','DAYS','DIRECTION',
  'MAX_RISK','THRESHOLD',
  'PRT_IF','PRT_THEN','PRT_ELSE','PRT_ENDIF',
  'PRT_BUY','PRT_SELL',
  'PRT_AVERAGE','PRT_RSI','PRT_MACD','PRT_BOLLINGER',
  'PRT_STOCHASTIC','PRT_ATR','PRT_CCI','PRT_ADX',
  'PRT_DONCHIAN','PRT_ICHIMOKU','PRT_KELTNERCHANNEL',
  'PRT_PARABOLICSAR','PRT_SUPERTREND',
  'PRT_VOLUMEBYPRICE','PRT_FIBONACCI','PRT_PIVOTPOINT','PRT_DEMARK',
  'PRT_WILLIAMS','PRT_ULTOSC','PRT_CHAIKIN','PRT_ONBALANCEVOLUME','PRT_VWAP',
  'PRT_ALERT','PRT_OPTIMIZE','PRT_OPTIMISE','PRT_TIMEFRAME',
  'PRT_BARINDEX','PRT_DATE','PRT_TIME',
  'PRT_CUM','PRT_HIGHEST','PRT_LOWEST','PRT_SUM','PRT_STD',
  'PRT_CORRELATION','PRT_REGRESSION',
  'PRT_DEFPARAM','PRT_RETURN',
  'PRT_DRAWLINE','PRT_DRAWARROW','PRT_HISTOGRAM',
  'PRT_CROSS','PRT_BARSSINCE','PRT_SUMMATION'
];

var TRADE_CMDS = ['BUY','SELL','SELLSHORT','EXIT','CLOSE','TRAILSTOP','STRATEGY_ENTRY','STRATEGY_EXIT','STRATEGY_CLOSE','PRT_BUY','PRT_SELL'];
var AI_CMDS = ['AI_QUERY','AI_GENERATE_SCRIPT','ANALYZE_LOG','RUN_ML'];
var DATA_CMDS = ['CLAW_WEB','CLAW_X','CLAW_PDF','CLAW_IMAGE','CLAW_VIDEO','CLAW_IMAGE_VIEW','CLAW_CONVERSATION','CLAW_TOOL','CLAW_CODE','FETCH_HISTORICAL','FETCH_MEMBERS','GROUP_MEMBERS','ECON_DATA','ESTIMATE'];
var AGENT_CMDS = ['SPAWN_AGENT','CALL_SESSION','MUTATE_CONFIG','ALERT','SAY_TO_SESSION','WAIT_FOR_REPLY','PRT_ALERT'];
var CONTROL_CMDS = ['IF','THEN','ELSE','ENDIF','LOOP','WHILE','ENDLOOP','ENDWHILE','TRY','CATCH','ENDTRY','DEF_FUNC','ENDFUNC','CHAIN','PRT_IF','PRT_THEN','PRT_ELSE','PRT_ENDIF'];
var ADVANCED_CMDS = ['CRASH_SCAN','MARKET_NOMAD','NOMAD_SCAN','NOMAD_ALLOCATE','RUMOR_SCAN','OPTIMIZE','INDICATOR','PRT_OPTIMIZE','PRT_OPTIMISE'];
var OPERATOR_CMDS = ['AND','OR','NOT','CROSSES','OVER','UNDER','CONTAINS'];
var ECONPOL_CMDS = ['ECON_INDICATOR','FISCAL_FLOW','ELECTION_IMPACT','CURRENCY_CARRY','POLICY_SENTIMENT','SANCTION_IMPACT','VOTE_PREDICT','WEATHER_IMPACT'];
var SCIENCE_CMDS = ['MATH_MODEL','RISK_MODEL','MONTE_CARLO'];
var TIME_CMDS = ['TIME_IN_MARKET','TIME_SINCE_EVENT','SCHEDULE','WAIT_UNTIL','TASK_SCHEDULE'];
var PORTFOLIO_CMDS = ['MARKET_SCAN','PORTFOLIO_BUILD','PORTFOLIO_REBALANCE'];
var PRT_CMDS = ['PRT_AVERAGE','PRT_RSI','PRT_MACD','PRT_BOLLINGER','PRT_STOCHASTIC','PRT_ATR','PRT_CCI','PRT_ADX','PRT_DONCHIAN','PRT_ICHIMOKU','PRT_KELTNERCHANNEL','PRT_PARABOLICSAR','PRT_SUPERTREND','PRT_VOLUMEBYPRICE','PRT_FIBONACCI','PRT_PIVOTPOINT','PRT_DEMARK','PRT_WILLIAMS','PRT_ULTOSC','PRT_CHAIKIN','PRT_ONBALANCEVOLUME','PRT_VWAP','PRT_TIMEFRAME','PRT_BARINDEX','PRT_DATE','PRT_TIME','PRT_CUM','PRT_HIGHEST','PRT_LOWEST','PRT_SUM','PRT_STD','PRT_CORRELATION','PRT_REGRESSION','PRT_DEFPARAM','PRT_RETURN','PRT_DRAWLINE','PRT_DRAWARROW','PRT_HISTOGRAM','PRT_CROSS','PRT_BARSSINCE','PRT_SUMMATION'];
var TV_CMDS = ['INPUT_INT','INPUT_FLOAT','INPUT_BOOL','INPUT_SYMBOL','TIMEFRAME_PERIOD','TIMEFRAME_IS_DAILY','ARRAY_NEW','ARRAY_PUSH','MATRIX_NEW','MATRIX_SET'];
var UTILITY_CMDS = ['FILE_PARSE'];

var currentAST = null;
var currentJS = '';
var viewMode = 'split';
var savedScripts = {};
var simLog = [];
var _csStoredResults = { simulation: null, backtest: null, flowTrace: [] };

function csLog(msg, type) {
  type = type || 'info';
  simLog.push({ msg: msg, type: type, time: new Date().toLocaleTimeString() });
  var el = document.getElementById('csLogOutput');
  if (el) {
    var line = document.createElement('div');
    line.className = 'cs-log-line cs-log-' + type;
    line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  }
}

function clearLog() {
  simLog = [];
  var el = document.getElementById('csLogOutput');
  if (el) el.innerHTML = '';
}

function csLexer(code) {
  var tokens = [];
  var regex = /\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+\.?\d*|[a-zA-Z_]\w*|[=><!]=|&&|\|\||[+\-*\/%<>=!&|]|[(){}[\];,.:]/g;
  var match;
  while ((match = regex.exec(code))) {
    var value = match[0];
    var type;
    if (value.charAt(0) === '/' && (value.charAt(1) === '/' || value.charAt(1) === '*')) {
      type = TOKEN_TYPES.COMMENT;
    } else if (value.charAt(0) === '"' || value.charAt(0) === "'") {
      type = TOKEN_TYPES.STRING;
      value = value.slice(1, -1);
    } else if (/^\d/.test(value)) {
      type = TOKEN_TYPES.NUMBER;
      value = parseFloat(value);
    } else if (/^[a-zA-Z_]/.test(value)) {
      if (CS_KEYWORDS.indexOf(value.toUpperCase()) >= 0) {
        type = TOKEN_TYPES.KEYWORD;
      } else {
        type = TOKEN_TYPES.IDENTIFIER;
      }
    } else if (/[=><!&|+\-*\/%]/.test(value)) {
      type = TOKEN_TYPES.OPERATOR;
    } else {
      type = TOKEN_TYPES.PUNCTUATION;
    }
    tokens.push({ type: type, value: value, index: match.index });
  }
  return tokens;
}

function syntaxHighlight(code) {
  var tokens = csLexer(code);
  var result = '';
  var lastIdx = 0;
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var raw = code.substring(t.index || lastIdx);
    var originalText;
    if (t.type === TOKEN_TYPES.STRING) {
      originalText = '"' + t.value + '"';
    } else {
      originalText = String(t.value);
    }
    var pos = code.indexOf(originalText, lastIdx);
    if (pos < 0) pos = lastIdx;
    if (pos > lastIdx) {
      result += escapeHtml(code.substring(lastIdx, pos));
    }
    var cls = 'cs-tok-default';
    var upper = String(t.value).toUpperCase();
    if (t.type === TOKEN_TYPES.COMMENT) { cls = 'cs-tok-comment'; originalText = code.substring(t.index).split('\n')[0]; }
    else if (t.type === TOKEN_TYPES.STRING) cls = 'cs-tok-string';
    else if (t.type === TOKEN_TYPES.NUMBER) cls = 'cs-tok-number';
    else if (t.type === TOKEN_TYPES.OPERATOR) cls = 'cs-tok-operator';
    else if (OPERATOR_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-logic-op';
    else if (TRADE_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-trade';
    else if (AI_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-ai';
    else if (DATA_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-data';
    else if (AGENT_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-agent';
    else if (CONTROL_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-control';
    else if (ADVANCED_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-advanced';
    else if (ECONPOL_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-econpol';
    else if (SCIENCE_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-science';
    else if (TIME_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-time';
    else if (PORTFOLIO_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-portfolio';
    else if (PRT_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-prt';
    else if (TV_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-tv';
    else if (UTILITY_CMDS.indexOf(upper) >= 0) cls = 'cs-tok-utility';
    else if (t.type === TOKEN_TYPES.KEYWORD) cls = 'cs-tok-keyword';
    else if (t.type === TOKEN_TYPES.IDENTIFIER) cls = 'cs-tok-ident';
    result += '<span class="' + cls + '">' + escapeHtml(originalText) + '</span>';
    lastIdx = pos + originalText.length;
  }
  if (lastIdx < code.length) result += escapeHtml(code.substring(lastIdx));
  return result;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildEditorUI() {
  var root = document.getElementById('csEditorRoot');
  if (!root) return;

  root.innerHTML = '' +
  '<style>' +
  '#csEditorRoot { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
  '.cs-toolbar { display:flex; gap:6px; padding:8px 0; flex-wrap:wrap; align-items:center; border-bottom:1px solid #30363d; margin-bottom:8px; }' +
  '.cs-toolbar button, .cs-toolbar select { padding:4px 10px; border-radius:4px; font-size:12px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; white-space:nowrap; }' +
  '.cs-toolbar button:hover { border-color:#58a6ff; }' +
  '.cs-toolbar button.cs-active { background:#1f6feb; border-color:#58a6ff; color:#fff; }' +
  '.cs-toolbar select { background:#161b22; }' +
  '.cs-toolbar .cs-sep { width:1px; height:20px; background:#30363d; margin:0 4px; }' +
  '.cs-main { display:grid; grid-template-columns:1fr 1fr; gap:8px; min-height:480px; }' +
  '.cs-main.cs-mode-code { grid-template-columns:1fr; }' +
  '.cs-main.cs-mode-code .cs-flow-pane { display:none; }' +
  '.cs-main.cs-mode-flow { grid-template-columns:1fr; }' +
  '.cs-main.cs-mode-flow .cs-code-pane { display:none; }' +
  '.cs-code-pane { position:relative; background:#0d1117; border:1px solid #30363d; border-radius:6px; overflow:hidden; display:flex; flex-direction:column; min-height:0; }' +
  '.cs-code-header { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:#161b22; border-bottom:1px solid #21262d; font-size:12px; color:#8b949e; }' +
  '.cs-editor-wrap { display:flex; flex:1; overflow:auto; min-height:0; }' +
  '.cs-line-numbers { padding:8px 8px 8px 4px; text-align:right; color:#484f58; font:12px/1.6 "Fira Code",monospace; user-select:none; background:#0d1117; border-right:1px solid #21262d; min-width:32px; white-space:pre; overflow-y:hidden; }' +
  '.cs-editor { flex:1; padding:8px; font:12px/1.6 "Fira Code",monospace; color:#c9d1d9; background:#0d1117; border:none; outline:none; resize:none; tab-size:2; white-space:pre; overflow:auto; }' +
  '.cs-highlight-layer { position:absolute; top:0; left:0; right:0; bottom:0; padding:8px; font:12px/1.6 "Fira Code",monospace; pointer-events:none; white-space:pre; overflow:hidden; color:transparent; }' +
  '.cs-flow-pane { background:#0d1117; border:1px solid #30363d; border-radius:6px; overflow:hidden; display:flex; flex-direction:column; }' +
  '.cs-flow-canvas { flex:1; position:relative; overflow:hidden; min-height:400px; }' +
  '.cf-toolbar { display:flex; gap:4px; padding:4px 8px; align-items:center; background:#161b22; border-bottom:1px solid #21262d; flex-wrap:wrap; }' +
  '.cf-tb-btn { padding:3px 8px; border-radius:3px; font-size:11px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; white-space:nowrap; }' +
  '.cf-tb-btn:hover { border-color:#58a6ff; color:#fff; }' +
  '.cf-tb-del { color:#f85149; }' +
  '.cf-tb-del:hover { border-color:#f85149; background:#3d1a1a; }' +
  '.cf-tb-danger { color:#f0883e; }' +
  '.cf-tb-danger:hover { border-color:#f0883e; background:#3d2200; }' +
  '.cf-tb-active { border-color:#58a6ff; background:#0c2d48; color:#58a6ff; box-shadow:0 0 4px rgba(88,166,255,0.3); }' +
  '.cf-node-connect-source { box-shadow:0 0 8px 2px #58a6ff !important; }' +
  '.cf-tb-sep { width:1px; height:16px; background:#30363d; margin:0 2px; }' +
  '.cf-zoom-label { font-size:11px; color:#8b949e; min-width:36px; text-align:center; }' +
  '.cf-node-count { font-size:11px; color:#8b949e; margin-left:auto; }' +
  '.cf-toolbox { width:170px; min-width:170px; background:#161b22; border-right:1px solid #21262d; display:flex; flex-direction:column; overflow:hidden; transition:width 0.2s,min-width 0.2s; }' +
  '.cf-toolbox-collapsed { width:28px!important; min-width:28px!important; }' +
  '.cf-toolbox-collapsed .cf-toolbox-scroll { display:none; }' +
  '.cf-toolbox-collapsed .cf-toolbox-header span { display:none; }' +
  '.cf-toolbox-header { display:flex; justify-content:space-between; align-items:center; padding:6px 8px; font-size:11px; font-weight:600; color:#c9d1d9; border-bottom:1px solid #21262d; }' +
  '.cf-toolbox-toggle { background:none; border:none; color:#8b949e; cursor:pointer; font-size:13px; padding:0 2px; }' +
  '.cf-toolbox-toggle:hover { color:#c9d1d9; }' +
  '.cf-toolbox-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:4px 0; }' +
  '.cf-toolbox-group { margin-bottom:2px; }' +
  '.cf-toolbox-group-header { display:flex; justify-content:space-between; align-items:center; padding:4px 8px; font-size:10px; font-weight:600; color:#8b949e; cursor:pointer; border-left:3px solid transparent; }' +
  '.cf-toolbox-group-header:hover { background:#21262d; }' +
  '.cf-tg-arrow { font-size:9px; }' +
  '.cf-toolbox-items { padding:2px 6px; }' +
  '.cf-toolbox-item { padding:3px 6px; margin:1px 0; border-radius:3px; font-size:10px; color:#c9d1d9; cursor:grab; border-left:3px solid transparent; background:#0d1117; user-select:none; }' +
  '.cf-toolbox-item:hover { background:#21262d; }' +
  '.cf-toolbox-item:active { cursor:grabbing; }' +
  '.cf-ti-name { font-weight:600; }' +
  '.cf-toolbox-item { display:flex; align-items:center; justify-content:space-between; }' +
  '.cf-ti-info { font-size:13px; color:#484f58; cursor:pointer; margin-left:auto; padding:0 2px; line-height:1; flex-shrink:0; }' +
  '.cf-ti-info:hover { color:#58a6ff; }' +
  '.cf-info-popup { position:fixed; z-index:9999; width:260px; background:#161b22; border:1px solid #30363d; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.6); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; overflow:hidden; }' +
  '.cf-info-popup-header { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#21262d; border-bottom:1px solid #30363d; }' +
  '.cf-info-popup-cmd { font-size:13px; font-weight:700; color:#c9d1d9; }' +
  '.cf-info-popup-cat { font-size:10px; color:#8b949e; }' +
  '.cf-info-popup-body { padding:10px; }' +
  '.cf-info-desc { font-size:12px; color:#c9d1d9; margin-bottom:10px; line-height:1.4; }' +
  '.cf-info-section { margin-bottom:8px; }' +
  '.cf-info-section-title { font-size:10px; font-weight:600; color:#8b949e; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }' +
  '.cf-info-syntax { font:11px/1.5 "Fira Code",monospace; color:#79c0ff; background:#0d1117; padding:6px 8px; border-radius:4px; margin:0; white-space:pre-wrap; word-break:break-all; }' +
  '.cf-info-param { display:flex; justify-content:space-between; align-items:center; padding:2px 0; font-size:11px; }' +
  '.cf-info-param-name { color:#c9d1d9; font-weight:600; }' +
  '.cf-info-param-default { color:#484f58; font-size:10px; font-style:italic; }' +
  '.cf-canvas-wrap { flex:1; position:relative; overflow:hidden; background:#0d1117; cursor:grab; }' +
  '.cf-canvas-wrap:active { cursor:grabbing; }' +
  '.cf-canvas-inner { position:absolute; top:0; left:0; width:10000px; height:10000px; transform-origin:0 0; }' +
  '.cf-node { position:absolute; border-radius:6px; border:2px solid #30363d; box-shadow:0 2px 8px rgba(0,0,0,0.4); z-index:2; overflow:visible; cursor:default; user-select:none; }' +
  '.cf-node-selected { box-shadow:0 0 0 2px #58a6ff,0 2px 12px rgba(88,166,255,0.3); z-index:3; }' +
  '.cf-node-header { padding:4px 8px; font-size:11px; font-weight:700; color:#fff; border-radius:4px 4px 0 0; cursor:move; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }' +
  '.cf-node-body { padding:2px 6px 4px; }' +
  '.cf-node-param { display:flex; align-items:center; gap:3px; margin:1px 0; }' +
  '.cf-np-label { font-size:9px; color:#8b949e; min-width:32px; white-space:nowrap; }' +
  '.cf-np-input { flex:1; background:#161b22; border:1px solid #30363d; border-radius:2px; color:#c9d1d9; font-size:10px; padding:1px 4px; outline:none; min-width:0; }' +
  '.cf-np-input:focus { border-color:#58a6ff; }' +
  '.cf-port { position:absolute; width:' + 14 + 'px; height:' + 14 + 'px; border-radius:50%; border:2px solid #484f58; background:#21262d; z-index:4; cursor:crosshair; }' +
  '.cf-port:hover { background:#58a6ff; border-color:#58a6ff; transform:scale(1.2); }' +
  '.cf-port-in { top:-7px; left:50%; margin-left:-7px; }' +
  '.cf-port-out { bottom:-7px; }' +
  '.cf-node-operator { border-radius:50%!important; display:flex; align-items:center; justify-content:center; overflow:visible!important; }' +
  '.cf-node-operator .cf-op-symbol { border-radius:50%; }' +
  '.cf-port-op { position:absolute; }' +
  '.cf-port-label { position:absolute; bottom:-20px; font-size:8px; color:#8b949e; white-space:nowrap; text-align:center; width:24px; pointer-events:none; }' +
  '.cf-conn { cursor:pointer; pointer-events:stroke; }' +
  '.cf-conn:hover { stroke-width:3!important; filter:brightness(1.4); }' +
  '.cs-bottom-panels { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }' +
  '.cs-logs-pane { background:#0d1117; border:1px solid #30363d; border-radius:6px; max-height:220px; overflow:hidden; display:flex; flex-direction:column; }' +
  '.cs-logs-header { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:#161b22; border-bottom:1px solid #21262d; font-size:12px; color:#8b949e; flex-shrink:0; }' +
  '.cs-logs-header button { padding:2px 8px; border-radius:3px; font-size:11px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; }' +
  '#csLogOutput { padding:6px 10px; font:11px/1.5 "Fira Code",monospace; overflow-y:auto; flex:1; }' +
  '.cs-log-line { margin:1px 0; }' +
  '.cs-ai-pane { background:#0d1117; border:1px solid #30363d; border-radius:6px; max-height:220px; overflow:hidden; display:flex; flex-direction:column; }' +
  '.cs-ai-header { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:#161b22; border-bottom:1px solid #21262d; font-size:12px; color:#8b949e; flex-shrink:0; gap:6px; }' +
  '.cs-ai-header select { padding:2px 6px; font-size:10px; background:#21262d; border:1px solid #30363d; color:#c9d1d9; border-radius:3px; }' +
  '.cs-ai-messages { flex:1; overflow-y:auto; padding:6px 10px; font:11px/1.5 "Fira Code",monospace; }' +
  '.cs-ai-msg { margin:4px 0; padding:4px 8px; border-radius:4px; max-width:90%; word-wrap:break-word; white-space:pre-wrap; }' +
  '.cs-ai-msg-user { background:#1f6feb; color:#fff; margin-left:auto; text-align:right; }' +
  '.cs-ai-msg-assistant { background:#21262d; color:#c9d1d9; }' +
  '.cs-ai-msg-system { background:#3d2800; color:#f0883e; font-size:10px; font-style:italic; }' +
  '.cs-ai-input-row { display:flex; gap:4px; padding:6px 8px; border-top:1px solid #21262d; flex-shrink:0; }' +
  '.cs-ai-input { flex:1; padding:4px 8px; font:11px "Fira Code",monospace; background:#161b22; color:#c9d1d9; border:1px solid #30363d; border-radius:4px; outline:none; }' +
  '.cs-ai-input:focus { border-color:#58a6ff; }' +
  '.cs-ai-send { padding:4px 10px; background:#1f6feb; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; }' +
  '.cs-ai-send:hover { background:#388bfd; }' +
  '.cs-ai-send:disabled { opacity:0.5; cursor:not-allowed; }' +
  '.cs-log-info { color:#8b949e; }' +
  '.cs-log-success { color:#2dc653; }' +
  '.cs-log-error { color:#f85149; }' +
  '.cs-log-warn { color:#f0883e; }' +
  '.cs-log-trace { color:#79c0ff; }' +
  '.cs-line-error { background:rgba(248,81,73,0.12); border-left:3px solid #f85149; padding-left:4px; margin-left:-4px; }' +
  '.cs-line-error-annotation { position:absolute; left:100%; margin-left:8px; color:#f85149; font-size:10px; font-style:italic; pointer-events:none; white-space:nowrap; z-index:5; background:rgba(30,10,10,0.95); padding:1px 6px; border-radius:3px; border:1px solid rgba(248,81,73,0.3); }' +
  '.cs-error-highlight { position:absolute; pointer-events:none; z-index:1; }' +
  '.cs-error-highlight-line { background:rgba(248,81,73,0.08); border-bottom:2px wavy #f85149; }' +
  '.cs-error-gutter-icon { display:inline-block; width:14px; height:14px; border-radius:50%; background:#f85149; color:#fff; font-size:9px; font-weight:700; text-align:center; line-height:14px; margin-right:4px; cursor:help; }' +
  '.cs-tok-trade { color:#2dc653; font-weight:600; }' +
  '.cs-tok-ai { color:#bc8cff; font-weight:600; }' +
  '.cs-tok-data { color:#79c0ff; }' +
  '.cs-tok-agent { color:#f0883e; }' +
  '.cs-tok-control { color:#ff7b72; font-weight:600; }' +
  '.cs-tok-advanced { color:#ffa657; font-weight:600; }' +
  '.cs-tok-logic-op { color:#f778ba; font-weight:700; font-style:italic; }' +
  '.cs-tok-econpol { color:#e3b341; font-weight:600; }' +
  '.cs-tok-science { color:#56d4dd; font-weight:600; }' +
  '.cs-tok-time { color:#d2a8ff; font-weight:600; }' +
  '.cs-tok-portfolio { color:#7ee787; font-weight:600; }' +
  '.cs-tok-prt { color:#db61a2; font-weight:600; }' +
  '.cs-tok-tv { color:#f78166; font-weight:600; }' +
  '.cs-tok-utility { color:#8b949e; font-weight:600; }' +
  '.cs-tok-keyword { color:#ff7b72; }' +
  '.cs-tok-string { color:#a5d6ff; }' +
  '.cs-tok-number { color:#79c0ff; }' +
  '.cs-tok-comment { color:#484f58; font-style:italic; }' +
  '.cs-tok-operator { color:#ff7b72; }' +
  '.cs-tok-ident { color:#c9d1d9; }' +
  '.cs-tok-default { color:#8b949e; }' +
  '.cs-flow-node { position:absolute; padding:8px 14px; border-radius:6px; font-size:11px; font-weight:600; color:#fff; cursor:default; text-align:center; min-width:80px; border:2px solid rgba(255,255,255,0.15); box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2; }' +
  '.cs-flow-node.cs-fn-trade { background:#1b4332; border-color:#2dc653; }' +
  '.cs-flow-node.cs-fn-exit { background:#3d1a1a; border-color:#f85149; }' +
  '.cs-flow-node.cs-fn-if { background:#1c2541; border-color:#58a6ff; transform:rotate(0deg); border-radius:4px; }' +
  '.cs-flow-node.cs-fn-loop { background:#3d2800; border-color:#f0883e; }' +
  '.cs-flow-node.cs-fn-ai { background:#2d1b4e; border-color:#bc8cff; }' +
  '.cs-flow-node.cs-fn-data { background:#0c2d48; border-color:#79c0ff; }' +
  '.cs-flow-node.cs-fn-agent { background:#3d2200; border-color:#f0883e; }' +
  '.cs-flow-node.cs-fn-var { background:#21262d; border-color:#484f58; }' +
  '.cs-flow-node.cs-fn-control { background:#21262d; border-color:#ff7b72; }' +
  '.cs-flow-node.cs-fn-alert { background:#3d1a1a; border-color:#f85149; }' +
  '.cs-flow-node.cs-fn-try { background:#1c2541; border-color:#58a6ff; }' +
  '.cs-flow-node.cs-fn-advanced { background:#2d1b00; border-color:#ffa657; }' +
  '.cs-flow-node.cs-fn-default { background:#21262d; border-color:#30363d; }' +
  '.cs-paste-modal { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; }' +
  '.cs-paste-inner { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:16px; width:600px; max-width:90vw; }' +
  '.cs-paste-inner h3 { color:#c9d1d9; margin-bottom:10px; font-size:14px; }' +
  '.cs-paste-inner textarea { width:100%; height:200px; background:#0d1117; color:#c9d1d9; border:1px solid #30363d; border-radius:4px; padding:8px; font:12px/1.5 "Fira Code",monospace; resize:vertical; }' +
  '.cs-paste-inner .cs-paste-btns { display:flex; gap:8px; margin-top:10px; justify-content:flex-end; }' +
  '.cs-paste-inner button { padding:6px 14px; border-radius:4px; font-size:12px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; }' +
  '.cs-paste-inner button.cs-primary { background:#1f6feb; border-color:#58a6ff; color:#fff; }' +
  '.cs-save-modal { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; }' +
  '.cs-save-inner { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:20px; width:500px; max-width:90vw; }' +
  '.cs-save-inner h3 { color:#c9d1d9; margin-bottom:14px; font-size:14px; }' +
  '.cs-save-inner label { display:block; color:#8b949e; font-size:12px; margin:8px 0 4px; }' +
  '.cs-save-inner input { width:100%; box-sizing:border-box; background:#0d1117; color:#c9d1d9; border:1px solid #30363d; border-radius:4px; padding:8px; font-size:13px; }' +
  '.cs-save-inner .cs-save-info { color:#8b949e; font-size:11px; margin-top:4px; }' +
  '.cs-save-inner .cs-save-btns { display:flex; gap:8px; margin-top:14px; justify-content:flex-end; }' +
  '.cs-save-inner button { padding:6px 14px; border-radius:4px; font-size:12px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; }' +
  '.cs-save-inner button.cs-primary { background:#1f6feb; border-color:#58a6ff; color:#fff; }' +
  '.cs-save-inner .cs-save-status { margin-top:8px; font-size:12px; color:#2dc653; min-height:16px; }' +
  '@media (max-width:768px) { .cs-main { grid-template-columns:1fr !important; } .cs-flow-pane { min-height:300px; } }' +
  '@keyframes cfPulseGlow { 0%,100%{ box-shadow:0 0 8px 2px rgba(88,166,255,0.5); } 50%{ box-shadow:0 0 18px 6px rgba(88,166,255,0.9); } }' +
  '@keyframes cfFlowDash { to { stroke-dashoffset: -30; } }' +
  '.cf-anim-active { animation: cfPulseGlow 0.8s ease-in-out infinite !important; z-index:10 !important; }' +
  '.cf-anim-green { box-shadow:0 0 12px 3px rgba(45,198,83,0.7) !important; border-color:#2dc653 !important; }' +
  '.cf-anim-red { box-shadow:0 0 12px 3px rgba(248,81,73,0.7) !important; border-color:#f85149 !important; }' +
  '.cf-anim-blue { box-shadow:0 0 12px 3px rgba(121,192,255,0.7) !important; border-color:#79c0ff !important; }' +
  '.cf-conn-active { stroke:#58a6ff !important; stroke-width:3 !important; filter:drop-shadow(0 0 4px rgba(88,166,255,0.6)); }' +
  '.cf-anim-value { position:absolute; top:-22px; left:50%; transform:translateX(-50%); background:#1f6feb; color:#fff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:10px; white-space:nowrap; z-index:20; pointer-events:none; box-shadow:0 2px 6px rgba(0,0,0,0.4); }' +
  '.cf-anim-counter { position:absolute; top:-10px; right:-10px; background:#f0883e; color:#fff; font-size:9px; font-weight:700; min-width:18px; height:18px; line-height:18px; text-align:center; border-radius:50%; z-index:20; pointer-events:none; box-shadow:0 2px 4px rgba(0,0,0,0.3); }' +
  '.cs-speed-control { display:inline-flex; align-items:center; gap:4px; margin-left:4px; }' +
  '.cs-speed-btn { padding:3px 7px; border-radius:3px; font-size:10px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; }' +
  '.cs-speed-btn:hover { border-color:#58a6ff; }' +
  '.cs-speed-btn.cs-speed-active { background:#1f6feb; border-color:#58a6ff; color:#fff; }' +
  '.cs-speed-label { font-size:10px; color:#8b949e; }' +
  '.cs-results-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:9998; }' +
  '.cs-results-popup { position:fixed; z-index:9999; width:680px; max-width:90vw; max-height:80vh; background:#161b22; border:1px solid #30363d; border-radius:8px; box-shadow:0 12px 40px rgba(0,0,0,0.7); display:flex; flex-direction:column; overflow:hidden; }' +
  '.cs-results-header { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#21262d; border-bottom:1px solid #30363d; cursor:move; user-select:none; }' +
  '.cs-results-header h3 { margin:0; font-size:14px; color:#c9d1d9; font-weight:700; }' +
  '.cs-results-close { background:none; border:none; color:#8b949e; font-size:18px; cursor:pointer; padding:0 4px; line-height:1; }' +
  '.cs-results-close:hover { color:#f85149; }' +
  '.cs-results-tabs { display:flex; border-bottom:1px solid #30363d; background:#161b22; flex-shrink:0; }' +
  '.cs-results-tab { padding:8px 16px; font-size:12px; color:#8b949e; cursor:pointer; border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; }' +
  '.cs-results-tab:hover { color:#c9d1d9; background:#21262d; }' +
  '.cs-results-tab.cs-rt-active { color:#58a6ff; border-bottom-color:#58a6ff; }' +
  '.cs-results-body { flex:1; overflow-y:auto; padding:14px; font:12px/1.6 "Fira Code",monospace; color:#c9d1d9; }' +
  '.cs-results-empty { color:#484f58; font-style:italic; text-align:center; padding:40px 0; }' +
  '.cs-results-stat { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #21262d; }' +
  '.cs-results-stat-label { color:#8b949e; }' +
  '.cs-results-stat-value { font-weight:600; }' +
  '.cs-results-pnl-pos { color:#2dc653; }' +
  '.cs-results-pnl-neg { color:#f85149; }' +
  '.cs-results-section { margin-bottom:14px; }' +
  '.cs-results-section-title { font-size:11px; font-weight:700; color:#8b949e; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; border-bottom:1px solid #21262d; padding-bottom:4px; }' +
  '.cs-results-trade-row { display:grid; grid-template-columns:30px 60px 50px 1fr 80px; gap:6px; padding:3px 0; border-bottom:1px solid rgba(48,54,61,0.5); font-size:11px; align-items:center; }' +
  '.cs-results-trade-header { font-weight:700; color:#8b949e; font-size:10px; text-transform:uppercase; }' +
  '.cs-results-equity-chart { width:100%; height:120px; background:#0d1117; border:1px solid #21262d; border-radius:4px; margin-top:8px; }' +
  '.cs-results-signal-row { padding:3px 0; border-bottom:1px solid rgba(48,54,61,0.5); font-size:11px; }' +
  '.cs-results-trace-line { padding:2px 0; font-size:11px; }' +
  '.cs-results-trace-info { color:#8b949e; }' +
  '.cs-results-trace-success { color:#2dc653; }' +
  '.cs-results-trace-error { color:#f85149; }' +
  '.cs-results-trace-warn { color:#f0883e; }' +
  '.cs-results-trace-trace { color:#79c0ff; }' +
  '.cs-results-fetch-btn { padding:4px 10px; background:#21262d; border:1px solid #30363d; border-radius:4px; color:#c9d1d9; cursor:pointer; font-size:11px; margin-top:8px; }' +
  '.cs-results-fetch-btn:hover { border-color:#58a6ff; }' +
  '</style>' +

  '<div class="cs-toolbar">' +
    '<button id="csBtnNew" title="New Script">New Script</button>' +
    '<button id="csBtnPaste" title="Paste Code">Paste Code</button>' +
    '<button id="csBtnCompile" title="Compile & Save">Compile & Save</button>' +
    '<button id="csBtnSimulate" title="Run Simulation" style="background:#1b4332;border-color:#2dc653;color:#2dc653;font-size:14px;padding:4px 12px;">&#9654;</button>' +
    '<div class="cs-speed-control">' +
      '<span class="cs-speed-label">Speed:</span>' +
      '<button class="cs-speed-btn" data-speed="200" title="Fast">Fast</button>' +
      '<button class="cs-speed-btn cs-speed-active" data-speed="600" title="Normal">Normal</button>' +
      '<button class="cs-speed-btn" data-speed="1500" title="Slow">Slow</button>' +
      '<button class="cs-speed-btn" data-speed="step" title="Step through one node at a time">Step</button>' +
      '<button class="cs-speed-btn" id="csStepNext" title="Next Step (when in Step mode)" style="display:none;">&#x23ED; Next</button>' +
    '</div>' +
    '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#8b949e;cursor:pointer;"><input type="checkbox" id="csRealDataCheck" style="cursor:pointer;"> Real Data</label>' +
    '<input id="csInstrumentInput" type="text" placeholder="Epic (e.g. CS.D.BITCOIN.CFD.IP)" value="CS.D.BITCOIN.CFD.IP" style="width:200px;padding:3px 8px;font-size:11px;background:#161b22;color:#c9d1d9;border:1px solid #30363d;border-radius:4px;" title="Instrument epic for simulation/backtest">' +
    '<button id="csBtnBacktest" title="Run Backtest with Real Data" style="background:#0c2d48;border-color:#58a6ff;color:#58a6ff;">&#9654; Backtest</button>' +
    '<div class="cs-sep"></div>' +
    '<select id="csTemplateSelect"><option value="">Templates...</option></select>' +
    '<div class="cs-sep"></div>' +
    '<select id="csLoadSelect"><option value="">Load Existing...</option></select>' +
    '<div class="cs-sep"></div>' +
    '<button id="csBtnModeCode" title="Code Only">Code</button>' +
    '<button id="csBtnModeSplit" class="cs-active" title="Split View">Split</button>' +
    '<button id="csBtnModeFlow" title="Flow Only">Flow</button>' +
    '<div class="cs-sep"></div>' +
    '<button id="csBtnResults" title="View Results" style="background:#2d1b4e;border-color:#bc8cff;color:#bc8cff;">&#128202; Results</button>' +
    '<button id="csBtnExportCS" title="Export ClawScript">Export .cs</button>' +
    '<button id="csBtnExportJSON" title="Export Flow JSON">Export JSON</button>' +
    '<button id="csBtnExportJS" title="Export Generated JS">Export .js</button>' +
  '</div>' +

  '<div class="cs-main" id="csMainPanel">' +
    '<div class="cs-code-pane">' +
      '<div class="cs-code-header"><span>ClawScript Code</span><span id="csParseStatus"></span></div>' +
      '<div class="cs-editor-wrap">' +
        '<div class="cs-line-numbers" id="csLineNumbers">1</div>' +
        '<textarea class="cs-editor" id="csCodeEditor" spellcheck="false" placeholder="// Write your ClawScript here...\n// Example:\nDEF rsi = RSI(14)\nIF rsi < 30 THEN\n  BUY 1 AT MARKET STOP 10\nENDIF"></textarea>' +
      '</div>' +
    '</div>' +
    '<div class="cs-flow-pane">' +
      '<div class="cs-flow-canvas" id="csFlowCanvas"></div>' +
    '</div>' +
  '</div>' +

  '<div class="cs-bottom-panels">' +
    '<div class="cs-logs-pane">' +
      '<div class="cs-logs-header"><span>Output / Logs</span><button id="csBtnClearLog">Clear</button></div>' +
      '<div id="csLogOutput"></div>' +
    '</div>' +
    '<div class="cs-ai-pane">' +
      '<div class="cs-ai-header">' +
        '<span>AI Assistant</span>' +
        '<select id="csAiModelSelect">' +
          '<option value="ceo-agent">CEO Agent (default)</option>' +
          '<option value="grok">Grok</option>' +
        '</select>' +
        '<button id="csAiClearBtn" style="padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;border:1px solid #30363d;background:#21262d;color:#c9d1d9;">Clear</button>' +
      '</div>' +
      '<div class="cs-ai-messages" id="csAiMessages">' +
        '<div class="cs-ai-msg cs-ai-msg-system">AI assistant ready. I can read your code, errors, and logs. Ask me to fix issues, explain syntax, or optimize your strategy.</div>' +
      '</div>' +
      '<div class="cs-ai-input-row">' +
        '<input type="text" class="cs-ai-input" id="csAiInput" placeholder="Ask about your code, errors, or strategy...">' +
        '<button class="cs-ai-send" id="csAiSendBtn">Send</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  loadSavedScripts();
  attachEditorEvents();
  initFlowEngine();
  loadDraft();
  csLog('ClawScript Editor ready. Write or paste code, then Compile & Save.', 'success');
}

function initFlowEngine() {
  var container = document.getElementById('csFlowCanvas');
  if (!container || !window.ClawFlowEngine) return;
  window._csFlowEngine = new window.ClawFlowEngine(container, function(code) {
    if (window._csFlowSyncLock) return;
    window._csFlowSyncLock = true;
    try {
      var editor = document.getElementById('csCodeEditor');
      if (editor) {
        editor.value = code;
        updateLineNumbers();
        saveDraft();
      }
    } finally {
      window._csFlowSyncLock = false;
    }
  });
}

function attachEditorEvents() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;

  editor.addEventListener('input', function() {
    updateLineNumbers();
    saveDraft();
    autoParse();
  });
  editor.addEventListener('scroll', function() {
    var ln = document.getElementById('csLineNumbers');
    if (ln) ln.scrollTop = editor.scrollTop;
  });
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var start = editor.selectionStart;
      var end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      editor.dispatchEvent(new Event('input'));
    }
  });

  document.getElementById('csBtnNew').addEventListener('click', newScript);
  document.getElementById('csBtnPaste').addEventListener('click', openPasteModal);
  document.getElementById('csBtnCompile').addEventListener('click', compileAndSave);
  document.getElementById('csBtnSimulate').addEventListener('click', runSimulation);
  document.getElementById('csBtnBacktest').addEventListener('click', runBacktest);
  document.getElementById('csBtnClearLog').addEventListener('click', clearLog);
  initSpeedControls();
  initAiAssistant();
  document.getElementById('csBtnResults').addEventListener('click', openResultsPopup);
  document.getElementById('csBtnExportCS').addEventListener('click', exportCS);
  document.getElementById('csBtnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('csBtnExportJS').addEventListener('click', exportGenJS);
  document.getElementById('csBtnModeCode').addEventListener('click', function() { setViewMode('code'); });
  document.getElementById('csBtnModeSplit').addEventListener('click', function() { setViewMode('split'); });
  document.getElementById('csBtnModeFlow').addEventListener('click', function() { setViewMode('flow'); });
  document.getElementById('csLoadSelect').addEventListener('change', function() {
    if (this.value) loadScript(this.value);
    this.value = '';
  });

  var tplSelect = document.getElementById('csTemplateSelect');
  if (tplSelect) {
    loadTemplatesList(tplSelect);
    tplSelect.addEventListener('change', function() {
      if (this.value) loadTemplate(this.value);
      this.value = '';
    });
  }
}

var _csErrorLines = {};

function updateLineNumbers(errorLines) {
  var editor = document.getElementById('csCodeEditor');
  var ln = document.getElementById('csLineNumbers');
  if (!editor || !ln) return;
  if (errorLines !== undefined) _csErrorLines = errorLines || {};
  var lines = editor.value.split('\n');
  var lineCount = lines.length;
  ln.innerHTML = '';
  for (var i = 1; i <= lineCount; i++) {
    var span = document.createElement('div');
    span.style.position = 'relative';
    span.style.whiteSpace = 'nowrap';
    if (_csErrorLines[i]) {
      span.className = 'cs-line-error';
      span.title = _csErrorLines[i];
      var icon = document.createElement('span');
      icon.className = 'cs-error-gutter-icon';
      icon.textContent = '\u2716';
      icon.title = _csErrorLines[i];
      span.appendChild(icon);
      span.appendChild(document.createTextNode(i));
      var ann = document.createElement('span');
      ann.className = 'cs-line-error-annotation';
      var errText = _csErrorLines[i];
      if (errText.length > 60) errText = errText.substring(0, 57) + '...';
      ann.textContent = errText;
      span.appendChild(ann);
    } else {
      span.textContent = i;
    }
    ln.appendChild(span);
  }
  updateErrorOverlay(lines);
}

function updateErrorOverlay(lines) {
  var wrap = document.querySelector('.cs-editor-wrap');
  if (!wrap) return;
  var existing = wrap.querySelector('.cs-error-highlight');
  if (existing) existing.remove();
  var hasErrors = false;
  for (var k in _csErrorLines) { hasErrors = true; break; }
  if (!hasErrors) return;
  var editor = document.getElementById('csCodeEditor');
  var lineH = 19.2;
  var padTop = 8;
  if (editor) {
    var cs = window.getComputedStyle(editor);
    var fSize = parseFloat(cs.fontSize) || 12;
    var lh = cs.lineHeight;
    if (lh && lh !== 'normal') lineH = parseFloat(lh);
    else lineH = fSize * 1.6;
    padTop = parseFloat(cs.paddingTop) || 8;
  }
  var overlay = document.createElement('div');
  overlay.className = 'cs-error-highlight';
  overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:1;overflow:hidden;';
  var scrollTop = editor ? editor.scrollTop : 0;
  for (var lineNum in _csErrorLines) {
    var ln = parseInt(lineNum, 10);
    if (isNaN(ln) || ln < 1) continue;
    var lineDiv = document.createElement('div');
    lineDiv.className = 'cs-error-highlight-line';
    var topPos = (ln - 1) * lineH + padTop - scrollTop;
    lineDiv.style.cssText = 'position:absolute;left:0;right:0;height:' + lineH + 'px;top:' + topPos + 'px;';
    var errLabel = document.createElement('span');
    errLabel.className = 'cs-error-inline-msg';
    errLabel.textContent = _csErrorLines[lineNum];
    errLabel.style.cssText = 'position:absolute;right:8px;top:0;font-size:11px;color:#f85149;background:rgba(248,81,73,0.15);padding:0 6px;border-radius:3px;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:' + lineH + 'px;pointer-events:auto;cursor:help;';
    errLabel.title = _csErrorLines[lineNum];
    lineDiv.appendChild(errLabel);
    overlay.appendChild(lineDiv);
  }
  wrap.style.position = 'relative';
  wrap.appendChild(overlay);
  if (editor) {
    editor.addEventListener('scroll', function onScrl() {
      var ov = wrap.querySelector('.cs-error-highlight');
      if (!ov) { editor.removeEventListener('scroll', onScrl); return; }
      var st = editor.scrollTop;
      var divs = ov.querySelectorAll('.cs-error-highlight-line');
      for (var di = 0; di < divs.length; di++) {
        var origLn = parseInt(divs[di].getAttribute('data-line') || '0', 10);
        divs[di].style.top = ((origLn - 1) * lineH + padTop - st) + 'px';
      }
    });
    var divs = overlay.querySelectorAll('.cs-error-highlight-line');
    var lineIdx = 0;
    for (var lnKey in _csErrorLines) {
      if (lineIdx < divs.length) divs[lineIdx].setAttribute('data-line', lnKey);
      lineIdx++;
    }
  }
}

function loadTemplatesList(selectEl) {
  fetch('/__openclaw__/canvas/api/clawscript/templates')
    .then(function(r) { return r.json(); })
    .then(function(templates) {
      if (!Array.isArray(templates) || templates.length === 0) return;
      for (var i = 0; i < templates.length; i++) {
        var opt = document.createElement('option');
        opt.value = templates[i].name;
        opt.textContent = templates[i].name + (templates[i].description ? ' — ' + templates[i].description : '');
        selectEl.appendChild(opt);
      }
    })
    .catch(function() {});
}

function loadTemplate(name) {
  fetch('/__openclaw__/canvas/api/clawscript/templates/' + encodeURIComponent(name))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.content) { csLog('Template not found: ' + name, 'error'); return; }
      var editor = document.getElementById('csCodeEditor');
      if (!editor) return;
      editor.value = data.content;
      updateLineNumbers();
      saveDraft();
      autoParse();
      csLog('Loaded template: ' + name, 'success');
    })
    .catch(function(err) { csLog('Failed to load template: ' + err.message, 'error'); });
}

function setViewMode(mode) {
  viewMode = mode;
  var panel = document.getElementById('csMainPanel');
  if (!panel) return;
  panel.className = 'cs-main' + (mode !== 'split' ? ' cs-mode-' + mode : '');
  document.getElementById('csBtnModeCode').className = mode === 'code' ? 'cs-active' : '';
  document.getElementById('csBtnModeSplit').className = mode === 'split' ? 'cs-active' : '';
  document.getElementById('csBtnModeFlow').className = mode === 'flow' ? 'cs-active' : '';
}

function newScript() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;
  editor.value = '';
  currentAST = null;
  currentJS = '';
  updateLineNumbers();
  clearFlowCanvas();
  clearLog();
  document.getElementById('csParseStatus').textContent = '';
  csLog('New script created.', 'info');
}

function openPasteModal() {
  var modal = document.createElement('div');
  modal.className = 'cs-paste-modal';
  modal.id = 'csPasteModal';
  modal.innerHTML = '<div class="cs-paste-inner">' +
    '<h3>Paste ClawScript Code</h3>' +
    '<textarea id="csPasteArea" placeholder="Paste your ClawScript code here..."></textarea>' +
    '<div class="cs-paste-btns">' +
      '<button onclick="document.getElementById(\'csPasteModal\').remove()">Cancel</button>' +
      '<button class="cs-primary" id="csPasteConfirm">Paste & Parse</button>' +
    '</div>' +
  '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  document.getElementById('csPasteConfirm').addEventListener('click', function() {
    var code = document.getElementById('csPasteArea').value;
    if (code.trim()) {
      var editor = document.getElementById('csCodeEditor');
      editor.value = code;
      updateLineNumbers();
      saveDraft();
      autoParse();
      csLog('Code pasted and parsed.', 'success');
    }
    modal.remove();
  });
}

function extractErrorLine(code, errorMsg) {
  var lineMatch = errorMsg.match(/line\s+(\d+)/i);
  if (lineMatch) return parseInt(lineMatch[1], 10);
  var atLine = errorMsg.match(/at\s+line\s+(\d+)/i) || errorMsg.match(/\(line\s*(\d+)\)/i);
  if (atLine) return parseInt(atLine[1], 10);
  var colMatch = errorMsg.match(/position\s+(\d+)/i) || errorMsg.match(/index\s+(\d+)/i) || errorMsg.match(/char\s+(\d+)/i);
  if (colMatch) {
    var charPos = parseInt(colMatch[1], 10);
    var lines = code.substring(0, charPos).split('\n');
    return lines.length;
  }
  var tokenMatch = errorMsg.match(/token\s+#?(\d+)/i);
  if (tokenMatch) {
    var tokIdx = parseInt(tokenMatch[1], 10);
    var tokens = csLexer(code);
    if (tokIdx < tokens.length) {
      var tokenPos = tokens[tokIdx].index || 0;
      return code.substring(0, tokenPos).split('\n').length;
    }
  }
  var quotedMatch = errorMsg.match(/['"]([A-Z_]+)['"]/);
  if (quotedMatch) {
    var badToken = quotedMatch[1];
    var codeLines = code.split('\n');
    for (var i = 0; i < codeLines.length; i++) {
      if (codeLines[i].toUpperCase().indexOf(badToken) >= 0) return i + 1;
    }
  }
  var unexpMatch = errorMsg.match(/unexpected\s+(?:token\s+)?['"]?(\w+)/i);
  if (unexpMatch) {
    var unexpTok = unexpMatch[1];
    var cLines = code.split('\n');
    for (var j = 0; j < cLines.length; j++) {
      if (cLines[j].indexOf(unexpTok) >= 0) return j + 1;
    }
  }
  return null;
}

function autoParse() {
  var editor = document.getElementById('csCodeEditor');
  var status = document.getElementById('csParseStatus');
  if (!editor || !status) return;
  var code = editor.value.trim();
  if (!code) {
    status.textContent = '';
    currentAST = null;
    clearFlowCanvas();
    updateLineNumbers({});
    return;
  }
  try {
    var result = parseClawScript(code);
    currentAST = result.ast;
    currentJS = result.js;
    status.innerHTML = '<span style="color:#2dc653">Parsed OK (' + result.ast.body.length + ' statements)</span>';
    updateLineNumbers({});
    renderFlow(result.ast);
  } catch(e) {
    var errMsg = e.message || 'Unknown error';
    status.innerHTML = '<span style="color:#f85149">Parse Error: ' + escapeHtml(errMsg) + '</span>';
    currentAST = null;
    currentJS = '';
    var errorLines = {};
    var errLine = extractErrorLine(code, errMsg);
    if (errLine) {
      errorLines[errLine] = errMsg;
    } else if (e._csTokenIndex !== undefined) {
      var before = code.substring(0, e._csTokenIndex).split('\n');
      errorLines[before.length] = errMsg;
    } else {
      var codeLines = code.split('\n');
      errorLines[codeLines.length] = errMsg;
    }
    updateLineNumbers(errorLines);
  }
}

function compileAndSave() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) { csLog('No code to compile.', 'warn'); return; }

  clearLog();
  try {
    var result = parseClawScript(code);
    currentAST = result.ast;
    currentJS = result.js;
    csLog('Parse successful: ' + result.ast.body.length + ' statements', 'success');
    csLog('Imports: ' + result.imports.join(', '), 'info');
    csLog('Variables: ' + result.variables.join(', '), 'info');
    csLog('--- Generated JavaScript ---', 'info');
    var jsLines = result.js.split('\n');
    for (var i = 0; i < jsLines.length; i++) {
      csLog(jsLines[i], 'trace');
    }
    renderFlow(result.ast);
    showSaveDialog(code, result);
  } catch(e) {
    csLog('Compile Error: ' + e.message, 'error');
  }
}

function showSaveDialog(code, result) {
  var existing = document.querySelector('.cs-save-modal');
  if (existing) existing.remove();

  var defaultName = '';
  var lines = code.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var m = lines[i].match(/^\/\/\s*(.+)/);
    if (m && m[1].trim().length > 3) { defaultName = m[1].trim(); break; }
  }
  if (!defaultName) defaultName = 'Custom Strategy ' + new Date().toISOString().slice(0, 10);

  function nameToFilename(n) {
    return 'custom-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-strategy.cjs';
  }

  var modal = document.createElement('div');
  modal.className = 'cs-save-modal';
  modal.innerHTML =
    '<div class="cs-save-inner">' +
      '<h3>Save Strategy to Bot Dashboard</h3>' +
      '<label>Strategy Name</label>' +
      '<input id="csSaveName" type="text" value="' + escapeHtml(defaultName) + '" placeholder="e.g. BTC RSI Mean Reversion">' +
      '<label>Filename</label>' +
      '<input id="csSaveFilename" type="text" value="' + escapeHtml(nameToFilename(defaultName)) + '">' +
      '<div class="cs-save-info">File will be saved to strategies/ folder for bot auto-discovery</div>' +
      '<div class="cs-save-btns">' +
        '<button id="csSaveDraftBtn">Save Draft Only</button>' +
        '<button id="csSaveBotBtn" class="cs-primary">Save to Bot</button>' +
        '<button id="csSaveCancelBtn">Cancel</button>' +
      '</div>' +
      '<div class="cs-save-status" id="csSaveStatus"></div>' +
    '</div>';
  document.body.appendChild(modal);

  var nameInput = document.getElementById('csSaveName');
  var filenameInput = document.getElementById('csSaveFilename');

  nameInput.addEventListener('input', function() {
    filenameInput.value = nameToFilename(nameInput.value);
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('csSaveCancelBtn').addEventListener('click', function() { modal.remove(); });

  document.getElementById('csSaveDraftBtn').addEventListener('click', function() {
    var name = nameInput.value.trim() || 'custom_' + Date.now();
    savedScripts[name] = { code: code, js: result.js, ast: result.ast, date: new Date().toISOString() };
    localStorage.setItem('clawscript_saved', JSON.stringify(savedScripts));
    updateLoadDropdown();
    csLog('Draft saved as: ' + name, 'success');
    modal.remove();
  });

  document.getElementById('csSaveBotBtn').addEventListener('click', function() {
    var stratName = nameInput.value.trim();
    var filename = filenameInput.value.trim();
    if (!stratName) { document.getElementById('csSaveStatus').textContent = 'Please enter a strategy name'; return; }
    if (!filename.endsWith('-strategy.cjs')) { document.getElementById('csSaveStatus').textContent = 'Filename must end with -strategy.cjs'; return; }
    document.getElementById('csSaveStatus').textContent = 'Saving...';
    document.getElementById('csSaveStatus').style.color = '#8b949e';

    var payload = {
      name: stratName,
      filename: filename,
      code: code,
      js: result.js,
      variables: result.variables || [],
      imports: result.imports || [],
      metadata: result.metadata || null
    };

    fetch('/api/clawscript/strategies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) {
        document.getElementById('csSaveStatus').textContent = 'Error: ' + data.error;
        document.getElementById('csSaveStatus').style.color = '#f85149';
      } else {
        savedScripts[stratName] = { code: code, js: result.js, ast: result.ast, date: new Date().toISOString() };
        localStorage.setItem('clawscript_saved', JSON.stringify(savedScripts));
        updateLoadDropdown();
        csLog('Strategy "' + stratName + '" saved to bot as ' + filename, 'success');
        csLog('Strategy type: ' + (data.entry && data.entry.strategyType || 'custom'), 'info');
        document.getElementById('csSaveStatus').textContent = 'Saved successfully!';
        document.getElementById('csSaveStatus').style.color = '#2dc653';
        setTimeout(function() { modal.remove(); }, 1200);
      }
    })
    .catch(function(err) {
      document.getElementById('csSaveStatus').textContent = 'Network error: ' + err.message;
      document.getElementById('csSaveStatus').style.color = '#f85149';
    });
  });
}

function parsePricesToTicks(prices) {
  return prices.map(function(p) {
    var om = p.openPrice || {}, cm = p.closePrice || {}, hm = p.highPrice || {}, lm = p.lowPrice || {};
    var mid = ((cm.bid || 0) + (cm.ask || cm.offer || 0)) / 2;
    var bid = cm.bid || mid;
    var offer = cm.ask || cm.offer || mid;
    var rawTime = p.snapshotTimeUTC || p.snapshotTime || '';
    if (typeof rawTime === 'string') rawTime = rawTime.replace(/\//g, '-');
    return { mid: mid, bid: bid, offer: offer, time: new Date(rawTime).getTime() };
  });
}

function fetchRealTicks(instrument, resolution, max) {
  var epic = instrument || 'CS.D.BITCOIN.CFD.IP';
  var res = resolution || 'MINUTE_5';
  var count = max || 100;
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/ig/pricehistory/' + encodeURIComponent(epic) + '?resolution=' + res + '&max=' + count, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data && data.prices && data.prices.length > 0) {
            resolve(parsePricesToTicks(data.prices));
          } else {
            reject(new Error('No price data returned for ' + epic));
          }
        } catch (e) { reject(e); }
      } else {
        reject(new Error('API returned status ' + xhr.status));
      }
    };
    xhr.onerror = function() { reject(new Error('Network error fetching prices')); };
    xhr.send();
  });
}

function fetchStreamCandles(instrument, resolution, max) {
  var epic = instrument || 'CS.D.BITCOIN.CFD.IP';
  var res = resolution || 'MINUTE_5';
  var count = max || 100;
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/ig/stream/candles?epic=' + encodeURIComponent(epic) + '&resolution=' + res + '&max=' + count, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data && data.prices && data.prices.length > 0) {
            resolve(parsePricesToTicks(data.prices));
          } else {
            reject(new Error('No stream candles for ' + epic));
          }
        } catch (e) { reject(e); }
      } else {
        reject(new Error('Stream candles returned status ' + xhr.status));
      }
    };
    xhr.onerror = function() { reject(new Error('Network error fetching stream candles')); };
    xhr.send();
  });
}

function getSelectedInstrument() {
  var el = document.getElementById('csInstrumentInput');
  return (el && el.value.trim()) || 'CS.D.BITCOIN.CFD.IP';
}

function runSimulation() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) { csLog('No code to simulate.', 'warn'); return; }

  var useRealData = document.getElementById('csRealDataCheck') && document.getElementById('csRealDataCheck').checked;

  clearLog();
  csLog('=== SIMULATION START ===', 'info');

  try {
    var result = parseClawScript(code);
    currentAST = result.ast;
    csLog('Parsed ' + result.ast.body.length + ' statements', 'success');

    if (useRealData) {
      var simEpic = getSelectedInstrument();
      csLog('Fetching real price data (' + simEpic + ')...', 'info');
      fetchRealTicks(simEpic, 'MINUTE_5', 100).then(function(ticks) {
        csLog('Loaded ' + ticks.length + ' candles from IG API', 'success');
        runSimWithTicks(result, ticks, 'API');
      }).catch(function(err) {
        csLog('IG API failed: ' + err.message + '. Trying DB/stream candles...', 'warn');
        fetchStreamCandles(simEpic, 'MINUTE_5', 100).then(function(ticks) {
          csLog('Loaded ' + ticks.length + ' candles from DB/stream cache', 'success');
          runSimWithTicks(result, ticks, 'DB Cache');
        }).catch(function(err2) {
          csLog('DB cache also empty: ' + err2.message + '. Using mock data.', 'warn');
          runSimulationWithMockData(result);
        });
      });
    } else {
      runSimulationWithMockData(result);
    }
  } catch(e) {
    csLog('Simulation Error: ' + e.message, 'error');
  }
}

function runSimWithTicks(result, ticks, source) {
  var minP = Infinity, maxP = -Infinity;
  for (var r = 0; r < ticks.length; r++) {
    if (ticks[r].mid < minP) minP = ticks[r].mid;
    if (ticks[r].mid > maxP) maxP = ticks[r].mid;
  }
  csLog('Source: ' + source + ' | Price range: $' + Math.round(minP) + ' - $' + Math.round(maxP), 'info');
  renderFlow(result.ast);
  animatedSimulateAST(result.ast, ticks);
}

function runSimulationWithMockData(result) {
  var mockTicks = [];
  for (var i = 0; i < 100; i++) {
    mockTicks.push({
      mid: 50000 + Math.sin(i * 0.1) * 2000 + (Math.random() - 0.5) * 500,
      bid: 49990 + Math.sin(i * 0.1) * 2000,
      offer: 50010 + Math.sin(i * 0.1) * 2000,
      time: Date.now() - (100 - i) * 60000
    });
  }
  csLog('Generated 100 mock ticks (BTC-like prices ~$48k-$52k)', 'info');
  renderFlow(result.ast);
  animatedSimulateAST(result.ast, mockTicks);
}

function runBacktest() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) { csLog('No code to backtest.', 'warn'); return; }

  clearLog();
  csLog('=== BACKTEST START ===', 'info');
  csLog('Sending strategy to backtest engine with real BTC data...', 'info');

  var btn = document.getElementById('csBtnBacktest');
  if (btn) { btn.disabled = true; btn.textContent = 'Running...'; }

  var backtestEpic = getSelectedInstrument();
  csLog('Instrument: ' + backtestEpic, 'info');
  var payload = JSON.stringify({
    code: code,
    instrument: backtestEpic,
    resolution: 'HOUR',
    candleCount: 200
  });

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/clawscript/backtest', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (btn) { btn.disabled = false; btn.textContent = 'Run Backtest'; }
    try {
      var data = JSON.parse(xhr.responseText);
      if (xhr.status === 200 && data.ok) {
        csLog('=== BACKTEST RESULTS ===', 'success');
        csLog('Instrument: ' + data.instrument + ' | Resolution: ' + data.resolution + ' | Candles: ' + data.candlesUsed, 'info');
        csLog('Total P&L: ' + (data.totalPnl >= 0 ? '+' : '') + data.totalPnl, data.totalPnl >= 0 ? 'success' : 'error');
        csLog('Trades: ' + data.trades + ' (Wins: ' + data.wins + ', Losses: ' + data.losses + ')', 'info');
        csLog('Win Rate: ' + data.winRate + '%', data.winRate >= 50 ? 'success' : 'warn');
        csLog('Max Drawdown: ' + data.maxDrawdown, data.maxDrawdown > 0 ? 'warn' : 'info');
        csLog('', 'info');
        if (data.tradeList && data.tradeList.length > 0) {
          csLog('--- Trade List ---', 'info');
          for (var t = 0; t < data.tradeList.length; t++) {
            var tr = data.tradeList[t];
            var pnlColor = tr.pnl >= 0 ? 'success' : 'error';
            var entryDate = tr.entryTime ? new Date(tr.entryTime * 1000).toLocaleString() : '?';
            var exitDate = tr.exitTime ? new Date(tr.exitTime * 1000).toLocaleString() : '?';
            csLog('#' + (t + 1) + ' ' + tr.direction + ' x' + tr.size + ' | Entry: ' + Math.round(tr.entryPrice * 100) / 100 + ' (' + entryDate + ') → Exit: ' + Math.round(tr.exitPrice * 100) / 100 + ' (' + exitDate + ') | P&L: ' + (tr.pnl >= 0 ? '+' : '') + tr.pnl + (tr.openAtEnd ? ' [still open]' : ''), pnlColor);
          }
        }
        csLog('=== BACKTEST COMPLETE ===', 'success');
        storeBacktestResults(data);
        _csStoredResults.flowTrace = simLog.slice();
      } else {
        csLog('Backtest Error: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      csLog('Backtest Error: ' + e.message, 'error');
    }
  };
  xhr.onerror = function() {
    if (btn) { btn.disabled = false; btn.textContent = 'Run Backtest'; }
    csLog('Backtest Error: Network error', 'error');
  };
  xhr.send(payload);
}

var _csAnimSpeed = 600;
var _csAnimStepMode = false;

function initSpeedControls() {
  var btns = document.querySelectorAll('.cs-speed-btn[data-speed]');
  var stepNextBtn = document.getElementById('csStepNext');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('cs-speed-active'); });
      btn.classList.add('cs-speed-active');
      var speed = btn.getAttribute('data-speed');
      if (speed === 'step') {
        _csAnimStepMode = true;
        _csAnimSpeed = 100;
        if (stepNextBtn) stepNextBtn.style.display = '';
      } else {
        _csAnimStepMode = false;
        _csAnimSpeed = parseInt(speed);
        if (stepNextBtn) stepNextBtn.style.display = 'none';
      }
      if (window._csFlowEngine) {
        window._csFlowEngine.setAnimSpeed(_csAnimSpeed);
        window._csFlowEngine._animStepMode = _csAnimStepMode;
      }
    });
  });
  if (stepNextBtn) {
    stepNextBtn.addEventListener('click', function() {
      if (window._csFlowEngine) window._csFlowEngine.stepResume();
    });
  }
}

function animatedSimulateAST(ast, ticks) {
  var fe = window._csFlowEngine;
  if (!fe || !fe.nodes || Object.keys(fe.nodes).length === 0) {
    simulateAST(ast, ticks);
    return;
  }

  fe.clearAnimations();
  fe._animRunning = true;
  fe.setAnimSpeed(_csAnimSpeed);
  fe._animStepMode = _csAnimStepMode;

  var vars = {};
  var prices = ticks.map(function(t) { return t.mid; });
  var signals = [];
  var nodeIds = fe.getNodeIds();
  var nodeIdx = 0;

  function evalExprAnim(expr) {
    if (!expr) return null;
    switch(expr.type) {
      case 'NumberLiteral': return expr.value;
      case 'StringLiteral': return expr.value;
      case 'BooleanLiteral': return expr.value;
      case 'NullLiteral': return null;
      case 'Identifier': return vars[expr.value] !== undefined ? vars[expr.value] : expr.value;
      case 'BinaryExpr':
        var l = evalExprAnim(expr.left), r = evalExprAnim(expr.right);
        switch(expr.op) {
          case '+': return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : l + r;
          case '-': return l - r; case '*': return l * r;
          case '/': return r !== 0 ? l / r : 0; case '%': return l % r;
          case '>': return l > r; case '<': return l < r;
          case '>=': return l >= r; case '<=': return l <= r;
          case '==': return l == r; case '!=': return l != r;
          case '&&': return l && r; case '||': return l || r;
          default: return null;
        }
      case 'UnaryExpr':
        var v = evalExprAnim(expr.expr);
        return expr.op === '-' ? -v : !v;
      case 'ContainsExpr':
        return String(evalExprAnim(expr.left)).includes(String(evalExprAnim(expr.right)));
      case 'CrossesExpr':
        return expr.direction === 'OVER' ? evalExprAnim(expr.left) > evalExprAnim(expr.right) : evalExprAnim(expr.left) < evalExprAnim(expr.right);
      case 'FunctionCall':
        var name = expr.name.toUpperCase();
        var args = expr.args.map(evalExprAnim);
        if (name === 'RSI') return mockRSI(prices, args[0] || 14);
        if (name === 'EMA') return mockEMA(prices, args[0] || 20);
        if (name === 'SMA') return mockSMA(prices, args[0] || 20);
        if (name === 'ATR') return mockATR(ticks, args[0] || 14);
        if (name === 'MACD') return mockMACD(prices, args[0] || 12, args[1] || 26, args[2] || 9);
        if (name === 'BOLLINGER') return mockBollinger(prices, args[0] || 20, args[1] || 2);
        if (name === 'BOLLINGER_UPPER') { var bb = mockBollinger(prices, args[0] || 20, args[1] || 2); return bb ? bb.upper : 0; }
        if (name === 'BOLLINGER_LOWER') { var bbl = mockBollinger(prices, args[0] || 20, args[1] || 2); return bbl ? bbl.lower : 0; }
        if (name === 'LAST_PRICE') return prices[prices.length - 1] || 0;
        if (name === 'VOLUME') return 0;
        if (name === 'STOCHASTIC' || name === 'STOCH') return mockStochastic(prices, args[0] || 14, args[1] || 3);
        if (name === 'STOCHASTIC_K') { var sk = mockStochastic(prices, args[0] || 14, args[1] || 3); return sk ? sk.k : 50; }
        if (name === 'STOCHASTIC_D') { var sd = mockStochastic(prices, args[0] || 14, args[1] || 3); return sd ? sd.d : 50; }
        if (name === 'CCI') return mockCCI(prices, args[0] || 20);
        if (name === 'WILLIAMS_R') return mockWilliamsR(prices, args[0] || 14);
        if (name === 'ROC') return mockROC(prices, args[0] || 12);
        if (name === 'ADX') return mockADX(prices, args[0] || 14);
        if (name === 'AROON_UP') return 50;
        if (name === 'AROON_DOWN') return 50;
        if (name === 'ICHIMOKU_TENKAN') return mockSMA(prices, args[0] || 9);
        if (name === 'ICHIMOKU_KIJUN') return mockSMA(prices, args[0] || 26);
        if (name === 'PARABOLIC_SAR') return prices[prices.length - 2] || 0;
        if (name === 'KELTNER_UPPER') { return Math.round((mockEMA(prices, args[0] || 20) + mockATR(ticks, args[0] || 20) * (args[1] || 2)) * 100) / 100; }
        if (name === 'KELTNER_LOWER') { return Math.round((mockEMA(prices, args[0] || 20) - mockATR(ticks, args[0] || 20) * (args[1] || 2)) * 100) / 100; }
        if (name === 'DONCHIAN_HIGH') return mockDonchianHigh(prices, args[0] || 20);
        if (name === 'DONCHIAN_LOW') return mockDonchianLow(prices, args[0] || 20);
        if (name === 'OBV') return 0;
        if (name === 'VWAP') return mockSMA(prices, prices.length);
        if (name === 'CMF') return 0;
        if (name === 'ZSCORE') return mockZScore(prices, args[0] || 20);
        return 0;
      case 'MemberExpr':
        var obj = evalExprAnim(expr.object);
        return obj && typeof obj === 'object' ? obj[expr.property] : null;
      case 'LoopCount': return evalExprAnim(expr.num);
      default: return null;
    }
  }

  function formatVal(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'number') return Math.round(v * 100) / 100 + '';
    if (typeof v === 'object') return JSON.stringify(v).substring(0, 18);
    return String(v).substring(0, 18);
  }

  function getNodeForStmt(stmtIdx) {
    if (stmtIdx < nodeIds.length) return nodeIds[stmtIdx];
    return null;
  }

  async function execStmtAnim(stmt, depth, stmtGlobalIdx) {
    if (!stmt || !fe._animRunning) return { idx: stmtGlobalIdx };
    if (depth > 50) return { idx: stmtGlobalIdx };

    var nid = getNodeForStmt(stmtGlobalIdx);
    var prefix = '  '.repeat(depth);
    var nextIdx = stmtGlobalIdx + 1;

    if (nid) {
      fe.highlightNode(nid);
      var prevNid = stmtGlobalIdx > 0 ? getNodeForStmt(stmtGlobalIdx - 1) : null;
      if (prevNid && prevNid !== nid) fe.animateConnection(prevNid, nid);
      await fe.animDelay();
    }

    switch(stmt.type) {
      case 'VarDecl':
        var val = evalExprAnim(stmt.value);
        vars[stmt.name] = val;
        csLog(prefix + (stmt.isDef ? 'DEF' : 'SET') + ' ' + stmt.name + ' = ' + JSON.stringify(val), 'trace');
        if (nid) {
          fe.showNodeValue(nid, stmt.name + '=' + formatVal(val));
          fe.setNodeResult(nid, 'blue');
        }
        break;
      case 'Assignment':
        vars[stmt.name] = evalExprAnim(stmt.value);
        csLog(prefix + 'SET ' + stmt.name + ' = ' + JSON.stringify(vars[stmt.name]), 'trace');
        if (nid) {
          fe.showNodeValue(nid, stmt.name + '=' + formatVal(vars[stmt.name]));
          fe.setNodeResult(nid, 'blue');
        }
        break;
      case 'Trade':
        var cond = stmt.condition ? evalExprAnim(stmt.condition) : true;
        if (cond) {
          var sz = stmt.size ? evalExprAnim(stmt.size) : 1;
          var reason = stmt.reason ? evalExprAnim(stmt.reason) : 'Auto';
          signals.push({ dir: stmt.command, size: sz, reason: reason });
          csLog(prefix + stmt.command + ' signal! Size=' + sz + ' Reason="' + reason + '"', 'success');
          if (nid) {
            fe.showNodeValue(nid, stmt.command + ' x' + sz);
            fe.setNodeResult(nid, 'green');
          }
        } else {
          csLog(prefix + stmt.command + ' condition false, no signal', 'info');
          if (nid) fe.setNodeResult(nid, 'red');
        }
        break;
      case 'Exit':
        var econd = stmt.condition ? evalExprAnim(stmt.condition) : true;
        if (econd) {
          csLog(prefix + 'EXIT signal! Type=' + stmt.exitType, 'success');
          if (nid) { fe.showNodeValue(nid, 'EXIT ' + stmt.exitType); fe.setNodeResult(nid, 'green'); }
        } else {
          if (nid) fe.setNodeResult(nid, 'red');
        }
        break;
      case 'TrailStop':
        csLog(prefix + 'TRAILSTOP set: distance=' + evalExprAnim(stmt.distance), 'trace');
        if (nid) { fe.showNodeValue(nid, 'dist=' + formatVal(evalExprAnim(stmt.distance))); fe.setNodeResult(nid, 'blue'); }
        break;
      case 'IfStatement':
        var ifCond = evalExprAnim(stmt.condition);
        csLog(prefix + 'IF condition = ' + ifCond, 'trace');
        if (nid) {
          fe.showNodeValue(nid, ifCond ? 'TRUE' : 'FALSE');
          fe.setNodeResult(nid, ifCond ? 'green' : 'red');
        }
        if (ifCond) {
          for (var ti = 0; ti < stmt.thenBody.length; ti++) {
            var res = await execStmtAnim(stmt.thenBody[ti], depth + 1, nextIdx);
            nextIdx = res.idx;
          }
        } else if (stmt.elseBody.length > 0) {
          csLog(prefix + 'ELSE branch', 'trace');
          var skipThen = stmt.thenBody.length;
          nextIdx += skipThen;
          for (var ei = 0; ei < stmt.elseBody.length; ei++) {
            var res2 = await execStmtAnim(stmt.elseBody[ei], depth + 1, nextIdx);
            nextIdx = res2.idx;
          }
        } else {
          nextIdx += stmt.thenBody.length;
        }
        break;
      case 'Loop':
        if (stmt.condition && stmt.condition.type === 'LoopCount') {
          var count = evalExprAnim(stmt.condition.num);
          csLog(prefix + 'LOOP ' + count + ' TIMES', 'trace');
          var maxIter = Math.min(count, 10);
          for (var li = 0; li < maxIter; li++) {
            vars['i'] = li;
            if (nid) {
              fe.highlightNode(nid);
              fe.showLoopCounter(nid, li + 1, maxIter);
              await fe.animDelay();
            }
            var bodyIdx = nextIdx;
            for (var lj = 0; lj < stmt.body.length; lj++) {
              var res3 = await execStmtAnim(stmt.body[lj], depth + 1, bodyIdx);
              bodyIdx = res3.idx;
            }
          }
          nextIdx = bodyIdx || (nextIdx + stmt.body.length);
          if (nid) fe.setNodeResult(nid, 'blue');
        } else if (stmt.isForever) {
          csLog(prefix + 'LOOP FOREVER (simulating 3 iterations)', 'trace');
          for (var fi = 0; fi < 3; fi++) {
            if (nid) {
              fe.highlightNode(nid);
              fe.showLoopCounter(nid, fi + 1, 3);
              await fe.animDelay();
            }
            var bodyIdx2 = nextIdx;
            for (var fj = 0; fj < stmt.body.length; fj++) {
              var res4 = await execStmtAnim(stmt.body[fj], depth + 1, bodyIdx2);
              bodyIdx2 = res4.idx;
            }
          }
          nextIdx = bodyIdx2 || (nextIdx + stmt.body.length);
          if (nid) fe.setNodeResult(nid, 'blue');
        } else {
          csLog(prefix + 'WHILE loop (simulating up to 10 iterations)', 'trace');
          var wc = 0;
          var bodyIdx3 = nextIdx;
          while (evalExprAnim(stmt.condition) && wc < 10) {
            if (nid) {
              fe.highlightNode(nid);
              fe.showLoopCounter(nid, wc + 1, '?');
              await fe.animDelay();
            }
            bodyIdx3 = nextIdx;
            for (var wj = 0; wj < stmt.body.length; wj++) {
              var res5 = await execStmtAnim(stmt.body[wj], depth + 1, bodyIdx3);
              bodyIdx3 = res5.idx;
            }
            wc++;
          }
          nextIdx = bodyIdx3 || (nextIdx + stmt.body.length);
          if (nid) fe.setNodeResult(nid, 'blue');
        }
        break;
      case 'TryCatch':
        csLog(prefix + 'TRY', 'trace');
        if (nid) fe.showNodeValue(nid, 'TRY');
        try {
          for (var tci = 0; tci < stmt.tryBody.length; tci++) {
            var res6 = await execStmtAnim(stmt.tryBody[tci], depth + 1, nextIdx);
            nextIdx = res6.idx;
          }
          if (nid) fe.setNodeResult(nid, 'green');
        } catch(e) {
          csLog(prefix + 'CATCH ' + stmt.catchVar + ' = ' + e.message, 'warn');
          vars[stmt.catchVar] = e.message;
          if (nid) fe.setNodeResult(nid, 'red');
          nextIdx += stmt.tryBody.length;
          for (var cci = 0; cci < stmt.catchBody.length; cci++) {
            var res7 = await execStmtAnim(stmt.catchBody[cci], depth + 1, nextIdx);
            nextIdx = res7.idx;
          }
        }
        break;
      case 'ErrorThrow':
        csLog(prefix + 'ERROR: ' + evalExprAnim(stmt.message), 'error');
        if (nid) { fe.showNodeValue(nid, 'ERROR'); fe.setNodeResult(nid, 'red'); }
        throw new Error(evalExprAnim(stmt.message));
      case 'Wait':
        csLog(prefix + 'WAIT: ' + evalExprAnim(stmt.ms) + 'ms (skipped in sim)', 'trace');
        if (nid) { fe.showNodeValue(nid, evalExprAnim(stmt.ms) + 'ms'); fe.setNodeResult(nid, 'blue'); }
        break;
      default:
        csLog(prefix + stmt.type, 'trace');
        if (nid) fe.setNodeResult(nid, 'blue');
        break;
    }

    if (nid) fe.unhighlightNode(nid);
    return { idx: nextIdx };
  }

  (async function() {
    var globalIdx = 0;
    for (var si = 0; si < ast.body.length; si++) {
      try {
        var result = await execStmtAnim(ast.body[si], 0, globalIdx);
        globalIdx = result.idx;
      } catch(e) {
        csLog('Runtime error: ' + e.message, 'error');
        globalIdx++;
      }
    }

    csLog('Signals generated: ' + signals.length, signals.length > 0 ? 'success' : 'info');
    for (var qi = 0; qi < signals.length; qi++) {
      csLog('  Signal #' + (qi + 1) + ': ' + signals[qi].dir + ' size=' + signals[qi].size + ' reason="' + signals[qi].reason + '"', 'success');
    }

    fe._animRunning = false;
    csLog('=== FLOW ANIMATION COMPLETE ===', 'success');
  })();
}

function simulateAST(ast, ticks) {
  var vars = {};
  var prices = ticks.map(function(t) { return t.mid; });
  var signals = [];

  function evalExpr(expr) {
    if (!expr) return null;
    switch(expr.type) {
      case 'NumberLiteral': return expr.value;
      case 'StringLiteral': return expr.value;
      case 'BooleanLiteral': return expr.value;
      case 'NullLiteral': return null;
      case 'Identifier': return vars[expr.value] !== undefined ? vars[expr.value] : expr.value;
      case 'BinaryExpr':
        var l = evalExpr(expr.left), r = evalExpr(expr.right);
        switch(expr.op) {
          case '+': return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return r !== 0 ? l / r : 0;
          case '%': return l % r;
          case '>': return l > r;
          case '<': return l < r;
          case '>=': return l >= r;
          case '<=': return l <= r;
          case '==': return l == r;
          case '!=': return l != r;
          case '&&': return l && r;
          case '||': return l || r;
          default: return null;
        }
      case 'UnaryExpr':
        var v = evalExpr(expr.expr);
        return expr.op === '-' ? -v : !v;
      case 'ContainsExpr':
        return String(evalExpr(expr.left)).includes(String(evalExpr(expr.right)));
      case 'CrossesExpr':
        return expr.direction === 'OVER' ? evalExpr(expr.left) > evalExpr(expr.right) : evalExpr(expr.left) < evalExpr(expr.right);
      case 'FunctionCall':
        var name = expr.name.toUpperCase();
        var args = expr.args.map(evalExpr);
        if (name === 'RSI') return mockRSI(prices, args[0] || 14);
        if (name === 'EMA') return mockEMA(prices, args[0] || 20);
        if (name === 'SMA') return mockSMA(prices, args[0] || 20);
        if (name === 'ATR') return mockATR(ticks, args[0] || 14);
        if (name === 'MACD') return mockMACD(prices, args[0] || 12, args[1] || 26, args[2] || 9);
        if (name === 'BOLLINGER') return mockBollinger(prices, args[0] || 20, args[1] || 2);
        if (name === 'BOLLINGER_UPPER') { var bb = mockBollinger(prices, args[0] || 20, args[1] || 2); return bb ? bb.upper : 0; }
        if (name === 'BOLLINGER_LOWER') { var bbl = mockBollinger(prices, args[0] || 20, args[1] || 2); return bbl ? bbl.lower : 0; }
        if (name === 'LAST_PRICE') return prices[prices.length - 1] || 0;
        if (name === 'VOLUME') return 0;
        if (name === 'STOCHASTIC' || name === 'STOCH') return mockStochastic(prices, args[0] || 14, args[1] || 3);
        if (name === 'STOCHASTIC_K') { var sk = mockStochastic(prices, args[0] || 14, args[1] || 3); return sk ? sk.k : 50; }
        if (name === 'STOCHASTIC_D') { var sd = mockStochastic(prices, args[0] || 14, args[1] || 3); return sd ? sd.d : 50; }
        if (name === 'CCI') return mockCCI(prices, args[0] || 20);
        if (name === 'WILLIAMS_R') return mockWilliamsR(prices, args[0] || 14);
        if (name === 'ROC') return mockROC(prices, args[0] || 12);
        if (name === 'ADX') return mockADX(prices, args[0] || 14);
        if (name === 'AROON_UP') return 50;
        if (name === 'AROON_DOWN') return 50;
        if (name === 'ICHIMOKU_TENKAN') return mockSMA(prices, args[0] || 9);
        if (name === 'ICHIMOKU_KIJUN') return mockSMA(prices, args[0] || 26);
        if (name === 'PARABOLIC_SAR') return prices[prices.length - 2] || 0;
        if (name === 'KELTNER_UPPER') { var ku = mockEMA(prices, args[0] || 20) + mockATR(ticks, args[0] || 20) * (args[1] || 2); return Math.round(ku * 100) / 100; }
        if (name === 'KELTNER_LOWER') { var kl = mockEMA(prices, args[0] || 20) - mockATR(ticks, args[0] || 20) * (args[1] || 2); return Math.round(kl * 100) / 100; }
        if (name === 'DONCHIAN_HIGH') return mockDonchianHigh(prices, args[0] || 20);
        if (name === 'DONCHIAN_LOW') return mockDonchianLow(prices, args[0] || 20);
        if (name === 'OBV') return 0;
        if (name === 'VWAP') return mockSMA(prices, prices.length);
        if (name === 'CMF') return 0;
        if (name === 'ZSCORE') return mockZScore(prices, args[0] || 20);
        if (name === 'FIBONACCI') return null;
        if (name === 'ULTIMATE_OSC') return 50;
        if (name === 'CHAIKIN_VOL') return 0;
        if (name === 'SUPERTREND') return null;
        if (name === 'DONCHIAN') return { upper: mockDonchianHigh(prices, args[0] || 20), lower: mockDonchianLow(prices, args[0] || 20) };
        if (name === 'KELTNER') return { upper: mockEMA(prices, args[0] || 20) + mockATR(ticks, args[0] || 20) * (args[1] || 2), lower: mockEMA(prices, args[0] || 20) - mockATR(ticks, args[0] || 20) * (args[1] || 2) };
        return 0;
      case 'MemberExpr':
        var obj = evalExpr(expr.object);
        return obj && typeof obj === 'object' ? obj[expr.property] : null;
      case 'LoopCount': return evalExpr(expr.num);
      case 'AIQuery':
        csLog('[SIM] AI_QUERY: "' + (expr.prompt ? evalExpr(expr.prompt) : '?') + '" → mock response', 'trace');
        return 'AI mock response';
      case 'AnalyzeLog':
        csLog('[SIM] ANALYZE_LOG: "' + evalExpr(expr.query) + '"', 'trace');
        return 'Log analysis mock';
      case 'RunML':
        csLog('[SIM] RUN_ML: model=' + evalExpr(expr.modelCode), 'trace');
        return 42;
      case 'ClawWeb':
        csLog('[SIM] CLAW_WEB: ' + evalExpr(expr.url), 'trace');
        return 'Web content mock';
      case 'ClawX':
        csLog('[SIM] CLAW_X: ' + evalExpr(expr.query), 'trace');
        return [{text:'mock tweet',score:0.8}];
      case 'ClawPdf':
        csLog('[SIM] CLAW_PDF: ' + evalExpr(expr.fileName), 'trace');
        return 'PDF content mock';
      case 'ClawImage':
        csLog('[SIM] CLAW_IMAGE: ' + evalExpr(expr.description), 'trace');
        return 'image_url_mock';
      case 'ClawVideo':
        csLog('[SIM] CLAW_VIDEO: ' + evalExpr(expr.url), 'trace');
        return 'video_mock';
      case 'ClawConversation':
        csLog('[SIM] CLAW_CONVERSATION: ' + evalExpr(expr.query), 'trace');
        return 'Conversation mock';
      case 'ClawTool':
        csLog('[SIM] CLAW_TOOL: ' + evalExpr(expr.toolName), 'trace');
        return 'tool result mock';
      case 'ClawCode':
        csLog('[SIM] CLAW_CODE execution', 'trace');
        return 0;
      case 'CallSession':
        csLog('[SIM] CALL_SESSION: ' + evalExpr(expr.agentName), 'trace');
        return 'session response mock';
      case 'WaitForReply':
        csLog('[SIM] WAIT_FOR_REPLY: session=' + evalExpr(expr.sessionId), 'trace');
        return 'proceed';
      case 'LoadVar':
        csLog('[SIM] LOAD_VAR: ' + evalExpr(expr.key), 'trace');
        return expr.defaultVal ? evalExpr(expr.defaultVal) : null;
      case 'NomadScan':
        csLog('[SIM] NOMAD_SCAN: ' + evalExpr(expr.category), 'trace');
        return [{epic:'BTC',score:90},{epic:'ETH',score:85}];
      case 'RumorScan':
        csLog('[SIM] RUMOR_SCAN: ' + evalExpr(expr.topic), 'trace');
        return [{text:'rumor mock',score:0.7}];
      case 'IndicatorCall':
        var iname = expr.name.toUpperCase();
        var iparams = expr.params.map(evalExpr);
        if (iname === 'RSI') return mockRSI(prices, iparams[0] || 14);
        if (iname === 'EMA') return mockEMA(prices, iparams[0] || 20);
        if (iname === 'SMA') return mockSMA(prices, iparams[0] || 20);
        if (iname === 'ATR') return mockATR(ticks, iparams[0] || 14);
        if (iname === 'MACD') return mockMACD(prices, iparams[0] || 12, iparams[1] || 26, iparams[2] || 9);
        if (iname === 'BOLLINGER') return mockBollinger(prices, iparams[0] || 20, iparams[1] || 2);
        if (iname === 'CCI') return mockCCI(prices, iparams[0] || 20);
        if (iname === 'WILLIAMS_R') return mockWilliamsR(prices, iparams[0] || 14);
        if (iname === 'ROC') return mockROC(prices, iparams[0] || 12);
        if (iname === 'ADX') return mockADX(prices, iparams[0] || 14);
        if (iname === 'STOCHASTIC' || iname === 'STOCH') return mockStochastic(prices, iparams[0] || 14, iparams[1] || 3);
        if (iname === 'ZSCORE') return mockZScore(prices, iparams[0] || 20);
        return 0;
      default:
        return null;
    }
  }

  function execStmt(stmt, depth) {
    if (!stmt) return null;
    if (depth > 50) { csLog('[SIM] Max depth exceeded', 'warn'); return null; }
    var prefix = '  '.repeat(depth);

    switch(stmt.type) {
      case 'VarDecl':
        var val = evalExpr(stmt.value);
        vars[stmt.name] = val;
        csLog(prefix + (stmt.isDef ? 'DEF' : 'SET') + ' ' + stmt.name + ' = ' + JSON.stringify(val), 'trace');
        break;
      case 'Assignment':
        vars[stmt.name] = evalExpr(stmt.value);
        csLog(prefix + 'SET ' + stmt.name + ' = ' + JSON.stringify(vars[stmt.name]), 'trace');
        break;
      case 'Trade':
        var cond = stmt.condition ? evalExpr(stmt.condition) : true;
        if (cond) {
          var sz = stmt.size ? evalExpr(stmt.size) : 1;
          var reason = stmt.reason ? evalExpr(stmt.reason) : 'Auto';
          signals.push({ dir: stmt.command, size: sz, reason: reason });
          csLog(prefix + stmt.command + ' signal! Size=' + sz + ' Reason="' + reason + '"', 'success');
        } else {
          csLog(prefix + stmt.command + ' condition false, no signal', 'info');
        }
        break;
      case 'Exit':
        var econd = stmt.condition ? evalExpr(stmt.condition) : true;
        if (econd) {
          csLog(prefix + 'EXIT signal! Type=' + stmt.exitType, 'success');
        }
        break;
      case 'TrailStop':
        csLog(prefix + 'TRAILSTOP set: distance=' + evalExpr(stmt.distance), 'trace');
        break;
      case 'IfStatement':
        var ifCond = evalExpr(stmt.condition);
        csLog(prefix + 'IF condition = ' + ifCond, 'trace');
        if (ifCond) {
          for (var ti = 0; ti < stmt.thenBody.length; ti++) execStmt(stmt.thenBody[ti], depth + 1);
        } else if (stmt.elseBody.length > 0) {
          csLog(prefix + 'ELSE branch', 'trace');
          for (var ei = 0; ei < stmt.elseBody.length; ei++) execStmt(stmt.elseBody[ei], depth + 1);
        }
        break;
      case 'Loop':
        if (stmt.condition.type === 'LoopCount') {
          var count = evalExpr(stmt.condition.num);
          csLog(prefix + 'LOOP ' + count + ' TIMES', 'trace');
          var maxIter = Math.min(count, 10);
          for (var li = 0; li < maxIter; li++) {
            vars['i'] = li;
            for (var lj = 0; lj < stmt.body.length; lj++) execStmt(stmt.body[lj], depth + 1);
          }
        } else if (stmt.isForever) {
          csLog(prefix + 'LOOP FOREVER (simulating 3 iterations)', 'trace');
          for (var fi = 0; fi < 3; fi++) {
            for (var fj = 0; fj < stmt.body.length; fj++) execStmt(stmt.body[fj], depth + 1);
          }
        } else {
          csLog(prefix + 'WHILE loop (simulating up to 10 iterations)', 'trace');
          var wc = 0;
          while (evalExpr(stmt.condition) && wc < 10) {
            for (var wj = 0; wj < stmt.body.length; wj++) execStmt(stmt.body[wj], depth + 1);
            wc++;
          }
        }
        break;
      case 'TryCatch':
        csLog(prefix + 'TRY', 'trace');
        try {
          for (var tci = 0; tci < stmt.tryBody.length; tci++) execStmt(stmt.tryBody[tci], depth + 1);
        } catch(e) {
          csLog(prefix + 'CATCH ' + stmt.catchVar + ' = ' + e.message, 'warn');
          vars[stmt.catchVar] = e.message;
          for (var cci = 0; cci < stmt.catchBody.length; cci++) execStmt(stmt.catchBody[cci], depth + 1);
        }
        break;
      case 'ErrorThrow':
        csLog(prefix + 'ERROR: ' + evalExpr(stmt.message), 'error');
        throw new Error(evalExpr(stmt.message));
      case 'AIQuery':
        csLog(prefix + 'AI_QUERY: "' + evalExpr(stmt.prompt) + '" → mock response', 'trace');
        break;
      case 'AIGenerate':
        csLog(prefix + 'AI_GENERATE_SCRIPT: "' + evalExpr(stmt.prompt) + '"', 'trace');
        break;
      case 'AnalyzeLog':
        csLog(prefix + 'ANALYZE_LOG: "' + evalExpr(stmt.query) + '"', 'trace');
        break;
      case 'RunML':
        csLog(prefix + 'RUN_ML: ' + evalExpr(stmt.modelCode), 'trace');
        break;
      case 'ClawWeb':
        csLog(prefix + 'CLAW_WEB: ' + evalExpr(stmt.url), 'trace');
        break;
      case 'ClawX':
        csLog(prefix + 'CLAW_X: ' + evalExpr(stmt.query), 'trace');
        break;
      case 'ClawPdf':
        csLog(prefix + 'CLAW_PDF: ' + evalExpr(stmt.fileName), 'trace');
        break;
      case 'ClawImage':
        csLog(prefix + 'CLAW_IMAGE: ' + evalExpr(stmt.description), 'trace');
        break;
      case 'ClawVideo':
        csLog(prefix + 'CLAW_VIDEO: ' + evalExpr(stmt.url), 'trace');
        break;
      case 'ClawImageView':
        csLog(prefix + 'CLAW_IMAGE_VIEW: ' + evalExpr(stmt.url), 'trace');
        break;
      case 'ClawConversation':
        csLog(prefix + 'CLAW_CONVERSATION: ' + evalExpr(stmt.query), 'trace');
        break;
      case 'ClawTool':
        csLog(prefix + 'CLAW_TOOL: ' + evalExpr(stmt.toolName), 'trace');
        break;
      case 'ClawCode':
        csLog(prefix + 'CLAW_CODE execution', 'trace');
        break;
      case 'SpawnAgent':
        csLog(prefix + 'SPAWN_AGENT: ' + evalExpr(stmt.name), 'trace');
        break;
      case 'CallSession':
        csLog(prefix + 'CALL_SESSION: ' + evalExpr(stmt.agentName), 'trace');
        break;
      case 'MutateConfig':
        var key = evalExpr(stmt.key);
        var mval = stmt.value ? evalExpr(stmt.value) : null;
        csLog(prefix + 'MUTATE_CONFIG: ' + key + ' = ' + mval, 'trace');
        break;
      case 'Alert':
        csLog(prefix + 'ALERT: "' + evalExpr(stmt.message) + '"' + (stmt.to ? ' TO ' + evalExpr(stmt.to) : ''), 'warn');
        break;
      case 'SayToSession':
        csLog(prefix + 'SAY_TO_SESSION ' + evalExpr(stmt.sessionId) + ': "' + evalExpr(stmt.message) + '"', 'trace');
        break;
      case 'WaitForReply':
        csLog(prefix + 'WAIT_FOR_REPLY: session=' + evalExpr(stmt.sessionId) + ' (mock: "proceed")', 'trace');
        break;
      case 'StoreVar':
        csLog(prefix + 'STORE_VAR: ' + evalExpr(stmt.key) + ' = ' + evalExpr(stmt.value), 'trace');
        break;
      case 'LoadVar':
        csLog(prefix + 'LOAD_VAR: ' + evalExpr(stmt.key), 'trace');
        break;
      case 'Wait':
        csLog(prefix + 'WAIT: ' + evalExpr(stmt.ms) + 'ms (skipped in sim)', 'trace');
        break;
      case 'Include':
        csLog(prefix + 'INCLUDE: ' + evalExpr(stmt.scriptName), 'trace');
        break;
      case 'Optimize':
        csLog(prefix + 'OPTIMIZE: ' + stmt.varName, 'trace');
        break;
      case 'IndicatorCall':
        var ind = evalExpr(stmt);
        csLog(prefix + 'INDICATOR ' + stmt.name + ' = ' + ind, 'trace');
        break;
      case 'CrashScan':
        csLog(prefix + 'CRASH_SCAN ' + stmt.state, 'trace');
        break;
      case 'MarketNomad':
        csLog(prefix + 'MARKET_NOMAD ' + stmt.state, 'trace');
        break;
      case 'NomadScan':
        csLog(prefix + 'NOMAD_SCAN: ' + evalExpr(stmt.category), 'trace');
        break;
      case 'NomadAllocate':
        csLog(prefix + 'NOMAD_ALLOCATE', 'trace');
        break;
      case 'RumorScan':
        csLog(prefix + 'RUMOR_SCAN: ' + evalExpr(stmt.topic), 'trace');
        break;
      case 'FunctionDecl':
        csLog(prefix + 'DEF_FUNC ' + stmt.name + '(' + stmt.params.join(', ') + ')', 'trace');
        break;
      case 'FunctionCallStmt':
        csLog(prefix + 'CALL ' + stmt.name + '()', 'trace');
        break;
      case 'Chain':
        csLog(prefix + 'CHAIN (' + stmt.steps.length + ' steps)', 'trace');
        for (var ci = 0; ci < stmt.steps.length; ci++) evalExpr(stmt.steps[ci]);
        break;
      default:
        csLog(prefix + 'Unknown: ' + stmt.type, 'info');
    }
    return null;
  }

  for (var si = 0; si < ast.body.length; si++) {
    try {
      execStmt(ast.body[si], 0);
    } catch(e) {
      csLog('Runtime error: ' + e.message, 'error');
    }
  }

  csLog('Signals generated: ' + signals.length, signals.length > 0 ? 'success' : 'info');
  for (var qi = 0; qi < signals.length; qi++) {
    csLog('  Signal #' + (qi + 1) + ': ' + signals[qi].dir + ' size=' + signals[qi].size + ' reason="' + signals[qi].reason + '"', 'success');
  }

  storeSimulationResults(signals, vars, ticks);
}

function mockRSI(prices, period) {
  if (prices.length < period + 1) return 50;
  var gains = 0, losses = 0;
  for (var i = prices.length - period; i < prices.length; i++) {
    var diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  if (losses === 0) return 100;
  var rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

function mockEMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  var k = 2 / (period + 1);
  var ema = 0;
  for (var i = 0; i < period; i++) ema += prices[i];
  ema /= period;
  for (var j = period; j < prices.length; j++) ema = prices[j] * k + ema * (1 - k);
  return Math.round(ema * 100) / 100;
}

function mockSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  var sum = 0;
  for (var i = prices.length - period; i < prices.length; i++) sum += prices[i];
  return Math.round((sum / period) * 100) / 100;
}

function mockATR(ticks, period) {
  if (ticks.length < 2) return 0;
  var trs = [];
  for (var i = 1; i < ticks.length; i++) {
    var h = Math.max(ticks[i].mid, ticks[i-1].mid);
    var l = Math.min(ticks[i].mid, ticks[i-1].mid);
    trs.push(h - l);
  }
  if (trs.length < period) return trs.reduce(function(a,b){return a+b;},0) / trs.length;
  var sum = 0;
  for (var j = trs.length - period; j < trs.length; j++) sum += trs[j];
  return Math.round((sum / period) * 100) / 100;
}

function mockMACD(prices, fast, slow, signal) {
  var fEma = mockEMA(prices, fast);
  var sEma = mockEMA(prices, slow);
  return { macdLine: Math.round((fEma - sEma) * 100) / 100, signalLine: 0, histogram: Math.round((fEma - sEma) * 100) / 100 };
}

function mockBollinger(prices, period, sd) {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0 };
  var slice = prices.slice(-period);
  var mean = 0;
  for (var i = 0; i < slice.length; i++) mean += slice[i];
  mean /= period;
  var variance = 0;
  for (var j = 0; j < slice.length; j++) variance += (slice[j] - mean) * (slice[j] - mean);
  variance /= period;
  var stdDev = Math.sqrt(variance);
  return { upper: Math.round((mean + sd * stdDev) * 100) / 100, middle: Math.round(mean * 100) / 100, lower: Math.round((mean - sd * stdDev) * 100) / 100 };
}

function mockStochastic(prices, kPeriod, dPeriod) {
  if (prices.length < kPeriod + dPeriod) return { k: 50, d: 50 };
  var kValues = [];
  for (var i = kPeriod - 1; i < prices.length; i++) {
    var high = -Infinity, low = Infinity;
    for (var j = i - kPeriod + 1; j <= i; j++) { if (prices[j] > high) high = prices[j]; if (prices[j] < low) low = prices[j]; }
    var range = high - low;
    kValues.push(range > 0 ? ((prices[i] - low) / range) * 100 : 50);
  }
  var dSlice = kValues.slice(-dPeriod);
  var dSum = 0;
  for (var d = 0; d < dSlice.length; d++) dSum += dSlice[d];
  return { k: Math.round(kValues[kValues.length - 1] * 100) / 100, d: Math.round((dSum / dPeriod) * 100) / 100 };
}

function mockCCI(prices, period) {
  if (prices.length < period) return 0;
  var slice = prices.slice(-period);
  var mean = 0;
  for (var i = 0; i < slice.length; i++) mean += slice[i];
  mean /= period;
  var meanDev = 0;
  for (var j = 0; j < slice.length; j++) meanDev += Math.abs(slice[j] - mean);
  meanDev /= period;
  if (meanDev === 0) return 0;
  return Math.round(((prices[prices.length - 1] - mean) / (0.015 * meanDev)) * 100) / 100;
}

function mockWilliamsR(prices, period) {
  if (prices.length < period) return -50;
  var high = -Infinity, low = Infinity;
  for (var i = prices.length - period; i < prices.length; i++) { if (prices[i] > high) high = prices[i]; if (prices[i] < low) low = prices[i]; }
  var range = high - low;
  if (range === 0) return -50;
  return Math.round(((high - prices[prices.length - 1]) / range) * -100 * 100) / 100;
}

function mockROC(prices, period) {
  if (prices.length < period + 1) return 0;
  var current = prices[prices.length - 1];
  var past = prices[prices.length - 1 - period];
  if (past === 0) return 0;
  return Math.round(((current - past) / past) * 100 * 100) / 100;
}

function mockADX(prices, period) {
  return 25;
}

function mockDonchianHigh(prices, period) {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  var high = -Infinity;
  for (var i = prices.length - period; i < prices.length; i++) if (prices[i] > high) high = prices[i];
  return Math.round(high * 100) / 100;
}

function mockDonchianLow(prices, period) {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  var low = Infinity;
  for (var i = prices.length - period; i < prices.length; i++) if (prices[i] < low) low = prices[i];
  return Math.round(low * 100) / 100;
}

function mockZScore(prices, period) {
  if (prices.length < period) return 0;
  var slice = prices.slice(-period);
  var mean = 0;
  for (var i = 0; i < slice.length; i++) mean += slice[i];
  mean /= period;
  var variance = 0;
  for (var j = 0; j < slice.length; j++) variance += (slice[j] - mean) * (slice[j] - mean);
  variance /= period;
  var stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return Math.round(((prices[prices.length - 1] - mean) / stdDev) * 100) / 100;
}

function storeSimulationResults(signals, vars, ticks) {
  _csStoredResults.simulation = {
    type: 'simulation',
    signals: signals || [],
    variables: {},
    tickCount: ticks ? ticks.length : 0,
    timestamp: Date.now()
  };
  if (vars) {
    for (var k in vars) {
      if (vars.hasOwnProperty(k)) {
        var v = vars[k];
        if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v === null) {
          _csStoredResults.simulation.variables[k] = v;
        }
      }
    }
  }
  _csStoredResults.flowTrace = simLog.slice();
  postResultsToServer();
}

function storeBacktestResults(data) {
  _csStoredResults.backtest = data;
  _csStoredResults.backtest.type = 'backtest';
  postResultsToServer();
}

function postResultsToServer() {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/clawscript/results', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(_csStoredResults));
  } catch(e) {}
}

function openResultsPopup() {
  var existing = document.getElementById('csResultsOverlay');
  if (existing) existing.remove();
  existing = document.getElementById('csResultsPopup');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'csResultsOverlay';
  overlay.className = 'cs-results-overlay';
  overlay.addEventListener('click', closeResultsPopup);
  document.body.appendChild(overlay);

  var popup = document.createElement('div');
  popup.id = 'csResultsPopup';
  popup.className = 'cs-results-popup';
  popup.style.top = '10vh';
  popup.style.left = 'calc(50% - 340px)';

  var header = document.createElement('div');
  header.className = 'cs-results-header';
  header.innerHTML = '<h3>&#128202; Results</h3><button class="cs-results-close" id="csResultsCloseBtn">&times;</button>';
  popup.appendChild(header);

  var tabs = document.createElement('div');
  tabs.className = 'cs-results-tabs';
  tabs.innerHTML = '<button class="cs-results-tab cs-rt-active" data-tab="simulation">Simulation</button>' +
    '<button class="cs-results-tab" data-tab="backtest">Backtest</button>' +
    '<button class="cs-results-tab" data-tab="trace">Flow Trace</button>';
  popup.appendChild(tabs);

  var body = document.createElement('div');
  body.className = 'cs-results-body';
  body.id = 'csResultsBody';
  popup.appendChild(body);

  document.body.appendChild(popup);

  header.querySelector('#csResultsCloseBtn').addEventListener('click', closeResultsPopup);

  var tabBtns = tabs.querySelectorAll('.cs-results-tab');
  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function() {
      for (var j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove('cs-rt-active');
      this.classList.add('cs-rt-active');
      renderResultsTab(this.getAttribute('data-tab'));
    });
  }

  makeDraggable(popup, header);
  renderResultsTab('simulation');
}

function closeResultsPopup() {
  var overlay = document.getElementById('csResultsOverlay');
  if (overlay) overlay.remove();
  var popup = document.getElementById('csResultsPopup');
  if (popup) popup.remove();
}

function makeDraggable(el, handle) {
  var isDragging = false;
  var startX, startY, origLeft, origTop;
  handle.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = el.offsetLeft;
    origTop = el.offsetTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    el.style.left = (origLeft + e.clientX - startX) + 'px';
    el.style.top = (origTop + e.clientY - startY) + 'px';
  });
  document.addEventListener('mouseup', function() { isDragging = false; });
}

function renderResultsTab(tab) {
  var body = document.getElementById('csResultsBody');
  if (!body) return;

  if (tab === 'simulation') {
    renderSimulationResults(body);
  } else if (tab === 'backtest') {
    renderBacktestResults(body);
  } else if (tab === 'trace') {
    renderFlowTrace(body);
  }
}

function renderSimulationResults(body) {
  var sim = _csStoredResults.simulation;
  if (!sim) {
    body.innerHTML = '<div class="cs-results-empty">No simulation results yet. Run a simulation first.</div>';
    return;
  }
  var html = '<div class="cs-results-section"><div class="cs-results-section-title">Simulation Summary</div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Ticks Processed</span><span class="cs-results-stat-value">' + sim.tickCount + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Signals Generated</span><span class="cs-results-stat-value">' + sim.signals.length + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Timestamp</span><span class="cs-results-stat-value">' + new Date(sim.timestamp).toLocaleString() + '</span></div>';
  html += '</div>';

  if (sim.signals.length > 0) {
    html += '<div class="cs-results-section"><div class="cs-results-section-title">Signals</div>';
    for (var i = 0; i < sim.signals.length; i++) {
      var s = sim.signals[i];
      var cls = (s.dir === 'BUY') ? 'cs-results-pnl-pos' : 'cs-results-pnl-neg';
      html += '<div class="cs-results-signal-row"><span class="' + cls + '">' + s.dir + '</span> x' + s.size + ' &mdash; ' + escapeHtml(String(s.reason)) + '</div>';
    }
    html += '</div>';
  }

  var varKeys = Object.keys(sim.variables || {});
  if (varKeys.length > 0) {
    html += '<div class="cs-results-section"><div class="cs-results-section-title">Variables</div>';
    for (var v = 0; v < varKeys.length; v++) {
      var val = sim.variables[varKeys[v]];
      html += '<div class="cs-results-stat"><span class="cs-results-stat-label">' + escapeHtml(varKeys[v]) + '</span><span class="cs-results-stat-value">' + escapeHtml(String(val)) + '</span></div>';
    }
    html += '</div>';
  }

  body.innerHTML = html;
}

function renderBacktestResults(body) {
  var bt = _csStoredResults.backtest;
  if (!bt) {
    body.innerHTML = '<div class="cs-results-empty">No backtest results yet. Run a backtest first.</div>' +
      '<div style="text-align:center;"><button class="cs-results-fetch-btn" id="csResultsFetchBtn">Fetch from Server</button></div>';
    var fetchBtn = body.querySelector('#csResultsFetchBtn');
    if (fetchBtn) {
      fetchBtn.addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/clawscript/results', true);
        xhr.onload = function() {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data && data.results) {
              _csStoredResults.backtest = data.results;
              renderBacktestResults(body);
            } else {
              body.innerHTML = '<div class="cs-results-empty">No results found on server.</div>';
            }
          } catch(e) { body.innerHTML = '<div class="cs-results-empty">Error fetching results.</div>'; }
        };
        xhr.send();
      });
    }
    return;
  }

  var pnlCls = bt.totalPnl >= 0 ? 'cs-results-pnl-pos' : 'cs-results-pnl-neg';
  var html = '<div class="cs-results-section"><div class="cs-results-section-title">Backtest Summary</div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Instrument</span><span class="cs-results-stat-value">' + escapeHtml(bt.instrument || '?') + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Resolution</span><span class="cs-results-stat-value">' + escapeHtml(bt.resolution || '?') + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Candles</span><span class="cs-results-stat-value">' + (bt.candlesUsed || 0) + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Total P&L</span><span class="cs-results-stat-value ' + pnlCls + '">' + (bt.totalPnl >= 0 ? '+' : '') + bt.totalPnl + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Trades</span><span class="cs-results-stat-value">' + (bt.trades || 0) + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Wins / Losses</span><span class="cs-results-stat-value">' + (bt.wins || 0) + ' / ' + (bt.losses || 0) + '</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Win Rate</span><span class="cs-results-stat-value">' + (bt.winRate || 0) + '%</span></div>';
  html += '<div class="cs-results-stat"><span class="cs-results-stat-label">Max Drawdown</span><span class="cs-results-stat-value cs-results-pnl-neg">' + (bt.maxDrawdown || 0) + '</span></div>';
  html += '</div>';

  if (bt.equityCurve && bt.equityCurve.length > 1) {
    html += '<div class="cs-results-section"><div class="cs-results-section-title">Equity Curve</div>';
    html += '<canvas id="csEquityCanvas" class="cs-results-equity-chart"></canvas>';
    html += '</div>';
  }

  if (bt.tradeList && bt.tradeList.length > 0) {
    html += '<div class="cs-results-section"><div class="cs-results-section-title">Trade List (' + bt.tradeList.length + ')</div>';
    html += '<div class="cs-results-trade-row cs-results-trade-header"><span>#</span><span>Dir</span><span>Size</span><span>Entry → Exit</span><span>P&L</span></div>';
    for (var t = 0; t < bt.tradeList.length; t++) {
      var tr = bt.tradeList[t];
      var trPnlCls = tr.pnl >= 0 ? 'cs-results-pnl-pos' : 'cs-results-pnl-neg';
      html += '<div class="cs-results-trade-row">';
      html += '<span>' + (t + 1) + '</span>';
      html += '<span>' + tr.direction + '</span>';
      html += '<span>' + tr.size + '</span>';
      html += '<span>' + Math.round(tr.entryPrice * 100) / 100 + ' → ' + Math.round(tr.exitPrice * 100) / 100 + (tr.openAtEnd ? ' [open]' : '') + '</span>';
      html += '<span class="' + trPnlCls + '">' + (tr.pnl >= 0 ? '+' : '') + tr.pnl + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  body.innerHTML = html;

  if (bt.equityCurve && bt.equityCurve.length > 1) {
    setTimeout(function() { drawEquityCurve(bt.equityCurve); }, 50);
  }
}

function drawEquityCurve(curve) {
  var canvas = document.getElementById('csEquityCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.offsetWidth;
  var h = canvas.offsetHeight;
  canvas.width = w * 2;
  canvas.height = h * 2;
  ctx.scale(2, 2);

  var vals = curve.map(function(c) { return c.equity; });
  var minV = Math.min.apply(null, vals);
  var maxV = Math.max.apply(null, vals);
  var range = maxV - minV || 1;
  var pad = 4;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (var i = 0; i < vals.length; i++) {
    var x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    var y = h - pad - ((vals[i] - minV) / range) * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);
  var zeroY = h - pad - ((0 - minV) / range) * (h - pad * 2);
  if (zeroY > pad && zeroY < h - pad) {
    ctx.beginPath();
    ctx.moveTo(pad, zeroY);
    ctx.lineTo(w - pad, zeroY);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function renderFlowTrace(body) {
  var trace = _csStoredResults.flowTrace;
  if (!trace || trace.length === 0) {
    body.innerHTML = '<div class="cs-results-empty">No flow execution trace yet. Run a simulation or backtest first.</div>';
    return;
  }
  var html = '<div class="cs-results-section"><div class="cs-results-section-title">Execution Trace (' + trace.length + ' entries)</div>';
  var maxShow = Math.min(trace.length, 500);
  for (var i = 0; i < maxShow; i++) {
    var entry = trace[i];
    var cls = 'cs-results-trace-' + (entry.type || 'info');
    html += '<div class="cs-results-trace-line ' + cls + '">[' + (entry.time || '') + '] ' + escapeHtml(entry.msg || '') + '</div>';
  }
  if (trace.length > maxShow) {
    html += '<div class="cs-results-trace-line cs-results-trace-info">... and ' + (trace.length - maxShow) + ' more entries</div>';
  }
  html += '</div>';
  body.innerHTML = html;
}

function extractClawScriptMetadata(code) {
  var lines = code.split('\n');
  var inputs = [];
  var defs = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var lineNum = i + 1;
    var trimmed = line.trim();

    var inlineCommentMatch = trimmed.match(/\/\/\s*(.+)$/);
    var inlineComment = inlineCommentMatch ? inlineCommentMatch[1].trim() : '';
    var prevLine = i > 0 ? lines[i - 1].trim() : '';
    var prevComment = prevLine.indexOf('//') === 0 ? prevLine.slice(2).trim() : '';
    var comment = inlineComment || prevComment;

    var inputMatch = trimmed.match(/^(INPUT_INT|INPUT_FLOAT|INPUT_BOOL|INPUT_SYMBOL)\s+(\w+)(?:\s+DEFAULT\s+(.+?))?(?:\s*\/\/|$)/i);
    if (inputMatch) {
      var cmd = inputMatch[1].toUpperCase();
      var varName = inputMatch[2];
      var defaultVal = inputMatch[3] ? inputMatch[3].trim() : null;
      var schemaType = 'number';
      if (cmd === 'INPUT_BOOL') schemaType = 'boolean';
      else if (cmd === 'INPUT_SYMBOL') schemaType = 'string';

      var parsedDefault = defaultVal;
      if (defaultVal !== null) {
        if (schemaType === 'number') parsedDefault = parseFloat(defaultVal) || 0;
        else if (schemaType === 'boolean') parsedDefault = defaultVal === 'true';
        else parsedDefault = defaultVal.replace(/^["']|["']$/g, '');
      }

      inputs.push({ key: varName, type: schemaType, inputCmd: cmd, default: parsedDefault, label: comment || varName, tooltip: comment || '', line: lineNum });
      continue;
    }

    var defMatch = trimmed.match(/^DEF\s+(\w+)\s*=\s*(.+?)(?:\s*\/\/|$)/i);
    if (defMatch) {
      var dVarName = defMatch[1];
      var rawVal = defMatch[2].trim();
      var dType = 'string';
      var dParsed = rawVal;
      if (/^\d+$/.test(rawVal)) { dType = 'number'; dParsed = parseInt(rawVal, 10); }
      else if (/^\d+\.\d+$/.test(rawVal)) { dType = 'number'; dParsed = parseFloat(rawVal); }
      else if (rawVal === 'true' || rawVal === 'false') { dType = 'boolean'; dParsed = rawVal === 'true'; }
      else { dParsed = rawVal.replace(/^["']|["']$/g, ''); }

      defs.push({ key: dVarName, type: dType, default: dParsed, label: comment || dVarName, tooltip: comment || '', line: lineNum });
    }
  }

  return { inputs: inputs, defs: defs };
}

function parseClawScript(code) {
  var KEYWORDS_SET = {};
  for (var ki = 0; ki < CS_KEYWORDS.length; ki++) KEYWORDS_SET[CS_KEYWORDS[ki]] = true;

  var tokens = csLexer(code).filter(function(t) { return t.type !== TOKEN_TYPES.COMMENT; });

  var pos = 0;
  var variables = {};
  var imports = { indicators: true };
  var functions = {};

  function current() { return tokens[pos] || null; }
  function peek(off) { return tokens[pos + (off || 1)] || null; }

  function isKw(kw) {
    var t = current();
    return t && String(t.value).toUpperCase() === kw.toUpperCase();
  }

  function isOneOf(kws) {
    var t = current();
    if (!t) return false;
    var v = String(t.value).toUpperCase();
    for (var i = 0; i < kws.length; i++) if (kws[i].toUpperCase() === v) return true;
    return false;
  }

  function eat() { return tokens[pos++]; }

  function parseProgram() {
    var body = [];
    while (pos < tokens.length) {
      var stmt = parseStatement();
      if (stmt) body.push(stmt);
    }
    return { type: 'Program', body: body };
  }

  function parseStatement() {
    var t = current();
    if (!t) return null;
    var v = String(t.value).toUpperCase();

    switch(v) {
      case 'DEF':
        if (peek() && String(peek().value).toUpperCase() === 'DEF_FUNC') return parseFuncDecl();
        return parseVarDecl(true);
      case 'DEF_FUNC': return parseFuncDecl();
      case 'SET': return parseVarDecl(false);
      case 'BUY': case 'SELL': case 'SELLSHORT': return parseTrade(v);
      case 'EXIT': case 'CLOSE': return parseExit(v);
      case 'TRAILSTOP': return parseTrailStop();
      case 'IF': return parseIf();
      case 'LOOP': return parseLoop('LOOP');
      case 'WHILE': return parseLoop('WHILE');
      case 'TRY': return parseTryCatch();
      case 'ERROR': return parseError();
      case 'WAIT': return parseWait();
      case 'INCLUDE': return parseInclude();
      case 'OPTIMIZE': return parseOptimize();
      case 'AI_QUERY': return parseAIQueryStmt();
      case 'AI_GENERATE_SCRIPT': return parseAIGenerate();
      case 'ANALYZE_LOG': return parseAnalyzeLogStmt();
      case 'RUN_ML': return parseRunMLStmt();
      case 'CLAW_WEB': return parseClawWebStmt();
      case 'CLAW_X': return parseClawXStmt();
      case 'CLAW_PDF': return parseClawPdfStmt();
      case 'CLAW_IMAGE': return parseClawImageStmt();
      case 'CLAW_VIDEO': return parseClawVideoStmt();
      case 'CLAW_IMAGE_VIEW': return parseClawImageViewStmt();
      case 'CLAW_CONVERSATION': return parseClawConvStmt();
      case 'CLAW_TOOL': return parseClawToolStmt();
      case 'CLAW_CODE': return parseClawCodeStmt();
      case 'SPAWN_AGENT': return parseSpawnAgent();
      case 'CALL_SESSION': return parseCallSessionStmt();
      case 'MUTATE_CONFIG': return parseMutateConfig();
      case 'ALERT': return parseAlert();
      case 'SAY_TO_SESSION': return parseSayToSession();
      case 'WAIT_FOR_REPLY': return parseWaitForReplyStmt();
      case 'STORE_VAR': return parseStoreVar();
      case 'LOAD_VAR': return parseLoadVarStmt();
      case 'CRASH_SCAN': return parseCrashScan();
      case 'MARKET_NOMAD': return parseMarketNomad();
      case 'NOMAD_SCAN': return parseNomadScanStmt();
      case 'NOMAD_ALLOCATE': return parseNomadAllocate();
      case 'RUMOR_SCAN': return parseRumorScanStmt();
      case 'CHAIN': return parseChain();
      case 'INDICATOR': return parseIndicatorStmt();
      default:
        if (t.type === TOKEN_TYPES.IDENTIFIER) {
          if (peek() && peek().value === '=') return parseAssignment();
          if (peek() && peek().value === '(') return parseFuncCallStmt();
          eat();
          return { type: 'ExpressionStatement', expr: { type: 'Identifier', value: t.value } };
        }
        eat();
        return null;
    }
  }

  function parseVarDecl(isDef) {
    eat();
    var name = eat().value;
    if (current() && current().value === '=') eat();
    var val = parseCommandOrExpr();
    variables[name] = true;
    return { type: 'VarDecl', name: name, value: val, isDef: isDef };
  }

  function parseAssignment() {
    var name = eat().value;
    eat();
    var val = parseExpr();
    return { type: 'Assignment', name: name, value: val };
  }

  function parseCommandOrExpr() {
    var t = current();
    if (!t) return { type: 'NullLiteral' };
    var v = String(t.value).toUpperCase();
    switch(v) {
      case 'AI_QUERY': return parseAIQueryExpr();
      case 'ANALYZE_LOG': return parseAnalyzeLogExpr();
      case 'RUN_ML': return parseRunMLExpr();
      case 'CLAW_WEB': return parseClawWebExpr();
      case 'CLAW_X': return parseClawXExpr();
      case 'CLAW_PDF': return parseClawPdfExpr();
      case 'CLAW_IMAGE': return parseClawImageExpr();
      case 'CLAW_VIDEO': return parseClawVideoExpr();
      case 'CLAW_CONVERSATION': return parseClawConvExpr();
      case 'CLAW_TOOL': return parseClawToolExpr();
      case 'CLAW_CODE': return parseClawCodeExpr();
      case 'CALL_SESSION': return parseCallSessionExpr();
      case 'WAIT_FOR_REPLY': return parseWaitForReplyExpr();
      case 'LOAD_VAR': return parseLoadVarExpr();
      case 'NOMAD_SCAN': return parseNomadScanExpr();
      case 'RUMOR_SCAN': return parseRumorScanExpr();
      case 'INDICATOR': return parseIndicatorExpr();
      default: return parseExpr();
    }
  }

  function parseExpr() { return parseOr(); }

  function parseOr() {
    var left = parseAnd();
    while (current() && (isKw('OR') || (current().value === '||'))) { eat(); left = { type: 'BinaryExpr', op: '||', left: left, right: parseAnd() }; }
    return left;
  }
  function parseAnd() {
    var left = parseNot();
    while (current() && (isKw('AND') || (current().value === '&&'))) { eat(); left = { type: 'BinaryExpr', op: '&&', left: left, right: parseNot() }; }
    return left;
  }
  function parseNot() {
    if (current() && (isKw('NOT') || current().value === '!')) { eat(); return { type: 'UnaryExpr', op: '!', expr: parseComp() }; }
    return parseComp();
  }
  function parseComp() {
    var left = parseContains();
    while (current() && ['>', '<', '>=', '<=', '==', '!='].indexOf(current().value) >= 0) {
      var op = eat().value;
      left = { type: 'BinaryExpr', op: op, left: left, right: parseContains() };
    }
    return left;
  }
  function parseContains() {
    var left = parseCrosses();
    if (current() && isKw('CONTAINS')) { eat(); left = { type: 'ContainsExpr', left: left, right: parseCrosses() }; }
    return left;
  }
  function parseCrosses() {
    var left = parseAdd();
    if (current() && isKw('CROSSES')) {
      eat();
      var dir = 'OVER';
      if (isKw('OVER') || isKw('UNDER')) { dir = eat().value.toUpperCase(); }
      left = { type: 'CrossesExpr', left: left, right: parseAdd(), direction: dir };
    }
    return left;
  }
  function parseAdd() {
    var left = parseMul();
    while (current() && ['+', '-'].indexOf(current().value) >= 0) {
      var op = eat().value;
      left = { type: 'BinaryExpr', op: op, left: left, right: parseMul() };
    }
    return left;
  }
  function parseMul() {
    var left = parseUnary();
    while (current() && ['*', '/', '%'].indexOf(current().value) >= 0) {
      var op = eat().value;
      left = { type: 'BinaryExpr', op: op, left: left, right: parseUnary() };
    }
    return left;
  }
  function parseUnary() {
    if (current() && current().value === '-') { eat(); return { type: 'UnaryExpr', op: '-', expr: parsePrimary() }; }
    return parsePrimary();
  }
  function parsePrimary() {
    var t = current();
    if (!t) return { type: 'NullLiteral' };
    if (t.type === TOKEN_TYPES.NUMBER) { eat(); return parsePostfix({ type: 'NumberLiteral', value: t.value }); }
    if (t.type === TOKEN_TYPES.STRING) { eat(); return parsePostfix({ type: 'StringLiteral', value: t.value }); }
    if (t.value === '(') { eat(); var e = parseExpr(); if (current() && current().value === ')') eat(); return parsePostfix(e); }
    if (t.value === 'true' || t.value === 'false') { eat(); return { type: 'BooleanLiteral', value: t.value === 'true' }; }
    if (t.value === 'null') { eat(); return { type: 'NullLiteral' }; }
    if (t.type === TOKEN_TYPES.IDENTIFIER || t.type === TOKEN_TYPES.KEYWORD) {
      var name = t.value;
      eat();
      if (current() && current().value === '(') {
        eat();
        var args = [];
        while (current() && current().value !== ')') {
          args.push(parseExpr());
          if (current() && current().value === ',') eat();
        }
        if (current() && current().value === ')') eat();
        return parsePostfix({ type: 'FunctionCall', name: name, args: args });
      }
      return parsePostfix({ type: 'Identifier', value: name });
    }
    eat();
    return { type: 'Unknown', value: t.value };
  }
  function parsePostfix(node) {
    while (current()) {
      if (current().value === '.') { eat(); var p = current(); if (p) { eat(); node = { type: 'MemberExpr', object: node, property: p.value }; } }
      else if (current().value === '[') { eat(); var idx = parseExpr(); if (current() && current().value === ']') eat(); node = { type: 'IndexExpr', object: node, index: idx }; }
      else break;
    }
    return node;
  }

  function parseCondUntil(stops) {
    var condTokens = [];
    var depth = 0;
    while (current()) {
      var cv = String(current().value).toUpperCase();
      if (depth === 0 && stops.indexOf(cv) >= 0) break;
      if (current().value === '(') depth++;
      if (current().value === ')') depth--;
      condTokens.push(current());
      eat();
    }
    if (condTokens.length === 0) return { type: 'BooleanLiteral', value: true };
    var savePos = pos;
    var saveTokens = tokens;
    tokens = condTokens;
    pos = 0;
    var expr = parseExpr();
    tokens = saveTokens;
    pos = savePos;
    return expr;
  }

  function parseTrade(cmd) {
    eat();
    var size = null;
    if (current() && current().type === TOKEN_TYPES.NUMBER) { size = parseExpr(); }
    else if (current() && current().type === TOKEN_TYPES.IDENTIFIER && !isOneOf(['AT','IF','STOP','LIMIT','REASON'])) { size = parseExpr(); }
    var orderType = 'MARKET';
    if (isKw('AT')) { eat(); if (isKw('MARKET')) { eat(); } else if (isKw('LIMIT')) { orderType = 'LIMIT'; eat(); } else { eat(); } }
    var condition = null;
    if (isKw('IF')) { eat(); condition = parseCondUntil(['STOP','LIMIT','REASON','ENDIF','THEN']); }
    var stop = null;
    if (isKw('STOP')) { eat(); stop = parseExpr(); }
    var limit = null;
    if (isKw('LIMIT')) { eat(); limit = parseExpr(); }
    var reason = null;
    if (isKw('REASON')) { eat(); reason = parseExpr(); }
    imports.trade = true;
    return { type: 'Trade', command: cmd, size: size, orderType: orderType, condition: condition, stop: stop, limit: limit, reason: reason };
  }

  function parseExit(cmd) {
    eat();
    var exitType = 'ALL';
    var size = null;
    if (isKw('ALL')) eat();
    else if (isKw('PART')) { eat(); exitType = 'PART'; size = parseExpr(); }
    var condition = null;
    if (isKw('IF')) { eat(); condition = parseCondUntil(['REASON']); }
    var reason = null;
    if (isKw('REASON')) { eat(); reason = parseExpr(); }
    return { type: 'Exit', exitType: exitType, size: size, condition: condition, reason: reason };
  }

  function parseTrailStop() {
    eat();
    var dist = parseExpr();
    var accel = null, max = null;
    if (isKw('ACCEL')) { eat(); accel = parseExpr(); }
    if (isKw('MAX')) { eat(); max = parseExpr(); }
    return { type: 'TrailStop', distance: dist, accel: accel, max: max };
  }

  function parseIf() {
    eat();
    var condition = parseCondUntil(['THEN']);
    if (isKw('THEN')) eat();
    var thenBody = [];
    while (current() && !isKw('ELSE') && !isKw('ENDIF')) {
      var s = parseStatement();
      if (s) thenBody.push(s);
    }
    var elseBody = [];
    if (isKw('ELSE')) {
      eat();
      if (isKw('IF')) { elseBody.push(parseIf()); }
      else { while (current() && !isKw('ENDIF')) { var s2 = parseStatement(); if (s2) elseBody.push(s2); } }
    }
    if (isKw('ENDIF')) eat();
    return { type: 'IfStatement', condition: condition, thenBody: thenBody, elseBody: elseBody };
  }

  function parseLoop(loopType) {
    eat();
    var condition, isForever = false;
    if (loopType === 'WHILE') {
      condition = parseCondUntil(['ENDWHILE']);
    } else {
      if (isKw('FOREVER')) { eat(); isForever = true; condition = { type: 'BooleanLiteral', value: true }; }
      else { var num = parseExpr(); if (isKw('TIMES')) eat(); condition = { type: 'LoopCount', num: num }; }
    }
    var body = [];
    var endKey = loopType === 'LOOP' ? 'ENDLOOP' : 'ENDWHILE';
    while (current() && !isKw(endKey)) { var s = parseStatement(); if (s) body.push(s); }
    if (isKw(endKey)) eat();
    return { type: 'Loop', loopType: loopType, condition: condition, body: body, isForever: isForever };
  }

  function parseTryCatch() {
    eat();
    var tryBody = [];
    while (current() && !isKw('CATCH')) { var s = parseStatement(); if (s) tryBody.push(s); }
    if (isKw('CATCH')) eat();
    var catchVar = current() ? eat().value : '_err';
    var catchBody = [];
    while (current() && !isKw('ENDTRY')) { var s2 = parseStatement(); if (s2) catchBody.push(s2); }
    if (isKw('ENDTRY')) eat();
    return { type: 'TryCatch', tryBody: tryBody, catchVar: catchVar, catchBody: catchBody };
  }

  function parseError() { eat(); return { type: 'ErrorThrow', message: parseExpr() }; }
  function parseWait() { eat(); return { type: 'Wait', ms: parseExpr() }; }
  function parseInclude() { eat(); return { type: 'Include', scriptName: parseExpr() }; }

  function parseOptimize() {
    eat();
    var varName = eat().value;
    var fromVal = null, toVal = null, stepVal = null, usingDays = null;
    if (isKw('FROM')) { eat(); fromVal = parseExpr(); }
    if (isKw('TO')) { eat(); toVal = parseExpr(); }
    if (isKw('STEP')) { eat(); stepVal = parseExpr(); }
    if (isKw('USING')) { eat(); usingDays = parseExpr(); }
    return { type: 'Optimize', varName: varName, fromVal: fromVal, toVal: toVal, stepVal: stepVal, usingDays: usingDays };
  }

  function parseAIQueryExpr() { eat(); var p = parseExpr(); var tool = null, arg = null; if (isKw('TOOL')) { eat(); tool = parseExpr(); } if (isKw('ARG')) { eat(); arg = parseExpr(); } imports.ai = true; return { type: 'AIQuery', prompt: p, tool: tool, arg: arg }; }
  function parseAIQueryStmt() { return parseAIQueryExpr(); }
  function parseAIGenerate() { eat(); var p = parseExpr(); var to = null; if (isKw('TO')) { eat(); to = parseExpr(); } imports.ai = true; return { type: 'AIGenerate', prompt: p, toName: to }; }
  function parseAnalyzeLogExpr() { eat(); var q = parseExpr(); var lim = null; if (isKw('LIMIT')) { eat(); lim = parseExpr(); } imports.ai = true; return { type: 'AnalyzeLog', query: q, limit: lim }; }
  function parseAnalyzeLogStmt() { return parseAnalyzeLogExpr(); }
  function parseRunMLExpr() { eat(); var m = parseExpr(); var d = null; if (isKw('ON')) { eat(); d = parseExpr(); } imports.ai = true; return { type: 'RunML', modelCode: m, dataVar: d }; }
  function parseRunMLStmt() { return parseRunMLExpr(); }
  function parseClawWebExpr() { eat(); var u = parseExpr(); var inst = null; if (isKw('INSTRUCT')) { eat(); inst = parseExpr(); } imports.data = true; return { type: 'ClawWeb', url: u, instruct: inst }; }
  function parseClawWebStmt() { return parseClawWebExpr(); }
  function parseClawXExpr() { eat(); var q = parseExpr(); var lim = null, mode = null; if (isKw('LIMIT')) { eat(); lim = parseExpr(); } if (isKw('MODE')) { eat(); mode = parseExpr(); } imports.data = true; return { type: 'ClawX', query: q, limit: lim, mode: mode }; }
  function parseClawXStmt() { return parseClawXExpr(); }
  function parseClawPdfExpr() { eat(); var f = parseExpr(); var q = null, pg = null; if (isKw('QUERY')) { eat(); q = parseExpr(); } if (isKw('PAGES')) { eat(); pg = parseExpr(); } imports.data = true; return { type: 'ClawPdf', fileName: f, query: q, pages: pg }; }
  function parseClawPdfStmt() { return parseClawPdfExpr(); }
  function parseClawImageExpr() { eat(); var d = parseExpr(); var n = null; if (isKw('NUM')) { eat(); n = parseExpr(); } imports.data = true; return { type: 'ClawImage', description: d, num: n }; }
  function parseClawImageStmt() { return parseClawImageExpr(); }
  function parseClawVideoExpr() { eat(); var u = parseExpr(); imports.data = true; return { type: 'ClawVideo', url: u }; }
  function parseClawVideoStmt() { return parseClawVideoExpr(); }
  function parseClawImageViewStmt() { eat(); var u = parseExpr(); imports.data = true; return { type: 'ClawImageView', url: u }; }
  function parseClawConvExpr() { eat(); var q = parseExpr(); imports.data = true; return { type: 'ClawConversation', query: q }; }
  function parseClawConvStmt() { return parseClawConvExpr(); }
  function parseClawToolExpr() { eat(); var tn = parseExpr(); imports.tools = true; return { type: 'ClawTool', toolName: tn, args: {} }; }
  function parseClawToolStmt() { return parseClawToolExpr(); }
  function parseClawCodeExpr() { eat(); var c = parseExpr(); imports.tools = true; return { type: 'ClawCode', code: c }; }
  function parseClawCodeStmt() { return parseClawCodeExpr(); }
  function parseSpawnAgent() { eat(); var n = parseExpr(); var p = null; if (isKw('WITH')) { eat(); p = parseExpr(); } imports.chat = true; return { type: 'SpawnAgent', name: n, prompt: p }; }
  function parseCallSessionExpr() { eat(); var a = parseExpr(); var c = parseExpr(); imports.chat = true; return { type: 'CallSession', agentName: a, command: c }; }
  function parseCallSessionStmt() { return parseCallSessionExpr(); }
  function parseMutateConfig() { eat(); var k = parseExpr(); var v = null; if (current() && current().value === '=') { eat(); v = parseExpr(); } return { type: 'MutateConfig', key: k, value: v }; }
  function parseAlert() { eat(); var m = parseExpr(); var lv = null, to = null, opts = null; if (isKw('LEVEL')) { eat(); lv = parseExpr(); } if (isKw('TO')) { eat(); to = parseExpr(); } if (isKw('OPTIONS')) { eat(); opts = parseExpr(); } imports.channels = true; return { type: 'Alert', message: m, level: lv, to: to, options: opts }; }
  function parseSayToSession() { eat(); var sid = parseExpr(); var msg = parseExpr(); imports.chat = true; return { type: 'SayToSession', sessionId: sid, message: msg }; }
  function parseWaitForReplyExpr() { eat(); var sid = parseExpr(); var to = null, f = null; if (isKw('TIMEOUT')) { eat(); to = parseExpr(); } if (isKw('FILTER')) { eat(); f = parseExpr(); } imports.chat = true; return { type: 'WaitForReply', sessionId: sid, timeout: to, filter: f }; }
  function parseWaitForReplyStmt() { return parseWaitForReplyExpr(); }
  function parseStoreVar() { eat(); var k = parseExpr(); var v = parseExpr(); var g = false; if (isKw('GLOBAL')) { eat(); g = true; } return { type: 'StoreVar', key: k, value: v, isGlobal: g }; }
  function parseLoadVarExpr() { eat(); var k = parseExpr(); var d = null; if (isKw('DEFAULT')) { eat(); d = parseExpr(); } return { type: 'LoadVar', key: k, defaultVal: d }; }
  function parseLoadVarStmt() { return parseLoadVarExpr(); }
  function parseCrashScan() { eat(); var st = 'ON'; if (isKw('ON') || isKw('OFF')) { st = eat().value.toUpperCase(); } return { type: 'CrashScan', state: st }; }
  function parseMarketNomad() { eat(); var st = 'ON'; if (isKw('ON') || isKw('OFF')) { st = eat().value.toUpperCase(); } var mi = null, si = null; if (isKw('MAX_INSTRUMENTS')) { eat(); mi = parseExpr(); } if (isKw('SCAN_INTERVAL')) { eat(); si = parseExpr(); } imports.nomad = true; return { type: 'MarketNomad', state: st, maxInstruments: mi, scanInterval: si }; }
  function parseNomadScanExpr() { eat(); var cat = parseExpr(); var lim = null; if (isKw('LIMIT')) { eat(); lim = parseExpr(); } imports.nomad = true; return { type: 'NomadScan', category: cat, limit: lim }; }
  function parseNomadScanStmt() { return parseNomadScanExpr(); }
  function parseNomadAllocate() { eat(); var tgt = null; if (isKw('TO')) { eat(); tgt = parseExpr(); } var sz = null; if (isKw('SIZING')) { eat(); sz = parseExpr(); } imports.nomad = true; return { type: 'NomadAllocate', target: tgt, sizing: sz }; }
  function parseRumorScanExpr() { eat(); var tp = parseExpr(); var src = null, lim = null, f = null; if (isKw('SOURCES')) { eat(); src = parseExpr(); } if (isKw('LIMIT')) { eat(); lim = parseExpr(); } if (isKw('FILTER')) { eat(); f = parseExpr(); } imports.tools = true; imports.ai = true; return { type: 'RumorScan', topic: tp, sources: src, limit: lim, filter: f }; }
  function parseRumorScanStmt() { return parseRumorScanExpr(); }
  function parseIndicatorExpr() { eat(); if (current() && current().value === '(') { eat(); var nm = eat().value; var params = []; while (current() && current().value === ',') { eat(); params.push(parseExpr()); } if (current() && current().value === ')') eat(); return { type: 'IndicatorCall', name: nm, params: params }; } var nm2 = current() ? eat().value : 'RSI'; return { type: 'IndicatorCall', name: nm2, params: [] }; }
  function parseIndicatorStmt() { return parseIndicatorExpr(); }
  function parseChain() { eat(); var steps = [parseExpr()]; while (current() && isKw('THEN')) { eat(); steps.push(parseExpr()); } return { type: 'Chain', steps: steps }; }
  function parseFuncDecl() {
    if (isKw('DEF_FUNC')) eat(); else if (isKw('DEF')) eat();
    var name = eat().value;
    var params = [];
    if (current() && current().value === '(') { eat(); while (current() && current().value !== ')') { params.push(eat().value); if (current() && current().value === ',') eat(); } if (current() && current().value === ')') eat(); }
    var body = [];
    while (current() && !isKw('ENDFUNC')) { var s = parseStatement(); if (s) body.push(s); }
    if (isKw('ENDFUNC')) eat();
    functions[name] = true;
    return { type: 'FunctionDecl', name: name, params: params, body: body };
  }
  function parseFuncCallStmt() { var name = eat().value; var args = []; if (current() && current().value === '(') { eat(); while (current() && current().value !== ')') { args.push(parseExpr()); if (current() && current().value === ',') eat(); } if (current() && current().value === ')') eat(); } return { type: 'FunctionCallStmt', name: name, args: args }; }

  var ast;
  try {
    ast = parseProgram();
  } catch(parseErr) {
    var tok = tokens[pos] || tokens[tokens.length - 1];
    if (tok && tok.index !== undefined) {
      parseErr._csTokenIndex = tok.index;
      var before = code.substring(0, tok.index);
      var lineNum = before.split('\n').length;
      parseErr.message = parseErr.message + ' (line ' + lineNum + ')';
    }
    throw parseErr;
  }
  var metadata = extractClawScriptMetadata(code);
  return { ast: ast, js: generateJSFromAST(ast), imports: Object.keys(imports), variables: Object.keys(variables), metadata: metadata };
}

function generateJSFromAST(ast) {
  var lines = [];
  lines.push('// Generated ClawScript Strategy');
  lines.push('// ' + new Date().toISOString());
  lines.push('');

  function genExpr(expr) {
    if (!expr) return 'null';
    switch(expr.type) {
      case 'NumberLiteral': return String(expr.value);
      case 'StringLiteral': return JSON.stringify(expr.value);
      case 'BooleanLiteral': return String(expr.value);
      case 'NullLiteral': return 'null';
      case 'Identifier': return expr.value;
      case 'BinaryExpr': return '(' + genExpr(expr.left) + ' ' + expr.op + ' ' + genExpr(expr.right) + ')';
      case 'UnaryExpr': return '(' + expr.op + genExpr(expr.expr) + ')';
      case 'ContainsExpr': return 'String(' + genExpr(expr.left) + ').includes(' + genExpr(expr.right) + ')';
      case 'CrossesExpr': return '(' + genExpr(expr.left) + (expr.direction === 'OVER' ? ' > ' : ' < ') + genExpr(expr.right) + ')';
      case 'FunctionCall':
        var fn = expr.name.toUpperCase();
        var fnArgs = expr.args.map(function(a) { return ', ' + genExpr(a); }).join('');
        var _siMap = { 'RSI':'calcRSI','EMA':'calcEMA','SMA':'calcSMA','ATR':'calcATRFromTicks','MACD':'calcMACD','BOLLINGER':'calcBollinger','ROC':'calcROC','ZSCORE':'calcZScore','FIBONACCI':'calcFibonacci','KELTNER':'calcKeltner' };
        var _fpMap = { 'ADX':'calcADXFromPrices','STOCH':'calcStochasticFromPrices','STOCHASTIC':'calcStochasticFromPrices','CCI':'calcCCIFromPrices','WILLIAMS_R':'calcWilliamsRFromPrices','PARABOLIC_SAR':'calcParabolicSARFromPrices','DONCHIAN':'calcDonchianFromPrices' };
        var _propMap = { 'BOLLINGER_UPPER':['calcBollinger','upper'],'BOLLINGER_LOWER':['calcBollinger','lower'],'STOCHASTIC_K':['calcStochasticFromPrices','k'],'STOCHASTIC_D':['calcStochasticFromPrices','d'],'AROON_UP':['calcAroonFromPrices','up'],'AROON_DOWN':['calcAroonFromPrices','down'],'ICHIMOKU_TENKAN':['calcIchimokuFromPrices','tenkanSen'],'ICHIMOKU_KIJUN':['calcIchimokuFromPrices','kijunSen'],'KELTNER_UPPER':['calcKeltner','upper'],'KELTNER_LOWER':['calcKeltner','lower'],'DONCHIAN_HIGH':['calcDonchianFromPrices','upper'],'DONCHIAN_LOW':['calcDonchianFromPrices','lower'] };
        if (_siMap[fn]) return 'indicators.' + _siMap[fn] + '(prices' + fnArgs + ')';
        if (_fpMap[fn]) return 'indicators.' + _fpMap[fn] + '(prices' + fnArgs + ')' + (fn === 'PARABOLIC_SAR' ? '.sar' : '');
        if (_propMap[fn]) return '(indicators.' + _propMap[fn][0] + '(prices' + fnArgs + ') || {}).' + _propMap[fn][1];
        if (fn === 'LAST_PRICE') return 'prices[prices.length - 1]';
        if (fn === 'VOLUME') return '0';
        if (fn === 'OBV') return 'indicators.calcOBV(prices, prices.map(function(){return 1}))';
        if (fn === 'VWAP') return 'indicators.calcVWAP(prices, prices, prices, prices.map(function(){return 1}))';
        if (fn === 'CMF') return 'indicators.calcCMF(prices, prices, prices, prices.map(function(){return 1})' + fnArgs + ')';
        if (fn === 'ULTIMATE_OSC') return 'indicators.calcUltimateOscillator(prices, prices, prices)';
        if (fn === 'CHAIKIN_VOL') return 'indicators.calcChaikinVolatility(prices, prices' + fnArgs + ')';
        if (fn === 'SUPERTREND') return 'null';
        return expr.name + '(' + expr.args.map(genExpr).join(', ') + ')';
      case 'MemberExpr': return genExpr(expr.object) + '.' + expr.property;
      case 'IndexExpr': return genExpr(expr.object) + '[' + genExpr(expr.index) + ']';
      case 'LoopCount': return genExpr(expr.num);
      default: return 'null';
    }
  }

  function genStmt(stmt, indent) {
    if (!stmt) return;
    var p = indent || '';
    switch(stmt.type) {
      case 'VarDecl': lines.push(p + (stmt.isDef ? 'const' : 'let') + ' ' + stmt.name + ' = ' + genExpr(stmt.value) + ';'); break;
      case 'Assignment': lines.push(p + stmt.name + ' = ' + genExpr(stmt.value) + ';'); break;
      case 'Trade':
        if (stmt.condition) { lines.push(p + 'if (' + genExpr(stmt.condition) + ') {'); }
        lines.push(p + '  return { signal: true, direction: "' + stmt.command + '", size: ' + (stmt.size ? genExpr(stmt.size) : '1') + ', stopDist: ' + (stmt.stop ? genExpr(stmt.stop) : '20') + ', limitDist: ' + (stmt.limit ? genExpr(stmt.limit) : '40') + ', reason: ' + (stmt.reason ? genExpr(stmt.reason) : '"Auto"') + ' };');
        if (stmt.condition) lines.push(p + '}');
        break;
      case 'Exit':
        if (stmt.condition) { lines.push(p + 'if (' + genExpr(stmt.condition) + ') {'); lines.push(p + '  return { close: true, reason: ' + (stmt.reason ? genExpr(stmt.reason) : '"Exit"') + ' };'); lines.push(p + '}'); }
        else { lines.push(p + 'return { close: true, reason: ' + (stmt.reason ? genExpr(stmt.reason) : '"Exit"') + ' };'); }
        break;
      case 'IfStatement':
        lines.push(p + 'if (' + genExpr(stmt.condition) + ') {');
        stmt.thenBody.forEach(function(s) { genStmt(s, p + '  '); });
        if (stmt.elseBody.length > 0) { lines.push(p + '} else {'); stmt.elseBody.forEach(function(s) { genStmt(s, p + '  '); }); }
        lines.push(p + '}'); break;
      case 'Loop':
        if (stmt.isForever) lines.push(p + 'while (true) {');
        else if (stmt.condition.type === 'LoopCount') lines.push(p + 'for (let i = 0; i < ' + genExpr(stmt.condition.num) + '; i++) {');
        else lines.push(p + 'while (' + genExpr(stmt.condition) + ') {');
        stmt.body.forEach(function(s) { genStmt(s, p + '  '); });
        lines.push(p + '}'); break;
      case 'TryCatch':
        lines.push(p + 'try {');
        stmt.tryBody.forEach(function(s) { genStmt(s, p + '  '); });
        lines.push(p + '} catch (' + stmt.catchVar + ') {');
        stmt.catchBody.forEach(function(s) { genStmt(s, p + '  '); });
        lines.push(p + '}'); break;
      case 'ErrorThrow': lines.push(p + 'throw new Error(' + genExpr(stmt.message) + ');'); break;
      case 'Wait': lines.push(p + 'await new Promise(r => setTimeout(r, ' + genExpr(stmt.ms) + '));'); break;
      case 'Alert': lines.push(p + 'await channels.send(' + (stmt.to ? genExpr(stmt.to) : '"default"') + ', ' + genExpr(stmt.message) + ', { level: ' + (stmt.level ? genExpr(stmt.level) : '"info"') + ' });'); break;
      case 'SayToSession': lines.push(p + 'await chat.sayToSession(' + genExpr(stmt.sessionId) + ', ' + genExpr(stmt.message) + ');'); break;
      case 'MutateConfig': lines.push(p + 'this.config[' + genExpr(stmt.key) + '] = ' + (stmt.value ? genExpr(stmt.value) : 'null') + ';'); break;
      case 'CrashScan': lines.push(p + 'this._crashScanEnabled = ' + (stmt.state === 'ON') + ';'); break;
      default: lines.push(p + '// ' + stmt.type); break;
    }
  }

  lines.push('async evaluateEntry(ticks, context) {');
  lines.push('  const prices = ticks.map(t => t.mid || t.close || 0);');
  ast.body.forEach(function(s) { genStmt(s, '  '); });
  lines.push('  return null;');
  lines.push('}');

  return lines.join('\n');
}

var NODE_COLORS = {
  'Trade': { bg: '#1b4332', border: '#2dc653', cls: 'cs-fn-trade' },
  'Exit': { bg: '#3d1a1a', border: '#f85149', cls: 'cs-fn-exit' },
  'IfStatement': { bg: '#1c2541', border: '#58a6ff', cls: 'cs-fn-if' },
  'Loop': { bg: '#3d2800', border: '#f0883e', cls: 'cs-fn-loop' },
  'AIQuery': { bg: '#2d1b4e', border: '#bc8cff', cls: 'cs-fn-ai' },
  'AIGenerate': { bg: '#2d1b4e', border: '#bc8cff', cls: 'cs-fn-ai' },
  'AnalyzeLog': { bg: '#2d1b4e', border: '#bc8cff', cls: 'cs-fn-ai' },
  'RunML': { bg: '#2d1b4e', border: '#bc8cff', cls: 'cs-fn-ai' },
  'ClawWeb': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawX': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawPdf': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawImage': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawVideo': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawConversation': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawTool': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'ClawCode': { bg: '#0c2d48', border: '#79c0ff', cls: 'cs-fn-data' },
  'SpawnAgent': { bg: '#3d2200', border: '#f0883e', cls: 'cs-fn-agent' },
  'CallSession': { bg: '#3d2200', border: '#f0883e', cls: 'cs-fn-agent' },
  'SayToSession': { bg: '#3d2200', border: '#f0883e', cls: 'cs-fn-agent' },
  'WaitForReply': { bg: '#3d2200', border: '#f0883e', cls: 'cs-fn-agent' },
  'Alert': { bg: '#3d1a1a', border: '#f85149', cls: 'cs-fn-alert' },
  'MutateConfig': { bg: '#21262d', border: '#484f58', cls: 'cs-fn-var' },
  'VarDecl': { bg: '#21262d', border: '#484f58', cls: 'cs-fn-var' },
  'Assignment': { bg: '#21262d', border: '#484f58', cls: 'cs-fn-var' },
  'TryCatch': { bg: '#1c2541', border: '#58a6ff', cls: 'cs-fn-try' },
  'ErrorThrow': { bg: '#3d1a1a', border: '#f85149', cls: 'cs-fn-alert' },
  'Wait': { bg: '#21262d', border: '#30363d', cls: 'cs-fn-default' },
  'CrashScan': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'MarketNomad': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'NomadScan': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'NomadAllocate': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'RumorScan': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'Optimize': { bg: '#2d1b00', border: '#ffa657', cls: 'cs-fn-advanced' },
  'FunctionDecl': { bg: '#21262d', border: '#ff7b72', cls: 'cs-fn-control' },
  'Chain': { bg: '#21262d', border: '#ff7b72', cls: 'cs-fn-control' }
};

function getNodeLabel(stmt) {
  switch(stmt.type) {
    case 'Trade': return stmt.command + (stmt.size ? ' ' + exprLabel(stmt.size) : '');
    case 'Exit': return 'EXIT ' + stmt.exitType;
    case 'TrailStop': return 'TRAILSTOP';
    case 'IfStatement': return 'IF ' + exprLabel(stmt.condition);
    case 'Loop':
      if (stmt.isForever) return 'LOOP FOREVER';
      if (stmt.condition.type === 'LoopCount') return 'LOOP ' + exprLabel(stmt.condition.num) + 'x';
      return 'WHILE ' + exprLabel(stmt.condition);
    case 'TryCatch': return 'TRY...CATCH';
    case 'VarDecl': return (stmt.isDef ? 'DEF' : 'SET') + ' ' + stmt.name;
    case 'Assignment': return 'SET ' + stmt.name;
    case 'AIQuery': return 'AI_QUERY';
    case 'AIGenerate': return 'AI_GENERATE';
    case 'AnalyzeLog': return 'ANALYZE_LOG';
    case 'RunML': return 'RUN_ML';
    case 'ClawWeb': return 'CLAW_WEB';
    case 'ClawX': return 'CLAW_X';
    case 'ClawPdf': return 'CLAW_PDF';
    case 'ClawImage': return 'CLAW_IMAGE';
    case 'ClawVideo': return 'CLAW_VIDEO';
    case 'ClawConversation': return 'CLAW_CONV';
    case 'ClawTool': return 'CLAW_TOOL';
    case 'ClawCode': return 'CLAW_CODE';
    case 'SpawnAgent': return 'SPAWN_AGENT';
    case 'CallSession': return 'CALL_SESSION';
    case 'SayToSession': return 'SAY_TO_SESSION';
    case 'WaitForReply': return 'WAIT_REPLY';
    case 'MutateConfig': return 'MUTATE_CONFIG';
    case 'Alert': return 'ALERT';
    case 'ErrorThrow': return 'ERROR';
    case 'Wait': return 'WAIT';
    case 'CrashScan': return 'CRASH_SCAN ' + stmt.state;
    case 'MarketNomad': return 'MARKET_NOMAD ' + stmt.state;
    case 'NomadScan': return 'NOMAD_SCAN';
    case 'NomadAllocate': return 'NOMAD_ALLOCATE';
    case 'RumorScan': return 'RUMOR_SCAN';
    case 'Optimize': return 'OPTIMIZE ' + stmt.varName;
    case 'FunctionDecl': return 'FUNC ' + stmt.name;
    case 'Chain': return 'CHAIN';
    case 'Include': return 'INCLUDE';
    default: return stmt.type;
  }
}

function exprLabel(expr) {
  if (!expr) return '?';
  switch(expr.type) {
    case 'NumberLiteral': return String(expr.value);
    case 'StringLiteral': return '"' + expr.value.substring(0, 15) + (expr.value.length > 15 ? '...' : '') + '"';
    case 'Identifier': return expr.value;
    case 'BinaryExpr': return exprLabel(expr.left) + ' ' + expr.op + ' ' + exprLabel(expr.right);
    case 'FunctionCall': return expr.name + '(' + expr.args.map(exprLabel).join(',') + ')';
    case 'MemberExpr': return exprLabel(expr.object) + '.' + expr.property;
    case 'BooleanLiteral': return String(expr.value);
    case 'LoopCount': return exprLabel(expr.num);
    default: return '...';
  }
}

function clearFlowCanvas() {
  if (window._csFlowEngine) {
    window._csFlowEngine.clear();
  }
}

function renderFlow(ast) {
  if (window._csFlowSyncLock) return;
  if (window._csFlowEngine) {
    window._csFlowEngine.fromAST(ast);
  }
}

function saveDraft() {
  var editor = document.getElementById('csCodeEditor');
  if (editor) localStorage.setItem('clawscript_draft', editor.value);
}

function loadDraft() {
  var draft = localStorage.getItem('clawscript_draft');
  var editor = document.getElementById('csCodeEditor');
  if (draft && editor) {
    editor.value = draft;
    updateLineNumbers();
    autoParse();
  }
}

function loadSavedScripts() {
  try {
    var s = localStorage.getItem('clawscript_saved');
    if (s) savedScripts = JSON.parse(s);
  } catch(e) {}
  updateLoadDropdown();
}

function updateLoadDropdown() {
  var sel = document.getElementById('csLoadSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">Load Existing...</option>';
  var keys = Object.keys(savedScripts).sort().reverse();
  for (var i = 0; i < keys.length; i++) {
    var opt = document.createElement('option');
    opt.value = keys[i];
    opt.textContent = keys[i];
    sel.appendChild(opt);
  }
}

function loadScript(name) {
  var script = savedScripts[name];
  if (!script) return;
  var editor = document.getElementById('csCodeEditor');
  if (editor) {
    editor.value = script.code;
    updateLineNumbers();
    autoParse();
    csLog('Loaded script: ' + name, 'success');
  }
}

function downloadFile(filename, content) {
  var blob = new Blob([content], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCS() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor || !editor.value.trim()) { csLog('No code to export.', 'warn'); return; }
  downloadFile('strategy.cs', editor.value);
  csLog('Exported ClawScript file.', 'success');
}

function exportJSON() {
  if (!currentAST) { csLog('No AST to export. Parse first.', 'warn'); return; }
  downloadFile('flow.json', JSON.stringify(currentAST, null, 2));
  csLog('Exported Flow JSON.', 'success');
}

function exportGenJS() {
  if (!currentJS) { csLog('No generated JS. Compile first.', 'warn'); return; }
  downloadFile('strategy.js', currentJS);
  csLog('Exported generated JavaScript.', 'success');
}

var _aiChatHistory = [];

function initAiAssistant() {
  var sendBtn = document.getElementById('csAiSendBtn');
  var input = document.getElementById('csAiInput');
  var clearBtn = document.getElementById('csAiClearBtn');
  if (!sendBtn || !input) return;

  sendBtn.addEventListener('click', function() { sendAiMessage(); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); }
  });
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      _aiChatHistory = [];
      var msgs = document.getElementById('csAiMessages');
      if (msgs) msgs.innerHTML = '<div class="cs-ai-msg cs-ai-msg-system">Chat cleared. Ask me anything about your ClawScript code.</div>';
    });
  }
}

function getEditorContext() {
  var ctx = '';
  var editor = document.getElementById('csCodeEditor');
  if (editor && editor.value.trim()) {
    var code = editor.value.trim();
    if (code.length > 2000) code = code.substring(0, 2000) + '\n... (truncated)';
    ctx += '\n\n[CURRENT CLAWSCRIPT CODE]\n' + code;
  }
  var status = document.getElementById('csParseStatus');
  if (status && status.textContent.trim()) {
    ctx += '\n\n[PARSE STATUS] ' + status.textContent.trim();
  }
  if (Object.keys(_csErrorLines).length > 0) {
    ctx += '\n\n[ERRORS]';
    for (var line in _csErrorLines) {
      ctx += '\nLine ' + line + ': ' + _csErrorLines[line];
    }
  }
  if (simLog.length > 0) {
    var recentLogs = simLog.slice(-20);
    ctx += '\n\n[RECENT OUTPUT/LOGS]';
    for (var i = 0; i < recentLogs.length; i++) {
      ctx += '\n[' + recentLogs[i].type + '] ' + recentLogs[i].msg;
    }
  }
  return ctx;
}

function appendAiMessage(role, text) {
  var msgs = document.getElementById('csAiMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'cs-ai-msg cs-ai-msg-' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function sendAiMessage() {
  var input = document.getElementById('csAiInput');
  var sendBtn = document.getElementById('csAiSendBtn');
  if (!input || !input.value.trim()) return;

  var userMsg = input.value.trim();
  input.value = '';
  appendAiMessage('user', userMsg);

  var contextMsg = getEditorContext();
  var fullPrompt = 'You are a ClawScript coding assistant for IG trading strategies. ' +
    'ClawScript is a DSL that compiles to JavaScript. ' +
    'Help the user fix errors, improve their strategy code, and answer syntax questions. ' +
    'Keep responses concise and actionable.' + contextMsg +
    '\n\nUser question: ' + userMsg;

  _aiChatHistory.push({ role: 'user', content: fullPrompt });

  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '...'; }

  var loadingDiv = document.createElement('div');
  loadingDiv.className = 'cs-ai-msg cs-ai-msg-system';
  loadingDiv.textContent = 'Thinking...';
  loadingDiv.id = 'csAiLoading';
  var msgs = document.getElementById('csAiMessages');
  if (msgs) { msgs.appendChild(loadingDiv); msgs.scrollTop = msgs.scrollHeight; }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/agent/chat', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  var _csToken = null;
  try {
    var stored = localStorage.getItem('openclaw.control.settings.v1');
    if (stored) { var s = JSON.parse(stored); _csToken = s.token || null; }
  } catch(_e) {}
  if (!_csToken) {
    var cm = document.cookie.match(/openclaw_token=([^;]+)/);
    if (cm) _csToken = cm[1];
  }
  if (_csToken) xhr.setRequestHeader('Authorization', 'Bearer ' + _csToken);
  xhr.onload = function() {
    var loading = document.getElementById('csAiLoading');
    if (loading) loading.remove();
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send'; }
    try {
      var data = JSON.parse(xhr.responseText);
      var reply = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        reply = data.choices[0].message.content;
      } else if (data.error) {
        reply = 'Error: ' + data.error;
      } else {
        reply = xhr.responseText.substring(0, 500);
      }
      _aiChatHistory.push({ role: 'assistant', content: reply });
      appendAiMessage('assistant', reply);
    } catch (e) {
      appendAiMessage('assistant', 'Error: ' + e.message);
    }
  };
  xhr.onerror = function() {
    var loading = document.getElementById('csAiLoading');
    if (loading) loading.remove();
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send'; }
    appendAiMessage('assistant', 'Network error. Make sure the agent is running.');
  };
  xhr.send(JSON.stringify({ messages: _aiChatHistory }));
}

if (document.getElementById('csEditorRoot')) {
  buildEditorUI();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('csEditorRoot')) buildEditorUI();
  });
}

})();
