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

cp /home/runner/workspace/openclaw.json /home/runner/.openclaw/openclaw.json 2>/dev/null || true

exec node dist/entry.js gateway --bind lan --port 5000 --allow-unconfigured
