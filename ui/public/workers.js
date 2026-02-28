var TOKEN = '';
try {
  var s = localStorage.getItem('openclaw.control.settings.v1');
  if (s) { var obj = JSON.parse(s); TOKEN = obj.token || ''; }
} catch(e) {}
if (!TOKEN) {
  try { var m = document.cookie.match(/openclaw_token=([^;]+)/); if (m) TOKEN = m[1]; } catch(e) {}
}

var COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#2980b9'];
function avatarColor(name) { var h = 0; for (var i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }
function initials(name) { var p = name.split(/[\s-]+/); return p.length > 1 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase(); }
function showToast(msg, type) { var t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast show ' + (type||''); setTimeout(function(){ t.className = 'toast'; }, 3000); }
function apiFetch(url, opts) { opts = opts || {}; opts.headers = opts.headers || {}; if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN; return fetch(url, opts); }
function formatSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

var BASE_URL = window.location.origin;
var lastKeys = [];

function loadKeys() {
  var el = document.getElementById('keyList');
  apiFetch('/api/keys').then(function(r){ return r.json(); }).then(function(data) {
    var keys = data.keys || [];
    lastKeys = keys;
    if (!keys.length) { el.innerHTML = '<p class="empty">No API keys \u2014 generate one to connect workers</p>'; document.getElementById('connectSection').style.display = 'none'; return; }
    var html = '';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      html += '<div class="key-card"><div><span class="key-name">' + escHtml(k.name) + '</span><span class="key-preview">' + escHtml(k.keyPreview) + '</span>';
      html += '<span style="margin-left:12px;font-size:11px;color:#8b949e">' + (k.active ? 'active' : 'disabled') + '</span></div>';
      html += '<div class="key-actions">';
      html += '<button class="btn-reveal" data-key-id="' + k.id + '" data-action="reveal">Reveal</button>';
      html += '<button class="btn-toggle" data-key-id="' + k.id + '" data-action="toggle">' + (k.active ? 'Disable' : 'Enable') + '</button>';
      html += '<button class="btn-delete" data-key-id="' + k.id + '" data-action="delete">Delete</button>';
      html += '</div></div>';
    }
    el.innerHTML = html;
    buildConnectionScripts();
  }).catch(function(e) { el.innerHTML = '<p class="empty" style="color:#f85149">Error: ' + e.message + '</p>'; });
}

function buildConnectionScripts() {
  var sec = document.getElementById('connectSection');
  var el = document.getElementById('scriptList');
  var activeKeys = lastKeys.filter(function(k) { return k.active; });
  if (!activeKeys.length) { sec.style.display = 'none'; return; }
  sec.style.display = '';

  var html = '';
  for (var i = 0; i < activeKeys.length; i++) {
    var k = activeKeys[i];
    html += '<div class="script-box">';
    html += '<div class="script-label">Bash (Linux/macOS) \u2014 Key: ' + escHtml(k.name) + '</div>';
    html += '<div class="script-code" id="script-bash-' + k.id + '">';
    html += 'curl -sL ' + BASE_URL + '/api/workers/register \\\n  -H "X-API-Key: ' + escHtml(k.keyPreview) + '..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name":"' + escHtml(k.name) + '","platform":"linux"}\'';
    html += '<button class="btn-copy" data-target="script-bash-' + k.id + '">Copy</button></div>';
    html += '<div style="margin-top:8px"><div class="script-label">PowerShell (Windows) \u2014 Key: ' + escHtml(k.name) + '</div>';
    html += '<div class="script-code" id="script-ps-' + k.id + '">';
    html += 'Invoke-RestMethod -Uri "' + BASE_URL + '/api/workers/register" `\n  -Method POST `\n  -Headers @{"X-API-Key"="' + escHtml(k.keyPreview) + '...";"Content-Type"="application/json"} `\n  -Body \'{"name":"' + escHtml(k.name) + '","platform":"windows"}\'';
    html += '<button class="btn-copy" data-target="script-ps-' + k.id + '">Copy</button></div>';
    html += '</div>';
    html += '<p style="font-size:12px;color:#8b949e;margin-top:8px">Click "Reveal" on the API key above to get the full key, then replace the "..." in the script.</p>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function loadWorkers() {
  var el = document.getElementById('workerList');
  var countEl = document.getElementById('workerCount');
  apiFetch('/api/workers').then(function(r){ return r.json(); }).then(function(data) {
    var w = data.workers || [];
    countEl.textContent = w.length;
    document.getElementById('lastRefresh').textContent = 'Updated ' + new Date().toLocaleTimeString();
    if (!w.length) { el.innerHTML = '<p class="empty">No workers connected</p>'; return; }
    var html = '<table><tr><th></th><th>Name</th><th>Status</th><th>Platform</th><th>Connected</th><th>Last Seen</th><th>ID</th><th></th></tr>';
    for (var i = 0; i < w.length; i++) {
      var wr = w[i];
      var col = avatarColor(wr.name);
      var ini = initials(wr.name);
      var badge = wr.status === 'online' ? '<span class="badge badge-online">ONLINE</span>' : '<span class="badge badge-stale">STALE</span>';
      html += '<tr>';
      html += '<td><div class="avatar" style="background:' + col + '">' + ini + '</div></td>';
      html += '<td style="font-weight:600;color:#e6edf3">' + escHtml(wr.name) + '</td>';
      html += '<td>' + badge + '</td>';
      html += '<td>' + escHtml(wr.platform || '-') + '</td>';
      html += '<td style="font-size:12px">' + new Date(wr.connectedAt).toLocaleString() + '</td>';
      html += '<td style="font-size:12px">' + new Date(wr.lastSeen).toLocaleString() + '</td>';
      html += '<td style="font-family:monospace;font-size:11px;color:#8b949e">' + escHtml(wr.id) + '</td>';
      html += '<td><button class="btn-delete" data-worker-id="' + escHtml(wr.id) + '" style="font-size:11px;padding:2px 8px">Remove</button></td>';
      html += '</tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  }).catch(function(e) { el.innerHTML = '<p class="empty" style="color:#f85149">Error: ' + e.message + '</p>'; });
}

function loadExchange() {
  var el = document.getElementById('exchangeList');
  apiFetch('/api/exchange').then(function(r){ return r.json(); }).then(function(data) {
    var files = data.files || [];
    if (!files.length) { el.innerHTML = '<p class="empty">No files in exchange</p>'; return; }
    var html = '<table><tr><th>Name</th><th>Size</th><th>Modified</th><th></th></tr>';
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      html += '<tr><td style="font-weight:500">' + escHtml(f.name) + '</td>';
      html += '<td>' + formatSize(f.size) + '</td>';
      html += '<td style="font-size:12px">' + new Date(f.modified).toLocaleString() + '</td>';
      html += '<td><a href="/api/exchange/download/' + encodeURIComponent(f.name) + '" style="color:#58a6ff;font-size:12px">Download</a></td></tr>';
    }
    html += '</table>';
    el.innerHTML = html;
  }).catch(function(e) { el.innerHTML = '<p class="empty" style="color:#f85149">Error: ' + e.message + '</p>'; });
}

function loadSharedspace() {
  var el = document.getElementById('sharedspaceList');
  apiFetch('/api/sharedspace').then(function(r){ return r.json(); }).then(function(data) {
    var files = data.files || [];
    if (!files.length) { el.innerHTML = '<p class="empty">Shared space is empty</p>'; return; }
    files.sort(function(a,b) { return a.name.localeCompare(b.name); });
    var html = '';
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      html += '<div class="ss-file">';
      html += '<span class="ss-file-name">' + escHtml(f.name) + '</span>';
      html += '<span class="ss-file-size">' + formatSize(f.size) + '</span>';
      html += '<div class="ss-file-actions">';
      html += '<a href="/api/sharedspace/download/' + encodeURIComponent(f.name) + '">Download</a>';
      html += '<button data-ss-delete="' + escHtml(f.name) + '">Delete</button>';
      html += '</div>';
      html += '</div>';
    }
    el.innerHTML = html;
  }).catch(function(e) { el.innerHTML = '<p class="empty" style="color:#f85149">Error: ' + e.message + '</p>'; });
}

var lastChatTs = null;
function loadChat() {
  var el = document.getElementById('chatMessages');
  var url = '/api/chat?limit=50';
  apiFetch(url).then(function(r){ return r.json(); }).then(function(data) {
    var msgs = data.messages || [];
    if (!msgs.length) { el.innerHTML = '<p class="empty">No messages yet</p>'; return; }
    var html = '';
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      var col = avatarColor(m.from);
      var ini = initials(m.from);
      html += '<div class="chat-msg">';
      html += '<div class="chat-msg-avatar" style="background:' + col + '">' + ini + '</div>';
      html += '<div class="chat-msg-body">';
      html += '<div class="chat-msg-from">' + escHtml(m.from) + ' <span style="font-weight:400;color:#484f58">' + (m.role || '') + '</span></div>';
      html += '<div class="chat-msg-text">' + escHtml(m.text) + '</div>';
      html += '<div class="chat-msg-time">' + new Date(m.ts).toLocaleString() + '</div>';
      html += '</div></div>';
    }
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }).catch(function(e) { el.innerHTML = '<p class="empty" style="color:#f85149">Error: ' + e.message + '</p>'; });
}

document.getElementById('addKeyBtn').addEventListener('click', function() {
  var name = document.getElementById('newKeyName').value.trim();
  if (!name) { showToast('Enter a key name', 'error'); return; }
  apiFetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name }) })
    .then(function(r){ return r.json(); }).then(function(data) {
      if (data.key) { showToast('Key created: ' + data.key, 'success'); document.getElementById('newKeyName').value = ''; loadKeys(); }
      else showToast('Error creating key', 'error');
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('keyList').addEventListener('click', function(e) {
  var btn = e.target.closest('[data-key-id]');
  if (!btn) return;
  var id = btn.getAttribute('data-key-id');
  var action = btn.getAttribute('data-action');
  if (action === 'reveal') {
    apiFetch('/api/keys/' + id + '/reveal', { method: 'POST' }).then(function(r){ return r.json(); }).then(function(d) {
      if (d.key) { prompt('API Key (copy it):', d.key); }
    });
  } else if (action === 'toggle') {
    apiFetch('/api/keys/' + id + '/toggle', { method: 'PUT' }).then(function(r){ return r.json(); }).then(function(d) {
      showToast('Key ' + (d.active ? 'enabled' : 'disabled'), 'success'); loadKeys();
    });
  } else if (action === 'delete') {
    if (!confirm('Delete this API key?')) return;
    apiFetch('/api/keys/' + id, { method: 'DELETE' }).then(function(r){ return r.json(); }).then(function() {
      showToast('Key deleted', 'success'); loadKeys();
    });
  }
});

document.getElementById('workerList').addEventListener('click', function(e) {
  var btn = e.target.closest('[data-worker-id]');
  if (!btn) return;
  var wid = btn.getAttribute('data-worker-id');
  if (!confirm('Remove worker ' + wid + '?')) return;
  apiFetch('/api/workers/' + encodeURIComponent(wid), { method: 'DELETE' }).then(function(r){ return r.json(); }).then(function() {
    showToast('Worker removed', 'success'); loadWorkers();
  }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('dispatchBtn').addEventListener('click', function() {
  var worker = document.getElementById('dispatchWorker').value.trim();
  var message = document.getElementById('dispatchMessage').value.trim();
  if (!worker) { showToast('Enter worker name', 'error'); return; }
  if (!message) { showToast('Enter a message', 'error'); return; }
  apiFetch('/api/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workerName: worker, message: message }) })
    .then(function(r){ return r.json(); }).then(function(data) {
      if (data.ok) {
        showToast('Dispatched to ' + data.workerName, 'success');
        document.getElementById('dispatchMessage').value = '';
        document.getElementById('dispatchResult').innerHTML = '<p style="color:#3fb950;font-size:13px;margin-top:8px">Task ' + data.taskId + ' dispatched to ' + escHtml(data.workerName) + '</p>';
        setTimeout(loadChat, 1000);
      } else {
        showToast('Error: ' + (data.error || 'Failed'), 'error');
        document.getElementById('dispatchResult').innerHTML = '<p style="color:#f85149;font-size:13px;margin-top:8px">' + escHtml(data.error || 'Failed') + '</p>';
      }
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('chatSendBtn').addEventListener('click', sendChat);
document.getElementById('chatInput').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });

function sendChat() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text) return;
  apiFetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text, from: 'CEO' }) })
    .then(function(r){ return r.json(); }).then(function() {
      input.value = '';
      loadChat();
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
}

document.addEventListener('click', function(e) {
  var copyBtn = e.target.closest('.btn-copy');
  if (copyBtn) {
    var targetId = copyBtn.getAttribute('data-target');
    var el = document.getElementById(targetId);
    if (el) {
      var text = el.textContent.replace('Copy', '').trim();
      navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
      });
    }
    return;
  }

  var ssDel = e.target.closest('[data-ss-delete]');
  if (ssDel) {
    var fname = ssDel.getAttribute('data-ss-delete');
    if (!confirm('Delete shared space file: ' + fname + '?')) return;
    apiFetch('/api/sharedspace/' + encodeURIComponent(fname), { method: 'DELETE' })
      .then(function(r){ return r.json(); }).then(function() {
        showToast('Deleted: ' + fname, 'success'); loadSharedspace();
      }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
    return;
  }
});

var ssWriteVisible = false;
document.getElementById('ssWriteBtn').addEventListener('click', function() {
  var fname = document.getElementById('ssNewFile').value.trim();
  if (!fname) { showToast('Enter a filename', 'error'); return; }
  ssWriteVisible = !ssWriteVisible;
  document.getElementById('ssWriteArea').style.display = ssWriteVisible ? '' : 'none';
});

document.getElementById('ssMkdirBtn').addEventListener('click', function() {
  var fname = document.getElementById('ssNewFile').value.trim();
  if (!fname) { showToast('Enter a folder name', 'error'); return; }
  apiFetch('/api/sharedspace/mkdir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: fname }) })
    .then(function(r){ return r.json(); }).then(function(d) {
      if (d.ok) { showToast('Folder created: ' + fname, 'success'); document.getElementById('ssNewFile').value = ''; loadSharedspace(); }
      else showToast('Error: ' + (d.error || 'Failed'), 'error');
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('ssSaveBtn').addEventListener('click', function() {
  var fname = document.getElementById('ssNewFile').value.trim();
  var content = document.getElementById('ssContent').value;
  if (!fname) { showToast('Enter a filename', 'error'); return; }
  apiFetch('/api/sharedspace/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: fname, content: content }) })
    .then(function(r){ return r.json(); }).then(function(d) {
      if (d.ok) {
        showToast('Saved: ' + fname, 'success');
        document.getElementById('ssNewFile').value = '';
        document.getElementById('ssContent').value = '';
        document.getElementById('ssWriteArea').style.display = 'none';
        ssWriteVisible = false;
        loadSharedspace();
      } else showToast('Error: ' + (d.error || 'Failed'), 'error');
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('ssCancelBtn').addEventListener('click', function() {
  document.getElementById('ssWriteArea').style.display = 'none';
  ssWriteVisible = false;
});

function refresh() { loadKeys(); loadWorkers(); loadExchange(); loadSharedspace(); loadChat(); }
document.getElementById('refreshBtn').addEventListener('click', refresh);
refresh();
setInterval(refresh, 10000);
