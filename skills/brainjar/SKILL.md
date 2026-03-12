# BrainJar - Neural Trading Skill

## Overview
BrainJar is a spiking neural network brain engine for trading signal generation. It runs as an internal Node.js HTTP server alongside the OpenClaw CEO proxy, providing real-time neural responses to market data stimuli.

## Architecture
- **Engine**: Leaky Integrate-and-Fire (LIF) spiking neural network
- **Dynamic sizing**: Fully configurable neuron counts per region (sensory, inter, motor)
- **Default**: 350 neurons (100 sensory, 200 interneuron, 50 motor), ~4,290 synapses
- **Timeframe presets**: 1s(350), 5s(700), 30s(2000), 1min(5000), 5min(10000), 15min(20000)
- **Mushroom body**: Dedicated interneuron cluster for memory consolidation
- **Sensory regions**: Price up/down, volume, spread, momentum, antenna (pressure sensing)
- **Inspired by**: Drosophila central brain model (Kakaria & de Bivort 2017)

## API Endpoints (via `/api/brain/`)

### GET /api/brain/status
Returns brain engine status, neuron counts, step count, training mode, sensory assignments, mushroom body config.

### POST /api/brain/boot
Initialize/reset the neural network. Accepts optional config:
- `{preset: "1s"|"5s"|"30s"|"1min"|"5min"|"15min"}` - Use a timeframe preset
- `{sensory: int, inter: int, motor: int}` - Custom neuron counts
- Empty body `{}` - Boot with saved/default architecture

### GET /api/brain/architecture
Returns full architecture details: neuron counts, synapse count, sensory assignments, mushroom body config, motor regions, available presets.

### POST /api/brain/architecture
Update sensory assignments and mushroom body config.
Body: `{sensory_assignments: {...}, mushroom_body: {enabled, connectivity, count}}`

### POST /api/brain/benchmark
Run test firings and measure actual processing time.
Body: `{steps: int}` (default 100)
Returns: per_step_ms, max_tick_rate_hz, fits_timeframes

### GET /api/brain/presets
Returns all available timeframe presets with neuron counts and time budgets.

### POST /api/brain/stimulate-price
Feed market data to the brain. Body: `{epic, price, prevPrice, volume, spread}`
Returns: `{buy_signal, sell_signal, hold_signal, avg_rate, step_count}`

### POST /api/brain/stimulate
Direct neuron stimulation. Body: `{neuron_ids: [int], intensity: float}`

### GET /api/brain/observe
Run idle simulation steps and return current motor signals.

### POST /api/brain/feedback
Training feedback. Body: `{type: "sugar"|"pain", target: "motor"|"mushroom"|"all"|"sensory"}`
- Sugar = strengthen synaptic weights (reinforce behavior)
- Pain = weaken synaptic weights (suppress behavior)
- Target selects which synapse group to modify

### POST /api/brain/training
Toggle training mode. Body: `{enabled: bool, direction: string|null}`

### POST /api/brain/backtest-train
Train the brain on historical candle data with automatic sugar/pain based on P&L.
Body: `{candles: [...], epic, stopLossPct, takeProfitPct, size, plMultiplier}`
Returns: trades, total_pnl, win_rate, sugar_count, pain_count, signals

### GET /api/brain/patterns
Get per-instrument pattern memory (learned signals from market data).

### GET /api/brain/patterns/csv?epic=EPIC
Export pattern memory as CSV for a specific instrument.

### POST /api/brain/config
Update network parameters. Body: `{w_syn, r_poi, tau_syn}`

### POST /api/brain/save
Persist brain state to disk (including architecture config).

### POST /api/brain/restart
Reset brain (clears neurons/synapses, reloads saved patterns).

### GET /api/brain/history
Get recent spike history and feedback log.

## For Agent Use
Agents can interact with BrainJar via HTTP calls to `/api/brain/` endpoints:

```javascript
// Boot with a larger network for backtesting
await fetch('/api/brain/boot', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({preset: '1min'}) // 5000 neurons
});

// Or boot with custom sizes
await fetch('/api/brain/boot', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({sensory: 500, inter: 2000, motor: 200})
});

// Benchmark to check performance
const bench = await (await fetch('/api/brain/benchmark', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({steps: 100})
})).json();
// bench = {per_step_ms: 0.5, max_tick_rate_hz: 1972, ...}

// Stimulate brain with price data
const result = await fetch('/api/brain/stimulate-price', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    epic: 'CS.D.CFASILVER.CFA.IP',
    price: 25.50,
    prevPrice: 25.48,
    volume: 100,
    spread: 0.02
  })
});
const signals = await result.json();

// Apply targeted feedback
await fetch('/api/brain/feedback', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({type: 'sugar', target: 'mushroom'})
});

// Train on historical data
const training = await (await fetch('/api/brain/backtest-train', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    candles: candleArray,
    epic: 'CS.D.CFASILVER.CFA.IP',
    stopLossPct: 1.0,
    takeProfitPct: 2.0,
    size: 1,
    plMultiplier: 1
  })
})).json();
// training = {trades: [...], total_pnl: 45.20, win_rate: 62.5, ...}
```

## Files
- `skills/bots/brain-engine-server.cjs` - The brain engine server
- `patch/files/.openclaw/canvas/ig-neural-trading.js` - Dashboard integration
- `patch/files/.openclaw/canvas/ig-dashboard.html` - UI (Neural Trading tab)
- `patch/files/dist/ig-local-api.mjs` - Proxy routes (`/api/brain/*`)
- `patch/files/.openclaw/canvas/brainjar.config.json` - Configuration
- `skills/brainjar/TRAINING.md` - Training documentation

## Pattern Memory
Pattern memory is stored per-instrument in the brain engine's memory. Each instrument accumulates tick-level buy/sell/hold signals. Memory persists across restarts via `~/.openclaw/brain-state.json`.

## Training Mode
When training mode is active:
- Successful trades automatically trigger "sugar" (positive reinforcement)
- Failed trades automatically trigger "pain" (negative reinforcement)
- Manual sugar/pain buttons available in the Brain tab
- Backtest training feeds historical candles and auto-applies sugar/pain based on P&L outcomes
- Mushroom body receives targeted sugar on winning trades for pattern retention
