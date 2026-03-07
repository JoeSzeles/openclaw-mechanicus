// Simple RSI Buy/Sell Strategy
// Buys when RSI is oversold, sells when overbought

DEF rsi_period = 14
DEF rsi_oversold = 30
DEF rsi_overbought = 70

DEF rsi = RSI(rsi_period)

IF rsi < rsi_oversold THEN
  BUY 1 AT MARKET STOP 20 LIMIT 40 REASON "RSI oversold entry"
ENDIF

IF rsi > rsi_overbought THEN
  SELL 1 AT MARKET STOP 20 LIMIT 40 REASON "RSI overbought entry"
ENDIF