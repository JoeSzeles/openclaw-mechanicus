---
name: ig-trading
description: IG Group Trading API — trade CFDs, manage positions, working orders, market data. Use for ANY IG trading task. ALWAYS read IG-COMMANDS.md first.
---
# IG Trading API Skill

Trade CFDs on the IG Group platform via the local proxy. The proxy handles all authentication automatically.

## FIRST: Read the Command Reference

**Before doing ANYTHING with IG, read `skills/ig-trading/IG-COMMANDS.md`** — it has every endpoint, every parameter, every error code. Do NOT guess or improvise.

## How It Works

All IG operations go through `http://localhost:5000/api/ig/...` with `Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN`. The proxy manages IG sessions (CST/XST tokens), rate limiting, and caching. You NEVER authenticate to IG directly.

## Critical Rules

1. **ALWAYS check the response `ok` field** — `ok: false` means the operation FAILED
2. **For trades, ALWAYS check `confirmation.dealStatus`** — only `ACCEPTED` means success. `REJECTED` means IG refused it
3. **NEVER tell the user a trade executed unless `dealStatus` is `ACCEPTED`**
4. **Include `dealId` and fill `level` when confirming trades**
5. **Check `marketStatus` before trading** — `EDITS_ONLY` means market is closed
6. **Rate limits**: IG allows ~60 requests/minute. The proxy handles this but avoid rapid-fire calls

## Available Endpoints Summary

| Action | Method | Endpoint |
|---|---|---|
| List positions | GET | /api/ig/positions |
| Open position | POST | /api/ig/positions/open |
| Close position | POST | /api/ig/positions/close |
| Update stop/limit | PUT | /api/ig/positions/update |
| List working orders | GET | /api/ig/workingorders |
| Create working order | POST | /api/ig/workingorders/create |
| Update working order | PUT | /api/ig/workingorders/update |
| Delete working order | DELETE | /api/ig/workingorders/delete |
| Account balance | GET | /api/ig/account |
| Live prices | GET | /api/ig/prices?epics=... |
| Market details | GET | /api/ig/markets/{epic} |
| Search markets | GET | /api/ig/markets?q=... |
| Browse categories | GET | /api/ig/marketnavigation |
| Price candles | GET | /api/ig/pricehistory/{epic}?resolution=HOUR&max=50 |
| Watchlists | GET | /api/ig/watchlists |
| Transaction history | GET | /api/ig/history?type=ALL&from=...&to=... |
| Activity log | GET | /api/ig/activity?from=...&to=... |
| Deal confirmation | GET | /api/ig/confirms/{dealRef} |
| Session status | GET | /api/ig/session |
| Force re-login | POST | /api/ig/session/refresh |
| Stream prices | GET | /api/ig/stream/prices |
| Stream status | GET | /api/ig/stream/status |

See `skills/ig-trading/IG-COMMANDS.md` for full request/response details on every endpoint.
