const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class MeanReversionStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "mean-reversion"; }
  getName() { return "Mean Reversion"; }
  getDescription() { return "Bollinger Band edge entries with Stochastic/RSI confirmation for mean-reversion trades"; }
  getTimeframeHint() { return "MINUTE"; }

  getRequiredBufferSize() {
    const c = this.config;
    const bPeriod = c.bollingerPeriod || 20;
    const sK = c.stochasticK || 14;
    const sD = c.stochasticD || 3;
    const rPeriod = c.rsiPeriod || 14;
    return Math.max(bPeriod, sK + sD, rPeriod) * 3;
  }

  getConfigSchema() {
    return [
      { key: "bollingerPeriod", type: "number", default: 20, description: "Bollinger Band SMA period", group: "indicators" },
      { key: "bollingerSD", type: "number", default: 2, description: "Bollinger Band standard deviation multiplier", group: "indicators" },
      { key: "stochasticK", type: "number", default: 14, description: "Stochastic %K period", group: "indicators" },
      { key: "stochasticD", type: "number", default: 3, description: "Stochastic %D smoothing period", group: "indicators" },
      { key: "rsiPeriod", type: "number", default: 14, description: "RSI calculation period", group: "indicators" },
      { key: "rsiOversold", type: "number", default: 30, description: "RSI oversold threshold (confirms BUY)", group: "indicators" },
      { key: "rsiOverbought", type: "number", default: 70, description: "RSI overbought threshold (confirms SELL)", group: "indicators" },
      { key: "minSize", type: "number", default: 0.5, description: "Minimum trade size in contracts", group: "sizing" },
      { key: "maxSize", type: "number", default: 10, description: "Maximum trade size in contracts", group: "sizing" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      if (!ticks || ticks.length < 5) return null;

      const c = this.config;
      const bollingerPeriod = c.bollingerPeriod || 20;
      const bollingerSD = c.bollingerSD || 2;
      const stochasticK = c.stochasticK || 14;
      const stochasticD = c.stochasticD || 3;
      const rsiPeriod = c.rsiPeriod || 14;
      const rsiOversold = c.rsiOversold || 30;
      const rsiOverbought = c.rsiOverbought || 70;

      const prices = ind.downsampleTicks(ticks, Math.max(bollingerPeriod, stochasticK + stochasticD, rsiPeriod) * 3);
      if (!prices || prices.length < bollingerPeriod) return null;

      const currentPrice = prices[prices.length - 1];

      const bb = ind.calcBollinger(prices, bollingerPeriod, bollingerSD);
      if (!bb) return null;

      let direction = null;
      if (currentPrice <= bb.lower) {
        direction = "BUY";
      } else if (currentPrice >= bb.upper) {
        direction = "SELL";
      }
      if (!direction) return null;

      const stoch = ind.calcStochasticFromPrices(prices, stochasticK, stochasticD);
      if (!stoch) return null;

      const rsi = ind.calcRSI(prices, rsiPeriod);
      if (rsi === null) return null;

      if (direction === "BUY") {
        if (stoch.k >= 30 && rsi >= rsiOversold) return null;
      } else {
        if (stoch.k <= 70 && rsi <= rsiOverbought) return null;
      }

      let size = c.size || 1;
      const minSize = c.minSize || 0.5;
      const maxSize = c.maxSize || 10;
      if (size < minSize) size = minSize;
      if (size > maxSize) size = maxSize;

      const bandwidth = bb.upper - bb.lower;
      const stopDist = bandwidth * 0.5;
      const limitDist = bandwidth * 0.75;

      return {
        signal: true,
        direction,
        size,
        stopDist,
        limitDist,
        reason: `BB %B=${bb.percentB.toFixed(3)} Stoch K=${stoch.k.toFixed(1)} RSI=${rsi.toFixed(1)}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = MeanReversionStrategy;
