const fs = require("fs");
const path = require("path");

const strategiesDir = __dirname;
const BaseStrategy = require("./base-strategy.cjs");

const registry = {};
let loaded = false;

function loadStrategies(force) {
  if (loaded && !force) return;
  const files = fs.readdirSync(strategiesDir).filter(f =>
    f.endsWith("-strategy.cjs") && f !== "base-strategy.cjs"
  );
  for (const file of files) {
    try {
      const StratClass = require(path.join(strategiesDir, file));
      if (typeof StratClass === "function" && StratClass.STRATEGY_TYPE) {
        registry[StratClass.STRATEGY_TYPE] = StratClass;
        console.log(`[strategy-loader] Loaded: ${StratClass.STRATEGY_TYPE} from ${file}`);
      } else {
        console.log(`[strategy-loader] SKIP ${file}: no STRATEGY_TYPE or not a class`);
      }
    } catch (e) {
      console.log(`[strategy-loader] ERROR loading ${file}: ${e.message}`);
    }
  }
  loaded = true;
  console.log(`[strategy-loader] ${Object.keys(registry).length} strategies registered: ${Object.keys(registry).join(", ")}`);
}

function getStrategy(type) {
  loadStrategies();
  if (registry[type]) return registry[type];
  console.log(`[strategy-loader] ERROR: Strategy type "${type}" not found in registry. Available: ${Object.keys(registry).join(", ")}`);
  return null;
}

function listStrategies() {
  loadStrategies();
  return Object.keys(registry).map(type => {
    const Cls = registry[type];
    const instance = new Cls({});
    return {
      type,
      name: instance.getName(),
      description: instance.getDescription(),
      timeframeHint: instance.getTimeframeHint()
    };
  });
}

function getStrategySchemas() {
  loadStrategies();
  const schemas = {};
  for (const [type, Cls] of Object.entries(registry)) {
    const instance = new Cls({});
    schemas[type] = {
      type,
      name: instance.getName(),
      description: instance.getDescription(),
      timeframeHint: instance.getTimeframeHint(),
      configSchema: instance.getConfigSchema()
    };
  }
  return schemas;
}

function createInstance(type, config) {
  loadStrategies();
  const Cls = registry[type];
  if (!Cls) {
    const available = Object.keys(registry).join(", ");
    const errMsg = `Strategy type "${type}" not found in registry. Available types: ${available}`;
    console.log(`[strategy-loader] ERROR: ${errMsg}`);
    throw new Error(errMsg);
  }
  return new Cls(config);
}

module.exports = { getStrategy, listStrategies, getStrategySchemas, createInstance, loadStrategies };
