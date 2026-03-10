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
function apiFetch(url, opts) {
  opts = opts || {}; opts.headers = opts.headers || {};
  if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN;
  return fetch(url, opts).then(function(r) {
    var ct = (r.headers.get('content-type') || '');
    if (!r.ok && ct.indexOf('json') === -1) throw new Error('API not available (HTTP ' + r.status + ')');
    if (ct.indexOf('json') === -1 && ct.indexOf('javascript') === -1 && ct.indexOf('octet') === -1) throw new Error('API not available — endpoint returned non-JSON');
    return r;
  });
}
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
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
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
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
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
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
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
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
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
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
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

var wsCurrentAgent = '';
var wsAgents = [];
var wsLoaded = false;
var wsExpandedFolders = {};

function loadWorkspaceAgents(force) {
  if (wsLoaded && !force) return;
  apiFetch('/api/workspace/agents').then(function(r){ return r.json(); }).then(function(data) {
    wsAgents = data.agents || [];
    var tabsEl = document.getElementById('wsAgentTabs');
    if (!wsAgents.length) { tabsEl.innerHTML = '<span class="empty">No agent workspaces found</span>'; return; }
    if (!wsCurrentAgent || !wsAgents.find(function(a){ return a.id === wsCurrentAgent; })) {
      wsCurrentAgent = wsAgents[0].id;
    }
    var html = '';
    for (var i = 0; i < wsAgents.length; i++) {
      var a = wsAgents[i];
      var active = a.id === wsCurrentAgent;
      html += '<button class="btn-secondary ws-agent-tab" data-agent="' + escHtml(a.id) + '" style="' +
        (active ? 'background:#238636;color:#fff;border-color:#238636' : '') + '">' + escHtml(a.name) + '</button>';
    }
    tabsEl.innerHTML = html;
    loadWorkspaceFiles();
    wsLoaded = true;
  }).catch(function(e) {
    document.getElementById('wsAgentTabs').innerHTML = '<span class="empty" style="color:#f85149">Error: ' + e.message + '</span>';
  });
}

function buildTree(files) {
  var root = { children: {}, files: [] };
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (f.isDir) continue;
    var parts = f.name.split('/');
    var node = root;
    for (var j = 0; j < parts.length - 1; j++) {
      var dirName = parts[j];
      if (!node.children[dirName]) {
        var dirPath = parts.slice(0, j + 1).join('/');
        node.children[dirName] = { children: {}, files: [], path: dirPath };
      }
      node = node.children[dirName];
    }
    node.files.push(f);
  }
  return root;
}

function renderTree(node, depth) {
  var html = '';
  var indent = depth * 20;
  var dirNames = Object.keys(node.children).sort();
  for (var d = 0; d < dirNames.length; d++) {
    var dirName = dirNames[d];
    var child = node.children[dirName];
    var expanded = wsExpandedFolders[wsCurrentAgent + ':' + child.path];
    var arrow = expanded ? '▼' : '▶';
    html += '<div class="ws-folder" style="padding-left:' + (12 + indent) + 'px;cursor:pointer;user-select:none" data-ws-toggle="' + escHtml(child.path) + '">';
    html += '<span style="color:#8b949e;font-size:11px;margin-right:4px">' + arrow + '</span>';
    html += '<span class="ss-file-name">📁 ' + escHtml(dirName) + '</span>';
    html += '<div class="ss-file-actions" style="margin-left:auto">';
    html += '<button data-ws-delete="' + escHtml(child.path) + '" data-ws-agent="' + escHtml(wsCurrentAgent) + '" style="font-size:10px;padding:1px 6px">Delete</button>';
    html += '</div>';
    html += '</div>';
    if (expanded) {
      html += '<div class="ws-folder-contents">';
      html += renderTree(child, depth + 1);
      html += '</div>';
    }
  }
  var sortedFiles = node.files.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });
  for (var fi = 0; fi < sortedFiles.length; fi++) {
    var f = sortedFiles[fi];
    var fileName = f.name.split('/').pop();
    html += '<div class="ss-file" style="padding-left:' + (12 + indent) + 'px">';
    html += '<span class="ss-file-name">📄 ' + escHtml(fileName) + '</span>';
    html += '<span class="ss-file-size">' + formatSize(f.size) + '</span>';
    html += '<div class="ss-file-actions">';
    html += '<a href="/api/workspace/' + encodeURIComponent(wsCurrentAgent) + '/download/' + encodeURIComponent(f.name) + '" download>Download</a>';
    html += '<button data-ws-delete="' + escHtml(f.name) + '" data-ws-agent="' + escHtml(wsCurrentAgent) + '">Delete</button>';
    html += '</div>';
    html += '</div>';
  }
  return html;
}

function loadWorkspaceFiles() {
  var el = document.getElementById('wsFileList');
  if (!wsCurrentAgent) { el.innerHTML = '<p class="empty">Select an agent</p>'; return; }
  if (!el.innerHTML || el.innerHTML.indexOf('empty') !== -1) {
    el.innerHTML = '<p class="empty">Loading...</p>';
  }
  apiFetch('/api/workspace/' + encodeURIComponent(wsCurrentAgent)).then(function(r){ return r.json(); }).then(function(data) {
    var files = data.files || [];
    if (!files.length) { el.innerHTML = '<p class="empty">Workspace is empty</p>'; return; }
    var tree = buildTree(files);
    var html = renderTree(tree, 0);
    el.innerHTML = html;
  }).catch(function(e) {
    el.innerHTML = e.message.indexOf('API not available') !== -1
      ? '<p class="empty" style="color:#8b949e">This feature requires the CEO proxy. Run <code>.\\start-mechanicus.ps1</code> to enable.</p>'
      : '<p class="empty" style="color:#f85149">' + escHtml(e.message) + '</p>';
  });
}

document.getElementById('wsAgentTabs').addEventListener('click', function(e) {
  var btn = e.target.closest('.ws-agent-tab');
  if (!btn) return;
  wsCurrentAgent = btn.getAttribute('data-agent');
  wsLoaded = false;
  loadWorkspaceAgents(true);
});

document.getElementById('wsFileList').addEventListener('click', function(e) {
  var toggle = e.target.closest('[data-ws-toggle]');
  if (toggle) {
    var folderPath = toggle.getAttribute('data-ws-toggle');
    var key = wsCurrentAgent + ':' + folderPath;
    wsExpandedFolders[key] = !wsExpandedFolders[key];
    loadWorkspaceFiles();
  }
});

function wsUploadFiles(fileList, stripPrefix) {
  if (!wsCurrentAgent || !fileList.length) return;
  var statusEl = document.getElementById('wsUploadStatus');
  var total = fileList.length;
  var done = 0;
  var failed = 0;
  statusEl.textContent = 'Uploading 0/' + total + '...';

  var batch = [];
  var batchSize = 0;
  var maxBatch = 4 * 1024 * 1024;

  function sendBatch(items) {
    return apiFetch('/api/workspace/' + encodeURIComponent(wsCurrentAgent) + '/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    }).then(function(r){ return r.json(); }).then(function(d) {
      done += items.length;
      if (d.results) {
        for (var j = 0; j < d.results.length; j++) {
          if (d.results[j].error) failed++;
        }
      }
      statusEl.textContent = 'Uploaded ' + done + '/' + total + (failed ? ' (' + failed + ' failed)' : '') + '...';
    });
  }

  function processFile(idx) {
    if (idx >= fileList.length) {
      if (batch.length) {
        return sendBatch(batch).then(function() {
          statusEl.textContent = 'Done: ' + done + '/' + total + (failed ? ' (' + failed + ' failed)' : '');
          showToast('Uploaded ' + (total - failed) + ' file(s)', failed ? 'error' : 'success');
          loadWorkspaceFiles();
        });
      }
      statusEl.textContent = 'Done: ' + done + '/' + total + (failed ? ' (' + failed + ' failed)' : '');
      showToast('Uploaded ' + (total - failed) + ' file(s)', failed ? 'error' : 'success');
      loadWorkspaceFiles();
      return;
    }
    var file = fileList[idx];
    var filePath = file.webkitRelativePath || file.name;
    if (stripPrefix && filePath.indexOf('/') > 0) {
      filePath = filePath.substring(filePath.indexOf('/') + 1);
    }
    var reader = new FileReader();
    reader.onload = function() {
      var b64 = reader.result.split(',')[1] || '';
      var item = { path: filePath, content: b64, encoding: 'base64' };
      var itemSize = b64.length;
      if (batchSize + itemSize > maxBatch && batch.length > 0) {
        sendBatch(batch).then(function() {
          batch = [item];
          batchSize = itemSize;
          processFile(idx + 1);
        });
      } else {
        batch.push(item);
        batchSize += itemSize;
        processFile(idx + 1);
      }
    };
    reader.onerror = function() { failed++; done++; processFile(idx + 1); };
    reader.readAsDataURL(file);
  }

  processFile(0);
}

document.getElementById('wsFileInput').addEventListener('change', function(e) {
  var files = e.target.files;
  if (files && files.length) wsUploadFiles(Array.from(files), false);
  e.target.value = '';
});

document.getElementById('wsFolderInput').addEventListener('change', function(e) {
  var files = e.target.files;
  if (files && files.length) wsUploadFiles(Array.from(files), false);
  e.target.value = '';
});

document.addEventListener('click', function(e) {
  var wsDelBtn = e.target.closest('[data-ws-delete]');
  if (wsDelBtn) {
    var fname = wsDelBtn.getAttribute('data-ws-delete');
    var agent = wsDelBtn.getAttribute('data-ws-agent');
    if (!confirm('Delete ' + fname + ' from ' + agent + ' workspace?')) return;
    apiFetch('/api/workspace/' + encodeURIComponent(agent) + '/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fname })
    }).then(function(r){ return r.json(); }).then(function() {
      showToast('Deleted: ' + fname, 'success');
      loadWorkspaceFiles();
    }).catch(function(err) { showToast('Error: ' + err.message, 'error'); });
    return;
  }
});

function refresh() { loadKeys(); loadWorkers(); loadExchange(); loadSharedspace(); loadChat(); }
function refreshAll() { refresh(); loadWorkspaceAgents(true); }
document.getElementById('refreshBtn').addEventListener('click', refreshAll);
loadWorkspaceAgents(false);
refresh();
setInterval(refresh, 10000);
