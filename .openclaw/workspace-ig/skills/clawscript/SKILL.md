# ClawScript Coding & Proofreading Skill

You are a ClawScript expert. This skill covers writing, debugging, and proofreading ClawScript trading strategies.

## Before Writing ANY ClawScript

Read these files in order:
1. `skills/clawscript/CLAWSCRIPT.md` — full language reference (100+ commands)
2. `skills/clawscript/TRADING-BOT-RULEBOOK.md` — mandatory rules for valid trading bots
3. `skills/clawscript/CLAWSCRIPT-AI-REFERENCE.md` — agent orchestration examples

## Quick Syntax Rules

### Variables & Inputs
```clawscript
DEF myVar = 42
SET myVar = myVar + 1
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_FLOAT stopDistance = 30.0 "Stop Distance"
INPUT_BOOL enabled = true "Enabled"
```

### Indicators (prices is ALWAYS first argument)
```clawscript
DEF rsi = RSI(prices, 14)
DEF ema = EMA(prices, 9)
DEF sma = SMA(prices, 20)
DEF macd = MACD(prices, 12, 26, 9)
DEF bb = BOLLINGER(prices, 20, 2)
DEF atr = ATR(prices, 14)
DEF adx = ADX(prices, 14)
DEF stoch = STOCHASTIC(prices, 14, 3)
DEF cci = CCI(prices, 20)
```

### Trading Commands (ALWAYS inside IF blocks)
```clawscript
BUY MARKET SIZE 1
SELL MARKET SIZE 1
EXIT "reason text"
```

### Control Flow
```clawscript
IF condition
  ...
ENDIF

IF condition
  ...
ELSE
  ...
ENDIF
```

### Operators — USE WORDS NOT SYMBOLS
- `AND` (never &&)
- `OR` (never ||)
- `NOT` (never !)

## BANNED Syntax (produces incorrect or non-portable code)
- `VAR`, `LET`, `CONST` — use `DEF` / `SET`
- `FOREACH`, `CONTINUE`, `BREAK`, `SLEEP`, `THEN`
- `PRICES()` — prices is a variable, not a function
- `BB()` — use `BOLLINGER()`
- `macd.line`, `macd.signal` — MACD returns a single number
- `?.` or `??` — JavaScript operators, not ClawScript
- `||` or `&&` — use `OR` and `AND`
- Curly braces `{}` for code blocks — use ENDIF/ENDLOOP
- Dot notation on indicators — they return single values

## Mandatory Rules for Trading Bots
1. Every BUY/SELL MUST be inside an IF with indicator conditions
2. MUST define `INPUT_INT stopDistance` and `INPUT_INT limitDistance`
3. MUST null-check all indicators: `IF rsi != null`
4. MUST use at least one technical indicator
5. limitDistance >= stopDistance (minimum 1:1, recommend 1:1.5 or better)

## Minimal Valid Template
```clawscript
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT stopDistance = 20 "Stop Distance"
INPUT_INT limitDistance = 40 "Limit Distance"
INPUT_INT size = 1 "Position Size"

DEF rsi = RSI(prices, rsiPeriod)

IF rsi != null
  IF rsi < 30
    BUY MARKET SIZE size
  ENDIF
  IF rsi > 70
    SELL MARKET SIZE size
  ENDIF
ENDIF
```

## Compile & Test API

Use `web_fetch` with the public URL (localhost is blocked by SSRF protection):

```bash
# Compile (validate)
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/compile
  body: {"code": "..."}

# Backtest
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/backtest
  body: {"code": "...", "instrument": "CS.D.BITCOIN.CFM.IP", "resolution": "HOUR", "candleCount": 200}

# Save strategy (hot-reloads into engine)
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/strategies
  body: {"name": "My Strategy", "filename": "my-strategy-strategy.cjs", "code": "...", "js": "..."}
```

## Show ClawScript Editor in Chat
```markdown
![ClawScript Editor](/__openclaw__/canvas/chat-clawscript-editor.html)
![ClawScript Editor](/__openclaw__/canvas/chat-clawscript-editor.html?code=ENCODED_CODE)
```

## Proofreading Checklist
When reviewing ClawScript code, check:
- [ ] Uses `DEF` not VAR/LET/CONST
- [ ] Uses `AND`/`OR`/`NOT` not &&/||/!
- [ ] Indicators have `prices` as first arg
- [ ] All indicators null-checked before use
- [ ] BUY/SELL inside IF blocks with conditions
- [ ] stopDistance and limitDistance defined via INPUT_INT
- [ ] limitDistance >= stopDistance (proper risk:reward)
- [ ] No banned syntax (see list above)
- [ ] MACD used as single value (not .line/.signal)
- [ ] No PRICES() function call (prices is a variable)
- [ ] All IF blocks closed with ENDIF
- [ ] All LOOP blocks closed with ENDLOOP
- [ ] Code compiles without errors

## Epics Reference
- Silver: `CS.D.CFASILVER.CFA.IP`
- Gold: `CS.D.CFAGOLD.CFA.IP`
- Bitcoin: `CS.D.BITCOIN.CFM.IP`

## Agent Commands (for orchestration strategies)
```clawscript
AGENT_SPAWN "name" WITH "instructions"
DEF result = AGENT_CALL "name" "task"
AGENT_PASS "data" "target-agent"
AGENT_TERMINATE "name"
```

## Error Logbook
Track errors and fixes:
```
web_fetch GET https://openclaw-mechanicus.replit.app/api/clawscript/logbook
web_fetch POST https://openclaw-mechanicus.replit.app/api/clawscript/logbook
  body: {"type": "error", "message": "description", "strategy": "name"}
```
