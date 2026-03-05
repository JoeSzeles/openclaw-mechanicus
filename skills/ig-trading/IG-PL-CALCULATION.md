# IG P&L Calculation Reference

## Universal Formula

```
P&L = (priceDiff) × size × plMultiplier
```

Where:
- `priceDiff` = current price minus entry price (for BUY), or entry price minus current price (for SELL)
- `size` = number of contracts (e.g. 0.5, 1, 2)
- `plMultiplier` = `valueOfOnePip × scalingFactor`

## Where the Values Come From

Both values come from the IG REST API `/markets/{epic}` response:

- `valueOfOnePip` — from `instrument.valueOfOnePip` (string, parse to float)
- `scalingFactor` — from `snapshot.scalingFactor` (number), fallback to `instrument.scalingFactor`

The proxy (`ceo-proxy.cjs`) fetches these per instrument and enriches the positions response with a pre-computed `plMultiplier` field on each `position.market` object.

## Why Not `contractSize`?

`contractSize` (from `instrument.contractSize`) is the number of units per contract, NOT the P&L multiplier. For most FX pairs, `contractSize` happens to equal `plMultiplier` (e.g. EUR/USD = 100,000 for both). But for some instruments they differ:

| Instrument | contractSize | plMultiplier | Using contractSize would give |
|---|---|---|---|
| Silver A$1 | 100 | 1 | 100× too large |
| Oil WTI $10 | 10 | 10 | Correct (coincidence) |
| EUR/USD | 100,000 | 100,000 | Correct (coincidence) |

## Why Not Raw `valueOfOnePip`?

`valueOfOnePip` is the value per PIP, not per price point. For instruments where 1 pip = 1 point (like Silver, Gold, indices), it works. But for FX pairs where 1 pip = 0.0001 (or 0.01 for JPY), the price feed shows 5 decimal places, so the raw price difference is in points, not pips.

`scalingFactor` bridges this gap — it converts points to pips. So `valueOfOnePip × scalingFactor` gives the value per price point.

## Verified Instrument Data

Data verified against the live IG API (March 2026):

### FX Standard (contractSize = 100,000)

| Instrument | valueOfOnePip | scalingFactor | plMultiplier |
|---|---|---|---|
| EUR/USD | 10 | 10,000 | 100,000 |
| GBP/USD | 10 | 10,000 | 100,000 |
| AUD/USD | 10 | 10,000 | 100,000 |
| USD/JPY | 1,000 | 100 | 100,000 |

### FX Mini (contractSize = 10,000)

| Instrument | valueOfOnePip | scalingFactor | plMultiplier |
|---|---|---|---|
| EUR/USD Mini | 1 | 10,000 | 10,000 |

### Indices

| Instrument | valueOfOnePip | scalingFactor | plMultiplier | contractSize |
|---|---|---|---|---|
| US 500 Cash (EUR 1) | 1 | 1 | 1 | 1 |
| Wall Street Cash (EUR 1) | 1 | 1 | 1 | 1 |
| FTSE 100 Cash (EUR 1) | 1 | 1 | 1 | 1 |

### Commodities

| Instrument | valueOfOnePip | scalingFactor | plMultiplier | contractSize |
|---|---|---|---|---|
| Silver A$1 | 1 | 1 | 1 | 100 |
| Gold A$1 | 1 | 1 | 1 | 1 |
| Oil WTI $10 | 10 | 1 | 10 | 10 |

### Crypto

| Instrument | valueOfOnePip | scalingFactor | plMultiplier | contractSize |
|---|---|---|---|---|
| Bitcoin $1 | 1 | 1 | 1 | 1 |
| Ether $1 | 1 | 1 | 1 | 1 |

## Risk Calculation

Risk uses the same multiplier:

```
riskAmount = stopDistance × size × plMultiplier
riskPercent = (riskAmount / accountBalance) × 100
```

## Implementation Locations

| Component | File | What It Does |
|---|---|---|
| Proxy enrichment | `ceo-proxy.cjs` | Fetches `valueOfOnePip` and `scalingFactor` per epic, computes `plMultiplier`, attaches to position market data |
| Dashboard P&L | `.openclaw/canvas/ig-dashboard.html` | Uses `mkt.plMultiplier` for position P&L display and live price updates |
| Scalper engine | `skills/bots/ig-scalper-engine.cjs` | Uses `plMultiplier` for unrealized P&L, trailing stops, profit targets, and risk budget |
| Trading bot | `skills/bots/ig-trading-bot.cjs` | Uses `plMultiplier` for proof-reader risk checks and pre-trade risk limits |

## Fallback Behavior

If the `/markets/{epic}` call fails, the proxy returns `plMultiplier = 1` (safe default — P&L will be in raw price points). The dashboard falls back to `valueOfOnePip` if `plMultiplier` is missing, then to `1`.

## Quick Verification

To verify any instrument's multiplier, check the IG platform's instrument info page:
- "Value of one point" = what IG calls the per-point value (this is `valueOfOnePip` in the API despite the name)
- If `scalingFactor > 1`, IG's prices are scaled (FX pairs show 5 decimal places for 4-pip currencies)
- `plMultiplier = Value of one point × scalingFactor`

For Silver A$1: Value of one point = AUD 1, scalingFactor = 1, so plMultiplier = 1.
For EUR/USD: Value of one point = $10, scalingFactor = 10,000, so plMultiplier = 100,000.
