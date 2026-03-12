var _strategySchemas = null;

async function loadStrategySchemas() {
  if (_strategySchemas) return _strategySchemas;
  try {
    var data = await apiFetch('/api/ig/scalper/strategy-schemas');
    if (data && typeof data === 'object') {
      _strategySchemas = data.schemas || data;
      return _strategySchemas;
    }
  } catch (e) {}
  return {};
}

function getStrategyTypeOptions() {
  var schemas = _strategySchemas || {};
  var types = Object.keys(schemas);
  if (types.length === 0) {
    return [
      'scalper', 'momentum-scalper', 'mean-reversion', 'trend-following',
      'breakout', 'swing-trading', 'position-trading', 'grid-trader',
      'donchian-trend', 'volatility-breakout', 'carry-trade', 'arbitrage-scalper',
      'market-making', 'news-spike', 'pairs-trading', 'hybrid-ml',
      'portfolio-optimizer', 'seasonal-trader', 'sentiment-trader',
      'value-investing', 'options-linked'
    ];
  }
  return types.sort();
}

function buildStrategyTypeDropdown(selectedType) {
  var types = getStrategyTypeOptions();
  var csTypes = _clawScriptStrategyTypes || [];
  var html = '<select class="edit-input" id="seditStratType" onchange="onStrategyTypeChange()">';
  html += '<optgroup label="Built-in Strategies">';
  for (var i = 0; i < types.length; i++) {
    var label = types[i].replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    html += '<option value="' + types[i] + '"' + (types[i] === selectedType ? ' selected' : '') + '>' + label + '</option>';
  }
  html += '</optgroup>';
  html += '<optgroup label="ClawScript Strategies">';
  if (csTypes.length === 0) {
    html += '<option value="" disabled style="color:#484f58">No ClawScript strategies</option>';
  } else {
    for (var j = 0; j < csTypes.length; j++) {
      var cs = csTypes[j];
      var csValue = cs.type || cs.name || '';
      var csLabel = (cs.name || csValue).replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      html += '<option value="' + csValue + '" style="color:#56d4dd"' + (csValue === selectedType ? ' selected' : '') + '>' + csLabel + '</option>';
    }
  }
  html += '</optgroup>';
  html += '</select>';
  return html;
}

var _clawScriptStrategyTypes = [];

async function loadClawScriptStrategyTypes() {
  try {
    var data = await apiFetch('/api/clawscript/strategies');
    var strategies = (data && data.strategies) ? data.strategies : [];
    _clawScriptStrategyTypes = strategies;
    return strategies;
  } catch (e) {
    _clawScriptStrategyTypes = [];
    return [];
  }
}

var FIELD_TOOLTIPS = {
  name: 'Friendly name for this strategy',
  direction: 'Trade direction: BUY only, SELL only, or BOTH',
  timeframe: 'Candle resolution for signal evaluation',
  size: 'Position size in contracts/lots',
  stopDistance: 'Stop loss distance in points from entry',
  limitDistance: 'Take profit distance in points from entry',
  minMomentumPct: 'Minimum price momentum % to trigger entry',
  cooldownMs: 'Milliseconds to wait between trades',
  tickWindow: 'Number of ticks/candles for momentum calculation',
  maxOpenPositions: 'Maximum simultaneous open positions per strategy',
  minSize: 'Minimum allowed position size',
  maxSize: 'Maximum allowed position size',
  profitTarget: 'Close position when profit reaches this dollar amount',
  trailingStop: 'Trailing stop distance in points',
  warmupMs: 'Warmup period before strategy starts evaluating',
  rsiEnabled: 'Enable RSI indicator filter',
  rsiPeriod: 'RSI calculation period (default 14)',
  rsiOverbought: 'RSI level above which market is considered overbought',
  rsiOversold: 'RSI level below which market is considered oversold',
  emaEnabled: 'Enable EMA crossover filter',
  emaShort: 'Short EMA period for crossover',
  emaLong: 'Long EMA period for crossover',
  macdEnabled: 'Enable MACD indicator filter',
  macdFast: 'MACD fast EMA period',
  macdSlow: 'MACD slow EMA period',
  macdSignal: 'MACD signal line period',
  strategyType: 'Strategy plugin type (changing this on an enabled strategy auto-disables it)',
  adxEnabled: 'Enable ADX trend strength filter',
  adxPeriod: 'ADX calculation period',
  adxThreshold: 'Minimum ADX value for trend confirmation',
  bollingerEnabled: 'Enable Bollinger Bands filter',
  bollingerPeriod: 'Bollinger Bands calculation period',
  bollingerSd: 'Bollinger Bands standard deviation multiplier',
  stochasticEnabled: 'Enable Stochastic Oscillator filter',
  stochasticK: 'Stochastic %K period',
  stochasticD: 'Stochastic %D smoothing period',
  atrEnabled: 'Enable ATR-based volatility filter',
  atrPeriod: 'ATR calculation period',
  atrMultiplier: 'ATR multiplier for stop/target calculation',
  rocEnabled: 'Enable Rate of Change momentum filter',
  rocPeriod: 'ROC calculation period',
  rocThreshold: 'Minimum ROC value for signal',
  cciEnabled: 'Enable CCI oscillator filter',
  cciPeriod: 'CCI calculation period',
  cciThreshold: 'CCI threshold for overbought/oversold',
  williamsEnabled: 'Enable Williams %R filter',
  williamsPeriod: 'Williams %R calculation period',
  keltnerEnabled: 'Enable Keltner Channel filter',
  keltnerPeriod: 'Keltner Channel EMA period',
  keltnerAtrMult: 'Keltner Channel ATR multiplier',
  ichimokuEnabled: 'Enable Ichimoku Cloud filter',
  ichimokuTenkan: 'Ichimoku Tenkan-sen period',
  ichimokuKijun: 'Ichimoku Kijun-sen period',
  ichimokuSenkou: 'Ichimoku Senkou Span B period',
  parabolicSarEnabled: 'Enable Parabolic SAR trend filter',
  sarAccel: 'SAR acceleration factor',
  sarMax: 'SAR maximum acceleration',
  aroonEnabled: 'Enable Aroon trend indicator',
  aroonPeriod: 'Aroon calculation period',
  obvEnabled: 'Enable On-Balance Volume filter',
  vwapEnabled: 'Enable VWAP (Volume Weighted Average Price)',
  zscoreEnabled: 'Enable Z-Score mean reversion filter',
  zscorePeriod: 'Z-Score calculation period',
  zscoreThreshold: 'Z-Score threshold for signal trigger',
  fibEnabled: 'Enable Fibonacci retracement levels',
  fibLookback: 'Fibonacci lookback period for swing detection',
  gridLevels: 'Number of grid levels for grid trading',
  gridSpacing: 'Point spacing between grid levels (0=auto ATR)',
  kellyEnabled: 'Enable Kelly Criterion position sizing',
  sentimentEnabled: 'Enable sentiment analysis from alerts'
};

var STRATEGY_FIELD_USAGE = {
  'claw-trader': ['minMomentumPct', 'cooldownMs', 'tickWindow', 'rsiEnabled', 'rsiPeriod', 'rsiOverbought', 'rsiOversold', 'emaEnabled', 'emaShort', 'emaLong', 'macdEnabled', 'macdFast', 'macdSlow', 'macdSignal'],
  'scalper': ['minMomentumPct', 'cooldownMs', 'tickWindow', 'rsiEnabled', 'rsiPeriod', 'rsiOverbought', 'rsiOversold', 'emaEnabled', 'emaShort', 'emaLong', 'macdEnabled', 'macdFast', 'macdSlow', 'macdSignal'],
  'momentum-claw': ['rocEnabled', 'rocPeriod', 'rocThreshold', 'minMomentumPct'],
  'mean-reversion': ['bollingerEnabled', 'bollingerPeriod', 'bollingerSd', 'stochasticEnabled', 'stochasticK', 'stochasticD', 'rsiEnabled', 'rsiPeriod'],
  'trend-following': ['adxEnabled', 'adxPeriod', 'adxThreshold', 'emaEnabled', 'emaShort', 'emaLong', 'parabolicSarEnabled', 'sarAccel', 'sarMax'],
  'breakout': ['atrEnabled', 'atrPeriod', 'atrMultiplier'],
  'volatility-breakout': ['keltnerEnabled', 'keltnerPeriod', 'keltnerAtrMult', 'atrEnabled', 'atrPeriod'],
  'grid-trader': ['gridLevels', 'gridSpacing', 'atrEnabled', 'atrPeriod'],
  'pairs-trading': ['zscoreEnabled', 'zscorePeriod', 'zscoreThreshold'],
  'arbitrage-claw': ['zscoreEnabled', 'zscorePeriod', 'zscoreThreshold'],
  'market-making': ['atrEnabled', 'atrPeriod', 'bollingerEnabled', 'bollingerPeriod'],
  'news-spike': ['minMomentumPct'],
  'carry-trade': ['emaEnabled', 'emaShort', 'emaLong'],
  'position-trading': ['ichimokuEnabled', 'ichimokuTenkan', 'ichimokuKijun', 'ichimokuSenkou', 'atrEnabled', 'atrPeriod'],
  'swing-trading': ['fibEnabled', 'fibLookback', 'rsiEnabled', 'rsiPeriod'],
  'value-investing': ['emaEnabled', 'emaShort', 'emaLong'],
  'sentiment-trader': ['sentimentEnabled', 'minMomentumPct'],
  'options-linked': ['atrEnabled', 'atrPeriod', 'minMomentumPct'],
  'seasonal-trader': ['emaEnabled', 'emaShort', 'emaLong'],
  'hybrid-ml': ['rsiEnabled', 'rsiPeriod', 'emaEnabled', 'emaShort', 'emaLong', 'macdEnabled', 'macdFast', 'macdSlow', 'macdSignal', 'bollingerEnabled', 'bollingerPeriod', 'atrEnabled', 'atrPeriod'],
  'portfolio-optimizer': ['kellyEnabled', 'atrEnabled', 'atrPeriod'],
  'donchian-trend': ['atrEnabled', 'atrPeriod', 'atrMultiplier']
};

var COMMON_FIELDS = ['name', 'direction', 'timeframe', 'size', 'stopDistance', 'limitDistance', 'maxOpenPositions', 'minSize', 'maxSize', 'profitTarget', 'trailingStop', 'warmupMs', 'strategyType'];

function onStrategyTypeChange() {
  var typeEl = document.getElementById('seditStratType');
  if (!typeEl) return;
  var sType = typeEl.value;
  if (isClawScriptStrategy(sType)) {
    renderClawScriptFields(sType, null);
  } else {
    var csContainer = document.getElementById('csCustomFields');
    if (csContainer) { csContainer.innerHTML = ''; csContainer.style.display = 'none'; }
    applyFieldVisibility(sType);
  }
}

function applyFieldVisibility(strategyType) {
  var usedFields = STRATEGY_FIELD_USAGE[strategyType] || [];
  var allUsed = COMMON_FIELDS.concat(usedFields);

  var container = document.getElementById('strategySettingsEdit');
  if (!container) return;

  var allFields = container.querySelectorAll('[data-config-field]');
  for (var i = 0; i < allFields.length; i++) {
    var fieldEl = allFields[i];
    var fieldName = fieldEl.getAttribute('data-config-field');
    var isUsed = allUsed.indexOf(fieldName) !== -1;
    var wrapper = fieldEl.closest('[data-field-wrapper]') || fieldEl.parentElement;

    if (isUsed) {
      wrapper.style.opacity = '1';
      wrapper.style.pointerEvents = '';
      var unusedLabel = wrapper.querySelector('.unused-label');
      if (unusedLabel) unusedLabel.remove();
    } else {
      wrapper.style.opacity = '0.35';
      wrapper.style.pointerEvents = 'none';
      if (!wrapper.querySelector('.unused-label')) {
        var span = document.createElement('span');
        span.className = 'unused-label';
        span.style.cssText = 'font-size:8px;color:#f0883e;margin-left:4px';
        span.textContent = '(unused)';
        var label = wrapper.querySelector('label');
        if (label) label.appendChild(span);
      }
    }
  }

  var indicatorSections = container.querySelectorAll('[data-indicator-section]');
  for (var j = 0; j < indicatorSections.length; j++) {
    var section = indicatorSections[j];
    var sectionName = section.getAttribute('data-indicator-section');
    var sectionUsed = false;
    var sectionFields = section.querySelectorAll('[data-config-field]');
    for (var k = 0; k < sectionFields.length; k++) {
      if (allUsed.indexOf(sectionFields[k].getAttribute('data-config-field')) !== -1) {
        sectionUsed = true;
        break;
      }
    }
    section.style.opacity = sectionUsed ? '1' : '0.35';
    section.style.pointerEvents = sectionUsed ? '' : 'none';
    var unusedLbl = section.querySelector('.unused-label');
    if (!sectionUsed && !unusedLbl) {
      var sp = document.createElement('span');
      sp.className = 'unused-label';
      sp.style.cssText = 'font-size:8px;color:#f0883e;margin-left:4px';
      sp.textContent = '(unused)';
      var lbl = section.querySelector('label');
      if (lbl) lbl.appendChild(sp);
    } else if (sectionUsed && unusedLbl) {
      unusedLbl.remove();
    }
  }
}

function applyTooltips() {
  var container = document.getElementById('strategySettingsEdit');
  if (!container) return;
  var fields = container.querySelectorAll('[data-config-field]');
  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i].getAttribute('data-config-field');
    if (FIELD_TOOLTIPS[fieldName]) {
      fields[i].title = FIELD_TOOLTIPS[fieldName];
      var label = fields[i].closest('[data-field-wrapper]');
      if (!label) label = fields[i].parentElement;
      var lbl = label ? label.querySelector('label') : null;
      if (lbl) lbl.title = FIELD_TOOLTIPS[fieldName];
    }
  }
}

var _csSchemaCache = {};

async function loadClawScriptSchema(strategyType) {
  if (_csSchemaCache[strategyType]) return _csSchemaCache[strategyType];
  try {
    var data = await apiFetch('/api/clawscript/strategies/' + encodeURIComponent(strategyType) + '/schema');
    if (data && data.schema) {
      _csSchemaCache[strategyType] = data;
      return data;
    }
  } catch (e) {}
  return null;
}

function isClawScriptStrategy(strategyType) {
  return strategyType && strategyType.startsWith('custom-');
}

async function renderClawScriptFields(strategyType, strategyConfig) {
  var container = document.getElementById('csCustomFields');
  if (!container) {
    container = document.createElement('div');
    container.id = 'csCustomFields';
    container.style.cssText = 'margin-top:12px;border-top:1px solid #30363d;padding-top:10px';
    var editPanel = document.getElementById('strategySettingsEdit');
    if (editPanel) {
      var saveBtn = editPanel.querySelector('.btn-save');
      if (saveBtn && saveBtn.parentElement) {
        saveBtn.parentElement.parentElement.insertBefore(container, saveBtn.parentElement);
      } else {
        editPanel.appendChild(container);
      }
    }
  }

  var schemaData = await loadClawScriptSchema(strategyType);
  if (!schemaData || !schemaData.schema) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  var csFields = schemaData.schema.filter(function(f) { return f.clawscript; });
  if (csFields.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  var html = '<div style="margin-bottom:8px"><span style="color:#56d4dd;font-weight:600;font-size:12px">ClawScript Variables</span></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">';

  for (var i = 0; i < csFields.length; i++) {
    var f = csFields[i];
    var val = (strategyConfig && strategyConfig[f.key] != null) ? strategyConfig[f.key] : f.default;
    var tooltipAttr = f.tooltip ? ' title="' + f.tooltip.replace(/"/g, '&quot;') + '"' : '';

    html += '<div data-field-wrapper data-config-field="' + f.key + '"' + tooltipAttr + '>';
    html += '<label style="color:#8b949e"' + tooltipAttr + '>' + f.label + '</label>';

    if (f.type === 'boolean') {
      html += '<select class="edit-input cs-custom-field" data-cs-key="' + f.key + '">';
      html += '<option value="true"' + (val ? ' selected' : '') + '>Yes</option>';
      html += '<option value="false"' + (!val ? ' selected' : '') + '>No</option>';
      html += '</select>';
    } else if (f.type === 'number') {
      html += '<input class="edit-input cs-custom-field" data-cs-key="' + f.key + '" type="number" step="any" value="' + (val != null ? val : '') + '">';
    } else {
      html += '<input class="edit-input cs-custom-field" data-cs-key="' + f.key + '" type="text" value="' + (val != null ? val : '') + '">';
    }
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;

  applyClawScriptFieldVisibility(strategyType);
}

function applyClawScriptFieldVisibility(strategyType) {
  if (!isClawScriptStrategy(strategyType)) return;

  var container = document.getElementById('strategySettingsEdit');
  if (!container) return;

  var stdFields = container.querySelectorAll('[data-config-field]');
  var csContainer = document.getElementById('csCustomFields');
  var csKeys = [];
  if (csContainer) {
    var csFieldEls = csContainer.querySelectorAll('.cs-custom-field');
    for (var k = 0; k < csFieldEls.length; k++) {
      csKeys.push(csFieldEls[k].getAttribute('data-cs-key'));
    }
  }

  for (var i = 0; i < stdFields.length; i++) {
    var fieldEl = stdFields[i];
    var fieldName = fieldEl.getAttribute('data-config-field');
    if (csKeys.indexOf(fieldName) !== -1) continue;

    var wrapper = fieldEl.closest('[data-field-wrapper]') || fieldEl.parentElement;
    if (!wrapper || wrapper.closest('#csCustomFields')) continue;

    var isCommon = COMMON_FIELDS.indexOf(fieldName) !== -1;
    if (!isCommon) {
      wrapper.style.opacity = '0.35';
      wrapper.style.pointerEvents = 'none';
      if (!wrapper.querySelector('.unused-label')) {
        var span = document.createElement('span');
        span.className = 'unused-label';
        span.style.cssText = 'font-size:8px;color:#f0883e;margin-left:4px';
        span.textContent = '(unused)';
        var label = wrapper.querySelector('label');
        if (label) label.appendChild(span);
      }
    }
  }
}

function collectClawScriptFieldValues() {
  var result = {};
  var fields = document.querySelectorAll('.cs-custom-field');
  for (var i = 0; i < fields.length; i++) {
    var key = fields[i].getAttribute('data-cs-key');
    var val = fields[i].value;
    if (fields[i].type === 'number') val = parseFloat(val) || 0;
    else if (fields[i].tagName === 'SELECT' && (val === 'true' || val === 'false')) val = val === 'true';
    result[key] = val;
  }
  return result;
}
