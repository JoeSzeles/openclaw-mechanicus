---
name: ig-trading
description: IG Group Trading API — trade CFDs, manage positions, working orders, market data, bots, strategies, signals. Use for ANY IG trading task. ALWAYS read IG-COMMANDS.md first.
---
# IG Trading API Skill

Trade CFDs on the IG Group platform via the local proxy. The proxy handles all authentication automatically.

## FIRST: Read the Command Reference

**Before doing ANYTHING with IG, read `skills/ig-trading/IG-COMMANDS.md`** — it has every endpoint, every parameter, every error code. Do NOT guess or improvise.

## How It Works

All IG operations go through `https://$REPLIT_DEV_DOMAIN/api/ig/...?_token=$OPENCLAW_GATEWAY_TOKEN`. **IMPORTANT**: You MUST use the public URL (`https://$REPLIT_DEV_DOMAIN/...`), NOT `http://localhost:5000/...` — the `web_fetch` tool blocks localhost due to SSRF protection. Authenticate by appending `?_token=$OPENCLAW_GATEWAY_TOKEN` as a query parameter (web_fetch does NOT support custom headers). The proxy manages IG sessions (CST/XST tokens), rate limiting, and caching. You NEVER authenticate to IG directly.

## Critical Rules

1. **ALWAYS check the response `ok` field** — `ok: false` means the operation FAILED
2. **For trades, ALWAYS check `confirmation.dealStatus`** — only `ACCEPTED` means success. `REJECTED` means IG refused it
3. **NEVER tell the user a trade executed unless `dealStatus` is `ACCEPTED`**
4. **Include `dealId` and fill `level` when confirming trades**
5. **Check `marketStatus` before trading** — `EDITS_ONLY` means market is closed
6. **Rate limits**: IG allows ~60 requests/minute. The proxy handles this but avoid rapid-fire calls

## Currency Handling — READ THIS CAREFULLY

**This is the #1 cause of order failures.** The account trades in AUD. But each instrument has its own dealing currency.

**BEFORE placing any trade, you MUST:**
1. Fetch market details: `GET /api/ig/markets/{epic}`
2. Read `instrument.currencies` from the response
3. Use `currencies[0].name` (or `.code`) as the `currencyCode` in your trade request

**Common currency mappings:**
| Instrument | Currency |
|---|---|
| Spot Gold (AUD) `CS.D.CFAGOLD.CFA.IP` | AUD |
| Spot Silver (AUD) `CS.D.CFASILVER.CFA.IP` | AUD |
| Spot Gold (US) `CS.D.USCGC.TODAY.IP` | USD |
| Bitcoin `CS.D.BITCOIN.CFD.IP` | USD |
| EUR/USD `CS.D.EURUSD.CFD.IP` | USD |
| GBP/USD `CS.D.GBPUSD.CFD.IP` | USD |
| FTSE 100 `IX.D.FTSE.CFD.IP` | GBP |
| DAX 40 `IX.D.DAX.CFD.IP` | EUR |

**NEVER guess the currency.** Always look it up from the market details response. If the trade is rejected, the wrong currency is often the reason.

**When a trade is rejected:**
1. Read the rejection reason from `confirmation.reason`
2. If it mentions currency or size issues, re-fetch market details
3. Check `dealingRules.minDealSize` for the minimum allowed size
4. Retry with corrected parameters — do NOT give up after one failure

## FILE PROTECTION — CRITICAL

**NEVER delete, overwrite, or recreate these files:**
- `skills/bots/ig-trading-bot.cjs` — the trading bot
- `skills/bots/ig-signal-monitor.cjs` — the signal monitor
- `skills/bots/binance-receiver.cjs` — the binance receiver
- `.openclaw/ig-strategy.json` — strategy config (use the API instead)
- `.openclaw/ig-proofread-config.json` — proof reader config (use the API instead)
- `.openclaw/ig-monitor-config.json` — signal monitor config
- `.openclaw/canvas/ig-dashboard.html` — the trading dashboard
- `ceo-proxy.cjs` — the proxy server

**"Stop the bot" means use the bot management API, NOT delete the file:**
- Stop: `POST /api/bots/ig-trading-bot/stop`
- Start: `POST /api/bots/ig-trading-bot/start`
- Status: `GET /api/bots`

**"Disable a strategy" means toggle it via API, NOT edit the JSON file:**
- Toggle: `POST /api/ig/strategies/{index}/toggle`
- Disable all: `POST /api/ig/strategies/global` with `{ "enabled": false }`

**If the user says "nuke", "kill", "remove" the bot — they mean STOP it, not DELETE the file.**

## Available Endpoints Summary

| Action | Method | Endpoint |
|---|---|---|
| **Positions** | | |
| List positions | GET | /api/ig/positions |
| Open position | POST | /api/ig/positions/open |
| Close position | POST | /api/ig/positions/close |
| Update stop/limit | PUT | /api/ig/positions/update |
| **Working Orders** | | |
| List working orders | GET | /api/ig/workingorders |
| Create working order | POST | /api/ig/workingorders/create |
| Update working order | PUT | /api/ig/workingorders/update |
| Delete working order | DELETE | /api/ig/workingorders/delete |
| **Account** | | |
| Account balance | GET | /api/ig/account |
| **Market Data** | | |
| Live prices | GET | /api/ig/prices?epics=... |
| Market details | GET | /api/ig/markets/{epic} |
| Search markets | GET | /api/ig/markets?q=... |
| Browse categories | GET | /api/ig/marketnavigation |
| Price candles | GET | /api/ig/pricehistory/{epic}?resolution=HOUR&max=50 |
| **Watchlists** | | |
| IG watchlists | GET | /api/ig/watchlists |
| Dashboard watched instruments | GET | /api/ig/watchedlist |
| Add to watchlist | POST | /api/ig/watchedlist |
| Remove from watchlist | DELETE | /api/ig/watchedlist/{index} |
| **History** | | |
| Transaction history | GET | /api/ig/history?type=ALL&from=...&to=... |
| Activity log | GET | /api/ig/activity?from=...&to=... |
| Deal confirmation | GET | /api/ig/confirms/{dealRef} |
| **Session** | | |
| Session status | GET | /api/ig/session |
| Force re-login | POST | /api/ig/session/refresh |
| **Streaming** | | |
| Stream prices | GET | /api/ig/stream/prices |
| Stream status | GET | /api/ig/stream/status |
| Connect live stream | POST | /api/ig/stream/connect-live |
| Disconnect live stream | POST | /api/ig/stream/disconnect-live |
| **Bot Management** | | |
| List all bots | GET | /api/bots |
| Start a bot | POST | /api/bots/{name}/start |
| Stop a bot | POST | /api/bots/{name}/stop |
| **Strategy Management** | | |
| List strategies | GET | /api/ig/strategies |
| Create strategy | POST | /api/ig/strategies |
| Update strategy | PUT | /api/ig/strategies/{index} |
| Delete strategy | DELETE | /api/ig/strategies/{index} |
| Toggle strategy on/off | POST | /api/ig/strategies/{index}/toggle |
| Attach strategy to deal | POST | /api/ig/strategies/{index}/attach |
| Detach strategy from deal | POST | /api/ig/strategies/{index}/detach |
| Pause/resume strategy | POST | /api/ig/strategies/{index}/pause |
| Master bot toggle | POST | /api/ig/strategies/global |
| **Strategy Templates** | | |
| List templates | GET | /api/ig/strategy-templates |
| Save template | POST | /api/ig/strategy-templates |
| Delete template | DELETE | /api/ig/strategy-templates/{filename} |
| **Proof Reader** | | |
| Get proof reader config | GET | /api/ig/proofread |
| Update proof reader config | PUT | /api/ig/proofread |
| **Signals** | | |
| Read alerts file | Read `.openclaw/ig-alerts.json` |

See `skills/ig-trading/IG-COMMANDS.md` for full request/response details on every endpoint.

## Data Sources You Can Read

These files give you situational awareness. READ them to make informed decisions:

| File | What It Contains |
|---|---|
| `.openclaw/ig-alerts.json` | Recent price signals (drops, spikes, breakouts) from the signal monitor |
| `.openclaw/ig-strategy.json` | Current bot strategies (but prefer the API: `GET /api/ig/strategies`) |
| `.openclaw/ig-proofread-config.json` | Proof reader thresholds (but prefer the API: `GET /api/ig/proofread`) |
| `.openclaw/ig-bot-log.json` | Recent bot trade log (last actions, errors, trades) |
| `.openclaw/ig-monitor-config.json` | What instruments the signal monitor is watching |
| `.openclaw/ig-config.json` | IG account profiles (demo/live) and active profile |

## Trading Without the Bot

You can trade directly via the API — you don't need the bot. For manual/agent-driven trades:

1. **Get the price**: `GET /api/ig/markets/{epic}` — check `snapshot.bid`, `snapshot.offer`, `snapshot.marketStatus`
2. **Check the currency**: Read `instrument.currencies[0].name` from the market details
3. **Place the trade**: `POST /api/ig/positions/open` with correct `currencyCode`
4. **Verify the result**: Check `ok` and `confirmation.dealStatus`
5. **If rejected, diagnose and retry** — read the reason, fix the issue, try again immediately

**Speed matters in fast markets.** Don't waste time on unnecessary checks when the user gives a clear command. Get the price, get the currency, place the trade.

## Trade Execution Checklist (Quick)

For user-commanded trades (not bot trades), follow this streamlined flow:

1. Fetch market details → get live price + currency + min size
2. Confirm market is TRADEABLE
3. Build the order with correct `currencyCode`, `epic`, `direction`, `size`
4. Add stop/limit if specified (or use sensible defaults)
5. Execute immediately
6. Report result with dealId, fill level, and P&L info

## Dashboard

The IG Trading Dashboard is at: `https://$REPLIT_DEV_DOMAIN/__openclaw__/canvas/ig-dashboard.html`

It shows: account balance, open positions, strategies, proof reader config, price charts with annotations, watched instruments with live prices, and a manual trading panel.
