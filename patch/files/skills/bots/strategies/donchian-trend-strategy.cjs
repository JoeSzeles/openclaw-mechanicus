const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class DonchianTrendStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "donchian-trend"; }
  getName() { return "Donchian Trend"; }
  getDescription() { return "Donchian channel breakout trend following with ATR trailing stop"; }
  getTimeframeHint() { return "HOUR"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.donchianPeriod || 20) + 10, (c.atrPeriod || 14) + 10, 50);
  }

  getConfigSchema() {
    return [
      { key: "donchianPeriod", type: "number", default: 20, description: "Donchian channel lookback period", group: "indicators" },
      { key: "atrPeriod", type: "number", default: 14, description: "ATR period for trailing stop calculation", group: "indicators" },
      { key: "atrTrailMult", type: "number", default: 2, description: "ATR multiplier for trailing stop distance", group: "risk" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const donchian = ind.calcDonchianFromPrices(prices, c.donchianPeriod || 20);
      if (!donchian) return null;

      const atr = ind.calcATRFromTicks(prices, c.atrPeriod || 14);
      if (atr === null) return null;

      let direction = null;
      if (currentPrice >= donchian.upper) {
        direction = "BUY";
      } else if (currentPrice <= donchian.lower) {
        direction = "SELL";
      }

      if (!direction) return null;

      const stopDist = atr * (c.atrTrailMult || 2);
      const limitDist = stopDist * 2;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `donchian upper=${donchian.upper.toFixed(4)} lower=${donchian.lower.toFixed(4)} price=${currentPrice.toFixed(4)} ATR=${atr.toFixed(4)}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = DonchianTrendStrategy;
