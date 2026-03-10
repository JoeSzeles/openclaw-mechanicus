// Bourse & Index Trackers Strategy
// Multi-indicator approach for major index CFDs (US 500, FTSE, DAX, etc.)

DEF ema_20 = EMA(20)
DEF ema_50 = EMA(50)
DEF rsi = RSI(14)
DEF macd_hist = MACD(12, 26, 9)
DEF atr = ATR(14)
DEF adx = ADX(14)

IF adx > 25 THEN
  IF ema_20 CROSSES OVER ema_50 AND rsi < 60 AND macd_hist > 0 THEN
    BUY 1 AT MARKET STOP 30 LIMIT 60 REASON "Bourse trend long: EMA cross + MACD confirm"
    TRAILSTOP 20 ACCEL 0.02 MAX 0.2
    ALERT "Index BUY signal triggered" LEVEL "info"
  ENDIF

  IF ema_20 CROSSES UNDER ema_50 AND rsi > 40 AND macd_hist < 0 THEN
    SELL 1 AT MARKET STOP 30 LIMIT 60 REASON "Bourse trend short: EMA cross + MACD confirm"
    TRAILSTOP 20 ACCEL 0.02 MAX 0.2
    ALERT "Index SELL signal triggered" LEVEL "info"
  ENDIF
ENDIF

IF adx < 20 THEN
  EXIT ALL REASON "Bourse: low trend strength, closing positions"
ENDIF
