---
name: ig-trading-bot
description: IG CFD Trading Bot — automated strategy execution, position management, risk controls. Use for "IG bot", "trading bot", "auto trade", "run strategy", "bot status".
---
# IG Trading Bot Skill

Automated CFD trading bot for the IG Group platform. Executes trades based on configurable strategy rules, manages positions, and enforces risk limits.

The bot runs via the proxy at `http://localhost:5000` (internal). All IG auth is handled by the proxy.

## Bot Management (via API)

**IMPORTANT: Use the API to manage the bot. NEVER delete or modify the bot file directly.**

| Action | Method | Endpoint |
|---|---|---|
| List all bots | GET | /api/bots |
| Start trading bot | POST | /api/bots/ig-trading-bot/start |
| Stop trading bot | POST | /api/bots/ig-trading-bot/stop |
| Start signal monitor | POST | /api/bots/ig-signal-monitor/start |
| Stop signal monitor | POST | /api/bots/ig-signal-monitor/stop |

Bot file: `skills/bots/ig-trading-bot.cjs` — **DO NOT DELETE, OVERWRITE, OR RECREATE THIS FILE.**

If the user says "stop the bot", "kill the bot", "nuke the bot" — they mean `POST /api/bots/ig-trading-bot/stop`. NEVER delete the file.

## Strategy Management (via API)

Strategies are managed through the API, NOT by editing `ig-strategy.json` directly.

| Action | Method | Endpoint |
|---|---|---|
| List strategies | GET | /api/ig/strategies |
| Create strategy | POST | /api/ig/strategies |
| Update strategy | PUT | /api/ig/strategies/{index} |
| Delete strategy | DELETE | /api/ig/strategies/{index} |
| Toggle on/off | POST | /api/ig/strategies/{index}/toggle |
| Attach to deal | POST | /api/ig/strategies/{index}/attach |
| Detach from deal | POST | /api/ig/strategies/{index}/detach |
| Pause/resume | POST | /api/ig/strategies/{index}/pause |
| Master bot on/off | POST | /api/ig/strategies/global |

### Strategy Fields

| Field | Type | Description |
|---|---|---|
| `instrument` | string | IG EPIC code for the instrument |
| `name` | string | Human-readable label |
| `direction` | string | `BUY` or `SELL` |
| `entryBelow` | number | Trigger a BUY when mid-price drops to or below this level |
| `entryAbove` | number | Trigger a SELL when mid-price rises to or above this level |
| `stopDistance` | number | Stop-loss distance in points |
| `limitDistance` | number | Take-profit distance in points |
| `size` | number | Position size in contracts |
| `enabled` | boolean | Whether this strategy is active |

### Strategy Templates

| Action | Method | Endpoint |
|---|---|---|
| List templates | GET | /api/ig/strategy-templates |
| Save template | POST | /api/ig/strategy-templates |
| Delete template | DELETE | /api/ig/strategy-templates/{filename} |

## Proof Reader Config

| Action | Method | Endpoint |
|---|---|---|
| Get config | GET | /api/ig/proofread |
| Update config | PUT | /api/ig/proofread |

The proof reader validates bot trades before execution. Controls: max staleness, spread limits, min risk:reward, max risk %, allow duplicate positions, require stop/limit.

## Bot Behavior

- Reads strategies from `.openclaw/ig-strategy.json` every 60s (hot-reload)
- Reads proof reader config from `.openclaw/ig-proofread-config.json` every cycle
- Checks signal alerts from `.openclaw/ig-alerts.json` for additional confirmation
- Skips strategies with a `dealId` attached (already has a position)
- Only opens same-direction duplicate if `allowDuplicatePositions` is true
- Logs to `.openclaw/ig-bot-log.json`

## Reading Bot Status

To check what the bot is doing:
1. `GET /api/bots` — check if running, PID, uptime
2. Read `.openclaw/ig-bot-log.json` — recent trade log
3. `GET /api/ig/strategies` — current strategies and which are linked to deals
4. `GET /api/ig/positions` — current open positions
