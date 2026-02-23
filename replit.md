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
    -   **API Key Management**: Generate, list, toggle, and delete API keys for workers.
    -   **Worker Registration & Polling**: Workers register with metadata, poll for tasks, and submit results.
    -   **Task Dispatch**: High-level `/api/dispatch` for dispatching tasks by worker name, and low-level `/api/tasks` for direct task management. Supports task types like message, file_read, file_write, file_upload.
    -   **File Exchange**: Workers and the CEO can upload/download files to a shared exchange folder.
    -   **Workers Dashboard**: A dedicated web UI (`/workers.html`) for managing API keys, viewing connected workers, dispatching tasks, and browsing file exchange. Includes a CEO/Worker Bee Chat panel.
    -   **@worker Chat Integration**: Messages in the Dashboard chat prefixed with `@workername` are automatically dispatched to the respective worker. Worker responses are injected into the chat via server-side WebSockets.
    -   **Server-Side Agent Watcher**: The CEO proxy monitors gateway WebSocket for `@WorkerName` mentions in agent responses and automatically dispatches tasks server-side.
    -   **CEO Agent Bootstrap**: Instructions for the CEO agent to use `@WorkerName` syntax for worker dispatch.
-   **AI Model Configuration Page**: A custom web UI (`/model-config.html`) allows viewing and switching the primary agent model, adding/removing model providers (with base URL, API key, API type), and managing individual models.
-   **Persistent Storage**: All OpenClaw data, including configuration, agents, API keys, worker tasks, chat history, and file exchange, persists across container restarts in the `.openclaw/` directory.
-   **Auto-Token Injection**: The gateway authentication token is automatically injected into the Control UI at startup, eliminating manual configuration.
-   **Navigation Bar**: An injected navigation bar provides easy access to the Dashboard, AI Model Config, and Workers pages.

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
-   **Replit Secrets Management**: Securely stores API keys like `XAI_API_KEY` and `OPENCLAW_GATEWAY_TOKEN`.
-   **Replit AI Integrations**: Provides access to OpenAI API key and base URL.
-   **`web_fetch` tool**: For fetching web page content.