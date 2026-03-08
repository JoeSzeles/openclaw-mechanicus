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
- **Compiled Strategies**: `skills/bots/strategies/` (`.cjs` files extending `BaseStrategy`)
- **GitHub Repo**: https://github.com/JoeSzeles/clawscript
- **Handbook (this file)**: `clawscript-installer/docs/CLAWSCRIPT.md`

## Editor Features

- **Syntax Highlighting**: Color-coded keywords by category (trade=green, AI=purple, data=blue, control=red)
- **VS Code-style Error Highlighting**: Red wavy underlines on error lines, gutter icons, inline error annotations
- **AI Assistant Panel**: Built-in chat that reads your code, errors, and logs — ask it to fix issues or explain syntax
- **Live Parse**: Real-time parsing as you type with statement count display
- **Instrument Selector**: Set any IG epic for simulation/backtest (not just BTC)
- **Real Data with Fallback**: IG API → DB-cached candles → in-memory stream ticks → mock data
- **Green Play Button**: One-click simulation with visual feedback
- **Templates Dropdown**: 7 built-in templates across 3 sections (Default, ClawScript, Load Custom)
- **Export**: `.cs` source, `.json` AST, `.js` compiled output
- **Visual Flow Builder**: Drag-drop node editor with bidirectional code sync

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

## All Commands (80+ total)

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
- **Toolbox sidebar**: 16 categories, 80+ command nodes (collapsed by default)
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

### Backtest
- Sends strategy to server-side backtest engine with full indicator computation
- Uses same fallback chain: IG API → DB-cached → stream candles → error
- Returns: P&L, win rate, max drawdown, trade list with entry/exit prices and times
- Uses up to 2000 historical candles at HOUR resolution

## AI Assistant

Built into the editor's bottom panel (right side):
- **Model selector**: CEO Agent (default, routes to OpenClaw gateway) or Grok
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

## Extended Indicators (30+)

ClawScript supports 30+ technical indicators in `DEF` statements:

| Indicator | Parameters | Description |
|-----------|-----------|-------------|
| `SMA(period)` | 20 | Simple Moving Average |
| `EMA(period)` | 20 | Exponential Moving Average |
| `RSI(period)` | 14 | Relative Strength Index |
| `MACD(fast, slow, signal)` | 12, 26, 9 | MACD line value |
| `ATR(period)` | 14 | Average True Range |
| `ADX(period)` | 14 | Average Directional Index |
| `BOLLINGER_UPPER(period, dev)` | 20, 2 | Bollinger Band upper |
| `BOLLINGER_LOWER(period, dev)` | 20, 2 | Bollinger Band lower |
| `STOCHASTIC(period)` | 14 | Stochastic %K |
| `STOCHASTIC_D(period)` | 14 | Stochastic %D |
| `CCI(period)` | 20 | Commodity Channel Index |
| `WILLIAMS_R(period)` | 14 | Williams %R |
| `ROC(period)` | 12 | Rate of Change |
| `AROON_UP(period)` | 25 | Aroon Up |
| `AROON_DOWN(period)` | 25 | Aroon Down |
| `ICHIMOKU_TENKAN(period)` | 9 | Ichimoku Tenkan-sen |
| `ICHIMOKU_KIJUN(period)` | 26 | Ichimoku Kijun-sen |
| `PARABOLIC_SAR(step, max)` | 0.02, 0.2 | Parabolic SAR |
| `KELTNER_UPPER(period, mult)` | 20, 1.5 | Keltner upper channel |
| `KELTNER_LOWER(period, mult)` | 20, 1.5 | Keltner lower channel |
| `DONCHIAN_HIGH(period)` | 20 | Donchian Channel high |
| `DONCHIAN_LOW(period)` | 20 | Donchian Channel low |
| `OBV` | — | On-Balance Volume |
| `VWAP` | — | Volume Weighted Average Price |
| `CMF(period)` | 20 | Chaikin Money Flow |
| `ZSCORE(period)` | 20 | Z-Score |
| `SUPERTREND(period, mult)` | 10, 3 | Supertrend |
| `LAST_PRICE` | — | Most recent price |
| `VOLUME` | — | Current volume |

## Operator Reference

### Arithmetic
`+`, `-`, `*`, `/`, `%` — Standard math operators in expressions

### Comparison
`<`, `>`, `<=`, `>=`, `==`, `!=` — Used in IF conditions

### Logical
`AND`, `OR`, `NOT` — Combine conditions

### Crossover
`CROSSES OVER`, `CROSSES UNDER` — Detect indicator crossovers

### String
`CONTAINS` — Check if string contains substring

## Visual Flow Builder — New Features

### Operator Nodes
- Round/circular shapes with operator symbol in center
- 2 input ports (left/right operand) + 1 output port (NOT has 1 input)
- Categories: Arithmetic, Comparison, Logical, Crossover, String
- Drag from "Operators" section in sidebar

### Multiple I/O Ports
- DEF nodes support fan-out: one output → multiple consumer nodes
- Visual spread with connection count badges
- Operator nodes accept multiple incoming connections

### Flow Toolbar
- Connect mode, Delete, Select All, Zoom In/Out/Fit, Auto-Layout, Export PNG, Undo/Redo, Clear All

### Command Info Icons
- ⓘ icon next to each command in sidebar
- Click to see floating documentation card with syntax, parameters, description

### Animated Flow Execution
- Active node glow with pulse animation
- Connection paths animate with flowing dashes
- Real values displayed on nodes (e.g., RSI=42.3)
- Color coding: green (signal), red (failed), blue (data)
- Speed control: Fast/Normal/Slow/Step

### Visual Output Popup
- Results button → draggable modal with tabs
- Simulation: signals, variables, trade list
- Backtest: equity curve canvas, P&L, drawdown, trade list
- Flow trace: step-by-step execution log
- API: `GET /api/clawscript/results` for programmatic access

## Standalone Editor Page

Access via "Code" link in top navigation bar. Opens `/__openclaw__/canvas/clawscript-editor.html` with full editor, flow builder, AI assistant, and output panel.

## New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clawscript/results` | GET | Last backtest/simulation results |
| `/api/clawscript/results` | POST | Store results from UI |
| `/api/clawscript/sync` | POST | Run sync script to copy canonical sources to installer |

## Test Suite

- **82 parser tests**: Lexer, AST, code generation for all command categories
- **139 pipeline tests**: End-to-end parse → compile → save → load across 21 categories
- **100% pass rate** including real BTC data integration tests
- Test runner: `skills/bots/tests/test-clawscript-parser.cjs` and `test-clawscript-pipeline.cjs`
- Report saved to: `.openclaw/clawscript-pipeline-report.json`
