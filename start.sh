#!/bin/bash

# Trap to support clean restarts
trap 'kill -9 1' TERM INT

TOKEN="${OPENCLAW_GATEWAY_TOKEN}"
TOKEN_JS="/home/runner/workspace/dist/control-ui/token-init.js"

cat > "$TOKEN_JS" << JSEOF
(function(){var K="openclaw.control.settings.v1";var T="${TOKEN}";try{var r=localStorage.getItem(K);var s=r?JSON.parse(r):{};if(s.token!==T){s.token=T;localStorage.setItem(K,JSON.stringify(s))}}catch(e){}})();
JSEOF

export OPENAI_API_KEY="${AI_INTEGRATIONS_OPENAI_API_KEY}"
export OPENAI_BASE_URL="${AI_INTEGRATIONS_OPENAI_BASE_URL}"

# Use workspace as OPENCLAW_HOME so all data persists across restarts
# Data stored in /home/runner/workspace/.openclaw/ (persistent storage)
export OPENCLAW_HOME="/home/runner/workspace"

# Seed config if not present yet
PERSISTENT_DIR="/home/runner/workspace/.openclaw"
mkdir -p "$PERSISTENT_DIR"
if [ ! -f "$PERSISTENT_DIR/openclaw.json" ]; then
  cp /home/runner/workspace/openclaw.json "$PERSISTENT_DIR/openclaw.json"
fi

# Export gateway port for internal use  
export OPENCLAW_GATEWAY_PORT=5001

# Start CEO proxy on port 5000 (exposed port) in background
node ceo-proxy.cjs &
PROXY_PID=$!

# Small delay to let proxy bind
sleep 1

# Start OpenClaw gateway on internal port 5001 (foreground)
exec node dist/entry.js gateway --bind lan --port 5001 --allow-unconfigured
