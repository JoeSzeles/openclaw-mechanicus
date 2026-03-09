#!/usr/bin/env bash
#
# ClawScript Updater for OpenClaw
# Usage: bash update.sh [openclaw_root] [skills_root]
#
# Downloads the latest version from GitHub and re-installs.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://github.com/JoeSzeles/clawscript.git"
OPENCLAW_ROOT="${1:-.openclaw}"
SKILLS_ROOT="${2:-skills}"

CUR_VERSION="unknown"
[ -f "$SCRIPT_DIR/VERSION" ] && CUR_VERSION=$(cat "$SCRIPT_DIR/VERSION")

echo ""
echo "  ClawScript Updater"
echo "  ──────────────────"
echo "  Current: v${CUR_VERSION}"
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

if [ "$CUR_VERSION" = "$NEW_VERSION" ] && [ "$CUR_VERSION" != "unknown" ]; then
  echo "  Already up to date."
  echo ""
  exit 0
fi

echo "  Updating installer files..."

safe_update() {
  local src="$1" dst="$2"
  [ -f "$src" ] && cp -f "$src" "$dst" 2>/dev/null
}

safe_update_dir() {
  local srcdir="$1" pattern="$2" dstdir="$3"
  [ -d "$srcdir" ] || return 0
  local old_nullglob=$(shopt -p nullglob 2>/dev/null)
  shopt -s nullglob
  for f in "$srcdir"/$pattern; do
    [ -f "$f" ] && cp -f "$f" "$dstdir"
  done
  eval "$old_nullglob" 2>/dev/null
}

mkdir -p "$SCRIPT_DIR/editor" "$SCRIPT_DIR/lib" "$SCRIPT_DIR/lib/openclaw" "$SCRIPT_DIR/strategies" "$SCRIPT_DIR/templates" "$SCRIPT_DIR/docs" 2>/dev/null

safe_update "$SRC/editor/clawscript-editor.html" "$SCRIPT_DIR/editor/"
safe_update "$SRC/editor/ig-clawscript-ui.js" "$SCRIPT_DIR/editor/"
safe_update "$SRC/editor/ig-clawscript-flow.js" "$SCRIPT_DIR/editor/"
safe_update_dir "$SRC/lib" "*.cjs" "$SCRIPT_DIR/lib/"
safe_update_dir "$SRC/lib/openclaw" "*.cjs" "$SCRIPT_DIR/lib/openclaw/"
safe_update_dir "$SRC/strategies" "*.cjs" "$SCRIPT_DIR/strategies/"
safe_update_dir "$SRC/templates" "*.cs" "$SCRIPT_DIR/templates/"
safe_update_dir "$SRC/docs" "*" "$SCRIPT_DIR/docs/"
safe_update "$SRC/serve.cjs" "$SCRIPT_DIR/"
safe_update "$SRC/VERSION" "$SCRIPT_DIR/"
safe_update "$SRC/install.sh" "$SCRIPT_DIR/"
safe_update "$SRC/uninstall.sh" "$SCRIPT_DIR/"
safe_update "$SRC/update.sh" "$SCRIPT_DIR/"

echo "  Running installer..."
echo ""
bash "$SCRIPT_DIR/install.sh" "$OPENCLAW_ROOT" "$SKILLS_ROOT"

echo "  Updated: v${CUR_VERSION} → v${NEW_VERSION}"
echo ""
