# IG Trading Guide

## Verified Connection Details

| Setting | Value |
|---|---|
| **Demo API Base URL** | `https://demo-api.ig.com/gateway/deal` |
| **Live API Base URL** | `https://api.ig.com/gateway/deal` |
| **API Key (demo)** | stored in `.openclaw/ig-config.json` |
| **Username** | stored in `.openclaw/ig-config.json` |
| **Password** | stored in `.openclaw/ig-config.json` |
| **Account ID** | `YOUR_ACCOUNT_ID` (CFD, AUD) |
| **Demo Balance** | A$98,780.63 |
| **Status** | Verified working 2026-02-27 |

**CREDENTIAL MANAGEMENT**: All IG credentials are stored in `.openclaw/ig-config.json` with demo/live profiles. Manage via the Config page (`/model-config.html` > IG Trading tab) or the `/api/ig/config` REST API. Env vars (`IG_API_KEY`, `IG_USERNAME`, etc.) are only used as seed on first run if ig-config.json does not exist.

**SESSION MANAGEMENT**: The CEO proxy auto-manages IG sessions — login at startup, token refresh every 4 minutes. Check status: `GET /api/ig/session`. Force refresh: `POST /api/ig/session/refresh`.

**CRITICAL**: Demo keys ONLY work on `demo-api.ig.com`. Live keys ONLY work on `api.ig.com`. Using a demo key on the live server returns `error.security.api-key-invalid`.

### Proxy API Endpoints (Recommended)

Use these instead of direct IG API calls — they handle auth automatically:
- `GET /api/ig/account` — live account balance/margin
- `GET /api/ig/positions` — live open positions
- `GET /api/ig/prices?epics=CS.D.EURUSD.CFD.IP` — live prices for EPICs
- `GET /api/ig/session` — session status, age, TTL
- `POST /api/ig/session/refresh` — force token refresh
- `GET /api/ig/config` — view config (credentials masked)
- `POST /api/ig/config` — update credentials or switch profile
- `POST /api/ig/config/test` — test connection (supports `{"profile":"demo"}` or `{"profile":"live"}`)

### Direct IG API Login (if needed)

```bash
curl -s -D - -X POST "https://demo-api.ig.com/gateway/deal/session" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json; charset=UTF-8" \
  -H "X-IG-API-KEY: {apiKey from ig-config.json}" \
  -H "Version: 2" \
  -d "{\"identifier\":\"{username}\",\"password\":\"{password}\"}"
```

Capture `CST` and `X-SECURITY-TOKEN` from the response headers for all subsequent API calls.

### Skills Available

- **ig-trading** — Authentication, trade positions, working orders, account info
- **ig-market-data** — Search markets, prices, watchlists, sentiment, EPICs reference

---

## Account: CFD/Spreadbet (e.g., A1960)

Captured pages from IG Labs documentation for API trading.

**Source:** https://labs.ig.com and https://www.ig.com/uk/kid/cfd-ncr

**Timestamp:** Fri 2026-02-27 11:49 UTC

---

### Key Information Documents (KIDs)

**Getting Started**

To begin using our API all you need to do is:

1. **Create an account**
2. **Generate your API key**
3. **Start coding**

#### Create a live account
To use our API you will need an IG account. If you don't already have one you can apply for one [here](https://www.ig.com/uk).

#### Generate your API key
The API key identifies your application and authorises its use. At the moment we are limiting the number of API keys to one per account.

To create your **live API key**:
- Log into our web-based platform using your live account details
- Go to **My Account > Settings > API Keys**
- Enter your key name and click **GENERATE NEW KEY**

#### Create a demo account
We recommend that you open a demo account so you can test your application in a safe environment.

You can open a demo account as follows:
- Login to the web trading platform with your live account
- Use the account switcher on the top left of the page to create a demo account

**Generate your demo API key**:
- Log into our web-based platform using your live account details
- Use the account switcher to switch to demo
- Go to **My Account > Settings > API Keys**
- Enter your key name and click **GENERATE NEW KEY**

#### Choose your demo environment login credentials
Start coding

You can now begin coding using any programming language that supports HTTP.

Get started by referring to our guides on the left, or by trying out your demo account on one of our sample applications.

We suggest to use the **API companion** and the **Streaming companion** to explore the API.

**N.B:** Date and time values are ISO 8601 formatted and in UTC time zone unless otherwise stated.

**Some restrictions apply**
- Direct market access is not currently available for our APIs
- Shares trading is available but without share price information
- Each API key is subject to standard usage quotas.

**Subscribe to updates**
News and updates about the API will be posted via Twitter on [@IGLabs](https://twitter.com/IGLabs) #webapi

To query a list of recent API changes please use the release hashtag: [@IGLabs](https://twitter.com/IGLabs) #webapi #release

### Key information documents
[Trading basics link placeholder]

If you're new to trading we recommend that you familiarise yourself with the basic concepts first. We have a wide range of articles and guides that cover important topics such as trading strategies and risk management which can be found [here](https://www.ig.com/uk).

If you're ready to start using our API, we highly recommend that you first understand how we treat our products in a development environment.

### Market instruments
Market instruments are a fundamental aspect of our API. Each market instrument represents either a CFD or spread bet whose price is determined by an underlying asset or market.

In the majority of cases you can take a long (buy) or short (sell) position on a market to take advantage of rising and falling prices.

You can find more information on the markets you can trade at [www.ig.com/uk/services-ig](https://www.ig.com/uk/services-ig).

Our instruments are identified by proprietary **EPICs**, such as `IX.D.FTSE.CFD.IP` - this CFD contract shows that it is the FTSE100 cash price market.

There are several ways to locate instruments using our API:
- Searching using the `/markets?q={searchTerm}` API
- Using a watchlist that has either been created using the `/watchlists` API or our dealing platform

**Please note** that our markets are not always available to be traded. When retrieving market information on a particular product our API will also return the status of the market.

Examples of market statuses are:
- **TRADEABLE** - the market is open
- **CLOSED** - we are not currently offering that market

A full list of market statuses along with descriptions can be found in the [API reference](link).

### Instrument prices
There are two ways to determine the latest bid (sell price)/offer (buy price) level for an instrument:

1. Subscribe to the instrument via our [streaming API](link). This is the **recommended approach**, allowing up to 40 concurrent subscriptions by default.
2. Poll the `/markets/{epic}` API to obtain a regular market snapshot. This is **not recommended** as it will rapidly use up the API quota for an application.

In addition, historical prices may be obtained via the `/prices` API.

### Trading
Placing a trade involves **opening a position**. A basic position consists of:
- An instrument and, if applicable, an expiry
- An execution price level
- A direction - buy or sell

Once opened, the position will then be either in profit or loss, depending on the market movement of the underlying instrument. Positions are then **closed** in order to realise any profit or loss.

Positions can either be opened immediately via the `/positions` API, or with **conditional, working orders** (via the `/working-orders` API) which only trigger when the desired price level is met.

Positions will generally be created as **market orders**, where we will determine the appropriate execution price level when the position is placed.

For more information about the different kinds of order types please visit the [API order types section](link).

### Confirming trades
Trade confirmation is done in two phases:
1. **Acknowledgement** - a deal reference is returned via the `/positions/otc` API when an order is placed
2. **Confirmation** - a deal identifier is received by subscribing to the `TRADES:CONFIRMS` Streaming API message (**recommended**), or by polling the `/confirms` REST API

Most orders are usually executed within a few milliseconds but it means the confirm may not be available immediately if there is a delay.

**Please also note** the confirm is only available up to 1 minute via the REST API.

### Trade history
Historical trade and account activity can be viewed via the `/history/transactions` and `/history/activity` APIs.

### Instrument expiry
Some of our CFD and spread bet instruments have an associated **expiry** (or period). This is the date at which the instrument will automatically close, e.g. DEC-14.

CFDs that do not expire have an expiry of **'-'**.

When a market expires it will **settle (close)** based on the price of the underlying asset.

You can instruct us to **roll a product over** which will result in your existing position being closed and automatically reopened with the next available expiry date, while realising any running profit or loss.

### Market research
In addition to an EPIC, every instrument has an associated **market group identifier**, e.g. FT100. This typically refers to the underlying real-world instrument from which the IG instrument was derived.

Market group identifiers are used by the research APIs such as `/client-sentiment` to provide contextual market information.

An instrument's market group may be determined via the `/markets/{epic}` API.

If you need more information please refer to the reference, glossary and support sections.

### Tiered pricing
#### What is Tiered pricing and how does it work?
#### How does this affect how you use the API?

There are 2 new concepts that are exposed in our Public API:
- **Tiered pricing**
- **Repeat dealing windows**

**Tiered Pricing Example**

| Tier | Bid price | Bid size | Ask price | Ask size |
|------|-----------|----------|-----------|----------|
| 1    | 6500      | 400      | 6502      | 300      |
| 2    | 6499      | 800      | 6503      | 700      |
| 3    | 6498      | 1200     | 6504      | 1000     |
| 4    | 6497      | 1600     | 6505      | 1800     |
| 5    | 6496      | 2000     | 6506      | 2500     |

**Example scenarios:**
- Sell/buy trades with sizes up to 400 should submit the price of 6500/6503 respectively
- Sell/buy trades with size up to 800 should submit price of 6499/6504 respectively

Price tiers are exposed in a new Lightstreamer subscription. Please see reference page for list of all fields: [Streaming API Reference](link)

If the instrument can be traded in multiple currencies, there will be a price tier per currency. See the following fields in the Streaming API Reference:
- `CURRENCY1-5` - currency code
- `C1BIDSIZE1-5` The bid size thresholds for currency 1
- `C1ASKSIZE1-5` The ask size thresholds for currency 1
- `C2BIDSIZE1-5` The bid size thresholds for currency 2
- `C2ASKSIZE1-5` The ask size thresholds for currency 2

#### Recent trade history
Trading multiple times within a short time period in smaller sizes are still subject to price tiers. The sizes of previous trades are taken into account when deciding what price tier a trade belongs to and **only recent trades** are taken into account.

Using the example from the table above:
- If a user places 3 **BUY** trades of size 150 in quick succession, the first two trades are within the 300 size thresholds and the price submitted should be in the first tier (6502).
- However, the third trade will fall into the second tier, meaning users should submit the price from the second tier (6503).

#### How do I know what tier I am in when submitting multiple trades?
**Repeat dealing windows** are a way for users to keep track of sizes from previous trades that will be considered when trading.

A repeat dealing window is unique per instrument, direction, and currency.

Repeat dealing windows are exposed via streamed confirms under the `TRADE:{account identifier}` Lightstreamer subscription and also via the REST `/repeat-dealing-window` endpoint.

**Repeat dealing window example:**
1. User places a **BUY** trade with size 100 on instrument A at timestamp=0
   - This will result in a repeat deal window of: direction=**BUY**, size=100, instrument=A, expiryTimestamp=30
   - The size of 100 will be taken into account when placing any trades before the expiry timestamp.

e.g. Following on once again from the table above:
- **BUY** trades of size 200 are eligible for the first price tier (300), and larger sizes will be subject to higher price tiers.
- User places another **BUY** trade with size 100 on instrument A at timestamp 15
  - This will result in another repeat deal window being added:
    - direction=**BUY**, size=100, instrument=A, expiryTimestamp=30
    - direction=**BUY**, size=100, instrument=A, expiryTimestamp=45
  - This means the size of **200** will be considered when placing a trade for instrument A in the **BUY** direction.

At timestamp **31**, the first repeat deal window will expire, and the only size **100** will be taken into consideration for subsequent trades.

---

**End of Page 1**

## Page 2: API Order Types

**Timestamp:** Fri 2026-02-27 11:50 UTC

There are two types of order available on our API:
- **Immediate orders**
- **Resting orders**

### Immediate order types
There are two kinds of immediate order:
- **Market order**
- **Limit fill or kill order**

**Note:** There is an additional order type **"QUOTE"** representing "IG-quoted" orders which is currently **not supported**.

#### Market order
A market order is an instruction to **buy or sell at the best available price** for the size of your order.

When using this type of order you choose the **size** and **direction** of your order, **but not the price**.

You do not have any control over what price your order will be filled at; it will be filled at the **then market price** which may be worse than the indicative prices visible when placing the order.

This is because:
- The full size of the order you request may not be available at the time you place your market order
- The price may change significantly between that time and when your order size becomes available

This is particularly true for:
- Markets that are not traded in high volumes
- Orders submitted during **fast-moving markets**
- Orders submitted **outside the open hours** of the underlying market

#### Limit fill or kill
A **limit fill or kill** order is an instruction to buy or sell in a **specified size within a specified price limit**, which is **filled completely or rejected**.

Provided the market price is within the specified limit and there is sufficient volume available, the order will be filled at the **prevailing market price**.

The entire order will be **rejected** if:
- The market price is **outside your specified limit** (higher for buy orders, lower for sell orders)
- There is **insufficient volume** available to satisfy the full order size

**Examples** [link placeholder]

### Resting orders
There are two kinds of resting order:
- **Working orders (to open)**
- **Attached or contingent orders (to close)**

Both consist of **limit** and **stop** orders.

#### Working orders (to open)
- **Limit order:** This is an order to open a position by **buying when the market reaches a lower level** than the current price, or **selling short when the market hits a higher level** than the current price.  
  This is suitable if you think the market price will **change direction** when it hits a certain level.
- **Stop order:** This is an order to **buy when the market hits a higher level** than the current price, or **sell when the market hits a lower level** than the current price.  
  This is suitable if you think the market will **continue moving in the same direction** once it hits a certain level.

#### Attached or contingent orders (to close)
These orders can be **attached to open positions** or left as **contingent orders** attached to working orders to open.

- **Limit order:** This is an order to close a **long position when the market reaches a higher level** than the current price, or close a **short position when the market reaches a lower level**.  
  **Example:** Let's say you have a long position that's currently **in profit**. If you have a **target level** at which you'd be happy to collect your gains, you can set a limit to close out your position when and if this level is met. You may then avoid the risk of a subsequent change in market direction wiping out your profit.
- **Stop order:** This is an order to close an open position by **selling when the market reaches a lower level**, or **buying when the market reaches a higher level**.  
  This type of order is known as a **stop-loss** and is commonly used to close out a position at a **predetermined level**, effectively **restricting the amount of money you could lose**.  
  Adding a stop order means your position will be closed if the market **moves too far against you**.

---

**End of Page 2**

## Page 3: REST Trading API Guide

**Timestamp:** Fri 2026-02-27 11:53 UTC

### Overview
**REST (Representational State Transfer)** is the standard way of accessing resources over the web. It is done through four standard HTTP operations:
- **GET** - retrieve a resource
- **POST** - create a resource
- **PUT** - update (replace) a resource
- **DELETE** - delete a resource

**Example:** When you enter `http://www.ig.com` into the browser address bar, the browser issues a **GET** HTTP request on the web page resource at that address, and returns a web page as a response.

Similarly, in the case of our API, a **GET** HTTP request to `https://api.ig.com/gateway/deal/positions` would return a **list of open positions** on the active account.

The **R in REST** refers to the **representation (or format)** of the resource being accessed. In our case, it is the web-standard **JSON (JavaScript Object Notation)** format.

If you have an **IG demo account**, we recommend that you run the sample application on the left, logging in using your demo account, and selecting **'Show HTTP'** to see the API HTTP requests and responses in action.

### HTTP Requests

| Section    | Component                  | Action                  |
|------------|----------------------------|-------------------------|
| HTTP operation | GET                       | retrieve a resource    |
|             | PUT                       | replace a resource     |
|             | POST                      | create a resource      |
|             | DELETE                    | delete a resource      |
| HTTPS      | The secure web protocol. It ensures that requests are **encrypted** between the application and the API. | |
| demo-api.ig.com/gateway/deal | The **API gateway location**. Use `api.ig.com` instead of `demo-api.ig.com` for **live account access**. | |
| /positions | The **address of the resource** you are accessing, positions in this case. | |
| **Request Header** | **X-IG-API-KEY:** `k` <br> The API key `k` (obtained from **My Account** on our dealing platform) is how we **identify and authorise** the calling application. | |
|             | **CST / Authorization** <br> A valid **access token** identifying the client. | |
|             | **X-SECURITY-TOKEN / IG-ACCOUNT-ID** <br> A valid **account token or account id** identifying the client's current account. | |
|             | **Content-Type:** `application/json` <br> **Request format type.** This should **always be set** as indicated to **json only**. | |
|             | **Accept:** `application/json; charset=UTF-8` <br> **Response format type.** This should **always be set** as indicated to **json only**. | |
|             | **Version:** `v` <br> API version `v` (**defaults to 1**, if not specified). | |
| **Request Body** | Only required for **PUT or POST** requests. **JSON format**. | |

### Authentication and authorisation
There are currently **two mechanisms** for logging into and accessing the API.

1. **POST /session v1 and v2** return:
   - A **CST header** with a token identifying a **client**
   - An **X-SECURITY-TOKEN header** with a token identifying the **current account**

   These headers should be passed on **subsequent requests** to the API.  
   Both tokens are initially valid for **6 hours** but get **extended up to a maximum of 72 hours** while they are in use.

2. **POST /session v3** returns **OAuth access and refresh tokens** which the user can pass in subsequent API requests via the **Authorization header**, e.g.:

   ```
   Authorization: Bearer 5d1ea445-568b-4748-ab47-af9b982bfb74
   ```

   The **access token** only identifies the **client** so users should also pass an **IG-ACCOUNT-ID header** to specify the account the request applies to, e.g.:

   ```
   IG-ACCOUNT-ID: PZVI2
   ```

   The **access token** is only valid for a **limited period of time** (e.g. **60 seconds**) specified by the login response.

   ```
   "oauthToken": {
     "access_token": "702f6580-25c7-4c04-931d-6000efa824f8",
     "refresh_token": "a9cec2d7-fd01-4d16-a2dd-7427ef6a471d",
     "scope": "profile",
     "token_type": "Bearer",
     "expires_in": "60"
   }
   ```

   The **refresh token** can be used to acquire a **new access token**, either **before or after** the access token has expired **but please note** that the refresh token **does also expire** some time after the access token has expired (e.g. **10 minutes**).

   A call to refresh an access token will also return a **new refresh token**.

   The **scope** for individual clients is always **profile** which allows **full access** to the user's account.

### FIQL query filters
**FIQL** ([https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00](https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00)) defines a syntax for expressing filters on entries of a web feed so it can be used to **query resources**.

The **activity history** is one of the endpoints supporting this syntax and provide a way to query activities, e.g.:

```
"filter": "status==ACCEPTED;(channel==PUBLIC_WEB_API,channel==PUBLIC_FIX_API);details.actions.actionType==WORKING_ORDER_DELETED"
```

This query returns all activity history item representing a **cancelled order** either via the **public Web or FIX API**.

### HTTP Response

| Section       | Component             | Description                          |
|---------------|-----------------------|--------------------------------------|
| **Response Header** | **X-REQUEST-ID**    | Identifies the request.             |
| **HTTP status code** | **200**             | request executed fine               |
|                    | **401**             | access denied                       |
|                    | **500**             | server failure                      |
|                    | ...                 |                                     |
| **Response Body** | Request results, if any. **JSON format.**<br>In the event of an **error**, the body will be of the form:<br>`{ "errorCode" : "the error code" }` | |

### Paging
Paging applies to a **subset of endpoints** returning a **list of entries**, such as e.g. historical data.

A **metadata section** on the response should provide paging details:

```
"metadata": {
  "paging": {
    "next": "/history/activity?version=3&from=2016-05-27T00:00:00&to=2016-05-27T09:04:49&detailed=true&pageSize=10"
  }
}
```

In this case **"next"** will provide a link to retrieve the **next page of data**.

### Errors
Error responses contain a **4xx or 5xx HTTP status** and a body with the following format:

```
{ "errorCode": "the error code" }
```

**User errors** caused by e.g. malformed json or invalid requests will be returned as **HTTP 4xx errors**.

The suffix of error codes in validation failures can change depending on the **request field** that caused the failure, e.g. `"invalid.request.forceOpen"` indicates that the value on request field **"forceOpen"** was invalid.

---

**End of Page 3**

## Page 4: REST Trading API Reference (Endpoints List)

**Timestamp:** Fri 2026-02-27 11:54 UTC

### Account
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/accounts` | GET | 1 | Returns a list of the logged-in client's accounts. |
| `/accounts/preferences` | GET | 1 | Returns account preferences. |
| | PUT | 1 | Updates account preferences. |
| `/history/activity` | GET | 3 | Returns the account activity history. |
| | GET | 2 | Returns the account activity history. |
| `/history/activity/{fromDate}/{toDate}` | GET | 1 | Returns the account activity history for the given date range. |
| `/history/activity/{lastPeriod}` | GET | 1 | Returns the account activity history for the last specified period. |
| `/history/transactions` | GET | 2 | Returns the transaction history. Returns the minute prices within the last 10 minutes by default. |
| `/history/transactions/{transactionType}/{fromDate}/{toDate}` | GET | 1 | Returns the transaction history for the specified transaction type and given date range. |
| `/history/transactions/{transactionType}/{lastPeriod}` | GET | 1 | Returns the transaction history for the specified transaction type and period. |

### Dealing
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/confirms/{dealReference}` | GET | 1 | Returns a deal confirmation for the given deal reference. Please note, this should only be used if the deal confirmation isn't received via the streaming API. |
| `/positions` | GET | 2 | Returns all open positions for the active account. |
| | GET | 1 | Returns all open positions for the active account. |
| `/positions/{dealId}` | GET | 2 | Returns an open position for the active account by deal identifier. |
| | GET | 1 | Returns an open position for the active account by deal identifier. |
| `/positions/otc` | DELETE | 1 | Closes one or more OTC positions. |
| | POST | 2 | Creates an OTC position. |
| | POST | 1 | Creates an OTC position. |
| `/positions/otc/{dealId}` | PUT | 2 | Updates an OTC position. |
| | PUT | 1 | Updates an OTC position. |
| `/working-orders` | GET | 2 | Returns all open working orders for the active account. |
| | GET | 1 | Returns all open working orders for the active account. |
| `/working-orders/otc` | POST | 2 | Creates an OTC working order. |
| | POST | 1 | Creates an OTC working order. |
| `/working-orders/otc/{dealId}` | DELETE | 2 | Deletes an OTC working order. |
| | DELETE | 1 | Deletes an OTC working order. |
| | PUT | 2 | Updates an OTC working order. |
| | PUT | 1 | Updates an OTC working order. |
| `/repeat-dealing-window` | GET | 1 | Returns the current repeat deal window status of the account. |

### Markets
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/categories` | GET | 1 | Returns a list of all categories of instruments enabled for the IG account. |
| `/categories/{categoryId}/instruments` | GET | 1 | Returns all instruments for the given category. |
| `/markets` | GET | 2 | Returns the details of the given markets. |
| | GET | 1 | Returns the details of the given markets. |
| `/markets/{epic}` | GET | 4 | Returns the details of the given market. |
| | GET | 3 | Returns the details of the given market. |
| | GET | 2 | Returns the details of the given market. |
| | GET | 1 | Returns the details of the given market. |
| `/markets?searchTerm={searchTerm}` | GET | 1 | Returns all markets matching the search term. |
| `/prices/{epic}` | GET | 3 | Returns historical prices for a particular instrument. Returns the minute prices within the last 10 minutes by default. |
| `/prices/{epic}/{resolution}/{numPoints}` | GET | 2 | Returns a list of historical prices for the given epic, resolution and number of data points. |
| | GET | 1 | Returns a list of historical prices for the given epic, resolution and number of data points. |
| `/prices/{epic}/{resolution}/{startDate}/{endDate}` | GET | 2 | Returns a list of historical prices for the given epic, resolution and date range. |
| `/prices/{epic}/{resolution}?startdate={startdate}&enddate={enddate}` | GET | 1 | Returns a list of historical prices for the given epic, resolution and date range. |

### Watchlists
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/watchlists` | GET | 1 | Returns all watchlists belonging to the active account. |
| | POST | 1 | Creates a watchlist. |
| `/watchlists/{watchlistId}` | DELETE | 1 | Deletes a watchlist. |
| | GET | 1 | Returns a watchlist. |
| | PUT | 1 | Add a market to a watchlist. |
| `/watchlists/{watchlistId}/{epic}` | DELETE | 1 | Remove a market from a watchlist. |

### Client sentiment
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/client-sentiment` | GET | 1 | Returns the client sentiment for the given instrument's market. |
| `/client-sentiment/{marketId}` | GET | 1 | Returns the client sentiment for the given instrument's market. |
| `/client-sentiment/related/{marketId}` | GET | 1 | Returns a list of related market sentiment for the given instrument's market. |

### Login
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/session` | DELETE | 1 | Log out of the current session. |
| | GET | 1 | Returns the user's session details and optionally tokens. |
| | POST | 3 | Creates a trading session, obtaining session tokens for subsequent API access. **Please note, region-specific login restrictions may apply.** |
| | POST | 2 | Creates a trading session, obtaining session tokens for subsequent API access. **Please note, region-specific login restrictions may apply.** |
| | POST | 1 | Creates a trading session, obtaining session tokens for subsequent API access. **Please note, region-specific login restrictions may apply.** |
| | PUT | 1 | Switches active accounts, optionally setting the default account. |
| `/session/encryptionKey` | GET | 1 | Creates a trading session, obtaining session tokens for subsequent API access. **Please note, region-specific login restrictions may apply.** |
| `/session/refresh-token` | POST | 1 | Refreshes a trading session, obtaining new session tokens for subsequent API access. |

### Indicative costs and charges
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/indicativecostsandcharges/close` | POST | 1 | Returns indicative costs and charges at closing. **Supported website IDs:** atm, atf, dem, def, det, esm, esf, est, frm, frf, frt, itm, itf, itt, nlm, nlf, nlt, nom, nof, not, sem, sef, set, eng, enf, ent, iei, iem, ief, iet, igi, igm, por, pof. |
| `/indicativecostsandcharges/durablemedium/{indicativeQuoteReference}` | GET | 1 | Download a previously generated indicative costs and charges quote as a pdf. **Supported website IDs:** ... [same list] |
| `/indicativecostsandcharges/edit` | POST | 1 | Returns indicative costs and charges for editing an order. **Supported website IDs:** ... |
| `/indicativecostsandcharges/history/from/{from}/to/{to}` | GET | 1 | Returns indicative costs and charges history for the given date range. **Supported website IDs:** ... |
| `/indicativecostsandcharges/open` | POST | 1 | Returns indicative costs and charges at opening. **Supported website IDs:** ... |

### General
| Endpoint | Method | Version | Description |
|----------|--------|---------|-------------|
| `/operations/application` | GET | 1 | Returns a list of client-owned applications. |
| | PUT | 1 | Alters the details of a given user application. |
| `/operations/application/disable` | PUT | 1 | Disables the current application key from processing further requests. Disabled keys may be re-enabled via the 'my account' section on our web dealing platform. |

---

**End of Page 4**

## Page 5: Streaming API Guide

**Timestamp:** Fri 2026-02-27 11:55 UTC

Our **streaming API** enables you to stream real-time:
- **Market prices**
- **Trade notifications**
- **Account status notifications**

To get started you will need to first **download the Lightstreamer client library** for your programming platform.

It is **recommended** that you read our **REST API guide** before using our streaming API in order to understand the process of obtaining **secure connection tokens**.

### Concepts

#### Connect
To connect to an **IG streaming server** you'll need to specify the following:

| Element | Value |
|---------|-------|
| **Lightstreamer Server** | Lightstreamer server address returned by the `/session` API. **This may be subject to change** so should **not be hard-coded**. |
| **Identifier** | **Active account identifier** |
| **Password** | `CST-{CST token}\|XST-{X-SECURITY-TOKEN token}`, tokens obtained on login via the REST `/session` service |
| **Callback Function** | Optional function that will receive any **Lightstreamer connection notifications** |

**NOTE:** The streaming API currently **does not accept OAuth tokens** so users holding **OAuth bearer tokens** should call `GET /session?fetchSessionTokens=true` to obtain **CST and X-SECURITY-TOKEN tokens**.

#### Subscribe
To subscribe for **price or account updates**, a **subscription request** must be made to Lightstreamer.

A subscription request consists of:
- A **list of items** (e.g. IG market identifiers)
- A **list of fields** relevant to those items (e.g. BID, ASK)

**Multiple subscriptions** can be made, but each subscription may **only contain items of one type**.

By default, **up to 40 simultaneous subscriptions per connection** may be created.

**Whilst it's possible** to increase this number by connecting more than once, **this is a breach of IG's terms and conditions** and may result in your **API permissions being revoked**. Please contact us if you need to increase your usage quotas.

A **Lightstreamer connection** needs an **active thread** to stream data so it is **important for applications to establish connections in separate threads**.

**Creating multiple Lightstreamer connections on the main thread** may cause connections to **drop intermittently**.

The **Lightstreamer client** should also have the ability to **reconnect** in the event of:
- A **connection failure**
- If instructed by the **Lightstreamer server** (e.g. due to a **LOOP rebind** message)

A **re-connection attempt** can fail if the **CST and X-SECURITY-TOKEN tokens have expired** in which case it will be necessary to **re-authenticate** to obtain new security tokens.

The **full list of available subscription item identifiers and fields** can be found [here](link placeholder).

**Example - Javascript Lightstreamer code**

#### Connect function
```javascript
function connectToLightstreamer(){
  // include the Lightstreamer LightstreamerClient module using require.js
  require(["LightstreamerClient"], function (LightstreamerClient) {
    // Instantiate Lightstreamer client instance
    lsClient = new LightstreamerClient(lsEndpoint);

    // Set up login credentials
    lsClient.connectionDetails.setUser(activeAccountId);
    lsClient.connectionDetails.setPassword("CST-" + client_token + "|XST-" + account_token);

    // Add connection event listener callback functions
    // Note: the Lightstreamer library will transparently attempt to reconnect a number of times
    // in the event of communications errors
    lsClient.addListener({
      onListenStart: function() {
        console.log('ListenStart');
      },
      onStatusChange: function(status) {
        console.log('Lightstreamer connection status:' + status);
      }
    });

    // Connect to Lightstreamer
    lsClient.connect();
  });
}
```

#### Create a subscription
Each **Lightstreamer subscription** requires:
- A **Lightstreamer connection**
- A **subscription type** - only **DISTINCT** or **MERGE** are supported*
- A **list of items of the same type** (i.e. price, account or epic). For example, a list of instrument **EPICs** in the case of a price subscription
- The **desired fields** for those items

_*DISTINCT* indicates that each update should yield a notification and is required for **trade notifications**.  
_*MERGE* indicates that updates occurring very close together should only yield one update, and is used for **account and price notifications** to regulate the update rate._

**For example:**
```javascript
function connectToLightstreamer(itemList, fieldList){
  // include the Lightstreamer Subscription module using require.js
  require(["Subscription"], function (Subscription) {
    var subscription = new Subscription(
      "MERGE",
      itemList,  // e.g. {"MARKET:IX.D.FTSE.DAILY.IP","MARKET:MT.D.GC.MONTH1.IP"}
      fieldList  // e.g. {"BID", "OFFER"}
    );

    // Set up Lightstreamer event listener
    subscription.addListener({
      onSubscription: function () {
        console.log('subscribed');
      },
      onUnsubscription: function () {
        console.log('unsubscribed');
      },
      onSubscriptionError: function (code, message) {
        console.log('subscription failure: ' + code + " message: " + message);
      },
      onItemUpdate: function (updateInfo) {
        // Lightstreamer published some data
        var epic = updateInfo.getItemName().split(":")[1];
        updateInfo.forEachField(function (fieldName, fieldPos, value) {
          console.log('Field: ' + fieldName + " Value: " + value);
          // Alternatively, if the field is JSON, such as in a confirm message:
          var confirm = JSON.parse(value);
          console.log('json: ' + confirm.dealId)
        });
      }
    });

    // Subscribe to Lightstreamer
    lsClient.subscribe(subscription);
  });
}
```

If a subscription is **no longer required**, it can be **removed** at any time by unsubscribing.

**For example:**
```javascript
lsClient.unsubscribe(subscription);
lsClient.closeConnection();
```

---

**End of Page 5**

## Page 6: Streaming API Reference (Subscription Fields)

**Timestamp:** Fri 2026-02-27 11:56 UTC

**Price subscription** (price availability subject to account permissions)  
**Subscription data adapter:** Pricing  
**Item:** `PRICE:{account identifier}:{epic}` (**MERGE** mode)

| Field | Description |
|-------|-------------|
| `MID_OPEN` | Opening mid price |
| `HIGH` | Intraday high price |
| `LOW` | Intraday low price |
| `BIDQUOTEID` | ID of bid quote to reference when trading |
| `ASKQUOTEID` | ID of ask quote to reference when trading |
| `BIDPRICE1` | The bid price of the top tier of the ladder |
| `BIDPRICE2`-`5` | Ladder tier prices |
| `ASKPRICE1` | The ask price of the top tier of the ladder |
| `ASKPRICE2`-`5` | Ladder tier prices |
| `BIDSIZE1` | Size available at the 1st tier price. **If not present then the ladder is not configured for this instrument.** |
| `BIDSIZE2`-`5` | Ladder tier sizes |
| `ASKSIZE1` | Size available at the 1st tier price. **If not present then the ladder is not configured for this instrument.** |
| `ASKSIZE2`-`5` | Ladder tier sizes |
| `CURRENCY0` | The currency of the default ladder. **This is only guaranteed to be populated if there is a ladder**, i.e. one or more `ASKSIZE1-5` and `BIDSIZE1-5` is populated. |
| `CURRENCY1` | Currency for the ladder fields prefixed `C1` |
| `C1BIDSIZE{1-5}` | The bid trading size threshold |
| `C1ASKSIZE{1-5}` | The ask trading size threshold |
| `CURRENCY2`-`5` | Currency for ladder fields prefixed `C{2-5}` |
| `C{2-5}BIDSIZE{1-5}` | The bid trading size threshold |
| `C{2-5}ASKSIZE{1-5}` | The ask trading size threshold |
| `TIMESTAMP` | The timestamp in UTC millis |
| `DLG_FLAG` | `"CLOSED" "CALL" "DEAL" "EDIT" "CLOSINGSONLY" "DEALNOEDIT" "AUCTION" "AUCTIONNOEDIT" "SUSPEND"` Market status |

**Market subscription** *(deprecated in favour of Price subscription)*  
**Item:** `MARKET:{epic}` (**MERGE** mode)

| Field | Description |
|-------|-------------|
| `MID_OPEN` | Opening mid price |
| `HIGH` | Intraday high price |
| `LOW` | Intraday low price |
| `CHANGE` | Price change compared with open value |
| `CHANGE_PCT` | Price percent change compared with open value |
| `UPDATE_TIME` | Publish time of last price update (**UK local time**, i.e. GMT or BST) |
| `MARKET_DELAY` | Delayed price (`0`=false, `1`=true) |
| `MARKET_STATE` | Market status: `CLOSED`, `OFFLINE`, `TRADEABLE`, `EDIT`, `AUCTION`, `AUCTION_NO_EDIT`, `SUSPENDED` |
| `BID` | Bid price |
| `OFFER` | Offer price |
| `STRIKE_PRICE` | Strike price (Sprint markets) |
| `ODDS` | Trade odds (Sprint markets) |

**Account subscription**  
**Item:** `ACCOUNT:{account identifier}` (**MERGE** mode)

| Field | Description |
|-------|-------------|
| `PNL` | Account profit and loss value |
| `DEPOSIT` | Account minimum deposit value required for margins |
| `AVAILABLE_CASH` | Amount cash available to trade value, after account balance, profit and loss and minimum deposit amount have been considered |
| `PNL_LR` | Profit/Loss Limited Risk |
| `PNL_NLR` | Profit/Loss Non-limited Risk |
| `FUNDS` | Funds |
| `MARGIN` | Margin |
| `MARGIN_LR` | Margin Limited Risk |
| `MARGIN_NLR` | Margin Non-limited Risk |
| `AVAILABLE_TO_DEAL` | Available to Trade |
| `EQUITY` | Equity |
| `EQUITY_USED` | Equity Used |

**Trade subscription**  
**Item:** `TRADE:{account identifier}` (**DISTINCT** mode)

**CONFIRMS** Trade confirmations for an account

| Field | Description |
|-------|-------------|
| `direction` | `BUY`, `SELL` |
| `limitLevel` | Number limit level |
| `dealId` | Deal identifier |
| `affectedDeals` | Array[Object] Affected deals (dealId) |
| `status` | `AMENDED`, `DELETED`, `FULLY_CLOSED`, `OPENED`, `PARTIALLY_CLOSED` |
| `stopLevel` | Number stop level |
| `expiry` | String instrument expiry |
| `size` | Number trade size |
| `status` | Resultant position or working order status: `AMENDED`, `CLOSED`, `DELETED`, `OPEN`, `PARTIALLY_CLOSED` |
| `epic` | Instrument EPIC identifier |
| `level` | Number trade level |
| `guaranteedStop` | Boolean True if a guaranteed stop is in place |
| `dealReference` | Deal reference |
| `dealStatus` | `ACCEPTED`, `REJECTED` |
| `repeatDealingWindow` | Object Repeat deal window parent object |
| `entries` | Array[Object] List of repeat deal windows (`size`: double size of the repeat dealing window, `expiry`: long expiry timestamp for this window) |

**OPU** Open position updates for an account

| Field | Description |
|-------|-------------|
| `direction` | `BUY`, `SELL` |
| `limitLevel` | Number |
| `dealId` | Deal identifier |
| `dealIdOrigin` | Deal identifier of the originating deal |
| `stopLevel` | Number |
| `expiry` | String instrument expiry |
| `timestamp` | Date event date and time |
| `size` | Number trade size |
| `status` | Position status: `OPEN`, `UPDATED`, `DELETED` |
| `epic` | Instrument EPIC identifier |
| `level` | Number trade level |
| `guaranteedStop` | Boolean |
| `dealReference` | Deal reference |
| `dealStatus` | `ACCEPTED`, `REJECTED` |
| `channel` | User channel (do not bind - will be converted to enum) |
| `currency` | Currency |
| `trailingStopDistance` | Number trailing stop distance |
| `trailingStep` | Number trailing stop increment |

**WOU** Working order updates for an account

| Field | Description |
|-------|-------------|
| `direction` | `BUY`, `SELL` |
| `limitDistance` | Number |
| `dealId` | Deal identifier |
| `stopDistance` | Number |
| `expiry` | String instrument expiry |
| `timestamp` | Date event date and time |
| `size` | Number trade size |
| `status` | Working order status: `OPEN`, `UPDATED`, `DELETED` |
| `epic` | Instrument EPIC identifier |
| `level` | Number trade level |
| `guaranteedStop` | Boolean |
| `dealReference` | Deal reference |
| `dealStatus` | `ACCEPTED`, `REJECTED` |
| `currency` | Currency |
| `orderType` | `LIMIT`, `STOP` |
| `timeInForce` | `GOOD_TILL_CANCELLED`, `GOOD_TILL_DATE` |
| `goodTillDate` | Date good until specified date |
| `channel` | User channel (do not bind - will be converted to enum) |

**Chart subscriptions - Consolidated (candle) data**  
**Item:** `CHART:{epic}:{scale}` (**MERGE** mode) `{scale}`: `SECOND`, `1MINUTE`, `5MINUTE`, `HOUR`

| Field | Description |
|-------|-------------|
| `LTV` | Last traded volume |
| `TTV` | Incremental volume |
| `UTM` | Update time (milliseconds from Epoch) |
| `DAY_OPEN_MID` | Mid open price for the day |
| `DAY_NET_CHG_MID` | Change from open price to current (MID price) |
| `DAY_PERC_CHG_MID` | Daily percentage change (MID price) |
| `DAY_HIGH` | Daily high price (MID) |
| `DAY_LOW` | Daily low price (MID) |
| `OFR_OPEN` | Candle open price (OFR) |
| `OFR_HIGH` | Candle high price (OFR) |
| `OFR_LOW` | Candle low price (OFR) |
| `OFR_CLOSE` | Candle close price (OFR) |
| `BID_OPEN` | Candle open price (BID) |
| `BID_HIGH` | Candle high price (BID) |
| `BID_LOW` | Candle low price (BID) |
| `BID_CLOSE` | Candle close price (BID) |
| `LTP_OPEN` | Candle open price (Last Traded Price) |
| `LTP_HIGH` | Candle high price (Last Traded Price) |
| `LTP_LOW` | Candle low price (Last Traded Price) |
| `LTP_CLOSE` | Candle close price (Last Traded Price) |
| `CONS_END` | 1 when candle ends, otherwise 0 |
| `CONS_TICK_COUNT` | Number of ticks in candle |

**Chart subscriptions - Tick data**  
**Item:** `CHART:{epic}:TICK` (**DISTINCT** mode)

| Field | Description |
|-------|-------------|
| `BID` | Bid price |
| `OFR` | Offer price |
| `LTP` | Last traded price |
| `LTV` | Last traded volume |
| `TTV` | Incremental trading volume |
| `UTM` | Update time (milliseconds from Epoch) |
| `DAY_OPEN_MID` | Mid open price for the day |
| `DAY_NET_CHG_MID` | Change from open price to current (MID price) |
| `DAY_PERC_CHG_MID` | Daily percentage change (MID price) |
| `DAY_HIGH` | Daily high price (MID) |
| `DAY_LOW` | Daily low price (MID) |

---

**End of Page 6**

## Page 7: Glossary

**Timestamp:** Fri 2026-02-27 11:57 UTC

| Term | Definition |
|------|------------|
| **Account** | IG account (of type CFD or spreadbet), against which trades may be made, e.g. **A1960**. |
| **Affected deal identifier** | The deal identifier of a subsequent trade that was executed as a result of a trade, e.g. to net off positions. |
| **Bet size** | Governs how much you make or lose on a spread bet for every point of movement in the price of the market. |
| **Bid** | A spread betting price is made up of a level at which you can 'sell' and a level at which you can 'buy'. The level at which you can **'sell' is always the lower**. |
| **Binary** | A binary allows you to take a view on whether a specific outcome will or won't occur. For example, 'Will Wall Street be up at the close of the day?' If the answer is 'yes', the binary settles at **100**. If the answer is 'no', the binary settles at **0**. Your profit or loss is the difference between 100 (if the event occurs) or zero (if the event doesn't occur) and the level at which you **'bought' or 'sold'**. Binary prices can be **extremely volatile** even when the underlying market is relatively static. A small movement in the underlying can make all the difference between the binary settling at 0 or 100. |
| **Buy** | You **'buy' a market** if you think it will rise (if you are opening a new trade or bet). You also **'buy' to close out** an existing **'sell' trade or bet**. |
| **CFD** | Contract for difference. |
| **Closing** | The process of **ending an existing trade or bet**. Closing the position results in a **profit or loss being realised**. |
| **Contract size** | In the case of CFDs, this is the number of contracts you wish to trade or of open positions. For spread bets this is the **amount of profit or loss per point** movement in the market. |
| **Controlled risk** | A bet which has a **strictly limited maximum loss** by virtue of a guaranteed stop. |
| **CST** | **Client Security Token** - identifies an authenticated client session. |
| **Currency** | The currency denomination, e.g. **GBP**. |
| **Date** | Unless otherwise specified, all dates and times will be **relative to the time zone of the account**. |
| **Deal identifier** | **Permanent deal reference** for a confirmed trade. |
| **Deal reference** | **Transient deal reference** for an unconfirmed trade. |
| **Deposit** | The funds required as an **initial (margin) outlay** for a bet. It is **not the total amount** that can be lost on the bet. |
| **DMA** | **Direct market access** - a way of directly interacting with the order book of an exchange. |
| **EPIC** | **IG instrument identifier**, e.g. `X.D.EURGBP.CASH.IP`. |
| **Expiry** | The date (and sometimes time) at which a spreadbet or CFD will **automatically close** against some predefined market value should the bet remain open beyond its **last dealing time**. Some CFDs do not expire, and have an expiry of **'-'**. e.g. `DEC-14`, or `DFB` for daily funded bets. |
| **Fill** | The **execution of an order**. |
| **Force open** | Enabling force open when creating a new position or working order will enable a **second position to be opened** on a market. **Working orders (orders to open) have this set to true by default**. |
| **Guaranteed stop** | A **stop-loss order** that puts an **absolute limit on your liability**, eliminating the chance of slippage and **guaranteeing an exit price** for your trade. **Please note that guaranteed stops come at the price of an increased spread**. |
| **Instrument** | IG tradeable financial instrument (market), typically based on some **underlying financial market instrument**. Since our instruments are derived, they do not have recognisable real-world identifiers such as the Reuters or Bloomberg codes. Instead, IG's instruments are identified by **proprietary identifiers known as EPICs**. `KA.D.VOD.CASH.IP`, for example, is the EPIC for IG's Vodafone **spot** (as opposed to futures) instrument. The IG instrument EPICs for an underlying market of interest may be determined via our API's set of **/market services**. **Please note** that in the case of expiring time-based instruments, the IG instrument is **'rolled' over** to the next interval, and so will represent a **different underlying instrument**, even though the EPIC is unchanged. |
| **Instrument type** | A type of IG tradeable financial instrument, e.g. **Binary**. |
| **L1** | **Level 1 pricing** refers to the current **best bid and offer levels**. |
| **L2** | **Level 2 pricing** is relevant for **direct market access (DMA)** products. As well as showing the best bid and offer you can also view the **market depth**. Market depth displays the **liquidity** in the instrument in more detail, listing other buyers and sellers and the **size they are willing to trade** in below and above the current bid/offer levels. |
| **Level** | Instrument price. |
| **Lightstreamer** | Third party streaming software from [lightstreamer.com](http://lightstreamer.com). |
| **Limit** | An order to **open a position** when the price of an instrument moves to a **more favourable level**. |
| **Limit working order** | An instruction to deal if the price moves to a **more favourable level**, e.g. to **'buy' if the price goes down** to a specified level. |
| **Liquid market** | A liquid market has a **sufficient volume of two-way business** for a trade to occur **without moving prices unduly**. The market will normally exhibit **narrow bid-offer spreads**. |
| **Lot size** | Minimum amount of unit that an instrument can be dealt in the market. It's the relationship between **unit** and the **amount per point**. |
| **Margin** | The amount required from a client (**in addition to any deposit due**) to cover losses when a price moves adversely. Sometimes called **variation margin**. |
| **Market** | A financial market, which may refer to an **underlying financial market**, or the market being offered in terms of an **IG instrument**. IG instruments are organised in the form a **navigable market hierarchy**. |
| **Market identifier** | The name of a **natural grouping** of a set of IG markets, typically representing the **underlying 'real-world' market**. For example, **VOD-UK** represents Vodafone Group PLC (UK). This identifier is primarily used in our **market research services**, such as client sentiment, and may be found on the `/market/{epic}` service. |
| **Market order** | An order that you use to specify the **direction and size** of a bet, **but not the price**. This ensures we will **fill your order as quickly as possible**, even if the price indicated on the deal ticket is **not available** for your requested order size. |
| **Offer** | A spread betting price is made up of a level at which you can 'sell' and a level at which you can 'buy'. The level at which you can **'buy' is always the higher**. |
| **Opening** | The process of **establishing a new trade or bet**. |
| **Period** | Another name for **expiry**. |
| **Point** | The increment in price movement that results in you **making or losing your bet size**. |
| **Position** | A **running bet**, which may be **long (buy)** or **short (sell)**. |
| **Price** | Price of an IG instrument. IG instrument prices are **streamed via Lightstreamer**, subject to the permissions of the **active account**. |
| **Profit and loss** | **Realised profit and loss** is the amount of money you have made or lost on a bet **once the bet has been closed**. Realised profit or loss will **add or subtract from your cash balance**. |
| **Pseudo position** | DMA positions will be made up of **one or more pseudo positions**, each of which constitutes a **partially filled DMA position**. |
| **Quote** | The **two-way market price** that we are making for a given instrument. Because it is two-way, you can **'buy' or 'sell'**, according to whether you think the price will rise or fall. |
| **Rollover** | Where a trade or bet approaching expiry is **closed** and a position of the **same size and direction** is opened for the **next period**, thereby **prolonging the exposure** to a particular market. |
| **Scaling factor** | Scaling factor to be used to **multiply/divide the level values** for an instrument in order to calculate **market exposure**. |
| **Sell** | You **'sell' a market** if you think it will fall (if you are opening a new trade or bet). You also **'sell' to close out** an existing **'buy' position**. |
| **Slippage** | The difference between the level of a **stop order** and the **actual price** at which it was executed. Slippage can occur during periods of **higher volatility** when market prices **move rapidly or gap**. |
| **Spread** | The difference between the **'buying' and 'selling' price**. |
| **Spread bet** | A bet on whether a financial market (**the underlying market**) will rise or fall. We offer **two prices** on every market; the difference is known as the **bid/offer spread**. If you think a market is set to rise you **'buy' at the higher (or offer) price**, and if you think it will fall you **'sell' at the lower (bid) price**. Whether you gain or lose money on the bet – and how much – depends on the **size/direction of any movement** in the underlying market. **Only available in the UK**. |
| **Stop** | An order to **close an open position** when the price moves to a **less favourable level** in order to **limit your loss**. |
| **Stop order** | An instruction to deal if the price becomes **less favourable**; normally placed to prevent a loss of **more than a certain amount of money**. |
| **Time** | Unless otherwise specified, all dates and times will be **relative to the time zone of the account**. |
| **Trailing stop** | A type of **stop order** that moves **automatically when the market moves in your favour**, locking in gains while your position is open. |
| **Underlying** | The **actual traded market or markets** from which the price of a CFD or spread bet is derived. |
| **Watchlist** | A collection of **markets of interest**. |
| **Working order** | An order that is **waiting to be filled** when the market reaches the **specified level**. |

---

**End of Page 7 (Glossary)**

## Appendix: Core Costs (IG AU CFDs)

**What the Agent Pays on Every Trade**

| Term | What it is | Typical on IG AU (CFD) | When you pay it |
|------|------------|------------------------|-----------------|
| **Spread** | Difference between buy (ask) and sell (bid) price | Built-in fee. No extra commission on FX/indices/commodities | On every open + close |
| **Commission** | Flat or % fee | Only on share CFDs (e.g. AUD 7 min or 0.08%) | Per side (open + close) |
| **Overnight funding** | Interest charge for holding past daily cut-off (≈10 pm UK / 4:50 pm Sydney) | Varies by market (formula below) | Every night held |

**Most important:** On forex, indices, commodities, crypto CFDs → **spread only** (main “order fee”).

### 2. Real Spread Examples (Minimum & Average)
**Forex (Cash CFDs)**
- EUR/USD → min 0.6 points, avg 0.86
- AUD/USD → min 0.6 points, avg 1.07
- EUR/GBP → min 0.9 points, avg 1.83

**Indices**
- Australia 200 → min 1 point
- US 500 → min 0.4 points
- FTSE 100 / Germany 40 → min 1–1.4 points

**Commodities**
- Spot Gold → min 0.3 points
- US Crude / Brent → min 2.8 points

### 3. Contract Sizes & Minimum Trade Size
- **Forex:** 1 contract = 100,000 base currency (standard lot) → Pip ~AUD 10–15/contract.
- **Indices:** 1 contract = $1–$25/point.
- **Min size:** 0.1 contracts (micro) for forex/indices.

### 4. Minimum Move to Break Even
Pay **full spread twice** (round-trip).  
**Formula:** Breakeven move (points) = Spread (points)

**Examples:**
- EUR/USD 0.6 → +0.6 pips to break even (1 contract).
- Australia 200 1 → +1 point.

**With size:** Breakeven = Spread × contracts × value/point.  
**Agent rule:** Expected move > breakeven + slippage buffer.

### 5. Position Sizing & Initial Position
**Risk rule:** Max **1% balance** per trade.  
**Formula:** Size (contracts) = (Balance × 0.01) / (Stop distance × Value/point)

**Start safe:** 0.1–0.5 contracts. <2-3% risk till >AUD 5-10k.  
**Overnight:** Calc funding (forex/indices small; futures in spread).

**Ready Agent Prompt (Paste):**
```
You are trading IG AU CFDs. Rules:
- Cost = spread (EUR/USD 0.6, AUD/USD 0.6, Aus200=1pt)
- Breakeven = full spread points
- Size = (balance * 0.01) / (stop pts * pt value)
- Start max 0.5 contracts/strategy
- No overnight w/o funding calc
- Always show: spread, breakeven, size pre-order
Confirm + calc breakeven/position for EUR/USD 0.6-pip trade, 50-pip stop.
```

