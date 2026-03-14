---
name: neural-feedback
description: Neural Preference Learning — real-time user preference training for the BrainJar spiking neural network via conversational feedback
---

# Neural Preference Learning

This skill documents the Neural Preference Learning system — a novel architecture combining persistent spiking neural networks with LLM agents for real-time user preference learning through conversational feedback.

## How It Works

1. User interacts with any OpenClaw agent (CEO, IG, etc.)
2. When the user responds to an agent's output, the system classifies their sentiment (positive/negative/neutral)
3. A feature vector is extracted from the previous agent response (length, tool usage, code presence, etc.)
4. The feature vector is stimulated through the brain's **preference zone** (120 neurons at 5K scale)
5. Sugar (positive) or pain (negative) reinforcement shapes the neural network's synapses
6. Over time, the brain learns which response patterns the user prefers

## Preference Zone

The brain allocates 20% of sensory neurons to preference learning:
- At 5K neurons: 120 preference neurons (neurons 480-599)
- At 10K neurons: 240 preference neurons
- At 20K neurons: 400 preference neurons

In dual-purpose mode (existing trained weights), preference uses the upper antenna range to preserve existing trading synapses.

## Sentiment Keywords

**Positive** (triggers sugar): good, great, perfect, yes, nice, excellent, love, awesome, correct, exactly, thanks, helpful, works, right, beautiful, amazing, fantastic, wonderful, brilliant, superb

**Negative** (triggers pain): no, wrong, bad, redo, fix, broken, terrible, useless, stop, hate, awful, horrible, worse, ugly, stupid, fail, error, bug, crash, mess

## Feature Vector

Each agent response is encoded as a feature vector with these dimensions:
- `responseLength` (0-1, normalized by 2000 chars)
- `toolCount` (integer, number of tools used)
- `hadCode` (0 or 1)
- `hadData` (0 or 1)
- `topicHash` (0-1, keyword-derived)
- `wasProactive` (0 or 1)
- `agentIdHash` (0-1, agent name hash)

## API Endpoints

All endpoints require session authentication.

### GET /api/neural-feedback/status
Returns current stats: total interactions, positive/negative/neutral counts, last feedback, DB status.

### GET /api/neural-feedback/history?limit=50
Returns recent feedback records with timestamps, agent IDs, sentiment, brain responses, and raw text.

### GET /api/neural-feedback/patterns
Returns aggregated analysis: per-agent breakdown, sentiment distribution, feature patterns (what response characteristics are liked/disliked).

### POST /api/neural-feedback/replay
Replays stored preference interactions through the brain to reinforce learned patterns. Useful after architecture changes or to strengthen existing preferences.

### POST /api/neural-feedback/sync
Forces synchronization between PostgreSQL database and local JSON file mirror. Ensures portability and consistency.

## Brain Engine Endpoints

### POST /stimulate-preference
Stimulates preference neurons with a feature vector and applies sugar/pain feedback.
```json
{
  "features": { "responseLength": 0.5, "toolCount": 2, "hadCode": 1 },
  "sentiment": "positive",
  "strength": 0.7
}
```

### POST /replay-trading
Replays stored trading patterns through the brain to restore trading knowledge after architecture changes.

## Data Persistence

- **Primary**: PostgreSQL `neural_feedback` table (survives republishes)
- **Mirror**: `~/.openclaw/neural-feedback.json` (enables portability without DB)
- **Backups**: `~/.openclaw/backups/neural-feedback-YYYY-MM-DD.json` (daily, 30-day retention)
- **Startup sync**: DB and file are compared and merged on every boot

### GET /api/neural-feedback/preference-summary
Returns the brain's learned preference summary and the preference context string that gets injected into agent messages.

## Brain→Agent Communication Loop

The brain learns from user feedback (sugar/pain), but it must also communicate those learned preferences back to agents. This is implemented through three mechanisms:

### 1. WS Proxy Context Injection (Real-time)
When a user sends a chat message, the WS proxy intercepts the `chat.send` frame and appends the brain's learned preference context directly to the user message before forwarding to the gateway. The agent sees the preference memory alongside each user message.

### 2. PREFERENCES.md Workspace File (Persistent)
After each non-neutral feedback interaction, the system writes/updates `.openclaw/workspace/PREFERENCES.md` with the current preference summary and brain motor signals. The gateway reads this as a bootstrap file, so the agent sees preferences even in new sessions.

### 3. Brain Motor Rate Query (Live Neural Signal)
The `queryBrainMotorRates()` function queries the brain engine's `/observe` endpoint to get current motor neuron firing rates. These rates represent the spiking network's actual learned output — shaped by all accumulated sugar/pain feedback — and are included in the PREFERENCES.md file.

### Key Functions
- `getPreferenceSummary()` — analyzes feedback history to extract preference insights (code preference, response length, proactivity, etc.)
- `buildPreferenceContext()` — generates human-readable preference context string from the summary
- `queryBrainMotorRates()` — queries brain engine `/observe` for live motor rates
- `buildFullPreferenceContext()` — combines preference context + brain motor signals
- `writePreferencesFile()` — writes the full context to `.openclaw/workspace/PREFERENCES.md`

## Agent Integration

All agents share the same preference neurons. Each interaction is tagged with the agent's ID, allowing per-agent analysis while training a unified preference model. The brain's motor outputs (buy/sell/hold signals) during preference stimulation provide a secondary signal about how preferences relate to trading decisions.

## UI

The Neural Learning tab in the Config page (`/model-config.html`) shows:
- Status dashboard with interaction counts
- Sentiment distribution bar chart
- Per-agent pattern analysis
- Recent interaction history
- Sync, replay, and refresh actions
