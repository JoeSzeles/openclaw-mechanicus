(function() {
  if (document.getElementById('openclaw-nav')) return;
  var nav = document.createElement('div');
  nav.id = 'openclaw-nav';
  nav.innerHTML = '<div class="ocn-links"><a href="/">Dashboard</a><a href="/__openclaw__/canvas/">Canvas</a><a href="/model-config.html">AI Model Config</a><a href="/workers.html">Workers</a><a href="/processes.html">Processes</a></div>';
  var style = document.createElement('style');
  style.textContent = '#openclaw-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;height:36px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}#openclaw-nav .ocn-links{display:flex;align-items:center;gap:2px}#openclaw-nav a{color:#8b949e;text-decoration:none;font-size:13px;font-weight:500;padding:5px 12px;border-radius:6px;transition:color .15s,background .15s;white-space:nowrap}#openclaw-nav a:hover{color:#e6edf3;background:rgba(255,255,255,.06)}#openclaw-nav a.active{color:#58a6ff;background:rgba(88,166,255,.1)}';
  document.head.appendChild(style);
  document.body.insertBefore(nav, document.body.firstChild);
  var app = document.querySelector('openclaw-app');
  if (app) {
    app.style.paddingTop = '36px';
  }
  var loc = window.location.pathname;
  var links = nav.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href');
    if (href === loc || (href === '/' && (loc === '/index.html' || loc === '/')) || (loc.indexOf('/__openclaw__/canvas') === 0 && href === '/__openclaw__/canvas/') || (loc === '/model-config.html' && href === '/model-config.html')) {
      links[i].classList.add('active');
    }
  }
})();
