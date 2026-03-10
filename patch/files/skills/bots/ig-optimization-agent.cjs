"use strict";

const FIXED_KEYS_DEFAULT = [
  "size", "maxSize", "budget", "maxDrawdown", "maxMargin",
  "warmupMs", "cooldownMs", "instrument", "direction", "contractSize"
];

function scoreSummary(s) {
  if (!s || s.totalTrades === 0) return -Infinity;
  const pnlScore = (s.totalPnl || 0) * 0.4;
  const wrScore = ((s.winRate || 0) / 100) * (s.totalPnl || 0) * 0.3;
  const sharpeScore = (s.sharpeRatio || 0) * 10 * 0.3;
  const ddPenalty = Math.abs(s.maxDrawdown || 0) * 0.1;
  return pnlScore + wrScore + sharpeScore - ddPenalty;
}

function generateVariations(baseConfig, schema, fixedKeys, count, mutationRange) {
  const fixed = new Set(fixedKeys || FIXED_KEYS_DEFAULT);
  const variableParams = (schema || []).filter(p => !fixed.has(p.key) && p.type === "number");
  const boolParams = (schema || []).filter(p => !fixed.has(p.key) && p.type === "boolean");
  const variations = [];

  for (let i = 0; i < count; i++) {
    const variant = { ...baseConfig };
    for (const p of variableParams) {
      const base = baseConfig[p.key] != null ? baseConfig[p.key] : (p.default || 0);
      if (base === 0) {
        variant[p.key] = Math.round(Math.random() * 10 * 100) / 100;
      } else {
        const range = mutationRange || 0.3;
        const factor = 1 + (Math.random() * 2 - 1) * range;
        let val = base * factor;
        if (Number.isInteger(base)) val = Math.round(val);
        else val = Math.round(val * 100) / 100;
        if (val < 0 && base >= 0) val = 0;
        variant[p.key] = val;
      }
    }
    for (const p of boolParams) {
      variant[p.key] = Math.random() > 0.5;
    }
    variations.push(variant);
  }
  return variations;
}

function crossover(parent1, parent2, schema, fixedKeys) {
  const fixed = new Set(fixedKeys || FIXED_KEYS_DEFAULT);
  const child = { ...parent1 };
  for (const p of (schema || [])) {
    if (fixed.has(p.key)) continue;
    if (Math.random() > 0.5 && parent2[p.key] != null) {
      child[p.key] = parent2[p.key];
    }
  }
  return child;
}

function mutate(config, schema, fixedKeys, rate) {
  const fixed = new Set(fixedKeys || FIXED_KEYS_DEFAULT);
  const mutated = { ...config };
  const mr = rate || 0.15;
  for (const p of (schema || [])) {
    if (fixed.has(p.key)) continue;
    if (Math.random() > 0.3) continue;
    if (p.type === "number") {
      const base = config[p.key] != null ? config[p.key] : (p.default || 0);
      if (base === 0) {
        mutated[p.key] = Math.round(Math.random() * 5 * 100) / 100;
      } else {
        const factor = 1 + (Math.random() * 2 - 1) * mr;
        let val = base * factor;
        if (Number.isInteger(base)) val = Math.round(val);
        else val = Math.round(val * 100) / 100;
        if (val < 0 && base >= 0) val = 0;
        mutated[p.key] = val;
      }
    } else if (p.type === "boolean") {
      mutated[p.key] = !config[p.key];
    }
  }
  return mutated;
}

function calibrateVariables(cycleResults, strategySchemas, fixedKeys, iterations) {
  const fixed = fixedKeys || FIXED_KEYS_DEFAULT;
  const iters = iterations || 5;
  const newConfigs = {};

  const byType = {};
  for (const r of (cycleResults || [])) {
    const key = r.strategyTypeKey || r.strategyType;
    if (!key) continue;
    if (!byType[key]) byType[key] = [];
    byType[key].push(r);
  }

  for (const [sType, results] of Object.entries(byType)) {
    const scored = results
      .filter(r => r.totalTrades > 0)
      .map(r => ({ ...r, _score: scoreSummary(r) }))
      .sort((a, b) => b._score - a._score);

    const schema = strategySchemas[sType] && strategySchemas[sType].configSchema ? strategySchemas[sType].configSchema : [];
    const configs = [];

    if (scored.length === 0) {
      const defaults = {};
      for (const p of schema) { if (p.default != null) defaults[p.key] = p.default; }
      configs.push(...generateVariations(defaults, schema, fixed, iters, 0.4));
    } else {
      const top = scored.slice(0, 3);
      for (let i = 0; i < iters; i++) {
        if (top.length >= 2 && Math.random() > 0.3) {
          const p1 = top[Math.floor(Math.random() * Math.min(top.length, 3))].configSnapshot || {};
          const p2 = top[Math.floor(Math.random() * Math.min(top.length, 3))].configSnapshot || {};
          const child = crossover(p1, p2, schema, fixed);
          configs.push(mutate(child, schema, fixed, 0.12));
        } else {
          const base = top[0].configSnapshot || {};
          configs.push(mutate(base, schema, fixed, 0.2));
        }
      }
    }
    newConfigs[sType] = configs;
  }
  return newConfigs;
}

function analyzeOptimizationRun(allResults) {
  const byTypeAndTf = {};
  for (const r of (allResults || [])) {
    const key = (r.strategyTypeKey || r.strategyType || "unknown") + "|" + (r.timeframe || "?");
    if (!byTypeAndTf[key]) byTypeAndTf[key] = [];
    byTypeAndTf[key].push(r);
  }

  const bestPerCombo = {};
  const convergence = {};
  for (const [key, results] of Object.entries(byTypeAndTf)) {
    const scored = results
      .filter(r => r.totalTrades > 0)
      .map(r => ({ ...r, _score: scoreSummary(r) }))
      .sort((a, b) => b._score - a._score);

    if (scored.length > 0) {
      bestPerCombo[key] = {
        strategyType: scored[0].strategyTypeKey || scored[0].strategyType,
        timeframe: scored[0].timeframe,
        bestPnl: scored[0].totalPnl,
        bestWinRate: scored[0].winRate,
        bestSharpe: scored[0].sharpeRatio,
        bestConfig: scored[0].configSnapshot,
        totalRuns: scored.length,
        totalTrades: scored[0].totalTrades || 0,
        score: scored[0]._score
      };
    }

    const byCycle = {};
    for (const r of scored) {
      const c = r.cycleNumber || 1;
      if (!byCycle[c]) byCycle[c] = [];
      byCycle[c].push(r._score);
    }
    convergence[key] = Object.entries(byCycle).map(([c, scores]) => ({
      cycle: parseInt(c),
      bestScore: Math.max(...scores),
      avgScore: scores.reduce((s, v) => s + v, 0) / scores.length
    }));
  }

  const patterns = [];
  for (const [key, best] of Object.entries(bestPerCombo)) {
    const cfg = best.bestConfig || {};
    const interesting = [];
    for (const [k, v] of Object.entries(cfg)) {
      if (FIXED_KEYS_DEFAULT.includes(k)) continue;
      if (typeof v === "boolean" && v) interesting.push(`${k}=ON`);
      else if (typeof v === "number" && v !== 0) interesting.push(`${k}=${v}`);
    }
    if (interesting.length > 0) {
      patterns.push(`${best.strategyType}@${best.timeframe}: best with ${interesting.slice(0, 5).join(", ")} (PnL:${best.bestPnl}, WR:${best.bestWinRate}%)`);
    }
  }

  return {
    bestPerCombo,
    convergence,
    patterns,
    summary: `Analyzed ${allResults.length} runs across ${Object.keys(byTypeAndTf).length} strategy/timeframe combos. Found ${Object.keys(bestPerCombo).length} viable configs.`
  };
}

async function aiAnalyze(results, apiKey) {
  if (!apiKey) return null;
  try {
    const top5 = results
      .filter(r => r.totalTrades > 0)
      .sort((a, b) => scoreSummary(b) - scoreSummary(a))
      .slice(0, 5)
      .map(r => ({
        strategy: r.strategyTypeKey, timeframe: r.timeframe, cycle: r.cycleNumber,
        pnl: r.totalPnl, winRate: r.winRate, sharpe: r.sharpeRatio, trades: r.totalTrades,
        config: r.configSnapshot
      }));

    const prompt = `Analyze these backtest optimization results and provide: 1) Which strategy/timeframe combo performs best and why, 2) What variable patterns drive profitability, 3) Recommended next variable adjustments.\n\nTop 5 results:\n${JSON.stringify(top5, null, 2)}`;

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a quantitative trading analyst. Analyze backtest results concisely. Focus on actionable variable calibration insights. Be specific about which parameter values work and why. Keep response under 300 words." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500, temperature: 0.3
      })
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.log(`[optimization-agent] AI analysis failed: ${e.message}`);
    return null;
  }
}

module.exports = {
  calibrateVariables,
  analyzeOptimizationRun,
  generateVariations,
  scoreSummary,
  aiAnalyze,
  FIXED_KEYS_DEFAULT
};
