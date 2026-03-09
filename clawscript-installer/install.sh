#!/usr/bin/env bash
#
# ClawScript Installer for OpenClaw
# Usage: bash install.sh [openclaw_root] [skills_root]
#   openclaw_root: path to .openclaw directory (default: .openclaw)
#   skills_root:   path to skills directory    (default: skills)
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_ROOT="${1:-.openclaw}"
SKILLS_ROOT="${2:-skills}"

BOTS_DIR="$SKILLS_ROOT/bots"
STRATS_DIR="$BOTS_DIR/strategies"
CANVAS_DIR="$OPENCLAW_ROOT/canvas"
TEMPLATES_DIR="$CANVAS_DIR/clawscript-templates"
CLAWSKILL_DIR="$SKILLS_ROOT/clawscript"

VERSION="unknown"
[ -f "$SCRIPT_DIR/VERSION" ] && VERSION=$(cat "$SCRIPT_DIR/VERSION")

echo ""
echo "  ClawScript Installer v${VERSION}"
echo "  ──────────────────────────────"
echo "  Target: $OPENCLAW_ROOT"
echo ""

ERRORS=0
INSTALLED=0

safe_cp() {
  local src="$1" dst="$2" label="$3"
  if [ ! -f "$src" ]; then
    echo "  SKIP  $label (source not found)"
    return 0
  fi
  rm -f "$dst" 2>/dev/null
  if cp -f "$src" "$dst"; then
    echo "  OK    $label"
    INSTALLED=$((INSTALLED + 1))
  else
    echo "  FAIL  $label"
    ERRORS=$((ERRORS + 1))
  fi
}

safe_cp_glob() {
  local dir="$1" pattern="$2" dst="$3" label="$4"
  if [ ! -d "$dir" ]; then
    echo "  SKIP  $label (directory not found)"
    return 0
  fi
  local count=0 fails=0
  local old_nullglob=$(shopt -p nullglob 2>/dev/null)
  shopt -s nullglob
  for f in "$dir"/$pattern; do
    [ -f "$f" ] || continue
    local basename=$(basename "$f")
    rm -f "$dst/$basename" 2>/dev/null
    if cp -f "$f" "$dst"; then
      count=$((count + 1))
    else
      fails=$((fails + 1))
    fi
  done
  eval "$old_nullglob" 2>/dev/null
  if [ $fails -gt 0 ]; then
    echo "  FAIL  $label ($fails of $((count + fails)) failed)"
    ERRORS=$((ERRORS + fails))
  elif [ $count -gt 0 ]; then
    echo "  OK    $label ($count files)"
    INSTALLED=$((INSTALLED + count))
  else
    echo "  SKIP  $label (no matching files)"
  fi
}

mkdir -p "$BOTS_DIR" "$STRATS_DIR" "$CANVAS_DIR" "$TEMPLATES_DIR" "$CLAWSKILL_DIR" 2>/dev/null

echo "  [1/7] Parser & libraries"
safe_cp "$SCRIPT_DIR/lib/clawscript-parser.cjs" "$BOTS_DIR/clawscript-parser.cjs" "clawscript-parser.cjs"
safe_cp "$SCRIPT_DIR/lib/indicators.cjs" "$BOTS_DIR/indicators.cjs" "indicators.cjs"
safe_cp "$SCRIPT_DIR/lib/clawscript-ai-handler.cjs" "$BOTS_DIR/clawscript-ai-handler.cjs" "clawscript-ai-handler.cjs"

echo "  [2/7] OpenClaw stubs"
safe_cp_glob "$SCRIPT_DIR/lib/openclaw" "openclaw-*.cjs" "$BOTS_DIR/" "openclaw stubs"

echo "  [3/7] Strategy framework"
safe_cp "$SCRIPT_DIR/strategies/base-strategy.cjs" "$STRATS_DIR/base-strategy.cjs" "base-strategy.cjs"
safe_cp "$SCRIPT_DIR/strategies/index.cjs" "$STRATS_DIR/index.cjs" "index.cjs"

echo "  [4/7] Editor files"
rm -f "$CANVAS_DIR/clawscript-editor.html" "$CANVAS_DIR/ig-clawscript-ui.js" "$CANVAS_DIR/ig-clawscript-flow.js" "$OPENCLAW_ROOT/serve-clawscript.cjs" 2>/dev/null
safe_cp "$SCRIPT_DIR/editor/clawscript-editor.html" "$CANVAS_DIR/clawscript-editor.html" "clawscript-editor.html"
safe_cp "$SCRIPT_DIR/editor/ig-clawscript-ui.js" "$CANVAS_DIR/ig-clawscript-ui.js" "ig-clawscript-ui.js"
safe_cp "$SCRIPT_DIR/editor/ig-clawscript-flow.js" "$CANVAS_DIR/ig-clawscript-flow.js" "ig-clawscript-flow.js"
safe_cp "$SCRIPT_DIR/serve.cjs" "$OPENCLAW_ROOT/serve-clawscript.cjs" "serve-clawscript.cjs"

echo "  [5/7] Templates"
safe_cp_glob "$SCRIPT_DIR/templates" "*.cs" "$TEMPLATES_DIR/" "strategy templates"

echo "  [6/7] Documentation"
safe_cp "$SCRIPT_DIR/docs/clawscript-docs.html" "$CANVAS_DIR/clawscript-docs.html" "clawscript-docs.html"
safe_cp "$SCRIPT_DIR/docs/CLAWSCRIPT.md" "$CLAWSKILL_DIR/CLAWSCRIPT.md" "CLAWSCRIPT.md"

echo "  [7/7] Manifest"
MANIFEST="$CANVAS_DIR/manifest.json"
if [ -f "$MANIFEST" ]; then
  if grep -q "clawscript-docs.html" "$MANIFEST" 2>/dev/null; then
    echo "  OK    Already in manifest"
  elif command -v node >/dev/null 2>&1; then
    node -e "
      var fs = require('fs');
      try {
        var m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
        m.push({ name: 'ClawScript Documentation', file: 'clawscript-docs.html', description: 'ClawScript language reference', category: 'Documentation' });
        fs.writeFileSync('$MANIFEST', JSON.stringify(m, null, 2));
      } catch(e) {}
    " 2>/dev/null && echo "  OK    Manifest updated" || echo "  SKIP  Manifest update failed"
  else
    echo "  SKIP  Manifest (node not available)"
  fi
else
  printf '[{"name":"ClawScript Documentation","file":"clawscript-docs.html","category":"Documentation"}]' > "$MANIFEST" 2>/dev/null
  echo "  OK    Manifest created"
fi

echo ""
echo "  ── Verify ──"
VERIFY_FAIL=0
for check_file in "$CANVAS_DIR/clawscript-editor.html" "$CANVAS_DIR/ig-clawscript-ui.js" "$CANVAS_DIR/ig-clawscript-flow.js"; do
  if [ -f "$check_file" ]; then
    local_size=$(wc -c < "$check_file" 2>/dev/null | tr -d ' ')
    local_name=$(basename "$check_file")
    src_size=$(wc -c < "$SCRIPT_DIR/editor/$local_name" 2>/dev/null | tr -d ' ')
    if [ "$local_size" = "$src_size" ]; then
      echo "  ✓ $local_name (${local_size}b)"
    else
      echo "  ✗ $local_name (installed=${local_size}b, source=${src_size}b) SIZE MISMATCH"
      VERIFY_FAIL=$((VERIFY_FAIL + 1))
    fi
  else
    echo "  ✗ $(basename "$check_file") MISSING"
    VERIFY_FAIL=$((VERIFY_FAIL + 1))
  fi
done

echo ""
if [ $ERRORS -eq 0 ] && [ $VERIFY_FAIL -eq 0 ]; then
  echo "  Install complete (v${VERSION}). ${INSTALLED} files, no errors."
else
  echo "  Install complete with $ERRORS copy error(s), $VERIFY_FAIL verify error(s)."
fi
echo ""
echo "  Editor: $CANVAS_DIR/clawscript-editor.html"
echo "  Server: node $OPENCLAW_ROOT/serve-clawscript.cjs"
echo ""
echo "  AI: click ⚙ in AI Assistant → Auto-Find Agents"
echo ""
