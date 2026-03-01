---
name: ig-trading
description: IG Group Trading API via proxy — trade CFDs, manage positions, view account. Use for "IG trade", "open position", "close position", "sell BTC", "IG account", "IG balance".
---
# IG Trading API Skill

Trade CFDs on the IG Group platform. Supports forex, indices, commodities, crypto.
All endpoints go through the local proxy which handles IG authentication automatically.

**IMPORTANT**: Use `web_fetch` with `http://localhost:5000/api/ig/...` for ALL IG operations. The proxy manages sessions, tokens, and rate limiting. Do NOT call IG APIs directly.

## 1. List Open Positions

```
GET http://localhost:5000/api/ig/positions
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
```

Returns `{ positions: [{ position: { dealId, direction, size, level, ... }, market: { epic, instrumentName, bid, offer, ... } }, ...] }`

## 2. Open a Position (Market Order)

```
POST http://localhost:5000/api/ig/positions/open
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
Content-Type: application/json

{
  "epic": "CS.D.BITCOIN.CFD.IP",
  "direction": "BUY",
  "size": 0.5,
  "currencyCode": "USD",
  "stopDistance": 100,
  "limitDistance": 200
}
```

Required fields: `epic`, `direction` (BUY/SELL), `size`
Optional: `stopDistance`, `limitDistance`, `stopLevel`, `limitLevel`, `currencyCode` (default USD), `orderType` (default MARKET), `expiry` (default "-"), `forceOpen` (default true)

Returns `{ ok: true, dealReference: "...", confirmation: { dealId, dealStatus, direction, size, level, ... } }` on success.
Returns `{ ok: false, error: "...", statusCode: N }` on failure.

## 3. Close a Position

```
POST http://localhost:5000/api/ig/positions/close
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
Content-Type: application/json

{
  "dealId": "DIAAAAB1234ABC"
}
```

Required: `dealId` (get from positions list)
Optional: `direction` (auto-detected from position if omitted), `size` (auto-detected if omitted), `orderType` (default MARKET)

The proxy automatically looks up the position to determine the correct close direction and size. Just pass the `dealId`.

Returns `{ ok: true, dealReference: "...", confirmation: { dealId, dealStatus, ... } }` on success.

## 4. Get Deal Confirmation

```
GET http://localhost:5000/api/ig/confirms/{dealReference}
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
```

## 5. Account Info

```
GET http://localhost:5000/api/ig/account
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
```

Returns `{ accounts: [{ accountId, accountName, balance: { balance, available, deposit, profitLoss }, currency, ... }] }`

## 6. Market Prices

```
GET http://localhost:5000/api/ig/prices?epics=CS.D.BITCOIN.CFD.IP,CS.D.USCGC.TODAY.IP
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
```

## 7. Transaction History

```
GET http://localhost:5000/api/ig/history?type=ALL&from=2026-02-01T00:00:00&to=2026-02-28T00:00:00
Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN
```

## 8. Session Management

```
GET http://localhost:5000/api/ig/session          # Check session status
POST http://localhost:5000/api/ig/session/refresh  # Force re-login
```

## Common Epics

| Instrument | Epic |
|---|---|
| Bitcoin | CS.D.BITCOIN.CFD.IP |
| Gold | CS.D.USCGC.TODAY.IP |
| EUR/USD | CS.D.EURUSD.CFD.IP |
| GBP/USD | CS.D.GBPUSD.CFD.IP |
| FTSE 100 | IX.D.FTSE.CFD.IP |
| Silver | CS.D.CFASILVER.CFA.IP |

## Risk Management Rules

- Max 1% of balance per trade
- Position size formula: `(balance * 0.01) / (stop_distance * value_per_point)`
- Start with 0.1–0.5 contracts
- Always use stop losses
- Check market status before trading (TRADEABLE vs EDITS_ONLY)

## Common Errors

| Error | Meaning |
|---|---|
| `error.security.api-key-disabled` | API key disabled — regenerate on IG platform |
| `error.security.api-key-invalid` | Wrong server (demo key on live, or vice versa) |
| `error.security.invalid-details` | Wrong username or password |
| `error.public-api.exceeded-api-key-allowance` | Rate limited — wait and retry |
| `error.position.trading-not-enabled` | Account not enabled for trading |
| `MARKET_CLOSED` or `EDITS_ONLY` | Market is closed (e.g. weekend for non-crypto) |
