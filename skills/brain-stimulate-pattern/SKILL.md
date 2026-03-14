# Brain Stimulate Pattern — Generic Numeric Pattern Recognition Adapter

## Overview
This adapter feeds arbitrary numeric feature vectors into the BrainJar brain engine via `POST /api/brain/stimulate-pattern`. It maps a flat array or named features to sensory neurons for general-purpose pattern recognition — anomaly detection, classification, decision-making, state evaluation.

This is the most flexible adapter: bring your own features, let the brain learn.

## Route
```
POST /api/brain/stimulate-pattern
```

## Authentication
Requires `x-brain-api-key` header (see AGENTS.md for details).

## Request Body (Array Mode)
```json
{
  "features": [0.8, 0.3, 0.95, 0.1, 0.5, 0.7, 0.0, 0.6],
  "label": "system-health",
  "steps": 20
}
```

## Request Body (Named Mode)
```json
{
  "named_features": {
    "cpu_load": 0.85,
    "memory_usage": 0.72,
    "error_rate": 0.15,
    "latency_ms": 230,
    "throughput": 5000,
    "queue_depth": 42
  },
  "normalize": true,
  "label": "system-health",
  "steps": 20
}
```

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| features | float[] | YES* | Array of feature values (0-1 normalized recommended). Max 50 features. |
| named_features | object | YES* | Named feature values (auto-normalized if `normalize: true`). Max 50 features. |
| normalize | bool | no | Auto-normalize named_features to 0-1 range (default: false) |
| label | string | no | Task label for pattern memory key |
| steps | int | no | Simulation steps (default: 15) |

*One of `features` or `named_features` is required.

## Response
```json
{
  "timestamp": 1710400000000,
  "step_count": 12345,
  "buy_signal": 0.55,
  "sell_signal": 0.71,
  "hold_signal": 0.38,
  "avg_rate": 0.55,
  "peak_rate": 0.71,
  "pattern_echo": {
    "feature_count": 6,
    "mode": "named",
    "label": "system-health"
  }
}
```

**Interpreting motor output for pattern tasks:**
- `buy_signal` dominant → Class A / Normal / Approve / Go
- `sell_signal` dominant → Class B / Anomaly / Reject / Stop
- `hold_signal` dominant → Uncertain / Borderline / Review

## Sensory Neuron Mapping
Uses sensory neurons 210-409 (200 neurons). Each feature gets 4 neurons:
- Up to 50 features × 4 neurons each = 200 neurons
- Feature value is scaled to intensity (0-500)
- Unused features leave their neurons at rest

| Features | Neurons | Formula |
|----------|---------|---------|
| feature[0] | 210-213 | value * 400 |
| feature[1] | 214-217 | value * 400 |
| ... | ... | ... |
| feature[49] | 406-409 | value * 400 |

## Installation
Add this code to `skills/bots/brain-engine-server.cjs`:

### 1. Register Sensory Assignments
In `assignSensoryRegions()`:
```javascript
sensoryAssignments.pattern_features = { start: 210, count: 200, desc: 'Generic pattern feature inputs (50 features × 4 neurons)' };
```

### 2. Add Encoding Function
After `stimulateFromPrice()`:
```javascript
function stimulateFromPattern(data) {
  const inputs = [];
  const stepsToRun = data.steps || 15;
  const patGroup = sensoryAssignments.pattern_features;
  if (!patGroup) return getMotorRates();

  let features = [];
  let mode = 'array';

  if (data.features && Array.isArray(data.features)) {
    features = data.features.slice(0, 50);
  } else if (data.named_features && typeof data.named_features === 'object') {
    mode = 'named';
    const entries = Object.entries(data.named_features).slice(0, 50);
    if (data.normalize) {
      const vals = entries.map(e => e[1]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 1;
      features = vals.map(v => (v - min) / range);
    } else {
      features = entries.map(e => e[1]);
    }
  }

  for (let f = 0; f < features.length; f++) {
    const neuronBase = patGroup.start + f * 4;
    if (neuronBase + 3 >= patGroup.start + patGroup.count) break;
    const val = Math.max(0, Math.min(1, features[f]));
    const intensity = val * 400;
    for (let n = 0; n < 4; n++) {
      inputs.push([neuronBase + n, intensity]);
    }
  }

  for (let s = 0; s < stepsToRun; s++) step(inputs);
  const rates = getMotorRates();

  rates.pattern_echo = {
    feature_count: features.length,
    mode,
    label: data.label || 'unknown',
  };

  if (data.label) recordPattern(data.label, features[0] * 100 || 0, rates);
  return rates;
}
```

### 3. Add HTTP Route
After the `stimulate-price` route handler:
```javascript
if (m === 'POST' && p === '/stimulate-pattern') {
  if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
  const body = await parseBody(req);
  if (!body.features && !body.named_features) {
    return respond(res, 400, { error: 'features (array) or named_features (object) required' });
  }
  spikeHistory = [];
  const rates = stimulateFromPattern(body);
  return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
}
```

## Usage Examples

### System health anomaly detection
```
POST /api/brain/stimulate-pattern
Headers: { "Content-Type": "application/json", "x-brain-api-key": "$BRAIN_API_KEY" }
Body: {
  "named_features": {
    "cpu": 0.92, "memory": 0.85, "disk_io": 0.7,
    "error_rate": 0.3, "latency": 0.6, "connections": 0.4
  },
  "label": "server-health"
}
→ sell_signal dominant = anomaly detected
→ buy_signal dominant = healthy
```

### Bot performance scoring
```
POST /api/brain/stimulate-pattern
Body: {
  "features": [0.62, 0.45, 0.8, 0.3, 0.55],
  "label": "bot-performance"
}
```
Features could represent: win_rate, avg_pnl_normalized, sharpe_ratio, max_drawdown_pct, trade_frequency.

### Multi-sensor IoT decision
```
POST /api/brain/stimulate-pattern
Body: {
  "named_features": {
    "temperature": 72, "humidity": 45, "light": 800,
    "motion": 1, "sound_db": 35, "co2_ppm": 420
  },
  "normalize": true,
  "label": "room-comfort"
}
```

## Training Workflow
```
for each labeled_example in training_data:
  1. POST /api/brain/stimulate-pattern { features: example.features, label: "my-task" }
  2. Check motor output (buy/sell/hold)
  3. Compare against known label:
     - Correct: POST /api/brain/feedback { "type": "sugar", "target": "motor" }
     - Wrong:   POST /api/brain/feedback { "type": "pain", "target": "motor" }
  4. For strong correct matches, reinforce memory:
     POST /api/brain/feedback { "type": "sugar", "target": "mushroom" }
```

## Files
- Brain engine: `skills/bots/brain-engine-server.cjs`
- Master adapter guide: `skills/brain-stimulate-adapter/SKILL.md`
