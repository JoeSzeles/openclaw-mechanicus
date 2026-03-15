(function() {
  var _brainPollTimer = null;
  var _brainPopupOpen = false;
  var _graphData = null;
  var _activityPollTimer = null;
  var _lastActivityTs = Date.now();
  var _seenActivityIds = {};

  function inject() {
    if (document.getElementById('openclaw-nav')) return;
    var port = location.port;
    var isCeoProxy = (port === '5000' || port === '5001');
    var isReplit = location.hostname.indexOf('replit') !== -1 || location.hostname.indexOf('repl.co') !== -1;
    var base = location.protocol + '//' + location.host;
    var configHref = '/model-config.html';
    var workersHref = '/workers.html';
    var processesHref = '/processes.html';
    var mainHref = '/index.html';
    var dashHref = '/';
    if (!isCeoProxy && !isReplit) {
      configHref = base + '/model-config.html';
      workersHref = base + '/workers.html';
      processesHref = base + '/processes.html';
      mainHref = base + '/';
      dashHref = base + '/';
    }
    var nav = document.createElement('div');
    nav.id = 'openclaw-nav';
    nav.innerHTML = '<div class="ocn-links">'
      + '<a href="' + mainHref + '">Main App</a>'
      + '<a href="' + dashHref + '">Dashboard</a>'
      + '<a href="/__openclaw__/canvas/ig-dashboard.html">IG Trading</a>'
      + '<a href="/__openclaw__/canvas/ig-dashboard.html?tab=clawscript">IG-ClawScript</a>'
      + '<a href="/__openclaw__/canvas/">Canvas</a>'
      + '<a href="/__openclaw__/canvas/clawscript-editor.html">Code</a>'
      + '<a href="' + configHref + '">Config</a>'
      + '<a href="' + workersHref + '">Workers</a>'
      + '<a href="' + processesHref + '">Processes</a>'
      + '</div>'
      + '<div id="ocn-brain-pill" class="ocn-brain-pill" title="Agent Brain Status">'
      + '<span id="ocn-brain-dot" class="ocn-brain-dot"></span>'
      + '<span id="ocn-brain-label">Brain</span>'
      + '</div>';
    var style = document.createElement('style');
    style.textContent = '#openclaw-nav{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;height:36px;font-family:sans-serif}#openclaw-nav .ocn-links{display:flex;align-items:center;gap:2px}#openclaw-nav a{color:#8b949e;text-decoration:none;font-size:13px;padding:5px 12px}body{padding-top:36px !important}'
      + '.ocn-brain-pill{display:flex;align-items:center;gap:6px;padding:3px 10px;margin-left:12px;border-radius:14px;cursor:pointer;font-size:12px;font-weight:600;color:#bc8cff;background:rgba(188,140,255,.08);border:1px solid rgba(188,140,255,.2);transition:all .2s;user-select:none}'
      + '.ocn-brain-pill:hover{background:rgba(188,140,255,.15);border-color:rgba(188,140,255,.4)}'
      + '.ocn-brain-dot{width:7px;height:7px;border-radius:50%;background:#484f58;transition:background .3s}'
      + '.ocn-brain-dot.active{background:#3fb950;box-shadow:0 0 4px #3fb950}'
      + '.ocn-brain-dot.error{background:#f85149}'
      + '#ocn-brain-popup{display:none;position:fixed;top:44px;right:16px;width:520px;height:580px;background:#0d1117;border:1px solid #30363d;border-radius:10px;z-index:2147483648;box-shadow:0 8px 32px rgba(0,0,0,.6);overflow:hidden;font-family:sans-serif}'
      + '#ocn-brain-popup .bp-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#161b22;border-bottom:1px solid #30363d}'
      + '#ocn-brain-popup .bp-title{font-size:13px;font-weight:700;color:#bc8cff}'
      + '#ocn-brain-popup .bp-close{cursor:pointer;color:#8b949e;font-size:18px;line-height:1;padding:2px 6px;border-radius:4px}#ocn-brain-popup .bp-close:hover{background:#30363d;color:#e6edf3}'
      + '#ocn-brain-popup .bp-stats{display:flex;gap:12px;padding:8px 14px;border-bottom:1px solid #21262d;font-size:11px;color:#8b949e;flex-wrap:wrap}'
      + '#ocn-brain-popup .bp-stat-val{color:#e6edf3;font-weight:600;font-family:monospace}'
      + '#ocn-brain-popup .bp-canvas-wrap{position:relative;height:calc(100% - 210px);background:#080c14}'
      + '#ocn-brain-popup canvas{width:100%;height:100%}'
      + '.bp-motor-bar{display:flex;gap:4px;padding:6px 14px;border-top:1px solid #21262d;font-size:10px}'
      + '.bp-motor-item{flex:1;text-align:center;padding:3px 0;border-radius:4px;font-weight:600}'
      + '.bp-log{height:100px;overflow-y:auto;padding:6px 14px;border-top:1px solid #21262d;font-family:monospace;font-size:10px;color:#8b949e;background:#0d1117}'
      + '.bp-log-entry{padding:1px 0}.bp-log-sugar{color:#3fb950}.bp-log-pain{color:#f85149}.bp-log-info{color:#bc8cff}';
    document.head.appendChild(style);
    document.documentElement.appendChild(nav);

    var popup = document.createElement('div');
    popup.id = 'ocn-brain-popup';
    popup.innerHTML = '<div class="bp-header"><span class="bp-title">Agent Brain — Neural Activity</span><span class="bp-close" id="ocn-bp-close">×</span></div>'
      + '<div class="bp-stats" id="ocn-bp-stats"></div>'
      + '<div class="bp-canvas-wrap"><canvas id="ocn-bp-canvas"></canvas></div>'
      + '<div class="bp-motor-bar" id="ocn-bp-motors"></div>'
      + '<div id="ocn-bp-log" class="bp-log"></div>';
    document.body.appendChild(popup);

    document.getElementById('ocn-brain-pill').addEventListener('click', function() {
      _brainPopupOpen = !_brainPopupOpen;
      document.getElementById('ocn-brain-popup').style.display = _brainPopupOpen ? 'block' : 'none';
      if (_brainPopupOpen) { refreshBrainPopup(); startBrainViz(); startActivityPoll(); }
      else { stopBrainViz(); stopActivityPoll(); }
    });
    document.getElementById('ocn-bp-close').addEventListener('click', function(e) {
      e.stopPropagation();
      _brainPopupOpen = false;
      document.getElementById('ocn-brain-popup').style.display = 'none';
      stopBrainViz();
      stopActivityPoll();
    });

    pollBrainStatus();
    _brainPollTimer = setInterval(pollBrainStatus, 10000);
  }

  function getToken() {
    try { var s = localStorage.getItem('openclaw.control.settings.v1'); if (s) { var o = JSON.parse(s); return o.token || ''; } } catch(e) {}
    try { var m = document.cookie.match(/openclaw_token=([^;]+)/); if (m) return m[1]; } catch(e) {}
    return '';
  }

  function brainFetch(url) {
    var opts = { headers: {} };
    var t = getToken();
    if (t) opts.headers['Authorization'] = 'Bearer ' + t;
    return fetch(url, opts).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; });
  }

  function pollBrainStatus() {
    brainFetch('/api/agent-brain/status').then(function(data) {
      var dot = document.getElementById('ocn-brain-dot');
      var label = document.getElementById('ocn-brain-label');
      if (!dot || !label) return;
      if (data && data.running) {
        dot.className = 'ocn-brain-dot active';
        var total = data.neurons_count || 0;
        label.textContent = (total >= 1000 ? Math.round(total/1000) + 'K' : total) + ' Brain';
      } else {
        dot.className = 'ocn-brain-dot error';
        label.textContent = 'Brain Off';
      }
    });
  }

  function refreshBrainPopup() {
    brainFetch('/api/agent-brain/status').then(function(data) {
      if (!data) return;
      var statsEl = document.getElementById('ocn-bp-stats');
      var motorsEl = document.getElementById('ocn-bp-motors');
      if (!statsEl) return;
      var n = data.neurons_count || 0;
      var syn = data.synapses_count || 0;
      var step = data.step_count || 0;
      var r = data.regions || {};
      statsEl.innerHTML = '<span>Neurons: <span class="bp-stat-val">' + n.toLocaleString() + '</span></span>'
        + '<span>Synapses: <span class="bp-stat-val">' + syn.toLocaleString() + '</span></span>'
        + '<span>Steps: <span class="bp-stat-val">' + step.toLocaleString() + '</span></span>'
        + '<span>S:<span class="bp-stat-val" style="color:#f85149">' + (r.sensory||0) + '</span> I:<span class="bp-stat-val" style="color:#2dc653">' + (r.inter||0) + '</span> M:<span class="bp-stat-val" style="color:#bc8cff">' + (r.motor||0) + '</span></span>';
      var mr = data.motor_rates || {};
      var colors = { reinforce: '#3fb950', adjust: '#d29922', explore: '#bc8cff' };
      var mHtml = '';
      ['reinforce', 'adjust', 'explore'].forEach(function(k) {
        var val = mr[k + '_signal'] || 0;
        var c = colors[k];
        mHtml += '<div class="bp-motor-item" style="background:' + c + '15;color:' + c + '">' + k.toUpperCase() + ' ' + val + ' Hz</div>';
      });
      motorsEl.innerHTML = mHtml;
      _graphData = {
        sensory: r.sensory || 0,
        inter: r.inter || 0,
        motor: r.motor || 0,
        total: n,
        synapses: syn,
        sensoryAssignments: data.sensory_assignments || {},
        motorRegions: data.motor_regions || {},
        mushroomBody: data.mushroom_body || {}
      };
    });
  }

  var _vizAnimFrame = null;
  var _vizNodes = [];
  var _vizEdges = [];
  var _vizInited = false;

  function startBrainViz() {
    if (!_graphData) { setTimeout(startBrainViz, 300); return; }
    initVizData();
    _vizInited = true;
    renderViz();
  }

  function stopBrainViz() {
    if (_vizAnimFrame) { cancelAnimationFrame(_vizAnimFrame); _vizAnimFrame = null; }
    _vizInited = false;
  }

  function initVizData() {
    _vizNodes = [];
    _vizEdges = [];
    var gd = _graphData;
    var sampleS = Math.min(gd.sensory, 30);
    var sampleI = Math.min(gd.inter, 60);
    var sampleM = Math.min(gd.motor, 20);
    var mbCount = gd.mushroomBody && gd.mushroomBody.count ? Math.min(gd.mushroomBody.count, 15) : 10;
    var canvas = document.getElementById('ocn-bp-canvas');
    if (!canvas) return;
    var W = canvas.clientWidth || 490;
    var H = canvas.clientHeight || 380;

    var zones = Object.keys(gd.sensoryAssignments);
    var zoneColors = ['#f85149','#79c0ff','#bc8cff','#e2b714','#3fb950','#ff7b72'];
    for (var si = 0; si < sampleS; si++) {
      var zi = zones.length ? si % zones.length : 0;
      _vizNodes.push({
        x: 40 + Math.random() * 60,
        y: 20 + (H - 40) * (si / sampleS),
        vx: 0, vy: 0,
        r: 3 + Math.random() * 2,
        group: 'sensory',
        color: zoneColors[zi % zoneColors.length],
        glow: 0,
        zone: zones[zi] || 'input'
      });
    }
    for (var ii = 0; ii < sampleI; ii++) {
      var isMB = ii < mbCount;
      _vizNodes.push({
        x: 140 + Math.random() * (W - 280),
        y: 20 + (H - 40) * Math.random(),
        vx: 0, vy: 0,
        r: isMB ? 4 : 2 + Math.random() * 2,
        group: isMB ? 'mushroom' : 'inter',
        color: isMB ? '#d29922' : '#2dc653',
        glow: 0
      });
    }
    var mLabels = ['reinforce', 'adjust', 'explore'];
    var mColors = ['#3fb950', '#d29922', '#bc8cff'];
    for (var mi = 0; mi < sampleM; mi++) {
      var mgi = mi % 3;
      _vizNodes.push({
        x: W - 40 - Math.random() * 60,
        y: 20 + (H - 40) * (mi / sampleM),
        vx: 0, vy: 0,
        r: 3.5 + Math.random() * 1.5,
        group: 'motor',
        color: mColors[mgi],
        glow: 0,
        motor: mLabels[mgi]
      });
    }
    var total = _vizNodes.length;
    var edgeCount = Math.min(total * 3, 300);
    for (var ei = 0; ei < edgeCount; ei++) {
      var a = Math.floor(Math.random() * total);
      var b = Math.floor(Math.random() * total);
      if (a === b) continue;
      var na = _vizNodes[a], nb = _vizNodes[b];
      if (na.group === 'motor' && nb.group === 'motor') continue;
      if (na.group === 'sensory' && nb.group === 'sensory') continue;
      _vizEdges.push({ a: a, b: b, w: 0.3 + Math.random() * 0.7 });
    }
  }

  function renderViz() {
    if (!_brainPopupOpen || !_vizInited) return;
    var canvas = document.getElementById('ocn-bp-canvas');
    if (!canvas) return;
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = rect.width;
    var H = rect.height;

    var now = Date.now();
    for (var ni = 0; ni < _vizNodes.length; ni++) {
      var n = _vizNodes[ni];
      if (Math.random() < 0.015) n.glow = 1;
      if (n.glow > 0) n.glow -= 0.03;
      n.vx += (Math.random() - 0.5) * 0.3;
      n.vy += (Math.random() - 0.5) * 0.3;
      n.vx *= 0.92;
      n.vy *= 0.92;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 10) { n.x = 10; n.vx = Math.abs(n.vx); }
      if (n.x > W - 10) { n.x = W - 10; n.vx = -Math.abs(n.vx); }
      if (n.y < 10) { n.y = 10; n.vy = Math.abs(n.vy); }
      if (n.y > H - 10) { n.y = H - 10; n.vy = -Math.abs(n.vy); }
    }
    for (var fi = 0; fi < _vizNodes.length; fi++) {
      for (var fj = fi + 1; fj < _vizNodes.length; fj++) {
        var dx = _vizNodes[fj].x - _vizNodes[fi].x;
        var dy = _vizNodes[fj].y - _vizNodes[fi].y;
        var dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist < 30) {
          var force = 0.5 / dist;
          _vizNodes[fi].vx -= dx * force;
          _vizNodes[fi].vy -= dy * force;
          _vizNodes[fj].vx += dx * force;
          _vizNodes[fj].vy += dy * force;
        }
      }
    }

    if (Math.random() < 0.08) {
      var startIdx = Math.floor(Math.random() * _vizNodes.length);
      if (_vizNodes[startIdx].group === 'sensory') {
        _vizNodes[startIdx].glow = 1;
        for (var pe = 0; pe < _vizEdges.length; pe++) {
          var edge = _vizEdges[pe];
          if (edge.a === startIdx || edge.b === startIdx) {
            var target = edge.a === startIdx ? edge.b : edge.a;
            setTimeout(function(t) { if (_vizNodes[t]) _vizNodes[t].glow = 1; }, 100 + Math.random() * 200, target);
          }
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, W, H);

    for (var ei = 0; ei < _vizEdges.length; ei++) {
      var e = _vizEdges[ei];
      var na = _vizNodes[e.a], nb = _vizNodes[e.b];
      if (!na || !nb) continue;
      var bright = Math.max(na.glow, nb.glow);
      ctx.strokeStyle = bright > 0.3 ? 'rgba(188,140,255,' + (0.08 + bright * 0.3) + ')' : 'rgba(48,54,61,0.15)';
      ctx.lineWidth = bright > 0.3 ? 1.2 : 0.5;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    for (var di = 0; di < _vizNodes.length; di++) {
      var nd = _vizNodes[di];
      if (nd.glow > 0.1) {
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.r + 4 + nd.glow * 6, 0, Math.PI * 2);
        ctx.fillStyle = nd.color.replace(')', ',' + (nd.glow * 0.25) + ')').replace('rgb', 'rgba').replace('#', '');
        var gc = hexToRgba(nd.color, nd.glow * 0.3);
        ctx.fillStyle = gc;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      var alpha = 0.5 + nd.glow * 0.5;
      ctx.fillStyle = hexToRgba(nd.color, alpha);
      ctx.fill();
    }

    var labels = [
      { text: 'SENSORY', x: 30, y: 14, color: '#f85149' },
      { text: 'INTERNEURONS', x: W / 2 - 30, y: 14, color: '#2dc653' },
      { text: 'MOTOR', x: W - 60, y: 14, color: '#bc8cff' }
    ];
    ctx.font = '9px sans-serif';
    labels.forEach(function(l) {
      ctx.fillStyle = l.color;
      ctx.globalAlpha = 0.5;
      ctx.fillText(l.text, l.x, l.y);
    });
    ctx.globalAlpha = 1;

    _vizAnimFrame = requestAnimationFrame(renderViz);
  }

  function hexToRgba(hex, alpha) {
    if (hex.charAt(0) === '#') {
      var r = parseInt(hex.slice(1,3), 16);
      var g = parseInt(hex.slice(3,5), 16);
      var b = parseInt(hex.slice(5,7), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }
    return hex;
  }

  function startActivityPoll() {
    stopActivityPoll();
    var logEl = document.getElementById('ocn-bp-log');
    if (logEl) logEl.innerHTML = '';
    _lastActivityTs = Date.now() - 60000;
    _seenActivityIds = {};
    brainFetch('/api/agent-brain/activity?since=' + _lastActivityTs).then(function(data) {
      if (!data) return;
      if (logEl) {
        var line = document.createElement('div');
        line.className = 'bp-log-entry bp-log-info';
        line.textContent = '[' + new Date().toLocaleTimeString() + '] Agent brain live — stimulations: ' + (data.stimulations || 0) + ' | steps: ' + (data.brainSteps || 0);
        logEl.appendChild(line);
      }
      if (data.events) {
        for (var i = 0; i < data.events.length; i++) {
          var evt = data.events[i];
          var eid = evt.ts + ':' + (evt.type || '') + ':' + (evt.sentiment || '');
          _seenActivityIds[eid] = true;
          if (evt.ts > _lastActivityTs) _lastActivityTs = evt.ts;
          addBrainLog(evt);
        }
      }
      _activityPollTimer = setInterval(pollActivity, 2000);
    });
  }

  function stopActivityPoll() {
    if (_activityPollTimer) { clearInterval(_activityPollTimer); _activityPollTimer = null; }
  }

  function pollActivity() {
    if (!_brainPopupOpen) return;
    brainFetch('/api/agent-brain/activity?since=' + _lastActivityTs).then(function(data) {
      if (!data) return;
      if (data.events && data.events.length > 0) {
        var anyNew = false;
        for (var i = 0; i < data.events.length; i++) {
          var evt = data.events[i];
          var eid = evt.ts + ':' + (evt.type || '') + ':' + (evt.sentiment || '');
          if (_seenActivityIds[eid]) continue;
          _seenActivityIds[eid] = true;
          anyNew = true;
          if (evt.ts > _lastActivityTs) _lastActivityTs = evt.ts;
          triggerActivityBurst(evt.type, evt.sentiment);
          addBrainLog(evt);
        }
        if (anyNew) refreshBrainPopup();
      }
    });
  }

  function addBrainLog(evt) {
    var logEl = document.getElementById('ocn-bp-log');
    if (!logEl) return;
    var ts = new Date(evt.ts).toLocaleTimeString();
    var cls = evt.type === 'sugar' ? 'bp-log-sugar' : 'bp-log-pain';
    var br = evt.brainResponse || {};
    var sig = 'R:' + (br.reinforce_signal || 0).toFixed(1) + ' A:' + (br.adjust_signal || 0).toFixed(1) + ' E:' + (br.explore_signal || 0).toFixed(1);
    var line = document.createElement('div');
    line.className = 'bp-log-entry ' + cls;
    line.textContent = '[' + ts + '] ' + evt.sentiment + ' → ' + evt.type + ' | ' + sig;
    logEl.appendChild(line);
    if (logEl.children.length > 50) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function triggerActivityBurst(type, sentiment) {
    if (!_vizNodes || _vizNodes.length === 0) return;
    var sensorNodes = [];
    var motorNodes = [];
    var interNodes = [];
    for (var i = 0; i < _vizNodes.length; i++) {
      if (_vizNodes[i].group === 'sensory') sensorNodes.push(i);
      else if (_vizNodes[i].group === 'motor') motorNodes.push(i);
      else interNodes.push(i);
    }
    var burstCount = Math.min(sensorNodes.length, 8);
    for (var s = 0; s < burstCount; s++) {
      var idx = sensorNodes[Math.floor(Math.random() * sensorNodes.length)];
      _vizNodes[idx].glow = 1;
    }
    var delay = 150;
    for (var w = 0; w < 3; w++) {
      (function(wave) {
        setTimeout(function() {
          var waveCount = Math.min(interNodes.length, 12);
          for (var j = 0; j < waveCount; j++) {
            var ni = interNodes[Math.floor(Math.random() * interNodes.length)];
            if (_vizNodes[ni]) _vizNodes[ni].glow = 1;
          }
        }, delay * (wave + 1));
      })(w);
    }
    setTimeout(function() {
      var targetMotor = type === 'sugar' ? 'reinforce' : 'adjust';
      for (var m = 0; m < motorNodes.length; m++) {
        var mn = _vizNodes[motorNodes[m]];
        if (mn && (mn.motor === targetMotor || Math.random() < 0.4)) {
          mn.glow = 1;
        }
      }
    }, delay * 4);
  }

  inject();
  setInterval(function() {
    if (!document.getElementById('openclaw-nav')) inject();
  }, 2000);
})();
