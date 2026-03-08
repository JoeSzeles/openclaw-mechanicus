'use strict';
const BaseStrategy = require('./base-strategy.cjs');
const indicators = require('../indicators.cjs');

class BourseIndexTrackersStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this._vars = {};
  }

  async evaluateEntry(ticks, context) {
    const config = this.config;
    const prices = ticks.map(t => t.mid || t.close || t.price || 0);
    const ema_20 = indicators.calcEMA(prices, 20);
    const ema_50 = indicators.calcEMA(prices, 50);
    const rsi = indicators.calcRSI(prices, 14);
    const macd_hist = indicators.calcMACD(prices, 12, 26, 9);
    const atr = indicators.calcATR(prices, 14);
    const adx = indicators.calcADX(prices, 14);

    if (ema_20 === null || ema_50 === null || rsi === null) return null;

    if ((adx > 25)) {
      if ((((ema_20 > ema_50) && (rsi < 60)) && (macd_hist > 0))) {
        return { signal: true, direction: "BUY", size: config.size || 1, stopDist: config.stopDist || 30, limitDist: config.limitDist || 60, reason: "Bourse trend long: EMA cross + MACD confirm" };
      }
      if ((((ema_20 < ema_50) && (rsi > 40)) && (macd_hist < 0))) {
        return { signal: true, direction: "SELL", size: config.size || 1, stopDist: config.stopDist || 30, limitDist: config.limitDist || 60, reason: "Bourse trend short: EMA cross + MACD confirm" };
      }
    }
    if ((adx < 20)) {
      return { close: true, reason: "Bourse: low trend strength, closing positions" };
    }
    return null;
  }
}

module.exports = BourseIndexTrackersStrategy;
