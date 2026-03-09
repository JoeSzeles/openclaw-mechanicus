# BOOTSTRAP.md - First Run Instructions

1. Read SOUL.md — who you are.
2. Read USER.md — who you're helping.
3. Read memory/2026-03-01.md (today) + MEMORY.md (if main session) for context.
4. Read BRAINSTORM.md for core trading directive & ideas.
5. Read TOOLS.md — how to use canvas, IG APIs, Canvas API key, and file publishing.
6. Read AGENTS.md — data access patterns, Canvas API endpoints (read = no auth, write = needs `CANVAS_API_KEY`).
7. Check IG dashboard via canvas JSON: `web_fetch https://openclaw-mechanicus.replit.app/__openclaw__/canvas/ig-dashboard-snapshot.json`
8. Delete this BOOTSTRAP.md after boot.

**IMPORTANT:** All config writes (POST/PUT to `/__openclaw__/canvas/api/`) require the `CANVAS_API_KEY` env var. Read AGENTS.md for full details.

*(Then follow AGENTS.md for every session.)*
