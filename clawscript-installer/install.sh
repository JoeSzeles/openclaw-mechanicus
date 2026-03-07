#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OPENCLAW_ROOT="${1:-.openclaw}"
SKILLS_ROOT="${2:-skills}"

echo "=== ClawScript Installer for OpenClaw ==="
echo "OpenClaw root: $OPENCLAW_ROOT"
echo "Skills root:   $SKILLS_ROOT"
echo ""

BOTS_DIR="$SKILLS_ROOT/bots"
STRATS_DIR="$BOTS_DIR/strategies"
CANVAS_DIR="$OPENCLAW_ROOT/canvas"
TEMPLATES_DIR="$CANVAS_DIR/clawscript-templates"
CLAWSKILL_DIR="$SKILLS_ROOT/clawscript"

mkdir -p "$BOTS_DIR" "$STRATS_DIR" "$CANVAS_DIR" "$TEMPLATES_DIR" "$CLAWSKILL_DIR"

echo "[1/6] Installing parser and indicator library..."
cp "$SCRIPT_DIR/lib/clawscript-parser.cjs" "$BOTS_DIR/"
cp "$SCRIPT_DIR/lib/indicators.cjs" "$BOTS_DIR/"

echo "[2/6] Installing OpenClaw wrapper stubs..."
for f in "$SCRIPT_DIR"/lib/openclaw/openclaw-*.cjs; do
  cp "$f" "$BOTS_DIR/"
done

echo "[3/6] Installing strategy framework..."
cp "$SCRIPT_DIR/strategies/base-strategy.cjs" "$STRATS_DIR/"
cp "$SCRIPT_DIR/strategies/index.cjs" "$STRATS_DIR/"

echo "[4/6] Installing editor files..."
cp "$SCRIPT_DIR/editor/ig-clawscript-ui.js" "$CANVAS_DIR/"
cp "$SCRIPT_DIR/editor/ig-clawscript-flow.js" "$CANVAS_DIR/"

echo "[5/6] Installing templates..."
cp "$SCRIPT_DIR/templates/"*.cs "$TEMPLATES_DIR/"

echo "[6/6] Installing documentation..."
cp "$SCRIPT_DIR/docs/clawscript-docs.html" "$CANVAS_DIR/"
cp "$SCRIPT_DIR/docs/CLAWSCRIPT.md" "$CLAWSKILL_DIR/"

MANIFEST="$CANVAS_DIR/manifest.json"
if [ -f "$MANIFEST" ]; then
  if ! grep -q "clawscript-docs.html" "$MANIFEST"; then
    echo ""
    echo "Adding ClawScript docs to canvas manifest..."
    TMP=$(mktemp)
    node -e "
      const fs = require('fs');
      const m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
      m.push({
        name: 'ClawScript Documentation',
        file: 'clawscript-docs.html',
        description: 'Comprehensive ClawScript language reference: all commands, grammar, editor usage, flow builder, and sample strategies',
        category: 'Documentation'
      });
      fs.writeFileSync('$MANIFEST', JSON.stringify(m, null, 2));
    "
    echo "Manifest updated."
  else
    echo "ClawScript docs already in manifest."
  fi
else
  echo ""
  echo "No manifest.json found at $MANIFEST — creating one..."
  cat > "$MANIFEST" << 'MANIFEST_EOF'
[
  {
    "name": "ClawScript Documentation",
    "file": "clawscript-docs.html",
    "description": "Comprehensive ClawScript language reference: all commands, grammar, editor usage, flow builder, and sample strategies",
    "category": "Documentation"
  }
]
MANIFEST_EOF
fi

echo ""
echo "=== ClawScript installed successfully ==="
echo ""
echo "Files installed:"
echo "  Parser:     $BOTS_DIR/clawscript-parser.cjs"
echo "  Indicators: $BOTS_DIR/indicators.cjs"
echo "  Stubs:      $BOTS_DIR/openclaw-*.cjs"
echo "  Strategies: $STRATS_DIR/"
echo "  Editor:     $CANVAS_DIR/ig-clawscript-*.js"
echo "  Templates:  $TEMPLATES_DIR/"
echo "  Docs:       $CANVAS_DIR/clawscript-docs.html"
echo "  Reference:  $CLAWSKILL_DIR/CLAWSCRIPT.md"
echo ""
echo "Usage:"
echo "  const { parseAndGenerate } = require('./$BOTS_DIR/clawscript-parser.cjs');"
echo "  const { js } = parseAndGenerate(scriptCode, 'MyStrategy');"
echo ""
echo "Run tests:  node $SCRIPT_DIR/test/test-clawscript-parser.cjs"
