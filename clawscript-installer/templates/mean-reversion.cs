// Mean Reversion Strategy
// Trades price returning to Bollinger Band midline after extremes

DEF bb_period = 20
DEF bb_std = 2
DEF bb_upper = BOLLINGER_UPPER(bb_period, bb_std)
DEF bb_lower = BOLLINGER_LOWER(bb_period, bb_std)
DEF bb_mid = SMA(bb_period)
DEF rsi = RSI(14)
DEF price = LAST_PRICE()

TRY
  IF price < bb_lower AND rsi < 35 THEN
    BUY 1 AT MARKET STOP 25 LIMIT 50 REASON "Mean reversion: price below lower band"
  ENDIF

  IF price > bb_upper AND rsi > 65 THEN
    SELL 1 AT MARKET STOP 25 LIMIT 50 REASON "Mean reversion: price above upper band"
  ENDIF

  IF price > bb_mid AND price < bb_upper AND rsi > 45 AND rsi < 55 THEN
    EXIT ALL REASON "Mean reversion: price returned to midline"
  ENDIF
CATCH err
  ALERT "Mean reversion error" LEVEL "error"
ENDTRY
