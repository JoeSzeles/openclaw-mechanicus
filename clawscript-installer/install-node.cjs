'use strict';
//
// ClawScript Node.js Installer — runs on any OS with Node.js
// Usage: node install-node.cjs
//
// Downloads fresh files directly from GitHub and copies them.
// No git, no bash, no PowerShell needed. Just Node.
//

var https = require('https');
var fs = require('fs');
var path = require('path');
var os = require('os');

var REPO_BASE = 'https://raw.githubusercontent.com/JoeSzeles/clawscript/main/';

var FILES = [
  { src: 'editor/clawscript-editor.html', dst: 'canvas', name: 'clawscript-editor.html' },
  { src: 'editor/ig-clawscript-ui.js', dst: 'canvas', name: 'ig-clawscript-ui.js' },
  { src: 'editor/ig-clawscript-flow.js', dst: 'canvas', name: 'ig-clawscript-flow.js' },
  { src: 'serve.cjs', dst: 'root', name: 'serve-clawscript.cjs' },
  { src: 'docs/clawscript-docs.html', dst: 'canvas', name: 'clawscript-docs.html' },
  { src: 'lib/clawscript-parser.cjs', dst: 'bots', name: 'clawscript-parser.cjs' },
  { src: 'lib/indicators.cjs', dst: 'bots', name: 'indicators.cjs' },
  { src: 'lib/clawscript-ai-handler.cjs', dst: 'bots', name: 'clawscript-ai-handler.cjs' },
  { src: 'strategies/base-strategy.cjs', dst: 'strategies', name: 'base-strategy.cjs' },
  { src: 'strategies/index.cjs', dst: 'strategies', name: 'index.cjs' },
  { src: 'docs/CLAWSCRIPT.md', dst: 'skill', name: 'CLAWSCRIPT.md' },
  { src: 'VERSION', dst: 'root', name: 'VERSION' }
];

var STUBS = [
  'lib/openclaw/openclaw-ai.cjs',
  'lib/openclaw/openclaw-automation.cjs',
  'lib/openclaw/openclaw-channels.cjs',
  'lib/openclaw/openclaw-chat.cjs',
  'lib/openclaw/openclaw-data.cjs',
  'lib/openclaw/openclaw-nomad.cjs',
  'lib/openclaw/openclaw-tools.cjs'
];

STUBS.forEach(function(s) {
  FILES.push({ src: s, dst: 'bots', name: path.basename(s) });
});

function detectPaths() {
  var home = os.homedir();
  var openclawRoot = path.join(home, '.openclaw');
  var skillsRoot = '';

  var npmGlobal = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'npm', 'node_modules', 'openclaw', 'skills');

  if (fs.existsSync(npmGlobal)) {
    skillsRoot = npmGlobal;
    console.log('  Mode: Windows npm global');
  } else if (fs.existsSync(path.join(openclawRoot, 'skills'))) {
    skillsRoot = path.join(openclawRoot, 'skills');
    console.log('  Mode: home .openclaw/skills');
  } else if (fs.existsSync('./skills')) {
    skillsRoot = path.resolve('./skills');
    console.log('  Mode: local ./skills');
  } else {
    skillsRoot = path.join(openclawRoot, 'skills');
    console.log('  Mode: fallback');
  }

  return {
    root: openclawRoot,
    canvas: path.join(openclawRoot, 'canvas'),
    bots: path.join(skillsRoot, 'bots'),
    strategies: path.join(skillsRoot, 'bots', 'strategies'),
    skill: path.join(skillsRoot, 'clawscript'),
    templates: path.join(openclawRoot, 'canvas', 'clawscript-templates')
  };
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function download(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() { resolve(Buffer.concat(chunks)); });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('');
  console.log('  ClawScript Node.js Installer');
  console.log('  ----------------------------');

  var paths = detectPaths();

  console.log('  OpenClaw: ' + paths.root);
  console.log('  Canvas:   ' + paths.canvas);
  console.log('  Bots:     ' + paths.bots);
  console.log('');

  ensureDir(paths.canvas);
  ensureDir(paths.bots);
  ensureDir(paths.strategies);
  ensureDir(paths.skill);
  ensureDir(paths.templates);

  var ok = 0;
  var fail = 0;

  for (var i = 0; i < FILES.length; i++) {
    var f = FILES[i];
    var url = REPO_BASE + f.src;
    var dstDir = f.dst === 'canvas' ? paths.canvas
      : f.dst === 'bots' ? paths.bots
      : f.dst === 'strategies' ? paths.strategies
      : f.dst === 'skill' ? paths.skill
      : paths.root;
    var dstPath = path.join(dstDir, f.name);

    try {
      var data = await download(url);
      if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);
      fs.writeFileSync(dstPath, data);
      console.log('  OK    ' + f.name + ' (' + data.length + 'b)');
      ok++;
    } catch(e) {
      console.log('  FAIL  ' + f.name + ' (' + e.message + ')');
      fail++;
    }
  }

  console.log('');
  console.log('  -- Verify --');
  var critical = ['clawscript-editor.html', 'ig-clawscript-ui.js', 'ig-clawscript-flow.js'];
  critical.forEach(function(name) {
    var fp = path.join(paths.canvas, name);
    if (fs.existsSync(fp)) {
      var size = fs.statSync(fp).size;
      console.log('  ' + (size > 100 ? 'OK' : 'ERR') + '  ' + name + ' (' + size + 'b)');
    } else {
      console.log('  ERR ' + name + ' MISSING at ' + fp);
    }
  });

  console.log('');
  if (fail === 0) {
    console.log('  Install complete. ' + ok + ' files downloaded.');
  } else {
    console.log('  Install complete with ' + fail + ' error(s).');
  }
  console.log('');
  console.log('  Editor: ' + path.join(paths.canvas, 'clawscript-editor.html'));
  console.log('');
}

main().catch(function(e) { console.error('FATAL:', e); process.exit(1); });
