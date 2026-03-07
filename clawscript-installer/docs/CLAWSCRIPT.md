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

## All Commands (38 total)

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
- **Toolbox sidebar**: 8 categories, 38 command nodes
- **Drag & drop**: Drag commands onto the canvas
- **Port connections**: Connect output ports to input ports
- **Bidirectional sync**: Code changes update flow, flow changes update code
- **Zoom/Pan**: Scroll to zoom (cursor-relative), click+drag to pan
- **Auto-layout**: Automatic node arrangement
- **Undo/Redo**: Ctrl+Z / Ctrl+Y
- **Export**: PNG screenshot of flow diagram
