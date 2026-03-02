---
name: ig-signal-monitor
description: IG price signal monitor — watches instruments for price drops, spikes, breakouts, spread alerts. Use for "monitor prices", "watch EURUSD", "price alert", "signal monitor", "IG signals".
---
# IG Signal Monitor Skill

Monitors configured instruments on the IG platform for price signals and writes alerts for the agent and trading bot to act on.

The monitor runs via the proxy at `http://localhost:5000` (internal). All IG auth is handled by the proxy.

## Bot Management

**Use the API. NEVER delete the bot file.**

| Action | Method | Endpoint |
|---|---|---|
| Start | POST | /api/bots/ig-signal-monitor/start |
| Stop | POST | /api/bots/ig-signal-monitor/stop |
| Status | GET | /api/bots |

Bot file: `skills/bots/ig-signal-monitor.cjs` — **DO NOT DELETE.**

## Config

Config file: `.openclaw/ig-monitor-config.json`

```json
{
  "instruments": [
    {"epic": "CS.D.EURUSD.CFD.IP", "name": "EUR/USD"},
    {"epic": "CS.D.CFAGOLD.CFA.IP", "name": "Spot Gold (AUD)"}
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

### Per-Instrument Overrides

```json
{
  "epic": "CS.D.BITCOIN.CFD.IP",
  "name": "Bitcoin",
  "breakoutAbove": 70000,
  "breakoutBelow": 60000,
  "maxSpread": 50
}
```

## Output

Alerts are written to `.openclaw/ig-alerts.json`:

```json
[
  {
    "timestamp": "2026-03-02T10:30:00.000Z",
    "epic": "CS.D.EURUSD.CFD.IP",
    "name": "EUR/USD",
    "type": "drop",
    "message": "EUR/USD dropped 0.52% in 30s",
    "bid": 1.0795,
    "offer": 1.0797,
    "mid": 1.0796
  }
]
```

### Signal Types

| Type | Trigger |
|---|---|
| `drop` | Price fell by ≥ `dropPercent` within window |
| `spike` | Price rose by ≥ `spikePercent` within window |
| `breakout_above` | Mid price crossed above `breakoutAbove` |
| `breakout_below` | Mid price crossed below `breakoutBelow` |
| `spread` | Spread exceeds `maxSpread` |
| `trending_up` | Consistent upward movement over multiple ticks |
| `trending_down` | Consistent downward movement over multiple ticks |

## Reading Alerts

To check current signals:
1. Read `.openclaw/ig-alerts.json`
2. Filter by `timestamp` — only act on recent alerts (< 5 minutes)
3. Match `epic` to instruments you care about

The trading bot automatically reads these alerts as additional trade confirmation.
