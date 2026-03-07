# ClawScript

A domain-specific language (DSL) for writing automated trading strategies in [OpenClaw](https://github.com/openclaw). Write strategies in simple, readable commands — ClawScript compiles them to JavaScript classes that run inside the Trade Claw Engine.

## Features

- **38 commands** across 8 categories: Trading, Variables, Control Flow, AI/Analysis, Data Fetch, Agent Orchestration, Advanced, and Functions
- **Visual Flow Builder** — drag-and-drop node editor with bidirectional code-to-flow synchronization
- **Code Editor** — syntax-highlighted editor with live parsing, auto-complete, and error reporting
- **Strategy Compiler** — compiles `.cs` scripts to production-ready `.cjs` strategy modules
- **Simulation Runner** — test strategies against mock tick data before going live
- **AI Integration** — query AI models, generate scripts, analyze logs, and scan sentiment
- **Agent Orchestration** — spawn agents, manage sessions, mutate configs at runtime
- **Technical Indicators** — RSI, EMA, SMA, MACD, Bollinger Bands, ATR, ADX, Stochastic, CCI, OBV, VWAP, ROC, and more
- **Export** — `.cs` source, `.json` AST, `.js` compiled output, `.png` flow diagram

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

## Installation

### Into an existing OpenClaw instance

```bash
git clone https://github.com/user/clawscript.git
cd clawscript
bash install.sh
```

The installer copies files to the correct OpenClaw directories:

| What | Destination |
|------|-------------|
| Parser + indicators | `skills/bots/` |
| OpenClaw wrappers | `skills/bots/` |
| Strategy framework | `skills/bots/strategies/` |
| Editor UI + flow builder | `.openclaw/canvas/` |
| Templates | `.openclaw/canvas/clawscript-templates/` |
| Documentation | `.openclaw/canvas/` + `skills/clawscript/` |

Custom paths:
```bash
bash install.sh /path/to/.openclaw /path/to/skills
```

### Standalone usage (no OpenClaw)

```javascript
const { parseAndGenerate, parseToAST } = require('./lib/clawscript-parser.cjs');

// Parse to AST
const ast = parseToAST(`
  DEF rsi = RSI(14)
  IF rsi < 30 THEN
    BUY 1 AT MARKET STOP 20 REASON "dip buy"
  ENDIF
`);

// Compile to JavaScript strategy class
const { js } = parseAndGenerate(code, 'MyRSI');
// js contains a complete Node.js module exporting a BaseStrategy subclass
```

## Project Structure

```
clawscript/
  lib/
    clawscript-parser.cjs    # Lexer, parser, AST builder, JS code generator
    indicators.cjs            # 25+ technical indicators (EMA, RSI, MACD, etc.)
    openclaw/                 # OpenClaw API wrapper stubs
      openclaw-ai.cjs         #   AI queries and ML
      openclaw-data.cjs       #   Web/PDF/video/image data fetch
      openclaw-chat.cjs       #   Chat and session management
      openclaw-tools.cjs      #   External tool execution
      openclaw-channels.cjs   #   Channel/alert management
      openclaw-nomad.cjs      #   Market scanning and allocation
  editor/
    ig-clawscript-ui.js       # Code editor with syntax highlighting
    ig-clawscript-flow.js     # Visual flow builder (drag-drop node editor)
  strategies/
    base-strategy.cjs         # Base class all strategies extend
    index.cjs                 # Auto-discovery strategy loader
  templates/                  # 4 ready-to-use sample strategies
    rsi-simple.cs
    ema-crossover.cs
    multi-indicator.cs
    sentiment-scan.cs
  examples/
    custom-btctest-strategy.cjs  # Example compiled strategy
  docs/
    CLAWSCRIPT.md             # Full language reference (agent-readable)
    clawscript-docs.html      # Interactive documentation page
  test/
    test-clawscript-parser.cjs  # 82-test suite
```

## Command Reference

### Trading
| Command | Description |
|---------|-------------|
| `BUY` | Open long — `BUY <size> AT MARKET\|LIMIT\|STOP [STOP <dist>] [LIMIT <dist>] [REASON <str>]` |
| `SELL` | Open short / close long — same syntax as BUY |
| `SELLSHORT` | Explicit short — `SELLSHORT <size> [STOP <dist>] [REASON <str>]` |
| `EXIT` | Close position — `EXIT ALL\|PART [REASON <str>]` |
| `CLOSE` | Close current — `CLOSE [REASON <str>]` |
| `TRAILSTOP` | Trailing stop — `TRAILSTOP <dist> [ACCEL <val>] [MAX <val>]` |

### Variables
| Command | Description |
|---------|-------------|
| `DEF` | Define constant — `DEF <name> = <expr>` |
| `SET` | Update variable — `SET <name> = <expr>` |
| `STORE_VAR` | Persist to storage — `STORE_VAR <key> <value>` |
| `LOAD_VAR` | Load from storage — `LOAD_VAR <key> [DEFAULT <val>]` |

### Control Flow
| Command | Description |
|---------|-------------|
| `IF` | Branch — `IF <cond> THEN ... [ELSE ...] ENDIF` |
| `LOOP` | Repeat — `LOOP <n> TIMES ... ENDLOOP` or `LOOP FOREVER ... ENDLOOP` |
| `WHILE` | Conditional loop — `WHILE <cond> ... ENDWHILE` |
| `TRY` | Error handling — `TRY ... CATCH <var> ... ENDTRY` |
| `WAIT` | Pause — `WAIT <ms>` |
| `ERROR` | Throw — `ERROR <message>` |

### AI / Analysis
| Command | Description |
|---------|-------------|
| `AI_QUERY` | Query AI — `AI_QUERY <prompt> [TOOL <name>] [ARG <val>]` |
| `AI_GENERATE_SCRIPT` | Auto-generate — `AI_GENERATE_SCRIPT <prompt> [TO <file>]` |
| `ANALYZE_LOG` | Analyze logs — `ANALYZE_LOG <query> [LIMIT <n>]` |
| `RUN_ML` | Run ML model — `RUN_ML <model> <data>` |

### Data Fetch
| Command | Description |
|---------|-------------|
| `CLAW_WEB` | Fetch web — `CLAW_WEB <url> [INSTRUCT <str>]` |
| `CLAW_X` | Search X — `CLAW_X <query> [LIMIT <n>]` |
| `CLAW_PDF` | Extract PDF — `CLAW_PDF <file> [QUERY <str>]` |
| `CLAW_IMAGE` | Generate image — `CLAW_IMAGE <desc> [NUM <n>]` |
| `CLAW_VIDEO` | Analyze video — `CLAW_VIDEO <url>` |
| `CLAW_CONVERSATION` | Chat history — `CLAW_CONVERSATION <query>` |
| `CLAW_TOOL` | External tool — `CLAW_TOOL <toolName>` |
| `CLAW_CODE` | Execute code — `CLAW_CODE <code>` |

### Agent Orchestration
| Command | Description |
|---------|-------------|
| `SPAWN_AGENT` | Create agent — `SPAWN_AGENT <name> <prompt>` |
| `CALL_SESSION` | Call session — `CALL_SESSION <agent> <command>` |
| `MUTATE_CONFIG` | Change config — `MUTATE_CONFIG <key> <value>` |
| `ALERT` | Send alert — `ALERT <message> [LEVEL <lvl>]` |
| `SAY_TO_SESSION` | Message session — `SAY_TO_SESSION <session> <message>` |
| `WAIT_FOR_REPLY` | Wait for reply — `WAIT_FOR_REPLY <session> [TIMEOUT <ms>]` |

### Advanced
| Command | Description |
|---------|-------------|
| `CRASH_SCAN` | Crash scanner — `CRASH_SCAN ON\|OFF` |
| `MARKET_NOMAD` | Nomadic scanning — `MARKET_NOMAD ON\|OFF` |
| `NOMAD_SCAN` | Scan instruments — `NOMAD_SCAN <category> [LIMIT <n>]` |
| `NOMAD_ALLOCATE` | Allocate — `NOMAD_ALLOCATE <target> [SIZING <mode>]` |
| `RUMOR_SCAN` | Scan rumors — `RUMOR_SCAN <topic> [SOURCES <list>]` |
| `OPTIMIZE` | Optimize param — `OPTIMIZE <var> FROM <min> TO <max> STEP <step>` |
| `INDICATOR` | Calculate — `INDICATOR <name> <params>` |

### Functions
| Command | Description |
|---------|-------------|
| `DEF_FUNC` | Define function — `DEF_FUNC <name>(<args>) ... ENDFUNC` |
| `CHAIN` | Chain operations — `CHAIN ... ENDCHAIN` |
| `INCLUDE` | Include script — `INCLUDE <script>` |

## Operators

| Category | Operators |
|----------|-----------|
| Arithmetic | `+`, `-`, `*`, `/`, `%` |
| Comparison | `<`, `>`, `<=`, `>=`, `==`, `!=` |
| Logical | `AND`, `OR`, `NOT` |
| Crossover | `CROSSES OVER`, `CROSSES UNDER` |
| String | `CONTAINS` |

## Built-in Indicators

```clawscript
DEF rsi = RSI(14)
DEF ema = EMA(21)
DEF sma = SMA(50)
DEF atr = ATR(14)
DEF macd = MACD(12, 26, 9)
DEF bb_upper = BOLLINGER_UPPER(20, 2)
DEF bb_lower = BOLLINGER_LOWER(20, 2)
DEF price = LAST_PRICE()
DEF vol = VOLUME()
```

## Visual Flow Builder

The editor includes a drag-and-drop node editor that syncs bidirectionally with the code pane:

- **Toolbox sidebar** with 38 command blocks organized in 8 categories
- **Drag nodes** onto the canvas — they snap to a grid
- **Connect ports** between nodes to define execution flow
- **Inline editing** of node parameters
- **Zoom/Pan** — scroll to zoom (zooms toward cursor), click+drag to pan
- **Auto-layout** arranges nodes hierarchically
- **Undo/Redo** with Ctrl+Z / Ctrl+Y (50-state stack)
- **Export PNG** of the flow diagram
- Changes in code update the flow, changes in flow update the code

## Compiled Output

ClawScript compiles to a JavaScript class extending `BaseStrategy`:

```javascript
class MyStrategy extends BaseStrategy {
  async evaluateEntry(ticks, context) {
    // Your strategy logic here
    return { signal: true, direction: 'BUY', size: 1, ... };
  }

  async evaluateExit(position, ticks, context) {
    return { close: false, reason: '' };
  }

  getConfigSchema() { /* UI config fields */ }
  static get STRATEGY_TYPE() { return 'custom-mystrategy'; }
}
```

Place compiled `.cjs` files in `strategies/` — the auto-discovery loader picks them up automatically.

## Testing

```bash
npm test
# or
node test/test-clawscript-parser.cjs
```

82 tests covering all commands, expressions, operators, edge cases, and code generation.

## Sample Strategies

Four complete templates are included in `templates/`:

1. **rsi-simple.cs** — Buy when RSI oversold, sell when overbought
2. **ema-crossover.cs** — EMA fast/slow crossover with trailing stop
3. **multi-indicator.cs** — RSI + MACD + Bollinger Bands with try/catch error handling
4. **sentiment-scan.cs** — AI sentiment analysis + market scanner

## License

MIT
