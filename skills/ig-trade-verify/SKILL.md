---
name: ig-trade-verify
description: Trade proof-reading and verification protocol for IG CFD trading. MANDATORY before any trade execution. Use for "verify trade", "check trade", "proof read", "validate position", "pre-trade check".
---
# IG Trade Verification Skill (Proof Reader)

**THIS SKILL IS MANDATORY BEFORE ANY TRADE EXECUTION.** No position may be opened, modified, or closed without completing this verification protocol. This exists to prevent hallucination-driven losses on margin trading.

## When To Use

- Before opening ANY position (market order or working order)
- Before modifying stop/limit on an existing position
- Before recommending a trade to the user
- Before the trading bot executes an automated trade

## Verification Protocol

Complete ALL checks below. If ANY check fails, **ABORT the trade** and explain why.

### Step 1: Market Data Freshness

Fetch LIVE market data for the instrument RIGHT NOW. Do not rely on cached/remembered prices.

```bash
curl -s "$IG_BASE_URL/markets/{epic}" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

Verify:
- [ ] Market status is `TRADEABLE` (not CLOSED, OFFLINE, SUSPENDED)
- [ ] Bid and offer prices are present and non-zero
- [ ] Spread (offer - bid) is reasonable for the instrument (< 5% of mid price for forex, < 1% for indices)
- [ ] The prices you're about to trade at match what you just fetched (no stale data)

### Step 2: Price Sanity Check

Compare the trade entry price against the LIVE price:
- [ ] For BUY: entry price is within 2% of current offer price
- [ ] For SELL: entry price is within 2% of current bid price
- [ ] If the price you planned to trade at differs by more than 2% from live, **ABORT** — your data is stale or hallucinated

### Step 3: Position Sizing Verification

Calculate and verify:
- [ ] Trade risk = stop_distance × size × value_per_point
- [ ] Trade risk ≤ 1% of account balance (fetch from `/accounts`)
- [ ] Size is within IG's minimum/maximum for the instrument
- [ ] Total exposure (existing positions + this trade) stays within acceptable limits

### Step 4: Stop-Loss and Take-Profit

- [ ] Stop-loss IS SET (never trade without a stop on margin)
- [ ] Stop distance is at least wider than the spread (otherwise instant stop-out)
- [ ] Take-profit is set with a minimum 1:1 risk-reward ratio (ideally 1.5:1 or better)
- [ ] Stop distance is reasonable for the instrument's volatility (not too tight, not too wide)

### Step 5: Duplicate Position Check

- [ ] Fetch current positions from `/positions`
- [ ] No existing position on the same instrument in the same direction
- [ ] If hedging (opposite direction), confirm this is intentional
- [ ] Total open positions ≤ maxOpenPositions limit

### Step 6: Account Health Check

- [ ] Fetch account balance from `/accounts`
- [ ] Available margin is sufficient for the new position
- [ ] No more than 5% of total balance is at risk across all positions
- [ ] Account is not in margin call territory

### Step 7: Logical Consistency

- [ ] The trade direction matches the analysis (BUY for bullish, SELL for bearish)
- [ ] Entry conditions in the strategy are actually met RIGHT NOW (re-check)
- [ ] If based on signals/alerts, verify the signal is recent (< 5 minutes old)
- [ ] The reasoning for the trade is documented and specific (not vague)

## Output Format

After completing verification, output a structured result:

```
TRADE VERIFICATION REPORT
═══════════════════════════
Instrument: {epic} ({name})
Direction: {BUY/SELL}
Size: {size}
Entry Price: {price} (Live: {live_price})
Stop Loss: {stop_distance} pts ({stop_price})
Take Profit: {limit_distance} pts ({tp_price})
Risk: {risk_amount} ({risk_pct}% of balance)
Risk:Reward: 1:{rr_ratio}

CHECKS:
✅ Market tradeable
✅ Price fresh (spread: {spread})
✅ Size within limits
✅ Stop-loss set ({stop_distance} pts)
✅ Take-profit set (1:{rr_ratio})
✅ No duplicate positions
✅ Account margin OK ({available_margin})

VERDICT: ✅ APPROVED / ❌ REJECTED
Reason: {if rejected, explain}
```

## Critical Rules

1. **NEVER skip verification** — even for "obvious" or "urgent" trades
2. **NEVER use remembered/cached prices** — always fetch live data in the verification step
3. **If any check fails, the trade MUST NOT execute**
4. **Log every verification** — pass or fail — for audit trail
5. **If in doubt, REJECT** — false negatives (missed trades) are better than false positives (bad trades) in margin trading
6. **Size conservatively** — when calculations are uncertain, use the smaller size
7. **Demo account** — always verify you're on demo-api.ig.com unless explicitly authorized for live

## Dashboard Integration

After verification, update the IG Trading Dashboard:
- Write verification results to `.openclaw/canvas/ig-verify-log.json` (append, keep last 50)
- The dashboard will display recent verification results
- URL: `https://${REPLIT_DEV_DOMAIN}/__openclaw__/canvas/ig-dashboard.html`
