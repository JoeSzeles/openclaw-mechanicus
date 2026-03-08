// BTC Scalper Strategy
// Fast scalping on Bitcoin using RSI + EMA with tight stops

DEF rsi_period = 7
DEF ema_fast = EMA(5)
DEF ema_slow = EMA(13)
DEF rsi = RSI(rsi_period)
DEF atr = ATR(10)

IF rsi < 25 AND ema_fast CROSSES OVER ema_slow THEN
  BUY 0.5 AT MARKET STOP 15 LIMIT 30 REASON "BTC scalp long: RSI oversold + EMA cross"
  TRAILSTOP 10 ACCEL 0.03 MAX 0.25
ENDIF

IF rsi > 75 AND ema_fast CROSSES UNDER ema_slow THEN
  SELL 0.5 AT MARKET STOP 15 LIMIT 30 REASON "BTC scalp short: RSI overbought + EMA cross"
  TRAILSTOP 10 ACCEL 0.03 MAX 0.25
ENDIF

IF rsi > 50 AND rsi < 55 THEN
  EXIT ALL REASON "BTC scalp: RSI neutral zone exit"
ENDIF
