#!/usr/bin/env bash
#
# ClawScript Updater for OpenClaw
# Usage: bash update.sh [openclaw_root] [skills_root]
#
# Downloads the latest version from GitHub, nukes old files, and re-installs.
# Auto-detects Windows npm global install paths if no arguments given.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://github.com/JoeSzeles/clawscript.git"

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

CANVAS_DIR="$OPENCLAW_ROOT/canvas"

CUR_VERSION="unknown"
[ -f "$SCRIPT_DIR/VERSION" ] && CUR_VERSION=$(cat "$SCRIPT_DIR/VERSION")

echo ""
echo "  ClawScript Updater"
echo "  ──────────────────"
echo "  Current:  v${CUR_VERSION}"
echo "  OpenClaw: $OPENCLAW_ROOT"
echo "  Skills:   $SKILLS_ROOT"
echo ""

if ! command -v git >/dev/null 2>&1; then
  echo "  ERROR: git is not installed."
  exit 1
fi

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "  Downloading latest from GitHub..."
if ! git clone --depth 1 --quiet "$REPO_URL" "$TEMP_DIR/clawscript" 2>/dev/null; then
  echo "  ERROR: git clone failed. Check network/repo access."
  exit 1
fi

SRC="$TEMP_DIR/clawscript"
NEW_VERSION="unknown"
[ -f "$SRC/VERSION" ] && NEW_VERSION=$(cat "$SRC/VERSION")

echo "  Latest:  v${NEW_VERSION}"
echo ""

echo "  [1/4] Nuking old installed files..."
rm -f "$CANVAS_DIR/clawscript-editor.html" 2>/dev/null && echo "  DEL   canvas/clawscript-editor.html" || true
rm -f "$CANVAS_DIR/ig-clawscript-ui.js" 2>/dev/null && echo "  DEL   canvas/ig-clawscript-ui.js" || true
rm -f "$CANVAS_DIR/ig-clawscript-flow.js" 2>/dev/null && echo "  DEL   canvas/ig-clawscript-flow.js" || true
rm -f "$CANVAS_DIR/clawscript-docs.html" 2>/dev/null && echo "  DEL   canvas/clawscript-docs.html" || true
rm -f "$OPENCLAW_ROOT/serve-clawscript.cjs" 2>/dev/null && echo "  DEL   serve-clawscript.cjs" || true

echo ""
echo "  [2/4] Nuking old installer source files..."
rm -f "$SCRIPT_DIR/editor/clawscript-editor.html" 2>/dev/null
rm -f "$SCRIPT_DIR/editor/ig-clawscript-ui.js" 2>/dev/null
rm -f "$SCRIPT_DIR/editor/ig-clawscript-flow.js" 2>/dev/null
rm -f "$SCRIPT_DIR/serve.cjs" 2>/dev/null
echo "  DEL   old installer editor + serve files"

echo ""
echo "  [3/4] Copying fresh files from GitHub..."

safe_update() {
  local src="$1" dst="$2" label="$3"
  if [ ! -f "$src" ]; then return 0; fi
  rm -f "$dst" 2>/dev/null
  if cp -f "$src" "$dst"; then
    echo "  OK    $label"
  else
    echo "  FAIL  $label"
  fi
}

safe_update_dir() {
  local srcdir="$1" pattern="$2" dstdir="$3" label="$4"
  [ -d "$srcdir" ] || return 0
  local count=0
  local old_nullglob=$(shopt -p nullglob 2>/dev/null)
  shopt -s nullglob
  for f in "$srcdir"/$pattern; do
    [ -f "$f" ] || continue
    local bn=$(basename "$f")
    rm -f "$dstdir/$bn" 2>/dev/null
    cp -f "$f" "$dstdir/" && count=$((count + 1))
  done
  eval "$old_nullglob" 2>/dev/null
  [ $count -gt 0 ] && echo "  OK    $label ($count files)"
}

mkdir -p "$SCRIPT_DIR/editor" "$SCRIPT_DIR/lib" "$SCRIPT_DIR/lib/openclaw" "$SCRIPT_DIR/strategies" "$SCRIPT_DIR/templates" "$SCRIPT_DIR/docs" 2>/dev/null

safe_update "$SRC/editor/clawscript-editor.html" "$SCRIPT_DIR/editor/clawscript-editor.html" "editor/clawscript-editor.html"
safe_update "$SRC/editor/ig-clawscript-ui.js" "$SCRIPT_DIR/editor/ig-clawscript-ui.js" "editor/ig-clawscript-ui.js"
safe_update "$SRC/editor/ig-clawscript-flow.js" "$SCRIPT_DIR/editor/ig-clawscript-flow.js" "editor/ig-clawscript-flow.js"
safe_update_dir "$SRC/lib" "*.cjs" "$SCRIPT_DIR/lib/" "lib/*.cjs"
safe_update_dir "$SRC/lib/openclaw" "*.cjs" "$SCRIPT_DIR/lib/openclaw/" "lib/openclaw/*.cjs"
safe_update_dir "$SRC/strategies" "*.cjs" "$SCRIPT_DIR/strategies/" "strategies/*.cjs"
safe_update_dir "$SRC/templates" "*.cs" "$SCRIPT_DIR/templates/" "templates/*.cs"
safe_update_dir "$SRC/docs" "*" "$SCRIPT_DIR/docs/" "docs/*"
safe_update "$SRC/serve.cjs" "$SCRIPT_DIR/serve.cjs" "serve.cjs"
safe_update "$SRC/VERSION" "$SCRIPT_DIR/VERSION" "VERSION"
safe_update "$SRC/install.sh" "$SCRIPT_DIR/install.sh" "install.sh"
safe_update "$SRC/uninstall.sh" "$SCRIPT_DIR/uninstall.sh" "uninstall.sh"
safe_update "$SRC/update.sh" "$SCRIPT_DIR/update.sh" "update.sh"

echo ""
echo "  [4/4] Running installer..."
echo ""
bash "$SCRIPT_DIR/install.sh" "$OPENCLAW_ROOT" "$SKILLS_ROOT"

echo "  Updated: v${CUR_VERSION} → v${NEW_VERSION}"
echo ""
