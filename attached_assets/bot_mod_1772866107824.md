### Extended List of Bot Types/Strategies for CFDs/Margin Trading

Attila, building on the previous list, I've expanded it to be more comprehensive—now covering ~20 strategies, categorized by timeframe horizon (short-term: seconds/minutes, medium-term: hours/days, long-term: weeks/months+). This spans from high-frequency scalping (your current setup) to position trading. I've included modern twists, like AI/ML integration (leveraging your existing setup where I/Grok can access the DB for backtesting, param optimization, or real-time modifications—e.g., querying logs to tune RSI periods or using ML models on historical ticks). For each, I've noted:

- **Why for CFDs/Margin**: Fit with IG-style leverage/volatility.
- **Key Signals/Indicators**: Core triggers (I'll expand on new ones below).
- **Timeframe Fit**: Primary scale.
- **Pros/Cons**: Quick eval.
- **Modularity Tip**: How to plug into your engine (e.g., as a new `Strategy` class).
- **Modern/AI Integration**: Ways to enhance with your DB/AI setup (e.g., backtest via my code_execution tool, or ML predictions).

These are drawn from proven algos (HFT papers, QuantConnect/Myfxbook data up to 2026 trends). Prioritize starting with medium-term ones to complement your scalper—less latency-dependent.

#### Short-Term Strategies (Seconds to Minutes: High-Frequency, Low-Hold)
| Rank | Bot Type/Strategy | Description | Why Great for CFDs/Margin | Key Signals/Indicators | Timeframe Fit | Pros | Cons | Modularity Tip | Modern/AI Integration |
|------|-------------------|-------------|---------------------------|------------------------|---------------|------|------|----------------|-----------------------|
| 1 | **Scalper** (Your Base) | Quick in-outs on micro-moves. | Tight spreads on forex/indices; leverage small edges. | Momentum %, RSI, EMA cross, MACD hist (yours). | Ticks/1-min. | High volume; low risk/trade. | Fees eat profits; latency-sensitive. | Base class; extend for variants. | Use DB logs to ML-optimize cooldownMs via backtest (e.g., I can run code_execution on historical data). |
| 2 | **Momentum Scalper** | Extension: Chase accelerating moves. | Margin amps short bursts in volatiles like crypto CFDs. | ROC (Rate of Change), volume spikes, momentum divergence. | Ticks/30-sec. | Captures runs; scalable. | Reversals wipe gains. | Override evaluateEntry for ROC > threshold. | AI: Train LSTM on DB ticks to predict momentum continuation. |
| 3 | **Arbitrage Scalper** | Exploit tiny IG feed vs. market diffs (stat arb). | Low-risk hedges; multi-asset support. | Correlation breakdowns, spread monitors. | Ticks/seconds. | Near-zero drawdown. | Rare ops; needs fast execution. | New class: Compare paired epics (e.g., EURUSD/GBPUSD). | ML: Use DB correlations to auto-pair assets. |
| 4 | **Market Making** | Provide liquidity, profit on bid-ask spreads. | IG's order flow; margin for inventory. | Order book depth (if IG API exposes), volatility bands. | Ticks. | Passive income; hedged. | Inventory risk in trends. | Engine: Place limit orders around mid, adjust dynamically. | AI: Optimize spread quoting via reinforcement learning on logs. |
| 5 | **News Spike Trader** | Enter on immediate news-driven jumps. | CFDs spike hard on econ data; leverage quick profits. | Sentiment score from news API, volatility surge. | Event-based (seconds post-news). | High R:R on catalysts. | Slippage; false positives. | Integrate with your alerts.json; trigger on "spike" type. | Modern: Parse X/news via x_semantic_search, score with ML for entry confidence. |

#### Medium-Term Strategies (Hours to Days: Balanced, Trend/Ranging)
| Rank | Bot Type/Strategy | Description | Why Great for CFDs/Margin | Key Signals/Indicators | Timeframe Fit | Pros | Cons | Modularity Tip | Modern/AI Integration |
|------|-------------------|-------------|---------------------------|------------------------|---------------|------|------|----------------|-----------------------|
| 6 | **Mean Reversion** | Bet on pullbacks to averages. | Ranges in forex/commodities; margin for reversals. | Bollinger Bands, Z-score, Stochastic Oscillator. | 5-60 min. | Reliable in chop; auto-stops. | Trends kill it. | Class: Enter when price hits band edges + RSI confirm. | AI: Backtest band SD via DB; use clustering ML on logs to detect ranging regimes. |
| 7 | **Breakout** | Trade breaks of key levels. | Volatile breaks in indices; leverage follow-through. | Donchian Channels, Pivot Points, ATR for stops. | 15-60 min. | Big moves; clear entries. | Fakeouts common. | Override: Monitor highs/lows, enter with volume. | Modern: Use web_search for event calendars to filter news-driven breaks. |
| 8 | **Trend Following** | Ride established trends. | Margin on sustained moves like stocks CFDs. | SMA/EMA crossovers, ADX, Parabolic SAR. | 1-4 hours. | Fewer trades; compounding wins. | Lags; whipsaws. | Engine: Confirm ADX >25 before entry. | AI: Optimize MA periods via genetic algo on DB backtests (I can code_execution it). |
| 9 | **Pairs Trading** | Long/short correlated pairs. | Hedged exposure; IG's broad assets. | Cointegration (Engle-Granger), beta spreads. | 1-4 hours. | Market-neutral; steady. | Breaks in correlation. | New class: Calc spread z-score >2 for entries. | ML: Auto-select pairs from DB correlations; predict decorrelation risks. |
| 10 | **Grid Trader** | Layer orders in a grid, average in. | Ranging markets; margin for scaling. | Fibonacci retracements, ATR grid spacing. | 30 min-4 hours. | Recovers dips; semi-passive. | Unlimited drawdown in trends. | Engine: Place pending orders at levels, cap martingale. | AI: Dynamic grid adjustment based on ML vol forecasts from logs. |
| 11 | **Volatility Breakout** | Enter on vol expansions (e.g., after squeezes). | CFDs like VIX-linked; leverage breakouts. | Keltner Channels, ATR expansion, Chaikin Volatility. | 1-2 hours. | Captures regime shifts. | Quiet periods idle. | Integrate with your spread calc; trigger on ATR > avg. | Modern: Use browse_page for vol news (e.g., earnings), filter with AI sentiment. |
| 12 | **Carry Trade** | Hold high-yield vs. low-yield (e.g., forex pairs). | Margin boosts interest differentials. | Swap rates (from IG), trend filters. | Daily. | Passive carry + appreciation. | Rate changes; carry crashes. | Class: Filter pairs by positive swap + EMA uptrend. | AI: Predict rate hikes via ML on econ data (web_search for indicators). |

#### Long-Term Strategies (Days to Months+: Lower Frequency, Higher Holds)
| Rank | Bot Type/Strategy | Description | Why Great for CFDs/Margin | Key Signals/Indicators | Timeframe Fit | Pros | Cons | Modularity Tip | Modern/AI Integration |
|------|-------------------|-------------|---------------------------|------------------------|---------------|------|------|----------------|-----------------------|
| 13 | **Position Trading** | Long holds on macro trends. | Leverage compounding in commodities/stocks. | Ichimoku Cloud, Weekly MAs, Fundamental ratios. | Daily/weekly. | Big profits; less monitoring. | Opportunity cost; drawdowns. | Engine: Enter on cloud breaks, trail with ATR. | AI: Backtest fundamentals via DB + web_search (e.g., earnings data). |
| 14 | **Swing Trading** | Capture multi-day swings. | CFDs on shares/indices; margin for holds. | Fibonacci extensions, RSI divergences, Volume Profile. | 4H-daily. | Balanced freq; good R:R. | Overnight gaps. | Override: Use your htfBias for swing confirms. | Modern: Sentiment from x_keyword_search (e.g., stock mentions), ML classify as bullish/bearish. |
| 15 | **Value Investing Algo** | Buy undervalued based on metrics. | Long-term CFD holds; leverage discounts. | P/E ratios, DCF models, Graham Number. | Weekly/monthly. | Fundamental edge; compounding. | Slow; mispricings persist. | New class: Pull IG fundamentals, enter if below fair value. | AI: ML regression on DB logs to predict fair value from ratios. |
| 16 | **Sentiment Trader** | Trade based on crowd mood. | CFDs react to hype (e.g., meme stocks). | Sentiment scores (NLP on news/X), Put/Call ratios. | Daily-weekly. | Leads price; asymmetric. | Noise in sentiment data. | Integrate x_semantic_search for real-time vibe. | Modern: Fine-tune ML model on your DB trades + X data for sentiment-entry correlations. |
| 17 | **Options-Linked** | Mirror options flow (e.g., unusual activity). | CFDs as proxy for options; leverage gamma. | Options volume spikes, Implied Vol skew. | Daily. | Institutional edge. | Data access (need API). | Engine: Filter entries on high IV + your momentum. | AI: Use code_execution to parse options data (if in DB), predict squeezes. |
| 18 | **Seasonal Trader** | Exploit calendar patterns (e.g., end-of-month). | CFDs on indices/commodities with cycles. | Historical seasonality, Monte Carlo sims. | Weekly-monthly. | Predictable; low effort. | Anomalies fade. | Class: Backtest seasonal windows from DB. | ML: Cluster analysis on logs to detect new seasonal patterns. |
| 19 | **Hybrid ML Predictor** | Pure AI: Forecast prices with models. | Custom to your DB; edges in noisy CFDs. | Features: All indicators + external (news/vol). | Any (adaptive). | Data-driven; evolves. | Black-box; overfitting. | Standalone class: Load Torch model, predict signals. | Modern: I can code_execution train/test on your DB ticks (e.g., LSTM for next-bar prediction). |
| 20 | **Portfolio Optimizer** | Allocate across multiple strategies/epics. | Margin for diversified holds; IG multi-asset. | Sharpe Ratio, Correlation matrix, Kelly Criterion. | Weekly-monthly. | Risk-adjusted returns. | Complex management. | Meta-engine: Run sub-strategies, rebalance based on perf. | AI: Use optimization algos (PuLP in code_execution) on DB backtests for weights. |

This list is exhaustive but practical—focus on 5-10 to avoid overkill. For your modular bot, implement 2-3 new ones first (e.g., Mean Reversion for ranging, Trend Following for trends). I can backtest any via code_execution on sample data (or simulate your DB).

### Extensive List of New Signals/Indicators (Not in Your Bot)
Your bot has RSI, EMA, MACD, momentum %, htfBias (from alerts), spread/tick calcs. Here's ~25 new ones to add—categorized, with calc notes. Integrate via new functions (e.g., `calcBollinger(prices, period, sd)`), store in DB for backtesting/AI tuning. I'll suggest code snippets if needed.

#### Momentum/Trend Signals
- **ADX (Average Directional Index)**: Measures trend strength (0-100; >25 = strong). Calc: Based on +DI/-DI from highs/lows.
- **Rate of Change (ROC)**: (Current - N-period ago)/N-period ago *100; threshold >5% for buys.
- **Parabolic SAR**: Trailing stop/reversal dots; flips on acceleration.
- **Ichimoku Cloud**: Multi-line (Tenkan/Kijun/Base/Leading spans); buy above cloud.
- **Aroon Indicator**: Up/Down (0-100); crossover for trend starts.

#### Oscillator/Mean Reversion Signals
- **Bollinger Bands**: Mid = SMA(period), Upper/Lower = Mid ± SD*2; squeeze for breakouts.
- **Stochastic Oscillator**: %K = (Close - LowN)/(HighN - LowN)*100, %D = SMA(%K); overbought >80.
- **Commodity Channel Index (CCI)**: (Typical Price - SMA)/ (0.015 * Mean Dev); >100 buy.
- **Williams %R**: Like Stochastic but inverted (-100 to 0); -20 overbought.
- **Ultimate Oscillator**: Weighted avg of 7/14/28 periods; divergences key.

#### Volatility Signals
- **ATR (Average True Range)**: Avg of (High-Low, abs(High-PrevClose), abs(Low-PrevClose)); for stops (e.g., 2*ATR).
- **Chaikin Volatility**: EMA(High-Low diff) rate of change; >0 for expansions.
- **Keltner Channels**: EMA mid ± ATR*mult; narrower than Bollinger.
- **Volatility Index (VIX) Proxy**: Calc from options or use external (web_search for "VIX futures").

#### Volume/Confirmation Signals (If IG Exposes Volume)
- **On-Balance Volume (OBV)**: Cumulative (if up: +vol, down: -vol); divergences.
- **Volume Weighted Average Price (VWAP)**: (Sum(Price*Vol))/Sum(Vol); buy below.
- **Chaikin Money Flow (CMF)**: Accumulation/distribution oscillator.
- **Volume Profile**: Histogram of vol at price levels; enter at value areas.

#### Fundamental/Sentiment Signals
- **Put/Call Ratio**: Options sentiment (high >1 = bearish).
- **Sentiment Score**: NLP on news/X (via x_semantic_search); +1 bullish, -1 bearish.
- **Economic Indicators**: GDP/CPI diffs (browse_page for data); threshold for bias.

#### Advanced/ML Signals
- **Z-Score**: (Price - Mean)/SD for mean reversion.
- **Fibonacci Retracements**: Levels (23.6%, 38.2%, etc.) from swings; for targets.
- **Machine Learning Features**: LSTM/Random Forest predictions (train on DB ticks/indicators).
- **Monte Carlo Sims**: Prob of targets based on vol paths.
- **Kelly Criterion**: Optimal size = (Win% * R:R - Loss%) / R:R.

Add these to `stratIndicators()` and `evaluateIndicators()`—e.g., enable via config like `bollingerEnabled: true, bollingerPeriod: 20, bollingerSD: 2`.

### New Variables to Add to Config/DB (Not in Your Bot)
Your config has basics (size, direction, indicators params, etc.). Add these for flexibility—store in DB for AI mods/backtests. Grouped by category; defaults suggested.

#### Entry/Exit Params
- `volThreshold`: Min ATR/vol for entries (default: 1.5 * avg).
- `fibLevels`: Array [0.236, 0.382] for targets.
- `kellyFraction`: 0-1 for sizing (default: 0.5; risk-aware).
- `maxHoldTimeMs`: Auto-close after X ms (default: 3600000 for 1hr).

#### Risk Management
- `atrMultiplierStop`: Stop = ATR * X (default: 2).
- `atrMultiplierLimit`: Limit = ATR * X (default: 3).
- `positionPyramiding`: Max adds to winners (default: 3).
- `hedgeRatio`: For pairs (default: 1; beta-adjusted).

#### Time/Regime Filters
- `sessionFilter`: "London" or "NY" (only trade during).
- `volRegime`: "high/low" (filter based on VIX proxy).
- `newsBlackoutMs`: Pause X ms pre/post events (default: 300000).

#### AI/ML Specific
- `mlModelPath`: DB path to trained model (e.g., for predictions).
- `backtestWindowDays`: For auto-optim (default: 30; I can run).
- `sentimentThreshold`: Min score for entry (default: 0.5).
- `optimizationAlgo`: "genetic" or "grid" for param tuning.

With your DB setup, I can help backtest these—e.g., "Grok, backtest new ATR stop on EURUSD logs" (using code_execution to simulate). What's the first new strategy/signal you want to implement or test?