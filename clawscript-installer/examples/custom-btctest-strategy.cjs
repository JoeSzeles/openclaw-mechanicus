'use strict';
const BaseStrategy = require('./base-strategy.cjs');
const indicators = require('../indicators.cjs');

class BtctestStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this._vars = {};
  }

  async evaluateEntry(ticks, context) {
    const config = this.config;
    const prices = ticks.map(t => t.mid || t.close || t.price || 0);
    const rsiPeriod = config.rsiPeriod || 14;
    const emaFast = config.emaFast || 9;
    const emaSlow = config.emaSlow || 21;
    const rsiOversold = config.rsiOversold || 30;
    const rsiOverbought = config.rsiOverbought || 70;

    const rsi = indicators.calcRSI(prices, rsiPeriod);
    const emaF = indicators.calcEMA(prices, emaFast);
    const emaS = indicators.calcEMA(prices, emaSlow);

    if (rsi === null || emaF === null || emaS === null) return null;

    if ((rsi < rsiOversold) && (emaF > emaS)) {
      return {
        signal: true,
        direction: 'BUY',
        size: config.size || 1,
        orderType: 'MARKET',
        stopDist: config.stopDistance || 20,
        limitDist: config.limitDistance || 40,
        reason: "RSI oversold + EMA bullish cross"
      };
    }

    if ((rsi > rsiOverbought) && (emaF < emaS)) {
      return {
        signal: true,
        direction: 'SELL',
        size: config.size || 1,
        orderType: 'MARKET',
        stopDist: config.stopDistance || 20,
        limitDist: config.limitDistance || 40,
        reason: "RSI overbought + EMA bearish cross"
      };
    }

    return null;
  }

  async evaluateExit(position, ticks, context) {
    const config = this.config;
    const prices = ticks.map(t => t.mid || t.close || t.price || 0);
    const rsi = indicators.calcRSI(prices, config.rsiPeriod || 14);

    if (rsi === null) return { close: false, reason: '' };

    if (position.direction === 'BUY' && rsi > (config.rsiOverbought || 70)) {
      return { close: true, reason: 'RSI overbought exit' };
    }

    if (position.direction === 'SELL' && rsi < (config.rsiOversold || 30)) {
      return { close: true, reason: 'RSI oversold exit' };
    }

    return { close: false, reason: '' };
  }

  getRequiredBufferSize() { return 100; }

  getDescription() { return 'BTC RSI + EMA Crossover strategy compiled from ClawScript'; }

  getTimeframeHint() { return 'TICK'; }

  getConfigSchema() {
    return [
      { key: 'enabled', type: 'boolean', default: true, label: 'Enabled' },
      { key: 'size', type: 'number', default: 1, label: 'Position Size' },
      { key: 'rsiPeriod', type: 'number', default: 14, label: 'RSI Period' },
      { key: 'emaFast', type: 'number', default: 9, label: 'EMA Fast Period' },
      { key: 'emaSlow', type: 'number', default: 21, label: 'EMA Slow Period' },
      { key: 'rsiOversold', type: 'number', default: 30, label: 'RSI Oversold Threshold' },
      { key: 'rsiOverbought', type: 'number', default: 70, label: 'RSI Overbought Threshold' },
      { key: 'stopDistance', type: 'number', default: 20, label: 'Stop Distance' },
      { key: 'limitDistance', type: 'number', default: 40, label: 'Limit Distance' }
    ];
  }

  static get STRATEGY_TYPE() { return 'custom-btctest'; }
}

module.exports = BtctestStrategy;
