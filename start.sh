#!/bin/bash
set -e
echo "[start] Starting OpenClaw Cloud..."
echo "[start] CWD: $(pwd)"
echo "[start] Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "[start] Date: $(date -u)"

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"
cd "$WORKSPACE"
echo "[start] Workspace: $WORKSPACE"

if [ "$$" != "1" ]; then
  trap 'kill -9 1' TERM INT
fi

if [ ! -d "node_modules/ws" ] || [ ! -d "node_modules/lightstreamer-client-node" ]; then
  echo "[start] Installing runtime dependencies..."
  npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit --no-fund 2>&1 | tail -5
fi

TOKEN="${OPENCLAW_GATEWAY_TOKEN}"
TOKEN_JS="$WORKSPACE/dist/control-ui/token-init.js"
CACHE_BUST=$(date +%s)

cat > "$TOKEN_JS" << JSEOF
(function(){var K="openclaw.control.settings.v1";var T="${TOKEN}";try{var r=localStorage.getItem(K);var s=r?JSON.parse(r):{};if(s.token!==T){s.token=T;localStorage.setItem(K,JSON.stringify(s))}}catch(e){}})();
JSEOF

for htmlfile in "$WORKSPACE/dist/control-ui/model-config.html" "$WORKSPACE/dist/control-ui/workers.html" "$WORKSPACE/dist/control-ui/processes.html"; do
  if [ -f "$htmlfile" ]; then
    sed -i "s|\.js\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile"
    sed -i "s|\.js?v=[0-9]*\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile"
  fi
done

export OPENAI_API_KEY="${AI_INTEGRATIONS_OPENAI_API_KEY}"
export OPENAI_BASE_URL="${AI_INTEGRATIONS_OPENAI_BASE_URL}"

export OPENCLAW_HOME="$WORKSPACE"

ln -sf "$WORKSPACE/docs" /home/runner/docs 2>/dev/null || true

PERSISTENT_DIR="$WORKSPACE/.openclaw"
mkdir -p "$PERSISTENT_DIR"
if [ ! -f "$PERSISTENT_DIR/openclaw.json" ]; then
  cp "$WORKSPACE/openclaw.json" "$PERSISTENT_DIR/openclaw.json"
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
  "
fi

export OPENCLAW_GATEWAY_PORT=5001

echo "[start] Launching CEO proxy on port 5000..."
node ceo-proxy.cjs &
PROXY_PID=$!

for i in $(seq 1 10); do
  if node -e "const n=require('net');const c=n.createConnection(5000,'127.0.0.1');c.on('connect',()=>{c.end();process.exit(0)});c.on('error',()=>process.exit(1))" 2>/dev/null; then
    echo "[start] CEO proxy ready on port 5000 (attempt $i)"
    break
  fi
  sleep 1
done

echo "[start] Launching OpenClaw gateway on port 5001..."
exec node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
