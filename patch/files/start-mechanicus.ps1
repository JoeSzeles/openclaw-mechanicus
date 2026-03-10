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

Write-Host "[start] Launching CEO proxy on port 5000..." -ForegroundColor Cyan
$proxy = Start-Process -FilePath "node" -ArgumentList "ceo-proxy.cjs" -WorkingDirectory $ScriptDir -PassThru -NoNewWindow
Write-Host "[start] CEO proxy PID: $($proxy.Id)"

Write-Host "[start] Waiting for IG connection..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Write-Host "[start] Launching OpenClaw gateway on port 5001..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host "  OpenClaw Mechanicus is starting up!" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Dashboard:     http://localhost:5000" -ForegroundColor Green
Write-Host "  IG Dashboard:  http://localhost:5000/__openclaw__/canvas/ig-dashboard.html" -ForegroundColor Green
Write-Host "  Config:        http://localhost:5000/model-config.html" -ForegroundColor Green
Write-Host "  Processes:     http://localhost:5000/processes.html" -ForegroundColor Green
Write-Host "  Workers:       http://localhost:5000/workers.html" -ForegroundColor Green
Write-Host ""
Write-Host "  Watch the log below for [ig-session] Connected to demo/live profile" -ForegroundColor DarkGray
Write-Host "  If you see 'Login failed' check your .env credentials" -ForegroundColor DarkGray
Write-Host ""
node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
