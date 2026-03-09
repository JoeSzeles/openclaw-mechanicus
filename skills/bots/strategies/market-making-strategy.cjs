const BaseStrategy = require("./base-strategy.cjs");
const { calcATRFromTicks, calcBollinger } = require("../indicators.cjs");

class MarketMakingStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this.config = Object.assign({
      spreadWidth: 0,
      inventoryLimit: 5,
      adjustmentPct: 0.1,
      atrPeriod: 14,
      bollingerPeriod: 20,
      bollingerSd: 2,
      minSize: 0.5,
      maxSize: 10
    }, this.config);
  }

  static get STRATEGY_TYPE() { return "market-making"; }
  getName() { return "Market Making"; }
  getTimeframeHint() { return "SECOND_5"; }

  getRequiredBufferSize() {
    return Math.max(this.config.atrPeriod, this.config.bollingerPeriod) * 3;
  }

  getConfigSchema() {
    return [
      { key: "spreadWidth", type: "number", default: 0, label: "Spread Width" },
      { key: "inventoryLimit", type: "number", default: 5, label: "Inventory Limit" },
      { key: "adjustmentPct", type: "number", default: 0.1, label: "Adjustment Pct" },
      { key: "atrPeriod", type: "number", default: 14, label: "ATR Period" },
      { key: "bollingerPeriod", type: "number", default: 20, label: "Bollinger Period" },
      { key: "bollingerSd", type: "number", default: 2, label: "Bollinger Std Dev" },
      { key: "minSize", type: "number", default: 0.5, label: "Min Size" },
      { key: "maxSize", type: "number", default: 10, label: "Max Size" }
    ];
  }

  evaluateEntry(ticks, context) {
    if (!ticks || ticks.length < this.getRequiredBufferSize()) return null;

    const prices = ticks.map(t => (typeof t === "number" ? t : t.mid));
    const midPrice = prices[prices.length - 1];

    const atr = calcATRFromTicks(prices, this.config.atrPeriod);
    if (atr === null) return null;

    const boll = calcBollinger(prices, this.config.bollingerPeriod, this.config.bollingerSd);
    if (boll === null) return null;

    const { upper, lower, middle, bandwidth } = boll;
    const range = upper - lower;
    if (range === 0) return null;

    const posInBand = (midPrice - lower) / range;

    const adjustedLower = lower + range * this.config.adjustmentPct;
    const adjustedUpper = upper - range * this.config.adjustmentPct;

    const stopDistance = atr * 1.5;
    const limitDistance = atr * 2;

    if (midPrice <= adjustedLower) {
      return {
        signal: true,
        direction: "BUY",
        reason: `Price ${midPrice.toFixed(4)} near lower band ${lower.toFixed(4)} (pos ${posInBand.toFixed(2)})`,
        stopDist: stopDistance,
        limitDist: limitDistance,
        size: this.config.minSize,
        confidence: Math.min(1, (1 - posInBand) * 2),
        meta: { atr, upper, lower, middle, bandwidth, posInBand }
      };
    }

    if (midPrice >= adjustedUpper) {
      return {
        signal: true,
        direction: "SELL",
        reason: `Price ${midPrice.toFixed(4)} near upper band ${upper.toFixed(4)} (pos ${posInBand.toFixed(2)})`,
        stopDist: stopDistance,
        limitDist: limitDistance,
        size: this.config.minSize,
        confidence: Math.min(1, posInBand * 2),
        meta: { atr, upper, lower, middle, bandwidth, posInBand }
      };
    }

    return null;
  }

  evaluateExit(position, ticks, context) {
    if (!position || !ticks || ticks.length < this.config.bollingerPeriod) {
      return { close: false, reason: "" };
    }

    const prices = ticks.map(t => (typeof t === "number" ? t : t.mid));
    const midPrice = prices[prices.length - 1];

    const boll = calcBollinger(prices, this.config.bollingerPeriod, this.config.bollingerSd);
    if (!boll) return { close: false, reason: "" };

    const { middle } = boll;

    if (position.direction === "BUY" && midPrice >= middle) {
      return { close: true, reason: `Price reverted to middle band ${middle.toFixed(4)}` };
    }
    if (position.direction === "SELL" && midPrice <= middle) {
      return { close: true, reason: `Price reverted to middle band ${middle.toFixed(4)}` };
    }

    return { close: false, reason: "" };
  }
}

module.exports = MarketMakingStrategy;
