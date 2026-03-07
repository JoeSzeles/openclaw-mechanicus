class BaseStrategy {
  constructor(config) {
    this.config = config || {};
  }

  static get STRATEGY_TYPE() { return "base"; }
  getName() { return this.constructor.STRATEGY_TYPE || "base"; }
  getDescription() { return "Base strategy — must be extended"; }
  getTimeframeHint() { return "TICK"; }
  getRequiredBufferSize() { return 50; }

  getConfigSchema() {
    return [];
  }

  evaluateEntry(ticks, context) {
    return null;
  }

  evaluateExit(position, ticks, context) {
    return { close: false, reason: "" };
  }

  safeEvaluateEntry(ticks, context) {
    try {
      return this.evaluateEntry(ticks, context);
    } catch (e) {
      const name = this.getName();
      console.log(`[strategy] [ERROR] ${name}.evaluateEntry crashed: ${e.message}`);
      return null;
    }
  }

  safeEvaluateExit(position, ticks, context) {
    try {
      return this.evaluateExit(position, ticks, context);
    } catch (e) {
      const name = this.getName();
      console.log(`[strategy] [ERROR] ${name}.evaluateExit crashed: ${e.message}`);
      return { close: false, reason: "error: " + e.message };
    }
  }
}

module.exports = BaseStrategy;
