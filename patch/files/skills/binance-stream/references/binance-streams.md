# Binance Streams

## Types
- `@aggTrade`: Agg trades (p=price, q=qty, T=ts, m=maker)
- `@trade`: Single trades
- `@ticker`: 24h (c=close, h=high, l=low, v=vol)
- `@miniTicker`: Light price/vol
- `@kline_1m`: Candles [o, h, l, c, v...]
- `@depth@100ms`: Orderbook deltas

## Endpoints
- Spot: wss://stream.binance.com:9443
- USDT Futures: wss://fstream.binance.com
- COIN Futures: wss://dstream.binance.com

## Limits
- 1024 streams/conn
- 5 msg/sec incoming

Full docs: https://binance-docs.github.io/apidocs/spot/en/#payload-websocket-market-streams
https://binance-docs.github.io/apidocs/futures/en/#index

**Symbols**: All lowercase, lowercase pair (btcusdt, xauusdt)
