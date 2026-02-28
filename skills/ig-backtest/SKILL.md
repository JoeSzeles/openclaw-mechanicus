---
name: ig-backtest
description: Backtest IG trading strategies using historical price data. Use for "backtest", "test strategy", "simulate trades", "historical performance", "strategy test".
---
# IG Backtest Skill

Backtest trading strategies against historical IG price data. Fetches OHLC candles from the IG API, runs strategy logic, and outputs results to the Canvas dashboard.

## Usage

Run the backtest script with parameters:

```bash
node skills/ig-backtest/backtest.cjs \
  --epic CS.D.EURUSD.CFD.IP \
  --resolution HOUR \
  --points 500 \
  --strategy bb-squeeze \
  --name "EUR/USD BB Squeeze 1H"
```

### Required Parameters
- `--epic` — IG instrument EPIC (e.g., `CS.D.EURUSD.CFD.IP`)
- `--resolution` — Candle resolution: SECOND, MINUTE, MINUTE_5, MINUTE_15, MINUTE_30, HOUR, HOUR_4, DAY, WEEK, MONTH
- `--points` — Number of data points to fetch (respect IG API limits)

### Optional Parameters
- `--strategy` — Strategy type: `bb-squeeze`, `rsi-reversal`, `ma-crossover`, `breakout`, `custom`
- `--name` — Human-readable name for the backtest
- `--stopLoss` — Stop loss in points (default: 20)
- `--takeProfit` — Take profit in points (default: 40)
- `--size` — Position size in contracts (default: 1)
- `--direction` — Trade direction: `both`, `long`, `short` (default: `both`)
- `--test` — Test mode, uses sample data instead of API

### Built-in Strategies
1. **bb-squeeze** — Bollinger Band squeeze breakout (BB inside Keltner Channel)
2. **rsi-reversal** — RSI oversold/overbought mean reversion
3. **ma-crossover** — Moving average crossover (fast/slow EMA)
4. **breakout** — Price breakout above/below recent range

### Output
Results are written to:
- `.openclaw/canvas/ig-backtest-results.json` — Full results data
- `.openclaw/canvas/ig-backtest-{timestamp}.html` — Interactive results page with Chart.js graphs
- Page is auto-registered in `.openclaw/canvas/manifest.json`

### IG API Limits
- Demo accounts: ~500 data points per request typical, may vary
- Live accounts: Check your API key allowance
- Resolutions: Higher resolutions (SECOND, MINUTE) may have shorter history
- Rate limits: Don't run many backtests in rapid succession
- Use `--points` to control how much data to fetch

### Results Include
- Equity curve chart
- Price line chart with buy/sell trade markers
- Trade list with entry/exit prices, P&L, reason
- Summary stats: win rate, Sharpe ratio, max drawdown, profit factor, avg win/loss
- Risk metrics: max consecutive losses, time in market

### Dashboard Integration
Results appear on the IG Trading Dashboard under a "Backtests" section and as standalone canvas pages.
