(function() {
'use strict';

var NODE_W = 180;
var NODE_HEADER_H = 30;
var NODE_PARAM_H = 26;
var PORT_R = 7;
var ZOOM_MIN = 0.25;
var ZOOM_MAX = 2.5;
var ZOOM_STEP = 0.06;
var SNAP = 10;

var NODE_CATS = [
  { id: 'trading', label: 'Trading', color: '#2dc653', bg: '#1b4332',
    items: [
      { cmd: 'BUY', doc: 'Generate a BUY signal at market/limit/stop', params: [{k:'size',l:'Size',d:'1'},{k:'orderType',l:'Order',d:'MARKET'},{k:'stop',l:'Stop',d:''},{k:'limit',l:'Limit',d:''},{k:'reason',l:'Reason',d:''}] },
      { cmd: 'SELL', doc: 'Generate a SELL signal', params: [{k:'size',l:'Size',d:'1'},{k:'orderType',l:'Order',d:'MARKET'},{k:'stop',l:'Stop',d:''},{k:'reason',l:'Reason',d:''}] },
      { cmd: 'SELLSHORT', doc: 'Open a short position', params: [{k:'size',l:'Size',d:'1'},{k:'stop',l:'Stop',d:''},{k:'reason',l:'Reason',d:''}] },
      { cmd: 'EXIT', doc: 'Close position (all or partial)', params: [{k:'exitType',l:'Type',d:'ALL'},{k:'reason',l:'Reason',d:''}] },
      { cmd: 'CLOSE', doc: 'Close current position', params: [{k:'reason',l:'Reason',d:''}] },
      { cmd: 'TRAILSTOP', doc: 'Set trailing stop distance', params: [{k:'distance',l:'Dist',d:'25'},{k:'accel',l:'Accel',d:'0.02'},{k:'max',l:'Max',d:'0.2'}] }
    ]
  },
  { id: 'variables', label: 'Variables', color: '#8b949e', bg: '#21262d',
    items: [
      { cmd: 'DEF', doc: 'Define a variable (const)', params: [{k:'name',l:'Name',d:'myVar'},{k:'value',l:'Value',d:'0'}] },
      { cmd: 'SET', doc: 'Set/update a variable', params: [{k:'name',l:'Name',d:'myVar'},{k:'value',l:'Value',d:'0'}] },
      { cmd: 'STORE_VAR', doc: 'Persist variable to storage', params: [{k:'key',l:'Key',d:''},{k:'value',l:'Value',d:''}] },
      { cmd: 'LOAD_VAR', doc: 'Load variable from storage', params: [{k:'key',l:'Key',d:''},{k:'default',l:'Default',d:''}] }
    ]
  },
  { id: 'control', label: 'Control Flow', color: '#ff7b72', bg: '#3d1a1a',
    items: [
      { cmd: 'IF', doc: 'Conditional branch (true/false paths)', params: [{k:'condition',l:'Condition',d:'rsi < 30'}], ports: {out:['true','false']} },
      { cmd: 'LOOP', doc: 'Repeat N times or forever', params: [{k:'count',l:'Count',d:'5'},{k:'forever',l:'Forever',d:''}], ports: {out:['body','next']} },
      { cmd: 'WHILE', doc: 'Loop while condition is true', params: [{k:'condition',l:'Condition',d:'running == true'}], ports: {out:['body','next']} },
      { cmd: 'TRY', doc: 'Try/catch error handling', params: [{k:'catchVar',l:'Catch Var',d:'err'}], ports: {out:['body','catch','next']} },
      { cmd: 'WAIT', doc: 'Pause execution (ms)', params: [{k:'ms',l:'Delay (ms)',d:'1000'}] },
      { cmd: 'ERROR', doc: 'Throw an error', params: [{k:'message',l:'Message',d:''}] }
    ]
  },
  { id: 'ai', label: 'AI / Analysis', color: '#bc8cff', bg: '#2d1b4e',
    items: [
      { cmd: 'AI_QUERY', doc: 'Query AI model with prompt', params: [{k:'prompt',l:'Prompt',d:''},{k:'tool',l:'Tool',d:''},{k:'arg',l:'Arg',d:''}] },
      { cmd: 'AI_GENERATE_SCRIPT', doc: 'Auto-generate ClawScript from prompt', params: [{k:'prompt',l:'Prompt',d:''},{k:'to',l:'Save To',d:''}] },
      { cmd: 'ANALYZE_LOG', doc: 'Analyze trade/bot logs', params: [{k:'query',l:'Query',d:''},{k:'limit',l:'Limit',d:''}] },
      { cmd: 'RUN_ML', doc: 'Run ML model on data', params: [{k:'model',l:'Model',d:''},{k:'data',l:'Data',d:''}] }
    ]
  },
  { id: 'data', label: 'Data Fetch', color: '#79c0ff', bg: '#0c2d48',
    items: [
      { cmd: 'CLAW_WEB', doc: 'Fetch web page content', params: [{k:'url',l:'URL',d:''},{k:'instruct',l:'Instruct',d:''}] },
      { cmd: 'CLAW_X', doc: 'Search X/Twitter posts', params: [{k:'query',l:'Query',d:''},{k:'limit',l:'Limit',d:'10'}] },
      { cmd: 'CLAW_PDF', doc: 'Extract PDF content', params: [{k:'file',l:'File',d:''},{k:'query',l:'Query',d:''}] },
      { cmd: 'CLAW_IMAGE', doc: 'Generate AI image', params: [{k:'description',l:'Desc',d:''},{k:'num',l:'Count',d:'1'}] },
      { cmd: 'CLAW_VIDEO', doc: 'Analyze video content', params: [{k:'url',l:'URL',d:''}] },
      { cmd: 'CLAW_CONVERSATION', doc: 'Retrieve conversation history', params: [{k:'query',l:'Query',d:''}] },
      { cmd: 'CLAW_TOOL', doc: 'Execute an external tool', params: [{k:'toolName',l:'Tool',d:''}] },
      { cmd: 'CLAW_CODE', doc: 'Execute code snippet', params: [{k:'code',l:'Code',d:''}] }
    ]
  },
  { id: 'agent', label: 'Agent / Orchestration', color: '#f0883e', bg: '#3d2200',
    items: [
      { cmd: 'SPAWN_AGENT', doc: 'Create a new agent instance', params: [{k:'name',l:'Name',d:''},{k:'prompt',l:'Prompt',d:''}] },
      { cmd: 'CALL_SESSION', doc: 'Call an agent session', params: [{k:'agent',l:'Agent',d:''},{k:'command',l:'Command',d:''}] },
      { cmd: 'MUTATE_CONFIG', doc: 'Change bot config at runtime', params: [{k:'key',l:'Key',d:''},{k:'value',l:'Value',d:''}] },
      { cmd: 'ALERT', doc: 'Send alert notification', params: [{k:'message',l:'Message',d:''},{k:'level',l:'Level',d:'info'},{k:'to',l:'To',d:''}] },
      { cmd: 'SAY_TO_SESSION', doc: 'Send message to session', params: [{k:'sessionId',l:'Session',d:''},{k:'message',l:'Message',d:''}] },
      { cmd: 'WAIT_FOR_REPLY', doc: 'Wait for agent reply', params: [{k:'sessionId',l:'Session',d:''},{k:'timeout',l:'Timeout',d:''}] }
    ]
  },
  { id: 'advanced', label: 'Advanced', color: '#ffa657', bg: '#2d1b00',
    items: [
      { cmd: 'CRASH_SCAN', doc: 'Enable/disable crash scanner', params: [{k:'state',l:'State',d:'ON'}] },
      { cmd: 'MARKET_NOMAD', doc: 'Enable nomadic market scanning', params: [{k:'state',l:'State',d:'ON'}] },
      { cmd: 'NOMAD_SCAN', doc: 'Scan for instruments by category', params: [{k:'category',l:'Category',d:''},{k:'limit',l:'Limit',d:''}] },
      { cmd: 'NOMAD_ALLOCATE', doc: 'Allocate to scanned instruments', params: [{k:'to',l:'Target',d:''},{k:'sizing',l:'Sizing',d:''}] },
      { cmd: 'RUMOR_SCAN', doc: 'Scan for market rumors', params: [{k:'topic',l:'Topic',d:''},{k:'sources',l:'Sources',d:''}] },
      { cmd: 'OPTIMIZE', doc: 'Optimize a parameter range', params: [{k:'varName',l:'Variable',d:''},{k:'from',l:'From',d:''},{k:'to',l:'To',d:''},{k:'step',l:'Step',d:''}] },
      { cmd: 'INDICATOR', doc: 'Calculate technical indicator', params: [{k:'name',l:'Name',d:'RSI'},{k:'params',l:'Params',d:'14'}] }
    ]
  },
  { id: 'functions', label: 'Functions', color: '#a371f7', bg: '#1c1437',
    items: [
      { cmd: 'DEF_FUNC', doc: 'Define a reusable function', params: [{k:'name',l:'Name',d:'myFunc'},{k:'args',l:'Args',d:''}], ports: {out:['body','next']} },
      { cmd: 'CHAIN', doc: 'Chain sequential operations', params: [] },
      { cmd: 'INCLUDE', doc: 'Include external script', params: [{k:'scriptName',l:'Script',d:''}] }
    ]
  }
];

var CMD_LOOKUP = {};
NODE_CATS.forEach(function(cat) {
  cat.items.forEach(function(item) {
    CMD_LOOKUP[item.cmd] = { cat: cat, item: item };
  });
});

function getCmdDef(cmd) {
  return CMD_LOOKUP[cmd] || null;
}

function snap(v) { return Math.round(v / SNAP) * SNAP; }

function FlowEngine(container, onCodeChange) {
  this.container = container;
  this.onCodeChange = onCodeChange || function(){};
  this.nodes = {};
  this.connections = {};
  this.nextId = 1;
  this.selectedId = null;
  this.zoom = 1;
  this.panX = 0;
  this.panY = 0;
  this.undoStack = [];
  this.redoStack = [];
  this._syncLock = false;
  this._dragState = null;
  this._connectState = null;
  this._panState = null;
  this._toolboxCollapsed = false;
  this.svgEl = null;
  this.canvasInner = null;
  this.canvasWrap = null;
  this.tempLine = null;
  this.init();
}

FlowEngine.prototype.init = function() {
  this.container.innerHTML = '';
  this.container.style.display = 'flex';
  this.container.style.flexDirection = 'column';
  this.container.style.height = '100%';
  this.container.style.overflow = 'hidden';

  this.buildToolbar();
  var body = document.createElement('div');
  body.style.cssText = 'display:flex;flex:1;overflow:hidden;';
  this.container.appendChild(body);
  this.buildToolbox(body);
  this.buildCanvas(body);
  this.setupEvents();
};

FlowEngine.prototype.buildToolbar = function() {
  var tb = document.createElement('div');
  tb.className = 'cf-toolbar';
  tb.innerHTML =
    '<button class="cf-tb-btn" data-action="zoomIn" title="Zoom In">+</button>' +
    '<button class="cf-tb-btn" data-action="zoomOut" title="Zoom Out">&minus;</button>' +
    '<button class="cf-tb-btn" data-action="zoomFit" title="Fit View">Fit</button>' +
    '<span class="cf-zoom-label" id="cfZoomLabel">100%</span>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn" data-action="autoLayout" title="Auto-Layout (arrange nodes)">Auto-Layout</button>' +
    '<button class="cf-tb-btn" data-action="exportPNG" title="Export flow as PNG image">Export PNG</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn" data-action="undo" title="Undo last change">Undo</button>' +
    '<button class="cf-tb-btn" data-action="redo" title="Redo">Redo</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn cf-tb-del" data-action="deleteSelected" title="Delete selected node">Delete</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<span class="cf-node-count" id="cfNodeCount">0 nodes</span>';
  this.container.appendChild(tb);
  var self = this;
  tb.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var a = btn.getAttribute('data-action');
    if (a === 'zoomIn') self.setZoom(self.zoom + ZOOM_STEP);
    else if (a === 'zoomOut') self.setZoom(self.zoom - ZOOM_STEP);
    else if (a === 'zoomFit') self.zoomFit();
    else if (a === 'autoLayout') self.autoLayout();
    else if (a === 'exportPNG') self.exportPNG();
    else if (a === 'undo') self.undo();
    else if (a === 'redo') self.redo();
    else if (a === 'deleteSelected') self.deleteSelected();
  });
};

FlowEngine.prototype.buildToolbox = function(parent) {
  var tb = document.createElement('div');
  tb.className = 'cf-toolbox';
  tb.id = 'cfToolbox';

  var hdr = document.createElement('div');
  hdr.className = 'cf-toolbox-header';
  hdr.innerHTML = '<span>Commands</span><button class="cf-toolbox-toggle" id="cfToolboxToggle" title="Collapse">&laquo;</button>';
  tb.appendChild(hdr);

  var scroll = document.createElement('div');
  scroll.className = 'cf-toolbox-scroll';

  var self = this;
  NODE_CATS.forEach(function(cat) {
    var group = document.createElement('div');
    group.className = 'cf-toolbox-group';

    var groupHdr = document.createElement('div');
    groupHdr.className = 'cf-toolbox-group-header';
    groupHdr.style.borderLeftColor = cat.color;
    groupHdr.innerHTML = '<span>' + cat.label + '</span><span class="cf-tg-arrow">&#9662;</span>';
    groupHdr.addEventListener('click', function() {
      var list = group.querySelector('.cf-toolbox-items');
      var arrow = groupHdr.querySelector('.cf-tg-arrow');
      if (list.style.display === 'none') { list.style.display = ''; arrow.innerHTML = '&#9662;'; }
      else { list.style.display = 'none'; arrow.innerHTML = '&#9656;'; }
    });
    group.appendChild(groupHdr);

    var items = document.createElement('div');
    items.className = 'cf-toolbox-items';
    cat.items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'cf-toolbox-item';
      el.setAttribute('draggable', 'true');
      el.setAttribute('data-cmd', item.cmd);
      el.style.borderLeftColor = cat.color;
      el.innerHTML = '<span class="cf-ti-name">' + item.cmd + '</span>';
      el.title = item.doc;
      el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', item.cmd);
        e.dataTransfer.effectAllowed = 'copy';
      });
      items.appendChild(el);
    });
    group.appendChild(items);
    scroll.appendChild(group);
  });

  tb.appendChild(scroll);
  parent.appendChild(tb);
  this.toolboxEl = tb;

  var self = this;
  var toggleBtn = tb.querySelector('.cf-toolbox-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      self._toolboxCollapsed = !self._toolboxCollapsed;
      tb.classList.toggle('cf-toolbox-collapsed', self._toolboxCollapsed);
      this.innerHTML = self._toolboxCollapsed ? '&raquo;' : '&laquo;';
    });
  }
};

FlowEngine.prototype.buildCanvas = function(parent) {
  var wrap = document.createElement('div');
  wrap.className = 'cf-canvas-wrap';
  wrap.id = 'cfCanvasWrap';

  var inner = document.createElement('div');
  inner.className = 'cf-canvas-inner';
  inner.id = 'cfCanvasInner';

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cfSvgLayer';
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  var markerNormal = this._createArrowMarker('cfArrow', '#484f58');
  var markerTrue = this._createArrowMarker('cfArrowTrue', '#2dc653');
  var markerFalse = this._createArrowMarker('cfArrowFalse', '#f85149');
  var markerBody = this._createArrowMarker('cfArrowBody', '#f0883e');
  var markerCatch = this._createArrowMarker('cfArrowCatch', '#bc8cff');
  defs.appendChild(markerNormal);
  defs.appendChild(markerTrue);
  defs.appendChild(markerFalse);
  defs.appendChild(markerBody);
  defs.appendChild(markerCatch);
  svg.appendChild(defs);

  inner.appendChild(svg);
  wrap.appendChild(inner);
  parent.appendChild(wrap);

  this.svgEl = svg;
  this.canvasInner = inner;
  this.canvasWrap = wrap;
};

FlowEngine.prototype._createArrowMarker = function(id, color) {
  var m = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  m.setAttribute('id', id);
  m.setAttribute('markerWidth', '10');
  m.setAttribute('markerHeight', '7');
  m.setAttribute('refX', '9');
  m.setAttribute('refY', '3.5');
  m.setAttribute('orient', 'auto');
  var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  p.setAttribute('points', '0 0, 10 3.5, 0 7');
  p.setAttribute('fill', color);
  m.appendChild(p);
  return m;
};

FlowEngine.prototype.clientToCanvas = function(clientX, clientY) {
  var wr = this.canvasWrap && this.canvasWrap.getBoundingClientRect
    ? this.canvasWrap.getBoundingClientRect() : { left: 0, top: 0 };
  return {
    x: (clientX - wr.left - this.panX) / this.zoom,
    y: (clientY - wr.top - this.panY) / this.zoom
  };
};

FlowEngine.prototype.setupEvents = function() {
  var self = this;
  var wrap = this.canvasWrap;

  wrap.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  wrap.addEventListener('drop', function(e) {
    e.preventDefault();
    var cmd = e.dataTransfer.getData('text/plain');
    if (!cmd || !getCmdDef(cmd)) return;
    var pt = self.clientToCanvas(e.clientX, e.clientY);
    self.pushUndo();
    var nid = self.addNode(cmd, snap(pt.x - NODE_W / 2), snap(pt.y - 15));
    if (self.selectedId && self.selectedId !== nid) {
      var selNode = self.nodes[self.selectedId];
      if (selNode) {
        var outPorts = self.getOutPorts(selNode);
        var freePort = null;
        for (var i = 0; i < outPorts.length; i++) {
          if (!self.hasConnectionFrom(self.selectedId, outPorts[i])) { freePort = outPorts[i]; break; }
        }
        if (freePort) {
          self.addConnection(self.selectedId, freePort, nid, 'in');
        }
      }
    }
    self.selectNode(nid);
    self.syncToCode();
    self.render();
  });

  wrap.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    var onNode = e.target.closest('.cf-node');
    if (!onNode) {
      self._panState = { startX: e.clientX, startY: e.clientY, origPanX: self.panX, origPanY: self.panY };
      self.selectNode(null);
      self.render();
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (self._panState) {
      var dx = e.clientX - self._panState.startX;
      var dy = e.clientY - self._panState.startY;
      self.panX = self._panState.origPanX + dx;
      self.panY = self._panState.origPanY + dy;
      self.applyTransform();
    }
    if (self._dragState) {
      var ds = self._dragState;
      var node = self.nodes[ds.nodeId];
      if (node) {
        var pt = self.clientToCanvas(e.clientX, e.clientY);
        node.x = snap(pt.x - ds.offX);
        node.y = snap(pt.y - ds.offY);
        self.renderNodePosition(ds.nodeId);
        self.renderConnections();
      }
    }
    if (self._connectState) {
      self.drawTempLine(e.clientX, e.clientY);
    }
  });

  document.addEventListener('mouseup', function(e) {
    if (self._panState) {
      self._panState = null;
      wrap.style.cursor = 'grab';
    }
    if (self._dragState) {
      self.pushUndo();
      self._dragState = null;
      self.syncToCode();
    }
    if (self._connectState) {
      self.removeTempLine();
      var port = self.findPortAtPoint(e.clientX, e.clientY);
      if (port && port.nodeId !== self._connectState.nodeId && port.type === 'in') {
        self.pushUndo();
        self.addConnection(self._connectState.nodeId, self._connectState.portId, port.nodeId, 'in');
        self.syncToCode();
        self.render();
      }
      self._connectState = null;
    }
  });

  wrap.addEventListener('wheel', function(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    var oldZoom = self.zoom;
    var newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, oldZoom + delta));
    if (newZoom === oldZoom) return;
    var wr = wrap.getBoundingClientRect();
    var mx = e.clientX - wr.left;
    var my = e.clientY - wr.top;
    var scale = newZoom / oldZoom;
    self.panX = mx - scale * (mx - self.panX);
    self.panY = my - scale * (my - self.panY);
    self.zoom = newZoom;
    self.applyTransform();
    var label = document.getElementById('cfZoomLabel');
    if (label) label.textContent = Math.round(self.zoom * 100) + '%';
  }, { passive: false });

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (self.selectedId && document.activeElement && !document.activeElement.closest('.cf-node-param')) {
        self.deleteSelected();
      }
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); self.undo(); }
      if (e.key === 'y') { e.preventDefault(); self.redo(); }
    }
  });
};

FlowEngine.prototype.getOutPorts = function(node) {
  var def = getCmdDef(node.cmd);
  if (def && def.item.ports && def.item.ports.out) return def.item.ports.out;
  return ['out'];
};

FlowEngine.prototype.hasConnectionFrom = function(nodeId, portId) {
  var conns = this.connections;
  for (var k in conns) {
    if (conns[k].fromId === nodeId && conns[k].fromPort === portId) return true;
  }
  return false;
};

FlowEngine.prototype.findPortAtPoint = function(cx, cy) {
  var els = document.elementsFromPoint(cx, cy);
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.classList && el.classList.contains('cf-port')) {
      return { nodeId: el.getAttribute('data-node-id'), portId: el.getAttribute('data-port-id'), type: el.getAttribute('data-port-type') };
    }
  }
  return null;
};

FlowEngine.prototype.addNode = function(cmd, x, y) {
  var id = 'n' + (this.nextId++);
  var def = getCmdDef(cmd);
  var params = {};
  if (def) {
    def.item.params.forEach(function(p) { params[p.k] = p.d || ''; });
  }
  this.nodes[id] = { id: id, cmd: cmd, x: x || 50, y: y || 50, params: params, _el: null };
  this.updateNodeCount();
  return id;
};

FlowEngine.prototype.removeNode = function(id) {
  var toRemove = [];
  for (var k in this.connections) {
    if (this.connections[k].fromId === id || this.connections[k].toId === id) toRemove.push(k);
  }
  for (var i = 0; i < toRemove.length; i++) delete this.connections[toRemove[i]];
  if (this.nodes[id] && this.nodes[id]._el) this.nodes[id]._el.remove();
  delete this.nodes[id];
  if (this.selectedId === id) this.selectedId = null;
  this.updateNodeCount();
};

FlowEngine.prototype.addConnection = function(fromId, fromPort, toId, toPort) {
  for (var k in this.connections) {
    var c = this.connections[k];
    if (c.toId === toId && c.toPort === toPort) return;
    if (c.fromId === fromId && c.fromPort === fromPort) { delete this.connections[k]; break; }
  }
  var cid = 'c' + (this.nextId++);
  this.connections[cid] = { id: cid, fromId: fromId, fromPort: fromPort, toId: toId, toPort: toPort };
  return cid;
};

FlowEngine.prototype.selectNode = function(id) {
  this.selectedId = id;
  var allNodes = this.container.querySelectorAll('.cf-node');
  for (var i = 0; i < allNodes.length; i++) {
    allNodes[i].classList.toggle('cf-node-selected', allNodes[i].getAttribute('data-node-id') === id);
  }
};

FlowEngine.prototype.deleteSelected = function() {
  if (!this.selectedId) return;
  this.pushUndo();
  this.removeNode(this.selectedId);
  this.syncToCode();
  this.render();
};

FlowEngine.prototype.setZoom = function(z) {
  this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  this.applyTransform();
  var label = document.getElementById('cfZoomLabel');
  if (label) label.textContent = Math.round(this.zoom * 100) + '%';
};

FlowEngine.prototype.applyTransform = function() {
  if (this.canvasInner) {
    this.canvasInner.style.transform = 'translate(' + this.panX + 'px,' + this.panY + 'px) scale(' + this.zoom + ')';
    this.canvasInner.style.transformOrigin = '0 0';
  }
};

FlowEngine.prototype.zoomFit = function() {
  var keys = Object.keys(this.nodes);
  if (keys.length === 0) { this.zoom = 1; this.panX = 0; this.panY = 0; this.applyTransform(); return; }
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var i = 0; i < keys.length; i++) {
    var n = this.nodes[keys[i]];
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    var nh = this.getNodeHeight(n);
    if (n.x + NODE_W > maxX) maxX = n.x + NODE_W;
    if (n.y + nh > maxY) maxY = n.y + nh;
  }
  var pad = 40;
  var w = maxX - minX + pad * 2;
  var h = maxY - minY + pad * 2;
  var wrapRect = this.canvasWrap && this.canvasWrap.getBoundingClientRect ? this.canvasWrap.getBoundingClientRect() : { width: 800, height: 600 };
  var scaleX = (wrapRect.width || 800) / w;
  var scaleY = (wrapRect.height || 600) / h;
  this.zoom = Math.max(ZOOM_MIN, Math.min(1.5, Math.min(scaleX, scaleY)));
  this.panX = -minX * this.zoom + pad * this.zoom;
  this.panY = -minY * this.zoom + pad * this.zoom;
  this.applyTransform();
  var label = document.getElementById('cfZoomLabel');
  if (label) label.textContent = Math.round(this.zoom * 100) + '%';
};

FlowEngine.prototype.getNodeHeight = function(node) {
  var def = getCmdDef(node.cmd);
  var paramCount = def ? def.item.params.length : 0;
  return NODE_HEADER_H + Math.max(paramCount, 1) * NODE_PARAM_H + 10;
};

FlowEngine.prototype.render = function() {
  var existingEls = this.canvasInner.querySelectorAll('.cf-node');
  for (var i = 0; i < existingEls.length; i++) existingEls[i].remove();

  var self = this;
  Object.keys(this.nodes).forEach(function(id) {
    self.renderNode(self.nodes[id]);
  });
  this.renderConnections();
  this.updateNodeCount();
};

FlowEngine.prototype.renderNode = function(node) {
  var self = this;
  var def = getCmdDef(node.cmd);
  var cat = def ? def.cat : null;
  var color = cat ? cat.color : '#8b949e';
  var bg = cat ? cat.bg : '#21262d';
  var nh = this.getNodeHeight(node);

  var el = document.createElement('div');
  el.className = 'cf-node' + (node.id === this.selectedId ? ' cf-node-selected' : '');
  el.setAttribute('data-node-id', node.id);
  el.style.cssText = 'left:' + node.x + 'px;top:' + node.y + 'px;width:' + NODE_W + 'px;height:' + nh + 'px;background:' + bg + ';border-color:' + color + ';';

  var header = document.createElement('div');
  header.className = 'cf-node-header';
  header.style.background = color;
  header.textContent = node.cmd;
  header.title = def ? def.item.doc : node.cmd;
  el.appendChild(header);

  header.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    e.stopPropagation();
    self.selectNode(node.id);
    var pt = self.clientToCanvas(e.clientX, e.clientY);
    self._dragState = {
      nodeId: node.id,
      offX: pt.x - node.x,
      offY: pt.y - node.y
    };
  });

  var body = document.createElement('div');
  body.className = 'cf-node-body';
  if (def) {
    def.item.params.forEach(function(p) {
      var row = document.createElement('div');
      row.className = 'cf-node-param';
      var lbl = document.createElement('span');
      lbl.className = 'cf-np-label';
      lbl.textContent = p.l + ':';
      var inp = document.createElement('input');
      inp.className = 'cf-np-input';
      inp.type = 'text';
      inp.value = node.params[p.k] || '';
      inp.setAttribute('data-key', p.k);
      inp.addEventListener('input', function() {
        node.params[p.k] = inp.value;
      });
      inp.addEventListener('change', function() {
        self.pushUndo();
        self.syncToCode();
      });
      inp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      row.appendChild(lbl);
      row.appendChild(inp);
      body.appendChild(row);
    });
  }
  el.appendChild(body);

  var portIn = document.createElement('div');
  portIn.className = 'cf-port cf-port-in';
  portIn.setAttribute('data-node-id', node.id);
  portIn.setAttribute('data-port-id', 'in');
  portIn.setAttribute('data-port-type', 'in');
  portIn.title = 'Input';
  portIn.addEventListener('mouseup', function(e) { e.stopPropagation(); });
  el.appendChild(portIn);

  var outPorts = this.getOutPorts(node);
  var outW = NODE_W / (outPorts.length + 1);
  for (var oi = 0; oi < outPorts.length; oi++) {
    var portOut = document.createElement('div');
    portOut.className = 'cf-port cf-port-out';
    portOut.setAttribute('data-node-id', node.id);
    portOut.setAttribute('data-port-id', outPorts[oi]);
    portOut.setAttribute('data-port-type', 'out');
    var portLabel = outPorts[oi];
    if (portLabel === 'out') portLabel = '';
    else if (portLabel === 'true') { portOut.style.background = '#2dc653'; portOut.style.borderColor = '#2dc653'; }
    else if (portLabel === 'false') { portOut.style.background = '#f85149'; portOut.style.borderColor = '#f85149'; }
    else if (portLabel === 'body') { portOut.style.background = '#f0883e'; portOut.style.borderColor = '#f0883e'; }
    else if (portLabel === 'catch') { portOut.style.background = '#bc8cff'; portOut.style.borderColor = '#bc8cff'; }
    portOut.style.left = (outW * (oi + 1) - PORT_R) + 'px';
    portOut.title = portLabel || 'Output';
    if (portLabel) {
      var plbl = document.createElement('span');
      plbl.className = 'cf-port-label';
      plbl.textContent = portLabel;
      plbl.style.left = (outW * (oi + 1) - 10) + 'px';
      el.appendChild(plbl);
    }
    (function(pout, pid) {
      pout.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self._connectState = { nodeId: node.id, portId: pid };
        self.createTempLine();
      });
    })(portOut, outPorts[oi]);
    el.appendChild(portOut);
  }

  this.canvasInner.appendChild(el);
  node._el = el;
};

FlowEngine.prototype.renderNodePosition = function(id) {
  var node = this.nodes[id];
  if (!node || !node._el) return;
  node._el.style.left = node.x + 'px';
  node._el.style.top = node.y + 'px';
};

FlowEngine.prototype.renderConnections = function() {
  var oldPaths = this.svgEl.querySelectorAll('.cf-conn');
  for (var i = 0; i < oldPaths.length; i++) oldPaths[i].remove();

  var self = this;
  Object.keys(this.connections).forEach(function(cid) {
    var c = self.connections[cid];
    var fromNode = self.nodes[c.fromId];
    var toNode = self.nodes[c.toId];
    if (!fromNode || !toNode) return;

    var fromPorts = self.getOutPorts(fromNode);
    var portIdx = fromPorts.indexOf(c.fromPort);
    if (portIdx < 0) portIdx = 0;
    var outW = NODE_W / (fromPorts.length + 1);
    var fromNH = self.getNodeHeight(fromNode);

    var x1 = fromNode.x + outW * (portIdx + 1);
    var y1 = fromNode.y + fromNH;
    var x2 = toNode.x + NODE_W / 2;
    var y2 = toNode.y;

    var dy = Math.abs(y2 - y1);
    var cp = Math.max(40, dy * 0.4);

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 + cp) + ' ' + x2 + ',' + (y2 - cp) + ' ' + x2 + ',' + y2);
    path.setAttribute('class', 'cf-conn');
    path.setAttribute('data-conn-id', cid);

    var markerRef = 'url(#cfArrow)';
    var strokeColor = '#484f58';
    if (c.fromPort === 'true') { markerRef = 'url(#cfArrowTrue)'; strokeColor = '#2dc653'; }
    else if (c.fromPort === 'false') { markerRef = 'url(#cfArrowFalse)'; strokeColor = '#f85149'; }
    else if (c.fromPort === 'body') { markerRef = 'url(#cfArrowBody)'; strokeColor = '#f0883e'; }
    else if (c.fromPort === 'catch') { markerRef = 'url(#cfArrowCatch)'; strokeColor = '#bc8cff'; }

    path.setAttribute('stroke', strokeColor);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', markerRef);
    path.style.pointerEvents = 'stroke';
    path.style.cursor = 'pointer';

    (function(connId) {
      path.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Remove this connection?')) {
          self.pushUndo();
          delete self.connections[connId];
          self.syncToCode();
          self.renderConnections();
        }
      });
    })(cid);

    self.svgEl.appendChild(path);
  });
};

FlowEngine.prototype.createTempLine = function() {
  if (this.tempLine) this.tempLine.remove();
  var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('stroke', '#58a6ff');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-dasharray', '6,3');
  line.id = 'cfTempLine';
  this.svgEl.appendChild(line);
  this.tempLine = line;
};

FlowEngine.prototype.drawTempLine = function(mx, my) {
  if (!this.tempLine || !this._connectState) return;
  var fromNode = this.nodes[this._connectState.nodeId];
  if (!fromNode) return;
  var fromPorts = this.getOutPorts(fromNode);
  var portIdx = fromPorts.indexOf(this._connectState.portId);
  if (portIdx < 0) portIdx = 0;
  var outW = NODE_W / (fromPorts.length + 1);
  var fromNH = this.getNodeHeight(fromNode);
  var x1 = fromNode.x + outW * (portIdx + 1);
  var y1 = fromNode.y + fromNH;

  var pt = this.clientToCanvas(mx, my);

  this.tempLine.setAttribute('x1', x1);
  this.tempLine.setAttribute('y1', y1);
  this.tempLine.setAttribute('x2', pt.x);
  this.tempLine.setAttribute('y2', pt.y);
};

FlowEngine.prototype.removeTempLine = function() {
  if (this.tempLine) { this.tempLine.remove(); this.tempLine = null; }
};

FlowEngine.prototype.updateNodeCount = function() {
  var el = document.getElementById('cfNodeCount');
  if (el) el.textContent = Object.keys(this.nodes).length + ' nodes';
};

FlowEngine.prototype.pushUndo = function() {
  this.undoStack.push(this.serialize());
  if (this.undoStack.length > 50) this.undoStack.shift();
  this.redoStack = [];
};

FlowEngine.prototype.undo = function() {
  if (this.undoStack.length === 0) return;
  this.redoStack.push(this.serialize());
  var state = this.undoStack.pop();
  this.deserialize(state);
  this.syncToCode();
  this.render();
};

FlowEngine.prototype.redo = function() {
  if (this.redoStack.length === 0) return;
  this.undoStack.push(this.serialize());
  var state = this.redoStack.pop();
  this.deserialize(state);
  this.syncToCode();
  this.render();
};

FlowEngine.prototype.serialize = function() {
  var ns = {};
  for (var k in this.nodes) {
    var n = this.nodes[k];
    ns[k] = { id: n.id, cmd: n.cmd, x: n.x, y: n.y, params: JSON.parse(JSON.stringify(n.params)) };
  }
  return JSON.stringify({ nodes: ns, connections: JSON.parse(JSON.stringify(this.connections)), nextId: this.nextId });
};

FlowEngine.prototype.deserialize = function(json) {
  var state = JSON.parse(json);
  this.nodes = {};
  for (var k in state.nodes) {
    this.nodes[k] = state.nodes[k];
    this.nodes[k]._el = null;
  }
  this.connections = state.connections || {};
  this.nextId = state.nextId || 1;
  this.selectedId = null;
};

FlowEngine.prototype.clear = function() {
  this.nodes = {};
  this.connections = {};
  this.selectedId = null;
  this.render();
  this.updateNodeCount();
};

FlowEngine.prototype.fromAST = function(ast) {
  if (this._syncLock) return;
  this._syncLock = true;
  try {
    this.nodes = {};
    this.connections = {};
    this.nextId = 1;
    this.selectedId = null;

    var self = this;
    var prevId = null;

    function processStmt(stmt, parentId, parentPort) {
      if (!stmt) return null;
      var nodeId = self.addNodeFromAST(stmt);
      if (parentId !== null && parentPort) {
        self.addConnection(parentId, parentPort, nodeId, 'in');
      }
      return nodeId;
    }

    function processBody(stmts, parentId, parentPort) {
      var prev = parentId;
      var prevPort = parentPort;
      for (var i = 0; i < stmts.length; i++) {
        var stmt = stmts[i];
        var nid = processStmt(stmt, prev, prevPort);
        if (!nid) continue;

        if (stmt.type === 'IfStatement') {
          if (stmt.thenBody.length > 0) processBody(stmt.thenBody, nid, 'true');
          if (stmt.elseBody.length > 0) processBody(stmt.elseBody, nid, 'false');
          prev = nid;
          prevPort = 'out';
        } else if (stmt.type === 'Loop') {
          if (stmt.body.length > 0) processBody(stmt.body, nid, 'body');
          prev = nid;
          prevPort = 'next';
        } else if (stmt.type === 'TryCatch') {
          if (stmt.tryBody.length > 0) processBody(stmt.tryBody, nid, 'body');
          if (stmt.catchBody.length > 0) processBody(stmt.catchBody, nid, 'catch');
          prev = nid;
          prevPort = 'next';
        } else if (stmt.type === 'FunctionDecl') {
          if (stmt.body.length > 0) processBody(stmt.body, nid, 'body');
          prev = nid;
          prevPort = 'next';
        } else {
          prev = nid;
          prevPort = 'out';
        }
      }
    }

    processBody(ast.body, null, null);
    this.autoLayout();
    this.render();
    this.zoomFit();
  } finally {
    this._syncLock = false;
  }
};

FlowEngine.prototype.addNodeFromAST = function(stmt) {
  var cmd = this.astTypeToCmd(stmt);
  var id = this.addNode(cmd, 0, 0);
  var node = this.nodes[id];

  switch(stmt.type) {
    case 'VarDecl':
      node.params.name = stmt.name || '';
      node.params.value = this.exprToStr(stmt.value);
      break;
    case 'Assignment':
      node.params.name = stmt.name || '';
      node.params.value = this.exprToStr(stmt.value);
      break;
    case 'Trade':
      node.params.size = stmt.size ? this.exprToStr(stmt.size) : '1';
      node.params.orderType = stmt.orderType || 'MARKET';
      if (stmt.stop) node.params.stop = this.exprToStr(stmt.stop);
      if (stmt.limit) node.params.limit = this.exprToStr(stmt.limit);
      if (stmt.reason) node.params.reason = this.exprToStr(stmt.reason);
      break;
    case 'Exit':
      node.params.exitType = stmt.exitType || 'ALL';
      if (stmt.reason) node.params.reason = this.exprToStr(stmt.reason);
      break;
    case 'TrailStop':
      node.params.distance = this.exprToStr(stmt.distance);
      if (stmt.accel) node.params.accel = this.exprToStr(stmt.accel);
      if (stmt.max) node.params.max = this.exprToStr(stmt.max);
      break;
    case 'IfStatement':
      node.params.condition = this.exprToStr(stmt.condition);
      break;
    case 'Loop':
      if (node.cmd === 'WHILE') {
        node.params.condition = this.exprToStr(stmt.condition);
      } else if (stmt.isForever) { node.params.forever = 'true'; node.params.count = ''; }
      else if (stmt.condition && stmt.condition.type === 'LoopCount') { node.params.count = this.exprToStr(stmt.condition.num); }
      else { node.params.count = this.exprToStr(stmt.condition); }
      break;
    case 'TryCatch':
      node.params.catchVar = stmt.catchVar || 'err';
      break;
    case 'ErrorThrow':
      node.params.message = this.exprToStr(stmt.message);
      break;
    case 'Wait':
      node.params.ms = this.exprToStr(stmt.ms);
      break;
    case 'AIQuery':
      if (stmt.prompt) node.params.prompt = this.exprToStr(stmt.prompt);
      if (stmt.tool) node.params.tool = this.exprToStr(stmt.tool);
      if (stmt.arg) node.params.arg = this.exprToStr(stmt.arg);
      break;
    case 'AIGenerate':
      if (stmt.prompt) node.params.prompt = this.exprToStr(stmt.prompt);
      if (stmt.toName) node.params.to = this.exprToStr(stmt.toName);
      break;
    case 'AnalyzeLog':
      if (stmt.query) node.params.query = this.exprToStr(stmt.query);
      break;
    case 'RunML':
      if (stmt.modelCode) node.params.model = this.exprToStr(stmt.modelCode);
      if (stmt.dataVar) node.params.data = this.exprToStr(stmt.dataVar);
      break;
    case 'ClawWeb':
      if (stmt.url) node.params.url = this.exprToStr(stmt.url);
      if (stmt.instruct) node.params.instruct = this.exprToStr(stmt.instruct);
      break;
    case 'ClawX':
      if (stmt.query) node.params.query = this.exprToStr(stmt.query);
      break;
    case 'ClawPdf':
      if (stmt.fileName) node.params.file = this.exprToStr(stmt.fileName);
      if (stmt.query) node.params.query = this.exprToStr(stmt.query);
      break;
    case 'ClawImage':
      if (stmt.description) node.params.description = this.exprToStr(stmt.description);
      break;
    case 'ClawVideo':
      if (stmt.url) node.params.url = this.exprToStr(stmt.url);
      break;
    case 'ClawConversation':
      if (stmt.query) node.params.query = this.exprToStr(stmt.query);
      break;
    case 'ClawTool':
      if (stmt.toolName) node.params.toolName = this.exprToStr(stmt.toolName);
      break;
    case 'ClawCode':
      if (stmt.code) node.params.code = this.exprToStr(stmt.code);
      break;
    case 'SpawnAgent':
      if (stmt.name) node.params.name = this.exprToStr(stmt.name);
      if (stmt.prompt) node.params.prompt = this.exprToStr(stmt.prompt);
      break;
    case 'CallSession':
      if (stmt.agentName) node.params.agent = this.exprToStr(stmt.agentName);
      if (stmt.command) node.params.command = this.exprToStr(stmt.command);
      break;
    case 'MutateConfig':
      if (stmt.key) node.params.key = this.exprToStr(stmt.key);
      if (stmt.value) node.params.value = this.exprToStr(stmt.value);
      break;
    case 'Alert':
      if (stmt.message) node.params.message = this.exprToStr(stmt.message);
      if (stmt.level) node.params.level = this.exprToStr(stmt.level);
      if (stmt.to) node.params.to = this.exprToStr(stmt.to);
      break;
    case 'SayToSession':
      if (stmt.sessionId) node.params.sessionId = this.exprToStr(stmt.sessionId);
      if (stmt.message) node.params.message = this.exprToStr(stmt.message);
      break;
    case 'WaitForReply':
      if (stmt.sessionId) node.params.sessionId = this.exprToStr(stmt.sessionId);
      break;
    case 'StoreVar':
      if (stmt.key) node.params.key = this.exprToStr(stmt.key);
      if (stmt.value) node.params.value = this.exprToStr(stmt.value);
      break;
    case 'LoadVar':
      if (stmt.key) node.params.key = this.exprToStr(stmt.key);
      break;
    case 'CrashScan':
      node.params.state = stmt.state || 'ON';
      break;
    case 'MarketNomad':
      node.params.state = stmt.state || 'ON';
      break;
    case 'NomadScan':
      if (stmt.category) node.params.category = this.exprToStr(stmt.category);
      break;
    case 'NomadAllocate':
      if (stmt.target) node.params.to = this.exprToStr(stmt.target);
      if (stmt.sizing) node.params.sizing = this.exprToStr(stmt.sizing);
      break;
    case 'RumorScan':
      if (stmt.topic) node.params.topic = this.exprToStr(stmt.topic);
      if (stmt.sources) node.params.sources = this.exprToStr(stmt.sources);
      break;
    case 'Optimize':
      node.params.varName = stmt.varName || '';
      if (stmt.fromVal) node.params.from = this.exprToStr(stmt.fromVal);
      if (stmt.toVal) node.params.to = this.exprToStr(stmt.toVal);
      if (stmt.stepVal) node.params.step = this.exprToStr(stmt.stepVal);
      break;
    case 'Include':
      if (stmt.scriptName) node.params.scriptName = this.exprToStr(stmt.scriptName);
      break;
    case 'FunctionDecl':
      node.params.name = stmt.name || '';
      node.params.args = (stmt.params || []).join(', ');
      break;
  }
  return id;
};

FlowEngine.prototype.astTypeToCmd = function(stmt) {
  var map = {
    'VarDecl': function(s) { return s.isDef ? 'DEF' : 'SET'; },
    'Assignment': function() { return 'SET'; },
    'Trade': function(s) { return s.command || 'BUY'; },
    'Exit': function() { return 'EXIT'; },
    'TrailStop': function() { return 'TRAILSTOP'; },
    'IfStatement': function() { return 'IF'; },
    'Loop': function(s) { return s.loopType === 'WHILE' ? 'WHILE' : 'LOOP'; },
    'TryCatch': function() { return 'TRY'; },
    'ErrorThrow': function() { return 'ERROR'; },
    'Wait': function() { return 'WAIT'; },
    'AIQuery': function() { return 'AI_QUERY'; },
    'AIGenerate': function() { return 'AI_GENERATE_SCRIPT'; },
    'AnalyzeLog': function() { return 'ANALYZE_LOG'; },
    'RunML': function() { return 'RUN_ML'; },
    'ClawWeb': function() { return 'CLAW_WEB'; },
    'ClawX': function() { return 'CLAW_X'; },
    'ClawPdf': function() { return 'CLAW_PDF'; },
    'ClawImage': function() { return 'CLAW_IMAGE'; },
    'ClawVideo': function() { return 'CLAW_VIDEO'; },
    'ClawImageView': function() { return 'CLAW_IMAGE'; },
    'ClawConversation': function() { return 'CLAW_CONVERSATION'; },
    'ClawTool': function() { return 'CLAW_TOOL'; },
    'ClawCode': function() { return 'CLAW_CODE'; },
    'SpawnAgent': function() { return 'SPAWN_AGENT'; },
    'CallSession': function() { return 'CALL_SESSION'; },
    'MutateConfig': function() { return 'MUTATE_CONFIG'; },
    'Alert': function() { return 'ALERT'; },
    'SayToSession': function() { return 'SAY_TO_SESSION'; },
    'WaitForReply': function() { return 'WAIT_FOR_REPLY'; },
    'StoreVar': function() { return 'STORE_VAR'; },
    'LoadVar': function() { return 'LOAD_VAR'; },
    'CrashScan': function() { return 'CRASH_SCAN'; },
    'MarketNomad': function() { return 'MARKET_NOMAD'; },
    'NomadScan': function() { return 'NOMAD_SCAN'; },
    'NomadAllocate': function() { return 'NOMAD_ALLOCATE'; },
    'RumorScan': function() { return 'RUMOR_SCAN'; },
    'Optimize': function() { return 'OPTIMIZE'; },
    'IndicatorCall': function() { return 'INDICATOR'; },
    'Include': function() { return 'INCLUDE'; },
    'FunctionDecl': function() { return 'DEF_FUNC'; },
    'Chain': function() { return 'CHAIN'; }
  };
  var fn = map[stmt.type];
  return fn ? fn(stmt) : 'WAIT';
};

FlowEngine.prototype.exprToStr = function(expr) {
  if (!expr) return '';
  switch(expr.type) {
    case 'NumberLiteral': return String(expr.value);
    case 'StringLiteral': return expr.value;
    case 'BooleanLiteral': return String(expr.value);
    case 'NullLiteral': return '';
    case 'Identifier': return expr.value;
    case 'BinaryExpr': return this.exprToStr(expr.left) + ' ' + expr.op + ' ' + this.exprToStr(expr.right);
    case 'UnaryExpr': return expr.op + this.exprToStr(expr.expr);
    case 'ContainsExpr': return this.exprToStr(expr.left) + ' CONTAINS ' + this.exprToStr(expr.right);
    case 'CrossesExpr': return this.exprToStr(expr.left) + ' CROSSES ' + (expr.direction || 'OVER') + ' ' + this.exprToStr(expr.right);
    case 'FunctionCall':
      return expr.name + '(' + (expr.args || []).map(this.exprToStr.bind(this)).join(', ') + ')';
    case 'MemberExpr': return this.exprToStr(expr.object) + '.' + expr.property;
    case 'LoopCount': return this.exprToStr(expr.num);
    default: return '';
  }
};

FlowEngine.prototype.syncToCode = function() {
  if (this._syncLock) return;
  this._syncLock = true;
  try {
    var code = this.toCode();
    this.onCodeChange(code);
  } finally {
    this._syncLock = false;
  }
};

FlowEngine.prototype.toCode = function() {
  var roots = this.findRoots();
  if (roots.length === 0) return '';
  var lines = [];
  var self = this;
  var visited = {};

  function gen(nodeId, indent) {
    if (!nodeId || visited[nodeId]) return;
    visited[nodeId] = true;
    var node = self.nodes[nodeId];
    if (!node) return;
    var p = indent || '';
    var line = self.nodeToLine(node);
    var outPorts = self.getOutPorts(node);
    var branching = outPorts.length > 1;

    if (branching) {
      if (node.cmd === 'IF') {
        lines.push(p + 'IF ' + (node.params.condition || 'true') + ' THEN');
        var trueTargets = self.getConnectedTo(nodeId, 'true');
        trueTargets.forEach(function(tid) { gen(tid, p + '  '); });
        var falseTargets = self.getConnectedTo(nodeId, 'false');
        if (falseTargets.length > 0) {
          lines.push(p + 'ELSE');
          falseTargets.forEach(function(tid) { gen(tid, p + '  '); });
        }
        lines.push(p + 'ENDIF');
      } else if (node.cmd === 'LOOP') {
        if (node.params.forever === 'true') lines.push(p + 'LOOP FOREVER');
        else lines.push(p + 'LOOP ' + (node.params.count || '1') + ' TIMES');
        var bodyTargets = self.getConnectedTo(nodeId, 'body');
        bodyTargets.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'ENDLOOP');
        var nextTargets = self.getConnectedTo(nodeId, 'next');
        nextTargets.forEach(function(tid) { gen(tid, p); });
      } else if (node.cmd === 'WHILE') {
        lines.push(p + 'WHILE ' + (node.params.condition || 'true'));
        var wbody = self.getConnectedTo(nodeId, 'body');
        wbody.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'ENDWHILE');
        var wnext = self.getConnectedTo(nodeId, 'next');
        wnext.forEach(function(tid) { gen(tid, p); });
      } else if (node.cmd === 'TRY') {
        lines.push(p + 'TRY');
        var tbody = self.getConnectedTo(nodeId, 'body');
        tbody.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'CATCH ' + (node.params.catchVar || 'err'));
        var cbody = self.getConnectedTo(nodeId, 'catch');
        cbody.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'ENDTRY');
        var tnext = self.getConnectedTo(nodeId, 'next');
        tnext.forEach(function(tid) { gen(tid, p); });
      } else if (node.cmd === 'DEF_FUNC') {
        lines.push(p + 'DEF_FUNC ' + (node.params.name || 'func') + (node.params.args ? '(' + node.params.args + ')' : ''));
        var fbody = self.getConnectedTo(nodeId, 'body');
        fbody.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'ENDFUNC');
        var fnext = self.getConnectedTo(nodeId, 'next');
        fnext.forEach(function(tid) { gen(tid, p); });
      }
    } else {
      if (line) lines.push(p + line);
      var nextNodes = self.getConnectedTo(nodeId, 'out');
      nextNodes.forEach(function(tid) { gen(tid, p); });
    }
  }

  roots.forEach(function(rid) { gen(rid, ''); });
  return lines.join('\n');
};

FlowEngine.prototype.nodeToLine = function(node) {
  var p = node.params;
  switch(node.cmd) {
    case 'BUY':
      var line = 'BUY ' + (p.size || '1');
      if (p.orderType) line += ' AT ' + p.orderType;
      if (p.stop) line += ' STOP ' + p.stop;
      if (p.limit) line += ' LIMIT ' + p.limit;
      if (p.reason) line += ' REASON "' + p.reason + '"';
      return line;
    case 'SELL':
      var sl = 'SELL ' + (p.size || '1');
      if (p.orderType) sl += ' AT ' + p.orderType;
      if (p.stop) sl += ' STOP ' + p.stop;
      if (p.reason) sl += ' REASON "' + p.reason + '"';
      return sl;
    case 'SELLSHORT':
      var ss = 'SELLSHORT ' + (p.size || '1');
      if (p.stop) ss += ' STOP ' + p.stop;
      if (p.reason) ss += ' REASON "' + p.reason + '"';
      return ss;
    case 'EXIT': return 'EXIT ' + (p.exitType || 'ALL') + (p.reason ? ' REASON "' + p.reason + '"' : '');
    case 'CLOSE': return 'CLOSE' + (p.reason ? ' REASON "' + p.reason + '"' : '');
    case 'TRAILSTOP':
      var ts = 'TRAILSTOP ' + (p.distance || '25');
      if (p.accel) ts += ' ACCEL ' + p.accel;
      if (p.max) ts += ' MAX ' + p.max;
      return ts;
    case 'DEF': return 'DEF ' + (p.name || 'x') + ' = ' + (p.value || '0');
    case 'SET': return 'SET ' + (p.name || 'x') + ' = ' + (p.value || '0');
    case 'STORE_VAR': return 'STORE_VAR "' + (p.key || '') + '" ' + (p.value || '""');
    case 'LOAD_VAR': return 'LOAD_VAR "' + (p.key || '') + '"' + (p.default ? ' DEFAULT ' + p.default : '');
    case 'WAIT': return 'WAIT ' + (p.ms || '1000');
    case 'ERROR': return 'ERROR "' + (p.message || '') + '"';
    case 'AI_QUERY':
      var aq = 'AI_QUERY "' + (p.prompt || '') + '"';
      if (p.tool) aq += ' TOOL "' + p.tool + '"';
      if (p.arg) aq += ' ARG "' + p.arg + '"';
      return aq;
    case 'AI_GENERATE_SCRIPT': return 'AI_GENERATE_SCRIPT "' + (p.prompt || '') + '"' + (p.to ? ' TO "' + p.to + '"' : '');
    case 'ANALYZE_LOG': return 'ANALYZE_LOG "' + (p.query || '') + '"' + (p.limit ? ' LIMIT ' + p.limit : '');
    case 'RUN_ML': return 'RUN_ML "' + (p.model || '') + '"' + (p.data ? ' ON ' + p.data : '');
    case 'CLAW_WEB': return 'CLAW_WEB "' + (p.url || '') + '"' + (p.instruct ? ' INSTRUCT "' + p.instruct + '"' : '');
    case 'CLAW_X': return 'CLAW_X "' + (p.query || '') + '"' + (p.limit ? ' LIMIT ' + p.limit : '');
    case 'CLAW_PDF': return 'CLAW_PDF "' + (p.file || '') + '"' + (p.query ? ' QUERY "' + p.query + '"' : '');
    case 'CLAW_IMAGE': return 'CLAW_IMAGE "' + (p.description || '') + '"' + (p.num ? ' NUM ' + p.num : '');
    case 'CLAW_VIDEO': return 'CLAW_VIDEO "' + (p.url || '') + '"';
    case 'CLAW_CONVERSATION': return 'CLAW_CONVERSATION "' + (p.query || '') + '"';
    case 'CLAW_TOOL': return 'CLAW_TOOL "' + (p.toolName || '') + '"';
    case 'CLAW_CODE': return 'CLAW_CODE "' + (p.code || '') + '"';
    case 'SPAWN_AGENT': return 'SPAWN_AGENT "' + (p.name || '') + '"' + (p.prompt ? ' WITH "' + p.prompt + '"' : '');
    case 'CALL_SESSION': return 'CALL_SESSION "' + (p.agent || '') + '" "' + (p.command || '') + '"';
    case 'MUTATE_CONFIG': return 'MUTATE_CONFIG "' + (p.key || '') + '" = ' + (p.value || 'null');
    case 'ALERT':
      var al = 'ALERT "' + (p.message || '') + '"';
      if (p.level) al += ' LEVEL "' + p.level + '"';
      if (p.to) al += ' TO "' + p.to + '"';
      return al;
    case 'SAY_TO_SESSION': return 'SAY_TO_SESSION "' + (p.sessionId || '') + '" "' + (p.message || '') + '"';
    case 'WAIT_FOR_REPLY': return 'WAIT_FOR_REPLY "' + (p.sessionId || '') + '"' + (p.timeout ? ' TIMEOUT ' + p.timeout : '');
    case 'CRASH_SCAN': return 'CRASH_SCAN ' + (p.state || 'ON');
    case 'MARKET_NOMAD': return 'MARKET_NOMAD ' + (p.state || 'ON');
    case 'NOMAD_SCAN': return 'NOMAD_SCAN "' + (p.category || '') + '"' + (p.limit ? ' LIMIT ' + p.limit : '');
    case 'NOMAD_ALLOCATE':
      var na = 'NOMAD_ALLOCATE';
      if (p.to) na += ' TO "' + p.to + '"';
      if (p.sizing) na += ' SIZING ' + p.sizing;
      return na;
    case 'RUMOR_SCAN': return 'RUMOR_SCAN "' + (p.topic || '') + '"' + (p.sources ? ' SOURCES "' + p.sources + '"' : '');
    case 'OPTIMIZE':
      var op = 'OPTIMIZE ' + (p.varName || 'x');
      if (p.from) op += ' FROM ' + p.from;
      if (p.to) op += ' TO ' + p.to;
      if (p.step) op += ' STEP ' + p.step;
      return op;
    case 'INDICATOR': return 'INDICATOR ' + (p.name || 'RSI') + (p.params ? '(' + p.params + ')' : '');
    case 'INCLUDE': return 'INCLUDE "' + (p.scriptName || '') + '"';
    case 'CHAIN': return 'CHAIN';
    default: return '// ' + node.cmd;
  }
};

FlowEngine.prototype.findRoots = function() {
  var hasIncoming = {};
  for (var k in this.connections) {
    hasIncoming[this.connections[k].toId] = true;
  }
  var roots = [];
  for (var nk in this.nodes) {
    if (!hasIncoming[nk]) roots.push(nk);
  }
  if (roots.length === 0 && Object.keys(this.nodes).length > 0) {
    roots.push(Object.keys(this.nodes)[0]);
  }
  roots.sort(function(a, b) {
    var na = parseInt(a.replace('n', ''));
    var nb = parseInt(b.replace('n', ''));
    return na - nb;
  });
  return roots;
};

FlowEngine.prototype.getConnectedTo = function(nodeId, portId) {
  var results = [];
  for (var k in this.connections) {
    var c = this.connections[k];
    if (c.fromId === nodeId && c.fromPort === portId) results.push(c.toId);
  }
  return results;
};

FlowEngine.prototype.autoLayout = function() {
  var roots = this.findRoots();
  if (roots.length === 0) return;
  var self = this;
  var levels = {};
  var maxLevel = 0;
  var visited = {};
  var order = [];

  function assignLevel(nodeId, level) {
    if (visited[nodeId]) {
      if (level > (levels[nodeId] || 0)) levels[nodeId] = level;
      return;
    }
    visited[nodeId] = true;
    levels[nodeId] = level;
    if (level > maxLevel) maxLevel = level;
    order.push(nodeId);

    var outPorts = self.getOutPorts(self.nodes[nodeId]);
    for (var pi = 0; pi < outPorts.length; pi++) {
      var targets = self.getConnectedTo(nodeId, outPorts[pi]);
      for (var ti = 0; ti < targets.length; ti++) {
        assignLevel(targets[ti], level + 1);
      }
    }
  }

  for (var ri = 0; ri < roots.length; ri++) {
    assignLevel(roots[ri], 0);
  }

  for (var nk in this.nodes) {
    if (!visited[nk]) {
      levels[nk] = maxLevel + 1;
      order.push(nk);
    }
  }

  var levelNodes = {};
  for (var i = 0; i < order.length; i++) {
    var lv = levels[order[i]];
    if (!levelNodes[lv]) levelNodes[lv] = [];
    levelNodes[lv].push(order[i]);
  }

  var gapX = 30;
  var gapY = 30;
  var startX = 50;
  var startY = 30;

  for (var l = 0; l <= maxLevel + 1; l++) {
    if (!levelNodes[l]) continue;
    var nodesInLevel = levelNodes[l];
    for (var ni = 0; ni < nodesInLevel.length; ni++) {
      var node = this.nodes[nodesInLevel[ni]];
      if (node) {
        node.x = startX + ni * (NODE_W + gapX);
        var nh = this.getNodeHeight(node);
        node.y = startY + l * (nh + gapY + 20);
      }
    }
  }
};

FlowEngine.prototype.exportPNG = function() {
  var keys = Object.keys(this.nodes);
  if (keys.length === 0) return;

  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  var self = this;
  keys.forEach(function(k) {
    var n = self.nodes[k];
    var nh = self.getNodeHeight(n);
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + NODE_W > maxX) maxX = n.x + NODE_W;
    if (n.y + nh > maxY) maxY = n.y + nh;
  });

  var pad = 30;
  var w = maxX - minX + pad * 2;
  var h = maxY - minY + pad * 2;
  var canvas = document.createElement('canvas');
  canvas.width = w * 2;
  canvas.height = h * 2;
  var ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, w, h);

  keys.forEach(function(k) {
    var n = self.nodes[k];
    var def = getCmdDef(n.cmd);
    var cat = def ? def.cat : null;
    var color = cat ? cat.color : '#8b949e';
    var bg = cat ? cat.bg : '#21262d';
    var nh = self.getNodeHeight(n);
    var x = n.x - minX + pad;
    var y = n.y - minY + pad;

    ctx.fillStyle = bg;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, NODE_W, nh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(x, y, NODE_W, NODE_HEADER_H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(n.cmd, x + 8, y + 19);
  });

  for (var ck in self.connections) {
    var c = self.connections[ck];
    var fromN = self.nodes[c.fromId];
    var toN = self.nodes[c.toId];
    if (!fromN || !toN) continue;
    var fromPorts = self.getOutPorts(fromN);
    var portIdx = fromPorts.indexOf(c.fromPort);
    if (portIdx < 0) portIdx = 0;
    var outW = NODE_W / (fromPorts.length + 1);
    var fromNH = self.getNodeHeight(fromN);
    var x1 = fromN.x - minX + pad + outW * (portIdx + 1);
    var y1 = fromN.y - minY + pad + fromNH;
    var x2 = toN.x - minX + pad + NODE_W / 2;
    var y2 = toN.y - minY + pad;

    ctx.strokeStyle = c.fromPort === 'true' ? '#2dc653' : c.fromPort === 'false' ? '#f85149' : c.fromPort === 'body' ? '#f0883e' : '#484f58';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    var cp = Math.max(30, Math.abs(y2 - y1) * 0.4);
    ctx.bezierCurveTo(x1, y1 + cp, x2, y2 - cp, x2, y2);
    ctx.stroke();
  }

  canvas.toBlob(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'clawscript-flow.png';
    a.click();
    URL.revokeObjectURL(url);
  });
};

window.ClawFlowEngine = FlowEngine;

})();
