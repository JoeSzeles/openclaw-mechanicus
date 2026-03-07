const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class PositionTradingStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "position-trading"; }
  getName() { return "Position Trading"; }
  getDescription() { return "Ichimoku Cloud breakout with ATR trailing stop for longer-term positions"; }
  getTimeframeHint() { return "HOUR_4"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.ichimokuSenkou || 52) * 2, (c.atrPeriod || 14) + 10, 120);
  }

  getConfigSchema() {
    return [
      { key: "ichimokuTenkan", type: "number", default: 9, description: "Ichimoku Tenkan-sen period", group: "indicators" },
      { key: "ichimokuKijun", type: "number", default: 26, description: "Ichimoku Kijun-sen period", group: "indicators" },
      { key: "ichimokuSenkou", type: "number", default: 52, description: "Ichimoku Senkou Span B period", group: "indicators" },
      { key: "atrTrailMult", type: "number", default: 3, description: "ATR multiplier for trailing stop distance", group: "risk" },
      { key: "atrPeriod", type: "number", default: 14, description: "ATR calculation period", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const ichimoku = ind.calcIchimokuFromPrices(prices, c.ichimokuTenkan || 9, c.ichimokuKijun || 26, c.ichimokuSenkou || 52);
      if (!ichimoku) return null;

      let direction = null;
      if (ichimoku.aboveCloud && ichimoku.tenkanSen > ichimoku.kijunSen) {
        direction = "BUY";
      } else if (ichimoku.belowCloud && ichimoku.tenkanSen < ichimoku.kijunSen) {
        direction = "SELL";
      }

      if (!direction) return null;

      const atr = ind.calcATRFromTicks(prices, c.atrPeriod || 14);
      if (atr === null) return null;

      const stopDist = atr * (c.atrTrailMult || 3);
      const limitDist = stopDist * 2;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `ichimoku=${ichimoku.aboveCloud ? "aboveCloud" : "belowCloud"} tenkan${ichimoku.tenkanSen > ichimoku.kijunSen ? ">" : "<"}kijun ATR=${atr.toFixed(4)}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = PositionTradingStrategy;
