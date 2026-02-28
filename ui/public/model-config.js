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
  return fetch(url, opts);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

loadConfig();
