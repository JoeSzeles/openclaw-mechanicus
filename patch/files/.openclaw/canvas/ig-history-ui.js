var historyGroupByInstrument = false;

function toggleHistoryGrouping() {
  historyGroupByInstrument = !historyGroupByInstrument;
  renderTradeHistory();
}

function renderTradeHistory() {
  var trades = cachedTrades || [];
  if (trades.length === 0) {
    document.getElementById('scalperTradeLog').innerHTML = '<tr><th>Time</th><th>Type</th><th>Instrument</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Strategy</th></tr><tr><td colspan="8" class="empty">No trades yet</td></tr>';
    return;
  }

  if (historyGroupByInstrument) {
    renderGroupedHistory(trades);
  } else {
    renderFlatHistory(trades);
  }
}

function renderFlatHistory(trades) {
  var thtml = '<tr><th>Time</th><th>Type</th><th>Instrument</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Strategy</th></tr>';
  for (var j = 0; j < trades.length; j++) {
    thtml += buildTradeRow(trades[j]);
  }
  document.getElementById('scalperTradeLog').innerHTML = thtml;
}

function renderGroupedHistory(trades) {
  var groups = {};
  for (var i = 0; i < trades.length; i++) {
    var epic = trades[i].epic || 'Unknown';
    if (!groups[epic]) groups[epic] = [];
    groups[epic].push(trades[i]);
  }

  var epics = Object.keys(groups).sort();
  var thtml = '<tr><th>Time</th><th>Type</th><th>Instrument</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Strategy</th></tr>';

  for (var e = 0; e < epics.length; e++) {
    var epicName = epicShortName(epics[e]);
    var epicTrades = groups[epics[e]];
    var epicPnl = 0;
    for (var k = 0; k < epicTrades.length; k++) {
      epicPnl += (epicTrades[k].pnl || 0);
    }
    var epicMaxDD = calcMaxDrawdown(epicTrades);
    var pnlCls = epicPnl >= 0 ? 'pos' : 'neg';
    thtml += '<tr style="background:#161b22;cursor:pointer" onclick="toggleHistoryGroup(\'' + epics[e].replace(/'/g, "\\'") + '\')">';
    thtml += '<td colspan="5" style="font-weight:600;font-size:12px">' + epicName + ' (' + epicTrades.length + ' trades)</td>';
    thtml += '<td style="font-size:10px;color:#f0883e" title="Max Drawdown">MDD: ' + fmtNum(epicMaxDD) + '</td>';
    thtml += '<td class="' + pnlCls + '" style="font-weight:600">' + (epicPnl >= 0 ? '+' : '') + fmtNum(epicPnl) + ' <button class="btn-sm" style="font-size:9px;margin-left:4px" onclick="event.stopPropagation();showEquityCurvePopup(\'' + epics[e].replace(/'/g, "\\'") + '\')">Equity</button></td>';
    thtml += '<td></td>';
    thtml += '</tr>';

    for (var m = 0; m < epicTrades.length; m++) {
      thtml += '<tr class="history-group-' + epics[e].replace(/[^a-zA-Z0-9]/g, '_') + '" style="display:none">' + buildTradeRowCells(epicTrades[m]) + '</tr>';
    }
  }

  var totalMaxDD = calcMaxDrawdown(trades);
  thtml += '<tr style="background:#0d1117"><td colspan="5" style="font-weight:600;text-align:right">Combined:</td>';
  thtml += '<td style="font-size:10px;color:#f0883e" title="Max Drawdown">MDD: ' + fmtNum(totalMaxDD) + '</td>';
  var totalPnl = 0;
  for (var n = 0; n < trades.length; n++) totalPnl += (trades[n].pnl || 0);
  thtml += '<td class="' + (totalPnl >= 0 ? 'pos' : 'neg') + '" style="font-weight:600">' + (totalPnl >= 0 ? '+' : '') + fmtNum(totalPnl) + ' <button class="btn-sm" style="font-size:9px;margin-left:4px" onclick="showCombinedEquityCurve()">Combined Equity</button></td>';
  thtml += '<td></td></tr>';

  document.getElementById('scalperTradeLog').innerHTML = thtml;
}

function toggleHistoryGroup(epic) {
  var cls = 'history-group-' + epic.replace(/[^a-zA-Z0-9]/g, '_');
  var rows = document.querySelectorAll('.' + cls);
  for (var i = 0; i < rows.length; i++) {
    rows[i].style.display = rows[i].style.display === 'none' ? '' : 'none';
  }
}

function buildTradeRow(t) {
  return '<tr>' + buildTradeRowCells(t) + '</tr>';
}

function buildTradeRowCells(t) {
  var tradeTime = t.closedAt || t.openedAt || t.createdAt || t.timestamp;
  var timeStr = '-';
  if (tradeTime) {
    var td = new Date(tradeTime);
    var today = new Date();
    try {
      var tdDay = td.toLocaleDateString('en-GB', { timeZone: configTimezone, year:'numeric', month:'2-digit', day:'2-digit' });
      var todayDay = today.toLocaleDateString('en-GB', { timeZone: configTimezone, year:'numeric', month:'2-digit', day:'2-digit' });
      var isToday = tdDay === todayDay;
    } catch(_) { var isToday = td.getFullYear() === today.getFullYear() && td.getMonth() === today.getMonth() && td.getDate() === today.getDate(); }
    if (isToday) {
      timeStr = fmtTzTimeShort(td);
    } else {
      timeStr = fmtTzDateShort(td);
    }
  }
  var tradeType = (t.type || '').toUpperCase();
  var entryVal = t.entryPrice != null ? t.entryPrice : t.entry;
  var exitVal = t.exitPrice != null ? t.exitPrice : t.exit;
  var cells = '';
  cells += '<td style="font-size:10px">' + timeStr + '</td>';
  cells += '<td><span class="badge ' + (tradeType === 'OPEN' ? 'badge-spike' : 'badge-snap') + '">' + tradeType + '</span></td>';
  cells += '<td>' + epicShortName(t.epic) + '</td>';
  cells += '<td><span class="badge ' + (t.direction === 'BUY' ? 'badge-on' : 'badge-alert') + '">' + (t.direction || '-') + '</span></td>';
  cells += '<td>' + fmtNum(entryVal, 2) + '</td>';
  cells += '<td>' + (exitVal != null ? fmtNum(exitVal, 2) : '-') + '</td>';
  cells += '<td class="' + (t.pnl != null ? (t.pnl >= 0 ? 'pos' : 'neg') : '') + '">' + (t.pnl != null ? (t.pnl >= 0 ? '+' : '') + fmtNum(t.pnl) : '-') + '</td>';
  var stratName = t.strategyName || t.strategyId || t.strategy || '-';
  cells += '<td style="font-size:10px;color:#8b949e">' + stratName + '</td>';
  return cells;
}

function calcMaxDrawdown(trades) {
  var sorted = trades.slice().sort(function(a, b) {
    var ta = a.closedAt || a.openedAt || a.timestamp || '';
    var tb = b.closedAt || b.openedAt || b.timestamp || '';
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });
  var cumPnl = 0;
  var peak = 0;
  var maxDD = 0;
  for (var i = 0; i < sorted.length; i++) {
    cumPnl += (sorted[i].pnl || 0);
    if (cumPnl > peak) peak = cumPnl;
    var dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }
  return Math.round(maxDD * 100) / 100;
}

function showEquityCurvePopup(epic) {
  var trades = (cachedTrades || []).filter(function(t) { return t.epic === epic; });
  if (trades.length === 0) { showToast('No trades for this instrument', false); return; }
  var equityData = buildEquityFromTrades(trades);
  showEquityModal(epicShortName(epic) + ' Equity Curve', equityData);
}

function showCombinedEquityCurve() {
  var trades = cachedTrades || [];
  if (trades.length === 0) { showToast('No trades to chart', false); return; }
  var equityData = buildEquityFromTrades(trades);
  showEquityModal('Combined Equity Curve', equityData);
}

function buildEquityFromTrades(trades) {
  var sorted = trades.slice().sort(function(a, b) {
    var ta = a.closedAt || a.openedAt || a.timestamp || '';
    var tb = b.closedAt || b.openedAt || b.timestamp || '';
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });
  var cumPnl = 0;
  var points = [];
  for (var i = 0; i < sorted.length; i++) {
    cumPnl += (sorted[i].pnl || 0);
    points.push({
      time: sorted[i].closedAt || sorted[i].openedAt || sorted[i].timestamp,
      cumPnl: Math.round(cumPnl * 100) / 100
    });
  }
  return points;
}

function showEquityModal(title, equityData) {
  var existing = document.getElementById('equityCurveModal');
  if (existing) existing.remove();

  var html = '<div id="equityCurveModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center" onclick="if(event.target===this)this.remove()">';
  html += '<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;min-width:500px;max-width:700px">';
  html += '<h3 style="font-size:13px;color:#c9d1d9;margin:0 0 12px 0">' + title + '</h3>';
  html += '<div id="equityChartArea" style="height:250px;background:#0d1117;border:1px solid #21262d;border-radius:4px;padding:8px"></div>';
  html += '<div style="margin-top:8px"><button class="btn-sm btn-cancel" onclick="document.getElementById(\'equityCurveModal\').remove()">Close</button></div>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);

  setTimeout(function() {
    renderEquitySVG('equityChartArea', equityData);
  }, 50);
}

function renderEquitySVG(containerId, equityData) {
  var container = document.getElementById(containerId);
  if (!container || equityData.length === 0) return;

  var maxPnl = 0, minPnl = 0;
  for (var i = 0; i < equityData.length; i++) {
    if (equityData[i].cumPnl > maxPnl) maxPnl = equityData[i].cumPnl;
    if (equityData[i].cumPnl < minPnl) minPnl = equityData[i].cumPnl;
  }
  var range = maxPnl - minPnl || 1;
  var pad = range * 0.1;
  maxPnl += pad;
  minPnl -= pad;
  range = maxPnl - minPnl;

  var w = container.clientWidth - 16;
  var h = 230;

  var svg = '<svg width="' + w + '" height="' + h + '" style="display:block">';
  var zeroY = Math.round(h - ((0 - minPnl) / range) * h);
  svg += '<line x1="0" y1="' + zeroY + '" x2="' + w + '" y2="' + zeroY + '" stroke="#30363d" stroke-dasharray="4"/>';

  if (equityData.length > 1) {
    var points = [];
    for (var j = 0; j < equityData.length; j++) {
      var x = Math.round((j / (equityData.length - 1)) * w);
      var y = Math.round(h - ((equityData[j].cumPnl - minPnl) / range) * h);
      points.push(x + ',' + y);
    }
    var lastPnl = equityData[equityData.length - 1].cumPnl;
    var lineColor = lastPnl >= 0 ? '#2dc653' : '#f85149';
    svg += '<polyline points="' + points.join(' ') + '" fill="none" stroke="' + lineColor + '" stroke-width="2"/>';

    for (var k = 0; k < equityData.length; k++) {
      var cx = Math.round((k / (equityData.length - 1)) * w);
      var cy = Math.round(h - ((equityData[k].cumPnl - minPnl) / range) * h);
      var dotColor = equityData[k].cumPnl >= 0 ? '#2dc653' : '#f85149';
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="2" fill="' + dotColor + '"/>';
    }
  }

  svg += '<text x="4" y="12" fill="#8b949e" font-size="10">+' + fmtNum(maxPnl) + '</text>';
  svg += '<text x="4" y="' + (h - 4) + '" fill="#8b949e" font-size="10">' + fmtNum(minPnl) + '</text>';
  svg += '<text x="' + (w / 2) + '" y="' + (h - 4) + '" fill="#8b949e" font-size="9" text-anchor="middle">' + equityData.length + ' trades</text>';
  svg += '</svg>';
  container.innerHTML = svg;
}
