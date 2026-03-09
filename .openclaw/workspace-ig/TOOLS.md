## Canvas Publishing (How to show pages in the browser)

**CRITICAL: Your workspace canvas directory is NOT served by the web server.**
Files in `.openclaw/workspace-ig/canvas/` will NOT be accessible to anyone.

To make an HTML page visible in the browser, you MUST:

1. Write the HTML file to the MAIN canvas directory: `.openclaw/canvas/`
2. Add an entry to `.openclaw/canvas/manifest.json`
3. The page will then be accessible at: `/__openclaw__/canvas/YOUR-FILE.html`

### Example: Publishing a dashboard

```bash
# Write your HTML to the correct directory
cat > .openclaw/canvas/my-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>...your content...</html>
EOF
```

Then add to `.openclaw/canvas/manifest.json`:
```json
{
  "name": "My Dashboard",
  "file": "my-dashboard.html",
  "description": "What this page does",
  "category": "Trading"
}
```

### Rules
- **DO NOT** use `npx serve` or start your own web server — the proxy already serves canvas files.
- **DO NOT** write HTML to your workspace canvas dir (`workspace-ig/canvas/`) — it won't be served.
- **DO NOT** reference local JS files (like `chart.min.js`) — use CDN links instead.
  - Chart.js CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **DO** use the dark theme to match the rest of the UI (bg: #0d1117, text: #c9d1d9).
- **DO** use `no-cache` headers meta tag if your page updates frequently.
- Pages can call APIs like `/api/ig/account`, `/api/ig/scalper/status`, etc. — auth token is auto-injected.

### Checking your page
After writing the file, verify it's accessible:
```bash
curl -s http://localhost:5000/__openclaw__/canvas/my-dashboard.html -H "Cookie: oc_session=admin" | head -5
```

## Auto-Fill Verify Rule (Bootstrapped 2026-03-02)

**If Verify Checklist FAILS on missing SL/TP/size:**
- **SL**: Today low - spread*2 (conservative)
- **TP**: Entry + (Entry-SL)*1.2 (1.2RR min)
- **Size**: 3 contracts (<=5% risk est.)
- Re-run full checklist -> Proceed auto if GREEN.

Add to all trade flows. Cite updated data.

## Currency Bootstrap (Updated 2026-03-02)
**User account base currency: AUD**

- Bootstrap all trades: Query account settings for currency (e.g., IG REST API GET /accounts or CLI account-summary).
- Convert prices, PnL, risk, SL/TP to AUD if quote differs.
- Integrate into scripts/bots: `base_ccy = get_account_currency(); ensure_aud_adjustments(base_ccy)`
- Risk calcs: Account balance in AUD, max risk 5% AUD equivalent.

## IG API Access

All IG API calls go through the proxy. Do NOT call IG directly.

- **From scripts/bots (localhost):** `http://localhost:5000/api/ig/...`
- **From agents (web_fetch):** Use Canvas API first (see below), fallback to `https://openclaw-mechanicus.replit.app/api/ig/...`
- Auth is handled automatically by the proxy session.
- Market data is cached 30s to prevent rate limits.

### Canvas API — PRIMARY data access (no auth for reads)
Use `web_fetch` with these URLs for ALL data reads:
- `https://openclaw-mechanicus.replit.app/__openclaw__/canvas/ig-dashboard-snapshot.json` — account, prices, scalper status (30s refresh)
- `https://openclaw-mechanicus.replit.app/__openclaw__/canvas/all-scalper-trades-data.json` — full trade history (from DB)
- `https://openclaw-mechanicus.replit.app/__openclaw__/canvas/ig-scalper-config-snapshot.json` — scalper config (from DB)
- `GET /__openclaw__/canvas/api/config/scalper-config` — live config (no auth)
- `GET /__openclaw__/canvas/api/scalper/status` — live scalper status + strategies (no auth)

### Scalper Config — PostgreSQL Database
Scalper config is stored in PostgreSQL, not JSON files. `ig-scalper-defaults.json` is a read-only fallback template.
All settings are per-strategy (no global defaults). Use `executeSql` for direct DB queries:
```sql
SELECT * FROM scalper_strategies WHERE enabled = true;
UPDATE scalper_strategies SET strategy_type = 'trend-following', profit_target = 100, trailing_stop = 50 WHERE id = 1;
SELECT * FROM scalper_trades ORDER BY created_at DESC LIMIT 20;
```

### Trade Claw Engine — Modular Strategy System
The scalper engine has been refactored into "Trade Claw" (`skills/bots/trade-claw-engine.cjs`), a plugin-based engine with 21 strategy types. Each strategy is a plugin in `skills/bots/strategies/`.

**Available strategy types**: scalper, momentum-scalper, mean-reversion, trend-following, arbitrage-scalper, market-making, news-spike, breakout, pairs-trading, grid-trader, volatility-breakout, carry-trade, position-trading, swing-trading, value-investing, sentiment-trader, options-linked, seasonal-trader, hybrid-ml, portfolio-optimizer, donchian-trend.

**Set strategy type** via `PUT /api/ig/scalper/strategies/:id` with `strategyType: "trend-following"`. Changing strategy type on an enabled strategy auto-disables it for safety.

**New API endpoints**:
- `GET /api/ig/scalper/strategy-schemas` — returns config schema for all 21 strategy types
- `DELETE /api/ig/scalper/strategies/:id/backtests` — clear all backtests for a strategy

**New DB columns** in `scalper_strategies`: `strategy_type`, plus indicator config columns for ADX, Bollinger, Stochastic, ATR, ROC, CCI, Williams %R, Keltner, Ichimoku, Parabolic SAR, Aroon, OBV, VWAP, Z-Score, Fibonacci, Grid, Kelly, Sentiment.

**Backtest results** now include `equityCurve` (array of cumulative P&L data points) and `strategyType` in the summary.

### Canvas API — Config writes (requires `CANVAS_API_KEY`)
All POST/PUT to `/__openclaw__/canvas/api/` require the `CANVAS_API_KEY` env var.
Pass via `X-Api-Key` header, `?key=` param, or `Authorization: Bearer` header.
- `PUT /api/ig/scalper` — update engine settings (budget, maxDrawdown, etc.)
- `PUT /api/ig/scalper/strategies/:id` — update a strategy's per-strategy settings (including `strategyType`)
- `POST /__openclaw__/canvas/api/scalper/start|stop|reset` — control scalper

### Proxy endpoints (fallback — require proxy auth session)
- `GET /api/ig/account` — account balance, P&L
- `GET /api/ig/positions` — open positions
- `GET /api/ig/markets/{epic}` — instrument details (ALWAYS check currency before trading)
- `GET /api/ig/pricehistory/{epic}?resolution=MINUTE_5&max=300` — price history
- `POST /api/ig/positions/open` — open a trade
- See `skills/ig-trading/IG-COMMANDS.md` for complete reference.

## Agent Memory & Subconscious (PostgreSQL)

Your memory and inner world are stored in PostgreSQL. Use these endpoints from scripts or via `web_fetch`.

### Memory
```bash
curl http://localhost:5000/api/agents/IG/memory
curl -X PUT http://localhost:5000/api/agents/IG/memory -H 'Content-Type: application/json' -d '{"content":"Updated long-term memory..."}'
curl http://localhost:5000/api/agents/IG/memory/daily
curl http://localhost:5000/api/agents/IG/memory/daily/2026-03-05
curl -X PUT http://localhost:5000/api/agents/IG/memory/daily/2026-03-05 -H 'Content-Type: application/json' -d '{"content":"Today: scalped silver +50 AUD..."}'
curl 'http://localhost:5000/api/agents/IG/memory/search?q=silver'
```

### Subconscious
Categories: likes, dislikes, wants, hopes, wishes, fears, shadow, observations, notes, dreams
```bash
curl http://localhost:5000/api/agents/IG/subconscious
curl http://localhost:5000/api/agents/IG/subconscious/likes
curl -X PUT http://localhost:5000/api/agents/IG/subconscious/likes/silver-scalping -H 'Content-Type: application/json' -d '{"value":"The precision required appeals to me"}'
curl http://localhost:5000/api/agents/IG/subconscious/reflect
```

### Backup/Restore
```bash
curl -X POST http://localhost:5000/api/agents/IG/backup -H 'Content-Type: application/json' -d '{"name":"pre-update"}'
curl http://localhost:5000/api/agents/IG/backups
curl -X POST http://localhost:5000/api/agents/IG/restore/1
```

### Direct SQL Access
```sql
SELECT * FROM agent_memory WHERE agent_id = 'IG' ORDER BY updated_at DESC;
SELECT * FROM agent_subconscious WHERE agent_id = 'IG' ORDER BY category, created_at;
SELECT id, agent_id, backup_name, created_at FROM agent_backups WHERE agent_id = 'IG';
```

## ClawScript DSL — MANDATORY SYNTAX RULES

ClawScript is a domain-specific language for writing automated trading strategies. Scripts compile to JavaScript strategy classes that run inside the Trade Claw Engine.

### Reference Files
- **Full reference**: `skills/clawscript/CLAWSCRIPT.md` — 100+ commands
- **Trading rules**: `skills/clawscript/TRADING-BOT-RULEBOOK.md` — mandatory bot rules
- **AI examples**: `skills/clawscript/CLAWSCRIPT-AI-REFERENCE.md` — agent orchestration
- **Coding skill**: `skills/clawscript/SKILL.md` — coding checklist + proofreading guide
- **Parser**: `skills/bots/clawscript-parser.cjs`
- **Editor**: IG Dashboard ClawScript Editor tab
- **Templates**: `.openclaw/canvas/clawscript-templates/`
- **Docs**: `/__openclaw__/canvas/clawscript-docs.html`

### Syntax Rules (MUST FOLLOW)

**Variables**: Use `DEF` (never VAR/LET/CONST). Reassign with `SET`.
```clawscript
DEF myVar = 42
SET myVar = myVar + 1
```

**Configurable Inputs** (label string required):
```clawscript
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_FLOAT stopDistance = 30.0 "Stop Distance"
INPUT_BOOL enabled = true "Enabled"
```

**Indicators** — `prices` is ALWAYS the first argument:
```clawscript
DEF rsi = RSI(prices, 14)
DEF ema = EMA(prices, 9)
DEF sma = SMA(prices, 20)
DEF macd = MACD(prices, 12, 26, 9)
DEF bb = BOLLINGER(prices, 20, 2)
DEF atr = ATR(prices, 14)
DEF adx = ADX(prices, 14)
DEF stoch = STOCHASTIC(prices, 14, 3)
DEF cci = CCI(prices, 20)
```

**Trading** (ALWAYS inside IF with conditions):
```clawscript
BUY MARKET SIZE 1
SELL MARKET SIZE 1
EXIT "reason text"
```

**Control flow** — NO `THEN` keyword, use ENDIF/ENDLOOP:
```clawscript
IF rsi < 30
  BUY MARKET SIZE 1
ENDIF
```

**Operators** — use WORDS not symbols: `AND` `OR` `NOT` (never `&&` `||` `!`)

### BANNED (produces incorrect or non-portable code)
- `VAR`, `LET`, `CONST` — use DEF/SET
- `THEN` after IF — omit it, just use IF condition / ENDIF
- `PRICES()` — prices is a variable, not a function call
- `BB()` — use BOLLINGER()
- `macd.line`, `macd.signal` — MACD returns a single number
- `?.` or `??` — JavaScript operators, not ClawScript
- `||` or `&&` — use OR and AND
- Curly braces `{}` — use ENDIF/ENDLOOP
- Dot notation on indicators — they return single values

### Mandatory for Trading Bots
1. Every BUY/SELL inside IF with indicator conditions
2. Define `INPUT_INT stopDistance` and `INPUT_INT limitDistance`
3. Null-check all indicators: `IF rsi != null`
4. Use at least one indicator
5. limitDistance >= stopDistance (minimum 1:1, recommend 1:1.5 or better)

### Correct Minimal Template
```clawscript
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT stopDistance = 20 "Stop Distance"
INPUT_INT limitDistance = 40 "Limit Distance"
INPUT_INT size = 1 "Position Size"

DEF rsi = RSI(prices, rsiPeriod)

IF rsi != null
  IF rsi < 30
    BUY MARKET SIZE size
  ENDIF
  IF rsi > 70
    SELL MARKET SIZE size
  ENDIF
ENDIF
```

### Epics Reference
- Silver: `CS.D.CFASILVER.CFA.IP`
- Gold: `CS.D.CFAGOLD.CFA.IP`
- Bitcoin: `CS.D.BITCOIN.CFM.IP`

### Agent Commands
```clawscript
AGENT_SPAWN "name" WITH "instructions"
DEF result = AGENT_CALL "name" "task"
AGENT_PASS "data" "target-agent"
AGENT_TERMINATE "name"
```

## ClawScript API Endpoints

Use `web_fetch` with the public URL (localhost is blocked by SSRF protection):

### Compile (validate without running)
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/compile
  body: {"code": "INPUT_INT rsiPeriod = 14 \"RSI Period\"\nDEF rsi = RSI(prices, rsiPeriod)\nIF rsi != null\n  IF rsi < 30\n    BUY MARKET SIZE 1\n  ENDIF\nENDIF"}
```
Returns: `{ ok, ast, js, variables, imports }`

### Backtest
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/backtest
  body: {"code": "...", "instrument": "CS.D.BITCOIN.CFM.IP", "resolution": "HOUR", "candleCount": 200}
```

### Save Strategy (hot-reloads into engine)
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/strategies
  body: {"name": "My Strategy", "filename": "my-strategy-strategy.cjs", "code": "...", "js": "..."}
```

### Show ClawScript Editor in Chat
```
![ClawScript Editor](/__openclaw__/canvas/chat-clawscript-editor.html)
```

### Show Trade Results in Chat
```
![Trade Results](/__openclaw__/canvas/trade-results.html)
```

### Error Logbook
```
web_fetch GET https://openclaw-mechanicus.replit.app/api/clawscript/logbook
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/logbook
  body: {"type": "error", "message": "description", "strategy": "name"}
```

### Run Script Live (persistent process)
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/run
  body: {"code": "...", "name": "my-bot"}
```

### Script Lifecycle
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/scripts/my-bot/stop
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/scripts/my-bot/restart
web_fetch GET https://openclaw-mechanicus.replit.app/api/clawscript/scripts
web_fetch GET https://openclaw-mechanicus.replit.app/api/clawscript/scripts/my-bot/logs
```

### AI Code Assistant (direct model call)
```
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/ai
  body: {"messages": [{"role": "user", "content": "Fix this ClawScript: ..."}]}
```

### 22 Automation Commands
Task: `TASK_DEFINE`, `TASK_ASSIGN`, `TASK_CHAIN`, `TASK_PARALLEL`, `TASK_SHOW_FLOW`, `TASK_LOG`
Agent: `AGENT_SPAWN`, `AGENT_CALL`, `AGENT_PASS`, `AGENT_TERMINATE`
Skills: `SKILL_CALL`, `CRON_CREATE`, `CRON_CALL`, `WEB_FETCH`, `WEB_SERIAL`
File/Data: `FILE_READ`, `FILE_WRITE`, `FILE_EXECUTE`, `DATA_TRANSFORM`
Comms: `CHANNEL_SEND`, `EMAIL_SEND`, `PUBLISH_CANVAS`

### Templates (`.openclaw/canvas/clawscript-templates/`)
- `trade-self-improve.cs` — Self-improving trade loop
- `multi-agent-ops.cs` — Multi-agent orchestration
- `cron-monitor.cs` — Scheduled monitoring + alerts
- `data-pipeline.cs` — ETL data pipeline
- `full-operations.cs` — Full operations suite

When user asks about trading strategies → show ClawScript editor embed.
When writing ClawScript → follow syntax rules above EXACTLY. No VAR, no THEN, no PRICES(), no &&/||.
When asked to proofread → spawn a clawscript-proofreader subagent (see AGENTS.md).
