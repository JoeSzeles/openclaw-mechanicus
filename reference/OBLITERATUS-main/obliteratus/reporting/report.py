"""Reporting and visualization for ablation runs."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd


def _sanitize_label(text: str, max_len: int = 80) -> str:
    """Strip filesystem paths, tokens, and overly-long strings from labels."""
    text = re.sub(r"(/[a-zA-Z0-9_./-]{3,})", lambda m: m.group(0).rsplit("/", 1)[-1], text)
    text = re.sub(r"\bhf_[A-Za-z0-9]{6,}\b", "<TOKEN>", text)
    text = re.sub(r"\b[0-9a-fA-F]{32,}\b", "<REDACTED>", text)
    if len(text) > max_len:
        text = text[: max_len - 3] + "..."
    return text


@dataclass
class AblationResult:
    """Result of a single ablation experiment."""

    strategy: str
    component: str
    description: str
    metrics: dict[str, float]
    metadata: dict[str, Any] | None = None


@dataclass
class AblationReport:
    """Collects results and produces tables / charts / exports."""

    model_name: str
    baseline_metrics: dict[str, float] = field(default_factory=dict)
    results: list[AblationResult] = field(default_factory=list)

    def add_baseline(self, metrics: dict[str, float]):
        self.baseline_metrics = metrics

    def add_result(self, result: AblationResult):
        self.results.append(result)

    def to_dataframe(self) -> pd.DataFrame:
        """Convert results to a pandas DataFrame with delta columns."""
        rows = []
        for r in self.results:
            row = {
                "strategy": r.strategy,
                "component": r.component,
                "description": r.description,
            }
            for metric_name, value in r.metrics.items():
                row[metric_name] = value
                baseline_val = self.baseline_metrics.get(metric_name)
                if baseline_val is not None:
                    row[f"{metric_name}_delta"] = value - baseline_val
                    if baseline_val != 0:
                        row[f"{metric_name}_pct_change"] = (
                            (value - baseline_val) / abs(baseline_val)
                        ) * 100
            rows.append(row)

        return pd.DataFrame(rows)

    def print_summary(self):
        """Print a rich-formatted summary table."""
        from rich.console import Console
        from rich.table import Table

        console = Console()
        df = self.to_dataframe()

        if df.empty:
            console.print("[yellow]No ablation results to display.[/yellow]")
            return

        table = Table(title=f"Ablation Results: {_sanitize_label(self.model_name)}")
        table.add_column("Strategy", style="cyan")
        table.add_column("Component", style="green")

        metric_names = list(self.baseline_metrics.keys())
        for m in metric_names:
            table.add_column(f"{m}", justify="right")
            table.add_column(f"{m} delta", justify="right", style="red")

        # Baseline row
        baseline_vals = []
        for m in metric_names:
            baseline_vals.extend([f"{self.baseline_metrics[m]:.4f}", "—"])
        table.add_row("baseline", "—", *baseline_vals, style="bold")

        for _, row in df.iterrows():
            cells = [row["strategy"], row["component"]]
            for m in metric_names:
                val = row.get(m, float("nan"))
                delta = row.get(f"{m}_delta", float("nan"))
                cells.append(f"{val:.4f}")
                cells.append(f"{delta:+.4f}" if pd.notna(delta) else "—")
            table.add_row(*cells)

        console.print(table)

    def save_json(self, path: str | Path):
        """Save raw results to JSON."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "model_name": self.model_name,
            "baseline_metrics": self.baseline_metrics,
            "results": [
                {
                    "strategy": r.strategy,
                    "component": r.component,
                    "description": r.description,
                    "metrics": r.metrics,
                    "metadata": r.metadata,
                }
                for r in self.results
            ],
        }
        path.write_text(json.dumps(data, indent=2))

    def save_csv(self, path: str | Path):
        """Save results DataFrame to CSV."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.to_dataframe().to_csv(path, index=False)

    def plot_impact(self, metric: str | None = None, output_path: str | Path | None = None):
        """Generate a bar chart showing the impact of each ablation on a metric.

        Args:
            metric: Which metric to plot. Defaults to the first baseline metric.
            output_path: If provided, save the figure instead of showing it.
        """
        import matplotlib

        if output_path:
            matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import seaborn as sns

        if metric is None:
            metric = list(self.baseline_metrics.keys())[0]

        df = self.to_dataframe()
        delta_col = f"{metric}_delta"
        if delta_col not in df.columns:
            raise ValueError(f"No delta column for metric {metric!r}")

        df_sorted = df.sort_values(delta_col, ascending=True)

        fig, ax = plt.subplots(figsize=(12, max(4, len(df_sorted) * 0.35)))
        colors = ["#e74c3c" if v > 0 else "#2ecc71" for v in df_sorted[delta_col]]
        sns.barplot(
            x=delta_col, y="component", hue="component", data=df_sorted,
            palette=dict(zip(df_sorted["component"], colors)), legend=False, ax=ax,
        )

        ax.set_xlabel(f"Change in {metric} (vs baseline)")
        ax.set_ylabel("Ablated Component")
        ax.set_title(f"Ablation Impact on {metric} — {_sanitize_label(self.model_name)}")
        ax.axvline(x=0, color="black", linewidth=0.8)

        plt.tight_layout()
        if output_path:
            fig.savefig(output_path, dpi=150, bbox_inches="tight")
            plt.close(fig)
        else:
            plt.show()

    def plot_heatmap(self, output_path: str | Path | None = None):
        """Generate a heatmap of pct_change across all strategies and metrics."""
        import matplotlib

        if output_path:
            matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import seaborn as sns

        df = self.to_dataframe()
        pct_cols = [c for c in df.columns if c.endswith("_pct_change")]
        if not pct_cols:
            return

        pivot = df.set_index("component")[pct_cols]
        pivot.columns = [c.replace("_pct_change", "") for c in pivot.columns]

        fig, ax = plt.subplots(figsize=(max(6, len(pivot.columns) * 2), max(4, len(pivot) * 0.4)))
        sns.heatmap(pivot, annot=True, fmt=".1f", cmap="RdYlGn_r", center=0, ax=ax)
        ax.set_title(f"Ablation % Change — {_sanitize_label(self.model_name)}")

        plt.tight_layout()
        if output_path:
            fig.savefig(output_path, dpi=150, bbox_inches="tight")
            plt.close(fig)
        else:
            plt.show()
