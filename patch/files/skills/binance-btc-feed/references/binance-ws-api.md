# Binance WS API

## Streams
- `wss://stream.binance.com:9443/ws/btcusdt@aggTrade` - Agg trades (p=price, q=qty, T=ts, m=buyerIsMaker)
- `wss://stream.binance.com:9443/ws/btcusdt@trade` - Individual trades
- `wss://stream.binance.com:9443/ws/btcusdt@ticker` - 24h ticker (c=close, o=open, h=high, l=low, v=volume)

## Multi-stream
`/ws/btcusdt@aggTrade/ethusdt@ticker`

## Limits
- 5 incoming/sec
- Reconnect backoff

Docs: https://binance-docs.github.io/apidocs/spot/en/#general-info
