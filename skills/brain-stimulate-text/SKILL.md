---
name: brain-stimulate-text
description: Text/NLP pattern recognition adapter for brain engine. Maps keyword scores, complexity, urgency to neurons 150-209.
---

# Brain Stimulate Text — Text/NLP Pattern Recognition Adapter

## Overview
This adapter feeds tokenized text features into the BrainJar brain engine via `POST /api/brain/stimulate-text`. It maps text characteristics (keyword categories, urgency, length, complexity) to sensory neurons for pattern classification tasks — spam detection, topic routing, priority scoring, content categorization.

## Route
```
POST /api/brain/stimulate-text
```

## Authentication
Requires `x-brain-api-key` header (see AGENTS.md for details).

## Request Body
```json
{
  "keywords": {
    "urgent": 0.9,
    "technical": 0.3,
    "financial": 0.7,
    "social": 0.1,
    "negative": 0.4,
    "positive": 0.2
  },
  "metrics": {
    "length": 150,
    "complexity": 0.6,
    "question_marks": 2,
    "exclamation_marks": 1,
    "caps_ratio": 0.05
  },
  "category": "financial",
  "label": "alert-routing",
  "steps": 15
}
```

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keywords | object | YES | Keyword category scores (0-1), up to 6 categories |
| metrics | object | no | Text metrics: length (chars), complexity (0-1), punctuation counts, caps ratio |
| category | string | no | Category label for pattern memory |
| label | string | no | Task label for pattern memory key |
| steps | int | no | Simulation steps (default: 15) |

### Keyword Categories
You define the categories. The adapter maps the first 6 keyword entries to 6 neuron groups (8 neurons each). Common category sets:
- **Content type**: urgent, technical, financial, social, negative, positive
- **Topic routing**: support, billing, bug, feature, complaint, praise
- **Spam detection**: promotional, suspicious, authentic, personal, bulk, phishing

## Response
```json
{
  "timestamp": 1710400000000,
  "step_count": 12345,
  "buy_signal": 0.65,
  "sell_signal": 0.28,
  "hold_signal": 0.42,
  "avg_rate": 0.45,
  "peak_rate": 0.65,
  "text_echo": {
    "keyword_count": 6,
    "dominant_keyword": "urgent",
    "complexity": 0.6
  }
}
```

**Interpreting motor output for text tasks:**
- `buy_signal` → positive class / accept / route-A / priority-high
- `sell_signal` → negative class / reject / route-B / priority-low
- `hold_signal` → uncertain / needs-review / queue

## Sensory Neuron Mapping
Uses sensory neurons 150-209 (60 neurons):

| Group | Neurons | Count | Encoding |
|-------|---------|-------|----------|
| keyword_1 | 150-157 | 8 | First keyword category score * 400 |
| keyword_2 | 158-165 | 8 | Second keyword category score * 400 |
| keyword_3 | 166-173 | 8 | Third keyword category score * 400 |
| keyword_4 | 174-181 | 8 | Fourth keyword category score * 400 |
| keyword_5 | 182-189 | 8 | Fifth keyword category score * 400 |
| keyword_6 | 190-197 | 8 | Sixth keyword category score * 400 |
| text_length | 198-201 | 4 | Normalized text length (log scale) |
| text_complexity | 202-205 | 4 | Complexity score * 300 |
| text_punctuation | 206-209 | 4 | Urgency markers (caps, !, ?) |

## Installation
Add this code to `skills/bots/brain-engine-server.cjs`:

### 1. Register Sensory Assignments
In `assignSensoryRegions()`:
```javascript
sensoryAssignments.text_keyword_1    = { start: 150, count: 8, desc: 'Text keyword category 1' };
sensoryAssignments.text_keyword_2    = { start: 158, count: 8, desc: 'Text keyword category 2' };
sensoryAssignments.text_keyword_3    = { start: 166, count: 8, desc: 'Text keyword category 3' };
sensoryAssignments.text_keyword_4    = { start: 174, count: 8, desc: 'Text keyword category 4' };
sensoryAssignments.text_keyword_5    = { start: 182, count: 8, desc: 'Text keyword category 5' };
sensoryAssignments.text_keyword_6    = { start: 190, count: 8, desc: 'Text keyword category 6' };
sensoryAssignments.text_length       = { start: 198, count: 4, desc: 'Text length (normalized)' };
sensoryAssignments.text_complexity   = { start: 202, count: 4, desc: 'Text complexity score' };
sensoryAssignments.text_punctuation  = { start: 206, count: 4, desc: 'Punctuation urgency markers' };
```

### 2. Add Encoding Function
After `stimulateFromPrice()`:
```javascript
function stimulateFromText(data) {
  const inputs = [];
  const keywords = data.keywords || {};
  const metrics = data.metrics || {};
  const stepsToRun = data.steps || 15;

  const kwEntries = Object.entries(keywords).slice(0, 6);
  for (let k = 0; k < kwEntries.length; k++) {
    const group = sensoryAssignments['text_keyword_' + (k + 1)];
    if (!group) continue;
    const score = Math.max(0, Math.min(1, kwEntries[k][1]));
    const intensity = score * 400;
    for (let i = group.start; i < group.start + group.count; i++) {
      inputs.push([i, intensity]);
    }
  }

  const lenGroup = sensoryAssignments.text_length;
  if (lenGroup && metrics.length !== undefined) {
    const lenI = Math.min(Math.log10(Math.max(metrics.length, 1)) * 100, 500);
    for (let i = lenGroup.start; i < lenGroup.start + lenGroup.count; i++) {
      inputs.push([i, lenI]);
    }
  }

  const cxGroup = sensoryAssignments.text_complexity;
  if (cxGroup && metrics.complexity !== undefined) {
    const cxI = Math.min(metrics.complexity, 1) * 300;
    for (let i = cxGroup.start; i < cxGroup.start + cxGroup.count; i++) {
      inputs.push([i, cxI]);
    }
  }

  const punctGroup = sensoryAssignments.text_punctuation;
  if (punctGroup) {
    const qm = Math.min((metrics.question_marks || 0) * 50, 200);
    const em = Math.min((metrics.exclamation_marks || 0) * 80, 300);
    const caps = Math.min((metrics.caps_ratio || 0) * 500, 400);
    const punctI = Math.min(qm + em + caps, 500);
    for (let i = punctGroup.start; i < punctGroup.start + punctGroup.count; i++) {
      inputs.push([i, punctI]);
    }
  }

  for (let s = 0; s < stepsToRun; s++) step(inputs);
  const rates = getMotorRates();

  rates.text_echo = {
    keyword_count: kwEntries.length,
    dominant_keyword: kwEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
    complexity: metrics.complexity || 0,
  };

  const memKey = data.label || data.category || 'text';
  if (memKey) recordPattern(memKey, kwEntries[0]?.[1] * 100 || 0, rates);
  return rates;
}
```

### 3. Add HTTP Route
After the `stimulate-price` route handler:
```javascript
if (m === 'POST' && p === '/stimulate-text') {
  if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
  const body = await parseBody(req);
  if (!body.keywords || Object.keys(body.keywords).length === 0) {
    return respond(res, 400, { error: 'keywords object required (1-6 category scores)' });
  }
  spikeHistory = [];
  const rates = stimulateFromText(body);
  return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
}
```

## Usage Examples

### Classify an alert for routing
```
POST /api/brain/stimulate-text
Headers: { "Content-Type": "application/json", "x-brain-api-key": "$BRAIN_API_KEY" }
Body: {
  "keywords": { "urgent": 0.9, "financial": 0.8, "negative": 0.6 },
  "metrics": { "length": 50, "complexity": 0.3, "exclamation_marks": 3 },
  "label": "alert-routing"
}
```

### Score content priority
```
POST /api/brain/stimulate-text
Body: {
  "keywords": { "technical": 0.7, "bug": 0.9, "urgent": 0.4 },
  "metrics": { "length": 500, "complexity": 0.8 },
  "label": "priority-scoring"
}
→ buy_signal > 0.6 = high priority
→ hold_signal dominant = medium
→ sell_signal > 0.6 = low priority
```

## Training
Feed labeled examples and apply sugar/pain:
```
1. POST /api/brain/stimulate-text { keywords: {...}, label: "spam-detection" }
2. If classified correctly: POST /api/brain/feedback { "type": "sugar" }
3. If misclassified: POST /api/brain/feedback { "type": "pain" }
```
Repeat with many examples — the brain learns the patterns through synaptic weight adjustments.

## Files
- Brain engine: `skills/bots/brain-engine-server.cjs`
- Master adapter guide: `skills/brain-stimulate-adapter/SKILL.md`
