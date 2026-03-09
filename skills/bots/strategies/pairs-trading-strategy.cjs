const BaseStrategy = require("./base-strategy.cjs");
const { calcZScore } = require("../indicators.cjs");

class PairsTradingStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this.config.zScoreEntry = this.config.zScoreEntry ?? 2;
    this.config.zScoreExit = this.config.zScoreExit ?? 0.5;
    this.config.lookback = this.config.lookback ?? 50;
    this.config.minSize = this.config.minSize ?? 0.5;
    this.config.maxSize = this.config.maxSize ?? 10;
  }

  static get STRATEGY_TYPE() { return "pairs-trading"; }

  getName() { return "Pairs Trading"; }
  getTimeframeHint() { return "MINUTE"; }
  getRequiredBufferSize() { return this.config.lookback * 2; }

  getConfigSchema() {
    return [
      { name: "zScoreEntry", type: "number", default: 2, description: "Z-score threshold to enter a trade" },
      { name: "zScoreExit", type: "number", default: 0.5, description: "Z-score threshold to exit a trade" },
      { name: "lookback", type: "number", default: 50, description: "Lookback period for z-score calculation" },
      { name: "minSize", type: "number", default: 0.5, description: "Minimum position size" },
      { name: "maxSize", type: "number", default: 10, description: "Maximum position size" }
    ];
  }

  evaluateEntry(ticks, context) {
    const prices = Array.isArray(ticks)
      ? ticks.map(t => (typeof t === "number" ? t : t.mid))
      : [];
    if (prices.length < this.config.lookback) return null;

    const zScore = calcZScore(prices, this.config.lookback);
    if (zScore === null) return null;

    if (zScore > this.config.zScoreEntry) {
      return { signal: true, direction: "SELL", size: this.config.minSize || 0.5, reason: `z-score ${zScore.toFixed(2)} > ${this.config.zScoreEntry} (overvalued)` };
    }
    if (zScore < -this.config.zScoreEntry) {
      return { signal: true, direction: "BUY", size: this.config.minSize || 0.5, reason: `z-score ${zScore.toFixed(2)} < -${this.config.zScoreEntry} (undervalued)` };
    }

    return null;
  }

  evaluateExit(position, ticks, context) {
    const prices = Array.isArray(ticks)
      ? ticks.map(t => (typeof t === "number" ? t : t.mid))
      : [];
    if (prices.length < this.config.lookback) return { close: false, reason: "insufficient data" };

    const zScore = calcZScore(prices, this.config.lookback);
    if (zScore === null) return { close: false, reason: "z-score unavailable" };

    if (Math.abs(zScore) <= this.config.zScoreExit) {
      return { close: true, reason: `z-score ${zScore.toFixed(2)} returned within ±${this.config.zScoreExit} of zero` };
    }

    return { close: false, reason: `z-score ${zScore.toFixed(2)} outside exit threshold` };
  }
}

module.exports = PairsTradingStrategy;
