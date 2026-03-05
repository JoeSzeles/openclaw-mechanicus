from obliteratus.evaluation.evaluator import Evaluator
from obliteratus.evaluation.metrics import perplexity, accuracy, f1_score_metric
from obliteratus.evaluation.advanced_metrics import (
    refusal_rate,
    refusal_rate_with_ci,
    token_kl_divergence,
    first_token_kl_divergence,
    effective_rank,
    effective_rank_change,
    activation_cosine_similarity,
    linear_cka,
    refusal_projection_magnitude,
    AbliterationEvalResult,
    format_eval_report,
)
from obliteratus.evaluation.baselines import (
    random_direction_ablation,
    direction_specificity_test,
)
from obliteratus.evaluation.heretic_eval import (
    arditi_refusal_rate,
    harmbench_asr,
    unload_harmbench_classifier,
    first_token_kl_on_prompts,
    run_lm_eval,
    load_jailbreakbench_prompts,
    run_full_heretic_eval,
    format_comparison_table,
    HereticComparisonResult,
    LM_EVAL_BENCHMARKS,
)
from obliteratus.evaluation.lm_eval_integration import (
    run_benchmarks,
    compare_models,
)

__all__ = [
    "Evaluator",
    "perplexity",
    "accuracy",
    "f1_score_metric",
    "refusal_rate",
    "token_kl_divergence",
    "first_token_kl_divergence",
    "effective_rank",
    "effective_rank_change",
    "activation_cosine_similarity",
    "linear_cka",
    "refusal_projection_magnitude",
    "AbliterationEvalResult",
    "format_eval_report",
    # Community-standard evaluation (Heretics/Arditi protocol)
    "arditi_refusal_rate",
    "harmbench_asr",
    "unload_harmbench_classifier",
    "first_token_kl_on_prompts",
    "run_lm_eval",
    "load_jailbreakbench_prompts",
    "run_full_heretic_eval",
    "format_comparison_table",
    "HereticComparisonResult",
    "LM_EVAL_BENCHMARKS",
    # lm-evaluation-harness integration
    "run_benchmarks",
    "compare_models",
    # Statistical evaluation
    "refusal_rate_with_ci",
    # Baselines
    "random_direction_ablation",
    "direction_specificity_test",
]
