const BaseStrategy = require("./base-strategy.cjs");
const { calcKeltner, calcATRFromTicks } = require("../indicators.cjs");

class VolatilityBreakoutStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this.config = Object.assign({
      keltnerPeriod: 20,
      keltnerAtrMult: 1.5,
      atrPeriod: 14,
      atrExpansionPct: 50,
      minSize: 0.5,
      maxSize: 10
    }, this.config);
  }

  static get STRATEGY_TYPE() { return "volatility-breakout"; }

  getName() { return "Volatility Breakout"; }

  getTimeframeHint() { return "MINUTE_5"; }

  getRequiredBufferSize() {
    return Math.max(this.config.keltnerPeriod, this.config.atrPeriod) * 3;
  }

  getConfigSchema() {
    return [
      { name: "keltnerPeriod", type: "number", default: 20, description: "Keltner channel EMA period" },
      { name: "keltnerAtrMult", type: "number", default: 1.5, description: "Keltner ATR multiplier" },
      { name: "atrPeriod", type: "number", default: 14, description: "ATR period" },
      { name: "atrExpansionPct", type: "number", default: 50, description: "ATR expansion percentage threshold" },
      { name: "minSize", type: "number", default: 0.5, description: "Minimum position size" },
      { name: "maxSize", type: "number", default: 10, description: "Maximum position size" }
    ];
  }

  evaluateEntry(ticks, context) {
    if (!ticks || ticks.length < this.getRequiredBufferSize()) return null;

    const prices = ticks.map(t => (typeof t === "number" ? t : t.mid));
    const currentPrice = prices[prices.length - 1];

    const { keltnerPeriod, keltnerAtrMult, atrPeriod, atrExpansionPct } = this.config;

    const keltner = calcKeltner(prices, keltnerPeriod, keltnerAtrMult, atrPeriod);
    if (!keltner) return null;

    const currentATR = calcATRFromTicks(prices, atrPeriod);
    if (currentATR === null) return null;

    const halfLen = Math.floor(prices.length / 2);
    const olderPrices = prices.slice(0, halfLen);
    const avgATR = calcATRFromTicks(olderPrices, atrPeriod);
    if (avgATR === null || avgATR === 0) return null;

    const atrExpanded = currentATR > avgATR * (1 + atrExpansionPct / 100);

    if (currentPrice > keltner.upper && atrExpanded) {
      return { signal: true, direction: "BUY", size: this.config.minSize, stopDist: currentATR * 2, limitDist: currentATR * 3, reason: `Price ${currentPrice.toFixed(4)} broke above upper Keltner ${keltner.upper.toFixed(4)} with ATR expansion` };
    }

    if (currentPrice < keltner.lower && atrExpanded) {
      return { signal: true, direction: "SELL", size: this.config.minSize, stopDist: currentATR * 2, limitDist: currentATR * 3, reason: `Price ${currentPrice.toFixed(4)} broke below lower Keltner ${keltner.lower.toFixed(4)} with ATR expansion` };
    }

    return null;
  }
}

module.exports = VolatilityBreakoutStrategy;
