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
}

$env:OPENCLAW_HOME = $env:USERPROFILE
if (-not $env:OPENCLAW_HOME) { $env:OPENCLAW_HOME = [Environment]::GetFolderPath("UserProfile") }
$env:OPENCLAW_GATEWAY_PORT = "5001"

Write-Host "[start] App directory:  $ScriptDir"
Write-Host "[start] Home directory: $($env:OPENCLAW_HOME)"
Write-Host "[start] Data directory: $($env:OPENCLAW_HOME)\.openclaw"

if ($env:IG_API_KEY) { Write-Host "[start] IG_API_KEY:     set" -ForegroundColor Green }
else { Write-Host "[start] IG_API_KEY:     NOT SET - edit .env file" -ForegroundColor Yellow }

if ($env:DATABASE_URL) { Write-Host "[start] DATABASE_URL:   set" -ForegroundColor Green }
else { Write-Host "[start] DATABASE_URL:   NOT SET - edit .env file" -ForegroundColor Yellow }

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
