#!/bin/bash
set -euo pipefail

BASE="$IG_BASE_URL"
KEY="$IG_API_KEY"
USER="$IG_USERNAME"
PASS="$IG_PASSWORD"

TMPDIR="/tmp/ig$$"
mkdir -p "$TMPDIR"
COOKIES="$TMPDIR/cookies.txt"
HEADERS="$TMPDIR/headers.txt"

# Login
curl -s -c "$COOKIES" -D "$HEADERS" \
 -H "Content-Type: application/json" \
 -H "X-IG-API-KEY: $KEY" \
 -H "Version: 1" \
 -d '{"identifier":"'$USER'","password":"'$PASS'"}' \
 "$BASE/session" > "$TMPDIR/login.json"

TOKEN=$(grep -i '^x-security-token:' "$HEADERS" | sed 's/.*: //' | tr -d '\r\n ')
CST=$(grep 'cst' "$COOKIES" | awk '{print $7}' | head -1 | tr -d '\r\n')

if [ -z "$TOKEN" ] || [ -z "$CST" ]; then
  echo "Login failed"
  cat "$TMPDIR/headers.txt" 2>/dev/null || true
  cat "$TMPDIR/login.json" 2>/dev/null || true
  rm -rf "$TMPDIR"
  exit 1
fi

echo "Logged in. CST length: ${#CST}"

# EPICS
EPICS=(
"CS.D.BITCOIN.BTCUSD.TIP"
"CS.D.ETHEREUM.ETHUSD.TIP"
"CS.D.SOLANA.USD.TIP"
"CS.D.BNB.BNBUSD.TIP"
"CS.D.XRP.USD.TIP"
"CS.D.DOGECOIN.DOGEUSD.TIP"
"CS.D.CARDANO.ADAUSD.TIP"
"CS.D.AVAX.USD.TIP"
"CS.D.TON.USD.TIP"
"CS.D.SUI.USD.TIP"
"IX.D.VIX75.IP"
"IX.D.VIX100.IP"
"IX.D.VIX50.IP"
"IX.D.VIX25.IP"
"IX.D.VIX10.IP"
"CS.D.VIX.IP"
)

EPICS_JSON=$(printf '%s\n' "${EPICS[@]}" | jq -R . | jq -s .)

curl -s -b "$COOKIES" \
 -H "X-IG-API-KEY: $KEY" \
 -H "X-SECURITY-TOKEN: $TOKEN" \
 -H "CST: $CST" \
 -H "Content-Type: application/json" \
 -H "Version: 2" \
 -d "$EPICS_JSON" \
 "$BASE/prices"

rm -rf "$TMPDIR"
