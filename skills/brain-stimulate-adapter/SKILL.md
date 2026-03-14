---
name: brain-stimulate-adapter
description: Master guide for creating new brain engine stimulate-* routes for non-trading use cases. Covers neuron allocation map, encoding patterns, and motor output interpretation.
---

# Brain Stimulate Adapter — Creating New stimulate-* Routes

## Overview
The BrainJar brain engine (`skills/bots/brain-engine-server.cjs`) is a general-purpose spiking neural network. It is NOT hardwired to trading. The core (boot, step, observe, feedback) can process any input/output pattern.

What makes it "trading" is the `stimulate-price` route, which maps price/volume/spread data to sensory neurons. To use the brain for other tasks (sentiment analysis, pattern recognition, decision-making, etc.), you add new `stimulate-*` routes that map different input types to sensory neurons and interpret the motor neuron output differently.

This skill teaches how to create a new stimulate adapter.

## Architecture Recap
- **Sensory neurons** (0 to N_SENSORY-1): Input layer. Divided into named groups via `sensoryAssignments`
- **Interneurons** (N_SENSORY to N_SENSORY+N_INTER-1): Processing layer (includes mushroom body for memory)
- **Motor neurons** (N_SENSORY+N_INTER to N_TOTAL-1): Output layer. `getMotorRates()` returns normalized firing rates

Default sensory assignments (600 sensory neurons):
| Group | Start | Count | Purpose |
|-------|-------|-------|---------|
| price_up | 0 | 20 | Price increase detection |
| price_down | 20 | 20 | Price decrease detection |
| volume | 40 | 15 | Volume/trade activity |
| spread | 55 | 10 | Spread width / liquidity |
| momentum | 65 | 10 | Price momentum |
| antenna | 75 | 25 | Pressure sensing (7 sub-groups) |

Neurons 100-599 in the default config are **unassigned sensory neurons** — available for new adapters.

## How stimulate-price Works (The Pattern)
```javascript
// 1. Parse input data from request body
const { price, prevPrice, volume, spread, epic } = body;

// 2. Map input values to sensory neuron indices + intensities
const inputs = [];
// Higher intensity = stronger signal to that neuron group
for (let i = pu.start; i < pu.start + pu.count; i++) {
  inputs.push([i, intensity]);  // [neuronIndex, intensity]
}

// 3. Run simulation steps (more steps = more processing)
for (let s = 0; s < steps; s++) step(inputs);

// 4. Read motor neuron output
const rates = getMotorRates();
// rates = { buy_signal, sell_signal, hold_signal, avg_rate, peak_rate }

// 5. Return interpreted results
return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
```

## Step-by-Step: Adding a New stimulate-* Route

### 1. Choose or Assign Sensory Neurons
Either reuse existing groups or assign new neurons from the unassigned range (100-599).

To register new sensory assignments, add them to `sensoryAssignments` in the `assignSensoryRegions()` function:
```javascript
sensoryAssignments.my_input_a = { start: 100, count: 15, desc: 'My input A' };
sensoryAssignments.my_input_b = { start: 115, count: 10, desc: 'My input B' };
```

### 2. Create the Encoding Function
Write a function that maps your domain inputs to `[neuronIndex, intensity]` pairs:
```javascript
function stimulateFromMyDomain(data) {
  const inputs = [];
  const groupA = sensoryAssignments.my_input_a;
  const groupB = sensoryAssignments.my_input_b;

  // Map domain value to neuron intensity (0-500 range recommended)
  const valueA = Math.min(Math.abs(data.inputA) * 100, 500);
  for (let i = groupA.start; i < groupA.start + groupA.count; i++) {
    inputs.push([i, valueA]);
  }

  // Run simulation
  const stepsToRun = data.steps || 10;
  for (let s = 0; s < stepsToRun; s++) step(inputs);

  return getMotorRates();
}
```

### 3. Add the HTTP Route
In the server request handler (around line 968), add your new route:
```javascript
if (m === 'POST' && p === '/stimulate-mydomain') {
  if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
  const body = await parseBody(req);
  spikeHistory = [];
  const rates = stimulateFromMyDomain(body);
  return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
}
```

### 4. Interpret Motor Output
The motor output is always `{ buy_signal, sell_signal, hold_signal }` — these are just normalized firing rates from motor neuron groups. You can interpret them however your domain needs:
- For binary decisions: `buy_signal > sell_signal` → positive class
- For scoring: use `buy_signal` as a confidence score (0-1)
- For multi-class: map buy/sell/hold to your own categories
- The names are just labels from the trading origin — the actual values are firing rates

### 5. Update the Proxy (ceo-proxy.cjs)
The proxy at `ceo-proxy.cjs` forwards `/api/brain/*` to the brain engine. New routes are automatically forwarded — no proxy changes needed unless you need custom timeout handling.

Long-running routes (like backtest-train) need a longer proxy timeout. Add your route to the timeout check around line 5060:
```javascript
if (brainPath.startsWith('/stimulate-mydomain-batch')) {
  opts.timeout = 120000; // 2 minutes
}
```

### 6. Create a Skill for Your Adapter
Each stimulate adapter should be its own skill in `skills/brain-stimulate-*` containing:
- `SKILL.md` — documents the route, input format, output interpretation, usage examples
- Optional: an encoder script if the mapping logic is complex

## Intensity Guidelines
- **0-50**: Weak signal (background noise level)
- **50-200**: Normal signal range
- **200-500**: Strong signal (the brain responds clearly)
- **500+**: Very strong (risk of over-saturating neurons, cap at 500)

## Key Variables Available in brain-engine-server.cjs
- `sensoryAssignments` — map of named sensory groups with `{start, count, desc}`
- `N_SENSORY`, `N_INTER`, `N_MOTOR`, `N_TOTAL` — neuron counts
- `stepCount` — total simulation steps run
- `step(inputs)` — run one simulation step with given inputs
- `getMotorRates()` — read motor neuron firing rates
- `patternMemory` — per-key pattern storage (not just epics)
- `applyFeedback(type, options)` — sugar/pain for reinforcement
- `isBooted` — whether brain is initialized

## Existing Stimulate Adapters
- `stimulate-price` — Trading price/volume/spread → buy/sell/hold signals (skills/brainjar)
- `stimulate` — Raw neuron ID stimulation (direct, no encoding)

## File Locations
- Brain engine: `skills/bots/brain-engine-server.cjs`
- Proxy routing: `ceo-proxy.cjs` (search for `/api/brain`)
- Existing adapters: search for `stimulate` in brain-engine-server.cjs
