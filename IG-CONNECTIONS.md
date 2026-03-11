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
