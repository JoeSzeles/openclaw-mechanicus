#
# ClawScript Uninstaller for OpenClaw (PowerShell)
# Usage: .\uninstall.ps1 [-OpenClawRoot <path>] [-SkillsRoot <path>]
#
param(
    [string]$OpenClawRoot = "",
    [string]$SkillsRoot = ""
)

$ErrorActionPreference = "Continue"

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

$BotsDir = "$SkillsRoot\bots"
$StratsDir = "$BotsDir\strategies"
$CanvasDir = "$OpenClawRoot\canvas"
$TemplatesDir = "$CanvasDir\clawscript-templates"
$ClawSkillDir = "$SkillsRoot\clawscript"

Write-Host ""
Write-Host "  ClawScript Uninstaller"
Write-Host "  ----------------------"
Write-Host "  OpenClaw: $OpenClawRoot"
Write-Host "  Skills:   $SkillsRoot"
Write-Host ""

$Removed = 0

function Safe-Remove {
    param([string]$Path, [string]$Label)
    if (Test-Path $Path) {
        Remove-Item -Force $Path -ErrorAction SilentlyContinue
        Write-Host "  DEL   $Label"
        $script:Removed++
    }
}

function Safe-RemoveGlob {
    param([string]$Dir, [string]$Pattern, [string]$Label)
    if (-not (Test-Path $Dir)) { return }
    $files = Get-ChildItem -Path $Dir -Filter $Pattern -File -ErrorAction SilentlyContinue
    $count = 0
    foreach ($f in $files) {
        Remove-Item -Force $f.FullName -ErrorAction SilentlyContinue
        $count++
    }
    if ($count -gt 0) {
        Write-Host "  DEL   $Label ($count files)"
        $script:Removed += $count
    }
}

Write-Host "  [1/6] Parser & libraries"
Safe-Remove "$BotsDir\clawscript-parser.cjs" "clawscript-parser.cjs"
Safe-Remove "$BotsDir\indicators.cjs" "indicators.cjs"
Safe-Remove "$BotsDir\clawscript-ai-handler.cjs" "clawscript-ai-handler.cjs"

Write-Host "  [2/6] OpenClaw stubs"
Safe-RemoveGlob $BotsDir "openclaw-*.cjs" "openclaw stubs"

Write-Host "  [3/6] Strategy framework"
Safe-Remove "$StratsDir\base-strategy.cjs" "base-strategy.cjs"
Safe-Remove "$StratsDir\index.cjs" "index.cjs"
if ((Test-Path $StratsDir) -and ((Get-ChildItem $StratsDir -ErrorAction SilentlyContinue).Count -eq 0)) {
    Remove-Item -Force $StratsDir -ErrorAction SilentlyContinue
    Write-Host "  DEL   strategies\"
}

Write-Host "  [4/6] Editor files"
Safe-Remove "$CanvasDir\clawscript-editor.html" "clawscript-editor.html"
Safe-Remove "$CanvasDir\ig-clawscript-ui.js" "ig-clawscript-ui.js"
Safe-Remove "$CanvasDir\ig-clawscript-flow.js" "ig-clawscript-flow.js"
Safe-Remove "$CanvasDir\clawscript-docs.html" "clawscript-docs.html"
Safe-Remove "$OpenClawRoot\serve-clawscript.cjs" "serve-clawscript.cjs"

Write-Host "  [5/6] Templates"
if (Test-Path $TemplatesDir) {
    Remove-Item -Recurse -Force $TemplatesDir -ErrorAction SilentlyContinue
    Write-Host "  DEL   clawscript-templates\"
    $Removed++
}

Write-Host "  [6/6] Skill docs"
Safe-Remove "$ClawSkillDir\CLAWSCRIPT.md" "CLAWSCRIPT.md"
if ((Test-Path $ClawSkillDir) -and ((Get-ChildItem $ClawSkillDir -ErrorAction SilentlyContinue).Count -eq 0)) {
    Remove-Item -Force $ClawSkillDir -ErrorAction SilentlyContinue
    Write-Host "  DEL   clawscript\"
}

$Manifest = "$CanvasDir\manifest.json"
if (Test-Path $Manifest) {
    try {
        $content = Get-Content $Manifest -Raw
        $m = $content | ConvertFrom-Json
        $filtered = $m | Where-Object { $_.file -ne "clawscript-docs.html" -and $_.file -ne "clawscript-editor.html" }
        if ($filtered.Count -ne $m.Count) {
            $filtered | ConvertTo-Json -Depth 10 | Set-Content $Manifest -Encoding UTF8
        }
    } catch {}
}

Write-Host ""
Write-Host "  Uninstall complete. Removed $Removed file(s)."
Write-Host ""
Write-Host "  To reinstall: .\clawscript\install.ps1"
Write-Host ""
