'use strict';

async function scan(options = {}) {
  const criteria = options.criteria || 'default';
  const maxInstruments = options.maxInstruments || 50;
  const scanInterval = options.scanInterval || '1h';
  console.log(`[openclaw-nomad] scan criteria="${criteria}" max=${maxInstruments} interval=${scanInterval}`);
  return {
    instruments: [
      { symbol: 'BTC/USD', score: 0.95, volume: 1200000, trend: 'bullish' },
      { symbol: 'ETH/USD', score: 0.87, volume: 800000, trend: 'bullish' },
      { symbol: 'SOL/USD', score: 0.72, volume: 300000, trend: 'neutral' }
    ],
    scanned: 150,
    matched: 3,
    criteria,
    timestamp: new Date().toISOString()
  };
}

async function allocate(instruments, options = {}) {
  const weights = options.weights || 'equal';
  const rebalance = options.rebalance || '24h';
  console.log(`[openclaw-nomad] allocate instruments=${Array.isArray(instruments) ? instruments.length : 0} weights=${weights} rebalance=${rebalance}`);
  const list = Array.isArray(instruments) ? instruments : [];
  const equalWeight = list.length > 0 ? 1 / list.length : 0;
  return {
    allocations: list.map(inst => ({
      symbol: typeof inst === 'string' ? inst : (inst.symbol || 'UNKNOWN'),
      weight: equalWeight,
      allocated: true
    })),
    rebalance,
    totalWeight: 1.0,
    timestamp: new Date().toISOString()
  };
}

async function setEnabled(instrument, enabled, options = {}) {
  console.log(`[openclaw-nomad] setEnabled instrument="${instrument}" enabled=${enabled}`);
  return {
    instrument,
    enabled: Boolean(enabled),
    updated: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = { scan, allocate, setEnabled };
