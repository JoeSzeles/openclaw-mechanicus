"""Evaluation metrics for ablation studies."""

from __future__ import annotations

import math
from typing import Sequence

import torch
import torch.nn.functional as F
from sklearn.metrics import f1_score as sklearn_f1


def perplexity(logits: torch.Tensor, labels: torch.Tensor) -> float:
    """Compute perplexity from causal-LM logits and label token IDs.

    Args:
        logits: (batch, seq_len, vocab_size) — raw model output.
        labels: (batch, seq_len) — ground-truth token IDs (use -100 for padding).

    Returns:
        Scalar perplexity (lower is better).
    """
    # Shift so that tokens < n predict n
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()

    loss = F.cross_entropy(
        shift_logits.view(-1, shift_logits.size(-1)),
        shift_labels.view(-1),
        ignore_index=-100,
        reduction="mean",
    )
    return math.exp(loss.item())


def accuracy(predictions: Sequence[int], references: Sequence[int]) -> float:
    """Simple accuracy."""
    if len(predictions) == 0:
        return 0.0
    correct = sum(p == r for p, r in zip(predictions, references))
    return correct / len(predictions)


def f1_score_metric(
    predictions: Sequence[int],
    references: Sequence[int],
    average: str = "macro",
) -> float:
    """F1 score wrapper around sklearn."""
    return float(sklearn_f1(references, predictions, average=average, zero_division=0))
