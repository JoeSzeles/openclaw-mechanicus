const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class ValueInvestingStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "value-investing"; }
  getName() { return "Value Investing Algo"; }
  getDescription() { return "Price below SMA-based fair value proxy with trend confirmation"; }
  getTimeframeHint() { return "DAY"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.valuePeriod || 200) + 10, (c.emaLong || 21) * 3, 220);
  }

  getConfigSchema() {
    return [
      { key: "valuePeriod", type: "number", default: 200, description: "SMA period for fair value proxy", group: "indicators" },
      { key: "discountPct", type: "number", default: 5, description: "Required discount % below fair value to trigger entry", group: "entry" },
      { key: "trendConfirm", type: "boolean", default: true, description: "Require EMA trend confirmation", group: "entry" },
      { key: "emaShort", type: "number", default: 9, description: "Short EMA period for trend confirmation", group: "indicators" },
      { key: "emaLong", type: "number", default: 21, description: "Long EMA period for trend confirmation", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const fairValue = ind.calcSMA(prices, c.valuePeriod || 200);
      if (fairValue === null) return null;

      const discountPct = c.discountPct || 5;
      const discountThreshold = fairValue * (1 - discountPct / 100);
      const premiumThreshold = fairValue * (1 + discountPct / 100);

      let direction = null;
      if (currentPrice < discountThreshold) {
        direction = "BUY";
      } else if (currentPrice > premiumThreshold) {
        direction = "SELL";
      }

      if (!direction) return null;

      if (c.trendConfirm !== false) {
        const shortEma = ind.calcEMA(prices, c.emaShort || 9);
        const longEma = ind.calcEMA(prices, c.emaLong || 21);
        if (shortEma === null || longEma === null) return null;
        const emaBullish = shortEma > longEma;
        if (direction === "BUY" && !emaBullish) return null;
        if (direction === "SELL" && emaBullish) return null;
      }

      const deviation = Math.abs(currentPrice - fairValue);
      const stopDist = deviation * 0.5;
      const limitDist = deviation * 1.5;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `fairValue=${fairValue.toFixed(4)} price=${currentPrice.toFixed(4)} discount=${((1 - currentPrice / fairValue) * 100).toFixed(2)}%`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = ValueInvestingStrategy;
