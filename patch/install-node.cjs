"use strict";
var https = require("https");
var fs = require("fs");
var path = require("path");
var os = require("os");

var REPO_BASE = "https://raw.githubusercontent.com/JoeSzeles/openclaw-mechanicus-patches/main/files/";
var VERSION = "2026.3.11";

var HOME_FILES = [".openclaw/canvas/all-scalper-trades-data.json", ".openclaw/canvas/all-scalper-trades.html", ".openclaw/canvas/binance-test.html", ".openclaw/canvas/chat-clawscript-editor.html", ".openclaw/canvas/clawscript-docs.html", ".openclaw/canvas/clawscript-editor.html", ".openclaw/canvas/clawscript-logbook.html", ".openclaw/canvas/gann-bot-status.html", ".openclaw/canvas/gold-backtest.html", ".openclaw/canvas/ig-alerts-snapshot.json", ".openclaw/canvas/ig-backtest-ui.js", ".openclaw/canvas/ig-bot-log-snapshot.json", ".openclaw/canvas/ig-bot-status.html", ".openclaw/canvas/ig-clawscript-flow.js", ".openclaw/canvas/ig-clawscript-ui.js", ".openclaw/canvas/ig-config-ui.js", ".openclaw/canvas/ig-dashboard.html", ".openclaw/canvas/ig-dashboard-snapshot.json", ".openclaw/canvas/ig-history-ui.js", ".openclaw/canvas/ig-live-prices.js", ".openclaw/canvas/ig-logs-settings-ui.js", ".openclaw/canvas/ig-monitor-config-snapshot.json", ".openclaw/canvas/ig-price-history.json", ".openclaw/canvas/ig-scalper-config-snapshot.json", ".openclaw/canvas/ig-scalper-ui.js", ".openclaw/canvas/ig-strategy-manager.js", ".openclaw/canvas/ig-strategy-snapshot.json", ".openclaw/canvas/ig-verify-log.json", ".openclaw/canvas/index.html", ".openclaw/canvas/lightweight-charts.js", ".openclaw/canvas/manifest.json", ".openclaw/canvas/metamask-connect.html", ".openclaw/canvas/metamask-skill.html", ".openclaw/canvas/trade-results.html", ".openclaw/canvas/trades-test.html", ".openclaw/canvas/wdk-skill.html", ".openclaw/workspace-ig/AGENTS.md", ".openclaw/workspace-ig/api-config.json", ".openclaw/workspace-ig/BOOTSTRAP.md", ".openclaw/workspace-ig/BRAINSTORM.md", ".openclaw/workspace-ig/canvas/chart.min.js", ".openclaw/workspace-ig/canvas/gann-bot-status.html", ".openclaw/workspace-ig/CLAWSCRIPT-RULES.md", ".openclaw/workspace-ig/config.json", ".openclaw/workspace-ig/dashboard.json", ".openclaw/workspace-ig/fetch_data.sh", ".openclaw/workspace-ig/get_ig_account.sh", ".openclaw/workspace-ig/headers.txt", ".openclaw/workspace-ig/HEARTBEAT.md", ".openclaw/workspace-ig/IDENTITY.md", ".openclaw/workspace-ig/ig_prices.sh", ".openclaw/workspace-ig/IG_TRADING.md", ".openclaw/workspace-ig/market.json", ".openclaw/workspace-ig/.openclaw/canvas/gann-bot-status.html", ".openclaw/workspace-ig/.openclaw/canvas/ig-bot-status.html", ".openclaw/workspace-ig/.openclaw/canvas/ig-strategy-snapshot.json", ".openclaw/workspace-ig/.openclaw/canvas/manifest.json", ".openclaw/workspace-ig/.openclaw/cookies.txt", ".openclaw/workspace-ig/.openclaw/ig-config.json", ".openclaw/workspace-ig/.openclaw/ig-monitor-config.json", ".openclaw/workspace-ig/.openclaw/ig-strategy.json", ".openclaw/workspace-ig/.openclaw/workspace-state.json", ".openclaw/workspace-ig/PROREALTIME_CODE_RULES.md", ".openclaw/workspace-ig/skills/clawscript/SKILL.md", ".openclaw/workspace-ig/SKILLS-IG.md", ".openclaw/workspace-ig/SOUL.md", ".openclaw/workspace-ig/status.json", ".openclaw/workspace-ig/STRATEGIES.md", ".openclaw/workspace-ig/TOOLS.md", ".openclaw/workspace-ig/trades.json", ".openclaw/workspace-ig/USER.md", ".openclaw/workspace-ig/WARSTRATEGY.md"];
var APP_FILES = ["AGENTS.md", "ceo-proxy.cjs", "clawscript-installer/docs/clawscript-docs.html", "clawscript-installer/docs/CLAWSCRIPT.md", "clawscript-installer/editor/clawscript-editor.html", "clawscript-installer/editor/ig-clawscript-flow.js", "clawscript-installer/editor/ig-clawscript-ui.js", "clawscript-installer/examples/custom-btctest-strategy.cjs", "clawscript-installer/.gitignore", "clawscript-installer/install-node.cjs", "clawscript-installer/install.ps1", "clawscript-installer/install.sh", "clawscript-installer/lib/clawscript-ai-handler.cjs", "clawscript-installer/lib/clawscript-parser.cjs", "clawscript-installer/lib/indicators.cjs", "clawscript-installer/lib/openclaw-automation.cjs", "clawscript-installer/lib/openclaw-ext.cjs", "clawscript-installer/lib/openclaw/openclaw-ai.cjs", "clawscript-installer/lib/openclaw/openclaw-automation.cjs", "clawscript-installer/lib/openclaw/openclaw-channels.cjs", "clawscript-installer/lib/openclaw/openclaw-chat.cjs", "clawscript-installer/lib/openclaw/openclaw-data.cjs", "clawscript-installer/lib/openclaw/openclaw-nomad.cjs", "clawscript-installer/lib/openclaw/openclaw-tools.cjs", "clawscript-installer/lib/test-clawscript-pipeline.cjs", "clawscript-installer/LICENSE", "clawscript-installer/package.json", "clawscript-installer/README.md", "clawscript-installer/screenshots/clawscript-flow-builder.png", "clawscript-installer/screenshots/clawscript-full-editor.png", "clawscript-installer/screenshots/clawscript-simulation.png", "clawscript-installer/serve.cjs", "clawscript-installer/strategies/base-strategy.cjs", "clawscript-installer/strategies/index.cjs", "clawscript-installer/sync-and-push.sh", "clawscript-installer/templates/bourse-trackers.cs", "clawscript-installer/templates/btc-scalper.cs", "clawscript-installer/templates/ema-crossover.cs", "clawscript-installer/templates/mean-reversion.cs", "clawscript-installer/templates/multi-indicator.cs", "clawscript-installer/templates/rsi-simple.cs", "clawscript-installer/templates/sentiment-scan.cs", "clawscript-installer/test/test-clawscript-parser.cjs", "clawscript-installer/test/test-clawscript-pipeline.cjs", "clawscript-installer/uninstall.ps1", "clawscript-installer/uninstall.sh", "clawscript-installer/update.ps1", "clawscript-installer/update.sh", "clawscript-installer/VERSION", "docs/IG_TRADING_SETUP.md", "docs/images/backtest-chart.png", "docs/images/ig-bot-status.png", "docs/images/ig-dashboard.png", "docs/images/ig-skills.png", "docs/images/processes-bots.png", "docs/reference/templates/AGENTS.md", "docs/reference/templates/BOOTSTRAP.md", "docs/reference/templates/TOOLS.md", "openclaw.json", "README.md", "skills/binance-btc-feed/references/binance-ws-api.md", "skills/binance-btc-feed/scripts/binance-ws.cjs", "skills/binance-btc-feed/SKILL.md", "skills/binance-stream/references/binance-streams.md", "skills/binance-stream/scripts/multi-ws.cjs", "skills/binance-stream/SKILL.md", "skills/bots/binance-receiver.cjs", "skills/bots/clawscript-parser.cjs", "skills/bots/clawscript-runner.cjs", "skills/bots/ig-optimization-agent.cjs", "skills/bots/ig-scalper-backtest.cjs", "skills/bots/ig-scalper-db.cjs", "skills/bots/ig-scalper-engine.cjs", "skills/bots/ig-signal-monitor.cjs", "skills/bots/ig-trading-bot.cjs", "skills/bots/indicators.cjs", "skills/bots/openclaw-ai.cjs", "skills/bots/openclaw-automation.cjs", "skills/bots/openclaw-channels.cjs", "skills/bots/openclaw-chat.cjs", "skills/bots/openclaw-data.cjs", "skills/bots/openclaw-nomad.cjs", "skills/bots/openclaw-tools.cjs", "skills/bots/strategies/arbitrage-scalper-strategy.cjs", "skills/bots/strategies/base-strategy.cjs", "skills/bots/strategies/breakout-strategy.cjs", "skills/bots/strategies/carry-trade-strategy.cjs", "skills/bots/strategies/custom-bourse-index-trackers-strategy-strategy.cjs", "skills/bots/strategies/custom-btctest-strategy.cjs", "skills/bots/strategies/donchian-trend-strategy.cjs", "skills/bots/strategies/grid-trader-strategy.cjs", "skills/bots/strategies/hybrid-ml-strategy.cjs", "skills/bots/strategies/index.cjs", "skills/bots/strategies/market-making-strategy.cjs", "skills/bots/strategies/mean-reversion-strategy.cjs", "skills/bots/strategies/momentum-scalper-strategy.cjs", "skills/bots/strategies/news-spike-strategy.cjs", "skills/bots/strategies/options-linked-strategy.cjs", "skills/bots/strategies/pairs-trading-strategy.cjs", "skills/bots/strategies/portfolio-optimizer-strategy.cjs", "skills/bots/strategies/position-trading-strategy.cjs", "skills/bots/strategies/scalper-strategy.cjs", "skills/bots/strategies/seasonal-trader-strategy.cjs", "skills/bots/strategies/sentiment-trader-strategy.cjs", "skills/bots/strategies/swing-trading-strategy.cjs", "skills/bots/strategies/trend-following-strategy.cjs", "skills/bots/strategies/value-investing-strategy.cjs", "skills/bots/strategies/volatility-breakout-strategy.cjs", "skills/bots/test-btctest-strategy.cjs", "skills/bots/test-clawscript-parser.cjs", "skills/bots/test-clawscript-pipeline.cjs", "skills/bots/trade-claw-engine.cjs", "skills/clawscript/CLAWSCRIPT-AI-REFERENCE.md", "skills/clawscript/CLAWSCRIPT.md", "skills/clawscript/STRATEGY-PERFORMANCE-RULEBOOK.md", "skills/clawscript/TRADING-BOT-RULEBOOK.md", "skills/ig-backtest/backtest.cjs", "skills/ig-backtest/SKILL.md", "skills/ig-market-data/SKILL.md", "skills/ig-signal-monitor/SKILL.md", "skills/ig-trade-verify/SKILL.md", "skills/ig-trading-bot/SKILL.md", "skills/ig-trading/IG-COMMANDS.md", "skills/ig-trading/IG-PL-CALCULATION.md", "skills/ig-trading/SKILL.md", "skills/medallion-fund/dashboard/index.html", "skills/medallion-fund/SKILL.md", "skills/openclaw-ext.cjs", "skills/prorealtime-ig-adapter/SKILL.md", "src/auto-reply/reply/inbound-meta.ts", "src/gateway/control-ui-csp.ts", "start.sh", "ui/public/login.html", "ui/public/model-config.html", "ui/public/model-config.js", "ui/public/nav-inject.js", "ui/public/processes.html", "ui/public/processes.js", "ui/public/workers.html", "ui/public/workers.js", "ui/src/styles/chat/grouped.css", "ui/src/styles/chat/layout.css", "ui/src/styles/chat/text.css", "ui/src/ui/app-render.ts", "ui/src/ui/app.ts", "ui/src/ui/chat/grouped-render.ts", "ui/src/ui/controllers/chat.ts", "ui/src/ui/icons.ts", "ui/src/ui/markdown.ts", "ui/src/ui/views/chat.ts", "ui/src/ui/voice/voice-manager.ts", "start-mechanicus.bat", "start-mechanicus.ps1", ".env.example"];

function detectOpenClaw() {
  var candidates = [];
  if (process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, "npm", "node_modules", "openclaw"));
  }
  var home = os.homedir();
  candidates.push(
    path.join(home, "openclaw"),
    path.resolve(".")
  );
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (fs.existsSync(c) && fs.existsSync(path.join(c, "package.json"))) {
      return path.resolve(c);
    }
  }
  return null;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function download(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error("HTTP " + res.statusCode));
      }
      var ch = [];
      res.on("data", function(c) { ch.push(c); });
      res.on("end", function() { resolve(Buffer.concat(ch)); });
    }).on("error", reject);
  });
}

async function installFile(rel, destRoot) {
  var url = REPO_BASE + encodeURIComponent(rel).replace(/%2F/g, "/");
  var dstPath = path.join(destRoot, rel);
  ensureDir(path.dirname(dstPath));
  var data = await download(url);
  fs.writeFileSync(dstPath, data);
  var sz = fs.statSync(dstPath).size;
  if (sz <= 0) throw new Error("Empty file");
  return sz;
}

async function main() {
  console.log("");
  console.log("[!] OpenClaw Mechanicus Installer v" + VERSION);
  console.log("    ========================================");

  var appRoot = detectOpenClaw();
  if (!appRoot) {
    console.error("[X] OpenClaw not found.");
    process.exit(1);
  }

  var homeDir = os.homedir();
  var homeRoot = homeDir;

  console.log("[+] App directory:  " + appRoot);
  console.log("[+] Home directory: " + homeDir);
  console.log("[+] App files:  " + APP_FILES.length);
  console.log("[+] Home files: " + HOME_FILES.length + " (.openclaw/canvas, workspace-ig, etc.)");
  console.log("");

  var ok = 0;
  var fail = 0;
  var failList = [];

  console.log("--- Installing App files to: " + appRoot + " ---");
  console.log("");
  for (var i = 0; i < APP_FILES.length; i++) {
    var rel = APP_FILES[i];
    try {
      var sz = await installFile(rel, appRoot);
      console.log("[OK]   " + rel + " (" + sz + "b)");
      ok++;
    } catch (e) {
      console.log("[FAIL] " + rel + " - " + e.message);
      fail++;
      failList.push(rel);
    }
  }

  console.log("");
  console.log("--- Installing Home files to: " + path.join(homeDir, ".openclaw") + " ---");
  console.log("");
  for (var j = 0; j < HOME_FILES.length; j++) {
    var rel2 = HOME_FILES[j];
    try {
      var sz2 = await installFile(rel2, homeRoot);
      console.log("[OK]   " + rel2 + " (" + sz2 + "b)");
      ok++;
    } catch (e) {
      console.log("[FAIL] " + rel2 + " - " + e.message);
      fail++;
      failList.push(rel2);
    }
  }

  var navSrc = path.join(appRoot, "ui", "public", "nav-inject.js");
  var distDir = path.join(appRoot, "dist");
  var ctrlDir = path.join(distDir, "control-ui");
  if (fs.existsSync(navSrc)) {
    if (fs.existsSync(distDir)) {
      fs.copyFileSync(navSrc, path.join(distDir, "nav-inject.js"));
      console.log("[+] Copied nav-inject.js -> dist/");
    }
    if (fs.existsSync(ctrlDir)) {
      fs.copyFileSync(navSrc, path.join(ctrlDir, "nav-inject.js"));
      console.log("[+] Copied nav-inject.js -> dist/control-ui/");
    }
  }

  var uiPublic = path.join(appRoot, "ui", "public");
  var controlUiFiles = ["model-config.html", "model-config.js", "workers.html", "workers.js", "processes.html", "processes.js", "login.html", "nav-inject.js"];
  if (fs.existsSync(ctrlDir)) {
    console.log("");
    console.log("--- Copying control-ui files to dist/control-ui/ ---");
    for (var cf = 0; cf < controlUiFiles.length; cf++) {
      var src = path.join(uiPublic, controlUiFiles[cf]);
      var dst = path.join(ctrlDir, controlUiFiles[cf]);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log("[+] " + controlUiFiles[cf] + " -> dist/control-ui/");
      }
    }
  }
  if (fs.existsSync(distDir)) {
    for (var df = 0; df < controlUiFiles.length; df++) {
      var src2 = path.join(uiPublic, controlUiFiles[df]);
      var dst2 = path.join(distDir, controlUiFiles[df]);
      if (fs.existsSync(src2)) {
        fs.copyFileSync(src2, dst2);
      }
    }
    console.log("[+] Copied control files to dist/");
  }

  console.log("");
  console.log("--- Patching gateway CSP for local compatibility ---");
  var gatewayChunks = [];
  try {
    var distFiles = fs.readdirSync(distDir);
    for (var gi = 0; gi < distFiles.length; gi++) {
      if (distFiles[gi].indexOf("gateway-cli-") === 0 && distFiles[gi].endsWith(".js")) {
        gatewayChunks.push(path.join(distDir, distFiles[gi]));
      }
    }
  } catch (_) {}
  for (var gc = 0; gc < gatewayChunks.length; gc++) {
    var gw = fs.readFileSync(gatewayChunks[gc], "utf8");
    var changed = false;
    if (gw.indexOf("\"script-src 'self'\"") !== -1) {
      gw = gw.replace("\"script-src 'self'\"", "\"script-src 'self' 'unsafe-inline'\"");
      changed = true;
    }
    if (gw.indexOf("\"connect-src 'self' ws: wss:\"") !== -1) {
      gw = gw.replace("\"connect-src 'self' ws: wss:\"", "\"connect-src 'self' http://127.0.0.1:* http://localhost:* ws: wss:\"");
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(gatewayChunks[gc], gw);
      console.log("[+] Patched CSP in: " + path.basename(gatewayChunks[gc]));
    }
  }
  if (gatewayChunks.length === 0) {
    console.log("[!] No gateway-cli-*.js found in dist/ — CSP not patched");
  }

  var htmlTargets = [
    path.join(appRoot, "index.html"),
    path.join(distDir, "index.html"),
    path.join(ctrlDir, "index.html")
  ];
  for (var h = 0; h < htmlTargets.length; h++) {
    if (fs.existsSync(htmlTargets[h])) {
      var html = fs.readFileSync(htmlTargets[h], "utf8");
      if (html.indexOf("nav-inject.js") === -1) {
        html = html.replace("</head>", '<script src="nav-inject.js" defer></script></head>');
        if (html.indexOf("nav-inject.js") === -1) {
          html = html.replace("</body>", '<script src="nav-inject.js"></script></body>');
        }
        fs.writeFileSync(htmlTargets[h], html);
        console.log("[+] Patched: " + htmlTargets[h]);
      }
    }
  }
  var allHtmlInCtrl = ["model-config.html", "workers.html", "processes.html"];
  for (var ah = 0; ah < allHtmlInCtrl.length; ah++) {
    var targets = [path.join(ctrlDir, allHtmlInCtrl[ah]), path.join(distDir, allHtmlInCtrl[ah])];
    for (var t = 0; t < targets.length; t++) {
      if (fs.existsSync(targets[t])) {
        var pg = fs.readFileSync(targets[t], "utf8");
        if (pg.indexOf("nav-inject.js") === -1) {
          pg = pg.replace("</head>", '<script src="nav-inject.js" defer></script></head>');
          if (pg.indexOf("nav-inject.js") === -1) {
            pg = pg.replace("</body>", '<script src="nav-inject.js"></script></body>');
          }
          fs.writeFileSync(targets[t], pg);
          console.log("[+] Patched nav into: " + targets[t]);
        }
      }
    }
  }

  console.log("");
  console.log("========================================");
  console.log("  INSTALLED:  " + ok + " files");
  console.log("  FAILED:     " + fail + " files");
  if (fail === 0) {
    console.log("  STATUS:     ALL " + ok + " FILES VERIFIED");
  } else {
    console.log("  STATUS:     ERRORS (" + fail + ")");
    for (var f = 0; f < failList.length; f++) {
      console.log("    - " + failList[f]);
    }
  }
  console.log("========================================");
  console.log("");

  var pkgPath = path.join(appRoot, "package.json");
  if (fs.existsSync(pkgPath)) {
    var pkg = fs.readFileSync(pkgPath, "utf8");
    var missing = [];
    if (pkg.indexOf('"pg"') === -1) missing.push("pg");
    if (pkg.indexOf('"lightstreamer-client-node"') === -1) missing.push("lightstreamer-client-node");
    if (missing.length > 0) {
      console.log("[!] Missing: npm install " + missing.join(" "));
    }
  }

  var envExample = path.join(appRoot, ".env.example");
  var envFile = path.join(appRoot, ".env");
  if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
    fs.copyFileSync(envExample, envFile);
    console.log("[+] Created .env from .env.example — EDIT THIS FILE WITH YOUR CREDENTIALS");
  }

  console.log("");
  console.log("  HOW TO START:");
  console.log("    1. Edit your credentials in: " + path.join(appRoot, ".env"));
  console.log("    2. cd \"" + appRoot + "\"");
  console.log("    3. openclaw gateway");
  console.log("    4. Open: http://localhost:18789");
  console.log("");
  console.log("  ALTERNATIVE (with IG trading proxy):");
  console.log("    3. .\\start-mechanicus.ps1   (or start-mechanicus.bat)");
  console.log("    4. Open: http://localhost:5000");
  console.log("");
}

main().catch(function(e) { console.error("FATAL:", e); process.exit(1); });
