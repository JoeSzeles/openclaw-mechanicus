const WebSocket = require('ws');

let currentBtcPrice = null;
let priceUpdateCallback = null;

// EMA vars (example)
let emaShort = 0;
let emaLong = 0;
const alphaShort = 2 / (12 + 1); // EMA12
const alphaLong = 2 / (26 + 1);  // EMA26

function startBinanceFeed(callback) {
  priceUpdateCallback = callback || defaultCallback;
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@aggTrade');

  ws.on('open', () => {
    console.log('[BTC-WS] Connected to Binance aggTrade');
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.e === 'aggTrade') {
      const price = parseFloat(msg.p);
      const qty = parseFloat(msg.q);
      const ts = msg.T;
      currentBtcPrice = price;
      priceUpdateCallback(price, qty, ts);
      // Log every tick
      console.log(`BTC: ${price.toFixed(2)} qty:${qty.toFixed(3)} @ ${new Date(ts).toISOString()}`);
    }
  });

  ws.on('error', (err) => {
    console.error('[BTC-WS] Error:', err);
  });

  ws.on('close', () => {
    console.log('[BTC-WS] Closed - reconnect 5s...');
    setTimeout(() => startBinanceFeed(priceUpdateCallback), 5000);
  });
}

function defaultCallback(price, qty, ts) {
  // Example: simple EMA
  emaShort = alphaShort * price + (1 - alphaShort) * emaShort;
  emaLong = alphaLong * price + (1 - alphaLong) * emaLong;
  if (Math.abs(emaShort - emaLong) > price * 0.003) { // 0.3%
    console.log(`[ALERT] EMA Cross: short ${emaShort.toFixed(2)} long ${emaLong.toFixed(2)}`);
  }
}

// Start (pass callback for custom logic)
if (require.main === module) {
  startBinanceFeed();
}

module.exports = { startBinanceFeed, currentBtcPrice };
