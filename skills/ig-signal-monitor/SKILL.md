---
name: ig-signal-monitor
description: IG price signal monitor — watches instruments for price drops, spikes, breakouts, spread alerts. Use for "monitor prices", "watch EURUSD", "price alert", "signal monitor", "IG signals".
---
# IG Signal Monitor Skill

Monitors configured instruments on the IG platform for price signals and writes alerts for the agent to act on.

## Prerequisites

- Authenticated IG API session — see `ig-trading` skill for login details
- Environment variables: `IG_API_KEY`, `IG_USERNAME`, `IG_PASSWORD`, `IG_BASE_URL`

## Setup

1. Create/edit the config file at `.openclaw/ig-monitor-config.json`:

```json
{
  "instruments": [
    {"epic": "CS.D.EURUSD.CFD.IP", "name": "EUR/USD"},
    {"epic": "IX.D.FTSE.CFD.IP", "name": "FTSE 100"}
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

### Config Fields

| Field | Description |
|---|---|
| `instruments` | Array of instruments to watch. Each has `epic` (IG EPIC code) and `name` (display label). |
| `signals.dropPercent` | Trigger alert when price drops by this % within the window. |
| `signals.spikePercent` | Trigger alert when price spikes by this % within the window. |
| `signals.windowSeconds` | Rolling window to measure price changes. |
| `intervalSeconds` | Polling interval in seconds (default 15). |
| `enabled` | Set to `false` to pause monitoring. |

### Per-Instrument Overrides

You can add signal overrides on individual instruments:

```json
{
  "instruments": [
    {
      "epic": "CS.D.BITCOIN.CFD.IP",
      "name": "Bitcoin",
      "breakoutAbove": 70000,
      "breakoutBelow": 60000,
      "maxSpread": 50
    }
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

| Override | Description |
|---|---|
| `breakoutAbove` | Alert when mid price exceeds this level. |
| `breakoutBelow` | Alert when mid price drops below this level. |
| `maxSpread` | Alert when bid/offer spread exceeds this value. |

## Running

### Test Mode (one cycle, no persistent loop)

```bash
node skills/ig-signal-monitor/monitor.cjs --test
```

Runs a single poll cycle, prints what signals would fire, then exits. Use this to verify config and connectivity before running the full loop.

### Full Loop

```bash
node skills/ig-signal-monitor/monitor.cjs
```

Runs continuously, polling at the configured interval. Writes alerts to `.openclaw/ig-alerts.json`.

## Output

### Alerts File

Alerts are appended to `.openclaw/ig-alerts.json`:

```json
[
  {
    "timestamp": "2026-03-15T10:30:00.000Z",
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
| `drop` | Price fell by ≥ `dropPercent` within `windowSeconds` |
| `spike` | Price rose by ≥ `spikePercent` within `windowSeconds` |
| `breakout_above` | Mid price crossed above `breakoutAbove` level |
| `breakout_below` | Mid price crossed below `breakoutBelow` level |
| `spread` | Bid/offer spread exceeds `maxSpread` |

## Stopping

Kill the process (Ctrl+C) or set `"enabled": false` in the config — the monitor checks the config each cycle and stops if disabled.
