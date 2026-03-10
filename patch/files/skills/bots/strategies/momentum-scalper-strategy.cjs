const BaseStrategy = require("./base-strategy.cjs");
const { calcROC } = require("../indicators.cjs");

class MomentumScalperStrategy extends BaseStrategy {
  static get STRATEGY_TYPE() { return "momentum-scalper"; }
  getName() { return "Momentum Scalper"; }
  getDescription() { return "Scalps momentum bursts using ROC, volume spike detection, and momentum divergence"; }
  getTimeframeHint() { return "SECOND_5"; }

  getRequiredBufferSize() {
    const rp = this.config.rocPeriod || 12;
    return Math.max(rp * 3, 36);
  }

  getConfigSchema() {
    return [
      { key: "rocPeriod", type: "number", default: 12, description: "Rate of change lookback period", group: "entry" },
      { key: "rocThreshold", type: "number", default: 5, description: "Minimum ROC % to trigger entry", group: "entry" },
      { key: "volumeSpikeMultiplier", type: "number", default: 2, description: "Multiplier over average tick velocity to detect volume spike", group: "entry" },
      { key: "minMomentumPct", type: "number", default: 0.05, description: "Minimum momentum % change over recent window", group: "entry" },
      { key: "size", type: "number", default: 1, description: "Trade size in contracts", group: "sizing" }
    ];
  }

  evaluateEntry(ticks, context) {
    try {
      const c = this.config;
      if (!ticks || ticks.length < 6) return null;

      const rocPeriod = c.rocPeriod || 12;
      const rocThreshold = c.rocThreshold || 5;
      const volumeSpikeMultiplier = c.volumeSpikeMultiplier || 2;
      const minMomentumPct = c.minMomentumPct || 0.05;

      const prices = ticks.map(t => typeof t === "number" ? t : t.mid);
      if (prices.length < rocPeriod + 1) return null;

      const roc = calcROC(prices, rocPeriod);
      if (roc === null) return null;
      const absRoc = Math.abs(roc);
      if (absRoc < rocThreshold) return null;

      const recentCount = Math.min(Math.floor(ticks.length / 3), rocPeriod);
      if (recentCount < 2) return null;
      const recentTicks = ticks.slice(-recentCount);
      const olderTicks = ticks.slice(0, -recentCount);

      let recentVelocity = 0;
      for (let i = 1; i < recentTicks.length; i++) {
        const t1 = typeof recentTicks[i] === "number" ? 0 : (recentTicks[i].timestamp || recentTicks[i].ts || i);
        const t0 = typeof recentTicks[i - 1] === "number" ? 0 : (recentTicks[i - 1].timestamp || recentTicks[i - 1].ts || (i - 1));
        const dt = t1 - t0;
        recentVelocity += dt > 0 ? 1 / dt : 1;
      }
      recentVelocity /= (recentTicks.length - 1);

      let avgVelocity = 0;
      if (olderTicks.length > 1) {
        for (let i = 1; i < olderTicks.length; i++) {
          const t1 = typeof olderTicks[i] === "number" ? 0 : (olderTicks[i].timestamp || olderTicks[i].ts || i);
          const t0 = typeof olderTicks[i - 1] === "number" ? 0 : (olderTicks[i - 1].timestamp || olderTicks[i - 1].ts || (i - 1));
          const dt = t1 - t0;
          avgVelocity += dt > 0 ? 1 / dt : 1;
        }
        avgVelocity /= (olderTicks.length - 1);
      } else {
        avgVelocity = recentVelocity;
      }

      const hasVolumeSpike = avgVelocity > 0 ? (recentVelocity / avgVelocity) >= volumeSpikeMultiplier : true;

      const momWindow = Math.min(ticks.length, rocPeriod);
      const momSlice = prices.slice(-momWindow);
      const momFirst = momSlice[0];
      const momLast = momSlice[momSlice.length - 1];
      const momentumPct = momFirst !== 0 ? Math.abs((momLast - momFirst) / momFirst) * 100 : 0;
      if (momentumPct < minMomentumPct) return null;

      const halfLen = Math.floor(prices.length / 2);
      const firstHalf = prices.slice(0, halfLen);
      const secondHalf = prices.slice(halfLen);
      const firstChange = firstHalf.length > 1 ? firstHalf[firstHalf.length - 1] - firstHalf[0] : 0;
      const secondChange = secondHalf.length > 1 ? secondHalf[secondHalf.length - 1] - secondHalf[0] : 0;
      const hasDivergence = (firstChange > 0 && secondChange > 0 && secondChange > firstChange) ||
                            (firstChange < 0 && secondChange < 0 && secondChange < firstChange) ||
                            (firstChange * secondChange < 0);

      const direction = roc > 0 ? "BUY" : "SELL";

      if (!hasVolumeSpike && !hasDivergence) return null;

      const latest = ticks[ticks.length - 1];
      const spread = typeof latest === "number" ? 0.5 : (latest.spread || (latest.offer - latest.bid) || 0.5);
      const stopDist = spread * 3;
      const limitDist = spread * 4;
      const size = c.size || 1;

      const reasons = [];
      reasons.push(`ROC=${roc.toFixed(2)}%`);
      reasons.push(`mom=${momentumPct.toFixed(4)}%`);
      if (hasVolumeSpike) reasons.push("volSpike");
      if (hasDivergence) reasons.push("divergence");

      return {
        signal: true,
        direction,
        size,
        stopDist,
        limitDist,
        reason: reasons.join(" ")
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = MomentumScalperStrategy;
