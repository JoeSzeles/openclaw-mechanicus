function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
var BRAIN_API = '/api/brain';
var brainjarConfig = null;
var neuralCurrentEpic = null;
var neuralTickCount = 0;
var neuralPriceHistory = [];
var neuralVolumeHistory = [];
var neuralTimeLabels = [];
var neuralLastPrice = null;
var neuralPriceChart = null;
var neuralVolumeChart = null;
var neuralRatesChart = null;
var neuralSignalChart = null;
var effChart = null;
var corrChart = null;
var brainConnected = false;
var igConnectedForNeural = false;
var assignedTasks = {};
var prevPrices = {};
var brainTradeLog = [];
var efficiencyHistory = [];
var correlationHistory = [];
var observerRunning = false;
var observerInterval = null;
var calibrationRunning = false;
var calibrationData = { baseline_motor_rate: 0, threshold: 0, trades_executed: 0, win_count: 0, w_syn_adjusted: 1.0 };
var brainProcessStatus = 'unknown';
var brainLogEntries = [];
var brainStatusInterval = null;
var neuralTickPollInterval = null;
var trainingModeActive = false;
var patternMemoryCache = {};
var cortexAutoTradeEnabled = false;
var cortexAutoTradeInterval = null;
var cortexBuyThreshold = 10;
var cortexSellThreshold = 10;
var cortexHoldZone = 2;
var cortexCooldownMs = 30000;
var cortexLastTradeTs = 0;
var cortexTradeLog = [];
var cortexMaxOpenPositions = 3;
var cortexOpenPositions = [];
var cortexMinPositionSize = 0.5;
var cortexMaxPositionSize = 2.0;
var cortexPositionSize = 0.5;
var cortexAutoSize = true;
var cortexStopLossPips = 50;
var cortexTakeProfitPips = 100;
var cortexPriceExitsEnabled = false;
var cortexAutoLearn = true;
var cortexCheckRunning = false;
var cortexVerifyTickCount = 0;
var cortexLastVerifyTs = 0;
var cortexTimeframe = 'MINUTE_5';
var cortexMinHoldCandles = 5;
var cortexConfirmCandles = 1;
var cortexExitConfirmCandles = 2;
var cortexConsecutiveSignal = null;
var cortexConsecutiveCount = 0;
var cortexExitConsecutiveCount = 0;
var cortexOpenPosition = null;
var cortexDecisionLog = [];
var cortexTimeframeSec = { TICK: 1, SECOND: 1, SECOND_2: 2, SECOND_5: 5, SECOND_10: 10, SECOND_20: 20, SECOND_30: 30, SECOND_40: 40, MINUTE: 60, MINUTE_2: 120, MINUTE_3: 180, MINUTE_5: 300, MINUTE_15: 900, MINUTE_30: 1800, HOUR: 3600, HOUR_4: 14400, DAY: 86400, AUTO: 0 };
var cortexLastCandleTs = 0;
var cortexCandleBuffer = [];
var cortexPrevPrice = 0;
var cortexAutoTimeframeSelected = null;

var antenna = {
  ticks: [],
  windowMs: 30000,
  prevWindowRate: 0,
  prevWindowVol: 0,
  recentHigh: 0,
  recentLow: Infinity,
  recentHighTs: 0,
  bounceDetected: false,
  flashThreshold: 3.0,
  deadCatSensitivity: 0.5,
  emergencyExitEnabled: true,
  breakoutRiderEnabled: true,
  fallingKnifeBlock: true,
  lastPressure: null,
  useSpreadMode: false,
  baselineSpread: 0,
  spreadHistory: []
};

function resetAntennaState() {
  antenna.ticks = [];
  antenna.spreadHistory = [];
  antenna.baselineSpread = 0;
  antenna.useSpreadMode = false;
  antenna.recentHigh = 0;
  antenna.recentLow = Infinity;
  antenna.recentHighTs = 0;
  antenna.lastPressure = null;
}

function antennaPushTick(price, bid, ask, volume) {
  var now = Date.now();
  var prevTick = antenna.ticks.length > 0 ? antenna.ticks[antenna.ticks.length - 1] : null;
  var direction = prevTick ? (price > prevTick.price ? 1 : price < prevTick.price ? -1 : 0) : 0;
  var spread = (ask > 0 && bid > 0) ? Math.max(0, ask - bid) : 0;
  antenna.ticks.push({ ts: now, price: price, bid: bid, ask: ask, vol: volume || 0, spread: spread, dir: direction });
  while (antenna.ticks.length > 0 && now - antenna.ticks[0].ts > antenna.windowMs * 2) {
    antenna.ticks.shift();
  }
  antenna.spreadHistory.push({ ts: now, spread: spread });
  while (antenna.spreadHistory.length > 200) antenna.spreadHistory.shift();
  if (antenna.spreadHistory.length >= 10 && antenna.baselineSpread === 0) {
    var sum = 0;
    for (var s = 0; s < antenna.spreadHistory.length; s++) sum += antenna.spreadHistory[s].spread;
    antenna.baselineSpread = sum / antenna.spreadHistory.length;
  } else if (antenna.spreadHistory.length >= 10) {
    antenna.baselineSpread = antenna.baselineSpread * 0.99 + spread * 0.01;
  }
  var hasVolume = false;
  for (var vi = Math.max(0, antenna.ticks.length - 10); vi < antenna.ticks.length; vi++) {
    if (antenna.ticks[vi].vol > 0) { hasVolume = true; break; }
  }
  antenna.useSpreadMode = !hasVolume;
  if (price > antenna.recentHigh || now - antenna.recentHighTs > 120000) {
    antenna.recentHigh = price;
    antenna.recentHighTs = now;
  }
  if (price < antenna.recentLow) antenna.recentLow = price;
}

function antennaComputePressure() {
  var now = Date.now();
  var windowTicks = antenna.ticks.filter(function(t) { return now - t.ts < antenna.windowMs; });
  var prevTicks = antenna.ticks.filter(function(t) { return now - t.ts >= antenna.windowMs && now - t.ts < antenna.windowMs * 2; });
  var tickCount = windowTicks.length;
  var elapsed = tickCount > 1 ? (windowTicks[tickCount - 1].ts - windowTicks[0].ts) / 1000 : antenna.windowMs / 1000;
  if (elapsed < 0.1) elapsed = antenna.windowMs / 1000;
  var tickVelocity = tickCount / elapsed;
  var prevRate = prevTicks.length > 0 ? prevTicks.length / (antenna.windowMs / 1000) : tickVelocity;
  var velocityAccel = prevRate > 0 ? (tickVelocity - prevRate) / prevRate : 0;
  var totalVol = 0; var upTicks = 0; var downTicks = 0;
  var totalSpread = 0; var prevTotalSpread = 0;
  var spreadDelta = 0; var avgSpread = 0; var prevAvgSpread = 0;
  var maxSpread = 0; var minSpread = Infinity;
  for (var i = 0; i < windowTicks.length; i++) {
    totalVol += windowTicks[i].vol;
    if (windowTicks[i].dir > 0) upTicks++;
    if (windowTicks[i].dir < 0) downTicks++;
    var tSpread = windowTicks[i].spread || 0;
    totalSpread += tSpread;
    if (tSpread > maxSpread) maxSpread = tSpread;
    if (tSpread < minSpread) minSpread = tSpread;
  }
  avgSpread = tickCount > 0 ? totalSpread / tickCount : 0;
  for (var psi = 0; psi < prevTicks.length; psi++) {
    prevTotalSpread += (prevTicks[psi].spread || 0);
  }
  prevAvgSpread = prevTicks.length > 0 ? prevTotalSpread / prevTicks.length : avgSpread;
  spreadDelta = tickCount >= 2 ? (windowTicks[tickCount - 1].spread || 0) - (windowTicks[0].spread || 0) : 0;
  var spreadAccel = prevAvgSpread > 0.001 ? (avgSpread - prevAvgSpread) / prevAvgSpread : 0;
  var spreadSpikeRatio = antenna.baselineSpread > 0.001 ? avgSpread / antenna.baselineSpread : 1;
  var buySellRatio = (upTicks + downTicks) > 0 ? upTicks / (upTicks + downTicks) : 0.5;
  var prevTotalVol = 0;
  for (var j = 0; j < prevTicks.length; j++) prevTotalVol += prevTicks[j].vol;
  var volumeAccel = prevTotalVol > 0 ? (totalVol - prevTotalVol) / prevTotalVol : 0;
  var useSpread = antenna.useSpreadMode;
  var effectiveAccel = useSpread ? spreadAccel : volumeAccel;
  var priceDelta = 0; var priceRange = 0;
  if (windowTicks.length >= 2) {
    priceDelta = windowTicks[windowTicks.length - 1].price - windowTicks[0].price;
    var hi = windowTicks[0].price, lo = windowTicks[0].price;
    for (var k = 1; k < windowTicks.length; k++) {
      if (windowTicks[k].price > hi) hi = windowTicks[k].price;
      if (windowTicks[k].price < lo) lo = windowTicks[k].price;
    }
    priceRange = hi - lo;
  }
  var absorptionScore = 0;
  if (useSpread) {
    if (spreadSpikeRatio > 1.5 && priceRange > 0 && priceRange < avgSpread * 2) {
      absorptionScore = Math.min((spreadSpikeRatio - 1) * 2, 3.0);
    } else if (tickCount > 5 && priceRange < avgSpread * 0.5) {
      absorptionScore = Math.min(tickCount / 10, 2.0);
    }
  } else {
    if (totalVol > 0 && priceRange > 0) {
      var volPerMove = totalVol / (priceRange + 0.001);
      absorptionScore = Math.min(volPerMove / 50, 3.0);
    } else if (tickCount > 5 && priceRange < 0.5) {
      absorptionScore = Math.min(tickCount / 10, 2.0);
    }
  }
  var priceVelocity = elapsed > 0 ? Math.abs(priceDelta) / elapsed : 0;
  var flashCrashScore = 0;
  if (tickVelocity > 1 && priceVelocity > 0) {
    flashCrashScore = (tickVelocity * priceVelocity) / 10;
    if (useSpread) {
      if (spreadSpikeRatio > 2.0) flashCrashScore *= spreadSpikeRatio;
    } else {
      if (volumeAccel > 1) flashCrashScore *= (1 + volumeAccel);
    }
    flashCrashScore = Math.min(flashCrashScore, 5.0);
  }
  var deadCatScore = 0;
  if (windowTicks.length >= 3) {
    var lastPrice = windowTicks[windowTicks.length - 1].price;
    var dropFromHigh = antenna.recentHigh - antenna.recentLow;
    var bounceFromLow = lastPrice - antenna.recentLow;
    if (dropFromHigh > 0 && bounceFromLow > 0) {
      var bounceRatio = bounceFromLow / dropFromHigh;
      if (bounceRatio > 0.1 && bounceRatio < 0.5) {
        if (useSpread) {
          var midTs = now - antenna.windowMs / 2;
          var recentSprdAvg = 0; var dropSprdAvg = 0; var rCnt = 0; var dCnt = 0;
          for (var ms = 0; ms < windowTicks.length; ms++) {
            if (windowTicks[ms].ts > midTs) { recentSprdAvg += (windowTicks[ms].spread || 0); rCnt++; }
            else { dropSprdAvg += (windowTicks[ms].spread || 0); dCnt++; }
          }
          recentSprdAvg = rCnt > 0 ? recentSprdAvg / rCnt : 0;
          dropSprdAvg = dCnt > 0 ? dropSprdAvg / dCnt : recentSprdAvg;
          var spreadContracting = dropSprdAvg > 0 ? recentSprdAvg / dropSprdAvg : 1;
          if (spreadContracting < 0.7) {
            deadCatScore = (1 - spreadContracting) * (1 - bounceRatio) * 3;
            deadCatScore = Math.min(deadCatScore, 3.0);
          }
        } else {
          var recentVol = 0;
          var dropVol = 0;
          var midTs2 = now - antenna.windowMs / 2;
          for (var m = 0; m < windowTicks.length; m++) {
            if (windowTicks[m].ts > midTs2) recentVol += windowTicks[m].vol || 1;
            else dropVol += windowTicks[m].vol || 1;
          }
          var volRatio = dropVol > 0 ? recentVol / dropVol : 1;
          if (volRatio < 0.7) {
            deadCatScore = (1 - volRatio) * (1 - bounceRatio) * 3;
            deadCatScore = Math.min(deadCatScore, 3.0);
          }
        }
      }
    }
  }
  var fallingKnifeScore = 0;
  if (useSpread) {
    if (priceDelta < 0 && spreadSpikeRatio > 1.5) {
      fallingKnifeScore = Math.min(Math.abs(priceDelta) * (spreadSpikeRatio - 1) / 3, 3.0);
    }
  } else {
    if (priceDelta < 0 && volumeAccel > 0.3) {
      fallingKnifeScore = Math.min(Math.abs(priceDelta) * volumeAccel / 5, 3.0);
    }
  }
  var divergenceScore = 0;
  if (windowTicks.length >= 3) {
    var lastP = windowTicks[windowTicks.length - 1].price;
    var isNewHigh = lastP >= antenna.recentHigh * 0.999;
    var isNewLow = lastP <= antenna.recentLow * 1.001;
    if (useSpread) {
      if ((isNewHigh || isNewLow) && spreadSpikeRatio > 1.8) {
        divergenceScore = Math.min((spreadSpikeRatio - 1) * 1.5, 3.0);
      }
    } else {
      if ((isNewHigh || isNewLow) && volumeAccel < -0.2) {
        divergenceScore = Math.min(Math.abs(volumeAccel) * 2, 3.0);
      }
    }
  }
  var pressure = {
    tickVelocity: tickVelocity,
    velocityAccel: velocityAccel,
    volumeAccel: volumeAccel,
    spreadAccel: spreadAccel,
    spreadDelta: spreadDelta,
    avgSpread: avgSpread,
    spreadSpikeRatio: spreadSpikeRatio,
    useSpreadMode: useSpread,
    effectiveAccel: effectiveAccel,
    buySellRatio: buySellRatio,
    absorptionScore: absorptionScore,
    flashCrashScore: flashCrashScore,
    deadCatScore: deadCatScore,
    fallingKnifeScore: fallingKnifeScore,
    divergenceScore: divergenceScore,
    priceVelocity: priceVelocity,
    priceDelta: priceDelta,
    tickCount: tickCount,
    totalVolume: totalVol,
    windowMs: antenna.windowMs
  };
  antenna.lastPressure = pressure;
  return pressure;
}

function antennaCheckEmergency(pressure, openPos) {
  if (!openPos || !antenna.emergencyExitEnabled) return null;
  if (pressure.flashCrashScore >= antenna.flashThreshold) {
    var priceMovingAgainst = (openPos.direction === 'BUY' && pressure.priceDelta < 0) ||
                              (openPos.direction === 'SELL' && pressure.priceDelta > 0);
    if (priceMovingAgainst) {
      return { action: 'EMERGENCY_CLOSE', reason: 'Flash crash detected (score=' + pressure.flashCrashScore.toFixed(1) + ') moving against ' + openPos.direction };
    }
  }
  if (pressure.fallingKnifeScore >= 2.0 && openPos.direction === 'BUY') {
    return { action: 'EMERGENCY_CLOSE', reason: 'Falling knife (score=' + pressure.fallingKnifeScore.toFixed(1) + ') while holding BUY' };
  }
  if (pressure.tickVelocity > 3 && Math.abs(pressure.priceDelta) > 2) {
    var against = (openPos.direction === 'BUY' && pressure.priceDelta < -2) ||
                  (openPos.direction === 'SELL' && pressure.priceDelta > 2);
    if (against) {
      return { action: 'EMERGENCY_CLOSE', reason: 'Rapid reversal between candles (vel=' + pressure.tickVelocity.toFixed(1) + ' delta=' + pressure.priceDelta.toFixed(2) + ')' };
    }
  }
  return null;
}

function antennaCheckBreakout(pressure) {
  if (!antenna.breakoutRiderEnabled) return null;
  if (pressure.flashCrashScore >= antenna.flashThreshold && pressure.tickVelocity > 2) {
    if (pressure.priceDelta > 0 && pressure.buySellRatio > 0.6) {
      return { action: 'BREAKOUT_BUY', reason: 'Breakout UP (flash=' + pressure.flashCrashScore.toFixed(1) + ' ratio=' + pressure.buySellRatio.toFixed(2) + ')' };
    }
    if (pressure.priceDelta < 0 && pressure.buySellRatio < 0.4) {
      return { action: 'BREAKOUT_SELL', reason: 'Breakout DOWN (flash=' + pressure.flashCrashScore.toFixed(1) + ' ratio=' + pressure.buySellRatio.toFixed(2) + ')' };
    }
  }
  return null;
}

function antennaShouldBlockEntry(pressure, signal) {
  if (signal === 'BUY') {
    if (pressure.deadCatScore >= antenna.deadCatSensitivity * 2) {
      return 'Dead cat bounce detected (score=' + pressure.deadCatScore.toFixed(1) + ') — blocking BUY';
    }
    if (antenna.fallingKnifeBlock && pressure.fallingKnifeScore >= 1.5) {
      return 'Falling knife (score=' + pressure.fallingKnifeScore.toFixed(1) + ') — blocking BUY';
    }
    if (pressure.divergenceScore >= 1.5 && pressure.buySellRatio < 0.45) {
      var divType = pressure.useSpreadMode ? 'Spread' : 'Volume';
      return divType + ' divergence at high (div=' + pressure.divergenceScore.toFixed(1) + ') — blocking BUY';
    }
  }
  if (signal === 'SELL') {
    if (pressure.divergenceScore >= 1.5 && pressure.buySellRatio > 0.55) {
      var divType2 = pressure.useSpreadMode ? 'Spread' : 'Volume';
      return divType2 + ' divergence at low (div=' + pressure.divergenceScore.toFixed(1) + ') — blocking SELL';
    }
  }
  return null;
}

function renderAntennaPressure(pressure) {
  var panel = document.getElementById('antenna-pressure-panel');
  if (!panel) return;
  var tvBar = Math.min(pressure.tickVelocity / 5 * 100, 100);
  var tvColor = pressure.tickVelocity > 3 ? '#f85149' : pressure.tickVelocity > 1.5 ? '#d29922' : '#2dc653';
  var useSpread = pressure.useSpreadMode;
  var accelVal = useSpread ? pressure.spreadAccel : pressure.volumeAccel;
  var vaBar = Math.min(Math.abs(accelVal) * 50, 100);
  var vaColor = accelVal > 0.5 ? '#f85149' : accelVal > 0 ? '#d29922' : '#58a6ff';
  var vaLabel = useSpread ? 'Spread Accel' : 'Vol Accel';
  var vaDetail = useSpread
    ? (pressure.avgSpread || 0).toFixed(2) + ' (' + (pressure.spreadSpikeRatio || 1).toFixed(1) + 'x)'
    : (accelVal >= 0 ? '+' : '') + (accelVal * 100).toFixed(0) + '%';
  var bsBar = Math.abs(pressure.buySellRatio - 0.5) * 200;
  var bsColor = pressure.buySellRatio > 0.6 ? '#2dc653' : pressure.buySellRatio < 0.4 ? '#f85149' : '#8b949e';
  var bsLabel = pressure.buySellRatio > 0.55 ? 'BUY' : pressure.buySellRatio < 0.45 ? 'SELL' : 'NEUTRAL';
  var alerts = [];
  if (useSpread) alerts.push('<span style="color:#bc8cff;font-size:9px">SPREAD MODE</span>');
  if (pressure.flashCrashScore >= antenna.flashThreshold) alerts.push('<span style="color:#f85149;font-weight:bold">FLASH ' + pressure.flashCrashScore.toFixed(1) + '</span>');
  if (pressure.deadCatScore >= 1.0) alerts.push('<span style="color:#d29922;font-weight:bold">DEAD CAT ' + pressure.deadCatScore.toFixed(1) + '</span>');
  if (pressure.fallingKnifeScore >= 1.0) alerts.push('<span style="color:#f85149">KNIFE ' + pressure.fallingKnifeScore.toFixed(1) + '</span>');
  if (pressure.absorptionScore >= 1.5) alerts.push('<span style="color:#bc8cff">ABSORB ' + pressure.absorptionScore.toFixed(1) + '</span>');
  if (pressure.divergenceScore >= 1.0) alerts.push('<span style="color:#79c0ff">DIVERG ' + pressure.divergenceScore.toFixed(1) + '</span>');
  var alertHtml = alerts.length > 0 ? alerts.join(' | ') : '<span style="color:#484f58">No alerts</span>';
  panel.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:6px">' +
      '<div><div style="color:#8b949e;font-size:10px;margin-bottom:2px">Tick Speed</div>' +
        '<div style="background:#21262d;border-radius:3px;height:14px;overflow:hidden"><div style="background:' + tvColor + ';height:100%;width:' + tvBar + '%;transition:width 0.3s"></div></div>' +
        '<div style="color:' + tvColor + ';font-size:10px;margin-top:1px">' + pressure.tickVelocity.toFixed(2) + '/s</div></div>' +
      '<div><div style="color:' + (useSpread ? '#bc8cff' : '#8b949e') + ';font-size:10px;margin-bottom:2px">' + vaLabel + '</div>' +
        '<div style="background:#21262d;border-radius:3px;height:14px;overflow:hidden"><div style="background:' + vaColor + ';height:100%;width:' + vaBar + '%;transition:width 0.3s"></div></div>' +
        '<div style="color:' + vaColor + ';font-size:10px;margin-top:1px">' + vaDetail + '</div></div>' +
      '<div><div style="color:#8b949e;font-size:10px;margin-bottom:2px">Pressure</div>' +
        '<div style="background:#21262d;border-radius:3px;height:14px;overflow:hidden"><div style="background:' + bsColor + ';height:100%;width:' + bsBar + '%;transition:width 0.3s;margin-left:' + (pressure.buySellRatio >= 0.5 ? '50' : (50 - bsBar)) + '%"></div></div>' +
        '<div style="color:' + bsColor + ';font-size:10px;margin-top:1px">' + bsLabel + ' ' + (pressure.buySellRatio * 100).toFixed(0) + '%</div></div>' +
    '</div>' +
    '<div style="font-size:10px;padding:3px 6px;background:#161b22;border-radius:3px">' + alertHtml + '</div>';
}

async function loadBrainjarConfig() {
  try {
    var res = await fetch('/__openclaw__/canvas/brainjar.config.json');
    if (res.ok) {
      brainjarConfig = await res.json();
      assignedTasks = brainjarConfig.tasks || {};
    }
  } catch (e) {
    brainjarConfig = { neuron_mappings: {}, tasks: {}, simulation: {}, goals: {} };
  }
}

async function brainFetch(path, opts) {
  try {
    var res = await fetch(BRAIN_API + path, opts || {});
    if (res.ok) return await res.json();
    var errText = '';
    try { errText = await res.text(); } catch(_){}
    devLog('WARN', 'brainFetch ' + path + ' status=' + res.status + ' ' + errText);
    return null;
  } catch (e) {
    devLog('ERROR', 'brainFetch ' + path + ' error: ' + e.message);
    return null;
  }
}

async function brainBoot() {
  addBrainLog('INFO', 'Booting brain engine...');
  var res = await brainFetch('/boot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res) {
    brainConnected = true;
    addBrainLog('INFO', 'Brain booted: ' + (res.neurons_count || '?') + ' neurons, ' + (res.synapses_count || '?') + ' synapses');
    devLog('INFO', 'Brain booted: neurons=' + res.neurons_count + ' synapses=' + res.synapses_count);
    updateBrainIndicator(true);
    return res;
  }
  addBrainLog('ERROR', 'Brain engine not reachable');
  updateBrainIndicator(false);
  return null;
}

async function brainStimulate(neuronIds, intensity) {
  return brainFetch('/stimulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ neuron_ids: neuronIds, intensity: intensity })
  });
}

async function brainStimulatePrice(priceData) {
  return brainFetch('/stimulate-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(priceData)
  });
}

async function brainObserve() {
  return brainFetch('/observe');
}

async function brainStatus() {
  return brainFetch('/status');
}

async function brainUpdateConfig(cfg) {
  return brainFetch('/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg)
  });
}

async function brainFeedback(type) {
  return brainFetch('/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type })
  });
}

async function brainSetTraining(enabled, direction) {
  return brainFetch('/training', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: enabled, direction: direction || null })
  });
}

async function brainGetPatterns() {
  return brainFetch('/patterns');
}

async function brainGetHistory() {
  return brainFetch('/history');
}

function updateBrainIndicator(connected) {
  var ind = document.getElementById('neural-brain-indicator');
  var st = document.getElementById('neural-brain-status');
  if (ind) ind.className = connected ? 'badge badge-on' : 'badge badge-alert';
  if (st) st.textContent = connected ? 'Brain Online' : 'Brain Offline';
}

function updateNeuralIGIndicator(connected) {
  var ind = document.getElementById('neural-ig-indicator');
  var st = document.getElementById('neural-ig-status');
  if (ind) ind.className = connected ? 'badge badge-on' : 'badge badge-alert';
  if (st) st.textContent = connected ? 'IG Connected' : 'IG Disconnected';
  igConnectedForNeural = connected;
}

function devLog(level, msg) {
  var ts = new Date().toLocaleTimeString();
  var logDiv = document.getElementById('neural-dev-console');
  if (logDiv) {
    var el = document.createElement('div');
    el.style.cssText = 'padding:1px 0;font-size:11px;font-family:monospace;border-bottom:1px solid #1a1f26';
    var color = level === 'ERROR' ? '#f85149' : (level === 'WARN' ? '#d29922' : (level === 'DATA' ? '#79c0ff' : '#6e7681'));
    el.innerHTML = '<span style="color:#484f58">' + ts + '</span> <span style="color:' + color + '">[' + level + ']</span> ' + escHtml(msg);
    logDiv.appendChild(el);
    logDiv.scrollTop = logDiv.scrollHeight;
    while (logDiv.children.length > 500) logDiv.firstChild.remove();
  }
}

function addBrainLog(level, msg) {
  var ts = new Date().toLocaleTimeString();
  brainLogEntries.unshift({ ts: ts, level: level, msg: msg });
  if (brainLogEntries.length > 200) brainLogEntries.pop();
  devLog(level, msg);
  var logDiv = document.getElementById('brain-activity-log');
  if (logDiv) {
    var el = document.createElement('div');
    el.style.cssText = 'padding:2px 0;border-bottom:1px solid #21262d;font-size:11px;font-family:monospace';
    var color = level === 'ERROR' ? '#f85149' : (level === 'WARN' ? '#d29922' : '#8b949e');
    el.innerHTML = '<span style="color:#484f58">[' + ts + ']</span> <span style="color:' + color + '">[' + level + ']</span> ' + escHtml(msg);
    if (logDiv.firstChild) logDiv.insertBefore(el, logDiv.firstChild);
    else logDiv.appendChild(el);
    while (logDiv.children.length > 100) logDiv.lastChild.remove();
  }
  var configLog = document.getElementById('brain-config-log');
  if (configLog) {
    var el2 = document.createElement('div');
    el2.style.cssText = 'padding:2px 0;border-bottom:1px solid #21262d;font-size:11px;font-family:monospace';
    var color2 = level === 'ERROR' ? '#f85149' : (level === 'WARN' ? '#d29922' : '#8b949e');
    el2.innerHTML = '<span style="color:#484f58">[' + ts + ']</span> <span style="color:' + color2 + '">[' + level + ']</span> ' + escHtml(msg);
    if (configLog.firstChild) configLog.insertBefore(el2, configLog.firstChild);
    else configLog.appendChild(el2);
    while (configLog.children.length > 100) configLog.lastChild.remove();
  }
}

async function neuralSearchInstruments(term) {
  devLog('INFO', 'Searching instruments: ' + term);
  var data = await apiFetch('/api/ig/markets?q=' + encodeURIComponent(term));
  if (!data) { devLog('WARN', 'Search returned null'); return []; }
  var markets = data.markets || [];
  devLog('DATA', 'Found ' + markets.length + ' instruments');
  return markets.map(function(m) {
    return { epic: m.epic, name: m.instrumentName || m.name || m.epic, pip_value: m.pipValue, min_size: m.minDealSize || m.lotSize };
  });
}

var _streamRefreshFirstLoad = true;
async function refreshStreamInstruments() {
  var listEl = document.getElementById('neural-stream-list');
  if (!listEl) return;
  if (_streamRefreshFirstLoad) {
    listEl.innerHTML = '<div style="color:#484f58;font-size:11px;padding:6px;text-align:center">Loading...</div>';
  }
  try {
    var data = await apiFetch('/api/ig/stream/status');
    if (!data || !data.instruments || Object.keys(data.instruments).length === 0) {
      listEl.innerHTML = '<div style="color:#f85149;font-size:11px;padding:6px;text-align:center">No active streams. Add instruments in IG Trading tab first.</div>';
      _streamRefreshFirstLoad = false;
      return;
    }
    var epics = Object.keys(data.instruments);
    var existingRows = listEl.querySelectorAll('[data-epic]');
    var existingMap = {};
    existingRows.forEach(function(r) { existingMap[r.getAttribute('data-epic')] = r; });
    var currentEpics = new Set(epics);
    existingRows.forEach(function(r) {
      if (!currentEpics.has(r.getAttribute('data-epic'))) r.remove();
    });
    epics.forEach(function(epic) {
      var info = data.instruments[epic];
      var shortName = epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'');
      var isSelected = neuralCurrentEpic === epic;
      var existing = existingMap[epic];
      var rowHtml = '<div style="flex:1">' +
        '<div style="font-weight:600;font-size:12px;color:' + (isSelected ? '#2dc653' : '#c9d1d9') + '">' + escHtml(shortName) + '</div>' +
        '<div style="font-size:10px;color:#8b949e">' + escHtml(epic) + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
        '<div style="font-size:11px;font-weight:600;color:#d29922">' + (info.bid ? info.bid.toFixed(2) : '--') + ' / ' + (info.offer ? info.offer.toFixed(2) : '--') + '</div>' +
        '<div style="font-size:9px;color:' + (info.marketState === 'TRADEABLE' ? '#2dc653' : '#f85149') + '">' + (info.marketState || 'UNKNOWN') + ' | ' + (info.updates || 0) + ' ticks</div>' +
        '</div>';
      if (existing) {
        existing.innerHTML = rowHtml;
        existing.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #21262d;cursor:pointer;border-radius:3px;' + (isSelected ? 'background:rgba(45,198,83,0.15);border-left:3px solid #2dc653;' : '');
      } else {
        var row = document.createElement('div');
        row.setAttribute('data-epic', epic);
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #21262d;cursor:pointer;border-radius:3px;' + (isSelected ? 'background:rgba(45,198,83,0.15);border-left:3px solid #2dc653;' : '');
        row.innerHTML = rowHtml;
        row.onmouseenter = function() { if (neuralCurrentEpic !== epic) this.style.background = 'rgba(88,166,255,0.08)'; };
        row.onmouseleave = function() { if (neuralCurrentEpic !== epic) this.style.background = ''; };
        row.onclick = function() {
          neuralSelectInstrument({ epic: epic, name: shortName, isStream: true, bid: info.bid, offer: info.offer });
        };
        var footer = listEl.querySelector('[data-stream-footer]');
        if (footer) listEl.insertBefore(row, footer);
        else listEl.appendChild(row);
      }
    });
    var existingFooter = listEl.querySelector('[data-stream-footer]');
    var footerText = epics.length + ' active stream' + (epics.length !== 1 ? 's' : '') + ' | ' + (data.priceMethod || 'unknown') + ' | ' + (data.streamingSource || '--');
    if (existingFooter) {
      existingFooter.textContent = footerText;
    } else {
      var footer = document.createElement('div');
      footer.setAttribute('data-stream-footer', '1');
      footer.style.cssText = 'font-size:10px;color:#484f58;padding:4px 8px;text-align:center';
      footer.textContent = footerText;
      listEl.appendChild(footer);
    }
    _streamRefreshFirstLoad = false;
  } catch (e) {
    if (_streamRefreshFirstLoad) {
      listEl.innerHTML = '<div style="color:#f85149;font-size:11px;padding:6px">Error loading streams: ' + escHtml(e.message) + '</div>';
      _streamRefreshFirstLoad = false;
    }
  }
}

function neuralSelectInstrument(inst) {
  neuralCurrentEpic = inst.epic;
  var shortName = inst.name || inst.epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'');
  try { localStorage.setItem('neural_selected_instrument', JSON.stringify({ epic: inst.epic, name: shortName })); } catch(_) {}
  var label = document.getElementById('neural-selected-label');
  if (label) {
    label.textContent = shortName + ' (' + inst.epic + ')';
  }
  var dd = document.getElementById('neural-instrument-results');
  if (dd) dd.style.display = 'none';
  var si = document.getElementById('neural-instrument-search');
  if (si) si.value = '';
  ['neural-test-buy','neural-test-sell','neural-force-buy','neural-force-sell','neural-backtest-btn'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.disabled = false;
  });
  var btEpic = document.getElementById('bt-train-epic');
  if (btEpic) btEpic.textContent = shortName;
  var ltEpic = document.getElementById('lt-train-epic');
  if (ltEpic) ltEpic.textContent = shortName;
  var ae = document.getElementById('cortex-active-epic');
  if (ae) ae.textContent = shortName;
  addBrainLog('INFO', 'Instrument selected: ' + shortName + ' (' + inst.epic + ')' + (inst.isStream ? ' [STREAM]' : ''));
  neuralPriceHistory = [];
  neuralVolumeHistory = [];
  neuralTimeLabels = [];
  neuralTickCount = 0;
  neuralLastPrice = null;
  resetAntennaState();
  stopNeuralTickPolling();
  startNeuralTickPolling();
  loadPatternMemory(inst.epic);
  refreshStreamInstruments();
}

async function neuralPlaceOrder(direction) {
  var size = parseFloat((document.getElementById('neural-position-size') || {}).value) || 0.5;
  if (!neuralCurrentEpic) { addBrainLog('ERROR', 'No instrument selected'); return; }
  addBrainLog('INFO', 'Placing ' + direction + ' order: ' + neuralCurrentEpic + ' x' + size);
  devLog('INFO', 'ORDER: ' + direction + ' ' + neuralCurrentEpic + ' size=' + size);
  var statusDiv = document.getElementById('neural-trade-status');
  if (statusDiv) { statusDiv.textContent = 'Placing ' + direction + '...'; statusDiv.style.color = '#d29922'; }
  try {
    var result = await apiPost('/api/ig/positions/open', { epic: neuralCurrentEpic, direction: direction, size: size });
    devLog('DATA', 'Order result: ' + JSON.stringify(result));
    if (result && result.dealReference) {
      addBrainLog('INFO', direction + ' order placed: ' + result.dealReference);
      if (statusDiv) { statusDiv.textContent = direction + ' placed: ' + result.dealReference; statusDiv.style.color = '#2dc653'; }
      brainTradeLog.push({ timestamp: new Date().toISOString(), epic: neuralCurrentEpic, direction: direction, size: size, dealRef: result.dealReference, price: neuralLastPrice });
      if (trainingModeActive) {
        addBrainLog('INFO', 'Training: auto-sugar for executed trade');
        brainFeedback('sugar');
      }
    } else {
      var err = (result && result.error) || 'Order failed';
      addBrainLog('ERROR', direction + ' failed: ' + err);
      if (statusDiv) { statusDiv.textContent = direction + ' failed: ' + err; statusDiv.style.color = '#f85149'; }
      if (trainingModeActive) {
        addBrainLog('INFO', 'Training: auto-pain for failed trade');
        brainFeedback('pain');
      }
    }
  } catch (e) {
    addBrainLog('ERROR', direction + ' error: ' + e.message);
    if (statusDiv) { statusDiv.textContent = direction + ' error: ' + e.message; statusDiv.style.color = '#f85149'; }
  }
}

async function neuralCloseAllPositions() {
  if (!confirm('Close ALL positions?')) return;
  try {
    var posData = await apiFetch('/api/ig/positions');
    var positions = (posData && posData.positions) || [];
    var closed = 0;
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var dealId = p.position ? p.position.dealId : p.dealId;
      if (dealId) {
        await apiPost('/api/ig/positions/close', { dealId: dealId });
        closed++;
      }
    }
    addBrainLog('INFO', 'Closed ' + closed + ' positions');
    showToast('Closed ' + closed + ' positions', true);
  } catch (e) {
    addBrainLog('ERROR', 'Close all failed: ' + e.message);
  }
}

async function loadAccountInfo() {
  try {
    var data = await apiFetch('/api/ig/account');
    if (data && data.accounts && data.accounts.length > 0) {
      var acct = data.accounts[0];
      var bal = acct.balance || {};
      var balEl = document.getElementById('neural-balance');
      var pnlEl = document.getElementById('neural-pnl');
      if (balEl) balEl.textContent = (bal.balance != null ? bal.balance.toFixed(2) : '--');
      if (pnlEl) {
        var pnl = bal.profitLoss || 0;
        pnlEl.textContent = (pnl >= 0 ? '+' : '') + pnl.toFixed(2);
        pnlEl.style.color = pnl >= 0 ? '#2dc653' : '#f85149';
      }
      updateNeuralIGIndicator(true);
      devLog('DATA', 'Account: balance=' + bal.balance + ' pnl=' + bal.profitLoss);
    }
  } catch (e) {
    devLog('WARN', 'Account info failed: ' + e.message);
  }
}


function neuralProcessTick(tick) {
  neuralTickCount++;
  var el = document.getElementById('neural-tick-count');
  if (el) el.textContent = neuralTickCount;
  var bid = parseFloat(tick.bid) || 0;
  var ask = parseFloat(tick.offer || tick.ask) || 0;
  var price = (bid + ask) / 2;
  if (price <= 0 && neuralLastPrice) price = neuralLastPrice;
  var spread = (ask - bid).toFixed(5);
  var volume = parseInt(tick.volume) || 0;
  if (price > 0) neuralLastPrice = price;
  if (price > 0) antennaPushTick(price, bid, ask, volume);
  if (price > 0) channelAddTick(price);
  var now = new Date();
  var timeStr = now.toLocaleTimeString();
  var el2 = document.getElementById('neural-last-tick');
  if (el2) el2.textContent = timeStr;
  var feed = document.getElementById('neural-tick-feed');
  if (feed) {
    if (feed.querySelector('.empty')) feed.innerHTML = '';
    var div = document.createElement('div');
    div.style.cssText = 'display:grid;grid-template-columns:70px 70px 70px 70px 50px 60px;gap:4px;padding:4px 0;border-bottom:1px solid #21262d;font-size:11px;font-family:monospace';
    div.innerHTML = '<span style="color:#58a6ff">' + timeStr + '</span>' +
      '<span style="color:#f85149">' + bid.toFixed(5) + '</span>' +
      '<span style="color:#2dc653">' + ask.toFixed(5) + '</span>' +
      '<span style="color:#d29922;font-weight:bold">' + price.toFixed(5) + '</span>' +
      '<span style="color:#79c0ff">' + volume + '</span>' +
      '<span style="color:#bc8cff">' + spread + '</span>';
    if (feed.firstChild) feed.insertBefore(div, feed.firstChild);
    else feed.appendChild(div);
    while (feed.children.length > 20) feed.lastChild.remove();
  }
  var pc = document.getElementById('neural-price-current');
  if (pc) pc.textContent = price.toFixed(4);
  var sc = document.getElementById('neural-spread-current');
  if (sc) sc.textContent = spread;
  var vc = document.getElementById('neural-volume-current');
  if (vc) vc.textContent = volume;
  var srcEl = document.getElementById('lt-tick-source');
  if (srcEl && !liveTrainRunning) { srcEl.textContent = 'Connected'; srcEl.style.color = '#2dc653'; }
  var actLog = document.getElementById('brain-activity-log');
  if (actLog) {
    var firstChild = actLog.querySelector('[style*="color:#484f58"]');
    if (firstChild && firstChild.textContent.indexOf('Waiting') > -1) actLog.innerHTML = '';
    var line = document.createElement('div');
    line.style.cssText = 'color:#c9d1d9;padding:1px 0;border-bottom:1px solid #161b22';
    line.textContent = '[' + timeStr + '] TICK ' + price.toFixed(4) + ' spread=' + spread + ' vol=' + volume;
    actLog.appendChild(line);
    while (actLog.children.length > 100) actLog.firstChild.remove();
    actLog.scrollTop = actLog.scrollHeight;
  }
  neuralPriceHistory.push(price);
  neuralVolumeHistory.push(volume);
  neuralTimeLabels.push(timeStr);
  if (neuralPriceHistory.length > 50) { neuralPriceHistory.shift(); neuralVolumeHistory.shift(); neuralTimeLabels.shift(); }
  if (neuralPriceChart) {
    neuralPriceChart.data.labels = neuralTimeLabels;
    neuralPriceChart.data.datasets[0].data = neuralPriceHistory;
    neuralPriceChart.update('none');
  }
  if (neuralVolumeChart) {
    neuralVolumeChart.data.labels = neuralTimeLabels;
    neuralVolumeChart.data.datasets[0].data = neuralVolumeHistory;
    neuralVolumeChart.update('none');
  }
  if (liveTrainRunning) {
    feedLiveTrainingTick(price, volume, parseFloat(spread) || 0);
  }
  stimulateBrainFromTick(tick.epic || neuralCurrentEpic, price, volume, spread);
  if (neuralTickCount % 5 === 0 && !cortexAutoTradeEnabled) {
    try { renderAntennaPressure(antennaComputePressure()); } catch(e) {}
  }
}

async function stimulateBrainFromTick(epic, price, volume, spread) {
  if (!brainConnected) return;
  var prev = prevPrices[epic] || price;
  prevPrices[epic] = price;
  var pressure = antennaComputePressure();
  var result = await brainStimulatePrice({
    epic: epic,
    price: price,
    prevPrice: prev,
    volume: volume || 0,
    spread: parseFloat(spread) || 0,
    pressure: pressure
  });
  if (result) {
    updateBrainSignals(result);
    devLog('DATA', 'Brain: buy=' + (result.buy_signal||0).toFixed(2) + ' sell=' + (result.sell_signal||0).toFixed(2) + ' hold=' + (result.hold_signal||0).toFixed(2) + ' step=' + result.step_count);
  }
}

function updateBrainSignals(result) {
  var buyEl = document.getElementById('neural-signal-buy');
  var sellEl = document.getElementById('neural-signal-sell');
  var holdEl = document.getElementById('neural-signal-hold');
  var stepEl = document.getElementById('neural-step-count');
  if (buyEl) { buyEl.textContent = (result.buy_signal || 0).toFixed(1); buyEl.style.color = (result.buy_signal || 0) > (result.sell_signal || 0) ? '#2dc653' : '#8b949e'; }
  if (sellEl) { sellEl.textContent = (result.sell_signal || 0).toFixed(1); sellEl.style.color = (result.sell_signal || 0) > (result.buy_signal || 0) ? '#f85149' : '#8b949e'; }
  if (holdEl) holdEl.textContent = (result.hold_signal || 0).toFixed(1);
  if (stepEl) stepEl.textContent = result.step_count || 0;
  var rateEl = document.getElementById('neural-motor-rate');
  if (rateEl) rateEl.textContent = (result.avg_rate || result.motor_rates || 0).toFixed(1) + ' Hz';
  var actLog = document.getElementById('brain-activity-log');
  if (actLog && ((result.buy_signal || 0) > 0.5 || (result.sell_signal || 0) > 0.5)) {
    var now = new Date().toLocaleTimeString();
    var sig = (result.buy_signal || 0) > (result.sell_signal || 0) ? 'BUY' : 'SELL';
    var sigColor = sig === 'BUY' ? '#2dc653' : '#f85149';
    var line = document.createElement('div');
    line.style.cssText = 'padding:1px 0;border-bottom:1px solid #161b22';
    line.innerHTML = '<span style="color:#58a6ff">[' + now + ']</span> <span style="font-weight:600;color:' + sigColor + '">' + sig + '</span> buy=' + (result.buy_signal||0).toFixed(1) + ' sell=' + (result.sell_signal||0).toFixed(1) + ' <span style="color:#bc8cff">step ' + (result.step_count||0) + '</span>';
    actLog.appendChild(line);
    while (actLog.children.length > 100) actLog.firstChild.remove();
    actLog.scrollTop = actLog.scrollHeight;
  }
  var statusEl = document.getElementById('brain-process-status');
  if (statusEl && brainConnected) {
    statusEl.textContent = 'Running (step ' + (result.step_count || 0) + ', buy=' + (result.buy_signal||0).toFixed(1) + ' sell=' + (result.sell_signal||0).toFixed(1) + ')';
    statusEl.style.color = '#2dc653';
  }
}

async function startNeuralTickPolling() {
  if (neuralTickPollInterval) return;
  if (!neuralCurrentEpic) return;
  addBrainLog('INFO', 'Starting tick polling for ' + neuralCurrentEpic);
  devLog('INFO', 'Tick polling started: ' + neuralCurrentEpic);
  var pollTick = async function() {
    try {
      var gotTick = false;
      var data = await apiFetch('/api/ig/stream/prices');
      if (data && data.prices) {
        var epicKey = data.prices[neuralCurrentEpic] ? neuralCurrentEpic : null;
        if (!epicKey) {
          var keys = Object.keys(data.prices);
          var shortName = neuralCurrentEpic.replace('CS.D.', '').replace('.CFA.IP', '').replace('.CFD.IP', '').replace('.CFM.IP', '').replace('.CAF.IP', '');
          for (var k = 0; k < keys.length; k++) {
            if (keys[k].indexOf(shortName) > -1) { epicKey = keys[k]; break; }
          }
        }
        if (epicKey) {
          var p = data.prices[epicKey];
          if (p.bid && p.offer) {
            updateNeuralIGIndicator(true);
            neuralProcessTick({ epic: neuralCurrentEpic, bid: p.bid, offer: p.offer, volume: p.lastTradedVolume || 0 });
            gotTick = true;
          }
        }
      }
      if (!gotTick) {
        var searchName = neuralCurrentEpic.replace(/^CS\.D\./,'').replace(/\.CF[ADMS]\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/CFA/,'').replace(/CFD/,'').toLowerCase();
        var snapData = await apiFetch('/api/ig/markets?q=' + encodeURIComponent(searchName));
        if (snapData && snapData.markets) {
          var match = null;
          for (var m = 0; m < snapData.markets.length; m++) {
            if (snapData.markets[m].epic === neuralCurrentEpic) { match = snapData.markets[m]; break; }
          }
          if (!match && snapData.markets.length > 0) match = snapData.markets[0];
          if (match && match.bid && match.offer) {
            updateNeuralIGIndicator(true);
            neuralProcessTick({ epic: neuralCurrentEpic, bid: match.bid, offer: match.offer, volume: 0 });
            gotTick = true;
          }
        }
      }
      if (!gotTick) {
        var histData = await apiFetch('/api/ig/prices/' + encodeURIComponent(neuralCurrentEpic) + '?resolution=MINUTE&max=1');
        if (histData && histData.prices && histData.prices.length > 0) {
          var latest = histData.prices[histData.prices.length - 1];
          updateNeuralIGIndicator(true);
          neuralProcessTick({
            epic: neuralCurrentEpic,
            bid: latest.closePrice ? latest.closePrice.bid : (latest.bid || 0),
            offer: latest.closePrice ? latest.closePrice.ask : (latest.ask || latest.offer || 0),
            volume: latest.lastTradedVolume || 0
          });
        }
      }
    } catch (e) {
      devLog('ERROR', 'Tick poll error: ' + e.message);
    }
  };
  await pollTick();
  neuralTickPollInterval = setInterval(pollTick, 3000);
}

function stopNeuralTickPolling() {
  if (neuralTickPollInterval) { clearInterval(neuralTickPollInterval); neuralTickPollInterval = null; }
  devLog('INFO', 'Tick polling stopped');
}

function initNeuralCharts() {
  if (typeof Chart === 'undefined') return;
  var pc = document.getElementById('neuralPriceChart');
  if (pc && !neuralPriceChart) {
    neuralPriceChart = new Chart(pc, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Price', data: [], borderColor: '#d29922', backgroundColor: 'rgba(210,153,34,0.1)', borderWidth: 2, tension: 0.3, fill: true, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { color: '#8b949e' } } }, scales: { y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e' } }, x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxTicksLimit: 10 } } } }
    });
  }
  var vch = document.getElementById('neuralVolumeChart');
  if (vch && !neuralVolumeChart) {
    neuralVolumeChart = new Chart(vch, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Volume', data: [], backgroundColor: '#79c0ff', borderColor: '#58a6ff', borderWidth: 1 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { color: '#8b949e' } } }, scales: { y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e' } }, x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxTicksLimit: 10 } } } }
    });
  }
}

async function neuralBacktest() {
  var btn = document.getElementById('neural-backtest-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Running...'; }
  addBrainLog('INFO', 'Starting backtest for ' + neuralCurrentEpic);
  try {
    var data = await apiFetch('/api/ig/prices?epic=' + encodeURIComponent(neuralCurrentEpic) + '&resolution=MINUTE&max=250');
    var candles = (data && data.prices) || [];
    if (candles.length === 0) {
      addBrainLog('WARN', 'No historical data for backtest');
      if (btn) { btn.disabled = false; btn.textContent = 'Backtest'; }
      return;
    }
    addBrainLog('INFO', 'Processing ' + candles.length + ' candles through brain...');
    var wins = 0, losses = 0;
    for (var i = 1; i < candles.length; i++) {
      var c = candles[i];
      var cp = candles[i - 1];
      var price = c.closePrice ? c.closePrice.bid : (c.bid || 0);
      var prevPrice = cp.closePrice ? cp.closePrice.bid : (cp.bid || 0);
      if (price > 0 && prevPrice > 0) {
        var candleVol = c.lastTradedVolume || 0;
        var result = await brainStimulatePrice({ epic: neuralCurrentEpic, price: price, prevPrice: prevPrice, volume: candleVol, spread: Math.abs(price - prevPrice), pressure: antennaComputePressure() });
        if (result) {
          var action = result.buy_signal > result.sell_signal ? 'BUY' : 'SELL';
          var nextPrice = i + 1 < candles.length ? (candles[i + 1].closePrice ? candles[i + 1].closePrice.bid : candles[i + 1].bid) : price;
          if ((action === 'BUY' && nextPrice > price) || (action === 'SELL' && nextPrice < price)) wins++;
          else losses++;
        }
      }
    }
    var total = wins + losses;
    var pct = total > 0 ? (wins / total * 100) : 0;
    addBrainLog('INFO', 'Backtest done: ' + wins + ' wins / ' + losses + ' losses = ' + pct.toFixed(1) + '% (' + candles.length + ' candles)');
    showToast('Backtest: ' + pct.toFixed(1) + '% win rate (' + total + ' signals)', true);
  } catch (e) {
    addBrainLog('ERROR', 'Backtest error: ' + e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Backtest'; }
}

async function startObserverMode() {
  if (observerRunning) return;
  observerRunning = true;
  var toggleBtn = document.getElementById('neural-observer-start');
  var stopBtn = document.getElementById('neural-observer-stop');
  var statusEl = document.getElementById('neural-observer-status');
  if (toggleBtn) toggleBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  if (statusEl) statusEl.textContent = 'Observing... Collecting baseline';
  addBrainLog('INFO', 'Observer mode started');
  var count = 0, maxObs = 60;
  observerInterval = setInterval(async function() {
    if (!observerRunning) { clearInterval(observerInterval); return; }
    var res = await brainObserve();
    count++;
    if (res) updateBrainSignals(res);
    if (statusEl) statusEl.textContent = 'Observing [' + count + '/' + maxObs + ']' + (res ? ' rate=' + (res.avg_rate || 0).toFixed(1) + 'Hz' : '');
    if (count >= maxObs) {
      clearInterval(observerInterval);
      observerRunning = false;
      if (toggleBtn) toggleBtn.style.display = 'inline-block';
      if (stopBtn) stopBtn.style.display = 'none';
      if (statusEl) statusEl.textContent = 'Complete! Collected ' + count + ' samples';
      addBrainLog('INFO', 'Observer complete: ' + count + ' samples');
    }
  }, 1000);
}

function stopObserverMode() {
  if (observerInterval) clearInterval(observerInterval);
  observerRunning = false;
  var toggleBtn = document.getElementById('neural-observer-start');
  var stopBtn = document.getElementById('neural-observer-stop');
  var statusEl = document.getElementById('neural-observer-status');
  if (toggleBtn) toggleBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (statusEl) statusEl.textContent = 'Stopped';
  addBrainLog('INFO', 'Observer stopped');
}

var calibLastResults = null;
var calibAutoPassEnabled = false;
var calibAutoPassInterval = 30;
var calibAutoPassTimer = null;

var CALIB_ALL_TIMEFRAMES = ['SECOND','SECOND_2','SECOND_5','SECOND_10','SECOND_30','MINUTE','MINUTE_2','MINUTE_3','MINUTE_5','MINUTE_15','MINUTE_30','HOUR','HOUR_4','DAY'];
var CALIB_TF_LABELS = {SECOND:'1s',SECOND_2:'2s',SECOND_5:'5s',SECOND_10:'10s',SECOND_30:'30s',MINUTE:'1m',MINUTE_2:'2m',MINUTE_3:'3m',MINUTE_5:'5m',MINUTE_15:'15m',MINUTE_30:'30m',HOUR:'1h',HOUR_4:'4h',DAY:'D1'};

async function calibFetchCandles(epic, tf, maxCandles) {
  var url = '/api/ig/scalper/candles?epic=' + encodeURIComponent(epic) + '&resolution=' + tf + '&max=' + maxCandles;
  var data = await apiFetch(url);
  var candles = (data && data.prices) || [];
  if (candles.length < 20) {
    var igUrl = '/api/ig/prices/' + encodeURIComponent(epic) + '?resolution=' + tf + '&max=' + maxCandles;
    var igData = await apiFetch(igUrl);
    candles = (igData && igData.prices) || [];
  }
  return candles;
}

async function calibRunThresholdScan(candles, epic, tf, thresholds) {
  var results = [];
  for (var ti = 0; ti < thresholds.length; ti++) {
    if (!calibrationRunning) break;
    var thresh = thresholds[ti];
    var btResult = await brainFetch('/backtest-train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candles: candles, epic: epic, stopLossPips: cortexStopLossPips, takeProfitPips: cortexTakeProfitPips,
        size: cortexMinPositionSize, plMultiplier: 1, minHoldCandles: cortexMinHoldCandles,
        signalThreshold: thresh, confirmCandles: cortexConfirmCandles, antennaEnabled: true,
        timeframe: tf, dryRun: true,
      })
    });
    if (btResult) {
      results.push({
        threshold: thresh, tf: tf, tfLabel: CALIB_TF_LABELS[tf] || tf,
        trades: btResult.trades ? btResult.trades.length : 0,
        pnl: btResult.total_pnl || 0, winRate: btResult.win_rate || 0,
        sugar: btResult.sugar_count || 0, pain: btResult.pain_count || 0,
        candles: candles.length,
      });
    }
  }
  return results;
}

async function startCalibration() {
  if (calibrationRunning) return;
  calibrationRunning = true;
  calibLastResults = null;
  var epic = neuralCurrentEpic;
  if (!epic) {
    addBrainLog('ERROR', 'Select an instrument before calibrating');
    calibrationRunning = false;
    return;
  }
  var maxCandlesRaw = parseInt((document.getElementById('neural-calib-candles') || {}).value);
  var maxCandles = (maxCandlesRaw > 0) ? maxCandlesRaw : 999999;
  var maxLabel = (maxCandlesRaw > 0) ? String(maxCandlesRaw) : 'ALL';
  var tf = (document.getElementById('neural-calib-tf') || {}).value || 'MINUTE';
  var rangeMode = (document.getElementById('neural-calib-range') || {}).value || 'normal';
  var statusEl = document.getElementById('neural-calibration-status');
  var progDiv = document.getElementById('neural-calib-progress');
  var barEl = document.getElementById('neural-calib-bar');
  var pctEl = document.getElementById('neural-calib-pct');
  var resultsDiv = document.getElementById('neural-calib-results');
  var startBtn = document.getElementById('neural-calibration-start');
  var stopBtn = document.getElementById('neural-calibration-stop');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  if (progDiv) progDiv.style.display = 'block';
  if (resultsDiv) resultsDiv.style.display = 'none';
  if (barEl) barEl.style.width = '0%';
  if (pctEl) pctEl.textContent = 'Fetching candles...';
  if (statusEl) statusEl.textContent = 'Fetching...';
  cortexReadParams();

  var thresholds;
  if (rangeMode === 'narrow') thresholds = [3, 5, 7, 9, 12, 15];
  else if (rangeMode === 'wide') thresholds = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40];
  else thresholds = [2, 3, 5, 7, 10, 13, 16, 20, 25];

  var isAllTf = (tf === 'ALL_TF');
  var tfList = isAllTf ? CALIB_ALL_TIMEFRAMES : [tf];
  addBrainLog('INFO', 'Auto-calibration: ' + epic + ' tf=' + (isAllTf ? 'ALL(' + tfList.length + ')' : tf) + ' candles=' + maxLabel + ' range=' + rangeMode);

  try {
    var allResults = [];
    var totalSteps = tfList.length * thresholds.length;
    var stepsDone = 0;
    var tfWithData = 0;

    for (var tfi = 0; tfi < tfList.length; tfi++) {
      if (!calibrationRunning) break;
      var curTf = tfList[tfi];
      var curLabel = CALIB_TF_LABELS[curTf] || curTf;
      if (pctEl) pctEl.textContent = isAllTf ? ('TF ' + curLabel + ' (' + (tfi+1) + '/' + tfList.length + ') fetching...') : 'Fetching candles...';
      if (statusEl) statusEl.textContent = isAllTf ? ('Scanning ' + curLabel + '...') : 'Fetching...';

      var candles = await calibFetchCandles(epic, curTf, maxCandles);
      if (candles.length < 20) {
        addBrainLog('INFO', 'TF ' + curLabel + ': skipped (' + candles.length + ' candles, need 20+)');
        stepsDone += thresholds.length;
        var skipPct = Math.round((stepsDone / totalSteps) * 100);
        if (barEl) barEl.style.width = skipPct + '%';
        continue;
      }
      tfWithData++;
      addBrainLog('INFO', 'TF ' + curLabel + ': ' + candles.length + ' candles, testing ' + thresholds.length + ' thresholds...');

      for (var ti = 0; ti < thresholds.length; ti++) {
        if (!calibrationRunning) break;
        var thresh = thresholds[ti];
        stepsDone++;
        var pct = Math.round((stepsDone / totalSteps) * 100);
        if (barEl) barEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = (isAllTf ? curLabel + ' ' : '') + 'Thresh ' + thresh + ' (' + stepsDone + '/' + totalSteps + ')';

        var btResult = await brainFetch('/backtest-train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candles: candles, epic: epic, stopLossPips: cortexStopLossPips, takeProfitPips: cortexTakeProfitPips,
            size: cortexMinPositionSize, plMultiplier: 1, minHoldCandles: cortexMinHoldCandles,
            signalThreshold: thresh, confirmCandles: cortexConfirmCandles, antennaEnabled: true,
            timeframe: curTf, dryRun: true,
          })
        });
        if (btResult) {
          allResults.push({
            threshold: thresh, tf: curTf, tfLabel: curLabel,
            trades: btResult.trades ? btResult.trades.length : 0,
            pnl: btResult.total_pnl || 0, winRate: btResult.win_rate || 0,
            sugar: btResult.sugar_count || 0, pain: btResult.pain_count || 0,
            candles: candles.length,
          });
          addBrainLog('INFO', curLabel + ' Thresh=' + thresh + ': ' + (btResult.trades ? btResult.trades.length : 0) + ' trades, P&L=' + (btResult.total_pnl || 0).toFixed(2) + ', Win=' + (btResult.win_rate || 0) + '%');
        }
      }
    }

    if (!calibrationRunning) { stopCalibration(); return; }
    if (isAllTf && tfWithData === 0) {
      addBrainLog('ERROR', 'No timeframe had enough candle data for calibration');
      showToast('No candle data for any timeframe', false);
      calibrationRunning = false;
      if (startBtn) startBtn.style.display = 'inline-block';
      if (stopBtn) stopBtn.style.display = 'none';
      if (progDiv) progDiv.style.display = 'none';
      if (statusEl) statusEl.textContent = 'Failed: no data';
      return;
    }

    calibLastResults = allResults;
    calibLastResults._isMultiTf = isAllTf;
    var displayTf = isAllTf ? ('ALL (' + tfWithData + ' TFs)') : tf;
    var totalCandles = isAllTf ? allResults.reduce(function(a,r) { return Math.max(a, r.candles); }, 0) : (allResults[0] ? allResults[0].candles : 0);
    calibShowResults(allResults, totalCandles, displayTf, epic);
  } catch (e) {
    addBrainLog('ERROR', 'Calibration error: ' + e.message);
    showToast('Calibration error: ' + e.message, false);
    if (statusEl) statusEl.textContent = 'Error';
  }

  calibrationRunning = false;
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (progDiv) progDiv.style.display = 'none';
}

function calibShowResults(results, candleCount, tf, epic) {
  var resultsDiv = document.getElementById('neural-calib-results');
  var bodyEl = document.getElementById('neural-calib-results-body');
  var statusEl = document.getElementById('neural-calibration-status');
  if (!bodyEl || !resultsDiv) return;

  var isMultiTf = !!(calibLastResults && calibLastResults._isMultiTf);
  var withTrades = results.filter(function(r) { return r.trades > 0; });

  if (withTrades.length === 0) {
    bodyEl.innerHTML = '<div style="color:#f85149">No threshold level produced any trades. The brain may need more training first, or try a wider range / more candles.</div>';
    resultsDiv.style.display = 'block';
    if (statusEl) statusEl.textContent = 'No trades found';
    addBrainLog('WARN', 'Calibration: no threshold produced trades');
    return;
  }

  var bestWinRate = withTrades.reduce(function(a, b) { return (b.winRate > a.winRate || (b.winRate === a.winRate && b.pnl > a.pnl)) ? b : a; }, withTrades[0]);
  var bestPnl = withTrades.reduce(function(a, b) { return b.pnl > a.pnl ? b : a; }, withTrades[0]);

  var recommended = bestWinRate;
  if (bestPnl.pnl > 0 && bestPnl.pnl > recommended.pnl * 1.5 && bestPnl.winRate >= 40) {
    recommended = bestPnl;
  }

  calibLastResults._recommended = recommended;
  calibLastResults._bestPnl = bestPnl;
  calibLastResults._bestWinRate = bestWinRate;

  var recTfNote = isMultiTf ? (' @ ' + (recommended.tfLabel || recommended.tf)) : '';
  var pnlTfNote = isMultiTf ? (' @ ' + (bestPnl.tfLabel || bestPnl.tf)) : '';

  var html = '<div style="margin-bottom:8px"><span style="color:#8b949e">Tested on:</span> ' + tf + ' candles (' + epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'') + ')</div>';
  html += '<div style="margin-bottom:8px"><span style="color:#8b949e">Current thresholds:</span> Buy=' + cortexBuyThreshold + ' Sell=' + cortexSellThreshold + '</div>';

  var tfCol = isMultiTf ? '<th style="text-align:left;padding:4px;color:#8b949e">TF</th>' : '';
  var candlesCol = isMultiTf ? '<th style="text-align:right;padding:4px;color:#8b949e">Candles</th>' : '';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px">';
  html += '<tr style="border-bottom:1px solid #30363d">' + tfCol + '<th style="text-align:left;padding:4px;color:#8b949e">Threshold</th><th style="text-align:right;padding:4px;color:#8b949e">Trades</th><th style="text-align:right;padding:4px;color:#8b949e">Win %</th><th style="text-align:right;padding:4px;color:#8b949e">P&L</th>' + candlesCol + '<th style="padding:4px"></th></tr>';
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var isRec = (r.threshold === recommended.threshold && r.tf === recommended.tf);
    var isBest = (r.threshold === bestPnl.threshold && r.tf === bestPnl.tf);
    var rowBg = isRec ? 'background:#0d2137;' : '';
    var pnlColor = r.pnl > 0 ? '#2dc653' : (r.pnl < 0 ? '#f85149' : '#8b949e');
    var wrColor = r.winRate >= 60 ? '#2dc653' : (r.winRate >= 40 ? '#d29922' : '#f85149');
    var badge = '';
    if (isRec && isBest) badge = '<span style="font-size:9px;padding:1px 5px;background:#1b4332;color:#2dc653;border-radius:6px;margin-left:4px">RECOMMENDED</span>';
    else if (isRec) badge = '<span style="font-size:9px;padding:1px 5px;background:#1b4332;color:#2dc653;border-radius:6px;margin-left:4px">BEST WIN</span>';
    else if (isBest) badge = '<span style="font-size:9px;padding:1px 5px;background:#1a1028;color:#bc8cff;border-radius:6px;margin-left:4px">BEST P&L</span>';
    var tfTd = isMultiTf ? '<td style="padding:4px;color:#58a6ff;font-weight:600">' + (r.tfLabel || r.tf) + '</td>' : '';
    var candlesTd = isMultiTf ? '<td style="text-align:right;padding:4px;color:#484f58">' + (r.candles || '') + '</td>' : '';
    html += '<tr style="border-bottom:1px solid #21262d;' + rowBg + '">' + tfTd + '<td style="padding:4px;color:#c9d1d9">' + r.threshold + badge + '</td><td style="text-align:right;padding:4px;color:#c9d1d9">' + r.trades + '</td><td style="text-align:right;padding:4px;color:' + wrColor + '">' + r.winRate + '%</td><td style="text-align:right;padding:4px;color:' + pnlColor + '">' + r.pnl.toFixed(2) + '</td>' + candlesTd + '</tr>';
  }
  html += '</table>';

  html += '<div style="padding:8px;background:#161b22;border-radius:4px;border:1px solid #30363d">';
  html += '<div style="font-weight:600;color:#2dc653;margin-bottom:4px">Recommended: Threshold = ' + recommended.threshold + recTfNote + '</div>';
  html += '<div style="color:#8b949e;font-size:11px">' + recommended.trades + ' trades | Win rate: ' + recommended.winRate + '% | P&L: ' + recommended.pnl.toFixed(2) + (isMultiTf ? ' | ' + (recommended.candles||0) + ' candles' : '') + '</div>';
  if (bestPnl.threshold !== recommended.threshold || bestPnl.tf !== recommended.tf) {
    html += '<div style="color:#bc8cff;font-size:11px;margin-top:4px">Alt (best P&L): Threshold = ' + bestPnl.threshold + pnlTfNote + ' (' + bestPnl.trades + ' trades, Win=' + bestPnl.winRate + '%, P&L=' + bestPnl.pnl.toFixed(2) + ')</div>';
  }
  html += '</div>';

  bodyEl.innerHTML = html;
  resultsDiv.style.display = 'block';
  if (statusEl) statusEl.textContent = 'Done: recommended=' + recommended.threshold + recTfNote;
  addBrainLog('INFO', 'Calibration complete: recommended threshold=' + recommended.threshold + recTfNote + ' (Win=' + recommended.winRate + '%, P&L=' + recommended.pnl.toFixed(2) + ', ' + recommended.trades + ' trades)');
}

function calibApplyResult(result, label) {
  if (!result) { showToast('Run calibration first', false); return; }
  var t = result.threshold;
  var buyEl = document.getElementById('cortex-buy-thresh');
  var sellEl = document.getElementById('cortex-sell-thresh');
  if (buyEl) buyEl.value = t;
  if (sellEl) sellEl.value = t;
  cortexBuyThreshold = t;
  cortexSellThreshold = t;
  var tfNote = '';
  if (calibLastResults && calibLastResults._isMultiTf && result.tf) {
    cortexTimeframe = result.tf;
    var tfEl = document.getElementById('cortex-timeframe');
    if (tfEl) tfEl.value = result.tf;
    tfNote = ' TF=' + (result.tfLabel || result.tf);
  }
  cortexSaveState();
  addBrainLog('CORTEX', 'Applied ' + label + ' thresholds: Buy=' + t + ' Sell=' + t + tfNote);
  showToast('Thresholds set to ' + t + tfNote, true);
}

function calibApplyRecommended() {
  if (!calibLastResults || !calibLastResults._recommended) { showToast('Run calibration first', false); return; }
  calibApplyResult(calibLastResults._recommended, 'recommended');
}

function calibApplyBestPnl() {
  if (!calibLastResults || !calibLastResults._bestPnl) { showToast('Run calibration first', false); return; }
  calibApplyResult(calibLastResults._bestPnl, 'best P&L');
}

function stopCalibration() {
  calibrationRunning = false;
  var statusEl = document.getElementById('neural-calibration-status');
  if (statusEl) statusEl.textContent = 'Stopped';
  var startBtn = document.getElementById('neural-calibration-start');
  var stopBtn = document.getElementById('neural-calibration-stop');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  addBrainLog('INFO', 'Calibration stopped');
}

function toggleCalibAutoPass() {
  var cb = document.getElementById('calib-auto-pass');
  calibAutoPassEnabled = cb ? cb.checked : false;
  var intEl = document.getElementById('calib-auto-pass-interval');
  if (intEl) calibAutoPassInterval = Math.max(1, parseInt(intEl.value) || 30);
  if (calibAutoPassEnabled) {
    startCalibAutoPassTimer();
    addBrainLog('CORTEX', 'Auto-pass ENABLED: re-calibrate every ' + calibAutoPassInterval + ' min, auto-apply thresholds');
  } else {
    stopCalibAutoPassTimer();
    addBrainLog('CORTEX', 'Auto-pass DISABLED');
  }
  cortexSaveState();
  updateCalibAutoPassUI();
}

function updateCalibAutoPassInterval() {
  var intEl = document.getElementById('calib-auto-pass-interval');
  calibAutoPassInterval = Math.max(1, parseInt((intEl || {}).value) || 30);
  if (calibAutoPassEnabled) {
    stopCalibAutoPassTimer();
    startCalibAutoPassTimer();
    addBrainLog('CORTEX', 'Auto-pass interval changed to ' + calibAutoPassInterval + ' min');
  }
  cortexSaveState();
}

function startCalibAutoPassTimer() {
  stopCalibAutoPassTimer();
  var ms = calibAutoPassInterval * 60 * 1000;
  calibAutoPassTimer = setInterval(function() {
    if (!calibAutoPassEnabled) { stopCalibAutoPassTimer(); return; }
    if (calibrationRunning) return;
    addBrainLog('CORTEX', 'Auto-pass: starting scheduled calibration...');
    runAutoPassCalibration();
  }, ms);
  updateCalibAutoPassUI();
}

function stopCalibAutoPassTimer() {
  if (calibAutoPassTimer) { clearInterval(calibAutoPassTimer); calibAutoPassTimer = null; }
  updateCalibAutoPassUI();
}

function updateCalibAutoPassUI() {
  var statusEl = document.getElementById('calib-auto-pass-status');
  if (!statusEl) return;
  if (calibAutoPassEnabled && calibAutoPassTimer) {
    statusEl.textContent = 'ON — every ' + calibAutoPassInterval + 'min';
    statusEl.style.color = '#2dc653';
  } else if (calibAutoPassEnabled) {
    statusEl.textContent = 'Enabled (starting...)';
    statusEl.style.color = '#d29922';
  } else {
    statusEl.textContent = 'OFF';
    statusEl.style.color = '#8b949e';
  }
}

async function runAutoPassCalibration() {
  if (calibrationRunning) return;
  var epic = neuralCurrentEpic;
  if (!epic) { addBrainLog('WARN', 'Auto-pass: no instrument selected'); return; }
  calibrationRunning = true;
  calibLastResults = null;
  var maxCandlesRaw = parseInt((document.getElementById('neural-calib-candles') || {}).value);
  var maxCandles = (maxCandlesRaw > 0) ? maxCandlesRaw : 999999;
  var tf = (document.getElementById('neural-calib-tf') || {}).value || 'MINUTE';
  var rangeMode = (document.getElementById('neural-calib-range') || {}).value || 'normal';
  cortexReadParams();

  var thresholds;
  if (rangeMode === 'narrow') thresholds = [3, 5, 7, 9, 12, 15];
  else if (rangeMode === 'wide') thresholds = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40];
  else thresholds = [2, 3, 5, 7, 10, 13, 16, 20, 25];

  var isAllTf = (tf === 'ALL_TF');
  var tfList = isAllTf ? CALIB_ALL_TIMEFRAMES : [tf];

  var statusEl = document.getElementById('neural-calibration-status');
  if (statusEl) statusEl.textContent = 'Auto-pass running' + (isAllTf ? ' (all TFs)...' : '...');

  try {
    var allResults = [];
    for (var tfi = 0; tfi < tfList.length; tfi++) {
      if (!calibAutoPassEnabled) break;
      var curTf = tfList[tfi];
      var candles = await calibFetchCandles(epic, curTf, maxCandles);
      if (candles.length < 20) continue;
      addBrainLog('INFO', 'Auto-pass: ' + (CALIB_TF_LABELS[curTf]||curTf) + ' ' + candles.length + ' candles, testing ' + thresholds.length + ' thresholds');

      for (var ti = 0; ti < thresholds.length; ti++) {
        if (!calibAutoPassEnabled) break;
        var thresh = thresholds[ti];
        var btResult = await brainFetch('/backtest-train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candles: candles, epic: epic, stopLossPips: cortexStopLossPips, takeProfitPips: cortexTakeProfitPips,
            size: cortexMinPositionSize, plMultiplier: 1, minHoldCandles: cortexMinHoldCandles,
            signalThreshold: thresh, confirmCandles: cortexConfirmCandles, antennaEnabled: true, timeframe: curTf, dryRun: true,
          })
        });
        if (btResult) {
          allResults.push({
            threshold: thresh, tf: curTf, tfLabel: CALIB_TF_LABELS[curTf] || curTf,
            trades: btResult.trades ? btResult.trades.length : 0,
            pnl: btResult.total_pnl || 0, winRate: btResult.win_rate || 0,
            candles: candles.length,
          });
        }
      }
    }
    calibLastResults = allResults;
    if (isAllTf) calibLastResults._isMultiTf = true;
    var withTrades = allResults.filter(function(r) { return r.trades > 0; });
    if (withTrades.length === 0) {
      addBrainLog('WARN', 'Auto-pass: no threshold produced trades');
      if (statusEl) statusEl.textContent = 'Auto-pass: no trades';
      calibrationRunning = false;
      return;
    }
    if (!calibAutoPassEnabled) {
      addBrainLog('CORTEX', 'Auto-pass disabled during scan — discarding results');
      if (statusEl) statusEl.textContent = 'Aborted (disabled)';
      calibrationRunning = false;
      return;
    }
    var best = withTrades.reduce(function(a, b) { return (b.winRate > a.winRate || (b.winRate === a.winRate && b.pnl > a.pnl)) ? b : a; }, withTrades[0]);
    var bestPnl = withTrades.reduce(function(a, b) { return b.pnl > a.pnl ? b : a; }, withTrades[0]);
    var pick = best;
    if (bestPnl.pnl > 0 && bestPnl.pnl > pick.pnl * 1.5 && bestPnl.winRate >= 40) pick = bestPnl;

    var oldBuy = cortexBuyThreshold;
    var oldSell = cortexSellThreshold;
    cortexBuyThreshold = pick.threshold;
    cortexSellThreshold = pick.threshold;
    var buyEl = document.getElementById('cortex-buy-thresh');
    var sellEl = document.getElementById('cortex-sell-thresh');
    if (buyEl) buyEl.value = pick.threshold;
    if (sellEl) sellEl.value = pick.threshold;

    var tfNote = '';
    if (isAllTf && pick.tf) {
      cortexTimeframe = pick.tf;
      var tfDropdown = document.getElementById('cortex-timeframe');
      if (tfDropdown) tfDropdown.value = pick.tf;
      tfNote = ' TF=' + (pick.tfLabel || pick.tf);
    }

    addBrainLog('CORTEX', 'Auto-pass applied: threshold ' + oldBuy + '/' + oldSell + ' -> ' + pick.threshold + '/' + pick.threshold + tfNote + ' (Win=' + pick.winRate + '% P&L=' + pick.pnl.toFixed(2) + ')');
    if (statusEl) statusEl.textContent = 'Applied: ' + pick.threshold + tfNote + ' (Win=' + pick.winRate + '%)';
    var displayTf = isAllTf ? 'ALL TFs' : tf;
    calibShowResults(allResults, pick.candles || 0, displayTf, epic);
    cortexSaveState();
  } catch (e) {
    addBrainLog('ERROR', 'Auto-pass error: ' + e.message);
    if (statusEl) statusEl.textContent = 'Error';
  }
  calibrationRunning = false;
}

function exportBrainTradeCSV() {
  var csv = 'timestamp,epic,direction,size,dealRef,price\n';
  brainTradeLog.forEach(function(t) {
    csv += [t.timestamp, t.epic, t.direction, t.size, t.dealRef, t.price].join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'brain-trades-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  addBrainLog('INFO', 'Exported ' + brainTradeLog.length + ' trades to CSV');
}

async function toggleTrainingMode() {
  trainingModeActive = !trainingModeActive;
  var btn = document.getElementById('neural-training-toggle');
  if (btn) {
    btn.textContent = trainingModeActive ? 'Training ON' : 'Training OFF';
    btn.style.background = trainingModeActive ? '#1b4332' : '#3d1a1a';
    btn.style.color = trainingModeActive ? '#2dc653' : '#f85149';
    btn.style.borderColor = trainingModeActive ? '#2dc653' : '#f85149';
  }
  await brainSetTraining(trainingModeActive);
  addBrainLog('INFO', 'Training mode ' + (trainingModeActive ? 'ENABLED' : 'DISABLED'));
}

async function sendTrainingFeedback(type) {
  addBrainLog('INFO', 'Training feedback: ' + type);
  devLog('INFO', 'Feedback: ' + type);
  var result = await brainFeedback(type);
  if (result) {
    addBrainLog('INFO', type + ' applied: ' + result.synapses_affected + '/' + (result.synapse_total || '?') + ' synapses (modifier=' + (result.modifier || '?') + ', clamp=\u00B1' + (result.w_clamp || '?') + ')');
    showToast(type + ' feedback applied', true);
  } else {
    addBrainLog('ERROR', 'Feedback failed - brain not connected');
    showToast('Feedback failed', false);
  }
}

async function loadPatternMemory(epic) {
  var patterns = await brainGetPatterns();
  if (patterns) {
    patternMemoryCache = patterns;
    renderPatternMemory(epic);
  }
}

function renderPatternMemory(highlightEpic) {
  var container = document.getElementById('neural-pattern-memory');
  if (!container) return;
  var keys = Object.keys(patternMemoryCache);
  if (keys.length === 0) {
    container.innerHTML = '<div class="empty">No patterns learned yet. Start trading to build memory.</div>';
    return;
  }
  var html = '<table style="width:100%;font-size:11px;border-collapse:collapse">' +
    '<thead><tr><th style="text-align:left;padding:4px;color:#bc8cff">Instrument</th><th style="text-align:right;padding:4px;color:#bc8cff">Ticks</th><th style="text-align:right;padding:4px;color:#bc8cff">Last Price</th><th style="text-align:right;padding:4px;color:#2dc653">Buy</th><th style="text-align:right;padding:4px;color:#f85149">Sell</th><th style="text-align:right;padding:4px;color:#d29922">Hold</th></tr></thead><tbody>';
  keys.forEach(function(epic) {
    var p = patternMemoryCache[epic];
    var bg = epic === highlightEpic ? 'rgba(188,140,255,0.08)' : '';
    var ls = p.last_signal || {};
    html += '<tr style="background:' + bg + '">' +
      '<td style="padding:4px;color:#58a6ff;font-weight:600">' + escHtml(epic) + '</td>' +
      '<td style="text-align:right;padding:4px;color:#c9d1d9">' + (p.tick_count || 0) + '</td>' +
      '<td style="text-align:right;padding:4px;color:#d29922">' + (p.last_price ? p.last_price.toFixed(4) : '--') + '</td>' +
      '<td style="text-align:right;padding:4px;color:#2dc653">' + (ls.buy_signal ? ls.buy_signal.toFixed(1) : '--') + '</td>' +
      '<td style="text-align:right;padding:4px;color:#f85149">' + (ls.sell_signal ? ls.sell_signal.toFixed(1) : '--') + '</td>' +
      '<td style="text-align:right;padding:4px;color:#d29922">' + (ls.hold_signal ? ls.hold_signal.toFixed(1) : '--') + '</td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

async function exportPatternCSV() {
  if (!neuralCurrentEpic) { showToast('Select an instrument first', false); return; }
  try {
    var res = await fetch(BRAIN_API + '/patterns/csv?epic=' + encodeURIComponent(neuralCurrentEpic));
    if (res.ok) {
      var csv = await res.text();
      var blob = new Blob([csv], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'brain-patterns-' + neuralCurrentEpic.replace(/\./g, '_') + '.csv';
      a.click();
      addBrainLog('INFO', 'Exported pattern CSV for ' + neuralCurrentEpic);
    }
  } catch (e) {
    addBrainLog('ERROR', 'Pattern CSV export failed: ' + e.message);
  }
}

async function downloadBrainPatterns() {
  try {
    var url = BRAIN_API + '/patterns/export';
    if (neuralCurrentEpic) url += '?epic=' + encodeURIComponent(neuralCurrentEpic);
    var res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    var fname = neuralCurrentEpic
      ? 'brain-patterns-' + neuralCurrentEpic.replace(/\./g, '_') + '.json'
      : 'brain-patterns-all.json';
    a.download = fname;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Patterns downloaded: ' + fname, true);
    addBrainLog('INFO', 'Downloaded patterns: ' + fname);
  } catch (e) {
    showToast('Download failed: ' + e.message, false);
    addBrainLog('ERROR', 'Pattern download failed: ' + e.message);
  }
}

function uploadBrainPatterns() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async function(ev) {
    var file = ev.target.files[0];
    if (!file) return;
    try {
      var text = await file.text();
      var data = JSON.parse(text);
      var res = await fetch(BRAIN_API + '/patterns/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var result = await res.json();
      showToast('Imported ' + (result.imported || 0) + ' instrument(s)', true);
      addBrainLog('INFO', 'Uploaded patterns from ' + file.name + ': ' + (result.imported || 0) + ' instruments imported');
      refreshCortex();
      if (neuralCurrentEpic) loadPatternMemory(neuralCurrentEpic);
    } catch (e) {
      showToast('Upload failed: ' + e.message, false);
      addBrainLog('ERROR', 'Pattern upload failed: ' + e.message);
    }
  };
  input.click();
}

async function checkBrainProcessStatus() {
  var status = await brainStatus();
  var el = document.getElementById('brain-process-status');
  var indEl = document.getElementById('brain-config-indicator');
  if (status && status.loaded !== false) {
    brainProcessStatus = 'running';
    brainConnected = true;
    if (el) {
      el.textContent = 'Running (' + (status.neurons_count || '?') + ' neurons, ' + (status.synapses_count || '?') + ' synapses, step ' + (status.step_count || 0) + ')';
      el.style.color = '#2dc653';
    }
    if (indEl) indEl.className = 'badge badge-on';
    updateBrainIndicator(true);
    var pEl = document.getElementById('neural-patterns-count');
    if (pEl) pEl.textContent = status.patterns || 0;
    var tEl = document.getElementById('neural-training-status');
    if (tEl) tEl.textContent = status.training_mode ? 'Active' : 'Inactive';
  } else {
    brainProcessStatus = 'stopped';
    brainConnected = false;
    if (el) { el.textContent = 'Not running'; el.style.color = '#f85149'; }
    if (indEl) indEl.className = 'badge badge-alert';
    updateBrainIndicator(false);
  }
}

function applyNeuralCalibrationSliders() {
  var rPoi = parseInt((document.getElementById('neural-cal-rpoi') || {}).value) || 100;
  var tau = parseInt((document.getElementById('neural-cal-tau') || {}).value) || 10;
  var wSyn = parseFloat((document.getElementById('neural-cal-wsyn') || {}).value) || 1.0;
  brainUpdateConfig({ r_poi: rPoi, tau_syn: tau, w_syn: wSyn }).then(function(res) {
    if (res) { addBrainLog('INFO', 'Calibration applied: r_poi=' + rPoi + ', tau=' + tau + ', w=' + wSyn); showToast('Calibration applied', true); }
    else { addBrainLog('ERROR', 'Failed to apply calibration'); showToast('Calibration failed', false); }
  });
}

function activateNeuralTasks() {
  var priceChecked = document.getElementById('neural-task-price') && document.getElementById('neural-task-price').checked;
  var volChecked = document.getElementById('neural-task-volume') && document.getElementById('neural-task-volume').checked;
  if (priceChecked) assignedTasks.price_monitor = 'optic_lobe';
  else delete assignedTasks.price_monitor;
  if (volChecked) assignedTasks.volume_pressure = 'mechanosensory';
  else delete assignedTasks.volume_pressure;
  addBrainLog('INFO', 'Tasks: price=' + !!priceChecked + ', volume=' + !!volChecked);
  showToast('Tasks activated', true);
}

function applyNeuralGoals() {
  var goals = {
    stop_loss_pips: parseFloat((document.getElementById('neural-sl-pips') || {}).value) || 50,
    profit_target_pips: parseFloat((document.getElementById('neural-tp-pips') || {}).value) || 100,
    min_profit_pct: parseFloat((document.getElementById('neural-min-pct') || {}).value) || 5,
    risk_reward_ratio: parseFloat((document.getElementById('neural-rr-ratio') || {}).value) || 1.5
  };
  if (brainjarConfig) brainjarConfig.goals = goals;
  addBrainLog('INFO', 'Goals: SL=' + goals.stop_loss_pips + ', TP=' + goals.profit_target_pips + ', RR=' + goals.risk_reward_ratio);
  showToast('Trading goals applied', true);
}

var archPresets = {
  '1s':   { sensory: 80,   inter: 220,   motor: 50 },
  '5s':   { sensory: 120,  inter: 500,   motor: 80 },
  '30s':  { sensory: 300,  inter: 1400,  motor: 300 },
  '1min': { sensory: 600,  inter: 3600,  motor: 800 },
  '5min': { sensory: 1200, inter: 7200,  motor: 1600 },
  '15min':{ sensory: 2000, inter: 14000, motor: 4000 },
};
var archBenchmarkCache = null;
var btTrainAbort = false;
var ntTrainMode = 'backtest';
var liveTrainRunning = false;
var liveTrainInterval = null;
var liveTrainTicks = [];
var liveTrainCandles = [];
var liveTrainOpenTrade = null;
var liveTrainStats = { ticks: 0, candles: 0, trades: 0, pnl: 0, sugar: 0, pain: 0 };
var liveTrainPrevClose = null;
var liveTrainCandleStart = 0;
var liveTrainCurrentTicks = [];
var liveTrainTickTimestamps = [];
var liveTrainTfSeconds = 1;
var liveTrainParams = { sl: 1.0, tp: 2.0, size: 1, plm: 1, minHold: 5, signalThresh: 10, confirmCandles: 3 };
var liveTrainConsecutiveSignal = null;
var liveTrainConsecutiveCount = 0;
var liveTrainTradeHistory = [];
var autoTestRunning = false;
var autoTestAbort = false;

function applyArchPreset(preset) {
  if (preset === 'custom') return;
  var p = archPresets[preset];
  if (!p) return;
  var sEl = document.getElementById('arch-sensory');
  var iEl = document.getElementById('arch-inter');
  var mEl = document.getElementById('arch-motor');
  if (sEl) sEl.value = p.sensory;
  if (iEl) iEl.value = p.inter;
  if (mEl) mEl.value = p.motor;
  archRecalc();
  addBrainLog('INFO', 'Preset applied: ' + preset + ' (' + (p.sensory + p.inter + p.motor) + ' neurons)');
}

function archRecalc() {
  var s = parseInt((document.getElementById('arch-sensory') || {}).value) || 100;
  var inter = parseInt((document.getElementById('arch-inter') || {}).value) || 200;
  var m = parseInt((document.getElementById('arch-motor') || {}).value) || 50;
  var total = s + inter + m;

  var badge = document.getElementById('arch-total-badge');
  if (badge) badge.textContent = total.toLocaleString() + ' neurons';

  var sensoryFanout = Math.max(3, Math.min(30, Math.floor(inter * 0.075)));
  var interFanout = Math.max(3, Math.min(30, Math.floor((inter + m) * 0.05)));
  var motorFeedback = Math.max(1, Math.min(5, Math.floor(inter * 0.015)));
  var mbPct = parseInt((document.getElementById('arch-mb-pct') || {}).value) || 20;
  var mbCount = Math.max(10, Math.floor(inter * mbPct / 100));
  var mbConn = parseFloat((document.getElementById('arch-mb-conn') || {}).value) || 0.3;
  var mbEnabled = document.getElementById('arch-mb-enabled') ? document.getElementById('arch-mb-enabled').checked : true;
  var estSynapses = s * sensoryFanout + inter * (mbEnabled ? Math.floor(interFanout * 1.2) : interFanout) + m * motorFeedback;

  var synEl = document.getElementById('arch-synapse-count');
  if (synEl) synEl.textContent = '~' + estSynapses.toLocaleString();

  var estTickMs = (total * 0.001 + estSynapses * 0.0001) * 10;
  var tickEl = document.getElementById('arch-est-tick');
  if (tickEl) tickEl.textContent = estTickMs < 1 ? '<1ms' : estTickMs.toFixed(1) + 'ms';
  var rateEl = document.getElementById('arch-max-rate');
  if (rateEl) rateEl.textContent = estTickMs > 0 ? Math.floor(1000 / estTickMs) + ' Hz' : '--';

  var mbCountEl = document.getElementById('arch-mb-count');
  if (mbCountEl) mbCountEl.textContent = mbEnabled ? mbCount : 'disabled';
  var mbRangeEl = document.getElementById('arch-mb-range');
  if (mbRangeEl) mbRangeEl.textContent = mbEnabled ? 'inter[0..' + (mbCount - 1) + ']' : '--';

  var buyEnd = Math.floor(m / 3);
  var sellEnd = Math.floor(2 * m / 3);
  var holdStart = sellEnd;
  var buyEl = document.getElementById('arch-motor-buy');
  var sellMEl = document.getElementById('arch-motor-sell');
  var holdMEl = document.getElementById('arch-motor-hold');
  var buyCntEl = document.getElementById('arch-motor-buy-count');
  var sellCntEl = document.getElementById('arch-motor-sell-count');
  var holdCntEl = document.getElementById('arch-motor-hold-count');
  if (buyEl) buyEl.textContent = 'motor[0..' + (buyEnd - 1) + ']';
  if (sellMEl) sellMEl.textContent = 'motor[' + buyEnd + '..' + (sellEnd - 1) + ']';
  if (holdMEl) holdMEl.textContent = 'motor[' + holdStart + '..' + (m - 1) + ']';
  if (buyCntEl) buyCntEl.textContent = buyEnd + ' neurons';
  if (sellCntEl) sellCntEl.textContent = (sellEnd - buyEnd) + ' neurons';
  if (holdCntEl) holdCntEl.textContent = (m - holdStart) + ' neurons';

  var priceUp = Math.max(4, Math.floor(s * 0.20));
  var priceDown = Math.max(4, Math.floor(s * 0.20));
  var vol = Math.max(4, Math.floor(s * 0.20));
  var spr = Math.max(4, Math.floor(s * 0.20));
  var mom = Math.max(2, Math.floor(s * 0.10));
  var ant = Math.max(2, s - priceUp - priceDown - vol - spr - mom);
  var offset = 0;
  var saFields = [
    { key: 'price_up', count: priceUp },
    { key: 'price_down', count: priceDown },
    { key: 'volume', count: vol },
    { key: 'spread', count: spr },
    { key: 'momentum', count: mom },
    { key: 'antenna', count: ant },
  ];
  saFields.forEach(function(f) {
    var startEl = document.getElementById('sa-' + f.key + '-start');
    var countEl = document.getElementById('sa-' + f.key + '-count');
    if (startEl) startEl.textContent = offset;
    if (countEl) countEl.textContent = f.count;
    offset += f.count;
  });

  updateTimeframeBudgetTable(estTickMs);
}

function updateTimeframeBudgetTable(estTickMs) {
  var table = document.getElementById('arch-timeframe-table');
  if (!table) return;
  var tfs = [
    { label: '1s', budget: 1000 },
    { label: '5s', budget: 5000 },
    { label: '30s', budget: 30000 },
    { label: '1min', budget: 60000 },
    { label: '5min', budget: 300000 },
    { label: '15min', budget: 900000 },
  ];
  var html = '<div style="display:grid;grid-template-columns:80px 90px 90px 80px 60px;gap:4px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid #21262d;font-weight:600;color:#8b949e;font-size:10px"><span>Timeframe</span><span>Budget (ms)</span><span>Steps possible</span><span>Utilization</span><span>Fits?</span></div>';
  tfs.forEach(function(tf) {
    var steps = estTickMs > 0 ? Math.floor(tf.budget / estTickMs) : 99999;
    var utilPct = estTickMs > 0 ? Math.min(100, (estTickMs * 10 / tf.budget * 100)) : 0;
    var fits = estTickMs * 10 < tf.budget;
    html += '<div style="display:grid;grid-template-columns:80px 90px 90px 80px 60px;gap:4px;padding:2px 0;border-bottom:1px solid #161b22">' +
      '<span style="color:#c9d1d9;font-weight:600">' + tf.label + '</span>' +
      '<span style="color:#8b949e">' + tf.budget.toLocaleString() + '</span>' +
      '<span style="color:#58a6ff">' + steps.toLocaleString() + '</span>' +
      '<span style="color:' + (utilPct > 80 ? '#f85149' : utilPct > 50 ? '#d29922' : '#2dc653') + '">' + utilPct.toFixed(1) + '%</span>' +
      '<span style="color:' + (fits ? '#2dc653' : '#f85149') + '">' + (fits ? 'YES' : 'NO') + '</span>' +
      '</div>';
  });
  table.innerHTML = html;
}

async function applyArchitecture() {
  var s = parseInt((document.getElementById('arch-sensory') || {}).value) || 100;
  var inter = parseInt((document.getElementById('arch-inter') || {}).value) || 200;
  var m = parseInt((document.getElementById('arch-motor') || {}).value) || 50;
  var mbEnabled = document.getElementById('arch-mb-enabled') ? document.getElementById('arch-mb-enabled').checked : true;
  var mbPct = parseInt((document.getElementById('arch-mb-pct') || {}).value) || 20;
  var mbConn = parseFloat((document.getElementById('arch-mb-conn') || {}).value) || 0.3;
  var total = s + inter + m;

  if (total > 50000 && !confirm('Network has ' + total.toLocaleString() + ' neurons. This may be slow. Continue?')) return;

  addBrainLog('INFO', 'Rebuilding brain: S=' + s + ' I=' + inter + ' M=' + m + ' (total=' + total + ')');
  var result = await brainFetch('/boot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sensory: s, inter: inter, motor: m })
  });

  if (result) {
    await brainFetch('/architecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mushroom_body: { enabled: mbEnabled, connectivity: mbConn, count: Math.floor(inter * mbPct / 100) }
      })
    });
    addBrainLog('INFO', 'Brain rebuilt: ' + result.neurons_count + ' neurons, ' + result.synapses_count + ' synapses');
    showToast('Brain rebuilt: ' + result.neurons_count + ' neurons', true);
    checkBrainProcessStatus();
    loadArchitecture();
  } else {
    addBrainLog('ERROR', 'Failed to rebuild brain');
    showToast('Brain rebuild failed', false);
  }
}

async function runArchBenchmark() {
  var btn = document.getElementById('arch-benchmark-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Running...'; }
  addBrainLog('INFO', 'Running benchmark (100 steps)...');
  var result = await brainFetch('/benchmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps: 100 })
  });
  if (btn) { btn.disabled = false; btn.textContent = 'Test Fire (Benchmark)'; }

  var resDiv = document.getElementById('arch-benchmark-result');
  if (!result) {
    if (resDiv) { resDiv.style.display = 'block'; resDiv.innerHTML = '<span style="color:#f85149">Benchmark failed — brain not booted?</span>'; }
    return;
  }

  archBenchmarkCache = result;
  var tickEl = document.getElementById('arch-est-tick');
  var rateEl = document.getElementById('arch-max-rate');
  if (tickEl) tickEl.textContent = result.per_step_ms.toFixed(3) + 'ms (actual)';
  if (rateEl) rateEl.textContent = result.max_tick_rate_hz + ' Hz (actual)';
  updateTimeframeBudgetTable(result.per_step_ms);

  if (resDiv) {
    resDiv.style.display = 'block';
    resDiv.innerHTML =
      '<div style="color:#2dc653;font-weight:600;margin-bottom:4px">Benchmark Complete</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
      '<div><span style="color:#8b949e">Per step:</span> <span style="color:#58a6ff">' + result.per_step_ms.toFixed(4) + ' ms</span></div>' +
      '<div><span style="color:#8b949e">100 steps:</span> <span style="color:#d29922">' + result.total_ms.toFixed(2) + ' ms</span></div>' +
      '<div><span style="color:#8b949e">Max rate:</span> <span style="color:#2dc653">' + result.max_tick_rate_hz + ' Hz</span></div>' +
      '<div><span style="color:#8b949e">Neurons:</span> <span style="color:#c9d1d9">' + result.neurons + '</span></div>' +
      '<div><span style="color:#8b949e">Synapses:</span> <span style="color:#c9d1d9">' + result.synapses + '</span></div>' +
      '<div><span style="color:#8b949e">Avg spikes/step:</span> <span style="color:#bc8cff">' + result.avg_spikes_per_step + '</span></div>' +
      (result.feedback_formula ? '<div style="margin-top:6px;border-top:1px solid #30363d;padding-top:4px"><span style="color:#8b949e">Feedback:</span> <span style="color:#2dc653">sugar=' + result.feedback_formula.sugar_modifier.toFixed(4) + '</span> <span style="color:#f85149">pain=' + result.feedback_formula.pain_modifier.toFixed(4) + '</span> <span style="color:#8b949e">clamp=\u00B1' + result.feedback_formula.w_clamp.toFixed(1) + '</span></div>' : '') +
      '</div>';
  }
  addBrainLog('INFO', 'Benchmark: ' + result.per_step_ms.toFixed(4) + 'ms/step, ' + result.max_tick_rate_hz + ' Hz max');
}

async function loadArchitecture() {
  var arch = await brainFetch('/architecture');
  if (!arch) return;

  var sEl = document.getElementById('arch-sensory');
  var iEl = document.getElementById('arch-inter');
  var mEl = document.getElementById('arch-motor');
  if (sEl) sEl.value = arch.sensory;
  if (iEl) iEl.value = arch.inter;
  if (mEl) mEl.value = arch.motor;

  if (arch.mushroom_body) {
    var mbEnEl = document.getElementById('arch-mb-enabled');
    var mbPctEl = document.getElementById('arch-mb-pct');
    var mbConnEl = document.getElementById('arch-mb-conn');
    if (mbEnEl) mbEnEl.checked = arch.mushroom_body.enabled;
    if (mbPctEl && arch.inter > 0) mbPctEl.value = Math.round(arch.mushroom_body.count / arch.inter * 100);
    if (mbConnEl) mbConnEl.value = arch.mushroom_body.connectivity;
  }

  var synEl = document.getElementById('arch-synapse-count');
  if (synEl) synEl.textContent = (arch.synapses || 0).toLocaleString();

  if (arch.sensory_assignments) {
    Object.keys(arch.sensory_assignments).forEach(function(key) {
      var sa = arch.sensory_assignments[key];
      var startEl = document.getElementById('sa-' + key + '-start');
      var countEl = document.getElementById('sa-' + key + '-count');
      if (startEl) startEl.textContent = sa.start;
      if (countEl) countEl.textContent = sa.count;
    });
  }

  archRecalc();
  addBrainLog('INFO', 'Architecture loaded: S=' + arch.sensory + ' I=' + arch.inter + ' M=' + arch.motor + ' (' + arch.total + ' total, ' + arch.synapses + ' synapses)');
}

function switchTrainMode(mode) {
  ntTrainMode = mode;
  var badge = document.getElementById('nt-mode-badge');
  var labels = { backtest: 'Backtest', live: 'Live', auto: 'Auto Test' };
  var colors = { backtest: '#8b949e', live: '#58a6ff', auto: '#d29922' };
  if (badge) { badge.textContent = labels[mode] || mode; badge.style.color = colors[mode] || '#8b949e'; }

  document.querySelectorAll('.nt-mode-btn').forEach(function(b) {
    b.style.background = ''; b.style.color = '#8b949e'; b.style.borderColor = '#30363d';
  });
  var activeBtn = document.getElementById('nt-mode-' + mode);
  if (activeBtn) {
    var ac = { backtest: ['#1b4332','#2dc653'], live: ['#0a2440','#58a6ff'], auto: ['#2a1d00','#d29922'] };
    activeBtn.style.background = (ac[mode] || ac.backtest)[0];
    activeBtn.style.color = (ac[mode] || ac.backtest)[1];
    activeBtn.style.borderColor = (ac[mode] || ac.backtest)[1];
  }

  var panels = ['nt-backtest-panel', 'nt-live-panel', 'nt-auto-panel'];
  panels.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var showId = mode === 'backtest' ? 'nt-backtest-panel' : mode === 'live' ? 'nt-live-panel' : 'nt-auto-panel';
  var showEl = document.getElementById(showId);
  if (showEl) showEl.style.display = 'block';

  var shortEpic = neuralCurrentEpic ? neuralCurrentEpic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'') : '--';
  if (mode === 'backtest') {
    var btEpic = document.getElementById('bt-train-epic');
    if (btEpic) btEpic.textContent = neuralCurrentEpic ? shortEpic : 'Select instrument first';
  } else if (mode === 'live') {
    var ltEpic = document.getElementById('lt-train-epic');
    if (ltEpic) ltEpic.textContent = neuralCurrentEpic ? shortEpic : 'Select instrument first';
  }
}

function startTraining() {
  if (ntTrainMode === 'backtest') startBacktestTraining();
  else if (ntTrainMode === 'live') startLiveTraining();
  else if (ntTrainMode === 'auto') startAutoTest();
}

function stopTraining() {
  if (ntTrainMode === 'backtest') stopBacktestTraining();
  else if (ntTrainMode === 'live') stopLiveTraining();
  else if (ntTrainMode === 'auto') stopAutoTest();
}

function showTrainResults(result) {
  var resultDiv = document.getElementById('bt-train-results');
  if (!resultDiv || !result) return;
  resultDiv.style.display = 'block';
  var tradeRows = result.trades.slice(-20).map(function(t) {
    var color = t.pnl >= 0 ? '#2dc653' : '#f85149';
    return '<div style="display:grid;grid-template-columns:50px 80px 80px 60px 50px;gap:4px;padding:2px 0;border-bottom:1px solid #161b22">' +
      '<span style="color:' + (t.direction === 'BUY' ? '#2dc653' : '#f85149') + '">' + t.direction + '</span>' +
      '<span style="color:#8b949e">' + (t.entry ? t.entry.toFixed(2) : '--') + '</span>' +
      '<span style="color:#8b949e">' + (t.exit ? t.exit.toFixed(2) : '--') + '</span>' +
      '<span style="color:' + color + ';font-weight:600">' + (t.pnl >= 0 ? '+' : '') + t.pnl.toFixed(2) + '</span>' +
      '<span style="color:#bc8cff">' + t.reason + '</span></div>';
  }).join('');
  resultDiv.innerHTML =
    '<div style="color:#2dc653;font-weight:600;margin-bottom:8px">Training Results</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px">' +
    '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Total P&L</div><div style="font-size:14px;font-weight:600;color:' + (result.total_pnl >= 0 ? '#2dc653' : '#f85149') + '">' + (result.total_pnl >= 0 ? '+' : '') + result.total_pnl.toFixed(2) + '</div></div>' +
    '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Win Rate</div><div style="font-size:14px;font-weight:600;color:#58a6ff">' + result.win_rate + '%</div></div>' +
    '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Trades</div><div style="font-size:14px;font-weight:600;color:#c9d1d9">' + result.trades.length + '</div></div>' +
    '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Sugar/Pain</div><div style="font-size:14px;font-weight:600"><span style="color:#2dc653">' + result.sugar_count + '</span>/<span style="color:#f85149">' + result.pain_count + '</span></div></div>' +
    '</div>' +
    '<div style="font-size:10px;color:#8b949e;margin-bottom:4px;font-weight:600">Last 20 Trades</div>' +
    '<div style="display:grid;grid-template-columns:50px 80px 80px 60px 50px;gap:4px;padding-bottom:4px;border-bottom:1px solid #21262d;font-weight:600;color:#8b949e;font-size:9px"><span>Dir</span><span>Entry</span><span>Exit</span><span>P&L</span><span>Reason</span></div>' +
    tradeRows;
}

async function startBacktestTraining() {
  var epic = neuralCurrentEpic;
  if (!epic) { showToast('Select an instrument first', false); return; }
  var tf = (document.getElementById('bt-train-tf') || {}).value || 'MINUTE';
  var maxCandles = parseInt((document.getElementById('bt-train-candles') || {}).value) || 500;
  cortexReadParams();

  btTrainAbort = false;
  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  var progDiv = document.getElementById('bt-train-progress');
  var resultDiv = document.getElementById('bt-train-results');
  var epicLabel = document.getElementById('bt-train-epic');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  if (progDiv) progDiv.style.display = 'block';
  if (resultDiv) { resultDiv.style.display = 'none'; resultDiv.innerHTML = ''; }
  if (epicLabel) epicLabel.textContent = epic;

  addBrainLog('INFO', 'Backtest training: ' + epic + ' tf=' + tf + ' candles=' + maxCandles + ' SL=' + cortexStopLossPips + 'pips TP=' + cortexTakeProfitPips + 'pips');

  var pctEl = document.getElementById('bt-train-pct');
  var barEl = document.getElementById('bt-train-bar');
  if (pctEl) pctEl.textContent = 'Fetching candles...';

  try {
    var btSource = ((document.getElementById('bt-train-source') || {}).value) || 'ig';
    var url;
    if (btSource === 'localdb') {
      url = '/api/ig/scalper/candles?epic=' + encodeURIComponent(epic) + '&resolution=' + tf + '&max=' + maxCandles;
    } else {
      url = '/api/ig/prices/' + encodeURIComponent(epic) + '?resolution=' + tf + '&max=' + maxCandles;
    }
    var data = await apiFetch(url);
    var candles = (data && data.prices) || [];
    if (data && data.source) addBrainLog('INFO', 'Data source: ' + data.source + ' (' + (data.count || candles.length) + '/' + (data.total_available || '?') + ' candles)');
    if (candles.length === 0) {
      addBrainLog('WARN', 'No candles returned for backtest');
      showToast('No historical data available', false);
      if (startBtn) startBtn.style.display = 'inline-block';
      if (stopBtn) stopBtn.style.display = 'none';
      if (progDiv) progDiv.style.display = 'none';
      return;
    }

    if (btTrainAbort) {
      addBrainLog('INFO', 'Backtest aborted before training');
      if (startBtn) startBtn.style.display = 'inline-block';
      if (stopBtn) stopBtn.style.display = 'none';
      if (progDiv) progDiv.style.display = 'none';
      return;
    }

    addBrainLog('INFO', 'Got ' + candles.length + ' candles, feeding to brain...');
    if (pctEl) pctEl.textContent = 'Training on ' + candles.length + ' candles...';
    if (barEl) { barEl.style.width = '10%'; }

    var pressure = antennaComputePressure();
    var result = await brainFetch('/backtest-train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candles: candles,
        epic: epic,
        stopLossPips: cortexStopLossPips,
        takeProfitPips: cortexTakeProfitPips,
        size: cortexMinPositionSize,
        plMultiplier: 1,
        minHoldCandles: cortexMinHoldCandles,
        signalThreshold: cortexBuyThreshold,
        confirmCandles: cortexConfirmCandles,
        antennaEnabled: true,
        timeframe: tf,
      })
    });

    if (barEl) barEl.style.width = '100%';
    if (pctEl) pctEl.textContent = '100%';

    if (result) {
      addBrainLog('INFO', 'Training complete: ' + result.trades.length + ' trades, P&L=' + result.total_pnl + ', Win=' + result.win_rate + '%');
      addBrainLog('INFO', 'Sugar: ' + result.sugar_count + ' / Pain: ' + result.pain_count + ' / Steps: ' + result.steps_run);
      showTrainResults(result);
    }
  } catch (e) {
    addBrainLog('ERROR', 'Backtest training error: ' + e.message);
    showToast('Training error: ' + e.message, false);
  }

  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
}

function stopBacktestTraining() {
  btTrainAbort = true;
  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  addBrainLog('INFO', 'Backtest training stopped');
}

function ticksToCandle(ticks) {
  if (!ticks.length) return null;
  return {
    open: ticks[0].price,
    high: Math.max.apply(null, ticks.map(function(t) { return t.price; })),
    low: Math.min.apply(null, ticks.map(function(t) { return t.price; })),
    close: ticks[ticks.length - 1].price,
    volume: ticks.reduce(function(s, t) { return s + (t.volume || 0); }, 0),
    prevClose: liveTrainPrevClose || ticks[0].price,
    spread: ticks[ticks.length - 1].spread || 0,
  };
}

function suggestNextTimeframe(avgTickIntervalMs) {
  var tfSecs = [1, 5, 10, 30, 60, 300];
  var tfLabels = ['1s', '5s', '10s', '30s', '1min', '5min'];
  for (var i = 0; i < tfSecs.length; i++) {
    var neededTicks = Math.ceil(tfSecs[i] * 1000 / avgTickIntervalMs);
    if (neededTicks >= 2 && neededTicks <= 60) {
      return { seconds: tfSecs[i], label: tfLabels[i], ticksNeeded: neededTicks };
    }
  }
  return { seconds: tfSecs[tfSecs.length - 1], label: tfLabels[tfLabels.length - 1], ticksNeeded: 2 };
}

async function feedLiveTrainingTick(price, volume, spread) {
  if (!liveTrainRunning) return;
  var now = Date.now();
  liveTrainTickTimestamps.push(now);
  liveTrainStats.ticks++;
  liveTrainCurrentTicks.push({ price: price, volume: volume, spread: spread, time: now });

  var el = document.getElementById('lt-ticks-collected');
  if (el) el.textContent = liveTrainStats.ticks;

  var srcEl = document.getElementById('lt-tick-source');
  if (srcEl) { srcEl.textContent = 'Live (' + liveTrainStats.ticks + ')'; srcEl.style.color = '#2dc653'; }

  if (liveTrainTickTimestamps.length >= 5) {
    var avgInterval = (liveTrainTickTimestamps[liveTrainTickTimestamps.length - 1] - liveTrainTickTimestamps[0]) / (liveTrainTickTimestamps.length - 1);
    var hint = document.getElementById('lt-candle-hint');
    if (avgInterval > liveTrainTfSeconds * 1000 && hint) {
      var suggestion = suggestNextTimeframe(avgInterval);
      hint.style.display = 'block';
      hint.textContent = 'Tick rate ~' + (avgInterval / 1000).toFixed(1) + 's. Suggest ' + suggestion.label + ' candles (' + suggestion.ticksNeeded + ' ticks/candle)';
    } else if (hint) {
      hint.style.display = 'none';
    }
  }

  var elapsed = now - liveTrainCandleStart;
  var shouldClose = liveTrainTfSeconds === 0 ? liveTrainCurrentTicks.length >= 1 : (elapsed >= liveTrainTfSeconds * 1000 && liveTrainCurrentTicks.length > 0);
  if (shouldClose) {
    var candle = ticksToCandle(liveTrainCurrentTicks);
    if (candle) {
      liveTrainCandles.push(candle);
      liveTrainStats.candles++;
      var cEl = document.getElementById('lt-candles-built');
      if (cEl) cEl.textContent = liveTrainStats.candles;

      var epic = neuralCurrentEpic;
      var pressure = antennaComputePressure();
      cortexReadParams();
      var result = await brainFetch('/live-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candle: candle,
          epic: epic,
          stopLossPips: cortexStopLossPips,
          takeProfitPips: cortexTakeProfitPips,
          size: cortexMinPositionSize,
          plMultiplier: 1,
          openTrade: liveTrainOpenTrade,
          minHoldCandles: cortexMinHoldCandles,
          signalThreshold: cortexBuyThreshold,
          confirmCandles: cortexConfirmCandles,
          consecutiveSignal: liveTrainConsecutiveSignal,
          consecutiveCount: liveTrainConsecutiveCount,
          pressure: pressure,
          timeframe: (liveTrainTfSeconds >= 60 ? 'MINUTE' : 'SECOND') + (liveTrainTfSeconds >= 120 ? '_' + Math.floor(liveTrainTfSeconds/60) : ''),
        })
      });

      if (result) {
        if (result.consecutiveSignal !== undefined) liveTrainConsecutiveSignal = result.consecutiveSignal;
        if (result.consecutiveCount !== undefined) liveTrainConsecutiveCount = result.consecutiveCount;

        if (result.trade_closed) {
          liveTrainStats.trades++;
          liveTrainStats.pnl += result.trade_closed.pnl;
          if (result.feedback === 'sugar') liveTrainStats.sugar++;
          else liveTrainStats.pain++;
          liveTrainOpenTrade = null;
          liveTrainTradeHistory.push(result.trade_closed);
          renderLiveTradeHistory();
          addBrainLog('TRADE', 'Live: ' + result.trade_closed.direction + ' closed @ ' + result.trade_closed.exit.toFixed(2) + ' P&L=' + result.trade_closed.pnl.toFixed(2) + ' (' + result.trade_closed.reason + ')' + (result.trade_closed.candles_held ? ' held=' + result.trade_closed.candles_held : ''));
        }
        if (result.held_trade) {
          liveTrainOpenTrade = result.held_trade;
        }
        if (result.open_trade) {
          liveTrainOpenTrade = result.open_trade;
          addBrainLog('TRADE', 'Live: ' + result.open_trade.direction + ' opened @ ' + result.open_trade.entry.toFixed(2));
        }
        if (result.signal !== 'HOLD') {
          addBrainLog('INFO', 'Live signal: ' + result.signal + ' buy=' + result.buy_signal.toFixed(1) + ' sell=' + result.sell_signal.toFixed(1) + (liveTrainOpenTrade ? ' (holding ' + (liveTrainOpenTrade.candlesHeld || 0) + '/' + cortexMinHoldCandles + ')' : ''));
        }
      }

      liveTrainPrevClose = candle.close;
      var tEl = document.getElementById('lt-trades-count');
      if (tEl) tEl.textContent = liveTrainStats.trades;
      var pEl = document.getElementById('lt-train-pnl');
      if (pEl) { pEl.textContent = liveTrainStats.pnl.toFixed(2); pEl.style.color = liveTrainStats.pnl >= 0 ? '#2dc653' : '#f85149'; }

      liveTrainCurrentTicks = [];
      liveTrainCandleStart = now;
    }
  }
}

function renderLiveTradeHistory() {
  var container = document.getElementById('lt-trade-history');
  var rowsDiv = document.getElementById('lt-trade-rows');
  if (!container || !rowsDiv) {
    console.warn('[live-train] lt-trade-history or lt-trade-rows not found in DOM');
    return;
  }
  if (liveTrainTradeHistory.length === 0) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  var html = '';
  var trades = liveTrainTradeHistory;
  var start = Math.max(0, trades.length - 50);
  for (var i = start; i < trades.length; i++) {
    var t = trades[i];
    var color = t.pnl >= 0 ? '#2dc653' : '#f85149';
    html += '<div style="display:grid;grid-template-columns:40px 50px 90px 90px 70px 60px;gap:4px;padding:3px 0;border-bottom:1px solid #161b22">' +
      '<span style="color:#8b949e">' + (i + 1) + '</span>' +
      '<span style="color:' + (t.direction === 'BUY' ? '#2dc653' : '#f85149') + ';font-weight:600">' + t.direction + '</span>' +
      '<span style="color:#c9d1d9">' + (t.entry ? t.entry.toFixed(2) : '--') + '</span>' +
      '<span style="color:#c9d1d9">' + (t.exit ? t.exit.toFixed(2) : '--') + '</span>' +
      '<span style="color:' + color + ';font-weight:600">' + (t.pnl >= 0 ? '+' : '') + t.pnl.toFixed(2) + '</span>' +
      '<span style="color:#bc8cff">' + (t.reason || '--') + '</span></div>';
  }
  rowsDiv.innerHTML = html;
  var wins = trades.filter(function(t) { return t.pnl >= 0; }).length;
  var wr = trades.length > 0 ? (wins / trades.length * 100).toFixed(1) : '0.0';
  var totalPnl = trades.reduce(function(s, t) { return s + t.pnl; }, 0);
  var summaryColor = totalPnl >= 0 ? '#2dc653' : '#f85149';
  var summaryEl = document.getElementById('lt-trade-summary');
  if (summaryEl) {
    summaryEl.innerHTML = 'Trades: <span style="color:#c9d1d9">' + trades.length + '</span> | WR: <span style="color:#58a6ff">' + wr + '%</span> | P&L: <span style="color:' + summaryColor + '">' + (totalPnl >= 0 ? '+' : '') + totalPnl.toFixed(2) + '</span>';
  }
  container.scrollTop = container.scrollHeight;
}

function startLiveTraining() {
  var epic = neuralCurrentEpic;
  if (!epic) { showToast('Select an instrument first', false); return; }
  if (liveTrainRunning) return;

  liveTrainRunning = true;
  liveTrainTicks = [];
  liveTrainCandles = [];
  liveTrainOpenTrade = null;
  liveTrainStats = { ticks: 0, candles: 0, trades: 0, pnl: 0, sugar: 0, pain: 0 };
  liveTrainPrevClose = null;
  liveTrainCurrentTicks = [];
  liveTrainTickTimestamps = [];
  liveTrainTradeHistory = [];
  resetAntennaState();
  var ltHistEl = document.getElementById('lt-trade-history');
  if (ltHistEl) ltHistEl.style.display = 'none';
  var ltRowsEl = document.getElementById('lt-trade-rows');
  if (ltRowsEl) ltRowsEl.innerHTML = '';

  liveTrainTfSeconds = parseInt((document.getElementById('lt-train-tf') || {}).value) || 1;
  cortexReadParams();
  liveTrainConsecutiveSignal = null;
  liveTrainConsecutiveCount = 0;

  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';

  var ltEpic = document.getElementById('lt-train-epic');
  if (ltEpic) ltEpic.textContent = epic;
  var srcEl = document.getElementById('lt-tick-source');
  if (srcEl) { srcEl.textContent = 'Dashboard Feed'; srcEl.style.color = '#2dc653'; }

  liveTrainCandleStart = Date.now();
  addBrainLog('INFO', 'Live training started: ' + epic + ' tf=' + liveTrainTfSeconds + 's SL=' + cortexStopLossPips + 'pips TP=' + cortexTakeProfitPips + 'pips hold=' + cortexMinHoldCandles + ' thresh=' + cortexBuyThreshold + ' confirm=' + cortexConfirmCandles);
  addBrainLog('INFO', 'Tick source: dashboard polling (3s interval, multi-fallback)');
}

function stopLiveTraining() {
  liveTrainRunning = false;
  if (liveTrainInterval) { clearInterval(liveTrainInterval); liveTrainInterval = null; }
  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  addBrainLog('INFO', 'Live training stopped. Candles=' + liveTrainStats.candles + ' Trades=' + liveTrainStats.trades + ' P&L=' + liveTrainStats.pnl.toFixed(2));
  console.log('[neural-training] Live training stopped:', JSON.stringify(liveTrainStats));

  if (liveTrainStats.trades > 0) {
    var winCount = 0;
    showTrainResults({
      total_pnl: liveTrainStats.pnl,
      win_rate: liveTrainStats.sugar > 0 ? parseFloat((liveTrainStats.sugar / liveTrainStats.trades * 100).toFixed(1)) : 0,
      trades: liveTrainCandles.map(function() { return { direction: '--', entry: 0, exit: 0, pnl: 0, reason: '--' }; }).slice(0, liveTrainStats.trades),
      sugar_count: liveTrainStats.sugar,
      pain_count: liveTrainStats.pain,
    });
  }
}

async function startAutoTest() {
  var epic = neuralCurrentEpic;
  if (!epic) { showToast('Select an instrument first', false); return; }
  if (autoTestRunning) return;
  autoTestRunning = true;
  autoTestAbort = false;

  var totalCycles = parseInt((document.getElementById('at-cycles') || {}).value) || 5;
  var candlesPerCycle = parseInt((document.getElementById('at-candles') || {}).value) || 250;
  var tuneInterval = parseInt((document.getElementById('at-tune-interval') || {}).value) || 2;
  var targetWR = parseFloat((document.getElementById('at-target-wr') || {}).value) || 55;
  cortexReadParams();
  var tf = (document.getElementById('bt-train-tf') || {}).value || 'MINUTE';

  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  var progDiv = document.getElementById('bt-train-progress');
  var statusEl = document.getElementById('at-status');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  if (progDiv) progDiv.style.display = 'block';

  addBrainLog('INFO', 'Auto-test started: ' + totalCycles + ' cycles, ' + candlesPerCycle + ' candles/cycle, tune every ' + tuneInterval + ', target WR=' + targetWR + '%');
  console.log('[neural-training] AUTO TEST START:', { epic, totalCycles, candlesPerCycle, tuneInterval, targetWR });

  var pctEl = document.getElementById('bt-train-pct');
  var barEl = document.getElementById('bt-train-bar');
  var bestResult = null;
  var allResults = [];

  var currentArch = await brainFetch('/architecture');
  var currentWSyn = (currentArch && currentArch.params) ? currentArch.params.w_syn : 12.0;
  var currentRPoi = (currentArch && currentArch.params) ? currentArch.params.r_poi : 150;

  for (var cycle = 0; cycle < totalCycles; cycle++) {
    if (autoTestAbort) break;

    var pct = Math.round((cycle / totalCycles) * 100);
    if (pctEl) pctEl.textContent = 'Cycle ' + (cycle + 1) + '/' + totalCycles + ' (' + pct + '%)';
    if (barEl) barEl.style.width = pct + '%';
    if (statusEl) {
      statusEl.innerHTML = '<div style="color:#d29922;font-weight:600">Running cycle ' + (cycle + 1) + '/' + totalCycles + '</div>' +
        '<div style="color:#8b949e;margin-top:4px">Fetching ' + candlesPerCycle + ' candles...</div>' +
        (bestResult ? '<div style="margin-top:4px;color:#58a6ff">Best so far: WR=' + bestResult.win_rate + '% P&L=' + bestResult.total_pnl.toFixed(2) + ' (cycle ' + bestResult.cycle + ')</div>' : '');
    }

    try {
      var url = '/api/ig/prices/' + encodeURIComponent(epic) + '?resolution=' + tf + '&max=' + candlesPerCycle;
      var data = await apiFetch(url);
      var candles = (data && data.prices) || [];
      if (candles.length === 0) {
        addBrainLog('WARN', 'Auto-test cycle ' + (cycle + 1) + ': no candles');
        continue;
      }

      cortexReadParams();
      var result = await brainFetch('/backtest-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candles: candles, epic: epic, stopLossPips: cortexStopLossPips, takeProfitPips: cortexTakeProfitPips, size: cortexMinPositionSize, plMultiplier: 1, minHoldCandles: cortexMinHoldCandles, signalThreshold: cortexBuyThreshold, confirmCandles: cortexConfirmCandles, antennaEnabled: true, timeframe: tf })
      });

      if (result) {
        result.cycle = cycle + 1;
        result.w_syn = currentWSyn;
        result.r_poi = currentRPoi;
        allResults.push(result);
        addBrainLog('INFO', 'Auto-test cycle ' + (cycle + 1) + ': ' + result.trades.length + ' trades, WR=' + result.win_rate + '%, P&L=' + result.total_pnl.toFixed(2));
        console.log('[neural-training] AUTO CYCLE ' + (cycle + 1) + ': trades=' + result.trades.length + ' WR=' + result.win_rate + '% P&L=' + result.total_pnl.toFixed(2));

        if (!bestResult || result.win_rate > bestResult.win_rate || (result.win_rate === bestResult.win_rate && result.total_pnl > bestResult.total_pnl)) {
          bestResult = result;
        }

        if ((cycle + 1) % tuneInterval === 0 && cycle < totalCycles - 1) {
          var lastWR = result.win_rate;
          if (lastWR < targetWR) {
            currentWSyn *= 0.95;
            currentRPoi *= 1.1;
            addBrainLog('INFO', 'Auto-tune: WR=' + lastWR + '% < target ' + targetWR + '%, adjusting w_syn=' + currentWSyn.toFixed(3) + ' r_poi=' + currentRPoi.toFixed(1));
            console.log('[neural-training] AUTO-TUNE: w_syn=' + currentWSyn.toFixed(3) + ' r_poi=' + currentRPoi.toFixed(1));

            await brainFetch('/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ w_syn: currentWSyn, r_poi: currentRPoi })
            });
          } else {
            addBrainLog('INFO', 'Auto-tune: WR=' + lastWR + '% >= target ' + targetWR + '%, keeping settings');
          }
        }
      }
    } catch (e) {
      addBrainLog('ERROR', 'Auto-test cycle ' + (cycle + 1) + ' error: ' + e.message);
    }
  }

  if (barEl) barEl.style.width = '100%';
  if (pctEl) pctEl.textContent = '100%';

  if (statusEl) {
    var summaryHtml = '<div style="color:#2dc653;font-weight:600;margin-bottom:8px">Auto-Test Complete</div>';
    summaryHtml += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">';
    summaryHtml += '<div style="padding:6px;background:#161b22;border-radius:4px;text-align:center"><div style="font-size:10px;color:#8b949e">Cycles</div><div style="font-size:14px;font-weight:600;color:#c9d1d9">' + allResults.length + '</div></div>';
    if (bestResult) {
      summaryHtml += '<div style="padding:6px;background:#161b22;border-radius:4px;text-align:center"><div style="font-size:10px;color:#8b949e">Best WR</div><div style="font-size:14px;font-weight:600;color:#58a6ff">' + bestResult.win_rate + '%</div></div>';
      summaryHtml += '<div style="padding:6px;background:#161b22;border-radius:4px;text-align:center"><div style="font-size:10px;color:#8b949e">Best P&L</div><div style="font-size:14px;font-weight:600;color:' + (bestResult.total_pnl >= 0 ? '#2dc653' : '#f85149') + '">' + bestResult.total_pnl.toFixed(2) + '</div></div>';
    }
    summaryHtml += '</div>';
    summaryHtml += '<div style="font-size:10px;color:#8b949e">All cycles:</div>';
    allResults.forEach(function(r) {
      var c = r.win_rate >= targetWR ? '#2dc653' : '#f85149';
      summaryHtml += '<div style="font-size:10px;padding:2px 0;border-bottom:1px solid #161b22"><span style="color:#8b949e">Cycle ' + r.cycle + ':</span> <span style="color:' + c + '">WR=' + r.win_rate + '%</span> P&L=' + r.total_pnl.toFixed(2) + '</div>';
    });
    statusEl.innerHTML = summaryHtml;
  }

  if (bestResult) {
    showTrainResults(bestResult);
    console.log('[neural-training] AUTO TEST COMPLETE. Best: cycle=' + bestResult.cycle + ' WR=' + bestResult.win_rate + '% P&L=' + bestResult.total_pnl.toFixed(2));
  }

  autoTestRunning = false;
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
}

function stopAutoTest() {
  autoTestAbort = true;
  autoTestRunning = false;
  var startBtn = document.getElementById('bt-train-start');
  var stopBtn = document.getElementById('bt-train-stop');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  addBrainLog('INFO', 'Auto-test stopped by user');
}

async function runProofTest() {
  addBrainLog('INFO', 'Running proof test - verifying BUY/SELL signal generation...');
  console.log('[neural-training] === PROOF TEST: Verifying BUY/SELL triggers ===');

  var proofBtn = document.getElementById('bt-proof-test');
  if (proofBtn) { proofBtn.disabled = true; proofBtn.textContent = 'Testing...'; }

  try {
    var result = await brainFetch('/proof-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: 100, epic: neuralCurrentEpic || 'PROOF_TEST' })
    });

    if (result && result.ok) {
      var s = result.summary;
      console.log('[neural-training] PROOF TEST RESULTS:');
      console.log('[neural-training]   BUY signals:  ' + s.buy_count + ' total (' + s.uptrend_buys + '/' + s.uptrend_total + ' in uptrend = ' + (s.uptrend_buys / s.uptrend_total * 100).toFixed(1) + '%)');
      console.log('[neural-training]   SELL signals: ' + s.sell_count + ' total (' + s.downtrend_sells + '/' + s.downtrend_total + ' in downtrend = ' + (s.downtrend_sells / s.downtrend_total * 100).toFixed(1) + '%)');
      console.log('[neural-training]   HOLD signals: ' + s.hold_count);
      console.log('[neural-training]   Sample trades:');
      (result.sample_signals || []).slice(0, 10).forEach(function(sig) {
        console.log('[neural-training]     ' + sig.phase + ' step ' + sig.step + ': ' + sig.signal + ' @ ' + sig.price + ' (buy=' + sig.buy.toFixed(2) + ' sell=' + sig.sell.toFixed(2) + ')');
      });

      addBrainLog('INFO', 'Proof test: BUY=' + s.buy_count + ' SELL=' + s.sell_count + ' HOLD=' + s.hold_count);
      addBrainLog('INFO', 'Uptrend BUYs: ' + s.uptrend_buys + '/' + s.uptrend_total + ' (' + (s.uptrend_buys / s.uptrend_total * 100).toFixed(1) + '%)');
      addBrainLog('INFO', 'Downtrend SELLs: ' + s.downtrend_sells + '/' + s.downtrend_total + ' (' + (s.downtrend_sells / s.downtrend_total * 100).toFixed(1) + '%)');

      var resultDiv = document.getElementById('bt-train-results');
      if (resultDiv) {
        resultDiv.style.display = 'block';
        var sigHtml = (result.sample_signals || []).slice(0, 15).map(function(sig) {
          var sc = sig.signal === 'BUY' ? '#2dc653' : sig.signal === 'SELL' ? '#f85149' : '#d29922';
          return '<div style="display:grid;grid-template-columns:80px 50px 60px 60px 60px;gap:4px;padding:2px 0;border-bottom:1px solid #161b22;font-size:10px">' +
            '<span style="color:#8b949e">' + sig.phase + ' #' + sig.step + '</span>' +
            '<span style="color:' + sc + ';font-weight:600">' + sig.signal + '</span>' +
            '<span style="color:#c9d1d9">' + sig.price + '</span>' +
            '<span style="color:#2dc653">B:' + sig.buy.toFixed(1) + '</span>' +
            '<span style="color:#f85149">S:' + sig.sell.toFixed(1) + '</span></div>';
        }).join('');

        resultDiv.innerHTML =
          '<div style="color:#bc8cff;font-weight:600;margin-bottom:8px">Proof Test Results</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">' +
          '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">BUY Signals</div><div style="font-size:14px;font-weight:600;color:#2dc653">' + s.buy_count + '</div></div>' +
          '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">SELL Signals</div><div style="font-size:14px;font-weight:600;color:#f85149">' + s.sell_count + '</div></div>' +
          '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">HOLD</div><div style="font-size:14px;font-weight:600;color:#d29922">' + s.hold_count + '</div></div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
          '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Uptrend BUYs</div><div style="font-size:14px;font-weight:600;color:#2dc653">' + s.uptrend_buys + '/' + s.uptrend_total + ' (' + (s.uptrend_buys / s.uptrend_total * 100).toFixed(1) + '%)</div></div>' +
          '<div style="text-align:center;padding:6px;background:#161b22;border-radius:4px"><div style="font-size:10px;color:#8b949e">Downtrend SELLs</div><div style="font-size:14px;font-weight:600;color:#f85149">' + s.downtrend_sells + '/' + s.downtrend_total + ' (' + (s.downtrend_sells / s.downtrend_total * 100).toFixed(1) + '%)</div></div>' +
          '</div>' +
          '<div style="font-size:10px;color:#8b949e;margin-bottom:4px;font-weight:600">Sample Signals</div>' +
          '<div style="display:grid;grid-template-columns:80px 50px 60px 60px 60px;gap:4px;padding-bottom:4px;border-bottom:1px solid #21262d;font-weight:600;color:#8b949e;font-size:9px"><span>Phase</span><span>Signal</span><span>Price</span><span>Buy</span><span>Sell</span></div>' +
          sigHtml;
      }

      showToast('Proof test complete: ' + s.buy_count + ' BUY, ' + s.sell_count + ' SELL signals', true);
    } else {
      addBrainLog('ERROR', 'Proof test failed: ' + JSON.stringify(result));
      showToast('Proof test failed', false);
    }
  } catch (e) {
    addBrainLog('ERROR', 'Proof test error: ' + e.message);
    showToast('Proof test error: ' + e.message, false);
  }

  if (proofBtn) { proofBtn.disabled = false; proofBtn.textContent = 'Proof Test (Buy/Sell)'; }
}

async function refreshCortex() {
  var patterns = await brainGetPatterns();
  if (!patterns) return;
  patternMemoryCache = patterns;
  var container = document.getElementById('cortex-pattern-grid');
  if (!container) return;
  var keys = Object.keys(patterns);
  var countEl = document.getElementById('cortex-instrument-count');
  if (countEl) countEl.textContent = keys.length;
  if (keys.length === 0) {
    container.innerHTML = '<div style="color:#484f58;text-align:center;padding:24px;font-size:12px">No patterns learned yet. Train the brain on live or backtest data first.</div>';
    return;
  }
  var html = '';
  keys.forEach(function(epic) {
    var p = patterns[epic];
    var ls = p.last_signal || {};
    var buy = ls.buy_signal || 0;
    var sell = ls.sell_signal || 0;
    var hold = ls.hold_signal || 0;
    var maxSig = Math.max(buy, sell, hold, 1);
    var buyPct = Math.min(100, (buy / maxSig) * 100);
    var sellPct = Math.min(100, (sell / maxSig) * 100);
    var holdPct = Math.min(100, (hold / maxSig) * 100);
    var dominant = buy > sell && buy > hold ? 'BUY' : sell > buy && sell > hold ? 'SELL' : 'HOLD';
    var domColor = dominant === 'BUY' ? '#2dc653' : dominant === 'SELL' ? '#f85149' : '#d29922';
    var maturity = p.tick_count || 0;
    var matLabel = maturity < 50 ? 'Immature' : maturity < 200 ? 'Learning' : maturity < 500 ? 'Maturing' : 'Mature';
    var matColor = maturity < 50 ? '#f85149' : maturity < 200 ? '#d29922' : maturity < 500 ? '#58a6ff' : '#2dc653';
    var shortName = epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'');
    var isActive = epic === neuralCurrentEpic;
    var confidence = maturity >= 100 ? Math.min(99, Math.round(Math.abs(buy - sell) / Math.max(buy + sell, 1) * 100)) : 0;
    html += '<div data-card-epic="' + escHtml(epic) + '" data-card-name="' + escHtml(shortName) + '" style="cursor:pointer;background:' + (isActive ? 'rgba(88,166,255,0.08)' : '#0d1117') + ';border:1px solid ' + (isActive ? '#58a6ff' : '#21262d') + ';border-radius:6px;padding:12px;transition:border-color 0.2s;' + (isActive ? 'box-shadow:0 0 8px rgba(88,166,255,0.15);' : '') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div><span style="font-weight:700;font-size:13px;color:' + (isActive ? '#58a6ff' : '#c9d1d9') + '">' + escHtml(shortName) + '</span>' +
      (isActive ? ' <span style="font-size:9px;background:#1c2541;color:#58a6ff;padding:1px 6px;border-radius:8px">ACTIVE</span>' : '') + '</div>' +
      '<span style="font-size:10px;padding:2px 8px;border-radius:8px;font-weight:600;background:' + domColor + '22;color:' + domColor + '">' + dominant + '</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">' +
      '<div style="text-align:center"><div style="font-size:9px;color:#8b949e">BUY</div><div style="font-size:16px;font-weight:700;color:#2dc653">' + buy.toFixed(1) + '</div>' +
      '<div style="height:4px;background:#161b22;border-radius:2px;overflow:hidden;margin-top:2px"><div style="height:100%;width:' + buyPct.toFixed(0) + '%;background:#2dc653;border-radius:2px"></div></div></div>' +
      '<div style="text-align:center"><div style="font-size:9px;color:#8b949e">SELL</div><div style="font-size:16px;font-weight:700;color:#f85149">' + sell.toFixed(1) + '</div>' +
      '<div style="height:4px;background:#161b22;border-radius:2px;overflow:hidden;margin-top:2px"><div style="height:100%;width:' + sellPct.toFixed(0) + '%;background:#f85149;border-radius:2px"></div></div></div>' +
      '<div style="text-align:center"><div style="font-size:9px;color:#8b949e">HOLD</div><div style="font-size:16px;font-weight:700;color:#d29922">' + hold.toFixed(1) + '</div>' +
      '<div style="height:4px;background:#161b22;border-radius:2px;overflow:hidden;margin-top:2px"><div style="height:100%;width:' + holdPct.toFixed(0) + '%;background:#d29922;border-radius:2px"></div></div></div></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:6px">' +
      '<span style="color:#8b949e">Ticks: <strong style="color:#c9d1d9">' + maturity + '</strong></span>' +
      '<span style="color:' + matColor + ';font-weight:600">' + matLabel + '</span>' +
      '<span style="color:#8b949e">Conf: <strong style="color:#bc8cff">' + confidence + '%</strong></span></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:10px">' +
      '<span style="color:#8b949e">Price: <strong style="color:#d29922">' + (p.last_price ? p.last_price.toFixed(2) : '--') + '</strong></span>' +
      '<span style="color:#8b949e">Learned: ' + (p.learned_at ? new Date(p.learned_at).toLocaleDateString() : '--') + '</span></div>';
    if (p.recent_ticks && p.recent_ticks.length > 2) {
      html += '<div style="margin-top:6px"><canvas id="cortex-mini-' + epic.replace(/\./g,'_') + '" height="30" style="width:100%;border-radius:3px"></canvas></div>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
  container.querySelectorAll('[data-card-epic]').forEach(function(card) {
    card.addEventListener('click', function() {
      var epic = card.getAttribute('data-card-epic');
      var name = card.getAttribute('data-card-name') || epic;
      if (epic && epic !== neuralCurrentEpic) {
        neuralSelectInstrument({ epic: epic, name: name, isStream: false });
        refreshCortex();
      }
    });
    card.addEventListener('mouseenter', function() {
      if (card.getAttribute('data-card-epic') !== neuralCurrentEpic) card.style.borderColor = '#58a6ff';
    });
    card.addEventListener('mouseleave', function() {
      if (card.getAttribute('data-card-epic') !== neuralCurrentEpic) card.style.borderColor = '#21262d';
    });
  });
  keys.forEach(function(epic) {
    var p = patterns[epic];
    if (p.recent_ticks && p.recent_ticks.length > 2) {
      var canvasId = 'cortex-mini-' + epic.replace(/\./g,'_');
      var canvas = document.getElementById(canvasId);
      if (canvas) drawMiniSignalChart(canvas, p.recent_ticks);
    }
  });
  renderCortexSignalSummary(patterns);
}

function drawMiniSignalChart(canvas, ticks) {
  var ctx = canvas.getContext('2d');
  var w = canvas.offsetWidth || 200;
  var h = canvas.height;
  canvas.width = w;
  ctx.clearRect(0, 0, w, h);
  if (ticks.length < 2) return;
  var stepX = w / (ticks.length - 1);
  function drawLine(vals, color) {
    var max = Math.max.apply(null, vals.map(function(v) { return Math.abs(v); })) || 1;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (var i = 0; i < vals.length; i++) {
      var x = i * stepX;
      var y = h - (vals[i] / max) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  drawLine(ticks.map(function(t) { return t.buy || 0; }), '#2dc653');
  drawLine(ticks.map(function(t) { return t.sell || 0; }), '#f85149');
}

function renderCortexSignalSummary(patterns) {
  var summaryEl = document.getElementById('cortex-signal-summary');
  if (!summaryEl) return;
  var keys = Object.keys(patterns);
  if (keys.length === 0) { summaryEl.innerHTML = '<div style="color:#484f58;text-align:center;padding:8px">No data</div>'; return; }
  var html = '<table style="width:100%;font-size:11px;border-collapse:collapse">' +
    '<thead><tr style="border-bottom:1px solid #30363d"><th style="text-align:left;padding:4px 6px;color:#8b949e">Instrument</th><th style="text-align:center;padding:4px;color:#8b949e">Signal</th><th style="text-align:center;padding:4px;color:#8b949e">Strength</th><th style="text-align:center;padding:4px;color:#8b949e">Maturity</th><th style="text-align:center;padding:4px;color:#8b949e">Action</th></tr></thead><tbody>';
  keys.forEach(function(epic) {
    var p = patterns[epic];
    var ls = p.last_signal || {};
    var buy = ls.buy_signal || 0;
    var sell = ls.sell_signal || 0;
    var dominant = buy > sell ? 'BUY' : 'SELL';
    var strength = Math.abs(buy - sell);
    var domColor = dominant === 'BUY' ? '#2dc653' : '#f85149';
    var maturity = p.tick_count || 0;
    var tradeable = maturity >= 100 && strength > cortexHoldZone;
    var shortName = epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'');
    html += '<tr style="border-bottom:1px solid #161b22">' +
      '<td style="padding:4px 6px;color:#58a6ff;font-weight:600">' + escHtml(shortName) + '</td>' +
      '<td style="text-align:center;padding:4px;color:' + domColor + ';font-weight:700">' + dominant + '</td>' +
      '<td style="text-align:center;padding:4px"><div style="display:inline-block;width:60px;height:6px;background:#161b22;border-radius:3px;overflow:hidden;vertical-align:middle"><div style="height:100%;width:' + Math.min(100, strength).toFixed(0) + '%;background:' + domColor + ';border-radius:3px"></div></div> <span style="color:#c9d1d9;font-size:10px">' + strength.toFixed(1) + '</span></td>' +
      '<td style="text-align:center;padding:4px;font-size:10px;color:' + (maturity >= 200 ? '#2dc653' : maturity >= 100 ? '#d29922' : '#f85149') + '">' + maturity + '</td>' +
      '<td style="text-align:center;padding:4px">' + (tradeable ? '<button onclick="cortexManualTrade(\'' + escHtml(epic) + '\',\'' + dominant + '\')" style="font-size:9px;padding:2px 8px;border-radius:3px;border:1px solid ' + domColor + ';background:' + domColor + '22;color:' + domColor + ';cursor:pointer;font-weight:600">' + dominant + '</button>' : '<span style="font-size:9px;color:#484f58">--</span>') + '</td></tr>';
  });
  html += '</tbody></table>';
  summaryEl.innerHTML = html;
}

async function cortexManualTrade(epic, direction) {
  if (!epic) { addBrainLog('ERROR', 'No epic for manual trade'); return; }
  if (neuralCurrentEpic !== epic) {
    var shortName = epic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'');
    neuralSelectInstrument({ epic: epic, name: shortName, isStream: true });
  }
  addBrainLog('CORTEX', 'Manual trade from cortex: ' + direction + ' ' + epic);
  await neuralPlaceOrder(direction);
  setTimeout(refreshCortex, 2000);
}

async function cortexPlaceOrder(direction) {
  if (!neuralCurrentEpic) { addBrainLog('ERROR', 'No instrument selected'); return null; }
  addBrainLog('CORTEX', 'Cortex placing ' + direction + ' order: ' + neuralCurrentEpic + ' x' + cortexPositionSize);
  try {
    var result = await apiPost('/api/ig/positions/open', { epic: neuralCurrentEpic, direction: direction, size: cortexPositionSize });
    if (result && result.ok && result.dealReference) {
      var dealId = (result.confirmation && result.confirmation.dealId) || result.dealReference;
      addBrainLog('CORTEX', direction + ' order placed: ' + result.dealReference + ' dealId=' + dealId);
      brainTradeLog.push({ timestamp: new Date().toISOString(), epic: neuralCurrentEpic, direction: direction, size: cortexPositionSize, dealRef: result.dealReference, dealId: dealId, price: neuralLastPrice, source: 'cortex-auto' });
      if (trainingModeActive) brainFeedback('sugar');
      return { ok: true, dealId: dealId, dealRef: result.dealReference };
    } else {
      addBrainLog('ERROR', 'Cortex ' + direction + ' failed: ' + ((result && result.error) || 'Order failed'));
      if (trainingModeActive) brainFeedback('pain');
      return null;
    }
  } catch (e) {
    addBrainLog('ERROR', 'Cortex ' + direction + ' error: ' + e.message);
    return null;
  }
}

async function cortexVerifyPositionExists(dealId) {
  try {
    var posData = await apiFetch('/api/ig/positions');
    if (posData && posData.positions) {
      for (var i = 0; i < posData.positions.length; i++) {
        var p = posData.positions[i];
        var pDealId = (p.position && p.position.dealId) || p.dealId || '';
        if (pDealId === dealId) return true;
      }
    }
    return false;
  } catch (e) {
    addBrainLog('WARN', 'Position verify API error: ' + e.message);
    return 'error';
  }
}

async function cortexClosePosition(pos) {
  if (!pos || !pos.dealId) {
    addBrainLog('WARN', 'No dealId to close, skipping');
    return false;
  }
  var exists = await cortexVerifyPositionExists(pos.dealId);
  if (exists === false) {
    addBrainLog('CORTEX', 'Position dealId=' + pos.dealId + ' no longer exists on IG — was closed externally');
    return 'gone';
  }
  if (exists === 'error') {
    addBrainLog('WARN', 'Cannot verify position on IG — skipping close attempt to avoid confusion');
    return false;
  }
  addBrainLog('CORTEX', 'Closing ' + pos.direction + ' position dealId=' + pos.dealId);
  try {
    var closeDir = pos.direction === 'BUY' ? 'SELL' : 'BUY';
    var result = await apiPost('/api/ig/positions/close', { dealId: pos.dealId, direction: closeDir, size: pos.size || cortexPositionSize });
    if (result && result.ok) {
      var conf = result.confirmation || result;
      var dealStatus = conf.dealStatus || '';
      var rejectReason = conf.reason || '';
      if (dealStatus === 'REJECTED') {
        var rejLower = (rejectReason || '').toLowerCase();
        if (rejLower.indexOf('unknown position') >= 0 || rejLower.indexOf('invalid dealid') >= 0 || rejLower.indexOf('position already closed') >= 0) {
          addBrainLog('CORTEX', 'Close REJECTED (position gone): ' + rejectReason + ' (dealId=' + pos.dealId + ')');
          return 'gone';
        }
        addBrainLog('ERROR', 'Close REJECTED by IG: ' + rejectReason + ' (dealId=' + pos.dealId + ')');
        return false;
      }
      addBrainLog('CORTEX', 'Position closed: ' + pos.dealId + (dealStatus ? ' status=' + dealStatus : ''));
      return true;
    } else {
      var errMsg = (result && result.error) || 'unknown';
      var errLower = errMsg.toLowerCase();
      if (errLower.indexOf('could not determine direction') >= 0 || errLower.indexOf('missing size') >= 0) {
        addBrainLog('CORTEX', 'Close failed (position likely gone): ' + errMsg + ' — verifying...');
        var recheck = await cortexVerifyPositionExists(pos.dealId);
        if (recheck === false) {
          addBrainLog('CORTEX', 'Confirmed: position dealId=' + pos.dealId + ' no longer on IG');
          return 'gone';
        }
      }
      addBrainLog('ERROR', 'Close failed: ' + errMsg);
      return false;
    }
  } catch (e) {
    addBrainLog('ERROR', 'Close error: ' + e.message);
    return false;
  }
}

function cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel) {
  var dir = cortexOpenPosition ? cortexOpenPosition.direction : '?';
  var dealId = cortexOpenPosition ? cortexOpenPosition.dealId : '?';
  var entry = cortexOpenPosition ? (cortexOpenPosition.entry || 0) : 0;
  var pnl = dir === 'BUY' ? (closePrice - entry) : (entry - closePrice);
  addBrainLog('CORTEX', 'Position was closed externally (dealId=' + dealId + ') — clearing and resuming');
  cortexAddDecision({ time: timeStr, action: 'EXT CLOSE', detail: dir + ' dealId=' + dealId + ' closed outside bot, pnl~' + pnl.toFixed(1) + ' pips @ ' + closePrice.toFixed(2) });
  cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'EXT CLOSE ' + dir, buy: buy || 0, sell: sell || 0, price: closePrice, size: (cortexOpenPosition && cortexOpenPosition.size) || cortexPositionSize, tf: tfLabel, pnl: pnl, dealId: dealId });
  renderCortexTradeLog();
  cortexOpenPosition = null;
  cortexExitConsecutiveCount = 0;
  cortexSaveState();
}

function cortexAddDecision(entry, skipPush) {
  if (!skipPush) {
    cortexDecisionLog.push(entry);
    if (cortexDecisionLog.length > 200) cortexDecisionLog = cortexDecisionLog.slice(-150);
  }
  var monEl = document.getElementById('cortex-decision-monitor');
  var countEl = document.getElementById('cortex-monitor-count');
  if (!monEl) return;
  var html = '';
  var start = Math.max(0, cortexDecisionLog.length - 50);
  for (var i = start; i < cortexDecisionLog.length; i++) {
    var d = cortexDecisionLog[i];
    var color = '#8b949e';
    if (d.action === 'BUY' || d.action === 'OPENED BUY') color = '#2dc653';
    else if (d.action === 'SELL' || d.action === 'OPENED SELL') color = '#f85149';
    else if (d.action === 'CLOSED') color = '#bc8cff';
    else if (d.action === 'HOLD') color = '#d29922';
    else if (d.action === 'COOLDOWN' || d.action === 'MAX_POS') color = '#484f58';
    else if (d.action === 'CONFIRMING') color = '#58a6ff';
    else if (d.action === 'HOLDING') color = '#d29922';
    html += '<div style="padding:1px 2px;border-bottom:1px solid #161b22;display:grid;grid-template-columns:60px 70px 1fr;gap:4px">' +
      '<span style="color:#484f58">' + d.time + '</span>' +
      '<span style="color:' + color + ';font-weight:600">' + d.action + '</span>' +
      '<span style="color:#c9d1d9">' + d.detail + '</span></div>';
  }
  monEl.innerHTML = html;
  monEl.scrollTop = monEl.scrollHeight;
  if (countEl) countEl.textContent = cortexDecisionLog.length + ' decisions';
}

function cortexReadParams() {
  var changed = [];
  function readF(id, def) { return parseFloat((document.getElementById(id) || {}).value) || def; }
  function readI(id, def) { return parseInt((document.getElementById(id) || {}).value) || def; }
  function readC(id, def) { var el = document.getElementById(id); return el ? el.checked : def; }
  function track(name, oldVal, newVal) { if (oldVal !== newVal) changed.push(name + ':' + oldVal + '→' + newVal); return newVal; }

  cortexBuyThreshold = track('buyThresh', cortexBuyThreshold, readF('cortex-buy-thresh', 10));
  cortexSellThreshold = track('sellThresh', cortexSellThreshold, readF('cortex-sell-thresh', 10));
  cortexCooldownMs = track('cooldown', cortexCooldownMs, readF('cortex-cooldown', 60) * 1000);
  cortexMaxOpenPositions = track('maxPos', cortexMaxOpenPositions, readI('cortex-max-pos', 3));
  cortexMinPositionSize = track('minSize', cortexMinPositionSize, readF('cortex-min-size', 0.5));
  cortexMaxPositionSize = track('maxSize', cortexMaxPositionSize, readF('cortex-max-size', 2.0));
  cortexAutoSize = track('autoSize', cortexAutoSize, readC('cortex-auto-size', true));
  cortexStopLossPips = track('SL', cortexStopLossPips, readF('cortex-sl', 50));
  cortexTakeProfitPips = track('TP', cortexTakeProfitPips, readF('cortex-tp', 100));
  cortexPriceExitsEnabled = track('priceExits', cortexPriceExitsEnabled, readC('cortex-price-exits', false));
  cortexAutoLearn = track('autoLearn', cortexAutoLearn, readC('cortex-auto-learn', true));
  cortexHoldZone = track('holdZone', cortexHoldZone, readF('cortex-hold-zone', 2));
  cortexMinHoldCandles = track('minHold', cortexMinHoldCandles, readI('cortex-min-hold', 5));
  cortexConfirmCandles = track('confirm', cortexConfirmCandles, readI('cortex-confirm', 1));
  cortexExitConfirmCandles = track('exitConfirm', cortexExitConfirmCandles, readI('cortex-exit-confirm', 2));
  antenna.flashThreshold = track('flash', antenna.flashThreshold, readF('antenna-flash-thresh', 3.0));
  antenna.deadCatSensitivity = track('deadCat', antenna.deadCatSensitivity, readF('antenna-deadcat-sens', 0.5));
  antenna.emergencyExitEnabled = track('emergency', antenna.emergencyExitEnabled, readC('antenna-emergency', true));
  antenna.breakoutRiderEnabled = track('breakout', antenna.breakoutRiderEnabled, readC('antenna-breakout', true));
  antenna.fallingKnifeBlock = track('knife', antenna.fallingKnifeBlock, readC('antenna-knife', true));

  if (changed.length > 0) {
    cortexAddDecision({ time: new Date().toLocaleTimeString(), action: 'PARAMS', detail: changed.join(' | ') });
    cortexSaveState();
  }
  return changed;
}

function toggleCortexAutoTrade() {
  cortexAutoTradeEnabled = !cortexAutoTradeEnabled;
  var btn = document.getElementById('cortex-auto-trade-btn');
  var statusEl = document.getElementById('cortex-auto-status');
  if (cortexAutoTradeEnabled) {
    if (!neuralCurrentEpic) {
      addBrainLog('ERROR', 'Select an instrument before enabling auto-trade');
      cortexAutoTradeEnabled = false;
      return;
    }
    cortexReadParams();
    antenna.ticks = [];
    antenna.recentHigh = 0;
    antenna.recentLow = Infinity;
    cortexConsecutiveSignal = null;
    cortexConsecutiveCount = 0;
    cortexExitConsecutiveCount = 0;
    cortexVerifyTickCount = 4;
    cortexLastVerifyTs = 0;
    if (!cortexOpenPosition) cortexDecisionLog = [];
    var monEl = document.getElementById('cortex-decision-monitor');
    if (monEl) monEl.innerHTML = '';
    cortexAddDecision({ time: new Date().toLocaleTimeString(), action: 'START', detail: 'hold=' + cortexHoldZone + ' minHold=' + cortexMinHoldCandles + ' confirm=' + cortexConfirmCandles + ' exitConfirm=' + cortexExitConfirmCandles + ' | PriceTP/SL=' + cortexPriceExitsEnabled + ' AutoLearn=' + cortexAutoLearn + ' | ANTENNA flash=' + antenna.flashThreshold + ' emrg=' + antenna.emergencyExitEnabled + ' breakout=' + antenna.breakoutRiderEnabled + ' knife=' + antenna.fallingKnifeBlock });
    if (btn) { btn.textContent = 'AUTO-TRADE ON'; btn.style.background = '#1b4332'; btn.style.color = '#2dc653'; btn.style.borderColor = '#2dc653'; }
    if (statusEl) { statusEl.textContent = 'Active - monitoring ' + neuralCurrentEpic; statusEl.style.color = '#2dc653'; }
    cortexTimeframe = (document.getElementById('cortex-timeframe') || {}).value || 'MINUTE_5';
    if (cortexTimeframe === 'AUTO') {
      cortexAutoSelectTimeframe().then(function() {
        addBrainLog('CORTEX', 'Auto-selected timeframe: ' + (cortexAutoTimeframeSelected || 'MINUTE_5'));
      });
    }
    var effectiveTf = cortexTimeframe === 'AUTO' ? (cortexAutoTimeframeSelected || 'MINUTE_5') : cortexTimeframe;
    var tfSec = cortexTimeframeSec[effectiveTf] || 300;
    var pollInterval;
    if (effectiveTf === 'TICK' || effectiveTf === 'SECOND') pollInterval = 1000;
    else if (tfSec <= 5) pollInterval = Math.max(1000, tfSec * 1000);
    else if (tfSec <= 30) pollInterval = Math.max(2000, tfSec * 500);
    else pollInterval = Math.max(5000, tfSec * 500);
    pollInterval = Math.min(pollInterval, 60000);
    cortexLastCandleTs = 0;
    addBrainLog('CORTEX', 'Auto-trade ENABLED for ' + neuralCurrentEpic + ' | TF=' + cortexTimeframe + ' Poll=' + Math.round(pollInterval/1000) + 's | Buy>' + cortexBuyThreshold + ' Sell>' + cortexSellThreshold + ' CD=' + (cortexCooldownMs/1000) + 's');
    if (cortexAutoTradeInterval) clearInterval(cortexAutoTradeInterval);
    cortexAutoTradeInterval = setInterval(cortexAutoTradeCheck, pollInterval);
    cortexAutoTradeCheck();
  } else {
    if (cortexAutoTradeInterval) { clearInterval(cortexAutoTradeInterval); cortexAutoTradeInterval = null; }
    if (cortexOpenPosition) {
      addBrainLog('CORTEX', 'Auto-trade OFF — clearing tracked position dealId=' + cortexOpenPosition.dealId + ' (position may still be open on IG, manage manually)');
      cortexOpenPosition = null;
      cortexExitConsecutiveCount = 0;
    }
    cortexVerifyTickCount = 0;
    cortexLastVerifyTs = 0;
    if (btn) { btn.textContent = 'AUTO-TRADE OFF'; btn.style.background = '#3d1a1a'; btn.style.color = '#f85149'; btn.style.borderColor = '#f85149'; }
    if (statusEl) { statusEl.textContent = 'Disabled'; statusEl.style.color = '#f85149'; }
    addBrainLog('CORTEX', 'Auto-trade DISABLED');
    cortexSaveState();
  }
}

async function cortexAutoTradeCheck() {
  if (!cortexAutoTradeEnabled || !neuralCurrentEpic) return;
  if (cortexCheckRunning) return;
  cortexCheckRunning = true;
  try { await _cortexAutoTradeCheckInner(); } finally { cortexCheckRunning = false; }
}
function cortexCalcAutoSize(buy, sell) {
  if (!cortexAutoSize) return cortexMinPositionSize;
  var strength = Math.abs(buy - sell);
  var maxStrength = Math.max(cortexBuyThreshold, cortexSellThreshold) * 1.5;
  var ratio = Math.min(1, Math.max(0, strength / maxStrength));
  var size = cortexMinPositionSize + ratio * (cortexMaxPositionSize - cortexMinPositionSize);
  size = Math.round(size * 10) / 10;
  size = Math.max(cortexMinPositionSize, Math.min(cortexMaxPositionSize, size));
  return size;
}

function cortexTfLabel(tf) {
  if (tf === 'TICK') return 'TICK';
  if (tf === 'SECOND') return 'S1';
  return tf.replace('SECOND_', 'S').replace('MINUTE_', 'M').replace('MINUTE', 'M1').replace('HOUR_', 'H').replace('HOUR', 'H1').replace('DAY', 'D1');
}

function cortexExtractPrice(candle, field) {
  var v = candle[field + 'Price'] || candle[field];
  if (!v) return 0;
  if (typeof v === 'object') return v.mid || v.bid || 0;
  return parseFloat(v) || 0;
}

async function _cortexAutoTradeCheckInner() {
  cortexReadParams();
  var now = Date.now();
  var statusEl = document.getElementById('cortex-auto-status');
  var effectiveTf = cortexTimeframe === 'AUTO' ? (cortexAutoTimeframeSelected || 'MINUTE_5') : cortexTimeframe;
  var tfLabel = cortexTfLabel(effectiveTf);
  var isTickMode = effectiveTf === 'TICK' || effectiveTf.indexOf('SECOND') === 0;
  var timeStr = new Date().toLocaleTimeString();

  if (now - cortexLastTradeTs < cortexCooldownMs) {
    var remaining = Math.ceil((cortexCooldownMs - (now - cortexLastTradeTs)) / 1000);
    if (statusEl) { statusEl.textContent = 'Cooldown: ' + remaining + 's | TF=' + tfLabel + ' | ' + neuralCurrentEpic; statusEl.style.color = '#d29922'; }
    cortexAddDecision({ time: timeStr, action: 'COOLDOWN', detail: remaining + 's remaining' });
    cortexTickSave();
    return;
  }
  try {
    var closePrice = 0, openPrice = 0, highPrice = 0, lowPrice = 0, candleSnap = '';
    if (isTickMode) {
      var streamData = await apiFetch('/api/ig/stream/status');
      var inst = streamData && streamData.instruments && streamData.instruments[neuralCurrentEpic];
      if (inst && (inst.bid || inst.offer)) {
        closePrice = inst.mid || ((inst.bid + inst.offer) / 2) || inst.bid || 0;
        openPrice = closePrice;
        highPrice = closePrice;
        lowPrice = closePrice;
      } else {
        closePrice = neuralLastPrice || 0;
      }
      candleSnap = new Date().toLocaleTimeString();
      if (effectiveTf !== 'TICK') {
        var intervalSec = cortexTimeframeSec[effectiveTf] || 10;
        var currentBucket = Math.floor(now / (intervalSec * 1000));
        if (currentBucket === cortexLastCandleTs) {
          if (statusEl) { statusEl.textContent = 'Aggregating ' + tfLabel + '... price=' + closePrice.toFixed(2); statusEl.style.color = '#8b949e'; }
          cortexCandleBuffer.push(closePrice);
          return;
        }
        cortexLastCandleTs = currentBucket;
        if (cortexCandleBuffer.length > 0) {
          openPrice = cortexCandleBuffer[0];
          highPrice = Math.max.apply(null, cortexCandleBuffer);
          lowPrice = Math.min.apply(null, cortexCandleBuffer);
          closePrice = cortexCandleBuffer[cortexCandleBuffer.length - 1];
        }
        cortexCandleBuffer = [closePrice];
      }
    } else {
      var igRes = effectiveTf;
      if (effectiveTf === 'MINUTE_2' || effectiveTf === 'MINUTE_3') igRes = 'MINUTE';
      var candleData = await apiFetch('/api/ig/stream/candles?epic=' + encodeURIComponent(neuralCurrentEpic) + '&resolution=' + igRes + '&max=5');
      var candles = (candleData && candleData.prices) || [];
      if (!candles.length) {
        if (statusEl) { statusEl.textContent = 'No candle data for ' + tfLabel + ' | Waiting...'; statusEl.style.color = '#8b949e'; }
        cortexAddDecision({ time: timeStr, action: 'WAIT', detail: 'no candle data for ' + tfLabel });
        return;
      }
      var latestCandle = candles[candles.length - 1];
      candleSnap = latestCandle.snapshotTime || latestCandle.snapshotTimeUTC || '';
      var candleTs = new Date(candleSnap.replace(/\//g, '-').replace(' ', 'T')).getTime() || 0;
      if (effectiveTf === 'MINUTE_2' || effectiveTf === 'MINUTE_3') {
        var groupSec = (effectiveTf === 'MINUTE_2' ? 120 : 180);
        var bucket = Math.floor(candleTs / (groupSec * 1000));
        if (bucket === cortexLastCandleTs) {
          if (statusEl) { statusEl.textContent = 'Waiting for new ' + tfLabel + ' close... | ' + candleSnap; statusEl.style.color = '#8b949e'; }
          return;
        }
        cortexLastCandleTs = bucket;
      } else {
        if (candleTs && candleTs === cortexLastCandleTs) {
          if (statusEl) { statusEl.textContent = 'Waiting for new ' + tfLabel + ' candle... | ' + candleSnap; statusEl.style.color = '#8b949e'; }
          return;
        }
        cortexLastCandleTs = candleTs;
      }
      closePrice = cortexExtractPrice(latestCandle, 'close');
      openPrice = cortexExtractPrice(latestCandle, 'open');
      highPrice = cortexExtractPrice(latestCandle, 'high');
      lowPrice = cortexExtractPrice(latestCandle, 'low');
      if (!closePrice) closePrice = neuralLastPrice || 0;
    }

    var pressure = antennaComputePressure();
    renderAntennaPressure(pressure);

    var prevP = cortexPrevPrice || openPrice || closePrice;
    var cortexSpread = (highPrice && lowPrice) ? Math.abs(highPrice - lowPrice) : Math.abs(closePrice - (prevP || closePrice));
    var result = await brainFetch('/stimulate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ epic: neuralCurrentEpic, price: closePrice, prevPrice: prevP, volume: 0, spread: cortexSpread, pressure: pressure })
    });
    cortexPrevPrice = closePrice;
    if (!result) {
      if (statusEl) { statusEl.textContent = 'Brain step failed | TF=' + tfLabel; statusEl.style.color = '#f85149'; }
      cortexAddDecision({ time: timeStr, action: 'ERROR', detail: 'brain step failed' });
      return;
    }
    var buy = result.buy_signal || 0;
    var sell = result.sell_signal || 0;
    var spread = Math.abs(buy - sell);
    var antennaAlerts = result.antenna_alerts || {};
    var tradeSize = cortexCalcAutoSize(buy, sell);
    cortexPositionSize = tradeSize;
    var sizeLabel = cortexAutoSize ? tradeSize.toFixed(1) + ' (auto)' : tradeSize.toFixed(1);
    var antSummary = '';
    if (pressure.flashCrashScore >= 1) antSummary += ' FLASH=' + pressure.flashCrashScore.toFixed(1);
    if (pressure.deadCatScore >= 0.5) antSummary += ' DC=' + pressure.deadCatScore.toFixed(1);
    if (pressure.absorptionScore >= 1) antSummary += ' ABS=' + pressure.absorptionScore.toFixed(1);
    if (pressure.fallingKnifeScore >= 1) antSummary += ' FK=' + pressure.fallingKnifeScore.toFixed(1);
    if (pressure.divergenceScore >= 0.5) antSummary += ' DIV=' + pressure.divergenceScore.toFixed(1);
    var currentSig = tfLabel + ' | ' + closePrice.toFixed(2) + ' | Buy=' + buy.toFixed(1) + ' Sell=' + sell.toFixed(1) + ' sprd=' + spread.toFixed(1) + antSummary;
    var tfEl = document.getElementById('cortex-current-tf');
    if (tfEl) tfEl.textContent = tfLabel + ' | ' + candleSnap;
    var sizePreview = document.getElementById('cortex-size-preview');
    if (sizePreview) sizePreview.textContent = (cortexAutoSize ? 'Auto' : 'Fixed') + ': ' + tradeSize.toFixed(1) + ' (signal spread=' + spread.toFixed(1) + ', range ' + cortexMinPositionSize + '-' + cortexMaxPositionSize + ')';

    if (cortexOpenPosition) {
      cortexVerifyTickCount++;
      var needsVerify = cortexOpenPosition._unverified || (cortexVerifyTickCount >= 5 && (now - cortexLastVerifyTs) >= 30000);
      if (needsVerify) {
        cortexVerifyTickCount = 0;
        cortexLastVerifyTs = now;
        try {
          var verifyData = await apiFetch('/api/ig/positions');
          var found = false;
          if (verifyData && verifyData.positions) {
            for (var vi = 0; vi < verifyData.positions.length; vi++) {
              var vp = verifyData.positions[vi];
              var vpId = (vp.position && vp.position.dealId) || vp.dealId || '';
              if (vpId === cortexOpenPosition.dealId) { found = true; break; }
            }
          }
          if (found) {
            if (cortexOpenPosition._unverified) {
              delete cortexOpenPosition._unverified;
              addBrainLog('CORTEX', 'Position dealId=' + cortexOpenPosition.dealId + ' re-verified on IG');
              cortexSaveState();
            }
          } else {
            addBrainLog('CORTEX', 'Position dealId=' + cortexOpenPosition.dealId + ' no longer on IG — externally closed');
            cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel);
            return;
          }
        } catch (reVerifyErr) {
          if (cortexOpenPosition._unverified) {
            addBrainLog('WARN', 'Re-verify failed: ' + reVerifyErr.message + ' — skipping trade check');
            return;
          }
        }
      }
    }
    if (cortexOpenPosition) {
      var emergencyAction = antennaCheckEmergency(pressure, cortexOpenPosition);
      if (emergencyAction) {
        addBrainLog('ANTENNA', emergencyAction.reason);
        var emergClosed = await cortexClosePosition(cortexOpenPosition);
        if (emergClosed === 'gone') { cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel); return; }
        cortexAddDecision({ time: timeStr, action: 'EMERGENCY', detail: emergencyAction.reason + (emergClosed ? ' CLOSED OK' : ' CLOSE FAILED — keeping position') });
        if (emergClosed) {
          var emergPnl = cortexOpenPosition.direction === 'BUY' ? (closePrice - (cortexOpenPosition.entry || 0)) : ((cortexOpenPosition.entry || 0) - closePrice);
          cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'EMRG CLOSE ' + cortexOpenPosition.direction, buy: buy, sell: sell, price: closePrice, size: cortexOpenPosition.size || cortexPositionSize, tf: tfLabel, pnl: emergPnl });
          renderCortexTradeLog();
          if (cortexAutoLearn) { brainFeedback('pain'); addBrainLog('BRAIN', 'Auto-learn: PAIN for emergency close (' + emergPnl.toFixed(1) + ' pips)'); }
          cortexOpenPosition = null;
          cortexExitConsecutiveCount = 0;
        } else {
          addBrainLog('WARN', 'Emergency close FAILED — position still tracked, will retry');
        }
        cortexLastTradeTs = Date.now();
        cortexSaveState();
        return;
      }
    }

    if (!cortexOpenPosition) {
      var breakoutAction = antennaCheckBreakout(pressure);
      if (breakoutAction && now - cortexLastTradeTs >= cortexCooldownMs) {
        try {
          var bPosData = await apiFetch('/api/ig/positions');
          var bAllPos = (bPosData && bPosData.positions) || [];
          var bTotal = bAllPos.length;
          var bEpicCount = bAllPos.filter(function(p) { var e = (p.market && p.market.epic) || ''; return e === neuralCurrentEpic; }).length;
          var BREAKOUT_HARD_MAX = 5;
          if (bEpicCount >= cortexMaxOpenPositions) {
            addBrainLog('WARN', 'BREAKOUT blocked: ' + bEpicCount + '/' + cortexMaxOpenPositions + ' positions on ' + neuralCurrentEpic);
            cortexAddDecision({ time: timeStr, action: 'BREAKOUT_MAX', detail: bEpicCount + '/' + cortexMaxOpenPositions + ' positions on epic — breakout refused' });
            return;
          }
          if (bTotal >= BREAKOUT_HARD_MAX) {
            addBrainLog('WARN', 'BREAKOUT blocked: HARD MAX ' + bTotal + '/' + BREAKOUT_HARD_MAX + ' total positions');
            cortexAddDecision({ time: timeStr, action: 'BREAKOUT_MAX', detail: 'HARD MAX ' + bTotal + ' positions — breakout refused' });
            return;
          }
        } catch (bPosErr) {
          addBrainLog('WARN', 'Cannot check positions for breakout — REFUSING to trade blind');
          return;
        }
        var breakDir = breakoutAction.action === 'BREAKOUT_BUY' ? 'BUY' : 'SELL';
        addBrainLog('ANTENNA', breakoutAction.reason);
        var bResult = await cortexPlaceOrder(breakDir);
        cortexLastTradeTs = Date.now();
        if (bResult && bResult.ok) {
          cortexAddDecision({ time: timeStr, action: 'BREAKOUT ' + breakDir, detail: breakoutAction.reason + ' dealId=' + bResult.dealId });
          cortexOpenPosition = { direction: breakDir, entry: closePrice, candlesHeld: 0, dealId: bResult.dealId, size: tradeSize };
          cortexExitConsecutiveCount = 0;
          cortexConsecutiveCount = 0;
          cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'BREAKOUT ' + breakDir, buy: buy, sell: sell, price: closePrice, size: tradeSize, tf: tfLabel, dealId: bResult.dealId });
          renderCortexTradeLog();
          cortexSaveState();
        } else {
          cortexAddDecision({ time: timeStr, action: 'BREAKOUT FAILED', detail: breakoutAction.reason });
        }
        return;
      }
    }

    var rawSignal = 'HOLD';
    if (buy >= cortexBuyThreshold && buy > sell + cortexHoldZone) rawSignal = 'BUY';
    else if (sell >= cortexSellThreshold && sell > buy + cortexHoldZone) rawSignal = 'SELL';

    if (rawSignal !== 'HOLD' && rawSignal === cortexConsecutiveSignal) {
      cortexConsecutiveCount++;
    } else if (rawSignal !== 'HOLD') {
      cortexConsecutiveSignal = rawSignal;
      cortexConsecutiveCount = 1;
    } else {
      cortexConsecutiveCount = 0;
    }

    if (cortexOpenPosition) {
      cortexOpenPosition.candlesHeld = (cortexOpenPosition.candlesHeld || 0) + 1;
      var entryPrice = cortexOpenPosition.entry || 0;
      var pnlPips = cortexOpenPosition.direction === 'BUY' ? (closePrice - entryPrice) : (entryPrice - closePrice);

      if (cortexPriceExitsEnabled && entryPrice > 0) {
        if (pnlPips >= cortexTakeProfitPips) {
          addBrainLog('CORTEX', 'TAKE PROFIT hit: ' + pnlPips.toFixed(1) + ' pips >= ' + cortexTakeProfitPips + ' | ' + currentSig);
          var tpClosed = await cortexClosePosition(cortexOpenPosition);
          if (tpClosed === 'gone') { cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel); return; }
          cortexAddDecision({ time: timeStr, action: 'TP CLOSE', detail: cortexOpenPosition.direction + ' +' + pnlPips.toFixed(1) + ' pips (TP=' + cortexTakeProfitPips + ') @ ' + closePrice.toFixed(2) + (tpClosed ? ' OK' : ' FAILED — keeping position') });
          if (tpClosed) {
            cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'TP CLOSE ' + cortexOpenPosition.direction, buy: buy, sell: sell, price: closePrice, size: cortexOpenPosition.size || cortexPositionSize, tf: tfLabel, pnl: pnlPips });
            drAddEntry(cortexOpenPosition.direction, cortexOpenPosition.entry, closePrice, pnlPips, 'TP', 'Take Profit');
            renderCortexTradeLog();
            if (cortexAutoLearn) { brainFeedback('sugar'); addBrainLog('BRAIN', 'Auto-learn: SUGAR for profitable TP close (+' + pnlPips.toFixed(1) + ' pips)'); }
            cortexOpenPosition = null;
            cortexExitConsecutiveCount = 0;
          } else {
            addBrainLog('WARN', 'TP close FAILED — position still tracked, will retry');
          }
          cortexLastTradeTs = Date.now();
          cortexSaveState();
          return;
        }
        if (pnlPips <= -cortexStopLossPips) {
          addBrainLog('CORTEX', 'STOP LOSS hit: ' + pnlPips.toFixed(1) + ' pips <= -' + cortexStopLossPips + ' | ' + currentSig);
          var slClosed = await cortexClosePosition(cortexOpenPosition);
          if (slClosed === 'gone') { cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel); return; }
          cortexAddDecision({ time: timeStr, action: 'SL CLOSE', detail: cortexOpenPosition.direction + ' ' + pnlPips.toFixed(1) + ' pips (SL=' + cortexStopLossPips + ') @ ' + closePrice.toFixed(2) + (slClosed ? ' OK' : ' FAILED — keeping position') });
          if (slClosed) {
            cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'SL CLOSE ' + cortexOpenPosition.direction, buy: buy, sell: sell, price: closePrice, size: cortexOpenPosition.size || cortexPositionSize, tf: tfLabel, pnl: pnlPips });
            drAddEntry(cortexOpenPosition.direction, cortexOpenPosition.entry, closePrice, pnlPips, 'SL', 'Stop Loss');
            renderCortexTradeLog();
            if (cortexAutoLearn) { brainFeedback('pain'); addBrainLog('BRAIN', 'Auto-learn: PAIN for stop loss (' + pnlPips.toFixed(1) + ' pips)'); }
            cortexOpenPosition = null;
            cortexExitConsecutiveCount = 0;
          } else {
            addBrainLog('WARN', 'SL close FAILED — position still tracked, will retry');
          }
          cortexLastTradeTs = Date.now();
          cortexSaveState();
          return;
        }
      }

      var oppSignal = cortexOpenPosition.direction === 'BUY' ? 'SELL' : 'BUY';
      if (rawSignal === oppSignal) {
        cortexExitConsecutiveCount++;
      } else {
        cortexExitConsecutiveCount = 0;
      }
      var canExitBySignal = cortexOpenPosition.candlesHeld >= cortexMinHoldCandles && cortexExitConsecutiveCount >= cortexExitConfirmCandles;
      if (canExitBySignal) {
        addBrainLog('CORTEX', 'CLOSING ' + cortexOpenPosition.direction + ' (signal reversal after ' + cortexOpenPosition.candlesHeld + ' candles) | ' + currentSig);
        var closedOk = await cortexClosePosition(cortexOpenPosition);
        if (closedOk === 'gone') { cortexHandleExternalClose(timeStr, closePrice, buy, sell, tfLabel); return; }
        cortexAddDecision({ time: timeStr, action: 'CLOSED', detail: cortexOpenPosition.direction + ' after ' + cortexOpenPosition.candlesHeld + ' candles, exit=' + cortexExitConsecutiveCount + 'x ' + oppSignal + ' pnl=' + pnlPips.toFixed(1) + ' @ ' + closePrice.toFixed(2) + (closedOk ? ' OK' : ' FAILED — keeping position') });
        if (closedOk) {
          cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: 'CLOSE ' + cortexOpenPosition.direction, buy: buy, sell: sell, price: closePrice, size: cortexOpenPosition.size || cortexPositionSize, tf: tfLabel, pnl: pnlPips });
          drAddEntry(cortexOpenPosition.direction, cortexOpenPosition.entry, closePrice, pnlPips, oppSignal, 'Signal');
          renderCortexTradeLog();
          if (cortexAutoLearn) {
            if (pnlPips > 0) { brainFeedback('sugar'); addBrainLog('BRAIN', 'Auto-learn: SUGAR for profitable signal close (+' + pnlPips.toFixed(1) + ' pips)'); }
            else { brainFeedback('pain'); addBrainLog('BRAIN', 'Auto-learn: PAIN for losing signal close (' + pnlPips.toFixed(1) + ' pips)'); }
          }
          cortexOpenPosition = null;
          cortexExitConsecutiveCount = 0;
        } else {
          addBrainLog('WARN', 'Signal close FAILED — position still tracked, will retry');
        }
        cortexSaveState();
        return;
      } else {
        var holdReason = cortexOpenPosition.candlesHeld < cortexMinHoldCandles
          ? 'held ' + cortexOpenPosition.candlesHeld + '/' + cortexMinHoldCandles
          : 'exitConfirm ' + cortexExitConsecutiveCount + '/' + cortexExitConfirmCandles;
        var pnlLabel = entryPrice > 0 ? ' pnl=' + pnlPips.toFixed(1) : '';
        if (statusEl) { statusEl.textContent = 'HOLDING ' + cortexOpenPosition.direction + ' (' + holdReason + pnlLabel + ') | ' + currentSig; statusEl.style.color = '#d29922'; }
        cortexAddDecision({ time: timeStr, action: 'HOLDING', detail: cortexOpenPosition.direction + ' ' + holdReason + pnlLabel + ' | B=' + buy.toFixed(0) + ' S=' + sell.toFixed(0) + ' raw=' + rawSignal + ' @ ' + closePrice.toFixed(2) });
        cortexTickSave();
        return;
      }
    }

    var signalConfirmed = cortexConsecutiveCount >= cortexConfirmCandles;

    if (rawSignal !== 'HOLD' && signalConfirmed) {
      try {
        var posData = await apiFetch('/api/ig/positions');
        var allPositions = (posData && posData.positions) || [];
        var epicCount = allPositions.filter(function(p) { var e = (p.market && p.market.epic) || ''; return e === neuralCurrentEpic; }).length;
        var totalCount = allPositions.length;
        var HARD_MAX_TOTAL = 5;
        if (epicCount >= cortexMaxOpenPositions) {
          if (statusEl) { statusEl.textContent = 'Max positions for epic (' + epicCount + '/' + cortexMaxOpenPositions + ') | ' + currentSig; statusEl.style.color = '#d29922'; }
          cortexAddDecision({ time: timeStr, action: 'MAX_POS', detail: epicCount + '/' + cortexMaxOpenPositions + ' positions on ' + neuralCurrentEpic + ' | B=' + buy.toFixed(0) + ' S=' + sell.toFixed(0) });
          cortexConsecutiveCount = 0;
          return;
        }
        if (totalCount >= HARD_MAX_TOTAL) {
          if (statusEl) { statusEl.textContent = 'HARD MAX: ' + totalCount + ' total positions open | ' + currentSig; statusEl.style.color = '#f85149'; }
          cortexAddDecision({ time: timeStr, action: 'HARD_MAX', detail: totalCount + ' total positions (hard max ' + HARD_MAX_TOTAL + ') | B=' + buy.toFixed(0) + ' S=' + sell.toFixed(0) });
          addBrainLog('WARN', 'HARD MAX TOTAL reached: ' + totalCount + '/' + HARD_MAX_TOTAL + ' positions — refusing to open more');
          cortexConsecutiveCount = 0;
          return;
        }
      } catch (posErr) {
        addBrainLog('WARN', 'Cannot check positions before opening — REFUSING to trade blind');
        cortexAddDecision({ time: timeStr, action: 'POS_CHECK_FAIL', detail: 'Position check failed, refusing to open' });
        return;
      }
      var blockReason = antennaShouldBlockEntry(pressure, rawSignal);
      if (blockReason) {
        addBrainLog('ANTENNA', 'BLOCKED ' + rawSignal + ': ' + blockReason);
        if (statusEl) { statusEl.textContent = 'BLOCKED: ' + blockReason; statusEl.style.color = '#d29922'; }
        cortexAddDecision({ time: timeStr, action: 'BLOCKED', detail: rawSignal + ' blocked by antenna: ' + blockReason });
        cortexConsecutiveCount = 0;
        return;
      }
      var chAdvisory = channelGetAdvisory();
      var chNote = '';
      if (chAdvisory) {
        var chSignalDir = chAdvisory.advisory.indexOf('BUY') >= 0 ? 'BUY' : (chAdvisory.advisory.indexOf('SELL') >= 0 ? 'SELL' : 'HOLD');
        chNote = ' | CH:' + chAdvisory.pattern + '/' + chAdvisory.advisory + '(' + chAdvisory.confidence + '%)';
        if (chSignalDir !== 'HOLD' && chSignalDir !== rawSignal && chAdvisory.confidence >= 70) {
          addBrainLog('CHANNEL', 'VETOED ' + rawSignal + ': CH advisory ' + chAdvisory.advisory + ' (' + chAdvisory.confidence + '% conf) strongly conflicts');
          cortexAddDecision({ time: timeStr, action: 'CH_VETO', detail: rawSignal + ' vetoed by channel: ' + chAdvisory.pattern + '/' + chAdvisory.advisory + ' (' + chAdvisory.confidence + '%)' });
          if (statusEl) { statusEl.textContent = 'CH VETO: ' + chAdvisory.advisory + ' vs ' + rawSignal; statusEl.style.color = '#d29922'; }
          cortexConsecutiveCount = 0;
          return;
        } else if (chSignalDir !== 'HOLD' && chSignalDir !== rawSignal && chAdvisory.confidence >= 50) {
          addBrainLog('CHANNEL', 'Advisory CONFLICTS with signal: ' + rawSignal + ' vs CH:' + chAdvisory.advisory + ' (' + chAdvisory.confidence + '% conf) — proceeding with caution');
        }
      }
      addBrainLog('CORTEX', 'AUTO ' + rawSignal + ' [' + tfLabel + '] ' + closePrice.toFixed(2) + ' sz=' + sizeLabel + ' | Buy=' + buy.toFixed(1) + ' Sell=' + sell.toFixed(1) + ' confirmed=' + cortexConsecutiveCount + chNote);
      if (statusEl) { statusEl.textContent = 'EXECUTING ' + rawSignal + ' [' + tfLabel + '] sz=' + sizeLabel + ' | ' + currentSig; statusEl.style.color = rawSignal === 'BUY' ? '#2dc653' : '#f85149'; }
      var orderResult = await cortexPlaceOrder(rawSignal);
      cortexLastTradeTs = Date.now();
      if (orderResult && orderResult.ok) {
        cortexAddDecision({ time: timeStr, action: 'OPENED ' + rawSignal, detail: closePrice.toFixed(2) + ' sz=' + sizeLabel + ' confirmed=' + cortexConsecutiveCount + 'x | dealId=' + orderResult.dealId });
        cortexOpenPosition = { direction: rawSignal, entry: closePrice, candlesHeld: 0, dealId: orderResult.dealId, size: tradeSize };
        cortexExitConsecutiveCount = 0;
        cortexConsecutiveCount = 0;
        cortexTradeLog.push({ ts: Date.now(), epic: neuralCurrentEpic, dir: rawSignal, buy: buy, sell: sell, price: closePrice, size: tradeSize, tf: tfLabel, dealId: orderResult.dealId });
        renderCortexTradeLog();
        cortexSaveState();
      } else {
        cortexAddDecision({ time: timeStr, action: 'FAILED', detail: rawSignal + ' order failed @ ' + closePrice.toFixed(2) });
      }
    } else if (rawSignal !== 'HOLD' && !signalConfirmed) {
      if (statusEl) { statusEl.textContent = 'Confirming ' + rawSignal + ' (' + cortexConsecutiveCount + '/' + cortexConfirmCandles + ') | ' + currentSig; statusEl.style.color = '#58a6ff'; }
      cortexAddDecision({ time: timeStr, action: 'CONFIRMING', detail: rawSignal + ' ' + cortexConsecutiveCount + '/' + cortexConfirmCandles + ' | B=' + buy.toFixed(0) + ' S=' + sell.toFixed(0) + ' sprd=' + spread.toFixed(1) + ' @ ' + closePrice.toFixed(2) });
    } else {
      if (statusEl) { statusEl.textContent = 'Monitoring: ' + currentSig + ' | No signal'; statusEl.style.color = '#8b949e'; }
      cortexAddDecision({ time: timeStr, action: 'HOLD', detail: 'B=' + buy.toFixed(0) + ' S=' + sell.toFixed(0) + ' sprd=' + spread.toFixed(1) + ' need>' + cortexHoldZone + ' @ ' + closePrice.toFixed(2) });
    }
    cortexTickSave();
  } catch (e) {
    addBrainLog('ERROR', 'Auto-trade check failed: ' + e.message);
    cortexAddDecision({ time: timeStr, action: 'ERROR', detail: e.message });
  }
}

async function cortexAutoSelectTimeframe() {
  var timeframes = ['MINUTE', 'MINUTE_5', 'MINUTE_15', 'HOUR'];
  var bestTf = 'MINUTE_5';
  var bestSpread = 0;
  for (var i = 0; i < timeframes.length; i++) {
    var tf = timeframes[i];
    try {
      var data = await apiFetch('/api/ig/stream/candles?epic=' + encodeURIComponent(neuralCurrentEpic) + '&resolution=' + tf + '&max=5');
      var candles = (data && data.prices) || [];
      if (candles.length < 3) continue;
      var last = candles[candles.length - 1];
      var closeP = 0;
      if (last.closePrice) closeP = last.closePrice.mid || last.closePrice.bid || parseFloat(last.closePrice) || 0;
      else if (last.close) closeP = last.close.mid || last.close.bid || parseFloat(last.close) || 0;
      if (!closeP) continue;
      var prev2 = candles.length >= 2 ? (function(c) { return cortexExtractPrice(c, 'close') || closeP; })(candles[candles.length - 2]) : closeP;
      var result = await brainFetch('/stimulate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epic: neuralCurrentEpic, price: closeP, prevPrice: prev2, volume: 0, spread: Math.abs(closeP - prev2), pressure: antennaComputePressure() })
      });
      if (result) {
        var spread = Math.abs((result.buy_signal || 0) - (result.sell_signal || 0));
        if (spread > bestSpread) { bestSpread = spread; bestTf = tf; }
      }
    } catch (e) {}
  }
  cortexAutoTimeframeSelected = bestTf;
  var tfEl = document.getElementById('cortex-current-tf');
  if (tfEl) tfEl.textContent = 'Auto: ' + bestTf + ' (spread=' + bestSpread.toFixed(1) + ')';
  return bestTf;
}

async function cortexSaveState() {
  try {
    var saveData = {
      tradeLog: cortexTradeLog,
      openPosition: cortexOpenPosition,
      decisionLog: cortexDecisionLog.slice(-200),
      params: {
        buyThreshold: cortexBuyThreshold,
        sellThreshold: cortexSellThreshold,
        holdZone: cortexHoldZone,
        stopLossPips: cortexStopLossPips,
        takeProfitPips: cortexTakeProfitPips,
        cooldownMs: cortexCooldownMs,
        minPositionSize: cortexMinPositionSize,
        maxPositionSize: cortexMaxPositionSize,
        positionSize: cortexPositionSize,
        autoSize: cortexAutoSize,
        minHoldCandles: cortexMinHoldCandles,
        confirmCandles: cortexConfirmCandles,
        exitConfirmCandles: cortexExitConfirmCandles,
        priceExitsEnabled: cortexPriceExitsEnabled,
        autoLearn: cortexAutoLearn,
        maxOpenPositions: cortexMaxOpenPositions,
        antennaFlashThreshold: antenna.flashThreshold,
        antennaDeadCatSensitivity: antenna.deadCatSensitivity,
        antennaEmergencyExit: antenna.emergencyExitEnabled,
        antennaBreakoutRider: antenna.breakoutRiderEnabled,
        antennaFallingKnife: antenna.fallingKnifeBlock,
      },
      autoTradeState: {
        enabled: cortexAutoTradeEnabled,
        epic: neuralCurrentEpic,
        timeframe: cortexTimeframe,
      },
      calibAutoPass: calibAutoPassEnabled,
      calibAutoPassInterval: calibAutoPassInterval,
    };
    await brainFetch('/cortex-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData)
    });
  } catch (e) {
    addBrainLog('WARN', 'Failed to persist cortex state: ' + e.message);
  }
}

async function cortexLoadState() {
  try {
    var state = await brainFetch('/cortex-state');
    if (state && Array.isArray(state.tradeLog) && state.tradeLog.length > 0 && cortexTradeLog.length === 0) {
      cortexTradeLog = state.tradeLog;
      addBrainLog('CORTEX', 'Restored ' + cortexTradeLog.length + ' trades from persistent storage (saved ' + (state.savedAt || 'unknown') + ')');
      renderCortexTradeLog(true);
    }
    if (state && state.openPosition && !cortexOpenPosition) {
      var savedPos = state.openPosition;
      var verified = false;
      try {
        var posData = await apiFetch('/api/ig/positions');
        if (posData && posData.positions) {
          for (var i = 0; i < posData.positions.length; i++) {
            var p = posData.positions[i];
            var pDealId = (p.position && p.position.dealId) || p.dealId || '';
            if (pDealId === savedPos.dealId) {
              verified = true;
              var mkt = p.market || {};
              savedPos.currentPrice = mkt.bid || mkt.offer || savedPos.entry;
              break;
            }
          }
        }
      } catch (igErr) {
        addBrainLog('WARN', 'Could not verify position with IG (markets may be closed): ' + igErr.message + ' — keeping position as unverified, will re-verify when markets open');
        verified = true;
        savedPos._unverified = true;
      }
      if (verified) {
        cortexOpenPosition = savedPos;
        addBrainLog('CORTEX', 'Restored open position: ' + cortexOpenPosition.direction + ' @ ' + (cortexOpenPosition.entry || 0).toFixed(2) + ' dealId=' + (cortexOpenPosition.dealId || 'none') + ' [VERIFIED]');
      } else {
        addBrainLog('CORTEX', 'Saved position dealId=' + savedPos.dealId + ' no longer found on IG — clearing stale position');
        cortexOpenPosition = null;
        cortexSaveState();
      }
    }
    if (state && state.params) {
      var p = state.params;
      function setIfExists(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) { if (el.type === 'checkbox') el.checked = !!val; else el.value = val; } }
      if (p.buyThreshold !== undefined) { cortexBuyThreshold = p.buyThreshold; setIfExists('cortex-buy-thresh', p.buyThreshold); }
      if (p.sellThreshold !== undefined) { cortexSellThreshold = p.sellThreshold; setIfExists('cortex-sell-thresh', p.sellThreshold); }
      if (p.holdZone !== undefined) { cortexHoldZone = p.holdZone; setIfExists('cortex-hold-zone', p.holdZone); }
      if (p.stopLossPips !== undefined) { cortexStopLossPips = p.stopLossPips; setIfExists('cortex-sl', p.stopLossPips); }
      if (p.takeProfitPips !== undefined) { cortexTakeProfitPips = p.takeProfitPips; setIfExists('cortex-tp', p.takeProfitPips); }
      if (p.cooldownMs !== undefined) { cortexCooldownMs = p.cooldownMs; setIfExists('cortex-cooldown', p.cooldownMs / 1000); }
      if (p.minPositionSize !== undefined) { cortexMinPositionSize = p.minPositionSize; setIfExists('cortex-min-size', p.minPositionSize); }
      if (p.maxPositionSize !== undefined) { cortexMaxPositionSize = p.maxPositionSize; setIfExists('cortex-max-size', p.maxPositionSize); }
      if (p.autoSize !== undefined) { cortexAutoSize = p.autoSize; setIfExists('cortex-auto-size', p.autoSize); }
      if (p.minHoldCandles !== undefined) { cortexMinHoldCandles = p.minHoldCandles; setIfExists('cortex-min-hold', p.minHoldCandles); }
      if (p.confirmCandles !== undefined) { cortexConfirmCandles = p.confirmCandles; setIfExists('cortex-confirm', p.confirmCandles); }
      if (p.exitConfirmCandles !== undefined) { cortexExitConfirmCandles = p.exitConfirmCandles; setIfExists('cortex-exit-confirm', p.exitConfirmCandles); }
      if (p.priceExitsEnabled !== undefined) { cortexPriceExitsEnabled = p.priceExitsEnabled; setIfExists('cortex-price-exits', p.priceExitsEnabled); }
      if (p.autoLearn !== undefined) { cortexAutoLearn = p.autoLearn; setIfExists('cortex-auto-learn', p.autoLearn); }
      if (p.positionSize !== undefined) { cortexPositionSize = p.positionSize; setIfExists('cortex-pos-size', p.positionSize); }
      if (p.maxOpenPositions !== undefined) { cortexMaxOpenPositions = p.maxOpenPositions; setIfExists('cortex-max-pos', p.maxOpenPositions); }
      if (p.antennaFlashThreshold !== undefined) { antenna.flashThreshold = p.antennaFlashThreshold; setIfExists('antenna-flash-thresh', p.antennaFlashThreshold); }
      if (p.antennaDeadCatSensitivity !== undefined) { antenna.deadCatSensitivity = p.antennaDeadCatSensitivity; setIfExists('antenna-deadcat-sens', p.antennaDeadCatSensitivity); }
      if (p.antennaEmergencyExit !== undefined) { antenna.emergencyExitEnabled = p.antennaEmergencyExit; setIfExists('antenna-emergency', p.antennaEmergencyExit); }
      if (p.antennaBreakoutRider !== undefined) { antenna.breakoutRiderEnabled = p.antennaBreakoutRider; setIfExists('antenna-breakout', p.antennaBreakoutRider); }
      if (p.antennaFallingKnife !== undefined) { antenna.fallingKnifeBlock = p.antennaFallingKnife; setIfExists('antenna-knife', p.antennaFallingKnife); }
      addBrainLog('CORTEX', 'Restored params: buy=' + cortexBuyThreshold + ' sell=' + cortexSellThreshold + ' SL=' + cortexStopLossPips + ' TP=' + cortexTakeProfitPips + ' hold=' + cortexMinHoldCandles);
    }
    if (state && state.calibAutoPass !== undefined) {
      calibAutoPassEnabled = !!state.calibAutoPass;
      calibAutoPassInterval = state.calibAutoPassInterval || 30;
      var apCb = document.getElementById('calib-auto-pass');
      var apInt = document.getElementById('calib-auto-pass-interval');
      if (apCb) apCb.checked = calibAutoPassEnabled;
      if (apInt) apInt.value = calibAutoPassInterval;
      if (calibAutoPassEnabled) {
        startCalibAutoPassTimer();
        addBrainLog('CORTEX', 'Restored auto-pass: ON, every ' + calibAutoPassInterval + 'min');
      } else {
        stopCalibAutoPassTimer();
      }
      updateCalibAutoPassUI();
    }
    if (state && state.autoTradeState && !cortexAutoTradeEnabled) {
      var ats = state.autoTradeState;
      addBrainLog('CORTEX', 'Saved auto-trade state found for ' + (ats.epic || '--') + ' (was ' + (ats.enabled ? 'ENABLED' : 'DISABLED') + ')');
    }
    if (state && state.decisionLog && state.decisionLog.length > 0) {
      cortexDecisionLog = state.decisionLog;
      var monEl = document.getElementById('cortex-decision-monitor');
      if (monEl) {
        cortexDecisionLog.slice(-10).forEach(function(d) {
          cortexAddDecision(d, true);
        });
      }
      addBrainLog('CORTEX', 'Restored ' + cortexDecisionLog.length + ' decision log entries');
    }
  } catch (e) {
    addBrainLog('INFO', 'No persisted cortex state found (first run or brain not ready)');
  }
}

async function cortexClearHistory() {
  if (!confirm('Clear all cortex auto-trade history? This cannot be undone.')) return;
  clearTimeout(cortexSaveTimer);
  cortexTradeLog = [];
  cortexDecisionLog = [];
  cortexOpenPosition = null;
  var monEl = document.getElementById('cortex-decision-monitor');
  if (monEl) monEl.innerHTML = '';
  renderCortexTradeLog(true);
  try {
    await brainFetch('/cortex-state', { method: 'DELETE' });
    addBrainLog('CORTEX', 'Trade history cleared (memory + disk)');
    showToast('Trade history cleared', true);
  } catch (e) {
    addBrainLog('WARN', 'Cleared memory but failed to clear disk: ' + e.message);
    showToast('History cleared from memory', true);
  }
}

var cortexSaveTimer = null;
var cortexTickSaveTimer = null;
var cortexTickSaveInterval = 10000;
var cortexLastSaveFingerprint = '';

function cortexFingerprint() {
  var pos = cortexOpenPosition;
  return cortexBuyThreshold + '|' + cortexSellThreshold + '|' + cortexHoldZone + '|' +
    cortexStopLossPips + '|' + cortexTakeProfitPips + '|' + cortexCooldownMs + '|' +
    cortexMinPositionSize + '|' + cortexMaxPositionSize + '|' + cortexPositionSize + '|' +
    (cortexAutoSize ? 1 : 0) + '|' + cortexMinHoldCandles + '|' + cortexConfirmCandles + '|' +
    cortexExitConfirmCandles + '|' + (cortexPriceExitsEnabled ? 1 : 0) + '|' + (cortexAutoLearn ? 1 : 0) + '|' +
    cortexMaxOpenPositions + '|' + cortexDecisionLog.length + '|' + cortexTradeLog.length + '|' +
    (pos ? pos.dealId + ':' + (pos.candlesHeld || 0) : 'none') + '|' +
    (calibAutoPassEnabled ? 1 : 0) + '|' + calibAutoPassInterval + '|' +
    antenna.flashThreshold + '|' + antenna.deadCatSensitivity + '|' +
    (antenna.emergencyExitEnabled ? 1 : 0) + '|' + (antenna.breakoutRiderEnabled ? 1 : 0) + '|' +
    (antenna.fallingKnifeBlock ? 1 : 0);
}

function cortexTickSave() {
  if (cortexTickSaveTimer) return;
  cortexTickSaveTimer = setTimeout(function() {
    cortexTickSaveTimer = null;
    var fp = cortexFingerprint();
    if (fp === cortexLastSaveFingerprint) return;
    cortexLastSaveFingerprint = fp;
    cortexSaveState();
  }, cortexTickSaveInterval);
}

function renderCortexTradeLog(skipSave) {
  var logEl = document.getElementById('cortex-trade-log');
  if (!logEl) return;
  if (cortexTradeLog.length === 0) {
    logEl.innerHTML = '<div style="color:#484f58;text-align:center;padding:8px;font-size:11px">No auto-trades executed yet</div>';
    return;
  }
  var html = '';
  cortexTradeLog.slice(-20).reverse().forEach(function(t) {
    var color = (t.dir && t.dir.indexOf('BUY') >= 0) ? '#2dc653' : '#f85149';
    if (t.dir && (t.dir.indexOf('TP') >= 0 || t.dir.indexOf('CLOSE') >= 0)) color = '#bc8cff';
    if (t.dir && t.dir.indexOf('EMRG') >= 0) color = '#d29922';
    var time = new Date(t.ts).toLocaleTimeString();
    var pnlStr = t.pnl !== undefined && t.pnl !== null && t.pnl !== '' ? (t.pnl >= 0 ? '+' : '') + parseFloat(t.pnl).toFixed(1) + 'p' : '';
    var pnlColor = t.pnl >= 0 ? '#2dc653' : '#f85149';
    html += '<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid #161b22;font-size:10px">' +
      '<span style="color:#8b949e">' + time + '</span>' +
      '<span style="font-weight:700;color:' + color + '">' + t.dir + '</span>' +
      '<span style="color:#bc8cff">' + (t.tf || 'tick') + '</span>' +
      '<span style="color:#d29922">' + (t.price ? parseFloat(t.price).toFixed(2) : '--') + '</span>' +
      (pnlStr ? '<span style="color:' + pnlColor + ';font-weight:600">' + pnlStr + '</span>' : '<span style="color:#8b949e">B:' + (t.buy || 0).toFixed(1) + ' S:' + (t.sell || 0).toFixed(1) + '</span>') + '</div>';
  });
  logEl.innerHTML = html;
  if (!skipSave) {
    clearTimeout(cortexSaveTimer);
    cortexSaveTimer = setTimeout(function() { cortexSaveState(); }, 2000);
  }
}

var neuralTabInitialized = false;
function initNeuralTradingTab() {
  if (neuralTabInitialized) return;
  neuralTabInitialized = true;
  loadBrainjarConfig().then(function() {
    initNeuralCharts();
    loadAccountInfo();
    try {
      var saved = localStorage.getItem('neural_selected_instrument');
      if (saved && !neuralCurrentEpic) {
        var inst = JSON.parse(saved);
        if (inst && inst.epic) {
          neuralSelectInstrument(inst);
          addBrainLog('INFO', 'Restored instrument from previous session: ' + (inst.name || inst.epic));
        }
      }
    } catch(_) {}
    refreshStreamInstruments();
    brainBoot().then(function(r) {
      if (r) {
        addBrainLog('INFO', 'Brain auto-booted on tab init');
      }
      cortexLoadState();
    });
    checkBrainProcessStatus();
    if (brainStatusInterval) clearInterval(brainStatusInterval);
    brainStatusInterval = setInterval(function() {
      checkBrainProcessStatus();
      refreshStreamInstruments();
    }, 10000);
    var si = document.getElementById('neural-instrument-search');
    if (si && !si._neuralBound) {
      si._neuralBound = true;
      var st;
      si.addEventListener('input', function(e) {
        clearTimeout(st);
        var term = e.target.value.trim();
        var dd = document.getElementById('neural-instrument-results');
        if (term.length < 2) { if (dd) dd.style.display = 'none'; return; }
        if (dd) { dd.style.display = 'block'; dd.innerHTML = '<div style="padding:8px;color:#8b949e;font-size:12px">Searching...</div>'; }
        st = setTimeout(function() {
          neuralSearchInstruments(term).then(function(instruments) {
            if (!instruments || instruments.length === 0) {
              if (dd) dd.innerHTML = '<div style="padding:8px;color:#8b949e;font-size:12px">No results</div>';
              return;
            }
            if (dd) dd.innerHTML = '';
            instruments.slice(0, 10).forEach(function(inst) {
              var item = document.createElement('div');
              item.style.cssText = 'padding:6px 8px;cursor:pointer;border-bottom:1px solid #30363d;font-size:12px;color:#c9d1d9';
              item.innerHTML = '<span style="font-weight:600">' + escHtml(inst.name) + '</span> <span style="color:#8b949e;font-size:10px">' + escHtml(inst.epic) + '</span>';
              item.onmouseenter = function() { this.style.background = 'rgba(88,166,255,0.08)'; };
              item.onmouseleave = function() { this.style.background = ''; };
              item.onclick = function() { neuralSelectInstrument(inst); };
              dd.appendChild(item);
            });
          });
        }, 300);
      });
    }
    document.addEventListener('click', function(e) {
      var dd = document.getElementById('neural-instrument-results');
      var si2 = document.getElementById('neural-instrument-search');
      if (dd && si2 && !si2.contains(e.target) && !dd.contains(e.target)) dd.style.display = 'none';
    });
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && neuralCurrentEpic && (liveTrainRunning || cortexAutoTradeEnabled)) {
        if (!neuralTickPollInterval) {
          addBrainLog('INFO', 'Tab visible again — resuming tick polling');
          startNeuralTickPolling();
        }
      }
    });
  });
}

function updateBtSourceInfo() {
  var src = ((document.getElementById('bt-train-source') || {}).value) || 'ig';
  var infoEl = document.getElementById('bt-source-info');
  if (src === 'localdb') {
    var epic = neuralCurrentEpic;
    var tf = ((document.getElementById('bt-train-tf') || {}).value) || 'MINUTE';
    if (!epic) { if (infoEl) infoEl.textContent = 'Select instrument first'; return; }
    if (infoEl) infoEl.textContent = 'Checking...';
    apiFetch('/api/ig/scalper/candle-count?epic=' + encodeURIComponent(epic) + '&resolution=' + tf).then(function(d) {
      if (infoEl) infoEl.textContent = (d && d.count ? d.count + ' candles stored' : 'No data in DB');
      if (infoEl) infoEl.style.color = (d && d.count > 0) ? '#2dc653' : '#f85149';
    }).catch(function() { if (infoEl) infoEl.textContent = 'DB unavailable'; });
  } else {
    if (infoEl) { infoEl.textContent = ''; infoEl.style.color = '#484f58'; }
  }
}

function updateBtCortexDisplay() {
  cortexReadParams();
  var els = {
    'bt-cortex-sl': cortexStopLossPips,
    'bt-cortex-tp': cortexTakeProfitPips,
    'bt-cortex-hold': cortexMinHoldCandles,
    'bt-cortex-thresh': cortexBuyThreshold,
    'bt-cortex-confirm': cortexConfirmCandles,
    'bt-cortex-size': cortexMinPositionSize,
  };
  for (var id in els) {
    var el = document.getElementById(id);
    if (el) el.textContent = els[id];
  }
}

var channelTickWindow = [];
var channelWindowMs = 5 * 60 * 1000;
var channelShortTerm = { high: 0, low: 0, mid: 0 };
var channelLongTerm = { high: 0, low: 0, mid: 0, tf: '' };
var channelCortexEnabled = true;
var channelLastPattern = '--';
var channelLastAdvisory = '--';
var channelLastPosition = '--';
var channelLastConfidence = 0;

function channelAddTick(price) {
  if (!price || price <= 0) return;
  var now = Date.now();
  channelTickWindow.push({ ts: now, price: price });
  var cutoff = now - channelWindowMs;
  while (channelTickWindow.length > 0 && channelTickWindow[0].ts < cutoff) channelTickWindow.shift();
  channelUpdateShortTerm();
}

function channelUpdateShortTerm() {
  if (channelTickWindow.length < 2) return;
  var high = -Infinity, low = Infinity;
  for (var i = 0; i < channelTickWindow.length; i++) {
    var p = channelTickWindow[i].price;
    if (p > high) high = p;
    if (p < low) low = p;
  }
  channelShortTerm = { high: high, low: low, mid: (high + low) / 2 };
  var price = channelTickWindow[channelTickWindow.length - 1].price;
  channelDetectPattern(price);
  channelUpdateUI();
}

function channelDetectPattern(price) {
  if (!channelShortTerm.high || !channelShortTerm.low) return;
  var range = channelShortTerm.high - channelShortTerm.low;
  if (range <= 0) return;
  var pos = (price - channelShortTerm.low) / range;
  var ticks = channelTickWindow;
  var len = ticks.length;

  if (pos > 0.85) channelLastPosition = 'Near Ceiling';
  else if (pos < 0.15) channelLastPosition = 'Near Floor';
  else if (pos > 0.45 && pos < 0.55) channelLastPosition = 'Mid Channel';
  else if (pos > 0.55) channelLastPosition = 'Upper Half';
  else channelLastPosition = 'Lower Half';

  var recentLen = Math.min(20, len);
  var recentTicks = ticks.slice(-recentLen);
  var rising = 0, falling = 0;
  for (var i = 1; i < recentTicks.length; i++) {
    if (recentTicks[i].price > recentTicks[i - 1].price) rising++;
    else if (recentTicks[i].price < recentTicks[i - 1].price) falling++;
  }

  var ltRange = channelLongTerm.high - channelLongTerm.low;
  var narrowing = ltRange > 0 && range < ltRange * 0.3;
  var expanding = ltRange > 0 && range > ltRange * 0.8;

  if (narrowing && pos > 0.5 && rising > falling) {
    channelLastPattern = 'Bull Flag';
    channelLastAdvisory = 'BUY Breakout';
    channelLastConfidence = Math.min(90, 50 + (rising - falling) * 5);
  } else if (narrowing && pos < 0.5 && falling > rising) {
    channelLastPattern = 'Bear Flag';
    channelLastAdvisory = 'SELL Breakdown';
    channelLastConfidence = Math.min(90, 50 + (falling - rising) * 5);
  } else if (expanding && pos > 0.8) {
    channelLastPattern = 'Breakout Up';
    channelLastAdvisory = 'BUY Momentum';
    channelLastConfidence = Math.min(85, 40 + rising * 3);
  } else if (expanding && pos < 0.2) {
    channelLastPattern = 'Breakout Down';
    channelLastAdvisory = 'SELL Momentum';
    channelLastConfidence = Math.min(85, 40 + falling * 3);
  } else if (pos < 0.15 && rising > falling) {
    channelLastPattern = 'Bear Trap';
    channelLastAdvisory = 'BUY Reversal';
    channelLastConfidence = Math.min(70, 30 + (rising - falling) * 5);
  } else if (pos > 0.85 && falling > rising) {
    channelLastPattern = 'Bull Trap';
    channelLastAdvisory = 'SELL Reversal';
    channelLastConfidence = Math.min(70, 30 + (falling - rising) * 5);
  } else if (narrowing) {
    channelLastPattern = 'Consolidation';
    channelLastAdvisory = 'HOLD';
    channelLastConfidence = Math.min(60, 30 + Math.abs(rising - falling) * 2);
  } else {
    channelLastPattern = 'Ranging';
    channelLastAdvisory = pos > 0.7 ? 'Caution High' : (pos < 0.3 ? 'Caution Low' : 'HOLD');
    channelLastConfidence = 20;
  }
}

function channelUpdateUI() {
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
  set('ch-st-high', channelShortTerm.high ? channelShortTerm.high.toFixed(2) : '--');
  set('ch-st-mid', channelShortTerm.mid ? channelShortTerm.mid.toFixed(2) : '--');
  set('ch-st-low', channelShortTerm.low ? channelShortTerm.low.toFixed(2) : '--');
  set('ch-st-width', channelShortTerm.high ? (channelShortTerm.high - channelShortTerm.low).toFixed(2) : '--');
  set('ch-st-ticks', channelTickWindow.length);
  set('ch-lt-high', channelLongTerm.high ? channelLongTerm.high.toFixed(2) : '--');
  set('ch-lt-mid', channelLongTerm.mid ? channelLongTerm.mid.toFixed(2) : '--');
  set('ch-lt-low', channelLongTerm.low ? channelLongTerm.low.toFixed(2) : '--');
  set('ch-lt-width', channelLongTerm.high ? (channelLongTerm.high - channelLongTerm.low).toFixed(2) : '--');
  set('ch-lt-tf', channelLongTerm.tf || '--');
  set('ch-pattern', channelLastPattern);
  set('ch-position', channelLastPosition);
  set('ch-advisory', channelLastAdvisory);
  set('ch-confidence', channelLastConfidence + '%');
  var advEl = document.getElementById('ch-advisory');
  if (advEl) {
    if (channelLastAdvisory.indexOf('BUY') >= 0) advEl.style.color = '#2dc653';
    else if (channelLastAdvisory.indexOf('SELL') >= 0) advEl.style.color = '#f85149';
    else advEl.style.color = '#d29922';
  }
  set('ch-last-update', new Date().toLocaleTimeString());
}

function channelRefreshLongTerm() {
  var epic = neuralCurrentEpic;
  if (!epic) { showToast('Select instrument first', false); return; }
  var tf = 'HOUR';
  apiFetch('/api/ig/scalper/candles?epic=' + encodeURIComponent(epic) + '&resolution=' + tf + '&max=100').then(function(d) {
    var candles = (d && d.prices) || [];
    if (candles.length < 2) {
      apiFetch('/api/ig/prices/' + encodeURIComponent(epic) + '?resolution=' + tf + '&max=100').then(function(d2) {
        var c2 = (d2 && d2.prices) || [];
        if (c2.length > 1) channelSetLongTerm(c2, tf);
        else addBrainLog('WARN', 'No LT channel data available');
      }).catch(function() {});
      return;
    }
    channelSetLongTerm(candles, tf);
  }).catch(function() {
    addBrainLog('WARN', 'LT channel fetch failed, trying IG API...');
    apiFetch('/api/ig/prices/' + encodeURIComponent(epic) + '?resolution=' + tf + '&max=100').then(function(d2) {
      var c2 = (d2 && d2.prices) || [];
      if (c2.length > 1) channelSetLongTerm(c2, tf);
    }).catch(function() {});
  });
}

function channelSetLongTerm(candles, tf) {
  var high = -Infinity, low = Infinity;
  for (var i = 0; i < candles.length; i++) {
    var h = candles[i].high != null ? candles[i].high : candles[i].highPrice;
    var l = candles[i].low != null ? candles[i].low : candles[i].lowPrice;
    if (h != null && h > high) high = h;
    if (l != null && l < low) low = l;
  }
  channelLongTerm = { high: high, low: low, mid: (high + low) / 2, tf: tf };
  channelUpdateUI();
  addBrainLog('INFO', 'LT channel: ' + low.toFixed(2) + ' - ' + high.toFixed(2) + ' (' + candles.length + ' candles, ' + tf + ')');
}

function channelGetAdvisory() {
  if (!channelCortexEnabled) return null;
  if (channelLastConfidence < 30) return null;
  return { pattern: channelLastPattern, advisory: channelLastAdvisory, position: channelLastPosition, confidence: channelLastConfidence };
}

var drEntries = [];
var drAutoReview = false;
var drNextId = 1;

function drAddEntry(direction, entry, exit, pnl, signal, reason) {
  var id = drNextId++;
  var item = { id: id, time: new Date(), direction: direction, entry: entry, exit: exit, pnl: pnl, signal: signal, reason: reason || '', status: 'pending' };
  drEntries.unshift(item);
  if (drEntries.length > 100) drEntries.pop();
  if (drAutoReview) {
    item.status = pnl >= 0 ? 'approved' : 'rejected';
    sendTrainingFeedback(pnl >= 0 ? 'sugar' : 'pain');
  }
  drRenderEntries();
  return item;
}

function drRenderEntries() {
  var rowsEl = document.getElementById('dr-rows');
  var emptyEl = document.getElementById('dr-empty');
  if (!rowsEl) return;
  if (drEntries.length === 0) { rowsEl.innerHTML = ''; if (emptyEl) emptyEl.style.display = 'block'; return; }
  if (emptyEl) emptyEl.style.display = 'none';
  var html = '';
  for (var i = 0; i < Math.min(drEntries.length, 50); i++) {
    var e = drEntries[i];
    var timeStr = e.time.toLocaleTimeString().substring(0, 8);
    var pnlColor = e.pnl >= 0 ? '#2dc653' : '#f85149';
    var dirColor = e.direction === 'BUY' ? '#2dc653' : '#f85149';
    var statusHtml;
    if (e.status === 'pending') {
      statusHtml = '<button onclick="drApprove(' + e.id + ')" style="background:#1b4332;color:#2dc653;border:1px solid #2dc653;border-radius:3px;padding:1px 6px;font-size:9px;cursor:pointer;margin-right:2px">✓</button>' +
                   '<button onclick="drReject(' + e.id + ')" style="background:#3d1a1a;color:#f85149;border:1px solid #f85149;border-radius:3px;padding:1px 6px;font-size:9px;cursor:pointer">✗</button>';
    } else if (e.status === 'approved') {
      statusHtml = '<span style="color:#2dc653;font-size:10px">Approved</span>';
    } else {
      statusHtml = '<span style="color:#f85149;font-size:10px">Rejected</span>';
    }
    html += '<div style="display:grid;grid-template-columns:60px 50px 80px 80px 60px 60px 1fr;gap:4px;padding:3px 0;border-bottom:1px solid #161b22;font-size:10px">' +
      '<span>' + timeStr + '</span>' +
      '<span style="color:' + dirColor + '">' + e.direction + '</span>' +
      '<span>' + (e.entry ? e.entry.toFixed(2) : '--') + '</span>' +
      '<span>' + (e.exit ? e.exit.toFixed(2) : '--') + '</span>' +
      '<span style="color:' + pnlColor + '">' + (e.pnl !== null ? e.pnl.toFixed(2) : '--') + '</span>' +
      '<span>' + (e.signal || '--') + '</span>' +
      '<span>' + statusHtml + '</span>' +
      '</div>';
  }
  rowsEl.innerHTML = html;
}

function drApprove(id) {
  for (var i = 0; i < drEntries.length; i++) {
    if (drEntries[i].id === id) { drEntries[i].status = 'approved'; sendTrainingFeedback('sugar'); break; }
  }
  drRenderEntries();
}

function drReject(id) {
  for (var i = 0; i < drEntries.length; i++) {
    if (drEntries[i].id === id) { drEntries[i].status = 'rejected'; sendTrainingFeedback('pain'); break; }
  }
  drRenderEntries();
}

function drBatchApprove() {
  var count = 0;
  for (var i = 0; i < drEntries.length; i++) {
    if (drEntries[i].status === 'pending') { drEntries[i].status = 'approved'; count++; }
  }
  if (count > 0) { sendTrainingFeedback('sugar'); addBrainLog('INFO', 'Batch approved ' + count + ' decisions'); }
  drRenderEntries();
}

function drBatchReject() {
  var count = 0;
  for (var i = 0; i < drEntries.length; i++) {
    if (drEntries[i].status === 'pending') { drEntries[i].status = 'rejected'; count++; }
  }
  if (count > 0) { sendTrainingFeedback('pain'); addBrainLog('INFO', 'Batch rejected ' + count + ' decisions'); }
  drRenderEntries();
}

function drClearAll() {
  drEntries = [];
  drRenderEntries();
}

function toggleAutoReview(enabled) {
  drAutoReview = enabled;
  var statusEl = document.getElementById('dr-auto-status');
  if (statusEl) statusEl.textContent = enabled ? 'Auto: sugar if P&L≥0, pain if <0' : '';
  addBrainLog('INFO', 'Auto-review ' + (enabled ? 'enabled' : 'disabled'));
}

function switchNeuralSubTab(tab) {
  document.querySelectorAll('.neural-sub-tab').forEach(function(b) {
    b.classList.remove('active');
    b.style.color = '#8b949e';
    b.style.borderBottom = '2px solid transparent';
  });
  document.querySelectorAll('.neural-sub-content').forEach(function(c) {
    c.classList.remove('active');
    c.style.display = 'none';
  });
  var btn = document.querySelector('.neural-sub-tab[data-ntab="' + tab + '"]');
  if (btn) { btn.classList.add('active'); btn.style.color = '#bc8cff'; btn.style.borderBottom = '2px solid #bc8cff'; }
  var content = document.getElementById('neural-' + tab);
  if (content) { content.classList.add('active'); content.style.display = 'block'; }
  startNeuralTickPolling();
  if (tab === 'dashboard') { initNeuralCharts(); loadAccountInfo(); }
  else if (tab === 'brain') { refreshCortex(); checkBrainProcessStatus(); updateBtCortexDisplay(); channelRefreshLongTerm(); var ae = document.getElementById('cortex-active-epic'); if (ae) ae.textContent = neuralCurrentEpic ? neuralCurrentEpic.replace(/^CS\.D\./,'').replace(/\.CFA\.IP$/,'').replace(/\.CFD\.IP$/,'').replace(/\.CFM\.IP$/,'').replace(/\.CAF\.IP$/,'') : '--'; }
  else if (tab === 'config') { checkBrainProcessStatus(); loadArchitecture(); }
  else if (tab === 'console') { /* dev console auto-scrolls */ }
}
