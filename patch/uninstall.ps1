$ErrorActionPreference = "Stop"

$BackupDir = ".mechanicus-backup"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Mechanicus Patch Uninstaller" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

function Find-OpenClaw {
    param([string]$Hint)
    if ($Hint -and (Test-Path $Hint)) { return (Resolve-Path $Hint).Path }
    $home = $env:USERPROFILE
    if (-not $home) { $home = $env:HOME }
    $candidates = @(
        (Join-Path $home "openclaw"),
        (Join-Path "." "openclaw"),
        "."
    )
    foreach ($c in $candidates) {
        if ((Test-Path $c) -and (Test-Path (Join-Path $c $BackupDir))) {
            return (Resolve-Path $c).Path
        }
    }
    return $null
}

$OpenClawRoot = Find-OpenClaw -Hint $args[0]

if (-not $OpenClawRoot) {
    Write-Host "ERROR: Could not find OpenClaw installation with Mechanicus backup." -ForegroundColor Red
    Write-Host "Usage: .\uninstall.ps1 C:\path\to\openclaw"
    exit 1
}

$BackupPath = Join-Path $OpenClawRoot $BackupDir
$InstalledList = Join-Path $BackupPath "installed-files.txt"
$BackedUpList = Join-Path $BackupPath "backed-up-files.txt"

if (-not (Test-Path $InstalledList)) {
    Write-Host "ERROR: No installation record found at $InstalledList" -ForegroundColor Red
    Write-Host "Mechanicus does not appear to be installed here."
    exit 1
}

Write-Host "OpenClaw root: $OpenClawRoot"
Write-Host ""

$removed = 0
$restored = 0

Write-Host "[1/3] Removing new files added by Mechanicus..."

$installedFiles = Get-Content $InstalledList
$backedUpFiles = @()
if (Test-Path $BackedUpList) {
    $backedUpFiles = Get-Content $BackedUpList
}

foreach ($rel in $installedFiles) {
    if ($backedUpFiles -contains $rel) { continue }
    $target = Join-Path $OpenClawRoot $rel
    if (Test-Path $target) {
        Remove-Item $target -Force
        $removed++
    }
}

Write-Host "  Removed $removed new files"
Write-Host ""

Write-Host "[2/3] Restoring original files from backup..."

foreach ($rel in $backedUpFiles) {
    $backupFile = Join-Path $BackupPath $rel
    $target = Join-Path $OpenClawRoot $rel
    if (Test-Path $backupFile) {
        $targetDir = Split-Path -Parent $target
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        Copy-Item $backupFile $target -Force
        $restored++
    }
}

Write-Host "  Restored $restored original files"
Write-Host ""

Write-Host "[3/3] Cleaning up backup directory..."

Remove-Item $BackupPath -Recurse -Force
Write-Host "  Removed $BackupDir\"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  UNINSTALL COMPLETE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Removed:  $removed new files"
Write-Host "  Restored: $restored original files"
Write-Host ""
Write-Host "  OpenClaw has been restored to its pre-patch state."
Write-Host ""
