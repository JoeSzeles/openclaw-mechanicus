const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class SeasonalTraderStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "seasonal-trader"; }
  getName() { return "Seasonal Trader"; }
  getDescription() { return "Calendar window check (month/day-of-week patterns) with EMA trend filter"; }
  getTimeframeHint() { return "DAY"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.emaLong || 21) * 3, 50);
  }

  getConfigSchema() {
    return [
      { key: "seasonalMonths", type: "string", default: "", description: "Comma-separated months to trade (1-12). Empty = all months", group: "entry" },
      { key: "seasonalDays", type: "string", default: "", description: "Comma-separated days of week to trade (0=Sun,6=Sat). Empty = all days", group: "entry" },
      { key: "emaShort", type: "number", default: 9, description: "Short EMA period for trend filter", group: "indicators" },
      { key: "emaLong", type: "number", default: 21, description: "Long EMA period for trend filter", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDay();

      if (c.seasonalMonths && c.seasonalMonths.length > 0) {
        const months = c.seasonalMonths.split(",").map(m => parseInt(m.trim(), 10)).filter(m => !isNaN(m));
        if (months.length > 0 && !months.includes(currentMonth)) return null;
      }

      if (c.seasonalDays && c.seasonalDays.length > 0) {
        const days = c.seasonalDays.split(",").map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d));
        if (days.length > 0 && !days.includes(currentDay)) return null;
      }

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const shortEma = ind.calcEMA(prices, c.emaShort || 9);
      const longEma = ind.calcEMA(prices, c.emaLong || 21);
      if (shortEma === null || longEma === null) return null;

      let direction = null;
      if (shortEma > longEma) direction = "BUY";
      else if (shortEma < longEma) direction = "SELL";

      if (!direction) return null;

      const spread = Math.abs(shortEma - longEma);
      const stopDist = spread * 2 || currentPrice * 0.005;
      const limitDist = spread * 4 || currentPrice * 0.01;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `seasonal month=${currentMonth} day=${currentDay} EMA=${shortEma > longEma ? "bullish" : "bearish"}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = SeasonalTraderStrategy;
