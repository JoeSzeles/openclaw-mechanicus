var scalperPanelOpen = true;
function toggleScalperPanel() {
  scalperPanelOpen = !scalperPanelOpen;
  document.getElementById('scalperPanel').style.display = scalperPanelOpen ? '' : 'none';
  document.getElementById('scalperToggleIcon').innerHTML = scalperPanelOpen ? '&#9660;' : '&#9654;';
}

async function loadScalperStatus() {
  var section = document.getElementById('scalperSection');
  var data = await apiFetch('/api/ig/scalper/status');
  if (!data) { section.style.display = 'none'; return; }
  section.style.display = '';
  loadScalperTemplateDropdown();
  window._lastScalperData = data;

  var badge = document.getElementById('scalperBadge');
  if (data.running) {
    badge.className = 'badge badge-on';
    badge.textContent = 'RUNNING (' + data.openPositions + ' open)';
  } else if (data.drawdownTripped) {
    badge.className = 'badge badge-alert';
    badge.textContent = 'DRAWDOWN LIMIT';
  } else {
    badge.className = 'badge badge-off';
    badge.textContent = data.enabled ? 'ENABLED' : 'STOPPED';
  }

  var pnlEl = document.getElementById('scalperPnl');
  pnlEl.textContent = (data.realizedPnl >= 0 ? '+' : '') + fmtNum(data.realizedPnl);
  pnlEl.className = 'value ' + (data.realizedPnl >= 0 ? 'pos' : 'neg');
  document.getElementById('scalperTrades').textContent = data.tradeCount + ' (' + data.winCount + 'W/' + data.lossCount + 'L)';
  document.getElementById('scalperWinRate').textContent = data.winRate + '%';
  document.getElementById('scalperBudget').textContent = fmtNum(data.budget);
  document.getElementById('scalperMaxDD').textContent = fmtNum(data.maxDrawdown);
  document.getElementById('scalperMaxMargin').textContent = data.maxMarginPct;
  document.getElementById('scalperBE').textContent = data.breakEvenBuffer;

  var strategies = data.strategies || [];
  var html = '<tr><th>Name</th><th>Instrument</th><th>Type</th><th>Dir</th><th>TF</th><th>Size</th><th>Stop</th><th>Limit</th><th>CD(s)</th><th>PT($)</th><th>TS</th><th>Status</th><th>Actions</th></tr>';
  if (strategies.length === 0) {
    html += '<tr><td colspan="13" class="empty">No strategies</td></tr>';
  }
  for (var i = 0; i < strategies.length; i++) {
    var s = strategies[i];
    var sid = s.id;
    var isSelected = editingScalperStrategy === sid;
    var toggleClass = s.enabled ? 'btn-sm btn-toggle' : 'btn-sm btn-toggle off';
    var rowStyle = isSelected ? 'background:rgba(88,166,255,0.08);cursor:pointer' : 'cursor:pointer';
    var sType = s.strategyType || 'scalper';
    var typeLabel = sType.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    var isCS = typeof isClawScriptStrategy === 'function' && isClawScriptStrategy(sType);
    var csBadge = isCS ? '<span style="background:#56d4dd;color:#0d1117;font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;margin-right:4px">[CS]</span>' : '';
    html += '<tr style="' + rowStyle + '" onclick="editScalperStrategy(' + sid + ')">';
    html += '<td style="font-weight:600">' + csBadge + (s.name || s.instrument) + '</td>';
    html += '<td style="font-size:11px;color:#8b949e">' + s.instrument + '</td>';
    html += '<td style="font-size:10px;color:' + (isCS ? '#56d4dd' : '#a371f7') + '">' + typeLabel + '</td>';
    html += '<td><span class="badge ' + (s.direction === 'BUY' ? 'badge-on' : s.direction === 'SELL' ? 'badge-alert' : 'badge-spike') + '">' + s.direction + '</span></td>';
    html += '<td style="font-size:10px;color:#8b949e">' + (s.timeframe || 'MINUTE') + '</td>';
    html += '<td>' + (s.size || '-') + '</td>';
    html += '<td>' + (s.stopDistance || 'auto') + '</td>';
    html += '<td>' + (s.limitDistance || 'auto') + '</td>';
    html += '<td>' + ((s.cooldownMs || 6000) / 1000).toFixed(0) + '</td>';
    html += '<td>' + (s.profitTarget || 0) + '</td>';
    html += '<td>' + (s.trailingStop || 0) + '</td>';
    html += '<td><button class="' + toggleClass + '" onclick="event.stopPropagation();scalperToggle(' + sid + ')">' + (s.enabled ? 'ON' : 'OFF') + '</button></td>';
    html += '<td style="white-space:nowrap"><button class="btn-sm" style="background:#1f6feb;color:#fff;font-size:10px" onclick="event.stopPropagation();showStrategyEquity(' + sid + ')" title="Equity Curve">Eq</button> <button class="btn-sm" style="background:#6e40c9;color:#fff;font-size:10px" onclick="event.stopPropagation();showBacktestModal(' + sid + ')">BT</button> <button class="btn-sm btn-danger" onclick="event.stopPropagation();scalperDeleteStrat(' + sid + ')">Del</button></td>';
    html += '</tr>';
  }
  document.getElementById('scalperStrategies').innerHTML = html;

  var trades = (data.allTrades || data.recentTrades || []).slice();
  cachedTrades = data.allTrades || data.recentTrades || [];

  if (typeof renderTradeHistory === 'function') {
    renderTradeHistory();
  } else {
    var thtml = '<tr><th>Time</th><th>Type</th><th>Instrument</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th></tr>';
    if (trades.length === 0) {
      thtml += '<tr><td colspan="7" class="empty">No trades yet</td></tr>';
    }
    for (var j = 0; j < trades.length; j++) {
      var t = trades[j];
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
      thtml += '<tr>';
      thtml += '<td style="font-size:10px">' + timeStr + '</td>';
      thtml += '<td><span class="badge ' + (tradeType === 'OPEN' ? 'badge-spike' : 'badge-snap') + '">' + tradeType + '</span></td>';
      thtml += '<td>' + epicShortName(t.epic) + '</td>';
      thtml += '<td><span class="badge ' + (t.direction === 'BUY' ? 'badge-on' : 'badge-alert') + '">' + (t.direction || '-') + '</span></td>';
      thtml += '<td>' + fmtNum(entryVal, 2) + '</td>';
      thtml += '<td>' + (exitVal != null ? fmtNum(exitVal, 2) : '-') + '</td>';
      thtml += '<td class="' + (t.pnl != null ? (t.pnl >= 0 ? 'pos' : 'neg') : '') + '">' + (t.pnl != null ? (t.pnl >= 0 ? '+' : '') + fmtNum(t.pnl) : '-') + '</td>';
      thtml += '</tr>';
    }
    document.getElementById('scalperTradeLog').innerHTML = thtml;
  }
}

async function scalperStart() {
  var r = await apiPost('/api/ig/scalper/start', {});
  if (r && r.ok) showToast('Claw Trader started', true);
  else showToast('Failed to start Claw Trader', false);
  loadScalperStatus();
}

async function scalperStop() {
  var r = await apiPost('/api/ig/scalper/stop', {});
  if (r && r.ok) showToast('Claw Trader stopped', true);
  else showToast('Failed to stop Claw Trader', false);
  loadScalperStatus();
}

function downloadScalperTrades() {
  apiFetch('/api/ig/logs/scalper-trades').then(function(data) {
    if (!data) { showToast('No trade data available', false); return; }
    var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scalper-trades-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

async function scalperReset() {
  if (!confirm('Reset all Claw Trader stats and trade history? This will clear all trade records from the database.')) return;
  var r = await apiPost('/api/ig/scalper/reset', {});
  if (r && r.ok) showToast('Stats reset successfully', true);
  else showToast('Reset failed', false);
  loadScalperStatus();
}

async function scalperToggle(id) {
  var wasEditing = editingScalperStrategy;
  var r = await apiPost('/api/ig/scalper/strategies/' + id + '/toggle', {});
  if (r && r.ok) showToast('Strategy ' + (r.enabled ? 'enabled' : 'disabled'), true);
  editingScalperStrategy = wasEditing;
  loadScalperStatus();
}

async function scalperDeleteStrat(id) {
  if (!confirm('Delete this strategy?')) return;
  var opts = { method: 'DELETE', headers: { 'Accept': 'application/json' } };
  if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN;
  var res = await fetch('/api/ig/scalper/strategies/' + id, opts);
  var data = await res.json();
  if (data.ok) showToast('Strategy deleted', true);
  else showToast('Failed', false);
  if (editingScalperStrategy === id) editingScalperStrategy = null;
  loadScalperStatus();
}

function editScalperStrategy(id) {
  editingScalperStrategy = id;
  openStrategyEditor(id);
}

function findStrategyById(id) {
  var d = window._lastScalperData;
  if (!d || !d.strategies) return null;
  for (var i = 0; i < d.strategies.length; i++) {
    if (d.strategies[i].id === id) return d.strategies[i];
  }
  return null;
}

function populateStrategyFields(s) {
  document.getElementById('seditStratLabel').textContent = (s.name || s.instrument) + ' (' + s.instrument + ')';
  document.getElementById('seditStratName').value = s.name || '';

  var typeDropdown = document.getElementById('seditStratTypeContainer');
  if (typeDropdown) {
    typeDropdown.innerHTML = buildStrategyTypeDropdown(s.strategyType || 'scalper');
  }

  document.getElementById('seditStratDir').value = s.direction || 'BOTH';
  document.getElementById('seditStratTF').value = s.timeframe || 'MINUTE';
  document.getElementById('seditStratSize').value = s.size != null ? s.size : '';
  document.getElementById('seditStratStop').value = s.stopDistance != null ? s.stopDistance : '';
  document.getElementById('seditStratLimit').value = s.limitDistance != null ? s.limitDistance : '';

  var sType = s.strategyType || 'scalper';
  if (typeof isClawScriptStrategy === 'function' && isClawScriptStrategy(sType)) {
    renderClawScriptFields(sType, s);
  } else {
    var csContainer = document.getElementById('csCustomFields');
    if (csContainer) { csContainer.innerHTML = ''; csContainer.style.display = 'none'; }
    applyFieldVisibility(sType);
  }
  applyTooltips();
}

function editEngineSettings() {
  document.getElementById('strategySettingsEdit').style.display = 'none';
  var panel = document.getElementById('engineSettingsEdit');
  panel.style.display = '';
  var d = window._lastScalperData || {};
  document.getElementById('seditBudget').value = d.budget != null ? d.budget : 5000;
  document.getElementById('seditMaxDD').value = d.maxDrawdown != null ? d.maxDrawdown : 500;
  document.getElementById('seditMaxMargin').value = d.maxMarginPct != null ? d.maxMarginPct : 10;
  document.getElementById('seditBE').value = d.breakEvenBuffer != null ? d.breakEvenBuffer : 1.5;
}

function cancelEngineSettings() {
  document.getElementById('engineSettingsEdit').style.display = 'none';
}

async function saveEngineSettings() {
  var body = {
    budget: parseFloat(document.getElementById('seditBudget').value),
    maxDrawdown: parseFloat(document.getElementById('seditMaxDD').value),
    maxMarginPct: parseFloat(document.getElementById('seditMaxMargin').value),
    breakEvenBuffer: parseFloat(document.getElementById('seditBE').value)
  };
  var r = await apiPut('/api/ig/scalper', body);
  if (r && r.ok) showToast('Engine settings saved', true);
  else showToast('Failed to save engine settings', false);
  document.getElementById('engineSettingsEdit').style.display = 'none';
  loadScalperStatus();
}

function openStrategyEditor(id) {
  document.getElementById('engineSettingsEdit').style.display = 'none';
  var panel = document.getElementById('strategySettingsEdit');
  panel.style.display = '';
  var s = findStrategyById(id);
  if (s) populateStrategyFields(s);
}

function cancelStrategySettings() {
  document.getElementById('strategySettingsEdit').style.display = 'none';
  editingScalperStrategy = null;
  loadScalperStatus();
}

async function saveStrategySettings() {
  var id = editingScalperStrategy;
  if (id === null) { showToast('No strategy selected', false); return; }

  var stratTypeEl = document.getElementById('seditStratType');
  var body = {
    name: document.getElementById('seditStratName').value,
    strategyType: stratTypeEl ? stratTypeEl.value : 'scalper',
    direction: document.getElementById('seditStratDir').value,
    timeframe: document.getElementById('seditStratTF').value || 'MINUTE',
    size: parseFloat(document.getElementById('seditStratSize').value) || undefined,
    stopDistance: parseFloat(document.getElementById('seditStratStop').value) || undefined,
    limitDistance: parseFloat(document.getElementById('seditStratLimit').value) || undefined
  };
  var dynVals = typeof collectDynamicIndicatorValues === 'function' ? collectDynamicIndicatorValues() : {};
  for (var dk in dynVals) { if (dynVals.hasOwnProperty(dk)) body[dk] = dynVals[dk]; }
  var rsiOn = document.getElementById('seditRsiOn');
  if (rsiOn && !dynVals.hasOwnProperty('rsiEnabled')) {
    body.rsiEnabled = rsiOn.checked;
    body.rsiPeriod = parseInt((document.getElementById('seditRsiPeriod') || {}).value, 10) || 14;
    body.rsiOverbought = parseInt((document.getElementById('seditRsiOB') || {}).value, 10) || 70;
    body.rsiOversold = parseInt((document.getElementById('seditRsiOS') || {}).value, 10) || 30;
  }
  var emaOn = document.getElementById('seditEmaOn');
  if (emaOn && !dynVals.hasOwnProperty('emaEnabled')) {
    body.emaEnabled = emaOn.checked;
    body.emaShort = parseInt((document.getElementById('seditEmaShort') || {}).value, 10) || 9;
    body.emaLong = parseInt((document.getElementById('seditEmaLong') || {}).value, 10) || 21;
  }
  var macdOn = document.getElementById('seditMacdOn');
  if (macdOn && !dynVals.hasOwnProperty('macdEnabled')) {
    body.macdEnabled = macdOn.checked;
    body.macdFast = parseInt((document.getElementById('seditMacdFast') || {}).value, 10) || 12;
    body.macdSlow = parseInt((document.getElementById('seditMacdSlow') || {}).value, 10) || 26;
    body.macdSignal = parseInt((document.getElementById('seditMacdSignal') || {}).value, 10) || 9;
  }
  if (typeof collectClawScriptFieldValues === 'function') {
    var csVals = collectClawScriptFieldValues();
    for (var csKey in csVals) { if (csVals.hasOwnProperty(csKey)) body[csKey] = csVals[csKey]; }
  }
  try {
    var r = await apiPut('/api/ig/scalper/strategies/' + id, body);
    if (r && r.ok) showToast('Strategy saved', true);
    else showToast('Failed to save strategy: ' + (r && r.error ? r.error : 'unknown'), false);
  } catch (e) {
    showToast('Save error: ' + e.message, false);
  }
  document.getElementById('strategySettingsEdit').style.display = 'none';
  editingScalperStrategy = null;
  loadScalperStatus();
}

var SCALPER_TEMPLATES = [
  { name: 'Gold Claw', instrument: 'CS.D.CFAGOLD.CFA.IP', instrumentName: 'Spot Gold', direction: 'BOTH', size: 0.5, stopDistance: 50, limitDistance: 80, minMomentumPct: 0.03 },
  { name: 'Gold BUY Dip', instrument: 'CS.D.CFAGOLD.CFA.IP', instrumentName: 'Spot Gold', direction: 'BUY', size: 0.5, stopDistance: 40, limitDistance: 70, minMomentumPct: 0.025 },
  { name: 'Gold SELL Rally', instrument: 'CS.D.CFAGOLD.CFA.IP', instrumentName: 'Spot Gold', direction: 'SELL', size: 0.5, stopDistance: 40, limitDistance: 70, minMomentumPct: 0.025 }
];

async function loadScalperTemplateDropdown() {
  var dd = document.getElementById('scalperTemplateDropdown');
  if (!dd) return;
  var html = '<option value="">Templates...</option>';

  var groups = {};
  for (var i = 0; i < SCALPER_TEMPLATES.length; i++) {
    var t = SCALPER_TEMPLATES[i];
    var g = t.instrumentName || t.instrument;
    if (!groups[g]) groups[g] = [];
    groups[g].push(i);
  }
  html += '<optgroup label="Default Templates">';
  for (var g in groups) {
    for (var j = 0; j < groups[g].length; j++) {
      var idx = groups[g][j];
      var t = SCALPER_TEMPLATES[idx];
      var dirLabel = t.direction === 'BOTH' ? 'Both' : t.direction;
      html += '<option value="default:' + idx + '">' + t.name + ' (' + dirLabel + ')</option>';
    }
  }
  html += '</optgroup>';

  html += '<optgroup label="ClawScript Strategies">';
  html += '<option value="" disabled style="color:#484f58">Loading...</option>';
  html += '</optgroup>';

  html += '<optgroup label="Load Custom">';
  html += '<option value="__load_custom__">Load from file...</option>';
  html += '</optgroup>';

  dd.innerHTML = html;

  try {
    var data = await apiFetch('/api/clawscript/strategies');
    var csGroup = dd.querySelector('optgroup[label="ClawScript Strategies"]');
    if (!csGroup) return;
    csGroup.innerHTML = '';
    var strategies = (data && data.strategies) ? data.strategies : [];
    if (strategies.length === 0) {
      csGroup.innerHTML = '<option value="" disabled style="color:#484f58">No ClawScript strategies</option>';
    } else {
      for (var k = 0; k < strategies.length; k++) {
        var cs = strategies[k];
        csGroup.innerHTML += '<option value="cs:' + k + '" data-cs-name="' + (cs.name || cs.file || '') + '" style="color:#56d4dd">' + (cs.name || cs.file) + '</option>';
      }
      window._clawscriptStrategies = strategies;
    }
  } catch (e) {
    var csGroup = dd.querySelector('optgroup[label="ClawScript Strategies"]');
    if (csGroup) csGroup.innerHTML = '<option value="" disabled style="color:#484f58">No ClawScript strategies</option>';
  }
}

function onScalperTemplateSelect(sel) {
  if (sel.value === '' || sel.value === '__load_custom__') {
    if (sel.value === '__load_custom__') {
      sel.value = '';
      var fileInput = document.getElementById('scalperCustomFileInput');
      if (fileInput) fileInput.click();
    }
    return;
  }
  var val = sel.value;
  sel.value = '';

  if (val.indexOf('default:') === 0) {
    var idx = parseInt(val.replace('default:', ''), 10);
    var t = SCALPER_TEMPLATES[idx];
    if (!t) return;
    showScalperAddModal();
    setTimeout(function() {
      if (t.instrument) document.getElementById('scalperAddEpic').value = t.instrument;
      if (t.name) document.getElementById('scalperAddName').value = t.name;
      if (t.direction) document.getElementById('scalperAddDir').value = t.direction;
      if (t.size) document.getElementById('scalperAddSize').value = t.size;
      if (t.stopDistance) document.getElementById('scalperAddStop').value = t.stopDistance;
      if (t.limitDistance) document.getElementById('scalperAddLimit').value = t.limitDistance;
      if (t.minMomentumPct) document.getElementById('scalperAddMom').value = t.minMomentumPct;
    }, 100);
  } else if (val.indexOf('cs:') === 0) {
    var csIdx = parseInt(val.replace('cs:', ''), 10);
    var csStrategies = window._clawscriptStrategies || [];
    var cs = csStrategies[csIdx];
    if (!cs) return;
    if (!confirm('Add ClawScript strategy:\n\n' + (cs.name || cs.file) + '\nType: ' + (cs.type || 'clawscript'))) return;
    var csBody = {
      instrument: cs.instrument || '',
      name: cs.name || cs.file,
      strategyType: cs.type || 'clawscript',
      enabled: false
    };
    apiPost('/api/ig/scalper/strategies', csBody).then(function(r) {
      if (r && r.ok) { showToast('Added ClawScript: ' + (cs.name || cs.file) + ' (disabled)', true); loadScalperStatus(); }
      else showToast(r && r.error ? r.error : 'Failed', false);
    });
  }
}

function onCustomStrategyFileLoad(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var content = e.target.result;
    try {
      var parsed = JSON.parse(content);
      if (parsed.name || parsed.instrument) {
        var body = {
          instrument: parsed.instrument || '',
          name: parsed.name || file.name.replace(/\.(cjs|js|json)$/, ''),
          direction: parsed.direction || 'BOTH',
          size: parsed.size || 1,
          stopDistance: parsed.stopDistance || 20,
          limitDistance: parsed.limitDistance || 35,
          minMomentumPct: parsed.minMomentumPct || 0.02,
          enabled: false
        };
        apiPost('/api/ig/scalper/strategies', body).then(function(r) {
          if (r && r.ok) { showToast('Loaded: ' + body.name, true); loadScalperStatus(); }
          else showToast(r && r.error ? r.error : 'Failed to load', false);
        });
      } else {
        showToast('Invalid strategy file: missing name or instrument', false);
      }
    } catch (err) {
      var fname = file.name.replace(/\.(cjs|js|json)$/, '');
      var body = {
        name: fname,
        customCode: content,
        enabled: false
      };
      apiPost('/api/ig/scalper/strategies', body).then(function(r) {
        if (r && r.ok) { showToast('Loaded custom: ' + fname, true); loadScalperStatus(); }
        else showToast(r && r.error ? r.error : 'Failed to load', false);
      });
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function showScalperAddModal() {
  var existing = document.getElementById('scalperAddOverlay');
  if (existing) existing.remove();

  var stratTypeHtml = buildStrategyTypeDropdown('scalper');

  var overlay = document.createElement('div');
  overlay.id = 'scalperAddOverlay';
  overlay.className = 'search-overlay visible';
  overlay.innerHTML =
    '<div class="search-box" style="width:500px">' +
      '<div style="padding:16px;border-bottom:1px solid #30363d">' +
        '<h3 style="color:#c9d1d9;font-size:16px;margin:0">Add Claw Trader Strategy</h3>' +
      '</div>' +
      '<div style="padding:16px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:12px">' +
          '<div><label style="color:#8b949e">Instrument</label><div style="display:flex;gap:4px"><input class="edit-input" id="scalperAddEpic" placeholder="e.g. CS.D.CFAGOLD.CFA.IP" style="flex:1"><button class="btn-sm" onclick="openScalperInstrumentSearch()" title="Search">&#128269;</button></div></div>' +
          '<div><label style="color:#8b949e">Name</label><input class="edit-input" id="scalperAddName" placeholder="My Strategy"></div>' +
          '<div><label style="color:#8b949e">Strategy Type</label>' + stratTypeHtml.replace('id="seditStratType"', 'id="scalperAddType"') + '</div>' +
          '<div><label style="color:#8b949e">Direction</label><select class="edit-input" id="scalperAddDir"><option value="BOTH">BOTH</option><option value="BUY">BUY</option><option value="SELL">SELL</option></select></div>' +
          '<div><label style="color:#8b949e">Size</label><input class="edit-input" id="scalperAddSize" type="number" step="0.1" value="0.5"></div>' +
          '<div><label style="color:#8b949e">Stop Distance</label><input class="edit-input" id="scalperAddStop" type="number" step="1" value="50"></div>' +
          '<div><label style="color:#8b949e">Limit Distance</label><input class="edit-input" id="scalperAddLimit" type="number" step="1" value="80"></div>' +
          '<div><label style="color:#8b949e">Min Momentum %</label><input class="edit-input" id="scalperAddMom" type="number" step="0.01" value="0.03"></div>' +
          '<div><label style="color:#8b949e">Enabled</label><select class="edit-input" id="scalperAddEnabled"><option value="false" selected>No</option><option value="true">Yes</option></select></div>' +
        '</div>' +
        '<div id="scalperInstrumentSearchResults" style="display:none;max-height:150px;overflow-y:auto;margin-bottom:10px;border:1px solid #30363d;border-radius:4px;font-size:12px"></div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end">' +
          '<button class="btn-sm btn-cancel" onclick="closeScalperAddModal()">Cancel</button>' +
          '<button class="btn-sm btn-save" onclick="submitScalperAdd()">Add Strategy</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeScalperAddModal(); });
  document.body.appendChild(overlay);
}

function closeScalperAddModal() {
  var el = document.getElementById('scalperAddOverlay');
  if (el) el.remove();
  scalperSearchListenerAttached = false;
}

var scalperSearchTimeout = null;
var scalperSearchListenerAttached = false;
function openScalperInstrumentSearch() {
  var resultsEl = document.getElementById('scalperInstrumentSearchResults');
  resultsEl.style.display = '';
  resultsEl.innerHTML = '<div style="padding:8px;color:#8b949e">Type in the instrument field above to search, or enter an epic directly</div>';
  var epicInput = document.getElementById('scalperAddEpic');
  epicInput.focus();
  if (scalperSearchListenerAttached) return;
  scalperSearchListenerAttached = true;
  epicInput.addEventListener('input', function handler() {
    if (scalperSearchTimeout) clearTimeout(scalperSearchTimeout);
    var q = epicInput.value.trim();
    if (q.length < 2) return;
    scalperSearchTimeout = setTimeout(function() {
      apiFetch('/api/ig/markets?q=' + encodeURIComponent(q)).then(function(data) {
        if (!data || !data.markets || data.markets.length === 0) {
          resultsEl.innerHTML = '<div style="padding:8px;color:#8b949e">No results</div>';
          return;
        }
        var html = '';
        for (var i = 0; i < Math.min(data.markets.length, 10); i++) {
          var m = data.markets[i];
          html += '<div style="padding:6px 8px;cursor:pointer;border-bottom:1px solid #21262d" onmouseenter="this.style.background=\'rgba(88,166,255,0.08)\'" onmouseleave="this.style.background=\'\'" onclick="selectScalperInstrument(\'' + m.epic + '\',\'' + (m.instrumentName || '').replace(/'/g, "\\'") + '\')">' +
            '<span style="font-weight:600">' + (m.instrumentName || m.epic) + '</span> ' +
            '<span style="color:#8b949e;font-size:10px">' + m.epic + '</span>' +
          '</div>';
        }
        resultsEl.innerHTML = html;
      });
    }, 400);
  });
}

function selectScalperInstrument(epic, name) {
  document.getElementById('scalperAddEpic').value = epic;
  if (!document.getElementById('scalperAddName').value) {
    document.getElementById('scalperAddName').value = name + ' Strategy';
  }
  document.getElementById('scalperInstrumentSearchResults').style.display = 'none';
}

async function submitScalperAdd() {
  var epic = document.getElementById('scalperAddEpic').value.trim();
  if (!epic) { showToast('Instrument epic is required', false); return; }
  var typeEl = document.getElementById('scalperAddType');
  var body = {
    instrument: epic,
    name: document.getElementById('scalperAddName').value.trim() || epic,
    strategyType: typeEl ? typeEl.value : 'scalper',
    direction: document.getElementById('scalperAddDir').value,
    size: parseFloat(document.getElementById('scalperAddSize').value) || 0.5,
    stopDistance: parseFloat(document.getElementById('scalperAddStop').value) || 50,
    limitDistance: parseFloat(document.getElementById('scalperAddLimit').value) || 80,
    minMomentumPct: parseFloat(document.getElementById('scalperAddMom').value) || 0.03,
    enabled: document.getElementById('scalperAddEnabled').value === 'true'
  };
  var r = await apiPost('/api/ig/scalper/strategies', body);
  if (r && r.ok) {
    showToast('Strategy added: ' + body.name, true);
    closeScalperAddModal();
    loadScalperStatus();
  } else {
    showToast(r && r.error ? r.error : 'Failed', false);
  }
}

function updateDealStrategySelector() {
  var sel = document.getElementById('dealStrategySelect');
  if (!sel) return;
  var d = window._lastScalperData;
  if (!d || !d.strategies) return;
  sel.innerHTML = '<option value="">Manual Deal</option>';
  for (var i = 0; i < d.strategies.length; i++) {
    var s = d.strategies[i];
    if (s.enabled) {
      sel.innerHTML += '<option value="' + s.id + '">' + (s.name || s.instrument) + '</option>';
    }
  }
}

function onDealStrategyChange() {
  var sel = document.getElementById('dealStrategySelect');
  if (!sel || !sel.value) return;
  var strat = findStrategyById(parseInt(sel.value, 10));
  if (!strat) return;
  if (strat.instrument && strat.instrument !== selectedEpic) {
    navigateToInstrument(strat.instrument, strat.name || strat.instrument);
  }
}

function showStrategyEquity(id) {
  var strat = findStrategyById(id);
  if (!strat) { showToast('Strategy not found', false); return; }
  var trades = (cachedTrades || []).filter(function(t) {
    return (t.strategyId === id || t.strategy === id || t.strategyName === (strat.name || ''));
  });
  if (trades.length === 0) { showToast('No trades for this strategy yet', false); return; }
  var equityData = buildEquityFromTrades(trades);
  showEquityModal((strat.name || strat.instrument) + ' Equity Curve', equityData);
}

function showCombinedStrategyEquity() {
  var trades = cachedTrades || [];
  if (trades.length === 0) { showToast('No trades to chart', false); return; }
  var equityData = buildEquityFromTrades(trades);
  showEquityModal('Combined Equity Curve (All Strategies)', equityData);
}
