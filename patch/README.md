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

Copy `.env.example` to `.env` in your OpenClaw directory and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `IG_API_KEY` | Yes | IG Trading API key |
| `IG_USERNAME` | Yes | IG account username |
| `IG_PASSWORD` | Yes | IG account password |
| `IG_ACCOUNT_ID` | No | IG account ID (auto-detected if omitted) |
| `IG_ACCOUNT_TYPE` | No | `demo` (default) or `live` |
| `DATABASE_URL` | No | PostgreSQL connection string (see Database Setup below) |
| `GROQ_API_KEY` | No | Groq API key for AI calibration |
| `OPENCLAW_LOGIN_USER` | No | Username for dashboard login protection |
| `OPENCLAW_LOGIN_PASSWORD` | No | Password for dashboard login protection |

## What's Included

- **IG Trading Dashboard** — backtest, optimize, monitor, and trade from one UI
- **23 strategies** — scalper, trend-following, mean-reversion, breakout, Donchian, grid, pairs, and more
- **Batch backtester** — run multiple instruments/strategies/timeframes with optimization memory
- **AI calibration agent** — Groq-powered multi-cycle parameter tuning
- **ClawScript** — custom strategy language with editor, parser, and flow builder
- **Signal monitor** — real-time alerts from strategy signals
- **Trade Claw engine** — live trade execution via IG REST API

## Database Setup (PostgreSQL)

The system uses **PostgreSQL** for storing strategies, backtest results, optimization memory, trade history, and candle data.

**No database? No problem.** When `DATABASE_URL` is not set, the system automatically falls back to **CSV files** stored in `~/.openclaw/db/`. Everything works — strategies, backtests, trades, optimization memory, candle caching — just using local CSV files instead of PostgreSQL. This means you can run the full system without any database setup at all.

PostgreSQL is recommended for production use (better performance with large datasets, concurrent access, proper indexing), but CSV mode is fully functional for development, testing, and personal use.

All tables are created automatically on first startup — no manual SQL required.

### Option 1: Neon (Free Cloud PostgreSQL)

[Neon](https://neon.tech) offers a free tier with 512 MB storage — more than enough for trading data.

1. Go to [https://neon.tech](https://neon.tech) and sign up (GitHub/Google login works)
2. Click **New Project** — give it a name like `openclaw-trading`
3. Select the region closest to you and click **Create Project**
4. On the dashboard, find the **Connection string** — it looks like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Copy the full connection string
6. Open your `.env` file and set:
   ```
   DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Start (or restart) OpenClaw Mechanicus — tables are created automatically

### Option 2: Supabase (Free Cloud PostgreSQL)

[Supabase](https://supabase.com) offers a free tier with 500 MB and a full Postgres database.

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click **New Project**, pick an org, set a database password, and choose a region
3. After the project is created, go to **Project Settings** > **Database**
4. Under **Connection string** > **URI**, copy the connection string
5. Replace `[YOUR-PASSWORD]` in the string with the password you set
6. Add to your `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Option 3: Local PostgreSQL

If you have PostgreSQL installed locally:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/openclaw
```

Create the database first:
```bash
createdb openclaw
```

### Verifying the Connection

After setting `DATABASE_URL`, start the system with `start-mechanicus.ps1` (Windows) or `start-mechanicus.sh` (Linux/Mac). Look for these log messages:

```
[startup] Database: configured
[startup] price_candles table ready
```

If you see `Database: not configured (file-only mode)`, check that your `.env` file has the correct `DATABASE_URL` value.

### What the Database Stores

| Table | Purpose |
|---|---|
| `scalper_config` | Global scalper settings (budget, drawdown limits) |
| `scalper_strategies` | Strategy configurations (instruments, indicators, parameters) |
| `scalper_trades` | Trade execution history with P&L |
| `scalper_backtests` | Individual backtest results |
| `optimization_memory` | Best parameters found per instrument/strategy/timeframe |
| `price_candles` | Historical OHLCV candle data cached from IG API |
| `agent_backups` | Agent state snapshots |
| `agent_memory` | Agent long-term memory |
| `agent_daily_memory` | Agent daily journals |
| `agent_subconscious` | Agent pattern recognition data |
