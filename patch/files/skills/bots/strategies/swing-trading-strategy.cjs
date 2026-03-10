const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class SwingTradingStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "swing-trading"; }
  getName() { return "Swing Trading"; }
  getDescription() { return "Fibonacci extension targets with RSI divergence and higher-timeframe bias"; }
  getTimeframeHint() { return "HOUR"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.fibLookback || 50) + 10, (c.rsiPeriod || 14) * 3, 80);
  }

  getConfigSchema() {
    return [
      { key: "fibLookback", type: "number", default: 50, description: "Fibonacci lookback period for swing high/low", group: "indicators" },
      { key: "rsiPeriod", type: "number", default: 14, description: "RSI period for divergence detection", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const fib = ind.calcFibonacci(prices, c.fibLookback || 50);
      if (!fib) return null;

      const rsi = ind.calcRSI(prices, c.rsiPeriod || 14);
      if (rsi === null) return null;

      const htfBias = context && context.htfBias ? context.htfBias : null;
      let direction = null;

      if (fib.isUptrend && fib.nearestLevel >= 0.382 && rsi < 45) {
        direction = "BUY";
      } else if (!fib.isUptrend && fib.nearestLevel >= 0.382 && rsi > 55) {
        direction = "SELL";
      }

      if (!direction) return null;

      if (htfBias === "LONG" && direction === "SELL") return null;
      if (htfBias === "SHORT" && direction === "BUY") return null;

      const stopDist = fib.range * 0.236;
      const limitDist = fib.range * 0.382;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `fib=${fib.nearestLevel} RSI=${rsi.toFixed(1)} HTF=${htfBias || "neutral"} trend=${fib.isUptrend ? "up" : "down"}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = SwingTradingStrategy;
