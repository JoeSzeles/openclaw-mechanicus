const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class SentimentTraderStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "sentiment-trader"; }
  getName() { return "Sentiment Trader"; }
  getDescription() { return "Sentiment-driven entries from HTF bias with ROC momentum confirmation"; }
  getTimeframeHint() { return "MINUTE_5"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.rocPeriod || 12) + 10, 50);
  }

  getConfigSchema() {
    return [
      { key: "sentimentThreshold", type: "number", default: 0.6, description: "Minimum sentiment strength (0-1) to trigger entry", group: "entry" },
      { key: "requireMomentumConfirm", type: "boolean", default: true, description: "Require ROC momentum confirmation", group: "entry" },
      { key: "rocPeriod", type: "number", default: 12, description: "Rate of Change period", group: "indicators" },
      { key: "rocThreshold", type: "number", default: 3, description: "Minimum absolute ROC % for momentum confirmation", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const htfBias = context.htfBias;
      const sentimentThreshold = c.sentimentThreshold || 0.6;

      let direction = null;
      let sentimentScore = 0;

      if (htfBias === "LONG") {
        sentimentScore = context.sentimentScore || 0.7;
        if (sentimentScore >= sentimentThreshold) direction = "BUY";
      } else if (htfBias === "SHORT") {
        sentimentScore = context.sentimentScore || 0.7;
        if (sentimentScore >= sentimentThreshold) direction = "SELL";
      }

      if (!direction) return null;

      if (c.requireMomentumConfirm !== false) {
        const roc = ind.calcROC(prices, c.rocPeriod || 12);
        if (roc === null) return null;
        const rocThreshold = c.rocThreshold || 3;
        if (direction === "BUY" && roc < rocThreshold) return null;
        if (direction === "SELL" && roc > -rocThreshold) return null;
      }

      const currentPrice = prices[prices.length - 1];
      const stopDist = currentPrice * 0.003;
      const limitDist = currentPrice * 0.006;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `sentiment=${sentimentScore.toFixed(2)} HTF=${htfBias} momentum=${c.requireMomentumConfirm !== false ? "confirmed" : "off"}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = SentimentTraderStrategy;
