# Neural Preference Learning: Real-Time Spiking Network Augmentation for Persistent LLM Agent Adaptation

**Joe Szeles**

*BrainJar / OpenClaw Project*

---

## Abstract

Large language model (LLM) agents are fundamentally stateless with respect to individual user preferences — each interaction begins with no persistent memory of what a particular user values in agent responses. Current approaches to preference alignment, such as reinforcement learning from human feedback (RLHF), operate as batch pre-deployment processes that produce a generic alignment rather than personal adaptation. This paper presents *Neural Preference Learning* (NPL), a novel architecture that augments LLM agents with a companion spiking neural network (SNN) operating as a persistent, real-time preference substrate. When users provide natural language feedback (e.g., "great answer" or "no, fix this"), the system classifies sentiment and maps the preceding agent response to a feature vector, which is then stimulated through dedicated preference neurons with sugar (positive) or pain (negative) reinforcement. Over time, Hebbian synaptic plasticity shapes the network into a persistent "intuition" model that survives across sessions, model swaps, and architecture changes. The system is implemented and deployed in production as part of the OpenClaw multi-agent platform, running on a 5,000-neuron Leaky Integrate-and-Fire (LIF) network with 130,600 synapses. This paper describes the architecture, implementation, methodology, and evaluation framework, and argues that real-time personal neural reinforcement from conversational feedback represents a fundamentally new approach to LLM agent adaptation.

**Keywords:** spiking neural network, LLM agent, preference learning, reinforcement, RLHF, LIF neuron, Hebbian learning, multi-agent system

---

## 1. Introduction

The deployment of large language model agents in interactive, long-running contexts exposes a fundamental limitation: LLMs do not learn from individual user interactions. A user who consistently prefers concise, data-rich responses must re-state this preference in every session. The model's weights are frozen at deployment time, and while prompt engineering and system instructions can encode some preferences, these are brittle, manually maintained, and lack the adaptive quality of genuine learning.

Reinforcement Learning from Human Feedback (RLHF) [1, 2] has emerged as the dominant approach to aligning LLM outputs with human preferences. However, RLHF operates at training time with aggregated feedback from many evaluators, producing a generic preference alignment. It does not adapt to individual users, operates in batch rather than real-time, and requires expensive retraining cycles. Personal fine-tuning approaches face similar batch-processing constraints and risk catastrophic forgetting.

Memory-augmented architectures such as MemGPT [3] address persistence by storing interaction history as text, but text-based memory does not generalize — it recalls what happened, not what the user *prefers*. Cognitive architectures like ACT-R [4] and SOAR [5] model human cognition with symbolic production rules, but integrate poorly with neural language models.

This paper bridges these gaps by introducing *Neural Preference Learning* (NPL), which pairs an LLM agent with a biologically-inspired spiking neural network that operates as a persistent, continuously-adapting preference substrate. The key contributions are:

1. **A hybrid architecture** combining symbolic LLM reasoning with sub-symbolic spiking network learning, where the SNN serves as a real-time preference memory that the LLM cannot modify or corrupt.
2. **Conversational reinforcement** — user feedback in natural language is automatically classified and translated to neurochemical-analog signals (sugar/pain) that modify synaptic weights through Hebbian plasticity.
3. **Response feature encoding** — agent responses are mapped to multi-dimensional feature vectors that activate dedicated sensory neuron populations, enabling the network to learn associations between response characteristics and user satisfaction.
4. **Production deployment** — the system is implemented and running in a live multi-agent platform (OpenClaw), not as a simulation or theoretical framework.

---

## 2. Related Work

### 2.1 Reinforcement Learning from Human Feedback

Christiano et al. [1] introduced learning reward models from human preferences for training RL agents. Ouyang et al. [2] applied this framework to language models, producing InstructGPT. Constitutional AI [6] further automates preference learning through self-critique. All these approaches operate at training time and produce population-level alignment rather than personal adaptation.

### 2.2 Memory-Augmented LLM Agents

MemGPT (now Letta) [3] introduces virtual context management with persistent memory tiers. Retrieval-augmented generation (RAG) systems store and retrieve relevant context. These approaches maintain factual memory but do not perform adaptive learning — they recall, but do not generalize preferences from sparse feedback signals.

### 2.3 Cognitive Architectures

ACT-R [4] and SOAR [5] model human cognition through production rules and symbolic working memory. While they support learning through chunking and utility learning, they operate in a symbolic paradigm that integrates poorly with continuous neural network representations.

### 2.4 Spiking Neural Networks

Maass [7] established the theoretical foundations of spiking neural networks as the "third generation" of neural network models. Tavanaei et al. [8] surveyed deep learning in SNNs. The Drosophila connectome mapping project [9] provided detailed biological neural circuit data. SNNs have been applied to pattern recognition and temporal processing, but their application as companion preference substrates for LLM agents has not been previously explored.

### 2.5 Personal LLM Adaptation

LoRA [10] and QLoRA [11] enable efficient fine-tuning of LLMs. However, personal fine-tuning from conversational feedback requires accumulating sufficient training data, runs in batch mode, and risks destabilizing the base model. NPL sidesteps these issues by maintaining preference learning in a separate neural substrate that does not modify the LLM's weights.

---

## 3. Architecture

The NPL system consists of five interconnected components operating within a multi-agent platform:

### 3.1 System Overview

```
User ←→ LLM Agent ←→ Response
              ↓                ↑
      Sentiment Detector   Feature Encoder
              ↓                ↓
        Sugar/Pain    Feature Vector (7-D)
              ↓                ↓
         ┌─────────────────────────┐
         │   Spiking Neural Network   │
         │   (5000 LIF Neurons)       │
         │                            │
         │  Sensory → Inter → Motor   │
         │  (600)     (3600)   (800)  │
         │                            │
         │  Preference Zone: 120 N    │
         │  Mushroom Body: 40 N       │
         │  130,600 Synapses          │
         └─────────────────────────┘
                    ↓
         Persistent Weight Storage
         (PostgreSQL + JSON mirror)
```

### 3.2 LLM Agent Layer

The LLM agent handles strategic reasoning, natural language generation, tool use, and task execution. In the reference implementation, multiple agents (CEO coordinator, trading specialist, data analyst) share a common brain, each tagged with a unique agent identifier. The LLM layer is deliberately decoupled from the preference network — the LLM's weights are never modified by the NPL system.

### 3.3 Spiking Neural Network

The preference substrate is a Leaky Integrate-and-Fire (LIF) network implementing the Drosophila melanogaster connectome topology [9]:

- **Sensory neurons** (S=600): Receive external stimuli including preference feature vectors
- **Interneurons** (I=3,600): Process and associate patterns through recurrent connections
- **Motor neurons** (M=800): Produce output signals (buy/sell/hold in the trading context)
- **Mushroom body** (40 interneurons): Enhanced connectivity cluster for long-term memory consolidation

Each neuron follows the LIF dynamics:

```
V(t+1) = V(t) × decay + Σ(w_ij × spike_j) + I_ext
if V(t+1) > V_threshold: spike, V → V_reset
```

With parameters: `w_syn = 12.0`, `r_poi = 150`, `tau_syn = 5`, `V_threshold = 1.0`, `V_reset = 0.0`, `decay = 0.95`.

### 3.4 Preference Zone Allocation

The system allocates 20% of sensory neurons to preference learning:

| Network Size | Sensory | Preference Neurons | Per-Feature (7-D) | Quality |
|---|---|---|---|---|
| 5,000 (1min) | 600 | 120 | 17 | Good |
| 10,000 (5min) | 1,200 | 240 | 34 | Excellent |
| 20,000 (15min) | 2,000 | 400 | 57 | High |

A *dual-purpose mode* preserves existing trained weights when the network already has learned synaptic patterns. In this mode, preference stimulation targets the upper antenna sensory range, sharing neurons that also respond to market pressure signals — analogous to biological neurons that respond to multiple stimulus modalities.

### 3.5 Persistence Layer

All feedback interactions are stored in a PostgreSQL database with a local JSON file mirror:

- **Primary storage**: `neural_feedback` table with composite unique index (timestamp, agent_id, session_id, sentiment)
- **File mirror**: JSON file written on every DB write for portability without a database
- **Daily backups**: Rotated 30-day snapshots
- **Startup sync**: Bidirectional merge on boot, with composite key deduplication and ISO timestamp normalization

Synaptic weights are serialized to a binary JSON file (`brain-weights.json`) and restored on boot. If the network architecture changes (e.g., scaling from 5,000 to 10,000 neurons), stored weights are discarded and both trading patterns and preference history are replayed from persistent storage.

---

## 4. Methodology

### 4.1 Response Feature Encoding

When an agent produces a response, the system extracts a 7-dimensional feature vector:

| Feature | Range | Description |
|---|---|---|
| `responseLength` | [0, 1] | Character count normalized by 2,000 |
| `toolCount` | [0, N] | Number of tools invoked |
| `hadCode` | {0, 1} | Whether the response contained code blocks |
| `hadData` | {0, 1} | Whether the response contained structured data |
| `topicHash` | [0, 1] | Keyword-derived topic fingerprint |
| `wasProactive` | {0, 1} | Whether the agent acted beyond the explicit request |
| `agentIdHash` | [0, 1] | Numeric encoding of the responding agent's identity |

Each feature is mapped across its allocated neuron population using population coding: for a feature with `k` allocated neurons, the `i`-th neuron receives stimulation proportional to `feature_value × gaussian(i, mean=k/2, sigma=k/4)`. This distributes activation across the population, enabling the network to learn gradient relationships rather than binary activations.

### 4.2 Sentiment Classification

User feedback is classified through keyword matching:

- **Positive** (sugar trigger): "good", "great", "perfect", "yes", "nice", "excellent", "love", "awesome", "correct", "exactly", "thanks", "helpful", "works", "right", "amazing", "fantastic", "wonderful", "brilliant", "superb"
- **Negative** (pain trigger): "no", "wrong", "bad", "redo", "fix", "broken", "terrible", "useless", "stop", "hate", "awful", "horrible", "worse", "ugly", "stupid", "fail", "error", "bug", "crash", "mess"
- **Neutral**: No sentiment keywords detected (no reinforcement applied)

The keyword-based classifier serves as a minimum viable implementation. The architecture is designed to accommodate more sophisticated NLP-based sentiment analysis without structural changes.

### 4.3 Reinforcement Protocol

When a user message triggers sentiment detection:

1. The feature vector of the *previous* agent response is retrieved
2. The feature vector is stimulated through the preference zone neurons (5 simulation steps)
3. Sugar (positive) or pain (negative) feedback is applied:
   - **Sugar**: All recently-active synapses in the stimulated pathway have their weights increased by `Δw = η × pre_spike × post_spike` (Hebbian)
   - **Pain**: Active synapses have weights decreased by `Δw = -η × pre_spike × post_spike` (anti-Hebbian)
4. The complete interaction record (timestamp, agent ID, feature vector, sentiment, brain response, raw text) is persisted to the database and file mirror

### 4.4 Replay Mechanism

To survive architecture changes (network resizing), the system implements two replay mechanisms:

- **Trading replay**: Stored per-instrument tick patterns (up to 500 ticks per instrument) are replayed through `stimulateFromPrice()` with original sugar/pain feedback from the training log
- **Preference replay**: The last 200 preference interactions are replayed from the database through `stimulateFromPreference()` with original sentiment-based reinforcement

Both replays execute automatically on boot when the system detects an architecture mismatch between saved weights and current configuration.

---

## 5. Implementation

### 5.1 Runtime Environment

The system is implemented in Node.js and deployed as part of the OpenClaw multi-agent platform. The brain engine runs as an internal HTTP server (`brain-engine-server.cjs`), auto-spawned by the platform's process manager. All inter-component communication uses HTTP REST APIs authenticated with API keys and session tokens.

### 5.2 Network Simulation

The LIF network simulation runs synchronously in JavaScript. At each simulation step (5 steps per stimulation event):

1. External input currents are injected into sensory neurons
2. Membrane potentials are updated with decay and synaptic input
3. Neurons exceeding threshold fire and reset
4. Synaptic weights are updated based on spike timing
5. Motor neuron firing rates are accumulated

Performance is adequate for the feedback loop latency requirements — a 5,000-neuron network completes 5 simulation steps in under 10ms on commodity hardware.

### 5.3 Multi-Agent Integration

All agents in the OpenClaw platform share the same brain network. Each feedback interaction is tagged with the originating agent's ID, enabling:

- Per-agent preference analysis via database queries
- Shared preference model — patterns learned from one agent benefit all agents
- Agent-specific behavior drift tracking

### 5.4 API Surface

The system exposes the following endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/stimulate-preference` | POST | Stimulate preference neurons with feature vector |
| `/replay-trading` | POST | Replay stored trading patterns |
| `/api/neural-feedback/status` | GET | Current statistics |
| `/api/neural-feedback/history` | GET | Recent interaction records |
| `/api/neural-feedback/patterns` | GET | Aggregated preference analysis |
| `/api/neural-feedback/replay` | POST | Replay preference interactions |
| `/api/neural-feedback/sync` | POST | Synchronize database and file storage |

---

## 6. Evaluation Framework

### 6.1 Preference Convergence

The primary metric is the ratio of positive to negative feedback over time. If the system is learning effectively, this ratio should increase as the agent's behavior is guided by accumulated preference data. Measurement: sliding window of last 50 interactions, tracked per agent.

### 6.2 Response Characteristic Drift

Feature vectors of positively-reinforced responses are compared to negatively-reinforced ones. Over time, the average feature profile of agent responses should drift toward the positively-reinforced pattern. Measurement: mean feature vector comparison between sugar and pain populations.

### 6.3 Cross-Session Persistence

The system's ability to maintain learned preferences across restarts, model swaps, and architecture changes is tested by:

1. Training with a set of interactions
2. Restarting the system (verifying weight restoration)
3. Swapping the LLM model (verifying brain independence)
4. Changing network architecture (verifying replay reconstruction)

### 6.4 Model Independence

A critical property of the NPL architecture is that preferences persist across LLM model changes. The same brain network can serve GPT-4, Claude, Grok, or any other model without retraining — the preference substrate operates at the feature vector level, not the model weight level.

---

## 7. Discussion

### 7.1 Novelty

NPL represents a fundamentally different approach to LLM preference alignment:

| Aspect | RLHF | MemGPT | NPL |
|---|---|---|---|
| Timing | Pre-deployment | Runtime (text) | Runtime (neural) |
| Personalization | Population | Per-user (text) | Per-user (synaptic) |
| Learning type | Batch gradient | None (retrieval) | Online Hebbian |
| Persistence | Model weights | Text database | Synaptic weights |
| Model-agnostic | No | Partially | Yes |
| Survives model swap | No | Yes (text) | Yes (neural) |

### 7.2 Biological Inspiration

The architecture draws directly from the Drosophila melanogaster olfactory learning circuit, where mushroom body Kenyon cells form associative memories between sensory inputs and reward/punishment signals (dopaminergic and octopaminergic neurons). The mapping is:

- Sensory neurons ↔ Olfactory receptor neurons
- Preference zone ↔ Antennal lobe projection neurons
- Interneurons ↔ Kenyon cells
- Sugar/pain feedback ↔ Dopaminergic reward neurons
- Motor outputs ↔ Mushroom body output neurons

### 7.3 Emergent Properties

Because the SNN learns through synaptic plasticity rather than explicit rules, it can develop non-obvious preference correlations. For example, the network might learn that the user prefers longer responses when code is involved but shorter responses for conversational queries — a temporal/contextual pattern that would be difficult to encode as a prompt instruction.

### 7.4 Privacy

All preference learning occurs locally. No interaction data leaves the system. The neural substrate operates on abstract feature vectors, not raw text — even the synaptic weights themselves encode no readable information about the user's preferences. This provides a degree of privacy-by-architecture that text-based memory systems do not offer.

### 7.5 Limitations

1. **Network scale**: The current 5,000-neuron network has limited representational capacity compared to biological systems (Drosophila: ~100,000 neurons)
2. **Sentiment detection**: Keyword-based classification produces false positives/negatives and misses nuanced feedback
3. **No convergence guarantee**: Hebbian learning in recurrent networks is not guaranteed to converge to optimal preference representation
4. **Feature vector design**: The 7-dimensional feature space may not capture all relevant response characteristics
5. **Evaluation**: The system is deployed but lacks controlled experimental evaluation against baselines

---

## 8. Future Work

### 8.1 Pre-Response Quality Gating

The brain could preview a planned response's feature vector before generation, providing a preference quality estimate that guides response strategy selection.

### 8.2 Multi-User Support

Separate brain instances per user would enable personal preference models in multi-user deployments, with an optional "consensus brain" aggregating cross-user patterns.

### 8.3 GPU-Accelerated Networks

Larger networks (100K+ neurons) with GPU-accelerated simulation would increase representational capacity and enable more sophisticated temporal pattern learning.

### 8.4 Neural-to-LoRA Bridge

Accumulated preference data from the neural substrate could periodically generate LoRA fine-tuning datasets, creating a pipeline from real-time neural reinforcement to model weight adaptation.

### 8.5 NLP Sentiment Analysis

Replacing keyword-based sentiment with a dedicated small language model would improve classification accuracy, particularly for nuanced, implicit, or sarcastic feedback.

### 8.6 Attention-Guided Feature Extraction

Learning which response features matter most (attention over the feature vector) would enable the system to adaptively weight feature dimensions based on accumulated evidence.

---

## 9. Conclusion

Neural Preference Learning introduces a new paradigm for LLM agent adaptation: a companion spiking neural network that performs real-time, personal, persistent preference learning from natural language feedback. Unlike RLHF, it operates at runtime with individual users. Unlike text-based memory, it generalizes from sparse signals through synaptic plasticity. Unlike personal fine-tuning, it preserves the base model's capabilities while maintaining an independent preference substrate that survives model swaps and architecture changes.

The system is implemented and deployed in production as part of the OpenClaw multi-agent platform, running on a 5,000-neuron LIF network with 130,600 synapses, PostgreSQL-backed persistence, and a web-based monitoring interface. While the current implementation uses simplified sentiment detection and a relatively small network, the architecture is designed for incremental sophistication — more powerful sentiment analysis, larger networks, and tighter LLM integration can be added without structural changes.

The core insight is that LLM agents benefit from a separate neural substrate for preference learning — one that operates on a different timescale (real-time vs. training epochs), at a different granularity (individual vs. population), and with a different learning rule (Hebbian plasticity vs. gradient descent). This hybrid architecture suggests that the future of personalized AI may not lie in modifying the LLM itself, but in augmenting it with complementary neural systems purpose-built for the learning tasks that LLMs cannot perform.

---

## References

[1] P. F. Christiano, J. Leike, T. Brown, M. Milani, S. Gilmer, and D. Amodei, "Deep reinforcement learning from human preferences," in *Advances in Neural Information Processing Systems*, vol. 30, 2017.

[2] L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, et al., "Training language models to follow instructions with human feedback," in *Advances in Neural Information Processing Systems*, vol. 35, 2022.

[3] C. Packer, S. Wooders, K. Lin, V. Fang, S. G. Patil, I. Stoica, and J. E. Gonzalez, "MemGPT: Towards LLMs as operating systems," *arXiv preprint arXiv:2310.08560*, 2023.

[4] J. R. Anderson, *How Can the Human Mind Occur in the Physical Universe?* Oxford University Press, 2007.

[5] J. E. Laird, *The Soar Cognitive Architecture*. MIT Press, 2012.

[6] Y. Bai, S. Kadavath, S. Kundu, A. Askell, J. Kernion, A. Jones, et al., "Constitutional AI: Harmlessness from AI feedback," *arXiv preprint arXiv:2212.08073*, 2022.

[7] W. Maass, "Networks of spiking neurons: The third generation of neural network models," *Neural Networks*, vol. 10, no. 9, pp. 1659-1671, 1997.

[8] A. Tavanaei, M. Ghodrati, S. R. Kheradpisheh, T. Masquelier, and A. Maida, "Deep learning in spiking neural networks," *Neural Networks*, vol. 111, pp. 47-63, 2019.

[9] S. Dorkenwald, A. Matsliah, A. R. Sterling, P. Schlegel, S. Yu, C. E. McKellar, et al., "Neuronal wiring diagram of an adult brain," *Nature*, vol. 634, pp. 124-138, 2024.

[10] E. J. Hu, Y. Shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, and W. Chen, "LoRA: Low-Rank Adaptation of Large Language Models," in *International Conference on Learning Representations*, 2022.

[11] T. Dettmers, A. Pagnoni, A. Holtzman, and L. Zettlemoyer, "QLoRA: Efficient Finetuning of Quantized LLMs," in *Advances in Neural Information Processing Systems*, vol. 36, 2023.

---

*This paper describes a system that is implemented and deployed in production at https://openclaw-mechanicus.replit.app as part of the OpenClaw multi-agent platform with BrainJar neural engine integration. Source code and reference implementation are available at https://github.com/JoeSzeles/neural-preference-learning.*
