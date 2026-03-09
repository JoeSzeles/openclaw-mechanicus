# ClawScript Syntax Rules (MANDATORY)

When writing ClawScript code, you MUST follow these exact rules. Do NOT invent commands or syntax.

## Variables
- Use `DEF` (never VAR, LET, CONST): `DEF myVar = 42`
- Reassign with `SET`: `SET myVar = myVar + 1`

## Configurable Inputs (label string REQUIRED)
```
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_FLOAT stopDistance = 30.0 "Stop Distance"
INPUT_BOOL enabled = true "Enabled"
```

## Indicators (prices array is FIRST argument)
```
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

## Trading (ALWAYS inside IF with conditions)
```
BUY MARKET SIZE 1
SELL MARKET SIZE 1
EXIT "reason text"
```

## Control Flow
```
IF condition
  ...
ENDIF

IF condition
  ...
ELSE
  ...
ENDIF

LOOP 10 TIMES
  ...
ENDLOOP
```

## Operators (use WORDS not symbols)
- `AND` (not &&)
- `OR` (not ||)
- `NOT` (not !)

## Agent Commands
```
AGENT_SPAWN "name" WITH "instructions"
DEF result = AGENT_CALL "name" "task"
AGENT_PASS "data" "target-agent"
AGENT_TERMINATE "name"
```

## Visual Output
```
NOTIFY "message" LEVEL "info"
TOAST "message" DURATION 3000
POPUP "Title" WITH "<h1>HTML content</h1>"
DISPLAY data FORMAT "table"
```

## DO NOT USE (these don't exist)
- VAR, FOREACH, CONTINUE, BREAK, SLEEP, THEN
- CLOSE(), POSITION(), PNL(), WIN_RATE(), SUM_PNL(), PRICES()
- BB() (use BOLLINGER), LAST_CLOSE (use LAST_PRICE())
- Curly braces {} for code blocks
- || or && (use OR and AND)
- ?. or ?? (JavaScript operators, not ClawScript)
- macd.line or macd.signal (MACD returns a single number)
- Dot notation on indicators (indicators return single values)

## Mandatory for Trading Bots
1. Every BUY/SELL must be inside an IF with indicator conditions
2. Must define INPUT_INT stopDistance and INPUT_INT limitDistance
3. Must null-check all indicators: `IF rsi != null`
4. Must use at least one indicator

## Epics Reference
- Silver: CS.D.CFASILVER.CFA.IP
- Gold: CS.D.CFAGOLD.CFA.IP
- Bitcoin: CS.D.BITCOIN.CFM.IP
