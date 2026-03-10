const WebSocket = require('ws');

const args = process.argv.slice(2);
const symbols = args.filter(arg => !arg.startsWith('--'));
const streamType = args.find(arg => arg.startsWith('--s='))?.slice(3) || 'aggTrade';
const wsType = args.find(arg => arg.startsWith('--t='))?.slice(4) || 'spot';

if (symbols.length === 0) {
  symbols = ['btcusdt'];
  console.log('No symbols, defaulting to btcusdt');
}

const baseUrl = wsType === 'futures' ? 'wss://fstream.binance.com' : 'wss://stream.binance.com:9443';
const streams = symbols.map(sym => sym.toLowerCase() + '@' + streamType).join('/');
const url = `${baseUrl}/stream?streams=${streams}`;

console.log(`[Binance-WS] ${symbols.join(', ')} @${streamType} (${wsType})`);
console.log(`URL: ${url}`);

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('[Binance-WS] Connected');
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    const stream = msg.stream;
    const payload = msg.data;
    const price = payload?.p || payload?.c || payload?.close || 'N/A';
    const ts = payload?.T || payload?.E || Date.now();
    console.log(`[${stream.split('@')[0].toUpperCase()}] ${price} @ ${new Date(ts).toISOString().slice(11,19)}`);
  } catch (e) {
    console.log('[Binance-WS] Parse err:', e.message);
  }
});

ws.on('error', (err) => {
  console.error('[Binance-WS] Error:', err.message);
});

ws.on('close', (code, reason) => {
  console.log(`[Binance-WS] Closed (${code}): ${reason || 'unknown'} - Reconnect 5s...`);
  setTimeout(() => {
    require('child_process').spawn(process.argv[1], process.argv.slice(2), { stdio: 'inherit', detached: true }).unref();
    process.exit();
  }, 5000);
});
