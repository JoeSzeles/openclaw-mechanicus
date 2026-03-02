# IG Trading Commands — Quick Reference

All commands use `web_fetch` to `https://$REPLIT_DEV_DOMAIN/api/ig/...?_token=$OPENCLAW_GATEWAY_TOKEN`.
**IMPORTANT**:
- You MUST use the public URL (`https://$REPLIT_DEV_DOMAIN/...`), NOT `http://localhost:5000/...`. The `web_fetch` tool blocks localhost due to SSRF protection.
- You MUST include `?_token=$OPENCLAW_GATEWAY_TOKEN` as a query parameter for authentication (web_fetch does NOT support custom headers).
- Authentication with IG is handled automatically by the proxy. You NEVER need to call `/session` or manage CST/XST tokens.

---

## POSITIONS

### List Open Positions
```
GET /api/ig/positions
```
Returns: `{ positions: [{ position: { dealId, direction, size, level, currency, stopLevel, limitLevel, ... }, market: { epic, instrumentName, bid, offer, marketStatus, ... } }] }`

### Open Position (Market Order)
```
POST /api/ig/positions/open
{
  "epic": "CS.D.BITCOIN.CFD.IP",
  "direction": "BUY",
  "size": 0.5,
  "stopDistance": 100,
  "limitDistance": 200
}
```
Required: `epic`, `direction` (BUY/SELL), `size`
Optional: `stopDistance`, `limitDistance`, `stopLevel`, `limitLevel`, `currencyCode`, `orderType` (default MARKET), `expiry` (default "-"), `forceOpen` (default true), `guaranteedStop` (default false)

**CURRENCY WARNING**: `currencyCode` is NOT always AUD. You MUST fetch `GET /api/ig/markets/{epic}` first and read `instrument.currencies[0].name` to get the correct currency. Using the wrong currency will cause the trade to be REJECTED.
Returns: `{ ok: true/false, dealReference, confirmation: { dealId, dealStatus, level, size, direction, profit, ... } }`
**IMPORTANT**: Always check `ok` field AND `confirmation.dealStatus`. Only `ACCEPTED` means the trade went through.

### Close Position
```
POST /api/ig/positions/close
{ "dealId": "DIAAAAB1234ABC" }
```
Required: `dealId` (from positions list)
Optional: `direction`, `size` — auto-detected if omitted (closes full position)
Returns: `{ ok: true/false, confirmation: { dealStatus, profit, profitCurrency, ... } }`

### Update Position (Move Stop/Limit)
```
PUT /api/ig/positions/update
{
  "dealId": "DIAAAAB1234ABC",
  "stopLevel": 65000,
  "limitLevel": 70000
}
```
Required: `dealId`
Optional: `stopLevel`, `limitLevel`, `trailingStop`, `trailingStopDistance`, `trailingStopIncrement`

---

## WORKING ORDERS (Limit/Stop Orders)

### List Working Orders
```
GET /api/ig/workingorders
```

### Create Working Order
```
POST /api/ig/workingorders/create
{
  "epic": "CS.D.BITCOIN.CFD.IP",
  "direction": "BUY",
  "size": 0.5,
  "level": 60000,
  "type": "LIMIT",
  "stopDistance": 800,
  "limitDistance": 1600
}
```
Required: `epic`, `direction`, `size`, `level`, `type` (LIMIT or STOP)
Optional: `stopDistance`, `limitDistance`, `currencyCode`, `timeInForce` (GOOD_TILL_CANCELLED or GOOD_TILL_DATE), `goodTillDate`

### Update Working Order
```
PUT /api/ig/workingorders/update
{
  "dealId": "DIAAAAB1234ABC",
  "level": 59000,
  "size": 1.0
}
```

### Delete Working Order
```
DELETE /api/ig/workingorders/delete
{ "dealId": "DIAAAAB1234ABC" }
```

---

## ACCOUNT

### Account Info & Balance
```
GET /api/ig/account
```
Returns: `{ accounts: [{ accountId, accountName, balance: { balance, available, deposit, profitLoss }, currency, status, ... }] }`

---

## MARKET DATA

### Get Live Price (Single/Multiple)
```
GET /api/ig/prices?epics=CS.D.BITCOIN.CFD.IP,CS.D.USCGC.TODAY.IP
```

### Market Details (Full Info)
```
GET /api/ig/markets/CS.D.BITCOIN.CFD.IP
```
Returns: instrument details, dealing rules (min/max size, margin, spread), snapshot prices, market hours

### Search Markets
```
GET /api/ig/markets?q=bitcoin
GET /api/ig/markets?searchTerm=gold
```

### Browse Market Categories
```
GET /api/ig/marketnavigation
GET /api/ig/marketnavigation/{nodeId}
```

### Price History (Candles)
```
GET /api/ig/pricehistory/CS.D.BITCOIN.CFD.IP?resolution=HOUR&max=50
```
Resolutions: SECOND, MINUTE, MINUTE_2, MINUTE_3, MINUTE_5, MINUTE_10, MINUTE_15, MINUTE_30, HOUR, HOUR_2, HOUR_3, HOUR_4, DAY, WEEK, MONTH
Optional: `from`, `to` (ISO dates), `max` (number of candles)

### Watchlists
```
GET /api/ig/watchlists
GET /api/ig/watchlists/{watchlistId}
```

---

## HISTORY

### Transaction History (Closed Trades/P&L)
```
GET /api/ig/history?type=ALL&from=2026-02-01T00:00:00&to=2026-02-28T00:00:00
```
Types: ALL, ALL_DEAL, DEPOSIT, WITHDRAWAL

### Activity History (All Actions)
```
GET /api/ig/activity?from=2026-02-01T00:00:00&to=2026-02-28T00:00:00
```

---

## SESSION & STREAMING

### Check Session Status
```
GET /api/ig/session
```

### Force Session Refresh
```
POST /api/ig/session/refresh
```

### Get Streamed Prices (Fastest Price Source)
```
GET /api/ig/stream/prices
```
Returns: `{ streaming: true/false, prices: { "CS.D.CFAGOLD.CFA.IP": { bid, offer, mid, marketState, timestamp }, ... } }`
These are real-time Lightstreamer prices — much faster than REST polling. Use when speed matters.

### Stream Status (With Performance Metrics)
```
GET /api/ig/stream/status
```
Returns: `{ status, connectedEpics, streamingSource, liveStreamingActive, metrics: { updatesPerSec, avgIntervalMs, minIntervalMs, maxIntervalMs, totalUpdates, uptimeMs }, instruments: { [epic]: { bid, offer, mid, marketState, ageMs, updates } } }`
Use this to check streaming health, speed, and per-instrument update frequency.

### Connect/Disconnect Live Streaming
```
POST /api/ig/stream/connect-live
POST /api/ig/stream/disconnect-live
```
Live streaming connects independently to the live IG account for fast price data, decoupled from the active trading profile.

### Deal Confirmation
```
GET /api/ig/confirms/{dealReference}
```

---

## BOT MANAGEMENT

**IMPORTANT: Manage bots via API. NEVER delete bot files.**

### List Bots
```
GET /api/bots
```
Returns: `{ bots: [{ name, running, pid, uptime, ... }] }`

### Start/Stop Bot
```
POST /api/bots/{name}/start
POST /api/bots/{name}/stop
```
Bot names: `ig-trading-bot`, `ig-signal-monitor`, `binance-receiver`

---

## STRATEGY MANAGEMENT

### List Strategies
```
GET /api/ig/strategies
```
Returns: `{ enabled: true/false, strategies: [...] }`

### Create Strategy
```
POST /api/ig/strategies
{ "instrument": "CS.D.CFAGOLD.CFA.IP", "name": "Gold Dip Buy", "direction": "BUY", "entryBelow": 5300, "stopDistance": 50, "limitDistance": 100, "size": 0.5, "enabled": true }
```

### Update Strategy
```
PUT /api/ig/strategies/{index}
{ "name": "New Name", "entryBelow": 5250, "stopDistance": 60 }
```

### Delete Strategy
```
DELETE /api/ig/strategies/{index}
```

### Toggle Strategy On/Off
```
POST /api/ig/strategies/{index}/toggle
```

### Attach Strategy to Deal
```
POST /api/ig/strategies/{index}/attach
{ "dealId": "DIAAAAB1234ABC" }
```

### Detach Strategy from Deal
```
POST /api/ig/strategies/{index}/detach
```

### Pause/Resume Strategy
```
POST /api/ig/strategies/{index}/pause
```

### Master Bot Enable/Disable
```
POST /api/ig/strategies/global
{ "enabled": true }
```

---

## STRATEGY TEMPLATES

### List Templates
```
GET /api/ig/strategy-templates
```

### Save Template
```
POST /api/ig/strategy-templates
{ "filename": "gold-dip-buy", "strategy": { ... } }
```

### Delete Template
```
DELETE /api/ig/strategy-templates/{filename}
```

---

## PROOF READER CONFIG

### Get Config
```
GET /api/ig/proofread
```

### Update Config
```
PUT /api/ig/proofread
{ "enabled": true, "maxRiskPct": 2, "allowDuplicatePositions": false, ... }
```

Fields: `enabled`, `maxStalenessSeconds`, `spreadLimitPctHigh`, `spreadLimitPctLow`, `spreadThresholdMid`, `minRiskReward`, `maxRiskPct`, `maxEntryDeviationPct`, `allowDuplicatePositions`, `requireStopLoss`, `requireTakeProfit`

---

## COMMON EPICS

| Instrument | Epic | Currency |
|---|---|---|
| Bitcoin ($1) | CS.D.BITCOIN.CFD.IP | USD |
| Gold (US, $10) | CS.D.USCGC.TODAY.IP | USD |
| Gold (AUD, $1) | CS.D.CFAGOLD.CFA.IP | AUD |
| Gold Futures (US, $10) | CS.D.CFDGOLD.CFDGC.IP | USD |
| Silver (AUD, $1) | CS.D.CFASILVER.CFA.IP | AUD |
| EUR/USD | CS.D.EURUSD.CFD.IP | USD |
| GBP/USD | CS.D.GBPUSD.CFD.IP | USD |
| AUD/USD | CS.D.AUDUSD.CFD.IP | USD |
| USD/JPY | CS.D.USDJPY.CFD.IP | JPY |
| FTSE 100 | IX.D.FTSE.CFD.IP | GBP |
| DAX 40 | IX.D.DAX.CFD.IP | EUR |
| S&P 500 | IX.D.SPTRD.CFD.IP | USD |
| Nasdaq 100 | IX.D.NASDAQ.CFD.IP | USD |
| Crude Oil | CC.D.CL.UME.IP | USD |

**WARNING**: Currencies listed above are for reference only. ALWAYS verify by fetching `GET /api/ig/markets/{epic}` and reading `instrument.currencies[0].name` before placing a trade.

---

## ERROR HANDLING

Every mutating endpoint returns `{ ok: true/false, ... }`.
- `ok: true` + `confirmation.dealStatus: "ACCEPTED"` = **success**
- `ok: true` + `confirmation.dealStatus: "REJECTED"` = **IG rejected the trade** (check `confirmation.reason`)
- `ok: false` + `error: "..."` = **API error** (check `statusCode`)
- HTTP 400 = missing/invalid request parameters
- HTTP 401 = bad auth token
- HTTP 500 = server error

**Common IG rejection reasons:**
- `MARKET_CLOSED` / `EDITS_ONLY` — market is closed (weekend for non-crypto)
- `INSUFFICIENT_FUNDS` — not enough margin
- `POSITION_NOT_AVAILABLE_TO_CLOSE` — dealId wrong or already closed
- `MINIMUM_ORDER_SIZE_ERROR` — size too small
- `MAX_POSITIONS_REACHED` — too many open positions
- `ATTACHED_ORDER_LEVEL_ERROR` — stop/limit too close to entry
- `error.public-api.exceeded-api-key-allowance` — rate limited, wait 60s

**CRITICAL**: When reporting trade results to the user, you MUST:
1. Check the `ok` field
2. If `ok: true`, check `confirmation.dealStatus` — only "ACCEPTED" means success
3. If `ok: false`, report the exact `error` message
4. NEVER say "trade executed" unless `dealStatus` is "ACCEPTED"
5. Include the `dealId` and `level` (fill price) when confirming a trade

**WHEN A TRADE IS REJECTED — DO NOT GIVE UP:**
1. Read the rejection `reason` from the response
2. Diagnose the issue (wrong currency? size too small? market closed? stop too tight?)
3. Fix the parameters
4. Retry immediately — do NOT ask the user what to do unless the fix is ambiguous
5. Common fix: wrong `currencyCode` → re-fetch market details → read `instrument.currencies[0].name` → retry

---

## FILE PROTECTION

**NEVER delete, overwrite, or recreate these files:**
- `skills/bots/ig-trading-bot.cjs`
- `skills/bots/ig-signal-monitor.cjs`
- `skills/bots/binance-receiver.cjs`
- `.openclaw/ig-strategy.json` (use API instead)
- `.openclaw/ig-proofread-config.json` (use API instead)
- `.openclaw/ig-monitor-config.json`
- `.openclaw/canvas/ig-dashboard.html`
- `ceo-proxy.cjs`

Use APIs to manage strategies, bots, and config. Use `POST /api/bots/{name}/stop` to stop bots, not file deletion.
