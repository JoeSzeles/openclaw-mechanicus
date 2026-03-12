# BrainJar - Neural Trading Skill

## Overview
BrainJar is a spiking neural network brain engine for trading signal generation. It runs as an internal Node.js HTTP server alongside the OpenClaw CEO proxy, providing real-time neural responses to market data stimuli.

## Architecture
- **Engine**: Leaky Integrate-and-Fire (LIF) spiking neural network
- **Neurons**: 350 total (100 sensory, 200 interneuron, 50 motor)
- **Synapses**: ~5,250 connections with configurable weights
- **Inspired by**: Drosophila central brain model (Kakaria & de Bivort 2017)

## API Endpoints (via `/api/brain/`)

### GET /api/brain/status
Returns brain engine status, neuron counts, step count, training mode.

### POST /api/brain/boot
Initialize/reset the neural network. Auto-boots on server start.

### POST /api/brain/stimulate-price
Feed market data to the brain. Body: `{epic, price, prevPrice, volume, spread}`
Returns: `{buy_signal, sell_signal, hold_signal, avg_rate, step_count}`

### POST /api/brain/stimulate
Direct neuron stimulation. Body: `{neuron_ids: [int], intensity: float}`

### GET /api/brain/observe
Run idle simulation steps and return current motor signals.

### POST /api/brain/feedback
Training feedback. Body: `{type: "sugar"|"pain"}`
- Sugar = strengthen motor synaptic weights (reinforce behavior)
- Pain = weaken motor synaptic weights (suppress behavior)

### POST /api/brain/training
Toggle training mode. Body: `{enabled: bool, direction: string|null}`

### GET /api/brain/patterns
Get per-instrument pattern memory (learned signals from market data).

### GET /api/brain/patterns/csv?epic=EPIC
Export pattern memory as CSV for a specific instrument.

### POST /api/brain/config
Update network parameters. Body: `{w_syn, r_poi, tau_syn}`

### POST /api/brain/save
Persist brain state to disk.

### POST /api/brain/restart
Reset brain (clears neurons/synapses, reloads saved patterns).

### GET /api/brain/history
Get recent spike history and feedback log.

## For Agent Use
Agents can interact with BrainJar via HTTP calls to `/api/brain/` endpoints:

```javascript
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
// signals = {buy_signal: 45.2, sell_signal: 12.1, hold_signal: 8.3, ...}

// Apply reward/punishment
await fetch('/api/brain/feedback', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({type: 'sugar'}) // or 'pain'
});
```

## Files
- `skills/bots/brain-engine-server.cjs` - The brain engine server
- `patch/files/.openclaw/canvas/ig-neural-trading.js` - Dashboard integration
- `patch/files/.openclaw/canvas/ig-dashboard.html` - UI (Neural Trading tab)
- `patch/files/dist/ig-local-api.mjs` - Proxy routes (`/api/brain/*`)
- `patch/files/.openclaw/canvas/brainjar.config.json` - Configuration

## Pattern Memory
Pattern memory is stored per-instrument in the brain engine's memory. Each instrument accumulates tick-level buy/sell/hold signals. Memory persists across restarts via `~/.openclaw/brain-state.json`.

## Training Mode
When training mode is active:
- Successful trades automatically trigger "sugar" (positive reinforcement)
- Failed trades automatically trigger "pain" (negative reinforcement)
- Manual sugar/pain buttons available in the Brain tab
