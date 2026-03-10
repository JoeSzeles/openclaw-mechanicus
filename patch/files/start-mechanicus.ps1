Write-Host "[start] Starting OpenClaw Mechanicus..." -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$env:OPENCLAW_HOME = $env:USERPROFILE
if (-not $env:OPENCLAW_HOME) { $env:OPENCLAW_HOME = [Environment]::GetFolderPath("UserProfile") }
$env:OPENCLAW_GATEWAY_PORT = "5001"

Write-Host "[start] App directory:  $ScriptDir"
Write-Host "[start] Home directory: $($env:OPENCLAW_HOME)"
Write-Host "[start] Data directory: $($env:OPENCLAW_HOME)\.openclaw"

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

Write-Host "[start] Launching CEO proxy on port 5000..."
$proxy = Start-Process -FilePath "node" -ArgumentList "ceo-proxy.cjs" -WorkingDirectory $ScriptDir -PassThru -NoNewWindow
Write-Host "[start] CEO proxy PID: $($proxy.Id)"

Start-Sleep -Seconds 3

Write-Host "[start] Launching OpenClaw gateway on port 5001..."
Write-Host ""
Write-Host "  Open your browser to: http://localhost:5000" -ForegroundColor Green
Write-Host "  IG Dashboard:         http://localhost:5000/__openclaw__/canvas/ig-dashboard.html" -ForegroundColor Green
Write-Host ""
node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
