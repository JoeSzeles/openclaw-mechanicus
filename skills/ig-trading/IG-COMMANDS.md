# IG Trading Commands — Quick Reference

All commands use `web_fetch` to `http://localhost:5000/api/ig/...` with header `Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN`.
Authentication is handled automatically by the proxy. You NEVER need to call `/session` or manage CST/XST tokens.

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
Optional: `stopDistance`, `limitDistance`, `stopLevel`, `limitLevel`, `currencyCode` (default USD), `orderType` (default MARKET), `expiry` (default "-"), `forceOpen` (default true), `guaranteedStop` (default false)
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

### Get Streamed Prices
```
GET /api/ig/stream/prices
```

### Stream Status
```
GET /api/ig/stream/status
```

### Deal Confirmation
```
GET /api/ig/confirms/{dealReference}
```

---

## COMMON EPICS

| Instrument | Epic |
|---|---|
| Bitcoin ($1) | CS.D.BITCOIN.CFD.IP |
| Gold (US, $10) | CS.D.USCGC.TODAY.IP |
| Gold (AUD, $1) | CS.D.CFAGOLD.CFA.IP |
| Silver (AUD, $1) | CS.D.CFASILVER.CFA.IP |
| EUR/USD | CS.D.EURUSD.CFD.IP |
| GBP/USD | CS.D.GBPUSD.CFD.IP |
| AUD/USD | CS.D.AUDUSD.CFD.IP |
| USD/JPY | CS.D.USDJPY.CFD.IP |
| FTSE 100 | IX.D.FTSE.CFD.IP |
| DAX 40 | IX.D.DAX.CFD.IP |
| S&P 500 | IX.D.SPTRD.CFD.IP |
| Nasdaq 100 | IX.D.NASDAQ.CFD.IP |
| Crude Oil | CC.D.CL.UME.IP |

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
