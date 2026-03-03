#!/bin/bash
echo "[start] Starting OpenClaw Cloud..."

# Trap to support clean restarts
trap 'kill -9 1' TERM INT

# Ensure runtime dependencies are installed (fast if already present)
if [ ! -d "node_modules/ws" ] || [ ! -d "node_modules/lightstreamer-client-node" ]; then
  echo "[start] Installing runtime dependencies..."
  npm install --omit=dev --prefer-offline --no-audit --no-fund 2>&1 | tail -5
fi

TOKEN="${OPENCLAW_GATEWAY_TOKEN}"
TOKEN_JS="/home/runner/workspace/dist/control-ui/token-init.js"
CACHE_BUST=$(date +%s)

cat > "$TOKEN_JS" << JSEOF
(function(){var K="openclaw.control.settings.v1";var T="${TOKEN}";try{var r=localStorage.getItem(K);var s=r?JSON.parse(r):{};if(s.token!==T){s.token=T;localStorage.setItem(K,JSON.stringify(s))}}catch(e){}})();
JSEOF

for htmlfile in /home/runner/workspace/dist/control-ui/model-config.html /home/runner/workspace/dist/control-ui/workers.html /home/runner/workspace/dist/control-ui/processes.html; do
  if [ -f "$htmlfile" ]; then
    sed -i "s|\.js\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile"
    sed -i "s|\.js?v=[0-9]*\"|.js?v=${CACHE_BUST}\"|g" "$htmlfile"
  fi
done

export OPENAI_API_KEY="${AI_INTEGRATIONS_OPENAI_API_KEY}"
export OPENAI_BASE_URL="${AI_INTEGRATIONS_OPENAI_BASE_URL}"

# Use workspace as OPENCLAW_HOME so all data persists across restarts
# Data stored in /home/runner/workspace/.openclaw/ (persistent storage)
export OPENCLAW_HOME="/home/runner/workspace"

# Ensure docs/templates are reachable from gateway fallback path
ln -sf /home/runner/workspace/docs /home/runner/docs 2>/dev/null

# Seed config if not present yet
PERSISTENT_DIR="/home/runner/workspace/.openclaw"
mkdir -p "$PERSISTENT_DIR"
if [ ! -f "$PERSISTENT_DIR/openclaw.json" ]; then
  cp /home/runner/workspace/openclaw.json "$PERSISTENT_DIR/openclaw.json"
fi

# Ensure published origin is in persistent config allowedOrigins
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

# Export gateway port for internal use  
export OPENCLAW_GATEWAY_PORT=5001

# Start CEO proxy on port 5000 (exposed port) in background
node ceo-proxy.cjs &
PROXY_PID=$!

# Small delay to let proxy bind
sleep 1

# Start OpenClaw gateway on internal port 5001 (foreground)
exec node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
