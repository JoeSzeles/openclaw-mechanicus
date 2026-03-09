'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const EDITOR_DIR = path.join(__dirname, 'editor');

let aiHandler = null;
try {
  aiHandler = require('./lib/clawscript-ai-handler.cjs');
} catch(e) {
  console.warn('[serve] AI handler not found — AI chat will be unavailable');
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
