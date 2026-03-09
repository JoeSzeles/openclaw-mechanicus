# Strategy Performance Rulebook

Reference guide for built-in strategy types — best instrument matches, recommended timeframes, optimal defaults, and risk guidelines.

## Strategy Type Reference

### scalper
- **Best Instruments**: Gold (CS.D.CFAGOLD.CFA.IP), Silver (CS.D.CFASILVER.CFA.IP)
- **Recommended Timeframe**: TICK / SECOND / MINUTE
- **Market Condition**: Any (momentum-based)
- **Key Parameters**: minMomentumPct=0.03, tickWindow=15, cooldownMs=6000
- **Risk**: High frequency, small P&L per trade. Keep stopDistance tight (spread * 3). Limit distance should exceed stop by 1.3x minimum.
- **Notes**: Default strategy. Works on tick velocity. No indicator dependencies.

### mean-reversion
- **Best Instruments**: Silver, Gold, indices (ranging markets)
- **Recommended Timeframe**: MINUTE / MINUTE_5
- **Market Condition**: Ranging / consolidation
- **Key Parameters**: bollingerPeriod=20, bollingerSD=2, stochasticK=14, rsiPeriod=14
- **Risk**: Stop at 0.5x bandwidth, limit at 0.75x bandwidth. Avoid in trending markets.
- **Notes**: Enters at Bollinger Band edges. Needs either Stochastic OR RSI confirmation (not both required). Best when price oscillates around SMA.

### breakout
- **Best Instruments**: Gold, Oil (CC.D.CL.UNC.IP), indices
- **Recommended Timeframe**: MINUTE_5 / MINUTE_15
- **Market Condition**: Trending / volatile
- **Key Parameters**: donchianPeriod=20, atrPeriod=14, atrMultiplier=2
- **Risk**: ATR-based stops. Limit set at 2x ATR. Works best during session opens (London/NY).
- **Notes**: Donchian channel breakout with ATR stops. False breakouts common in low-vol conditions.

### trend-following
- **Best Instruments**: Gold, Oil, major indices
- **Recommended Timeframe**: MINUTE_5 / HOUR
- **Market Condition**: Strong trends (ADX > 25)
- **Key Parameters**: emaShort=9, emaLong=21, adxPeriod=14, adxThreshold=25, sarAccel=0.02
- **Risk**: Spread-based stops if not specified. Best with wider stops in volatile instruments.
- **Notes**: Requires EMA crossover + ADX strength + Parabolic SAR alignment. All three must agree for entry.

### donchian-trend
- **Best Instruments**: Gold, Oil, Bitcoin
- **Recommended Timeframe**: HOUR / HOUR_4
- **Market Condition**: Trending
- **Key Parameters**: donchianPeriod=20, atrPeriod=14, atrTrailMult=2
- **Risk**: ATR trailing stops. Limit at 2x stop distance.
- **Notes**: Simpler than breakout strategy. Good for longer-term trend captures.

### momentum-scalper
- **Best Instruments**: Silver, Bitcoin (CS.D.BITCOIN.CFM.IP)
- **Recommended Timeframe**: SECOND_5 / MINUTE
- **Market Condition**: Volatile / momentum-driven
- **Key Parameters**: rsiPeriod=7, rsiOB=70, rsiOS=30, emaShort=5, emaLong=13
- **Risk**: Quick entries/exits. Tight stops recommended.
- **Notes**: Combines RSI extremes with EMA direction for fast scalps.

### swing-trading
- **Best Instruments**: Gold, Oil, major indices
- **Recommended Timeframe**: HOUR / HOUR_4
- **Market Condition**: Swing/trending with clear swings
- **Key Parameters**: fibLookback=50, rsiPeriod=14
- **Risk**: Fib-based stops (0.236 of swing range). Targets at 0.382 extension.
- **Notes**: Uses Fibonacci retracement levels with RSI confirmation. Better with higher timeframes.

### grid-trader
- **Best Instruments**: Bitcoin, Silver
- **Recommended Timeframe**: MINUTE / MINUTE_5
- **Market Condition**: Ranging / choppy
- **Key Parameters**: gridLevels=5, gridSpacing=auto(ATR), atrPeriod=14, fibLookback=50
- **Risk**: Multiple positions. Monitor maxPositions. Grid spacing should equal ATR.
- **Notes**: Buys below center, sells above center. ATR auto-spacing recommended.

### market-making
- **Best Instruments**: Silver, Gold
- **Recommended Timeframe**: SECOND_5 / MINUTE
- **Market Condition**: Ranging / low volatility
- **Key Parameters**: bollingerPeriod=20, bollingerSd=2, atrPeriod=14, adjustmentPct=0.1
- **Risk**: ATR-based stops (1.5x ATR). Limit at 2x ATR. Avoid trending markets.
- **Notes**: Bollinger Band mean-reversion with inventory management. Enters when price reaches adjusted band edges.

### volatility-breakout
- **Best Instruments**: Oil, Bitcoin
- **Recommended Timeframe**: MINUTE_5 / MINUTE_15
- **Market Condition**: Expanding volatility
- **Key Parameters**: keltnerPeriod=20, keltnerAtrMult=1.5, atrPeriod=14, atrExpansionPct=50
- **Risk**: ATR-based stops (2x current ATR). Limit at 3x ATR.
- **Notes**: Keltner channel breakout ONLY when ATR is expanding vs historical. Filters out low-vol breakouts.

### pairs-trading
- **Best Instruments**: Any single instrument (z-score of price history)
- **Recommended Timeframe**: MINUTE / MINUTE_5
- **Market Condition**: Mean-reverting
- **Key Parameters**: zScoreEntry=2, zScoreExit=0.5, lookback=50
- **Risk**: Statistical mean reversion. Wider z-score = fewer but higher-confidence trades.
- **Notes**: Enters when z-score exceeds threshold. Exits when z-score returns to near zero.

### position-trading
- **Best Instruments**: Gold, major indices
- **Recommended Timeframe**: HOUR_4 / DAY
- **Market Condition**: Long-term trends
- **Key Parameters**: emaPeriod=50, adxPeriod=14, adxMinimum=20
- **Risk**: Wide stops. Long holding periods. Small position sizes recommended.
- **Notes**: Longer-term strategy. Needs many candles for reliable signals.

### news-spike
- **Best Instruments**: Gold, Oil (high news sensitivity)
- **Recommended Timeframe**: TICK / SECOND
- **Market Condition**: News events / high volatility spikes
- **Key Parameters**: spikeThreshold=0.5, spikeWindowMs=5000, requireAlert=false
- **Risk**: Fast-moving markets. Tight stops essential.
- **Notes**: Detects velocity surges. Set requireAlert=true for production to require HTF bias confirmation.

## Risk/Reward Guidelines

| Risk Level | Min R:R | Max Position Size | Max Open Positions |
|------------|---------|-------------------|--------------------|
| Conservative | 1:2 | 0.5 contracts | 2 |
| Moderate | 1:1.5 | 1 contract | 3 |
| Aggressive | 1:1 | 2 contracts | 5 |

## Market Condition Selection Guide

| Condition | Best Strategies | Avoid |
|-----------|----------------|-------|
| Trending (ADX > 25) | trend-following, breakout, donchian-trend, position-trading | mean-reversion, grid-trader, market-making |
| Ranging (ADX < 20) | mean-reversion, grid-trader, market-making, pairs-trading | breakout, trend-following |
| High Volatility | volatility-breakout, momentum-scalper, news-spike | grid-trader, market-making |
| Low Volatility | market-making, pairs-trading | volatility-breakout, news-spike |

## Instrument-Specific Notes

- **Gold**: Most versatile. Works with nearly all strategies. Higher point values mean wider stops needed.
- **Silver**: Good for mean-reversion and momentum strategies. Higher volatility than Gold.
- **Oil**: Best for breakout and volatility strategies. News-sensitive.
- **Bitcoin**: High volatility. Good for momentum-scalper and grid-trader. Wide spreads.
- **US 500 / Indices**: Trend-following and breakout work well. Lower transaction costs.
