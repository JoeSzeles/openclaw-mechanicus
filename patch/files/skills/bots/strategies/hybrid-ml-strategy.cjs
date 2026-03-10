const BaseStrategy = require("./base-strategy.cjs");
const ind = require("../indicators.cjs");

class HybridMLStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "hybrid-ml"; }
  getName() { return "Hybrid ML Predictor"; }
  getDescription() { return "Multi-indicator feature vector (RSI, EMA cross, MACD, Bollinger %B) with configurable weights"; }
  getTimeframeHint() { return "MINUTE_5"; }

  getRequiredBufferSize() {
    return 100;
  }

  getConfigSchema() {
    return [
      { key: "predictionThreshold", type: "number", default: 0.6, description: "Minimum prediction score (0-1) to trigger entry", group: "entry" },
      { key: "adaptiveMode", type: "boolean", default: false, description: "Enable adaptive weight adjustment", group: "entry" },
      { key: "rsiWeight", type: "number", default: 0.25, description: "Weight for RSI feature (0-1)", group: "weights" },
      { key: "emaWeight", type: "number", default: 0.25, description: "Weight for EMA crossover feature (0-1)", group: "weights" },
      { key: "macdWeight", type: "number", default: 0.25, description: "Weight for MACD histogram feature (0-1)", group: "weights" },
      { key: "bollingerWeight", type: "number", default: 0.25, description: "Weight for Bollinger %B feature (0-1)", group: "weights" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 5) return null;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      const currentPrice = prices[prices.length - 1];

      const rsiWeight = c.rsiWeight || 0.25;
      const emaWeight = c.emaWeight || 0.25;
      const macdWeight = c.macdWeight || 0.25;
      const bollingerWeight = c.bollingerWeight || 0.25;
      const totalWeight = rsiWeight + emaWeight + macdWeight + bollingerWeight;

      let bullScore = 0;
      let bearScore = 0;
      let validFeatures = 0;

      const rsi = ind.calcRSI(prices, 14);
      if (rsi !== null) {
        validFeatures++;
        const rsiNorm = (50 - rsi) / 50;
        if (rsi < 30) bullScore += rsiWeight / totalWeight;
        else if (rsi > 70) bearScore += rsiWeight / totalWeight;
        else {
          if (rsiNorm > 0) bullScore += (rsiWeight / totalWeight) * rsiNorm;
          else bearScore += (rsiWeight / totalWeight) * Math.abs(rsiNorm);
        }
      }

      const shortEma = ind.calcEMA(prices, 9);
      const longEma = ind.calcEMA(prices, 21);
      if (shortEma !== null && longEma !== null) {
        validFeatures++;
        if (shortEma > longEma) bullScore += emaWeight / totalWeight;
        else bearScore += emaWeight / totalWeight;
      }

      const macd = ind.calcMACD(prices, 12, 26, 9);
      if (macd !== null) {
        validFeatures++;
        if (macd.histogram > 0) bullScore += macdWeight / totalWeight;
        else bearScore += macdWeight / totalWeight;
      }

      const bb = ind.calcBollinger(prices, 20, 2);
      if (bb !== null) {
        validFeatures++;
        if (bb.percentB < 0.2) bullScore += bollingerWeight / totalWeight;
        else if (bb.percentB > 0.8) bearScore += bollingerWeight / totalWeight;
      }

      if (validFeatures === 0) return null;

      const threshold = c.predictionThreshold || 0.6;
      let direction = null;

      if (bullScore >= threshold) direction = "BUY";
      else if (bearScore >= threshold) direction = "SELL";

      if (!direction) return null;

      const stopDist = currentPrice * 0.003;
      const limitDist = currentPrice * 0.006;

      return {
        signal: true,
        direction,
        size: c.size || 1,
        stopDist,
        limitDist,
        reason: `ML bull=${bullScore.toFixed(3)} bear=${bearScore.toFixed(3)} features=${validFeatures}/4`
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = HybridMLStrategy;
