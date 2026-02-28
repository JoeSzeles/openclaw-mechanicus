var TOKEN = '';
try {
  var s = localStorage.getItem('openclaw.control.settings.v1');
  if (s) { var obj = JSON.parse(s); TOKEN = obj.token || ''; }
} catch(e) {}
if (!TOKEN) {
  try { var m = document.cookie.match(/openclaw_token=([^;]+)/); if (m) TOKEN = m[1]; } catch(e) {}
}

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  setTimeout(function(){ t.className = 'toast'; }, 3000);
}

function apiFetch(url, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN;
  return fetch(url, opts).then(function(r) {
    if (r.status === 401) {
      showToast('Authentication failed — please hard-refresh (Ctrl+Shift+R)', 'error');
      throw new Error('Unauthorized (401) — token may be stale, hard-refresh the page');
    }
    return r;
  });
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

var tabs = document.querySelectorAll('.tab');
var tabContents = document.querySelectorAll('.tab-content');
for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', function() {
    var target = this.getAttribute('data-tab');
    for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
    for (var j = 0; j < tabContents.length; j++) tabContents[j].classList.remove('active');
    this.classList.add('active');
    document.getElementById('tab-' + target).classList.add('active');
    if (target === 'ig-trading') loadIgConfig();
  });
}

function loadConfig() {
  apiFetch('/__openclaw/control-ui-config.json').then(function(r) {
    if (!r.ok) throw new Error('Config not available (status ' + r.status + ')');
    return r.json();
  }).then(function(config) {
    renderConfig(config);
  }).catch(function(e) {
    document.getElementById('currentModel').innerHTML = '<div class="card"><p style="color:#8b949e">Could not load config: ' + escHtml(e.message) + '</p><p style="color:#8b949e;font-size:12px;margin-top:8px">The model configuration is managed via openclaw.json in the .openclaw directory.</p></div>';
    document.getElementById('providerList').innerHTML = '';
    document.getElementById('modelList').innerHTML = '';
    document.getElementById('rawConfig').innerHTML = '<div class="card"><pre style="font-size:12px;color:#8b949e;white-space:pre-wrap">Config endpoint not available. Edit .openclaw/openclaw.json directly to change model settings.</pre></div>';
  });
}

function renderConfig(config) {
  var agentModel = config.agentModel || config.model || 'Not set';
  var agentId = config.agentId || config.defaultAgentId || 'main';

  var currentHtml = '<div class="card">';
  currentHtml += '<div class="card-row"><span class="card-label">Agent ID:</span><span class="card-value">' + escHtml(agentId) + '</span></div>';
  currentHtml += '<div class="card-row"><span class="card-label">Model:</span><span class="card-value">' + escHtml(agentModel) + '</span> <span class="badge badge-primary">PRIMARY</span></div>';
  if (config.assistantName) currentHtml += '<div class="card-row"><span class="card-label">Assistant:</span><span class="card-value">' + escHtml(config.assistantName) + '</span></div>';
  currentHtml += '</div>';
  document.getElementById('currentModel').innerHTML = currentHtml;

  var providers = config.providers || [];
  if (providers.length) {
    var pHtml = '';
    for (var i = 0; i < providers.length; i++) {
      var p = providers[i];
      pHtml += '<div class="card">';
      pHtml += '<div class="card-title">' + escHtml(p.name || p.id || 'Provider ' + (i+1)) + '</div>';
      pHtml += '<div class="card-row"><span class="card-label">Base URL:</span><span class="card-value">' + escHtml(p.baseUrl || p.baseURL || 'default') + '</span></div>';
      pHtml += '<div class="card-row"><span class="card-label">API Type:</span><span class="card-value">' + escHtml(p.apiType || p.type || 'openai') + '</span></div>';
      pHtml += '<div class="card-row"><span class="card-label">API Key:</span><span class="card-value">' + (p.apiKey ? escHtml(p.apiKey.slice(0,8)) + '...' : 'env var') + '</span></div>';
      pHtml += '</div>';
    }
    document.getElementById('providerList').innerHTML = pHtml;
  } else {
    document.getElementById('providerList').innerHTML = '<p class="empty">No providers in bootstrap config. Providers are configured in openclaw.json agent settings.</p>';
  }

  var models = config.models || [];
  if (models.length) {
    var mHtml = '<table><tr><th>Model</th><th>Provider</th><th>Type</th></tr>';
    for (var j = 0; j < models.length; j++) {
      var md = models[j];
      var name = typeof md === 'string' ? md : (md.name || md.id || md.model || '?');
      var prov = typeof md === 'object' ? (md.provider || '-') : '-';
      var mtype = typeof md === 'object' ? (md.type || '-') : '-';
      mHtml += '<tr><td style="font-weight:500;color:#e6edf3">' + escHtml(name) + '</td>';
      mHtml += '<td>' + escHtml(prov) + '</td>';
      mHtml += '<td>' + escHtml(mtype) + '</td></tr>';
    }
    mHtml += '</table>';
    document.getElementById('modelList').innerHTML = mHtml;
  } else {
    document.getElementById('modelList').innerHTML = '<p class="empty">No model list in bootstrap config.</p>';
  }

  var raw = JSON.stringify(config, null, 2);
  document.getElementById('rawConfig').innerHTML = '<div class="card"><pre style="font-size:12px;color:#c9d1d9;white-space:pre-wrap;max-height:400px;overflow:auto">' + escHtml(raw) + '</pre></div>';
}

var currentIgConfig = null;

function loadIgConfig() {
  apiFetch('/api/ig/config').then(function(r) {
    if (!r.ok) throw new Error('IG config not available');
    return r.json();
  }).then(function(config) {
    currentIgConfig = config;
    renderIgConfig(config);
  }).catch(function(e) {
    document.getElementById('streamingCard').innerHTML = '<p style="color:#8b949e">Could not load IG config: ' + escHtml(e.message) + '</p>';
  });
}

function renderIgConfig(config) {
  var active = config.activeProfile || 'demo';
  var toggle = document.getElementById('profileToggle');
  var slider = toggle.querySelector('.toggle-slider');
  var options = toggle.querySelectorAll('.toggle-option');

  slider.className = 'toggle-slider ' + active;
  for (var i = 0; i < options.length; i++) {
    var prof = options[i].getAttribute('data-profile');
    if (prof === active) options[i].classList.add('active');
    else options[i].classList.remove('active');
  }

  var statusEl = document.getElementById('profileStatus');
  if (active === 'demo') {
    statusEl.innerHTML = '<span class="badge badge-warn">DEMO MODE</span>';
  } else {
    statusEl.innerHTML = '<span class="badge badge-error">LIVE TRADING</span>';
  }

  var profiles = ['demo', 'live'];
  for (var p = 0; p < profiles.length; p++) {
    var key = profiles[p];
    var prof = config.profiles[key];
    if (!prof) continue;
    var apiKeyEl = document.getElementById(key + '-apiKey');
    var usernameEl = document.getElementById(key + '-username');
    var passwordEl = document.getElementById(key + '-password');
    var accountIdEl = document.getElementById(key + '-accountId');
    if (apiKeyEl) apiKeyEl.placeholder = prof.hasCredentials ? prof.apiKey : 'Enter API key';
    if (usernameEl) usernameEl.placeholder = prof.hasCredentials ? prof.username : 'Enter username';
    if (passwordEl) passwordEl.placeholder = prof.hasCredentials ? '********' : 'Enter password';
    if (accountIdEl) accountIdEl.value = prof.accountId || '';
    apiKeyEl.value = '';
    usernameEl.value = '';
    passwordEl.value = '';
  }

  var activeCard = document.getElementById(active + 'ProfileCard');
  var inactiveCard = document.getElementById((active === 'demo' ? 'live' : 'demo') + 'ProfileCard');
  if (activeCard) activeCard.style.borderColor = active === 'demo' ? '#d29922' : '#da3633';
  if (inactiveCard) inactiveCard.style.borderColor = '#30363d';

  renderStreamingStatus(config.streaming);
}

function renderStreamingStatus(streaming) {
  if (!streaming) {
    document.getElementById('streamingCard').innerHTML = '<p class="empty">Streaming info not available</p>';
    return;
  }
  var dotClass = 'grey';
  var label = streaming.status || 'unknown';
  if (streaming.status === 'connected') dotClass = 'green';
  else if (streaming.status === 'reconnecting') dotClass = 'yellow';
  else if (streaming.status === 'error') dotClass = 'red';

  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<span class="status-dot ' + dotClass + '"></span>';
  html += '<span style="font-size:14px;font-weight:500;color:#e6edf3">Lightstreamer: ' + escHtml(label.toUpperCase()) + '</span>';
  if (streaming.status === 'connected') html += ' <span class="badge badge-primary">STREAMING</span>';
  else html += ' <span class="badge badge-warn">POLLING</span>';
  html += '</div>';

  html += '<div class="streaming-info">';
  html += '<div class="streaming-stat">Instruments: <strong>' + (streaming.connectedEpics ? streaming.connectedEpics.length : 0) + '</strong></div>';
  html += '<div class="streaming-stat">Price updates: <strong>' + (streaming.priceCount || 0) + '</strong></div>';
  html += '</div>';

  if (streaming.connectedEpics && streaming.connectedEpics.length > 0) {
    html += '<div style="margin-top:12px;font-size:12px;color:#8b949e">';
    html += '<strong>Subscribed:</strong> ' + streaming.connectedEpics.map(function(e) { return escHtml(e); }).join(', ');
    html += '</div>';
  }

  document.getElementById('streamingCard').innerHTML = html;
}

document.getElementById('profileToggle').addEventListener('click', function(e) {
  var option = e.target.closest('.toggle-option');
  if (!option) return;
  var newProfile = option.getAttribute('data-profile');
  if (!newProfile || (currentIgConfig && currentIgConfig.activeProfile === newProfile)) return;

  if (newProfile === 'live') {
    if (!confirm('Switch to LIVE trading? Real money will be at risk.')) return;
  }

  apiFetch('/api/ig/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activeProfile: newProfile })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.ok) {
      showToast('Switched to ' + newProfile.toUpperCase() + ' profile', 'success');
      loadIgConfig();
    } else {
      showToast('Failed to switch: ' + (data.error || 'Unknown error'), 'error');
    }
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
  });
});

function saveProfile(profileName) {
  var updates = {};
  var apiKey = document.getElementById(profileName + '-apiKey').value.trim();
  var username = document.getElementById(profileName + '-username').value.trim();
  var password = document.getElementById(profileName + '-password').value.trim();
  var accountId = document.getElementById(profileName + '-accountId').value.trim();

  if (apiKey) updates.apiKey = apiKey;
  if (username) updates.username = username;
  if (password) updates.password = password;

  var origAccountId = currentIgConfig && currentIgConfig.profiles[profileName] ? currentIgConfig.profiles[profileName].accountId : '';
  if (accountId && accountId !== origAccountId) updates.accountId = accountId;

  if (Object.keys(updates).length === 0) {
    showToast('No changes to save — fill in the fields you want to update', 'error');
    return;
  }

  var body = { profiles: {} };
  body.profiles[profileName] = updates;

  apiFetch('/api/ig/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.ok) {
      showToast(profileName.toUpperCase() + ' credentials saved', 'success');
      loadIgConfig();
    } else {
      showToast('Failed to save: ' + (data.error || 'Unknown error'), 'error');
    }
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
  });
}

function testConnection() {
  showToast('Testing connection...', 'success');
  apiFetch('/api/ig/config/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.ok) {
      showToast('Connection successful! Profile: ' + data.profile + (data.lightstreamerEndpoint ? ', Streaming: ' + data.lightstreamerEndpoint : ''), 'success');
      loadIgConfig();
    } else {
      showToast('Connection failed: ' + (data.error || 'Unknown error'), 'error');
    }
  }).catch(function(e) {
    showToast('Error: ' + e.message, 'error');
  });
}

document.getElementById('btnSaveDemo').addEventListener('click', function() { saveProfile('demo'); });
document.getElementById('btnTestDemo').addEventListener('click', function() { testConnection(); });
document.getElementById('btnSaveLive').addEventListener('click', function() { saveProfile('live'); });
document.getElementById('btnTestLive').addEventListener('click', function() { testConnection(); });

loadConfig();
loadIgConfig();
