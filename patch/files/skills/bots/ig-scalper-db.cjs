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
  const allowed = ["enabled", "budget", "max_drawdown", "max_margin_pct", "break_even_buffer", "drawdown_tripped", "demo_mode", "demo_reject_pct", "demo_slippage_min", "demo_slippage_max"];
  const camelToSnake = {
    enabled: "enabled", budget: "budget", maxDrawdown: "max_drawdown",
    maxMarginPct: "max_margin_pct", breakEvenBuffer: "break_even_buffer",
    drawdownTripped: "drawdown_tripped", _drawdownTripped: "drawdown_tripped",
    demoMode: "demo_mode", demoRejectPct: "demo_reject_pct",
    demoSlippageMin: "demo_slippage_min", demoSlippageMax: "demo_slippage_max"
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

async function saveBacktest(data) {
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
  const res = await query(
    "SELECT id, strategy_id, timeframe, candle_count, total_trades, win_count, loss_count, win_rate, total_pnl, max_drawdown, sharpe_ratio, avg_win, avg_loss, created_at FROM scalper_backtests WHERE strategy_id = $1 ORDER BY created_at DESC LIMIT $2",
    [strategyId, limit]
  );
  return res.rows.map(camel);
}

async function getBacktest(id) {
  const res = await query("SELECT * FROM scalper_backtests WHERE id = $1", [id]);
  const row = camel(res.rows[0]);
  if (row && row.configSnapshot && typeof row.configSnapshot === 'string') {
    try { row.configSnapshot = JSON.parse(row.configSnapshot); } catch (_) {}
  }
  return row;
}

let _priceCandlesReady = false;
async function _ensurePriceCandles() {
  if (_priceCandlesReady) return;
  await ensurePriceCandlesTable();
  _priceCandlesReady = true;
}

async function ensurePriceCandlesTable() {
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
}

async function getStoredCandles(epic, resolution, limit) {
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts, open, high, low, close, volume FROM price_candles WHERE epic = $1 AND resolution = $2 ORDER BY ts DESC LIMIT $3",
    [epic, resolution, limit]
  );
  return res.rows.reverse();
}

async function getLatestCandleTs(epic, resolution) {
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts FROM price_candles WHERE epic = $1 AND resolution = $2 ORDER BY ts DESC LIMIT 1",
    [epic, resolution]
  );
  return res.rows.length > 0 ? parseInt(res.rows[0].ts) : null;
}

async function getCandleCount(epic, resolution) {
  const res = await query(
    "SELECT COUNT(*)::int as cnt FROM price_candles WHERE epic = $1 AND resolution = $2",
    [epic, resolution]
  );
  return res.rows[0].cnt;
}

async function storeCandles(epic, resolution, candles) {
  if (!candles || candles.length === 0) return 0;
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
  await _ensurePriceCandles();
  const res = await query(
    "SELECT ts, open, high, low, close, volume FROM price_candles WHERE epic = $1 AND resolution = $2 AND ts >= $3 AND ts <= $4 ORDER BY ts ASC",
    [epic, resolution, fromTs, toTs]
  );
  return res.rows;
}

async function clearTrades() {
  await query("DELETE FROM scalper_trades");
  return { ok: true, message: "All trade records cleared" };
}

const fs = require("fs");
const pathMod = require("path");

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

async function backupAgent(agentId, backupName) {
  await _ensureAgentTables();
  const wsDir = resolveAgentWorkspace(agentId);
  if (!wsDir) throw new Error("Unknown agent: " + agentId);
  const files = {};
  try {
    const entries = fs.readdirSync(wsDir);
    for (const f of entries) {
      if (!f.endsWith(".md")) continue;
      try {
        files[f] = fs.readFileSync(pathMod.join(wsDir, f), "utf-8");
      } catch (_) {}
    }
    const memDir = pathMod.join(wsDir, "memory");
    if (fs.existsSync(memDir)) {
      const memEntries = fs.readdirSync(memDir);
      for (const f of memEntries) {
        if (!f.endsWith(".md")) continue;
        try {
          files["memory/" + f] = fs.readFileSync(pathMod.join(memDir, f), "utf-8");
        } catch (_) {}
      }
    }
  } catch (e) {
    throw new Error("Cannot read workspace: " + e.message);
  }
  const res = await query(
    "INSERT INTO agent_backups (agent_id, backup_name, files) VALUES ($1, $2, $3) RETURNING id, agent_id, backup_name, created_at",
    [agentId.toUpperCase(), backupName || "Auto backup", JSON.stringify(files)]
  );
  const row = res.rows[0];
  return { id: row.id, agentId: row.agent_id, backupName: row.backup_name, fileCount: Object.keys(files).length, createdAt: row.created_at };
}

async function listAgentBackups(agentId) {
  await _ensureAgentTables();
  const res = await query(
    "SELECT id, agent_id, backup_name, created_at, jsonb_object_keys(files) FROM agent_backups WHERE agent_id = $1 ORDER BY created_at DESC",
    [agentId.toUpperCase()]
  );
  const backupMap = {};
  for (const row of res.rows) {
    if (!backupMap[row.id]) {
      backupMap[row.id] = { id: row.id, agentId: row.agent_id, backupName: row.backup_name, createdAt: row.created_at, fileCount: 0 };
    }
    backupMap[row.id].fileCount++;
  }
  const list = Object.values(backupMap);
  if (list.length === 0) {
    const res2 = await query(
      "SELECT id, agent_id, backup_name, files, created_at FROM agent_backups WHERE agent_id = $1 ORDER BY created_at DESC",
      [agentId.toUpperCase()]
    );
    return res2.rows.map(r => ({
      id: r.id, agentId: r.agent_id, backupName: r.backup_name,
      fileCount: r.files ? Object.keys(r.files).length : 0, createdAt: r.created_at
    }));
  }
  return list;
}

async function restoreAgentBackup(backupId) {
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
  await _ensureAgentTables();
  await query("DELETE FROM agent_backups WHERE id = $1", [backupId]);
  return { ok: true };
}

async function getAgentMemory(agentId) {
  await _ensureAgentTables();
  const res = await query(
    "SELECT content, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'long_term' LIMIT 1",
    [agentId.toUpperCase()]
  );
  return res.rows.length > 0 ? { content: res.rows[0].content, updatedAt: res.rows[0].updated_at } : { content: "", updatedAt: null };
}

async function setAgentMemory(agentId, content) {
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
  await _ensureAgentTables();
  const res = await query(
    "SELECT content, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'daily' AND entry_date = $2",
    [agentId.toUpperCase(), date]
  );
  return res.rows.length > 0 ? { content: res.rows[0].content, updatedAt: res.rows[0].updated_at } : { content: "", updatedAt: null };
}

async function setDailyMemory(agentId, date, content) {
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
  await _ensureAgentTables();
  const res = await query(
    "SELECT entry_date, LEFT(content, 200) as preview, updated_at FROM agent_memory WHERE agent_id = $1 AND entry_type = 'daily' ORDER BY entry_date DESC LIMIT $2",
    [agentId.toUpperCase(), limit || 30]
  );
  return res.rows.map(r => ({ date: r.entry_date, preview: r.preview, updatedAt: r.updated_at }));
}

async function searchMemory(agentId, searchTerm) {
  await _ensureAgentTables();
  const res = await query(
    "SELECT entry_type, entry_date, content, updated_at FROM agent_memory WHERE agent_id = $1 AND content ILIKE $2 ORDER BY updated_at DESC LIMIT 20",
    [agentId.toUpperCase(), "%" + searchTerm + "%"]
  );
  return res.rows.map(r => ({ entryType: r.entry_type, date: r.entry_date, content: r.content, updatedAt: r.updated_at }));
}

const SUBCONSCIOUS_CATEGORIES = ["likes", "dislikes", "wants", "hopes", "wishes", "fears", "shadow", "observations", "notes", "dreams"];

async function setSubconscious(agentId, category, key, value) {
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
  await _ensureAgentTables();
  const res = await query(
    "SELECT key, value, created_at, updated_at FROM agent_subconscious WHERE agent_id = $1 AND category = $2 ORDER BY created_at ASC",
    [agentId.toUpperCase(), category]
  );
  return res.rows.map(r => ({ key: r.key, value: r.value, createdAt: r.created_at, updatedAt: r.updated_at }));
}

async function getSubconsciousEntry(agentId, category, key) {
  await _ensureAgentTables();
  const res = await query(
    "SELECT key, value, created_at, updated_at FROM agent_subconscious WHERE agent_id = $1 AND category = $2 AND key = $3",
    [agentId.toUpperCase(), category, key]
  );
  return res.rows.length > 0 ? { key: res.rows[0].key, value: res.rows[0].value, createdAt: res.rows[0].created_at, updatedAt: res.rows[0].updated_at } : null;
}

async function deleteSubconscious(agentId, category, key) {
  await _ensureAgentTables();
  await query("DELETE FROM agent_subconscious WHERE agent_id = $1 AND category = $2 AND key = $3", [agentId.toUpperCase(), category, key]);
  return { ok: true };
}

async function getAllSubconscious(agentId) {
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

async function deleteBacktests(strategyId) {
  const res = await query("DELETE FROM scalper_backtests WHERE strategy_id = $1", [strategyId]);
  return { ok: true, deleted: res.rowCount };
}

async function getAllBacktests(limit = 50) {
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
  await query("DELETE FROM scalper_backtests");
  return { ok: true };
}

async function ensureBatchColumns() {
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

let _optMemoryReady = false;
async function ensureOptimizationMemory() {
  if (_optMemoryReady) return;
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
  if (instrument) {
    await query("DELETE FROM optimization_memory WHERE instrument = $1", [instrument]);
  } else {
    await query("DELETE FROM optimization_memory");
  }
  return { ok: true };
}

async function saveBatchBacktest(data) {
  await ensureBatchColumns();
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
  const res = await query("DELETE FROM scalper_backtests WHERE batch_id = $1", [batchId]);
  return { ok: true, deleted: res.rowCount };
}

async function close() {
  await pool.end();
}

module.exports = {
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
