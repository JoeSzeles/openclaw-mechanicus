---
name: ig-trading-bot
description: IG CFD Trading Bot — automated strategy execution, position management, risk controls. Use for "IG bot", "trading bot", "auto trade", "run strategy", "bot status".
---
# IG Trading Bot Skill

Automated CFD trading bot for the IG Group platform. Executes trades based on configurable strategy rules, manages positions, and enforces risk limits.

**Prerequisite:** You must have `IG_API_KEY`, `IG_USERNAME`, `IG_PASSWORD`, `IG_ACCOUNT_ID`, and `IG_BASE_URL` environment variables set. See the `ig-trading` skill for authentication details.

## Quick Start

1. Create/edit the strategy config at `.openclaw/ig-strategy.json`
2. Test with: `node skills/bots/ig-trading-bot.cjs --test`
3. Run live: `node skills/bots/ig-trading-bot.cjs`

## Strategy Config

The bot reads its configuration from `.openclaw/ig-strategy.json`.

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
    },
    {
      "instrument": "IX.D.FTSE.CFD.IP",
      "name": "FTSE Short at Resistance",
      "direction": "SELL",
      "entryAbove": 8200,
      "stopDistance": 20,
      "limitDistance": 40,
      "size": 0.5,
      "enabled": false
    }
  ],
  "maxOpenPositions": 3,
  "maxRiskPercent": 1,
  "checkIntervalSeconds": 15,
  "enabled": false
}
```

### Strategy Fields

| Field | Type | Description |
|---|---|---|
| `instrument` | string | IG EPIC code for the instrument |
| `name` | string | Human-readable label |
| `direction` | string | `BUY` or `SELL` |
| `entryBelow` | number | Trigger a BUY when mid-price drops below this level |
| `entryAbove` | number | Trigger a SELL when mid-price rises above this level |
| `stopDistance` | number | Stop-loss distance in points |
| `limitDistance` | number | Take-profit distance in points |
| `size` | number | Position size in contracts |
| `enabled` | boolean | Whether this strategy is active |

### Global Settings

| Field | Type | Description |
|---|---|---|
| `maxOpenPositions` | number | Maximum concurrent open positions (default 3) |
| `maxRiskPercent` | number | Max % of account balance risked per trade (default 1) |
| `checkIntervalSeconds` | number | How often to poll prices (default 15) |
| `enabled` | boolean | Master switch — bot won't trade if false |

## Running

### Test Mode

Simulates one cycle without placing real trades:

```bash
node skills/bots/ig-trading-bot.cjs --test
```

This will:
- Authenticate with IG
- Fetch current prices for all configured instruments
- Evaluate strategy rules against live prices
- Report what trades it **would** execute
- No orders are placed

### Live Mode

```bash
node skills/bots/ig-trading-bot.cjs
```

Runs continuously, polling prices and executing trades when conditions are met. Press Ctrl+C to stop.

## Output Files

| File | Description |
|---|---|
| `.openclaw/ig-bot-log.json` | Full log of all actions, trades, and errors |
| `.openclaw/canvas/ig-bot-status.html` | Live status dashboard (auto-refreshes) |

## Signal Integration

The bot also checks `.openclaw/ig-alerts.json` (written by the `ig-signal-monitor` skill) for signal alerts. If a signal alert matches a configured strategy instrument, the bot treats it as additional confirmation.

## Risk Controls

- Enforces `maxOpenPositions` limit
- Enforces `maxRiskPercent` per trade against account balance
- Won't re-enter a position on an instrument that already has an open position
- All trades use stop-loss and take-profit (stopDistance / limitDistance)
- Master `enabled` flag must be `true` for any trades to execute

## Common EPICs

| Market | EPIC |
|---|---|
| EUR/USD | `CS.D.EURUSD.CFD.IP` |
| GBP/USD | `CS.D.GBPUSD.CFD.IP` |
| FTSE 100 | `IX.D.FTSE.CFD.IP` |
| S&P 500 | `IX.D.SPTRD.IFE.IP` |
| Spot Gold | `CS.D.USCGC.TODAY.IP` |
| Bitcoin | `CS.D.BITCOIN.CFD.IP` |
