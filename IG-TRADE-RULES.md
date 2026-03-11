# IG Auto Trading Rules & Trigger System

## Overview

The IG Trading Dashboard has a sophisticated **Scalper Engine** (Trade Claw) that automatically opens and closes trades based on strategy signals. This document details:
1. How auto-trading is triggered (step-by-step)
2. API endpoints to control auto-trading
3. Required data fields for strategies
4. How instruments are validated
5. Risk management constraints

---

## Part 1: Auto-Trading Execution Flow

### 1.1 Complete Trigger Chain

```
User creates Strategy via API
         ↓
POST /api/ig/scalper/strategies
         ↓
Strategy saved to ig-scalper-config.json
         ↓
User enables strategy via toggle
         ↓
POST /api/ig/scalper/strategies/{id}/toggle
         ↓
config.strategies[id].enabled = true
         ↓
Engine detects enabled strategy
         ↓
Lightstreamer sends real-time tick for instrument
         ↓
processTick(epic, tickData) called
         ↓
Filters: enabled=true, instrument matches, !dealId
         ↓
Aggregates ticks into candles (if timeframe > TICK)
         ↓
evaluateEntry(strategy, epic, ticks/candles)
         ↓
Checks constraints:
  ✓ Minimum ticks received (5+)
  ✓ Warmup period completed
  ✓ Cooldown period expired
  ✓ Not at maxOpenPositions limit
  ✓ Max drawdown not exceeded
  ✓ Budget available
  ✓ Margin % safe
         ↓
Strategy evaluates signal (BUY/SELL/none)
         ↓
IF signal exists AND constraints pass:
  openTrade(strategy, epic, direction, size, stop, limit)
         ↓
POST /api/ig/positions/open
         ↓
IG executes trade → dealId assigned
         ↓
Trade logged to ig-scalper-trades.json
         ↓
Strategy tracks dealId to close later
```

### 1.2 Entry Signal Evaluation (`evaluateEntry`)

**File**: `skills/bots/trade-claw-engine.cjs` lines 500-598

```javascript
async function evaluateEntry(strat, epic, ticks) {
  // 1. Check minimum ticks (need 5+ ticks for technical analysis)
  if (ticks.length < 5) return;
  
  // 2. Warmup period (default 60 seconds after engine start)
  const warmup = strat.warmupMs || 60000;
  if (startedAt && (Date.now() - startedAt) < warmup) return;
  
  // 3. Cooldown check (prevent rapid re-entry, default 6 seconds)
  const cooldownKey = `${epic}_${strat.id}`;
  if (cooldowns[cooldownKey] && 
      Date.now() - cooldowns[cooldownKey] < (strat.cooldownMs || 6000)) 
    return;
  
  // 4. Current price validation
  const latest = ticks[ticks.length - 1];
  if (!latest.mid || !latest.bid || !latest.offer) return;
  if (latest.spread <= 0) return;
  
  // 5. Open positions limit
  const openScalperCount = scalperPositions
    .filter(p => p.status === "open").length;
  if (openScalperCount >= (strat.maxOpenPositions || 2)) 
    return;
  
  // 6. Max drawdown check
  const openRisk = scalperPositions
    .filter(p => p.status === "open")
    .reduce((sum, p) => sum + (p.riskAmount || 0), 0);
  const effectiveDrawdown = realizedPnl - openRisk;
  if (effectiveDrawdown <= -(config.maxDrawdown || 200)) return;
  
  // 7. Get strategy instance & evaluate
  const instance = getStrategyInstance(strat);
  if (!instance) return;
  
  const signal = instance.safeEvaluateEntry(ticks, context);
  if (!signal || !signal.signal || !signal.direction) return;
  
  // 8. Risk validation
  const direction = signal.direction;
  const stopDist = signal.stopDist || strat.stopDistance || (spread * 3);
  const limitDist = signal.limitDist || strat.limitDistance || (spread * 4);
  
  // 9. Size clamping (ensure within min/max)
  let size = signal.size || strat.size || 1;
  const minSize = strat.minSize || 0.5;
  const maxSize = strat.maxSize || 10;
  if (size < minSize) size = minSize;
  if (size > maxSize) size = maxSize;
  
  // 10. Risk amount check
  const riskAmount = stopDist * size * contractSize;
  const totalRisk = scalperPositions
    .filter(p => p.status === "open")
    .reduce((sum, p) => sum + (p.riskAmount || 0), 0);
  
  if (totalRisk + riskAmount > (config.budget || 5000)) return;
  
  // 11. Margin % check
  if (accountBalance > 0) {
    const marginPct = ((totalRisk + riskAmount) / accountBalance) * 100;
    if (marginPct > (config.maxMarginPct || 10)) return;
  }
  
  // 12. TRADE EXECUTED
  await openTrade(strat, epic, direction, size, stopDist, limitDist, ...);
}
```

### 1.3 When Does Trading Stop?

Auto-trading stops if ANY of these occur:

```javascript
// Stop condition 1: Max drawdown hit
if (effectiveDrawdown <= -(config.maxDrawdown || 200)) {
  config._drawdownTripped = true;  // Engine pauses
  log("WARN", "Max drawdown hit. Engine paused.");
  return;  // No more trades accepted
}

// Stop condition 2: Budget exhausted
if (totalRisk + riskAmount > (config.budget || 5000)) {
  return;  // Can't open new trades
}

// Stop condition 3: Max margin exceeded
const marginPct = ((totalRisk + riskAmount) / accountBalance) * 100;
if (marginPct > (config.maxMarginPct || 10)) {
  return;  // Can't open new trades
}

// Stop condition 4: Strategy disabled
if (!strat.enabled) {
  return;  // Won't evaluate this strategy
}

// Stop condition 5: Engine not running
if (!running || !config || !config.enabled) {
  return;  // All trading halted
}
```

---

## Part 2: API Endpoints to Control Auto-Trading

### 2.1 Get Scalper Engine Status

```http
GET /api/ig/scalper/status

Response:
{
  "running": false,                    // Engine running (true/false)
  "enabled": false,                    // Engine enabled (true/false)
  "openPositions": 0,                  // Current open trades
  "realizedPnl": 2450.75,              // Total closed P&L
  "unrealizedPnl": 150.00,             // Open P&L
  "tradeCount": 157,                   // Total trades executed
  "winCount": 92,                      // Winning trades
  "lossCount": 65,                     // Losing trades
  "winRate": 59,                       // Win rate %
  "drawdownTripped": false,            // Max DD hit?
  "budget": 5000,                      // Risk budget per cycle
  "maxDrawdown": 200,                  // Max loss before pause
  "maxMarginPct": 10,                  // Max margin % allowed
  "breakEvenBuffer": 1.5,              // Break-even buffer (points)
  "strategies": [
    {
      "id": 0,
      "name": "Gold Scalper",
      "instrument": "CS.D.XAUUSD.TODAY.IP",
      "strategyType": "scalper",
      "direction": "BOTH",
      "timeframe": "MINUTE_5",
      "size": 1,
      "stopDistance": 50,
      "limitDistance": 100,
      "cooldownMs": 6000,
      "enabled": true,
      "params": {}
    }
  ],
  "recentTrades": [
    {
      "type": "open",
      "epic": "CS.D.XAUUSD.TODAY.IP",
      "direction": "BUY",
      "size": 1,
      "entryPrice": 2050.50,
      "stopPrice": 2050.00,
      "limitPrice": 2051.00,
      "timestamp": "2024-01-10T14:30:00Z"
    }
  ]
}
```

### 2.2 Create a New Strategy

```http
POST /api/ig/scalper/strategies
Content-Type: application/json

{
  "name": "Gold Scalper",
  "instrument": "CS.D.XAUUSD.TODAY.IP",
  "strategyType": "scalper",
  "direction": "BOTH",                 // BUY, SELL, or BOTH
  "timeframe": "MINUTE_5",             // TICK, SECOND, MINUTE, MINUTE_5, HOUR, etc.
  "size": 1,                           // Trade size in contracts
  "stopDistance": 50,                  // Stop loss in points
  "limitDistance": 100,                // Take profit in points
  "minMomentumPct": 0.03,              // Min momentum for entry
  "cooldownMs": 6000,                  // Min milliseconds between trades
  "tickWindow": 15,                    // Ticks for momentum calc
  "maxOpenPositions": 2,               // Max concurrent trades
  "minSize": 0.5,                      // Minimum trade size
  "maxSize": 10,                       // Maximum trade size
  "profitTarget": 200,                 // Close when profit reaches $ (0=disabled)
  "trailingStop": 50,                  // Trailing stop in points (0=disabled)
  "warmupMs": 60000,                   // Milliseconds before trading starts
  "enabled": false,                    // Don't auto-start
  
  // Optional: Indicators (if schema supports)
  "rsiEnabled": true,
  "rsiPeriod": 14,
  "rsiOverbought": 70,
  "rsiOversold": 30,
  
  "emaEnabled": true,
  "emaShort": 9,
  "emaLong": 21,
  
  "macdEnabled": true,
  "macdFast": 12,
  "macdSlow": 26,
  "macdSignal": 9
}

Response:
{
  "ok": true,
  "index": 0,
  "strategy": { ...same object... }
}
```

### 2.3 Enable/Disable a Strategy (Toggle)

```http
POST /api/ig/scalper/strategies/{id}/toggle

Response:
{
  "ok": true,
  "index": 0,
  "enabled": true
}
```

After this call, the strategy will start evaluating entry signals on the next tick if:
- Engine is running (`config.enabled = true`)
- All entry constraints are met
- Lightstreamer is sending ticks for the instrument

### 2.4 Update Strategy Parameters

```http
PUT /api/ig/scalper/strategies/{id}
Content-Type: application/json

{
  "size": 2,
  "stopDistance": 40,
  "limitDistance": 120,
  "cooldownMs": 8000,
  "profitTarget": 300,
  "enabled": true
}

Response:
{
  "ok": true,
  "index": 0,
  "strategy": { ...updated object... }
}
```

### 2.5 Update Global Engine Settings

```http
PUT /api/ig/scalper
Content-Type: application/json

{
  "enabled": true,                   // Master on/off
  "riskPerTrade": 1,                 // % of account per trade
  "maxConcurrentTrades": 3,          // Max open positions
  "cooldownSeconds": 60,             // Global cooldown
  "budget": 5000,                    // Max risk per cycle ($)
  "maxDrawdown": 200,                // Max loss before pause ($)
  "maxMarginPct": 10,                // Max margin usage (%)
  "breakEvenBuffer": 1.5             // Minimum profit move (points)
}

Response:
{
  "ok": true,
  "enabled": true,
  "budget": 5000,
  ...
}
```

### 2.6 Start Engine (if using ceo-proxy)

```http
POST /api/ig/scalper/start

Response:
{
  "ok": false,
  "_localMode": true,
  "error": "Scalper engine requires ceo-proxy for real-time execution"
}

// On live ceo-proxy (NOT local ig-local-api):
Response:
{
  "ok": true,
  "running": true,
  "uptime": 5000
}
```

### 2.7 Stop Engine (if using ceo-proxy)

```http
POST /api/ig/scalper/stop

Response:
{
  "ok": true,
  "running": false
}
```

---

## Part 3: Required Fields for Auto-Trading

### 3.1 Minimum Required Fields for Strategy

For a strategy to trade, these fields MUST be present:

| Field | Type | Default | Required? | Notes |
|-------|------|---------|-----------|-------|
| `instrument` | string | — | **YES** | IG Epic code (e.g., "CS.D.GBPUSD.TODAY.IP") |
| `strategyType` | string | "scalper" | **YES** | Type of strategy (scalper, momentum-scalper, etc.) |
| `direction` | string | "BOTH" | **YES** | BUY, SELL, or BOTH |
| `timeframe` | string | "MINUTE" | **YES** | TICK, MINUTE, MINUTE_5, HOUR, etc. |
| `size` | number | 1 | **YES** | Trade size (>0) |
| `stopDistance` | number | — | **YES** | Stop loss points (>0) |
| `limitDistance` | number | — | **YES** | Take profit points (>0) |
| `enabled` | boolean | false | **YES** | Must be true to trade |
| `cooldownMs` | number | 6000 | No | Min ms between entries |
| `warmupMs` | number | 60000 | No | Ms before first trade |
| `maxOpenPositions` | number | 2 | No | Max concurrent trades |
| `minSize` | number | 0.5 | No | Min position size |
| `maxSize` | number | 10 | No | Max position size |

### 3.2 Optional Indicator Fields

If indicators are enabled in schema, these configure them:

```javascript
{
  "rsiEnabled": true,
  "rsiPeriod": 14,              // Default RSI period
  "rsiOverbought": 70,          // Above = overbought
  "rsiOversold": 30,            // Below = oversold
  
  "emaEnabled": true,
  "emaShort": 9,
  "emaLong": 21,
  
  "macdEnabled": true,
  "macdFast": 12,
  "macdSlow": 26,
  "macdSignal": 9
}
```

### 3.3 What Happens if Fields Are Missing?

**If `instrument` is missing**:
```
→ Strategy won't trade (no epic to subscribe to)
```

**If `enabled=false`**:
```
→ Strategy is skipped in processTick()
```

**If `stopDistance` is missing**:
```
→ Uses default: spread * 3
```

**If `limitDistance` is missing**:
```
→ Uses default: spread * 4
```

**If `direction="BOTH"` but signal is only BUY**:
```
→ Trade opens with BUY direction
→ Next signal must be for selling (opposite)
```

---

## Part 4: How Instruments Are Validated

### 4.1 Instrument Validation Flow

```
User enters "gbp" in search box
         ↓
Frontend sends: GET /api/ig/markets?q=gbp
         ↓
ig-local-api.mjs forwards to IG: /markets?searchTerm=gbp
         ↓
IG returns matching instruments:
{
  "markets": [
    {
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "instrumentName": "GBP/USD",
      "type": "CURRENCIES",
      "bid": 1.2555,
      "offer": 1.2560,
      "marketStatus": "TRADEABLE"
    },
    { ...more results... }
  ]
}
         ↓
Dashboard renders dropdown with 10 results
         ↓
User clicks "GBP/USD"
         ↓
Epic: CS.D.GBPUSD.TODAY.IP selected
         ↓
User creates strategy with this epic
         ↓
Strategy saved to config
         ↓
On first tick for this epic:
  - Fetch market details: GET /api/ig/markets/CS.D.GBPUSD.TODAY.IP
  - Extract valueOfOnePip, contractSize, scalingFactor
  - Calculate P&L multiplier
         ↓
✓ Ready to trade
```

### 4.2 Getting Instrument Details (Required for P&L Calculation)

Before trading, the engine fetches instrument details:

```http
GET /api/ig/markets/{epic}

Response:
{
  "instrument": {
    "name": "GBP/USD",
    "epic": "CS.D.GBPUSD.TODAY.IP",
    "type": "SPOT",
    "valueOfOnePip": 0.0001,         // Pip value (critical!)
    "contractSize": 1,                // Contracts per unit
    "minSize": 0.5,
    "maxSize": 100,
    "lotSize": 1,
    "unit": "POINTS",
    "currencyCode": "GBP"
  },
  "snapshot": {
    "bid": 1.2555,
    "offer": 1.2560,
    "high": 1.2600,
    "low": 1.2500,
    "percentageChange": 0.5,
    "scalingFactor": 1
  },
  "dealingRules": {
    "minStepDistance": 1.0,
    "minDealSize": 0.5,
    "maxDealSize": 100
  }
}
```

**Key Fields Used by Engine**:

```javascript
valueOfOnePip = 0.0001              // GBP/USD: £0.0001 per pip
contractSize = 1                    // GBP/USD: 1 contract = 1 lot
scalingFactor = 1

// P&L Calculation
riskAmount = stopDistance * size * contractSize * valueOfOnePip
           = 50 * 1 * 1 * 0.0001
           = £0.005 per trade

profit = (limitDistance) * size * contractSize * valueOfOnePip
       = 100 * 1 * 1 * 0.0001
       = £0.01 per winning trade
```

### 4.3 Which Epic Codes Are Valid?

Valid epics follow IG's naming convention:

```
Spot (Currencies):     CS.D.GBPUSD.TODAY.IP
                       CS.D.EURUSD.TODAY.IP
                       
Indices:               IX.D.FTSE.IFD.IP
                       IX.D.DAX.IFD.IP
                       
Commodities:           CS.D.XAUUSD.TODAY.IP    (Gold)
                       CS.D.XAGUSD.TODAY.IP    (Silver)
                       
CFD on Stocks:         EP.D.EZJ.DAILY.IP       (Individual stocks)
```

**To find valid epics**:
1. Search via `/api/ig/markets?q=searchterm`
2. Browse market navigation: `GET /api/ig/marketnavigation`
3. Use IG's market list directly

---

## Part 5: Risk Management Constraints

### 5.1 Global Engine Constraints

```javascript
// Engine-wide settings (applies to ALL strategies)
config = {
  enabled: false,                    // Master on/off
  budget: 5000,                      // Max $ risk per cycle
  maxDrawdown: 200,                  // Max loss before pause
  maxMarginPct: 10,                  // Max % of balance used
  breakEvenBuffer: 1.5               // Minimum move to be profitable
}
```

### 5.2 Per-Strategy Constraints

```javascript
strategy = {
  maxOpenPositions: 2,               // Max trades open simultaneously
  minSize: 0.5,                      // Never trade < this
  maxSize: 10,                       // Never trade > this
  cooldownMs: 6000,                  // Wait between trades
  warmupMs: 60000,                   // Wait before first trade
  minMomentumPct: 0.03               // Min price move to trigger
}
```

### 5.3 Trade Execution Constraints

When evaluating an entry signal:

```javascript
// 1. Position limit check
if (openPositions >= maxOpenPositions) {
  return;  // Can't open more
}

// 2. Drawdown check
if (realizedPnl - openRisk <= -maxDrawdown) {
  config._drawdownTripped = true;
  return;  // Pause engine
}

// 3. Budget check
if (totalRisk + newRiskAmount > budget) {
  return;  // Can't afford this trade
}

// 4. Margin check
if (((totalRisk + newRiskAmount) / accountBalance) * 100 > maxMarginPct) {
  return;  // Would exceed margin limit
}

// 5. Size clamping
if (size < minSize) size = minSize;
if (size > maxSize) size = maxSize;

// 6. Cooldown check
if (timeSinceLastTrade < cooldownMs) {
  return;  // Wait for cooldown
}

// 7. Warmup check
if (timeSinceEngineStart < warmupMs) {
  return;  // Still warming up
}
```

### 5.4 Break-Even Buffer Rule

```javascript
const minMove = spread * breakEvenBuffer;
if (limitDistance < minMove) {
  return;  // Profit target too close, likely to lose
}

// Default: breakEvenBuffer = 1.5
// If spread = 2 points, minMove = 3 points
// limitDistance must be ≥ 3 to proceed
```

This prevents the engine from taking trades with terrible risk/reward.

---

## Part 6: Complete Example: Create & Enable a Strategy

### 6.1 Step-by-Step Example

**Step 1: Search for instrument**
```bash
curl "http://localhost:5000/api/ig/markets?q=gbp" \
  -H "Authorization: Bearer token"

# Returns: CS.D.GBPUSD.TODAY.IP, IX.D.GBPINDEX, etc.
```

**Step 2: Get full instrument details**
```bash
curl "http://localhost:5000/api/ig/markets/CS.D.GBPUSD.TODAY.IP" \
  -H "Authorization: Bearer token"

# Returns: bid/offer, valueOfOnePip=0.0001, minSize=0.5, maxSize=100
```

**Step 3: Create strategy**
```bash
curl -X POST "http://localhost:5000/api/ig/scalper/strategies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "name": "GBP/USD Scalper",
    "instrument": "CS.D.GBPUSD.TODAY.IP",
    "strategyType": "scalper",
    "direction": "BOTH",
    "timeframe": "MINUTE_5",
    "size": 1,
    "stopDistance": 50,
    "limitDistance": 100,
    "cooldownMs": 6000,
    "maxOpenPositions": 2,
    "minSize": 0.5,
    "maxSize": 10,
    "enabled": false
  }'

# Returns: index=0, strategy created
```

**Step 4: Update engine settings**
```bash
curl -X PUT "http://localhost:5000/api/ig/scalper" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "budget": 5000,
    "maxDrawdown": 200,
    "maxMarginPct": 10
  }'
```

**Step 5: Enable strategy**
```bash
curl -X POST "http://localhost:5000/api/ig/scalper/strategies/0/toggle"

# Response: enabled=true
# Strategy now trading!
```

**Step 6: Monitor status**
```bash
curl "http://localhost:5000/api/ig/scalper/status" | jq .

# Shows: openPositions, winRate, realizedPnl, etc.
```

### 6.2 State After Enable

Once enabled, on the next Lightstreamer tick for `CS.D.GBPUSD.TODAY.IP`:

```
Lightstreamer: bid=1.2555, offer=1.2560, mid=1.25575
         ↓
processTick("CS.D.GBPUSD.TODAY.IP", {bid, offer, mid})
         ↓
Filters matched strategy (enabled=true, instrument matches)
         ↓
Aggregates tick into MINUTE_5 candle
         ↓
evaluateEntry called with last 50 ticks
         ↓
Strategy evaluates RSI/EMA/MACD (if enabled)
         ↓
If signal is BUY (and constraints pass):
  openTrade called
         ↓
POST /api/ig/positions/open (direction=BUY, size=1, stop=50, limit=100)
         ↓
IG executes → dealId=12345
         ↓
Trade logged, strategy tracks dealId
         ↓
Dashboard shows: "1 open position"
```

---

## Part 7: Troubleshooting Auto-Trading

### Issue: Strategy Won't Trade

**Check 1: Is strategy enabled?**
```bash
GET /api/ig/scalper/status | grep "enabled"
```

**Check 2: Is instrument getting ticks?**
```bash
GET /api/ig/stream/status
# Check: lsConnectedEpics includes your instrument
```

**Check 3: Has warmup period passed?**
```
Strategy won't trade for first 60 seconds (warmupMs=60000)
Wait 1 minute from engine start
```

**Check 4: Is max drawdown hit?**
```bash
GET /api/ig/scalper/status | grep "drawdownTripped"
# If true: losses exceeded maxDrawdown. Engine paused.
# Reset: Stop engine, fix strategy, restart
```

**Check 5: Are constraints being violated?**
```
- maxOpenPositions: already 2 trades open?
- budget: risk of new trade > budget?
- maxMarginPct: margin would exceed 10%?
- cooldownMs: < 6 seconds since last trade?
```

### Issue: Trades Keep Getting Rejected

**Check**: Are all required fields present?
```javascript
instrument,         // ✓ Required
strategyType,       // ✓ Required
direction,          // ✓ Required
timeframe,          // ✓ Required
size,               // ✓ Required
stopDistance,       // ✓ Required
limitDistance,      // ✓ Required
enabled             // ✓ Required
```

### Issue: Engine Stops Unexpectedly

**Reason 1**: Max drawdown hit
```bash
GET /api/ig/scalper/status | grep "realizedPnl"
# If realizedPnl < -200: drawdownTripped=true
```

**Reason 2**: Account balance too low
```bash
GET /api/ig/account
# If balance < (totalRisk / maxMarginPct * 100): no margin
```

---

## Summary: Quick Reference

| Item | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| **Status** | `/api/ig/scalper/status` | GET | Check engine state |
| **Create** | `/api/ig/scalper/strategies` | POST | New strategy |
| **Toggle** | `/api/ig/scalper/strategies/{id}/toggle` | POST | Enable/disable |
| **Update** | `/api/ig/scalper/strategies/{id}` | PUT | Change params |
| **Delete** | `/api/ig/scalper/strategies/{id}` | DELETE | Remove strategy |
| **Engine Config** | `/api/ig/scalper` | PUT | Global settings |
| **Search** | `/api/ig/markets?q=...` | GET | Find instruments |
| **Details** | `/api/ig/markets/{epic}` | GET | Instrument info |

**Key Fields**:
- `instrument`: Epic code (required)
- `strategyType`: scalper, momentum-scalper, etc.
- `enabled`: true to trade
- `stopDistance` & `limitDistance`: Risk/reward in points
- `cooldownMs`: Milliseconds between trades
- `maxOpenPositions`: Max concurrent trades

**To Start Trading**:
1. Create strategy with POST
2. Enable with POST /toggle
3. Engine auto-starts on first tick
4. Monitor with GET /status
