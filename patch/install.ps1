$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FilesDir = Join-Path $ScriptDir "files"
$BackupDir = ".mechanicus-backup"
$Version = "2026.3.10"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Mechanicus Patch Installer v$Version" -ForegroundColor Cyan
Write-Host "  IG Trading - 23 Strategies - Optimization Engine" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

function Find-OpenClaw {
    param([string]$Hint)
    if ($Hint -and (Test-Path $Hint)) { return (Resolve-Path $Hint).Path }
    $userHome = $env:USERPROFILE
    if (-not $userHome) { $userHome = $HOME }
    $candidates = @(
        (Join-Path $userHome "openclaw"),
        (Join-Path "." "openclaw")
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $resolved = (Resolve-Path $c).Path
            if ((Test-Path (Join-Path $resolved "package.json")) -and
                (Test-Path (Join-Path $resolved "dist"))) {
                return $resolved
            }
        }
    }
    $npmGlobal = Join-Path $env:APPDATA "npm\node_modules\openclaw"
    if (Test-Path $npmGlobal) { return $npmGlobal }
    return $null
}

$OpenClawRoot = Find-OpenClaw -Hint $args[0]

if (-not $OpenClawRoot) {
    Write-Host "ERROR: Could not find OpenClaw installation." -ForegroundColor Red
    Write-Host "Usage: .\install.ps1 C:\path\to\openclaw"
    Write-Host ""
    Write-Host "Provide the root directory of your OpenClaw installation."
    exit 1
}

if (-not (Test-Path $FilesDir)) {
    Write-Host "ERROR: files\ directory not found next to this script." -ForegroundColor Red
    Write-Host "Make sure you cloned the full repository."
    exit 1
}

Write-Host "OpenClaw root: $OpenClawRoot"
Write-Host ""

$BackupPath = Join-Path $OpenClawRoot $BackupDir
$InstalledList = Join-Path $BackupPath "installed-files.txt"
$BackedUpList = Join-Path $BackupPath "backed-up-files.txt"

New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

$backedUp = 0
$installed = 0
$newFiles = 0
$installedFiles = @()
$backedUpFiles = @()

Write-Host "[1/3] Backing up files that will be overwritten..."

$allFiles = Get-ChildItem -Path $FilesDir -Recurse -File
foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($FilesDir.Length + 1)
    $target = Join-Path $OpenClawRoot $rel
    if (Test-Path $target) {
        $backupTarget = Join-Path $BackupPath $rel
        $backupDir2 = Split-Path -Parent $backupTarget
        New-Item -ItemType Directory -Path $backupDir2 -Force | Out-Null
        Copy-Item $target $backupTarget -Force
        $backedUpFiles += $rel
        $backedUp++
    }
}

$backedUpFiles | Sort-Object | Set-Content $BackedUpList
Write-Host "  Backed up $backedUp existing files to $BackupDir\"
Write-Host ""

Write-Host "[2/3] Installing Mechanicus files..."

# Inject navigation into index.html
$indexPath = Join-Path $OpenClawRoot "index.html"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    if ($indexContent -notmatch "nav-inject.js") {
        $indexContent = $indexContent -replace "(<openclaw-app.*?>)", "$1<script src=""/nav-inject.js""></script>"
        if ($indexContent -notmatch "nav-inject.js") {
            $indexContent = $indexContent -replace "</body>", "<script src=""/nav-inject.js""></script></body>"
        }
        $indexContent | Set-Content $indexPath
        Write-Host "  Injected navigation into index.html"
    }
}

foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($FilesDir.Length + 1)
    $target = Join-Path $OpenClawRoot $rel
    $targetDir = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Copy-Item $f.FullName $target -Force
    $installedFiles += $rel
    $installed++
}

$newFiles = $installed - $backedUp
$installedFiles | Sort-Object | Set-Content $InstalledList
Write-Host "  Installed $installed files ($newFiles new, $backedUp updated)"
Write-Host ""

Write-Host "[3/4] Neural Trading (BrainJar) setup..."
Write-Host ""
Write-Host "  The Neural Trading tab uses BrainJar's brain engine."
Write-Host "  This requires the Drosophila brain model (~177MB)."
Write-Host ""
$installBrain = Read-Host "  Install Drosophila brain model? (y/n) [n]"
if (-not $installBrain) { $installBrain = "n" }

$BrainDir = Join-Path $OpenClawRoot "openclaw-mechanicus-patches\brainjar"

if ($installBrain -eq "y" -or $installBrain -eq "Y") {
    Write-Host "  Cloning Drosophila brain model..."
    New-Item -ItemType Directory -Path $BrainDir -Force | Out-Null
    $brainModelDir = Join-Path $BrainDir "Drosophila_brain_model"
    if (Test-Path $brainModelDir) {
        Write-Host "  Brain model already present, updating..."
        Push-Location $brainModelDir
        git pull 2>$null
        Pop-Location
    } else {
        git clone https://github.com/JoeSzeles/Drosophila_brain_model.git $brainModelDir 2>$null
    }
    Write-Host "  Brain model installed at $brainModelDir"
    Write-Host ""
    Write-Host "  To start the brain engine:"
    Write-Host "    cd $brainModelDir && python brain_engine.py"
    Write-Host "  Or register it as a bot in the IG Dashboard Bots tab."
} else {
    Write-Host "  Skipping brain model installation."
    Write-Host "  You can install it later by cloning:"
    Write-Host "    git clone https://github.com/JoeSzeles/Drosophila_brain_model.git $BrainDir\Drosophila_brain_model"
}
Write-Host ""

$brainBotSrc = Join-Path $ScriptDir "..\skills\bots\brain-engine-bot.cjs"
if (Test-Path $brainBotSrc) {
    $botsDir = Join-Path $OpenClawRoot "skills\bots"
    New-Item -ItemType Directory -Path $botsDir -Force | Out-Null
    Copy-Item $brainBotSrc (Join-Path $botsDir "brain-engine-bot.cjs") -Force
    Write-Host "  Brain engine bot manager installed."
}
Write-Host ""

Write-Host "[4/4] Checking dependencies..."

$pkgJson = Join-Path $OpenClawRoot "package.json"
$depsNeeded = @()
if (Test-Path $pkgJson) {
    $pkg = Get-Content $pkgJson -Raw
    foreach ($dep in @("pg", "lightstreamer-client-node")) {
        if ($pkg -notmatch "`"$dep`"") {
            $depsNeeded += $dep
        }
    }
}

if ($depsNeeded.Count -gt 0) {
    $depStr = $depsNeeded -join " "
    Write-Host "  Additional npm packages needed: $depStr"
    Write-Host "  Run: npm install $depStr"
    Write-Host "  (or: pnpm add $depStr)"
} else {
    Write-Host "  All dependencies present."
}

$Version | Set-Content (Join-Path $BackupPath "version.txt")
(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ") | Set-Content (Join-Path $BackupPath "installed-at.txt")

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  INSTALLATION COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Files installed: $installed"
Write-Host "  Backup location: $OpenClawRoot\$BackupDir\"
Write-Host ""
Write-Host "  Required environment variables:" -ForegroundColor Yellow
Write-Host "    IG_API_KEY        - Your IG trading API key"
Write-Host "    IG_IDENTIFIER     - Your IG account username"
Write-Host "    IG_PASSWORD       - Your IG account password"
Write-Host "    IG_ACCOUNT_TYPE   - 'demo' or 'live'"
Write-Host "    DATABASE_URL      - PostgreSQL connection string"
Write-Host "    GROQ_API_KEY      - For AI calibration (optional)"
Write-Host ""
Write-Host "  To uninstall and restore originals:"
Write-Host "    .\uninstall.ps1 $OpenClawRoot"
Write-Host ""
