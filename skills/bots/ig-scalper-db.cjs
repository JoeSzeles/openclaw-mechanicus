const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } finally {
    client.release();
  }
}

async function getConfig() {
  const res = await query("SELECT * FROM scalper_config WHERE id = 1");
  if (res.rows.length === 0) {
    await query(`INSERT INTO scalper_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
    const res2 = await query("SELECT * FROM scalper_config WHERE id = 1");
    return camel(res2.rows[0]);
  }
  return camel(res.rows[0]);
}

async function updateConfig(updates) {
  const allowed = ["enabled", "budget", "max_drawdown", "max_margin_pct", "break_even_buffer", "drawdown_tripped"];
  const camelToSnake = {
    enabled: "enabled", budget: "budget", maxDrawdown: "max_drawdown",
    maxMarginPct: "max_margin_pct", breakEvenBuffer: "break_even_buffer",
    drawdownTripped: "drawdown_tripped", _drawdownTripped: "drawdown_tripped"
  };
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

async function getStrategies() {
  const res = await query("SELECT * FROM scalper_strategies ORDER BY id");
  return res.rows.map(camel);
}

async function getStrategy(id) {
  const res = await query("SELECT * FROM scalper_strategies WHERE id = $1", [id]);
  return camel(res.rows[0]);
}

const STRATEGY_COLS = [
  "instrument", "name", "direction", "enabled", "size",
  "stop_distance", "limit_distance", "min_momentum_pct",
  "cooldown_ms", "tick_window", "max_open_positions",
  "min_size", "max_size", "profit_target", "trailing_stop", "warmup_ms",
  "rsi_enabled", "rsi_period", "rsi_overbought", "rsi_oversold",
  "ema_enabled", "ema_short", "ema_long",
  "macd_enabled", "macd_fast", "macd_slow", "macd_signal",
  "contract_size", "deal_id"
];

const CAMEL_TO_SNAKE = {};
for (const col of STRATEGY_COLS) {
  const ck = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  CAMEL_TO_SNAKE[ck] = col;
  CAMEL_TO_SNAKE[col] = col;
}

function resolveCol(key) {
  return CAMEL_TO_SNAKE[key] || null;
}

async function addStrategy(data) {
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
  await query("DELETE FROM scalper_strategies WHERE id = $1", [id]);
}

async function toggleStrategy(id) {
  await query("UPDATE scalper_strategies SET enabled = NOT enabled, updated_at = NOW() WHERE id = $1", [id]);
  return getStrategy(id);
}

async function logTrade(trade) {
  const camelMap = {
    dealId: "deal_id", epic: "epic", direction: "direction", size: "size",
    entryPrice: "entry_price", entry: "entry_price",
    exitPrice: "exit_price", exit: "exit_price",
    pnl: "pnl", type: "type",
    strategyName: "strategy_name",
    openedAt: "opened_at", closedAt: "closed_at"
  };
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
  const res = await query("SELECT * FROM scalper_trades ORDER BY created_at DESC LIMIT $1", [limit]);
  return res.rows.map(camel);
}

async function getTradeStats() {
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

async function close() {
  await pool.end();
}

module.exports = {
  getConfig, updateConfig,
  getStrategies, getStrategy, addStrategy, updateStrategy, deleteStrategy, toggleStrategy,
  logTrade, getTrades, getTradeStats,
  close
};
