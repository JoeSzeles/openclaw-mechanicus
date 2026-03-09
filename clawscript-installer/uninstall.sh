#!/usr/bin/env bash
set -e

OPENCLAW_ROOT="${1:-.openclaw}"
SKILLS_ROOT="${2:-skills}"

echo "=== ClawScript Uninstaller ==="
echo "OpenClaw root: $OPENCLAW_ROOT"
echo "Skills root:   $SKILLS_ROOT"
echo ""

BOTS_DIR="$SKILLS_ROOT/bots"
STRATS_DIR="$BOTS_DIR/strategies"
CANVAS_DIR="$OPENCLAW_ROOT/canvas"
TEMPLATES_DIR="$CANVAS_DIR/clawscript-templates"
CLAWSKILL_DIR="$SKILLS_ROOT/clawscript"

echo "[1/6] Removing parser and libraries..."
rm -f "$BOTS_DIR/clawscript-parser.cjs"
rm -f "$BOTS_DIR/indicators.cjs"
rm -f "$BOTS_DIR/clawscript-ai-handler.cjs"

echo "[2/6] Removing OpenClaw wrapper stubs..."
rm -f "$BOTS_DIR"/openclaw-*.cjs

echo "[3/6] Removing strategy framework..."
rm -f "$STRATS_DIR/base-strategy.cjs"
rm -f "$STRATS_DIR/index.cjs"
rmdir "$STRATS_DIR" 2>/dev/null || true

echo "[4/6] Removing editor files..."
rm -f "$CANVAS_DIR/clawscript-editor.html"
rm -f "$CANVAS_DIR/ig-clawscript-ui.js"
rm -f "$CANVAS_DIR/ig-clawscript-flow.js"
rm -f "$CANVAS_DIR/clawscript-docs.html"
rm -f "$OPENCLAW_ROOT/serve-clawscript.cjs"

echo "[5/6] Removing templates..."
rm -rf "$TEMPLATES_DIR"

echo "[6/6] Removing skill docs..."
rm -f "$CLAWSKILL_DIR/CLAWSCRIPT.md"
rmdir "$CLAWSKILL_DIR" 2>/dev/null || true

echo ""
echo "Cleaning up manifest..."
MANIFEST="$CANVAS_DIR/manifest.json"
if [ -f "$MANIFEST" ]; then
  node -e "
    const fs = require('fs');
    try {
      const m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
      const filtered = m.filter(e => e.file !== 'clawscript-docs.html' && e.file !== 'clawscript-editor.html');
      fs.writeFileSync('$MANIFEST', JSON.stringify(filtered, null, 2));
      console.log('Manifest cleaned.');
    } catch(e) { console.log('Could not update manifest:', e.message); }
  " 2>/dev/null || echo "Manifest cleanup skipped (node not available)."
fi

echo ""
echo "=== ClawScript uninstalled ==="
echo ""
echo "The following directories were NOT removed (may contain other files):"
echo "  $BOTS_DIR"
echo "  $CANVAS_DIR"
echo "  $SKILLS_ROOT"
echo ""
echo "To reinstall: bash clawscript/install.sh"
