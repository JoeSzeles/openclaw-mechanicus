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

if not defined OPENCLAW_PROXY_PORT set OPENCLAW_PROXY_PORT=5000
if not defined OPENCLAW_GATEWAY_PORT set OPENCLAW_GATEWAY_PORT=5001

echo [start] Launching CEO proxy on port %OPENCLAW_PROXY_PORT%...
start /b node ceo-proxy.cjs

echo [start] Waiting for CEO proxy + IG connection...
timeout /t 5 /nobreak >nul

echo [start] Launching OpenClaw gateway on port %OPENCLAW_GATEWAY_PORT%...
echo.
echo   ================================================
echo   OpenClaw Mechanicus is running!
echo   ================================================
echo.
echo   Open in browser:  http://localhost:%OPENCLAW_PROXY_PORT%
echo.
echo   Dashboard:     http://localhost:%OPENCLAW_PROXY_PORT%
echo   IG Dashboard:  http://localhost:%OPENCLAW_PROXY_PORT%/__openclaw__/canvas/ig-dashboard.html
echo   Config:        http://localhost:%OPENCLAW_PROXY_PORT%/model-config.html
echo   Processes:     http://localhost:%OPENCLAW_PROXY_PORT%/processes.html
echo   Workers:       http://localhost:%OPENCLAW_PROXY_PORT%/workers.html
echo.
echo   If CEO proxy failed, try: http://localhost:%OPENCLAW_GATEWAY_PORT%
echo.
echo   Watch log for [ig-session] Connected to demo/live profile
echo   If you see 'Login failed' check your .env credentials
echo.
node dist/entry.js gateway --bind loopback --port %OPENCLAW_GATEWAY_PORT% --allow-unconfigured
