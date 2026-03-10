# OpenClaw Mechanicus Patch

IG Trading system for OpenClaw. Adds 23 strategies, batch backtesting with optimization memory, AI calibration, equity curve visualization, live signal monitoring, and the IG Trading Dashboard.

## Install

**Linux / Mac:**
```bash
git clone https://github.com/JoeSzeles/openclaw-mechanicus-patches.git
cd openclaw-mechanicus-patches
bash install.sh /path/to/openclaw
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/JoeSzeles/openclaw-mechanicus-patches.git
cd openclaw-mechanicus-patches
.\install.ps1 C:\path\to\openclaw
```

The installer backs up any existing files before overwriting them.

## Uninstall

Restores all original files from the backup created during install.

```bash
bash uninstall.sh /path/to/openclaw
```

```powershell
.\uninstall.ps1 C:\path\to\openclaw
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IG_API_KEY` | Yes | IG Trading API key |
| `IG_IDENTIFIER` | Yes | IG account username |
| `IG_PASSWORD` | Yes | IG account password |
| `IG_ACCOUNT_TYPE` | Yes | `demo` or `live` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GROQ_API_KEY` | No | Groq API key for AI calibration |

## What's Included

- **IG Trading Dashboard** — backtest, optimize, monitor, and trade from one UI
- **23 strategies** — scalper, trend-following, mean-reversion, breakout, Donchian, grid, pairs, and more
- **Batch backtester** — run multiple instruments/strategies/timeframes with optimization memory
- **AI calibration agent** — Groq-powered multi-cycle parameter tuning
- **ClawScript** — custom strategy language with editor, parser, and flow builder
- **Signal monitor** — real-time alerts from strategy signals
- **Trade Claw engine** — live trade execution via IG REST API

## Database

Tables (`optimization_memory`, `scalper_backtests`) are created automatically on first run. Requires PostgreSQL.
