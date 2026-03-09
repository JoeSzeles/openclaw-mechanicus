# ClawScript Trading Bot Rulebook

## Purpose
This rulebook defines the **mandatory requirements** for creating valid, tradeable bots via ClawScript. Every ClawScript strategy MUST follow these rules or it will be rejected by the trading engine.

---

## 1. Required Structure

Every trading strategy MUST contain:

### 1.1 Entry Conditions (MANDATORY)
At least one `BUY` or `SELL` command with a condition:
```clawscript
IF rsi < 30 AND ema_fast > ema_slow
  BUY MARKET SIZE 1
ENDIF
```

### 1.2 Exit Conditions (RECOMMENDED)
Define when to close positions:
```clawscript
IF rsi > 70 AND position == "LONG"
  EXIT "RSI overbought"
ENDIF
```

### 1.3 Indicator Setup (MANDATORY)
Use at least one indicator for entry signals — never trade blind:
```clawscript
DEF rsi = RSI(prices, 14)
DEF ema_fast = EMA(prices, 9)
DEF ema_slow = EMA(prices, 21)
```

### 1.4 Risk Management (MANDATORY)
Every strategy MUST specify stop loss and take profit:
```clawscript
INPUT_INT stopDistance = 30 "Stop Loss Distance"
INPUT_INT limitDistance = 60 "Take Profit Distance"
```

---

## 2. Indicator Rules

### 2.1 Available Indicators
| Indicator | ClawScript | Parameters | Notes |
|-----------|-----------|-----------|-------|
| RSI | `RSI(prices, period)` | period: 2-100 | Momentum oscillator |
| EMA | `EMA(prices, period)` | period: 2-200 | Exponential moving average |
| SMA | `SMA(prices, period)` or `AVERAGE(prices, period)` | period: 2-200 | Simple moving average |
| MACD | `MACD(prices, fast, slow, signal)` | fast:12, slow:26, signal:9 | Returns histogram value |
| Bollinger | `BOLLINGER(prices, period, stddev)` | period:20, stddev:2 | Returns {upper, middle, lower} |
| ATR | `ATR(prices, period)` | period: 14 | Average True Range |
| ADX | `ADX(prices, period)` | period: 14 | Average Directional Index |
| Stochastic | `STOCHASTIC(prices, kPeriod, dPeriod)` | k:14, d:3 | Returns %K value |
| CCI | `CCI(prices, period)` | period: 20 | Commodity Channel Index |

### 2.2 Null Checks (MANDATORY)
All indicators can return `null` if insufficient data. ALWAYS check:
```clawscript
DEF rsi = RSI(prices, 14)
IF rsi == null
  // Skip — not enough data yet
ENDIF
```

### 2.3 Minimum Data Requirements
- RSI: needs `period + 1` bars minimum
- EMA: needs `period` bars minimum  
- MACD: needs `slow + signal` bars minimum (default: 35)
- ADX: needs `period * 3` bars minimum
- Bollinger: needs `period` bars minimum

---

## 3. Trade Signal Rules

### 3.1 BUY Signal Format
```clawscript
BUY MARKET SIZE 1
```
The engine converts this to: `{ signal: true, direction: "BUY", size: 1, stopDist: config.stopDistance, limitDist: config.limitDistance }`

### 3.2 SELL Signal Format
```clawscript
SELL MARKET SIZE 1
```
Converted to: `{ signal: true, direction: "SELL", size: 1, stopDist: config.stopDistance, limitDist: config.limitDistance }`

### 3.3 EXIT Signal Format
```clawscript
EXIT "reason text"
```
Converted to: `{ close: true, reason: "reason text" }`

### 3.4 Conditional Entry (MANDATORY)
NEVER use unconditional BUY/SELL. Always wrap in IF:
```clawscript
// BAD — trades every tick
BUY MARKET SIZE 1

// GOOD — trades on signal
IF rsi < 30 AND ema_fast > ema_slow
  BUY MARKET SIZE 1
ENDIF
```

---

## 4. Risk Management Rules

### 4.1 Stop Loss (MANDATORY)
Every strategy MUST have a stop distance > 0:
```clawscript
INPUT_INT stopDistance = 30 "Stop Loss Distance (points)"
```

### 4.2 Take Profit (MANDATORY)
Every strategy MUST have a limit distance > 0:
```clawscript
INPUT_INT limitDistance = 60 "Take Profit Distance (points)"
```

### 4.3 Risk:Reward Ratio
Minimum 1:1.5 recommended. Stop distance should be smaller than limit distance:
```
limitDistance >= stopDistance * 1.5
```

### 4.4 Position Sizing
Default size is 1. Use `INPUT_INT size` to make it configurable:
```clawscript
INPUT_INT size = 1 "Position Size"
```

---

## 5. Strategy Template

### 5.1 Minimal Valid Strategy
```clawscript
// Minimal RSI Strategy
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT rsiOversold = 30 "RSI Oversold"
INPUT_INT rsiOverbought = 70 "RSI Overbought"
INPUT_INT stopDistance = 20 "Stop Distance"
INPUT_INT limitDistance = 40 "Limit Distance"
INPUT_INT size = 1 "Position Size"

DEF rsi = RSI(prices, rsiPeriod)

IF rsi != null
  IF rsi < rsiOversold
    BUY MARKET SIZE size
  ENDIF
  IF rsi > rsiOverbought
    SELL MARKET SIZE size
  ENDIF
ENDIF
```

### 5.2 Full Strategy with Multiple Indicators
```clawscript
// Trend Following Strategy with Multi-Indicator Confirmation
INPUT_INT emaFast = 9 "EMA Fast Period"
INPUT_INT emaSlow = 21 "EMA Slow Period"
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT adxPeriod = 14 "ADX Period"
INPUT_INT adxThreshold = 25 "ADX Trend Threshold"
INPUT_INT stopDistance = 30 "Stop Distance"
INPUT_INT limitDistance = 60 "Limit Distance"
INPUT_INT size = 1 "Position Size"

DEF ema_fast = EMA(prices, emaFast)
DEF ema_slow = EMA(prices, emaSlow)
DEF rsi = RSI(prices, rsiPeriod)
DEF adx = ADX(prices, adxPeriod)
DEF macd = MACD(prices, 12, 26, 9)

IF ema_fast == null OR ema_slow == null OR rsi == null
  // Not enough data — skip
ENDIF

IF adx > adxThreshold
  IF ema_fast > ema_slow AND rsi < 60 AND macd > 0
    BUY MARKET SIZE size
  ENDIF
  IF ema_fast < ema_slow AND rsi > 40 AND macd < 0
    SELL MARKET SIZE size
  ENDIF
ENDIF
```

### 5.3 Mean Reversion Strategy
```clawscript
// Mean Reversion with Bollinger Bands
INPUT_INT bbPeriod = 20 "Bollinger Period"
INPUT_FLOAT bbStdDev = 2.0 "Bollinger Std Dev"
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT stopDistance = 25 "Stop Distance"
INPUT_INT limitDistance = 50 "Limit Distance"

DEF bb = BOLLINGER(prices, bbPeriod, bbStdDev)
DEF rsi = RSI(prices, rsiPeriod)
DEF price = prices[prices.length - 1]

IF bb != null AND rsi != null
  IF price < bb.lower AND rsi < 30
    BUY MARKET SIZE 1
  ENDIF
  IF price > bb.upper AND rsi > 70
    SELL MARKET SIZE 1
  ENDIF
ENDIF
```

---

## 6. Validation Checklist

Before deploying a ClawScript strategy, verify:

- [ ] Has at least one BUY or SELL command with conditions
- [ ] Uses at least one technical indicator (RSI, EMA, MACD, etc.)
- [ ] Has null checks for all indicators
- [ ] Specifies stopDistance > 0
- [ ] Specifies limitDistance > 0
- [ ] limitDistance >= stopDistance (risk:reward >= 1:1)
- [ ] Has INPUT_INT/FLOAT for all configurable parameters
- [ ] Tested via backtest with > 0 trades generated
- [ ] Strategy compiles without errors
- [ ] Strategy loads in the engine (check strategy loader logs)

---

## 7. Common Mistakes

### 7.1 No Trade Signals
```clawscript
// BAD: No BUY or SELL — strategy does nothing
DEF rsi = RSI(prices, 14)
ALERT "RSI is " + rsi
```
Fix: Add conditional BUY/SELL commands.

### 7.2 Missing Null Checks
```clawscript
// BAD: Will crash when indicators return null
IF RSI(prices, 14) < 30
  BUY MARKET SIZE 1
ENDIF
```
Fix: Store in variable, check for null first.

### 7.3 No Stop Loss
```clawscript
// BAD: No stop distance — trades have no protection
BUY MARKET SIZE 10
```
Fix: Always define stopDistance and limitDistance via INPUT_INT.

### 7.4 Unconditional Trading
```clawscript
// BAD: Trades on every single tick
BUY MARKET SIZE 1
```
Fix: Wrap in IF with indicator conditions.

---

## 8. Engine Integration

### 8.1 How the Engine Loads Strategies
1. ClawScript compiles to a `.cjs` file in `skills/bots/strategies/`
2. File must be named `custom-<name>-strategy.cjs`
3. Class must have `static get STRATEGY_TYPE()` returning `'custom-<name>'`
4. Class must extend `BaseStrategy` from `./base-strategy.cjs`
5. Class must implement `evaluateEntry(ticks, context)` returning `{signal, direction, size, stopDist, limitDist, reason}` or `null`

### 8.2 What Happens on Load Failure
- If `STRATEGY_TYPE` is missing: strategy is SKIPPED with error log
- If strategy type doesn't match DB: error popup shown in dashboard
- NO silent fallback to scalper — the error is surfaced immediately

### 8.3 Testing Your Strategy
1. Compile in ClawScript Editor
2. Run Backtest with your target instrument and timeframe
3. Check backtest results: must show > 0 trades
4. If 0 trades: indicators may need different thresholds, or conditions are too restrictive
5. Check server logs for `[strategy-loader] ERROR` messages

---

## 9. File Location Reference

| File | Purpose |
|------|---------|
| `skills/clawscript/TRADING-BOT-RULEBOOK.md` | This rulebook |
| `skills/clawscript/CLAWSCRIPT.md` | Full ClawScript language reference |
| `skills/bots/strategies/base-strategy.cjs` | Base class all strategies extend |
| `skills/bots/strategies/index.cjs` | Strategy auto-loader and registry |
| `skills/bots/clawscript-parser.cjs` | ClawScript parser and code generator |
| `skills/bots/indicators.cjs` | All indicator implementations |
| `skills/bots/ig-scalper-backtest.cjs` | Backtest engine |
| `skills/bots/trade-claw-engine.cjs` | Live trading engine |
