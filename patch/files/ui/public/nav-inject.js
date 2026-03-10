(function() {
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
      + '</div>';
    var style = document.createElement('style');
    style.textContent = '#openclaw-nav{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;height:36px;font-family:sans-serif}#openclaw-nav .ocn-links{display:flex;align-items:center;gap:2px}#openclaw-nav a{color:#8b949e;text-decoration:none;font-size:13px;padding:5px 12px}body{padding-top:36px !important}';
    document.head.appendChild(style);
    document.documentElement.appendChild(nav);
  }
  inject();
  setInterval(inject, 1000);
})();
