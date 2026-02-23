# OpenClaw Cloud

## Overview
OpenClaw Cloud is the online/hosted version of [OpenClaw](https://github.com/nichochar/openclaw), a multi-channel AI gateway with extensible messaging integrations. It runs on Replit as a persistent, always-accessible web service with a browser-based Control UI dashboard for managing AI chat sessions, channels, agents, models, and configuration -- no local install required.

## What Makes This the "Cloud" Version
Unlike the standard local OpenClaw setup (which runs on your machine via CLI), OpenClaw Cloud:
- Runs on Replit with a public URL, accessible from any browser
- Uses Replit's persistent workspace storage so all data survives container restarts
- Provides a web-based AI Model Configuration page for managing providers/models through the browser
- Integrates with Replit's secrets management for secure API key storage
- Auto-injects authentication tokens into the Control UI (no manual token entry)
- **CEO/Worker system**: Dispatches tasks to local OpenClaw instances via REST API

## Current State
- Running on Replit with Node.js 22
- CEO proxy on port 5000 (exposed), OpenClaw gateway on port 5001 (internal)
- Control UI served at root (/) with navigation bar
- AI Model Config page at /model-config.html
- Workers Dashboard at /workers.html
- Primary model: xai/grok-4-1-fast-reasoning (Grok 4.1 Fast Reasoning)
- Web search enabled via Grok provider
- Channels skipped (OPENCLAW_SKIP_CHANNELS=1) for lightweight operation
- Memory search disabled (Replit AI proxy doesn't support /embeddings)

## Architecture: CEO Proxy + Gateway
The system runs two components in a single workflow:
1. **CEO Proxy** (`ceo-proxy.cjs`) on port 5000 -- handles `/api/*` routes (keys, workers, tasks, exchange) and proxies everything else to the gateway
2. **OpenClaw Gateway** on port 5001 -- the standard OpenClaw gateway serving Control UI and WebSocket connections

All WebSocket connections (Control UI) are transparently proxied from port 5000 to 5001.

## Features

### CEO/Worker System
The CEO (this Replit instance) can dispatch tasks to local OpenClaw worker instances:

**API Key Management** (`/api/keys`)
- Generate API keys for workers (format: `ocw_...`)
- List, reveal, toggle (enable/disable), delete keys
- Keys stored in `.openclaw/api-keys.json`

**Worker Registration & Polling** (`/api/workers`)
- Workers register with name, agentId, platform, version
- Workers poll for pending tasks every N seconds
- Workers submit task results back to CEO
- Workers auto-expire after 5 minutes of inactivity

**Task Dispatch** (`/api/tasks`)
- CEO creates tasks assigned to specific workers
- Task types: message, file_read, file_write, file_upload
- Tasks track status (pending → completed) with results

**File Exchange** (`/api/exchange`)
- Workers upload files to CEO's exchange folder
- CEO can upload files for workers to download
- Files stored in `.openclaw/exchange/`
- Download, delete files via API

**Workers Dashboard** (`/workers.html`)
- API key management UI (generate, copy, reveal, toggle, delete)
- Connected workers list with status (online/stale)
- Task dispatch form with worker selection and task types
- File exchange browser with upload/download
- Task history with results
- Connection guide with PowerShell/bash scripts

### AI Model Providers
Two providers are pre-configured:

**xai (Primary)**
- Base URL: https://api.x.ai/v1
- API Key: via XAI_API_KEY secret
- Models:
  - grok-4-1-fast-reasoning (Grok 4.1 Fast Reasoning) -- reasoning model, primary
  - grok-4 (Grok 4)
  - grok-2 (Grok 2)
  - grok-2-vision-1212 (Grok 2 Vision) -- supports image input
  - grok-2-1212 (Grok 2 1212)

**openai (Secondary)**
- Base URL: via Replit AI Integrations
- API Key: via Replit AI Integrations
- Models:
  - gpt-4o (GPT-4o) -- supports text + image
  - gpt-4o-mini (GPT-4o Mini) -- supports text + image

### Web Search & Fetch Tools
- `web_search` tool enabled using Grok as the search provider (uses XAI_API_KEY)
- `web_fetch` tool enabled for fetching web page content
- Supported search providers in OpenClaw: brave, perplexity, grok (SearXNG not supported)

### AI Model Configuration Page (/model-config.html)
A custom web UI for managing model settings through the browser:
- View and switch the primary agent model
- Add/remove model providers (with base URL, API key, API type)
- Add/remove individual models under each provider
- Live WebSocket connection to the gateway for real-time config read/write
- Save changes directly to the persistent config

### Navigation Bar
An injected navigation bar appears at the top of all pages:
- **Dashboard** -- main OpenClaw Control UI
- **AI Model Config** -- model management page
- **Workers** -- CEO/Worker management dashboard

### Persistent Storage
All OpenClaw data persists across container restarts:
- Config: `.openclaw/openclaw.json`
- Agents: `.openclaw/agents/`
- Bootstrap: `.openclaw/bootstrap.md`
- API Keys: `.openclaw/api-keys.json`
- Worker Tasks: `.openclaw/worker-tasks.json`
- File Exchange: `.openclaw/exchange/`
- Sessions, devices, cron data
- Location: `/home/runner/workspace/.openclaw/`
- To clear everything: delete the `.openclaw/` directory and restart

### Auto-Token Injection
The gateway auth token is automatically injected into the Control UI via `token-init.js`, generated at startup from the OPENCLAW_GATEWAY_TOKEN secret. No manual token configuration needed in the browser.

## Project Architecture
- **Language**: TypeScript (Node.js >= 22.12.0)
- **Package Manager**: pnpm (10.23.0 specified in packageManager field)
- **Build Tool**: tsdown (TypeScript bundler)
- **UI**: Vite-based Lit web components in `ui/` directory, built to `dist/control-ui/`
- **Entry Point**: `dist/entry.js` (compiled from `src/entry.ts`)
- **Gateway CLI**: `node dist/entry.js gateway [options]`
- **CEO Proxy**: `ceo-proxy.cjs` (CommonJS, handles /api/* routes + reverse proxy)

## Key Directories
- `src/` - TypeScript source code
- `src/gateway/` - Gateway server implementation
- `src/cli/` - CLI command handlers
- `src/config/` - Configuration loading
- `ui/` - Control UI source (Vite + Lit)
- `dist/` - Built output
- `dist/control-ui/` - Built UI assets + custom pages
- `.openclaw/` - Persistent OpenClaw data (gitignored)
- `.openclaw/exchange/` - File exchange between CEO and workers

## Custom Files (Cloud-Specific)
- `start.sh` - Startup script with token injection, env setup, persistent storage init, dual-process launch
- `ceo-proxy.cjs` - CEO proxy server handling /api/* routes and reverse proxying to gateway
- `dist/control-ui/workers.html` - Workers Dashboard page
- `dist/control-ui/workers.js` - Workers Dashboard logic (API calls, UI rendering)
- `dist/control-ui/workers.css` - Workers Dashboard styles
- `dist/control-ui/model-config.html` - AI Model Configuration page
- `dist/control-ui/model-config.js` - Model config page logic (WebSocket comms, UI rendering)
- `dist/control-ui/model-config.css` - Model config page styles
- `dist/control-ui/nav-inject.js` - Navigation bar injection script (adds nav to all pages)
- `dist/control-ui/token-init.js` - Auto-generated at startup, injects auth token
- `openclaw.json` - Seed config (copied to .openclaw/ on first run only)

## CEO Worker REST API Reference

### Authentication
- Gateway/CEO endpoints: `Authorization: Bearer <OPENCLAW_GATEWAY_TOKEN>`
- Worker endpoints: `Authorization: Bearer <API_KEY>` (generated via /api/keys)

### Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/keys | Gateway | List API keys (previews only) |
| POST | /api/keys | Gateway | Generate new API key |
| POST | /api/keys/:id/reveal | Gateway | Reveal full API key |
| PUT | /api/keys/:id/toggle | Gateway | Enable/disable API key |
| DELETE | /api/keys/:id | Gateway | Delete API key |
| GET | /api/workers | Gateway | List connected workers |
| POST | /api/workers/register | Worker | Register worker with CEO |
| POST | /api/workers/heartbeat | Worker | Send heartbeat |
| GET | /api/workers/poll | Worker | Poll for pending tasks |
| POST | /api/workers/result | Worker | Submit task result |
| GET | /api/tasks | Gateway | List all tasks |
| POST | /api/tasks | Gateway | Create/dispatch a task |
| DELETE | /api/tasks/:id | Gateway | Delete a task |
| GET | /api/exchange | Gateway | List exchange files |
| GET | /api/exchange/download/:file | Any | Download exchange file |
| POST | /api/exchange/upload | Worker/Gateway | Upload file to exchange |
| DELETE | /api/exchange/:file | Gateway | Delete exchange file |

## Environment Variables & Secrets
| Variable | Purpose |
|----------|---------|
| `XAI_API_KEY` | xAI/Grok API key (secret) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key via Replit integrations |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL via Replit integrations |
| `OPENCLAW_GATEWAY_TOKEN` | Auth token for gateway/Control UI access |
| `OPENCLAW_GATEWAY_PORT` | Gateway internal port (set to 5001) |
| `OPENCLAW_SKIP_CHANNELS` | Skip channel initialization (set to 1) |
| `COREPACK_ENABLE_STRICT` | Must be 0 to avoid pnpm version conflicts |
| `OPENCLAW_HOME` | Set to /home/runner/workspace for persistent storage |

## Workflow
- **Start application**: Runs `start.sh` which sets up env, injects token, seeds config, starts CEO proxy on port 5000, launches gateway on port 5001

## Build Steps
1. Install deps: `npx pnpm@10.23.0 install --no-frozen-lockfile`
2. Build main project: Already pre-built in dist/
3. Build UI: `cd ui && npx pnpm@10.23.0 run build`

## Gateway WebSocket Protocol
- Frame format: `{ type: "req", id: "unique-id", method: "methodName", params: {} }`
- Response format: `{ type: "res", id: "matching-id", ok: true/false, payload: {} }` (uses `payload` not `result`)
- Connect handshake: method "connect" with minProtocol/maxProtocol (both 3), client info, auth, role, scopes
- Valid client IDs: openclaw-control-ui, webchat-ui, webchat, cli, etc.
- Valid modes: webchat, cli, ui, backend, node, probe, test
- Scopes: operator.admin (full access), operator.read, operator.write, operator.approvals, operator.pairing
- config.get returns `{ payload: { path, exists, raw (JSON string), hash } }`
- config.set takes `{ raw: "JSON string", baseHash: "hash" }` and returns `{ payload: { ok, path, config } }`
- CSP blocks inline scripts in control-ui pages; all JS must be in external .js files
- allowedOrigins in openclaw.json must include the Replit proxy URL for browser WebSocket connections

## User Preferences
- **Workflow restart**: Always use `kill -9 1` to force-kill before restarting. Never use pkill or soft kills -- they hang.
- start.sh has `trap 'kill -9 1' TERM INT` to support clean restarts.
- **Persistent storage**: All OpenClaw data must persist across restarts and be manually clearable by deleting `.openclaw/`.
- **Config seeding**: start.sh only copies seed config if `.openclaw/openclaw.json` doesn't exist, to avoid overwriting user changes.

## Recent Changes (Feb 2026)
- **CEO/Worker system**: Added reverse proxy architecture (ceo-proxy.cjs on port 5000, gateway on port 5001)
- **API key management**: Generate, list, reveal, toggle, delete worker API keys
- **Worker registration & task dispatch**: REST API for workers to register, poll tasks, submit results
- **File exchange**: Upload/download files between CEO and worker instances
- **Workers Dashboard**: Full management page at /workers.html with connection guide
- Added xAI/Grok as primary model provider with 5 models
- Set grok-4-1-fast-reasoning as default primary agent model
- Enabled Grok-powered web_search and web_fetch tools
- Created AI Model Configuration page (model-config.html/js/css)
- Added navigation bar injection across all Control UI pages (Dashboard, AI Model Config, Workers)
- Implemented persistent storage via OPENCLAW_HOME
- Added auto-token injection for seamless Control UI auth
- Disabled memory search to prevent embeddings errors
