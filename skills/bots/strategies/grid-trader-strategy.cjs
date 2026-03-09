const BaseStrategy = require("./base-strategy.cjs");
const { calcATRFromTicks, calcFibonacci } = require("../indicators.cjs");

class GridTraderStrategy extends BaseStrategy {
  constructor(config) {
    super(config);
    this.touchedLevels = new Set();
  }

  static get STRATEGY_TYPE() { return "grid-trader"; }
  getName() { return "Grid Trader"; }
  getTimeframeHint() { return "MINUTE"; }

  getRequiredBufferSize() {
    const atrPeriod = this.config.atrPeriod || 14;
    const fibLookback = this.config.fibLookback || 50;
    return Math.max(atrPeriod, fibLookback) * 2;
  }

  getConfigSchema() {
    return [
      { name: "gridLevels", type: "number", default: 5 },
      { name: "gridSpacing", type: "number", default: 0 },
      { name: "maxPositions", type: "number", default: 10 },
      { name: "useATR", type: "boolean", default: true },
      { name: "atrPeriod", type: "number", default: 14 },
      { name: "fibLookback", type: "number", default: 50 },
      { name: "minSize", type: "number", default: 0.5 },
      { name: "maxSize", type: "number", default: 10 }
    ];
  }

  evaluateEntry(ticks, context) {
    if (!ticks || ticks.length < 2) return null;

    const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
    const currentPrice = prices[prices.length - 1];

    const gridLevels = this.config.gridLevels || 5;
    const gridSpacing = this.config.gridSpacing || 0;
    const maxPositions = this.config.maxPositions || 10;
    const useATR = this.config.useATR !== undefined ? this.config.useATR : true;
    const atrPeriod = this.config.atrPeriod || 14;
    const fibLookback = this.config.fibLookback || 50;
    const minSize = this.config.minSize || 0.5;
    const maxSize = this.config.maxSize || 10;

    let spacing = gridSpacing;
    if (spacing === 0 && useATR) {
      const atr = calcATRFromTicks(prices, atrPeriod);
      if (!atr || atr === 0) return null;
      spacing = atr;
    }
    if (!spacing || spacing <= 0) return null;

    const fib = calcFibonacci(prices, Math.min(fibLookback, prices.length));

    const centerPrice = currentPrice;
    const levels = [];
    for (let i = -gridLevels; i <= gridLevels; i++) {
      if (i === 0) continue;
      levels.push(centerPrice + i * spacing);
    }

    const openPositions = (context && context.openPositions) || 0;
    if (openPositions >= maxPositions) return null;

    const tolerance = spacing * 0.1;

    for (const level of levels) {
      const levelKey = level.toFixed(8);
      if (this.touchedLevels.has(levelKey)) continue;

      if (Math.abs(currentPrice - level) <= tolerance) {
        this.touchedLevels.add(levelKey);

        const direction = level < centerPrice ? "BUY" : "SELL";

        const distFromCenter = Math.abs(level - centerPrice);
        const maxDist = gridLevels * spacing;
        const sizeRatio = maxDist > 0 ? distFromCenter / maxDist : 0.5;
        const size = Math.min(Math.max(minSize + (maxSize - minSize) * sizeRatio, minSize), maxSize);

        return {
          signal: true,
          direction,
          size,
          stopDist: spacing * 2,
          limitDist: spacing,
          reason: `Grid level touched at ${level.toFixed(4)}, direction toward center`,
          grid: {
            level,
            center: centerPrice,
            spacing,
            fibData: fib ? { nearestLevel: fib.nearestLevel, isUptrend: fib.isUptrend } : null
          }
        };
      }
    }

    return null;
  }

  evaluateExit(position, ticks, context) {
    if (!position || !ticks || ticks.length < 2) return { close: false, reason: "" };

    const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
    const currentPrice = prices[prices.length - 1];
    const gridSpacing = this.config.gridSpacing || 0;
    const useATR = this.config.useATR !== undefined ? this.config.useATR : true;
    const atrPeriod = this.config.atrPeriod || 14;

    let spacing = gridSpacing;
    if (spacing === 0 && useATR) {
      const atr = calcATRFromTicks(prices, atrPeriod);
      if (atr) spacing = atr;
    }
    if (!spacing || spacing <= 0) return { close: false, reason: "" };

    const entryPrice = position.entryPrice || position.price;
    if (!entryPrice) return { close: false, reason: "" };

    const pnl = position.direction === "BUY"
      ? currentPrice - entryPrice
      : entryPrice - currentPrice;

    if (pnl >= spacing) {
      return { close: true, reason: `Grid target reached, PnL: ${pnl.toFixed(4)}` };
    }

    if (pnl <= -spacing * 2) {
      return { close: true, reason: `Grid stop hit, PnL: ${pnl.toFixed(4)}` };
    }

    return { close: false, reason: "" };
  }
}

module.exports = GridTraderStrategy;
