'use strict';
var https = require("https");
var fs = require("fs");
var path = require("path");
var os = require("os");

var REPO_BASE = "https://raw.githubusercontent.com/JoeSzeles/openclaw-mechanicus-patches/main/files/";
var VERSION = "2026.3.10";
var FILES_LIST = ["AGENTS.md", "ceo-proxy.cjs", "clawscript-installer/docs/clawscript-docs.html", "clawscript-installer/docs/CLAWSCRIPT.md", "clawscript-installer/editor/clawscript-editor.html", "clawscript-installer/editor/ig-clawscript-flow.js", "clawscript-installer/editor/ig-clawscript-ui.js", "clawscript-installer/examples/custom-btctest-strategy.cjs", "clawscript-installer/.gitignore", "clawscript-installer/install-node.cjs", "clawscript-installer/install.ps1", "clawscript-installer/install.sh", "clawscript-installer/lib/clawscript-ai-handler.cjs", "clawscript-installer/lib/clawscript-parser.cjs", "clawscript-installer/lib/indicators.cjs", "clawscript-installer/lib/openclaw-automation.cjs", "clawscript-installer/lib/openclaw-ext.cjs", "clawscript-installer/lib/openclaw/openclaw-ai.cjs", "clawscript-installer/lib/openclaw/openclaw-automation.cjs", "clawscript-installer/lib/openclaw/openclaw-channels.cjs", "clawscript-installer/lib/openclaw/openclaw-chat.cjs", "clawscript-installer/lib/openclaw/openclaw-data.cjs", "clawscript-installer/lib/openclaw/openclaw-nomad.cjs", "clawscript-installer/lib/openclaw/openclaw-tools.cjs", "clawscript-installer/lib/test-clawscript-pipeline.cjs", "clawscript-installer/LICENSE", "clawscript-installer/package.json", "clawscript-installer/README.md", "clawscript-installer/screenshots/clawscript-flow-builder.png", "clawscript-installer/screenshots/clawscript-full-editor.png", "clawscript-installer/screenshots/clawscript-simulation.png", "clawscript-installer/serve.cjs", "clawscript-installer/strategies/base-strategy.cjs", "clawscript-installer/strategies/index.cjs", "clawscript-installer/sync-and-push.sh", "clawscript-installer/templates/bourse-trackers.cs", "clawscript-installer/templates/btc-scalper.cs", "clawscript-installer/templates/ema-crossover.cs", "clawscript-installer/templates/mean-reversion.cs", "clawscript-installer/templates/multi-indicator.cs", "clawscript-installer/templates/rsi-simple.cs", "clawscript-installer/templates/sentiment-scan.cs", "clawscript-installer/test/test-clawscript-parser.cjs", "clawscript-installer/test/test-clawscript-pipeline.cjs", "clawscript-installer/uninstall.ps1", "clawscript-installer/uninstall.sh", "clawscript-installer/update.ps1", "clawscript-installer/update.sh", "clawscript-installer/VERSION", "docs/IG_TRADING_SETUP.md", "docs/images/backtest-chart.png", "docs/images/ig-bot-status.png", "docs/images/ig-dashboard.png", "docs/images/ig-skills.png", "docs/images/processes-bots.png", "docs/reference/templates/AGENTS.md", "docs/reference/templates/BOOTSTRAP.md", "docs/reference/templates/TOOLS.md", ".openclaw/canvas/all-scalper-trades-data.json", ".openclaw/canvas/all-scalper-trades.html", ".openclaw/canvas/binance-test.html", ".openclaw/canvas/chat-clawscript-editor.html", ".openclaw/canvas/clawscript-docs.html", ".openclaw/canvas/clawscript-editor.html", ".openclaw/canvas/clawscript-logbook.html", ".openclaw/canvas/gann-bot-status.html", ".openclaw/canvas/gold-backtest.html", ".openclaw/canvas/ig-alerts-snapshot.json", ".openclaw/canvas/ig-backtest-ui.js", ".openclaw/canvas/ig-bot-log-snapshot.json", ".openclaw/canvas/ig-bot-status.html", ".openclaw/canvas/ig-clawscript-flow.js", ".openclaw/canvas/ig-clawscript-ui.js", ".openclaw/canvas/ig-config-ui.js", ".openclaw/canvas/ig-dashboard.html", ".openclaw/canvas/ig-dashboard-snapshot.json", ".openclaw/canvas/ig-history-ui.js", ".openclaw/canvas/ig-live-prices.js", ".openclaw/canvas/ig-logs-settings-ui.js", ".openclaw/canvas/ig-monitor-config-snapshot.json", ".openclaw/canvas/ig-price-history.json", ".openclaw/canvas/ig-scalper-config-snapshot.json", ".openclaw/canvas/ig-scalper-ui.js", ".openclaw/canvas/ig-strategy-manager.js", ".openclaw/canvas/ig-strategy-snapshot.json", ".openclaw/canvas/ig-verify-log.json", ".openclaw/canvas/index.html", ".openclaw/canvas/lightweight-charts.js", ".openclaw/canvas/manifest.json", ".openclaw/canvas/metamask-connect.html", ".openclaw/canvas/metamask-skill.html", ".openclaw/canvas/trade-results.html", ".openclaw/canvas/trades-test.html", ".openclaw/canvas/wdk-skill.html", "openclaw.json", ".openclaw/workspace-ig/AGENTS.md", ".openclaw/workspace-ig/api-config.json", ".openclaw/workspace-ig/BOOTSTRAP.md", ".openclaw/workspace-ig/BRAINSTORM.md", ".openclaw/workspace-ig/canvas/chart.min.js", ".openclaw/workspace-ig/canvas/gann-bot-status.html", ".openclaw/workspace-ig/CLAWSCRIPT-RULES.md", ".openclaw/workspace-ig/config.json", ".openclaw/workspace-ig/dashboard.json", ".openclaw/workspace-ig/fetch_data.sh", ".openclaw/workspace-ig/get_ig_account.sh", ".openclaw/workspace-ig/headers.txt", ".openclaw/workspace-ig/HEARTBEAT.md", ".openclaw/workspace-ig/IDENTITY.md", ".openclaw/workspace-ig/ig_prices.sh", ".openclaw/workspace-ig/IG_TRADING.md", ".openclaw/workspace-ig/market.json", ".openclaw/workspace-ig/.openclaw/canvas/gann-bot-status.html", ".openclaw/workspace-ig/.openclaw/canvas/ig-bot-status.html", ".openclaw/workspace-ig/.openclaw/canvas/ig-strategy-snapshot.json", ".openclaw/workspace-ig/.openclaw/canvas/manifest.json", ".openclaw/workspace-ig/.openclaw/cookies.txt", ".openclaw/workspace-ig/.openclaw/ig-config.json", ".openclaw/workspace-ig/.openclaw/ig-monitor-config.json", ".openclaw/workspace-ig/.openclaw/ig-strategy.json", ".openclaw/workspace-ig/.openclaw/workspace-state.json", ".openclaw/workspace-ig/PROREALTIME_CODE_RULES.md", ".openclaw/workspace-ig/skills/clawscript/SKILL.md", ".openclaw/workspace-ig/SKILLS-IG.md", ".openclaw/workspace-ig/SOUL.md", ".openclaw/workspace-ig/status.json", ".openclaw/workspace-ig/STRATEGIES.md", ".openclaw/workspace-ig/TOOLS.md", ".openclaw/workspace-ig/trades.json", ".openclaw/workspace-ig/USER.md", ".openclaw/workspace-ig/WARSTRATEGY.md", "README.md", "skills/binance-btc-feed/references/binance-ws-api.md", "skills/binance-btc-feed/scripts/binance-ws.cjs", "skills/binance-btc-feed/SKILL.md", "skills/binance-stream/references/binance-streams.md", "skills/binance-stream/scripts/multi-ws.cjs", "skills/binance-stream/SKILL.md", "skills/bots/binance-receiver.cjs", "skills/bots/clawscript-parser.cjs", "skills/bots/clawscript-runner.cjs", "skills/bots/ig-optimization-agent.cjs", "skills/bots/ig-scalper-backtest.cjs", "skills/bots/ig-scalper-db.cjs", "skills/bots/ig-scalper-engine.cjs", "skills/bots/ig-signal-monitor.cjs", "skills/bots/ig-trading-bot.cjs", "skills/bots/indicators.cjs", "skills/bots/openclaw-ai.cjs", "skills/bots/openclaw-automation.cjs", "skills/bots/openclaw-channels.cjs", "skills/bots/openclaw-chat.cjs", "skills/bots/openclaw-data.cjs", "skills/bots/openclaw-nomad.cjs", "skills/bots/openclaw-tools.cjs", "skills/bots/strategies/arbitrage-scalper-strategy.cjs", "skills/bots/strategies/base-strategy.cjs", "skills/bots/strategies/breakout-strategy.cjs", "skills/bots/strategies/carry-trade-strategy.cjs", "skills/bots/strategies/custom-bourse-index-trackers-strategy-strategy.cjs", "skills/bots/strategies/custom-btctest-strategy.cjs", "skills/bots/strategies/donchian-trend-strategy.cjs", "skills/bots/strategies/grid-trader-strategy.cjs", "skills/bots/strategies/hybrid-ml-strategy.cjs", "skills/bots/strategies/index.cjs", "skills/bots/strategies/market-making-strategy.cjs", "skills/bots/strategies/mean-reversion-strategy.cjs", "skills/bots/strategies/momentum-scalper-strategy.cjs", "skills/bots/strategies/news-spike-strategy.cjs", "skills/bots/strategies/options-linked-strategy.cjs", "skills/bots/strategies/pairs-trading-strategy.cjs", "skills/bots/strategies/portfolio-optimizer-strategy.cjs", "skills/bots/strategies/position-trading-strategy.cjs", "skills/bots/strategies/scalper-strategy.cjs", "skills/bots/strategies/seasonal-trader-strategy.cjs", "skills/bots/strategies/sentiment-trader-strategy.cjs", "skills/bots/strategies/swing-trading-strategy.cjs", "skills/bots/strategies/trend-following-strategy.cjs", "skills/bots/strategies/value-investing-strategy.cjs", "skills/bots/strategies/volatility-breakout-strategy.cjs", "skills/bots/test-btctest-strategy.cjs", "skills/bots/test-clawscript-parser.cjs", "skills/bots/test-clawscript-pipeline.cjs", "skills/bots/trade-claw-engine.cjs", "skills/clawscript/CLAWSCRIPT-AI-REFERENCE.md", "skills/clawscript/CLAWSCRIPT.md", "skills/clawscript/STRATEGY-PERFORMANCE-RULEBOOK.md", "skills/clawscript/TRADING-BOT-RULEBOOK.md", "skills/ig-backtest/backtest.cjs", "skills/ig-backtest/SKILL.md", "skills/ig-market-data/SKILL.md", "skills/ig-signal-monitor/SKILL.md", "skills/ig-trade-verify/SKILL.md", "skills/ig-trading-bot/SKILL.md", "skills/ig-trading/IG-COMMANDS.md", "skills/ig-trading/IG-PL-CALCULATION.md", "skills/ig-trading/SKILL.md", "skills/medallion-fund/dashboard/index.html", "skills/medallion-fund/SKILL.md", "skills/openclaw-ext.cjs", "skills/prorealtime-ig-adapter/SKILL.md", "src/auto-reply/reply/inbound-meta.ts", "src/gateway/control-ui-csp.ts", "start.sh", "ui/public/login.html", "ui/public/model-config.html", "ui/public/model-config.js", "ui/public/nav-inject.js", "ui/public/processes.html", "ui/public/processes.js", "ui/public/workers.html", "ui/public/workers.js", "ui/src/styles/chat/grouped.css", "ui/src/styles/chat/layout.css", "ui/src/styles/chat/text.css", "ui/src/ui/app-render.ts", "ui/src/ui/app.ts", "ui/src/ui/chat/grouped-render.ts", "ui/src/ui/controllers/chat.ts", "ui/src/ui/icons.ts", "ui/src/ui/markdown.ts", "ui/src/ui/views/chat.ts", "ui/src/ui/voice/voice-manager.ts"];

function detectOpenClaw() {
  var home = os.homedir();
  var candidates = [
    path.join(process.env.APPDATA || "", "npm", "node_modules", "openclaw"),
    path.join(home, "openclaw"),
    path.join(home, ".openclaw"),
    path.resolve(".")
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(path.join(candidates[i], "package.json"))) return path.resolve(candidates[i]);
  }
  return null;
}

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function download(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      if (res.statusCode === 301 || res.statusCode === 302) return download(res.headers.location).then(resolve, reject);
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      var ch = []; res.on("data", function(c) { ch.push(c); }); res.on("end", function() { resolve(Buffer.concat(ch)); });
    }).on("error", reject);
  });
}

async function main() {
  console.log("");
  console.log("[!] OpenClaw Mechanicus Installer v" + VERSION);
  var root = detectOpenClaw();
  if (!root) { console.error("[X] OpenClaw not found. Run from your OpenClaw folder."); process.exit(1); }
  console.log("[+] Target: " + root);
  console.log("[+] Downloading " + FILES_LIST.length + " files...");
  console.log("");
  var ok = 0, fail = 0;
  for (var i = 0; i < FILES_LIST.length; i++) {
    var rel = FILES_LIST[i];
    var dstPath = path.join(root, rel);
    ensureDir(path.dirname(dstPath));
    try {
      var data = await download(REPO_BASE + rel);
      fs.writeFileSync(dstPath, data);
      var sz = fs.statSync(dstPath).size;
      if (sz > 0) { console.log("[OK] " + rel + " (" + sz + "b)"); ok++; }
      else { throw new Error("Empty file"); }
    } catch(e) { console.log("[FAIL] " + rel + " - " + e.message); fail++; }
  }
  var idx = path.join(root, "index.html");
  if (fs.existsSync(idx)) {
    var html = fs.readFileSync(idx, "utf8");
    if (html.indexOf("nav-inject.js") === -1) {
      html = html.replace("</body>", '<script src="/nav-inject.js"></script></body>');
      fs.writeFileSync(idx, html);
      console.log("");
      console.log("[+] Navigation injected into index.html");
    }
  }
  console.log("");
  console.log("========================================");
  console.log("  INSTALLED: " + ok + " files");
  console.log("  FAILED:    " + fail + " files");
  if (fail === 0) console.log("  STATUS:    ALL FILES VERIFIED");
  else console.log("  STATUS:    ERRORS DETECTED");
  console.log("========================================");
  console.log("");
  console.log("[!] Run: npm install pg lightstreamer-client-node");
  console.log("[!] Then restart OpenClaw.");
  console.log("");
}

main().catch(function(e) { console.error("FATAL:", e); process.exit(1); });
