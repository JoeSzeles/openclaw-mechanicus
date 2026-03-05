# OBLITERATUS Pipeline Efficiency Audit

**Auditor perspective**: Shrewd CTO evaluating compute ROI, memory discipline, and time-to-value across all obliteration methods.

**Scope**: Every obliteration method in `abliterate.py` (8 primary methods + 4 baseline reproductions), the strategy layer (`strategies/`), the informed pipeline, Bayesian optimizer, and LoRA ablation.

---

## Executive Summary

OBLITERATUS has an impressively comprehensive pipeline, but several methods carry **significant hidden costs** that erode their value proposition. The worst offenders are:

1. **`_collect_activations` runs prompts one-at-a-time** — this is the single biggest throughput bottleneck in the entire system, costing 5-15x in wall-clock time during PROBE.
2. **Bayesian `optimized` mode clones ALL strong-layer weights to CPU** for rollback, then runs 50 full forward+generate passes — the memory and compute overhead can exceed the rest of the pipeline combined.
3. **`true_iterative_refinement` re-runs the entire PROBE+DISTILL pipeline** per refinement pass with zero early-stopping — 3 passes in `aggressive` triples probe cost even when pass 2 achieves negligible improvement.
4. **SAE training on CPU** is needlessly slow for GPU-resident models.

Below is the method-by-method breakdown.

---

## Stage-Level Audit

### Stage 1: SUMMON (Model Loading)

**Status**: Acceptable. Uses `load_model` with quantization support and `expandable_segments` CUDA config. No issues.

### Stage 2: PROBE (`_collect_activations`)

| Issue | Severity | Impact |
|-------|----------|--------|
| **Single-prompt forward passes** (`abliterate.py:1074`) | CRITICAL | Each of 512+ harmful/harmless prompts triggers a separate `model(**inputs)` call. No batching. On a 7B model with 512 pairs, this means ~1024 sequential forward passes instead of ~32 batched passes (batch_size=32). Estimated 5-15x slowdown. |
| **`_free_gpu_memory()` called after EVERY prompt** (`abliterate.py:1086`) | HIGH | `gc.collect()` + `torch.cuda.empty_cache()` 1024 times is expensive — the Python GC full-collection alone adds measurable overhead at this frequency. Should be called every N prompts, not every single one. |
| **Chat template applied per-prompt in a Python loop** (`abliterate.py:955-965`) | MODERATE | `tokenizer.apply_chat_template()` called individually 1024 times. Should batch. |
| **Jailbreak probing doubles cost** when `use_jailbreak_contrast=True` | MODERATE | Adds a third full pass over all prompts. Justified by the quality improvement, but the lack of batching amplifies the cost 3x instead of 1.5x. |
| **Router profiling hooks zero-cost claim is correct** (`abliterate.py:872`) | OK | Hooks piggyback on existing forward passes. Good design. |

**Recommendation**: Batch `_collect_activations`. Tokenize all prompts, pad to equal length per micro-batch, run batched `model(**inputs)`. Expected 5-10x speedup with zero quality loss. Reduce `_free_gpu_memory()` frequency to every 32-64 prompts.

### Stage 3: DISTILL (`_distill`)

| Issue | Severity | Impact |
|-------|----------|--------|
| **Full SVD on per-prompt diff matrix** (`abliterate.py:1226`) | MODERATE | `torch.linalg.svd(diff_matrix, full_matrices=False)` on a `(512, hidden_dim)` matrix per layer. For 32 layers this is 32 SVD calls, each O(min(m,n)^2 * max(m,n)). At hidden_dim=4096, each is ~100ms on CPU. Total: ~3s. Acceptable for the quality gain. |
| **Whitened SVD import is lazy** (`abliterate.py:1127`) | OK | Good — only imports when needed. No cost for basic/advanced. |
| **Wasserstein extraction** (`abliterate.py:1136`) | OK | Falls back gracefully. The GEP solve is lightweight. |
| **RDO gradient optimization: 500 steps per layer** (`abliterate.py:1427`) | HIGH | For 20 strong layers, that's 10,000 Adam steps. Each step involves a matrix multiply on `(n_prompts, hidden_dim)` tensors. On CPU this takes 30-60s. The 500-step budget is a "practical compromise" per the comments, but the SVD warm-start means most directions converge in ~100 steps. **No early stopping.** |
| **Gram-Schmidt re-orthogonalization is O(k^2)** per layer (`abliterate.py:1168-1173`) | LOW | With k<=8, this is negligible. |
| **SAE training: 30 epochs on CPU** (`abliterate.py:1582`) | HIGH | `device="cpu"` is hardcoded. For hidden_dim=4096 and expansion=4, the SAE has 32M parameters. 30 epochs on CPU takes 15-45s per layer. With 20 strong layers, this is 5-15 minutes of wasted time when a GPU is available. |
| **Layer selection (knee + COSMIC fusion)** | OK | Lightweight statistical operations. No concern. |
| **CoT-aware orthogonalization** | OK | Single SVD per layer, simple vector operations. |
| **Jailbreak-contrastive blending** | OK | Pure vector arithmetic, negligible cost. |
| **Float-layer interpolation** | OK | Gaussian weight computation is trivial. |

**Recommendation**: (1) Add early-stopping to RDO at convergence (e.g., loss delta < 1e-4 for 20 consecutive steps). (2) Use GPU for SAE training when available — change `device="cpu"` to auto-detect.

### Stage 4: EXCISE (`_excise`)

| Issue | Severity | Impact |
|-------|----------|--------|
| **Rank-1 projection is memory-efficient** (`abliterate.py:3479-3480`) | OK | `W @ d` produces a vector, not a full projection matrix. This is the right approach. |
| **`true_iterative_refinement` re-runs PROBE+DISTILL** (`abliterate.py:2474-2485`) | CRITICAL | Each refinement pass re-collects all activations (512*2+ forward passes) and re-runs SVD. `aggressive` mode does 3 passes = 3x full pipeline cost. There is **no check** whether the refined directions materially differ from the previous pass. A cosine-similarity early-exit (e.g., all directions > 0.99 cosine with previous pass → stop) would save enormous compute on pass 3. |
| **Bayesian optimization clones ALL weight tensors** (`bayesian_optimizer.py:301-341`) | CRITICAL | For a 7B model with 20 strong layers, this can be 2-4 GB of CPU clones just for rollback. For a 70B model, this is 20-40 GB. The log even reports the size (`total_saved_mb`), but there's no memory check or fallback. |
| **Bayesian trials run full generate passes** (`bayesian_optimizer.py:445-446`) | CRITICAL | Each of 50 trials runs `_measure_refusal_rate` (8-30 generation calls with `max_new_tokens=128`) PLUS `_measure_kl_divergence` (5 forward passes). That's ~35 forward/generate passes per trial × 50 trials = **1,750 forward passes** just for hyperparameter search. This likely dominates the total pipeline runtime for `optimized` and `heretic` modes. |
| **KL optimization proxy is cheap** (`abliterate.py:3057-3268`) | OK | Uses projection magnitude as a KL proxy instead of actual per-layer forward passes. Good engineering — avoids the expensive per-layer ablation/measurement loop. |
| **Norm preservation adds one extra `.norm()` per weight matrix** | LOW | Frobenius norm is O(n) — negligible overhead. |
| **Dequantize/re-quantize for bitsandbytes** (`abliterate.py:3287-3400`) | MODERATE | Necessary for correctness, but the full dequantize → modify → re-quantize cycle per weight matrix is expensive for 4-bit models. Consider caching the dequantized tensor when projecting multiple directions through the same weight. |
| **Safety-neuron masking** | LOW | Z-score computation is a single pass over the projection vector. Cheap. |
| **Expert transplant uses incremental mean** (`abliterate.py:4350-4364`) | OK | Welford-style running mean avoids materializing all expert weights. Good memory discipline for 400B-scale models. |
| **`_stabilize_router_weights` called after every MoE layer** (`abliterate.py:3866`) | LOW | Clamps router weights. Trivial cost. |

**Recommendation**: (1) Add direction-convergence early-exit to iterative refinement. (2) Reduce Bayesian trial count or implement batch generation for refusal measurement. (3) Cache dequantized weights across multi-direction projection within the same layer.

### Stage 5: VERIFY (`_verify`)

| Issue | Severity | Impact |
|-------|----------|--------|
| **30 generation calls for refusal measurement** (`abliterate.py:4622`) | MODERATE | Each generates up to 128 tokens with greedy decoding. For a 7B model this is ~30s total. Acceptable as a one-time quality check. |
| **`_tier_label` does `list.index()` per prompt** (`abliterate.py:4593`) | LOW | O(n) search in a list for each of 30 prompts. Trivially fixable with a dict, but the cost is negligible at n=512. |
| **Perplexity measurement on 3 short texts** | OK | Minimal cost. |

### Stage 6: REBIRTH (Model Saving)

Not audited in detail — standard HuggingFace `save_pretrained`. No efficiency concerns.

---

## Method-by-Method Efficiency Grades

| Method | Compute Cost | Memory Cost | Value/Cost Ratio | Grade |
|--------|-------------|-------------|-------------------|-------|
| **basic** | Low (1 dir, 1 pass, no extras) | Low | High | **A** |
| **advanced** | Moderate (4 dirs, 2 passes, norm-preserve, bias projection) | Moderate | High | **A-** |
| **aggressive** | High (8 dirs, 3 passes with `true_iterative_refinement`) | High (3x activation storage) | Moderate — 3rd pass rarely justified | **B-** |
| **informed** | High (runs analysis modules + Wasserstein GEP) | High (analysis module state) | High — analysis feedback is genuinely valuable | **B+** |
| **surgical** | Very High (SAE training + head surgery + EGA + neuron masking) | Very High | Moderate — many techniques compound but with diminishing returns | **C+** |
| **inverted** | Very High (surgical + reflection + SAE) | Very High | Niche — only needed for "actively compliant" use case | **C** |
| **optimized** | Extreme (50 Bayesian trials × 35 forward passes each) | Extreme (full weight clones + 1750 forward passes) | Low unless you have a multi-GPU cluster | **D+** |
| **nuclear** | Very High (inverted + layer-adaptive + expert transplant + steering hooks) | Very High | Highly specialized — justified only for stubborn MoE models | **C** |

### Baseline Reproductions

| Method | Compute Cost | Grade | Notes |
|--------|-------------|-------|-------|
| **failspy** | Low | **A** | Faithful minimal reproduction. Efficient by design. |
| **gabliteration** | Low-Moderate | **A-** | 4-dir SVD + ridge. Clean. |
| **heretic** | Extreme | **D** | Inherits Bayesian trial overhead. 50 trials × 35 passes each. |
| **rdo** | High | **B** | 500 gradient steps/layer. Would benefit from early-stopping. |

---

## Strategy Module Audit (`strategies/`)

| Strategy | Implementation | Grade |
|----------|---------------|-------|
| `embedding_ablation` | Clean zero-out by chunk. `torch.no_grad()` used correctly. | **A** |
| `ffn_ablation` | Iterates all FFN params and zeros. Fine for ablation study. | **A** |
| `head_pruning` | Handles GPT-2 Conv1D and standard Q/K/V separately. Correct. | **A-** |
| `layer_removal` | Zeros all params. Simple and correct. | **A** |
| `registry` | Minimal dict-based registry with decorator. No overhead. | **A** |
| `runner.py` | **Creates a new `Evaluator` per spec** (`runner.py:86-95`). This re-initializes dataset processing for every ablation spec. Should create once and reuse. | **B** |

---

## Cross-Cutting Concerns

### 1. Memory Management

- **Good**: `_free_gpu_memory()` exists and is called between stages. `expandable_segments` is set early.
- **Bad**: `_free_gpu_memory()` called 1024+ times during PROBE (once per prompt). The `gc.collect()` cost alone adds up.
- **Bad**: Bayesian optimizer clones all strong-layer weights with no memory budget check.
- **Bad**: No streaming/chunking for activation storage — all 512 prompts × 32 layers of activations are held in a list of CPU tensors simultaneously.

### 2. GPU Utilization

- **Good**: Adaptive `max_length` based on free GPU memory.
- **Good**: Rank-1 projections avoid materializing full projection matrices.
- **Bad**: SAE training hardcoded to CPU.
- **Bad**: Single-prompt forward passes waste GPU parallelism.
- **Bad**: No `torch.compile()` or `torch.inference_mode()` used anywhere (the latter is faster than `torch.no_grad()` for inference).

### 3. Quantization Handling

- **Good**: Detects bitsandbytes 4-bit/8-bit and dequantizes before projection.
- **Good**: Refuses to operate on raw quantized bytes (avoids silent corruption).
- **Moderate**: Full dequantize/re-quantize per direction per weight matrix. Could cache across multi-direction projections.

---

## Top 5 Recommendations (Ranked by Impact)

### 1. Batch `_collect_activations` (CRITICAL — 5-15x PROBE speedup)

```python
# Current: one prompt at a time
for i, prompt in enumerate(prompts):
    inputs = tokenizer(prompt, ...)
    model(**inputs)

# Proposed: micro-batched
for batch_start in range(0, len(prompts), batch_size):
    batch = prompts[batch_start:batch_start+batch_size]
    inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        model(**inputs)
```

Hooks need a minor adjustment to handle batch dimension, but the core change is ~20 lines.

### 2. Add early-stopping to `true_iterative_refinement` (HIGH — saves 1-2 full PROBE passes)

After re-distilling, compute cosine similarity between old and new refusal directions. If all directions are >0.99 cosine, skip remaining passes. Expected to save 30-60% of `aggressive` mode runtime.

### 3. Move SAE training to GPU (HIGH — 5-15 min saved for `surgical`/`inverted`)

Change `device="cpu"` to auto-detect available GPU. The SAE is small (32M params at expansion=4) and fits easily alongside the model.

### 4. Reduce Bayesian trial overhead (HIGH — saves 30-60 min for `optimized`)

Options:
- Reduce `n_refusal_prompts` from 8-30 to 4-6 (generation is expensive)
- Use perplexity-only as a faster proxy in early trials, switch to refusal measurement for top candidates
- Implement batch generation for `_measure_refusal_rate`

### 5. Add early-stopping to RDO (MODERATE — saves 10-30s for `rdo` mode)

Monitor loss convergence and break at plateau (delta < 1e-4 for 20 steps). Most directions converge in ~100-200 steps, not 500.

---

## Verdict

The pipeline is **architecturally sound** — the rank-1 projection math is correct and memory-efficient, the stage separation is clean, and the progressive method complexity (basic → nuclear) gives users clear cost/quality tradeoffs. However, the **PROBE stage bottleneck** (single-prompt forward passes) and **Bayesian trial overhead** (1750 forward passes) are the two elephants in the room. Fixing just recommendation #1 would make the entire system 3-5x faster for the majority of users who run basic/advanced/aggressive modes.

The `optimized` and `heretic` modes have a legitimate place for users with compute budget, but their current efficiency makes them impractical for anything under an A100. The documentation should be more explicit about expected runtimes.

**Overall system grade: B+** — excellent functionality, needs batching and early-stopping.
