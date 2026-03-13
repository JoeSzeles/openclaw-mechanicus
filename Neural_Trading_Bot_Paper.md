# BrainJar Neural Trading System
## A Biologically-Inspired Spiking Neural Network for Autonomous Financial Market Trading

---

**System Version:** 3.0  
**Architecture:** Leaky Integrate-and-Fire (LIF) Spiking Neural Network  
**Runtime:** Node.js (brain-engine-server.cjs)  
**Interface:** OpenClaw IG Trading Dashboard  
**Target Market:** IG Group CFD/Spread-bet instruments (Forex, Commodities, Indices)

---

## Abstract

BrainJar is an autonomous trading system built on a biologically-inspired Leaky Integrate-and-Fire (LIF) spiking neural network. Unlike conventional machine-learning trading bots that rely on gradient-based optimization, BrainJar models individual neurons with membrane potentials, synaptic conductances, and refractory periods. The network is organized into three functional regions — Sensory, Interneuron, and Motor — with specialized subsystems including a Volume Antenna for real-time market microstructure analysis, a Mushroom Body for memory consolidation, and a Cortex layer for autonomous trade execution with multi-timeframe signal confirmation.

The system supports four training modes: Backtest (offline historical replay with feedback), Live Training (candle-by-candle online learning), Auto-Test (automated walk-forward evaluation), and Proof Test (controlled directional verification). An adaptive calibration engine scans threshold-timeframe combinations via dry-run backtests and can auto-recalibrate at configurable intervals to track changing market conditions.

All state — synapse weights, pattern memory, cortex parameters, and open positions — is persisted to disk with atomic writes and automatic backups, enabling crash-resilient continuous operation.

---

## Table of Contents

1. [Network Architecture](#1-network-architecture)
2. [Neuron Model: Leaky Integrate-and-Fire](#2-neuron-model-leaky-integrate-and-fire)
3. [Synaptic Connectivity](#3-synaptic-connectivity)
4. [Sensory Encoding](#4-sensory-encoding)
5. [Volume Antenna: Market Pressure Sensing](#5-volume-antenna-market-pressure-sensing)
6. [Mushroom Body: Memory Consolidation](#6-mushroom-body-memory-consolidation)
7. [Motor Output: Signal Generation](#7-motor-output-signal-generation)
8. [Adaptive Feedback (Sugar/Pain Learning)](#8-adaptive-feedback-sugarpain-learning)
9. [Cortex: Autonomous Trade Execution](#9-cortex-autonomous-trade-execution)
10. [Calibration Engine](#10-calibration-engine)
11. [Candle Aggregation](#11-candle-aggregation)
12. [Training Modes](#12-training-modes)
13. [State Persistence](#13-state-persistence)
14. [Architecture Presets & Scaling](#14-architecture-presets--scaling)
15. [Complete Trade Lifecycle: Worked Example](#15-complete-trade-lifecycle-worked-example)
16. [API Reference](#16-api-reference)

---

## 1. Network Architecture

The network consists of three neuron regions arranged in a feedforward topology with recurrent interneuron connections:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BRAIN ENGINE                                 │
│                                                                     │
│  ┌──────────────┐     ┌──────────────────────┐     ┌─────────────┐ │
│  │   SENSORY    │────▶│    INTERNEURONS       │────▶│   MOTOR     │ │
│  │  (N_SENSORY) │     │    (N_INTER)          │     │  (N_MOTOR)  │ │
│  │              │     │                        │     │             │ │
│  │ price_up  18%│     │ ┌────────────────────┐ │     │ BUY   ⅓    │ │
│  │ price_down18%│     │ │  MUSHROOM BODY     │ │     │ SELL  ⅓    │ │
│  │ volume   14% │     │ │  (top 20% of inter)│ │     │ HOLD  ⅓    │ │
│  │ spread   10% │     │ │  connectivity: 0.3 │ │     │             │ │
│  │ momentum 10% │     │ └────────────────────┘ │     │ (feedback   │ │
│  │ antenna  30% │     │                        │◀───│  inhibitory)│ │
│  └──────────────┘     └──────────────────────┘     └─────────────┘ │
│                                                                     │
│  Default: S=100  I=200  M=50  Total=350  Synapses≈4290             │
└─────────────────────────────────────────────────────────────────────┘
```

**Sensory region** neurons are allocated proportionally:

| Sub-group    | Default Count | % of Sensory | Function                                    |
|-------------|---------------|-------------|---------------------------------------------|
| price_up    | 20            | 18%         | Detects price increases                     |
| price_down  | 20            | 18%         | Detects price decreases                     |
| volume      | 15            | 14%         | Trade activity / volume                     |
| spread      | 10            | 10%         | Bid-ask spread width / liquidity            |
| momentum    | 10            | 10%         | Price acceleration                          |
| antenna     | 25            | 30%         | Pressure sensing (7 sub-channels)           |

All allocations automatically scale when the architecture is resized. The formula for each group:

```
count = max(minimum, floor(N_SENSORY * percentage))
antenna = N_SENSORY - sum(all_other_groups)   // gets the remainder
```

---

## 2. Neuron Model: Leaky Integrate-and-Fire

Each neuron is modeled as a single-compartment LIF unit with 4 state variables stored in a contiguous `Float64Array`:

| Offset | Variable | Description              |
|--------|----------|--------------------------|
| 0      | V        | Membrane potential (mV)  |
| 1      | g        | Synaptic conductance     |
| 2      | (unused) | Reserved                 |
| 3      | refrac   | Refractory timer (ms)    |

**Constants:**

| Parameter    | Symbol    | Value   | Unit |
|-------------|-----------|---------|------|
| Resting potential | V_REST | -52.0 | mV |
| Spike threshold   | V_THRESH | -45.0 | mV |
| Reset potential   | V_RESET | -52.0 | mV |
| Membrane time constant | TAU_M | 20.0 | ms |
| Synaptic time constant | TAU_SYN | 5.0 | ms (configurable) |
| Refractory period | REFRAC_MS | 2.2 | ms |
| Time step | DT | 1.0 | ms |

**Update equations** (per timestep):

```
if refrac > 0:
    refrac -= DT
    skip this neuron

dV = (V_REST - V + g) / TAU_M × DT
dg = -g / TAU_SYN × DT

V ← V + dV
g ← g + dg

if V > V_THRESH:
    SPIKE!
    V ← V_RESET
    g ← 0
    refrac ← REFRAC_MS
```

**Spike propagation:** When neuron `i` fires, every synapse with `pre == i` adds its weight `w` to the post-synaptic neuron's conductance:

```
for each synapse where syn.pre == fired_neuron:
    neurons[syn.post].g += syn.w
```

---

## 3. Synaptic Connectivity

Synapses are initialized with random topology following biological fanout rules:

### Fanout Calculations

```
sensoryFanout = max(3, min(30, floor(N_INTER × 0.075)))
interFanout   = max(3, min(30, floor((N_INTER + N_MOTOR) × 0.05)))
motorFeedback = max(1, min(5, floor(N_INTER × 0.015)))
```

### Connection Rules

**Sensory → Interneuron:**
- Each sensory neuron connects to `sensoryFanout` random interneurons
- Weight: `w = (random × 0.5 + 0.1) × w_syn`
- All excitatory

**Interneuron → Interneuron/Motor:**
- Each interneuron connects to `interFanout` random targets
- 30% probability of targeting motor region, 70% targeting other interneurons
- Mushroom body neurons get 50% more connections (`fanout × 1.5`)
- 80% excitatory, 20% inhibitory (weight scaled by -0.5)
- Weight: `w = (random × 0.4 + 0.05) × w_syn × (1 or -0.5)`

**Motor → Interneuron (feedback):**
- Each motor neuron connects to `motorFeedback` random interneurons
- Weight: `w = -0.2 × w_syn` (all inhibitory — negative feedback loop)

### Critical Parameter: w_syn

`w_syn` (default: **12.0**) is the global synaptic weight multiplier. It **must be ≥ 12.0** for motor neurons to receive enough excitation to spike. Lower values produce a silent motor layer (no trading signals).

### Default Network Statistics

For the default architecture (S=100, I=200, M=50):

```
sensoryFanout = max(3, min(30, floor(200 × 0.075))) = 15
interFanout   = max(3, min(30, floor(250 × 0.05)))  = 12
motorFeedback = max(1, min(5, floor(200 × 0.015)))  = 3

Total synapses ≈ 100×15 + 200×12 + 50×3 = 1500 + 2400 + 150 = 4050
(~4290 with mushroom body extra connections)
```

---

## 4. Sensory Encoding

When a price tick arrives, the `stimulateFromPrice()` function converts market data into neural input:

### Price Change Encoding

```
delta = price - prevPrice
pctChange = |delta / prevPrice| × 10000    // basis points × 10

For price_up neurons:
    intensity = pctChange × (1.5 if delta > 0 else 0.5)

For price_down neurons:
    intensity = pctChange × (1.5 if delta < 0 else 0.5)
```

**Example:** Gold moves from 2340.50 to 2341.00 (+0.50)
```
delta = +0.50
pctChange = |0.50 / 2340.50| × 10000 = 2.14

price_up intensity = 2.14 × 1.5 = 3.21  (amplified — correct direction)
price_down intensity = 2.14 × 0.5 = 1.07 (dampened — wrong direction)
```

### Momentum Encoding

```
acceleration = pctChange × 2   if |pctChange| > 50
             = pctChange        otherwise
```

Large moves get double intensity, creating a non-linear response to sharp price changes.

### Volume Encoding

```
volIntensity = min(volume / 100, 200)
```

### Spread Encoding

```
spreadIntensity = spread × 1000
```

### Poisson Spike Injection

For each sensory neuron receiving input, a Poisson process determines whether it fires:

```
poissonRate = intensity × r_poi / 100     // r_poi default: 150
probability = poissonRate × DT / 1000

if random() < probability:
    neuron.g += w_syn × 250              // strong current injection
```

### Simulation Steps per Tick

Each price tick runs **10 simulation steps**, allowing the spike cascade to propagate through the network before reading motor output.

---

## 5. Volume Antenna: Market Pressure Sensing

The Volume Antenna is a specialized sensory subsystem that detects market microstructure events beyond simple price/volume changes. It occupies the `antenna` region of sensory neurons (30% of total).

### Antenna Sub-groups

| Sub-group       | % of Antenna | Description |
|----------------|-------------|-------------|
| tickVelocity   | 20%         | Tick rate / speed of market |
| volumeAccel    | 16%         | Volume acceleration (increasing/decreasing) |
| buySellPressure| 16%         | Uptick vs downtick ratio |
| absorption     | 12%         | High volume + small price move |
| flashCrash     | 12%         | Flash crash / breakout spike |
| deadCat        | 12%         | Dead cat bounce / falling knife |
| divergence     | 12%         | Volume-price divergence |

### Pressure Computation

The antenna maintains a sliding window of recent ticks (default: 30 seconds). From this window, it computes seven pressure scores:

#### 5.1 Tick Velocity

```
tickVelocity = tickCount / elapsedSeconds
velocityAccel = (tickVelocity - prevWindowRate) / prevWindowRate
```

Measures how fast the market is trading. High velocity often precedes breakouts.

#### 5.2 Volume/Spread Acceleration

The antenna automatically detects whether real volume data is available:

```
hasVolume = any tick in last 10 has vol > 0
useSpreadMode = !hasVolume
```

If volume data is unavailable (common in CFD/spread-bet), it switches to **Spread Mode**, using bid-ask spread changes as a proxy for volume:

```
// Volume mode:
volumeAccel = (currentWindowVolume - prevWindowVolume) / prevWindowVolume

// Spread mode:
spreadAccel = (avgSpread - prevAvgSpread) / prevAvgSpread
spreadSpikeRatio = avgSpread / baselineSpread
```

The baseline spread is an exponentially-weighted moving average:

```
baselineSpread = baselineSpread × 0.99 + currentSpread × 0.01
```

#### 5.3 Buy/Sell Pressure

```
buySellRatio = upTicks / (upTicks + downTicks)
```

Values > 0.5 indicate buying pressure, < 0.5 indicate selling pressure. This drives the `buySellPressure` sub-group, where half the neurons are "buy neurons" and half are "sell neurons":

```
bsBias = (buySellRatio - 0.5) × 2
For buy neurons: intensity × 1.5 if bias > 0, × 0.3 if bias < 0
For sell neurons: intensity × 1.5 if bias < 0, × 0.3 if bias > 0
```

#### 5.4 Absorption Score

Detects when large volume/activity is absorbed without price movement (indicates hidden orders):

```
// Volume mode:
volPerMove = totalVolume / (priceRange + 0.001)
absorptionScore = min(volPerMove / 50, 3.0)

// Spread mode:
if spreadSpikeRatio > 1.5 AND priceRange < avgSpread × 2:
    absorptionScore = min((spreadSpikeRatio - 1) × 2, 3.0)
```

#### 5.5 Flash Crash Score

Detects sudden violent price moves:

```
flashCrashScore = (tickVelocity × priceVelocity) / 10

// Amplified by volume surge or spread spike:
if volumeAccel > 1:
    flashCrashScore *= (1 + volumeAccel)
// or in spread mode:
if spreadSpikeRatio > 2.0:
    flashCrashScore *= spreadSpikeRatio

flashCrashScore = min(flashCrashScore, 5.0)
```

#### 5.6 Dead Cat Bounce Score

Detects weak rallies after a sharp drop (suggests further downside):

```
dropFromHigh = recentHigh - recentLow
bounceFromLow = lastPrice - recentLow
bounceRatio = bounceFromLow / dropFromHigh

if 0.1 < bounceRatio < 0.5:
    // Volume mode:
    if recentVolume / dropVolume < 0.7:
        deadCatScore = (1 - volRatio) × (1 - bounceRatio) × 3

    // Spread mode:
    if recentSpread / dropSpread < 0.7:
        deadCatScore = (1 - spreadContracting) × (1 - bounceRatio) × 3
```

#### 5.7 Divergence Score

Detects when price makes new highs/lows but volume/activity doesn't confirm:

```
isNewHigh = lastPrice >= recentHigh × 0.999
isNewLow = lastPrice <= recentLow × 1.001

// Volume mode:
if (isNewHigh or isNewLow) AND volumeAccel < -0.2:
    divergenceScore = min(|volumeAccel| × 2, 3.0)

// Spread mode:
if (isNewHigh or isNewLow) AND spreadSpikeRatio > 1.8:
    divergenceScore = min((spreadSpikeRatio - 1) × 1.5, 3.0)
```

### Antenna Actions

The antenna pressure scores drive three trade-level actions:

**Emergency Exit:** If holding a position and flash crash score exceeds threshold while price moves against the position:
```
if flashCrashScore >= flashThreshold AND price moving against position:
    → EMERGENCY CLOSE
```

**Breakout Entry:** If no position and flash crash exceeds threshold with strong directional signal:
```
if flashCrashScore >= flashThreshold AND tickVelocity > 2:
    if priceDelta > 0 AND buySellRatio > 0.6: → BREAKOUT BUY
    if priceDelta < 0 AND buySellRatio < 0.4: → BREAKOUT SELL
```

**Entry Block:** Prevents entering trades during dangerous conditions:
```
BUY blocked if: deadCatScore >= sensitivity×2, OR fallingKnifeScore >= 1.5, OR divergenceScore >= 1.5 with selling pressure
SELL blocked if: divergenceScore >= 1.5 with buying pressure
```

---

## 6. Mushroom Body: Memory Consolidation

Inspired by the insect brain's mushroom body (a structure critical for associative learning and memory), this subsystem is a densely-connected cluster within the interneuron layer.

```
Mushroom Body:
    start = 0 (first interneuron)
    count = max(10, floor(N_INTER × 0.2))    // top 20% of interneurons
    connectivity = 0.3                         // 30% chance of intra-cluster connections
```

**Behavior:**
- Mushroom body neurons get 50% more outgoing connections than regular interneurons
- 30% of their connections target other mushroom body neurons (recurrent loops)
- This creates a densely interconnected cluster that develops strong activation patterns
- During sugar feedback, mushroom body synapses are specifically strengthened, consolidating winning patterns

---

## 7. Motor Output: Signal Generation

Motor neurons are divided into three equal groups:

```
BUY neurons:  indices [motorStart .. motorStart + N_MOTOR/3)
SELL neurons: indices [motorStart + N_MOTOR/3 .. motorStart + 2*N_MOTOR/3)
HOLD neurons: indices [motorStart + 2*N_MOTOR/3 .. motorStart + N_MOTOR)
```

### Firing Rate Calculation

Over the last 10 simulation steps, count spikes in each motor group and convert to firing rates:

```
buy_signal  = (buy_spikes × 1000 / (window × DT)) / num_buy_neurons
sell_signal = (sell_spikes × 1000 / (window × DT)) / num_sell_neurons
hold_signal = (hold_spikes × 1000 / (window × DT)) / num_hold_neurons
```

The scale factor `1000 / (window × DT)` converts spike counts to Hz (spikes per second), normalized per neuron.

**Example:** Default architecture (N_MOTOR = 50), 10-step window:
```
buy_neurons = 16, sell_neurons = 17, hold_neurons = 17
If 5 buy neurons fired over 10 steps:
    buy_signal = (5 × 1000 / (10 × 1)) / 16 = 31.25 Hz
```

### Signal Determination

```
if buy_signal > sell_signal AND buy_signal > hold_signal: signal = BUY
elif sell_signal > buy_signal AND sell_signal > hold_signal: signal = SELL
else: signal = HOLD
```

---

## 8. Adaptive Feedback (Sugar/Pain Learning)

The learning mechanism modifies synapse weights based on trade outcomes.

### Feedback Modifier Calculation

```
REF_SYNAPSES = 4290          // reference network size
BASE_DELTA = 0.15            // base learning rate (same for sugar and pain)

scale = sqrt(REF_SYNAPSES / actual_synapses)

sugar_modifier = 1 + (BASE_DELTA × scale)    // strengthens weights
pain_modifier  = 1 - (BASE_DELTA × scale)    // weakens weights
```

**Why the scale factor?** Larger networks have more synapses. Without scaling, the same percentage change would move a 20,000-synapse network much more dramatically than a 4,000-synapse network. The `sqrt(ref/actual)` ensures consistent learning magnitude regardless of architecture size.

**Example:** Default network (4290 synapses):
```
scale = sqrt(4290/4290) = 1.0
sugar_modifier = 1 + 0.15 = 1.15    (+15% weight increase)
pain_modifier  = 1 - 0.15 = 0.85    (-15% weight decrease)
```

**Example:** Large network (20000 synapses):
```
scale = sqrt(4290/20000) = 0.463
sugar_modifier = 1 + 0.15 × 0.463 = 1.069    (+6.9% increase)
pain_modifier  = 1 - 0.15 × 0.463 = 0.931    (-6.9% decrease)
```

### Weight Clamping

All weights are clamped to prevent runaway growth:

```
w_clamp = max(2, w_syn × 0.25)    // default: max(2, 12 × 0.25) = 3.0
w = clamp(w, -w_clamp, +w_clamp)
```

### Feedback Targets

| Target     | When Applied                        | Effect |
|-----------|--------------------------------------|--------|
| motor     | Every winning/losing trade           | Strengthens/weakens motor pathways |
| mushroom  | Winning trades only (sugar)          | Consolidates memory of winning patterns |
| all       | Manual training                      | Global network adjustment |
| sensory   | Manual training                      | Adjust input sensitivity |

### Auto-Learn Integration

When `cortexAutoLearn` is enabled (default: true), the cortex automatically applies feedback after every trade:

```
Profitable trade (TP, signal close with profit):
    → sugar feedback to motor + mushroom

Losing trade (SL, signal close with loss, emergency close):
    → pain feedback to motor only
```

---

## 9. Cortex: Autonomous Trade Execution

The Cortex is the dashboard-side decision engine that uses brain motor signals to execute real trades via the IG API.

### 9.1 Signal Thresholding

```
rawSignal = HOLD

if buy_signal >= cortexBuyThreshold AND buy_signal > sell_signal + holdZone:
    rawSignal = BUY

elif sell_signal >= cortexSellThreshold AND sell_signal > buy_signal + holdZone:
    rawSignal = SELL
```

**Parameters:**
- `cortexBuyThreshold` (default: 10) — minimum buy_signal Hz to consider a BUY
- `cortexSellThreshold` (default: 10) — minimum sell_signal Hz to consider a SELL
- `cortexHoldZone` (default: 2) — minimum spread between buy and sell signals

### 9.2 Signal Confirmation

To prevent noise-triggered trades, signals must be confirmed over consecutive candles:

```
if rawSignal != HOLD AND rawSignal == previousSignal:
    consecutiveCount++
elif rawSignal != HOLD:
    consecutiveSignal = rawSignal
    consecutiveCount = 1
else:
    consecutiveCount = 0

signalConfirmed = (consecutiveCount >= cortexConfirmCandles)
```

Default: `cortexConfirmCandles = 1` (trade on first signal).

### 9.3 Candle Aggregation for Sub-Minute Timeframes

When using sub-minute timeframes (TICK, SECOND, SECOND_2, etc.), the cortex aggregates ticks into synthetic candles using bucket math:

```
intervalSec = cortexTimeframeSec[timeframe]
currentBucket = floor(now_ms / (intervalSec × 1000))

if currentBucket == lastCandleBucket:
    // Same candle — accumulate
    candleBuffer.push(closePrice)
    return  // don't trade yet

// New candle completed
lastCandleBucket = currentBucket
open  = candleBuffer[0]
high  = max(candleBuffer)
low   = min(candleBuffer)
close = candleBuffer[last]
candleBuffer = [closePrice]  // start new buffer
```

### 9.4 Position Sizing

```
if autoSize:
    strength = |buy_signal - sell_signal|
    maxStrength = max(buyThreshold, sellThreshold) × 1.5
    ratio = clamp(strength / maxStrength, 0, 1)
    size = minSize + ratio × (maxSize - minSize)
    size = round(size, 1 decimal)
else:
    size = minPositionSize
```

**Example:** Buy=25, Sell=5, buyThreshold=10, min=0.5, max=2.0
```
strength = |25 - 5| = 20
maxStrength = 10 × 1.5 = 15
ratio = clamp(20/15, 0, 1) = 1.0
size = 0.5 + 1.0 × 1.5 = 2.0
```

### 9.5 Exit Conditions

Positions can be closed by four mechanisms:

**1. Price-Based Take Profit / Stop Loss** (if `cortexPriceExitsEnabled`):
```
pnlPips = direction == BUY ? (currentPrice - entry) : (entry - currentPrice)

if pnlPips >= takeProfitPips:  → TP CLOSE (sugar feedback)
if pnlPips <= -stopLossPips:   → SL CLOSE (pain feedback)
```

**2. Signal Reversal:**
```
if oppositeSignal detected:
    exitConsecutiveCount++
else:
    exitConsecutiveCount = 0

if candlesHeld >= minHoldCandles AND exitConsecutiveCount >= exitConfirmCandles:
    → SIGNAL CLOSE
```

**3. Emergency Exit** (Antenna):
```
if flashCrashScore >= threshold AND price moving against position:
    → EMERGENCY CLOSE (pain feedback)
```

**4. External Close Detection:**
Every 5 ticks (and every 30+ seconds), the cortex verifies the position still exists on IG:
```
GET /api/ig/positions → check if dealId is in the list
if not found: → mark as externally closed, clear position, resume trading
```

### 9.6 Safety Guards

| Guard | Rule | Effect |
|-------|------|--------|
| Per-epic position limit | `epicCount >= maxOpenPositions` | Refuses new trades on this instrument |
| Hard total limit | `totalPositions >= 5` | Refuses any new trade regardless of instrument |
| Cooldown | `now - lastTradeTime < cooldownMs` | Waits before next trade |
| Blind trade prevention | Position check API fails | Refuses to trade (won't open without knowing current exposure) |
| Antenna block | Dead cat, falling knife, divergence detected | Refuses entry in dangerous conditions |

### 9.7 Full Cortex Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| buyThreshold | 10 | Min buy Hz for BUY signal |
| sellThreshold | 10 | Min sell Hz for SELL signal |
| holdZone | 2 | Min spread between buy/sell |
| stopLossPips | 50 | SL distance in pips |
| takeProfitPips | 100 | TP distance in pips |
| cooldownMs | 30000 | Post-trade cooldown (ms) |
| minPositionSize | 0.5 | Minimum trade size |
| maxPositionSize | 2.0 | Maximum trade size |
| autoSize | true | Dynamic position sizing |
| minHoldCandles | 5 | Min candles before signal exit |
| confirmCandles | 1 | Entry signal confirmation candles |
| exitConfirmCandles | 2 | Exit signal confirmation candles |
| priceExitsEnabled | false | Enable SL/TP price-level exits |
| autoLearn | true | Auto-apply sugar/pain on trade close |
| maxOpenPositions | 3 | Max positions per epic |
| antennaFlashThreshold | 3.0 | Flash crash detection sensitivity |
| antennaDeadCatSensitivity | 0.5 | Dead cat bounce sensitivity |
| antennaEmergencyExit | true | Enable emergency close on flash crash |
| antennaBreakoutRider | true | Enable breakout entry on flash events |
| antennaFallingKnife | true | Block BUY during falling knife |

---

## 10. Calibration Engine

The calibration system performs a grid search over threshold values (and optionally timeframes) using dry-run backtests to find optimal trading parameters.

### 10.1 Threshold Scan

Three range modes are available:

| Mode | Thresholds Tested |
|------|------------------|
| Narrow | 3, 5, 7, 9, 12, 15 |
| Normal | 2, 3, 5, 7, 10, 13, 16, 20, 25 |
| Wide | 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40 |

For each threshold value, the engine:
1. Sends historical candles + threshold to `/backtest-train` with `dryRun: true`
2. The brain runs through every candle, computing signals as normal
3. Simulated trades are opened/closed using the same SL/TP/confirmation rules
4. Results: trade count, P&L, win rate, sugar/pain counts

**Critically, `dryRun: true` means no feedback is applied to the network** — the brain weights are unaffected by calibration. The real brain can keep running live trades while calibration tests parameters in the background.

### 10.2 All-Timeframe Scan

When "All Timeframes" is selected, the engine scans all 14 timeframes:

```
SECOND, SECOND_2, SECOND_5, SECOND_10, SECOND_30,
MINUTE, MINUTE_2, MINUTE_3, MINUTE_5, MINUTE_15, MINUTE_30,
HOUR, HOUR_4, DAY
```

For each timeframe:
1. Fetch candles at that resolution (or aggregate from base candles — see Section 11)
2. Skip if fewer than 20 candles available
3. Run the full threshold scan
4. Record results with the timeframe label

The recommended result is the (threshold, timeframe) pair with the highest win rate.

### 10.3 Auto-Pass Calibration

When enabled, calibration automatically runs every N minutes:

```
calibAutoPassEnabled = true
calibAutoPassInterval = N (minutes)

Every N minutes:
    1. calibBaseCandleCache = {}           // fresh data every run
    2. Fetch latest candles
    3. Run threshold scan (and optionally all-TF scan)
    4. If still enabled when complete:
        Apply best threshold to cortexBuyThreshold + cortexSellThreshold
        If all-TF mode: also apply best timeframe to cortexTimeframe
        Save state
```

The guard (`calibAutoPassEnabled` check after scan completes) prevents applying stale results if the user disabled auto-pass during a long-running scan.

### 10.4 Results Selection

Two recommendation modes:

**Best Win Rate:** Sort by `winRate` descending, break ties by P&L
```
recommended = results.sort((a,b) => b.winRate - a.winRate || b.pnl - a.pnl)[0]
```

**Best P&L:** Sort by `pnl` descending
```
bestPnl = results.sort((a,b) => b.pnl - a.pnl)[0]
```

---

## 11. Candle Aggregation

When higher timeframes have no direct data, the system builds synthetic OHLC candles from lower-resolution base data.

### 11.1 Base Candle Fetch

The system searches for the lowest available resolution data in priority order:

```
Priority: MINUTE → SECOND_30 → SECOND_10 → SECOND_5 → SECOND
Fallback: IG API at MINUTE resolution
```

The first resolution returning ≥ 20 candles is used as the base.

### 11.2 Aggregation Algorithm

Uses the same bucket-grouping pattern as the live chart:

```
function calibAggregateCandles(baseCandles, baseSec, targetSec):
    for each candle:
        tsSec = floor(timestamp / 1000)
        bucket = floor(tsSec / targetSec) × targetSec

        if same bucket as current:
            update high = max(high, candle.high)
            update low = min(low, candle.low)
            update close = candle.close
        else:
            emit completed candle
            start new candle: open=candle.open, high, low, close
```

**Example:** Building 5-minute candles from 1-minute base data:

```
Base: 12:00 O=2340 H=2341 L=2339 C=2340.5
      12:01 O=2340.5 H=2342 L=2340 C=2341.8
      12:02 O=2341.8 H=2342.5 L=2341 C=2342.0
      12:03 O=2342.0 H=2343 L=2341.5 C=2342.5
      12:04 O=2342.5 H=2343.2 L=2342 C=2343.0

Aggregated 5min candle:
    bucket = floor(12:00 / 300) × 300 = 12:00
    O=2340, H=2343.2, L=2339, C=2343.0
```

### 11.3 Caching

Base candle data is cached per calibration run (`calibBaseCandleCache`), keyed by `epic:maxCandles`. The cache is cleared at the start of every calibration and auto-pass run, ensuring fresh data each cycle.

---

## 12. Training Modes

### 12.1 Backtest Training

**Endpoint:** `POST /backtest-train`

Replays historical candles through the network with simulated trading:
- For each candle: compute pressure, stimulate brain, check signals
- Opens/closes simulated positions using the same SL/TP/confirmation rules
- Applies sugar/pain feedback after each trade close (unless `dryRun: true`)
- Returns: trades list, total P&L, win rate, signal history

```
Mode:  dryRun=false → weights change (brain learns from history)
       dryRun=true  → weights unchanged (calibration/testing only)
```

### 12.2 Live Training

**Endpoint:** `POST /live-train`

Processes one candle at a time, maintaining trade state across calls:
- Client sends: candle data + current open trade + consecutive count
- Server: stimulates brain, evaluates SL/TP/signal exits, returns new state
- Applies feedback on trade close (sugar for wins, pain for losses)
- Returns: signal, rates, trade_closed/held_trade/open_trade

### 12.3 Auto-Test (Walk-Forward)

The dashboard's auto-test system runs multiple backtests with different parameters to evaluate robustness:
- Tests across timeframes: MINUTE, MINUTE_5, MINUTE_15, HOUR
- Picks the timeframe with highest signal spread (buy vs sell difference)
- Can run continuously with auto-pass recalibration

### 12.4 Proof Test

**Endpoint:** `POST /proof-test`

A controlled verification that the network correctly responds to known directional inputs:

**Phase 1: UPTREND** (N steps)
- Price increases by 2.0 + random each step
- First 5 steps include direct BUY stimulation at intensity 300
- Expect: BUY signals should appear

**Phase 2: DOWNTREND** (N steps)
- Price decreases by 2.0 + random each step
- First 5 steps include direct SELL stimulation at intensity 300
- Expect: SELL signals should appear

**Phase 3: FLAT** (N/2 steps)
- Price varies by ±0.01 with zero velocity
- Low volume, wide spread
- Expect: HOLD signals should dominate

**Critical:** The proof test saves and restores the complete network state (neurons, synapses, spike history, step count). It leaves the brain exactly as it was before the test.

**Output:**
```json
{
    "summary": {
        "uptrend_buys": 72,
        "uptrend_total": 100,
        "downtrend_sells": 68,
        "downtrend_total": 100,
        "flat_total": 50
    }
}
```

---

## 13. State Persistence

### 13.1 Files

| File | Contents | Location |
|------|----------|----------|
| `brain-state.json` | Step count, params, architecture, assignments, mushroom body config, instrument list | `~/.openclaw/` |
| `brain-weights.json` | All synapse weights as `[pre, post, w, base_w]` tuples | `~/.openclaw/` |
| `cortex-state.json` | Trade log, open position, decision log, all 21 cortex params, auto-pass state | `~/.openclaw/` |
| `{epic}.json` | Per-instrument pattern memory (ticks, signals, learned_at) | `~/.openclaw/brain-patterns/` |

### 13.2 Atomic Writes

All state files use write-then-rename to prevent corruption:

```
1. Write to {file}.tmp
2. fsync the file descriptor
3. Rename {file}.tmp → {file}
```

### 13.3 Backup Schedule

Every 5 minutes, backups are created:
- Per-instrument pattern files → `{epic}.backup-{timestamp}.json`
- Brain state → `brain-state.backup-{timestamp}.json`
- Rotation: keeps last 5 backups per file

### 13.4 Cortex Dirty-Check Save

To minimize I/O during HOLD ticks, the cortex uses a fingerprint-based dirty check:

```
fingerprint = hash of:
    - all 21 cortex params
    - decision log length
    - open position state
    - trade log length
    - buy/sell thresholds
    - antenna settings

if fingerprint == lastFingerprint:
    skip save
else:
    save state (debounced 10 seconds)
```

---

## 14. Architecture Presets & Scaling

| Preset | Sensory | Inter | Motor | Total | Label | Budget |
|--------|---------|-------|-------|-------|-------|--------|
| 1s | 80 | 220 | 50 | 350 | 1s Scalp | 1s |
| 5s | 120 | 500 | 80 | 700 | 5s Quick | 5s |
| 30s | 300 | 1,400 | 300 | 2,000 | 30s Medium | 30s |
| 1min | 600 | 3,600 | 800 | 5,000 | 1min Full | 60s |
| 5min | 1,200 | 7,200 | 1,600 | 10,000 | 5min+ Deep | 5min |
| 15min | 2,000 | 14,000 | 4,000 | 20,000 | 15min Ultra | 15min |

**Budget:** Each tick must complete within `budget_ms / 10` (since each tick runs 10 simulation steps). The benchmark endpoint verifies this:

```
fits_timeframe[tf] = per_step_ms × 10 < preset.budget_ms
```

---

## 15. Complete Trade Lifecycle: Worked Example

### Scenario: Gold (CS.D.CFDGOLD.CFD.IP), 5-minute timeframe

**Initial State:**
- Brain: 350 neurons, 4290 synapses, w_syn=12.0
- Cortex: buyThreshold=7, sellThreshold=7, holdZone=2, confirmCandles=1, minHold=5
- Antenna: flashThreshold=3.0, emergencyExit=ON, breakoutRider=ON

**Step 1: Tick Arrives**
```
Candle close: 2341.50 (prev: 2340.80)
delta = +0.70, pctChange = 2.99
```

**Step 2: Sensory Encoding**
```
price_up neurons (20): intensity = 2.99 × 1.5 = 4.49
price_down neurons (20): intensity = 2.99 × 0.5 = 1.50
momentum neurons (10): intensity = 2.99 (no acceleration doubling)
volume neurons (15): intensity = 0 (CFD, no volume)
```

**Step 3: Antenna Pressure**
```
tickVelocity = 0.8/s (normal)
spreadAccel = +0.12 (slight spread widening)
buySellRatio = 0.62 (buying pressure)
flashCrashScore = 0.3 (low)
deadCatScore = 0 (no recent drop)
absorptionScore = 0 (normal activity)
```

**Step 4: Brain Stimulation**
```
10 simulation steps run
Poisson spike injection on sensory neurons
Spikes cascade: sensory → interneuron → mushroom body → motor
```

**Step 5: Motor Output**
```
buy_signal = 12.5 Hz
sell_signal = 3.8 Hz
hold_signal = 6.1 Hz
```

**Step 6: Signal Determination**
```
buy_signal (12.5) >= buyThreshold (7)?  YES
buy_signal (12.5) > sell_signal (3.8) + holdZone (2)?  12.5 > 5.8?  YES
→ rawSignal = BUY

consecutiveCount = 1 (first BUY)
confirmCandles = 1
signalConfirmed = true
```

**Step 7: Safety Checks**
```
Position check: 0 positions on GOLD, 1 total → under limits
Antenna block: deadCat=0, fallingKnife=0, divergence=0 → no blocks
Cooldown: last trade was 5 minutes ago → cleared
```

**Step 8: Position Sizing**
```
strength = |12.5 - 3.8| = 8.7
maxStrength = 7 × 1.5 = 10.5
ratio = 8.7 / 10.5 = 0.829
size = 0.5 + 0.829 × 1.5 = 1.7
```

**Step 9: Order Execution**
```
POST /api/ig/positions/open
    direction: BUY
    epic: CS.D.CFDGOLD.CFD.IP
    size: 1.7
    → dealId: DIAAAAB12345

cortexOpenPosition = {
    direction: BUY,
    entry: 2341.50,
    candlesHeld: 0,
    dealId: DIAAAAB12345,
    size: 1.7
}
```

**Step 10: Holding (next 5 candles)**
```
Candle 2: 2342.10 → HOLDING BUY (held 1/5, pnl=+0.6)
Candle 3: 2341.80 → HOLDING BUY (held 2/5, pnl=+0.3)
Candle 4: 2342.50 → HOLDING BUY (held 3/5, pnl=+1.0)
Candle 5: 2343.20 → HOLDING BUY (held 4/5, pnl=+1.7)
Candle 6: 2343.80 → sell_signal=11.2 > buy_signal=4.1 → SELL reversal
    candlesHeld=5 >= minHold=5  ✓
    exitConsecutiveCount=1 < exitConfirmCandles=2  ✗
    → Keep holding (waiting for 2nd SELL confirmation)
```

**Step 11: Exit**
```
Candle 7: 2344.10 → sell_signal=14.0 > buy_signal=2.5 → SELL again
    exitConsecutiveCount=2 >= exitConfirmCandles=2  ✓
    candlesHeld=6 >= minHold=5  ✓

→ CLOSE BUY position
    pnl = 2344.10 - 2341.50 = +2.60 pips
    → sugar feedback to motor + mushroom
    → Brain strengthens the synaptic pathways that led to this trade
```

---

## 16. API Reference

### Brain Engine Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Engine status and version |
| GET | `/status` | Full status: neurons, synapses, params, patterns, feedback formula |
| POST | `/boot` | Boot/reboot the brain with optional architecture config |
| GET | `/architecture` | Current architecture details |
| POST | `/architecture` | Update sensory assignments or mushroom body |
| POST | `/stimulate` | Direct neuron stimulation |
| POST | `/stimulate-price` | Price-based stimulation with pressure encoding |
| GET | `/observe` | Run 5 passive steps and read motor rates |
| POST | `/config` | Update w_syn, r_poi, tau_syn |
| POST | `/feedback` | Apply sugar/pain feedback with target selection |
| POST | `/training` | Toggle training mode and direction |
| GET | `/patterns` | Get per-instrument pattern memory |
| POST | `/patterns/import` | Import pattern data |
| GET | `/patterns/export` | Export pattern data |
| GET | `/patterns/csv` | Export patterns as CSV |
| GET | `/history` | Spike history and feedback log |
| POST | `/benchmark` | Run performance benchmark |
| GET | `/presets` | Architecture preset definitions |
| POST | `/backtest-train` | Backtest with optional learning |
| POST | `/live-train` | Single-candle live training step |
| POST | `/proof-test` | Controlled directional verification |
| POST | `/restart` | Save state and reset brain |
| POST | `/save` | Force state save to disk |
| GET | `/cortex-state` | Read cortex persistent state |
| POST | `/cortex-state` | Save cortex persistent state |
| GET | `/cortex-params` | Read cortex parameters (lightweight) |
| POST | `/cortex-params` | Merge-update cortex parameters |
| DELETE | `/cortex-state` | Clear all cortex state |

---

## Glossary

| Term | Definition |
|------|------------|
| **LIF** | Leaky Integrate-and-Fire neuron model |
| **w_syn** | Global synaptic weight multiplier |
| **r_poi** | Poisson firing rate multiplier for sensory encoding |
| **Sugar** | Positive reinforcement — strengthens synapse weights |
| **Pain** | Negative reinforcement — weakens synapse weights |
| **Mushroom Body** | Dense interneuron cluster for associative memory |
| **Antenna** | Pressure-sensing subsystem detecting microstructure events |
| **Cortex** | Trade execution layer with thresholds, confirmation, and safety |
| **Calibration** | Grid search over threshold/timeframe pairs via dry-run backtests |
| **Auto-Pass** | Automatic recalibration at configurable intervals |
| **Proof Test** | Controlled verification of directional sensitivity |
| **Bucket** | Time bucket for candle aggregation (floor division of timestamp) |

---

*BrainJar Neural Trading System — Technical Reference v3.0*
