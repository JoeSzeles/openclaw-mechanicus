# BrainJar Neural Trading - Training Guide

## How the Brain Works

BrainJar uses a **Leaky Integrate-and-Fire (LIF)** spiking neural network inspired by the Drosophila (fruit fly) brain. Unlike traditional neural networks that use backpropagation, this brain works through:

1. **Spiking neurons** - Each neuron accumulates input until it fires (spikes), then resets
2. **Synaptic connections** - Spikes propagate through weighted synapses to connected neurons
3. **Poisson input** - Market data is converted to spike trains via stochastic Poisson processes
4. **Reward learning** - Sugar (positive) and pain (negative) feedback modulate synaptic weights

## Brain Regions

### Sensory Layer (Input)
Neurons that receive market data stimuli, divided into functional groups:

| Region | Default % | Purpose |
|--------|-----------|---------|
| Price Up | 20% | Fires stronger when price increases |
| Price Down | 20% | Fires stronger when price decreases |
| Volume | 20% | Encodes trade volume intensity |
| Spread | 20% | Encodes bid-ask spread width (liquidity) |
| Momentum | 10% | Fires on price acceleration/rapid moves |
| Antenna | 10% | Pressure sensing - volume spikes, rapid directional moves |

### Interneuron Layer (Processing)
The computational core. Contains the **Mushroom Body** - a densely-connected sub-cluster that functions like memory consolidation:

- **Mushroom Body**: 20% of interneurons by default, with 30% internal connectivity
- Higher connectivity = better pattern retention but slower processing
- Receives targeted sugar feedback on winning trades to reinforce learned patterns

### Motor Layer (Output)
Neurons that encode trading decisions, split into three equal populations:

- **Buy neurons**: First 1/3 of motor layer
- **Sell neurons**: Middle 1/3 of motor layer
- **Hold neurons**: Final 1/3 of motor layer

The population with the highest average firing rate over the last 10 steps determines the brain's "opinion" on what to do.

## Network Sizing Guide

### The Key Insight: Timeframe Budget
Each candle timeframe gives you a processing budget:

| Timeframe | Budget | Recommended Neurons | Use Case |
|-----------|--------|-------------------|----------|
| 1 second | 1,000 ms | 350 (S:80 I:220 M:50) | Ultra-fast scalping |
| 5 seconds | 5,000 ms | 700 (S:120 I:500 M:80) | Quick scalping |
| 30 seconds | 30,000 ms | 2,000 (S:300 I:1400 M:300) | Medium-term |
| 1 minute | 60,000 ms | 5,000 (S:600 I:3600 M:800) | Standard trading |
| 5 minutes | 300,000 ms | 10,000 (S:1200 I:7200 M:1600) | Deep analysis |
| 15 minutes | 900,000 ms | 20,000 (S:2000 I:14000 M:4000) | Full brain |

### Benchmark Your Hardware
Always run a **Test Fire** after changing network size:
1. Go to **Brain Config** tab
2. Set your desired neuron counts
3. Click **Apply & Reboot Brain**
4. Click **Test Fire (Benchmark)**
5. Check the Timeframe Budget Calculator to see which timeframes fit

The benchmark runs 100 simulation steps and measures actual processing time per step.

### Train Big, Deploy Small
A powerful workflow:
1. Set a large network (e.g., 5000 neurons) for backtesting
2. Train on historical data - the larger network can learn more complex patterns
3. The **pattern memory** (buy/sell/hold decisions per price pattern) is stored independently
4. Switch to a smaller network for live trading
5. Pattern memory persists and can guide the smaller network via auto-training

## Training Methods

### Method 1: Manual Training (Live)
Best for developing intuition about the brain's behavior.

1. Open **Neural Trading** tab, select an instrument
2. Enable **Training Mode** in the Brain sub-tab
3. Watch price movements and brain signals
4. Click **Sugar** when the brain makes a good call
5. Click **Pain** when the brain makes a bad call
6. Sugar strengthens motor synapses by 15%, Pain weakens by 15%

### Method 2: Backtest Training (Historical Data)
Best for rapid learning on large datasets.

1. Go to **Brain Config** > **Neural Backtest Training**
2. Select your instrument (use the instrument search on the Neural Dashboard first)
3. Choose a timeframe and number of candles
4. Set Stop Loss % and Take Profit % (these determine when trades close)
5. Set the P&L Multiplier (from IG market details - use `valueOfOnePip * scalingFactor`)
6. Click **Start Training**

The system will:
- Fetch historical candles from IG
- Feed each candle through the brain's stimulate-price endpoint
- The brain produces buy/sell/hold signals
- When a signal is strong enough, a virtual trade opens
- Trades close at Stop Loss, Take Profit, or on signal reversal
- **Sugar** is applied (to motor AND mushroom body) on profitable trades
- **Pain** is applied (to motor only) on losing trades

### Method 3: Live Observation + Auto-Trade
Best for validation and live learning.

1. Start **Observer Mode** from the Brain sub-tab
2. The brain watches live prices and produces signals
3. Enable **Calibration** to auto-execute trades when motor firing exceeds threshold
4. The calibration process:
   - Phase 1: Observes baseline motor activity (10-20 samples)
   - Phase 2: Calculates threshold (baseline + 2 standard deviations)
   - Phase 3: Executes trades when activity exceeds threshold
5. With Training Mode on, P&L outcomes auto-apply sugar/pain

### Method 4: Batch Backtest Training
For training across multiple instruments and timeframes:

1. Use the existing backtest system (`/api/ig/scalper/batch-backtest`) to fetch candles
2. Feed them to `/api/brain/backtest-train` endpoint
3. Repeat across different instruments to build cross-market pattern memory

## Stop Loss / Take Profit Logic

The backtest training uses percentage-based SL/TP:
- **Stop Loss %**: If price moves this % against the trade direction, close with loss
- **Take Profit %**: If price moves this % in the trade direction, close with profit
- **Signal Reversal**: If the brain switches from BUY to SELL (or vice versa), close and reverse

For accurate P&L calculation on live trading, the system uses:
- `plMultiplier = valueOfOnePip * scalingFactor` (from IG market details)
- `P&L = (exitPrice - entryPrice) * direction * size * plMultiplier`

## Feedback System (Sugar & Pain)

### Sugar (Positive Reinforcement)
- Multiplies synaptic weights by 1.15 (15% increase)
- Applied to motor synapses by default
- Can target mushroom body for memory consolidation
- Capped at weight magnitude of 2.0

### Pain (Negative Reinforcement)
- Multiplies synaptic weights by 0.85 (15% decrease)
- Applied to motor synapses by default
- Capped at weight magnitude of 2.0

### Body Part Targeting
Different feedback targets affect different brain functions:

| Target | Effect |
|--------|--------|
| `motor` | Changes trade decision weights (buy/sell/hold) |
| `mushroom` | Strengthens/weakens memory consolidation cluster |
| `all` | Modifies entire network |
| `sensory` | Changes input sensitivity |

In backtest training, winning trades apply sugar to BOTH motor and mushroom body (reinforcing the decision and consolidating the memory), while losing trades apply pain to motor only (changing the decision without erasing the memory).

## Pattern Memory Management

### How It Works
- Each instrument gets its own pattern memory
- Records: timestamp, price, buy/sell/hold signal strengths
- Last 500 ticks are kept per instrument
- Persists across restarts in `~/.openclaw/brain-state.json`

### Exporting Patterns
1. Select an instrument
2. Click **Export Pattern CSV** in the Brain sub-tab
3. CSV format: `timestamp, price, buy_signal, sell_signal, hold_signal`

### Transferring Between Network Sizes
Pattern memory is network-size independent:
1. Train a large network on backtesting data
2. Save state (happens automatically every 60 seconds)
3. Reboot with smaller network: `POST /api/brain/boot {sensory: 100, inter: 200, motor: 50}`
4. Pattern memory from the large network is preserved
5. The smaller network starts fresh but the pattern records remain for reference

## Architecture Configuration

### Sensory Assignments
Each sensory neuron group is proportionally sized based on total sensory count:
- Price Up/Down: 20% each
- Volume/Spread: 20% each
- Momentum: 10%
- Antenna (pressure): remaining ~10%

Assignments auto-recalculate when you change the sensory neuron count.

### Mushroom Body
- **Size**: Percentage of interneurons (default 20%)
- **Connectivity**: Internal connection probability (default 0.3)
- Higher connectivity = neurons within mushroom body are more likely to connect to each other
- This creates a densely-connected sub-network that "resonates" with learned patterns

### Motor Regions
Motor neurons are always split into 3 equal groups:
- Buy: motor[0..N/3]
- Sell: motor[N/3..2N/3]
- Hold: motor[2N/3..N]

## Tips

1. **Start small**: Begin with default 350 neurons to understand behavior
2. **Benchmark first**: Always test fire before live trading with a new architecture
3. **Train on the timeframe you'll trade**: 1min candle training for 1min live trading
4. **Multiple training rounds**: Run backtest training multiple times - each round builds on previous learning
5. **Watch the win rate**: If backtest training win rate is below 50%, the brain needs more data or a different architecture
6. **Save frequently**: Brain state auto-saves every 60 seconds, but manual save before architecture changes
7. **Demo vs Live**: The system uses IG demo credentials for demo accounts and live for live - never cross them
