# IG Trading Skills Reference

Six skills are available for IG Group CFD trading. Credentials are stored in `.openclaw/ig-config.json` with demo/live profiles, managed via the Config page (`/model-config.html` > IG Trading tab) or the `/api/ig/config` REST API. Env vars (`IG_API_KEY`, `IG_USERNAME`, etc.) are only used as seed on first run — after that, `ig-config.json` is the single source of truth. The CEO proxy auto-manages IG sessions (login at startup, token refresh every 4 min).

## 1. ig-trading (Trading via CEO Proxy API)

All trading goes through the CEO proxy at `http://localhost:5000/api/ig/...` with `Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN`. Authentication is fully automatic — you NEVER manage CST/XST tokens.

- **List positions**: `GET /api/ig/positions`
- **Open position**: `POST /api/ig/positions/open` — body: `{ epic, direction, size, stopDistance, limitDistance }`
- **Close position**: `POST /api/ig/positions/close` — body: `{ dealId }` (direction/size auto-detected)
- **Update position**: `PUT /api/ig/positions/update` — body: `{ dealId, stopLevel, limitLevel }`
- **List working orders**: `GET /api/ig/workingorders`
- **Create working order**: `POST /api/ig/workingorders/create` — body: `{ epic, direction, size, level, type, stopDistance, limitDistance }`
- **Update working order**: `PUT /api/ig/workingorders/update` — body: `{ dealId, level, size }`
- **Delete working order**: `DELETE /api/ig/workingorders/delete` — body: `{ dealId }`
- **Account info**: `GET /api/ig/account`
- **Confirm deal**: `GET /api/ig/confirms/{dealReference}`
- **Session status**: `GET /api/ig/session`
- **Force refresh**: `POST /api/ig/session/refresh`

**CRITICAL**: Always check `ok` field AND `confirmation.dealStatus`. Only `"ACCEPTED"` means the trade went through. NEVER say "trade executed" without this confirmation.

## 2. ig-market-data (Market Data via CEO Proxy API)

- **Search markets**: `GET /api/ig/markets?q=bitcoin` or `GET /api/ig/markets?searchTerm=gold`
- **Market details**: `GET /api/ig/markets/{epic}` (e.g. `/api/ig/markets/CS.D.BITCOIN.CFD.IP`)
- **Live prices**: `GET /api/ig/prices?epics=CS.D.BITCOIN.CFD.IP,CS.D.USCGC.TODAY.IP`
- **Price history**: `GET /api/ig/pricehistory/{epic}?resolution=HOUR&max=50`
- **Resolutions**: SECOND, MINUTE, MINUTE_2, MINUTE_3, MINUTE_5, MINUTE_10, MINUTE_15, MINUTE_30, HOUR, HOUR_2, HOUR_3, HOUR_4, DAY, WEEK, MONTH
- **Watchlists**: `GET /api/ig/watchlists` | `GET /api/ig/watchlists/{id}`
- **Activity history**: `GET /api/ig/activity?from=2026-02-01T00:00:00&to=2026-02-28T00:00:00`
- **Transaction history**: `GET /api/ig/history?type=ALL&from=2026-02-01T00:00:00&to=2026-02-28T00:00:00`
- **Market navigation**: `GET /api/ig/marketnavigation` | `GET /api/ig/marketnavigation/{nodeId}`
- **Stream prices**: `GET /api/ig/stream/prices` | `GET /api/ig/stream/status`

### Common EPICs

| Market | EPIC |
|---|---|
| Bitcoin | `CS.D.BITCOIN.CFD.IP` |
| Gold (US $10) | `CS.D.USCGC.TODAY.IP` |
| Gold (AUD $1) | `CS.D.CFAGOLD.CFA.IP` |
| Silver (AUD $1) | `CS.D.CFASILVER.CFA.IP` |
| EUR/USD | `CS.D.EURUSD.CFD.IP` |
| GBP/USD | `CS.D.GBPUSD.CFD.IP` |
| AUD/USD | `CS.D.AUDUSD.CFD.IP` |
| USD/JPY | `CS.D.USDJPY.CFD.IP` |
| FTSE 100 | `IX.D.FTSE.CFD.IP` |
| S&P 500 | `IX.D.SPTRD.CFD.IP` |
| DAX 40 | `IX.D.DAX.CFD.IP` |
| Nasdaq 100 | `IX.D.NASDAQ.CFD.IP` |
| Crude Oil | `CC.D.CL.UME.IP` |

EPICs can change — use `/api/ig/markets?q=` to verify.

## 3. ig-signal-monitor (Price Signal Monitor Bot)

Autonomous script that polls prices and detects signals.

- **Config**: `.openclaw/ig-monitor-config.json`
- **Alerts output**: `.openclaw/ig-alerts.json`
- **Test**: `node skills/bots/ig-signal-monitor.cjs --test`
- **Run**: auto-starts via bot registry (or `node skills/bots/ig-signal-monitor.cjs`)
- **Stop**: Set `"enabled": false` in config or kill process

### Config format
```json
{
  "instruments": [
    {"epic": "CS.D.EURUSD.CFD.IP", "name": "EUR/USD"},
    {"epic": "IX.D.FTSE.CFD.IP", "name": "FTSE 100", "breakoutAbove": 8200, "breakoutBelow": 7800, "maxSpread": 2}
  ],
  "signals": {
    "dropPercent": 0.5,
    "spikePercent": 0.5,
    "windowSeconds": 30
  },
  "intervalSeconds": 15,
  "enabled": true
}
```

### Signal types
- `drop` — price fell by >= dropPercent% within window
- `spike` — price rose by >= spikePercent% within window
- `breakout_above` — mid price crossed above breakoutAbove level
- `breakout_below` — mid price crossed below breakoutBelow level
- `spread` — bid/offer spread exceeds maxSpread

## 4. ig-trading-bot (Automated Strategy Execution Bot)

Autonomous script that executes trades based on strategy rules.

- **Config**: `.openclaw/ig-strategy.json`
- **Log**: `.openclaw/ig-bot-log.json`
- **Dashboard**: `.openclaw/canvas/ig-bot-status.html`
- **Test**: `node skills/bots/ig-trading-bot.cjs --test`
- **Run**: auto-starts via bot registry (or `node skills/bots/ig-trading-bot.cjs`)
- **Stop**: Set `"enabled": false` in config or kill process

### Strategy config format
```json
{
  "strategies": [
    {
      "instrument": "CS.D.EURUSD.CFD.IP",
      "name": "EUR/USD Long Dip Buy",
      "direction": "BUY",
      "entryBelow": 1.0800,
      "stopDistance": 15,
      "limitDistance": 30,
      "size": 0.5,
      "enabled": true
    }
  ],
  "maxOpenPositions": 3,
  "maxRiskPercent": 1,
  "checkIntervalSeconds": 15,
  "enabled": false
}
```

### Risk controls
- Max open positions enforced
- Max % of account balance risked per trade
- No duplicate positions on same instrument
- All trades require stop-loss and take-profit
- Master `enabled` switch must be true
- Bot reads signal alerts from ig-signal-monitor automatically

## 5. ig-backtest (Strategy Backtesting)

Backtest trading strategies against historical IG price data with charts and trade lists.

- **Script**: `node skills/ig-backtest/backtest.cjs`
- **Run**: `node skills/ig-backtest/backtest.cjs --epic CS.D.EURUSD.CFD.IP --resolution HOUR --points 500 --strategy bb-squeeze --name "EUR/USD BB Squeeze"`
- **Test**: `node skills/ig-backtest/backtest.cjs --test --points 200 --strategy ma-crossover`

### Parameters
- `--epic` — IG EPIC (required unless --test)
- `--resolution` — MINUTE, MINUTE_5, MINUTE_15, MINUTE_30, HOUR, HOUR_4, DAY, WEEK
- `--points` — Data points to fetch (200-1000, respect API limits)
- `--strategy` — `bb-squeeze`, `rsi-reversal`, `ma-crossover`, `breakout`
- `--stopLoss` — Stop loss in points (default: 20)
- `--takeProfit` — Take profit in points (default: 40)
- `--size` — Position size (default: 1)
- `--direction` — `both`, `long`, `short`
- `--name` — Display name

### Output
- Interactive HTML page with Chart.js equity curve + price chart with trade markers
- Full trade list with entry/exit, P&L, reason
- Stats: win rate, Sharpe, drawdown, profit factor
- Auto-registered in canvas manifest
- Results summary in `.openclaw/canvas/ig-backtest-results.json`

### IG API Data Limits
- Demo accounts may limit to ~500 points per request
- Higher resolutions (SECOND, MINUTE) may have shorter history
- Don't run many backtests in rapid succession (API rate limits)

## 6. ig-trade-verify (Trade Proof Reader) — MANDATORY

Pre-trade verification that MUST pass before any position is opened.

- **Skill**: `ig-trade-verify`
- **When**: Before ANY trade — manual, bot, or agent-recommended
- **Checks**: Market tradeable, spread limits, stop-loss set, risk:reward ≥ 1:1, position sizing ≤ 1% risk, no duplicates, entry price sanity (anti-hallucination), account margin
- **Log**: `.openclaw/canvas/ig-verify-log.json` (last 50 verifications)
- **Rule**: If ANY check fails, the trade MUST NOT execute

### Anti-Hallucination Safeguards
- Always fetch LIVE prices before trading — never use remembered values
- Entry prices must be within 5% of live mid price or trade is blocked
- All numbers must come from API responses, not from memory
- If unsure about any value, re-fetch from the API

### Bot Integration
The trading bot (`bot.cjs`) automatically runs the proof reader before every trade. Blocked trades are logged with full reasoning.

## Combined Dashboard (MANDATORY READING)

**CHECK THIS BEFORE EVERY TRADING DECISION:**
`https://be1a940b-924a-449d-ae02-954c66974b04-00-39aqxi9w7wyw6.picard.replit.dev/__openclaw__/canvas/ig-dashboard.html`

The dashboard includes:
- Price charts (Chart.js) with bid/offer/mid over time
- Signal monitor status and recent alerts
- Trading bot status and active strategies
- Open positions with entry vs current price
- Bot activity log
- **Trade verification audit trail** — shows all proof reader results

Data sources (auto-refreshes every 30 seconds):
- `ig-price-history.json` — last 100 ticks per instrument (from signal monitor)
- `ig-strategy-snapshot.json` — current strategy config (from bot)
- `ig-bot-log-snapshot.json` — recent bot activity (from bot)
- `ig-verify-log.json` — trade verification results (from bot proof reader)

### Dashboard Workflow
1. READ dashboard data before any trade analysis
2. CITE specific numbers from the dashboard in your reasoning
3. UPDATE canvas pages with new analysis, backtests, or research
4. LINK the dashboard URL in every trade-related response
5. Register new pages in `.openclaw/canvas/manifest.json`

Always link with full URL: `https://be1a940b-924a-449d-ae02-954c66974b04-00-39aqxi9w7wyw6.picard.replit.dev/__openclaw__/canvas/filename.html`.
**NEVER invent URLs** — if unsure of the domain, read the `REPLIT_DEV_DOMAIN` environment variable.

## 7. IG API Test Protocol

When the user asks you to "test IG", "run IG tests", or "check if everything works", run this full protocol. Use the smallest crypto sizes to minimise cost (BTC 0.05, ETH 0.5). All calls require `Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN`.

### Phase 1 — Read-Only (no risk)

Run all of these and report pass/fail for each:

| # | Test | Endpoint | Pass criteria |
|---|------|----------|---------------|
| 1 | Account info | `GET /api/ig/account` | Returns `accounts` array with balance |
| 2 | Session status | `GET /api/ig/session` | Returns `status` field |
| 3 | List positions | `GET /api/ig/positions` | Returns `positions` array |
| 4 | List working orders | `GET /api/ig/workingorders` | Returns `workingOrders` array |
| 5 | Search markets | `GET /api/ig/markets?q=bitcoin` | Returns `markets` array with results |
| 6 | Market detail | `GET /api/ig/markets/CS.D.BITCOIN.CFD.IP` | Returns `instrument` and `snapshot` |
| 7 | Live prices | `GET /api/ig/prices?epics=CS.D.BITCOIN.CFD.IP` | Returns bid/offer for epic |
| 8 | Price history | `GET /api/ig/pricehistory/CS.D.BITCOIN.CFD.IP?resolution=HOUR&max=5` | Returns `prices` array |
| 9 | Watchlists | `GET /api/ig/watchlists` | Returns `watchlists` array |
| 10 | Activity | `GET /api/ig/activity?from=2026-01-01T00:00:00&to=2026-12-31T00:00:00` | Returns `activities` array |
| 11 | Transactions | `GET /api/ig/history?type=ALL&from=2026-01-01T00:00:00&to=2026-12-31T00:00:00` | Returns `transactions` array |
| 12 | Stream status | `GET /api/ig/stream/status` | Returns `status` field |
| 13 | Config | `GET /api/ig/config` | Returns `activeProfile` and `profiles` |
| 14 | Test connection | `POST /api/ig/config/test` body: `{"profile":"demo"}` | Returns `ok: true` with account info |

### Phase 2 — Trading (uses demo money)

Only run if Phase 1 all passed. Use BTC (0.05) or ETH (0.5) — smallest sizes.

| # | Test | Action | Pass criteria |
|---|------|--------|---------------|
| 15 | Open BUY | `POST /api/ig/positions/open` body: `{"epic":"CS.D.BITCOIN.CFD.IP","direction":"BUY","size":0.05,"stopDistance":800,"limitDistance":1600}` | `dealStatus === "ACCEPTED"` |
| 16 | Update stop/limit | `PUT /api/ig/positions/update` body: `{"dealId":"<from 15>","stopLevel":<entry-1200>,"limitLevel":<entry+2000>}` | `dealStatus === "ACCEPTED"`, status `"AMENDED"` |
| 17 | Close position | `POST /api/ig/positions/close` body: `{"dealId":"<from 15>"}` | `dealStatus === "ACCEPTED"`, status `"CLOSED"` |
| 18 | Open SELL | `POST /api/ig/positions/open` body: `{"epic":"CS.D.ETHUSD.CFD.IP","direction":"SELL","size":0.5,"stopDistance":50,"limitDistance":100}` | `dealStatus === "ACCEPTED"` |
| 19 | Close SELL | `POST /api/ig/positions/close` body: `{"dealId":"<from 18>"}` | `dealStatus === "ACCEPTED"` |
| 20 | Create working order | `POST /api/ig/workingorders/create` body: `{"epic":"CS.D.BITCOIN.CFD.IP","direction":"BUY","size":0.05,"level":50000,"type":"LIMIT","stopDistance":800,"limitDistance":1600,"currencyCode":"USD","timeInForce":"GOOD_TILL_CANCELLED"}` | `dealStatus === "ACCEPTED"` |
| 21 | Delete working order | `DELETE /api/ig/workingorders/delete` body: `{"dealId":"<from 20>"}` | Returns `ok: true` |
| 22 | Session refresh | `POST /api/ig/session/refresh` body: `{}` | Returns response without error |

### Phase 3 — Cleanup & Report

1. `GET /api/ig/positions` — confirm NO test positions remain open
2. `GET /api/ig/workingorders` — confirm NO test orders remain
3. Print summary table: test #, name, pass/fail, notes
4. If any test failed, report the HTTP status and error body

### Error Recovery

If a test fails, follow this recovery guide before reporting failure:

| Error | Cause | Recovery |
|-------|-------|----------|
| 401 "Not authenticated" | Stale gateway token or missing auth header | Ensure `Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN` header is set. Try `POST /api/ig/session/refresh`. |
| 403 "exceeded-api-key-allowance" | IG rate limit | Wait 60 seconds, retry once. If still fails, wait 5 minutes. |
| 400 "validation.not-null-conditional.request" | Missing required field in body | Check that `expiry`, `size` (as string), `direction`, `timeInForce` are all present. |
| 400 "validation..." | Body field wrong type or value | `size` must be a string (not number). `direction` must be uppercase BUY/SELL. `level` for working orders must be realistic. |
| 502 / non-JSON response | IG API returned HTML error page | The proxy couldn't parse IG response. Wait 30 seconds and retry. If persistent, IG may be blocking cloud IPs. |
| 503 "Service unavailable" | IG servers down or blocking IP | Not a credentials issue. Try again later. Check IG status page. |
| "REJECTED" dealStatus | Trade rejected by IG | Check `reason` field. Common: `MARKET_CLOSED` (weekend), `INSUFFICIENT_FUNDS`, `SIZE_TOO_SMALL`. |
| Connection refused | Proxy not running | Check that the workflow is started and port 5000 is listening. |
| `EDITS_ONLY` market status | Weekend/out-of-hours | Can only modify existing positions, not open new ones. Skip open/close tests and note "market closed". |

### Important Notes

- If `marketStatus` is not `TRADEABLE`, skip Phase 2 open/close tests (weekends, holidays) — report "SKIPPED: market closed" instead of failing
- Always clean up: close any positions and delete any orders you created during testing
- The test protocol takes about 30 seconds total on a working system
- Working order UPDATE test is excluded because IG requires `timeInForce` in updates which varies by instrument — test create + delete is sufficient
