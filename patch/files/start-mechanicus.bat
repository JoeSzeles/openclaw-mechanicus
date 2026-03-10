@echo off
setlocal EnableDelayedExpansion
echo [start] Starting OpenClaw Mechanicus...

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if exist ".env" (
    echo [start] Loading .env file...
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "line=%%A"
        if not "!line:~0,1!"=="#" (
            set "%%A=%%B"
        )
    )
) else (
    echo [start] WARNING: No .env file found. Copy .env.example to .env and fill in your credentials.
)

set OPENCLAW_HOME=%USERPROFILE%
set OPENCLAW_GATEWAY_PORT=5001

echo [start] App directory:  %SCRIPT_DIR%
echo [start] Home directory: %OPENCLAW_HOME%
echo [start] Data directory: %OPENCLAW_HOME%\.openclaw
echo.

if defined IG_API_KEY (echo   IG_API_KEY:       set) else (echo   IG_API_KEY:       NOT SET - edit .env file)
if defined IG_USERNAME (echo   IG_USERNAME:      set) else (echo   IG_USERNAME:      NOT SET - edit .env file)
if defined IG_PASSWORD (echo   IG_PASSWORD:      set) else (echo   IG_PASSWORD:      NOT SET - edit .env file)
if defined IG_ACCOUNT_ID (echo   IG_ACCOUNT_ID:    set) else (echo   IG_ACCOUNT_ID:    NOT SET - edit .env file)
if defined DATABASE_URL (echo   DATABASE_URL:     set) else (echo   DATABASE_URL:     NOT SET)
echo.

if not exist "dist\entry.js" (
    echo [start] FATAL: dist\entry.js not found
    pause
    exit /b 1
)

if not exist "ceo-proxy.cjs" (
    echo [start] FATAL: ceo-proxy.cjs not found - run the installer first
    pause
    exit /b 1
)

echo [start] Launching CEO proxy on port 5000...
start /b node ceo-proxy.cjs

echo [start] Waiting for IG connection...
timeout /t 5 /nobreak >nul

echo [start] Launching OpenClaw gateway on port 5001...
echo.
echo   Dashboard:     http://localhost:5000
echo   IG Dashboard:  http://localhost:5000/__openclaw__/canvas/ig-dashboard.html
echo   Config:        http://localhost:5000/model-config.html
echo   Processes:     http://localhost:5000/processes.html
echo   Workers:       http://localhost:5000/workers.html
echo.
echo   Watch log for [ig-session] Connected to demo/live profile
echo   If you see 'Login failed' check your .env credentials
echo.
node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
