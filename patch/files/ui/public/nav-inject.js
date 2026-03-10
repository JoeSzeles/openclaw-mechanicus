(function() {
  function inject() {
    if (document.getElementById('openclaw-nav')) return;
    var nav = document.createElement('div');
    nav.id = 'openclaw-nav';
    nav.innerHTML = '<div class="ocn-links"><a href="/index.html">Main App</a><a href="/">Dashboard</a><a href="/__openclaw__/canvas/ig-dashboard.html">IG Trading</a><a href="/__openclaw__/canvas/ig-dashboard.html?tab=clawscript">IG-ClawScript</a><a href="/__openclaw__/canvas/">Canvas</a><a href="/__openclaw__/canvas/clawscript-editor.html">Code</a><a href="/model-config.html">Config</a><a href="/workers.html">Workers</a><a href="/processes.html">Processes</a></div>';
    var style = document.createElement('style');
    style.textContent = '#openclaw-nav{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;height:36px;font-family:sans-serif}#openclaw-nav .ocn-links{display:flex;align-items:center;gap:2px}#openclaw-nav a{color:#8b949e;text-decoration:none;font-size:13px;padding:5px 12px}body{padding-top:36px !important}';
    document.head.appendChild(style);
    document.documentElement.appendChild(nav);
  }
  inject();
  setInterval(inject, 1000);
})();
