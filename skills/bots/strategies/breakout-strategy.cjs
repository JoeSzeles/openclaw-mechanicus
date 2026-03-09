const BaseStrategy = require("./base-strategy.cjs");
const { calcDonchianFromPrices, calcATRFromTicks } = require("../indicators.cjs");

class BreakoutStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this.config = Object.assign({
      donchianPeriod: 20,
      atrPeriod: 14,
      atrMultiplier: 2,
      volumeConfirm: false,
      minSize: 0.5,
      maxSize: 10
    }, this.config);
  }

  static get STRATEGY_TYPE() { return "breakout"; }
  getName() { return "Breakout"; }
  getTimeframeHint() { return "MINUTE_5"; }

  getRequiredBufferSize() {
    return Math.max(this.config.donchianPeriod, this.config.atrPeriod) * 3;
  }

  getConfigSchema() {
    return [
      { name: "donchianPeriod", type: "number", default: 20, description: "Donchian channel lookback period" },
      { name: "atrPeriod", type: "number", default: 14, description: "ATR calculation period" },
      { name: "atrMultiplier", type: "number", default: 2, description: "ATR multiplier for stop loss" },
      { name: "volumeConfirm", type: "boolean", default: false, description: "Require volume confirmation" },
      { name: "minSize", type: "number", default: 0.5, description: "Minimum position size" },
      { name: "maxSize", type: "number", default: 10, description: "Maximum position size" }
    ];
  }

  evaluateEntry(ticks, context) {
    if (!ticks || ticks.length < this.getRequiredBufferSize()) return null;

    const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
    const price = prices[prices.length - 1];

    const channelPrices = prices.slice(0, -1);
    const donchian = calcDonchianFromPrices(channelPrices, this.config.donchianPeriod);
    if (!donchian) return null;

    const atr = calcATRFromTicks(prices, this.config.atrPeriod);
    if (!atr) return null;

    if (this.config.volumeConfirm && context && context.volume !== undefined) {
      if (!context.avgVolume || context.volume < context.avgVolume) return null;
    }

    const stopDistance = atr * this.config.atrMultiplier;

    if (price > donchian.upper) {
      return {
        signal: true,
        direction: "BUY",
        price,
        stopDist: stopDistance,
        limitDist: stopDistance * 2,
        size: this.config.minSize,
        reason: `Breakout above Donchian upper ${donchian.upper.toFixed(4)}, ATR stop ${stopDistance.toFixed(4)}`
      };
    }

    if (price < donchian.lower) {
      return {
        signal: true,
        direction: "SELL",
        price,
        stopDist: stopDistance,
        limitDist: stopDistance * 2,
        size: this.config.minSize,
        reason: `Breakout below Donchian lower ${donchian.lower.toFixed(4)}, ATR stop ${stopDistance.toFixed(4)}`
      };
    }

    return null;
  }

  evaluateExit(position, ticks, context) {
    if (!position || !ticks || ticks.length < this.config.atrPeriod + 1) {
      return { close: false, reason: "" };
    }

    const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
    const price = prices[prices.length - 1];
    const atr = calcATRFromTicks(prices, this.config.atrPeriod);
    if (!atr) return { close: false, reason: "" };

    const stopDistance = atr * this.config.atrMultiplier;

    if (position.direction === "BUY" && price <= position.entryPrice - stopDistance) {
      return { close: true, reason: `ATR trailing stop hit at ${price.toFixed(4)}` };
    }
    if (position.direction === "SELL" && price >= position.entryPrice + stopDistance) {
      return { close: true, reason: `ATR trailing stop hit at ${price.toFixed(4)}` };
    }

    const donchian = calcDonchianFromPrices(prices, this.config.donchianPeriod);
    if (donchian) {
      if (position.direction === "BUY" && price < donchian.middle) {
        return { close: true, reason: `Price fell below Donchian middle ${donchian.middle.toFixed(4)}` };
      }
      if (position.direction === "SELL" && price > donchian.middle) {
        return { close: true, reason: `Price rose above Donchian middle ${donchian.middle.toFixed(4)}` };
      }
    }

    return { close: false, reason: "" };
  }
}

module.exports = BreakoutStrategy;
