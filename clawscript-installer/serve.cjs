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
