const BaseStrategy = require("./base-strategy.cjs");
const { calcZScore } = require("../indicators.cjs");

class ArbitrageScalperStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "arbitrage-scalper"; }
  getName() { return "Arbitrage Scalper"; }
  getDescription() { return "Statistical arbitrage using z-score of price spread between correlated instruments"; }
  getTimeframeHint() { return "TICK"; }

  getRequiredBufferSize() {
    const correlationWindow = this.config.correlationWindow || 50;
    return correlationWindow * 2;
  }

  getConfigSchema() {
    return [
      { key: "correlationWindow", type: "number", default: 50, description: "Window size for spread z-score calculation", group: "indicators" },
      { key: "spreadThreshold", type: "number", default: 2, description: "Z-score threshold to trigger entry", group: "indicators" },
      { key: "minSize", type: "number", default: 0.5, description: "Minimum trade size in contracts", group: "sizing" },
      { key: "maxSize", type: "number", default: 10, description: "Maximum trade size in contracts", group: "sizing" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      if (!ticks || ticks.length < 2) return null;

      const c = this.config;
      const correlationWindow = c.correlationWindow || 50;
      const spreadThreshold = c.spreadThreshold || 2;

      const pairedPrice = context && context.pairedEpicPrice;
      if (pairedPrice == null) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      if (prices.length < correlationWindow) return null;

      const currentPrice = prices[prices.length - 1];
      if (pairedPrice === 0) return null;

      const ratios = prices.map(p => p / pairedPrice);

      const zScore = calcZScore(ratios, correlationWindow);
      if (zScore === null) return null;

      let direction = null;
      if (zScore > spreadThreshold) {
        direction = "SELL";
      } else if (zScore < -spreadThreshold) {
        direction = "BUY";
      }
      if (!direction) return null;

      let size = c.size || 1;
      const minSize = c.minSize || 0.5;
      const maxSize = c.maxSize || 10;
      if (size < minSize) size = minSize;
      if (size > maxSize) size = maxSize;

      const spread = Math.abs(currentPrice - pairedPrice);
      const stopDist = spread * 0.5;
      const limitDist = spread * 0.75;

      return {
        signal: true,
        direction,
        size,
        stopDist,
        limitDist,
        reason: `Spread z-score=${zScore.toFixed(3)} threshold=${spreadThreshold}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = ArbitrageScalperStrategy;
