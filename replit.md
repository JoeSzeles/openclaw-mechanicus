# OpenClaw

## Overview
OpenClaw is a multi-channel AI gateway with extensible messaging integrations. It provides a WebSocket-based gateway server with a web-based control UI dashboard for managing AI chat sessions, channels, agents, and configuration.

## Current State
- Running on Replit with Node.js 22
- Gateway server bound to 0.0.0.0:5000 with LAN bind mode
- Control UI pre-built in dist/control-ui/
- Channels are skipped (OPENCLAW_SKIP_CHANNELS=1) for basic operation
- Persistent storage in `/home/runner/workspace/.openclaw/` via OPENCLAW_HOME

## Project Architecture
- **Language**: TypeScript (Node.js >= 22.12.0)
- **Package Manager**: pnpm (10.23.0 specified in packageManager field)
- **Build Tool**: tsdown (TypeScript bundler)
- **UI**: Vite-based Lit web components in `ui/` directory, built to `dist/control-ui/`
- **Entry Point**: `dist/entry.js` (compiled from `src/entry.ts`)
- **Gateway CLI**: `node dist/entry.js gateway [options]`

## Key Directories
- `src/` - TypeScript source code
- `src/gateway/` - Gateway server implementation
- `src/cli/` - CLI command handlers
- `src/config/` - Configuration loading
- `ui/` - Control UI (Vite + Lit)
- `dist/` - Built output
- `dist/control-ui/` - Built UI assets
- `.openclaw/` - Persistent OpenClaw data (config, agents, sessions, bootstrap.md)

## Persistent Storage
- `OPENCLAW_HOME` is set to `/home/runner/workspace` in start.sh
- All OpenClaw data lives in `/home/runner/workspace/.openclaw/` which persists across restarts
- Config file: `.openclaw/openclaw.json`
- Agent data: `.openclaw/agents/`
- Bootstrap: `.openclaw/bootstrap.md`
- The `.openclaw/` directory is in .gitignore to avoid committing user data
- To clear all data: delete `.openclaw/` directory and restart

## Environment Variables
- `OPENCLAW_GATEWAY_PORT` - Gateway port (set to 5000)
- `OPENCLAW_GATEWAY_TOKEN` - Auth token for gateway access
- `OPENCLAW_SKIP_CHANNELS` - Skip channel initialization (set to 1)
- `COREPACK_ENABLE_STRICT` - Must be 0 to avoid pnpm version conflicts
- `OPENCLAW_HOME` - Set to /home/runner/workspace for persistent storage

## Workflow
- **Start application**: Runs gateway server on port 5000 with LAN bind mode

## Build Steps
1. Install deps: `npx pnpm@10.23.0 install --no-frozen-lockfile`
2. Build main project: Already pre-built in dist/
3. Build UI: `cd ui && npx pnpm@10.23.0 run build`

## User Preferences
- **Workflow restart**: Always use `kill -9 1` to force-kill before restarting. Never use pkill or soft kills - they hang.
- start.sh has `trap 'kill -9 1' TERM INT` to support clean restarts.
- **Persistent storage**: User wants all OpenClaw data (bootstrap.md, agents, sessions, config) to persist across restarts and be manually clearable.

## Custom Pages
- `dist/control-ui/model-config.html` - AI Model Configuration page (standalone HTML+JS+CSS)
- `dist/control-ui/model-config.js` - JS logic for model config page
- `dist/control-ui/model-config.css` - Styles for model config page

## Gateway WebSocket Protocol
- Frame format: `{ type: "req", id: "unique-id", method: "methodName", params: {} }`
- Response format: `{ type: "res", id: "matching-id", ok: true/false, payload: {} }` (note: uses `payload` not `result`)
- Connect handshake: method "connect" with params including minProtocol/maxProtocol (both 3), client info, auth, role, scopes
- Valid client IDs: openclaw-control-ui, webchat-ui, webchat, cli, etc.
- Valid modes: webchat, cli, ui, backend, node, probe, test
- Scopes: operator.admin (full access), operator.read, operator.write, operator.approvals, operator.pairing
- config.get returns `{ payload: { path, exists, raw (JSON string), hash } }`
- config.set takes `{ raw: "JSON string", baseHash: "hash" }` and returns `{ payload: { ok, path, config } }`
- config.* methods require operator.admin scope (config.get is in READ_METHODS but admin scope bypasses all checks)
- CSP blocks inline scripts in control-ui pages; must use external .js files
- Origin check: allowedOrigins in openclaw.json must include the Replit proxy URL for browser WebSocket connections
