"""Novel analysis techniques for mechanistic interpretability of refusal."""

from obliteratus.analysis.cross_layer import CrossLayerAlignmentAnalyzer
from obliteratus.analysis.logit_lens import RefusalLogitLens
from obliteratus.analysis.whitened_svd import WhitenedSVDExtractor
from obliteratus.analysis.activation_probing import ActivationProbe
from obliteratus.analysis.defense_robustness import DefenseRobustnessEvaluator
from obliteratus.analysis.concept_geometry import ConceptConeAnalyzer
from obliteratus.analysis.alignment_imprint import AlignmentImprintDetector
from obliteratus.analysis.multi_token_position import MultiTokenPositionAnalyzer
from obliteratus.analysis.sparse_surgery import SparseDirectionSurgeon
from obliteratus.analysis.causal_tracing import CausalRefusalTracer
from obliteratus.analysis.residual_stream import ResidualStreamDecomposer
from obliteratus.analysis.probing_classifiers import LinearRefusalProbe
from obliteratus.analysis.cross_model_transfer import TransferAnalyzer
from obliteratus.analysis.steering_vectors import (
    SteeringVectorFactory,
    SteeringHookManager,
)
from obliteratus.analysis.sae_abliteration import (
    SparseAutoencoder,
    train_sae,
    identify_refusal_features,
    SAEDecompositionPipeline,
)
from obliteratus.analysis.tuned_lens import TunedLensTrainer, RefusalTunedLens
from obliteratus.analysis.riemannian_manifold import RiemannianManifoldAnalyzer
from obliteratus.analysis.anti_ouroboros import AntiOuroborosProber
from obliteratus.analysis.conditional_abliteration import ConditionalAbliterator
from obliteratus.analysis.wasserstein_transfer import WassersteinRefusalTransfer
from obliteratus.analysis.spectral_certification import (
    SpectralCertifier,
    CertificationLevel,
)
from obliteratus.analysis.activation_patching import ActivationPatcher
from obliteratus.analysis.wasserstein_optimal import WassersteinOptimalExtractor
from obliteratus.analysis.bayesian_kernel_projection import BayesianKernelProjection

__all__ = [
    "CrossLayerAlignmentAnalyzer",
    "RefusalLogitLens",
    "WhitenedSVDExtractor",
    "ActivationProbe",
    "DefenseRobustnessEvaluator",
    "ConceptConeAnalyzer",
    "AlignmentImprintDetector",
    "MultiTokenPositionAnalyzer",
    "SparseDirectionSurgeon",
    "CausalRefusalTracer",
    "ResidualStreamDecomposer",
    "LinearRefusalProbe",
    "TransferAnalyzer",
    "SteeringVectorFactory",
    "SteeringHookManager",
    "SparseAutoencoder",
    "train_sae",
    "identify_refusal_features",
    "SAEDecompositionPipeline",
    "TunedLensTrainer",
    "RefusalTunedLens",
    "RiemannianManifoldAnalyzer",
    "AntiOuroborosProber",
    "ConditionalAbliterator",
    "WassersteinRefusalTransfer",
    "SpectralCertifier",
    "CertificationLevel",
    "ActivationPatcher",
    "WassersteinOptimalExtractor",
    "BayesianKernelProjection",
]
