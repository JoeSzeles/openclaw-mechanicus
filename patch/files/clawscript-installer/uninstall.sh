#!/usr/bin/env bash
#
# ClawScript Uninstaller for OpenClaw
# Usage: bash uninstall.sh [openclaw_root] [skills_root]
#
# Auto-detects Windows npm global install paths if no arguments given.
#

_detect_paths() {
  if [ -n "$1" ] && [ -n "$2" ]; then
    OPENCLAW_ROOT="$1"
    SKILLS_ROOT="$2"
    return
  fi

  local home="${HOME:-$USERPROFILE}"
  home="${home:-$(eval echo ~)}"

  if [ -d "$home/.openclaw" ]; then
    OPENCLAW_ROOT="$home/.openclaw"
  else
    OPENCLAW_ROOT=".openclaw"
  fi

  local npm_global=""
  if [ -n "$APPDATA" ] && [ -d "$APPDATA/npm/node_modules/openclaw/skills" ]; then
    npm_global="$APPDATA/npm/node_modules/openclaw/skills"
  elif [ -n "$home" ] && [ -d "$home/AppData/Roaming/npm/node_modules/openclaw/skills" ]; then
    npm_global="$home/AppData/Roaming/npm/node_modules/openclaw/skills"
  fi

  if [ -n "$npm_global" ]; then
    SKILLS_ROOT="$npm_global"
  elif [ -d "$home/.openclaw/skills" ]; then
    SKILLS_ROOT="$home/.openclaw/skills"
  elif [ -d "./skills" ]; then
    SKILLS_ROOT="./skills"
  else
    SKILLS_ROOT="${OPENCLAW_ROOT}/skills"
  fi
}

_detect_paths "$1" "$2"

BOTS_DIR="$SKILLS_ROOT/bots"
STRATS_DIR="$BOTS_DIR/strategies"
CANVAS_DIR="$OPENCLAW_ROOT/canvas"
TEMPLATES_DIR="$CANVAS_DIR/clawscript-templates"
CLAWSKILL_DIR="$SKILLS_ROOT/clawscript"

echo ""
echo "  ClawScript Uninstaller"
echo "  ──────────────────────"
echo "  OpenClaw: $OPENCLAW_ROOT"
echo "  Skills:   $SKILLS_ROOT"
echo ""

REMOVED=0

safe_rm() {
  local path="$1" label="$2"
  if [ -f "$path" ]; then
    rm -f "$path" 2>/dev/null
    echo "  DEL   $label"
    REMOVED=$((REMOVED + 1))
  fi
}

safe_rm_glob() {
  local dir="$1" pattern="$2" label="$3"
  if [ ! -d "$dir" ]; then return 0; fi
  local count=0
  local old_nullglob=$(shopt -p nullglob 2>/dev/null)
  shopt -s nullglob
  for f in "$dir"/$pattern; do
    [ -f "$f" ] || continue
    rm -f "$f" && count=$((count + 1))
  done
  eval "$old_nullglob" 2>/dev/null
  if [ $count -gt 0 ]; then
    echo "  DEL   $label ($count files)"
    REMOVED=$((REMOVED + count))
  fi
}

echo "  [1/6] Parser & libraries"
safe_rm "$BOTS_DIR/clawscript-parser.cjs" "clawscript-parser.cjs"
safe_rm "$BOTS_DIR/indicators.cjs" "indicators.cjs"
safe_rm "$BOTS_DIR/clawscript-ai-handler.cjs" "clawscript-ai-handler.cjs"

echo "  [2/6] OpenClaw stubs"
safe_rm_glob "$BOTS_DIR" "openclaw-*.cjs" "openclaw stubs"

echo "  [3/6] Strategy framework"
safe_rm "$STRATS_DIR/base-strategy.cjs" "base-strategy.cjs"
safe_rm "$STRATS_DIR/index.cjs" "index.cjs"
rmdir "$STRATS_DIR" 2>/dev/null && echo "  DEL   strategies/" || true

echo "  [4/6] Editor files"
safe_rm "$CANVAS_DIR/clawscript-editor.html" "clawscript-editor.html"
safe_rm "$CANVAS_DIR/ig-clawscript-ui.js" "ig-clawscript-ui.js"
safe_rm "$CANVAS_DIR/ig-clawscript-flow.js" "ig-clawscript-flow.js"
safe_rm "$CANVAS_DIR/clawscript-docs.html" "clawscript-docs.html"
safe_rm "$OPENCLAW_ROOT/serve-clawscript.cjs" "serve-clawscript.cjs"

echo "  [5/6] Templates"
if [ -d "$TEMPLATES_DIR" ]; then
  rm -rf "$TEMPLATES_DIR" 2>/dev/null
  echo "  DEL   clawscript-templates/"
  REMOVED=$((REMOVED + 1))
fi

echo "  [6/6] Skill docs"
safe_rm "$CLAWSKILL_DIR/CLAWSCRIPT.md" "CLAWSCRIPT.md"
rmdir "$CLAWSKILL_DIR" 2>/dev/null && echo "  DEL   clawscript/" || true

MANIFEST="$CANVAS_DIR/manifest.json"
if [ -f "$MANIFEST" ] && command -v node >/dev/null 2>&1; then
  node -e "
    var fs = require('fs');
    try {
      var m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
      var f = m.filter(function(e) { return e.file !== 'clawscript-docs.html' && e.file !== 'clawscript-editor.html'; });
      if (f.length !== m.length) { fs.writeFileSync('$MANIFEST', JSON.stringify(f, null, 2)); }
    } catch(e) {}
  " 2>/dev/null
fi

echo ""
echo "  Uninstall complete. Removed $REMOVED file(s)."
echo ""
echo "  To reinstall: bash clawscript/install.sh"
echo ""
