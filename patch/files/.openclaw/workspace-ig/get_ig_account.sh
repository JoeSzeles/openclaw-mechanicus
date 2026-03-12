#!/bin/bash
set -euo pipefail
BASE="${IG_BASE_URL:-https://demo-api.ig.com/gateway/deal}"
KEY="${IG_API_KEY:?Set IG_API_KEY}"
USER="${IG_IDENTIFIER:?Set IG_IDENTIFIER}"
PASS="${IG_PASSWORD:?Set IG_PASSWORD}"

TMP="/tmp/ig$$"
mkdir -p "$TMP"
COOKIES="$TMP/cookies.txt"
HEADERS="$TMP/headers.txt"

curl -s -c "$COOKIES" -D "$HEADERS" -H "Content-Type: application/json" -H "X-IG-API-KEY: $KEY" -H "Version: 1" -d "{\"identifier\":\"$USER\",\"password\":\"$PASS\"}" "$BASE/session" > "$TMP/login.json"

TOKEN=$(grep -i '^x-security-token:' "$HEADERS" | sed 's/.*: //' | tr -d '\r\n ')
CST=$(grep 'cst' "$COOKIES" | awk '{print $7}' | head -1 | tr -d '\r\n')

if [ -z "$TOKEN" ] || [ -z "$CST" ]; then
  echo "Login failed"
  exit 1
fi

echo "Logged in. Fetching account/positions..."

curl -s -b "$COOKIES" -H "X-IG-API-KEY: $KEY" -H "X-SECURITY-TOKEN: $TOKEN" -H "CST: $CST" -H "Version: 3" "$BASE/accounts"

curl -s -b "$COOKIES" -H "X-IG-API-KEY: $KEY" -H "X-SECURITY-TOKEN: $TOKEN" -H "CST: $CST" -H "Version: 2" "$BASE/positions"

rm -rf "$TMP"
