#
# ClawScript Updater for OpenClaw (PowerShell)
# Usage: .\update.ps1 [-OpenClawRoot <path>] [-SkillsRoot <path>]
#
# Downloads the latest version from GitHub, nukes old files, and re-installs.
#
param(
    [string]$OpenClawRoot = "",
    [string]$SkillsRoot = ""
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoUrl = "https://github.com/JoeSzeles/clawscript.git"

function Detect-Paths {
    $home = $env:USERPROFILE
    if (-not $home) { $home = [Environment]::GetFolderPath("UserProfile") }

    if ($OpenClawRoot -eq "") {
        if (Test-Path "$home\.openclaw") {
            $script:OpenClawRoot = "$home\.openclaw"
        } else {
            $script:OpenClawRoot = ".openclaw"
        }
    }

    if ($SkillsRoot -eq "") {
        $npmGlobal = "$env:APPDATA\npm\node_modules\openclaw\skills"
        if (-not $env:APPDATA) { $npmGlobal = "$home\AppData\Roaming\npm\node_modules\openclaw\skills" }

        if (Test-Path $npmGlobal) {
            $script:SkillsRoot = $npmGlobal
        } elseif (Test-Path "$home\.openclaw\skills") {
            $script:SkillsRoot = "$home\.openclaw\skills"
        } elseif (Test-Path ".\skills") {
            $script:SkillsRoot = ".\skills"
        } else {
            $script:SkillsRoot = "$script:OpenClawRoot\skills"
        }
    }
}

Detect-Paths

$CanvasDir = "$OpenClawRoot\canvas"

$CurVersion = "unknown"
if (Test-Path "$ScriptDir\VERSION") { $CurVersion = (Get-Content "$ScriptDir\VERSION" -Raw).Trim() }

Write-Host ""
Write-Host "  ClawScript Updater"
Write-Host "  ------------------"
Write-Host "  Current:  v$CurVersion"
Write-Host "  OpenClaw: $OpenClawRoot"
Write-Host "  Skills:   $SkillsRoot"
Write-Host ""

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "  ERROR: git is not installed."
    exit 1
}

$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) "clawscript-update-$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    Write-Host "  Downloading latest from GitHub..."
    & git clone --depth 1 --quiet $RepoUrl "$TempDir\clawscript" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: git clone failed. Check network/repo access."
        exit 1
    }

    $Src = "$TempDir\clawscript"
    $NewVersion = "unknown"
    if (Test-Path "$Src\VERSION") { $NewVersion = (Get-Content "$Src\VERSION" -Raw).Trim() }

    Write-Host "  Latest:  v$NewVersion"
    Write-Host ""

    Write-Host "  [1/4] Nuking old installed files..."
    foreach ($old in @(
        "$CanvasDir\clawscript-editor.html",
        "$CanvasDir\ig-clawscript-ui.js",
        "$CanvasDir\ig-clawscript-flow.js",
        "$CanvasDir\clawscript-docs.html",
        "$OpenClawRoot\serve-clawscript.cjs"
    )) {
        if (Test-Path $old) {
            Remove-Item -Force $old -ErrorAction SilentlyContinue
            Write-Host "  DEL   $(Split-Path -Leaf $old)"
        }
    }

    Write-Host ""
    Write-Host "  [2/4] Nuking old installer source files..."
    foreach ($old in @(
        "$ScriptDir\editor\clawscript-editor.html",
        "$ScriptDir\editor\ig-clawscript-ui.js",
        "$ScriptDir\editor\ig-clawscript-flow.js",
        "$ScriptDir\serve.cjs"
    )) {
        if (Test-Path $old) { Remove-Item -Force $old -ErrorAction SilentlyContinue }
    }
    Write-Host "  DEL   old installer editor + serve files"

    Write-Host ""
    Write-Host "  [3/4] Copying fresh files from GitHub..."

    function Safe-Update {
        param([string]$Src, [string]$Dst, [string]$Label)
        if (-not (Test-Path $Src)) { return }
        if (Test-Path $Dst) { Remove-Item -Force $Dst -ErrorAction SilentlyContinue }
        try {
            Copy-Item -Force $Src $Dst -ErrorAction Stop
            Write-Host "  OK    $Label"
        } catch {
            Write-Host "  FAIL  $Label"
        }
    }

    function Safe-UpdateDir {
        param([string]$SrcDir, [string]$Pattern, [string]$DstDir, [string]$Label)
        if (-not (Test-Path $SrcDir)) { return }
        $files = Get-ChildItem -Path $SrcDir -Filter $Pattern -File -ErrorAction SilentlyContinue
        $count = 0
        foreach ($f in $files) {
            $dst = Join-Path $DstDir $f.Name
            if (Test-Path $dst) { Remove-Item -Force $dst -ErrorAction SilentlyContinue }
            try { Copy-Item -Force $f.FullName $DstDir -ErrorAction Stop; $count++ } catch {}
        }
        if ($count -gt 0) { Write-Host "  OK    $Label ($count files)" }
    }

    foreach ($d in @("$ScriptDir\editor","$ScriptDir\lib","$ScriptDir\lib\openclaw","$ScriptDir\strategies","$ScriptDir\templates","$ScriptDir\docs")) {
        if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
    }

    Safe-Update "$Src\editor\clawscript-editor.html" "$ScriptDir\editor\clawscript-editor.html" "editor\clawscript-editor.html"
    Safe-Update "$Src\editor\ig-clawscript-ui.js" "$ScriptDir\editor\ig-clawscript-ui.js" "editor\ig-clawscript-ui.js"
    Safe-Update "$Src\editor\ig-clawscript-flow.js" "$ScriptDir\editor\ig-clawscript-flow.js" "editor\ig-clawscript-flow.js"
    Safe-UpdateDir "$Src\lib" "*.cjs" "$ScriptDir\lib" "lib\*.cjs"
    Safe-UpdateDir "$Src\lib\openclaw" "*.cjs" "$ScriptDir\lib\openclaw" "lib\openclaw\*.cjs"
    Safe-UpdateDir "$Src\strategies" "*.cjs" "$ScriptDir\strategies" "strategies\*.cjs"
    Safe-UpdateDir "$Src\templates" "*.cs" "$ScriptDir\templates" "templates\*.cs"
    Safe-UpdateDir "$Src\docs" "*" "$ScriptDir\docs" "docs\*"
    Safe-Update "$Src\serve.cjs" "$ScriptDir\serve.cjs" "serve.cjs"
    Safe-Update "$Src\VERSION" "$ScriptDir\VERSION" "VERSION"
    Safe-Update "$Src\install.sh" "$ScriptDir\install.sh" "install.sh"
    Safe-Update "$Src\install.ps1" "$ScriptDir\install.ps1" "install.ps1"
    Safe-Update "$Src\uninstall.sh" "$ScriptDir\uninstall.sh" "uninstall.sh"
    Safe-Update "$Src\uninstall.ps1" "$ScriptDir\uninstall.ps1" "uninstall.ps1"
    Safe-Update "$Src\update.sh" "$ScriptDir\update.sh" "update.sh"
    Safe-Update "$Src\update.ps1" "$ScriptDir\update.ps1" "update.ps1"

    Write-Host ""
    Write-Host "  [4/4] Running installer..."
    Write-Host ""
    & powershell -ExecutionPolicy Bypass -File "$ScriptDir\install.ps1" -OpenClawRoot $OpenClawRoot -SkillsRoot $SkillsRoot

    Write-Host "  Updated: v$CurVersion -> v$NewVersion"
    Write-Host ""
} finally {
    Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
}
