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

function resolveType(type) {
  loadStrategies();
  if (registry[type]) return type;
  const lower = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const regType of Object.keys(registry)) {
    if (regType === lower || regType === 'custom-' + lower) return regType;
  }
  for (const [regType, Cls] of Object.entries(registry)) {
    try {
      const inst = new Cls({});
      const name = (inst.getName() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const desc = (inst.getDescription() || '').toLowerCase();
      if (name === lower || desc.includes(type.toLowerCase())) return regType;
    } catch (_) {}
  }
  return null;
}

function createInstance(type, config) {
  loadStrategies();
  const resolved = resolveType(type);
  if (!resolved) {
    const available = Object.keys(registry).join(", ");
    const errMsg = `Strategy type "${type}" not found in registry. Available types: ${available}. Re-compile the strategy in ClawScript Editor.`;
    console.log(`[strategy-loader] ERROR: ${errMsg}`);
    throw new Error(errMsg);
  }
  if (resolved !== type) {
    console.log(`[strategy-loader] Resolved "${type}" → "${resolved}"`);
  }
  return new registry[resolved](config);
}

module.exports = { getStrategy, listStrategies, getStrategySchemas, createInstance, loadStrategies, resolveType };
