const BaseStrategy = require("./base-strategy.cjs");

class NewsSpikeStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "news-spike"; }
  getName() { return "News Spike Trader"; }
  getDescription() { return "Detects volatility surges from news events using pure tick velocity analysis"; }
  getTimeframeHint() { return "TICK"; }
  getRequiredBufferSize() { return 30; }

  getConfigSchema() {
    return [
      { key: "spikeThreshold", type: "number", default: 0.5, description: "Minimum velocity ratio (recent vs average) to trigger spike detection", group: "entry" },
      { key: "spikeWindowMs", type: "number", default: 5000, description: "Time window in ms to measure recent tick velocity", group: "entry" },
      { key: "requireAlert", type: "boolean", default: false, description: "Require an HTF bias alert before entering a trade", group: "entry" },
      { key: "minSize", type: "number", default: 0.5, description: "Minimum trade size in contracts", group: "sizing" },
      { key: "maxSize", type: "number", default: 10, description: "Maximum trade size in contracts", group: "sizing" }
    ];
  }

  evaluateEntry(ticks, context) {
    const c = this.config;
    if (!ticks || ticks.length < 5) return null;

    const spikeThreshold = c.spikeThreshold || 0.5;
    const spikeWindowMs = c.spikeWindowMs || 5000;
    const requireAlert = c.requireAlert === true;
    const minSize = c.minSize || 0.5;
    const maxSize = c.maxSize || 10;

    const now = Date.now();
    const recentTicks = [];
    const olderTicks = [];

    for (let i = 0; i < ticks.length; i++) {
      const t = ticks[i];
      const ts = typeof t === "object" && t.timestamp ? t.timestamp : 0;
      const price = typeof t === "number" ? t : (t.mid || t.price || 0);
      if (ts && now - ts <= spikeWindowMs) {
        recentTicks.push({ price, timestamp: ts });
      } else {
        olderTicks.push({ price, timestamp: ts });
      }
    }

    if (recentTicks.length < 2 && ticks.length >= 5) {
      const splitIdx = Math.max(2, Math.floor(ticks.length * 0.3));
      for (let i = ticks.length - splitIdx; i < ticks.length; i++) {
        const t = ticks[i];
        const price = typeof t === "number" ? t : (t.mid || t.price || 0);
        recentTicks.push({ price, timestamp: 0 });
      }
      for (let i = 0; i < ticks.length - splitIdx; i++) {
        const t = ticks[i];
        const price = typeof t === "number" ? t : (t.mid || t.price || 0);
        olderTicks.push({ price, timestamp: 0 });
      }
    }

    if (recentTicks.length < 2 || olderTicks.length < 2) return null;

    let recentVelocity = 0;
    for (let i = 1; i < recentTicks.length; i++) {
      recentVelocity += Math.abs(recentTicks[i].price - recentTicks[i - 1].price);
    }
    recentVelocity /= (recentTicks.length - 1);

    let avgVelocity = 0;
    for (let i = 1; i < olderTicks.length; i++) {
      avgVelocity += Math.abs(olderTicks[i].price - olderTicks[i - 1].price);
    }
    avgVelocity /= (olderTicks.length - 1);

    if (avgVelocity === 0) return null;

    const spikeRatio = recentVelocity / avgVelocity;
    if (spikeRatio < (1 + spikeThreshold)) return null;

    const firstRecent = recentTicks[0].price;
    const lastRecent = recentTicks[recentTicks.length - 1].price;
    const spikeDirection = lastRecent > firstRecent ? "BUY" : lastRecent < firstRecent ? "SELL" : null;
    if (!spikeDirection) return null;

    const htfBias = context && context.htfBias ? context.htfBias : null;

    if (requireAlert && !htfBias) return null;

    if (htfBias) {
      const biasUpper = htfBias.toUpperCase();
      if (biasUpper === "BULLISH" && spikeDirection === "SELL") return null;
      if (biasUpper === "BEARISH" && spikeDirection === "BUY") return null;
    }

    const sizeScale = Math.min(spikeRatio / (1 + spikeThreshold), 3);
    const size = Math.max(minSize, Math.min(maxSize, Math.round(minSize * sizeScale * 2) / 2));

    return {
      signal: true,
      direction: spikeDirection,
      size,
      reason: `spike ratio ${spikeRatio.toFixed(2)} (threshold ${(1 + spikeThreshold).toFixed(2)}), dir=${spikeDirection}${htfBias ? ", bias=" + htfBias : ""}`
    };
  }
}

module.exports = NewsSpikeStrategy;
