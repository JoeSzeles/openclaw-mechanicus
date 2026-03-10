#!/bin/bash
echo "[start] Starting OpenClaw Cloud..."
echo "[start] CWD: $(pwd)"
echo "[start] HOME: $HOME"
echo "[start] Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "[start] Date: $(date -u)"
echo "[start] PID: $$ (PID 1: $(cat /proc/1/comm 2>/dev/null || echo unknown))"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
echo "[start] Workspace: $SCRIPT_DIR"

if [ "$$" = "1" ]; then
  echo "[start] Running as PID 1 (deployment mode)"
else
  trap 'kill -9 1' TERM INT
fi

if [ ! -d "node_modules/ws" ] || [ ! -d "node_modules/lightstreamer-client-node" ]; then
  echo "[start] Installing runtime dependencies..."
  npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit --no-fund 2>&1 | tail -5
  echo "[start] npm install done (exit: $?)"
fi

if [ ! -f "dist/entry.js" ]; then
  echo "[start] FATAL: dist/entry.js not found — cannot start gateway"
  exit 1
fi

TOKEN="${OPENCLAW_GATEWAY_TOKEN}"
TOKEN_JS="$SCRIPT_DIR/dist/control-ui/token-init.js"
CACHE_BUST=$(date +%s)

if [ -d "$SCRIPT_DIR/dist/control-ui" ]; then
  cat > "$TOKEN_JS" << JSEOF
(function(){var K="openclaw.control.settings.v1";var T="${TOKEN}";try{var r=localStorage.getItem(K);var s=r?JSON.parse(r):{};if(s.token!==T){s.token=T;localStorage.setItem(K,JSON.stringify(s))}}catch(e){}})();
JSEOF

  for htmlfile in "$SCRIPT_DIR/dist/control-ui/model-config.html" "$SCRIPT_DIR/dist/control-ui/workers.html" "$SCRIPT_DIR/dist/control-ui/processes.html"; do
    if [ -f "$htmlfile" ]; then
      sed -i "s|\.js\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile" 2>/dev/null || true
      sed -i "s|\.js?v=[0-9]*\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile" 2>/dev/null || true
    fi
  done
fi

export OPENAI_API_KEY="${AI_INTEGRATIONS_OPENAI_API_KEY}"
export OPENAI_BASE_URL="${AI_INTEGRATIONS_OPENAI_BASE_URL}"

export OPENCLAW_HOME="$SCRIPT_DIR"

TEMPLATES_SRC="$SCRIPT_DIR/docs/reference/templates"
TEMPLATES_DIST="$SCRIPT_DIR/dist/docs/reference/templates"
if [ -d "$TEMPLATES_SRC" ]; then
  mkdir -p "$TEMPLATES_DIST" 2>/dev/null || true
  cp -f "$TEMPLATES_SRC"/*.md "$TEMPLATES_DIST/" 2>/dev/null || true
  ln -sf "$SCRIPT_DIR/docs" /home/runner/docs 2>/dev/null || true
  mkdir -p /home/runner/docs/reference/templates 2>/dev/null || true
  cp -f "$TEMPLATES_SRC"/*.md /home/runner/docs/reference/templates/ 2>/dev/null || true
  echo "[start] Workspace templates synced ($(ls "$TEMPLATES_SRC"/*.md 2>/dev/null | wc -l) files)"
fi

PERSISTENT_DIR="$SCRIPT_DIR/.openclaw"
mkdir -p "$PERSISTENT_DIR"
if [ ! -f "$PERSISTENT_DIR/openclaw.json" ] && [ -f "$SCRIPT_DIR/openclaw.json" ]; then
  cp "$SCRIPT_DIR/openclaw.json" "$PERSISTENT_DIR/openclaw.json"
fi

PUBLISHED_ORIGIN="https://openclaw-mechanicus.replit.app"
if [ -f "$PERSISTENT_DIR/openclaw.json" ] && ! grep -q "$PUBLISHED_ORIGIN" "$PERSISTENT_DIR/openclaw.json" 2>/dev/null; then
  node -e "
    const fs = require('fs');
    const f = '$PERSISTENT_DIR/openclaw.json';
    try {
      const c = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (!c.gateway) c.gateway = {};
      if (!c.gateway.controlUi) c.gateway.controlUi = {};
      if (!c.gateway.controlUi.allowedOrigins) c.gateway.controlUi.allowedOrigins = [];
      if (!c.gateway.controlUi.allowedOrigins.includes('$PUBLISHED_ORIGIN')) {
        c.gateway.controlUi.allowedOrigins.unshift('$PUBLISHED_ORIGIN');
        fs.writeFileSync(f, JSON.stringify(c, null, 2));
        console.log('[start] Added published origin to persistent config');
      }
    } catch(e) { console.log('[start] Config origin patch skipped:', e.message); }
  " 2>/dev/null || true
fi

export OPENCLAW_GATEWAY_PORT=5001

echo "[start] Launching CEO proxy on port 5000..."
node ceo-proxy.cjs &
PROXY_PID=$!
echo "[start] CEO proxy PID: $PROXY_PID"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if node -e "const n=require('net');const c=n.createConnection(5000,'127.0.0.1');c.on('connect',()=>{c.end();process.exit(0)});c.on('error',()=>process.exit(1))" 2>/dev/null; then
    echo "[start] CEO proxy ready on port 5000 (attempt $i)"
    break
  fi
  if ! kill -0 $PROXY_PID 2>/dev/null; then
    echo "[start] ERROR: CEO proxy process died (PID $PROXY_PID)"
    break
  fi
  sleep 1
done

echo "[start] Launching OpenClaw gateway on port 5001..."
exec node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
