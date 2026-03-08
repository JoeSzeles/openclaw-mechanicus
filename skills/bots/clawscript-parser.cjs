const fs = require('fs');
const path = require('path');

const TOKEN_TYPES = {
  KEYWORD: 'keyword',
  IDENTIFIER: 'identifier',
  STRING: 'string',
  NUMBER: 'number',
  OPERATOR: 'operator',
  PUNCTUATION: 'punctuation',
  COMMENT: 'comment'
};

const KEYWORDS = new Set([
  'DEF', 'SET', 'BUY', 'SELL', 'SELLSHORT', 'EXIT', 'CLOSE', 'TRAILSTOP',
  'IF', 'THEN', 'ELSE', 'ENDIF', 'LOOP', 'WHILE', 'ENDLOOP', 'ENDWHILE',
  'TIMES', 'FOREVER', 'AT', 'MARKET', 'LIMIT', 'STOP', 'REASON',
  'AI_QUERY', 'AI_GENERATE_SCRIPT', 'ANALYZE_LOG', 'RUN_ML',
  'CLAW_WEB', 'CLAW_X', 'CLAW_PDF', 'CLAW_IMAGE', 'CLAW_VIDEO',
  'CLAW_IMAGE_VIEW', 'CLAW_CONVERSATION', 'CLAW_TOOL', 'CLAW_CODE',
  'SPAWN_AGENT', 'CALL_SESSION', 'MUTATE_CONFIG', 'ALERT',
  'SAY_TO_SESSION', 'WAIT_FOR_REPLY',
  'STORE_VAR', 'LOAD_VAR', 'WAIT', 'TRY', 'CATCH', 'ENDTRY',
  'ERROR', 'INCLUDE', 'OPTIMIZE', 'INDICATOR',
  'CRASH_SCAN', 'MARKET_NOMAD', 'NOMAD_SCAN', 'NOMAD_ALLOCATE', 'RUMOR_SCAN',
  'DEF_FUNC', 'ENDFUNC', 'CHAIN',
  'AND', 'OR', 'NOT', 'CONTAINS', 'CROSSES', 'OVER', 'UNDER',
  'TOOL', 'ARG', 'INSTRUCT', 'MODE', 'QUERY', 'PAGES', 'NUM',
  'WITH', 'TO', 'LEVEL', 'OPTIONS', 'TIMEOUT', 'FILTER',
  'SOURCES', 'ON', 'OFF', 'GLOBAL', 'DEFAULT', 'PART', 'ALL',
  'ACCEL', 'MAX', 'FROM', 'STEP', 'USING', 'SIZING',
  'WAIT_TIMEOUT', 'WEIGHTS', 'CRITERIA', 'REBALANCE',
  'GENERATIONS', 'MUTATE', 'FITNESS', 'HORIZON',
  'MAX_INSTRUMENTS', 'SCAN_INTERVAL', 'DRAW', 'DOWN', 'PROFIT',
  'CODE', 'URL', 'INSTRUCTIONS',
  'STRATEGY_ENTRY', 'STRATEGY_EXIT', 'STRATEGY_CLOSE',
  'INPUT_INT', 'INPUT_FLOAT', 'INPUT_BOOL', 'INPUT_SYMBOL',
  'TIMEFRAME_PERIOD', 'TIMEFRAME_IS_DAILY',
  'ARRAY_NEW', 'ARRAY_PUSH', 'MATRIX_NEW', 'MATRIX_SET',
  'FETCH_HISTORICAL', 'FETCH_MEMBERS', 'GROUP_MEMBERS',
  'ECON_DATA', 'ESTIMATE',
  'TIME_IN_MARKET', 'TIME_SINCE_EVENT', 'SCHEDULE', 'WAIT_UNTIL',
  'MARKET_SCAN', 'PORTFOLIO_BUILD', 'PORTFOLIO_REBALANCE',
  'ECON_INDICATOR', 'FISCAL_FLOW', 'ELECTION_IMPACT',
  'CURRENCY_CARRY', 'POLICY_SENTIMENT', 'SANCTION_IMPACT', 'VOTE_PREDICT',
  'MATH_MODEL', 'RISK_MODEL', 'MONTE_CARLO',
  'TASK_SCHEDULE', 'FILE_PARSE', 'WEATHER_IMPACT',
  'UNIT', 'REPEAT', 'COUNTRY', 'DATE', 'WINDOW', 'REGION',
  'COMMODITY', 'POLL_SOURCE', 'SOLVE', 'PARAMS', 'CONFIDENCE',
  'RUNS', 'EVERY', 'RUN', 'FORMAT', 'DAYS', 'DIRECTION',
  'MAX_RISK', 'THRESHOLD', 'ROWS', 'COLS',
  'PRT_IF', 'PRT_THEN', 'PRT_ELSE', 'PRT_ENDIF',
  'PRT_BUY', 'PRT_SELL',
  'PRT_AVERAGE', 'PRT_RSI', 'PRT_MACD', 'PRT_BOLLINGER',
  'PRT_STOCHASTIC', 'PRT_ATR', 'PRT_CCI', 'PRT_ADX',
  'PRT_DONCHIAN', 'PRT_ICHIMOKU', 'PRT_KELTNERCHANNEL',
  'PRT_PARABOLICSAR', 'PRT_SUPERTREND',
  'PRT_VOLUMEBYPRICE', 'PRT_FIBONACCI', 'PRT_PIVOTPOINT', 'PRT_DEMARK',
  'PRT_WILLIAMS', 'PRT_ULTOSC', 'PRT_CHAIKIN', 'PRT_ONBALANCEVOLUME', 'PRT_VWAP',
  'PRT_ALERT', 'PRT_OPTIMIZE', 'PRT_OPTIMISE', 'PRT_TIMEFRAME',
  'PRT_BARINDEX', 'PRT_DATE', 'PRT_TIME',
  'PRT_CUM', 'PRT_HIGHEST', 'PRT_LOWEST', 'PRT_SUM', 'PRT_STD',
  'PRT_CORRELATION', 'PRT_REGRESSION',
  'PRT_DEFPARAM', 'PRT_RETURN',
  'PRT_DRAWLINE', 'PRT_DRAWARROW', 'PRT_HISTOGRAM',
  'PRT_CROSS', 'PRT_BARSSINCE', 'PRT_SUMMATION',
  'PRT_KELTNERCHANNEL', 'PRT_PARABOLICSAR',
  'SHARES', 'CONTRACTS', 'BAR'
]);

const GENERIC_CMD_DEFS = {
  'TIME_IN_MARKET':       { type: 'GenericCmd', args: 1, optKw: ['UNIT'], imp: 'ext' },
  'TIME_SINCE_EVENT':     { type: 'GenericCmd', args: 1, optKw: ['UNIT'], imp: 'ext' },
  'SCHEDULE':             { type: 'GenericCmd', args: 1, optKw: ['AT', 'REPEAT'], imp: 'ext' },
  'WAIT_UNTIL':           { type: 'GenericCmd', args: 1, optKw: ['TIMEOUT'], imp: 'ext' },
  'MARKET_SCAN':          { type: 'GenericCmd', args: 1, optKw: ['CRITERIA', 'LIMIT'], imp: 'ext' },
  'PORTFOLIO_BUILD':      { type: 'GenericCmd', args: 0, optKw: ['FROM', 'NUM', 'SIZING', 'MAX_RISK'], imp: 'ext' },
  'PORTFOLIO_REBALANCE':  { type: 'GenericCmd', args: 0, optKw: ['THRESHOLD'], imp: 'ext' },
  'ECON_DATA':            { type: 'GenericCmd', args: 1, optKw: ['COUNTRY', 'DATE'], imp: 'ext' },
  'ECON_INDICATOR':       { type: 'GenericCmd', args: 1, optKw: ['COUNTRY', 'DATE'], imp: 'ext' },
  'ESTIMATE':             { type: 'GenericCmd', args: 2, optKw: [], imp: 'ext' },
  'FETCH_HISTORICAL':     { type: 'GenericCmd', args: 1, optKw: ['FROM', 'TO'], imp: 'ext' },
  'FETCH_MEMBERS':        { type: 'GenericCmd', args: 1, optKw: [], imp: 'ext' },
  'GROUP_MEMBERS':        { type: 'GenericCmd', args: 1, optKw: [], imp: 'ext' },
  'FISCAL_FLOW':          { type: 'GenericCmd', args: 1, optKw: ['WINDOW'], imp: 'ext' },
  'ELECTION_IMPACT':      { type: 'GenericCmd', args: 1, optKw: ['REGION'], imp: 'ext' },
  'CURRENCY_CARRY':       { type: 'GenericCmd', args: 1, optKw: [], imp: 'ext' },
  'POLICY_SENTIMENT':     { type: 'GenericCmd', args: 1, optKw: ['COUNTRY'], imp: 'ext' },
  'SANCTION_IMPACT':      { type: 'GenericCmd', args: 1, optKw: ['COMMODITY'], imp: 'ext' },
  'VOTE_PREDICT':         { type: 'GenericCmd', args: 1, optKw: ['POLL_SOURCE'], imp: 'ext' },
  'MATH_MODEL':           { type: 'GenericCmd', args: 1, optKw: ['SOLVE', 'PARAMS'], imp: 'ext' },
  'RISK_MODEL':           { type: 'GenericCmd', args: 1, optKw: ['CONFIDENCE', 'WINDOW'], imp: 'ext' },
  'MONTE_CARLO':          { type: 'GenericCmd', args: 1, optKw: ['RUNS'], imp: 'ext' },
  'TASK_SCHEDULE':        { type: 'GenericCmd', args: 1, optKw: ['EVERY', 'RUN'], imp: 'ext' },
  'FILE_PARSE':           { type: 'GenericCmd', args: 1, optKw: ['FORMAT'], imp: 'ext' },
  'WEATHER_IMPACT':       { type: 'GenericCmd', args: 1, optKw: ['DAYS'], imp: 'ext' },
  'STRATEGY_ENTRY':       { type: 'GenericCmd', args: 1, optKw: ['DIRECTION', 'SIZING', 'STOP', 'LIMIT'], imp: 'ext' },
  'STRATEGY_EXIT':        { type: 'GenericCmd', args: 1, optKw: ['REASON'], imp: 'ext' },
  'STRATEGY_CLOSE':       { type: 'GenericCmd', args: 0, optKw: ['REASON'], imp: 'ext' },
  'INPUT_INT':            { type: 'GenericCmd', args: 1, optKw: ['DEFAULT'], imp: 'ext' },
  'INPUT_FLOAT':          { type: 'GenericCmd', args: 1, optKw: ['DEFAULT'], imp: 'ext' },
  'INPUT_BOOL':           { type: 'GenericCmd', args: 1, optKw: ['DEFAULT'], imp: 'ext' },
  'INPUT_SYMBOL':         { type: 'GenericCmd', args: 1, optKw: ['DEFAULT'], imp: 'ext' },
  'TIMEFRAME_PERIOD':     { type: 'GenericCmd', args: 0, optKw: [], imp: 'ext' },
  'TIMEFRAME_IS_DAILY':   { type: 'GenericCmd', args: 0, optKw: [], imp: 'ext' },
  'ARRAY_NEW':            { type: 'GenericCmd', args: 0, optKw: [], imp: 'ext' },
  'ARRAY_PUSH':           { type: 'GenericCmd', args: 2, optKw: [], imp: 'ext' },
  'MATRIX_NEW':           { type: 'GenericCmd', args: 2, optKw: [], imp: 'ext' },
  'MATRIX_SET':           { type: 'GenericCmd', args: 4, optKw: [], imp: 'ext' },
};

const PRT_STMT_ALIASES = {
  'PRT_IF': 'IF', 'PRT_THEN': 'THEN', 'PRT_ELSE': 'ELSE', 'PRT_ENDIF': 'ENDIF',
  'PRT_BUY': 'BUY', 'PRT_SELL': 'SELL',
  'PRT_ALERT': 'ALERT',
  'PRT_OPTIMIZE': 'OPTIMIZE', 'PRT_OPTIMISE': 'OPTIMIZE',
};

const PRT_INDICATOR_CMDS = new Set([
  'PRT_AVERAGE', 'PRT_RSI', 'PRT_MACD', 'PRT_BOLLINGER',
  'PRT_STOCHASTIC', 'PRT_ATR', 'PRT_CCI', 'PRT_ADX',
  'PRT_DONCHIAN', 'PRT_ICHIMOKU', 'PRT_KELTNERCHANNEL',
  'PRT_PARABOLICSAR', 'PRT_SUPERTREND',
  'PRT_VOLUMEBYPRICE', 'PRT_FIBONACCI', 'PRT_PIVOTPOINT', 'PRT_DEMARK',
  'PRT_WILLIAMS', 'PRT_ULTOSC', 'PRT_CHAIKIN', 'PRT_ONBALANCEVOLUME', 'PRT_VWAP',
  'PRT_CUM', 'PRT_HIGHEST', 'PRT_LOWEST', 'PRT_SUM', 'PRT_STD',
  'PRT_CORRELATION', 'PRT_REGRESSION', 'PRT_SUMMATION', 'PRT_HISTOGRAM',
  'PRT_CROSS', 'PRT_BARSSINCE',
]);

const PRT_NOARG_CMDS = new Set([
  'PRT_BARINDEX', 'PRT_DATE', 'PRT_TIME',
]);

function lexer(code, opts) {
  const tokens = [];
  const comments = [];
  const regex = /\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+\.?\d*|[a-zA-Z_]\w*|[=><!]=|&&|\|\||[+\-*/%<>=!&|]|[(){}[\];,.:]/g;
  let match;
  while ((match = regex.exec(code))) {
    let value = match[0];
    let type;
    const offset = match.index;
    const line = code.substring(0, offset).split('\n').length;
    if (value.startsWith('//') || value.startsWith('/*')) {
      type = TOKEN_TYPES.COMMENT;
      const text = value.startsWith('//') ? value.slice(2).trim() : value.slice(2, -2).trim();
      comments.push({ line, text, offset });
    } else if (value.startsWith('"') || value.startsWith("'")) {
      type = TOKEN_TYPES.STRING;
      value = value.slice(1, -1);
    } else if (/^\d/.test(value)) {
      type = TOKEN_TYPES.NUMBER;
      value = parseFloat(value);
    } else if (/^[a-zA-Z_]/.test(value)) {
      if (KEYWORDS.has(value.toUpperCase())) {
        type = TOKEN_TYPES.KEYWORD;
        value = value.toUpperCase();
      } else {
        type = TOKEN_TYPES.IDENTIFIER;
      }
    } else if (/[=><!&|+\-*/%]/.test(value)) {
      type = TOKEN_TYPES.OPERATOR;
    } else {
      type = TOKEN_TYPES.PUNCTUATION;
    }
    if (type !== TOKEN_TYPES.COMMENT) {
      tokens.push({ type, value, line });
    }
  }
  tokens._comments = comments;
  return tokens;
}

function extractMetadata(code) {
  const lines = code.split('\n');
  const inputs = [];
  const defs = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    const inlineCommentMatch = trimmed.match(/\/\/\s*(.+)$/);
    const inlineComment = inlineCommentMatch ? inlineCommentMatch[1].trim() : '';
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const prevComment = prevLine.startsWith('//') ? prevLine.slice(2).trim() : '';
    const comment = inlineComment || prevComment;

    const inputMatch = trimmed.match(/^(INPUT_INT|INPUT_FLOAT|INPUT_BOOL|INPUT_SYMBOL)\s+(\w+)(?:\s+DEFAULT\s+(.+?))?(?:\s*\/\/|$)/i);
    if (inputMatch) {
      const cmd = inputMatch[1].toUpperCase();
      const varName = inputMatch[2];
      let defaultVal = inputMatch[3] ? inputMatch[3].trim() : null;
      let schemaType = 'number';
      if (cmd === 'INPUT_BOOL') schemaType = 'boolean';
      else if (cmd === 'INPUT_SYMBOL') schemaType = 'string';
      else if (cmd === 'INPUT_INT') schemaType = 'number';
      else if (cmd === 'INPUT_FLOAT') schemaType = 'number';

      let parsedDefault = defaultVal;
      if (defaultVal !== null) {
        if (schemaType === 'number') parsedDefault = parseFloat(defaultVal) || 0;
        else if (schemaType === 'boolean') parsedDefault = defaultVal === 'true';
        else parsedDefault = defaultVal.replace(/^["']|["']$/g, '');
      }

      inputs.push({
        key: varName,
        type: schemaType,
        inputCmd: cmd,
        default: parsedDefault,
        label: comment || varName,
        tooltip: comment || '',
        line: lineNum
      });
      continue;
    }

    const defMatch = trimmed.match(/^DEF\s+(\w+)\s*=\s*(.+?)(?:\s*\/\/|$)/i);
    if (defMatch) {
      const varName = defMatch[1];
      let rawVal = defMatch[2].trim();
      let schemaType = 'string';
      let parsedVal = rawVal;

      if (/^\d+$/.test(rawVal)) { schemaType = 'number'; parsedVal = parseInt(rawVal, 10); }
      else if (/^\d+\.\d+$/.test(rawVal)) { schemaType = 'number'; parsedVal = parseFloat(rawVal); }
      else if (rawVal === 'true' || rawVal === 'false') { schemaType = 'boolean'; parsedVal = rawVal === 'true'; }
      else { parsedVal = rawVal.replace(/^["']|["']$/g, ''); }

      defs.push({
        key: varName,
        type: schemaType,
        default: parsedVal,
        label: comment || varName,
        tooltip: comment || '',
        line: lineNum
      });
    }
  }

  return { inputs, defs };
}

class ClawScriptParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.ast = { type: 'Program', body: [] };
    this.variables = new Map();
    this.imports = new Set(['indicators']);
    this.functions = new Map();
  }

  current() {
    return this.tokens[this.pos] || null;
  }

  peek(offset = 1) {
    return this.tokens[this.pos + offset] || null;
  }

  eat(type) {
    const token = this.current();
    if (!token) throw new Error(`Parse Error: Expected ${type}, got EOF at position ${this.pos}`);
    if (token.type !== type && !(type === TOKEN_TYPES.KEYWORD && token.type === TOKEN_TYPES.IDENTIFIER && KEYWORDS.has(token.value.toUpperCase()))) {
      throw new Error(`Parse Error: Expected ${type}, got ${token.type}('${token.value}') at position ${this.pos}`);
    }
    this.pos++;
    return token;
  }

  eatKeyword(expected) {
    const token = this.current();
    if (!token) throw new Error(`Parse Error: Expected '${expected}', got EOF at position ${this.pos}`);
    const val = (token.value || '').toString().toUpperCase();
    if (val !== expected.toUpperCase()) {
      throw new Error(`Parse Error: Expected '${expected}', got '${token.value}' at position ${this.pos}`);
    }
    this.pos++;
    return token;
  }

  isCurrentKeyword(keyword) {
    const t = this.current();
    if (!t) return false;
    return t.value.toString().toUpperCase() === keyword.toUpperCase();
  }

  isCurrentOneOf(keywords) {
    const t = this.current();
    if (!t) return false;
    const val = t.value.toString().toUpperCase();
    return keywords.some(k => k.toUpperCase() === val);
  }

  isAtEnd() {
    return this.pos >= this.tokens.length;
  }

  parse() {
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) this.ast.body.push(stmt);
    }
    return this.ast;
  }

  parseStatement() {
    const token = this.current();
    if (!token) return null;

    const val = token.value.toString().toUpperCase();

    switch (val) {
      case 'DEF': {
        const next = this.peek();
        if (next && next.value.toString().toUpperCase() === 'DEF_FUNC') {
          return this.parseFunctionDecl();
        }
        return this.parseVarDeclaration(true);
      }
      case 'DEF_FUNC':
        return this.parseFunctionDecl();
      case 'SET':
        return this.parseVarDeclaration(false);
      case 'BUY':
      case 'SELL':
      case 'SELLSHORT':
        return this.parseTradeCommand(val);
      case 'EXIT':
      case 'CLOSE':
        return this.parseExitCommand(val);
      case 'TRAILSTOP':
        return this.parseTrailStop();
      case 'IF':
        return this.parseIfStatement();
      case 'LOOP':
        return this.parseLoop('LOOP');
      case 'WHILE':
        return this.parseLoop('WHILE');
      case 'AI_QUERY':
        return this.parseAIQuery(false);
      case 'AI_GENERATE_SCRIPT':
        return this.parseAIGenerate();
      case 'ANALYZE_LOG':
        return this.parseAnalyzeLog(false);
      case 'RUN_ML':
        return this.parseRunML(false);
      case 'CLAW_WEB':
        return this.parseClawWeb(false);
      case 'CLAW_X':
        return this.parseClawX(false);
      case 'CLAW_PDF':
        return this.parseClawPdf(false);
      case 'CLAW_IMAGE':
        return this.parseClawImage(false);
      case 'CLAW_VIDEO':
        return this.parseClawVideo(false);
      case 'CLAW_IMAGE_VIEW':
        return this.parseClawImageView();
      case 'CLAW_CONVERSATION':
        return this.parseClawConversation(false);
      case 'CLAW_TOOL':
        return this.parseClawTool(false);
      case 'CLAW_CODE':
        return this.parseClawCode(false);
      case 'SPAWN_AGENT':
        return this.parseSpawnAgent();
      case 'CALL_SESSION':
        return this.parseCallSession(false);
      case 'MUTATE_CONFIG':
        return this.parseMutateConfig();
      case 'ALERT':
        return this.parseAlert();
      case 'SAY_TO_SESSION':
        return this.parseSayToSession();
      case 'WAIT_FOR_REPLY':
        return this.parseWaitForReply(false);
      case 'STORE_VAR':
        return this.parseStoreVar();
      case 'LOAD_VAR':
        return this.parseLoadVar(false);
      case 'WAIT':
        return this.parseWait();
      case 'TRY':
        return this.parseTryCatch();
      case 'ERROR':
        return this.parseError();
      case 'INCLUDE':
        return this.parseInclude();
      case 'OPTIMIZE':
        return this.parseOptimize();
      case 'INDICATOR':
        return this.parseIndicatorCmd(false);
      case 'CRASH_SCAN':
        return this.parseCrashScan();
      case 'MARKET_NOMAD':
        return this.parseMarketNomad();
      case 'NOMAD_SCAN':
        return this.parseNomadScan(false);
      case 'NOMAD_ALLOCATE':
        return this.parseNomadAllocate();
      case 'RUMOR_SCAN':
        return this.parseRumorScan(false);
      case 'CHAIN':
        return this.parseChain();
      case 'PRT_DEFPARAM':
        return this.parsePrtDefparam();
      case 'PRT_RETURN':
        return this.parsePrtReturn();
      case 'PRT_DRAWLINE':
      case 'PRT_DRAWARROW':
        return this.parsePrtDraw(val);
      default:
        if (GENERIC_CMD_DEFS[val]) return this.parseGenericCmd(val);
        if (PRT_STMT_ALIASES[val]) {
          token.value = PRT_STMT_ALIASES[val];
          return this.parseStatement();
        }
        if (PRT_INDICATOR_CMDS.has(val)) return this.parsePrtIndicator(val);
        if (PRT_NOARG_CMDS.has(val)) return this.parsePrtNoarg(val);
        if (token.type === TOKEN_TYPES.IDENTIFIER) {
          if (this.functions.has(token.value)) {
            return this.parseFunctionCall();
          }
          const next = this.peek();
          if (next && next.value === '=') {
            return this.parseAssignment();
          }
          if (next && next.type === TOKEN_TYPES.PUNCTUATION && next.value === '(') {
            return this.parseFunctionCall();
          }
          this.pos++;
          return { type: 'ExpressionStatement', expr: { type: 'Identifier', value: token.value } };
        }
        this.pos++;
        return null;
    }
  }

  parseVarDeclaration(isDef) {
    this.pos++; // DEF or SET
    const nameToken = this.current();
    if (!nameToken) throw new Error('Parse Error: Expected variable name after DEF/SET');
    this.pos++;
    const name = nameToken.value;

    if (this.isCurrentKeyword('=') || (this.current() && this.current().value === '=')) {
      this.pos++; // eat =
    }

    let value;
    const cur = this.current();
    const curCmd = cur ? (cur.value || '').toString().toUpperCase() : '';
    if (['AI_QUERY', 'ANALYZE_LOG', 'RUN_ML', 'CLAW_WEB', 'CLAW_X', 'CLAW_PDF',
      'CLAW_IMAGE', 'CLAW_VIDEO', 'CLAW_CONVERSATION', 'CLAW_TOOL', 'CLAW_CODE',
      'CALL_SESSION', 'WAIT_FOR_REPLY', 'LOAD_VAR', 'NOMAD_SCAN', 'RUMOR_SCAN',
      'INDICATOR'].includes(curCmd)) {
      switch (curCmd) {
        case 'AI_QUERY': value = this.parseAIQuery(true); break;
        case 'ANALYZE_LOG': value = this.parseAnalyzeLog(true); break;
        case 'RUN_ML': value = this.parseRunML(true); break;
        case 'CLAW_WEB': value = this.parseClawWeb(true); break;
        case 'CLAW_X': value = this.parseClawX(true); break;
        case 'CLAW_PDF': value = this.parseClawPdf(true); break;
        case 'CLAW_IMAGE': value = this.parseClawImage(true); break;
        case 'CLAW_VIDEO': value = this.parseClawVideo(true); break;
        case 'CLAW_CONVERSATION': value = this.parseClawConversation(true); break;
        case 'CLAW_TOOL': value = this.parseClawTool(true); break;
        case 'CLAW_CODE': value = this.parseClawCode(true); break;
        case 'CALL_SESSION': value = this.parseCallSession(true); break;
        case 'WAIT_FOR_REPLY': value = this.parseWaitForReply(true); break;
        case 'LOAD_VAR': value = this.parseLoadVar(true); break;
        case 'NOMAD_SCAN': value = this.parseNomadScan(true); break;
        case 'RUMOR_SCAN': value = this.parseRumorScan(true); break;
        case 'INDICATOR': value = this.parseIndicatorCmd(true); break;
        default: value = this.parseExpression(); break;
      }
    } else if (GENERIC_CMD_DEFS[curCmd]) {
      value = this.parseGenericCmd(curCmd);
    } else if (PRT_INDICATOR_CMDS.has(curCmd)) {
      value = this.parsePrtIndicator(curCmd);
    } else if (PRT_NOARG_CMDS.has(curCmd)) {
      value = this.parsePrtNoarg(curCmd);
    } else {
      value = this.parseExpression();
    }

    this.variables.set(name, true);
    return { type: 'VarDecl', name, value, isDef };
  }

  parseAssignment() {
    const name = this.current().value;
    this.pos++; // name
    this.pos++; // =
    const value = this.parseExpression();
    return { type: 'Assignment', name, value };
  }

  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.current() && (this.isCurrentKeyword('OR') || (this.current().value === '||'))) {
      this.pos++;
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', op: '||', left, right };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseNot();
    while (this.current() && (this.isCurrentKeyword('AND') || (this.current().value === '&&'))) {
      this.pos++;
      const right = this.parseNot();
      left = { type: 'BinaryExpr', op: '&&', left, right };
    }
    return left;
  }

  parseNot() {
    if (this.current() && (this.isCurrentKeyword('NOT') || this.current().value === '!')) {
      this.pos++;
      const expr = this.parseComparison();
      return { type: 'UnaryExpr', op: '!', expr };
    }
    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseContains();
    while (this.current() && ['>', '<', '>=', '<=', '==', '!=', '='].includes(this.current().value)) {
      let op = this.current().value;
      if (op === '=') op = '==';
      this.pos++;
      const right = this.parseContains();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseContains() {
    let left = this.parseCrosses();
    if (this.current() && this.isCurrentKeyword('CONTAINS')) {
      this.pos++;
      const right = this.parseCrosses();
      left = { type: 'ContainsExpr', left, right };
    }
    return left;
  }

  parseCrosses() {
    let left = this.parseAddSub();
    if (this.current() && this.isCurrentKeyword('CROSSES')) {
      this.pos++;
      let direction = 'OVER';
      if (this.isCurrentKeyword('OVER') || this.isCurrentKeyword('UNDER')) {
        direction = this.current().value.toString().toUpperCase();
        this.pos++;
      }
      const right = this.parseAddSub();
      left = { type: 'CrossesExpr', left, right, direction };
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.current() && ['+', '-'].includes(this.current().value)) {
      const op = this.current().value;
      this.pos++;
      const right = this.parseMulDiv();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (this.current() && ['*', '/', '%'].includes(this.current().value)) {
      const op = this.current().value;
      this.pos++;
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  parseUnary() {
    if (this.current() && this.current().value === '-') {
      this.pos++;
      const expr = this.parsePrimary();
      return { type: 'UnaryExpr', op: '-', expr };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.current();
    if (!token) throw new Error('Parse Error: Unexpected end of input');

    if (token.type === TOKEN_TYPES.NUMBER) {
      this.pos++;
      let result = { type: 'NumberLiteral', value: token.value };
      return this.parsePostfix(result);
    }

    if (token.type === TOKEN_TYPES.STRING) {
      this.pos++;
      let result = { type: 'StringLiteral', value: token.value };
      return this.parsePostfix(result);
    }

    if (token.value === '(') {
      this.pos++;
      const expr = this.parseExpression();
      if (this.current() && this.current().value === ')') this.pos++;
      return this.parsePostfix(expr);
    }

    if (token.value === 'true' || token.value === 'false') {
      this.pos++;
      return { type: 'BooleanLiteral', value: token.value === 'true' };
    }

    if (token.value === 'null' || token.value === 'nil') {
      this.pos++;
      return { type: 'NullLiteral' };
    }

    if (token.type === TOKEN_TYPES.IDENTIFIER || token.type === TOKEN_TYPES.KEYWORD) {
      const name = token.value;
      this.pos++;

      if (this.current() && this.current().value === '(') {
        this.pos++;
        const args = [];
        while (this.current() && this.current().value !== ')') {
          args.push(this.parseExpression());
          if (this.current() && this.current().value === ',') this.pos++;
        }
        if (this.current() && this.current().value === ')') this.pos++;
        let result = { type: 'FunctionCall', name, args };
        return this.parsePostfix(result);
      }

      let result = { type: 'Identifier', value: name };
      return this.parsePostfix(result);
    }

    this.pos++;
    return { type: 'Unknown', value: token.value };
  }

  parsePostfix(node) {
    while (this.current()) {
      if (this.current().value === '.') {
        this.pos++;
        const prop = this.current();
        if (prop) {
          this.pos++;
          node = { type: 'MemberExpr', object: node, property: prop.value };
        }
      } else if (this.current().value === '[') {
        this.pos++;
        const index = this.parseExpression();
        if (this.current() && this.current().value === ']') this.pos++;
        node = { type: 'IndexExpr', object: node, index };
      } else {
        break;
      }
    }
    return node;
  }

  parseTradeCommand(cmdType) {
    this.pos++; // BUY/SELL/SELLSHORT
    let size = null;
    if (this.current() && this.current().type === TOKEN_TYPES.NUMBER) {
      size = this.parseExpression();
    } else if (this.current() && this.current().type === TOKEN_TYPES.IDENTIFIER && !this.isCurrentOneOf(['AT', 'IF', 'STOP', 'LIMIT', 'REASON'])) {
      size = this.parseExpression();
    }

    let orderType = 'MARKET';
    let price = null;
    if (this.isCurrentKeyword('AT')) {
      this.pos++;
      if (this.isCurrentKeyword('MARKET')) {
        orderType = 'MARKET';
        this.pos++;
      } else if (this.isCurrentKeyword('LIMIT')) {
        orderType = 'LIMIT';
        this.pos++;
        if (this.current() && this.current().value === '(') {
          this.pos++;
          price = this.parseExpression();
          if (this.current() && this.current().value === ')') this.pos++;
        } else {
          price = this.parseExpression();
        }
      } else {
        orderType = this.current().value;
        this.pos++;
      }
    }

    let condition = null;
    if (this.isCurrentKeyword('IF')) {
      this.pos++;
      condition = this.parseConditionUntil(['STOP', 'LIMIT', 'REASON', 'ENDIF', 'THEN']);
    }

    let stop = null;
    if (this.isCurrentKeyword('STOP')) {
      this.pos++;
      stop = this.parseExpression();
    }

    let limit = null;
    if (this.isCurrentKeyword('LIMIT')) {
      this.pos++;
      limit = this.parseExpression();
    }

    let reason = null;
    if (this.isCurrentKeyword('REASON')) {
      this.pos++;
      reason = this.parseExpression();
    }

    this.imports.add('trade');
    return { type: 'Trade', command: cmdType, size, orderType, price, condition, stop, limit, reason };
  }

  parseConditionUntil(stopWords) {
    const startPos = this.pos;
    let depth = 0;
    const condTokens = [];

    while (this.current()) {
      const val = this.current().value.toString().toUpperCase();
      if (depth === 0 && stopWords.includes(val)) break;
      if (this.current().value === '(') depth++;
      if (this.current().value === ')') depth--;
      condTokens.push(this.current());
      this.pos++;
    }

    if (condTokens.length === 0) return { type: 'BooleanLiteral', value: true };

    const subParser = new ClawScriptParser(condTokens);
    subParser.variables = this.variables;
    subParser.imports = this.imports;
    return subParser.parseExpression();
  }

  parseExitCommand(cmdType) {
    this.pos++; // EXIT/CLOSE
    let exitType = 'ALL';
    let size = null;

    if (this.isCurrentKeyword('ALL')) {
      this.pos++;
    } else if (this.isCurrentKeyword('PART')) {
      this.pos++;
      exitType = 'PART';
      if (this.current() && this.current().value === '(') {
        this.pos++;
        size = this.parseExpression();
        if (this.current() && this.current().value === ')') this.pos++;
      } else {
        size = this.parseExpression();
      }
    }

    let condition = null;
    if (this.isCurrentKeyword('IF')) {
      this.pos++;
      condition = this.parseConditionUntil(['REASON']);
    }

    let reason = null;
    if (this.isCurrentKeyword('REASON')) {
      this.pos++;
      reason = this.parseExpression();
    }

    this.imports.add('trade');
    return { type: 'Exit', exitType, size, condition, reason };
  }

  parseTrailStop() {
    this.pos++; // TRAILSTOP
    const distance = this.parseExpression();
    let accel = null;
    let max = null;
    if (this.isCurrentKeyword('ACCEL')) {
      this.pos++;
      accel = this.parseExpression();
    }
    if (this.isCurrentKeyword('MAX')) {
      this.pos++;
      max = this.parseExpression();
    }
    this.imports.add('trade');
    return { type: 'TrailStop', distance, accel, max };
  }

  parseIfStatement() {
    this.pos++; // IF
    const condition = this.parseConditionUntil(['THEN']);
    if (this.isCurrentKeyword('THEN')) this.pos++;

    const thenBody = [];
    while (this.current() && !this.isCurrentKeyword('ELSE') && !this.isCurrentKeyword('ENDIF')) {
      const stmt = this.parseStatement();
      if (stmt) thenBody.push(stmt);
    }

    let elseBody = [];
    if (this.isCurrentKeyword('ELSE')) {
      this.pos++;
      if (this.isCurrentKeyword('IF')) {
        elseBody.push(this.parseIfStatement());
      } else {
        while (this.current() && !this.isCurrentKeyword('ENDIF')) {
          const stmt = this.parseStatement();
          if (stmt) elseBody.push(stmt);
        }
      }
    }

    if (this.isCurrentKeyword('ENDIF')) this.pos++;

    return { type: 'IfStatement', condition, thenBody, elseBody };
  }

  parseLoop(loopType) {
    this.pos++; // LOOP or WHILE
    let condition = null;
    let isForever = false;

    if (loopType === 'WHILE') {
      condition = this.parseConditionUntil(['ENDWHILE']);
      if (condition.type === 'Identifier' && condition.value === 'ENDWHILE') {
        condition = { type: 'BooleanLiteral', value: true };
      }
    } else {
      if (this.isCurrentKeyword('FOREVER')) {
        this.pos++;
        isForever = true;
        condition = { type: 'BooleanLiteral', value: true };
      } else {
        const num = this.parseExpression();
        if (this.isCurrentKeyword('TIMES')) this.pos++;
        condition = { type: 'LoopCount', num };
      }
    }

    const body = [];
    const endKey = loopType === 'LOOP' ? 'ENDLOOP' : 'ENDWHILE';
    while (this.current() && !this.isCurrentKeyword(endKey)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    if (this.isCurrentKeyword(endKey)) this.pos++;

    return { type: 'Loop', loopType, condition, body, isForever };
  }

  parseTryCatch() {
    this.pos++; // TRY
    const tryBody = [];
    while (this.current() && !this.isCurrentKeyword('CATCH')) {
      const stmt = this.parseStatement();
      if (stmt) tryBody.push(stmt);
    }
    if (this.isCurrentKeyword('CATCH')) this.pos++;
    const catchVar = this.current() ? this.current().value : '_err';
    this.pos++;
    const catchBody = [];
    while (this.current() && !this.isCurrentKeyword('ENDTRY')) {
      const stmt = this.parseStatement();
      if (stmt) catchBody.push(stmt);
    }
    if (this.isCurrentKeyword('ENDTRY')) this.pos++;
    return { type: 'TryCatch', tryBody, catchVar, catchBody };
  }

  parseError() {
    this.pos++; // ERROR
    const message = this.parseExpression();
    return { type: 'ErrorThrow', message };
  }

  parseAIQuery(asExpr) {
    this.pos++; // AI_QUERY
    const prompt = this.parseExpression();
    let tool = null;
    if (this.current() && this.isCurrentKeyword('TOOL')) {
      this.pos++;
      tool = this.parseExpression();
    }
    let arg = null;
    if (this.current() && this.isCurrentKeyword('ARG')) {
      this.pos++;
      arg = this.parseExpression();
    }
    this.imports.add('ai');
    const node = { type: 'AIQuery', prompt, tool, arg };
    return asExpr ? node : node;
  }

  parseAIGenerate() {
    this.pos++; // AI_GENERATE_SCRIPT
    const prompt = this.parseExpression();
    let toName = null;
    if (this.isCurrentKeyword('TO')) {
      this.pos++;
      toName = this.parseExpression();
    }
    this.imports.add('ai');
    return { type: 'AIGenerate', prompt, toName };
  }

  parseAnalyzeLog(asExpr) {
    this.pos++; // ANALYZE_LOG
    const query = this.parseExpression();
    let limit = null;
    if (this.current() && this.isCurrentKeyword('LIMIT')) {
      this.pos++;
      limit = this.parseExpression();
    }
    this.imports.add('ai');
    return { type: 'AnalyzeLog', query, limit };
  }

  parseRunML(asExpr) {
    this.pos++; // RUN_ML
    const modelCode = this.parseExpression();
    let dataVar = null;
    if (this.isCurrentKeyword('ON')) {
      this.pos++;
      dataVar = this.parseExpression();
    }
    this.imports.add('ai');
    return { type: 'RunML', modelCode, dataVar };
  }

  parseClawWeb(asExpr) {
    this.pos++; // CLAW_WEB
    const url = this.parseExpression();
    let instruct = null;
    if (this.current() && this.isCurrentKeyword('INSTRUCT')) {
      this.pos++;
      instruct = this.parseExpression();
    }
    this.imports.add('data');
    return { type: 'ClawWeb', url, instruct };
  }

  parseClawX(asExpr) {
    this.pos++; // CLAW_X
    const query = this.parseExpression();
    let limit = null;
    if (this.current() && this.isCurrentKeyword('LIMIT')) {
      this.pos++;
      limit = this.parseExpression();
    }
    let mode = null;
    if (this.current() && this.isCurrentKeyword('MODE')) {
      this.pos++;
      mode = this.parseExpression();
    }
    this.imports.add('data');
    return { type: 'ClawX', query, limit, mode };
  }

  parseClawPdf(asExpr) {
    this.pos++; // CLAW_PDF
    const fileName = this.parseExpression();
    let query = null;
    if (this.current() && this.isCurrentKeyword('QUERY')) {
      this.pos++;
      query = this.parseExpression();
    }
    let pages = null;
    if (this.current() && this.isCurrentKeyword('PAGES')) {
      this.pos++;
      pages = this.parseExpression();
    }
    this.imports.add('data');
    return { type: 'ClawPdf', fileName, query, pages };
  }

  parseClawImage(asExpr) {
    this.pos++; // CLAW_IMAGE
    const description = this.parseExpression();
    let num = null;
    if (this.current() && this.isCurrentKeyword('NUM')) {
      this.pos++;
      num = this.parseExpression();
    }
    this.imports.add('data');
    return { type: 'ClawImage', description, num };
  }

  parseClawVideo(asExpr) {
    this.pos++; // CLAW_VIDEO
    const url = this.parseExpression();
    this.imports.add('data');
    return { type: 'ClawVideo', url };
  }

  parseClawImageView() {
    this.pos++; // CLAW_IMAGE_VIEW
    const url = this.parseExpression();
    this.imports.add('data');
    return { type: 'ClawImageView', url };
  }

  parseClawConversation(asExpr) {
    this.pos++; // CLAW_CONVERSATION
    const query = this.parseExpression();
    this.imports.add('data');
    return { type: 'ClawConversation', query };
  }

  parseClawTool(asExpr) {
    this.pos++; // CLAW_TOOL
    const toolName = this.parseExpression();
    let args = {};
    if (this.isCurrentKeyword('WITH')) {
      this.pos++;
      args = this.parseKeyValueArgs();
    }
    let timeout = null;
    if (this.current() && this.isCurrentKeyword('WAIT_TIMEOUT')) {
      this.pos++;
      timeout = this.parseExpression();
    }
    this.imports.add('tools');
    return { type: 'ClawTool', toolName, args, timeout };
  }

  parseClawCode(asExpr) {
    this.pos++; // CLAW_CODE
    const code = this.parseExpression();
    this.imports.add('tools');
    return { type: 'ClawCode', code };
  }

  parseSpawnAgent() {
    this.pos++; // SPAWN_AGENT
    const name = this.parseExpression();
    let prompt = null;
    if (this.isCurrentKeyword('WITH')) {
      this.pos++;
      prompt = this.parseExpression();
    }
    let waitVar = null;
    if (this.isCurrentKeyword('WAIT')) {
      this.pos++;
      waitVar = this.parseExpression();
    }
    this.imports.add('chat');
    return { type: 'SpawnAgent', name, prompt, waitVar };
  }

  parseCallSession(asExpr) {
    this.pos++; // CALL_SESSION
    const agentName = this.parseExpression();
    const command = this.parseExpression();
    this.imports.add('chat');
    return { type: 'CallSession', agentName, command };
  }

  parseMutateConfig() {
    this.pos++; // MUTATE_CONFIG
    const key = this.parseExpression();
    let value = null;
    if (this.current() && this.current().value === '=') {
      this.pos++;
      value = this.parseExpression();
    }
    let strategy = null;
    if (this.isCurrentKeyword('STRATEGY')) {
      this.pos++;
      strategy = this.parseExpression();
    }
    return { type: 'MutateConfig', key, value, strategy };
  }

  parseAlert() {
    this.pos++; // ALERT
    const message = this.parseExpression();
    let level = null;
    if (this.current() && this.isCurrentKeyword('LEVEL')) {
      this.pos++;
      level = this.parseExpression();
    }
    let to = null;
    if (this.current() && this.isCurrentKeyword('TO')) {
      this.pos++;
      to = this.parseExpression();
    }
    let options = null;
    if (this.current() && this.isCurrentKeyword('OPTIONS')) {
      this.pos++;
      options = this.parseExpression();
    }
    this.imports.add('channels');
    return { type: 'Alert', message, level, to, options };
  }

  parseSayToSession() {
    this.pos++; // SAY_TO_SESSION
    const sessionId = this.parseExpression();
    const message = this.parseExpression();
    this.imports.add('chat');
    return { type: 'SayToSession', sessionId, message };
  }

  parseWaitForReply(asExpr) {
    this.pos++; // WAIT_FOR_REPLY
    const sessionId = this.parseExpression();
    let timeout = null;
    if (this.current() && this.isCurrentKeyword('TIMEOUT')) {
      this.pos++;
      timeout = this.parseExpression();
    }
    let filter = null;
    if (this.current() && this.isCurrentKeyword('FILTER')) {
      this.pos++;
      filter = this.parseExpression();
    }
    this.imports.add('chat');
    return { type: 'WaitForReply', sessionId, timeout, filter };
  }

  parseStoreVar() {
    this.pos++; // STORE_VAR
    const key = this.parseExpression();
    const value = this.parseExpression();
    let isGlobal = false;
    if (this.current() && this.isCurrentKeyword('GLOBAL')) {
      this.pos++;
      isGlobal = true;
    }
    return { type: 'StoreVar', key, value, isGlobal };
  }

  parseLoadVar(asExpr) {
    this.pos++; // LOAD_VAR
    const key = this.parseExpression();
    let defaultVal = null;
    if (this.current() && this.isCurrentKeyword('DEFAULT')) {
      this.pos++;
      defaultVal = this.parseExpression();
    }
    return { type: 'LoadVar', key, defaultVal };
  }

  parseWait() {
    this.pos++; // WAIT
    const ms = this.parseExpression();
    return { type: 'Wait', ms };
  }

  parseInclude() {
    this.pos++; // INCLUDE
    const scriptName = this.parseExpression();
    return { type: 'Include', scriptName };
  }

  parseOptimize() {
    this.pos++; // OPTIMIZE
    const varName = this.current().value;
    this.pos++;
    let fromVal = null, toVal = null, stepVal = null, usingDays = null;
    if (this.isCurrentKeyword('FROM')) {
      this.pos++;
      fromVal = this.parseExpression();
    }
    if (this.isCurrentKeyword('TO')) {
      this.pos++;
      toVal = this.parseExpression();
    }
    if (this.isCurrentKeyword('STEP')) {
      this.pos++;
      stepVal = this.parseExpression();
    }
    if (this.isCurrentKeyword('USING')) {
      this.pos++;
      usingDays = this.parseExpression();
    }
    return { type: 'Optimize', varName, fromVal, toVal, stepVal, usingDays };
  }

  parseIndicatorCmd(asExpr) {
    this.pos++; // INDICATOR
    if (this.current() && this.current().value === '(') {
      this.pos++;
      const name = this.current().value;
      this.pos++;
      const params = [];
      while (this.current() && this.current().value === ',') {
        this.pos++;
        params.push(this.parseExpression());
      }
      if (this.current() && this.current().value === ')') this.pos++;
      return { type: 'IndicatorCall', name, params };
    }
    const name = this.current() ? this.current().value : 'RSI';
    this.pos++;
    return { type: 'IndicatorCall', name, params: [] };
  }

  parseCrashScan() {
    this.pos++; // CRASH_SCAN
    let state = 'ON';
    if (this.isCurrentKeyword('ON') || this.isCurrentKeyword('OFF')) {
      state = this.current().value.toString().toUpperCase();
      this.pos++;
    }
    return { type: 'CrashScan', state };
  }

  parseMarketNomad() {
    this.pos++; // MARKET_NOMAD
    let state = 'ON';
    if (this.isCurrentKeyword('ON') || this.isCurrentKeyword('OFF')) {
      state = this.current().value.toString().toUpperCase();
      this.pos++;
    }
    let maxInstruments = null;
    if (this.current() && this.isCurrentKeyword('MAX_INSTRUMENTS')) {
      this.pos++;
      maxInstruments = this.parseExpression();
    }
    let scanInterval = null;
    if (this.current() && this.isCurrentKeyword('SCAN_INTERVAL')) {
      this.pos++;
      scanInterval = this.parseExpression();
    }
    this.imports.add('nomad');
    return { type: 'MarketNomad', state, maxInstruments, scanInterval };
  }

  parseNomadScan(asExpr) {
    this.pos++; // NOMAD_SCAN
    const category = this.parseExpression();
    let limit = null;
    if (this.current() && this.isCurrentKeyword('LIMIT')) {
      this.pos++;
      limit = this.parseExpression();
    }
    this.imports.add('nomad');
    return { type: 'NomadScan', category, limit };
  }

  parseNomadAllocate() {
    this.pos++; // NOMAD_ALLOCATE
    let target = null;
    if (this.isCurrentKeyword('TO')) {
      this.pos++;
      target = this.parseExpression();
    }
    let sizing = null;
    if (this.current() && this.isCurrentKeyword('SIZING')) {
      this.pos++;
      sizing = this.parseExpression();
    }
    this.imports.add('nomad');
    return { type: 'NomadAllocate', target, sizing };
  }

  parseRumorScan(asExpr) {
    this.pos++; // RUMOR_SCAN
    const topic = this.parseExpression();
    let sources = null;
    if (this.current() && this.isCurrentKeyword('SOURCES')) {
      this.pos++;
      sources = this.parseExpression();
    }
    let limit = null;
    if (this.current() && this.isCurrentKeyword('LIMIT')) {
      this.pos++;
      limit = this.parseExpression();
    }
    let filter = null;
    if (this.current() && this.isCurrentKeyword('FILTER')) {
      this.pos++;
      filter = this.parseExpression();
    }
    this.imports.add('tools');
    this.imports.add('ai');
    return { type: 'RumorScan', topic, sources, limit, filter };
  }

  parseFunctionDecl() {
    if (this.isCurrentKeyword('DEF_FUNC')) {
      this.pos++;
    } else if (this.isCurrentKeyword('DEF')) {
      this.pos++;
    }
    const name = this.current().value;
    this.pos++;
    const params = [];
    if (this.current() && this.current().value === '(') {
      this.pos++;
      while (this.current() && this.current().value !== ')') {
        params.push(this.current().value);
        this.pos++;
        if (this.current() && this.current().value === ',') this.pos++;
      }
      if (this.current() && this.current().value === ')') this.pos++;
    }
    const body = [];
    while (this.current() && !this.isCurrentKeyword('ENDFUNC')) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
    }
    if (this.isCurrentKeyword('ENDFUNC')) this.pos++;
    this.functions.set(name, { params, body });
    return { type: 'FunctionDecl', name, params, body };
  }

  parseFunctionCall() {
    const name = this.current().value;
    this.pos++;
    const args = [];
    if (this.current() && this.current().value === '(') {
      this.pos++;
      while (this.current() && this.current().value !== ')') {
        args.push(this.parseExpression());
        if (this.current() && this.current().value === ',') this.pos++;
      }
      if (this.current() && this.current().value === ')') this.pos++;
    }
    return { type: 'FunctionCallStmt', name, args };
  }

  parseChain() {
    this.pos++; // CHAIN
    const steps = [this.parseExpression()];
    while (this.current() && this.isCurrentKeyword('THEN')) {
      this.pos++;
      steps.push(this.parseExpression());
    }
    return { type: 'Chain', steps };
  }

  parseKeyValueArgs() {
    const args = {};
    while (this.current() && this.current().type === TOKEN_TYPES.IDENTIFIER) {
      const key = this.current().value;
      const upperKey = key.toUpperCase();
      if (['WAIT_TIMEOUT', 'TIMEOUT', 'STOP', 'LIMIT', 'REASON', 'IF', 'THEN', 'ELSE', 'ENDIF',
        'ENDLOOP', 'ENDWHILE', 'CATCH', 'ENDTRY', 'ENDFUNC'].includes(upperKey)) break;
      this.pos++;
      if (this.current() && this.current().value === '=') {
        this.pos++;
        args[key] = this.parseExpression();
      } else {
        args[key] = this.parseExpression();
      }
      if (this.current() && this.current().value === ',') this.pos++;
    }
    return args;
  }

  parseGenericCmd(cmdName) {
    this.pos++;
    const def = GENERIC_CMD_DEFS[cmdName];
    const posArgs = [];
    for (let i = 0; i < def.args; i++) {
      if (this.current() && !def.optKw.includes((this.current().value || '').toString().toUpperCase())) {
        posArgs.push(this.parseExpression());
      }
    }
    const kwargs = {};
    for (const kw of def.optKw) {
      if (this.current() && this.isCurrentKeyword(kw)) {
        this.pos++;
        kwargs[kw] = this.parseExpression();
      }
    }
    if (def.imp) this.imports.add(def.imp);
    return { type: 'GenericCmd', cmd: cmdName, posArgs, kwargs };
  }

  parsePrtIndicator(cmdName) {
    this.pos++;
    const indName = cmdName.replace('PRT_', '');
    const params = [];
    while (this.current() && this.current().type === TOKEN_TYPES.NUMBER) {
      params.push(this.parseExpression());
      if (this.current() && this.current().value === ',') this.pos++;
    }
    if (this.current() && this.current().value === '(') {
      this.pos++;
      while (this.current() && this.current().value !== ')') {
        params.push(this.parseExpression());
        if (this.current() && this.current().value === ',') this.pos++;
      }
      if (this.current() && this.current().value === ')') this.pos++;
    }
    this.imports.add('ext');
    return { type: 'PrtIndicator', name: indName, params };
  }

  parsePrtNoarg(cmdName) {
    this.pos++;
    const name = cmdName.replace('PRT_', '');
    this.imports.add('ext');
    return { type: 'PrtNoarg', name };
  }

  parsePrtDefparam() {
    this.pos++;
    const name = this.current() ? this.current().value : 'param';
    this.pos++;
    if (this.current() && this.current().value === '=') this.pos++;
    const value = this.parseExpression();
    return { type: 'VarDecl', name, value, isDef: true };
  }

  parsePrtReturn() {
    this.pos++;
    const value = this.parseExpression();
    return { type: 'PrtReturn', value };
  }

  parsePrtDraw(cmdName) {
    this.pos++;
    const params = [];
    if (this.current() && this.current().value === '(') {
      this.pos++;
      while (this.current() && this.current().value !== ')') {
        params.push(this.parseExpression());
        if (this.current() && this.current().value === ',') this.pos++;
      }
      if (this.current() && this.current().value === ')') this.pos++;
    }
    this.imports.add('ext');
    return { type: 'PrtDraw', cmd: cmdName, params };
  }

  generateJS(ast, strategyName, metadata) {
    const safeName = strategyName.replace(/[^a-zA-Z0-9]/g, '');
    let js = `'use strict';\n`;
    js += `const BaseStrategy = require('./base-strategy.cjs');\n`;

    const importMap = {
      indicators: `const indicators = require('../indicators.cjs');`,
      ai: `const ai = require('../openclaw-ai.cjs');`,
      data: `const data = require('../openclaw-data.cjs');`,
      chat: `const chat = require('../openclaw-chat.cjs');`,
      tools: `const tools = require('../openclaw-tools.cjs');`,
      channels: `const channels = require('../openclaw-channels.cjs');`,
      trade: `const trade = require('../openclaw-trade.cjs');`,
      nomad: `const nomad = require('../openclaw-nomad.cjs');`,
      ext: `const ext = require('../openclaw-ext.cjs');`,
    };

    this.imports.forEach(imp => {
      if (importMap[imp]) js += importMap[imp] + '\n';
    });

    js += `\nclass ${safeName}Strategy extends BaseStrategy {\n`;
    js += `  constructor(config) {\n    super(config);\n    this._vars = {};\n  }\n\n`;

    const funcDecls = ast.body.filter(s => s.type === 'FunctionDecl');
    const mainBody = ast.body.filter(s => s.type !== 'FunctionDecl');

    funcDecls.forEach(f => {
      js += `  ${f.name}(${f.params.join(', ')}) {\n`;
      f.body.forEach(s => { js += this.generateStmt(s, '    '); });
      js += `  }\n\n`;
    });

    js += `  async evaluateEntry(ticks, context) {\n`;
    js += `    const config = this.config;\n`;
    js += `    const prices = ticks.map(t => t.mid || t.close || t.price || 0);\n`;
    mainBody.forEach(stmt => { js += this.generateStmt(stmt, '    '); });
    js += `    return null;\n`;
    js += `  }\n\n`;

    js += `  async evaluateExit(position, ticks, context) {\n`;
    js += `    return { close: false, reason: '' };\n`;
    js += `  }\n\n`;

    js += `  getRequiredBufferSize() { return 100; }\n\n`;

    js += `  getDescription() { return 'Custom ClawScript strategy: ${safeName}'; }\n\n`;

    const schemaEntries = [
      `      { key: 'enabled', type: 'boolean', default: true, label: 'Enabled' }`,
      `      { key: 'size', type: 'number', default: 1, label: 'Position Size' }`,
      `      { key: 'stopDistance', type: 'number', default: 20, label: 'Stop Distance' }`,
      `      { key: 'limitDistance', type: 'number', default: 40, label: 'Limit Distance' }`
    ];

    if (metadata && metadata.inputs) {
      for (const inp of metadata.inputs) {
        const entry = `      { key: ${JSON.stringify(inp.key)}, type: ${JSON.stringify(inp.type)}, default: ${JSON.stringify(inp.default)}, label: ${JSON.stringify(inp.label)}, tooltip: ${JSON.stringify(inp.tooltip)}, clawscript: true }`;
        schemaEntries.push(entry);
      }
    }
    if (metadata && metadata.defs) {
      for (const def of metadata.defs) {
        const entry = `      { key: ${JSON.stringify(def.key)}, type: ${JSON.stringify(def.type)}, default: ${JSON.stringify(def.default)}, label: ${JSON.stringify(def.label)}, tooltip: ${JSON.stringify(def.tooltip)}, clawscript: true }`;
        schemaEntries.push(entry);
      }
    }

    js += `  getConfigSchema() {\n`;
    js += `    return [\n`;
    js += schemaEntries.join(',\n') + '\n';
    js += `    ];\n`;
    js += `  }\n\n`;

    js += `  static get STRATEGY_TYPE() { return 'custom-${safeName.toLowerCase()}'; }\n`;
    js += `}\n\n`;
    js += `module.exports = ${safeName}Strategy;\n`;
    return js;
  }

  generateStmt(stmt, indent = '') {
    if (!stmt) return '';
    switch (stmt.type) {
      case 'VarDecl':
        return `${indent}${stmt.isDef ? 'const' : 'let'} ${stmt.name} = ${this.generateExpr(stmt.value)};\n`;
      case 'Assignment':
        return `${indent}${stmt.name} = ${this.generateExpr(stmt.value)};\n`;
      case 'Trade':
        return this.generateTrade(stmt, indent);
      case 'Exit':
        return this.generateExit(stmt, indent);
      case 'TrailStop':
        return `${indent}this._trailStop = { distance: ${this.generateExpr(stmt.distance)}, accel: ${stmt.accel ? this.generateExpr(stmt.accel) : 'null'}, max: ${stmt.max ? this.generateExpr(stmt.max) : 'null'} };\n`;
      case 'IfStatement':
        return this.generateIf(stmt, indent);
      case 'Loop':
        return this.generateLoop(stmt, indent);
      case 'TryCatch':
        return this.generateTryCatch(stmt, indent);
      case 'ErrorThrow':
        return `${indent}throw new Error(${this.generateExpr(stmt.message)});\n`;
      case 'AIQuery':
        return `${indent}const _aiResult = await ai.aiQuery(${this.generateExpr(stmt.prompt)}, { tool: ${stmt.tool ? this.generateExpr(stmt.tool) : 'null'}, arg: ${stmt.arg ? this.generateExpr(stmt.arg) : 'null'} });\n`;
      case 'AIGenerate':
        return `${indent}await ai.aiGenerateScript(${this.generateExpr(stmt.prompt)}, ${stmt.toName ? this.generateExpr(stmt.toName) : 'null'});\n`;
      case 'AnalyzeLog':
        return `${indent}const _logResult = await ai.analyzeLog(${this.generateExpr(stmt.query)}, ${stmt.limit ? this.generateExpr(stmt.limit) : 'null'});\n`;
      case 'RunML':
        return `${indent}const _mlResult = await ai.runML(${this.generateExpr(stmt.modelCode)}, ${stmt.dataVar ? this.generateExpr(stmt.dataVar) : 'null'});\n`;
      case 'ClawWeb':
        return `${indent}const _webResult = await data.clawWeb(${this.generateExpr(stmt.url)}, ${stmt.instruct ? this.generateExpr(stmt.instruct) : 'null'});\n`;
      case 'ClawX':
        return `${indent}const _xResult = await data.clawX(${this.generateExpr(stmt.query)}, { limit: ${stmt.limit ? this.generateExpr(stmt.limit) : '10'}, mode: ${stmt.mode ? this.generateExpr(stmt.mode) : '"Top"'} });\n`;
      case 'ClawPdf':
        return `${indent}const _pdfResult = await data.clawPdf(${this.generateExpr(stmt.fileName)}, ${stmt.query ? this.generateExpr(stmt.query) : 'null'}, ${stmt.pages ? this.generateExpr(stmt.pages) : 'null'});\n`;
      case 'ClawImage':
        return `${indent}const _imgResult = await data.clawImage(${this.generateExpr(stmt.description)}, ${stmt.num ? this.generateExpr(stmt.num) : '1'});\n`;
      case 'ClawVideo':
        return `${indent}const _vidResult = await data.clawVideo(${this.generateExpr(stmt.url)});\n`;
      case 'ClawImageView':
        return `${indent}await data.clawImageView(${this.generateExpr(stmt.url)});\n`;
      case 'ClawConversation':
        return `${indent}const _convResult = await data.clawConversation(${this.generateExpr(stmt.query)});\n`;
      case 'ClawTool':
        return `${indent}const _toolResult = await tools.clawTool(${this.generateExpr(stmt.toolName)}, ${JSON.stringify(stmt.args)}, ${stmt.timeout ? this.generateExpr(stmt.timeout) : '300'});\n`;
      case 'ClawCode':
        return `${indent}const _codeResult = await tools.clawCode(${this.generateExpr(stmt.code)});\n`;
      case 'SpawnAgent':
        return `${indent}await chat.spawnAgent(${this.generateExpr(stmt.name)}, ${stmt.prompt ? this.generateExpr(stmt.prompt) : 'null'});\n`;
      case 'CallSession':
        return `${indent}const _sessResult = await chat.callSession(${this.generateExpr(stmt.agentName)}, ${this.generateExpr(stmt.command)});\n`;
      case 'MutateConfig':
        return `${indent}this.config[${this.generateExpr(stmt.key)}] = ${stmt.value ? this.generateExpr(stmt.value) : 'null'};\n`;
      case 'Alert':
        return `${indent}await channels.send(${stmt.to ? this.generateExpr(stmt.to) : '"default"'}, ${this.generateExpr(stmt.message)}, { level: ${stmt.level ? this.generateExpr(stmt.level) : '"info"'} });\n`;
      case 'SayToSession':
        return `${indent}await chat.sayToSession(${this.generateExpr(stmt.sessionId)}, ${this.generateExpr(stmt.message)});\n`;
      case 'WaitForReply':
        return `${indent}const _reply = await chat.waitForReply(${this.generateExpr(stmt.sessionId)}, ${stmt.timeout ? this.generateExpr(stmt.timeout) : '300'}, ${stmt.filter ? this.generateExpr(stmt.filter) : 'null'});\n`;
      case 'StoreVar':
        return `${indent}await tools.storeVar(${this.generateExpr(stmt.key)}, ${this.generateExpr(stmt.value)}, ${stmt.isGlobal});\n`;
      case 'LoadVar':
        return `${indent}const _loaded = await tools.loadVar(${this.generateExpr(stmt.key)}, ${stmt.defaultVal ? this.generateExpr(stmt.defaultVal) : 'null'});\n`;
      case 'Wait':
        return `${indent}await new Promise(r => setTimeout(r, ${this.generateExpr(stmt.ms)}));\n`;
      case 'Include':
        return `${indent}// INCLUDE ${this.generateExpr(stmt.scriptName)}\n`;
      case 'Optimize':
        return `${indent}// OPTIMIZE ${stmt.varName} from ${stmt.fromVal ? this.generateExpr(stmt.fromVal) : '?'} to ${stmt.toVal ? this.generateExpr(stmt.toVal) : '?'}\n`;
      case 'IndicatorCall':
        return `${indent}const _ind = indicators.calc${stmt.name}(prices${stmt.params.map(p => ', ' + this.generateExpr(p)).join('')});\n`;
      case 'CrashScan':
        return `${indent}this._crashScanEnabled = ${stmt.state === 'ON'};\n`;
      case 'MarketNomad':
        return `${indent}await nomad.setEnabled(${stmt.state === 'ON'}, { maxInstruments: ${stmt.maxInstruments ? this.generateExpr(stmt.maxInstruments) : '4'}, scanInterval: ${stmt.scanInterval ? this.generateExpr(stmt.scanInterval) : '15'} });\n`;
      case 'NomadScan':
        return `${indent}const _nomadResult = await nomad.scan(${this.generateExpr(stmt.category)}, { limit: ${stmt.limit ? this.generateExpr(stmt.limit) : '10'} });\n`;
      case 'NomadAllocate':
        return `${indent}await nomad.allocate(${stmt.target ? this.generateExpr(stmt.target) : 'null'}, { sizing: ${stmt.sizing ? this.generateExpr(stmt.sizing) : '"equal"'} });\n`;
      case 'RumorScan':
        return `${indent}const _rumors = await tools.rumorScan(${this.generateExpr(stmt.topic)}, { sources: ${stmt.sources ? this.generateExpr(stmt.sources) : '"both"'}, limit: ${stmt.limit ? this.generateExpr(stmt.limit) : '10'}, filter: ${stmt.filter ? this.generateExpr(stmt.filter) : 'null'} });\n`;
      case 'FunctionDecl':
        let fjs = `${indent}function ${stmt.name}(${stmt.params.join(', ')}) {\n`;
        stmt.body.forEach(s => { fjs += this.generateStmt(s, indent + '  '); });
        fjs += `${indent}}\n`;
        return fjs;
      case 'FunctionCallStmt':
        return `${indent}${stmt.name}(${stmt.args.map(a => this.generateExpr(a)).join(', ')});\n`;
      case 'Chain': {
        let chainJs = `${indent}let _chainResult = ${this.generateExpr(stmt.steps[0])};\n`;
        for (let i = 1; i < stmt.steps.length; i++) {
          chainJs += `${indent}_chainResult = ${this.generateExpr(stmt.steps[i])};\n`;
        }
        return chainJs;
      }
      case 'GenericCmd': {
        const fn = stmt.cmd.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const allArgs = (stmt.posArgs || []).map(a => this.generateExpr(a));
        const kwEntries = Object.entries(stmt.kwargs || {}).map(([k, v]) => `${k.toLowerCase()}: ${this.generateExpr(v)}`);
        if (kwEntries.length) allArgs.push(`{ ${kwEntries.join(', ')} }`);
        return `${indent}const _${fn}Result = await ext.${fn}(${allArgs.join(', ')});\n`;
      }
      case 'PrtIndicator':
        return `${indent}const _prt${stmt.name} = await ext.prt${stmt.name}(${stmt.params.map(p => this.generateExpr(p)).join(', ')});\n`;
      case 'PrtNoarg':
        return `${indent}const _prt${stmt.name} = ext.prt${stmt.name}();\n`;
      case 'PrtReturn':
        return `${indent}return ${this.generateExpr(stmt.value)};\n`;
      case 'PrtDraw':
        return `${indent}await ext.prtDraw("${stmt.cmd}", [${stmt.params.map(p => this.generateExpr(p)).join(', ')}]);\n`;
      case 'ExpressionStatement':
        return `${indent}${this.generateExpr(stmt.expr)};\n`;
      default:
        return `${indent}/* unsupported: ${stmt.type} */\n`;
    }
  }

  generateTrade(stmt, indent) {
    let js = '';
    if (stmt.condition) {
      js += `${indent}if (${this.generateExpr(stmt.condition)}) {\n`;
      js += `${indent}  return {\n`;
      js += `${indent}    signal: true,\n`;
      js += `${indent}    direction: '${stmt.command}',\n`;
      js += `${indent}    size: ${stmt.size ? this.generateExpr(stmt.size) : 'config.size || 1'},\n`;
      js += `${indent}    orderType: '${stmt.orderType}',\n`;
      js += `${indent}    stopDist: ${stmt.stop ? this.generateExpr(stmt.stop) : 'config.stopDistance || 20'},\n`;
      js += `${indent}    limitDist: ${stmt.limit ? this.generateExpr(stmt.limit) : 'config.limitDistance || 40'},\n`;
      js += `${indent}    reason: ${stmt.reason ? this.generateExpr(stmt.reason) : '"Auto"'}\n`;
      js += `${indent}  };\n`;
      js += `${indent}}\n`;
    } else {
      js += `${indent}return {\n`;
      js += `${indent}  signal: true,\n`;
      js += `${indent}  direction: '${stmt.command}',\n`;
      js += `${indent}  size: ${stmt.size ? this.generateExpr(stmt.size) : 'config.size || 1'},\n`;
      js += `${indent}  orderType: '${stmt.orderType}',\n`;
      js += `${indent}  stopDist: ${stmt.stop ? this.generateExpr(stmt.stop) : 'config.stopDistance || 20'},\n`;
      js += `${indent}  limitDist: ${stmt.limit ? this.generateExpr(stmt.limit) : 'config.limitDistance || 40'},\n`;
      js += `${indent}  reason: ${stmt.reason ? this.generateExpr(stmt.reason) : '"Auto"'}\n`;
      js += `${indent}};\n`;
    }
    return js;
  }

  generateExit(stmt, indent) {
    let js = '';
    if (stmt.condition) {
      js += `${indent}if (${this.generateExpr(stmt.condition)}) {\n`;
      js += `${indent}  return { close: true, type: '${stmt.exitType}', size: ${stmt.size ? this.generateExpr(stmt.size) : 'null'}, reason: ${stmt.reason ? this.generateExpr(stmt.reason) : '"Exit signal"'} };\n`;
      js += `${indent}}\n`;
    } else {
      js += `${indent}return { close: true, type: '${stmt.exitType}', size: ${stmt.size ? this.generateExpr(stmt.size) : 'null'}, reason: ${stmt.reason ? this.generateExpr(stmt.reason) : '"Exit signal"'} };\n`;
    }
    return js;
  }

  generateIf(stmt, indent) {
    let js = `${indent}if (${this.generateExpr(stmt.condition)}) {\n`;
    stmt.thenBody.forEach(s => { js += this.generateStmt(s, indent + '  '); });
    js += `${indent}}`;
    if (stmt.elseBody.length > 0) {
      if (stmt.elseBody.length === 1 && stmt.elseBody[0].type === 'IfStatement') {
        js += ` else ${this.generateStmt(stmt.elseBody[0], '').trim()}\n`;
      } else {
        js += ` else {\n`;
        stmt.elseBody.forEach(s => { js += this.generateStmt(s, indent + '  '); });
        js += `${indent}}\n`;
      }
    } else {
      js += `\n`;
    }
    return js;
  }

  generateLoop(stmt, indent) {
    let js = '';
    if (stmt.isForever) {
      js += `${indent}while (true) {\n`;
    } else if (stmt.loopType === 'WHILE') {
      js += `${indent}while (${this.generateExpr(stmt.condition)}) {\n`;
    } else if (stmt.condition.type === 'LoopCount') {
      js += `${indent}for (let i = 0; i < ${this.generateExpr(stmt.condition.num)}; i++) {\n`;
    } else {
      js += `${indent}while (${this.generateExpr(stmt.condition)}) {\n`;
    }
    stmt.body.forEach(s => { js += this.generateStmt(s, indent + '  '); });
    js += `${indent}}\n`;
    return js;
  }

  generateTryCatch(stmt, indent) {
    let js = `${indent}try {\n`;
    stmt.tryBody.forEach(s => { js += this.generateStmt(s, indent + '  '); });
    js += `${indent}} catch (${stmt.catchVar}) {\n`;
    stmt.catchBody.forEach(s => { js += this.generateStmt(s, indent + '  '); });
    js += `${indent}}\n`;
    return js;
  }

  generateExpr(expr) {
    if (!expr) return 'null';
    switch (expr.type) {
      case 'NumberLiteral':
        return String(expr.value);
      case 'StringLiteral':
        return JSON.stringify(expr.value);
      case 'BooleanLiteral':
        return String(expr.value);
      case 'NullLiteral':
        return 'null';
      case 'Identifier':
        return expr.value;
      case 'BinaryExpr':
        return `(${this.generateExpr(expr.left)} ${expr.op} ${this.generateExpr(expr.right)})`;
      case 'UnaryExpr':
        return `(${expr.op}${this.generateExpr(expr.expr)})`;
      case 'ContainsExpr':
        return `(String(${this.generateExpr(expr.left)}).includes(${this.generateExpr(expr.right)}))`;
      case 'CrossesExpr':
        if (expr.direction === 'OVER') {
          return `(${this.generateExpr(expr.left)} > ${this.generateExpr(expr.right)})`;
        }
        return `(${this.generateExpr(expr.left)} < ${this.generateExpr(expr.right)})`;
      case 'FunctionCall': {
        const _fn = expr.name.toUpperCase();
        const _args = expr.args.map(a => ', ' + this.generateExpr(a)).join('');
        const _simpleIndicators = {
          'RSI': 'calcRSI', 'EMA': 'calcEMA', 'SMA': 'calcSMA', 'ATR': 'calcATRFromTicks',
          'MACD': 'calcMACD', 'BOLLINGER': 'calcBollinger', 'ROC': 'calcROC',
          'ZSCORE': 'calcZScore', 'FIBONACCI': 'calcFibonacci', 'KELTNER': 'calcKeltner'
        };
        const _fromPricesIndicators = {
          'ADX': 'calcADXFromPrices', 'STOCH': 'calcStochasticFromPrices',
          'STOCHASTIC': 'calcStochasticFromPrices', 'CCI': 'calcCCIFromPrices',
          'WILLIAMS_R': 'calcWilliamsRFromPrices', 'PARABOLIC_SAR': 'calcParabolicSARFromPrices',
          'DONCHIAN': 'calcDonchianFromPrices'
        };
        const _fromPricesProp = {
          'BOLLINGER_UPPER': { func: 'calcBollinger', prop: 'upper' },
          'BOLLINGER_LOWER': { func: 'calcBollinger', prop: 'lower' },
          'STOCHASTIC_K': { func: 'calcStochasticFromPrices', prop: 'k' },
          'STOCHASTIC_D': { func: 'calcStochasticFromPrices', prop: 'd' },
          'AROON_UP': { func: 'calcAroonFromPrices', prop: 'up' },
          'AROON_DOWN': { func: 'calcAroonFromPrices', prop: 'down' },
          'ICHIMOKU_TENKAN': { func: 'calcIchimokuFromPrices', prop: 'tenkanSen' },
          'ICHIMOKU_KIJUN': { func: 'calcIchimokuFromPrices', prop: 'kijunSen' },
          'KELTNER_UPPER': { func: 'calcKeltner', prop: 'upper' },
          'KELTNER_LOWER': { func: 'calcKeltner', prop: 'lower' },
          'DONCHIAN_HIGH': { func: 'calcDonchianFromPrices', prop: 'upper' },
          'DONCHIAN_LOW': { func: 'calcDonchianFromPrices', prop: 'lower' }
        };
        const _sarProp = { 'PARABOLIC_SAR': 'sar' };
        if (_simpleIndicators[_fn]) {
          return `indicators.${_simpleIndicators[_fn]}(prices${_args})`;
        }
        if (_fromPricesIndicators[_fn]) {
          const _prop = _sarProp[_fn];
          return `indicators.${_fromPricesIndicators[_fn]}(prices${_args})` + (_prop ? `.${_prop}` : '');
        }
        if (_fromPricesProp[_fn]) {
          return `(indicators.${_fromPricesProp[_fn].func}(prices${_args}) || {}).${_fromPricesProp[_fn].prop}`;
        }
        if (_fn === 'LAST_PRICE') return `prices[prices.length - 1]`;
        if (_fn === 'VOLUME') return `0`;
        if (_fn === 'OBV') return `indicators.calcOBV(prices, prices.map(() => 1))`;
        if (_fn === 'VWAP') return `indicators.calcVWAP(prices, prices, prices, prices.map(() => 1))`;
        if (_fn === 'CMF') return `indicators.calcCMF(prices, prices, prices, prices.map(() => 1)${_args})`;
        if (_fn === 'ULTIMATE_OSC') return `indicators.calcUltimateOscillator(prices, prices, prices)`;
        if (_fn === 'CHAIKIN_VOL') return `indicators.calcChaikinVolatility(prices, prices${_args})`;
        if (_fn === 'SUPERTREND') return `indicators.calcSupertrend ? indicators.calcSupertrend(prices${_args}) : null`;
        return `${expr.name}(${expr.args.map(a => this.generateExpr(a)).join(', ')})`;
      }
      case 'MemberExpr':
        return `${this.generateExpr(expr.object)}.${expr.property}`;
      case 'IndexExpr':
        return `${this.generateExpr(expr.object)}[${this.generateExpr(expr.index)}]`;
      case 'LoopCount':
        return this.generateExpr(expr.num);
      case 'AIQuery':
        return `await ai.aiQuery(${this.generateExpr(expr.prompt)}, { tool: ${expr.tool ? this.generateExpr(expr.tool) : 'null'}, arg: ${expr.arg ? this.generateExpr(expr.arg) : 'null'} })`;
      case 'AnalyzeLog':
        return `await ai.analyzeLog(${this.generateExpr(expr.query)}, ${expr.limit ? this.generateExpr(expr.limit) : 'null'})`;
      case 'RunML':
        return `await ai.runML(${this.generateExpr(expr.modelCode)}, ${expr.dataVar ? this.generateExpr(expr.dataVar) : 'null'})`;
      case 'ClawWeb':
        return `await data.clawWeb(${this.generateExpr(expr.url)}, ${expr.instruct ? this.generateExpr(expr.instruct) : 'null'})`;
      case 'ClawX':
        return `await data.clawX(${this.generateExpr(expr.query)}, { limit: ${expr.limit ? this.generateExpr(expr.limit) : '10'}, mode: ${expr.mode ? this.generateExpr(expr.mode) : '"Top"'} })`;
      case 'ClawPdf':
        return `await data.clawPdf(${this.generateExpr(expr.fileName)}, ${expr.query ? this.generateExpr(expr.query) : 'null'}, ${expr.pages ? this.generateExpr(expr.pages) : 'null'})`;
      case 'ClawImage':
        return `await data.clawImage(${this.generateExpr(expr.description)}, ${expr.num ? this.generateExpr(expr.num) : '1'})`;
      case 'ClawVideo':
        return `await data.clawVideo(${this.generateExpr(expr.url)})`;
      case 'ClawConversation':
        return `await data.clawConversation(${this.generateExpr(expr.query)})`;
      case 'ClawTool':
        return `await tools.clawTool(${this.generateExpr(expr.toolName)}, ${JSON.stringify(expr.args)})`;
      case 'ClawCode':
        return `await tools.clawCode(${this.generateExpr(expr.code)})`;
      case 'CallSession':
        return `await chat.callSession(${this.generateExpr(expr.agentName)}, ${this.generateExpr(expr.command)})`;
      case 'WaitForReply':
        return `await chat.waitForReply(${this.generateExpr(expr.sessionId)}, ${expr.timeout ? this.generateExpr(expr.timeout) : '300'}, ${expr.filter ? this.generateExpr(expr.filter) : 'null'})`;
      case 'LoadVar':
        return `await tools.loadVar(${this.generateExpr(expr.key)}, ${expr.defaultVal ? this.generateExpr(expr.defaultVal) : 'null'})`;
      case 'NomadScan':
        return `await nomad.scan(${this.generateExpr(expr.category)}, { limit: ${expr.limit ? this.generateExpr(expr.limit) : '10'} })`;
      case 'RumorScan':
        return `await tools.rumorScan(${this.generateExpr(expr.topic)}, { sources: ${expr.sources ? this.generateExpr(expr.sources) : '"both"'}, limit: ${expr.limit ? this.generateExpr(expr.limit) : '10'} })`;
      case 'IndicatorCall':
        return `indicators.calc${expr.name}(prices${expr.params.map(p => ', ' + this.generateExpr(p)).join('')})`;
      case 'GenericCmd': {
        const fn = expr.cmd.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const allArgs = (expr.posArgs || []).map(a => this.generateExpr(a));
        const kwEntries = Object.entries(expr.kwargs || {}).map(([k, v]) => `${k.toLowerCase()}: ${this.generateExpr(v)}`);
        if (kwEntries.length) allArgs.push(`{ ${kwEntries.join(', ')} }`);
        return `await ext.${fn}(${allArgs.join(', ')})`;
      }
      case 'PrtIndicator':
        return `await ext.prt${expr.name}(${expr.params.map(p => this.generateExpr(p)).join(', ')})`;
      case 'PrtNoarg':
        return `ext.prt${expr.name}()`;
      default:
        if (typeof expr === 'string') return JSON.stringify(expr);
        if (typeof expr === 'number') return String(expr);
        return 'null';
    }
  }
}

function parseToAST(code) {
  const tokens = lexer(code);
  const parser = new ClawScriptParser(tokens);
  return parser.parse();
}

function parseAndGenerate(code, strategyName) {
  const tokens = lexer(code);
  const parser = new ClawScriptParser(tokens);
  const ast = parser.parse();
  const metadata = extractMetadata(code);
  const js = parser.generateJS(ast, strategyName || 'Custom', metadata);
  return { ast, js, imports: Array.from(parser.imports), variables: Array.from(parser.variables.keys()), metadata };
}

module.exports = { parseAndGenerate, parseToAST, extractMetadata, lexer, ClawScriptParser, TOKEN_TYPES, KEYWORDS };
