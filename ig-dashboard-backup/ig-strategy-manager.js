var cachedStrategies = [];

function buildStrategyDropdown(dealId, strategies) {
  var attached = -1;
  for (var i = 0; i < strategies.length; i++) {
    if (strategies[i].dealId === dealId) { attached = i; break; }
  }

  var html = '<select class="edit-input" style="width:130px;font-size:11px" onchange="onStrategyAttach(this, \'' + dealId + '\')" data-prev="' + attached + '">';
  html += '<option value="-1"' + (attached === -1 ? ' selected' : '') + '>— None —</option>';
  for (var i = 0; i < strategies.length; i++) {
    var s = strategies[i];
    var label = (s.name || s.instrument).substring(0, 25);
    var isLinkedElsewhere = s.dealId && s.dealId !== dealId;
    if (isLinkedElsewhere) label += ' [linked]';
    html += '<option value="' + i + '"' + (attached === i ? ' selected' : '') + (isLinkedElsewhere ? ' disabled' : '') + '>' + label + '</option>';
  }
  html += '</select>';

  if (attached >= 0) {
    var isPaused = strategies[attached].paused;
    var pauseClass = isPaused ? 'btn-sm btn-toggle off' : 'btn-sm btn-toggle';
    var pauseText = isPaused ? 'PAUSED' : 'ACTIVE';
    html += ' <button class="' + pauseClass + '" style="font-size:10px;padding:2px 6px" onclick="toggleStrategyPause(' + attached + ')">' + pauseText + '</button>';
  }

  return html;
}

async function onStrategyAttach(selectEl, dealId) {
  var newIdx = parseInt(selectEl.value, 10);
  var prevIdx = parseInt(selectEl.getAttribute('data-prev'), 10);

  if (prevIdx >= 0 && prevIdx !== newIdx) {
    var result = await apiPost('/api/ig/strategies/' + prevIdx + '/detach');
    if (!result || !result.ok) {
      showToast('Failed to detach strategy', false);
      loadPositions();
      return;
    }
  }

  if (newIdx >= 0) {
    var result2 = await apiPost('/api/ig/strategies/' + newIdx + '/attach', { dealId: dealId });
    if (result2 && result2.ok) {
      showToast('Strategy attached', true);
    } else {
      showToast(result2 && result2.error ? result2.error : 'Failed to attach strategy', false);
    }
  } else {
    if (prevIdx >= 0) showToast('Strategy detached', true);
  }

  loadStrategy();
  loadPositions();
}

async function toggleStrategyPause(idx) {
  var current = cachedStrategies[idx];
  var newState = !(current && current.paused);
  var result = await apiPost('/api/ig/strategies/' + idx + '/pause', { paused: newState });
  if (result && result.ok) {
    showToast('Strategy ' + (result.paused ? 'paused' : 'resumed'), true);
    loadStrategy();
    loadPositions();
  } else {
    showToast(result && result.error ? result.error : 'Failed to toggle pause', false);
  }
}

function showAddStrategyModal() {
  var existing = document.getElementById('addStrategyOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'addStrategyOverlay';
  overlay.className = 'search-overlay visible';
  overlay.innerHTML =
    '<div class="search-box" style="width:600px">' +
      '<div style="padding:16px;border-bottom:1px solid #30363d">' +
        '<h3 style="color:#c9d1d9;font-size:16px;margin:0">Add Strategy (JSON)</h3>' +
      '</div>' +
      '<div style="padding:16px">' +
        '<textarea id="addStrategyJSON" style="width:100%;height:200px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;font-family:monospace;font-size:13px;padding:10px;border-radius:6px;resize:vertical">' +
          JSON.stringify({
            instrument: "",
            name: "",
            direction: "BUY",
            entryBelow: 0,
            stopDistance: 10,
            limitDistance: 20,
            size: 0.5,
            enabled: false
          }, null, 2) +
        '</textarea>' +
        '<div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">' +
          '<button class="btn-sm btn-cancel" onclick="closeAddStrategyModal()">Cancel</button>' +
          '<button class="btn-sm btn-save" onclick="submitAddStrategy()">Add Strategy</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeAddStrategyModal();
  });

  document.body.appendChild(overlay);
  setTimeout(function() { document.getElementById('addStrategyJSON').focus(); }, 100);
}

function closeAddStrategyModal() {
  var overlay = document.getElementById('addStrategyOverlay');
  if (overlay) overlay.remove();
}

async function submitAddStrategy() {
  var textarea = document.getElementById('addStrategyJSON');
  if (!textarea) return;

  var body;
  try {
    body = JSON.parse(textarea.value);
  } catch(e) {
    showToast('Invalid JSON: ' + e.message, false);
    return;
  }

  var result = await apiPost('/api/ig/strategies', body);
  if (result && result.ok) {
    showToast('Strategy added', true);
    closeAddStrategyModal();
    loadStrategy();
  } else {
    showToast(result && result.error ? result.error : 'Failed to add strategy', false);
  }
}
