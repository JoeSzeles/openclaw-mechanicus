# ClawScript DSL Reference (Agent Skill)

ClawScript is a domain-specific language for writing automated trading strategies. Scripts are written in a simple imperative syntax and compile to JavaScript strategy classes that run inside the Trade Claw Engine.

## Quick Start

```clawscript
DEF rsi = RSI(14)
IF rsi < 30 THEN
  BUY 1 AT MARKET STOP 20 LIMIT 40 REASON "RSI oversold"
ENDIF
```

## Where to Find ClawScript

- **Editor**: IG Dashboard → ClawScript Editor tab
- **Parser**: `skills/bots/clawscript-parser.cjs`
- **Flow Builder**: `ig-clawscript-flow.js` (visual node editor)
- **Templates**: `.openclaw/canvas/clawscript-templates/` (4 sample strategies)
- **Full Docs**: `/__openclaw__/canvas/clawscript-docs.html`
- **Compiled Strategies**: `skills/bots/strategies/` (`.cjs` files extending `BaseStrategy`)

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
- **Toolbox sidebar**: 16 categories, 80+ command nodes
- **Drag & drop**: Drag commands onto the canvas
- **Port connections**: Connect output ports to input ports
- **Bidirectional sync**: Code changes update flow, flow changes update code
- **Zoom/Pan**: Scroll to zoom (cursor-relative), click+drag to pan
- **Auto-layout**: Automatic node arrangement
- **Undo/Redo**: Ctrl+Z / Ctrl+Y
- **Export**: PNG screenshot of flow diagram
