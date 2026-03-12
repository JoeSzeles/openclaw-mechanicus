async function loadProofread() {
  var config = await apiFetch('/api/ig/proofread');
  var el = document.getElementById('proofread');
  var controlsEl = document.getElementById('proofreadControls');

  if (!config || config._httpError) {
    controlsEl.innerHTML = '';
    el.innerHTML = '<p class="empty">Could not load proof reader config</p>';
    return;
  }

  var masterClass = config.enabled ? 'btn-master on' : 'btn-master off';
  var masterText = config.enabled ? 'Proof Reader: ON' : 'Proof Reader: OFF';
  controlsEl.innerHTML = '<button class="' + masterClass + '" onclick="toggleProofread(' + !config.enabled + ')">' + masterText + '</button>';

  if (editingProofread) {
    el.innerHTML = '<table>' +
      '<tr><th>Setting</th><th>Value</th><th>Description</th></tr>' +
      '<tr><td>Max Staleness</td><td><input class="edit-input" id="prMaxStale" type="number" value="' + config.maxStalenessSeconds + '"> sec</td><td>Max age of price data before rejecting</td></tr>' +
      '<tr><td>Spread Limit (High)</td><td><input class="edit-input" id="prSpreadHigh" type="number" step="0.1" value="' + config.spreadLimitPctHigh + '"> %</td><td>Max spread % for instruments with mid &gt; threshold</td></tr>' +
      '<tr><td>Spread Limit (Low)</td><td><input class="edit-input" id="prSpreadLow" type="number" step="0.1" value="' + config.spreadLimitPctLow + '"> %</td><td>Max spread % for instruments with mid &lt; threshold</td></tr>' +
      '<tr><td>Spread Threshold Mid</td><td><input class="edit-input" id="prSpreadThresh" type="number" value="' + config.spreadThresholdMid + '"></td><td>Mid price cutoff for high/low spread limit</td></tr>' +
      '<tr><td>Min Risk:Reward</td><td>1:<input class="edit-input" style="width:50px" id="prMinRR" type="number" step="0.1" value="' + config.minRiskReward + '"></td><td>Minimum risk:reward ratio</td></tr>' +
      '<tr><td>Max Risk %</td><td><input class="edit-input" id="prMaxRisk" type="number" step="0.1" value="' + config.maxRiskPct + '"> %</td><td>Max % of balance at risk per trade</td></tr>' +
      '<tr><td>Max Entry Deviation</td><td><input class="edit-input" id="prMaxDev" type="number" step="0.5" value="' + config.maxEntryDeviationPct + '"> %</td><td>Max % entry can differ from live mid price</td></tr>' +
      '<tr><td>Allow Duplicates</td><td><select class="edit-input" style="width:60px" id="prDupes"><option value="false"' + (!config.allowDuplicatePositions ? ' selected' : '') + '>No</option><option value="true"' + (config.allowDuplicatePositions ? ' selected' : '') + '>Yes</option></select></td><td>Allow same-direction position on same instrument</td></tr>' +
      '<tr><td>Require Stop Loss</td><td><select class="edit-input" style="width:60px" id="prReqSL"><option value="true"' + (config.requireStopLoss ? ' selected' : '') + '>Yes</option><option value="false"' + (!config.requireStopLoss ? ' selected' : '') + '>No</option></select></td><td>Block trades without stop-loss</td></tr>' +
      '<tr><td>Require Take Profit</td><td><select class="edit-input" style="width:60px" id="prReqTP"><option value="true"' + (config.requireTakeProfit ? ' selected' : '') + '>Yes</option><option value="false"' + (!config.requireTakeProfit ? ' selected' : '') + '>No</option></select></td><td>Block trades without take-profit</td></tr>' +
      '</table>' +
      '<div style="margin-top:10px"><button class="btn-sm btn-save" onclick="saveProofread()">Save</button> <button class="btn-sm btn-cancel" onclick="cancelEditProofread()">Cancel</button></div>';
  } else {
    el.innerHTML = '<table>' +
      '<tr><th>Setting</th><th>Value</th><th>Description</th></tr>' +
      '<tr><td>Max Staleness</td><td>' + config.maxStalenessSeconds + 's</td><td>Max age of price data before rejecting</td></tr>' +
      '<tr><td>Spread Limit (High)</td><td>' + config.spreadLimitPctHigh + '%</td><td>For mid &gt; ' + config.spreadThresholdMid + '</td></tr>' +
      '<tr><td>Spread Limit (Low)</td><td>' + config.spreadLimitPctLow + '%</td><td>For mid &lt; ' + config.spreadThresholdMid + '</td></tr>' +
      '<tr><td>Min Risk:Reward</td><td>1:' + config.minRiskReward + '</td><td>Minimum risk:reward ratio</td></tr>' +
      '<tr><td>Max Risk %</td><td>' + config.maxRiskPct + '%</td><td>Max % of balance at risk per trade</td></tr>' +
      '<tr><td>Max Entry Deviation</td><td>' + config.maxEntryDeviationPct + '%</td><td>Max % entry can differ from live mid</td></tr>' +
      '<tr><td>Allow Duplicates</td><td>' + (config.allowDuplicatePositions ? 'Yes' : 'No') + '</td><td>Same-direction on same instrument</td></tr>' +
      '<tr><td>Require Stop Loss</td><td>' + (config.requireStopLoss ? 'Yes' : 'No') + '</td><td></td></tr>' +
      '<tr><td>Require Take Profit</td><td>' + (config.requireTakeProfit ? 'Yes' : 'No') + '</td><td></td></tr>' +
      '</table>' +
      '<div style="margin-top:10px"><button class="btn-sm btn-edit" onclick="editProofread()">Edit Settings</button></div>';
  }
}

function editProofread() { editingProofread = true; loadProofread(); }
function cancelEditProofread() { editingProofread = false; loadProofread(); }

async function toggleProofread(enable) {
  var result = await apiPut('/api/ig/proofread', { enabled: enable });
  if (result && result.ok) {
    showToast('Proof reader ' + (enable ? 'enabled' : 'disabled'), true);
    loadProofread();
  } else {
    showToast(result && result.error ? result.error : 'Failed to toggle proof reader', false);
  }
}

async function saveProofread() {
  var body = {};
  var v;
  v = document.getElementById('prMaxStale'); if (v) body.maxStalenessSeconds = parseFloat(v.value);
  v = document.getElementById('prSpreadHigh'); if (v) body.spreadLimitPctHigh = parseFloat(v.value);
  v = document.getElementById('prSpreadLow'); if (v) body.spreadLimitPctLow = parseFloat(v.value);
  v = document.getElementById('prSpreadThresh'); if (v) body.spreadThresholdMid = parseFloat(v.value);
  v = document.getElementById('prMinRR'); if (v) body.minRiskReward = parseFloat(v.value);
  v = document.getElementById('prMaxRisk'); if (v) body.maxRiskPct = parseFloat(v.value);
  v = document.getElementById('prMaxDev'); if (v) body.maxEntryDeviationPct = parseFloat(v.value);
  v = document.getElementById('prDupes'); if (v) body.allowDuplicatePositions = v.value === 'true';
  v = document.getElementById('prReqSL'); if (v) body.requireStopLoss = v.value === 'true';
  v = document.getElementById('prReqTP'); if (v) body.requireTakeProfit = v.value === 'true';

  var result = await apiPut('/api/ig/proofread', body);
  if (result && result.ok) {
    showToast('Proof reader settings saved', true);
    editingProofread = false;
    loadProofread();
  } else {
    showToast(result && result.error ? result.error : 'Failed to save settings', false);
  }
}

async function loadAlerts() {
  var alerts = await fetchJSON('/__openclaw__/canvas/ig-alerts-snapshot.json');
  var el = document.getElementById('alerts');
  if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
    el.innerHTML = '<p class="empty">No alerts recorded</p>';
    return;
  }
  var recent = alerts.slice(-25).reverse();
  var html = '<table><tr><th>Time</th><th>Instrument</th><th>Type</th><th>Message</th><th>Mid</th></tr>';
  for (var i = 0; i < recent.length; i++) {
    var a = recent[i];
    var time = a.timestamp ? new Date(a.timestamp).toLocaleString() : '?';
    var typeBadge = '<span class="badge ' + badgeType(a.type) + '">' + (a.type || '?') + '</span>';
    html += '<tr><td style="white-space:nowrap;font-size:12px">' + time + '</td><td>' + (a.name || a.epic) + '</td><td>' + typeBadge + '</td><td style="font-size:12px">' + (a.message || '') + '</td><td>' + (a.mid != null ? a.mid.toFixed(5) : '-') + '</td></tr>';
  }
  html += '</table>';
  el.innerHTML = html;
}

async function loadRejectionsLog() {
  var rejections = await fetchJSON('/__openclaw__/canvas/ig-rejections.json');
  var el = document.getElementById('rejectionsLog');
  if (!el) return;
  if (!rejections || !Array.isArray(rejections) || rejections.length === 0) {
    el.innerHTML = '<p class="empty">No trade rejections recorded</p>';
    return;
  }
  var recent = rejections.slice(-30).reverse();
  var html = '<table><tr><th>Time</th><th>Source</th><th>Strategy</th><th>Instrument</th><th>Dir</th><th>Size</th><th>Reason</th><th>Error Code</th></tr>';
  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var time = r.timestamp ? new Date(r.timestamp).toLocaleString() : '?';
    var source = r.source || '?';
    if (r.engine) source += ' (' + r.engine + ')';
    var reasonText = r.reason || '?';
    if (reasonText.length > 80) reasonText = reasonText.substring(0, 77) + '...';
    var codeClass = r.igErrorCode === 'NETWORK_ERROR' || r.igErrorCode === 'NO_RESPONSE' ? 'badge-alert' : (r.igErrorCode === 'DEMO_REJECT' ? 'badge-off' : 'badge-alert');
    html += '<tr>';
    html += '<td style="white-space:nowrap;font-size:11px">' + time + '</td>';
    html += '<td style="font-size:11px;color:#8b949e">' + source + '</td>';
    html += '<td style="font-weight:600">' + (r.strategyName || '?') + '</td>';
    html += '<td>' + (r.instrument || '?') + '</td>';
    html += '<td>' + (r.direction || '?') + '</td>';
    html += '<td>' + (r.size || '?') + '</td>';
    html += '<td style="font-size:11px;color:#f85149;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + (r.reason || '').replace(/"/g, '&quot;') + '">' + reasonText + '</td>';
    html += '<td><span class="badge ' + codeClass + '" style="font-size:9px;padding:1px 5px">' + (r.igErrorCode || '?') + '</span></td>';
    html += '</tr>';
  }
  html += '</table>';
  el.innerHTML = html;
}

async function loadBotLog() {
  var log = await fetchJSON('/__openclaw__/canvas/ig-bot-log-snapshot.json');
  var el = document.getElementById('botLog');
  if (!log || !Array.isArray(log) || log.length === 0) {
    el.innerHTML = '<p class="empty">No bot activity logged</p>';
    return;
  }
  var recent = log.slice(-30).reverse();
  var html = '<table><tr><th>Time</th><th>Level</th><th>Message</th></tr>';
  for (var i = 0; i < recent.length; i++) {
    var e = recent[i];
    var time = e.timestamp ? new Date(e.timestamp).toLocaleString() : '?';
    var levelAttr = e.level === 'ERROR' ? ' class="error"' : (e.level === 'TRADE' ? ' style="color:#2dc653;font-weight:600"' : '');
    html += '<tr><td style="white-space:nowrap;font-size:12px">' + time + '</td><td' + levelAttr + '>' + e.level + '</td><td style="font-size:12px">' + e.message + '</td></tr>';
  }
  html += '</table>';
  el.innerHTML = html;
}

async function loadVerifyLog() {
  var log = await fetchJSON('/__openclaw__/canvas/ig-verify-log.json');
  var el = document.getElementById('verifyLog');
  if (!log || !Array.isArray(log) || log.length === 0) {
    el.innerHTML = '<p class="empty">No trade verifications recorded</p>';
    return;
  }
  var recent = log.slice(-20).reverse();
  var html = '<table><tr><th>Time</th><th>Instrument</th><th>Direction</th><th>Size</th><th>Spread</th><th>Verdict</th><th>Details</th></tr>';
  for (var i = 0; i < recent.length; i++) {
    var v = recent[i];
    var time = v.timestamp ? new Date(v.timestamp).toLocaleString() : '?';
    var verdictClass = v.verdict === 'APPROVED' ? 'badge-on' : 'badge-alert';
    var verdictBadge = '<span class="badge ' + verdictClass + '">' + v.verdict + '</span>';
    var failedChecks = '';
    if (v.checks) {
      var failed = v.checks.filter(function(c) { return !c.pass; });
      failedChecks = failed.length > 0 ? failed.map(function(c) { return c.check; }).join(', ') : 'All passed';
    }
    html += '<tr><td style="white-space:nowrap;font-size:12px">' + time + '</td>';
    html += '<td>' + (v.name || v.instrument || '?') + '</td>';
    html += '<td>' + (v.direction || '?') + '</td>';
    html += '<td>' + (v.size || '?') + '</td>';
    html += '<td>' + (v.spread != null ? v.spread.toFixed(5) : '-') + '</td>';
    html += '<td>' + verdictBadge + '</td>';
    html += '<td style="font-size:11px;color:#8b949e">' + failedChecks + '</td></tr>';
  }
  html += '</table>';
  el.innerHTML = html;
}

async function loadSessionStatus() {
  var data = await apiFetch('/api/ig/session');
  var el = document.getElementById('sessionBadge');
  if (!data) {
    el.innerHTML = '<span class="badge badge-alert">CONNECTION LOST</span>';
    showConnectionWarning(true);
    return;
  }
  var profile = (data.profile || 'unknown').toUpperCase();
  var profileTag = profile === 'DEMO' ? ' (DEMO)' : profile === 'LIVE' ? ' (LIVE)' : ' (' + profile + ')';

  if (data.status === 'connected') {
    el.innerHTML = '<span class="badge badge-on">SESSION CONNECTED' + profileTag + '</span>';
  } else if (data.status === 'connecting') {
    el.innerHTML = '<span class="badge badge-spike">CONNECTING...' + profileTag + '</span>';
  } else if (data.status === 'error') {
    el.innerHTML = '<span class="badge badge-alert">SESSION ERROR' + profileTag + '</span>';
  } else if (data.status === 'not_configured') {
    el.innerHTML = '<span class="badge badge-off">NOT CONFIGURED</span>';
  } else {
    el.innerHTML = '<span class="badge badge-off">DISCONNECTED</span>';
  }

  var badgeClass = profile === 'LIVE' ? 'badge badge-alert' : 'badge badge-on';
  var badgeIds = ['positionsBadge', 'strategiesBadge', 'proofBadge', 'processesBadge'];
  for (var bi = 0; bi < badgeIds.length; bi++) {
    var badge = document.getElementById(badgeIds[bi]);
    if (badge) {
      badge.textContent = profile;
      badge.className = badgeClass;
    }
  }
}

var streamPanelOpen = true;
function toggleStreamPanel() {
  streamPanelOpen = !streamPanelOpen;
  document.getElementById('streamPanel').style.display = streamPanelOpen ? '' : 'none';
  document.getElementById('streamToggleIcon').innerHTML = streamPanelOpen ? '&#9660;' : '&#9654;';
}

function fmtDuration(ms) {
  if (ms == null) return '--';
  var s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  var m = Math.floor(s / 60); s = s % 60;
  if (m < 60) return m + 'm ' + s + 's';
  var h = Math.floor(m / 60); m = m % 60;
  return h + 'h ' + m + 'm';
}

function fmtAge(ms) {
  if (ms == null) return '--';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  return Math.floor(ms / 60000) + 'm';
}

var knownEpicNames = {};
function epicShortName(epic) {
  if (knownEpicNames[epic]) return knownEpicNames[epic];
  for (var i = 0; i < watchedInstruments.length; i++) {
    if (watchedInstruments[i].epic === epic) { knownEpicNames[epic] = watchedInstruments[i].name; return watchedInstruments[i].name; }
  }
  return epic.replace(/^CS\.D\.|^IX\.D\.|^CC\.D\./, '').replace(/\.CFD\.IP|\.CFA\.IP|\.TODAY\.IP|\.UME\.IP|\.CFDGC\.IP/g, '');
}

async function loadStreamingStatus() {
  var section = document.getElementById('streamingSection');
  var data = await apiFetch('/api/ig/stream/status');
  if (!data || data.status === 'disconnected' || data.status === 'not_configured') {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  var banner = document.getElementById('streamMethodBanner');
  var method = data.priceMethod || 'UNKNOWN';
  var priceSource = data.priceSource || 'none';
  var isLS = priceSource.indexOf('lightstreamer') === 0;
  var isPolling = priceSource === 'rest-polling';
  var instrumentCount = Object.keys(data.instruments || {}).length;
  var acctInfo = data.liveAccountClient ? ' | Live ACCOUNT stream active' : '';
  if (isLS) {
    banner.style.background = '#1b4332';
    banner.style.color = '#2dc653';
    banner.textContent = 'LIGHTSTREAMER L1 REAL-TIME | ' + instrumentCount + ' instruments | ' + (data.lightstreamerEndpoint || '').replace(/https?:\/\//, '') + acctInfo;
  } else if (isPolling) {
    banner.style.background = '#1c2541';
    banner.style.color = '#79c0ff';
    banner.textContent = 'REST API POLLING (every 3s) | ' + instrumentCount + ' instruments' + acctInfo;
  } else {
    banner.style.background = '#3d1a1a';
    banner.style.color = '#f85149';
    banner.textContent = 'NO PRICE FEED ACTIVE';
  }

  var m = data.metrics || {};
  document.getElementById('streamUps').textContent = m.updatesPerSec != null ? m.updatesPerSec.toFixed(1) : '--';
  document.getElementById('streamAvg').textContent = m.avgIntervalMs != null ? m.avgIntervalMs + 'ms' : '--';
  document.getElementById('streamUptime').textContent = fmtDuration(m.uptimeMs);
  document.getElementById('streamSource').textContent = 'Method: ' + method + ' | Account: ' + (data.activeProfile || 'unknown').toUpperCase();
  var ep = data.lightstreamerEndpoint || '';
  document.getElementById('streamEndpoint').textContent = ep ? ep.replace(/https?:\/\//, '').split('/')[0] : '--';
  document.getElementById('streamTotal').textContent = m.totalUpdates != null ? m.totalUpdates.toLocaleString() : '0';
  document.getElementById('streamRange').textContent = (m.minIntervalMs != null ? m.minIntervalMs + 'ms' : '--') + ' - ' + (m.maxIntervalMs != null ? m.maxIntervalMs + 'ms' : '--');

  var instruments = data.instruments || {};
  var epics = Object.keys(instruments);
  if (epics.length === 0) {
    document.getElementById('streamInstruments').innerHTML = '<tr><td colspan="7" style="color:#8b949e">No instruments streaming</td></tr>';
    return;
  }
  epics.sort(function(a, b) { return (instruments[b].updates || 0) - (instruments[a].updates || 0); });
  var html = '<tr><th>Instrument</th><th>Bid</th><th>Offer</th><th>Mid</th><th>Status</th><th>Age</th><th>Updates</th></tr>';
  for (var i = 0; i < epics.length; i++) {
    var ep2 = epics[i];
    var d = instruments[ep2];
    var stateClass = d.marketState === 'TRADEABLE' ? 'badge-on' : 'badge-off';
    var ageColor = d.ageMs < 5000 ? '#2dd654' : d.ageMs < 30000 ? '#f0e68c' : '#f85149';
    html += '<tr>';
    html += '<td class="clickable-instrument" style="font-weight:600" onclick="navigateToInstrument(\'' + ep2.replace(/'/g, "\\'") + '\', \'' + epicShortName(ep2).replace(/'/g, "\\'") + '\')">' + epicShortName(ep2) + '</td>';
    html += '<td>' + fmtNum(d.bid, 5) + '</td>';
    html += '<td>' + fmtNum(d.offer, 5) + '</td>';
    html += '<td>' + fmtNum(d.mid, 5) + '</td>';
    html += '<td><span class="badge ' + stateClass + '" style="font-size:9px;padding:1px 5px">' + (d.marketState || '?') + '</span></td>';
    html += '<td style="color:' + ageColor + '">' + fmtAge(d.ageMs) + '</td>';
    html += '<td>' + (d.updates || 0) + '</td>';
    html += '</tr>';
  }
  document.getElementById('streamInstruments').innerHTML = html;

  if (!streamAutoAdded && epics.length > 0) {
    streamAutoAdded = true;
    var toAdd = [];
    for (var k = 0; k < epics.length; k++) {
      var alreadyWatched = watchedInstruments.some(function(w) { return w.epic === epics[k]; });
      if (!alreadyWatched) toAdd.push(epics[k]);
    }
    if (toAdd.length > 0) {
      (async function() {
        for (var a = 0; a < toAdd.length; a++) {
          var res = await apiPost('/api/ig/watchedlist', { epic: toAdd[a], name: epicShortName(toAdd[a]) });
          if (res && res.ok) {
            watchedInstruments = res.instruments || watchedInstruments;
          }
        }
        renderWatchlistTabs();
        if (!selectedEpic && watchedInstruments.length > 0) selectInstrument(0);
      })();
    }
  }
}

async function loadProcessesPanel() {
  var el = document.getElementById('processesPanel');
  if (!el) return;
  try {
    var data = await apiFetch('/api/bots');
    if (!data || !data.bots) {
      el.innerHTML = '<p class="empty">No process data</p>';
      return;
    }
    var bots = data.bots || [];
    if (bots.length === 0) {
      el.innerHTML = '<p class="empty">No bots registered</p>';
      return;
    }
    var html = '<table style="font-size:11px"><tr><th>Bot</th><th>Status</th><th>PID</th><th>Uptime</th><th>Actions</th></tr>';
    for (var i = 0; i < bots.length; i++) {
      var b = bots[i];
      var statusBadge = b.running
        ? '<span class="badge badge-on">RUNNING</span>'
        : '<span class="badge badge-off">STOPPED</span>';
      html += '<tr>';
      html += '<td style="font-weight:600">' + b.id + '</td>';
      html += '<td>' + statusBadge + '</td>';
      html += '<td style="color:#8b949e">' + (b.pid || '-') + '</td>';
      html += '<td style="color:#8b949e">' + (b.uptime ? fmtDuration(b.uptime) : '-') + '</td>';
      html += '<td>';
      if (b.running) {
        html += '<button class="btn-sm btn-danger" onclick="stopBotById(\'' + b.id + '\')">Stop</button>';
      } else {
        html += '<button class="btn-sm btn-save" onclick="startBotById(\'' + b.id + '\')">Start</button>';
      }
      html += '</td></tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = '<p class="empty">Error loading processes</p>';
  }
}

async function loadBacktestLog() {
  var el = document.getElementById('backtestLog');
  if (!el) return;
  try {
    var data = await apiFetch('/api/ig/scalper/backtests');
    if (!data || !data.backtests || data.backtests.length === 0) {
      el.innerHTML = '<p class="empty">No backtests recorded yet</p>';
      return;
    }
    var runs = data.backtests;
    var html = '<table style="font-size:11px"><tr><th>Date</th><th>Strategy</th><th>Type</th><th>Instrument</th><th>TF</th><th>Candles</th><th>Trades</th><th>Win%</th><th>P&L</th><th>Max DD</th><th>Sharpe</th><th></th></tr>';
    for (var i = 0; i < runs.length; i++) {
      var b = runs[i];
      var date = b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '?';
      var pnlClass = (b.totalPnl || 0) >= 0 ? 'pos' : 'neg';
      html += '<tr>';
      html += '<td style="font-size:10px;white-space:nowrap">' + date + '</td>';
      html += '<td style="font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + (b.strategyName || '').replace(/"/g, '&quot;') + '">' + (b.strategyName || 'Strategy #' + b.strategyId) + '</td>';
      html += '<td><span class="badge badge-snap" style="font-size:9px;padding:1px 5px">' + (b.strategyType || 'scalper') + '</span></td>';
      html += '<td style="font-size:10px">' + (b.instrument || '-') + '</td>';
      html += '<td>' + (b.timeframe || '-') + '</td>';
      html += '<td>' + (b.candleCount || '-') + '</td>';
      html += '<td>' + (b.totalTrades || 0) + ' (' + (b.winCount || 0) + 'W/' + (b.lossCount || 0) + 'L)</td>';
      html += '<td>' + (b.winRate || 0) + '%</td>';
      html += '<td class="' + pnlClass + '">' + ((b.totalPnl || 0) >= 0 ? '+' : '') + fmtNum(b.totalPnl || 0) + '</td>';
      html += '<td style="color:#f85149">' + fmtNum(b.maxDrawdown || 0) + '</td>';
      html += '<td>' + (b.sharpeRatio || 0) + '</td>';
      html += '<td style="display:flex;gap:4px"><button class="btn-sm" style="font-size:9px;padding:1px 6px" onclick="loadBacktestDetail(' + b.id + ')">View</button>';
      html += '<button class="btn-sm" style="font-size:9px;padding:1px 6px" onclick="copyBacktestSettings(' + b.id + ')">Copy</button></td>';
      html += '</tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = '<p class="empty">Error loading backtest log: ' + e.message + '</p>';
  }
}

async function clearAllBacktestLogs() {
  if (!confirm('Delete ALL backtest history across all strategies?')) return;
  try {
    var r = await apiDelete('/api/ig/scalper/backtests');
    if (r && r.ok) {
      showToast('All backtest history cleared', true);
      loadBacktestLog();
    } else {
      showToast('Failed to clear backtest history', false);
    }
  } catch (e) {
    showToast('Error: ' + e.message, false);
  }
}

async function copyBacktestSettings(btId) {
  try {
    var data = await apiFetch('/api/ig/scalper/backtests/' + btId);
    if (!data) { showToast('Failed to load backtest', false); return; }
    var config = data.configSnapshot || data;
    var text = JSON.stringify(config, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showToast('Settings copied to clipboard', true);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Settings copied to clipboard', true);
    }
  } catch (e) {
    showToast('Copy failed: ' + e.message, false);
  }
}

async function stopBotById(id) {
  var r = await apiPost('/api/bots/' + id + '/stop', {});
  if (r && r.ok) showToast('Bot ' + id + ' stopped', true);
  else showToast('Failed to stop bot', false);
  loadProcessesPanel();
}

async function startBotById(id) {
  var r = await apiPost('/api/bots/' + id + '/start', {});
  if (r && r.ok) showToast('Bot ' + id + ' started', true);
  else showToast('Failed to start bot', false);
  loadProcessesPanel();
}
