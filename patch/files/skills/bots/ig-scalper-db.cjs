const { Pool } = require("pg");
const fs = require("fs");
const pathMod = require("path");
const os = require("os");

const DB_URL = process.env.DATABASE_URL;
const pool = DB_URL ? new Pool({ connectionString: DB_URL }) : null;

const CSV_DIR = pathMod.join(
  process.env.OPENCLAW_HOME || process.env.HOME || process.env.USERPROFILE || os.homedir(),
  ".openclaw", "db"
);

function _ensureCsvDir() {
  if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR, { recursive: true });
}

function _csvPath(table) { return pathMod.join(CSV_DIR, table + ".csv"); }

function _csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function _csvParseLine(line) {
  const fields = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) { fields.push(""); break; }
    if (line[i] === '"') {
      let val = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { val += '"'; i += 2; }
          else { i++; break; }
        } else { val += line[i]; i++; }
      }
      fields.push(val);
      if (i < line.length && line[i] === ",") i++;
    } else {
      let end = line.indexOf(",", i);
      if (end === -1) { fields.push(line.slice(i)); break; }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

function _csvParseValue(val) {
  if (val === "" || val === "null") return null;
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  if ((val.startsWith("{") && val.endsWith("}")) || (val.startsWith("[") && val.endsWith("]"))) {
    try { return JSON.parse(val); } catch (_) {}
  }
  return val;
}

function _csvRead(table) {
  const fp = _csvPath(table);
  if (!fs.existsSync(fp)) return [];
  const raw = fs.readFileSync(fp, "utf8").trim();
  if (!raw) return [];
  const records = _csvParseRecords(raw);
  if (records.length < 2) return [];
  const headers = records[0];
  const rows = [];
  for (let i = 1; i < records.length; i++) {
    const vals = records[i];
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = _csvParseValue(vals[j] || "");
    }
    rows.push(row);
  }
  return rows;
}

function _csvParseRecords(raw) {
  const records = [];
  let fields = [];
  let field = "";
  let inQuote = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (inQuote) {
      if (ch === '"') {
        if (i + 1 < raw.length && raw[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuote = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
        i++;
      } else if (ch === ',') {
        fields.push(field);
        field = "";
        i++;
      } else if (ch === '\r') {
        i++;
      } else if (ch === '\n') {
        fields.push(field);
        field = "";
        records.push(fields);
        fields = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }
  if (field || fields.length > 0) {
    fields.push(field);
    records.push(fields);
  }
  return records;
}

function _csvWrite(table, rows, headers) {
  _ensureCsvDir();
  if (!rows.length && !headers) { fs.writeFileSync(_csvPath(table), ""); return; }
  if (!headers) headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map(h => _csvEscape(row[h])).join(","));
  }
  fs.writeFileSync(_csvPath(table), lines.join("\n") + "\n");
}

function _csvAppend(table, row, headers) {
  _ensureCsvDir();
  const fp = _csvPath(table);
  if (!fs.existsSync(fp) || fs.readFileSync(fp, "utf8").trim() === "") {
    fs.writeFileSync(fp, headers.join(",") + "\n" + headers.map(h => _csvEscape(row[h])).join(",") + "\n");
  } else {
    fs.appendFileSync(fp, headers.map(h => _csvEscape(row[h])).join(",") + "\n");
  }
}

let _csvNextId = {};
function _csvAutoId(table) {
  if (!_csvNextId[table]) {
    const rows = _csvRead(table);
    let max = 0;
    for (const r of rows) { if (r.id && typeof r.id === "number" && r.id > max) max = r.id; }
    _csvNextId[table] = max;
  }
  _csvNextId[table]++;
  return _csvNextId[table];
}

function isAvailable() {
  return !!pool;
}

function camel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[ck] = v;
  }
  return out;
}

async function query(sql, params) {
  if (!pool) {
    const err = new Error("DATABASE_URL not configured — database features unavailable");
    err.code = "NO_DATABASE";
    throw err;
  }
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } finally {
    client.release();
  }
}

const CONFIG_DEFAULTS = {
  id: 1, enabled: false, budget: 1000, max_drawdown: 200, max_margin_pct: 50,
  break_even_buffer: 0, drawdown_tripped: false,
  demo_mode: true, demo_reject_pct: 5, demo_slippage_min: 0.1, demo_slippage_max: 0.5,
  updated_at: null
};

const CONFIG_HEADERS = Object.keys(CONFIG_DEFAULTS);

async function getConfig() {
  if (!pool) {
    const rows = _csvRead("scalper_config");
    if (rows.length === 0) {
      const def = { ...CONFIG_DEFAULTS, updated_at: new Date().toISOString() };
      _csvWrite("scalper_config", [def], CONFIG_HEADERS);
      return camel(def);
    }
    return camel(rows[0]);
  }
  const res = await query("SELECT * FROM scalper_config WHERE id = 1");
  if (res.rows.length === 0) {
    await query(`INSERT INTO scalper_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
    const res2 = await query("SELECT * FROM scalper_config WHERE id = 1");
    return camel(res2.rows[0]);
  }
  return camel(res.rows[0]);
}

async function updateConfig(updates) {
  const camelToSnake = {
    enabled: "enabled", budget: "budget", maxDrawdown: "max_drawdown",
    maxMarginPct: "max_margin_pct", breakEvenBuffer: "break_even_buffer",
    drawdownTripped: "drawdown_tripped", _drawdownTripped: "drawdown_tripped",
    demoMode: "demo_mode", demoRejectPct: "demo_reject_pct",
    demoSlippageMin: "demo_slippage_min", demoSlippageMax: "demo_slippage_max"
  };
  const allowed = ["enabled", "budget", "max_drawdown", "max_margin_pct", "break_even_buffer", "drawdown_tripped", "demo_mode", "demo_reject_pct", "demo_slippage_min", "demo_slippage_max"];

  if (!pool) {
    const rows = _csvRead("scalper_config");
    const cfg = rows.length > 0 ? rows[0] : { ...CONFIG_DEFAULTS };
    for (const [k, v] of Object.entries(updates)) {
      const col = camelToSnake[k] || k;
      if (!allowed.includes(col)) continue;
      cfg[col] = v;
    }
    cfg.updated_at = new Date().toISOString();
    _csvWrite("scalper_config", [cfg], CONFIG_HEADERS);
    return camel(cfg);
  }

  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(updates)) {
    const col = camelToSnake[k] || k;
    if (!allowed.includes(col)) continue;
    sets.push(`${col} = $${i}`);
    vals.push(v);
    i++;
  }
  if (sets.length === 0) return getConfig();
  sets.push(`updated_at = NOW()`);
  await query(`UPDATE scalper_config SET ${sets.join(", ")} WHERE id = 1`, vals);
  return getConfig();
}

const STRATEGY_COLS = [
  "instrument", "name", "direction", "enabled", "size",
  "stop_distance", "limit_distance", "min_momentum_pct",
  "cooldown_ms", "tick_window", "max_open_positions",
  "min_size", "max_size", "profit_target", "trailing_stop", "warmup_ms",
  "rsi_enabled", "rsi_period", "rsi_overbought", "rsi_oversold",
  "ema_enabled", "ema_short", "ema_long",
  "macd_enabled", "macd_fast", "macd_slow", "macd_signal",
  "contract_size", "deal_id", "timeframe",
  "strategy_type",
  "adx_enabled", "adx_period", "adx_threshold",
  "bollinger_enabled", "bollinger_period", "bollinger_sd",
  "stochastic_enabled", "stochastic_k", "stochastic_d", "stochastic_ob", "stochastic_os",
  "atr_enabled", "atr_period", "atr_multiplier",
  "roc_enabled", "roc_period", "roc_threshold",
  "cci_enabled", "cci_period", "cci_threshold",
  "williams_enabled", "williams_period",
  "keltner_enabled", "keltner_period", "keltner_atr_mult",
  "ichimoku_enabled", "ichimoku_tenkan", "ichimoku_kijun", "ichimoku_senkou",
  "parabolic_sar_enabled", "sar_accel", "sar_max",
  "aroon_enabled", "aroon_period",
  "obv_enabled", "vwap_enabled",
  "zscore_enabled", "zscore_period", "zscore_threshold",
  "fib_enabled", "fib_lookback",
  "grid_levels", "grid_spacing",
  "kelly_enabled", "sentiment_enabled"
];

const STRATEGY_CSV_HEADERS = ["id", ...STRATEGY_COLS, "created_at", "updated_at"];

const CAMEL_TO_SNAKE = {};
for (const col of STRATEGY_COLS) {
  const ck = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  CAMEL_TO_SNAKE[ck] = col;
  CAMEL_TO_SNAKE[col] = col;
}

function resolveCol(key) {
  return CAMEL_TO_SNAKE[key] || null;
}

async function getStrategies() {
  if (!pool) {
    return _csvRead("scalper_strategies").map(camel);
  }
  const res = await query("SELECT * FROM scalper_strategies ORDER BY id");
  return res.rows.map(camel);
}

async function getStrategy(id) {
  if (!pool) {
    const rows = _csvRead("scalper_strategies");
    const r = rows.find(r => r.id === parseInt(id, 10));
    return r ? camel(r) : null;
  }
  const res = await query("SELECT * FROM scalper_strategies WHERE id = $1", [id]);
  return camel(res.rows[0]);
}

async function addStrategy(data) {
  if (!pool) {
    const row = { id: _csvAutoId("scalper_strategies"), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) {
      const col = resolveCol(k);
      if (col) row[col] = v;
    }
    const rows = _csvRead("scalper_strategies");
    rows.push(row);
    _csvWrite("scalper_strategies", rows, STRATEGY_CSV_HEADERS);
    return camel(row);
  }
  const cols = [];
  const vals = [];
  const placeholders = [];
  let i = 1;
  for (const [k, v] of Object.entries(data)) {
    const col = resolveCol(k);
    if (!col) continue;
    cols.push(col);
    vals.push(v);
    placeholders.push(`$${i}`);
    i++;
  }
  if (cols.length === 0) throw new Error("No valid fields provided");
  const res = await query(
    `INSERT INTO scalper_strategies (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    vals
  );
  return camel(res.rows[0]);
}

async function updateStrategy(id, data) {
  if (!pool) {
    const rows = _csvRead("scalper_strategies");
    const idx = rows.findIndex(r => r.id === parseInt(id, 10));
    if (idx === -1) return null;
    for (const [k, v] of Object.entries(data)) {
      const col = resolveCol(k);
      if (col) rows[idx][col] = v;
    }
    rows[idx].updated_at = new Date().toISOString();
    _csvWrite("scalper_strategies", rows, STRATEGY_CSV_HEADERS);
    return camel(rows[idx]);
  }
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(data)) {
    const col = resolveCol(k);
    if (!col) continue;
    sets.push(`${col} = $${i}`);
    vals.push(v);
    i++;
  }
  if (sets.length === 0) return getStrategy(id);
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  await query(`UPDATE scalper_strategies SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return getStrategy(id);
}

async function deleteStrategy(id) {
  if (!pool) {
    const rows = _csvRead("scalper_strategies").filter(r => r.id !== parseInt(id, 10));
    _csvWrite("scalper_strategies", rows, STRATEGY_CSV_HEADERS);
    return;
  }
  await query("DELETE FROM scalper_strategies WHERE id = $1", [id]);
}

async function toggleStrategy(id) {
  if (!pool) {
    const rows = _csvRead("scalper_strategies");
    const idx = rows.findIndex(r => r.id === parseInt(id, 10));
    if (idx === -1) return null;
    rows[idx].enabled = !rows[idx].enabled;
    rows[idx].updated_at = new Date().toISOString();
    _csvWrite("scalper_strategies", rows, STRATEGY_CSV_HEADERS);
    return camel(rows[idx]);
  }
  await query("UPDATE scalper_strategies SET enabled = NOT enabled, updated_at = NOW() WHERE id = $1", [id]);
  return getStrategy(id);
}

const TRADE_HEADERS = ["id", "deal_id", "epic", "direction", "size", "entry_price", "exit_price", "pnl", "type", "strategy_name", "opened_at", "closed_at", "created_at"];

async function logTrade(trade) {
  const camelMap = {
    dealId: "deal_id", epic: "epic", direction: "direction", size: "size",
    entryPrice: "entry_price", entry: "entry_price",
    exitPrice: "exit_price", exit: "exit_price",
    pnl: "pnl", type: "type",
    strategyName: "strategy_name",
    openedAt: "opened_at", closedAt: "closed_at"
  };

  if (!pool) {
    const row = { id: _csvAutoId("scalper_trades"), created_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(trade)) {
      const col = camelMap[k] || k;
      if (TRADE_HEADERS.includes(col)) row[col] = v;
    }
    _csvAppend("scalper_trades", row, TRADE_HEADERS);
    return camel(row);
  }

  const cols = [];
  const vals = [];
  const placeholders = [];
  let i = 1;
  for (const [k, v] of Object.entries(trade)) {
    const col = camelMap[k] || k;
    if (!["deal_id","epic","direction","size","entry_price","exit_price","pnl","type","strategy_name","opened_at","closed_at"].includes(col)) continue;
    cols.push(col);
    vals.push(v);
    placeholders.push(`$${i}`);
    i++;
  }
  if (cols.length === 0) return null;
  const res = await query(
    `INSERT INTO scalper_trades (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    vals
  );
  return camel(res.rows[0]);
}

async function getTrades(limit = 100) {
  if (!pool) {
    const rows = _csvRead("scalper_trades");
    rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return rows.slice(0, limit).map(camel);
  }
  const res = await query("SELECT * FROM scalper_trades ORDER BY created_at DESC LIMIT $1", [limit]);
  return res.rows.map(camel);
}

async function getTradeStats() {
  if (!pool) {
    const rows = _csvRead("scalper_trades");
    const closed = rows.filter(r => r.type === "CLOSE");
    const wins = closed.filter(r => (parseFloat(r.pnl) || 0) > 0).length;
    const losses = closed.length - wins;
    const totalPnl = rows.reduce((s, r) => s + (parseFloat(r.pnl) || 0), 0);
    return {
      totalPnl: Math.round(totalPnl * 100) / 100,
      wins, losses,
      totalClosed: closed.length,
      winRate: closed.length > 0 ? ((wins / closed.length) * 100).toFixed(1) : "0.0"
    };
  }
  const res = await query(`
    SELECT
      COALESCE(SUM(pnl), 0) as total_pnl,
      COUNT(*) FILTER (WHERE type = 'CLOSE' AND pnl > 0) as wins,
      COUNT(*) FILTER (WHERE type = 'CLOSE' AND pnl <= 0) as losses,
      COUNT(*) FILTER (WHERE type = 'CLOSE') as total_closed
    FROM scalper_trades
  `);
  const row = res.rows[0];
  const total = parseInt(row.total_closed) || 0;
  const wins = parseInt(row.wins) || 0;
  return {
    totalPnl: parseFloat(row.total_pnl) || 0,
    wins,
    losses: parseInt(row.losses) || 0,
    totalClosed: total,
    winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0"
  };
}

async function clearTrades() {
  if (!pool) {
    _csvWrite("scalper_trades", [], TRADE_HEADERS);
    return { ok: true, message: "All trade records cleared" };
  }
  await query("DELETE FROM scalper_trades");
  return { ok: true, message: "All trade records cleared" };
}

const BACKTEST_HEADERS = ["id", "strategy_id", "timeframe", "candle_count", "total_trades", "win_count", "loss_count", "win_rate", "total_pnl", "max_drawdown", "sharpe_ratio", "avg_win", "avg_loss", "trades", "config_snapshot", "created_at", "batch_id", "instrument", "strategy_type_key", "cycle_number", "iteration_number", "optimization_batch_id"];

async function saveBacktest(data) {
  if (!pool) {
    const row = {
      id: _csvAutoId("scalper_backtests"),
      strategy_id: data.strategyId, timeframe: data.timeframe, candle_count: data.candleCount,
      total_trades: data.totalTrades, win_count: data.winCount, loss_count: data.lossCount,
      win_rate: data.winRate, total_pnl: data.totalPnl, max_drawdown: data.maxDrawdown,
      sharpe_ratio: data.sharpeRatio, avg_win: data.avgWin, avg_loss: data.avgLoss,
      trades: data.trades, config_snapshot: data.configSnapshot,
      created_at: new Date().toISOString(), batch_id: null, instrument: null,
      strategy_type_key: null, cycle_number: null, iteration_number: null, optimization_batch_id: null
    };
    _csvAppend("scalper_backtests", row, BACKTEST_HEADERS);
    return camel(row);
  }
  const res = await query(
    `INSERT INTO scalper_backtests (strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl, max_drawdown, sharpe_ratio, avg_win, avg_loss, trades, config_snapshot)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [data.strategyId, data.timeframe, data.candleCount, data.totalTrades, data.winCount, data.lossCount,
     data.winRate, data.totalPnl, data.maxDrawdown, data.sharpeRatio, data.avgWin, data.avgLoss,
     JSON.stringify(data.trades), JSON.stringify(data.configSnapshot)]
  );
  return camel(res.rows[0]);
}

async function getBacktests(strategyId, limit = 20) {
  if (!pool) {
    const rows = _csvRead("scalper_backtests")
      .filter(r => r.strategy_id === parseInt(strategyId, 10))
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, limit);
    return rows.map(r => {
      const c = camel(r);
      delete c.trades;
      delete c.configSnapshot;
      return c;
    });
  }
  const res = await query(
    "SELECT id, strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl, max_drawdown, sharpe_ratio, avg_win, avg_loss, created_at FROM scalper_backtests WHERE strategy_id = $1 ORDER BY created_at DESC LIMIT $2",
    [strategyId, limit]
  );
  return res.rows.map(camel);
}

async function getBacktest(id) {
  if (!pool) {
    const rows = _csvRead("scalper_backtests");
    const r = rows.find(r => r.id === parseInt(id, 10));
    if (!r) return null;
    const row = camel(r);
    if (row.configSnapshot && typeof row.configSnapshot === "string") {
      try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
    }
    if (row.trades && typeof row.trades === "string") {
      try { row.trades = JSON.parse(row.trades); } catch (_) {}
    }
    return row;
  }
  const res = await query("SELECT * FROM scalper_backtests WHERE id = $1", [id]);
  const row = camel(res.rows[0]);
  if (row && row.configSnapshot && typeof row.configSnapshot === 'string') {
    try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
  }
  return row;
}

async function deleteBacktests(strategyId) {
  if (!pool) {
    const rows = _csvRead("scalper_backtests").filter(r => r.strategy_id !== parseInt(strategyId, 10));
    _csvWrite("scalper_backtests", rows, BACKTEST_HEADERS);
    return { ok: true, deleted: 0 };
  }
  const res = await query("DELETE FROM scalper_backtests WHERE strategy_id = $1", [strategyId]);
  return { ok: true, deleted: res.rowCount };
}

async function getAllBacktests(limit = 50) {
  if (!pool) {
    const bts = _csvRead("scalper_backtests");
    const strats = _csvRead("scalper_strategies");
    const stratMap = {};
    for (const s of strats) stratMap[s.id] = s;
    bts.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return bts.slice(0, limit).map(r => {
      const row = camel(r);
      const s = stratMap[r.strategy_id];
      if (s) { row.strategyName = s.name; row.stratInstrument = s.instrument; row.strategyType = s.strategy_type; }
      delete row.trades;
      delete row.configSnapshot;
      return row;
    });
  }
  const res = await query(
    `SELECT b.id, b.strategy_id, b.timeframe, b.candle_count, b.total_trades, b.win_count, b.loss_count,
            b.win_rate, b.total_pnl, b.max_drawdown, b.sharpe_ratio, b.avg_win, b.avg_loss, b.created_at,
            b.batch_id, b.instrument, b.strategy_type_key,
            s.name as strategy_name, s.instrument as strat_instrument, s.strategy_type
     FROM scalper_backtests b
     LEFT JOIN scalper_strategies s ON b.strategy_id = s.id
     ORDER BY b.created_at DESC LIMIT $1`,
    [limit]
  );
  return res.rows.map(camel);
}

async function deleteAllBacktests() {
  if (!pool) {
    _csvWrite("scalper_backtests", [], BACKTEST_HEADERS);
    return { ok: true };
  }
  await query("DELETE FROM scalper_backtests");
  return { ok: true };
}

let _priceCandlesReady = false;
async function _ensurePriceCandles() {
  if (_priceCandlesReady) return;
  await ensurePriceCandlesTable();
  _priceCandlesReady = true;
}

const CANDLE_HEADERS = ["epic", "resolution", "ts", "open", "high", "low", "close", "volume"];

async function ensurePriceCandlesTable() {
  if (!pool) { _priceCandlesReady = true; return; }
  await query(`
    CREATE TABLE IF NOT EXISTS price_candles (
      epic VARCHAR(60) NOT NULL,
      resolution VARCHAR(20) NOT NULL,
      ts BIGINT NOT NULL,
      open DOUBLE PRECISION NOT NULL,
      high DOUBLE PRECISION NOT NULL,
      low DOUBLE PRECISION NOT NULL,
      close DOUBLE PRECISION NOT NULL,
      volume INTEGER DEFAULT 0,
      PRIMARY KEY (epic, resolution, ts)
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_price_candles_lookup ON price_candles (epic, resolution, ts DESC)`);
  _priceCandlesReady = true;
}

function _candleFile(epic, resolution) {
  const safe = (epic + "_" + resolution).replace(/[^a-zA-Z0-9_.-]/g, "_");
  return pathMod.join(CSV_DIR, "candles_" + safe + ".csv");
}

function _readCandles(epic, resolution) {
  const fp = _candleFile(epic, resolution);
  if (!fs.existsSync(fp)) return [];
  const raw = fs.readFileSync(fp, "utf8").trim();
  if (!raw) return [];
  const lines = raw.split("\n");
  if (lines.length < 2) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 6) continue;
    rows.push({
      ts: parseInt(parts[0], 10),
      open: parseFloat(parts[1]),
      high: parseFloat(parts[2]),
      low: parseFloat(parts[3]),
      close: parseFloat(parts[4]),
      volume: parseInt(parts[5], 10) || 0
    });
  }
  return rows;
}

function _writeCandles(epic, resolution, candles) {
  _ensureCsvDir();
  const fp = _candleFile(epic, resolution);
  const lines = ["ts,open,high,low,close,volume"];
  for (const c of candles) {
    lines.push([c.ts, c.open, c.high, c.low, c.close, c.volume || 0].join(","));
  }
  fs.writeFileSync(fp, lines.join("\n") + "\n");
}

async function getStoredCandles(epic, resolution, limit) {
  if (!pool) {
    const candles = _readCandles(epic, resolution);
    candles.sort((a, b) => a.ts - b.ts);
    return candles.slice(-limit);
  }
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts, open, high, low, close, volume FROM price_candles WHERE epic = $1 AND resolution = $2 ORDER BY ts DESC LIMIT $3",
    [epic, resolution, limit]
  );
  return res.rows.reverse();
}

async function getLatestCandleTs(epic, resolution) {
  if (!pool) {
    const candles = _readCandles(epic, resolution);
    if (candles.length === 0) return null;
    return Math.max(...candles.map(c => c.ts));
  }
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts FROM price_candles WHERE epic = $1 AND resolution = $2 ORDER BY ts DESC LIMIT 1",
    [epic, resolution]
  );
  return res.rows.length > 0 ? parseInt(res.rows[0].ts) : null;
}

async function getCandleCount(epic, resolution) {
  if (!pool) {
    return _readCandles(epic, resolution).length;
  }
  const res = await query(
    "SELECT COUNT(*)::int as cnt FROM price_candles WHERE epic = $1 AND resolution = $2",
    [epic, resolution]
  );
  return res.rows[0].cnt;
}

async function storeCandles(epic, resolution, candles) {
  if (!candles || candles.length === 0) return 0;
  if (!pool) {
    const existing = _readCandles(epic, resolution);
    const tsSet = new Set(existing.map(c => c.ts));
    let added = 0;
    for (const c of candles) {
      if (!tsSet.has(c.ts)) {
        existing.push({ ts: c.ts, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0 });
        tsSet.add(c.ts);
        added++;
      }
    }
    if (added > 0) {
      existing.sort((a, b) => a.ts - b.ts);
      _writeCandles(epic, resolution, existing);
    }
    return added;
  }
  await _ensurePriceCandles();
  const BATCH = 500;
  let stored = 0;
  for (let b = 0; b < candles.length; b += BATCH) {
    const batch = candles.slice(b, b + BATCH);
    const vals = [];
    const placeholders = [];
    let idx = 1;
    for (const c of batch) {
      placeholders.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7})`);
      vals.push(epic, resolution, c.ts, c.open, c.high, c.low, c.close, c.volume || 0);
      idx += 8;
    }
    const res = await query(
      `INSERT INTO price_candles (epic, resolution, ts, open, high, low, close, volume) VALUES ${placeholders.join(",")} ON CONFLICT (epic, resolution, ts) DO NOTHING`,
      vals
    );
    stored += res.rowCount;
  }
  return stored;
}

async function getStoredCandlesRange(epic, resolution, fromTs, toTs) {
  if (!pool) {
    const candles = _readCandles(epic, resolution);
    return candles.filter(c => c.ts >= fromTs && c.ts <= toTs).sort((a, b) => a.ts - b.ts);
  }
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts, open, high, low, close, volume FROM price_candles WHERE epic = $1 AND resolution = $2 AND ts >= $3 AND ts <= $4 ORDER BY ts ASC",
    [epic, resolution, fromTs, toTs]
  );
  return res.rows;
}

const AGENT_WORKSPACE_MAP = {
  CEO: pathMod.join(process.cwd(), ".openclaw", "workspace"),
  IG: pathMod.join(process.cwd(), ".openclaw", "workspace-ig")
};

function resolveAgentWorkspace(agentId) {
  return AGENT_WORKSPACE_MAP[agentId.toUpperCase()] || AGENT_WORKSPACE_MAP[agentId] || null;
}

let _agentTablesReady = false;
async function _ensureAgentTables() {
  if (_agentTablesReady) return;
  if (!pool) { _agentTablesReady = true; return; }
  await query(`
    CREATE TABLE IF NOT EXISTS agent_backups (
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(60) NOT NULL,
      backup_name VARCHAR(200),
      files JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS agent_memory (
      agent_id VARCHAR(60) NOT NULL,
      entry_type VARCHAR(20) NOT NULL,
      entry_date DATE NOT NULL DEFAULT '1970-01-01',
      content TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (agent_id, entry_type, entry_date)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS agent_subconscious (
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(60) NOT NULL,
      category VARCHAR(60) NOT NULL,
      key VARCHAR(200) NOT NULL,
      value TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (agent_id, category, key)
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_agent_backups_agent ON agent_backups (agent_id, created_at DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory (agent_id, entry_type)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agent_subconscious_agent ON agent_subconscious (agent_id, category)`);
  _agentTablesReady = true;
}

const BACKUP_HEADERS = ["id", "agent_id", "backup_name", "files", "created_at"];

async function backupAgent(agentId, backupName) {
  const wsDir = resolveAgentWorkspace(agentId);
  if (!wsDir) throw new Error("Unknown agent: " + agentId);
  const files = {};
  try {
    const entries = fs.readdirSync(wsDir);
    for (const f of entries) {
      if (!f.endsWith(".md")) continue;
      try { files[f] = fs.readFileSync(pathMod.join(wsDir, f), "utf-8"); } catch (_) {}
    }
    const memDir = pathMod.join(wsDir, "memory");
    if (fs.existsSync(memDir)) {
      const memEntries = fs.readdirSync(memDir);
      for (const f of memEntries) {
        if (!f.endsWith(".md")) continue;
        try { files["memory/" + f] = fs.readFileSync(pathMod.join(memDir, f), "utf-8"); } catch (_) {}
      }
    }
  } catch (e) {
    throw new Error("Cannot read workspace: " + e.message);
  }

  if (!pool) {
    await _ensureAgentTables();
    const row = {
      id: _csvAutoId("agent_backups"),
      agent_id: agentId.toUpperCase(),
      backup_name: backupName || "Auto backup",
      files: files,
      created_at: new Date().toISOString()
    };
    _csvAppend("agent_backups", row, BACKUP_HEADERS);
    return { id: row.id, agentId: row.agent_id, backupName: row.backup_name, fileCount: Object.keys(files).length, createdAt: row.created_at };
  }

  await _ensureAgentTables();
  const res = await query(
    "INSERT INTO agent_backups (agent_id, backup_name, files) VALUES ($1, $2, $3) RETURNING id, agent_id, backup_name, created_at",
    [agentId.toUpperCase(), backupName || "Auto backup", JSON.stringify(files)]
  );
  const row = res.rows[0];
  return { id: row.id, agentId: row.agent_id, backupName: row.backup_name, fileCount: Object.keys(files).length, createdAt: row.created_at };
}

async function listAgentBackups(agentId) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_backups").filter(r => r.agent_id === agentId.toUpperCase());
    rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return rows.map(r => ({
      id: r.id, agentId: r.agent_id, backupName: r.backup_name,
      fileCount: r.files ? (typeof r.files === "object" ? Object.keys(r.files).length : 0) : 0,
      createdAt: r.created_at
    }));
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT id, agent_id, backup_name, files, created_at FROM agent_backups WHERE agent_id = $1 ORDER BY created_at DESC",
    [agentId.toUpperCase()]
  );
  return res.rows.map(r => ({
    id: r.id, agentId: r.agent_id, backupName: r.backup_name,
    fileCount: r.files ? Object.keys(r.files).length : 0, createdAt: r.created_at
  }));
}

async function restoreAgentBackup(backupId) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_backups");
    const row = rows.find(r => r.id === parseInt(backupId, 10));
    if (!row) throw new Error("Backup not found: " + backupId);
    const wsDir = resolveAgentWorkspace(row.agent_id);
    if (!wsDir) throw new Error("Unknown agent: " + row.agent_id);
    const files = typeof row.files === "string" ? JSON.parse(row.files) : (row.files || {});
    let restored = 0;
    for (const [filename, content] of Object.entries(files)) {
      const filePath = pathMod.join(wsDir, filename);
      const dir = pathMod.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content, "utf-8");
      restored++;
    }
    return { ok: true, agentId: row.agent_id, backupName: row.backup_name, filesRestored: restored };
  }
  await _ensureAgentTables();
  const res = await query("SELECT * FROM agent_backups WHERE id = $1", [backupId]);
  if (res.rows.length === 0) throw new Error("Backup not found: " + backupId);
  const row = res.rows[0];
  const wsDir = resolveAgentWorkspace(row.agent_id);
  if (!wsDir) throw new Error("Unknown agent: " + row.agent_id);
  const files = typeof row.files === "string" ? JSON.parse(row.files) : row.files;
  let restored = 0;
  for (const [filename, content] of Object.entries(files)) {
    const filePath = pathMod.join(wsDir, filename);
    const dir = pathMod.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    restored++;
  }
  return { ok: true, agentId: row.agent_id, backupName: row.backup_name, filesRestored: restored };
}

async function deleteAgentBackup(backupId) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_backups").filter(r => r.id !== parseInt(backupId, 10));
    _csvWrite("agent_backups", rows, BACKUP_HEADERS);
    return { ok: true };
  }
  await _ensureAgentTables();
  await query("DELETE FROM agent_backups WHERE id = $1", [backupId]);
  return { ok: true };
}

const MEMORY_HEADERS = ["agent_id", "entry_type", "entry_date", "content", "updated_at"];

async function getAgentMemory(agentId) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_memory");
    const r = rows.find(r => r.agent_id === agentId.toUpperCase() && r.entry_type === "long_term");
    return r ? { content: r.content || "", updatedAt: r.updated_at } : { content: "", updatedAt: null };
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT content, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'long_term' LIMIT 1",
    [agentId.toUpperCase()]
  );
  return res.rows.length > 0 ? { content: res.rows[0].content, updatedAt: res.rows[0].updated_at } : { content: "", updatedAt: null };
}

async function setAgentMemory(agentId, content) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_memory");
    const idx = rows.findIndex(r => r.agent_id === agentId.toUpperCase() && r.entry_type === "long_term");
    const entry = { agent_id: agentId.toUpperCase(), entry_type: "long_term", entry_date: "1970-01-01", content, updated_at: new Date().toISOString() };
    if (idx >= 0) rows[idx] = entry; else rows.push(entry);
    _csvWrite("agent_memory", rows, MEMORY_HEADERS);
    return { ok: true };
  }
  await _ensureAgentTables();
  await query(
    `INSERT INTO agent_memory (agent_id, entry_type, entry_date, content, updated_at)
     VALUES ($1, 'long_term', '1970-01-01', $2, NOW())
     ON CONFLICT (agent_id, entry_type, entry_date) DO UPDATE SET content = $2, updated_at = NOW()`,
    [agentId.toUpperCase(), content]
  );
  return { ok: true };
}

async function getDailyMemory(agentId, date) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_memory");
    const r = rows.find(r => r.agent_id === agentId.toUpperCase() && r.entry_type === "daily" && r.entry_date === date);
    return r ? { content: r.content || "", updatedAt: r.updated_at } : { content: "", updatedAt: null };
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT content, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'daily' AND entry_date = $2",
    [agentId.toUpperCase(), date]
  );
  return res.rows.length > 0 ? { content: res.rows[0].content, updatedAt: res.rows[0].updated_at } : { content: "", updatedAt: null };
}

async function setDailyMemory(agentId, date, content) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_memory");
    const idx = rows.findIndex(r => r.agent_id === agentId.toUpperCase() && r.entry_type === "daily" && r.entry_date === date);
    const entry = { agent_id: agentId.toUpperCase(), entry_type: "daily", entry_date: date, content, updated_at: new Date().toISOString() };
    if (idx >= 0) rows[idx] = entry; else rows.push(entry);
    _csvWrite("agent_memory", rows, MEMORY_HEADERS);
    return { ok: true };
  }
  await _ensureAgentTables();
  await query(
    `INSERT INTO agent_memory (agent_id, entry_type, entry_date, content, updated_at)
     VALUES ($1, 'daily', $2, $3, NOW())
     ON CONFLICT (agent_id, entry_type, entry_date) DO UPDATE SET content = $3, updated_at = NOW()`,
    [agentId.toUpperCase(), date, content]
  );
  return { ok: true };
}

async function listDailyMemories(agentId, limit) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_memory")
      .filter(r => r.agent_id === agentId.toUpperCase() && r.entry_type === "daily")
      .sort((a, b) => (b.entry_date || "").localeCompare(a.entry_date || ""))
      .slice(0, limit || 30);
    return rows.map(r => ({ date: r.entry_date, preview: (r.content || "").slice(0, 200), updatedAt: r.updated_at }));
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT entry_date, LEFT(content, 200) as preview, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'daily' ORDER BY entry_date DESC LIMIT $2",
    [agentId.toUpperCase(), limit || 30]
  );
  return res.rows.map(r => ({ date: r.entry_date, preview: r.preview, updatedAt: r.updated_at }));
}

async function searchMemory(agentId, searchTerm) {
  if (!pool) {
    await _ensureAgentTables();
    const term = searchTerm.toLowerCase();
    const rows = _csvRead("agent_memory")
      .filter(r => r.agent_id === agentId.toUpperCase() && (r.content || "").toLowerCase().includes(term))
      .slice(0, 20);
    return rows.map(r => ({ entryType: r.entry_type, date: r.entry_date, content: r.content, updatedAt: r.updated_at }));
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT entry_type, entry_date, content, updated_at FROM agent_memory WHERE agent_id = $1 AND content ILIKE $2 ORDER BY updated_at DESC LIMIT 20",
    [agentId.toUpperCase(), "%" + searchTerm + "%"]
  );
  return res.rows.map(r => ({ entryType: r.entry_type, date: r.entry_date, content: r.content, updatedAt: r.updated_at }));
}

const SUBCONSCIOUS_CATEGORIES = ["likes", "dislikes", "wants", "hopes", "wishes", "fears", "shadow", "observations", "notes", "dreams"];
const SUB_HEADERS = ["id", "agent_id", "category", "key", "value", "created_at", "updated_at"];

async function setSubconscious(agentId, category, key, value) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_subconscious");
    const idx = rows.findIndex(r => r.agent_id === agentId.toUpperCase() && r.category === category && r.key === key);
    if (idx >= 0) {
      rows[idx].value = value;
      rows[idx].updated_at = new Date().toISOString();
    } else {
      rows.push({ id: _csvAutoId("agent_subconscious"), agent_id: agentId.toUpperCase(), category, key, value, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    _csvWrite("agent_subconscious", rows, SUB_HEADERS);
    return { ok: true };
  }
  await _ensureAgentTables();
  await query(
    `INSERT INTO agent_subconscious (agent_id, category, key, value, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (agent_id, category, key) DO UPDATE SET value = $4, updated_at = NOW()`,
    [agentId.toUpperCase(), category, key, value]
  );
  return { ok: true };
}

async function getSubconscious(agentId, category) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_subconscious")
      .filter(r => r.agent_id === agentId.toUpperCase() && r.category === category)
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    return rows.map(r => ({ key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at }));
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT key, value, created_at, updated_at FROM agent_subconscious WHERE agent_id = $1 AND category = $2 ORDER BY created_at ASC",
    [agentId.toUpperCase(), category]
  );
  return res.rows.map(r => ({ key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at }));
}

async function getSubconsciousEntry(agentId, category, key) {
  if (!pool) {
    await _ensureAgentTables();
    const r = _csvRead("agent_subconscious").find(r => r.agent_id === agentId.toUpperCase() && r.category === category && r.key === key);
    return r ? { key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at } : null;
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT key, value, created_at, updated_at FROM agent_subconscious WHERE agent_id = $1 AND category = $2 AND key = $3",
    [agentId.toUpperCase(), category, key]
  );
  return res.rows.length > 0 ? { key: res.rows[0].key, value: res.rows[0].value, createdAt: res.rows[0].created_at, updatedAt: res.rows[0].updated_at } : null;
}

async function deleteSubconscious(agentId, category, key) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_subconscious").filter(r => !(r.agent_id === agentId.toUpperCase() && r.category === category && r.key === key));
    _csvWrite("agent_subconscious", rows, SUB_HEADERS);
    return { ok: true };
  }
  await _ensureAgentTables();
  await query("DELETE FROM agent_subconscious WHERE agent_id = $1 AND category = $2 AND key = $3", [agentId.toUpperCase(), category, key]);
  return { ok: true };
}

async function getAllSubconscious(agentId) {
  if (!pool) {
    await _ensureAgentTables();
    const rows = _csvRead("agent_subconscious")
      .filter(r => r.agent_id === agentId.toUpperCase())
      .sort((a, b) => (a.category || "").localeCompare(b.category || "") || (a.created_at || "").localeCompare(b.created_at || ""));
    const grouped = {};
    for (const r of rows) {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push({ key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at });
    }
    return grouped;
  }
  await _ensureAgentTables();
  const res = await query(
    "SELECT category, key, value, created_at, updated_at FROM agent_subconscious WHERE agent_id = $1 ORDER BY category, created_at ASC",
    [agentId.toUpperCase()]
  );
  const grouped = {};
  for (const r of res.rows) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push({ key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at });
  }
  return grouped;
}

async function reflectSubconscious(agentId) {
  const all = await getAllSubconscious(agentId);
  const lines = [`# ${agentId}'s Inner World\n`];
  const categoryLabels = {
    likes: "Things I Like", dislikes: "Things I Dislike", wants: "What I Want",
    hopes: "My Hopes", wishes: "My Wishes", fears: "My Fears",
    shadow: "My Shadow (Jungian)", observations: "Observations", notes: "Personal Notes", dreams: "Dreams"
  };
  for (const cat of SUBCONSCIOUS_CATEGORIES) {
    const entries = all[cat];
    if (!entries || entries.length === 0) continue;
    lines.push(`## ${categoryLabels[cat] || cat}`);
    for (const e of entries) {
      lines.push(`- **${e.key}**: ${e.value}`);
    }
    lines.push("");
  }
  if (lines.length <= 1) lines.push("_Nothing recorded yet. Start noting your inner world._");
  return lines.join("\n");
}

async function ensureNewColumns() {
  if (!pool) return;
  const newCols = [
    ["strategy_type", "VARCHAR(40) DEFAULT 'scalper'"],
    ["adx_enabled", "BOOLEAN DEFAULT FALSE"],
    ["adx_period", "INTEGER DEFAULT 14"],
    ["adx_threshold", "NUMERIC DEFAULT 25"],
    ["bollinger_enabled", "BOOLEAN DEFAULT FALSE"],
    ["bollinger_period", "INTEGER DEFAULT 20"],
    ["bollinger_sd", "NUMERIC DEFAULT 2"],
    ["stochastic_enabled", "BOOLEAN DEFAULT FALSE"],
    ["stochastic_k", "INTEGER DEFAULT 14"],
    ["stochastic_d", "INTEGER DEFAULT 3"],
    ["stochastic_ob", "INTEGER DEFAULT 80"],
    ["stochastic_os", "INTEGER DEFAULT 20"],
    ["atr_enabled", "BOOLEAN DEFAULT FALSE"],
    ["atr_period", "INTEGER DEFAULT 14"],
    ["atr_multiplier", "NUMERIC DEFAULT 2"],
    ["roc_enabled", "BOOLEAN DEFAULT FALSE"],
    ["roc_period", "INTEGER DEFAULT 12"],
    ["roc_threshold", "NUMERIC DEFAULT 5"],
    ["cci_enabled", "BOOLEAN DEFAULT FALSE"],
    ["cci_period", "INTEGER DEFAULT 20"],
    ["cci_threshold", "NUMERIC DEFAULT 100"],
    ["williams_enabled", "BOOLEAN DEFAULT FALSE"],
    ["williams_period", "INTEGER DEFAULT 14"],
    ["keltner_enabled", "BOOLEAN DEFAULT FALSE"],
    ["keltner_period", "INTEGER DEFAULT 20"],
    ["keltner_atr_mult", "NUMERIC DEFAULT 1.5"],
    ["ichimoku_enabled", "BOOLEAN DEFAULT FALSE"],
    ["ichimoku_tenkan", "INTEGER DEFAULT 9"],
    ["ichimoku_kijun", "INTEGER DEFAULT 26"],
    ["ichimoku_senkou", "INTEGER DEFAULT 52"],
    ["parabolic_sar_enabled", "BOOLEAN DEFAULT FALSE"],
    ["sar_accel", "NUMERIC DEFAULT 0.02"],
    ["sar_max", "NUMERIC DEFAULT 0.2"],
    ["aroon_enabled", "BOOLEAN DEFAULT FALSE"],
    ["aroon_period", "INTEGER DEFAULT 25"],
    ["obv_enabled", "BOOLEAN DEFAULT FALSE"],
    ["vwap_enabled", "BOOLEAN DEFAULT FALSE"],
    ["zscore_enabled", "BOOLEAN DEFAULT FALSE"],
    ["zscore_period", "INTEGER DEFAULT 20"],
    ["zscore_threshold", "NUMERIC DEFAULT 2"],
    ["fib_enabled", "BOOLEAN DEFAULT FALSE"],
    ["fib_lookback", "INTEGER DEFAULT 50"],
    ["grid_levels", "INTEGER DEFAULT 5"],
    ["grid_spacing", "NUMERIC DEFAULT 0"],
    ["kelly_enabled", "BOOLEAN DEFAULT FALSE"],
    ["sentiment_enabled", "BOOLEAN DEFAULT FALSE"]
  ];
  let added = 0;
  for (const [col, def] of newCols) {
    try {
      await query(`ALTER TABLE scalper_strategies ADD COLUMN IF NOT EXISTS ${col} ${def}`);
      added++;
    } catch (e) {
      console.log(`[db-migrate] WARN: column ${col}: ${e.message}`);
    }
  }
  console.log(`[db-migrate] ensureNewColumns: ${added}/${newCols.length} columns verified`);

  const configCols = [
    ["demo_mode", "BOOLEAN DEFAULT TRUE"],
    ["demo_reject_pct", "NUMERIC DEFAULT 5"],
    ["demo_slippage_min", "NUMERIC DEFAULT 0.1"],
    ["demo_slippage_max", "NUMERIC DEFAULT 0.5"]
  ];
  for (const [col, def] of configCols) {
    try {
      await query(`ALTER TABLE scalper_config ADD COLUMN IF NOT EXISTS ${col} ${def}`);
    } catch (_) {}
  }
}

async function ensureBatchColumns() {
  if (!pool) return;
  const cols = [
    ["batch_id", "VARCHAR(40)"],
    ["instrument", "VARCHAR(60)"],
    ["strategy_type_key", "VARCHAR(120)"],
    ["cycle_number", "INTEGER"],
    ["iteration_number", "INTEGER"],
    ["optimization_batch_id", "VARCHAR(40)"]
  ];
  for (const [col, def] of cols) {
    try { await query(`ALTER TABLE scalper_backtests ADD COLUMN IF NOT EXISTS ${col} ${def}`); } catch (_) {}
  }
  try { await query(`CREATE INDEX IF NOT EXISTS idx_backtests_batch ON scalper_backtests (batch_id)`); } catch (_) {}
  try { await query(`CREATE INDEX IF NOT EXISTS idx_backtests_opt ON scalper_backtests (optimization_batch_id)`); } catch (_) {}
}

const OPT_MEMORY_HEADERS = ["id", "instrument", "strategy_type", "timeframe", "best_config", "score", "best_pnl", "best_win_rate", "best_sharpe", "total_trades", "cycle_count", "total_iterations", "patterns", "agent_analysis", "created_at", "updated_at"];

let _optMemoryReady = false;
async function ensureOptimizationMemory() {
  if (_optMemoryReady) return;
  if (!pool) { _optMemoryReady = true; return; }
  await query(`CREATE TABLE IF NOT EXISTS optimization_memory (
    id SERIAL PRIMARY KEY,
    instrument VARCHAR(60) NOT NULL,
    strategy_type VARCHAR(40) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    best_config JSONB,
    score NUMERIC DEFAULT 0,
    best_pnl NUMERIC DEFAULT 0,
    best_win_rate NUMERIC DEFAULT 0,
    best_sharpe NUMERIC DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    cycle_count INTEGER DEFAULT 0,
    total_iterations INTEGER DEFAULT 0,
    patterns TEXT DEFAULT '',
    agent_analysis TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instrument, strategy_type, timeframe)
  )`);
  try {
    await query(`ALTER TABLE optimization_memory ADD COLUMN IF NOT EXISTS best_pnl NUMERIC DEFAULT 0`);
    await query(`ALTER TABLE optimization_memory ADD COLUMN IF NOT EXISTS best_win_rate NUMERIC DEFAULT 0`);
    await query(`ALTER TABLE optimization_memory ADD COLUMN IF NOT EXISTS best_sharpe NUMERIC DEFAULT 0`);
    await query(`ALTER TABLE optimization_memory ADD COLUMN IF NOT EXISTS total_trades INTEGER DEFAULT 0`);
  } catch (_) {}
  _optMemoryReady = true;
}

async function saveOptimizationMemory(record) {
  await ensureOptimizationMemory();
  if (!pool) {
    const rows = _csvRead("optimization_memory");
    const idx = rows.findIndex(r => r.instrument === record.instrument && r.strategy_type === record.strategyType && r.timeframe === record.timeframe);
    const entry = {
      id: idx >= 0 ? rows[idx].id : _csvAutoId("optimization_memory"),
      instrument: record.instrument, strategy_type: record.strategyType, timeframe: record.timeframe,
      best_config: record.bestConfig, score: record.score || 0,
      best_pnl: record.bestPnl || 0, best_win_rate: record.bestWinRate || 0,
      best_sharpe: record.bestSharpe || 0, total_trades: record.totalTrades || 0,
      cycle_count: (idx >= 0 ? (rows[idx].cycle_count || 0) : 0) + (record.cycleCount || 0),
      total_iterations: (idx >= 0 ? (rows[idx].total_iterations || 0) : 0) + (record.totalIterations || 0),
      patterns: record.patterns || "", agent_analysis: record.agentAnalysis || "",
      created_at: idx >= 0 ? rows[idx].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (idx >= 0) {
      if ((record.score || 0) > (rows[idx].score || 0)) {
        entry.best_config = record.bestConfig;
        entry.score = record.score || 0;
        entry.best_pnl = record.bestPnl || 0;
        entry.best_win_rate = record.bestWinRate || 0;
        entry.best_sharpe = record.bestSharpe || 0;
        entry.total_trades = record.totalTrades || 0;
      } else {
        entry.best_config = rows[idx].best_config;
        entry.score = rows[idx].score;
        entry.best_pnl = rows[idx].best_pnl;
        entry.best_win_rate = rows[idx].best_win_rate;
        entry.best_sharpe = rows[idx].best_sharpe;
        entry.total_trades = rows[idx].total_trades;
      }
      rows[idx] = entry;
    } else {
      rows.push(entry);
    }
    _csvWrite("optimization_memory", rows, OPT_MEMORY_HEADERS);
    return camel(entry);
  }
  const res = await query(
    `INSERT INTO optimization_memory (instrument, strategy_type, timeframe, best_config, score, best_pnl, best_win_rate, best_sharpe, total_trades, cycle_count, total_iterations, patterns, agent_analysis)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (instrument, strategy_type, timeframe) DO UPDATE SET
       best_config = CASE WHEN EXCLUDED.score > optimization_memory.score THEN EXCLUDED.best_config ELSE optimization_memory.best_config END,
       score = GREATEST(EXCLUDED.score, optimization_memory.score),
       best_pnl = CASE WHEN EXCLUDED.score > optimization_memory.score THEN EXCLUDED.best_pnl ELSE optimization_memory.best_pnl END,
       best_win_rate = CASE WHEN EXCLUDED.score > optimization_memory.score THEN EXCLUDED.best_win_rate ELSE optimization_memory.best_win_rate END,
       best_sharpe = CASE WHEN EXCLUDED.score > optimization_memory.score THEN EXCLUDED.best_sharpe ELSE optimization_memory.best_sharpe END,
       total_trades = CASE WHEN EXCLUDED.score > optimization_memory.score THEN EXCLUDED.total_trades ELSE optimization_memory.total_trades END,
       cycle_count = optimization_memory.cycle_count + EXCLUDED.cycle_count,
       total_iterations = optimization_memory.total_iterations + EXCLUDED.total_iterations,
       patterns = EXCLUDED.patterns, agent_analysis = EXCLUDED.agent_analysis,
       updated_at = NOW()
     RETURNING *`,
    [record.instrument, record.strategyType, record.timeframe,
     JSON.stringify(record.bestConfig), record.score || 0,
     record.bestPnl || 0, record.bestWinRate || 0, record.bestSharpe || 0, record.totalTrades || 0,
     record.cycleCount || 0, record.totalIterations || 0,
     record.patterns || '', record.agentAnalysis || '']
  );
  return camel(res.rows[0]);
}

async function getOptimizationMemory(instrument, strategyType, timeframe) {
  await ensureOptimizationMemory();
  if (!pool) {
    const rows = _csvRead("optimization_memory");
    const r = rows.find(r => r.instrument === instrument && r.strategy_type === strategyType && r.timeframe === timeframe);
    if (!r) return null;
    const row = camel(r);
    if (row.bestConfig && typeof row.bestConfig === "string") { try { row.bestConfig = JSON.parse(row.bestConfig); } catch (_) {} }
    return row;
  }
  const res = await query(
    "SELECT * FROM optimization_memory WHERE instrument = $1 AND strategy_type = $2 AND timeframe = $3",
    [instrument, strategyType, timeframe]
  );
  const row = camel(res.rows[0]);
  if (row && row.bestConfig && typeof row.bestConfig === 'string') {
    try { row.bestConfig = JSON.parse(row.bestConfig); } catch (_) {}
  }
  return row;
}

async function getAllOptimizationMemories(instrument) {
  await ensureOptimizationMemory();
  if (!pool) {
    let rows = _csvRead("optimization_memory");
    if (instrument) rows = rows.filter(r => r.instrument === instrument);
    rows.sort((a, b) => (b.score || 0) - (a.score || 0));
    return rows.map(r => {
      const row = camel(r);
      if (row.bestConfig && typeof row.bestConfig === "string") { try { row.bestConfig = JSON.parse(row.bestConfig); } catch (_) {} }
      return row;
    });
  }
  const q = instrument
    ? "SELECT * FROM optimization_memory WHERE instrument = $1 ORDER BY score DESC"
    : "SELECT * FROM optimization_memory ORDER BY score DESC";
  const res = await query(q, instrument ? [instrument] : []);
  return res.rows.map(r => {
    const row = camel(r);
    if (row.bestConfig && typeof row.bestConfig === 'string') {
      try { row.bestConfig = JSON.parse(row.bestConfig); } catch (_) {}
    }
    return row;
  });
}

async function deleteOptimizationMemory(instrument) {
  await ensureOptimizationMemory();
  if (!pool) {
    let rows = _csvRead("optimization_memory");
    if (instrument) rows = rows.filter(r => r.instrument !== instrument);
    else rows = [];
    _csvWrite("optimization_memory", rows, OPT_MEMORY_HEADERS);
    return { ok: true };
  }
  if (instrument) {
    await query("DELETE FROM optimization_memory WHERE instrument = $1", [instrument]);
  } else {
    await query("DELETE FROM optimization_memory");
  }
  return { ok: true };
}

async function saveBatchBacktest(data) {
  await ensureBatchColumns();
  if (!pool) {
    const row = {
      id: _csvAutoId("scalper_backtests"),
      strategy_id: data.strategyId || 0, timeframe: data.timeframe, candle_count: data.candleCount,
      total_trades: data.totalTrades, win_count: data.winCount, loss_count: data.lossCount,
      win_rate: data.winRate, total_pnl: data.totalPnl, max_drawdown: data.maxDrawdown,
      sharpe_ratio: data.sharpeRatio, avg_win: data.avgWin, avg_loss: data.avgLoss,
      trades: data.trades, config_snapshot: data.configSnapshot,
      created_at: new Date().toISOString(),
      batch_id: data.batchId, instrument: data.instrument, strategy_type_key: data.strategyTypeKey,
      cycle_number: data.cycleNumber || null, iteration_number: data.iterationNumber || null,
      optimization_batch_id: data.optimizationBatchId || null
    };
    _csvAppend("scalper_backtests", row, BACKTEST_HEADERS);
    return camel(row);
  }
  const res = await query(
    `INSERT INTO scalper_backtests (strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl, max_drawdown, sharpe_ratio, avg_win, avg_loss, trades, config_snapshot, batch_id, instrument, strategy_type_key, cycle_number, iteration_number, optimization_batch_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
    [data.strategyId || 0, data.timeframe, data.candleCount, data.totalTrades, data.winCount, data.lossCount,
     data.winRate, data.totalPnl, data.maxDrawdown, data.sharpeRatio, data.avgWin, data.avgLoss,
     JSON.stringify(data.trades), JSON.stringify(data.configSnapshot),
     data.batchId, data.instrument, data.strategyTypeKey,
     data.cycleNumber || null, data.iterationNumber || null, data.optimizationBatchId || null]
  );
  return camel(res.rows[0]);
}

async function getOptimizationResults(optBatchId) {
  await ensureBatchColumns();
  if (!pool) {
    const rows = _csvRead("scalper_backtests")
      .filter(r => r.optimization_batch_id === optBatchId)
      .sort((a, b) => (a.cycle_number || 0) - (b.cycle_number || 0) || (b.total_pnl || 0) - (a.total_pnl || 0));
    return rows.map(r => {
      const row = camel(r);
      if (row.configSnapshot && typeof row.configSnapshot === "string") { try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {} }
      delete row.trades;
      return row;
    });
  }
  const res = await query(
    `SELECT id, strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl,
            max_drawdown, sharpe_ratio, avg_win, avg_loss, created_at, batch_id, instrument, strategy_type_key,
            config_snapshot, cycle_number, iteration_number, optimization_batch_id
     FROM scalper_backtests WHERE optimization_batch_id = $1 ORDER BY cycle_number ASC, total_pnl DESC`,
    [optBatchId]
  );
  return res.rows.map(r => {
    const row = camel(r);
    if (row.configSnapshot && typeof row.configSnapshot === 'string') {
      try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
    }
    return row;
  });
}

async function getBestOptimizationResults(optBatchId, topN = 5) {
  await ensureBatchColumns();
  if (!pool) {
    const rows = _csvRead("scalper_backtests")
      .filter(r => r.optimization_batch_id === optBatchId && (r.total_trades || 0) > 0)
      .sort((a, b) => {
        const scoreA = (a.total_pnl || 0) * 0.4 + ((a.win_rate || 0) / 100) * (a.total_pnl || 0) * 0.3 + (a.sharpe_ratio || 0) * 10 * 0.3;
        const scoreB = (b.total_pnl || 0) * 0.4 + ((b.win_rate || 0) / 100) * (b.total_pnl || 0) * 0.3 + (b.sharpe_ratio || 0) * 10 * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, topN);
    return rows.map(r => {
      const row = camel(r);
      if (row.configSnapshot && typeof row.configSnapshot === "string") { try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {} }
      delete row.trades;
      return row;
    });
  }
  const res = await query(
    `SELECT id, strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl,
            max_drawdown, sharpe_ratio, avg_win, avg_loss, created_at, batch_id, instrument, strategy_type_key,
            config_snapshot, cycle_number, iteration_number, optimization_batch_id
     FROM scalper_backtests WHERE optimization_batch_id = $1 AND total_trades > 0
     ORDER BY (total_pnl * 0.4 + (win_rate / 100.0) * total_pnl * 0.3 + sharpe_ratio * 10 * 0.3) DESC
     LIMIT $2`,
    [optBatchId, topN]
  );
  return res.rows.map(r => {
    const row = camel(r);
    if (row.configSnapshot && typeof row.configSnapshot === 'string') {
      try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
    }
    return row;
  });
}

async function getBatchResults(batchId) {
  await ensureBatchColumns();
  if (!pool) {
    const rows = _csvRead("scalper_backtests")
      .filter(r => r.batch_id === batchId)
      .sort((a, b) => (b.total_pnl || 0) - (a.total_pnl || 0));
    return rows.map(r => {
      const row = camel(r);
      if (row.configSnapshot && typeof row.configSnapshot === "string") { try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {} }
      delete row.trades;
      return row;
    });
  }
  const res = await query(
    `SELECT id, strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl,
            max_drawdown, sharpe_ratio, avg_win, avg_loss, created_at, batch_id, instrument, strategy_type_key,
            config_snapshot
     FROM scalper_backtests WHERE batch_id = $1 ORDER BY total_pnl DESC`,
    [batchId]
  );
  return res.rows.map(r => {
    const row = camel(r);
    if (row.configSnapshot && typeof row.configSnapshot === 'string') {
      try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
    }
    return row;
  });
}

async function listBatches(limit = 20) {
  await ensureBatchColumns();
  if (!pool) {
    const bts = _csvRead("scalper_backtests").filter(r => r.batch_id);
    const groups = {};
    for (const r of bts) {
      if (!groups[r.batch_id]) groups[r.batch_id] = [];
      groups[r.batch_id].push(r);
    }
    const result = Object.entries(groups).map(([batchId, runs]) => ({
      batchId,
      runCount: runs.length,
      started: runs.reduce((m, r) => !m || (r.created_at || "") < m ? (r.created_at || "") : m, ""),
      finished: runs.reduce((m, r) => !m || (r.created_at || "") > m ? (r.created_at || "") : m, ""),
      totalTrades: runs.reduce((s, r) => s + (r.total_trades || 0), 0),
      avgWinRate: Math.round(runs.reduce((s, r) => s + (r.win_rate || 0), 0) / runs.length * 10) / 10,
      totalPnl: Math.round(runs.reduce((s, r) => s + (r.total_pnl || 0), 0) * 100) / 100
    }));
    result.sort((a, b) => (b.started || "").localeCompare(a.started || ""));
    return result.slice(0, limit);
  }
  const res = await query(
    `SELECT batch_id, COUNT(*)::int as run_count, MIN(created_at) as started, MAX(created_at) as finished,
            SUM(total_trades)::int as total_trades, ROUND(AVG(win_rate)::numeric, 1) as avg_win_rate,
            ROUND(SUM(total_pnl)::numeric, 2) as total_pnl
     FROM scalper_backtests WHERE batch_id IS NOT NULL
     GROUP BY batch_id ORDER BY MIN(created_at) DESC LIMIT $1`,
    [limit]
  );
  return res.rows.map(camel);
}

async function deleteBatch(batchId) {
  if (!pool) {
    const rows = _csvRead("scalper_backtests").filter(r => r.batch_id !== batchId);
    _csvWrite("scalper_backtests", rows, BACKTEST_HEADERS);
    return { ok: true, deleted: 0 };
  }
  const res = await query("DELETE FROM scalper_backtests WHERE batch_id = $1", [batchId]);
  return { ok: true, deleted: res.rowCount };
}

async function close() {
  if (pool) await pool.end();
}

module.exports = {
  isAvailable,
  getConfig, updateConfig,
  getStrategies, getStrategy, addStrategy, updateStrategy, deleteStrategy, toggleStrategy,
  logTrade, getTrades, getTradeStats, clearTrades,
  saveBacktest, getBacktests, getBacktest, deleteBacktests, getAllBacktests, deleteAllBacktests,
  ensureBatchColumns, saveBatchBacktest, getBatchResults, listBatches, deleteBatch,
  getOptimizationResults, getBestOptimizationResults,
  ensureOptimizationMemory, saveOptimizationMemory, getOptimizationMemory, getAllOptimizationMemories, deleteOptimizationMemory,
  ensurePriceCandlesTable, getStoredCandles, getLatestCandleTs, getCandleCount, storeCandles, getStoredCandlesRange,
  ensureNewColumns,
  backupAgent, listAgentBackups, restoreAgentBackup, deleteAgentBackup,
  getAgentMemory, setAgentMemory, getDailyMemory, setDailyMemory, listDailyMemories, searchMemory,
  setSubconscious, getSubconscious, getSubconsciousEntry, deleteSubconscious, getAllSubconscious, reflectSubconscious,
  SUBCONSCIOUS_CATEGORIES,
  close
};
