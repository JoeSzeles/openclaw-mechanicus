const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class CarryTradeStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "carry-trade"; }
  getName() { return "Carry Trade"; }
  getDescription() { return "Positive swap direction trading with EMA trend filter for carry income"; }
  getTimeframeHint() { return "HOUR"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.emaLong || 21) * 3, 50);
  }

  getConfigSchema() {
    return [
      { key: "minSwapRate", type: "number", default: 0, description: "Minimum swap rate to consider entry", group: "entry" },
      { key: "trendFilter", type: "boolean", default: true, description: "Require EMA trend confirmation", group: "entry" },
      { key: "holdDays", type: "number", default: 0, description: "Minimum hold period in days. 0 = no minimum", group: "timing" },
      { key: "emaShort", type: "number", default: 9, description: "Short EMA period", group: "indicators" },
      { key: "emaLong", type: "number", default: 21, description: "Long EMA period", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const swapLong = context.swapLong || 0;
      const swapShort = context.swapShort || 0;
      const minSwap = c.minSwapRate || 0;

      let direction = null;
      if (swapLong > minSwap) direction = "BUY";
      else if (swapShort > minSwap) direction = "SELL";

      if (!direction) return null;

      if (c.trendFilter !== false) {
        const shortEma = ind.calcEMA(prices, c.emaShort || 9);
        const longEma = ind.calcEMA(prices, c.emaLong || 21);
        if (shortEma === null || longEma === null) return null;
        const emaBullish = shortEma > longEma;
        if (direction === "BUY" && !emaBullish) return null;
        if (direction === "SELL" && emaBullish) return null;
      }

      const latest = ticks[ticks.length - 1];
      const spread = (typeof latest === "number") ? 0 : (latest.spread || (latest.offer - latest.bid) || 0);
      const stopDist = c.stopDistance || (spread * 5) || currentPrice * 0.005;
      const limitDist = c.limitDistance || (spread * 8) || currentPrice * 0.01;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `swap=${direction === "BUY" ? swapLong : swapShort} trend=${c.trendFilter !== false ? "filtered" : "off"}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = CarryTradeStrategy;
