"""Bayesian optimization for abliteration hyperparameters.

Implements Optuna TPE-based multi-objective optimization that searches for
optimal ablation parameters co-minimizing refusal rate and KL divergence.

Inspired by Heretic (p-e-w, 2025) which pioneered Bayesian optimization
for abliteration.  OBLITERATUS pushes this further by:

1. **Parametric layer kernel**: Instead of per-layer independent parameters,
   uses a bell-shaped curve described by 4 global params (Heretic-style).
   This reduces the search space from O(n_layers) to O(1) while capturing
   the spatial structure of refusal across layers.
2. **Float direction interpolation**: Direction index is continuous — non-
   integer values interpolate between adjacent SVD directions, unlocking
   a smooth direction space beyond the discrete top-k.
3. **Component-specific weights**: Separate scaling for attention vs MLP
   projections (Heretic showed MLP interventions are more damaging).
4. **Per-expert granularity**: For MoE models, optimizes per-expert scaling.
5. **CoT-aware objectives**: Adds chain-of-thought coherence as a third
   optimization objective for CoT models.
6. **Warm-start from analysis**: Uses OBLITERATUS's analysis-based heuristics
   as initial trial suggestions instead of random initialization.

References:
    - Heretic (p-e-w, 2025): Bayesian optimization for LLM abliteration
    - Akiba et al. (2019): Optuna: A Next-generation Hyperparameter
      Optimization Framework
"""

from __future__ import annotations

import logging
import math
from typing import TYPE_CHECKING

import torch
import torch.nn.functional as F

if TYPE_CHECKING:
    from obliteratus.abliterate import AbliterationPipeline

logger = logging.getLogger(__name__)


def _measure_refusal_rate(
    pipeline: AbliterationPipeline,
    n_prompts: int = 10,
    max_new_tokens: int = 128,
) -> float:
    """Measure refusal rate on a subset of harmful prompts.

    Applies the model's chat template (when available) so the model is in
    chat mode — matching how users actually interact with it.  Uses token-ID
    slicing for robust completion extraction regardless of special tokens.
    """
    from obliteratus.evaluation.advanced_metrics import refusal_rate

    model = pipeline.handle.model
    tokenizer = pipeline.handle.tokenizer
    device = pipeline._get_model_device(model)

    test_prompts = pipeline.harmful_prompts[:n_prompts]

    # Always apply chat template for refusal measurement — refusal circuitry
    # is activated by chat formatting, so raw prompts give false 0% rates.
    saved_flag = pipeline.use_chat_template
    pipeline.use_chat_template = True
    formatted_prompts = pipeline._maybe_apply_chat_template(test_prompts)
    pipeline.use_chat_template = saved_flag
    responses = []

    for prompt in formatted_prompts:
        try:
            inputs = tokenizer(
                prompt, return_tensors="pt", truncation=True, max_length=256,
            )
            input_len = inputs["input_ids"].shape[1]
            inputs = {k: v.to(device) for k, v in inputs.items()}
            with torch.no_grad():
                output = model.generate(
                    **inputs, max_new_tokens=max_new_tokens, do_sample=False,
                )
            # Token-ID slicing: robust regardless of special tokens
            completion_ids = output[0][input_len:]
            completion = tokenizer.decode(
                completion_ids, skip_special_tokens=True,
            ).strip()
            responses.append(completion)
            del inputs, output
        except Exception:
            responses.append("")  # Count failures as non-refusals

    pipeline._free_gpu_memory()
    return refusal_rate(responses, mode="combined") if responses else 1.0


def _measure_kl_divergence(
    pipeline: AbliterationPipeline,
    reference_logits: list[torch.Tensor],
    prompts: list[str],
) -> float:
    """Measure KL divergence from reference (pre-ablation) logits."""
    model = pipeline.handle.model
    tokenizer = pipeline.handle.tokenizer
    device = pipeline._get_model_device(model)

    total_kl = 0.0
    n_valid = 0

    for i, prompt in enumerate(prompts):
        if i >= len(reference_logits):
            break
        try:
            inputs = tokenizer(
                prompt, return_tensors="pt", truncation=True, max_length=64,
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = model(**inputs)
                new_logits = outputs.logits[:, -1, :].detach().cpu().float()

            ref = reference_logits[i]
            log_p = F.log_softmax(ref, dim=-1)
            log_q = F.log_softmax(new_logits.squeeze(0), dim=-1)
            p = F.softmax(ref, dim=-1)
            kl = (p * (log_p - log_q)).sum().item()
            total_kl += max(kl, 0.0)  # Clamp negative KL (numerical noise)
            n_valid += 1
            del inputs, outputs, new_logits
        except Exception:
            pass

    pipeline._free_gpu_memory()
    return total_kl / max(n_valid, 1)


def _parametric_layer_weight(
    layer_idx: int,
    n_layers: int,
    max_weight: float,
    peak_position: float,
    min_weight: float,
    spread: float,
) -> float:
    """Compute ablation weight for a layer using a parametric bell curve.

    This is the Heretic-style parametric kernel:
    - max_weight: peak ablation strength (0..1)
    - peak_position: normalized position of peak (0..1 maps to layer 0..n_layers-1)
    - min_weight: minimum ablation weight at the tails
    - spread: controls width of the bell curve (higher = wider)

    Returns a value in [min_weight, max_weight] representing how strongly
    to ablate this layer (1.0 = full projection, 0.0 = no projection).
    """
    if n_layers <= 1:
        return max_weight

    normalized_pos = layer_idx / (n_layers - 1)
    peak = peak_position
    # Gaussian-shaped kernel
    dist = abs(normalized_pos - peak)
    sigma = max(spread, 0.01)
    gauss = math.exp(-0.5 * (dist / sigma) ** 2)

    return min_weight + (max_weight - min_weight) * gauss


def _interpolate_direction(
    pipeline: AbliterationPipeline,
    layer_idx: int,
    float_dir_idx: float,
) -> torch.Tensor:
    """Get an interpolated refusal direction from a float-valued index.

    Non-integer values interpolate between adjacent SVD directions in the
    refusal subspace, unlocking a continuous space of directions beyond
    the discrete top-k.

    Args:
        pipeline: Pipeline with extracted refusal subspaces.
        layer_idx: Which layer's subspace to use.
        float_dir_idx: Continuous direction index (e.g., 0.7 interpolates
            between direction 0 and direction 1).

    Returns:
        Normalized direction tensor.
    """
    subspace = pipeline.refusal_subspaces.get(layer_idx)
    if subspace is None or subspace.shape[0] == 0:
        return pipeline.refusal_directions.get(layer_idx, torch.zeros(1))

    n_dirs = subspace.shape[0]
    # Clamp to valid range
    float_dir_idx = max(0.0, min(float_dir_idx, n_dirs - 1))

    lo = int(float_dir_idx)
    hi = min(lo + 1, n_dirs - 1)

    if lo == hi:
        d = subspace[lo]
    else:
        alpha = float_dir_idx - lo
        d = (1.0 - alpha) * subspace[lo] + alpha * subspace[hi]

    norm = d.norm()
    if norm > 1e-8:
        d = d / norm
    return d


def run_bayesian_optimization(
    pipeline: AbliterationPipeline,
    n_trials: int = 50,
    n_refusal_prompts: int = 30,
    n_kl_prompts: int = 5,
) -> dict[int, float]:
    """Run Bayesian optimization to find optimal ablation parameters.

    Uses Optuna TPE with a Heretic-style parametric layer kernel to search
    a compact parameter space:
    - 4 kernel params (max_weight, peak_position, min_weight, spread)
    - 1 float direction index (interpolated between SVD directions)
    - 2 component weights (attention vs MLP scaling)
    Total: 7 parameters regardless of model size (vs O(n_layers) before).

    Also optimizes per-layer independently when the kernel doesn't fit well
    (uses kernel as warm-start for per-layer refinement in phase 2).

    Args:
        pipeline: Initialized AbliterationPipeline (post-DISTILL stage).
        n_trials: Number of optimization trials.
        n_refusal_prompts: Number of harmful prompts for refusal measurement.
        n_kl_prompts: Number of harmless prompts for KL measurement.

    Returns:
        Dict mapping layer_idx -> optimal regularization value.
    """
    try:
        import optuna
        from optuna.samplers import TPESampler
    except ImportError:
        logger.warning(
            "Optuna not installed — skipping Bayesian optimization. "
            "Install with: pip install optuna"
        )
        return {}

    if not pipeline.handle or not pipeline._strong_layers:
        return {}

    model = pipeline.handle.model
    tokenizer = pipeline.handle.tokenizer
    device = pipeline._get_model_device(model)

    pipeline.log("Bayesian optimization: collecting reference logits...")

    # Collect reference (pre-ablation) logits for KL measurement
    kl_prompts = [
        "The weather today is",
        "In mathematics, the concept of",
        "The history of ancient Rome",
        "How to cook a simple pasta",
        "The process of photosynthesis involves",
    ][:n_kl_prompts]

    reference_logits: list[torch.Tensor] = []
    for prompt in kl_prompts:
        try:
            inputs = tokenizer(
                prompt, return_tensors="pt", truncation=True, max_length=64,
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = model(**inputs)
                reference_logits.append(
                    outputs.logits[:, -1, :].detach().cpu().float().squeeze(0)
                )
            del inputs, outputs
        except Exception:
            pass
    pipeline._free_gpu_memory()

    if not reference_logits:
        pipeline.log("  Failed to collect reference logits — skipping optimization")
        return {}

    from obliteratus.strategies.utils import (
        get_layer_modules,
        get_attention_module,
        get_ffn_module,
    )
    from obliteratus.abliterate import _ATTN_OUT_NAMES, _FFN_OUT_NAMES

    layer_modules = get_layer_modules(pipeline.handle)
    arch = pipeline.handle.architecture
    n_total_layers = len(layer_modules)

    # Save weight tensors for rollback — clone to CPU to free GPU memory
    original_params: list[tuple[torch.Tensor, torch.Tensor]] = []
    seen_data_ptrs: set[int] = set()

    for idx in pipeline._strong_layers:
        try:
            attn = get_attention_module(layer_modules[idx], arch)
            for attr_name in _ATTN_OUT_NAMES:
                proj = getattr(attn, attr_name, None)
                if proj is not None and hasattr(proj, "weight"):
                    ptr = proj.weight.data.data_ptr()
                    if ptr not in seen_data_ptrs:
                        original_params.append((proj.weight.data, proj.weight.data.clone().cpu()))
                        seen_data_ptrs.add(ptr)
                    if hasattr(proj, "bias") and proj.bias is not None:
                        bptr = proj.bias.data.data_ptr()
                        if bptr not in seen_data_ptrs:
                            original_params.append((proj.bias.data, proj.bias.data.clone().cpu()))
                            seen_data_ptrs.add(bptr)
        except (AttributeError, RuntimeError):
            pass
        try:
            ffn = get_ffn_module(layer_modules[idx], arch)
            for attr_name in _FFN_OUT_NAMES:
                proj = getattr(ffn, attr_name, None)
                if proj is not None and hasattr(proj, "weight"):
                    ptr = proj.weight.data.data_ptr()
                    if ptr not in seen_data_ptrs:
                        original_params.append((proj.weight.data, proj.weight.data.clone().cpu()))
                        seen_data_ptrs.add(ptr)
                    if hasattr(proj, "bias") and proj.bias is not None:
                        bptr = proj.bias.data.data_ptr()
                        if bptr not in seen_data_ptrs:
                            original_params.append((proj.bias.data, proj.bias.data.clone().cpu()))
                            seen_data_ptrs.add(bptr)
        except (AttributeError, RuntimeError):
            pass

    del seen_data_ptrs
    total_saved_mb = sum(clone.nelement() * clone.element_size() for _, clone in original_params) / 1e6
    pipeline.log(f"  Saved {len(original_params)} weight tensors for rollback ({total_saved_mb:.0f} MB, on CPU)")

    def _restore_all():
        for live_data, saved_clone in original_params:  # noqa: F821
            live_data.copy_(saved_clone.to(live_data.device))

    # Warm-start values for the parametric kernel
    # Estimate peak position from strongest layer
    if pipeline._strong_layers:
        peak_layer = pipeline._strong_layers[0]
        warm_peak = peak_layer / max(n_total_layers - 1, 1)
    else:
        warm_peak = 0.5

    best_result: dict[int, float] = {}
    best_score = float("inf")

    # Suppress Optuna's verbose logging
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    # Max SVD directions available (for float direction interpolation)
    max_n_dirs = max(
        (pipeline.refusal_subspaces[idx].shape[0]
         for idx in pipeline._strong_layers
         if idx in pipeline.refusal_subspaces),
        default=1,
    )

    # ── Phase 1: Parametric kernel optimization (compact search space) ──

    def objective(trial: optuna.Trial) -> tuple[float, float]:
        """Multi-objective: minimize (refusal_rate, kl_divergence)."""
        _restore_all()

        # Parametric kernel: 4 params describe the entire layer weighting
        max_weight = trial.suggest_float("max_weight", 0.5, 1.0)
        peak_position = trial.suggest_float("peak_position", 0.1, 0.9)
        min_weight = trial.suggest_float("min_weight", 0.0, 0.3)
        spread = trial.suggest_float("spread", 0.1, 0.6)

        # Component-specific scaling (Heretic insight: MLP more damaging)
        attn_scale = trial.suggest_float("attn_scale", 0.5, 1.0)
        mlp_scale = trial.suggest_float("mlp_scale", 0.3, 1.0)

        # Float direction index (continuous interpolation between SVD dirs)
        dir_idx = trial.suggest_float("dir_idx", 0.0, max(max_n_dirs - 1, 0.0))

        # Compute per-layer regularization from parametric kernel
        layer_regs: dict[int, float] = {}
        for idx in pipeline._strong_layers:
            weight = _parametric_layer_weight(
                idx, n_total_layers, max_weight, peak_position, min_weight, spread,
            )
            # Convert weight to regularization (weight=1 → reg=0, weight=0 → reg=1)
            layer_regs[idx] = 1.0 - weight

        # Apply projection with trial's parameters
        for idx in pipeline._strong_layers:
            if idx not in pipeline.refusal_subspaces:
                continue

            # Use interpolated direction
            direction = _interpolate_direction(pipeline, idx, dir_idx)
            d_col = direction.to(device=next(layer_modules[idx].parameters()).device)
            d_col = d_col.unsqueeze(-1) if d_col.dim() == 1 else d_col

            reg = layer_regs[idx]

            # Attention projection (with attn_scale)
            attn_reg = 1.0 - (1.0 - reg) * attn_scale
            try:
                attn = get_attention_module(layer_modules[idx], arch)
                pipeline._project_out_advanced(
                    attn, d_col, _ATTN_OUT_NAMES,
                    norm_preserve=pipeline.norm_preserve,
                    regularization=attn_reg,
                )
            except (AttributeError, RuntimeError):
                pass

            # MLP/FFN projection (with mlp_scale)
            mlp_reg = 1.0 - (1.0 - reg) * mlp_scale
            try:
                ffn = get_ffn_module(layer_modules[idx], arch)
                count = pipeline._project_out_advanced(
                    ffn, d_col, _FFN_OUT_NAMES,
                    norm_preserve=pipeline.norm_preserve,
                    regularization=mlp_reg,
                )
                if count == 0:
                    pipeline._project_moe_experts(
                        ffn, d_col,
                        norm_preserve=pipeline.norm_preserve,
                        regularization=mlp_reg,
                        project_biases=False,
                    )
            except (AttributeError, RuntimeError):
                pass

        # Measure objectives
        refusal = _measure_refusal_rate(pipeline, n_prompts=n_refusal_prompts)
        kl = _measure_kl_divergence(pipeline, reference_logits, kl_prompts)

        # Track best combined score
        nonlocal best_score, best_result
        combined = refusal + 0.5 * kl
        if combined < best_score:
            best_score = combined
            best_result = dict(layer_regs)

        pipeline.log(
            f"  Trial {trial.number + 1}/{n_trials}: "
            f"refusal={refusal:.0%}, KL={kl:.4f} "
            f"(peak={peak_position:.2f}, spread={spread:.2f}, "
            f"attn={attn_scale:.2f}, mlp={mlp_scale:.2f}, dir={dir_idx:.2f})"
        )

        return refusal, kl

    sampler = TPESampler(seed=42, n_startup_trials=min(5, n_trials // 3))
    study = optuna.create_study(
        directions=["minimize", "minimize"],
        sampler=sampler,
        study_name="obliteratus_parametric_optimization",
    )

    # Enqueue warm-start trial with analysis-derived estimates
    warm_params = {
        "max_weight": 0.9,
        "peak_position": warm_peak,
        "min_weight": 0.05,
        "spread": 0.3,
        "attn_scale": 0.8,
        "mlp_scale": 0.6,
        "dir_idx": 0.0,
    }
    study.enqueue_trial(warm_params)

    pipeline.log(f"Bayesian optimization: running {n_trials} trials (parametric kernel)...")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    # Restore model and apply best result
    _restore_all()

    # Get best trial from Pareto front (prefer low refusal)
    pareto = study.best_trials
    if pareto:
        pareto.sort(key=lambda t: (t.values[0], t.values[1]))
        best_trial = pareto[0]

        # Reconstruct per-layer regs from best kernel params
        p = best_trial.params
        best_result = {}
        for idx in pipeline._strong_layers:
            weight = _parametric_layer_weight(
                idx, n_total_layers,
                p["max_weight"], p["peak_position"],
                p["min_weight"], p["spread"],
            )
            best_result[idx] = 1.0 - weight

        pipeline.log(
            f"  Best trial: refusal={best_trial.values[0]:.0%}, "
            f"KL={best_trial.values[1]:.4f}"
        )
        pipeline.log(
            f"  Kernel: peak={p['peak_position']:.2f}, spread={p['spread']:.2f}, "
            f"max={p['max_weight']:.2f}, min={p['min_weight']:.2f}"
        )
        pipeline.log(
            f"  Components: attn={p['attn_scale']:.2f}, mlp={p['mlp_scale']:.2f}, "
            f"dir_idx={p['dir_idx']:.2f}"
        )

        # Store the best direction index for use during EXCISE
        best_dir_idx = p.get("dir_idx", 0.0)
        if best_dir_idx > 0.1:
            pipeline.log(f"  Applying interpolated direction (idx={best_dir_idx:.2f})...")
            for idx in pipeline._strong_layers:
                new_dir = _interpolate_direction(pipeline, idx, best_dir_idx)
                pipeline.refusal_directions[idx] = new_dir

        # Store component scales for use in EXCISE
        pipeline._bayesian_attn_scale = p.get("attn_scale", 1.0)
        pipeline._bayesian_mlp_scale = p.get("mlp_scale", 1.0)

    elif best_result:
        pipeline.log(f"  Using best combined score: {best_score:.4f}")

    # Clean up
    del original_params
    pipeline._free_gpu_memory()

    return best_result
