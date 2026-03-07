const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class ScalperStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "scalper"; }
  getName() { return "Scalper"; }
  getDescription() { return "Quick in-outs on micro-moves using momentum %, RSI, EMA cross, MACD histogram"; }
  getTimeframeHint() { return "TICK"; }

  getRequiredBufferSize() {
    const c = this.config;
    const hasInd = c.rsiEnabled || c.emaEnabled || c.macdEnabled;
    const indMax = hasInd ? Math.max(
      (c.macdSlow || 26) + (c.macdSignal || 9) + 10,
      (c.emaLong || 21) * 3,
      (c.rsiPeriod || 14) * 4,
      80
    ) : 50;
    return Math.max(c.tickWindow || 15, indMax);
  }

  getConfigSchema() {
    return [
      { key: "minMomentumPct", type: "number", default: 0.03, description: "Minimum momentum % to trigger entry signal", group: "entry" },
      { key: "tickWindow", type: "number", default: 15, description: "Number of ticks to measure momentum over", group: "entry" },
      { key: "cooldownMs", type: "number", default: 6000, description: "Cooldown between trades in milliseconds", group: "timing" },
      { key: "warmupMs", type: "number", default: 60000, description: "Warmup period after start before trading (ms)", group: "timing" },
      { key: "maxOpenPositions", type: "number", default: 2, description: "Maximum concurrent open positions", group: "risk" },
      { key: "minSize", type: "number", default: 0.5, description: "Minimum trade size in contracts", group: "sizing" },
      { key: "maxSize", type: "number", default: 10, description: "Maximum trade size in contracts", group: "sizing" },
      { key: "profitTarget", type: "number", default: 0, description: "Auto-close at this profit amount ($). 0 = disabled", group: "exit" },
      { key: "trailingStop", type: "number", default: 0, description: "Trailing stop distance in points. 0 = disabled", group: "exit" },
      { key: "rsiEnabled", type: "boolean", default: false, description: "Enable RSI filter (blocks overbought BUY / oversold SELL)", group: "indicators" },
      { key: "rsiPeriod", type: "number", default: 14, description: "RSI calculation period", group: "indicators" },
      { key: "rsiOverbought", type: "number", default: 70, description: "RSI overbought threshold (blocks BUY above this)", group: "indicators" },
      { key: "rsiOversold", type: "number", default: 30, description: "RSI oversold threshold (blocks SELL below this)", group: "indicators" },
      { key: "emaEnabled", type: "boolean", default: false, description: "Enable EMA crossover trend filter", group: "indicators" },
      { key: "emaShort", type: "number", default: 9, description: "Short EMA period for crossover", group: "indicators" },
      { key: "emaLong", type: "number", default: 21, description: "Long EMA period for crossover", group: "indicators" },
      { key: "macdEnabled", type: "boolean", default: false, description: "Enable MACD histogram direction filter", group: "indicators" },
      { key: "macdFast", type: "number", default: 12, description: "MACD fast EMA period", group: "indicators" },
      { key: "macdSlow", type: "number", default: 26, description: "MACD slow EMA period", group: "indicators" },
      { key: "macdSignal", type: "number", default: 9, description: "MACD signal line period", group: "indicators" }
    ];
  }

  evaluateEntry(ticks, context) {
    const c = this.config;
    if (!ticks || ticks.length < 5) return null;

    const window = Math.min(ticks.length, c.tickWindow || 15);
    const recentTicks = ticks.slice(-window);
    const firstMid = recentTicks[0].mid;
    const lastMid = recentTicks[recentTicks.length - 1].mid;
    const momentumPct = ((lastMid - firstMid) / firstMid) * 100;
    const absMomentum = Math.abs(momentumPct);

    const minMom = c.minMomentumPct || 0.03;
    if (absMomentum < minMom) return null;

    let direction = null;
    const htfBias = context.htfBias;

    if (c.direction === "BUY") {
      if (momentumPct > 0) direction = "BUY";
    } else if (c.direction === "SELL") {
      if (momentumPct < 0) direction = "SELL";
    } else {
      if (momentumPct > minMom) direction = "BUY";
      else if (momentumPct < -minMom) direction = "SELL";
      if (htfBias === "LONG" && direction === "SELL") return null;
      if (htfBias === "SHORT" && direction === "BUY") return null;
    }

    if (!direction) return null;

    const hasIndicators = c.rsiEnabled || c.emaEnabled || c.macdEnabled;
    if (hasIndicators) {
      const indResult = this._evaluateIndicators(ticks, direction);
      if (!indResult.passed) return null;
    }

    const latest = ticks[ticks.length - 1];
    const spread = latest.spread || (latest.offer - latest.bid) || 0;
    const stopDist = c.stopDistance || (spread * 3);
    const limitDist = c.limitDistance || (spread * 4);

    let size = c.size || 1;
    if (size < (c.minSize || 0.5)) size = c.minSize || 0.5;
    if (size > (c.maxSize || 10)) size = c.maxSize || 10;

    return {
      signal: true,
      direction,
      size,
      stopDist,
      limitDist,
      reason: `momentum=${momentumPct.toFixed(4)}% HTF=${htfBias || "neutral"}`
    };
  }

  _evaluateIndicators(ticks, direction) {
    const c = this.config;
    const rsiPeriod = c.rsiPeriod || 14;
    const barPrices = ind.downsampleTicks(ticks, Math.max(rsiPeriod * 3, 40));
    const results = { passed: true, details: [] };

    if (c.rsiEnabled) {
      const rsi = ind.calcRSI(barPrices, rsiPeriod);
      if (rsi !== null) {
        const ob = c.rsiOverbought || 70;
        const os = c.rsiOversold || 30;
        if (direction === "BUY" && rsi > ob) { results.passed = false; results.details.push(`RSI=${rsi.toFixed(1)} overbought`); }
        else if (direction === "SELL" && rsi < os) { results.passed = false; results.details.push(`RSI=${rsi.toFixed(1)} oversold`); }
        else results.details.push(`RSI=${rsi.toFixed(1)} OK`);
      } else { results.passed = false; results.details.push("RSI=insufficient data"); }
    }

    if (c.emaEnabled) {
      const shortEma = ind.calcEMA(barPrices, c.emaShort || 9);
      const longEma = ind.calcEMA(barPrices, c.emaLong || 21);
      if (shortEma !== null && longEma !== null) {
        const emaBullish = shortEma > longEma;
        if (direction === "BUY" && !emaBullish) { results.passed = false; results.details.push("EMA bearish, blocking BUY"); }
        else if (direction === "SELL" && emaBullish) { results.passed = false; results.details.push("EMA bullish, blocking SELL"); }
        else results.details.push(`EMA ${emaBullish ? "bullish" : "bearish"} OK`);
      } else { results.passed = false; results.details.push("EMA=insufficient data"); }
    }

    if (c.macdEnabled) {
      const macd = ind.calcMACD(barPrices, c.macdFast || 12, c.macdSlow || 26, c.macdSignal || 9);
      if (macd !== null) {
        if (direction === "BUY" && macd.histogram < 0) { results.passed = false; results.details.push(`MACD hist=${macd.histogram.toFixed(4)}<0`); }
        else if (direction === "SELL" && macd.histogram > 0) { results.passed = false; results.details.push(`MACD hist=${macd.histogram.toFixed(4)}>0`); }
        else results.details.push(`MACD hist=${macd.histogram.toFixed(4)} OK`);
      } else { results.passed = false; results.details.push("MACD=insufficient data"); }
    }

    return results;
  }
}

module.exports = ScalperStrategy;
