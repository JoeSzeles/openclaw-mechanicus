const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class TrendFollowingStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "trend-following"; }
  getName() { return "Trend Following"; }
  getDescription() { return "EMA crossover + ADX trend strength + Parabolic SAR direction alignment"; }
  getTimeframeHint() { return "MINUTE_5"; }

  getRequiredBufferSize() {
    const c = this.config;
    const emaLong = c.emaLong || 21;
    const adxPeriod = c.adxPeriod || 14;
    return Math.max(emaLong, adxPeriod * 2 + 1) * 3;
  }

  getConfigSchema() {
    return [
      { key: "emaShort", type: "number", default: 9, description: "Short EMA period", group: "indicators" },
      { key: "emaLong", type: "number", default: 21, description: "Long EMA period", group: "indicators" },
      { key: "adxPeriod", type: "number", default: 14, description: "ADX calculation period", group: "indicators" },
      { key: "adxThreshold", type: "number", default: 25, description: "Minimum ADX value to confirm trend strength", group: "indicators" },
      { key: "sarAccel", type: "number", default: 0.02, description: "Parabolic SAR acceleration factor", group: "indicators" },
      { key: "sarMax", type: "number", default: 0.2, description: "Parabolic SAR maximum acceleration", group: "indicators" },
      { key: "minSize", type: "number", default: 0.5, description: "Minimum trade size in contracts", group: "sizing" },
      { key: "maxSize", type: "number", default: 10, description: "Maximum trade size in contracts", group: "sizing" }
    ];
  }

  evaluateEntry(ticks, context) {
    const c = this.config;
    if (!ticks || ticks.length < 5) return null;

    const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
    if (prices.length < (c.emaLong || 21)) return null;

    const shortEMA = ind.calcEMA(prices, c.emaShort || 9);
    const longEMA = ind.calcEMA(prices, c.emaLong || 21);
    if (shortEMA === null || longEMA === null) return null;

    const adxResult = ind.calcADXFromPrices(prices, c.adxPeriod || 14);
    if (!adxResult) return null;

    const adxThreshold = c.adxThreshold || 25;
    if (adxResult.adx < adxThreshold) return null;

    const sarResult = ind.calcParabolicSARFromPrices(prices, c.sarAccel || 0.02, c.sarMax || 0.2);
    if (!sarResult) return null;

    const emaBullish = shortEMA > longEMA;
    let direction = null;

    if (emaBullish && sarResult.isLong) {
      direction = "BUY";
    } else if (!emaBullish && !sarResult.isLong) {
      direction = "SELL";
    }

    if (!direction) return null;

    const latest = ticks[ticks.length - 1];
    const spread = typeof latest === "number" ? 0 : (latest.spread || (latest.offer - latest.bid) || 0);
    const stopDist = c.stopDistance || (spread * 3) || 1;
    const limitDist = c.limitDistance || (spread * 4) || 1;

    let size = c.size || 1;
    if (size < (c.minSize || 0.5)) size = c.minSize || 0.5;
    if (size > (c.maxSize || 10)) size = c.maxSize || 10;

    return {
      signal: true,
      direction,
      size,
      stopDist,
      limitDist,
      reason: `EMA ${emaBullish ? "bullish" : "bearish"} ADX=${adxResult.adx.toFixed(1)} SAR=${sarResult.isLong ? "long" : "short"}`
    };
  }
}

module.exports = TrendFollowingStrategy;
