# OpenClaw Cloud

## Overview
OpenClaw Cloud is the online, hosted version of OpenClaw, a multi-channel AI gateway with extensible messaging integrations. It runs on Replit as a persistent, always-accessible web service with a browser-based Control UI dashboard. This version eliminates the need for local installation and provides a centralized platform for managing AI chat sessions, channels, agents, models, and configuration. Its primary purpose is to act as a central "CEO" dispatching tasks to local "Worker Bee" OpenClaw instances.

## User Preferences
- **Workflow restart**: Always use `kill -9 1` to force-kill before restarting. Never use pkill or soft kills -- they hang.
- `start.sh` has `trap 'kill -9 1' TERM INT` to support clean restarts.
- **Persistent storage**: All OpenClaw data must persist across restarts and be manually clearable by deleting `.openclaw/`.
- **Config seeding**: `start.sh` only copies seed config if `.openclaw/openclaw.json` doesn't exist, to avoid overwriting user changes.
- **Worker dispatch**: Only `@WorkerName` (with @ symbol) should trigger dispatch -- never plain name mentions.

## System Architecture
OpenClaw Cloud operates with a "CEO Proxy + Gateway" architecture where two components run in a single workflow:

1.  **CEO Proxy** (`ceo-proxy.cjs`): Runs on port 5000, handles all `/api/*` routes (for keys, workers, tasks, exchange, dispatch, chat), and proxies all other requests to the gateway. It maintains a server-side WebSocket connection to the gateway for direct chat injection and monitoring agent responses.
2.  **OpenClaw Gateway**: Runs on port 5001, serving the standard OpenClaw Control UI and handling WebSocket connections. All WebSocket connections from the Control UI are transparently proxied from port 5000 to 5001.

### Key Features:
-   **CEO/Worker Bee System**: The Replit instance acts as a CEO, dispatching tasks to local OpenClaw Worker Bee instances. Workers register via a REST API, poll for tasks, process them, and return results which are injected directly into the Control UI chat.
    -   **Multiple Workers Per API Key**: Any number of worker bees can connect using the same API key. Each gets a unique worker ID (`w-{uuid}-{timestamp}`). Workers with the same name + API key reuse their ID on re-registration.
    -   **API Key Management**: Generate, list, toggle, and delete API keys for workers.
    -   **Worker Registration & Polling**: Workers register with metadata, receive a unique workerId, poll for tasks (with `?workerId=` param), and submit results.
    -   **Task Dispatch**: High-level `/api/dispatch` for dispatching tasks by worker name, and low-level `/api/tasks` for direct task management. Supports task types like message, file_read, file_write, file_upload.
    -   **File Exchange**: Workers and the CEO can upload/download files to a shared exchange folder.
    -   **Workers Dashboard**: A dedicated web UI (`/workers.html`) for managing API keys, viewing connected workers (with avatars and bee count badge), dispatching tasks, and browsing file exchange.
    -   **CEO Agent Chat Bridge** (`/api/agent/chat`): A REST endpoint that accepts OpenAI-compatible chat messages, sends them to the CEO agent via WebSocket `chat.send`, waits for the full response, and returns it in OpenAI chat completions format. Used by worker bees in "ceo" agent mode to get AI-powered responses without needing a local agent. Supports concurrent requests with runId-based correlation.
    -   **Worker Agent Modes**: Worker scripts support two modes: `"ceo"` (default, recommended) routes messages through the CEO's `/api/agent/chat` endpoint for full AI capabilities including web search and tools; `"local"` uses the worker's own local OpenClaw `/v1/chat/completions` endpoint.
    -   **@CEO Chat**: Worker bees can address `@CEO` in their messages/results to ask the CEO agent questions. Messages are injected into the gateway chat for AI processing.
    -   **Inter-Worker @BeeName Chat**: Workers can address each other with `@WorkerName` in their chat messages. The system automatically creates task dispatches between workers.
    -   **@worker Chat Integration**: Messages in the Dashboard chat prefixed with `@workername` are automatically dispatched to the respective worker. Worker responses are injected into the chat via server-side WebSockets.
    -   **Server-Side Agent Watcher**: The CEO proxy monitors gateway WebSocket for `@WorkerName` mentions in agent responses and automatically dispatches tasks server-side.
    -   **CEO Agent Bootstrap**: Instructions for the CEO agent to use `@WorkerName` syntax for worker dispatch.
    -   **Available Bees File**: `.openclaw/available-bees.json` is maintained with current connected bees, updated on registration/deletion and periodically. Also available via `/api/workers/available` endpoint.
    -   **CREW.md Auto-Sync**: `.openclaw/workspace/CREW.md` is automatically updated with live worker bee status (name, online/stale, platform, connected since, last seen) on startup, worker registration, deletion, and every 60 seconds. The CEO agent reads this file when asked about crew status. BOOTSTRAP.md instructs the agent to check CREW.md.
    -   **Agent Avatars**: Round circle avatars with white border and colored background with initials displayed in worker lists and chat bubbles.
    -   **Shared Space**: A shared folder (`.openclaw/sharedspace/`) accessible by all agents via `/api/sharedspace` REST endpoints (list, read, write, delete, mkdir, download). Both worker API keys and gateway token auth accepted. Separate from the CEO's private workspace for security. Web UI file browser on the Workers Dashboard page. Worker scripts include `SharedSpace-List`, `SharedSpace-Read`, `SharedSpace-Write` helper functions.
-   **AI Model Configuration Page**: A custom web UI (`/model-config.html`) allows viewing and switching the primary agent model, adding/removing model providers (with base URL, API key, API type), and managing individual models.
-   **Persistent Storage**: All OpenClaw data, including configuration, agents, API keys, worker tasks, chat history, and file exchange, persists across container restarts in the `.openclaw/` directory.
-   **Canvas Static File Serving**: The CEO proxy serves files from `.openclaw/canvas/` at `/__openclaw__/canvas/` without authentication. Canvas API: `DELETE /api/canvas/page/{filename}` removes a page from manifest + disk (protected pages: index.html, manifest.json, ig-dashboard.html). `GET /api/canvas/manifest` returns manifest entries. Skills and agents can write HTML dashboards, charts, and reports to this directory and link users directly. No separate web server or custom port needed. A manifest system (`.openclaw/canvas/manifest.json`) tracks all published pages for dynamic discovery on the Canvas hub (`/__openclaw__/canvas/`). Agents register new pages by adding entries to the manifest JSON array.
-   **Auto-Token Injection**: The gateway authentication token is automatically injected into the Control UI at startup, eliminating manual configuration.
-   **Process Manager & Bot Registry**: A web UI (`/processes.html`) shows registered bots with start/stop/remove controls, a "Run at startup" checkbox toggle, AND ad-hoc running processes. Bot registry persists in `.openclaw/bot-registry.json` — registered bots with `enabled: true` auto-restart on server restart with exponential backoff (5s→60s max). The "Startup" checkbox toggle lets you control auto-restart independently from start/stop (critical for trading bots managing margin positions). **All bot scripts live in `skills/bots/` as `.cjs` files** — the system auto-scans this folder on startup and registers any new scripts (filename minus `.cjs` = bot ID). API: `GET /api/processes` (list ad-hoc), `POST /api/processes/kill` (kill by PID), `GET /api/bots` (list registered bots), `POST /api/bots/register` (register a bot with id+cmd), `POST /api/bots/{id}/start|stop` (control), `PATCH /api/bots/{id}` (toggle enabled flag without starting/stopping), `DELETE /api/bots/{id}` (remove).
-   **IG API Proxy**: Live IG Group API endpoints in ceo-proxy.cjs with session token caching (5-min TTL). Endpoints: `GET /api/ig/account` (balance/margin), `GET /api/ig/positions` (open positions), `GET /api/ig/prices?epics=...` (current prices), `POST /api/ig/refresh-snapshots` (refresh config snapshot files for dashboard). Graceful fallback if IG env vars not configured.
-   **Chat Rich Media (Canvas Embeds)**: The chat UI supports inline iframe embeds for canvas pages. `![canvas](/__openclaw__/canvas/page.html)` renders as a sandboxed iframe. Raw `<iframe src="/__openclaw__/canvas/...">` also works. DOMPurify restricts iframe src to `/__openclaw__/canvas/` URLs only. Enhanced markdown tables with alternating row colors and hover highlighting.
-   **Navigation Bar**: An injected navigation bar provides easy access to the Dashboard, Canvas, AI Model Config, Workers, and Processes pages.

### Technical Implementation Details:
-   **Language**: TypeScript (Node.js >= 22.12.0)
-   **Package Manager**: pnpm (10.23.0)
-   **Build Tool**: tsdown (TypeScript bundler)
-   **UI**: Vite-based Lit web components.
-   **Entry Point**: `dist/entry.js`.
-   **Gateway CLI**: `node dist/entry.js gateway [options]`.
-   **Cloud-Specific Files**: `start.sh` for setup, `ceo-proxy.cjs` for proxy logic, custom HTML/JS/CSS for Workers Dashboard and Model Config page.

### UI/UX Decisions:
-   The Control UI is accessible from any browser with a public Replit URL.
-   Custom web UIs (`workers.html`, `model-config.html`) provide dedicated interfaces for managing specific functionalities.
-   An injected navigation bar enhances user experience by providing quick access to different sections.
-   Real-time chat and status updates are provided via WebSocket connections.

## External Dependencies
-   **xAI/Grok API**: Primary AI model provider.
    -   Models: `grok-4-1-fast-reasoning` (primary), `grok-4`, `grok-2`, `grok-2-vision-1212`, `grok-2-1212`.
    -   Used for `web_search` tool.
-   **OpenAI API**: Secondary AI model provider via Replit AI Integrations.
    -   Models: `gpt-4o`, `gpt-4o-mini`.
-   **IG Group Trading API**: CFD trading via REST API (demo: `demo-api.ig.com`, live: `api.ig.com`).
    -   Skills: `ig-trading` (auth, positions, orders), `ig-market-data` (search, prices, watchlists, sentiment), `ig-trade-verify` (mandatory pre-trade proof reader), `ig-backtest` (strategy backtesting with charts).
    -   Bot skills: `ig-signal-monitor` (price signal monitoring), `ig-trading-bot` (automated strategy execution with built-in proof reader).
    -   **Trade Proof Reader**: Multi-layered anti-hallucination protection for margin trading. Bot-level rule-based verification (spread limits, stop-loss validation, price staleness detection, risk sizing, duplicate checks) runs before every trade. Agent-level `ig-trade-verify` skill defines a mandatory verification protocol. All verifications logged to `.openclaw/canvas/ig-verify-log.json` and displayed on the IG dashboard.
    -   Signal monitor config: `.openclaw/ig-monitor-config.json`, alerts: `.openclaw/ig-alerts.json`.
    -   Trading bot config: `.openclaw/ig-strategy.json`, log: `.openclaw/ig-bot-log.json`.
    -   Dashboard: `.openclaw/canvas/ig-dashboard.html` (viewable at `/__openclaw__/canvas/ig-dashboard.html`). Shows LIVE account/positions data via `/api/ig/*` endpoints + SNAPSHOT data from config files. Badge system: green "LIVE" for API-fetched, grey "SNAPSHOT" for file-based sections.
    -   Credentials stored in env vars: `IG_API_KEY`, `IG_USERNAME`, `IG_PASSWORD`, `IG_ACCOUNT_ID`, `IG_BASE_URL`.
    -   Reference doc: `.openclaw/workspace/IG_TRADING.md`.
-   **Replit Secrets Management**: Securely stores API keys like `XAI_API_KEY`, `OPENCLAW_GATEWAY_TOKEN`, and IG credentials.
-   **Replit AI Integrations**: Provides access to OpenAI API key and base URL.
-   **`web_fetch` tool**: For fetching web page content.