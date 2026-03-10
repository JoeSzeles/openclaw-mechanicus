'use strict';
const BaseStrategy = require('./base-strategy.cjs');
const indicators = require('../indicators.cjs');

class BourseIndexTrackersStrategyStrategy extends BaseStrategy {
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
        return { signal: true, direction: "BUY", size: config.size || 1, stopDist: config.stopDistance || 30, limitDist: config.limitDistance || 60, reason: "Bourse trend long: EMA cross + MACD confirm" };
      }
      if ((((ema_20 < ema_50) && (rsi > 40)) && (macd_hist < 0))) {
        return { signal: true, direction: "SELL", size: config.size || 1, stopDist: config.stopDistance || 30, limitDist: config.limitDistance || 60, reason: "Bourse trend short: EMA cross + MACD confirm" };
      }
    }
    if ((adx < 20)) {
      return { close: true, reason: "Bourse: low trend strength, closing positions" };
    }
    return null;
  }

  async evaluateExit(position, ticks, context) {
    const config = this.config;
    const prices = ticks.map(t => t.mid || t.close || t.price || 0);
    const adx = indicators.calcADX(prices, 14);
    const rsi = indicators.calcRSI(prices, 14);

    if (adx !== null && adx < 20) {
      return { close: true, reason: 'Low trend strength (ADX < 20)' };
    }

    if (rsi !== null) {
      if (position.direction === 'BUY' && rsi > 75) {
        return { close: true, reason: 'RSI overbought exit' };
      }
      if (position.direction === 'SELL' && rsi < 25) {
        return { close: true, reason: 'RSI oversold exit' };
      }
    }

    return { close: false, reason: '' };
  }

  getRequiredBufferSize() { return 100; }

  getDescription() { return 'Custom ClawScript strategy: Bourse & Index Trackers — trend-following with EMA/RSI/MACD/ADX confirmation'; }

  getTimeframeHint() { return 'MINUTE'; }

  getConfigSchema() {
    return [
      { key: 'enabled', type: 'boolean', default: true, label: 'Enabled' },
      { key: 'size', type: 'number', default: 1, label: 'Position Size' },
      { key: 'stopDistance', type: 'number', default: 30, label: 'Stop Distance' },
      { key: 'limitDistance', type: 'number', default: 60, label: 'Limit Distance' }
    ];
  }

  static get STRATEGY_TYPE() { return 'custom-bourseindextrackersstrategy'; }
}

module.exports = BourseIndexTrackersStrategyStrategy;
