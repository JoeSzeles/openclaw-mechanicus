# ProRealTime Code Rules for AI Agents

This document outlines the strict rules and syntax requirements for generating ProRealTime (ProBuilder/ProOrder) code. AI agents must adhere to these rules to ensure code compatibility and avoid syntax errors.

## 1. Variable Naming Rules
- **No Underscores:** Variable names **MUST NOT** contain underscores (`_`). ProRealTime reserves underscores for system functions.
  - *Correct:* `MyVariable`, `TrailingStop`, `IndicatorValue`
  - *Incorrect:* `My_Variable`, `Trailing_Stop`, `Indicator_Value`
- **Reserved Words:** Do not use reserved command names as variables (e.g., `Open`, `High`, `Close`, `Buy`, `Sell`, `Average`).
- **Case Sensitivity:** Commands are not case-sensitive, but **CamelCase** is preferred for variables to improve readability.

## 2. Logical Structure
- **Block Closure:** Every `IF` must have a corresponding `ENDIF`.
- **Indentation:** Use consistent indentation for nested blocks.
- **Initialization:** Use the `ONCE` command to initialize variables that should only be set on the first bar.
  ```prorealtime
  ONCE MyCapital = 10000
  ```

## 3. Trading Commands
- **Execution:** Use the following commands for position management:
  - `BUY n CONTRACT AT MARKET` (Long entry)
  - `SELLSHORT n CONTRACT AT MARKET` (Short entry)
  - `SELL AT MARKET` (Exit Long)
  - `EXITSHORT AT MARKET` (Exit Short)
- **Stops & Targets:**
  - `SET STOP pLOSS n` (Stop loss in points)
  - `SET TARGET pPROFIT n` (Take profit in points)
  - `SET STOP $LOSS n` (Stop loss in currency amount)

## 4. Market State Commands
- `ONMARKET`: True if any position is open.
- `LONGONMARKET`: True if a long position is open.
- `SHORTONMARKET`: True if a short position is open.
- `COUNTOFPOSITION`: Returns current number of contracts.
- `TRADEPRICE(1)`: Returns the entry price of the last position.

## 5. Technical Indicator Syntax
- Indicators typically use square brackets `[n]` for periods and parentheses `(price)` for the source.
  - `Average[20](close)`
  - `RSI[14](close)`
  - `Highest[50](high)`
- **Time Lookback:** Use `[n]` to reference previous bars (e.g., `close[1]` for the previous bar's close).

## 6. Debugging & Safety
- **Graphing:** Use `GRAPH VariableName AS "Label"` to debug values on the chart.
- **Position Limiting:** Always use `DEFPARAM CumulateOrders = False` unless multiple entries are specifically required.
- **Quit Command:** Use `QUIT` to stop the strategy programmatically.

## 7. Formatting Standards
- Start strategies with `DEFPARAM CumulateOrders = False`.
- Use `//` for comments to explain logic.
- Ensure all parameters (PositionSize, StopLoss, etc.) are clearly defined at the top.
