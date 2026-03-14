# Neural Preference Learning

**Real-time spiking neural network augmentation for persistent LLM agent preference learning through conversational feedback.**

[![Paper](https://img.shields.io/badge/Paper-Read%20Now-blue)](paper/neural-preference-learning.md)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Live System](https://img.shields.io/badge/Live-OpenClaw-orange)](https://openclaw-mechanicus.replit.app)

---

## What Is This?

Neural Preference Learning (NPL) is a novel architecture that gives LLM agents persistent, personal preferences by pairing them with a companion spiking neural network. Unlike RLHF (which is batch, pre-deployment, and population-level), NPL operates in real-time, learning from individual user feedback through natural language.

When a user says "great answer" or "no, fix this", the system:

1. **Classifies sentiment** from the user's natural language feedback
2. **Encodes the previous agent response** as a 7-dimensional feature vector
3. **Stimulates preference neurons** in a spiking neural network (120 neurons at 5K scale)
4. **Applies sugar or pain** reinforcement, modifying synaptic weights via Hebbian plasticity

Over time, the network develops a persistent "intuition" about what the user prefers — and this intuition survives across sessions, model swaps, and architecture changes.

## Architecture

```
User <-> LLM Agent <-> Response
              |                |
      Sentiment Detector   Feature Encoder
              |                |
        Sugar/Pain       Feature Vector (7-D)
              |                |
         +----------------------------+
         |   Spiking Neural Network   |
         |   (5000 LIF Neurons)       |
         |                            |
         |  Sensory -> Inter -> Motor |
         |  (600)     (3600)   (800)  |
         |                            |
         |  Preference Zone: 120 N    |
         |  Mushroom Body: 40 N       |
         |  130,600 Synapses          |
         +----------------------------+
                    |
         Persistent Weight Storage
         (PostgreSQL + JSON mirror)
```

## Key Properties

| Property | RLHF | MemGPT | **NPL** |
|---|---|---|---|
| Timing | Pre-deployment | Runtime (text) | **Runtime (neural)** |
| Personalization | Population | Per-user (text) | **Per-user (synaptic)** |
| Learning type | Batch gradient | None (retrieval) | **Online Hebbian** |
| Survives model swap | No | Yes (text) | **Yes (neural)** |
| Model-agnostic | No | Partially | **Yes** |

## Feature Vector

Each agent response is encoded as:

| Feature | Range | Description |
|---|---|---|
| `responseLength` | [0, 1] | Character count / 2000 |
| `toolCount` | [0, N] | Tools invoked |
| `hadCode` | {0, 1} | Code blocks present |
| `hadData` | {0, 1} | Structured data present |
| `topicHash` | [0, 1] | Topic fingerprint |
| `wasProactive` | {0, 1} | Agent acted beyond request |
| `agentIdHash` | [0, 1] | Agent identity encoding |

## Production Deployment

This is not a simulation or theoretical framework. NPL is deployed and running in production as part of the [OpenClaw](https://github.com/JoeSzeles/openclaw-mechanicus) multi-agent platform with BrainJar neural engine integration.

- **Live system**: https://openclaw-mechanicus.replit.app
- **Brain engine**: 5,000 LIF neurons, 130,600 synapses
- **Persistence**: PostgreSQL + JSON file mirror with daily backups
- **Multi-agent**: All agents share the same preference brain
- **UI**: Neural Learning tab in Config page with real-time monitoring

## Paper

Read the full scientific paper: [Neural Preference Learning: Real-Time Spiking Network Augmentation for Persistent LLM Agent Adaptation](paper/neural-preference-learning.md)

## Try It

```bash
node examples/basic-feedback-loop.cjs
```

## Repository Structure

```
neural-preference-learning/
+-- README.md
+-- paper/
|   +-- neural-preference-learning.md   # Scientific paper
+-- reference/
|   +-- brain-engine-excerpt.cjs        # Brain engine preference code (simplified)
|   +-- feedback-detector.cjs           # Sentiment detection (simplified)
|   +-- feature-encoder.cjs             # Response -> feature vector (simplified)
+-- examples/
|   +-- basic-feedback-loop.cjs         # Minimal working example
+-- LICENSE
+-- CITATION.cff
```

**Note on reference code:** The files under `reference/` are simplified, didactic implementations aligned with the paper's conceptual model. The production system at [OpenClaw](https://github.com/JoeSzeles/openclaw-mechanicus) extends these with additional features, snake_case field conventions, and integration-specific logic. See the live codebase for exact production behavior.

## Citation

```bibtex
@article{szeles2025npl,
  title={Neural Preference Learning: Real-Time Spiking Network Augmentation
         for Persistent LLM Agent Adaptation},
  author={Szeles, Joe},
  year={2025},
  url={https://github.com/JoeSzeles/neural-preference-learning}
}
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Related Projects

- [OpenClaw](https://github.com/JoeSzeles/openclaw-mechanicus) — Multi-agent AI platform with IG Trading integration
- [BrainJar](https://github.com/JoeSzeles/openclaw-mechanicus) — Drosophila connectome-inspired spiking neural network engine
