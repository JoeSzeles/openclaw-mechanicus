// EMA Crossover with Trailing Stop
// Uses fast/slow EMA crossover for entries with trailing stop protection

DEF ema_fast = EMA(9)
DEF ema_slow = EMA(21)
DEF atr = ATR(14)

IF ema_fast CROSSES OVER ema_slow THEN
  BUY 1 AT MARKET STOP 25 REASON "EMA bullish crossover"
  TRAILSTOP 15 ACCEL 0.02 MAX 0.2
ENDIF

IF ema_fast CROSSES UNDER ema_slow THEN
  SELL 1 AT MARKET STOP 25 REASON "EMA bearish crossover"
  TRAILSTOP 15 ACCEL 0.02 MAX 0.2
ENDIF