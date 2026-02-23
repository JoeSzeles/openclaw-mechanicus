# Worker Bee System

The Worker Bee system enables OpenClaw Cloud (the CEO) to dispatch tasks to local OpenClaw instances running on remote machines. Workers connect over the internet via REST API polling, receive tasks, process them through their local AI agent, and return results that appear directly in the CEO's Dashboard chat.

## Architecture

```
+----------------------------+          +----------------------------+
|     OpenClaw Cloud (CEO)   |          |   Local Machine (Worker)   |
|                            |          |                            |
|  CEO Proxy (port 5000)     |  REST    |  Worker Script             |
|  - /api/workers/*          | <------> |  - Registers with CEO      |
|  - /api/tasks/*            |  HTTPS   |  - Polls for tasks         |
|  - /api/dispatch           |          |  - Submits results         |
|  - /api/exchange/*         |          |                            |
|  - /api/chat               |          |  Local OpenClaw Gateway    |
|                            |          |  - /v1/chat/completions    |
|  Gateway (port 5001)       |          |  - AI agent processing     |
|  - Dashboard chat UI       |          +----------------------------+
|  - WebSocket connections   |
|  - Agent (Grok/GPT)        |
+----------------------------+
```

## How It Works

### 1. Setup
1. Open the Workers Dashboard at `/workers.html`
2. Generate an API key (format: `ocw_...`)
3. Copy the connection script (PowerShell or Bash) from the Connection Guide tab
4. Replace `YOUR_API_KEY_HERE` with the generated key
5. Run the script on the worker machine

### 2. Connection Lifecycle
1. **Register**: Worker sends POST `/api/workers/register` with its name, platform, agentId, and version
2. **Poll Loop**: Worker polls GET `/api/workers/poll` every few seconds for pending tasks
3. **Heartbeat**: Worker sends POST `/api/workers/heartbeat` periodically to stay "online"
4. **Task Processing**: When a task arrives, the worker processes it (optionally via local AI agent)
5. **Result Submission**: Worker sends POST `/api/workers/result` with the task result
6. **Status**: Workers show as "online" if active within 60 seconds, "stale" otherwise. Workers are stored in-memory and clear on server restart

### 3. Message Flow

**User sends `@WorkerName message` in Dashboard chat:**
```
User types "@DESKTOP-N1TGQ67 tell me a joke"
    |
    v
worker-chat.js intercepts chat.send (browser-side)
    |
    v
POST /api/dispatch { workerName, message }
    |
    v
CEO Proxy creates task, injects "CEO -> Worker" into chat
    |
    v
Worker polls, receives task
    |
    v
Worker processes via local AI agent (or returns acknowledgment)
    |
    v
POST /api/workers/result { taskId, result }
    |
    v
CEO Proxy saves to chat, injects result into Dashboard via WebSocket chat.inject
    |
    v
Result appears as chat bubble in Dashboard
```

**CEO agent dispatches via @mention in its response:**
```
User asks CEO: "tell the worker to say hello"
    |
    v
CEO agent responds with "@DESKTOP-N1TGQ67 say hello"
    |
    v
Server-side agent watcher detects @WorkerName in response
    |
    v
CEO Proxy creates task, injects "CEO -> Worker" into chat
    |
    v
(Same flow as above from worker poll onward)
```

## API Reference

### Authentication

All endpoints require an `Authorization: Bearer <token>` header.

- **CEO/Gateway endpoints** (`/api/keys`, `/api/tasks`, `/api/dispatch`, `/api/workers` GET/DELETE): Use the gateway token (`OPENCLAW_GATEWAY_TOKEN`)
- **Worker endpoints** (`/api/workers/register`, `/api/workers/heartbeat`, `/api/workers/poll`, `/api/workers/result`): Use a worker API key (`ocw_...`)

### API Key Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/keys` | List all API keys (previews only, keys are masked) |
| POST | `/api/keys` | Generate a new API key. Returns `{ id, key, name, preview, enabled }` |
| POST | `/api/keys/:id/reveal` | Reveal the full API key value |
| PUT | `/api/keys/:id/toggle` | Toggle a key between enabled/disabled |
| DELETE | `/api/keys/:id` | Permanently delete an API key |

### Worker Registration & Communication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workers/register` | Register a worker. Body: `{ name, agentId, platform, version }`. Returns `{ workerId, status }` |
| POST | `/api/workers/heartbeat` | Send heartbeat to stay online. No body required. |
| GET | `/api/workers/poll` | Poll for pending tasks. Returns `{ tasks: [...] }` |
| POST | `/api/workers/result` | Submit task result. Body: `{ taskId, result }` |
| GET | `/api/workers` | List all connected workers with status (online/stale) |
| DELETE | `/api/workers/:id` | Disconnect/remove a worker manually |

### Task Management

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/dispatch` | Dispatch by worker name. Body: `{ workerName, message }`. Returns `{ ok, taskId, workerName }` |
| GET | `/api/tasks` | List all tasks and results |
| POST | `/api/tasks` | Create a task directly. Body: `{ assignedTo (workerId), type, message, filePath }` |
| DELETE | `/api/tasks` | Clear all task history |
| DELETE | `/api/tasks/:id` | Delete a specific task |

### File Exchange

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/exchange` | List files in the exchange folder |
| GET | `/api/exchange/download/:file` | Download a file from exchange |
| POST | `/api/exchange/upload` | Upload a file to exchange (multipart/form-data) |
| DELETE | `/api/exchange/:file` | Delete a file from exchange |

### Chat

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chat` | Get chat messages. Query params: `?since=ISO_TIMESTAMP&limit=N` |
| POST | `/api/chat` | Post a chat message. Body: `{ from, text }` |
| DELETE | `/api/chat` | Clear all chat history |

## Task Object

```json
{
  "id": "uuid",
  "assignedTo": "worker-api-key-id",
  "type": "message",
  "message": "@CEO: tell me a joke",
  "filePath": null,
  "status": "pending",
  "createdAt": "2026-02-23T17:00:00.000Z",
  "completedAt": null,
  "result": null
}
```

**Task types:**
- `message` -- Send a text message to the worker
- `file_read` -- Request a file from the worker
- `file_write` -- Send a file to be written on the worker
- `file_upload` -- Request the worker to upload a file to exchange

**Task statuses:**
- `pending` -- Waiting for worker to pick up
- `completed` -- Worker has submitted a result

## Worker Script Behavior

The connection scripts (PowerShell and Bash) generated on the Workers Dashboard perform:

1. **Registration**: POST to `/api/workers/register` with the machine's hostname as the worker name
2. **Banner display**: Shows connection status and CEO URL
3. **Poll loop**: Every 5 seconds, polls `/api/workers/poll` for pending tasks
4. **Task handling**: When a message task arrives:
   - If a local OpenClaw agent is running, forwards the message to `localhost:5001/v1/chat/completions`
   - If no local agent, returns an acknowledgment with the received message
5. **Result submission**: POSTs the result back to `/api/workers/result`
6. **Chat polling**: Checks `/api/chat` for new CEO messages and displays them
7. **Heartbeat**: Sends periodic heartbeats to maintain "online" status
8. **Workspace folder**: Creates a `ceo-workspace` folder for file exchange operations

## Worker Status

- **Online**: Worker has sent a heartbeat, polled, or submitted a result within the last 60 seconds
- **Stale**: Worker hasn't communicated for more than 60 seconds (still registered but likely disconnected)
- Workers are stored in-memory on the CEO -- all worker registrations clear on server restart and workers must re-register

## Data Storage

All Worker Bee data is stored in the `.openclaw/` directory:

| File | Contents |
|------|----------|
| `.openclaw/api-keys.json` | Generated API keys for workers |
| `.openclaw/worker-tasks.json` | Task queue and results history |
| `.openclaw/ceo-chat.json` | CEO/Worker chat message history |
| `.openclaw/exchange/` | File exchange directory |

## Security

- API keys are generated server-side with cryptographic randomness (format: `ocw_` + 48 random hex chars)
- Keys can be toggled (enabled/disabled) without deletion
- Worker endpoints validate the API key on every request
- CEO/Gateway endpoints require the gateway token
- All communication uses HTTPS (via Replit's proxy)
- API keys should be kept secret -- they grant full worker access to the CEO

## Limitations

- Workers are stored in-memory -- they need to re-register after CEO restarts
- Task queue is file-based (JSON) -- not designed for high-throughput scenarios
- Worker name matching is case-insensitive but must be exact
- The `@WorkerName` dispatch only triggers on the `@` symbol -- plain name mentions are ignored
- Server-side agent watcher has a 30-second cooldown per worker to prevent dispatch spam
- File exchange has no size limits enforced (limited by Replit storage)
