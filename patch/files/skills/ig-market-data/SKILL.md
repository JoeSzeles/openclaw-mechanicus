---
name: ig-market-data
description: IG Group market data — search markets, get prices, watchlists, sentiment. Use for "IG markets", "search EURUSD", "IG prices", "market sentiment", "IG watchlist".
---
# IG Market Data Skill

Search markets, get prices, manage watchlists, and view client sentiment on the IG Group platform.

All requests go through the proxy. Use `web_fetch` to `https://$REPLIT_DEV_DOMAIN/api/ig/...?_token=$OPENCLAW_GATEWAY_TOKEN`. NEVER use localhost or direct IG API calls.

## 1. Search Markets

Find instruments by keyword. Returns EPICs you need for trading and price queries.

```
GET /api/ig/markets?q=gold
GET /api/ig/markets?searchTerm=EURUSD
```

Returns a list of markets with `epic`, `instrumentName`, `instrumentType`, `expiry`.

## 2. Get Market Details (CRITICAL — Do This Before Every Trade)

```
GET /api/ig/markets/{epic}
```

Returns: instrument info, dealing rules, snapshot (bid/offer/high/low), market status.

**Key fields to extract:**
- `snapshot.bid` / `snapshot.offer` — live prices
- `snapshot.marketStatus` — must be `TRADEABLE`
- `instrument.currencies[0].name` — **the correct currencyCode for trades**
- `dealingRules.minDealSize.value` — minimum trade size
- `instrument.contractSize` — contract multiplier
- `instrument.marginFactor` — margin requirement %

## 3. Historical Prices

```
GET /api/ig/pricehistory/{epic}?resolution=HOUR&max=50
```

Resolutions: SECOND, MINUTE, MINUTE_2, MINUTE_3, MINUTE_5, MINUTE_10, MINUTE_15, MINUTE_30, HOUR, HOUR_2, HOUR_3, HOUR_4, DAY, WEEK, MONTH
Optional: `from`, `to` (ISO dates), `max` (number of candles)

## 4. Live Prices (Multiple Instruments)

```
GET /api/ig/prices?epics=CS.D.BITCOIN.CFD.IP,CS.D.CFAGOLD.CFA.IP
```

## 5. Streamed Prices (From Lightstreamer)

```
GET /api/ig/stream/prices
```

Returns latest streamed prices from all subscribed instruments (faster than polling).

## 6. Watchlists

**IG Watchlists:**
```
GET /api/ig/watchlists
GET /api/ig/watchlists/{watchlistId}
```

**Dashboard Watched Instruments (preferred):**
```
GET /api/ig/watchedlist
```
Returns instruments being actively monitored with live prices.

## 7. Signal Alerts

Read `.openclaw/ig-alerts.json` for recent price signals detected by the signal monitor bot. Signals include: price drops, spikes, breakouts, and spread alerts.

## Common EPICs Reference

| Market | EPIC | Currency |
|---|---|---|
| Spot Gold (AUD $1) | `CS.D.CFAGOLD.CFA.IP` | AUD |
| Spot Silver (AUD $1) | `CS.D.CFASILVER.CFA.IP` | AUD |
| Spot Gold (US $10) | `CS.D.USCGC.TODAY.IP` | USD |
| Gold Futures (US $10) | `CS.D.CFDGOLD.CFDGC.IP` | USD |
| Bitcoin ($1) | `CS.D.BITCOIN.CFD.IP` | USD |
| EUR/USD | `CS.D.EURUSD.CFD.IP` | USD |
| GBP/USD | `CS.D.GBPUSD.CFD.IP` | USD |
| AUD/USD | `CS.D.AUDUSD.CFD.IP` | USD |
| USD/JPY | `CS.D.USDJPY.CFD.IP` | JPY |
| FTSE 100 | `IX.D.FTSE.CFD.IP` | GBP |
| DAX 40 | `IX.D.DAX.CFD.IP` | EUR |
| S&P 500 | `IX.D.SPTRD.CFD.IP` | USD |
| Nasdaq 100 | `IX.D.NASDAQ.CFD.IP` | USD |
| US Crude Oil | `CC.D.CL.UME.IP` | USD |

**IMPORTANT:** EPICs and currencies can vary. ALWAYS verify by calling `GET /api/ig/markets/{epic}` before trading. Never hardcode currencies.

## Rate Limits

- ~60 requests/minute typical
- Market data responses are cached for 30 seconds by the proxy
- Error `error.public-api.exceeded-api-key-allowance` = rate limited, wait 60s
