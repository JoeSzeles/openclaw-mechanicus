---
name: ig-market-data
description: IG Group market data — search markets, get prices, watchlists, sentiment. Use for "IG markets", "search EURUSD", "IG prices", "market sentiment", "IG watchlist".
---
# IG Market Data Skill

Search markets, get prices, manage watchlists, and view client sentiment on the IG Group platform.

**Prerequisite:** You must be authenticated first — see the `ig-trading` skill for login instructions.

## Connection Details

- **Demo API**: `https://demo-api.ig.com/gateway/deal`
- Credentials in env vars: `IG_API_KEY`, `IG_BASE_URL`
- All requests need headers: `X-IG-API-KEY`, `CST`, `X-SECURITY-TOKEN`

## 1. Search Markets

Find instruments by keyword. Returns EPICs you need for trading and price queries.

```bash
curl -s "$IG_BASE_URL/markets?searchTerm=EURUSD" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

Returns a list of markets with `epic`, `instrumentName`, `instrumentType`, `expiry`.

## 2. Get Market Details

Get full details for a specific instrument by its EPIC.

```bash
curl -s "$IG_BASE_URL/markets/CS.D.EURUSD.CFD.IP" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

Returns: instrument info, dealing rules, snapshot (bid/offer/high/low), market status (TRADEABLE/CLOSED).

## 3. Historical Prices

**By number of data points:**
```bash
curl -s "$IG_BASE_URL/prices/CS.D.EURUSD.CFD.IP/DAY/30" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Version: 3"
```

**By date range:**
```bash
curl -s "$IG_BASE_URL/prices/CS.D.EURUSD.CFD.IP/HOUR/2026-02-01T00:00:00/2026-02-27T00:00:00" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Version: 2"
```

**Resolution options:** `SECOND`, `MINUTE`, `MINUTE_2`, `MINUTE_3`, `MINUTE_5`, `MINUTE_10`, `MINUTE_15`, `MINUTE_30`, `HOUR`, `HOUR_2`, `HOUR_3`, `HOUR_4`, `DAY`, `WEEK`, `MONTH`

## 4. Watchlists

**List all watchlists:**
```bash
curl -s "$IG_BASE_URL/watchlists" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

**Get a specific watchlist:**
```bash
curl -s "$IG_BASE_URL/watchlists/$WATCHLIST_ID" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

**Create a watchlist:**
```bash
curl -s -X POST "$IG_BASE_URL/watchlists" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{"name":"My Forex","epics":["CS.D.EURUSD.CFD.IP","CS.D.GBPUSD.CFD.IP"]}'
```

**Add a market to a watchlist:**
```bash
curl -s -X PUT "$IG_BASE_URL/watchlists/$WATCHLIST_ID" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d '{"epic":"CS.D.AUDUSD.CFD.IP"}'
```

**Remove a market from a watchlist:**
```bash
curl -s -X DELETE "$IG_BASE_URL/watchlists/$WATCHLIST_ID/CS.D.AUDUSD.CFD.IP" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

## 5. Client Sentiment

```bash
curl -s "$IG_BASE_URL/client-sentiment/EURUSD" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

Returns: `longPositionPercentage`, `shortPositionPercentage`, `marketId`

**Related markets sentiment:**
```bash
curl -s "$IG_BASE_URL/client-sentiment/related/EURUSD" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

## Common EPICs Reference

| Market | EPIC | Type |
|---|---|---|
| EUR/USD | `CS.D.EURUSD.CFD.IP` | Forex CFD |
| GBP/USD | `CS.D.GBPUSD.CFD.IP` | Forex CFD |
| AUD/USD | `CS.D.AUDUSD.CFD.IP` | Forex CFD |
| USD/JPY | `CS.D.USDJPY.CFD.IP` | Forex CFD |
| EUR/GBP | `CS.D.EURGBP.CFD.IP` | Forex CFD |
| FTSE 100 | `IX.D.FTSE.CFD.IP` | Index CFD |
| S&P 500 | `IX.D.SPTRD.IFE.IP` | Index CFD |
| Germany 40 | `IX.D.DAX.IFD.IP` | Index CFD |
| Australia 200 | `IX.D.ASX.IFM.IP` | Index CFD |
| Spot Gold | `CS.D.USCGC.TODAY.IP` | Commodity CFD |
| US Crude Oil | `CC.D.CL.UME.IP` | Commodity CFD |
| Bitcoin | `CS.D.BITCOIN.CFD.IP` | Crypto CFD |
| Ethereum | `CS.D.ETHUSD.CFD.IP` | Crypto CFD |

**Note:** EPICs can change. Use the search API (`/markets?searchTerm=`) to find the current EPIC for any instrument.

## Streaming API (Advanced)

For real-time prices, IG uses **Lightstreamer**. The streaming endpoint is returned in the login response (`lightstreamerEndpoint`). Up to 40 concurrent subscriptions allowed by default.

Streaming requires a Lightstreamer client library — not practical from simple curl/exec. For real-time needs, poll `/markets/{epic}` sparingly (watch rate limits) or use the historical prices API with short intervals.

## Rate Limits

- Standard API quota per key (varies by account type)
- Polling `/markets/{epic}` repeatedly will exhaust quota quickly — use sparingly
- Historical prices are more efficient for bulk data
- Error `error.public-api.exceeded-api-key-allowance` means you hit the limit — wait before retrying
