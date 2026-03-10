@echo off
echo [start] Starting OpenClaw Mechanicus...
echo [start] CWD: %CD%

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

set OPENCLAW_HOME=%SCRIPT_DIR%
set OPENCLAW_GATEWAY_PORT=5001

echo [start] OpenClaw Home: %OPENCLAW_HOME%

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

timeout /t 3 /nobreak >nul

echo [start] Launching OpenClaw gateway on port 5001...
node dist/entry.js gateway --bind loopback --port 5001 --allow-unconfigured
