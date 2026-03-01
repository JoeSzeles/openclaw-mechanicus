---
name: binance-stream
description: Real-time streaming for 1000+ Binance instruments (crypto spot/futures, forex/commodities/indices via USDT perps). Public WS, no auth. Streams: aggTrade, ticker, kline, depth. Use for &quot;Binance stream EURUSDT&quot;, &quot;multi-symbol WS&quot;, &quot;live gold prices&quot;, &quot;US30 feed&quot;, IG price fallback.
---

# Binance Multi-Stream

Live data for crypto (BTCUSDT, ETHUSDT+), forex (EURUSDT, GBPUSDT+), gold (XAUUSDT), oil (OILUSDT), indices (US30USDT, SPXUSDT, NAS100USDT).

## Quick Start

Run multi-stream listener:

```
node /home/runner/workspace/skills/binance-stream/scripts/multi-ws.js btcusdt ethusdt xauusdt us30usdt
```

**Spot**: `wss://stream.binance.com:9443`
**Futures**: `wss://fstream.binance.com`

## Symbols Examples

| Category | Examples (lowercase) |
|----------|----------------------|
| Crypto Spot | btcusdt, ethusdt, solusdt |
| Forex Perps | eurusdt, gbpusdt, usdtry, usdcad |
| Commodities | xauusdt (gold), oilusdt (WTI), ngusdt (gas) |
| Indices | us30usdt (Dow), spxusdt (S&amp;P), nas100usdt (Nasdaq) |

Streams: `@aggTrade` (ticks), `@ticker` (24h), `@kline_1m` (candles), `@depth@100ms`

## Usage

- Single: `wss://stream.binance.com:9443/ws/btcusdt@aggTrade`
- Multi: `/stream?streams=btcusdt@aggTrade/xauusdt@ticker`

Background: `exec --background --pty node scripts/multi-ws.js ...`

Poll: `process poll sessionId`

## IG Integration

Fallback in proxy: Switch on IG stream error. Update `/api/ig/stream/status` w/ source=binance.

## Customize

`scripts/multi-ws.js`: Edit streams/symbols.

Ref: [binance-streams.md](references/binance-streams.md)
