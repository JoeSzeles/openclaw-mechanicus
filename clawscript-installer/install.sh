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

echo "[1/7] Installing parser and indicator library..."
cp "$SCRIPT_DIR/lib/clawscript-parser.cjs" "$BOTS_DIR/"
cp "$SCRIPT_DIR/lib/indicators.cjs" "$BOTS_DIR/"
if [ -f "$SCRIPT_DIR/lib/clawscript-ai-handler.cjs" ]; then
  cp "$SCRIPT_DIR/lib/clawscript-ai-handler.cjs" "$BOTS_DIR/"
fi

echo "[2/7] Installing OpenClaw wrapper stubs..."
for f in "$SCRIPT_DIR"/lib/openclaw/openclaw-*.cjs; do
  cp "$f" "$BOTS_DIR/"
done

echo "[3/7] Installing strategy framework..."
cp "$SCRIPT_DIR/strategies/base-strategy.cjs" "$STRATS_DIR/"
cp "$SCRIPT_DIR/strategies/index.cjs" "$STRATS_DIR/"

echo "[4/7] Installing editor files..."
cp "$SCRIPT_DIR/editor/clawscript-editor.html" "$CANVAS_DIR/"
cp "$SCRIPT_DIR/editor/ig-clawscript-ui.js" "$CANVAS_DIR/"
cp "$SCRIPT_DIR/editor/ig-clawscript-flow.js" "$CANVAS_DIR/"
if [ -f "$SCRIPT_DIR/serve.cjs" ]; then
  cp "$SCRIPT_DIR/serve.cjs" "$CANVAS_DIR/../serve-clawscript.cjs"
fi

echo "[5/7] Installing templates..."
cp "$SCRIPT_DIR/templates/"*.cs "$TEMPLATES_DIR/"

echo "[6/7] Installing documentation..."
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
echo "[7/7] AI Assistant setup..."
echo "  The editor AI chat tries these endpoints in order:"
echo "    1. /api/clawscript/ai      (your server)"
echo "    2. /api/clawscript/ai/chat (your server)"
echo "    3. /api/agent/chat         (OpenClaw gateway)"
echo ""
echo "  To add /api/clawscript/ai to your server:"
echo "    const { handleClawScriptAiChat } = require('./$BOTS_DIR/clawscript-ai-handler.cjs');"
echo "    // In your HTTP handler:"
echo "    if (url === '/api/clawscript/ai') { handleClawScriptAiChat(req, res); return; }"
echo ""
echo "  Or configure a direct API in the editor: click the gear icon next to the model selector."
echo "  Supports any OpenAI-compatible API (Groq, OpenAI, xAI, Ollama, etc.)"
echo ""
echo "  Required env var (any one): GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY"
echo ""

echo "=== ClawScript installed successfully ==="
echo ""
echo "Files installed:"
echo "  Parser:     $BOTS_DIR/clawscript-parser.cjs"
echo "  Indicators: $BOTS_DIR/indicators.cjs"
echo "  AI Handler: $BOTS_DIR/clawscript-ai-handler.cjs"
echo "  Stubs:      $BOTS_DIR/openclaw-*.cjs"
echo "  Strategies: $STRATS_DIR/"
echo "  Editor UI:  $CANVAS_DIR/clawscript-editor.html"
echo "  Editor JS:  $CANVAS_DIR/ig-clawscript-*.js"
echo "  Templates:  $TEMPLATES_DIR/"
echo "  Docs:       $CANVAS_DIR/clawscript-docs.html"
echo "  Reference:  $CLAWSKILL_DIR/CLAWSCRIPT.md"
if [ -f "$CANVAS_DIR/../serve-clawscript.cjs" ]; then
echo "  Server:     $CANVAS_DIR/../serve-clawscript.cjs"
fi
echo ""
echo "Usage:"
echo "  const { parseAndGenerate } = require('./$BOTS_DIR/clawscript-parser.cjs');"
echo "  const { js } = parseAndGenerate(scriptCode, 'MyStrategy');"
echo ""
echo "Run tests:  node $SCRIPT_DIR/test/test-clawscript-parser.cjs"
