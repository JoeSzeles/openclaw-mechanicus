# Sensitive Data Audit Report

**Date:** 2026-03-04
**Scope:** Full repository scan — all file types (Python, YAML, JSON, TOML, Docker, shell scripts, notebooks, CI/CD)
**Branch:** claude/audit-sensitive-data-DkqUy

## Summary

**No hardcoded secrets, API keys, tokens, passwords, or credentials found in the codebase.**

## Detailed Findings

### 1. Secrets & Credentials

| Check | Result |
|---|---|
| Hardcoded API keys (HF, OpenAI, Anthropic, etc.) | None found |
| Hardcoded passwords/tokens in source | None found |
| `.env` files committed | None (`.env` is in `.gitignore`) |
| Private keys or certificates | None found |
| Database connection strings | None found |
| URLs with embedded credentials | None found |
| Patterns: `sk-`, `hf_`, `ghp_`, `gho_`, `github_pat_` | None found |

### 2. Environment Variable Handling

All sensitive values are read from environment variables at runtime:

- `HF_TOKEN` — used for gated model access and Hub push (read via `os.environ.get()`)
- `OBLITERATUS_SSH_KEY` — SSH key path for remote benchmarks (default: `~/.ssh/hf_obliteratus`)
- `OBLITERATUS_SSH_HOST` — remote SSH host (no default, must be provided)
- `OBLITERATUS_TELEMETRY_REPO` — telemetry dataset repo (defaults only on HF Spaces)

### 3. Docker Security

- **Dockerfile** runs as non-root user (`appuser`)
- **`.dockerignore`** properly excludes: `.env`, `.git`, tests, scripts, docs, notebooks, model weights
- No secrets baked into Docker image layers

### 4. CI/CD (`.github/workflows/ci.yml`)

- Uses pinned action SHAs (not mutable tags) — good supply-chain practice
- No secrets referenced in workflow file
- No secret injection via env vars

### 5. `.gitignore` Coverage

Properly excludes: `.env`, virtual environments (`.venv/`, `venv/`, `env/`), model weights (`*.pt`, `*.bin`, `*.safetensors`), IDE configs, caches, logs

### 6. HuggingFace Space Configuration

Based on current HF Space settings:

- **No secrets configured** in Variables and secrets — this means:
  - Gated models (e.g., Llama) will fail authentication
  - Telemetry Hub sync (push) will fail without `HF_TOKEN`
- **Recommendation:** Add `HF_TOKEN` as a Space secret if gated model access or telemetry push is needed
- Space visibility is **Public** (appropriate for open-source project)

### 7. Minor Notes

- `scripts/run_benchmark_remote.sh` uses `-o StrictHostKeyChecking=no` for SSH — acceptable for ephemeral HF Space connections but worth noting for security-conscious deployments
- Telemetry auto-enables on HF Spaces (`OBLITERATUS_TELEMETRY=1` by default) — this is documented and expected behavior, collecting only anonymous benchmark metrics

## Recommendations

1. **Add `HF_TOKEN` as an HF Space secret** if you need gated model access or telemetry push
2. Consider adding a `pre-commit` hook with a secrets scanner (e.g., `detect-secrets` or `gitleaks`) to prevent accidental secret commits in the future
3. The current `.gitignore` and `.dockerignore` are well-configured — no changes needed
