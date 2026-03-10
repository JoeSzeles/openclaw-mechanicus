Write-Host "[start] Starting OpenClaw Mechanicus..." -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$envFile = Join-Path $ScriptDir ".env"
if (Test-Path $envFile) {
    Write-Host "[start] Loading .env file..."
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim()
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
} else {
    Write-Host "[start] WARNING: No .env file found. Copy .env.example to .env and fill in your credentials." -ForegroundColor Yellow
}

$env:OPENCLAW_HOME = $env:USERPROFILE
if (-not $env:OPENCLAW_HOME) { $env:OPENCLAW_HOME = [Environment]::GetFolderPath("UserProfile") }
$env:OPENCLAW_GATEWAY_PORT = "5001"

Write-Host "[start] App directory:  $ScriptDir"
Write-Host "[start] Home directory: $($env:OPENCLAW_HOME)"
Write-Host "[start] Data directory: $($env:OPENCLAW_HOME)\.openclaw"
Write-Host ""

Write-Host "[start] Environment check:" -ForegroundColor Cyan
if ($env:IG_API_KEY) { Write-Host "  IG_API_KEY:          set" -ForegroundColor Green }
else { Write-Host "  IG_API_KEY:          NOT SET - edit .env file" -ForegroundColor Yellow }

if ($env:IG_USERNAME) { Write-Host "  IG_USERNAME:         set" -ForegroundColor Green }
else { Write-Host "  IG_USERNAME:         NOT SET - edit .env file" -ForegroundColor Yellow }

if ($env:IG_PASSWORD) { Write-Host "  IG_PASSWORD:         set" -ForegroundColor Green }
else { Write-Host "  IG_PASSWORD:         NOT SET - edit .env file" -ForegroundColor Yellow }

if ($env:IG_ACCOUNT_ID) { Write-Host "  IG_ACCOUNT_ID:       set" -ForegroundColor Green }
else { Write-Host "  IG_ACCOUNT_ID:       NOT SET - edit .env file" -ForegroundColor Yellow }

$acctType = if ($env:IG_ACCOUNT_TYPE) { $env:IG_ACCOUNT_TYPE } else { "demo" }
Write-Host "  IG_ACCOUNT_TYPE:     $acctType" -ForegroundColor Cyan

if ($env:DATABASE_URL) { Write-Host "  DATABASE_URL:        set" -ForegroundColor Green }
else { Write-Host "  DATABASE_URL:        NOT SET (backtests/optimization will use file storage)" -ForegroundColor Yellow }

if ($env:GROQ_API_KEY) { Write-Host "  GROQ_API_KEY:        set" -ForegroundColor Green }
else { Write-Host "  GROQ_API_KEY:        NOT SET (AI calibration disabled)" -ForegroundColor DarkGray }

if ($env:OPENCLAW_LOGIN_USER -and $env:OPENCLAW_LOGIN_PASSWORD) {
    Write-Host "  Login protection:    ON (user: $($env:OPENCLAW_LOGIN_USER))" -ForegroundColor Green
} else {
    Write-Host "  Login protection:    OFF (no password set)" -ForegroundColor DarkGray
}
Write-Host ""

if (-not (Test-Path "dist\entry.js")) {
    Write-Host "[start] FATAL: dist\entry.js not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "ceo-proxy.cjs")) {
    Write-Host "[start] FATAL: ceo-proxy.cjs not found - run the installer first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$proxyPort = if ($env:OPENCLAW_PROXY_PORT) { $env:OPENCLAW_PROXY_PORT } else { "5000" }
$gatewayPort = if ($env:OPENCLAW_GATEWAY_PORT) { $env:OPENCLAW_GATEWAY_PORT } else { "5001" }

Write-Host "[start] Launching CEO proxy on port $proxyPort..." -ForegroundColor Cyan
$proxy = Start-Process -FilePath "node" -ArgumentList "ceo-proxy.cjs" -WorkingDirectory $ScriptDir -PassThru -NoNewWindow
Write-Host "[start] CEO proxy PID: $($proxy.Id)"

Write-Host "[start] Waiting for CEO proxy + IG connection..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

if ($proxy.HasExited) {
    Write-Host ""
    Write-Host "  [X] CEO proxy FAILED to start (exit code: $($proxy.ExitCode))" -ForegroundColor Red
    Write-Host "  [X] Check for errors above. Common issues:" -ForegroundColor Red
    Write-Host "      - Port $proxyPort already in use (kill other node processes)" -ForegroundColor Yellow
    Write-Host "      - Missing 'ws' package: npm install ws" -ForegroundColor Yellow
    Write-Host "      - Missing 'pg' package: npm install pg" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Falling back to gateway-only mode on port $gatewayPort..." -ForegroundColor Yellow
    Write-Host "  Open: http://localhost:$gatewayPort" -ForegroundColor Green
    Write-Host ""
    node dist/entry.js gateway --bind loopback --port $gatewayPort --allow-unconfigured
    exit
}

Write-Host "[start] Launching OpenClaw gateway on port $gatewayPort..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host "  OpenClaw Mechanicus is running!" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Open in browser:  http://localhost:$proxyPort" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard:     http://localhost:$proxyPort" -ForegroundColor DarkCyan
Write-Host "  IG Dashboard:  http://localhost:$proxyPort/__openclaw__/canvas/ig-dashboard.html" -ForegroundColor DarkCyan
Write-Host "  Config:        http://localhost:$proxyPort/model-config.html" -ForegroundColor DarkCyan
Write-Host "  Processes:     http://localhost:$proxyPort/processes.html" -ForegroundColor DarkCyan
Write-Host "  Workers:       http://localhost:$proxyPort/workers.html" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Watch the log below for [ig-session] Connected to demo/live profile" -ForegroundColor DarkGray
Write-Host "  If you see 'Login failed' check your .env credentials" -ForegroundColor DarkGray
Write-Host ""
node dist/entry.js gateway --bind loopback --port $gatewayPort --allow-unconfigured
