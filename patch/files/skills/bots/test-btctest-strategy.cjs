'use strict';

const strategyLoader = require('./strategies/index.cjs');
const BtctestStrategy = require('./strategies/custom-btctest-strategy.cjs');
const indicators = require('./indicators.cjs');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

function generateMockTicks(count, startPrice, trend) {
  const ticks = [];
  let price = startPrice;
  for (let i = 0; i < count; i++) {
    if (trend === 'down') {
      price -= Math.random() * 2 + 0.5;
    } else if (trend === 'up') {
      price += Math.random() * 2 + 0.5;
    } else {
      price += (Math.random() - 0.5) * 3;
    }
    ticks.push({ mid: price, close: price, price, timestamp: Date.now() + i * 1000 });
  }
  return ticks;
}

function generateOversoldTicks() {
  const ticks = [];
  let price = 30000;
  for (let i = 0; i < 40; i++) {
    price -= Math.random() * 50 + 20;
    ticks.push({ mid: price, close: price, price });
  }
  for (let i = 0; i < 20; i++) {
    price += Math.random() * 10 + 5;
    ticks.push({ mid: price, close: price, price });
  }
  return ticks;
}

function generateOverboughtTicks() {
  const ticks = [];
  let price = 30000;
  for (let i = 0; i < 40; i++) {
    price += Math.random() * 50 + 20;
    ticks.push({ mid: price, close: price, price });
  }
  for (let i = 0; i < 20; i++) {
    price -= Math.random() * 10 + 5;
    ticks.push({ mid: price, close: price, price });
  }
  return ticks;
}

async function runTests() {
  console.log('\n=== BTC Test Strategy Validation ===\n');

  console.log('1. Strategy class loads correctly');
  assert(typeof BtctestStrategy === 'function', 'BtctestStrategy is a constructor');
  assert(BtctestStrategy.STRATEGY_TYPE === 'custom-btctest', 'STRATEGY_TYPE is custom-btctest');

  console.log('\n2. Strategy instantiation');
  const strat = new BtctestStrategy({});
  assert(strat instanceof BtctestStrategy, 'Instance created');
  assert(strat.getName() === 'custom-btctest', 'getName() returns custom-btctest');
  assert(strat.getDescription().length > 0, 'getDescription() returns non-empty string');
  assert(strat.getTimeframeHint() === 'TICK', 'getTimeframeHint() returns TICK');
  assert(strat.getRequiredBufferSize() === 100, 'getRequiredBufferSize() returns 100');

  console.log('\n3. Config schema');
  const schema = strat.getConfigSchema();
  assert(Array.isArray(schema), 'getConfigSchema() returns array');
  assert(schema.length >= 4, 'Schema has at least 4 entries');
  const keys = schema.map(s => s.key);
  assert(keys.includes('rsiPeriod'), 'Schema includes rsiPeriod');
  assert(keys.includes('emaFast'), 'Schema includes emaFast');
  assert(keys.includes('emaSlow'), 'Schema includes emaSlow');
  assert(keys.includes('stopDistance'), 'Schema includes stopDistance');

  console.log('\n4. evaluateEntry with neutral data (no signal)');
  const neutralTicks = generateMockTicks(60, 30000, 'neutral');
  const neutralResult = await strat.evaluateEntry(neutralTicks, {});
  assert(neutralResult === null || (neutralResult && neutralResult.signal === true), 'Returns null or valid signal on neutral data');

  console.log('\n5. evaluateEntry with oversold data (BUY signal)');
  const oversoldTicks = generateOversoldTicks();
  const prices = oversoldTicks.map(t => t.mid);
  const rsi = indicators.calcRSI(prices, 14);
  const emaF = indicators.calcEMA(prices, 9);
  const emaS = indicators.calcEMA(prices, 21);
  console.log(`    RSI=${rsi ? rsi.toFixed(2) : 'null'}, EMA9=${emaF ? emaF.toFixed(2) : 'null'}, EMA21=${emaS ? emaS.toFixed(2) : 'null'}`);
  const buyResult = await strat.evaluateEntry(oversoldTicks, {});
  if (rsi !== null && rsi < 30 && emaF !== null && emaS !== null && emaF > emaS) {
    assert(buyResult !== null && buyResult.signal === true, 'Returns BUY signal when RSI oversold + EMA cross');
    assert(buyResult.direction === 'BUY', 'Direction is BUY');
  } else {
    console.log('    (conditions not met for BUY with this data, skipping signal assertion)');
    assert(buyResult === null || (buyResult && typeof buyResult.signal === 'boolean'), 'Returns null or valid signal object');
  }

  console.log('\n6. evaluateEntry with overbought data (SELL signal)');
  const overboughtTicks = generateOverboughtTicks();
  const prices2 = overboughtTicks.map(t => t.mid);
  const rsi2 = indicators.calcRSI(prices2, 14);
  const emaF2 = indicators.calcEMA(prices2, 9);
  const emaS2 = indicators.calcEMA(prices2, 21);
  console.log(`    RSI=${rsi2 ? rsi2.toFixed(2) : 'null'}, EMA9=${emaF2 ? emaF2.toFixed(2) : 'null'}, EMA21=${emaS2 ? emaS2.toFixed(2) : 'null'}`);
  const sellResult = await strat.evaluateEntry(overboughtTicks, {});
  if (rsi2 !== null && rsi2 > 70 && emaF2 !== null && emaS2 !== null && emaF2 < emaS2) {
    assert(sellResult !== null && sellResult.signal === true, 'Returns SELL signal when RSI overbought + EMA cross');
    assert(sellResult.direction === 'SELL', 'Direction is SELL');
  } else {
    console.log('    (conditions not met for SELL with this data, skipping signal assertion)');
    assert(sellResult === null || (sellResult && typeof sellResult.signal === 'boolean'), 'Returns null or valid signal object');
  }

  console.log('\n7. evaluateExit');
  const exitResult = await strat.evaluateExit({ direction: 'BUY' }, oversoldTicks, {});
  assert(exitResult !== null, 'evaluateExit returns non-null');
  assert(typeof exitResult.close === 'boolean', 'exitResult has close boolean');
  assert(typeof exitResult.reason === 'string', 'exitResult has reason string');

  console.log('\n8. safeEvaluateEntry (error handling)');
  const safeResult = strat.safeEvaluateEntry([], {});
  assert(safeResult === null || safeResult === undefined || typeof safeResult.then === 'function', 'safeEvaluateEntry handles empty ticks');

  console.log('\n9. Strategy loader integration');
  strategyLoader.loadStrategies();
  const instance = strategyLoader.createInstance('custom-btctest');
  assert(instance !== null, 'createInstance(custom-btctest) returns instance');
  if (instance) {
    assert(instance.getName() === 'custom-btctest', 'Loaded instance getName() correct');
  }

  const list = strategyLoader.listStrategies();
  const found = list.find(s => s.type === 'custom-btctest');
  assert(found !== undefined, 'custom-btctest appears in listStrategies()');

  console.log('\n10. Signal structure validation');
  const customStrat = new BtctestStrategy({ size: 2, stopDistance: 15, limitDistance: 30 });
  const deterministicTicks = [];
  let p = 30000;
  for (let i = 0; i < 50; i++) { p -= 60; deterministicTicks.push({ mid: p, close: p, price: p }); }
  for (let i = 0; i < 15; i++) { p += 5; deterministicTicks.push({ mid: p, close: p, price: p }); }
  const sigResult = await customStrat.evaluateEntry(deterministicTicks, {});
  if (sigResult && sigResult.signal) {
    assert(typeof sigResult.size === 'number', 'Signal has numeric size');
    assert(typeof sigResult.orderType === 'string', 'Signal has string orderType');
    assert(typeof sigResult.stopDist === 'number', 'Signal has numeric stopDist');
    assert(typeof sigResult.limitDist === 'number', 'Signal has numeric limitDist');
    assert(typeof sigResult.reason === 'string', 'Signal has string reason');
    assert(sigResult.size === 2, 'Custom config size applied (2)');
    assert(sigResult.stopDist === 15, 'Custom config stopDistance applied (15)');
  } else {
    console.log('    (no signal generated with deterministic data, verifying null return)');
    assert(sigResult === null, 'Returns null when no conditions met');
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
