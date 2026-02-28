---
title: "TOOLS.md Template"
summary: "Workspace template for TOOLS.md"
read_when:
  - Bootstrapping a workspace manually
---

# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Canvas / Visual Output

When you need to show visual results — dashboards, charts, reports, or any HTML page — use the **canvas system**:

1. Write an HTML file to `.openclaw/canvas/your-page.html`
2. It becomes accessible at `https://{REPLIT_DEV_DOMAIN}/__openclaw__/canvas/your-page.html` (no auth needed)
3. Register it in `.openclaw/canvas/manifest.json` so it appears on the Canvas hub:
   - Read the file (JSON array), add `{"name": "Page Name", "file": "your-page.html", "description": "What it shows", "category": "Skills"}`
   - Categories: `Trading`, `Crypto`, `Skills`, or custom (defaults to `Other`)
4. Always give the user a FULL URL with the domain — read the `REPLIT_DEV_DOMAIN` environment variable and use that as the domain. **NEVER** invent, guess, or fabricate a domain. The env var is the single source of truth.
5. Use CDN libraries freely (Chart.js, D3, etc.)
6. **Never** start a web server or use custom ports — canvas is the only way

The Canvas hub is at `https://{REPLIT_DEV_DOMAIN}/__openclaw__/canvas/`.

---

Add whatever helps you do your job. This is your cheat sheet.
