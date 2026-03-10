---
name: ig-trade-verify
description: Trade proof-reading and verification protocol for IG CFD trading. Use for "verify trade", "check trade", "proof read", "validate position", "pre-trade check".
---
# IG Trade Verification Skill (Proof Reader)

Pre-trade verification to prevent bad trades on margin. The automated trading bot has its own built-in proof reader (configured via `GET /api/ig/proofread`). This skill is for AGENT-driven manual trades.

## When To Use

- Before opening ANY position when acting autonomously (not direct user commands)
- Before recommending a trade to the user
- NOT needed when the user gives a direct "buy X" / "sell X" command — execute quickly, don't delay

## Quick Verification (For Fast Markets)

When the user commands a trade directly, do these checks inline — don't make it a separate step:

1. `GET /api/ig/markets/{epic}` — get live price, check `marketStatus` is `TRADEABLE`
2. Read `instrument.currencies[0].name` → use as `currencyCode`
3. Check `dealingRules.minDealSize.value` → ensure size is valid
4. Execute the trade
5. If rejected, read reason, fix, retry immediately

## Full Verification (For Autonomous Trades)

When YOU decide to trade (not user-commanded), complete all checks:

### Step 1: Market Data
- Fetch `GET /api/ig/markets/{epic}`
- Market status is `TRADEABLE`
- Bid/offer present and non-zero
- Spread is reasonable

### Step 2: Currency (CRITICAL)
- Read `instrument.currencies[0].name` from market details
- Use this EXACT value as `currencyCode` in the trade request
- NEVER assume AUD, USD, or any default

### Step 3: Position Sizing
- Trade risk = stopDistance × size
- Trade risk ≤ 2% of account balance (fetch from `GET /api/ig/account`)
- Size ≥ minDealSize from dealing rules

### Step 4: Duplicate Check
- Fetch `GET /api/ig/positions`
- Check for existing same-direction position on same instrument
- Check proof reader config: `GET /api/ig/proofread` — respect `allowDuplicatePositions`

### Step 5: Stop/Limit
- Stop-loss IS SET (never trade without a stop on margin)
- Stop distance > spread (otherwise instant stop-out)
- Risk:reward ≥ 1:1

## Proof Reader Config (Bot)

The trading bot's proof reader is configured via API:
- `GET /api/ig/proofread` — read current config
- `PUT /api/ig/proofread` — update config

Config fields: `enabled`, `maxStalenessSeconds`, `spreadLimitPctHigh`, `spreadLimitPctLow`, `minRiskReward`, `maxRiskPct`, `maxEntryDeviationPct`, `allowDuplicatePositions`, `requireStopLoss`, `requireTakeProfit`

## When Trade Is Rejected

**Do NOT give up.** Common fixes:
1. Wrong currency → re-fetch market details, use correct `currencyCode`
2. Size too small → check `dealingRules.minDealSize.value`
3. Market closed → check `marketStatus`, inform user
4. Stop/limit too close → widen the distance
5. Insufficient margin → reduce size or inform user
6. Rate limited → wait 60s and retry

**ALWAYS retry at least once after fixing the issue.** The user expects you to handle errors, not just report them.
