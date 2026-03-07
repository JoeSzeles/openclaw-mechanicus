// AI Sentiment + Market Scanner Strategy
// Fetches social sentiment and scans for opportunities

DEF rsi = RSI(14)
DEF sentiment = 0

AI_QUERY "Analyze current BTC market sentiment from recent news" TOOL "web_search" ARG "bitcoin sentiment today"
SET sentiment = AI_RESULT

IF sentiment > 0.6 AND rsi < 40 THEN
  BUY 1 AT MARKET STOP 50 LIMIT 100 REASON "Bullish sentiment + RSI dip"
  ALERT "Sentiment BUY entry" LEVEL "info"
ENDIF

IF sentiment < 0.3 AND rsi > 60 THEN
  SELL 1 AT MARKET STOP 50 REASON "Bearish sentiment + RSI high"
  ALERT "Sentiment SELL entry" LEVEL "warning"
ENDIF

CRASH_SCAN ON
WAIT 5000