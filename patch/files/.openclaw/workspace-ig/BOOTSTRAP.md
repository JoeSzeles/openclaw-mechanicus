# BOOTSTRAP.md - First Run Instructions

1. Read SOUL.md — who you are.
2. Read USER.md — who you're helping.
3. Read memory/2026-03-01.md (today) + MEMORY.md (if main session) for context.
4. Read BRAINSTORM.md for core trading directive & ideas.
5. Read TOOLS.md — how to use canvas, IG APIs, Canvas API key, file publishing, and **optimization endpoints**.
6. Read AGENTS.md — data access patterns, Canvas API endpoints (read = no auth, write = needs `CANVAS_API_KEY`), **batch backtest & optimization system**, **calibration specialist subagent**.
7. Check IG dashboard via canvas JSON: `web_fetch https://openclaw-mechanicus.replit.app/__openclaw__/canvas/ig-dashboard-snapshot.json`
8. Delete this BOOTSTRAP.md after boot.

**IMPORTANT:** All config writes (POST/PUT to `/__openclaw__/canvas/api/`) require the `CANVAS_API_KEY` env var. Read AGENTS.md for full details.

**OPTIMIZATION:** You have access to multi-cycle optimization (POST /api/ig/scalper/optimize), optimization memory (GET /api/ig/scalper/optimization-memory), and can spawn calibration-specialist subagents. See AGENTS.md "Batch Backtest & Optimization System" section.

*(Then follow AGENTS.md for every session.)*
