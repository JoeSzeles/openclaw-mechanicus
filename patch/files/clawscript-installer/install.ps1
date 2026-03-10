#
# ClawScript Installer for OpenClaw (PowerShell)
# Usage: .\install.ps1 [-OpenClawRoot <path>] [-SkillsRoot <path>]
#
param(
    [string]$OpenClawRoot = "",
    [string]$SkillsRoot = ""
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

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
            Write-Host "  Mode: Windows npm global install"
        } elseif (Test-Path "$home\.openclaw\skills") {
            $script:SkillsRoot = "$home\.openclaw\skills"
            Write-Host "  Mode: home directory layout"
        } elseif (Test-Path ".\skills") {
            $script:SkillsRoot = ".\skills"
            Write-Host "  Mode: local directory"
        } else {
            $script:SkillsRoot = "$script:OpenClawRoot\skills"
            Write-Host "  Mode: fallback (skills under openclaw root)"
        }
    } else {
        Write-Host "  Mode: explicit paths"
    }
}

Detect-Paths

$BotsDir = "$SkillsRoot\bots"
$StratsDir = "$BotsDir\strategies"
$CanvasDir = "$OpenClawRoot\canvas"
$TemplatesDir = "$CanvasDir\clawscript-templates"
$ClawSkillDir = "$SkillsRoot\clawscript"

$Version = "unknown"
if (Test-Path "$ScriptDir\VERSION") { $Version = (Get-Content "$ScriptDir\VERSION" -Raw).Trim() }

Write-Host ""
Write-Host "  ClawScript Installer v$Version"
Write-Host "  ------------------------------"
Write-Host "  OpenClaw: $OpenClawRoot"
Write-Host "  Skills:   $SkillsRoot"
Write-Host ""

$Errors = 0
$Installed = 0

function Safe-Copy {
    param([string]$Src, [string]$Dst, [string]$Label)
    if (-not (Test-Path $Src)) {
        Write-Host "  SKIP  $Label (source not found)"
        return
    }
    try {
        if (Test-Path $Dst) { Remove-Item -Force $Dst -ErrorAction SilentlyContinue }
        Copy-Item -Force $Src $Dst -ErrorAction Stop
        Write-Host "  OK    $Label"
        $script:Installed++
    } catch {
        Write-Host "  FAIL  $Label ($($_.Exception.Message))"
        $script:Errors++
    }
}

function Safe-CopyGlob {
    param([string]$SrcDir, [string]$Pattern, [string]$DstDir, [string]$Label)
    if (-not (Test-Path $SrcDir)) {
        Write-Host "  SKIP  $Label (directory not found)"
        return
    }
    $files = Get-ChildItem -Path $SrcDir -Filter $Pattern -File -ErrorAction SilentlyContinue
    if ($files.Count -eq 0) {
        Write-Host "  SKIP  $Label (no matching files)"
        return
    }
    $count = 0
    $fails = 0
    foreach ($f in $files) {
        try {
            $dst = Join-Path $DstDir $f.Name
            if (Test-Path $dst) { Remove-Item -Force $dst -ErrorAction SilentlyContinue }
            Copy-Item -Force $f.FullName $DstDir -ErrorAction Stop
            $count++
        } catch {
            $fails++
        }
    }
    if ($fails -gt 0) {
        Write-Host "  FAIL  $Label ($fails of $($count + $fails) failed)"
        $script:Errors += $fails
    } else {
        Write-Host "  OK    $Label ($count files)"
        $script:Installed += $count
    }
}

foreach ($d in @($BotsDir, $StratsDir, $CanvasDir, $TemplatesDir, $ClawSkillDir)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

Write-Host "  [1/7] Parser & libraries"
Safe-Copy "$ScriptDir\lib\clawscript-parser.cjs" "$BotsDir\clawscript-parser.cjs" "clawscript-parser.cjs"
Safe-Copy "$ScriptDir\lib\indicators.cjs" "$BotsDir\indicators.cjs" "indicators.cjs"
Safe-Copy "$ScriptDir\lib\clawscript-ai-handler.cjs" "$BotsDir\clawscript-ai-handler.cjs" "clawscript-ai-handler.cjs"

Write-Host "  [2/7] OpenClaw stubs"
Safe-CopyGlob "$ScriptDir\lib\openclaw" "openclaw-*.cjs" $BotsDir "openclaw stubs"

Write-Host "  [3/7] Strategy framework"
Safe-Copy "$ScriptDir\strategies\base-strategy.cjs" "$StratsDir\base-strategy.cjs" "base-strategy.cjs"
Safe-Copy "$ScriptDir\strategies\index.cjs" "$StratsDir\index.cjs" "index.cjs"

Write-Host "  [4/7] Editor files"
foreach ($old in @("$CanvasDir\clawscript-editor.html","$CanvasDir\ig-clawscript-ui.js","$CanvasDir\ig-clawscript-flow.js","$OpenClawRoot\serve-clawscript.cjs")) {
    if (Test-Path $old) { Remove-Item -Force $old -ErrorAction SilentlyContinue }
}
Safe-Copy "$ScriptDir\editor\clawscript-editor.html" "$CanvasDir\clawscript-editor.html" "clawscript-editor.html"
Safe-Copy "$ScriptDir\editor\ig-clawscript-ui.js" "$CanvasDir\ig-clawscript-ui.js" "ig-clawscript-ui.js"
Safe-Copy "$ScriptDir\editor\ig-clawscript-flow.js" "$CanvasDir\ig-clawscript-flow.js" "ig-clawscript-flow.js"
Safe-Copy "$ScriptDir\serve.cjs" "$OpenClawRoot\serve-clawscript.cjs" "serve-clawscript.cjs"

Write-Host "  [5/7] Templates"
Safe-CopyGlob "$ScriptDir\templates" "*.cs" $TemplatesDir "strategy templates"

Write-Host "  [6/7] Documentation"
Safe-Copy "$ScriptDir\docs\clawscript-docs.html" "$CanvasDir\clawscript-docs.html" "clawscript-docs.html"
Safe-Copy "$ScriptDir\docs\CLAWSCRIPT.md" "$ClawSkillDir\CLAWSCRIPT.md" "CLAWSCRIPT.md"

Write-Host "  [7/7] Manifest"
$Manifest = "$CanvasDir\manifest.json"
if (Test-Path $Manifest) {
    $content = Get-Content $Manifest -Raw -ErrorAction SilentlyContinue
    if ($content -match "clawscript-docs.html") {
        Write-Host "  OK    Already in manifest"
    } else {
        try {
            $m = $content | ConvertFrom-Json
            $entry = [PSCustomObject]@{ name="ClawScript Documentation"; file="clawscript-docs.html"; description="ClawScript language reference"; category="Documentation" }
            $m += $entry
            $m | ConvertTo-Json -Depth 10 | Set-Content $Manifest -Encoding UTF8
            Write-Host "  OK    Manifest updated"
        } catch {
            Write-Host "  SKIP  Manifest update failed"
        }
    }
} else {
    '[{"name":"ClawScript Documentation","file":"clawscript-docs.html","category":"Documentation"}]' | Set-Content $Manifest -Encoding UTF8
    Write-Host "  OK    Manifest created"
}

Write-Host ""
Write-Host "  -- Verify --"
$VerifyFail = 0
foreach ($checkName in @("clawscript-editor.html","ig-clawscript-ui.js","ig-clawscript-flow.js")) {
    $installed = "$CanvasDir\$checkName"
    $source = "$ScriptDir\editor\$checkName"
    if (Test-Path $installed) {
        $iSize = (Get-Item $installed).Length
        $sSize = if (Test-Path $source) { (Get-Item $source).Length } else { -1 }
        if ($iSize -eq $sSize) {
            Write-Host "  OK  $checkName ($($iSize)b)"
        } else {
            Write-Host "  ERR $checkName (installed=$($iSize)b, source=$($sSize)b) SIZE MISMATCH"
            $VerifyFail++
        }
    } else {
        Write-Host "  ERR $checkName MISSING"
        $VerifyFail++
    }
}

Write-Host ""
if ($Errors -eq 0 -and $VerifyFail -eq 0) {
    Write-Host "  Install complete (v$Version). $Installed files, no errors."
} else {
    Write-Host "  Install complete with $Errors copy error(s), $VerifyFail verify error(s)."
}
Write-Host ""
Write-Host "  Editor: $CanvasDir\clawscript-editor.html"
Write-Host "  Server: node $OpenClawRoot\serve-clawscript.cjs"
Write-Host ""
Write-Host "  AI: click gear icon in AI Assistant -> Auto-Find Agents"
Write-Host ""
