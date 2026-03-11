# IG Trading Dashboard Connection Architecture

## Overview

The IG Trading Dashboard (built on OpenClaw) connects to IG Markets API for trading, market data, and account management. The system supports both **DEMO** and **Live** accounts with automatic failover mechanisms and real-time streaming via Lightstreamer.

---

## Part 1: Configuration & Authentication

### 1.1 Configuration File Structure

All IG configuration is stored in `~/.openclaw/ig-config.json`:

```json
{
  "activeProfile": "demo",
  "timezone": "Australia/Brisbane",
  "profiles": {
    "demo": {
      "label": "Demo Account",
      "baseUrl": "https://demo-api.ig.com/gateway/deal",
      "apiKey": "YOUR_DEMO_API_KEY",
      "username": "YOUR_DEMO_USERNAME",
      "password": "YOUR_DEMO_PASSWORD",
      "accountId": "YOUR_DEMO_ACCOUNT_ID"
    },
    "live": {
      "label": "Live Account",
      "baseUrl": "https://api.ig.com/gateway/deal",
      "apiKey": "YOUR_LIVE_API_KEY",
      "username": "YOUR_LIVE_USERNAME",
      "password": "YOUR_LIVE_PASSWORD",
      "accountId": "YOUR_LIVE_ACCOUNT_ID"
    }
  }
}
```

### 1.2 Environment Variable Overrides

You can override config values via environment variables (useful for CI/CD):

```bash
IG_API_KEY=your_key
IG_USERNAME=your_username
IG_PASSWORD=your_password
IG_ACCOUNT_ID=your_account_id
IG_BASE_URL=https://demo-api.ig.com/gateway/deal  # or https://api.ig.com/gateway/deal
```

The system auto-detects whether these are DEMO or LIVE based on the `baseUrl`.

### 1.3 Config Page Connection Flow

**File**: `patch/files/.openclaw/canvas/ig-config-ui.js`

1. **Load Config**: `GET /api/ig/config` → Returns current `ig-config.json`
2. **Save Config**: `PUT /api/ig/config` → Validates credentials, tests connection, saves to disk
3. **Test Connection**: Sends a test `/session` request to verify API credentials work
4. **Switch Profile**: `POST /api/ig/config/switch-profile?profile=demo` → Switches active profile
5. **Load Strategy Schemas**: `GET /api/ig/scalper/strategy-schemas` → Loads available strategy types

---

## Part 2: API Session Management

### 2.1 IG API Authentication (REST)

All IG API calls require authentication via two tokens obtained during login.

#### Login Request Flow

**Endpoint**: `POST /session`

```javascript
// ig-local-api.mjs: igSessionLogin() function

const loginPayload = {
  identifier: profile.username,  // IG trading username
  password: profile.password     // IG trading password
};

const headers = {
  'X-IG-API-KEY': profile.apiKey,      // API key from IG
  'Content-Type': 'application/json; charset=UTF-8',
  'Accept': 'application/json; charset=UTF-8',
  'Version': '2'
};

// IG returns:
// {
//   "lightstreamerEndpoint": "https://...",
//   "lightstreamerToken": "...",
//   "accountId": "ABC123",
//   "accountInfo": { ... }
// }
```

#### Response Headers (Critical for subsequent requests)

```
CST: <Client Session Token>                    // Session token (expires in 5 mins)
X-SECURITY-TOKEN: <Security Token>             // Security token
```

### 2.2 Session Token Management

**Session TTL**: 5 minutes (300,000 milliseconds)

```javascript
// In ig-local-api.mjs
const IG_SESSION_TTL = 5 * 60 * 1000;

// Stored in memory
let igSession = {
  cst: null,                           // Client Session Token
  xst: null,                           // X-Security-Token
  ts: Date.now(),                      // Timestamp of login
  lightstreamerEndpoint: null          // For real-time streaming
};

// igAuth() automatically refreshes expired tokens
async function igAuth() {
  if (igSession.cst && Date.now() - igSession.ts < IG_SESSION_TTL) {
    return { cst: igSession.cst, xst: igSession.xst };  // Valid, reuse
  }
  return igSessionLogin();  // Expired, re-authenticate
}
```

### 2.3 Every API Request Must Include These Headers

```javascript
function igHeaders(session) {
  return {
    'X-IG-API-KEY': profile.apiKey,
    'CST': session.cst,
    'X-SECURITY-TOKEN': session.xst,
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8'
  };
}
```

### 2.4 Session Refresh Endpoints

- **Dashboard**: `POST /api/ig/session/refresh` → Forces token refresh
- **Session Status**: `GET /api/ig/session` → Returns current session status

---

## Part 3: Lightstreamer Real-Time Streaming

### 3.1 Lightstreamer Architecture

Lightstreamer is a **WebSocket-based streaming service** provided by IG for real-time price updates. It's far more efficient than polling.

#### Initialization Timeline

```
1. User logs in via REST API
   ↓
2. IG responds with lightstreamerEndpoint (e.g., "https://stream-something.ig.com")
   ↓
3. After 2 seconds, ig-local-api.mjs auto-starts Lightstreamer
   ↓
4. Lightstreamer client connects to endpoint
   ↓
5. Subscribes to L1 market data for configured instruments
   ↓
6. Real-time ticks flow in via WebSocket
```

### 3.2 Lightstreamer Connection (Demo Account)

**File**: `ig-local-api.mjs` - `startLightstreamer()` function

```javascript
// Step 1: Create Lightstreamer client
const LightstreamerClient = require('lightstreamer-client-node').LightstreamerClient;
const endpoint = igSession.lightstreamerEndpoint;  // e.g., "https://stream-..."
lsClient = new LightstreamerClient(endpoint, 'QUOTE_ADAPTER');

// Step 2: Authenticate with account credentials
// User = accountId (e.g., "Z3MJKY")
// Password = "CST-<cst>|XST-<xst>"
lsClient.connectionDetails.setUser(activeProfile.accountId);
lsClient.connectionDetails.setPassword(`CST-${cst}|XST-${xst}`);

// Step 3: Connect
lsClient.connect();

// Step 4: Subscribe to market data
const subscription = new Subscription('MERGE', ['L1:IX.D.DAX.IFD.IP', 'L1:CS.D.GBPUSD.TODAY.IP'], 
  ['BID', 'OFFER', 'MID_OPEN', 'HIGH', 'LOW', 'MARKET_STATE', 'UPDATE_TIME']);

subscription.addListener({
  onItemUpdate: (update) => {
    const epic = update.getItemName().replace('L1:', '');
    const bid = parseFloat(update.getValue('BID'));
    const offer = parseFloat(update.getValue('OFFER'));
    const mid = (bid + offer) / 2;
    
    streamedPrices.set(epic, { bid, offer, mid, timestamp: Date.now() });
    feedStreamTick(epic, mid, Date.now());  // Build candles
  }
});

lsClient.subscribe(subscription);
```

### 3.3 Lightstreamer Connection (Live Account)

If a **Live profile is configured**, the system creates a **separate** Lightstreamer connection for:
- Account metrics (balance, P&L, margin, equity)
- Live market data (L1 prices for live account)

```javascript
// Live account receives subscription refresh every 4 minutes
// because live tokens also expire (unlike demo which persist)

async function scheduleLiveStreamingRefresh() {
  setInterval(() => {
    if (lsLiveActive) {
      liveStreamingLogin()  // Re-authenticate live session
        .then(() => connectLiveStreamingAccount())
        .catch(err => console.error('Live refresh failed:', err));
    }
  }, LS_LIVE_SESSION_REFRESH);  // 4 minutes = 240000 ms
}
```

### 3.4 Hybrid Fallback (REST Polling)

If Lightstreamer fails (e.g., "Invalid account type" error on certain live accounts):

```javascript
// Automatically falls back to REST polling every 3 seconds
async function startHybridPricePolling() {
  const epics = collectInstrumentEpics();  // Up to 40 epics
  
  hybridPollingTimer = setInterval(async () => {
    try {
      const session = await igAuth();
      const res = await igRequest('GET', 
        `/markets?epics=${epics.join(',')}`,
        igHeaders(session));
      
      if (res.status === 200) {
        const data = JSON.parse(res.body);
        data.instrumentList?.forEach(inst => {
          const epic = inst.instrumentName;
          const bid = parseFloat(inst.bid);
          const offer = parseFloat(inst.offer);
          const mid = (bid + offer) / 2;
          
          streamedPrices.set(epic, { bid, offer, mid, timestamp: Date.now() });
        });
      }
    } catch (err) {
      hybridPollErrorCount++;
    }
  }, 3000);
}
```

---

## Part 4: API Endpoints Reference

### 4.1 Trading & Order Management

#### Open a Trade (Market Order)

```http
POST /api/ig/positions/open
Content-Type: application/json
Authorization: Bearer [token]

{
  "epic": "CS.D.GBPUSD.TODAY.IP",      // Instrument code
  "direction": "BUY",                   // BUY or SELL
  "size": 1,                            // Number of contracts/lots
  "orderType": "MARKET",                // MARKET, LIMIT, or STOP
  "level": 1.2550,                      // Entry level (for LIMIT/STOP)
  "stopLevel": 1.2500,                  // Stop loss price
  "limitLevel": 1.2600,                 // Take profit price
  "forceOpen": true                     // Allow multiple positions
}

Response:
{
  "dealReference": "TX123456789",
  "dealId": "XXXXXXX",
  "status": "ACCEPTED"                  // or REJECTED
}
```

#### Close a Trade

```http
POST /api/ig/positions/close
Content-Type: application/json

{
  "dealId": "XXXXXXX",                  // Position ID from open response
  "size": 1,
  "orderType": "MARKET",
  "direction": "SELL"                   // Opposite of open direction
}
```

#### Update Stops & Limits (Trailing Stop)

```http
PUT /api/ig/positions/update
Content-Type: application/json

{
  "dealId": "XXXXXXX",
  "stopLevel": 1.2480,                  // New stop level
  "limitLevel": 1.2620,                 // New limit level
  "trailingStop": 50                    // Trailing stop distance in points
}
```

#### Get All Open Positions

```http
GET /api/ig/positions

Response:
{
  "positions": [
    {
      "dealId": "XXXXXXX",
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "direction": "BUY",
      "size": 1,
      "level": 1.2540,
      "currentLevel": 1.2560,
      "profit": 20,                     // Points profit/loss
      "profitGBP": 20,                  // Currency profit/loss
      "stopLevel": 1.2500,
      "limitLevel": 1.2600,
      "status": "OPEN",
      "createdDate": "2024-01-10T10:00:00Z"
    }
  ],
  "totalProfit": 20
}
```

#### Create Working Order (Limit/Stop Entry)

```http
POST /api/ig/workingorders/create
Content-Type: application/json

{
  "epic": "CS.D.GBPUSD.TODAY.IP",
  "direction": "BUY",
  "orderLevel": 1.2500,                 // Entry level
  "size": 1,
  "orderType": "LIMIT",                 // LIMIT or STOP
  "timeInForce": "GOOD_TILL_CANCELLED",
  "daysInForce": 30,
  "expiry": "DFB",
  "guaranteedStop": false
}
```

#### Check Trade Confirmation

```http
GET /api/ig/confirms/{dealReference}

Response:
{
  "dealReference": "TX123456789",
  "dealStatus": "ACCEPTED",             // or REJECTED, UNKNOWN
  "dealId": "XXXXXXX",
  "reason": ""                          // If rejected
}
```

### 4.2 Instrument Search & Market Data

#### Search for Instruments

```http
GET /api/ig/markets?searchTerm=gbpusd

Response:
{
  "instrumentList": [
    {
      "id": "99999999",
      "name": "GBP/USD",
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "type": "SPOT",
      "bid": 1.2555,
      "offer": 1.2560,
      "high": 1.2600,
      "low": 1.2500
    }
  ]
}
```

#### Get Market Details (Spread, Size Limits)

```http
GET /api/ig/markets/CS.D.GBPUSD.TODAY.IP

Response:
{
  "instrument": {
    "name": "GBP/USD",
    "epic": "CS.D.GBPUSD.TODAY.IP",
    "type": "SPOT",
    "valueOfOnePip": 0.0001,             // Used for P&L calculation
    "contractSize": 1,
    "minSize": 0.5,
    "maxSize": 100,
    "lotSize": 1,
    "unit": "POINTS",
    "currencyCode": "GBP",
    "scalingFactor": 1
  },
  "snapshot": {
    "bid": 1.2555,
    "offer": 1.2560,
    "high": 1.2600,
    "low": 1.2500,
    "mid": 1.25575,
    "scalingFactor": 1,
    "decimalPlaces": 5
  }
}
```

#### Get Historical Price Data (Candles)

```http
GET /api/ig/pricehistory/CS.D.GBPUSD.TODAY.IP?resolution=MINUTE_5&max=100

Resolution options:
SECOND, SECOND_2, SECOND_5, SECOND_10, SECOND_20, SECOND_30,
MINUTE, MINUTE_5, MINUTE_15, MINUTE_30,
HOUR, HOUR_4, DAY

Response:
{
  "instrumentType": "SPOT",
  "candles": [
    {
      "ts": 1704873600000,               // Unix timestamp (ms)
      "open": 1.2540,
      "high": 1.2560,
      "low": 1.2535,
      "close": 1.2555,
      "bid": {
        "open": 1.2540, "high": 1.2560, "low": 1.2535, "close": 1.2555
      },
      "offer": {
        "open": 1.2541, "high": 1.2561, "low": 1.2536, "close": 1.2556
      }
    }
  ]
}
```

#### Market Navigation (Browse Instruments by Category)

```http
GET /api/ig/marketnavigation                    # Root categories
GET /api/ig/marketnavigation/100002              # Specific category ID

Response:
{
  "nodes": [
    {
      "id": "100003",
      "name": "Forex"
    }
  ],
  "markets": [
    {
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "name": "GBP/USD",
      "bid": 1.2555,
      "offer": 1.2560
    }
  ]
}
```

### 4.3 Account Information

#### Get Account Details

```http
GET /api/ig/account

Response:
{
  "accountId": "Z3MJKY",
  "accountAlias": "Demo",
  "accountType": "SPREADBET",            # or CFD, etc.
  "currency": "GBP",
  "balance": {
    "cash": 107435.66,
    "available": 107435.66,
    "margin": 0,
    "marginUsed": 0,
    "marginPercentage": 0,
    "unrealised": 0,
    "realised": 0,
    "profitLoss": 0
  },
  "equity": 107435.66
}
```

#### Get Trade History

```http
GET /api/ig/history?pageSize=50&pageNumber=1

Response:
{
  "trades": [
    {
      "dealId": "XXXXXXX",
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "direction": "BUY",
      "size": 1,
      "level": 1.2540,
      "dealTime": "2024-01-10T10:00:00Z",
      "profit": 50,
      "profitCurrency": "GBP"
    }
  ],
  "metadata": {
    "pageSize": 50,
    "pageNumber": 1,
    "totalPages": 5
  }
}
```

### 4.4 Real-Time Streaming Data

#### Get Current Streamed Prices (Lightstreamer Cache)

```http
GET /api/ig/stream/prices

Response:
{
  "CS.D.GBPUSD.TODAY.IP": {
    "bid": 1.2555,
    "offer": 1.2560,
    "mid": 1.25575,
    "timestamp": 1704873600000,
    "updateCount": 1245               # Number of ticks received
  },
  "IX.D.DAX.IFD.IP": {
    "bid": 18550.0,
    "offer": 18550.5,
    "mid": 18550.25,
    "timestamp": 1704873600000,
    "updateCount": 892
  }
}
```

#### Get Lightstreamer Connection Status

```http
GET /api/ig/stream/status

Response:
{
  "demo": {
    "status": "connected",               # or "disconnected", "reconnecting"
    "connectedAt": "2024-01-10T10:00:00Z",
    "uptime": 3600000,                   # ms
    "epicCount": 2,
    "totalUpdates": 5420,
    "updateRate": 1.5                    # updates per second
  },
  "live": {
    "status": "disconnected",
    "reason": "No live profile configured"
  }
}
```

#### Get Real-Time Candles (Aggregated from Stream)

```http
GET /api/ig/stream/candles?epic=CS.D.GBPUSD.TODAY.IP&resolution=MINUTE

Response:
{
  "epic": "CS.D.GBPUSD.TODAY.IP",
  "resolution": "MINUTE",
  "candles": [
    {
      "ts": 1704873600000,
      "open": 1.2540,
      "high": 1.2560,
      "low": 1.2535,
      "close": 1.2555,
      "ticks": 245                       # Number of ticks in candle
    }
  ]
}
```

---

## Part 5: Dashboard Integration Example

### 5.1 How the IG Dashboard Buys/Sells

**File**: `patch/files/.openclaw/canvas/ig-dashboard.html`

```javascript
// User clicks "Buy" button in dashboard

async function executeBuyOrder() {
  const epic = selectedInstrument;      // e.g., "CS.D.GBPUSD.TODAY.IP"
  const size = parseFloat(inputSize.value);
  const stopLevel = parseFloat(inputStop.value);
  const limitLevel = parseFloat(inputLimit.value);
  
  const payload = {
    epic: epic,
    direction: 'BUY',
    size: size,
    orderType: 'MARKET',
    stopLevel: stopLevel,
    limitLevel: limitLevel,
    forceOpen: true
  };
  
  try {
    const response = await fetch('/api/ig/positions/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.dealReference) {
      showToast(`Trade opened: ${result.dealReference}`, true);
      refreshPositions();
    } else {
      showToast(`Trade failed: ${result.error || 'unknown'}`, false);
    }
  } catch (err) {
    showToast(`Network error: ${err.message}`, false);
  }
}
```

### 5.2 How the Dashboard Gets Real-Time Prices

```javascript
// Dashboard subscribes to real-time price updates

async function startPriceUpdates() {
  const epicList = ['CS.D.GBPUSD.TODAY.IP', 'IX.D.DAX.IFD.IP'];
  
  // Subscribe via polling (every 500ms)
  setInterval(async () => {
    try {
      const prices = await fetch('/api/ig/stream/prices').then(r => r.json());
      
      epicList.forEach(epic => {
        if (prices[epic]) {
          const price = prices[epic];
          updateChartPrice(epic, price.mid, price.bid, price.offer);
          updatePositionPnL(epic, price.mid);
        }
      });
    } catch (err) {
      console.error('Price update failed:', err);
    }
  }, 500);
}
```

### 5.3 How the Scalper Strategy Engine Works

**File**: `skills/bots/trade-claw-engine.cjs`

```javascript
// Scalper continuously evaluates entry signals

const runScalperCycle = async () => {
  const session = await igAuth();
  
  for (const strategy of scalperStrategies) {
    if (!strategy.enabled) continue;
    
    // Get latest candle
    const candles = await getHistoricalCandles(
      strategy.epic,
      strategy.timeframe,
      100
    );
    
    // Evaluate entry signal (RSI, EMA, etc.)
    const signal = evaluateSignal(candles, strategy);
    
    if (signal === 'BUY' && strategy.direction !== 'SELL') {
      // Check if we can open
      const openPositions = await getOpenPositions(session);
      if (openPositions.length < strategy.maxOpenPositions) {
        
        // Execute trade
        const order = await openPosition(session, {
          epic: strategy.epic,
          direction: 'BUY',
          size: strategy.size,
          stopLevel: currentPrice - strategy.stopDistance,
          limitLevel: currentPrice + strategy.limitDistance
        });
        
        logTrade(strategy.id, order);
      }
    }
  }
  
  // Re-run after cooldown
  setTimeout(runScalperCycle, SCALPER_CYCLE_INTERVAL);
};
```

---

## Part 6: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   IG Trading Dashboard (UI)                      │
│         (ig-dashboard.html, ig-config-ui.js)                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────┐
                 │                                 │
                 ▼                                 ▼
         ┌───────────────────┐          ┌──────────────────┐
         │  ig-local-api.mjs │          │  trade-claw-    │
         │  (Gateway Proxy)  │          │  engine.cjs      │
         │                   │          │  (Scalper Bot)   │
         │ • Auth/Session    │          │                  │
         │ • REST API calls  │          │ • Evaluates      │
         │ • Lightstreamer   │          │   signals        │
         │ • Hybrid polling  │          │ • Opens/closes   │
         │ • Caching        │          │   trades         │
         └─────────┬─────────┘          └────────┬─────────┘
                   │                             │
         ┌─────────┴─────────────────────────────┴─────────┐
         │                                                 │
         ▼ (Session Token: CST, XST)                      ▼
    ┌──────────────────────────────────────────────────────────┐
    │              IG Markets REST API                          │
    │  https://demo-api.ig.com/gateway/deal (or live)         │
    │                                                           │
    │  • POST   /session              (authenticate)           │
    │  • POST   /positions/open       (buy/sell)              │
    │  • GET    /positions            (view trades)           │
    │  • PUT    /positions/update     (adjust stops)          │
    │  • GET    /markets/{epic}       (instrument details)    │
    │  • GET    /pricehistory         (historical candles)    │
    │  • GET    /account              (balance, equity)       │
    └──────────────────────────────────────────────────────────┘
         │
         └─────────────────────────────────┬───────────────────┐
                                           │                   │
                          ┌────────────────▼──────┐   ┌────────▼──────┐
                          │ Lightstreamer         │   │ REST Polling  │
                          │ (WebSocket Stream)    │   │ (Fallback)    │
                          │                       │   │               │
                          │ L1:{EPIC} prices      │   │ /markets?epics│
                          │ Real-time ticks       │   │ Every 3 sec   │
                          │ Account metrics       │   │               │
                          └─────────────┬─────────┘   └────────┬──────┘
                                        │                      │
                                        └──────────┬───────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  streamedPrices Cache       │
                                    │  (ig-local-api.mjs)         │
                                    │                             │
                                    │  GBPUSD: {bid, offer, mid}  │
                                    │  DAX:    {bid, offer, mid}  │
                                    │  (updated in real-time)     │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  Dashboard Price Feed       │
                                    │  (GET /api/ig/stream/prices)│
                                    │  (GET /api/ig/stream/candles)
                                    │  Every 500ms               │
                                    └─────────────────────────────┘
```

---

## Part 7: Connection Troubleshooting

### 7.1 Session Expired Error

```
Error: "IG auth failed: INVALID_SESSION"
```

**Cause**: CST/XST tokens older than 5 minutes
**Fix**: Automatic—`igAuth()` refreshes tokens, but if manual fix needed:

```bash
POST /api/ig/session/refresh
```

### 7.2 Lightstreamer Connection Fails

```
[ig-local-api] Lightstreamer auth failed: Invalid account type
```

**Cause**: Live account types (LEVERAGE, SPREADBET) may not support L1 data
**Fix**: Automatic fallback to REST polling. No action needed.

### 7.3 Market Data Lags

```
GET /api/ig/stream/status
```

Check if Lightstreamer is connected. If `status: "disconnected"`, data is from polling (every 3 sec vs real-time).

### 7.4 Invalid Credentials

```
Error: "IG auth failed: INVALID_CREDENTIALS"
```

**Cause**: Wrong username, password, or API key
**Fix**: Update config via dashboard Config page:

```
PUT /api/ig/config
{
  "activeProfile": "demo",
  "profiles": {
    "demo": {
      "apiKey": "correct_key",
      "username": "correct_username",
      "password": "correct_password"
    }
  }
}
```

### 7.5 Account Type Mismatch

Some live accounts are `SPREADBET` (not `CFD`). System auto-detects and handles this.

---

## Summary

| Component | Purpose | Update Frequency |
|-----------|---------|------------------|
| **REST API** | Trading, orders, account info | On-demand |
| **Lightstreamer** | Real-time prices, ticks | Sub-second |
| **REST Polling** | Fallback price data | Every 3 seconds |
| **Session Tokens** | Authentication | Refresh every 5 minutes |
| **Market Details Cache** | Spread, pip value, contract size | 30 seconds TTL |
| **Price Cache** | Latest bid/offer/mid | Real-time (LS) or 3sec (polling) |

All connections are **automatic**—the dashboard handles authentication, token refresh, failover, and reconnection transparently.

---

## Part 8: Instrument Search & Discovery

### 8.0 How the Dashboard Searches for Instruments

The IG Trading Dashboard provides real-time instrument search via dropdown/autocomplete boxes in strategy configuration.

#### Frontend Implementation (Debounced Search)

**Files**: `ig-dashboard.html`, `ig-scalper-ui.js`

```javascript
// User types in instrument field (e.g., "gbp" or "gold")
epicInput.addEventListener('input', function handler() {
  if (scalperSearchTimeout) clearTimeout(scalperSearchTimeout);
  
  var q = epicInput.value.trim();
  if (q.length < 2) return;  // Only search if 2+ chars
  
  // Debounce: wait 400ms before sending request (reduces API calls)
  scalperSearchTimeout = setTimeout(function() {
    apiFetch('/api/ig/markets?q=' + encodeURIComponent(q))
      .then(function(data) {
        if (!data || !data.markets || data.markets.length === 0) {
          resultsEl.innerHTML = '<div>No results</div>';
          return;
        }
        
        // Render dropdown (max 10 results)
        var html = '';
        for (var i = 0; i < Math.min(data.markets.length, 10); i++) {
          var m = data.markets[i];
          html += '<div onclick="selectScalperInstrument(\'' + 
            m.epic + '\',\'' + (m.instrumentName || '').replace(/'/g, "\\'") + '\')">' +
            '<span style="font-weight:600">' + (m.instrumentName || m.epic) + '</span> ' +
            '<span style="font-size:10px">' + m.epic + '</span>' +
          '</div>';
        }
        resultsEl.innerHTML = html;
      });
  }, 400);  // 400ms debounce delay
});
```

#### Backend API Endpoint

**Endpoint**: `GET /api/ig/markets?q=searchterm`

```http
GET /api/ig/markets?q=gbp HTTP/1.1

Response:
{
  "markets": [
    {
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "instrumentName": "GBP/USD",
      "marketStatus": "TRADEABLE",
      "bid": 1.2555,
      "offer": 1.2560,
      "high": 1.2600,
      "low": 1.2500,
      "percentageChange": 0.5,
      "updateTime": "2024/01/10 14:30:00"
    },
    {
      "epic": "IX.D.FTSE.IFD.IP",
      "instrumentName": "FTSE 100",
      "marketStatus": "TRADEABLE",
      "bid": 7850.5,
      "offer": 7851.0,
      "high": 7900,
      "low": 7800,
      "percentageChange": 1.2,
      "updateTime": "2024/01/10 14:30:00"
    }
  ]
}
```

#### Backend Implementation (ig-local-api.mjs)

```javascript
if (m === 'GET' && p === '/api/ig/markets') {
  // Extract search query (supports both 'q' and 'searchTerm')
  const searchTerm = url.searchParams.get('searchTerm') || url.searchParams.get('q') || '';
  
  if (!searchTerm) {
    return json(res, 400, { error: 'Missing searchTerm or q param' }), true;
  }
  
  // Authenticate session
  const session = await igAuth();
  
  // Forward to IG API with searchTerm parameter
  const r = await igRequest(
    'GET', 
    '/markets?searchTerm=' + encodeURIComponent(searchTerm),
    igHeaders(session)
  );
  
  // Return IG's response (typically caches 30 seconds)
  if (r.status !== 200) {
    return json(res, r.status, { error: 'IG API error', detail: r.body }), true;
  }
  
  return igJsonResponse(res, 200, r.body), true;
}
```

#### Workflow

```
User types "gold" in instrument field
         ↓
Frontend waits 400ms (debounce) to avoid spamming API
         ↓
Sends: GET /api/ig/markets?q=gold
         ↓
ig-local-api.mjs receives request
         ↓
Calls igAuth() to refresh session if needed
         ↓
Forwards to IG REST API: /markets?searchTerm=gold
         ↓
IG responds with ~10-50 matching instruments:
  - Spot Gold (XAU/USD): CS.D.XAUUSD.TODAY.IP
  - Gold Futures: XAUUSD_FUT
  - Gold ETFs, etc.
         ↓
Frontend receives JSON array of markets
         ↓
Renders dropdown with top 10 results
         ↓
User clicks "Spot Gold" → instrument loaded
```

#### Search Behavior

| Aspect | Behavior |
|--------|----------|
| **Minimum Characters** | 2 (don't search for "g" or "1") |
| **Debounce Delay** | 400ms (wait after user stops typing) |
| **Max Results Displayed** | 10 (full response may have 50+) |
| **Search Fields** | IG searches: instrumentName, epic, type |
| **Case Insensitive** | Yes ("GBP", "gbp", "Gbp" all work) |
| **Caching** | 30 seconds (same search term) |

#### Supported Search Patterns

```
// All these work:
q=gbp          → GBP/USD, GBP/JPY, etc.
q=eurusd       → EUR/USD
q=dax          → DAX Index
q=CS.D.        → All spot CFDs
q=IX.D.        → All indices
q=spot         → All spot instruments
q=futures      → Futures contracts (may be limited)
```

#### Rate Limits on Search

| Limit | Value | Impact |
|-------|-------|--------|
| **Search Requests/Min** | ~60 per minute | 1 search/sec acceptable |
| **API Timeout** | 15 seconds | Slow searches timeout |
| **Response Size** | ~50 KB typical | Usually 20-50 results |
| **Caching** | 30 sec TTL | Identical searches served from cache |

#### How Instrument Data Loads

After user selects an instrument from dropdown:

```javascript
function selectScalperInstrument(epic, name) {
  document.getElementById('scalperAddEpic').value = epic;
  document.getElementById('scalperAddName').value = name + ' Strategy';
  document.getElementById('scalperInstrumentSearchResults').style.display = 'none';
}
```

Then when strategy is opened, `loadMarketData()` fetches full instrument details:

```javascript
async function loadMarketData(epic) {
  // Fetch: GET /api/ig/markets/CS.D.GBPUSD.TODAY.IP
  var data = await apiFetch('/api/ig/markets/' + epic);
  
  if (!data || data._httpError) return;
  
  // Extracts from response:
  var snap = data.snapshot || {};      // bid/offer/high/low
  var inst = data.instrument || {};    // name, type, pip value
  var deal = data.dealingRules || {};  // min/max size, spreads
  
  // Update dashboard display with:
  // - Current bid/offer
  // - Spread in points and %
  // - High/Low of day
  // - Pip value (for P&L calculation)
  // - Min/max tradeable size
}
```

#### Why Debounce is Important

**Without debounce** (400ms wait):
```
User types: "g-o-l-d"
API calls:   g → go → gol → gold
Total: 4 API requests for one word
⚠ Triggers rate limiting faster
```

**With 400ms debounce**:
```
User types:    "g-o-l-d"
User pauses:   [waiting 400ms]
API call:      gold
Total: 1 API request
✓ Respects rate limits
```

---

## Part 8: IG Candle Data for Backtesting

### 8.1 How IG Provides Historical Candle Data

IG Markets provides historical price data via the **REST API** `/prices/{epic}` endpoint. This is used for:
- Backtesting trading strategies (analysis of past performance)
- Technical indicator calculation (RSI, EMA, MACD, etc.)
- Strategy signal evaluation

**Endpoint**: `GET /prices/{epic}?resolution={RES}&max={N}&pageSize={N}`

```javascript
// Example: Fetch 100 hourly candles for GBP/USD
GET /prices/CS.D.GBPUSD.TODAY.IP?resolution=HOUR&max=100&pageSize=100

// Response structure
{
  "instrumentName": "GBP/USD",
  "instrumentType": "SPOT",
  "prices": [
    {
      "bid": { "open": 1.2540, "high": 1.2560, "low": 1.2535, "close": 1.2555 },
      "mid": { "open": 1.2541, "high": 1.2560, "low": 1.2536, "close": 1.2555 },
      "ask": { "open": 1.2542, "high": 1.2561, "low": 1.2537, "close": 1.2556 },
      "snapshotTime": "2024/01/10 12:00:00"
    },
    // ... more candles
  ]
}
```

### 8.2 Available Candle Resolutions

IG supports these timeframe resolutions:

```
SECOND     (1 second)
SECOND_2   (2 seconds)
SECOND_5   (5 seconds)
SECOND_10  (10 seconds)
SECOND_20  (20 seconds)
SECOND_30  (30 seconds)
MINUTE     (1 minute)
MINUTE_5   (5 minutes)
MINUTE_15  (15 minutes)
MINUTE_30  (30 minutes)
HOUR       (1 hour)
HOUR_4     (4 hours)
DAY        (1 day)
```

### 8.3 Rate Limits & Limitations for Retail CFD Accounts

**CRITICAL LIMITATIONS for retail/DEMO accounts:**

| Limit | Value | Impact |
|-------|-------|--------|
| **Max Candles Per Request** | 250 | Only last 250 candles available in one call |
| **API Requests Per Minute** | ~60 per minute | ~1 request/second average |
| **Concurrent Requests** | 5-10 simultaneous | Parallel requests are throttled |
| **Request Timeout** | 15 seconds | Timeout if IG API is slow |
| **Historical Data Depth** | ~5 years (limited) | Varies by instrument; Forex ≥5 yrs, others less |
| **Spread Availability** | Only with CFD/Spread instruments | Not all instruments have bid/ask; some only mid |
| **Real-time vs Historical** | Delayed 5-15 min (DEMO only) | Real accounts: 0-2 min lag |

### 8.4 Data Caching Strategy

The IG Trading Dashboard implements aggressive caching to work within limits:

```javascript
// ig-local-api.mjs caching
const IG_CACHE_TTL = 30000;  // 30 seconds

// All price history requests cached
const cacheKey = `prices:${epic}:${resolution}:${max}:${from}:${to}`;
const cached = igCacheGet(cacheKey);
if (cached) return cached;  // Avoid redundant API calls

// Cache invalidated on:
// - Open/close trades
// - Manual refresh request
// - Position update
```

**Why 30 seconds?**
- Candles don't change every millisecond
- Reduces API throttling risk
- Acceptable for strategy backtesting (you're analyzing, not trading)

### 8.5 Backtesting Workflow

The Scalper engine backtests strategies using IG candle data:

```
1. User selects strategy & date range
   ↓
2. Backtester requests candles from IG via REST API
   GET /prices/{epic}?resolution=MINUTE_5&max=250
   ↓
3. If date range > 250 candles, make multiple requests
   with pagination (IG doesn't support pagination, so
   this requires sequential requests with delays)
   ↓
4. Load all candles into memory
   ↓
5. Simulate strategy tick-by-tick through historical data
   ↓
6. Calculate entry/exit signals
   ↓
7. Track P&L, win rate, max drawdown, etc.
   ↓
8. Return backtest report
```

### 8.6 Backtesting Rate Limit Workaround

For backtesting long date ranges (e.g., 1 year of 5-min candles):

**Problem**: 1 year of 5-min candles = ~52,000 candles, but IG only gives 250/request
- Would need 208 API calls (52,000 ÷ 250)
- With 60 requests/min limit = 3.5 minutes minimum
- Risk of 429 (Too Many Requests) errors

**Solution**: The dashboard uses **sequential requests with delays**

```javascript
async function getCandles(epic, resolution, startDate, endDate) {
  const allCandles = [];
  const batchSize = 250;  // Max per IG request
  const delayBetweenRequests = 1000;  // 1 second = safe for 60 req/min
  
  // Iterate backwards from endDate, requesting 250 candles at a time
  let currentEnd = endDate;
  
  while (currentEnd > startDate) {
    const batch = await igRequest('GET', 
      `/prices/${epic}?resolution=${resolution}&max=${batchSize}&pageSize=${batchSize}&to=${currentEnd}`);
    
    const candles = batch.prices || [];
    allCandles.unshift(...candles);  // Add to front
    
    currentEnd = new Date(candles[0].snapshotTime);  // Start from oldest candle
    
    // Respect rate limits
    await sleep(delayBetweenRequests);
  }
  
  return allCandles;
}
```

### 8.7 Historical Data Availability by Instrument

**Forex (Spot)**: ~5+ years usually available
```
GBP/USD, EUR/USD, USD/JPY, AUD/USD, etc.
IG typically has excellent Forex history
```

**Indices**: ~3-5 years
```
DAX, FTSE, S&P 500, Nikkei, etc.
Some older data may be sparse
```

**Stocks (Individual)**: ~2-3 years or less
```
Tech stocks, blue chips, etc.
Newer stocks may have <1 year history
```

**Commodities**: ~2-5 years
```
Gold, Oil, Natural Gas, etc.
Depends on when IG started trading it
```

**How to check**: Try requesting with very early dates
```
GET /prices/{epic}?resolution=DAY&max=250&from=2015-01-01
```

If you get empty or few results, that instrument doesn't have data that far back.

### 8.8 The "Middle Price Problem"

IG returns three price levels:
```json
{
  "bid": { "open": 1.2540, "high": 1.2560, "low": 1.2535, "close": 1.2555 },
  "mid": { "open": 1.2541, "high": 1.2560, "low": 1.2536, "close": 1.2555 },
  "ask": { "open": 1.2542, "high": 1.2561, "low": 1.2537, "close": 1.2556 }
}
```

**Issue**: Bid/Ask don't always match perfectly due to:
- Market spread variability
- Data aggregation from multiple sources
- Time sync differences

**Retail Impact**:
- Your strategy backtests on "mid" prices
- Actual trading executes at bid/ask
- Slippage not fully accounted for in backtest
- **Real trades often slightly worse than backtest** (typical: -0.3% to -1.0% slippage)

### 8.9 DEMO vs LIVE Account Data Differences

| Aspect | DEMO | LIVE |
|--------|------|------|
| **Availability** | Full 5+ year history | Same |
| **Real-time Lag** | 5-15 minutes (synthetic) | 0-2 minutes (real market) |
| **Spread** | Wider (simulated) | Tighter (real) |
| **Slippage** | None (perfect fills) | Real slippage occurs |
| **Data Reliability** | 99% | 99.9% |
| **Use Case** | Learning, testing, backtest | Real trading validation |

**Important**: A strategy that works on DEMO may fail on LIVE due to:
- Real market spread being wider during volatility
- Actual slippage on entry/exit
- Order rejection during fast markets
- Liquidity changes

### 8.10 Backtesting Best Practices

**1. Test on DEMO first, then LIVE**
```
DEMO Backtest (synthetic data)
    ↓
DEMO Live Forward Test (run actual strategy on demo for 1-2 weeks)
    ↓
LIVE Small Position (risk 0.1% account on 1 contract)
    ↓
LIVE Scale Up (gradually increase size if profitable)
```

**2. Account for spreads in backtest**
```javascript
// Instead of:
const entryPrice = candle.mid.close;

// Do this (use ask for long, bid for short):
const entryPrice = signal === 'BUY' 
  ? candle.ask.close 
  : candle.bid.close;
```

**3. Add slippage factor**
```javascript
const estimatedSlippagePct = 0.1;  // 0.1% conservative estimate
const slippagePoints = entryPrice * (estimatedSlippagePct / 100);
const actualEntryPrice = signal === 'BUY'
  ? entryPrice + slippagePoints
  : entryPrice - slippagePoints;
```

**4. Test multiple date ranges**
```
- Recent data (last 3 months) → Current market conditions
- Crisis period (March 2020, Aug 2015) → Stress test
- Calm period (2019) → Normal conditions
- Trending market (2021-2023) → Bull market behavior
```

**5. Check for data gaps**
```javascript
// Some resolutions may have gaps (weekends, holidays)
// If candle timestamps jump >2x expected interval:
const gaps = [];
for (let i = 1; i < candles.length; i++) {
  const expectedGap = resolution * 1000;
  const actualGap = candles[i].timestamp - candles[i-1].timestamp;
  if (actualGap > expectedGap * 2) {
    gaps.push({ index: i, gap: actualGap });
  }
}
```

### 8.11 Common Backtesting Errors with IG Data

| Error | Cause | Fix |
|-------|-------|-----|
| **"Insufficient history"** | Requested date range not available | Use closer dates or different instrument |
| **Gaps in candles** | Market closed (weekends, holidays) | Filter out 00:00 candles from weekends |
| **Unrealistic results (>100% return)** | Only tested on trending market, no stress tests | Test on bull, bear, and crisis periods |
| **DEMO ≠ LIVE performance** | Simulated spreads, no slippage | Add bid/ask and slippage to backtest |
| **Rate limit errors** | Too many concurrent requests | Add delays between requests (500-1000ms) |
| **Stale data** | Using cached data from 30s ago | Set `max_age=0` for backtest requests (bypass cache) |

### 8.12 Backtesting API Endpoint

```http
POST /api/ig/scalper/batch-backtest
Content-Type: application/json

{
  "strategies": [
    {
      "id": 32,
      "strategyType": "scalper",
      "epic": "CS.D.GBPUSD.TODAY.IP",
      "timeframe": "MINUTE_5",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  ]
}

Response (after backtest completes):
{
  "batchId": "batch_20240110_abc123",
  "results": [
    {
      "strategyId": 32,
      "totalTrades": 157,
      "winRate": 58.3,
      "totalProfit": 2450.75,
      "maxDrawdown": -850,
      "profitFactor": 1.85,
      "avgWin": 25.50,
      "avgLoss": -13.80,
      "duration": "45 seconds"
    }
  ]
}
```

**Note**: On local installations, backtesting requires `ceo-proxy` with the scalper engine active. The simple `ig-local-api.mjs` can fetch candles but cannot execute backtests.

---

## Summary: IG Data Limitations for Retail Traders

```
✓ Strengths:
  - 5+ years history for major forex
  - Multiple resolutions (SECOND to DAY)
  - Free via API (included with trading account)
  - Bid/mid/ask data available

✗ Limitations:
  - 250 candles max per request (requires pagination)
  - ~60 requests/minute rate limit
  - DEMO spreads wider than real market
  - No tick-level data (only candles)
  - Slippage/liquidity not in backtests
  - Weekend/holiday gaps in daily data

→ Workaround:
  - Cache aggressively (30-60 sec TTL)
  - Batch requests with delays
  - Add slippage estimates (0.1-1.0%)
  - Test on multiple date ranges
  - Always validate on LIVE with small size
```
