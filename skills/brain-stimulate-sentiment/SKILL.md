---
name: brain-stimulate-sentiment
description: Sentiment analysis adapter for brain engine. Maps polarity, subjectivity, emotions to sensory neurons 100-149.
---

# Brain Stimulate Sentiment — Sentiment Analysis Adapter

## Overview
This adapter feeds text sentiment scores into the BrainJar brain engine via `POST /api/brain/stimulate-sentiment`. It maps sentiment polarity, subjectivity, emotion scores, and source metadata to sensory neurons, allowing the brain to learn patterns from sentiment data (news headlines, social media, analyst reports).

## Route
```
POST /api/brain/stimulate-sentiment
```

## Authentication
Requires `x-brain-api-key` header (see AGENTS.md for details).

## Request Body
```json
{
  "text": "Gold surges to record highs as inflation fears mount",
  "sentiment": 0.85,
  "subjectivity": 0.6,
  "emotions": {
    "fear": 0.7,
    "greed": 0.3,
    "uncertainty": 0.5,
    "confidence": 0.2
  },
  "source": "news",
  "epic": "CS.D.CFAGOLD.CFA.IP",
  "steps": 20
}
```

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sentiment | float | YES | Polarity score: -1.0 (bearish) to +1.0 (bullish) |
| subjectivity | float | no | 0.0 (objective/factual) to 1.0 (opinion/subjective) |
| emotions | object | no | Emotion scores (0-1): fear, greed, uncertainty, confidence |
| source | string | no | Source type: "news", "social", "analyst", "report" |
| epic | string | no | Instrument context (for pattern memory) |
| text | string | no | Original text (stored in pattern memory, not processed by neurons) |
| steps | int | no | Simulation steps to run (default: 15) |

## Response
```json
{
  "timestamp": 1710400000000,
  "step_count": 12345,
  "buy_signal": 0.72,
  "sell_signal": 0.31,
  "hold_signal": 0.45,
  "avg_rate": 0.49,
  "peak_rate": 0.72,
  "antenna_alerts": {},
  "pressure_fed": false,
  "sentiment_echo": {
    "polarity": 0.85,
    "dominant_emotion": "fear",
    "source": "news"
  }
}
```

## Sensory Neuron Mapping
Uses unassigned sensory neurons 100-149 (50 neurons):

| Group | Neurons | Count | Encoding |
|-------|---------|-------|----------|
| sentiment_positive | 100-109 | 10 | Fires when sentiment > 0 (intensity = sentiment * 300) |
| sentiment_negative | 110-119 | 10 | Fires when sentiment < 0 (intensity = |sentiment| * 300) |
| subjectivity | 120-124 | 5 | Objective vs subjective (intensity = subjectivity * 200) |
| fear | 125-129 | 5 | Fear emotion (intensity = fear * 400) |
| greed | 130-134 | 5 | Greed emotion (intensity = greed * 400) |
| uncertainty | 135-139 | 5 | Uncertainty (intensity = uncertainty * 300) |
| confidence | 140-144 | 5 | Confidence (intensity = confidence * 300) |
| source_type | 145-149 | 5 | Source encoding (news=high, social=medium, analyst=high, other=low) |

## Installation
Add this code to `skills/bots/brain-engine-server.cjs`:

### 1. Register Sensory Assignments
In `assignSensoryRegions()`, after the antenna assignment, add:
```javascript
sensoryAssignments.sentiment_positive = { start: 100, count: 10, desc: 'Positive sentiment polarity' };
sensoryAssignments.sentiment_negative = { start: 110, count: 10, desc: 'Negative sentiment polarity' };
sensoryAssignments.subjectivity       = { start: 120, count: 5,  desc: 'Text subjectivity level' };
sensoryAssignments.emotion_fear       = { start: 125, count: 5,  desc: 'Fear emotion intensity' };
sensoryAssignments.emotion_greed      = { start: 130, count: 5,  desc: 'Greed emotion intensity' };
sensoryAssignments.emotion_uncertainty = { start: 135, count: 5, desc: 'Uncertainty emotion' };
sensoryAssignments.emotion_confidence = { start: 140, count: 5,  desc: 'Confidence emotion' };
sensoryAssignments.sentiment_source   = { start: 145, count: 5,  desc: 'Sentiment source type' };
```

### 2. Add Encoding Function
After `stimulateFromPrice()`:
```javascript
function stimulateFromSentiment(data) {
  const inputs = [];
  const sentiment = Math.max(-1, Math.min(1, data.sentiment || 0));
  const subjectivity = Math.max(0, Math.min(1, data.subjectivity || 0.5));
  const emotions = data.emotions || {};
  const stepsToRun = data.steps || 15;

  const sp = sensoryAssignments.sentiment_positive;
  const sn = sensoryAssignments.sentiment_negative;
  if (sp && sn) {
    const posI = sentiment > 0 ? sentiment * 300 : 0;
    const negI = sentiment < 0 ? Math.abs(sentiment) * 300 : 0;
    for (let i = sp.start; i < sp.start + sp.count; i++) inputs.push([i, posI]);
    for (let i = sn.start; i < sn.start + sn.count; i++) inputs.push([i, negI]);
  }

  const sub = sensoryAssignments.subjectivity;
  if (sub) {
    const subI = subjectivity * 200;
    for (let i = sub.start; i < sub.start + sub.count; i++) inputs.push([i, subI]);
  }

  const emotionMap = {
    fear: sensoryAssignments.emotion_fear,
    greed: sensoryAssignments.emotion_greed,
    uncertainty: sensoryAssignments.emotion_uncertainty,
    confidence: sensoryAssignments.emotion_confidence,
  };
  for (const [emo, group] of Object.entries(emotionMap)) {
    if (group && emotions[emo] !== undefined) {
      const eI = Math.min(emotions[emo], 1) * 400;
      for (let i = group.start; i < group.start + group.count; i++) inputs.push([i, eI]);
    }
  }

  const src = sensoryAssignments.sentiment_source;
  if (src) {
    const sourceWeights = { news: 400, analyst: 350, report: 300, social: 150 };
    const srcI = sourceWeights[data.source] || 100;
    for (let i = src.start; i < src.start + src.count; i++) inputs.push([i, srcI]);
  }

  for (let s = 0; s < stepsToRun; s++) step(inputs);
  const rates = getMotorRates();

  rates.sentiment_echo = {
    polarity: sentiment,
    dominant_emotion: Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
    source: data.source || 'unknown',
  };

  if (data.epic) recordPattern(data.epic, sentiment * 100, rates);
  return rates;
}
```

### 3. Add HTTP Route
After the `stimulate-price` route handler:
```javascript
if (m === 'POST' && p === '/stimulate-sentiment') {
  if (!isBooted) return respond(res, 400, { error: 'Brain not booted' });
  const body = await parseBody(req);
  if (body.sentiment === undefined) return respond(res, 400, { error: 'sentiment field required (-1 to 1)' });
  spikeHistory = [];
  const rates = stimulateFromSentiment(body);
  return respond(res, 200, { timestamp: Date.now(), step_count: stepCount, ...rates });
}
```

## Usage Examples

### Feed a bullish news headline
```
POST /api/brain/stimulate-sentiment
Headers: { "Content-Type": "application/json", "x-brain-api-key": "$BRAIN_API_KEY" }
Body: {
  "sentiment": 0.8,
  "emotions": { "greed": 0.6, "confidence": 0.7 },
  "source": "news",
  "epic": "CS.D.CFAGOLD.CFA.IP"
}
```

### Feed a fearful social media post
```
POST /api/brain/stimulate-sentiment
Headers: { "Content-Type": "application/json", "x-brain-api-key": "$BRAIN_API_KEY" }
Body: {
  "sentiment": -0.6,
  "emotions": { "fear": 0.9, "uncertainty": 0.8 },
  "source": "social",
  "epic": "CS.D.BITCOIN.CFD.IP"
}
```

### Combine with price stimulation
Feed sentiment first, then price data — the brain's interneurons retain residual activity, creating cross-modal pattern recognition:
```
1. POST /api/brain/stimulate-sentiment  { sentiment: 0.8, source: "news" }
2. POST /api/brain/stimulate-price      { price: 8050, prevPrice: 8040 }
3. Read combined motor output from step 2
```

## Training
Use standard feedback after stimulation:
```
POST /api/brain/feedback { "type": "sugar" }   // if the sentiment-based decision was profitable
POST /api/brain/feedback { "type": "pain" }    // if it led to a loss
```

## Files
- Brain engine: `skills/bots/brain-engine-server.cjs`
- Master adapter guide: `skills/brain-stimulate-adapter/SKILL.md`
