#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://github.com/JoeSzeles/clawscript.git"
OPENCLAW_ROOT="${1:-.openclaw}"
SKILLS_ROOT="${2:-skills}"

echo "=== ClawScript Updater ==="
echo ""

TEMP_DIR=$(mktemp -d)
trap "rm -rf '$TEMP_DIR'" EXIT

echo "[1/3] Downloading latest version from GitHub..."
git clone --depth 1 "$REPO_URL" "$TEMP_DIR/clawscript" 2>&1 | grep -v "^$"

NEW_VERSION="unknown"
if [ -f "$TEMP_DIR/clawscript/VERSION" ]; then
  NEW_VERSION=$(cat "$TEMP_DIR/clawscript/VERSION")
fi

CUR_VERSION="unknown"
if [ -f "$SCRIPT_DIR/VERSION" ]; then
  CUR_VERSION=$(cat "$SCRIPT_DIR/VERSION")
fi

echo ""
echo "  Current version: $CUR_VERSION"
echo "  Latest version:  $NEW_VERSION"
echo ""

echo "[2/3] Updating local installer files..."
cp -f "$TEMP_DIR/clawscript/editor/ig-clawscript-ui.js" "$SCRIPT_DIR/editor/"
cp -f "$TEMP_DIR/clawscript/editor/ig-clawscript-flow.js" "$SCRIPT_DIR/editor/"
cp -f "$TEMP_DIR/clawscript/editor/clawscript-editor.html" "$SCRIPT_DIR/editor/"
cp -f "$TEMP_DIR/clawscript/lib/"*.cjs "$SCRIPT_DIR/lib/"
if [ -d "$TEMP_DIR/clawscript/templates" ]; then
  cp -f "$TEMP_DIR/clawscript/templates/"*.cs "$SCRIPT_DIR/templates/" 2>/dev/null || true
fi
if [ -d "$TEMP_DIR/clawscript/docs" ]; then
  cp -f "$TEMP_DIR/clawscript/docs/"* "$SCRIPT_DIR/docs/" 2>/dev/null || true
fi
if [ -f "$TEMP_DIR/clawscript/serve.cjs" ]; then
  cp -f "$TEMP_DIR/clawscript/serve.cjs" "$SCRIPT_DIR/"
fi
if [ -f "$TEMP_DIR/clawscript/VERSION" ]; then
  cp -f "$TEMP_DIR/clawscript/VERSION" "$SCRIPT_DIR/"
fi
if [ -f "$TEMP_DIR/clawscript/install.sh" ]; then
  cp -f "$TEMP_DIR/clawscript/install.sh" "$SCRIPT_DIR/"
fi
if [ -f "$TEMP_DIR/clawscript/uninstall.sh" ]; then
  cp -f "$TEMP_DIR/clawscript/uninstall.sh" "$SCRIPT_DIR/"
fi
if [ -f "$TEMP_DIR/clawscript/update.sh" ]; then
  cp -f "$TEMP_DIR/clawscript/update.sh" "$SCRIPT_DIR/"
fi

echo "[3/3] Re-installing into OpenClaw..."
bash "$SCRIPT_DIR/install.sh" "$OPENCLAW_ROOT" "$SKILLS_ROOT"

echo ""
echo "=== ClawScript updated to $NEW_VERSION ==="
