---
name: prorealtime-ig-adapter
description: Read ProRealTime code and automatically convert/feed to IG trading bot. Parses indicators/entries/SL/TP into ig-strategy.json config, tests, deploys. Use for \"ProRealTime to IG bot\", \"PRT code to strategy\", \"convert PRT to IG\", \"feed PRT to bot\".
---

# ProRealTime → IG Trading Bot Adapter

Converts ProRealTime (ProBuilder/ProOrder) code to IG bot strategies. Parses code for entry conditions, sizes, SL/TP → maps to ig-strategy.json → deploys/tests.

## Workflow

1. **Read PRT Code:** `read path/to/prt-code.pf`
2. **Parse:** Extract:
   - Entry: BUY/SELLSHORT → direction BUY/SELL
   - Triggers: RSI[14]<30 → entryBelow mid-RSI30 level (fetch live)
   - Size: PositionSize → size
   - SL: SET STOP pLOSS 400 → stopDistance 400
   - TP: SET TARGET pPROFIT 800 → limitDistance 800
   - Indicators: RSI → condition RSI<30
3. **Map to IG:** Create strategy obj → append `ig-strategy.json`
4. **Test:** `exec node skills/bots/ig-trading-bot.cjs --test`
5. **Deploy:** Refresh snapshots, notify bot live.

## Examples

**Input PRT:** RSI scalp → Output: {\"instrument\":\"CS.D.BITCOIN.CFD.IP\",\"name\":\"RSI Scalp\",\"direction\":\"BUY\",\"entryBelow\":68000,\"stopDistance\":400,\"limitDistance\":800,\"size\":0.05}

## Parse Helpers (scripts/parse-prt.js)

Use for complex code:
```
// Pseudo JS parser
const lines = content.split('\\n')
const sizeMatch = lines.find(l => l.includes('PositionSize'))
// etc.
```

## References
- [PROREALTIME_CODE_RULES.md](../PROREALTIME_CODE_RULES.md) — Syntax
- [ig-trading-bot/SKILL.md](../../ig-trading-bot/SKILL.md) — Target bot

**Constraints:** BTC/ETH only (crypto 24/7). Verify tradeable first.