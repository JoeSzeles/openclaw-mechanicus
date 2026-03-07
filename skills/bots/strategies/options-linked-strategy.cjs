const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class OptionsLinkedStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "options-linked"; }
  getName() { return "Options-Linked"; }
  getDescription() { return "Implied volatility proxy (ATR as % of price) with momentum for gamma plays"; }
  getTimeframeHint() { return "MINUTE_15"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.atrPeriod || 14) + 10, 50);
  }

  getConfigSchema() {
    return [
      { key: "ivThreshold", type: "number", default: 0, description: "Minimum implied volatility proxy (ATR/price %) to trigger", group: "entry" },
      { key: "volumeSpikeMultiplier", type: "number", default: 2, description: "Volume spike multiplier for gamma detection", group: "entry" },
      { key: "atrPeriod", type: "number", default: 14, description: "ATR period for volatility calculation", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const atr = ind.calcATRFromTicks(prices, c.atrPeriod || 14);
      if (atr === null || currentPrice === 0) return null;

      const ivProxy = (atr / currentPrice) * 100;
      const ivThreshold = c.ivThreshold || 0;
      if (ivProxy < ivThreshold) return null;

      const roc = ind.calcROC(prices, c.atrPeriod || 14);
      if (roc === null) return null;

      let direction = null;
      if (roc > 0) direction = "BUY";
      else if (roc < 0) direction = "SELL";

      if (!direction) return null;

      const stopDist = atr * 1.5;
      const limitDist = atr * 3;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `IV_proxy=${ivProxy.toFixed(2)}% ATR=${atr.toFixed(4)} ROC=${roc.toFixed(2)}%`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = OptionsLinkedStrategy;
