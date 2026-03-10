# OpenClaw Mechanicus Patch

IG Trading system for OpenClaw. Adds 23 strategies, batch backtesting with optimization memory, AI calibration, equity curve visualization, live signal monitoring, and the IG Trading Dashboard.

## Install

**Cross-platform (Node.js — recommended):**
```bash
git clone https://github.com/JoeSzeles/openclaw-mechanicus-patches.git
cd openclaw-mechanicus-patches
node install-node.cjs
```

The Node installer auto-detects your OpenClaw install location and works on Windows, Mac, and Linux. It patches the gateway to load `ig-local-api.mjs` at startup, enabling all IG endpoints on the raw gateway without requiring the CEO proxy.

**Linux / Mac (shell):**
```bash
bash install.sh /path/to/openclaw
```

**Windows (PowerShell):**
```powershell
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

## Local API (ig-local-api.mjs)

The patch injects a standalone ESM module (`ig-local-api.mjs`) into the OpenClaw gateway at startup. This provides a full IG trading API layer that works on the raw gateway (port 18789) without requiring the CEO proxy.

### Supported Endpoints (43 total)

**IG Session & Config:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/ig/config` | GET | Get IG config (credentials masked) |
| `/api/ig/config` | POST | Update config (accepts `{profiles:{...}}` or `{profile,profileName}`) |
| `/api/ig/config/test` | POST | Test connection for a specific profile |
| `/api/ig/session` | GET | Get session status |
| `/api/ig/session/refresh` | POST | Force session token refresh |

**Trading (proxied to IG REST API):**
| Endpoint | Method | Description |
|---|---|---|
| `/api/ig/positions` | GET | List open positions with snapshots |
| `/api/ig/positions/open` | POST | Open a new position (BUY or SELL) |
| `/api/ig/positions/close` | POST | Close a position by dealId |
| `/api/ig/positions/update` | PUT | Update stop/limit on a position |
| `/api/ig/account` | GET | Account balance and details |
| `/api/ig/markets` | GET | Search markets by term |
| `/api/ig/markets/:epic` | GET | Get market details for an epic |
| `/api/ig/marketnavigation` | GET | Market navigation tree |
| `/api/ig/pricehistory/:epic` | GET | Historical price data |
| `/api/ig/workingorders` | GET | List working orders |
| `/api/ig/workingorders/create` | POST | Create a working order |
| `/api/ig/workingorders/update` | PUT | Update a working order |
| `/api/ig/workingorders/delete` | DELETE | Delete a working order |
| `/api/ig/activity` | GET | Account activity (requires `?from=` param) |
| `/api/ig/history` | GET | Transaction history |
| `/api/ig/watchlists` | GET | IG account watchlists |
| `/api/ig/refresh-snapshots` | POST | Refresh market snapshots for positions |

**Streaming (local-mode stubs — requires CEO proxy for live data):**
| Endpoint | Method | Description |
|---|---|---|
| `/api/ig/stream/prices` | GET | Price stream status |
| `/api/ig/stream/status` | GET | Stream connection status |
| `/api/ig/stream/candles` | GET | Candle data (REST polling fallback) |
| `/api/ig/stream/candle-stats` | GET | Candle statistics |

**Strategies & Scalper (local JSON file CRUD):**
| Endpoint | Method | Description |
|---|---|---|
| `/api/ig/strategies` | GET | List all strategies |
| `/api/ig/strategies/global` | POST | Update global strategy toggle |
| `/api/ig/strategy-templates` | GET | List strategy templates |
| `/api/ig/watchedlist` | GET | Watched instruments list |
| `/api/ig/proofread` | GET/PUT | Proofread configuration |
| `/api/ig/scalper` | GET | Scalper configuration |
| `/api/ig/scalper/status` | GET | Scalper engine status |
| `/api/ig/scalper/strategies` | GET | Scalper strategies |
| `/api/ig/scalper/strategy-schemas` | GET | Strategy parameter schemas |
| `/api/ig/scalper/backtests` | GET | Backtest results |
| `/api/ig/scalper/optimization-memory` | GET | Optimization memory |
| `/api/ig/scalper/batch-backtest` | GET | Batch backtest results |
| `/api/ig/logs/scalper-trades` | GET | Scalper trade logs |

**ClawScript:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/clawscript/strategies` | GET | ClawScript strategies |
| `/api/clawscript/results` | GET | ClawScript results |
| `/api/clawscript/scripts` | GET | ClawScript scripts |
| `/api/clawscript/templates` | GET | ClawScript templates |
| `/api/clawscript/ai/config` | GET | ClawScript AI configuration |
| `/api/clawscript/logbook` | GET/POST | ClawScript logbook entries |

**Bots & Processes:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/bots` | GET | Registered bots |
| `/api/processes` | GET | Running processes |

### Trade Execution Test Results

All trade types verified on IG demo account (Silver CFD — CS.D.CFASILVER.CFA.IP):

- **BUY to open** — `dealStatus: ACCEPTED`, position opened at market price
- **SELL to close** — `dealStatus: ACCEPTED`, position fully closed with P&L
- **SELL to open (short)** — `dealStatus: ACCEPTED`, short position opened
- **BUY to close (cover short)** — `dealStatus: ACCEPTED`, short position fully closed

### Config Page (Session & Streaming)

The config page displays API Session status and Streaming Status. The local API now includes `session` and `streaming` objects in the `GET /api/ig/config` response:

- **Session**: Shows `connected`/`disconnected`/`not_configured`, profile name, session age, TTL remaining, last refresh time, and Lightstreamer endpoint
- **Streaming**: Shows real Lightstreamer connection status (`connected`/`disconnected`/`reconnecting`), connected epics, price count, hybrid polling state, update metrics, and total updates. Lightstreamer connects automatically after first IG auth and subscribes to all configured instrument epics

The session auto-connects when any IG API call is made (positions, markets, etc.).

### Claw Trader Bot

All Claw Trader CRUD operations work in local mode:

- **Add/edit/delete strategies** with full field support (direction, timeframe, size, stop/limit, indicators, RSI/EMA/MACD params)
- **Engine settings** (budget, max drawdown, max margin %, break-even buffer)
- **Strategy toggle** (enable/disable individual strategies)
- **Reset stats** (clears trade history)
- **Template loading** from strategy-templates
- **Start/stop** returns a helpful message (real-time execution requires CEO proxy)

Stats display correctly: Realized P&L, trade count (W/L), win rate, all from the local trade history file.

### Known Limitations

- **Price history / chart data** may return `exceeded-account-historical-data-allowance` on demo accounts (IG rate limit, resets after a few hours)
- **Market navigation** returns 500 from IG API on some demo accounts
- **Activity endpoint** requires `?from=` date parameter (e.g., `?from=2026-03-01T00:00:00`)
- **Streaming** (Lightstreamer live prices) now works in local mode — auto-connects after first IG auth, subscribes to configured instrument epics, falls back to hybrid REST polling if L1 subscription fails (e.g., CFD account type). Live account streaming also supported if live profile is configured
- **ClawScript compile/run/AI** execution requires the CEO proxy — local mode returns helpful stubs
- **Scalper engine start/stop** requires the CEO proxy — local mode manages config/strategies/trades locally

### Config API Compatibility

The `POST /api/ig/config` endpoint accepts two formats for backward compatibility:

**UI format (from model-config.js):**
```json
{ "profiles": { "demo": { "apiKey": "...", "username": "..." } } }
```

**Direct format:**
```json
{ "profileName": "demo", "profile": { "apiKey": "...", "username": "..." } }
```

Masked values (`••••••••` or `****`) are automatically detected and skipped to prevent overwriting real credentials when the UI sends back masked fields.

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
