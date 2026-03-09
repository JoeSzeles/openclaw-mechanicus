'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '3000', 10);
const EDITOR_DIR = path.join(__dirname, 'editor');
const SCRIPTS_DIR = path.join(__dirname, '.clawscript-scripts');
const LOGS_DIR = path.join(__dirname, '.clawscript-logs');
try { fs.mkdirSync(SCRIPTS_DIR, { recursive: true }); } catch(_) {}
try { fs.mkdirSync(LOGS_DIR, { recursive: true }); } catch(_) {}

var _runningScripts = {};

let aiHandler = null;
try {
  aiHandler = require('./lib/clawscript-ai-handler.cjs');
} catch(e) {
  console.warn('[serve] AI handler not found — AI chat will be unavailable');
}

let parser = null;
try {
  parser = require('./lib/clawscript-parser.cjs');
} catch(e) {
  console.warn('[serve] Parser not found — backtest/compile will be unavailable');
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function _readJsonBody(req, cb) {
  var chunks = [];
  req.on('data', function(c) { chunks.push(c); });
  req.on('end', function() {
    try { cb(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
    catch(_) { cb({}); }
  });
}

function _jsonRes(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
  res.end(JSON.stringify(obj));
}

function _readOpenClawConfig() {
  var searchPaths = [
    path.join(process.cwd(), '.openclaw', 'openclaw.md'),
    path.join(__dirname, '..', '.openclaw', 'openclaw.md'),
    path.join(require('os').homedir(), '.openclaw', 'openclaw.md')
  ];
  for (var i = 0; i < searchPaths.length; i++) {
    try {
      if (!fs.existsSync(searchPaths[i])) continue;
      var raw = fs.readFileSync(searchPaths[i], 'utf8');
      var cfg = JSON.parse(raw);
      var result = { found: true };
      if (cfg.gateway) {
        result.gatewayPort = cfg.gateway.port || null;
        result.gatewayMode = cfg.gateway.mode || null;
        if (cfg.gateway.auth && cfg.gateway.auth.token) {
          result.gatewayToken = cfg.gateway.auth.token;
        }
        if (cfg.gateway.http && cfg.gateway.http.endpoints && cfg.gateway.http.endpoints.chatCompletions) {
          result.chatCompletionsEnabled = cfg.gateway.http.endpoints.chatCompletions.enabled || false;
        }
      }
      if (cfg.models && cfg.models.providers) {
        var providers = cfg.models.providers;
        var providerNames = Object.keys(providers);
        if (providerNames.length > 0) {
          var pName = providerNames[0];
          var p = providers[pName];
          result.provider = pName;
          result.baseUrl = p.baseUrl || null;
          if (p.models && p.models.length > 0) {
            result.model = pName + '/' + p.models[0].id;
            result.modelName = p.models[0].name || p.models[0].id;
          }
        }
      }
      if (cfg.agents && cfg.agents.defaults && cfg.agents.defaults.model) {
        result.primaryModel = cfg.agents.defaults.model.primary || null;
      }
      if (cfg.auth && cfg.auth.profiles) {
        var profileKeys = Object.keys(cfg.auth.profiles);
        if (profileKeys.length > 0) {
          var prof = cfg.auth.profiles[profileKeys[0]];
          result.authProvider = prof.provider || null;
          result.authMode = prof.mode || null;
        }
      }
      return result;
    } catch(e) {
      continue;
    }
  }
  return { found: false };
}

const server = http.createServer(function(req, res) {
  const url = req.url.split('?')[0];

  if (url === '/api/clawscript/ai' && aiHandler) {
    aiHandler.handleClawScriptAiChat(req, res);
    return;
  }

  if (url === '/api/clawscript/ai/chat' && aiHandler) {
    aiHandler.handleClawScriptAiChat(req, res);
    return;
  }

  if (url === '/api/clawscript/ai/config') {
    var cfgResult = _readOpenClawConfig();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify(cfgResult));
    return;
  }

  if (url === '/nav-inject.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end('');
    return;
  }

  if (url === '/api/clawscript/compile' && req.method === 'POST') {
    _readJsonBody(req, function(body) {
      if (!parser) { _jsonRes(res, 500, { error: 'Parser not available' }); return; }
      try {
        var result = parser.parseAndGenerate(body.code || '');
        _jsonRes(res, 200, { ok: true, ast: result.ast, js: result.js, variables: result.variables, imports: result.imports });
      } catch(e) {
        _jsonRes(res, 400, { error: 'Parse error: ' + e.message });
      }
    });
    return;
  }

  if (url === '/api/clawscript/backtest' && req.method === 'POST') {
    _readJsonBody(req, function(body) {
      if (!parser) { _jsonRes(res, 500, { error: 'Parser not available' }); return; }
      var code = body.code || '';
      var epic = body.instrument || 'CS.D.BITCOIN.CFD.IP';
      var resolution = body.resolution || 'HOUR';
      var maxCandles = Math.min(body.candleCount || 200, 2000);
      try {
        var parsed = parser.parseAndGenerate(code);
        if (!parsed || !parsed.ast) { _jsonRes(res, 400, { error: 'Parse error' }); return; }
        var ast = parsed.ast;
        var basePrice = epic.toLowerCase().indexOf('bitcoin') > -1 ? 50000 : epic.toLowerCase().indexOf('ether') > -1 ? 3000 : epic.toLowerCase().indexOf('gold') > -1 ? 2000 : 100;
        var now = Math.floor(Date.now() / 1000);
        var resMap = { MINUTE:60,MINUTE_5:300,MINUTE_15:900,MINUTE_30:1800,HOUR:3600,HOUR_4:14400,DAY:86400,WEEK:604800 };
        var interval = resMap[resolution] || 3600;
        var candles = [];
        for (var i = 0; i < maxCandles; i++) {
          var t = now - (maxCandles - i) * interval;
          var trend = Math.sin(i * 0.02) * basePrice * 0.1;
          var noise = (Math.random() - 0.5) * basePrice * 0.02;
          var o = basePrice + trend + noise;
          var h = o + Math.random() * basePrice * 0.015;
          var l = o - Math.random() * basePrice * 0.015;
          var c = o + (Math.random() - 0.5) * basePrice * 0.01;
          candles.push({ ts:t, time:t, open:Math.round(o*100)/100, high:Math.round(h*100)/100, low:Math.round(l*100)/100, close:Math.round(c*100)/100, volume:Math.floor(Math.random()*1000)+100 });
        }
        var closePrices = candles.map(function(c) { return c.close; });
        var trades = [], openTrade = null, vars = {}, totalPnl = 0, peakEquity = 0, maxDrawdown = 0, equityCurve = [];
        function calcRSI(prices, period) { if (prices.length < period + 1) return 50; var ag = 0, al = 0; for (var j = prices.length - period; j < prices.length; j++) { var d = prices[j] - prices[j-1]; if (d > 0) ag += d; else al -= d; } if (al === 0) return 100; return 100 - (100 / (1 + (ag/period)/(al/period))); }
        function calcEMA(prices, period) { if (prices.length < period) return prices[prices.length-1]||0; var k = 2/(period+1); var ema = 0; for (var j = 0; j < period; j++) ema += prices[j]; ema /= period; for (var j = period; j < prices.length; j++) ema = prices[j]*k + ema*(1-k); return ema; }
        function calcSMA(prices, period) { if (prices.length < period) return prices[prices.length-1]||0; var s = 0; for (var j = prices.length - period; j < prices.length; j++) s += prices[j]; return s/period; }
        function calcMACD(prices, fast, slow) { fast=fast||12;slow=slow||26; if (prices.length < slow) return 0; return calcEMA(prices,fast) - calcEMA(prices,slow); }
        function calcATR(prices, period) { if (prices.length < period+1) return 0; var s = 0; for (var j = prices.length-period; j < prices.length; j++) s += Math.abs(prices[j]-prices[j-1]); return s/period; }
        function evalIndicator(name, args, ps) { if (name === 'RSI') return calcRSI(ps, args[0]||14); if (name === 'EMA') return calcEMA(ps, args[0]||20); if (name === 'SMA') return calcSMA(ps, args[0]||20); if (name === 'MACD') return calcMACD(ps, args[0]||12, args[1]||26); if (name === 'ATR') return calcATR(ps, args[0]||14); if (name === 'LAST_PRICE') return ps.length > 0 ? ps[ps.length-1] : 0; return 0; }
        function evalExpr(expr, ps) { if (!expr) return null; switch(expr.type) { case 'NumberLiteral': return expr.value; case 'StringLiteral': return expr.value; case 'BooleanLiteral': return expr.value; case 'Identifier': return vars[expr.value] !== undefined ? vars[expr.value] : 0; case 'BinaryExpr': { var l = evalExpr(expr.left,ps), r = evalExpr(expr.right,ps); switch(expr.op) { case '+': return l+r; case '-': return l-r; case '*': return l*r; case '/': return r !== 0 ? l/r : 0; case '>': return l>r; case '<': return l<r; case '>=': return l>=r; case '<=': return l<=r; case '==': return l==r; case '!=': return l!=r; case '&&': return l&&r; case '||': return l||r; default: return null; } } case 'UnaryExpr': { var v = evalExpr(expr.expr,ps); return expr.op === '-' ? -v : !v; } case 'FunctionCall': return evalIndicator(expr.name.toUpperCase(), expr.args.map(function(a){return evalExpr(a,ps)}), ps); case 'CrossesExpr': return expr.direction === 'OVER' ? evalExpr(expr.left,ps) > evalExpr(expr.right,ps) : evalExpr(expr.left,ps) < evalExpr(expr.right,ps); default: return null; } }
        function execStmt(stmt, ps, depth) { if (!stmt || depth > 50) return; switch(stmt.type) { case 'VarDecl': vars[stmt.name] = evalExpr(stmt.value, ps); break; case 'Assignment': vars[stmt.name] = evalExpr(stmt.value, ps); break; case 'Trade': { var cond = stmt.condition ? evalExpr(stmt.condition, ps) : true; if (cond && !openTrade) { openTrade = { direction: stmt.command, size: stmt.size ? evalExpr(stmt.size,ps) : 1, entryPrice: ps[ps.length-1], entryTime: candles[Math.min(ps.length-1,candles.length-1)].ts }; } break; } case 'Exit': { var ec = stmt.condition ? evalExpr(stmt.condition, ps) : true; if (ec && openTrade) { var ep = ps[ps.length-1]; var pnl = openTrade.direction === 'BUY' ? (ep - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - ep) * openTrade.size; totalPnl += pnl; trades.push({ direction: openTrade.direction, size: openTrade.size, entryPrice: openTrade.entryPrice, exitPrice: ep, pnl: Math.round(pnl*100)/100, entryTime: openTrade.entryTime, exitTime: candles[Math.min(ps.length-1,candles.length-1)].ts }); openTrade = null; } break; } case 'IfStatement': { var ic = evalExpr(stmt.condition, ps); var b = ic ? stmt.thenBody : stmt.elseBody; for (var j = 0; j < b.length; j++) execStmt(b[j], ps, depth+1); break; } case 'Loop': { if (stmt.condition && stmt.condition.type === 'LoopCount') { var cnt = Math.min(evalExpr(stmt.condition.num, ps) || 0, 10); for (var j = 0; j < cnt; j++) { vars['i'] = j; for (var k = 0; k < stmt.body.length; k++) execStmt(stmt.body[k], ps, depth+1); } } break; } default: break; } }
        for (var ci = 20; ci < candles.length; ci++) {
          var ps = closePrices.slice(0, ci + 1);
          vars['price'] = closePrices[ci]; vars['close'] = closePrices[ci]; vars['open'] = candles[ci].open; vars['high'] = candles[ci].high; vars['low'] = candles[ci].low; vars['volume'] = candles[ci].volume; vars['bar'] = ci;
          for (var s = 0; s < ast.body.length; s++) execStmt(ast.body[s], ps, 0);
          var eq = totalPnl;
          if (openTrade) { eq += openTrade.direction === 'BUY' ? (closePrices[ci] - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - closePrices[ci]) * openTrade.size; }
          if (eq > peakEquity) peakEquity = eq;
          var dd = peakEquity - eq;
          if (dd > maxDrawdown) maxDrawdown = dd;
          equityCurve.push({ ts: candles[ci].ts, equity: Math.round(eq*100)/100 });
        }
        if (openTrade) { var lp = closePrices[closePrices.length-1]; var fp = openTrade.direction === 'BUY' ? (lp - openTrade.entryPrice) * openTrade.size : (openTrade.entryPrice - lp) * openTrade.size; totalPnl += fp; trades.push({ direction: openTrade.direction, size: openTrade.size, entryPrice: openTrade.entryPrice, exitPrice: lp, pnl: Math.round(fp*100)/100, entryTime: openTrade.entryTime, exitTime: candles[candles.length-1].ts, openAtEnd: true }); }
        var wins = trades.filter(function(t){return t.pnl > 0}).length;
        var losses = trades.filter(function(t){return t.pnl <= 0}).length;
        var winRate = trades.length > 0 ? Math.round((wins/trades.length)*10000)/100 : 0;
        _jsonRes(res, 200, { ok:true, instrument:epic, resolution:resolution, candlesUsed:candles.length, dataSource:'demo', totalPnl:Math.round(totalPnl*100)/100, trades:trades.length, wins:wins, losses:losses, winRate:winRate, maxDrawdown:Math.round(maxDrawdown*100)/100, tradeList:trades.slice(-100), equityCurve:equityCurve.length > 200 ? equityCurve.filter(function(_,i){return i%Math.ceil(equityCurve.length/200)===0}) : equityCurve, timestamp:Date.now() });
      } catch(e) {
        _jsonRes(res, 500, { error: 'Backtest failed: ' + e.message });
      }
    });
    return;
  }

  if (url === '/api/clawscript/run' && req.method === 'POST') {
    _readJsonBody(req, function(body) {
      var code = body.code || '';
      var name = (body.name || 'script-' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
      if (!code) { _jsonRes(res, 400, { error: 'Missing code' }); return; }
      var scriptFile = path.join(SCRIPTS_DIR, name + '.cs');
      fs.writeFileSync(scriptFile, code, 'utf8');
      var logFile = path.join(LOGS_DIR, name + '.log');
      if (_runningScripts[name]) { try { _runningScripts[name].proc.kill(); } catch(_) {} }
      var jsCode = '';
      try {
        if (parser) { var p = parser.parseAndGenerate(code); jsCode = p.js; }
      } catch(_) {}
      var jsFile = path.join(SCRIPTS_DIR, name + '.js');
      fs.writeFileSync(jsFile, jsCode || '// ClawScript: ' + name + '\nconsole.log("[INFO] Script ' + name + ' started");\nsetInterval(function(){ console.log("[INFO] ' + name + ' tick " + new Date().toISOString()); }, 5000);', 'utf8');
      var proc = spawn('node', [jsFile], { stdio: ['ignore', 'pipe', 'pipe'], detached: false });
      var logStream = fs.createWriteStream(logFile, { flags: 'a' });
      proc.stdout.pipe(logStream);
      proc.stderr.pipe(logStream);
      _runningScripts[name] = { proc: proc, logFile: logFile, startedAt: new Date().toISOString() };
      proc.on('exit', function() { if (_runningScripts[name] && _runningScripts[name].proc === proc) { _runningScripts[name].running = false; } });
      _jsonRes(res, 200, { ok: true, scriptId: 'cs-script-' + name, name: name, pid: proc.pid });
    });
    return;
  }

  if (url === '/api/clawscript/scripts' && req.method === 'GET') {
    var scripts = Object.keys(_runningScripts).map(function(n) {
      var s = _runningScripts[n];
      var running = !!(s.proc && !s.proc.killed && s.running !== false);
      return { id: 'cs-script-' + n, name: n, running: running, pid: running ? s.proc.pid : null, startedAt: s.startedAt };
    });
    _jsonRes(res, 200, { scripts: scripts });
    return;
  }

  var scriptMatch = url.match(/^\/api\/clawscript\/scripts\/([^/]+)\/(stop|restart|pause|resume|logs)$/);
  if (scriptMatch) {
    var sName = decodeURIComponent(scriptMatch[1]).replace(/^cs-script-/, '');
    var action = scriptMatch[2];
    if (action === 'logs' && req.method === 'GET') {
      var lf = path.join(LOGS_DIR, sName + '.log');
      try {
        var content = fs.readFileSync(lf, 'utf8');
        var lines = content.split('\n').slice(-200);
        _jsonRes(res, 200, { lines: lines });
      } catch(_) {
        _jsonRes(res, 200, { lines: ['No logs yet'] });
      }
      return;
    }
    if (req.method === 'POST') {
      var entry = _runningScripts[sName];
      if (!entry) { _jsonRes(res, 404, { error: 'Script not found: ' + sName }); return; }
      if (action === 'stop') { try { entry.proc.kill(); } catch(_) {} _jsonRes(res, 200, { ok: true }); return; }
      if (action === 'restart') {
        try { entry.proc.kill(); } catch(_) {}
        var jsF = path.join(SCRIPTS_DIR, sName + '.js');
        if (fs.existsSync(jsF)) {
          var np = spawn('node', [jsF], { stdio: ['ignore', 'pipe', 'pipe'], detached: false });
          var ls = fs.createWriteStream(entry.logFile, { flags: 'a' });
          np.stdout.pipe(ls); np.stderr.pipe(ls);
          entry.proc = np; entry.running = undefined;
          np.on('exit', function() { if (entry.proc === np) entry.running = false; });
        }
        _jsonRes(res, 200, { ok: true }); return;
      }
      _jsonRes(res, 200, { ok: true }); return;
    }
  }

  let filePath = url === '/' ? '/clawscript-editor.html' : url;
  filePath = path.join(EDITOR_DIR, filePath);

  if (!filePath.startsWith(EDITOR_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + url);
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    var mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, function() {
  console.log('');
  console.log('  ClawScript Editor running at http://localhost:' + PORT);
  console.log('');
  if (aiHandler) {
    var provider = aiHandler.getProvider();
    if (provider) {
      console.log('  AI Assistant: ' + provider.name + ' (' + provider.model + ')');
    } else {
      console.log('  AI Assistant: No API key found.');
      console.log('  Set one of: GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY');
      console.log('  Example: GROQ_API_KEY=gsk_xxx node serve.cjs');
    }
  } else {
    console.log('  AI Assistant: handler not available');
  }
  console.log('');
});
