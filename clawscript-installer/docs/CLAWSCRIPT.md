# ClawScript Handbook — Complete Language Reference

ClawScript is a domain-specific language (DSL) for writing automated trading strategies. Scripts are written in a simple imperative syntax and compile to JavaScript strategy classes that run inside the Trade Claw Engine.

## Quick Start

```clawscript
// Simple RSI strategy
DEF rsi = RSI(14)

IF rsi < 30 THEN
  BUY 1 AT MARKET STOP 20 LIMIT 40 REASON "RSI oversold"
ENDIF

IF rsi > 70 THEN
  SELL 1 AT MARKET STOP 20 REASON "RSI overbought"
ENDIF
```

## Where to Find ClawScript

- **Editor**: IG Dashboard → ClawScript Editor tab (top nav link)
- **Parser**: `skills/bots/clawscript-parser.cjs`
- **Flow Builder**: `ig-clawscript-flow.js` (visual node editor)
- **Templates**: `.openclaw/canvas/clawscript-templates/` (7 sample strategies)
- **Full Docs**: `/__openclaw__/canvas/clawscript-docs.html`
- **Trading Bot Rulebook**: `skills/clawscript/TRADING-BOT-RULEBOOK.md` — **MANDATORY reading before creating trading strategies**
- **Compiled Strategies**: `skills/bots/strategies/` (`.cjs` files extending `BaseStrategy`)
- **GitHub Repo**: https://github.com/JoeSzeles/clawscript
- **Handbook (this file)**: `clawscript-installer/docs/CLAWSCRIPT.md`

## Trading Bot Creation Rules

**IMPORTANT**: When creating trading strategies via ClawScript, follow the Trading Bot Rulebook (`skills/clawscript/TRADING-BOT-RULEBOOK.md`). Key rules:

1. Every strategy MUST have conditional BUY/SELL commands (never unconditional)
2. Every strategy MUST use at least one indicator (RSI, EMA, MACD, etc.)
3. Every strategy MUST specify stopDistance and limitDistance > 0
4. Every strategy MUST check for null indicator values before using them
5. After compiling, always run a backtest to verify the strategy generates trades
6. The engine does NOT silently fall back to scalper — if a strategy type is invalid, it shows an error
7. Generated strategy files MUST have: `static get STRATEGY_TYPE()`, `evaluateEntry()`, `evaluateExit()`, `getRequiredBufferSize()`, `getConfigSchema()`

## Editor Features

- **Syntax Highlighting**: Color-coded keywords by category (trade=green, AI=purple, data=blue, control=red, notifications=pink)
- **VS Code-style Error Highlighting**: Red wavy underlines on error lines, gutter icons, inline error annotations
- **AI Assistant Panel**: Built-in chat with auto-detect model selector — reads your code, errors, and logs
- **Live Parse**: Real-time parsing as you type with statement count display
- **Instrument Selector**: Set any IG epic for simulation/backtest (not just BTC)
- **Real Data with Fallback**: IG API → DB-cached candles → in-memory stream ticks → demo data
- **Green Play Button**: One-click simulation with visual feedback
- **Backtest Button**: Opens config popup (timeframe, candle count, instrument) then shows results popup with equity curve
- **Run Live Button**: Opens config popup then deploys script as persistent process with live log viewer
- **Templates Dropdown**: 7 built-in templates across 3 sections (Default, ClawScript, Load Custom)
- **Indicators Dropdown**: All 25+ indicators organized by category (Trend, Oscillators, Volatility, Volume) — inserts code at cursor, favorites saved to localStorage
- **Export**: `.cs` source, `.json` AST, `.js` compiled output
- **Visual Flow Builder**: Drag-drop node editor with 20+ categories including Indicators (5 sub-categories) and Notifications

## Strategy Save & Deploy Pipeline

1. Write ClawScript in the editor
2. Click "Compile & Save" — parses, generates JS, opens save dialog
3. Enter strategy name and filename (auto-generated)
4. Save to Bot — strategy file saved to `strategies/` folder
5. Strategy auto-discovered by bot engine, appears in Claw Trader dashboard with `[CS]` badge
6. `INPUT_*` and `DEF` variables become editable fields with tooltips in bot config

### API Endpoints (authenticated)
- `GET /api/clawscript/strategies` — list saved strategies
- `POST /api/clawscript/strategies` — save new strategy
- `DELETE /api/clawscript/strategies/:name` — delete strategy
- `GET /api/clawscript/strategies/:name/schema` — get config schema
- `GET /api/clawscript/strategies/:name/source` — get source code
- `POST /api/clawscript/backtest` — run backtest with real/cached data

## Using the Parser

```javascript
const { parseToAST, parseAndGenerate } = require('./skills/bots/clawscript-parser.cjs');

const ast = parseToAST(scriptCode);
const { js, ast: parsedAst } = parseAndGenerate(scriptCode, 'MyStrategy');
```

`parseAndGenerate(code, name)` returns `{ js, ast }` where `js` is a complete Node.js module exporting a strategy class.

## All Commands (100+ total)

### Trading (6)
| Command | Syntax | Description |
|---------|--------|-------------|
| `BUY` | `BUY <size> AT MARKET\|LIMIT\|STOP [STOP <dist>] [LIMIT <dist>] [REASON <str>]` | Open long position |
| `SELL` | `SELL <size> AT MARKET\|LIMIT\|STOP [STOP <dist>] [REASON <str>]` | Open short / close long |
| `SELLSHORT` | `SELLSHORT <size> [STOP <dist>] [REASON <str>]` | Open short position |
| `EXIT` | `EXIT ALL\|PART [REASON <str>]` | Close position (all or partial) |
| `CLOSE` | `CLOSE [REASON <str>]` | Close current position |
| `TRAILSTOP` | `TRAILSTOP <dist> [ACCEL <val>] [MAX <val>]` | Set trailing stop |

### Variables (4)
| Command | Syntax | Description |
|---------|--------|-------------|
| `DEF` | `DEF <name> = <expr>` | Define constant variable |
| `SET` | `SET <name> = <expr>` | Update mutable variable |
| `STORE_VAR` | `STORE_VAR <key> <value>` | Persist to storage |
| `LOAD_VAR` | `LOAD_VAR <key> [DEFAULT <val>]` | Load from storage |

### Control Flow (6)
| Command | Syntax | Description |
|---------|--------|-------------|
| `IF` | `IF <cond> THEN ... [ELSE ...] ENDIF` | Conditional branch |
| `LOOP` | `LOOP <n> TIMES ... ENDLOOP` or `LOOP FOREVER ... ENDLOOP` | Loop N times or forever |
| `WHILE` | `WHILE <cond> ... ENDWHILE` | Loop while condition true |
| `TRY` | `TRY ... CATCH <var> ... ENDTRY` | Error handling |
| `WAIT` | `WAIT <ms>` | Pause execution (milliseconds) |
| `ERROR` | `ERROR <message>` | Throw an error |

### AI / Analysis (4)
| Command | Syntax | Description |
|---------|--------|-------------|
| `AI_QUERY` | `AI_QUERY <prompt> [TOOL <name>] [ARG <val>]` | Query AI model |
| `AI_GENERATE_SCRIPT` | `AI_GENERATE_SCRIPT <prompt> [TO <file>]` | Auto-generate ClawScript |
| `ANALYZE_LOG` | `ANALYZE_LOG <query> [LIMIT <n>]` | Analyze trade logs |
| `RUN_ML` | `RUN_ML <model> <data>` | Run ML model |

### Data Fetch (8)
| Command | Syntax | Description |
|---------|--------|-------------|
| `CLAW_WEB` | `CLAW_WEB <url> [INSTRUCT <str>]` | Fetch web content |
| `CLAW_X` | `CLAW_X <query> [LIMIT <n>]` | Search X/Twitter |
| `CLAW_PDF` | `CLAW_PDF <file> [QUERY <str>]` | Extract PDF content |
| `CLAW_IMAGE` | `CLAW_IMAGE <desc> [NUM <n>]` | Generate AI image |
| `CLAW_VIDEO` | `CLAW_VIDEO <url>` | Analyze video |
| `CLAW_CONVERSATION` | `CLAW_CONVERSATION <query>` | Get conversation history |
| `CLAW_TOOL` | `CLAW_TOOL <toolName>` | Execute external tool |
| `CLAW_CODE` | `CLAW_CODE <code>` | Execute code snippet |

### Agent / Orchestration (6)
| Command | Syntax | Description |
|---------|--------|-------------|
| `SPAWN_AGENT` | `SPAWN_AGENT <name> <prompt>` | Create agent instance |
| `CALL_SESSION` | `CALL_SESSION <agent> <command>` | Call agent session |
| `MUTATE_CONFIG` | `MUTATE_CONFIG <key> <value>` | Change bot config at runtime |
| `ALERT` | `ALERT <message> [LEVEL <lvl>] [TO <target>]` | Send alert |
| `SAY_TO_SESSION` | `SAY_TO_SESSION <session> <message>` | Message a session |
| `WAIT_FOR_REPLY` | `WAIT_FOR_REPLY <session> [TIMEOUT <ms>]` | Wait for reply |

### Advanced (7)
| Command | Syntax | Description |
|---------|--------|-------------|
| `CRASH_SCAN` | `CRASH_SCAN ON\|OFF` | Enable crash scanner |
| `MARKET_NOMAD` | `MARKET_NOMAD ON\|OFF` | Enable nomadic scanning |
| `NOMAD_SCAN` | `NOMAD_SCAN <category> [LIMIT <n>]` | Scan instruments |
| `NOMAD_ALLOCATE` | `NOMAD_ALLOCATE <target> [SIZING <mode>]` | Allocate to instruments |
| `RUMOR_SCAN` | `RUMOR_SCAN <topic> [SOURCES <list>]` | Scan market rumors |
| `OPTIMIZE` | `OPTIMIZE <var> FROM <min> TO <max> STEP <step>` | Optimize parameter |
| `INDICATOR` | `INDICATOR <name> <params>` | Calculate indicator |

### Functions (3)
| Command | Syntax | Description |
|---------|--------|-------------|
| `DEF_FUNC` | `DEF_FUNC <name>(<args>) ... ENDFUNC` | Define function |
| `CHAIN` | `CHAIN ... ENDCHAIN` | Chain operations |
| `INCLUDE` | `INCLUDE <script>` | Include external script |

### TradingView-Style (13)
| Command | Syntax | Description |
|---------|--------|-------------|
| `STRATEGY_ENTRY` | `STRATEGY_ENTRY <name> [DIRECTION <dir>] [SIZING <mode>] [STOP <dist>] [LIMIT <dist>]` | Pine Script-style strategy entry |
| `STRATEGY_EXIT` | `STRATEGY_EXIT <name> [REASON <str>]` | Pine Script-style strategy exit |
| `STRATEGY_CLOSE` | `STRATEGY_CLOSE [REASON <str>]` | Close all strategy positions |
| `INPUT_INT` | `INPUT_INT <name> [DEFAULT <val>]` | Declare integer input parameter |
| `INPUT_FLOAT` | `INPUT_FLOAT <name> [DEFAULT <val>]` | Declare float input parameter |
| `INPUT_BOOL` | `INPUT_BOOL <name> [DEFAULT <val>]` | Declare boolean input parameter |
| `INPUT_SYMBOL` | `INPUT_SYMBOL <name> [DEFAULT <val>]` | Declare symbol input parameter |
| `TIMEFRAME_PERIOD` | `TIMEFRAME_PERIOD` | Get current timeframe period |
| `TIMEFRAME_IS_DAILY` | `TIMEFRAME_IS_DAILY` | Check if daily timeframe |
| `ARRAY_NEW` | `DEF arr = ARRAY_NEW` | Create new array |
| `ARRAY_PUSH` | `ARRAY_PUSH <arr> <value>` | Push value to array |
| `MATRIX_NEW` | `DEF m = MATRIX_NEW <rows> <cols>` | Create new matrix |
| `MATRIX_SET` | `MATRIX_SET <matrix> <row> <col> <value>` | Set matrix cell value |

### Bloomberg / Data Access (5)
| Command | Syntax | Description |
|---------|--------|-------------|
| `FETCH_HISTORICAL` | `FETCH_HISTORICAL <metric> [FROM <date>] [TO <date>]` | BDH-style historical data fetch |
| `FETCH_MEMBERS` | `FETCH_MEMBERS <index>` | BDS-style index member fetch |
| `GROUP_MEMBERS` | `GROUP_MEMBERS <index>` | Get group/index constituents |
| `ECON_DATA` | `ECON_DATA <metric> [COUNTRY <code>] [DATE <date>]` | Fetch economic data point |
| `ESTIMATE` | `ESTIMATE <field> <ticker>` | Get consensus estimate (EPS, etc.) |

### Time / Schedule (5)
| Command | Syntax | Description |
|---------|--------|-------------|
| `TIME_IN_MARKET` | `TIME_IN_MARKET <position_id> [UNIT <ms/sec/min/hour/day>]` | Time since position opened |
| `TIME_SINCE_EVENT` | `TIME_SINCE_EVENT <event_time> [UNIT <unit>]` | Time since an event occurred |
| `SCHEDULE` | `SCHEDULE <task> [AT <HH:MM>] [REPEAT <daily/weekly>]` | Schedule task at time |
| `WAIT_UNTIL` | `WAIT_UNTIL <condition> [TIMEOUT <seconds>]` | Wait until condition met |
| `TASK_SCHEDULE` | `TASK_SCHEDULE <name> [EVERY <interval>] [RUN <command>]` | Schedule recurring task |

### Portfolio (3)
| Command | Syntax | Description |
|---------|--------|-------------|
| `MARKET_SCAN` | `MARKET_SCAN <category> [CRITERIA <expr>] [LIMIT <n>]` | Scan markets by criteria |
| `PORTFOLIO_BUILD` | `PORTFOLIO_BUILD [FROM <scan>] [NUM <n>] [SIZING <mode>] [MAX_RISK <pct>]` | Build portfolio from scan |
| `PORTFOLIO_REBALANCE` | `PORTFOLIO_REBALANCE [THRESHOLD <dd_pct>]` | Rebalance on drawdown |

### Economic / Political (8)
| Command | Syntax | Description |
|---------|--------|-------------|
| `ECON_INDICATOR` | `ECON_INDICATOR <metric> [COUNTRY <code>] [DATE <date>]` | GDP, CPI, unemployment, rates |
| `FISCAL_FLOW` | `FISCAL_FLOW <asset> [WINDOW <period>]` | Track capital flows (ETF, COT) |
| `ELECTION_IMPACT` | `ELECTION_IMPACT <event> [REGION <code>]` | Score election market impact |
| `CURRENCY_CARRY` | `CURRENCY_CARRY <pair>` | Calculate carry trade differential |
| `POLICY_SENTIMENT` | `POLICY_SENTIMENT <policy> [COUNTRY <code>]` | Policy sentiment score |
| `SANCTION_IMPACT` | `SANCTION_IMPACT <country> [COMMODITY <type>]` | Estimate sanction price impact |
| `VOTE_PREDICT` | `VOTE_PREDICT <election> [POLL_SOURCE <source>]` | Aggregate election polls |
| `WEATHER_IMPACT` | `WEATHER_IMPACT <location> [DAYS <n>]` | Weather impact on economy |

### Scientific / Quantitative (3)
| Command | Syntax | Description |
|---------|--------|-------------|
| `MATH_MODEL` | `MATH_MODEL <equation> [SOLVE <var>] [PARAMS <str>]` | Symbolic math / equation solver |
| `RISK_MODEL` | `RISK_MODEL <type> [CONFIDENCE <val>] [WINDOW <period>]` | VaR / ES risk calculation |
| `MONTE_CARLO` | `MONTE_CARLO <scenario> [RUNS <n>]` | Monte Carlo simulation |

### Utility (1)
| Command | Syntax | Description |
|---------|--------|-------------|
| `FILE_PARSE` | `FILE_PARSE <filename> [FORMAT <csv/json/pdf>]` | Parse file data |

### PRT Compatibility (40+)
ProRealTime compatibility layer — prefix PRT_ maps to ClawScript equivalents.

| Command | Maps To | Description |
|---------|---------|-------------|
| `PRT_BUY` / `PRT_SELL` | `BUY` / `SELL` | PRT order aliases |
| `PRT_IF` / `PRT_THEN` / `PRT_ELSE` / `PRT_ENDIF` | `IF` / `THEN` / `ELSE` / `ENDIF` | PRT control flow |
| `PRT_ALERT` | `ALERT` | PRT alert |
| `PRT_OPTIMIZE` / `PRT_OPTIMISE` | `OPTIMIZE` | PRT optimization |
| `PRT_DEFPARAM` | `DEF` | PRT parameter definition |
| `PRT_RETURN` | return expression | PRT return value |
| `PRT_AVERAGE` | SMA indicator | PRT simple moving average |
| `PRT_RSI` | RSI indicator | PRT RSI |
| `PRT_MACD` | MACD indicator | PRT MACD |
| `PRT_BOLLINGER` | Bollinger Bands | PRT Bollinger |
| `PRT_STOCHASTIC` | Stochastic | PRT Stochastic %K/%D |
| `PRT_ATR` | ATR indicator | PRT Average True Range |
| `PRT_CCI` | CCI indicator | PRT Commodity Channel Index |
| `PRT_ADX` | ADX indicator | PRT Average Directional Index |
| `PRT_DONCHIAN` | Donchian Channels | PRT Donchian |
| `PRT_ICHIMOKU` | Ichimoku Cloud | PRT Ichimoku (tenkan/kijun/senkou) |
| `PRT_KELTNERCHANNEL` | Keltner Channels | PRT Keltner (EMA ± ATR*mult) |
| `PRT_PARABOLICSAR` | Parabolic SAR | PRT SAR (accel/max) |
| `PRT_SUPERTREND` | SuperTrend | PRT SuperTrend (ATR-based) |
| `PRT_FIBONACCI` | Fibonacci levels | PRT Fibonacci retracement |
| `PRT_PIVOTPOINT` | Pivot Points | PRT pivot (H+L+C)/3 |
| `PRT_DEMARK` | DeMark indicators | PRT TD Sequential |
| `PRT_WILLIAMS` | Williams %R | PRT Williams oscillator |
| `PRT_ULTOSC` | Ultimate Oscillator | PRT Ultimate Oscillator |
| `PRT_CHAIKIN` | Chaikin Oscillator | PRT Chaikin (ADL EMA diff) |
| `PRT_ONBALANCEVOLUME` | OBV | PRT On-Balance Volume |
| `PRT_VWAP` | VWAP | PRT Volume Weighted Avg Price |
| `PRT_VOLUMEBYPRICE` | Volume Profile | PRT Volume by Price |
| `PRT_CUM` | Cumulative sum | PRT cumulative expression |
| `PRT_HIGHEST` / `PRT_LOWEST` | Highest / Lowest | PRT high/low over period |
| `PRT_SUM` / `PRT_SUMMATION` | Rolling sum | PRT sum over period |
| `PRT_STD` | Standard deviation | PRT std dev over period |
| `PRT_CORRELATION` | Correlation | PRT correlation of two series |
| `PRT_REGRESSION` | Linear regression | PRT regression over period |
| `PRT_CROSS` | Crossover detection | PRT cross of two series |
| `PRT_BARSSINCE` | Bars since condition | PRT bar count since event |
| `PRT_HISTOGRAM` | MACD histogram | PRT histogram display |
| `PRT_DRAWLINE` / `PRT_DRAWARROW` | Drawing commands | PRT chart drawing |
| `PRT_BARINDEX` | Bar index | PRT current bar number |
| `PRT_DATE` / `PRT_TIME` | Date / Time | PRT date/time values |
| `PRT_TIMEFRAME` | Timeframe switch | PRT resolution change |

## Built-in Indicator Functions

Used in expressions after `DEF`/`SET`:

```clawscript
DEF rsi = RSI(14)
DEF ema = EMA(21)
DEF macd = MACD(12, 26, 9)
DEF bb_upper = BOLLINGER_UPPER(20, 2)
DEF bb_lower = BOLLINGER_LOWER(20, 2)
DEF atr = ATR(14)
DEF sma = SMA(50)
DEF price = LAST_PRICE()
DEF vol = VOLUME()
```

## Operators

| Operator | Description |
|----------|-------------|
| `+`, `-`, `*`, `/`, `%` | Arithmetic |
| `<`, `>`, `<=`, `>=`, `==`, `!=` | Comparison |
| `AND`, `OR`, `NOT` | Logical |
| `CROSSES OVER`, `CROSSES UNDER` | Crossover detection |
| `CONTAINS` | String/array containment |

## Expressions

- Numbers: `42`, `3.14`
- Strings: `"hello"`, `'world'`
- Identifiers: `myVar`, `rsi`, `config.size`
- Function calls: `RSI(14)`, `EMA(21)`
- Binary ops: `rsi < 30 AND ema > sma`
- Unary: `NOT condition`
- Special: `AI_RESULT` (result of last AI_QUERY)

## Sample Templates

Four ready-to-use templates are in `.openclaw/canvas/clawscript-templates/`:

1. **rsi-simple.cs** — Basic RSI oversold/overbought strategy
2. **ema-crossover.cs** — EMA crossover with trailing stop
3. **multi-indicator.cs** — RSI + MACD + Bollinger with try/catch
4. **sentiment-scan.cs** — AI sentiment + market scanner

## Compiled Strategy Format

Generated `.cjs` files extend `BaseStrategy` and export a class with:
- `evaluateEntry(ticks, context)` — returns trade signal or null
- `evaluateExit(position, ticks, context)` — returns `{close, reason}`
- `getConfigSchema()` — UI config fields
- `static STRATEGY_TYPE` — unique type identifier

Place compiled strategies in `skills/bots/strategies/` to auto-register with the engine.

## Visual Flow Builder

The flow builder provides a drag-drop node editor:
- **Toolbox sidebar**: 20+ categories, 100+ command nodes (collapsed by default)
- **Drag & drop**: Drag commands onto the canvas
- **Port connections**: Connect output ports to input ports
- **Bidirectional sync**: Code changes update flow, flow changes update code
- **Zoom/Pan**: Scroll to zoom (cursor-relative), click+drag to pan
- **Auto-layout**: Smart grid layout — linear scripts display ~4 nodes per row
- **Undo/Redo**: Ctrl+Z / Ctrl+Y
- **Export**: PNG screenshot of flow diagram

## Simulation & Backtest

### Simulation (▶ play button)
- Parses script and evaluates AST against price ticks
- With "Real Data" checked: fetches from IG API for the selected instrument
- **Fallback chain**: IG API → DB-cached candles (`/api/ig/stream/candles`) → in-memory stream ticks → mock data
- Instrument selector allows any IG epic (e.g. `CS.D.BITCOIN.CFD.IP`, `CS.D.CFAGOLD.CFA.IP`)
- Mock data generates 100 BTC-like ticks (~$48k-$52k) for offline testing

### Backtest (v1.1.6+)
- **Configuration popup** opens before running — set instrument, timeframe, and candle count
- **Timeframe selector**: MINUTE, 5-MIN, 15-MIN, 30-MIN, HOUR, 4-HOUR, DAY, WEEK
- **Candle count**: 10 to 2000 (default 200)
- **Data source fallback chain**: IG API → DB-cached candles → in-memory stream → demo data (auto-generated)
- **Results popup** shows: P&L summary, win rate, trade count, max drawdown, data source used
- **Equity curve** canvas chart drawn in the popup
- **Trade list** with entry/exit prices, times, and P&L per trade
- Settings persist in localStorage across sessions
- Works in standalone mode (serve.cjs) with demo data

### Run Live (v1.1.6+)
- **Configuration popup** before deploying — set script name and instrument
- Deploys script as a persistent process on the server
- **Live runner popup** shows real-time logs with color-coded output:
  - `[INFO]` = blue, `[WARN]` = orange, `[ERROR]` = red, `[TRADE]` = green
- **Control buttons**: Stop, Restart, Pause, Resume
- **Status polling** every 3s shows RUNNING/STOPPED badge
- **Log polling** every 2s fetches latest output
- Works in standalone mode (serve.cjs) — spawns Node.js child process

## Notification & Visual Output Commands (v1.1.6+)

Commands for creating notifications, popups, toasts, and real-time telemetry displays.

| Command | Syntax | Description |
|---------|--------|-------------|
| `NOTIFY` | `NOTIFY "message" [LEVEL "info"\|"warn"\|"error"]` | Browser notification + log output |
| `TOAST` | `TOAST "message" [DURATION ms]` | Temporary floating toast (auto-dismisses) |
| `POPUP` | `POPUP "title" WITH "html_content"` | Opens modal with HTML content |
| `DISPLAY` | `DISPLAY data [FORMAT "table"\|"chart"\|"json"]` | Popup with formatted data |
| `TELEMETRY_START` | `TELEMETRY_START "label"` | Opens real-time telemetry panel |
| `TELEMETRY_LOG` | `TELEMETRY_LOG key value` | Adds data point to telemetry |
| `TELEMETRY_STOP` | `TELEMETRY_STOP` | Closes telemetry session |

```clawscript
// Notification examples
NOTIFY "RSI crossed below 30" LEVEL "warn"
TOAST "Strategy started" DURATION 3000
POPUP "Trade Summary" WITH "<h3>P&L: +$150</h3><p>3 trades today</p>"
DISPLAY portfolio FORMAT "table"

// Real-time telemetry
TELEMETRY_START "Price Monitor"
DEF price = LAST_PRICE()
TELEMETRY_LOG "BTC" price
TELEMETRY_LOG "RSI" RSI(14)
TELEMETRY_STOP
```

## AI Assistant

Built into the editor's bottom panel (right side):
- **Model selector**: Auto-detect (probes available AI endpoints)
- **Auto-Find Agents**: Button scans 4 endpoints to discover available AI models
- **Context-aware**: Automatically includes current code, parse errors, and recent logs in each prompt
- **Capabilities**: Fix syntax errors, optimize strategies, explain ClawScript commands, suggest improvements
- **Chat interface**: Full conversation history with send on Enter

## Data Sources

ClawScript strategies and simulations can access price data through multiple tiers:

1. **IG REST API** — live prices via `/api/ig/pricehistory/:epic` (rate-limited, may return 403 on weekends)
2. **DB-Cached Candles** — stored in `price_candles` table from Lightstreamer stream, flushed every 10s
3. **In-Memory Stream** — real-time tick data aggregated into candles at multiple resolutions (1s to 1D)
4. **Mock Data** — generated sine-wave + noise for offline development

The system automatically builds candles from tick data at all standard resolutions:
`SECOND, SECOND_2, SECOND_5, SECOND_10, SECOND_20, SECOND_30, SECOND_40, MINUTE, MINUTE_5, MINUTE_15, HOUR, HOUR_4, DAY`

## General Automation & AI Agent Orchestration

ClawScript extends beyond trading into general-purpose automation. These commands let you plan tasks, manage agents, call skills, automate files, schedule jobs, and send notifications — all from ClawScript.

Wrapper module: `skills/bots/openclaw-automation.cjs`

### Task Planning & Workflow

<!-- @tag: TASK_DEFINE -->
#### TASK_DEFINE
Define a reusable task with a body of commands.
```clawscript
TASK_DEFINE "analyze_news" WITH "Summarize news from URL" BODY
  DEF page = WEB_FETCH "https://news.com"
  TASK_LOG "Fetched page" LEVEL "info"
ENDTASK
```
Grammar: `TASK_DEFINE "name" WITH "description" BODY ... ENDTASK`

<!-- @tag: TASK_ASSIGN -->
#### TASK_ASSIGN
Assign a defined task to an agent.
```clawscript
TASK_ASSIGN "analyze_news" TO "researcher"
```
Grammar: `TASK_ASSIGN "task_name" TO "agent_name"`

<!-- @tag: TASK_CHAIN -->
#### TASK_CHAIN
Chain tasks sequentially — output of each feeds into the next.
```clawscript
TASK_CHAIN "fetch_data"
```
Grammar: `TASK_CHAIN "task_name"`

<!-- @tag: TASK_PARALLEL -->
#### TASK_PARALLEL
Run tasks in parallel.
```clawscript
TASK_PARALLEL "scan_x"
```
Grammar: `TASK_PARALLEL "task_name"`

<!-- @tag: TASK_SHOW_FLOW -->
#### TASK_SHOW_FLOW
Generate a visual flow of the current workflow.
```clawscript
TASK_SHOW_FLOW
```
Grammar: `TASK_SHOW_FLOW`

<!-- @tag: TASK_LOG -->
#### TASK_LOG
Log a message with severity level.
```clawscript
TASK_LOG "Analysis started" LEVEL "info"
TASK_LOG "Critical failure" LEVEL "error"
```
Grammar: `TASK_LOG "message" [LEVEL "info|warn|error"]`

### Agent Management

<!-- @tag: AGENT_SPAWN -->
#### AGENT_SPAWN
Spawn a new sub-agent with instructions.
```clawscript
AGENT_SPAWN "analyzer" WITH "Review market data for anomalies"
```
Grammar: `AGENT_SPAWN "name" WITH "instructions" [TIMEOUT minutes]`

<!-- @tag: AGENT_CALL -->
#### AGENT_CALL
Call a running agent with a command and get the result.
```clawscript
DEF data = AGENT_CALL "fetcher" "get_latest_news"
```
Grammar: `DEF result = AGENT_CALL "agent_name" "command" [TIMEOUT seconds]`

<!-- @tag: AGENT_PASS -->
#### AGENT_PASS
Pass data from one agent to another.
```clawscript
AGENT_PASS "analysis_data" "reporter"
```
Grammar: `AGENT_PASS "data_var" "agent_name"`

<!-- @tag: AGENT_TERMINATE -->
#### AGENT_TERMINATE
Terminate a running agent.
```clawscript
AGENT_TERMINATE "analyzer" REASON "Task complete"
```
Grammar: `AGENT_TERMINATE "agent_name" [REASON "text"]`

### Skills & Tools

<!-- @tag: SKILL_CALL -->
#### SKILL_CALL
Call any OpenClaw skill by name.
```clawscript
DEF data = SKILL_CALL "ig-market-data" WITH epic="AUDUSD"
```
Grammar: `DEF result = SKILL_CALL "skill_name" [WITH key=value] [TIMEOUT seconds]`

<!-- @tag: CRON_CREATE -->
#### CRON_CREATE
Create a scheduled cron job.
```clawscript
CRON_CREATE "daily_backup" SCHEDULE "0 0 * * *" RUN "backup_all"
```
Grammar: `CRON_CREATE "name" SCHEDULE "cron_pattern" RUN "command"`

<!-- @tag: CRON_CALL -->
#### CRON_CALL
Trigger a cron job manually.
```clawscript
CRON_CALL "daily_backup"
```
Grammar: `CRON_CALL "name"`

<!-- @tag: WEB_FETCH -->
#### WEB_FETCH
HTTP fetch with optional method/body.
```clawscript
DEF page = WEB_FETCH "https://api.example.com/data"
DEF result = WEB_FETCH "https://api.example.com" WITH method="POST"
```
Grammar: `DEF result = WEB_FETCH "url" [WITH key=value] [TIMEOUT ms]`

<!-- @tag: WEB_SERIAL -->
#### WEB_SERIAL
Serial port I/O for hardware integration.
```clawscript
WEB_SERIAL "/dev/ttyUSB0" WITH baud=9600
```
Grammar: `WEB_SERIAL "port" [WITH key=value]`

### File & Data

<!-- @tag: FILE_READ -->
#### FILE_READ
Read a file with optional format parsing.
```clawscript
DEF content = FILE_READ "data.csv" FORMAT "csv"
DEF config = FILE_READ "settings.json" FORMAT "json"
```
Grammar: `DEF content = FILE_READ "filename" [FORMAT "text|csv|json"]`

<!-- @tag: FILE_WRITE -->
#### FILE_WRITE
Write content to a file.
```clawscript
FILE_WRITE "log.txt" "Entry: trade executed"
```
Grammar: `FILE_WRITE "filename" expression`

<!-- @tag: FILE_EXECUTE -->
#### FILE_EXECUTE
Execute a file as ClawScript or shell command.
```clawscript
DEF result = FILE_EXECUTE "sub_script.cs"
```
Grammar: `DEF result = FILE_EXECUTE "filename" [TIMEOUT ms]`

<!-- @tag: DATA_TRANSFORM -->
#### DATA_TRANSFORM
Transform data with operations (filter, map, sort).
```clawscript
DEF filtered = DATA_TRANSFORM trades USING "filter"
```
Grammar: `DEF result = DATA_TRANSFORM data_var USING "operation" [FORMAT "output_format"]`

### Communication

<!-- @tag: CHANNEL_SEND -->
#### CHANNEL_SEND
Send a message to a communication channel (Telegram, SMS, Discord).
```clawscript
CHANNEL_SEND "telegram" "Trade alert: BUY signal on AUDUSD"
```
Grammar: `CHANNEL_SEND "channel" "message"`

<!-- @tag: EMAIL_SEND -->
#### EMAIL_SEND
Send an email with optional subject and attachment.
```clawscript
EMAIL_SEND "me@gmail.com" "Daily P&L report attached" SUBJECT "Daily Summary"
```
Grammar: `EMAIL_SEND "address" "body" [SUBJECT "text"]`

<!-- @tag: PUBLISH_CANVAS -->
#### PUBLISH_CANVAS
Publish data to the OpenClaw canvas dashboard.
```clawscript
PUBLISH_CANVAS "status_page"
```
Grammar: `PUBLISH_CANVAS "page_name"`

### Example: Full Automation Script

```clawscript
// Morning routine automation
TASK_LOG "Starting morning analysis" LEVEL "info"

// Spawn agents for parallel work
AGENT_SPAWN "news_bot" WITH "Scan financial news"
AGENT_SPAWN "market_bot" WITH "Check market conditions"

// Fetch data in parallel
DEF news = AGENT_CALL "news_bot" "scan_headlines"
DEF market = SKILL_CALL "ig-market-data" WITH epic="AUDUSD"

// Analyze and decide
DEF rsi = RSI(14)
IF rsi < 30 THEN
  BUY 1 AT MARKET STOP 30 LIMIT 60 REASON "RSI oversold + news positive"
  CHANNEL_SEND "telegram" "BUY signal triggered on AUDUSD"
  EMAIL_SEND "trader@example.com" "RSI BUY on AUDUSD" SUBJECT "Trade Alert"
ENDIF

// Log and clean up
FILE_WRITE "trades.log" "Morning analysis complete"
TASK_LOG "Morning routine finished" LEVEL "info"
AGENT_TERMINATE "news_bot"
AGENT_TERMINATE "market_bot"
```

## Test Suite

- **169 pipeline tests**: End-to-end parse → compile → save → load across 26 categories
- **100% pass rate** including real BTC data integration tests and all automation commands
- Test runner: `skills/bots/tests/test-clawscript-parser.cjs` and `test-clawscript-pipeline.cjs`
- Report saved to: `.openclaw/clawscript-pipeline-report.json`
