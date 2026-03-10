const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class PortfolioOptimizerStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "portfolio-optimizer"; }
  getName() { return "Portfolio Optimizer"; }
  getDescription() { return "Kelly Criterion sizing with ROC momentum confirmation"; }
  getTimeframeHint() { return "HOUR"; }

  getRequiredBufferSize() {
    const c = this.config;
    return Math.max((c.rocPeriod || 12) + 10, 50);
  }

  getConfigSchema() {
    return [
      { key: "targetSharpe", type: "number", default: 1.5, description: "Target Sharpe ratio for position sizing", group: "risk" },
      { key: "maxCorrelation", type: "number", default: 0.7, description: "Maximum correlation threshold", group: "risk" },
      { key: "rebalanceHours", type: "number", default: 24, description: "Hours between rebalance checks", group: "timing" },
      { key: "kellyFraction", type: "number", default: 0.5, description: "Fraction of Kelly criterion to use (0-1)", group: "sizing" },
      { key: "rocPeriod", type: "number", default: 12, description: "Rate of Change period for momentum", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const roc = ind.calcROC(prices, c.rocPeriod || 12);
      if (roc === null) return null;

      let direction = null;
      if (roc > 0) direction = "BUY";
      else if (roc < 0) direction = "SELL";

      if (!direction) return null;

      const winRate = context.winRate || 0.55;
      const avgWin = context.avgWin || Math.abs(roc) * 0.01;
      const avgLoss = context.avgLoss || Math.abs(roc) * 0.008;
      const kelly = ind.calcKelly(winRate, avgWin, avgLoss);

      let size = c.size || 1;
      if (kelly !== null && kelly > 0) {
        const kellyFraction = c.kellyFraction || 0.5;
        size = Math.max(0.1, size * kelly * kellyFraction);
      }

      const stopDist = currentPrice * 0.005;
      const limitDist = currentPrice * 0.01;

      return {
        signal: true,
        direction,
        size,
        stopDist,
        limitDist,
        reason: `ROC=${roc.toFixed(2)}% kelly=${kelly !== null ? kelly.toFixed(3) : "N/A"} size=${size.toFixed(2)}`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = PortfolioOptimizerStrategy;
