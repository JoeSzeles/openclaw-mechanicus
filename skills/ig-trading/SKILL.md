---
name: ig-trading
description: IG Group REST Trading API — authenticate, trade CFDs, manage positions, view account. Use for "IG trade", "open position", "close position", "IG account", "IG balance".
---
# IG Trading API Skill

Trade CFDs on the IG Group platform via REST API. Supports forex, indices, commodities, crypto.

## Connection Details

- **Demo API**: `https://demo-api.ig.com/gateway/deal`
- **Live API**: `https://api.ig.com/gateway/deal` (requires separate live API key)
- Credentials are stored in environment variables: `IG_API_KEY`, `IG_USERNAME`, `IG_PASSWORD`, `IG_ACCOUNT_ID`, `IG_BASE_URL`

**CRITICAL**: Demo API keys ONLY work on `demo-api.ig.com`. Live keys ONLY work on `api.ig.com`. They are NOT interchangeable.

## 1. Authentication (Login)

POST `/session` (Version 2) to get session tokens. You need **two response headers** for all subsequent requests.

```bash
curl -s -D - -X POST "$IG_BASE_URL/session" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json; charset=UTF-8" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "Version: 2" \
  -d "{\"identifier\":\"$IG_USERNAME\",\"password\":\"$IG_PASSWORD\"}"
```

**From the response headers, capture:**
- `CST: <token>` — client session token
- `X-SECURITY-TOKEN: <token>` — account security token

Both tokens are valid for 6 hours and extend up to 72 hours while active.

**All subsequent requests must include these 4 headers:**
```
X-IG-API-KEY: <your key>
CST: <from login>
X-SECURITY-TOKEN: <from login>
Content-Type: application/json; charset=UTF-8
```

## 2. Account Info

**Get accounts:**
```bash
curl -s "$IG_BASE_URL/accounts" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

**Get account preferences:**
```bash
curl -s "$IG_BASE_URL/accounts/preferences" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

## 3. List Open Positions

```bash
curl -s "$IG_BASE_URL/positions" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Version: 2"
```

## 4. Open a Position (Market Order)

```bash
curl -s -X POST "$IG_BASE_URL/positions/otc" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Version: 2" \
  -d '{
    "epic": "CS.D.EURUSD.CFD.IP",
    "direction": "BUY",
    "size": 0.5,
    "orderType": "MARKET",
    "currencyCode": "USD",
    "expiry": "-",
    "forceOpen": true,
    "guaranteedStop": false
  }'
```

**Response** returns a `dealReference`. Use it to confirm:
```bash
curl -s "$IG_BASE_URL/confirms/$DEAL_REF" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST"
```

## 5. Close a Position

```bash
curl -s -X POST "$IG_BASE_URL/positions/otc" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "_method: DELETE" \
  -d '{
    "dealId": "<DEAL_ID>",
    "direction": "SELL",
    "size": 0.5,
    "orderType": "MARKET"
  }'
```

Note: IG uses `_method: DELETE` header trick for closing via POST.

## 6. Working Orders

**List working orders:**
```bash
curl -s "$IG_BASE_URL/working-orders" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Version: 2"
```

**Create a limit order:**
```bash
curl -s -X POST "$IG_BASE_URL/working-orders/otc" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Version: 2" \
  -d '{
    "epic": "CS.D.EURUSD.CFD.IP",
    "direction": "BUY",
    "size": 0.5,
    "level": 1.0800,
    "type": "LIMIT",
    "currencyCode": "USD",
    "expiry": "-",
    "forceOpen": true,
    "guaranteedStop": false,
    "timeInForce": "GOOD_TILL_CANCELLED"
  }'
```

## 7. Transaction History

```bash
curl -s "$IG_BASE_URL/history/transactions?type=ALL&from=2026-02-01T00:00:00&to=2026-02-28T00:00:00" \
  -H "X-IG-API-KEY: $IG_API_KEY" \
  -H "CST: $CST" \
  -H "X-SECURITY-TOKEN: $X_ST" \
  -H "Version: 2"
```

## 8. Risk Management Rules

- Max 1% of balance per trade
- Position size formula: `(balance * 0.01) / (stop_distance * value_per_point)`
- Start with 0.1–0.5 contracts
- Always calculate breakeven: `spread_points` = minimum move needed
- Calculate overnight funding before holding positions overnight

## Common Errors

| Error Code | Meaning |
|---|---|
| `error.security.api-key-disabled` | API key disabled — regenerate on IG platform |
| `error.security.api-key-invalid` | Wrong server (demo key on live, or vice versa) |
| `error.security.invalid-details` | Wrong username or password |
| `error.public-api.exceeded-api-key-allowance` | Rate limited — wait and retry |
| `error.position.trading-not-enabled` | Account not enabled for trading |
