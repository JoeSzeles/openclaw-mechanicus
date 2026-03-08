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
  '.cs-code-pane { position:relative; background:#0d1117; border:1px solid #30363d; border-radius:6px; overflow:hidden; display:flex; flex-direction:column; }' +
  '.cs-code-header { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:#161b22; border-bottom:1px solid #21262d; font-size:12px; color:#8b949e; }' +
  '.cs-editor-wrap { display:flex; flex:1; overflow:auto; }' +
  '.cs-line-numbers { padding:8px 8px 8px 4px; text-align:right; color:#484f58; font:12px/1.6 "Fira Code",monospace; user-select:none; background:#0d1117; border-right:1px solid #21262d; min-width:32px; }' +
  '.cs-editor { flex:1; padding:8px; font:12px/1.6 "Fira Code",monospace; color:#c9d1d9; background:#0d1117; border:none; outline:none; resize:none; tab-size:2; white-space:pre; overflow:auto; }' +
  '.cs-highlight-layer { position:absolute; top:0; left:0; right:0; bottom:0; padding:8px; font:12px/1.6 "Fira Code",monospace; pointer-events:none; white-space:pre; overflow:hidden; color:transparent; }' +
  '.cs-flow-pane { background:#0d1117; border:1px solid #30363d; border-radius:6px; overflow:hidden; display:flex; flex-direction:column; }' +
  '.cs-flow-canvas { flex:1; position:relative; overflow:hidden; min-height:400px; }' +
  '.cf-toolbar { display:flex; gap:4px; padding:4px 8px; align-items:center; background:#161b22; border-bottom:1px solid #21262d; flex-wrap:wrap; }' +
  '.cf-tb-btn { padding:3px 8px; border-radius:3px; font-size:11px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; white-space:nowrap; }' +
  '.cf-tb-btn:hover { border-color:#58a6ff; color:#fff; }' +
  '.cf-tb-del { color:#f85149; }' +
  '.cf-tb-del:hover { border-color:#f85149; background:#3d1a1a; }' +
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
  '.cf-port-label { position:absolute; bottom:-20px; font-size:8px; color:#8b949e; white-space:nowrap; text-align:center; width:24px; pointer-events:none; }' +
  '.cf-conn { cursor:pointer; pointer-events:stroke; }' +
  '.cf-conn:hover { stroke-width:3!important; filter:brightness(1.4); }' +
  '.cs-logs-pane { margin-top:8px; background:#0d1117; border:1px solid #30363d; border-radius:6px; max-height:200px; overflow:auto; }' +
  '.cs-logs-header { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:#161b22; border-bottom:1px solid #21262d; font-size:12px; color:#8b949e; }' +
  '.cs-logs-header button { padding:2px 8px; border-radius:3px; font-size:11px; cursor:pointer; border:1px solid #30363d; background:#21262d; color:#c9d1d9; }' +
  '#csLogOutput { padding:6px 10px; font:11px/1.5 "Fira Code",monospace; }' +
  '.cs-log-line { margin:1px 0; }' +
  '.cs-log-info { color:#8b949e; }' +
  '.cs-log-success { color:#2dc653; }' +
  '.cs-log-error { color:#f85149; }' +
  '.cs-log-warn { color:#f0883e; }' +
  '.cs-log-trace { color:#79c0ff; }' +
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
  '@media (max-width:768px) { .cs-main { grid-template-columns:1fr !important; } .cs-flow-pane { min-height:300px; } }' +
  '</style>' +

  '<div class="cs-toolbar">' +
    '<button id="csBtnNew" title="New Script">New Script</button>' +
    '<button id="csBtnPaste" title="Paste Code">Paste Code</button>' +
    '<button id="csBtnCompile" title="Compile & Save">Compile & Save</button>' +
    '<button id="csBtnSimulate" title="Run Simulation">Run Simulation</button>' +
    '<div class="cs-sep"></div>' +
    '<select id="csLoadSelect"><option value="">Load Existing...</option></select>' +
    '<div class="cs-sep"></div>' +
    '<button id="csBtnModeCode" title="Code Only">Code</button>' +
    '<button id="csBtnModeSplit" class="cs-active" title="Split View">Split</button>' +
    '<button id="csBtnModeFlow" title="Flow Only">Flow</button>' +
    '<div class="cs-sep"></div>' +
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

  '<div class="cs-logs-pane">' +
    '<div class="cs-logs-header"><span>Output / Logs</span><button id="csBtnClearLog">Clear</button></div>' +
    '<div id="csLogOutput"></div>' +
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
  document.getElementById('csBtnClearLog').addEventListener('click', clearLog);
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
}

function updateLineNumbers() {
  var editor = document.getElementById('csCodeEditor');
  var ln = document.getElementById('csLineNumbers');
  if (!editor || !ln) return;
  var lines = editor.value.split('\n').length;
  var nums = [];
  for (var i = 1; i <= lines; i++) nums.push(i);
  ln.textContent = nums.join('\n');
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

function autoParse() {
  var editor = document.getElementById('csCodeEditor');
  var status = document.getElementById('csParseStatus');
  if (!editor || !status) return;
  var code = editor.value.trim();
  if (!code) {
    status.textContent = '';
    currentAST = null;
    clearFlowCanvas();
    return;
  }
  try {
    var result = parseClawScript(code);
    currentAST = result.ast;
    currentJS = result.js;
    status.innerHTML = '<span style="color:#2dc653">Parsed OK (' + result.ast.body.length + ' statements)</span>';
    renderFlow(result.ast);
  } catch(e) {
    status.innerHTML = '<span style="color:#f85149">Parse Error: ' + escapeHtml(e.message) + '</span>';
    currentAST = null;
    currentJS = '';
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

    var name = 'custom_' + Date.now();
    savedScripts[name] = { code: code, js: result.js, ast: result.ast, date: new Date().toISOString() };
    localStorage.setItem('clawscript_saved', JSON.stringify(savedScripts));
    updateLoadDropdown();
    csLog('Strategy saved as: ' + name, 'success');
    renderFlow(result.ast);
  } catch(e) {
    csLog('Compile Error: ' + e.message, 'error');
  }
}

function runSimulation() {
  var editor = document.getElementById('csCodeEditor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) { csLog('No code to simulate.', 'warn'); return; }

  clearLog();
  csLog('=== SIMULATION START ===', 'info');

  try {
    var result = parseClawScript(code);
    currentAST = result.ast;
    csLog('Parsed ' + result.ast.body.length + ' statements', 'success');

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

    simulateAST(result.ast, mockTicks);

    csLog('=== SIMULATION COMPLETE ===', 'success');
    renderFlow(result.ast);
  } catch(e) {
    csLog('Simulation Error: ' + e.message, 'error');
  }
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
        if (iname === 'ATR') return mockATR(ticks, iparams[0] || 14);
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

  var ast = parseProgram();
  return { ast: ast, js: generateJSFromAST(ast), imports: Object.keys(imports), variables: Object.keys(variables) };
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
        if (['RSI','EMA','SMA','ATR','MACD','BOLLINGER','ADX','STOCH','CCI','OBV','VWAP','ROC'].indexOf(fn) >= 0) {
          return 'indicators.calc' + fn + '(prices' + expr.args.map(function(a) { return ', ' + genExpr(a); }).join('') + ')';
        }
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

if (document.getElementById('csEditorRoot')) {
  buildEditorUI();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('csEditorRoot')) buildEditorUI();
  });
}

})();
