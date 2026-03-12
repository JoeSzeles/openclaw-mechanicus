function showBacktestModal(stratId) {
  var strat = findStrategyById(stratId);
  if (!strat) { showToast('Strategy not found', false); return; }
  var tf = strat.timeframe || 'MINUTE';
  var html = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center" id="btModal" onclick="if(event.target===this)this.remove()">';
  html += '<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;min-width:300px;max-width:400px">';
  html += '<h3 style="font-size:13px;color:#c9d1d9;margin:0 0 12px 0">Backtest: ' + (strat.name || strat.instrument) + '</h3>';
  html += '<div style="font-size:11px;margin-bottom:8px"><label style="color:#8b949e">Timeframe</label><select id="btTF" class="edit-input" style="width:100%">';
  var tfs = ['TICK','SECOND','SECOND_2','SECOND_5','SECOND_10','SECOND_20','SECOND_30','SECOND_40','MINUTE','MINUTE_5','MINUTE_15','HOUR','HOUR_4','DAY'];
  var tfLabels = ['Tick','1s','2s','5s','10s','20s','30s','40s','1 Minute','5 Minutes','15 Minutes','1 Hour','4 Hours','1 Day'];
  for (var i = 0; i < tfs.length; i++) {
    html += '<option value="' + tfs[i] + '"' + (tfs[i] === tf ? ' selected' : '') + '>' + tfLabels[i] + '</option>';
  }
  html += '</select></div>';
  html += '<div style="font-size:11px;margin-bottom:12px"><label style="color:#8b949e">Candle Count</label><select id="btCount" class="edit-input" style="width:100%">';
  var counts = [250, 500, 1000, 2500, 5000, 10000, 100000, 1000000];
  var countLabels = ['250', '500', '1K', '2.5K', '5K', '10K', '100K', '1M'];
  for (var j = 0; j < counts.length; j++) {
    html += '<option value="' + counts[j] + '"' + (counts[j] === 500 ? ' selected' : '') + '>' + countLabels[j] + '</option>';
  }
  html += '</select></div>';
  html += '<div style="display:flex;gap:8px"><button class="btn-sm btn-save" style="flex:1;background:#6e40c9;border-color:#6e40c9" onclick="runBacktestFromModal(' + stratId + ')">Run Backtest</button>';
  html += '<button class="btn-sm" style="flex:1" onclick="loadBacktestHistory(' + stratId + ')">History</button>';
  html += '<button class="btn-sm btn-cancel" onclick="document.getElementById(\'btModal\').remove()">Cancel</button></div>';
  html += '<div id="btProgress" style="display:none;margin-top:8px;text-align:center;color:#8b949e;font-size:11px">Running backtest...</div>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

async function runBacktestFromModal(stratId) {
  var tf = document.getElementById('btTF').value;
  var count = parseInt(document.getElementById('btCount').value, 10);
  var prog = document.getElementById('btProgress');
  prog.style.display = 'block';
  var fetchNote = count > 2000 ? ' (fetching in batches, may take ' + Math.ceil(count/2000) * 2 + 's)' : '';
  prog.textContent = 'Running backtest (' + count + ' ' + tf + ' candles)...' + fetchNote;
  try {
    var result = await apiPost('/api/ig/scalper/strategies/' + stratId + '/backtest', { timeframe: tf, candleCount: count });
    var modal = document.getElementById('btModal');
    if (modal) modal.remove();
    if (!result || !result.ok) {
      var errMsg = (result && result.error ? result.error : 'unknown error');
      if (errMsg.indexOf('strategy type') !== -1 || errMsg.indexOf('not found') !== -1 || errMsg.indexOf('Unknown strategy') !== -1 || errMsg.indexOf('STRATEGY_TYPE') !== -1) {
        showToast('Strategy load error: ' + errMsg + '. Re-compile the strategy in ClawScript Editor.', false);
        prog.textContent = 'Strategy Error: ' + errMsg;
      } else {
        showToast('Backtest failed: ' + errMsg, false);
      }
      return;
    }
    lastBacktestResult = result;
    displayBacktestResults(result);
    var strat = findStrategyById(stratId);
    if (strat && strat.instrument) {
      await navigateToInstrument(strat.instrument, strat.name || strat.instrument);
      currentMaxPoints = count;
      var chartTf = tf === 'TICK' ? 'SECOND' : tf;
      currentTimeframe = chartTf;
      backtestEpic = strat.instrument;
      backtestMarkers = buildBacktestMarkers(result.trades || []);
      await loadChart(strat.instrument, chartTf, true);
    }
    showToast('Backtest complete: ' + result.summary.totalTrades + ' trades, P&L: ' + (result.summary.totalPnl >= 0 ? '+' : '') + result.summary.totalPnl.toFixed(2), true);
  } catch (e) {
    showToast('Backtest error: ' + e.message, false);
    prog.textContent = 'Error: ' + e.message;
  }
}

function buildBacktestMarkers(trades) {
  var markers = [];
  for (var i = 0; i < trades.length; i++) {
    var t = trades[i];
    markers.push({
      time: t.entryTime,
      position: t.direction === 'BUY' ? 'belowBar' : 'aboveBar',
      color: '#a371f7',
      shape: 'square',
      text: 'BT ' + t.direction + ' @' + fmtNum(t.entryPrice, 1)
    });
    if (t.reason !== 'OPEN') {
      markers.push({
        time: t.exitTime,
        position: t.direction === 'BUY' ? 'aboveBar' : 'belowBar',
        color: t.pnl >= 0 ? '#a371f7' : '#f0883e',
        shape: 'circle',
        text: t.reason + ' ' + (t.pnl >= 0 ? '+' : '') + fmtNum(t.pnl, 2)
      });
    }
  }
  markers.sort(function(a, b) { return a.time - b.time; });
  return markers;
}

function displayBacktestResults(result) {
  var panel = document.getElementById('backtestResults');
  panel.style.display = '';
  var s = result.summary;
  var pnlCls = s.totalPnl >= 0 ? 'pos' : 'neg';
  var summaryHtml = '';
  summaryHtml += '<div style="background:#0d1117;padding:6px;border-radius:4px;text-align:center"><div style="font-size:14px;font-weight:600" class="' + pnlCls + '">' + (s.totalPnl >= 0 ? '+' : '') + fmtNum(s.totalPnl) + '</div><div style="color:#8b949e;font-size:9px">Total P&L</div></div>';
  summaryHtml += '<div style="background:#0d1117;padding:6px;border-radius:4px;text-align:center"><div style="font-size:14px;font-weight:600">' + s.totalTrades + '</div><div style="color:#8b949e;font-size:9px">Trades (' + s.winCount + 'W/' + s.lossCount + 'L)</div></div>';
  summaryHtml += '<div style="background:#0d1117;padding:6px;border-radius:4px;text-align:center"><div style="font-size:14px;font-weight:600">' + s.winRate + '%</div><div style="color:#8b949e;font-size:9px">Win Rate</div></div>';
  summaryHtml += '<div style="background:#0d1117;padding:6px;border-radius:4px;text-align:center"><div style="font-size:14px;font-weight:600;color:#f85149">' + fmtNum(s.maxDrawdown) + '</div><div style="color:#8b949e;font-size:9px">Max DD</div></div>';
  summaryHtml += '<div style="background:#0d1117;padding:6px;border-radius:4px;text-align:center"><div style="font-size:14px;font-weight:600">' + s.sharpeRatio + '</div><div style="color:#8b949e;font-size:9px">Sharpe</div></div>';
  document.getElementById('backtestSummary').innerHTML = summaryHtml;

  var equityCurve = result.equityCurve || [];
  if (equityCurve.length > 0) {
    renderBacktestEquityCurve(equityCurve);
  }

  var trades = result.trades || [];
  var stratType = s.strategyType || 'scalper';
  var thtml = '<tr><th>Time</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Reason</th><th>Strategy</th></tr>';
  for (var i = 0; i < trades.length; i++) {
    var t = trades[i];
    var ts = new Date(t.entryTime * 1000).toLocaleString('en-GB', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    thtml += '<tr>';
    thtml += '<td style="font-size:10px">' + ts + '</td>';
    thtml += '<td><span class="badge ' + (t.direction === 'BUY' ? 'badge-on' : 'badge-alert') + '">' + t.direction + '</span></td>';
    thtml += '<td>' + fmtNum(t.entryPrice, 2) + '</td>';
    thtml += '<td>' + fmtNum(t.exitPrice, 2) + '</td>';
    thtml += '<td class="' + (t.pnl >= 0 ? 'pos' : 'neg') + '">' + (t.pnl >= 0 ? '+' : '') + fmtNum(t.pnl, 2) + '</td>';
    thtml += '<td><span class="badge badge-snap">' + t.reason + '</span></td>';
    thtml += '<td><span class="badge badge-snap" style="font-size:9px;padding:1px 5px">' + stratType + '</span></td>';
    thtml += '</tr>';
  }
  document.getElementById('backtestTradeList').innerHTML = thtml;

  var btnRow = document.getElementById('backtestActionButtons');
  if (!btnRow) {
    var container = document.getElementById('backtestResults');
    var div = document.createElement('div');
    div.id = 'backtestActionButtons';
    div.style.cssText = 'margin-top:8px;display:flex;gap:6px';
    container.appendChild(div);
  }
  btnRow = document.getElementById('backtestActionButtons');
  btnRow.innerHTML =
    '<button class="btn-sm" style="background:#238636;border-color:#238636;color:#fff;font-size:10px" onclick="useBacktestSettings()">Use Settings</button>' +
    '<button class="btn-sm" style="font-size:10px" onclick="downloadBacktestSettings()">Download Settings</button>';
}

function renderBacktestEquityCurve(equityCurve) {
  var container = document.getElementById('backtestEquityChart');
  if (!container) {
    var parent = document.getElementById('backtestResults');
    var div = document.createElement('div');
    div.id = 'backtestEquityChart';
    div.style.cssText = 'margin-top:8px;height:150px;background:#0d1117;border:1px solid #21262d;border-radius:4px;padding:8px';
    var summaryEl = document.getElementById('backtestSummary');
    summaryEl.parentNode.insertBefore(div, summaryEl.nextSibling);
    container = div;
  }

  var maxPnl = 0, minPnl = 0;
  for (var i = 0; i < equityCurve.length; i++) {
    if (equityCurve[i].cumPnl > maxPnl) maxPnl = equityCurve[i].cumPnl;
    if (equityCurve[i].cumPnl < minPnl) minPnl = equityCurve[i].cumPnl;
  }
  var range = maxPnl - minPnl || 1;
  var w = container.clientWidth - 16;
  var h = 130;

  var svg = '<svg width="' + w + '" height="' + h + '" style="display:block">';
  svg += '<line x1="0" y1="' + Math.round(h * (maxPnl / range)) + '" x2="' + w + '" y2="' + Math.round(h * (maxPnl / range)) + '" stroke="#30363d" stroke-dasharray="4"/>';

  if (equityCurve.length > 1) {
    var points = [];
    for (var j = 0; j < equityCurve.length; j++) {
      var x = Math.round((j / (equityCurve.length - 1)) * w);
      var y = Math.round(h - ((equityCurve[j].cumPnl - minPnl) / range) * h);
      points.push(x + ',' + y);
    }
    var lastPnl = equityCurve[equityCurve.length - 1].cumPnl;
    var lineColor = lastPnl >= 0 ? '#2dc653' : '#f85149';
    svg += '<polyline points="' + points.join(' ') + '" fill="none" stroke="' + lineColor + '" stroke-width="1.5"/>';
  }

  svg += '<text x="4" y="12" fill="#8b949e" font-size="9">Equity Curve (cumulative P&L)</text>';
  svg += '<text x="4" y="' + (h - 4) + '" fill="#8b949e" font-size="9">' + fmtNum(minPnl) + '</text>';
  svg += '<text x="' + (w - 4) + '" y="12" fill="#8b949e" font-size="9" text-anchor="end">' + fmtNum(maxPnl) + '</text>';
  svg += '</svg>';
  container.innerHTML = svg;
}

function useBacktestSettings() {
  if (!lastBacktestResult || !lastBacktestResult.summary) {
    showToast('No backtest result to use', false);
    return;
  }
  var config = lastBacktestResult.summary.configSnapshot || lastBacktestResult.configSnapshot;
  if (!config) {
    showToast('No config snapshot in backtest result', false);
    return;
  }
  if (editingScalperStrategy) {
    var fieldMap = {
      size: 'seditStratSize', stopDistance: 'seditStratStop', limitDistance: 'seditStratLimit',
      minMomentumPct: 'seditStratMom', cooldownMs: 'seditCooldown', tickWindow: 'seditTicks',
      profitTarget: 'seditProfitTarget', trailingStop: 'seditTrailingStop',
      direction: 'seditStratDir'
    };
    for (var key in fieldMap) {
      if (config[key] != null) {
        var el = document.getElementById(fieldMap[key]);
        if (el) el.value = config[key];
      }
    }
    if (config.rsiEnabled != null) { var cb = document.getElementById('seditRsiOn'); if (cb) cb.checked = config.rsiEnabled; }
    if (config.emaEnabled != null) { var cb2 = document.getElementById('seditEmaOn'); if (cb2) cb2.checked = config.emaEnabled; }
    if (config.macdEnabled != null) { var cb3 = document.getElementById('seditMacdOn'); if (cb3) cb3.checked = config.macdEnabled; }
    showToast('Backtest settings applied to editor', true);
  } else {
    showToast('Open a strategy editor first, then use settings', false);
  }
}

function downloadBacktestSettings() {
  if (!lastBacktestResult || !lastBacktestResult.summary) {
    showToast('No backtest result to download', false);
    return;
  }
  var config = lastBacktestResult.summary.configSnapshot || lastBacktestResult.configSnapshot || lastBacktestResult.summary;
  var blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'backtest-settings-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function toggleBacktestDetails() {
  var el = document.getElementById('backtestDetails');
  var icon = document.getElementById('btToggleIcon');
  if (el.style.display === 'none') {
    el.style.display = '';
    icon.innerHTML = '&#9650;';
  } else {
    el.style.display = 'none';
    icon.innerHTML = '&#9660;';
  }
}

async function loadBacktestHistory(stratId) {
  var modal = document.getElementById('btModal');
  if (modal) modal.remove();
  var data = await apiFetch('/api/ig/scalper/strategies/' + stratId + '/backtests');
  if (!data || !data.backtests || data.backtests.length === 0) {
    showToast('No backtest history for this strategy', false);
    return;
  }
  var html = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center" id="btModal" onclick="if(event.target===this)this.remove()">';
  html += '<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;min-width:500px;max-width:600px;max-height:80vh;overflow-y:auto">';
  html += '<h3 style="font-size:13px;color:#c9d1d9;margin:0 0 12px 0">Backtest History</h3>';
  html += '<table style="font-size:11px"><tr><th>Date</th><th>TF</th><th>Candles</th><th>Trades</th><th>Win%</th><th>P&L</th><th>Max DD</th><th>Sharpe</th><th></th></tr>';
  for (var i = 0; i < data.backtests.length; i++) {
    var b = data.backtests[i];
    var date = new Date(b.createdAt).toLocaleString('en-GB', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    html += '<tr>';
    html += '<td style="font-size:10px">' + date + '</td>';
    html += '<td>' + (b.timeframe || '-') + '</td>';
    html += '<td>' + b.candleCount + '</td>';
    html += '<td>' + b.totalTrades + ' (' + b.winCount + 'W/' + b.lossCount + 'L)</td>';
    html += '<td>' + b.winRate + '%</td>';
    html += '<td class="' + (b.totalPnl >= 0 ? 'pos' : 'neg') + '">' + (b.totalPnl >= 0 ? '+' : '') + fmtNum(b.totalPnl) + '</td>';
    html += '<td style="color:#f85149">' + fmtNum(b.maxDrawdown) + '</td>';
    html += '<td>' + b.sharpeRatio + '</td>';
    html += '<td><button class="btn-sm" onclick="loadBacktestDetail(' + b.id + ')">View</button></td>';
    html += '</tr>';
  }
  html += '</table>';
  html += '<div style="margin-top:8px;display:flex;gap:6px">';
  html += '<button class="btn-sm btn-danger" onclick="clearBacktestHistory(' + stratId + ')">Clear All</button>';
  html += '<button class="btn-sm btn-cancel" onclick="document.getElementById(\'btModal\').remove()">Close</button>';
  html += '</div>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

async function clearBacktestHistory(stratId) {
  if (!confirm('Delete all backtests for this strategy?')) return;
  var r = await apiDelete('/api/ig/scalper/strategies/' + stratId + '/backtests');
  if (r && r.ok) {
    showToast('Backtests cleared', true);
    var modal = document.getElementById('btModal');
    if (modal) modal.remove();
  } else {
    showToast('Failed to clear backtests', false);
  }
}

async function loadBacktestDetail(btId) {
  var modal = document.getElementById('btModal');
  if (modal) modal.remove();
  var data = await apiFetch('/api/ig/scalper/backtests/' + btId);
  if (!data) { showToast('Failed to load backtest', false); return; }
  lastBacktestResult = { summary: data, trades: data.trades || [], equityCurve: data.equityCurve || [] };
  displayBacktestResults(lastBacktestResult);
  if (data.configSnapshot && data.configSnapshot.instrument) {
    backtestEpic = data.configSnapshot.instrument;
    backtestMarkers = buildBacktestMarkers(data.trades || []);
    if (currentCandleData && currentCandleData.length > 0) {
      applyBacktestMarkers(currentCandleData);
    }
  }
  showToast('Loaded backtest #' + btId, true);
}
