=== COMPLETE EXAMPLE: Multi-Instrument with Agent Orchestration ===

// Gold & Silver Multi-Indicator Strategy with Agent Support
INPUT_INT rsiPeriod = 14 "RSI Period"
INPUT_INT rsiOversold = 30 "RSI Oversold Level"
INPUT_INT rsiOverbought = 70 "RSI Overbought Level"
INPUT_INT emaFast = 9 "EMA Fast Period"
INPUT_INT emaSlow = 21 "EMA Slow Period"
INPUT_INT bbPeriod = 20 "Bollinger Period"
INPUT_FLOAT bbStdDev = 2.0 "Bollinger Std Dev"
INPUT_INT stopDistance = 30 "Stop Distance (points)"
INPUT_INT limitDistance = 60 "Limit Distance (points)"
INPUT_INT size = 1 "Position Size"

AGENT_SPAWN "news-scanner" WITH "Scan financial news for gold and silver price impacts. Return sentiment: bullish, bearish, or neutral"
AGENT_SPAWN "market-analyst" WITH "Analyze precious metals market trends and volatility conditions"

DEF rsi = RSI(prices, rsiPeriod)
DEF ema_fast = EMA(prices, emaFast)
DEF ema_slow = EMA(prices, emaSlow)
DEF macd = MACD(prices, 12, 26, 9)
DEF bb = BOLLINGER(prices, bbPeriod, bbStdDev)
DEF adx = ADX(prices, 14)
DEF atr = ATR(prices, 14)

DEF news = AGENT_CALL "news-scanner" "What is current gold/silver sentiment?"
DEF analysis = AGENT_CALL "market-analyst" "Is the precious metals trend up or down?"

IF rsi != null AND ema_fast != null AND ema_slow != null AND macd != null

  IF rsi < rsiOversold AND ema_fast > ema_slow AND macd > 0 AND adx > 25
    BUY MARKET SIZE size
    NOTIFY "BUY signal: RSI oversold + EMA bullish cross + MACD positive" LEVEL "info"
    TOAST "BUY triggered - RSI/EMA/MACD confluence" DURATION 5000
  ENDIF

  IF rsi > rsiOverbought AND ema_fast < ema_slow AND macd < 0 AND adx > 25
    SELL MARKET SIZE size
    NOTIFY "SELL signal: RSI overbought + EMA bearish cross + MACD negative" LEVEL "info"
    TOAST "SELL triggered - RSI/EMA/MACD confluence" DURATION 5000
  ENDIF

  IF adx < 20
    EXIT "Low trend strength - ADX below 20"
    NOTIFY "Position closed: weak trend detected" LEVEL "warn"
  ENDIF

ENDIF

POPUP "Trade Dashboard" WITH "<div style='background:#0d1117;color:#c9d1d9;padding:20px;font-family:monospace;'><h2 style='color:#a78bfa;'>Gold & Silver Bot Status</h2><table style='width:100%;border-collapse:collapse;'><tr style='border-bottom:1px solid #30363d;'><td>RSI</td><td style='color:#58a6ff;'>value</td></tr><tr style='border-bottom:1px solid #30363d;'><td>EMA Cross</td><td>Fast vs Slow</td></tr><tr><td>MACD</td><td>histogram</td></tr></table></div>"

DISPLAY rsi FORMAT "json"
