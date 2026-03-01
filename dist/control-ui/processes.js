var TOKEN = '';
try {
  var s = localStorage.getItem('openclaw.control.settings.v1');
  if (s) { var obj = JSON.parse(s); TOKEN = obj.token || ''; }
} catch(e) {}
if (!TOKEN) {
  try {
    var m = document.cookie.match(/openclaw_token=([^;]+)/);
    if (m) TOKEN = m[1];
  } catch(e) {}
}

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  setTimeout(function() { t.className = 'toast'; }, 3000);
}

function apiFetch(url, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN;
  return fetch(url, opts);
}

function badgeClass(type) {
  if (type === 'monitor') return 'badge-monitor';
  if (type === 'bot') return 'badge-bot';
  return 'badge-script';
}

function killProcess(pid, name) {
  if (!confirm('Kill process "' + name + '" (PID ' + pid + ')?')) return;
  apiFetch('/api/processes/kill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid: pid })
  }).then(function(res) {
    return res.json().then(function(data) {
      if (res.ok) {
        showToast('Killed: ' + name + ' (PID ' + pid + ')', 'success');
        setTimeout(refresh, 1000);
      } else {
        showToast('Error: ' + (data.error || 'Failed'), 'error');
      }
    });
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
  });
}

function botAction(id, action) {
  var url, method;
  if (action === 'start') {
    url = '/api/bots/' + encodeURIComponent(id) + '/start';
    method = 'POST';
  } else if (action === 'stop') {
    url = '/api/bots/' + encodeURIComponent(id) + '/stop';
    method = 'POST';
  } else if (action === 'remove') {
    if (!confirm('Remove bot "' + id + '" from registry? This will stop it and remove it permanently.')) return;
    url = '/api/bots/' + encodeURIComponent(id);
    method = 'DELETE';
  }
  apiFetch(url, { method: method }).then(function(res) {
    return res.json().then(function(data) {
      if (res.ok) {
        showToast(action.charAt(0).toUpperCase() + action.slice(1) + ': ' + id, 'success');
        setTimeout(refresh, 1000);
      } else {
        showToast('Error: ' + (data.error || 'Failed'), 'error');
      }
    });
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
  });
}

function toggleStartup(id, enabled) {
  apiFetch('/api/bots/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: enabled })
  }).then(function(res) {
    return res.json().then(function(data) {
      if (res.ok) {
        showToast(id + ': Run at startup ' + (enabled ? 'ON' : 'OFF'), 'success');
      } else {
        showToast('Error: ' + (data.error || 'Failed'), 'error');
        setTimeout(refresh, 500);
      }
    });
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
    setTimeout(refresh, 500);
  });
}

function loadBots() {
  var el = document.getElementById('botList');
  apiFetch('/api/bots').then(function(res) {
    return res.json();
  }).then(function(data) {
    var bots = data.bots || [];
    if (bots.length === 0) {
      el.innerHTML = '<p class="empty">No bots registered \u2014 agents can register bots via POST /api/bots/register</p>';
      return;
    }
    var html = '<table><tr><th>ID</th><th>Status</th><th>Startup</th><th>PID</th><th>Restarts</th><th>Command</th><th>Added By</th><th>Actions</th></tr>';
    for (var i = 0; i < bots.length; i++) {
      var b = bots[i];
      var statusBadge = b.running ? '<span class="badge badge-running">RUNNING</span>'
        : (b.enabled ? '<span class="badge badge-stopped">STOPPED</span>' : '<span class="badge badge-disabled">DISABLED</span>');
      var checked = b.enabled ? ' checked' : '';
      html += '<tr>';
      html += '<td style="font-weight:600;color:#e6edf3">' + b.id + '</td>';
      html += '<td>' + statusBadge + '</td>';
      html += '<td><label class="startup-toggle"><input type="checkbox"' + checked + ' data-startup-id="' + b.id + '"><span class="startup-label">Auto</span></label></td>';
      html += '<td style="font-family:monospace">' + (b.pid || '-') + '</td>';
      html += '<td>' + (b.restarts || 0) + '</td>';
      html += '<td><span class="cmd" title="' + (b.cmd || '').replace(/"/g, '&quot;') + '">' + (b.cmd || '') + '</span></td>';
      html += '<td style="font-size:12px;color:#8b949e">' + (b.addedBy || '-') + '</td>';
      html += '<td><div class="btn-actions">';
      if (b.running) {
        html += '<button class="btn-stop" data-bot-id="' + b.id + '" data-action="stop">Stop</button>';
      } else {
        html += '<button class="btn-start" data-bot-id="' + b.id + '" data-action="start">Start</button>';
      }
      html += '<button class="btn-remove" data-bot-id="' + b.id + '" data-action="remove">Remove</button>';
      html += '</div></td>';
      html += '</tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  }).catch(function(e) {
    el.innerHTML = '<p class="empty" style="color:#f85149">Error loading bots: ' + e.message + '</p>';
  });
}

function loadProcesses() {
  var el = document.getElementById('processList');
  var countEl = document.getElementById('count');
  apiFetch('/api/processes').then(function(res) {
    return res.json();
  }).then(function(data) {
    var procs = data.processes || [];
    countEl.textContent = procs.length;
    document.getElementById('lastRefresh').textContent = 'Updated ' + new Date().toLocaleTimeString();
    if (procs.length === 0) {
      el.innerHTML = '<p class="empty">No ad-hoc scripts running</p>';
      return;
    }
    var html = '<table><tr><th>Name</th><th>Type</th><th>PID</th><th>CPU</th><th>MEM</th><th>Started</th><th>Command</th><th></th></tr>';
    for (var i = 0; i < procs.length; i++) {
      var p = procs[i];
      html += '<tr>';
      html += '<td style="font-weight:600;color:#e6edf3">' + p.name + '</td>';
      html += '<td><span class="badge ' + badgeClass(p.type) + '">' + p.type + '</span></td>';
      html += '<td style="font-family:monospace">' + p.pid + '</td>';
      html += '<td>' + p.cpu + '%</td>';
      html += '<td>' + p.mem + '%</td>';
      html += '<td>' + p.startTime + '</td>';
      html += '<td><span class="cmd" title="' + p.cmd.replace(/"/g, '&quot;') + '">' + p.cmd + '</span></td>';
      html += '<td><button class="btn-kill" data-pid="' + p.pid + '" data-name="' + p.name.replace(/"/g, '&quot;') + '">Kill</button></td>';
      html += '</tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  }).catch(function(e) {
    el.innerHTML = '<p class="empty" style="color:#f85149">Error loading processes: ' + e.message + '</p>';
  });
}

function refresh() {
  loadBots();
  loadProcesses();
}

document.getElementById('refreshBtn').addEventListener('click', refresh);

document.getElementById('processList').addEventListener('click', function(e) {
  var btn = e.target.closest('.btn-kill');
  if (!btn) return;
  var pid = parseInt(btn.getAttribute('data-pid'));
  var name = btn.getAttribute('data-name');
  killProcess(pid, name);
});

document.getElementById('botList').addEventListener('click', function(e) {
  if (e.target.matches('[data-startup-id]')) return;
  var btn = e.target.closest('[data-bot-id]');
  if (!btn) return;
  var id = btn.getAttribute('data-bot-id');
  var action = btn.getAttribute('data-action');
  if (id && action) botAction(id, action);
});

document.getElementById('botList').addEventListener('change', function(e) {
  var cb = e.target.closest('[data-startup-id]');
  if (!cb) return;
  var id = cb.getAttribute('data-startup-id');
  toggleStartup(id, cb.checked);
});

refresh();
setInterval(refresh, 10000);
