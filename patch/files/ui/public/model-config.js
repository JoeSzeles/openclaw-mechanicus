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
    var ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!r.ok) {
      if (ct.indexOf('json') === -1) throw new Error('API not available (HTTP ' + r.status + ')');
    }
    if (ct.indexOf('json') === -1 && ct.indexOf('javascript') === -1) {
      throw new Error('API not available — endpoint returned non-JSON response');
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
    if (target === 'neural-learning') { loadNeuralFeedback(); loadEngramList(); loadDimensionConfig(); }
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
    var igCards = ['streamingCard'];
    var msg = '<p style="color:#8b949e">IG Trading API not available.</p><p style="color:#6e7681;font-size:12px;margin-top:8px">If running vanilla <code>openclaw gateway</code>, use <code>.\\start-mechanicus.ps1</code> to enable IG features.</p>';
    for (var ci = 0; ci < igCards.length; ci++) {
      var el = document.getElementById(igCards[ci]);
      if (el) el.innerHTML = msg;
    }
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
    if (prof.hasCredentials) {
      if (apiKeyEl) apiKeyEl.placeholder = prof.apiKey + ' (leave empty to keep)';
      if (usernameEl) usernameEl.placeholder = prof.username + ' (leave empty to keep)';
      if (passwordEl) passwordEl.placeholder = '******** (leave empty to keep)';
    } else {
      if (apiKeyEl) apiKeyEl.placeholder = 'Enter API key';
      if (usernameEl) usernameEl.placeholder = 'Enter username';
      if (passwordEl) passwordEl.placeholder = 'Enter password';
    }
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
  renderSessionStatus(config.session);
}

function connectLiveStreaming() {
  var btn = document.getElementById('liveStreamBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }
  apiFetch('/api/ig/stream/connect-live', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.ok) { loadIgConfig(); }
      else { alert('Failed: ' + (data.error || 'Unknown error')); loadIgConfig(); }
    })
    .catch(function(e) { alert('Error: ' + e.message); loadIgConfig(); });
}

function disconnectLiveStreaming() {
  apiFetch('/api/ig/stream/disconnect-live', { method: 'POST' })
    .then(function() { loadIgConfig(); })
    .catch(function(e) { alert('Error: ' + e.message); loadIgConfig(); });
}

function renderStreamingStatus(streaming) {
  if (!streaming) {
    document.getElementById('streamingCard').innerHTML = '<p class="empty">Streaming info not available</p>';
    return;
  }
  var isLive = streaming.liveStreamingActive;
  var dotClass = 'grey';
  var label = streaming.status || 'unknown';
  if (streaming.status === 'connected') dotClass = 'green';
  else if (streaming.status === 'reconnecting') dotClass = 'yellow';
  else if (streaming.status === 'error') dotClass = 'red';

  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<span class="status-dot ' + dotClass + '"></span>';
  html += '<span style="font-size:14px;font-weight:500;color:#e6edf3">Lightstreamer: ' + escHtml(label.toUpperCase()) + '</span>';
  if (streaming.status === 'connected') {
    if (isLive) html += ' <span class="badge" style="background:#1a7f37;color:#fff;font-weight:600">LIVE STREAMING</span>';
    else html += ' <span class="badge badge-primary">STREAMING</span>';
  } else if (streaming.status === 'reconnecting' || streaming.reconnectPending) {
    html += ' <span class="badge badge-warn">RECONNECTING' + (streaming.reconnectAttempts ? ' (' + streaming.reconnectAttempts + ')' : '') + '</span>';
  } else {
    html += ' <span class="badge badge-warn">POLLING</span>';
  }
  html += '</div>';

  html += '<div class="streaming-info">';
  if (streaming.streamingSource) html += '<div class="streaming-stat">Source: <strong>' + escHtml(streaming.streamingSource.toUpperCase()) + '</strong></div>';
  html += '<div class="streaming-stat">Instruments: <strong>' + (streaming.connectedEpics ? streaming.connectedEpics.length : 0) + '</strong></div>';
  html += '<div class="streaming-stat">Price updates: <strong>' + (streaming.priceCount || 0) + '</strong></div>';
  html += '</div>';

  if (streaming.reconnectAttempts > 0 && streaming.status !== 'connected') {
    html += '<div style="margin-top:8px;font-size:12px;color:#d29922">Reconnect attempt ' + streaming.reconnectAttempts + (streaming.reconnectPending ? ' (pending)' : '') + '</div>';
  }

  html += '<div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  if (isLive) {
    html += '<button id="liveStreamBtn" class="btn btn-sm" style="background:#da3633;border-color:#da3633;color:#fff">Disconnect Live Streaming</button>';
  } else {
    html += '<button id="liveStreamBtn" class="btn btn-sm" style="background:#1a7f37;border-color:#1a7f37;color:#fff">Connect to Live Streaming</button>';
  }
  if (streaming.status !== 'connected') {
    html += '<button id="forceReconnectBtn" class="btn btn-sm" style="background:#1f6feb;border-color:#1f6feb;color:#fff">Force Reconnect</button>';
  }
  html += '</div>';

  if (streaming.connectedEpics && streaming.connectedEpics.length > 0) {
    html += '<div style="margin-top:12px;font-size:12px;color:#8b949e">';
    html += '<strong>Subscribed:</strong> ' + streaming.connectedEpics.map(function(e) { return escHtml(e); }).join(', ');
    html += '</div>';
  }

  document.getElementById('streamingCard').innerHTML = html;

  var btn = document.getElementById('liveStreamBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      if (isLive) disconnectLiveStreaming();
      else connectLiveStreaming();
    });
  }
  var reconnBtn = document.getElementById('forceReconnectBtn');
  if (reconnBtn) {
    reconnBtn.addEventListener('click', function() {
      reconnBtn.disabled = true;
      reconnBtn.textContent = 'Reconnecting...';
      fetch('/api/ig/session/refresh', { method: 'POST', headers: { 'Authorization': 'Bearer ' + (window.gatewayToken || '') } })
        .then(function() { setTimeout(loadIgConfig, 2000); })
        .catch(function() { setTimeout(loadIgConfig, 2000); });
    });
  }
}

function renderSessionStatus(session) {
  var el = document.getElementById('sessionCard');
  if (!el) return;
  if (!session) {
    el.innerHTML = '<p class="empty">Session info not available</p>';
    return;
  }
  var dotClass = 'grey';
  var label = session.status || 'unknown';
  if (session.status === 'connected') dotClass = 'green';
  else if (session.status === 'connecting') dotClass = 'yellow';
  else if (session.status === 'error') dotClass = 'red';
  else if (session.status === 'not_configured') dotClass = 'grey';

  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<span class="status-dot ' + dotClass + '"></span>';
  html += '<span style="font-size:14px;font-weight:500;color:#e6edf3">IG Session: ' + escHtml(label.toUpperCase()) + '</span>';
  if (session.status === 'connected') html += ' <span class="badge badge-primary">AUTHENTICATED</span>';
  else if (session.status === 'error') html += ' <span class="badge badge-error">FAILED</span>';
  else if (session.status === 'not_configured') html += ' <span class="badge badge-warn">NO CREDENTIALS</span>';
  html += '</div>';

  if (session.error) {
    html += '<div style="color:#f85149;font-size:13px;margin-bottom:12px">' + escHtml(session.error) + '</div>';
  }

  html += '<div class="streaming-info">';
  if (session.profile) html += '<div class="streaming-stat">Profile: <strong>' + escHtml(session.profile.toUpperCase()) + '</strong></div>';
  if (session.sessionAge != null) html += '<div class="streaming-stat">Session age: <strong>' + session.sessionAge + 's</strong></div>';
  if (session.ttlRemaining != null) html += '<div class="streaming-stat">TTL remaining: <strong>' + session.ttlRemaining + 's</strong></div>';
  if (session.lastRefresh) html += '<div class="streaming-stat">Last refresh: <strong>' + new Date(session.lastRefresh).toLocaleTimeString() + '</strong></div>';
  html += '</div>';

  html += '<div class="btn-row"><button class="btn btn-secondary" id="btnRefreshSession">Force Refresh Session</button></div>';
  el.innerHTML = html;

  document.getElementById('btnRefreshSession').addEventListener('click', function() {
    this.disabled = true;
    this.textContent = 'Refreshing...';
    apiFetch('/api/ig/session/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.ok) {
        showToast('Session refreshed — connected to ' + (data.profile || 'IG').toUpperCase(), 'success');
      } else {
        showToast('Session refresh failed: ' + (data.error || 'Unknown error'), 'error');
      }
      loadIgConfig();
    }).catch(function(e) {
      showToast('Error: ' + e.message, 'error');
      loadIgConfig();
    });
  });
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

function testConnection(profileName) {
  var btn = document.getElementById('btnTest' + profileName.charAt(0).toUpperCase() + profileName.slice(1));
  if (btn) { btn.disabled = true; btn.textContent = 'Testing...'; }
  var resultId = profileName + '-test-result';
  var existing = document.getElementById(resultId);
  if (existing) existing.remove();

  apiFetch('/api/ig/config/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: profileName })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (btn) { btn.disabled = false; btn.textContent = 'Test Connection'; }
    var card = document.getElementById(profileName + 'ProfileCard');
    var resultDiv = document.createElement('div');
    resultDiv.id = resultId;
    resultDiv.style.cssText = 'margin-top:12px;padding:12px;border-radius:6px;font-size:13px;';

    if (data.ok) {
      resultDiv.style.background = 'rgba(35,134,54,.15)';
      resultDiv.style.border = '1px solid rgba(63,185,80,.3)';
      resultDiv.style.color = '#3fb950';
      var html = '<strong>Connection successful</strong>';
      if (data.account) {
        var a = data.account;
        var cur = a.currency || '';
        html += '<div style="margin-top:8px;color:#c9d1d9;display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">';
        html += '<span style="color:#8b949e">Account:</span><span style="font-family:monospace">' + escHtml(a.accountId || '') + (a.accountName ? ' (' + escHtml(a.accountName) + ')' : '') + '</span>';
        html += '<span style="color:#8b949e">Balance:</span><span style="font-family:monospace;color:#e6edf3;font-weight:600">' + cur + ' ' + (a.balance != null ? a.balance.toLocaleString() : '?') + '</span>';
        html += '<span style="color:#8b949e">Available:</span><span style="font-family:monospace">' + cur + ' ' + (a.available != null ? a.available.toLocaleString() : '?') + '</span>';
        html += '<span style="color:#8b949e">P&L:</span><span style="font-family:monospace;color:' + (a.profitLoss != null ? (a.profitLoss >= 0 ? '#3fb950' : '#f85149') : '#8b949e') + '">' + cur + ' ' + (a.profitLoss != null ? (a.profitLoss >= 0 ? '+' : '') + a.profitLoss.toLocaleString() : '?') + '</span>';
        html += '<span style="color:#8b949e">Margin used:</span><span style="font-family:monospace">' + cur + ' ' + (a.deposit != null ? a.deposit.toLocaleString() : '?') + '</span>';
        html += '</div>';
      }
      resultDiv.innerHTML = html;
      showToast(profileName.toUpperCase() + ' connected — balance loaded', 'success');
    } else {
      var et = data.errorType || 'unknown';
      if (et === 'server_unavailable') {
        resultDiv.style.background = 'rgba(210,153,34,.1)';
        resultDiv.style.border = '1px solid rgba(210,153,34,.3)';
        resultDiv.style.color = '#d29922';
        resultDiv.innerHTML = '<strong>Server unavailable (HTTP ' + (data.statusCode || '?') + ')</strong><div style="margin-top:6px;color:#c9d1d9;font-size:13px">' + escHtml(data.error) + '</div><div style="margin-top:6px;color:#8b949e;font-size:12px">This is NOT a credentials error. IG is likely blocking this server\'s cloud IP. Your credentials may be fine — try from a local machine to confirm.</div>';
        showToast(profileName.toUpperCase() + ': server blocked (not a creds issue)', 'error');
      } else if (et === 'bad_credentials' || et === 'auth_rejected') {
        resultDiv.style.background = 'rgba(248,81,73,.1)';
        resultDiv.style.border = '1px solid rgba(248,81,73,.3)';
        resultDiv.style.color = '#f85149';
        resultDiv.innerHTML = '<strong>Authentication failed (HTTP ' + (data.statusCode || '?') + ')</strong><div style="margin-top:6px;color:#c9d1d9;font-size:13px">' + escHtml(data.error) + '</div><div style="margin-top:6px;color:#8b949e;font-size:12px">Check your API key, username, and password for the ' + profileName + ' profile.</div>';
        showToast(profileName.toUpperCase() + ': bad credentials', 'error');
      } else if (et === 'rate_limited') {
        resultDiv.style.background = 'rgba(210,153,34,.1)';
        resultDiv.style.border = '1px solid rgba(210,153,34,.3)';
        resultDiv.style.color = '#d29922';
        resultDiv.innerHTML = '<strong>Rate limited</strong><div style="margin-top:6px;color:#c9d1d9;font-size:13px">' + escHtml(data.error) + '</div>';
        showToast(profileName.toUpperCase() + ': rate limited, wait and retry', 'error');
      } else {
        resultDiv.style.background = 'rgba(248,81,73,.1)';
        resultDiv.style.border = '1px solid rgba(248,81,73,.3)';
        resultDiv.style.color = '#f85149';
        resultDiv.innerHTML = '<strong>Connection failed' + (data.statusCode ? ' (HTTP ' + data.statusCode + ')' : '') + ':</strong> ' + escHtml(data.error || 'Unknown error');
        showToast(profileName.toUpperCase() + ' connection failed', 'error');
      }
    }
    if (card) card.appendChild(resultDiv);
  }).catch(function(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Test Connection'; }
    showToast('Error: ' + e.message, 'error');
  });
}

document.getElementById('btnSaveDemo').addEventListener('click', function() { saveProfile('demo'); });
document.getElementById('btnTestDemo').addEventListener('click', function() { testConnection('demo'); });
document.getElementById('btnSaveLive').addEventListener('click', function() { saveProfile('live'); });
document.getElementById('btnTestLive').addEventListener('click', function() { testConnection('live'); });

var _nfRefreshTimer = null;

function loadNeuralFeedback() {
  if (_nfRefreshTimer) clearInterval(_nfRefreshTimer);
  Promise.all([
    apiFetch('/api/neural-feedback/status').then(function(r) { return r.json(); }).catch(function() { return null; }),
    apiFetch('/api/neural-feedback/history?limit=20').then(function(r) { return r.json(); }).catch(function() { return null; }),
    apiFetch('/api/neural-feedback/patterns').then(function(r) { return r.json(); }).catch(function() { return null; })
  ]).then(function(results) {
    renderNfStatus(results[0]);
    renderNfSentiment(results[0]);
    renderNfAgentPatterns(results[2]);
    renderNfHistory(results[1]);
  }).catch(function(e) {
    document.getElementById('nfStatusCard').innerHTML = '<p class="empty">Neural feedback not available: ' + escHtml(e.message) + '</p>';
  });
  _nfRefreshTimer = setInterval(function() {
    var tab = document.querySelector('.tab[data-tab="neural-learning"]');
    if (tab && tab.classList.contains('active')) loadNeuralFeedback();
    else { clearInterval(_nfRefreshTimer); _nfRefreshTimer = null; }
  }, 30000);
}

function renderNfStatus(status) {
  var el = document.getElementById('nfStatusCard');
  if (!status) { el.innerHTML = '<p class="empty">Neural feedback system not available</p>'; return; }
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">';
  html += '<div><div style="font-size:24px;font-weight:700;color:#e6edf3">' + (status.total || 0) + '</div><div style="font-size:12px;color:#8b949e">Total Interactions</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:#3fb950">' + (status.positive || 0) + '</div><div style="font-size:12px;color:#8b949e">Positive (Sugar)</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:#f85149">' + (status.negative || 0) + '</div><div style="font-size:12px;color:#8b949e">Negative (Pain)</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:#8b949e">' + (status.neutral || 0) + '</div><div style="font-size:12px;color:#8b949e">Neutral</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:#58a6ff">' + (status.memorySize || 0) + '</div><div style="font-size:12px;color:#8b949e">In Memory</div></div>';
  html += '</div>';
  if (status.lastFeedback) {
    var ts = status.lastFeedback.timestamp ? new Date(status.lastFeedback.timestamp).toLocaleString() : 'unknown';
    html += '<div style="margin-top:12px;font-size:12px;color:#8b949e">Last feedback: ' + escHtml(ts) + ' (' + escHtml(status.lastFeedback.sentiment || '?') + ')</div>';
  }
  html += '<div style="margin-top:8px"><span class="badge ' + (status.dbConfigured ? 'badge-primary' : 'badge-warn') + '">' + (status.dbConfigured ? 'DB Connected' : 'File-only mode') + '</span></div>';
  el.innerHTML = html;
}

function renderNfSentiment(status) {
  var el = document.getElementById('nfSentimentCard');
  if (!status || !status.total) { el.innerHTML = '<div class="card" style="flex:1"><p class="empty">No data yet — interact with agents to start training</p></div>'; return; }
  var total = status.total || 1;
  var pPct = Math.round((status.positive || 0) / total * 100);
  var nPct = Math.round((status.negative || 0) / total * 100);
  var uPct = 100 - pPct - nPct;

  var html = '<div class="card" style="flex:1;min-width:200px">';
  html += '<div class="card-title">Sentiment Distribution</div>';
  html += '<div style="display:flex;height:24px;border-radius:4px;overflow:hidden;margin:8px 0">';
  if (pPct > 0) html += '<div style="width:' + pPct + '%;background:#238636" title="Positive ' + pPct + '%"></div>';
  if (nPct > 0) html += '<div style="width:' + nPct + '%;background:#da3633" title="Negative ' + nPct + '%"></div>';
  if (uPct > 0) html += '<div style="width:' + uPct + '%;background:#30363d" title="Neutral ' + uPct + '%"></div>';
  html += '</div>';
  html += '<div style="display:flex;gap:16px;font-size:12px;color:#8b949e">';
  html += '<span style="color:#3fb950">Positive ' + pPct + '%</span>';
  html += '<span style="color:#f85149">Negative ' + nPct + '%</span>';
  html += '<span>Neutral ' + uPct + '%</span>';
  html += '</div></div>';

  html += '<div class="card" style="flex:1;min-width:200px">';
  html += '<div class="card-title">Learning Quality</div>';
  var ratio = status.positive && status.negative ? (status.positive / status.negative).toFixed(1) : (status.positive ? 'all positive' : (status.negative ? 'all negative' : 'n/a'));
  html += '<div class="card-row"><span class="card-label">Pos/Neg ratio:</span><span class="card-value">' + ratio + '</span></div>';
  html += '<div class="card-row"><span class="card-label">Data richness:</span><span class="card-value">' + (total >= 50 ? 'Good' : total >= 10 ? 'Building up' : 'Low — keep interacting') + '</span></div>';
  html += '</div>';

  el.innerHTML = html;
}

function renderNfAgentPatterns(patterns) {
  var el = document.getElementById('nfAgentPatterns');
  if (!patterns || !patterns.totalAnalyzed) { el.innerHTML = '<p class="empty">No agent patterns yet</p>'; return; }
  var agents = patterns.byAgent || {};
  var keys = Object.keys(agents);
  if (!keys.length) { el.innerHTML = '<p class="empty">No per-agent data</p>'; return; }

  var html = '<table><tr><th>Agent</th><th>Interactions</th><th>Positive</th><th>Negative</th><th>Trend</th></tr>';
  keys.sort(function(a, b) { return (agents[b].total || 0) - (agents[a].total || 0); });
  for (var i = 0; i < keys.length; i++) {
    var a = agents[keys[i]];
    var t = a.total || 0;
    var p = a.positive || 0;
    var n = a.negative || 0;
    var trend = p > n ? 'Liked' : p < n ? 'Disliked' : 'Neutral';
    var trendColor = p > n ? '#3fb950' : p < n ? '#f85149' : '#8b949e';
    html += '<tr><td style="font-weight:500;color:#e6edf3">' + escHtml(keys[i]) + '</td>';
    html += '<td>' + t + '</td>';
    html += '<td style="color:#3fb950">' + p + '</td>';
    html += '<td style="color:#f85149">' + n + '</td>';
    html += '<td style="color:' + trendColor + ';font-weight:500">' + trend + '</td></tr>';
  }
  html += '</table>';

  var fp = patterns.featurePatterns || {};
  var fKeys = Object.keys(fp);
  if (fKeys.length) {
    html += '<div style="margin-top:16px"><div class="card-title" style="margin-bottom:8px">Feature Patterns (liked responses tend to have...)</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    for (var fi = 0; fi < fKeys.length; fi++) {
      var fv = fp[fKeys[fi]];
      if (typeof fv === 'object' && fv.avgPositive != null) {
        var diff = (fv.avgPositive || 0) - (fv.avgNegative || 0);
        if (Math.abs(diff) > 0.1) {
          var dir = diff > 0 ? 'Higher' : 'Lower';
          var col = diff > 0 ? '#3fb950' : '#f85149';
          html += '<span class="badge" style="background:rgba(255,255,255,.05);color:' + col + ';border:1px solid ' + col + '30">' + escHtml(fKeys[fi]) + ': ' + dir + '</span>';
        }
      }
    }
    html += '</div></div>';
  }

  el.innerHTML = html;
}

function renderNfHistory(history) {
  var el = document.getElementById('nfHistory');
  if (!history || !history.records || !history.records.length) { el.innerHTML = '<p class="empty">No interactions recorded yet</p>'; return; }
  var records = history.records;

  var html = '<table><tr><th>Time</th><th>Agent</th><th>Sentiment</th><th>Brain Signal</th><th>Text</th></tr>';
  for (var i = 0; i < records.length && i < 20; i++) {
    var r = records[i];
    var ts = r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '?';
    var sentColor = r.sentiment === 'positive' ? '#3fb950' : r.sentiment === 'negative' ? '#f85149' : '#8b949e';
    var sentLabel = r.sentiment === 'positive' ? 'Sugar' : r.sentiment === 'negative' ? 'Pain' : 'Neutral';

    var brainSig = '';
    if (r.brainResponse) {
      var br = r.brainResponse;
      if (br.buy_signal || br.sell_signal || br.hold_signal) {
        var signals = [];
        if (br.buy_signal) signals.push('B:' + br.buy_signal);
        if (br.sell_signal) signals.push('S:' + br.sell_signal);
        if (br.hold_signal) signals.push('H:' + br.hold_signal);
        brainSig = signals.join(' ');
      } else { brainSig = '-'; }
    } else { brainSig = '-'; }

    var text = (r.rawText || '').slice(0, 60);
    if ((r.rawText || '').length > 60) text += '...';

    html += '<tr>';
    html += '<td style="white-space:nowrap">' + escHtml(ts) + '</td>';
    html += '<td>' + escHtml(r.agentId || '?') + '</td>';
    html += '<td style="color:' + sentColor + ';font-weight:500">' + sentLabel + '</td>';
    html += '<td style="font-family:monospace;font-size:11px">' + escHtml(brainSig) + '</td>';
    html += '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + escHtml(r.rawText || '') + '">' + escHtml(text) + '</td>';
    html += '</tr>';
  }
  html += '</table>';
  if (history.total > 20) html += '<div style="margin-top:8px;font-size:12px;color:#8b949e">Showing 20 of ' + history.total + ' interactions</div>';
  el.innerHTML = html;
}

document.getElementById('btnNfSync').addEventListener('click', function() {
  if (!confirm('Sync DB & File?\n\nThis will merge records between database and local file using timestamp-normalized deduplication. No records will be duplicated.')) return;
  this.disabled = true; this.textContent = 'Syncing...';
  var btn = this;
  apiFetch('/api/neural-feedback/sync', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false; btn.textContent = 'Sync DB & File';
      if (data.ok) { showToast('Neural feedback synced (total: ' + (data.stats ? data.stats.total : '?') + ')', 'success'); loadNeuralFeedback(); }
      else showToast('Sync failed', 'error');
    }).catch(function(e) { btn.disabled = false; btn.textContent = 'Sync DB & File'; showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('btnNfReplay').addEventListener('click', function() {
  this.disabled = true; this.textContent = 'Running Dry Run...';
  var btn = this;
  apiFetch('/api/neural-feedback/replay', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({dryRun: true}) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false; btn.textContent = 'Replay Preferences (Dry Run)';
      var preview = document.getElementById('replayPreview');
      var content = document.getElementById('replayPreviewContent');
      var html = '<strong>Replay Preview (DRY RUN - no changes made)</strong><br>';
      html += 'Total interactions: ' + (data.total || 0) + '<br>';
      html += 'Sugar (positive): <span style="color:#2ecc71">' + (data.sugar || 0) + '</span> | ';
      html += 'Pain (negative): <span style="color:#e74c3c">' + (data.pain || 0) + '</span> | ';
      html += 'Neutral (skipped): ' + (data.neutralSkipped || 0) + '<br>';
      if (data.preview && data.preview.length > 0) {
        html += '<br><strong>Last ' + data.preview.length + ' records:</strong><br>';
        html += '<div style="max-height:150px;overflow-y:auto;font-size:12px;margin-top:4px">';
        data.preview.forEach(function(p) {
          var color = p.feedback === 'sugar' ? '#2ecc71' : '#e74c3c';
          html += '<div style="padding:2px 0"><span style="color:' + color + '">' + p.feedback + '</span> - ' + (p.rawText || '(no text)').substring(0,60) + '</div>';
        });
        html += '</div>';
      }
      content.innerHTML = html;
      preview.style.display = 'block';
    }).catch(function(e) { btn.disabled = false; btn.textContent = 'Replay Preferences (Dry Run)'; showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('btnReplayConfirm').addEventListener('click', function() {
  if (!confirm('WARNING: This will stimulate the brain with all recorded preferences.\n\nAn engram backup will be created automatically before replay.\n\nProceed?')) return;
  this.disabled = true; this.textContent = 'Replaying...';
  var btn = this;
  apiFetch('/api/neural-feedback/replay', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({dryRun: false}) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false; btn.textContent = 'Confirm Replay (Modifies Brain)';
      document.getElementById('replayPreview').style.display = 'none';
      showToast('Replayed ' + (data.replayed || 0) + ' interactions. Engram backup id: ' + (data.engramBackupId || 'N/A'), 'success');
      loadEngramList();
    }).catch(function(e) { btn.disabled = false; btn.textContent = 'Confirm Replay (Modifies Brain)'; showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('btnReplayCancel').addEventListener('click', function() {
  document.getElementById('replayPreview').style.display = 'none';
});

function loadEngramList() {
  apiFetch('/api/engram/list?brainType=trading')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var el = document.getElementById('engramList');
      if (!data.backups || data.backups.length === 0) { el.innerHTML = '<p class="empty">No engram backups yet</p>'; return; }
      var html = '<table style="width:100%;font-size:13px;border-collapse:collapse"><tr style="text-align:left;border-bottom:1px solid #333"><th style="padding:4px">Label</th><th>Steps</th><th>Synapses</th><th>Date</th><th></th></tr>';
      data.backups.forEach(function(b) {
        var date = new Date(b.created_at).toLocaleString();
        html += '<tr style="border-bottom:1px solid #222"><td style="padding:4px">' + b.label + '</td><td>' + (b.step_count || 0) + '</td><td>' + (b.synapse_count || 0) + '</td><td>' + date + '</td>';
        html += '<td><button class="btn btn-secondary" style="font-size:11px;padding:2px 8px" onclick="restoreEngram(' + b.id + ',\'' + b.label.replace(/'/g,"\\'") + '\')">Restore</button></td></tr>';
      });
      html += '</table>';
      el.innerHTML = html;
    }).catch(function() { document.getElementById('engramList').innerHTML = '<p class="empty">Failed to load</p>'; });
}

window.restoreEngram = function(id, label) {
  if (!confirm('Restore engram backup "' + label + '"?\n\nThis will overwrite current brain weights with the saved snapshot. The current state will NOT be backed up automatically.\n\nCreate a backup first if needed.')) return;
  apiFetch('/api/engram/restore', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id: id}) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.restored) showToast('Engram restored: ' + label, 'success');
      else showToast('Restore failed: ' + (data.error || 'unknown'), 'error');
    }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
};

document.getElementById('btnEngramBackup').addEventListener('click', function() {
  var label = prompt('Engram backup label:', 'manual-' + new Date().toISOString().slice(0,19));
  if (!label) return;
  this.disabled = true; this.textContent = 'Creating...';
  var btn = this;
  apiFetch('/api/engram/backup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({label: label, brainType: 'trading'}) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false; btn.textContent = 'Create Engram Backup';
      if (data.id) { showToast('Engram backup created (id=' + data.id + ')', 'success'); loadEngramList(); }
      else showToast('Backup failed: ' + (data.error || 'unknown'), 'error');
    }).catch(function(e) { btn.disabled = false; btn.textContent = 'Create Engram Backup'; showToast('Error: ' + e.message, 'error'); });
});

document.getElementById('btnEngramRefresh').addEventListener('click', function() {
  loadEngramList();
  showToast('Engram list refreshed', 'success');
});

document.getElementById('btnNfRefresh').addEventListener('click', function() {
  loadNeuralFeedback();
  showToast('Neural feedback refreshed', 'success');
});

function loadDimensionConfig() {
  apiFetch('/api/dimensions')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var el = document.getElementById('dimensionConfig');
      var summary = document.getElementById('dimensionSummary');
      if (!data.dimensions || data.dimensions.length === 0) { el.innerHTML = '<p class="empty">No dimensions available</p>'; return; }
      var categories = {};
      data.dimensions.forEach(function(d) {
        if (!categories[d.category]) categories[d.category] = [];
        categories[d.category].push(d);
      });
      var html = '';
      var catOrder = ['content', 'behavior', 'style', 'personality', 'identity', 'performance'];
      catOrder.forEach(function(cat) {
        var dims = categories[cat];
        if (!dims) return;
        html += '<div style="margin-bottom:10px"><strong style="text-transform:capitalize;font-size:12px;color:#e2b714">' + cat + '</strong>';
        dims.forEach(function(d) {
          var checked = d.enabled ? ' checked' : '';
          html += '<div style="display:flex;align-items:center;padding:4px 0;gap:8px">';
          html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;flex:1;font-size:13px">';
          html += '<input type="checkbox" data-dim-key="' + d.key + '"' + checked + ' style="cursor:pointer">';
          html += '<span>' + d.label + '</span>';
          html += '</label>';
          html += '<span style="font-size:11px;color:#8b949e;flex:1">' + d.description + '</span>';
          html += '</div>';
        });
        html += '</div>';
      });
      el.innerHTML = html;
      summary.textContent = data.enabledCount + ' of ' + data.totalCount + ' dimensions active (\u2248' + (data.enabledCount <= 30 ? 'OK' : 'WARNING: >30 may thin neuron allocation') + ')';
      el.querySelectorAll('input[data-dim-key]').forEach(function(cb) {
        cb.addEventListener('change', function() {
          var key = this.getAttribute('data-dim-key');
          var enabled = this.checked;
          apiFetch('/api/dimensions/toggle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({key: key, enabled: enabled}) })
            .then(function(r) { return r.json(); })
            .then(function(result) {
              if (result.ok) { showToast(key + ' ' + (enabled ? 'enabled' : 'disabled'), 'success'); loadDimensionConfig(); }
              else showToast('Failed: ' + (result.error || 'unknown'), 'error');
            }).catch(function(e) { showToast('Error: ' + e.message, 'error'); });
        });
      });
    }).catch(function() { document.getElementById('dimensionConfig').innerHTML = '<p class="empty">Failed to load</p>'; });
}

function switchNlSubTab(tab) {
  var tabs = document.querySelectorAll('.nl-sub-tab');
  var contents = document.querySelectorAll('.nl-sub-content');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].style.color = '#8b949e';
    tabs[i].style.borderBottom = '2px solid transparent';
  }
  for (var i = 0; i < contents.length; i++) contents[i].style.display = 'none';
  var btn = document.querySelector('.nl-sub-tab[data-nltab="' + tab + '"]');
  if (btn) { btn.style.color = '#bc8cff'; btn.style.borderBottom = '2px solid #bc8cff'; }
  var el = document.getElementById('nl-' + tab);
  if (el) el.style.display = 'block';
  if (tab === 'brain-config') cbRefreshStatus();
  if (tab === 'dimensions') loadDimensionConfig();
  if (tab === 'engrams') loadEngramList();
}
window.switchNlSubTab = switchNlSubTab;

function cbAddLog(msg) {
  var el = document.getElementById('cb-log');
  if (!el) return;
  var ts = new Date().toLocaleTimeString();
  var line = document.createElement('div');
  line.textContent = '[' + ts + '] ' + msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function cbFetchBrainStatus(type) {
  var url = type === 'agent' ? '/api/agent-brain/status' : '/api/brain/status';
  return apiFetch(url).then(function(r) { return r.json(); }).catch(function() { return null; });
}

function cbRefreshStatus() {
  cbAddLog('Refreshing brain status...');
  cbFetchBrainStatus('agent').then(function(data) {
    var indicator = document.getElementById('cb-agent-indicator');
    var status = document.getElementById('cb-agent-status');
    if (data && data.running) {
      indicator.style.background = 'rgba(35,134,54,.3)'; indicator.style.color = '#3fb950';
      status.textContent = 'Running (step ' + (data.step_count || 0) + ')';
      status.style.color = '#3fb950';
      document.getElementById('cb-agent-sensory').textContent = (data.regions && data.regions.sensory) || '--';
      document.getElementById('cb-agent-inter').textContent = (data.regions && data.regions.inter) || '--';
      document.getElementById('cb-agent-motor').textContent = (data.regions && data.regions.motor) || '--';
      document.getElementById('cb-agent-synapses').textContent = (data.synapses_count || 0).toLocaleString();
      document.getElementById('cb-agent-steps').textContent = (data.step_count || 0).toLocaleString();
      document.getElementById('cb-agent-patterns').textContent = data.patterns || 0;
      document.getElementById('cb-agent-instance').textContent = data.instance_id || 'agent';
      var total = (data.regions ? data.regions.sensory + data.regions.inter + data.regions.motor : 0);
      document.getElementById('cb-arch-badge-agent').textContent = total.toLocaleString() + ' neurons';
      if (data.feedback_formula) {
        document.getElementById('cb-agent-sugar-mod').textContent = data.feedback_formula.sugar_modifier;
        document.getElementById('cb-agent-pain-mod').textContent = data.feedback_formula.pain_modifier;
        document.getElementById('cb-agent-wclamp').textContent = data.feedback_formula.w_clamp;
        document.getElementById('cb-agent-refsyn').textContent = data.feedback_formula.ref_synapses;
      }
      cbRenderSensory('agent', data.sensory_assignments);
      cbRenderMB('agent', data.mushroom_body);
      cbRenderMotors('agent', data.regions, data.motor_regions);
      cbAddLog('Agent brain: ' + total + ' neurons, ' + (data.synapses_count || 0) + ' synapses, step ' + (data.step_count || 0));
    } else {
      indicator.style.background = '#21262d'; indicator.style.color = '#8b949e';
      status.textContent = 'Not running'; status.style.color = '#f85149';
      cbAddLog('Agent brain: not running');
    }
  });
  cbFetchBrainStatus('trading').then(function(data) {
    var indicator = document.getElementById('cb-trading-indicator');
    var status = document.getElementById('cb-trading-status');
    if (data && data.running) {
      indicator.style.background = 'rgba(56,139,253,.2)'; indicator.style.color = '#58a6ff';
      status.textContent = 'Running (step ' + (data.step_count || 0) + ')';
      status.style.color = '#3fb950';
      document.getElementById('cb-trading-sensory').textContent = (data.regions && data.regions.sensory) || '--';
      document.getElementById('cb-trading-inter').textContent = (data.regions && data.regions.inter) || '--';
      document.getElementById('cb-trading-motor').textContent = (data.regions && data.regions.motor) || '--';
      document.getElementById('cb-trading-synapses').textContent = (data.synapses_count || 0).toLocaleString();
      document.getElementById('cb-trading-steps').textContent = (data.step_count || 0).toLocaleString();
      document.getElementById('cb-trading-patterns').textContent = data.patterns || 0;
      document.getElementById('cb-trading-instance').textContent = data.instance_id || 'trading';
      var total = (data.regions ? data.regions.sensory + data.regions.inter + data.regions.motor : 0);
      document.getElementById('cb-arch-badge-trading').textContent = total.toLocaleString() + ' neurons';
      if (data.feedback_formula) {
        document.getElementById('cb-trading-sugar-mod').textContent = data.feedback_formula.sugar_modifier;
        document.getElementById('cb-trading-pain-mod').textContent = data.feedback_formula.pain_modifier;
        document.getElementById('cb-trading-wclamp').textContent = data.feedback_formula.w_clamp;
        document.getElementById('cb-trading-refsyn').textContent = data.feedback_formula.ref_synapses;
      }
      cbRenderSensory('trading', data.sensory_assignments);
      cbRenderMB('trading', data.mushroom_body);
      cbRenderMotors('trading', data.regions, data.motor_regions);
      cbAddLog('Trading brain: ' + total + ' neurons, ' + (data.synapses_count || 0) + ' synapses, step ' + (data.step_count || 0));
    } else {
      indicator.style.background = '#21262d'; indicator.style.color = '#8b949e';
      status.textContent = 'Not running'; status.style.color = '#f85149';
      cbAddLog('Trading brain: not running');
    }
  });
}
window.cbRefreshStatus = cbRefreshStatus;

function cbRenderSensory(type, assignments) {
  var el = document.getElementById('cb-' + type + '-sensory-table');
  if (!el || !assignments) { if (el) el.innerHTML = '<p class="empty">No data</p>'; return; }
  var tradingColors = { price_up: '#f85149', price_down: '#2dc653', volume: '#79c0ff', spread: '#d29922', momentum: '#bc8cff', antenna: '#ff7b72', preference: '#e2b714' };
  var agentColors = { content_features: '#79c0ff', behavior_features: '#bc8cff', style_features: '#e2b714', personality_features: '#f97583', identity_features: '#3fb950', meta_features: '#8b949e' };
  var colors = type === 'agent' ? agentColors : tradingColors;
  var html = '<div style="display:grid;grid-template-columns:110px 50px 50px 1fr;gap:4px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid #21262d;font-weight:600;color:#8b949e;font-size:10px"><span>Zone</span><span>Start</span><span>Count</span><span>Description</span></div>';
  for (var key in assignments) {
    var a = assignments[key];
    var c = colors[key] || '#8b949e';
    var desc = a.desc || key.replace(/_/g, ' ');
    html += '<div style="display:grid;grid-template-columns:110px 50px 50px 1fr;gap:4px;margin-bottom:3px;align-items:center">';
    html += '<span style="color:' + c + ';font-weight:600;font-size:11px;text-transform:capitalize">' + key.replace(/_/g, ' ') + '</span>';
    html += '<span style="color:#c9d1d9;font-size:11px">' + (a.start != null ? a.start : '--') + '</span>';
    html += '<span style="color:#c9d1d9;font-size:11px">' + (a.count || '--') + '</span>';
    html += '<span style="color:#8b949e;font-size:10px">' + desc + '</span>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function cbRenderMB(type, mb) {
  var el = document.getElementById('cb-' + type + '-mb');
  if (!el) return;
  if (!mb) { el.innerHTML = '<p class="empty">No mushroom body data</p>'; return; }
  var html = '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:12px;color:#c9d1d9">';
  html += '<span style="color:' + (mb.enabled !== false ? '#3fb950' : '#f85149') + ';font-weight:600">' + (mb.enabled !== false ? 'Enabled' : 'Disabled') + '</span>';
  html += '</div>';
  html += '<div style="padding:6px;background:#0d1117;border:1px solid #21262d;border-radius:4px;font-size:11px">';
  html += '<div style="display:flex;justify-content:space-between"><span style="color:#8b949e">Size:</span><span style="color:#bc8cff">' + (mb.size_pct || mb.sizePct || '--') + '%</span></div>';
  html += '<div style="display:flex;justify-content:space-between"><span style="color:#8b949e">Connectivity:</span><span style="color:#bc8cff">' + (mb.connectivity || '--') + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between"><span style="color:#8b949e">Neurons:</span><span style="color:#bc8cff">' + (mb.count || '--') + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between"><span style="color:#8b949e">Range:</span><span style="color:#bc8cff">' + (mb.range || '--') + '</span></div>';
  html += '</div>';
  el.innerHTML = html;
}

function cbRenderMotors(type, regions, motorRegions) {
  var el = document.getElementById('cb-' + type + '-motors');
  if (!el || !regions) return;
  var motorTotal = regions.motor || 0;
  var html = '';
  if (motorRegions) {
    var motorColors = { reinforce: '#3fb950', adjust: '#d29922', explore: '#bc8cff', buy: '#2dc653', sell: '#f85149', hold: '#d29922' };
    for (var key in motorRegions) {
      var mr = motorRegions[key];
      var c = motorColors[key] || '#8b949e';
      var desc = mr.desc ? '<div style="color:#8b949e;font-size:10px;margin-top:2px">' + mr.desc + '</div>' : '';
      html += '<div style="padding:8px;background:#0d1117;border:1px solid ' + c + ';border-radius:4px;text-align:center"><div style="color:' + c + ';font-weight:600;font-size:13px">' + key.toUpperCase() + '</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + (mr.count || 0) + ' neurons</div>' + desc + '</div>';
    }
  } else {
    var third = Math.floor(motorTotal / 3);
    var rem = motorTotal - third * 3;
    if (type === 'agent') {
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #3fb950;border-radius:4px;text-align:center"><div style="color:#3fb950;font-weight:600;font-size:13px">REINFORCE</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + (third + (rem > 0 ? 1 : 0)) + ' neurons</div></div>';
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #d29922;border-radius:4px;text-align:center"><div style="color:#d29922;font-weight:600;font-size:13px">ADJUST</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + (third + (rem > 1 ? 1 : 0)) + ' neurons</div></div>';
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #bc8cff;border-radius:4px;text-align:center"><div style="color:#bc8cff;font-weight:600;font-size:13px">EXPLORE</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + third + ' neurons</div></div>';
    } else {
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #2dc653;border-radius:4px;text-align:center"><div style="color:#2dc653;font-weight:600;font-size:13px">BUY</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + (third + (rem > 0 ? 1 : 0)) + ' neurons</div></div>';
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #f85149;border-radius:4px;text-align:center"><div style="color:#f85149;font-weight:600;font-size:13px">SELL</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + (third + (rem > 1 ? 1 : 0)) + ' neurons</div></div>';
      html += '<div style="padding:8px;background:#0d1117;border:1px solid #d29922;border-radius:4px;text-align:center"><div style="color:#d29922;font-weight:600;font-size:13px">HOLD</div><div style="color:#c9d1d9;font-size:12px;font-weight:600">' + third + ' neurons</div></div>';
    }
  }
  el.innerHTML = html;
}

window.cbBootBrain = function(type) {
  var url = type === 'agent' ? '/api/agent-brain/boot' : '/api/brain/boot';
  cbAddLog('Booting ' + type + ' brain...');
  apiFetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      cbAddLog(type + ' brain booted: ' + (data.neurons_count || data.total || '?') + ' neurons');
      showToast(type + ' brain booted', 'success');
      setTimeout(cbRefreshStatus, 500);
    }).catch(function(e) { cbAddLog('Boot failed: ' + e.message); showToast('Boot failed: ' + e.message, 'error'); });
};

window.cbSaveState = function(type) {
  var url = type === 'agent' ? '/api/agent-brain/save' : '/api/brain/save';
  apiFetch(url, { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function() { cbAddLog(type + ' brain state saved'); showToast(type + ' state saved', 'success'); })
    .catch(function(e) { showToast('Save failed: ' + e.message, 'error'); });
};

loadConfig();
loadIgConfig();
