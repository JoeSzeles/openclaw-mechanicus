---
name: binance-btc-feed
description: Real-time BTC/USDT prices via Binance public WebSocket API (aggTrade, ticker, trades). Free, zero-auth, tick-level data (&lt;10ms latency) for IG trading bots, EMA/threshold logic, Polymarket arb, or monitoring when IG Lightstreamer blocked. Use for \"BTC price stream\", \"fast BTC ticks\", \"Binance BTC\", \"BTC WS feed\", \"spot BTC price\".
---

# Binance BTC Feed

Fetch live BTCUSDT spot prices via public WS. Perfect IG CFD proxy (tight spread).

## Quick Usage

Run the persistent WS listener:

```
exec node /home/runner/workspace/skills/binance-btc-feed/scripts/binance-ws.js
```

- Outputs ticks to stdout: price, qty, ts
- Use `process` to manage (poll logs)
- Background: `exec --background`

Streams:
- **@aggTrade**: Aggregated trades (recommended: low noise, tick-level)
- **@trade**: Every trade (high volume)
- **@ticker**: 24h stats + snapshot (lighter)

## IG Bot Integration

Add to your ceo-proxy (ceo-proxy.cjs or ig-bot):

1. Include WS client code from `scripts/binance-ws.js`
2. Fallback if IG stream fails: `if (subError.includes('Invalid account type')) { startBinanceFeed(updatePrice); }`
3. Expose `/api/ig/stream/status` with `streamingSource: \"binance\"`
4. Use for EMA, thresholds vs Polymarket implied.

## Customization

Edit `scripts/binance-ws.js`:
- Change stream: `btcusdt@trade`, `@ticker`, etc.
- Callback: Feed to EMA, alerts, etc.
- Multi-symbol: `btcusdt@aggTrade/ethusdt@aggTrade`

## API Reference

See [references/binance-ws-api.md](references/binance-ws-api.md) for streams, payloads.

**Reconnect**: Auto 5s on close/error.

For one-off price: `web_search \"current BTC price\"` or `/api/ig/prices?epics=CS.D.BITCOIN.CFD.IP`
