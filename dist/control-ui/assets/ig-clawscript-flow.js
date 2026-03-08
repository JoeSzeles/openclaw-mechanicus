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
  },
  { id: 'tradingview', label: 'TradingView', color: '#f78166', bg: '#3d2200',
    items: [
      { cmd: 'STRATEGY_ENTRY', doc: 'TradingView-style strategy entry', params: [{k:'name',l:'Name',d:''},{k:'direction',l:'Direction',d:'long'},{k:'sizing',l:'Sizing',d:''},{k:'stop',l:'Stop',d:''}] },
      { cmd: 'STRATEGY_EXIT', doc: 'TradingView-style strategy exit', params: [{k:'name',l:'Name',d:''},{k:'reason',l:'Reason',d:''}] },
      { cmd: 'STRATEGY_CLOSE', doc: 'Close all strategy positions', params: [{k:'reason',l:'Reason',d:''}] },
      { cmd: 'INPUT_INT', doc: 'Declare integer input parameter', params: [{k:'name',l:'Name',d:''},{k:'default',l:'Default',d:'14'}] },
      { cmd: 'INPUT_FLOAT', doc: 'Declare float input parameter', params: [{k:'name',l:'Name',d:''},{k:'default',l:'Default',d:'0.5'}] },
      { cmd: 'INPUT_BOOL', doc: 'Declare boolean input parameter', params: [{k:'name',l:'Name',d:''},{k:'default',l:'Default',d:'true'}] },
      { cmd: 'INPUT_SYMBOL', doc: 'Declare symbol input parameter', params: [{k:'name',l:'Name',d:''},{k:'default',l:'Default',d:''}] },
      { cmd: 'TIMEFRAME_PERIOD', doc: 'Get current timeframe period', params: [] },
      { cmd: 'TIMEFRAME_IS_DAILY', doc: 'Check if current timeframe is daily', params: [] },
      { cmd: 'ARRAY_NEW', doc: 'Create a new array', params: [] },
      { cmd: 'ARRAY_PUSH', doc: 'Push value to array', params: [{k:'array',l:'Array',d:''},{k:'value',l:'Value',d:''}] },
      { cmd: 'MATRIX_NEW', doc: 'Create a new matrix', params: [{k:'rows',l:'Rows',d:'3'},{k:'cols',l:'Cols',d:'3'}] },
      { cmd: 'MATRIX_SET', doc: 'Set matrix value', params: [{k:'matrix',l:'Matrix',d:''},{k:'row',l:'Row',d:'0'},{k:'col',l:'Col',d:'0'},{k:'value',l:'Value',d:''}] }
    ]
  },
  { id: 'bloomberg', label: 'Bloomberg / Data', color: '#79c0ff', bg: '#0c2d48',
    items: [
      { cmd: 'FETCH_HISTORICAL', doc: 'Fetch historical data (BDH-style)', params: [{k:'metric',l:'Metric',d:''},{k:'from',l:'From',d:''},{k:'to',l:'To',d:''}] },
      { cmd: 'FETCH_MEMBERS', doc: 'Fetch index members (BDS-style)', params: [{k:'index',l:'Index',d:''}] },
      { cmd: 'GROUP_MEMBERS', doc: 'Get group/index members', params: [{k:'index',l:'Index',d:''}] },
      { cmd: 'ECON_DATA', doc: 'Fetch economic data point', params: [{k:'metric',l:'Metric',d:''},{k:'country',l:'Country',d:''},{k:'date',l:'Date',d:''}] },
      { cmd: 'ESTIMATE', doc: 'Get consensus estimate', params: [{k:'field',l:'Field',d:''},{k:'ticker',l:'Ticker',d:''}] }
    ]
  },
  { id: 'time_schedule', label: 'Time / Schedule', color: '#d2a8ff', bg: '#2d1b4e',
    items: [
      { cmd: 'TIME_IN_MARKET', doc: 'Time since position opened', params: [{k:'positionId',l:'Position',d:''},{k:'unit',l:'Unit',d:'min'}] },
      { cmd: 'TIME_SINCE_EVENT', doc: 'Time since an event', params: [{k:'event',l:'Event',d:''},{k:'unit',l:'Unit',d:'min'}] },
      { cmd: 'SCHEDULE', doc: 'Schedule a task at a time', params: [{k:'task',l:'Task',d:''},{k:'at',l:'At',d:''},{k:'repeat',l:'Repeat',d:''}] },
      { cmd: 'WAIT_UNTIL', doc: 'Wait until condition met', params: [{k:'condition',l:'Condition',d:''},{k:'timeout',l:'Timeout',d:'60'}] },
      { cmd: 'TASK_SCHEDULE', doc: 'Schedule recurring task', params: [{k:'name',l:'Name',d:''},{k:'every',l:'Every',d:''},{k:'run',l:'Run',d:''}] }
    ]
  },
  { id: 'portfolio', label: 'Portfolio', color: '#7ee787', bg: '#1b4332',
    items: [
      { cmd: 'MARKET_SCAN', doc: 'Scan markets by criteria', params: [{k:'category',l:'Category',d:''},{k:'criteria',l:'Criteria',d:''},{k:'limit',l:'Limit',d:'10'}] },
      { cmd: 'PORTFOLIO_BUILD', doc: 'Build portfolio from scan results', params: [{k:'from',l:'From',d:''},{k:'num',l:'Num',d:'4'},{k:'sizing',l:'Sizing',d:'equal'},{k:'maxRisk',l:'Max Risk',d:'20'}] },
      { cmd: 'PORTFOLIO_REBALANCE', doc: 'Rebalance portfolio on drawdown', params: [{k:'threshold',l:'Threshold',d:'10'}] }
    ]
  },
  { id: 'econpol', label: 'Econ / Political', color: '#e3b341', bg: '#3d2d00',
    items: [
      { cmd: 'ECON_INDICATOR', doc: 'Fetch economic indicator (GDP, CPI, etc.)', params: [{k:'metric',l:'Metric',d:''},{k:'country',l:'Country',d:''},{k:'date',l:'Date',d:''}] },
      { cmd: 'FISCAL_FLOW', doc: 'Track capital flows (ETF, COT)', params: [{k:'asset',l:'Asset',d:''},{k:'window',l:'Window',d:'30d'}] },
      { cmd: 'ELECTION_IMPACT', doc: 'Score election market impact', params: [{k:'event',l:'Event',d:''},{k:'region',l:'Region',d:''}] },
      { cmd: 'CURRENCY_CARRY', doc: 'Calculate currency carry trade', params: [{k:'pair',l:'Pair',d:''}] },
      { cmd: 'POLICY_SENTIMENT', doc: 'Policy sentiment score', params: [{k:'policy',l:'Policy',d:''},{k:'country',l:'Country',d:''}] },
      { cmd: 'SANCTION_IMPACT', doc: 'Estimate sanction price impact', params: [{k:'country',l:'Country',d:''},{k:'commodity',l:'Commodity',d:''}] },
      { cmd: 'VOTE_PREDICT', doc: 'Aggregate election polls', params: [{k:'election',l:'Election',d:''},{k:'pollSource',l:'Source',d:''}] },
      { cmd: 'WEATHER_IMPACT', doc: 'Weather impact on local economy', params: [{k:'location',l:'Location',d:''},{k:'days',l:'Days',d:'7'}] }
    ]
  },
  { id: 'scientific', label: 'Scientific', color: '#56d4dd', bg: '#0a3d42',
    items: [
      { cmd: 'MATH_MODEL', doc: 'Solve equation / symbolic math', params: [{k:'equation',l:'Equation',d:''},{k:'solve',l:'Solve',d:''},{k:'params',l:'Params',d:''}] },
      { cmd: 'RISK_MODEL', doc: 'VaR / ES risk calculation', params: [{k:'type',l:'Type',d:'var'},{k:'confidence',l:'Confidence',d:'0.95'},{k:'window',l:'Window',d:'252d'}] },
      { cmd: 'MONTE_CARLO', doc: 'Monte Carlo simulation', params: [{k:'scenario',l:'Scenario',d:''},{k:'runs',l:'Runs',d:'10000'}] }
    ]
  },
  { id: 'op-arithmetic', label: 'Arithmetic Operators', color: '#58a6ff', bg: '#0d2240',
    items: [
      { cmd: 'OP_ADD', doc: 'Add two values (+)', params: [], isOperator: true, opSymbol: '+', opInputs: 2 },
      { cmd: 'OP_SUB', doc: 'Subtract two values (-)', params: [], isOperator: true, opSymbol: '-', opInputs: 2 },
      { cmd: 'OP_MUL', doc: 'Multiply two values (*)', params: [], isOperator: true, opSymbol: '*', opInputs: 2 },
      { cmd: 'OP_DIV', doc: 'Divide two values (/)', params: [], isOperator: true, opSymbol: '/', opInputs: 2 },
      { cmd: 'OP_MOD', doc: 'Modulo / remainder (%)', params: [], isOperator: true, opSymbol: '%', opInputs: 2 }
    ]
  },
  { id: 'op-comparison', label: 'Comparison Operators', color: '#f0883e', bg: '#3d2200',
    items: [
      { cmd: 'OP_LT', doc: 'Less than (<)', params: [], isOperator: true, opSymbol: '<', opInputs: 2 },
      { cmd: 'OP_GT', doc: 'Greater than (>)', params: [], isOperator: true, opSymbol: '>', opInputs: 2 },
      { cmd: 'OP_LTE', doc: 'Less than or equal (<=)', params: [], isOperator: true, opSymbol: '<=', opInputs: 2 },
      { cmd: 'OP_GTE', doc: 'Greater than or equal (>=)', params: [], isOperator: true, opSymbol: '>=', opInputs: 2 },
      { cmd: 'OP_EQ', doc: 'Equal to (==)', params: [], isOperator: true, opSymbol: '==', opInputs: 2 },
      { cmd: 'OP_NEQ', doc: 'Not equal to (!=)', params: [], isOperator: true, opSymbol: '!=', opInputs: 2 }
    ]
  },
  { id: 'op-logical', label: 'Logical Operators', color: '#bc8cff', bg: '#2d1a4e',
    items: [
      { cmd: 'OP_AND', doc: 'Logical AND — both conditions must be true', params: [], isOperator: true, opSymbol: 'AND', opInputs: 2 },
      { cmd: 'OP_OR', doc: 'Logical OR — either condition must be true', params: [], isOperator: true, opSymbol: 'OR', opInputs: 2 },
      { cmd: 'OP_NOT', doc: 'Logical NOT — inverts condition', params: [], isOperator: true, opSymbol: 'NOT', opInputs: 1 }
    ]
  },
  { id: 'op-crossover', label: 'Crossover Operators', color: '#2dc653', bg: '#0d2d12',
    items: [
      { cmd: 'OP_CROSSES_OVER', doc: 'Crosses over — value crosses above another', params: [], isOperator: true, opSymbol: 'X-OVER', opInputs: 2 },
      { cmd: 'OP_CROSSES_UNDER', doc: 'Crosses under — value crosses below another', params: [], isOperator: true, opSymbol: 'X-UNDER', opInputs: 2 }
    ]
  },
  { id: 'op-string', label: 'String Operators', color: '#f78166', bg: '#3d1a0d',
    items: [
      { cmd: 'OP_CONTAINS', doc: 'String contains — check if text contains substring', params: [], isOperator: true, opSymbol: 'HAS', opInputs: 2 }
    ]
  },
  { id: 'task_planning', label: 'Task Planning', color: '#e3b341', bg: '#3d2e00',
    items: [
      { cmd: 'TASK_DEFINE', doc: 'Define a named task with body', params: [{k:'name',l:'Name',d:''},{k:'description',l:'Description',d:''}], ports: {out:['body','next']} },
      { cmd: 'TASK_ASSIGN', doc: 'Assign task to an agent', params: [{k:'task',l:'Task',d:''},{k:'to',l:'To',d:''}] },
      { cmd: 'TASK_CHAIN', doc: 'Chain tasks sequentially', params: [{k:'tasks',l:'Tasks',d:''}] },
      { cmd: 'TASK_PARALLEL', doc: 'Run tasks in parallel', params: [{k:'tasks',l:'Tasks',d:''}] },
      { cmd: 'TASK_SHOW_FLOW', doc: 'Visualise task dependency flow', params: [{k:'task',l:'Task',d:''}] },
      { cmd: 'TASK_LOG', doc: 'Log task progress or result', params: [{k:'task',l:'Task',d:''},{k:'message',l:'Message',d:''}] }
    ]
  },
  { id: 'agent_mgmt', label: 'Agent Management', color: '#f0883e', bg: '#3d2200',
    items: [
      { cmd: 'AGENT_SPAWN', doc: 'Spawn a new agent with instructions', params: [{k:'name',l:'Name',d:''},{k:'prompt',l:'Prompt',d:''}] },
      { cmd: 'AGENT_CALL', doc: 'Call an agent and get result', params: [{k:'agent',l:'Agent',d:''},{k:'command',l:'Command',d:''}] },
      { cmd: 'AGENT_PASS', doc: 'Pass data to another agent', params: [{k:'from',l:'Data Var',d:''},{k:'to',l:'Agent',d:''}] },
      { cmd: 'AGENT_TERMINATE', doc: 'Terminate a running agent', params: [{k:'agent',l:'Agent',d:''}] }
    ]
  },
  { id: 'skills_tools', label: 'Skills & Tools', color: '#3fb950', bg: '#0d3117',
    items: [
      { cmd: 'SKILL_CALL', doc: 'Invoke a registered skill', params: [{k:'skill',l:'Skill',d:''},{k:'args',l:'Args',d:''}] },
      { cmd: 'CRON_CREATE', doc: 'Create a cron schedule', params: [{k:'name',l:'Name',d:''},{k:'schedule',l:'Schedule',d:''},{k:'run',l:'Run',d:''}] },
      { cmd: 'CRON_CALL', doc: 'Trigger a cron job manually', params: [{k:'name',l:'Name',d:''}] },
      { cmd: 'WEB_FETCH', doc: 'HTTP fetch from URL', params: [{k:'url',l:'URL',d:''},{k:'method',l:'Method',d:'GET'},{k:'timeout',l:'Timeout',d:''}] },
      { cmd: 'WEB_SERIAL', doc: 'Serial port I/O', params: [{k:'urls',l:'Port',d:'/dev/ttyUSB0'},{k:'baud',l:'Baud',d:'9600'}] }
    ]
  },
  { id: 'file_data', label: 'File & Data', color: '#a5d6ff', bg: '#0c2d48',
    items: [
      { cmd: 'FILE_READ', doc: 'Read file contents', params: [{k:'path',l:'Path',d:''},{k:'format',l:'Format',d:'text'}] },
      { cmd: 'FILE_WRITE', doc: 'Write content to file', params: [{k:'path',l:'Path',d:''},{k:'content',l:'Content',d:''}] },
      { cmd: 'FILE_EXECUTE', doc: 'Execute a file/script', params: [{k:'path',l:'Path',d:''}] },
      { cmd: 'DATA_TRANSFORM', doc: 'Transform data (map/filter/reduce)', params: [{k:'data',l:'Data',d:''},{k:'operation',l:'Operation',d:''},{k:'expression',l:'Expression',d:''}] }
    ]
  },
  { id: 'communication', label: 'Communication', color: '#d2a8ff', bg: '#2d1b4e',
    items: [
      { cmd: 'CHANNEL_SEND', doc: 'Send message to channel', params: [{k:'channel',l:'Channel',d:''},{k:'message',l:'Message',d:''}] },
      { cmd: 'EMAIL_SEND', doc: 'Send email message', params: [{k:'to',l:'To',d:''},{k:'subject',l:'Subject',d:''},{k:'body',l:'Body',d:''}] },
      { cmd: 'PUBLISH_CANVAS', doc: 'Publish content to canvas', params: [{k:'canvas',l:'Canvas',d:''},{k:'content',l:'Content',d:''}] }
    ]
  },
  { id: 'utility', label: 'Utility', color: '#8b949e', bg: '#21262d',
    items: [
      { cmd: 'FILE_PARSE', doc: 'Parse file (CSV/JSON/PDF)', params: [{k:'filename',l:'File',d:''},{k:'format',l:'Format',d:'csv'}] }
    ]
  },
  { id: 'prt', label: 'PRT Compatibility', color: '#db61a2', bg: '#3d1a2e',
    items: [
      { cmd: 'PRT_BUY', doc: 'ProRealTime buy order', params: [{k:'size',l:'Size',d:'1'},{k:'orderType',l:'Order',d:'MARKET'}] },
      { cmd: 'PRT_SELL', doc: 'ProRealTime sell order', params: [{k:'size',l:'Size',d:'1'},{k:'orderType',l:'Order',d:'MARKET'}] },
      { cmd: 'PRT_AVERAGE', doc: 'PRT SMA (average)', params: [{k:'period',l:'Period',d:'14'}] },
      { cmd: 'PRT_RSI', doc: 'PRT RSI', params: [{k:'period',l:'Period',d:'14'}] },
      { cmd: 'PRT_MACD', doc: 'PRT MACD', params: [{k:'fast',l:'Fast',d:'12'},{k:'slow',l:'Slow',d:'26'},{k:'signal',l:'Signal',d:'9'}] },
      { cmd: 'PRT_BOLLINGER', doc: 'PRT Bollinger Bands', params: [{k:'period',l:'Period',d:'20'},{k:'dev',l:'Dev',d:'2'}] },
      { cmd: 'PRT_ATR', doc: 'PRT ATR', params: [{k:'period',l:'Period',d:'14'}] },
      { cmd: 'PRT_STOCHASTIC', doc: 'PRT Stochastic', params: [{k:'k',l:'%K',d:'14'},{k:'d',l:'%D',d:'3'}] },
      { cmd: 'PRT_ADX', doc: 'PRT ADX', params: [{k:'period',l:'Period',d:'14'}] },
      { cmd: 'PRT_CCI', doc: 'PRT CCI', params: [{k:'period',l:'Period',d:'20'}] },
      { cmd: 'PRT_ICHIMOKU', doc: 'PRT Ichimoku Cloud', params: [{k:'tenkan',l:'Tenkan',d:'9'},{k:'kijun',l:'Kijun',d:'26'},{k:'senkou',l:'Senkou',d:'52'}] },
      { cmd: 'PRT_FIBONACCI', doc: 'PRT Fibonacci levels', params: [{k:'high',l:'High',d:''},{k:'low',l:'Low',d:''}] },
      { cmd: 'PRT_VWAP', doc: 'PRT VWAP', params: [] },
      { cmd: 'PRT_SUPERTREND', doc: 'PRT SuperTrend', params: [{k:'period',l:'Period',d:'10'},{k:'mult',l:'Mult',d:'3'}] },
      { cmd: 'PRT_BARINDEX', doc: 'PRT bar index', params: [] },
      { cmd: 'PRT_OPTIMIZE', doc: 'PRT optimization', params: [{k:'varName',l:'Variable',d:''},{k:'from',l:'From',d:''},{k:'to',l:'To',d:''},{k:'step',l:'Step',d:''}] },
      { cmd: 'PRT_DEFPARAM', doc: 'PRT parameter definition', params: [{k:'name',l:'Name',d:''},{k:'value',l:'Value',d:''}] }
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

function isOperatorNode(cmd) {
  var def = getCmdDef(cmd);
  return def && def.item.isOperator;
}

var OP_NODE_SIZE = 70;

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
  this._connectMode = false;
  this._connectModeFirstNode = null;
  this._selectedConnId = null;
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
    '<button class="cf-tb-btn" data-action="connectMode" id="cfConnectModeBtn" title="Connect Mode — click two nodes to connect them">&#x1F517; Connect</button>' +
    '<button class="cf-tb-btn" data-action="connectionHelp" title="Connection Logic Help" style="font-size:14px;padding:2px 6px;">&#x2753;</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn cf-tb-del" data-action="deleteSelected" title="Delete selected node or connection">&#x1F5D1; Delete</button>' +
    '<button class="cf-tb-btn" data-action="selectAll" title="Select all nodes">&#x2610; Select All</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn" data-action="zoomIn" title="Zoom In">&#x1F50D;+</button>' +
    '<button class="cf-tb-btn" data-action="zoomOut" title="Zoom Out">&#x1F50D;&minus;</button>' +
    '<button class="cf-tb-btn" data-action="zoomFit" title="Fit all nodes in view">Fit</button>' +
    '<span class="cf-zoom-label" id="cfZoomLabel">100%</span>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn" data-action="autoLayout" title="Auto-Layout (arrange nodes)">Auto-Layout</button>' +
    '<button class="cf-tb-btn" data-action="exportPNG" title="Export flow as PNG image">Export PNG</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn" data-action="undo" title="Undo last change">&#x21A9; Undo</button>' +
    '<button class="cf-tb-btn" data-action="redo" title="Redo last undone change">&#x21AA; Redo</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<button class="cf-tb-btn cf-tb-danger" data-action="clearAll" title="Remove all nodes and connections">&#x1F6AE; Clear All</button>' +
    '<span class="cf-tb-sep"></span>' +
    '<span class="cf-node-count" id="cfNodeCount">0 nodes</span>';
  this.container.appendChild(tb);
  var self = this;
  tb.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var a = btn.getAttribute('data-action');
    if (a === 'connectMode') self.toggleConnectMode();
    else if (a === 'deleteSelected') self.deleteSelected();
    else if (a === 'selectAll') self.selectAll();
    else if (a === 'zoomIn') self.setZoom(self.zoom + ZOOM_STEP);
    else if (a === 'zoomOut') self.setZoom(self.zoom - ZOOM_STEP);
    else if (a === 'zoomFit') self.zoomFit();
    else if (a === 'autoLayout') self.autoLayout();
    else if (a === 'exportPNG') self.exportPNG();
    else if (a === 'undo') self.undo();
    else if (a === 'redo') self.redo();
    else if (a === 'clearAll') self.clearAll();
    else if (a === 'connectionHelp') self.showConnectionHelp();
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
    var isOpCat2 = cat.id && cat.id.indexOf('op-') === 0;
    groupHdr.innerHTML = '<span>' + cat.label + '</span><span class="cf-tg-arrow">' + (isOpCat2 ? '&#9662;' : '&#9656;') + '</span>';
    groupHdr.addEventListener('click', function() {
      var list = group.querySelector('.cf-toolbox-items');
      var arrow = groupHdr.querySelector('.cf-tg-arrow');
      if (list.style.display === 'none') { list.style.display = ''; arrow.innerHTML = '&#9662;'; }
      else { list.style.display = 'none'; arrow.innerHTML = '&#9656;'; }
    });
    group.appendChild(groupHdr);

    var items = document.createElement('div');
    items.className = 'cf-toolbox-items';
    var isOpCat = cat.id && cat.id.indexOf('op-') === 0;
    items.style.display = isOpCat ? '' : 'none';
    cat.items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'cf-toolbox-item';
      el.setAttribute('draggable', 'true');
      el.setAttribute('data-cmd', item.cmd);
      el.style.borderLeftColor = cat.color;
      el.innerHTML = '<span class="cf-ti-name">' + item.cmd + '</span><span class="cf-ti-info" data-info-cmd="' + item.cmd + '" title="Info">&#9432;</span>';
      el.title = item.doc;
      el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', item.cmd);
        e.dataTransfer.effectAllowed = 'copy';
      });
      var infoBtn = el.querySelector('.cf-ti-info');
      infoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        self.showInfoPopup(item, cat, e);
      });
      infoBtn.addEventListener('mousedown', function(e) {
        e.stopPropagation();
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
    var dropW = isOperatorNode(cmd) ? OP_NODE_SIZE : NODE_W;
    var nid = self.addNode(cmd, snap(pt.x - dropW / 2), snap(pt.y - 15));
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
      self._selectedConnId = null;
      if (self._connectModeFirstNode) {
        var srcNode = self.nodes[self._connectModeFirstNode];
        if (srcNode && srcNode._el) srcNode._el.classList.remove('cf-node-connect-source');
        self._connectModeFirstNode = null;
        self.clearPortHighlights();
      }
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
        self.addConnection(self._connectState.nodeId, self._connectState.portId, port.nodeId, port.portId);
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
      if (document.activeElement && document.activeElement.closest('.cf-node-param')) return;
      if (self._selectedConnId || self.selectedId) {
        self.deleteSelected();
      }
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); self.undo(); }
      if (e.key === 'y') { e.preventDefault(); self.redo(); }
      if (e.key === 'a') { e.preventDefault(); self.selectAll(); }
    }
    if (e.key === 'Escape' && self._connectMode) {
      self.toggleConnectMode();
    }
    if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea')) {
      self.toggleConnectMode();
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

FlowEngine.prototype.countConnectionsFrom = function(nodeId, portId) {
  var count = 0;
  for (var k in this.connections) {
    if (this.connections[k].fromId === nodeId && this.connections[k].fromPort === portId) count++;
  }
  return count;
};

FlowEngine.prototype.countConnectionsTo = function(nodeId, portId) {
  var count = 0;
  for (var k in this.connections) {
    if (this.connections[k].toId === nodeId && this.connections[k].toPort === portId) count++;
  }
  return count;
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
    if (c.fromId === fromId && c.fromPort === fromPort && c.toId === toId && c.toPort === toPort) return;
    if ((toPort === 'inLeft' || toPort === 'inRight') && c.toId === toId && c.toPort === toPort) return;
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
  if (this._selectedConnId) {
    this.pushUndo();
    delete this.connections[this._selectedConnId];
    this._selectedConnId = null;
    this.syncToCode();
    this.renderConnections();
    return;
  }
  if (!this.selectedId) return;
  this.pushUndo();
  this.removeNode(this.selectedId);
  this.syncToCode();
  this.render();
};

FlowEngine.prototype.showConnectionHelp = function() {
  var existing = document.getElementById('cfConnectionHelpOverlay');
  if (existing) { existing.remove(); return; }
  var overlay = document.createElement('div');
  overlay.id = 'cfConnectionHelpOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;max-width:520px;color:#c9d1d9;font-size:13px;line-height:1.6;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
  box.innerHTML =
    '<h3 style="margin:0 0 12px;color:#58a6ff;font-size:16px;">Connection Logic</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:6px;color:#8b949e">Step 1</td><td style="padding:6px">Click <b style="color:#58a6ff">Connect</b> button or press <kbd style="background:#21262d;padding:1px 5px;border-radius:3px;border:1px solid #484f58">C</kbd></td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:6px;color:#8b949e">Step 2</td><td style="padding:6px">Click the <b>source</b> node (it glows blue)</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:6px;color:#8b949e">Step 3</td><td style="padding:6px">Ports light up: <span style="color:#2dc653;font-weight:bold">GREEN</span> = valid target, <span style="color:#f85149;font-weight:bold">RED</span> = cannot connect</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:6px;color:#8b949e">Step 4</td><td style="padding:6px">Click the <b>target</b> node to complete the connection</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:6px;color:#8b949e">Cancel</td><td style="padding:6px">Click same node again, click empty canvas, or press <kbd style="background:#21262d;padding:1px 5px;border-radius:3px;border:1px solid #484f58">Esc</kbd></td></tr>' +
    '</table>' +
    '<h4 style="margin:14px 0 8px;color:#f0883e;font-size:14px;">Port Types</h4>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:4px;color:#8b949e;width:100px">&#x25CF; Top port</td><td style="padding:4px"><b>Input</b> — receives data from another node\'s output</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:4px;color:#8b949e">&#x25CF; Bottom port</td><td style="padding:4px"><b>Output</b> — sends data/flow to another node\'s input</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:4px;color:#8b949e">&#x25CF; L / R ports</td><td style="padding:4px">Operator left &amp; right inputs (e.g. <code style="color:#f0883e">a + b</code>)</td></tr>' +
    '<tr style="border-bottom:1px solid #30363d"><td style="padding:4px;color:#8b949e">&#x25CF; Condition</td><td style="padding:4px">IF node condition input from operator result</td></tr>' +
    '</table>' +
    '<h4 style="margin:14px 0 8px;color:#f0883e;font-size:14px;">Connection Rules</h4>' +
    '<ul style="margin:0;padding-left:18px;font-size:12px;">' +
    '<li>Connect <b>output &#x2192; input</b> (top-to-bottom flow)</li>' +
    '<li>Operators: connect values to <b>L</b> and <b>R</b> inputs, result flows from output</li>' +
    '<li>IF nodes: connect operator output to the <b>condition</b> port</li>' +
    '<li>Drag from toolbox drops a standalone node (no auto-connect)</li>' +
    '</ul>' +
    '<div style="text-align:right;margin-top:16px"><button onclick="this.closest(\'#cfConnectionHelpOverlay\').remove()" style="background:#238636;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:12px;">Got it</button></div>';
  overlay.appendChild(box);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
};

FlowEngine.prototype.toggleConnectMode = function() {
  this._connectMode = !this._connectMode;
  this._connectModeFirstNode = null;
  this.clearPortHighlights();
  var btn = document.getElementById('cfConnectModeBtn');
  if (btn) {
    btn.classList.toggle('cf-tb-active', this._connectMode);
  }
  if (this.canvasWrap) {
    this.canvasWrap.style.cursor = this._connectMode ? 'crosshair' : 'grab';
  }
};

FlowEngine.prototype.handleConnectModeClick = function(nodeId) {
  if (!this._connectMode) return false;
  if (!this._connectModeFirstNode) {
    this._connectModeFirstNode = nodeId;
    var node = this.nodes[nodeId];
    if (node && node._el) node._el.classList.add('cf-node-connect-source');
    this.highlightValidTargets(nodeId);
    return true;
  }
  if (this._connectModeFirstNode === nodeId) {
    var srcNode = this.nodes[nodeId];
    if (srcNode && srcNode._el) srcNode._el.classList.remove('cf-node-connect-source');
    this._connectModeFirstNode = null;
    this.clearPortHighlights();
    return true;
  }
  var fromId = this._connectModeFirstNode;
  var fromNode = this.nodes[fromId];
  if (fromNode) {
    if (fromNode._el) fromNode._el.classList.remove('cf-node-connect-source');
    var outPorts = this.getOutPorts(fromNode);
    var freePort = null;
    for (var i = 0; i < outPorts.length; i++) {
      if (!this.hasConnectionFrom(fromId, outPorts[i])) { freePort = outPorts[i]; break; }
    }
    if (!freePort) freePort = outPorts[outPorts.length > 1 ? outPorts.length - 1 : 0];
    this.pushUndo();
    var targetPort = 'in';
    var targetNode = this.nodes[nodeId];
    if (targetNode && isOperatorNode(targetNode.cmd)) {
      var tDef = getCmdDef(targetNode.cmd);
      if (tDef && tDef.item.opInputs !== 1) {
        var hasLeft = false;
        for (var ck in this.connections) {
          if (this.connections[ck].toId === nodeId && this.connections[ck].toPort === 'inLeft') { hasLeft = true; break; }
        }
        targetPort = hasLeft ? 'inRight' : 'inLeft';
      }
    }
    this.addConnection(fromId, freePort, nodeId, targetPort);
    this.syncToCode();
    this.clearPortHighlights();
    this.renderConnections();
  }
  this._connectModeFirstNode = null;
  return true;
};

FlowEngine.prototype.highlightValidTargets = function(sourceId) {
  this.clearPortHighlights();
  var self = this;
  var allPorts = this.container.querySelectorAll('.cf-port');
  allPorts.forEach(function(portEl) {
    var portNodeId = portEl.getAttribute('data-node-id');
    var portType = portEl.getAttribute('data-port-type');
    if (portNodeId === sourceId) {
      if (portType === 'out') portEl.classList.add('cf-port-valid');
      return;
    }
    if (portType === 'in') {
      portEl.classList.add('cf-port-valid');
    } else {
      portEl.classList.add('cf-port-invalid');
    }
  });
};

FlowEngine.prototype.clearPortHighlights = function() {
  var allPorts = this.container.querySelectorAll('.cf-port');
  allPorts.forEach(function(portEl) {
    portEl.classList.remove('cf-port-valid', 'cf-port-invalid');
  });
};

FlowEngine.prototype.selectAll = function() {
  var allNodes = this.container.querySelectorAll('.cf-node');
  for (var i = 0; i < allNodes.length; i++) {
    allNodes[i].classList.add('cf-node-selected');
  }
  var keys = Object.keys(this.nodes);
  if (keys.length > 0) this.selectedId = keys[0];
};

FlowEngine.prototype.clearAll = function() {
  if (Object.keys(this.nodes).length === 0) return;
  if (!confirm('Remove all nodes and connections?')) return;
  this.pushUndo();
  this.nodes = {};
  this.connections = {};
  this.selectedId = null;
  this._selectedConnId = null;
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
    var nw = isOperatorNode(n.cmd) ? OP_NODE_SIZE : NODE_W;
    if (n.x + nw > maxX) maxX = n.x + nw;
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
  if (isOperatorNode(node.cmd)) return OP_NODE_SIZE;
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
  var isOp = isOperatorNode(node.cmd);

  var el = document.createElement('div');
  el.className = 'cf-node' + (node.id === this.selectedId ? ' cf-node-selected' : '') + (isOp ? ' cf-node-operator' : '');
  el.setAttribute('data-node-id', node.id);

  if (isOp) {
    el.style.cssText = 'left:' + node.x + 'px;top:' + node.y + 'px;width:' + OP_NODE_SIZE + 'px;height:' + OP_NODE_SIZE + 'px;background:' + bg + ';border-color:' + color + ';border-radius:50%;';
    var opLabel = document.createElement('div');
    opLabel.className = 'cf-op-symbol';
    opLabel.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:22px;font-weight:bold;color:' + color + ';cursor:grab;user-select:none;';
    opLabel.textContent = def.item.opSymbol || node.cmd;
    opLabel.title = def ? def.item.doc : node.cmd;
    el.appendChild(opLabel);

    opLabel.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      e.stopPropagation();
      if (self.handleConnectModeClick(node.id)) return;
      self.selectNode(node.id);
      var pt = self.clientToCanvas(e.clientX, e.clientY);
      self._dragState = { nodeId: node.id, offX: pt.x - node.x, offY: pt.y - node.y };
    });

    var numInputs = def.item.opInputs || 2;
    if (numInputs === 1) {
      var portInSingle = document.createElement('div');
      portInSingle.className = 'cf-port cf-port-in cf-port-op';
      portInSingle.setAttribute('data-node-id', node.id);
      portInSingle.setAttribute('data-port-id', 'in');
      portInSingle.setAttribute('data-port-type', 'in');
      portInSingle.title = 'Input';
      portInSingle.style.cssText = 'left:' + (OP_NODE_SIZE / 2 - PORT_R) + 'px;top:-' + PORT_R + 'px;';
      portInSingle.addEventListener('mouseup', function(e) { e.stopPropagation(); });
      el.appendChild(portInSingle);
    } else {
      var portInL = document.createElement('div');
      portInL.className = 'cf-port cf-port-in cf-port-op';
      portInL.setAttribute('data-node-id', node.id);
      portInL.setAttribute('data-port-id', 'inLeft');
      portInL.setAttribute('data-port-type', 'in');
      portInL.title = 'Left operand';
      portInL.style.cssText = 'left:-' + PORT_R + 'px;top:' + (OP_NODE_SIZE / 2 - PORT_R) + 'px;';
      portInL.addEventListener('mouseup', function(e) { e.stopPropagation(); });
      el.appendChild(portInL);

      var portInR = document.createElement('div');
      portInR.className = 'cf-port cf-port-in cf-port-op';
      portInR.setAttribute('data-node-id', node.id);
      portInR.setAttribute('data-port-id', 'inRight');
      portInR.setAttribute('data-port-type', 'in');
      portInR.title = 'Right operand';
      portInR.style.cssText = 'left:' + (OP_NODE_SIZE - PORT_R) + 'px;top:' + (OP_NODE_SIZE / 2 - PORT_R) + 'px;';
      portInR.addEventListener('mouseup', function(e) { e.stopPropagation(); });
      el.appendChild(portInR);
    }

    var portOutOp = document.createElement('div');
    portOutOp.className = 'cf-port cf-port-out cf-port-op';
    portOutOp.setAttribute('data-node-id', node.id);
    portOutOp.setAttribute('data-port-id', 'out');
    portOutOp.setAttribute('data-port-type', 'out');
    portOutOp.title = 'Output';
    portOutOp.style.cssText = 'left:' + (OP_NODE_SIZE / 2 - PORT_R) + 'px;bottom:-' + PORT_R + 'px;top:auto;';
    (function(pout) {
      pout.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self._connectState = { nodeId: node.id, portId: 'out' };
        self.createTempLine();
      });
    })(portOutOp);
    el.appendChild(portOutOp);

  } else {
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
      if (self.handleConnectModeClick(node.id)) return;
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

FlowEngine.prototype.getPortPosition = function(node, portId, portType) {
  var isOp = isOperatorNode(node.cmd);
  if (isOp) {
    if (portType === 'out') {
      return { x: node.x + OP_NODE_SIZE / 2, y: node.y + OP_NODE_SIZE };
    }
    var def = getCmdDef(node.cmd);
    var numInputs = def ? (def.item.opInputs || 2) : 2;
    if (numInputs === 1) {
      return { x: node.x + OP_NODE_SIZE / 2, y: node.y };
    }
    if (portId === 'inLeft') return { x: node.x, y: node.y + OP_NODE_SIZE / 2 };
    if (portId === 'inRight') return { x: node.x + OP_NODE_SIZE, y: node.y + OP_NODE_SIZE / 2 };
    return { x: node.x + OP_NODE_SIZE / 2, y: node.y };
  }
  if (portType === 'in') {
    return { x: node.x + NODE_W / 2, y: node.y };
  }
  var outPorts = this.getOutPorts(node);
  var portIdx = outPorts.indexOf(portId);
  if (portIdx < 0) portIdx = 0;
  var outW = NODE_W / (outPorts.length + 1);
  var nh = this.getNodeHeight(node);
  return { x: node.x + outW * (portIdx + 1), y: node.y + nh };
};

FlowEngine.prototype.renderConnections = function() {
  var oldPaths = this.svgEl.querySelectorAll('.cf-conn');
  for (var i = 0; i < oldPaths.length; i++) oldPaths[i].remove();
  var oldBadges = this.svgEl.querySelectorAll('.cf-fanout-badge');
  for (var b = 0; b < oldBadges.length; b++) oldBadges[b].remove();

  var self = this;
  var fanoutIndex = {};

  Object.keys(this.connections).forEach(function(cid) {
    var c = self.connections[cid];
    var fanKey = c.fromId + ':' + c.fromPort;
    if (!fanoutIndex[fanKey]) fanoutIndex[fanKey] = { count: 0, idx: 0 };
    fanoutIndex[fanKey].count++;
  });

  var fanoutCurrent = {};

  Object.keys(this.connections).forEach(function(cid) {
    var c = self.connections[cid];
    var fromNode = self.nodes[c.fromId];
    var toNode = self.nodes[c.toId];
    if (!fromNode || !toNode) return;

    var fromPos = self.getPortPosition(fromNode, c.fromPort, 'out');
    var toPos = self.getPortPosition(toNode, c.toPort, 'in');

    var fanKey = c.fromId + ':' + c.fromPort;
    var fanTotal = fanoutIndex[fanKey].count;
    if (!fanoutCurrent[fanKey]) fanoutCurrent[fanKey] = 0;
    var fanIdx = fanoutCurrent[fanKey]++;

    var x1 = fromPos.x;
    var y1 = fromPos.y;
    var x2 = toPos.x;
    var y2 = toPos.y;

    if (fanTotal > 1) {
      var spread = 15;
      var offset = (fanIdx - (fanTotal - 1) / 2) * spread;
      x1 += offset;
    }

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

    var isSelected = (cid === self._selectedConnId);
    path.setAttribute('stroke', isSelected ? '#58a6ff' : strokeColor);
    path.setAttribute('stroke-width', isSelected ? '3' : '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', markerRef);
    if (isSelected) path.setAttribute('stroke-dasharray', '8,4');
    path.style.pointerEvents = 'stroke';
    path.style.cursor = 'pointer';

    (function(connId) {
      path.addEventListener('click', function(e) {
        e.stopPropagation();
        self._selectedConnId = connId;
        self.selectNode(null);
        self.renderConnections();
      });
    })(cid);

    self.svgEl.appendChild(path);
  });

  var badgeDrawn = {};
  Object.keys(fanoutIndex).forEach(function(fanKey) {
    var fi = fanoutIndex[fanKey];
    if (fi.count <= 1 || badgeDrawn[fanKey]) return;
    badgeDrawn[fanKey] = true;
    var parts = fanKey.split(':');
    var nodeId = parts[0];
    var portId = parts[1];
    var node = self.nodes[nodeId];
    if (!node) return;
    var pos = self.getPortPosition(node, portId, 'out');
    var badge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    badge.setAttribute('class', 'cf-fanout-badge');
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x + 12);
    circle.setAttribute('cy', pos.y + 4);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', '#58a6ff');
    circle.setAttribute('stroke', '#0d1117');
    circle.setAttribute('stroke-width', '1');
    badge.appendChild(circle);
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x + 12);
    text.setAttribute('y', pos.y + 8);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#fff');
    text.textContent = fi.count;
    badge.appendChild(text);
    self.svgEl.appendChild(badge);
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
  var fromPos = this.getPortPosition(fromNode, this._connectState.portId, 'out');
  var x1 = fromPos.x;
  var y1 = fromPos.y;

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

    var OP_MAP = {
      '+': 'OP_ADD', '-': 'OP_SUB', '*': 'OP_MUL', '/': 'OP_DIV', '%': 'OP_MOD',
      '<': 'OP_LT', '>': 'OP_GT', '<=': 'OP_LTE', '>=': 'OP_GTE', '==': 'OP_EQ', '!=': 'OP_NEQ',
      'AND': 'OP_AND', 'OR': 'OP_OR', 'NOT': 'OP_NOT',
      '&&': 'OP_AND', '||': 'OP_OR'
    };

    function exprToNodeId(expr) {
      if (!expr) return null;
      if (expr.type === 'BinaryExpr' && OP_MAP[expr.op]) {
        var opCmd = OP_MAP[expr.op];
        var opId = self.addNode(opCmd, 0, 0);
        var leftId = exprToNodeId(expr.left);
        var rightId = exprToNodeId(expr.right);
        if (leftId) self.addConnection(leftId, 'out', opId, 'inLeft');
        if (rightId) self.addConnection(rightId, 'out', opId, 'inRight');
        return opId;
      }
      if (expr.type === 'UnaryExpr' && (expr.op === 'NOT' || expr.op === '!')) {
        var notId = self.addNode('OP_NOT', 0, 0);
        var innerid = exprToNodeId(expr.expr);
        if (innerid) self.addConnection(innerid, 'out', notId, 'in');
        return notId;
      }
      if (expr.type === 'CrossesExpr') {
        var crCmd = (expr.direction || 'OVER').toUpperCase() === 'OVER' ? 'OP_CROSSES_OVER' : 'OP_CROSSES_UNDER';
        var crId = self.addNode(crCmd, 0, 0);
        var clId = exprToNodeId(expr.left);
        var crRId = exprToNodeId(expr.right);
        if (clId) self.addConnection(clId, 'out', crId, 'inLeft');
        if (crRId) self.addConnection(crRId, 'out', crId, 'inRight');
        return crId;
      }
      if (expr.type === 'ContainsExpr') {
        var coId = self.addNode('OP_CONTAINS', 0, 0);
        var coLId = exprToNodeId(expr.left);
        var coRId = exprToNodeId(expr.right);
        if (coLId) self.addConnection(coLId, 'out', coId, 'inLeft');
        if (coRId) self.addConnection(coRId, 'out', coId, 'inRight');
        return coId;
      }
      if (expr.type === 'FunctionCall') {
        var fnCmd = (expr.name || '').toUpperCase();
        if (getCmdDef(fnCmd)) {
          var fnId = self.addNode(fnCmd, 0, 0);
          return fnId;
        }
        var indId = self.addNode('INDICATOR', 0, 0);
        var indNode = self.nodes[indId];
        if (indNode) {
          indNode.params.name = expr.name || '';
          indNode.params.args = (expr.args || []).map(function(a) { return self.exprToStr(a); }).join(', ');
        }
        return indId;
      }
      if (expr.type === 'Identifier' || expr.type === 'NumberLiteral' || expr.type === 'StringLiteral') {
        var valId = self.addNode('SET', 0, 0);
        var valNode = self.nodes[valId];
        if (valNode) {
          valNode.params.name = expr.type === 'Identifier' ? expr.value : '';
          valNode.params.value = self.exprToStr(expr);
          valNode._isValueNode = true;
        }
        return valId;
      }
      return null;
    }

    function processStmt(stmt, parentId, parentPort) {
      if (!stmt) return null;
      var nodeId = self.addNodeFromAST(stmt);
      if (parentId !== null && parentPort) {
        self.addConnection(parentId, parentPort, nodeId, 'in');
      }
      if (stmt.type === 'IfStatement' && stmt.condition && isDecomposable(stmt.condition)) {
        var condNodeId = exprToNodeId(stmt.condition);
        if (condNodeId) {
          self.addConnection(condNodeId, 'out', nodeId, 'in');
        }
      }
      if ((stmt.type === 'VarDecl' || stmt.type === 'Assignment') && stmt.value && isDecomposable(stmt.value)) {
        var valNodeId = exprToNodeId(stmt.value);
        if (valNodeId) {
          self.addConnection(valNodeId, 'out', nodeId, 'in');
        }
      }
      return nodeId;
    }

    function isDecomposable(expr) {
      if (!expr) return false;
      return expr.type === 'BinaryExpr' || expr.type === 'CrossesExpr' ||
             expr.type === 'ContainsExpr' || (expr.type === 'UnaryExpr' && (expr.op === 'NOT' || expr.op === '!')) ||
             expr.type === 'FunctionCall';
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
    'Chain': function() { return 'CHAIN'; },
    'TaskDefine': function() { return 'TASK_DEFINE'; },
    'TaskAssign': function() { return 'TASK_ASSIGN'; },
    'TaskChain': function() { return 'TASK_CHAIN'; },
    'TaskParallel': function() { return 'TASK_PARALLEL'; },
    'TaskShowFlow': function() { return 'TASK_SHOW_FLOW'; },
    'TaskLog': function() { return 'TASK_LOG'; },
    'AgentSpawn': function() { return 'AGENT_SPAWN'; },
    'AgentCall': function() { return 'AGENT_CALL'; },
    'AgentPass': function() { return 'AGENT_PASS'; },
    'AgentTerminate': function() { return 'AGENT_TERMINATE'; },
    'SkillCall': function() { return 'SKILL_CALL'; },
    'CronCreate': function() { return 'CRON_CREATE'; },
    'CronCall': function() { return 'CRON_CALL'; },
    'WebFetch': function() { return 'WEB_FETCH'; },
    'WebSerial': function() { return 'WEB_SERIAL'; },
    'FileRead': function() { return 'FILE_READ'; },
    'FileWrite': function() { return 'FILE_WRITE'; },
    'FileExecute': function() { return 'FILE_EXECUTE'; },
    'DataTransform': function() { return 'DATA_TRANSFORM'; },
    'ChannelSend': function() { return 'CHANNEL_SEND'; },
    'EmailSend': function() { return 'EMAIL_SEND'; },
    'PublishCanvas': function() { return 'PUBLISH_CANVAS'; }
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
      } else if (node.cmd === 'TASK_DEFINE') {
        lines.push(p + 'TASK_DEFINE "' + (node.params.name || '') + '"' + (node.params.description ? ' WITH "' + node.params.description + '"' : '') + ' BODY');
        var tdbody = self.getConnectedTo(nodeId, 'body');
        tdbody.forEach(function(tid) { gen(tid, p + '  '); });
        lines.push(p + 'ENDTASK');
        var tdnext = self.getConnectedTo(nodeId, 'next');
        tdnext.forEach(function(tid) { gen(tid, p); });
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
    case 'TASK_ASSIGN': return 'TASK_ASSIGN "' + (p.task || '') + '" TO "' + (p.to || '') + '"';
    case 'TASK_CHAIN': return 'TASK_CHAIN ' + (p.tasks || '');
    case 'TASK_PARALLEL': return 'TASK_PARALLEL ' + (p.tasks || '');
    case 'TASK_SHOW_FLOW': return 'TASK_SHOW_FLOW "' + (p.task || '') + '"';
    case 'TASK_LOG': return 'TASK_LOG "' + (p.task || '') + '"' + (p.message ? ' MESSAGE "' + p.message + '"' : '');
    case 'AGENT_SPAWN':
      var as = 'AGENT_SPAWN "' + (p.name || '') + '"';
      if (p.prompt) as += ' WITH "' + p.prompt + '"';
      if (p.timeout) as += ' TIMEOUT ' + p.timeout;
      return as;
    case 'AGENT_CALL': return 'AGENT_CALL "' + (p.agent || '') + '" "' + (p.command || '') + '"';
    case 'AGENT_PASS': return 'AGENT_PASS "' + (p.from || '') + '" "' + (p.to || '') + '"';
    case 'AGENT_TERMINATE': return 'AGENT_TERMINATE "' + (p.agent || '') + '"';
    case 'SKILL_CALL':
      var sc = 'SKILL_CALL "' + (p.skill || '') + '"';
      if (p.args) sc += ' WITH ' + p.args;
      return sc;
    case 'CRON_CREATE': return 'CRON_CREATE "' + (p.name || '') + '" SCHEDULE "' + (p.schedule || '') + '" RUN "' + (p.run || '') + '"';
    case 'CRON_CALL': return 'CRON_CALL "' + (p.name || '') + '"';
    case 'WEB_FETCH':
      var wf = 'WEB_FETCH "' + (p.url || '') + '"';
      if (p.method && p.method !== 'GET') wf += ' WITH method="' + p.method + '"';
      if (p.timeout) wf += ' TIMEOUT ' + p.timeout;
      return wf;
    case 'WEB_SERIAL':
      var ws = 'WEB_SERIAL "' + (p.urls || '') + '"';
      if (p.baud) ws += ' WITH baud=' + p.baud;
      return ws;
    case 'FILE_READ':
      var fr = 'FILE_READ "' + (p.path || '') + '"';
      if (p.format) fr += ' FORMAT "' + p.format + '"';
      return fr;
    case 'FILE_WRITE': return 'FILE_WRITE "' + (p.path || '') + '" "' + (p.content || '') + '"';
    case 'FILE_EXECUTE': return 'FILE_EXECUTE "' + (p.path || '') + '"';
    case 'DATA_TRANSFORM':
      var dt = 'DATA_TRANSFORM ' + (p.data || '');
      if (p.operation) dt += ' ' + p.operation;
      if (p.expression) dt += ' "' + p.expression + '"';
      return dt;
    case 'CHANNEL_SEND': return 'CHANNEL_SEND "' + (p.channel || '') + '" "' + (p.message || '') + '"';
    case 'EMAIL_SEND': return 'EMAIL_SEND "' + (p.to || '') + '" "' + (p.body || '') + '"' + (p.subject ? ' SUBJECT "' + p.subject + '"' : '');
    case 'PUBLISH_CANVAS': return 'PUBLISH_CANVAS "' + (p.canvas || '') + '"' + (p.content ? ' CONTENT "' + p.content + '"' : '');
    case 'OP_ADD': case 'OP_SUB': case 'OP_MUL': case 'OP_DIV': case 'OP_MOD':
    case 'OP_LT': case 'OP_GT': case 'OP_LTE': case 'OP_GTE': case 'OP_EQ': case 'OP_NEQ':
    case 'OP_AND': case 'OP_OR': case 'OP_NOT':
    case 'OP_CROSSES_OVER': case 'OP_CROSSES_UNDER': case 'OP_CONTAINS':
      return '// [operator] ' + node.cmd;
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

  var gapX = 40;
  var gapY = 50;
  var startX = 50;
  var startY = 30;
  var maxPerRow = 4;

  var linearChain = [];
  var layoutRows = [];
  var sortedLevels = [];
  for (var sl = 0; sl <= maxLevel + 1; sl++) {
    if (levelNodes[sl]) sortedLevels.push(sl);
  }

  for (var si = 0; si < sortedLevels.length; si++) {
    var lvl = sortedLevels[si];
    var nodesInLevel = levelNodes[lvl];
    if (nodesInLevel.length === 1) {
      linearChain.push(nodesInLevel[0]);
      if (linearChain.length >= maxPerRow) {
        layoutRows.push({ type: 'grid', nodes: linearChain.slice() });
        linearChain = [];
      }
    } else {
      if (linearChain.length > 0) {
        layoutRows.push({ type: 'grid', nodes: linearChain.slice() });
        linearChain = [];
      }
      layoutRows.push({ type: 'branch', nodes: nodesInLevel });
    }
  }
  if (linearChain.length > 0) {
    layoutRows.push({ type: 'grid', nodes: linearChain.slice() });
  }

  var curY = startY;
  for (var ri = 0; ri < layoutRows.length; ri++) {
    var row = layoutRows[ri];
    var rowMaxH = 0;
    for (var ni = 0; ni < row.nodes.length; ni++) {
      var node = this.nodes[row.nodes[ni]];
      if (node) {
        node.x = startX + ni * (NODE_W + gapX);
        node.y = curY;
        var nh = this.getNodeHeight(node);
        if (nh > rowMaxH) rowMaxH = nh;
      }
    }
    curY += rowMaxH + gapY + 20;
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
    var nw = isOperatorNode(n.cmd) ? OP_NODE_SIZE : NODE_W;
    if (n.x + nw > maxX) maxX = n.x + nw;
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

    if (isOperatorNode(n.cmd)) {
      ctx.beginPath();
      ctx.arc(x + OP_NODE_SIZE / 2, y + OP_NODE_SIZE / 2, OP_NODE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def ? def.item.opSymbol : n.cmd, x + OP_NODE_SIZE / 2, y + OP_NODE_SIZE / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    } else {
      ctx.beginPath();
      ctx.roundRect(x, y, NODE_W, nh, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillRect(x, y, NODE_W, NODE_HEADER_H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(n.cmd, x + 8, y + 19);
    }
  });

  for (var ck in self.connections) {
    var c = self.connections[ck];
    var fromN = self.nodes[c.fromId];
    var toN = self.nodes[c.toId];
    if (!fromN || !toN) continue;
    var fromPos = self.getPortPosition(fromN, c.fromPort, 'out');
    var toPos = self.getPortPosition(toN, c.toPort, 'in');
    var x1 = fromPos.x - minX + pad;
    var y1 = fromPos.y - minY + pad;
    var x2 = toPos.x - minX + pad;
    var y2 = toPos.y - minY + pad;

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

FlowEngine.prototype.showInfoPopup = function(item, cat, evt) {
  this.dismissInfoPopup();
  var paramLines = '';
  if (item.params && item.params.length > 0) {
    paramLines = '<div class="cf-info-section"><div class="cf-info-section-title">Parameters</div>';
    for (var i = 0; i < item.params.length; i++) {
      var p = item.params[i];
      paramLines += '<div class="cf-info-param"><span class="cf-info-param-name">' + p.l + '</span>';
      if (p.d) paramLines += '<span class="cf-info-param-default">default: ' + p.d + '</span>';
      paramLines += '</div>';
    }
    paramLines += '</div>';
  }
  var syntax = item.cmd;
  if (item.params && item.params.length > 0) {
    var parts = [];
    for (var j = 0; j < item.params.length; j++) {
      parts.push(item.params[j].d || item.params[j].k);
    }
    syntax += ' ' + parts.join(' ');
  }
  var popup = document.createElement('div');
  popup.className = 'cf-info-popup';
  popup.innerHTML =
    '<div class="cf-info-popup-header" style="border-left:4px solid ' + cat.color + '">' +
      '<span class="cf-info-popup-cmd">' + item.cmd + '</span>' +
      '<span class="cf-info-popup-cat">' + cat.label + '</span>' +
    '</div>' +
    '<div class="cf-info-popup-body">' +
      '<div class="cf-info-desc">' + item.doc + '</div>' +
      '<div class="cf-info-section"><div class="cf-info-section-title">Syntax</div>' +
        '<pre class="cf-info-syntax">' + syntax + '</pre>' +
      '</div>' +
      paramLines +
    '</div>';
  document.body.appendChild(popup);
  this._infoPopup = popup;
  var rect = evt.target.getBoundingClientRect();
  var popupW = 260;
  var left = rect.right + 8;
  var top = rect.top - 10;
  if (left + popupW > window.innerWidth) left = rect.left - popupW - 8;
  if (top + 200 > window.innerHeight) top = window.innerHeight - 220;
  if (top < 10) top = 10;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  var self = this;
  setTimeout(function() {
    self._infoPopupClickHandler = function(e) {
      if (!popup.contains(e.target)) self.dismissInfoPopup();
    };
    document.addEventListener('mousedown', self._infoPopupClickHandler);
  }, 0);
};

FlowEngine.prototype.dismissInfoPopup = function() {
  if (this._infoPopup) {
    this._infoPopup.remove();
    this._infoPopup = null;
  }
  if (this._infoPopupClickHandler) {
    document.removeEventListener('mousedown', this._infoPopupClickHandler);
    this._infoPopupClickHandler = null;
  }
};

FlowEngine.prototype._animSpeed = 600;
FlowEngine.prototype._animRunning = false;
FlowEngine.prototype._animStepMode = false;
FlowEngine.prototype._animStepResolve = null;

FlowEngine.prototype.setAnimSpeed = function(speed) {
  this._animSpeed = speed;
};

FlowEngine.prototype.clearAnimations = function() {
  this._animRunning = false;
  var allNodes = this.canvasInner.querySelectorAll('.cf-node');
  for (var i = 0; i < allNodes.length; i++) {
    allNodes[i].classList.remove('cf-anim-active', 'cf-anim-green', 'cf-anim-red', 'cf-anim-blue');
    var badge = allNodes[i].querySelector('.cf-anim-value');
    if (badge) badge.remove();
    var counter = allNodes[i].querySelector('.cf-anim-counter');
    if (counter) counter.remove();
  }
  var paths = this.svgEl.querySelectorAll('.cf-conn');
  for (var j = 0; j < paths.length; j++) {
    paths[j].classList.remove('cf-conn-active');
    paths[j].removeAttribute('stroke-dasharray');
    paths[j].style.animation = '';
  }
};

FlowEngine.prototype.highlightNode = function(nodeId) {
  var node = this.nodes[nodeId];
  if (!node || !node._el) return;
  node._el.classList.add('cf-anim-active');
};

FlowEngine.prototype.unhighlightNode = function(nodeId) {
  var node = this.nodes[nodeId];
  if (!node || !node._el) return;
  node._el.classList.remove('cf-anim-active');
};

FlowEngine.prototype.setNodeResult = function(nodeId, result) {
  var node = this.nodes[nodeId];
  if (!node || !node._el) return;
  node._el.classList.remove('cf-anim-active', 'cf-anim-green', 'cf-anim-red', 'cf-anim-blue');
  if (result === 'green') node._el.classList.add('cf-anim-green');
  else if (result === 'red') node._el.classList.add('cf-anim-red');
  else if (result === 'blue') node._el.classList.add('cf-anim-blue');
};

FlowEngine.prototype.showNodeValue = function(nodeId, text) {
  var node = this.nodes[nodeId];
  if (!node || !node._el) return;
  var existing = node._el.querySelector('.cf-anim-value');
  if (existing) existing.remove();
  var badge = document.createElement('div');
  badge.className = 'cf-anim-value';
  badge.textContent = text.length > 20 ? text.substring(0, 18) + '..' : text;
  node._el.appendChild(badge);
};

FlowEngine.prototype.showLoopCounter = function(nodeId, iteration, total) {
  var node = this.nodes[nodeId];
  if (!node || !node._el) return;
  var existing = node._el.querySelector('.cf-anim-counter');
  if (existing) existing.remove();
  var counter = document.createElement('div');
  counter.className = 'cf-anim-counter';
  counter.textContent = iteration + '/' + total;
  node._el.appendChild(counter);
};

FlowEngine.prototype.animateConnection = function(fromId, toId) {
  var self = this;
  for (var k in this.connections) {
    var c = this.connections[k];
    if (c.fromId === fromId && c.toId === toId) {
      var path = this.svgEl.querySelector('[data-conn-id="' + k + '"]');
      if (path) {
        path.classList.add('cf-conn-active');
        var len = path.getTotalLength ? path.getTotalLength() : 100;
        path.setAttribute('stroke-dasharray', '10,5');
        path.style.animation = 'cfFlowDash ' + (self._animSpeed / 1000) + 's linear infinite';
      }
    }
  }
};

FlowEngine.prototype.findNodeByCmd = function(cmd, index) {
  var count = 0;
  var keys = Object.keys(this.nodes).sort(function(a, b) {
    return parseInt(a.replace('n', '')) - parseInt(b.replace('n', ''));
  });
  for (var i = 0; i < keys.length; i++) {
    if (this.nodes[keys[i]].cmd === cmd) {
      if (count === (index || 0)) return keys[i];
      count++;
    }
  }
  return null;
};

FlowEngine.prototype.findNodeByIndex = function(index) {
  var keys = Object.keys(this.nodes).sort(function(a, b) {
    return parseInt(a.replace('n', '')) - parseInt(b.replace('n', ''));
  });
  return keys[index] || null;
};

FlowEngine.prototype.getNodeIds = function() {
  return Object.keys(this.nodes).sort(function(a, b) {
    return parseInt(a.replace('n', '')) - parseInt(b.replace('n', ''));
  });
};

FlowEngine.prototype.stepResume = function() {
  if (this._animStepResolve) {
    var r = this._animStepResolve;
    this._animStepResolve = null;
    r();
  }
};

FlowEngine.prototype.animDelay = function() {
  var self = this;
  if (self._animStepMode) {
    return new Promise(function(resolve) {
      self._animStepResolve = resolve;
    });
  }
  return new Promise(function(resolve) {
    setTimeout(resolve, self._animSpeed);
  });
};

window.ClawFlowEngine = FlowEngine;

})();
