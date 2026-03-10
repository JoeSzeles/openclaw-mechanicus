// Multi-Indicator Strategy with Error Handling
// Combines RSI + MACD + Bollinger Bands with try/catch safety

DEF rsi = RSI(14)
DEF macd_hist = MACD(12, 26, 9)
DEF bb_upper = BOLLINGER_UPPER(20, 2)
DEF bb_lower = BOLLINGER_LOWER(20, 2)
DEF price = LAST_PRICE()

TRY
  IF rsi < 30 AND macd_hist > 0 AND price < bb_lower THEN
    BUY 2 AT MARKET STOP 30 LIMIT 60 REASON "Triple confirmation buy"
    ALERT "BUY signal triggered" LEVEL "info"
  ENDIF

  IF rsi > 70 AND macd_hist < 0 AND price > bb_upper THEN
    SELL 2 AT MARKET STOP 30 LIMIT 60 REASON "Triple confirmation sell"
    ALERT "SELL signal triggered" LEVEL "info"
  ENDIF
CATCH err
  ALERT "Strategy error" LEVEL "error"
ENDTRY