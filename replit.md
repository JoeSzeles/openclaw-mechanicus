# OpenClaw Cloud

## Overview
OpenClaw Cloud is an online, hosted version of OpenClaw, serving as a multi-channel AI gateway with extensible messaging integrations. It runs on Replit as a persistent web service with a browser-based Control UI dashboard. This platform centralizes the management of AI chat sessions, channels, agents, models, and configuration. Its primary purpose is to act as a central "CEO" dispatching tasks to local "Worker Bee" OpenClaw instances, eliminating the need for local installations.

## User Preferences
- **Workflow restart**: Always use `kill -9 1` to force-kill before restarting. Never use pkill or soft kills -- they hang.
- `start.sh` has `trap 'kill -9 1' TERM INT` to support clean restarts.
- **Persistent storage**: All OpenClaw data must persist across restarts and be manually clearable by deleting `.openclaw/`.
- **Config seeding**: `start.sh` only copies seed config if `.openclaw/openclaw.json` doesn't exist, to avoid overwriting user changes.
- **Worker dispatch**: Only `@WorkerName` (with @ symbol) should trigger dispatch -- never plain name mentions.

## System Architecture
OpenClaw Cloud employs a "CEO Proxy + Gateway" architecture, where two components run within a single workflow: a CEO Proxy handling API routes and proxying other requests, and an OpenClaw Gateway serving the Control UI and managing WebSocket connections.

### Key Features:
-   **Login Authentication**: Secures access with username/password, supporting persistent sessions and selective authentication bypass for specific endpoints.
-   **CEO/Worker Bee System**: The Replit instance acts as a CEO, coordinating tasks for local OpenClaw Worker Bee instances. This includes worker registration, API key management, task dispatch, file exchange, and a dedicated Workers Dashboard UI.
    -   **Agent Chat Bridge**: Provides an OpenAI-compatible endpoint for worker bees to access CEO's AI capabilities.
    -   **Inter-Worker Communication**: Facilitates communication between workers and with the CEO agent through `@WorkerName` and `@CEO` mentions.
    -   **Shared Space**: A common folder for file sharing among all agents, accessible via REST API and a web UI file browser.
    -   **CREW.md Auto-Sync**: Automatically updates a `CREW.md` file with live worker status for the CEO agent.
-   **Config Page**: A unified web UI for managing AI Models and IG Trading configurations.
-   **Persistent Storage**: All OpenClaw data is stored persistently in the `.openclaw/` directory.
-   **Canvas Static File Serving**: Serves dynamic HTML dashboards and reports from a dedicated canvas directory, supporting a manifest system for page discovery.
-   **Auto-Token Injection**: Automatically injects the gateway authentication token into the Control UI.
-   **Process Manager & Bot Registry**: A web UI for managing ad-hoc and registered bots, including start/stop controls and auto-restart capabilities for bots residing in `skills/bots/`.
-   **IG API Proxy**: Full-featured proxy for IG Group Trading API covering ALL IG operations: positions (open/close/update), working orders (create/update/delete), market search, price history, watchlists, activity/transaction history, and session management. Handles authentication automatically. See `skills/ig-trading/IG-COMMANDS.md` for complete endpoint reference. Includes a multi-layered trade proof reader for risk mitigation.
-   **Independent Live Streaming**: Lightstreamer price streaming can connect independently to the live IG account for fast price data, completely decoupled from the active trading profile. Config page has Connect/Disconnect button with green status indicator. Endpoints: `POST /api/ig/stream/connect-live`, `POST /api/ig/stream/disconnect-live`, `GET /api/ig/stream/status` (includes `liveStreamingActive` and `streamingSource` fields). Live streaming session has its own token refresh cycle.
-   **Chat Rich Media**: Supports inline iframe embeds for canvas pages and enhanced markdown tables in the chat UI.
-   **Navigation Bar**: Injected navigation for easy access to different sections of the platform.

### Technical Implementation Details:
-   **Language**: TypeScript (Node.js >= 22.12.0)
-   **Package Manager**: pnpm (10.23.0)
-   **Build Tool**: tsdown
-   **UI**: Vite-based Lit web components.

### UI/UX Decisions:
-   Browser-accessible Control UI.
-   Custom web UIs for specific functionalities.
-   Injected navigation bar for improved user experience.
-   Real-time updates via WebSockets.

## External Dependencies
-   **xAI/Grok API**: Primary AI model provider (e.g., `grok-4-1-fast-reasoning`, `grok-4`, `grok-2`). Used for `web_search` tool.
-   **OpenAI API**: Secondary AI model provider via Replit AI Integrations (e.g., `gpt-4o`, `gpt-4o-mini`).
-   **IG Group Trading API**: For CFD trading (demo and live environments). Integrates skills for trading, market data, trade verification, and backtesting.
-   **Replit Secrets Management**: For secure storage of API keys and credentials.
-   **Replit AI Integrations**: Provides access to OpenAI API.
-   **`web_fetch` tool**: For web content retrieval.