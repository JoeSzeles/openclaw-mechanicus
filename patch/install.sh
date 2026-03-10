#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILES_DIR="$SCRIPT_DIR/files"
BACKUP_DIR=".mechanicus-backup"
VERSION="2026.3.10"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  OpenClaw Mechanicus Patch Installer v$VERSION        ║"
echo "║  IG Trading · 23 Strategies · Optimization Engine     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

detect_openclaw() {
  if [ -n "${1:-}" ] && [ -d "$1" ]; then
    echo "$1"
    return
  fi
  local home="${HOME:-$(eval echo ~)}"
  for candidate in "$home/openclaw" "./openclaw"; do
    if [ -d "$candidate" ] && [ -f "$candidate/package.json" ] && [ -d "$candidate/dist" ]; then
      local resolved
      resolved="$(cd "$candidate" && pwd)"
      echo "$resolved"
      return
    fi
  done
  echo ""
}

OPENCLAW_ROOT=$(detect_openclaw "${1:-}")

if [ -z "$OPENCLAW_ROOT" ]; then
  echo "ERROR: Could not find OpenClaw installation."
  echo "Usage: bash install.sh /path/to/openclaw"
  echo ""
  echo "Provide the root directory of your OpenClaw installation."
  exit 1
fi

if [ ! -d "$FILES_DIR" ]; then
  echo "ERROR: files/ directory not found next to this script."
  echo "Make sure you cloned the full repository."
  exit 1
fi

echo "OpenClaw root: $OPENCLAW_ROOT"
echo ""

BACKUP_PATH="$OPENCLAW_ROOT/$BACKUP_DIR"
INSTALLED_LIST="$BACKUP_PATH/installed-files.txt"
BACKED_UP_LIST="$BACKUP_PATH/backed-up-files.txt"

mkdir -p "$BACKUP_PATH"

backed_up=0
installed=0
new_files=0

echo "[1/3] Backing up files that will be overwritten..."

cd "$FILES_DIR"
find . -type f | sed 's|^\./||' | sort | while IFS= read -r rel; do
  target="$OPENCLAW_ROOT/$rel"
  if [ -f "$target" ]; then
    backup_target="$BACKUP_PATH/$rel"
    mkdir -p "$(dirname "$backup_target")"
    cp "$target" "$backup_target"
    echo "$rel" >> "$BACKED_UP_LIST.tmp"
  fi
done

if [ -f "$BACKED_UP_LIST.tmp" ]; then
  sort "$BACKED_UP_LIST.tmp" > "$BACKED_UP_LIST"
  rm -f "$BACKED_UP_LIST.tmp"
  backed_up=$(wc -l < "$BACKED_UP_LIST")
else
  touch "$BACKED_UP_LIST"
fi

echo "  Backed up $backed_up existing files to $BACKUP_DIR/"
echo ""

echo "[2/3] Installing Mechanicus files..."

cd "$FILES_DIR"
find . -type f | sed 's|^\./||' | sort | while IFS= read -r rel; do
  target="$OPENCLAW_ROOT/$rel"
  mkdir -p "$(dirname "$target")"
  cp "$FILES_DIR/$rel" "$target"
  echo "$rel" >> "$INSTALLED_LIST.tmp"
done

if [ -f "$INSTALLED_LIST.tmp" ]; then
  sort "$INSTALLED_LIST.tmp" > "$INSTALLED_LIST"
  rm -f "$INSTALLED_LIST.tmp"
  installed=$(wc -l < "$INSTALLED_LIST")
  new_files=$((installed - backed_up))
fi

echo "  Installed $installed files ($new_files new, $backed_up updated)"
echo ""

echo "[3/3] Checking dependencies..."

cd "$OPENCLAW_ROOT"
deps_needed=""
if [ -f "package.json" ]; then
  for dep in pg ws lightstreamer-client-node; do
    if ! grep -q "\"$dep\"" package.json 2>/dev/null; then
      deps_needed="$deps_needed $dep"
    fi
  done
fi

if [ -n "$deps_needed" ]; then
  echo "  Additional npm packages needed:$deps_needed"
  echo "  Run: npm install$deps_needed"
  echo "  (or: pnpm add$deps_needed)"
else
  echo "  All dependencies present."
fi

echo "$VERSION" > "$BACKUP_PATH/version.txt"
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$BACKUP_PATH/installed-at.txt"

echo ""
echo "════════════════════════════════════════════════════════"
echo "  INSTALLATION COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Files installed: $installed"
echo "  Backup location: $OPENCLAW_ROOT/$BACKUP_DIR/"
echo ""
echo "  Required environment variables:"
echo "    IG_API_KEY        - Your IG trading API key"
echo "    IG_IDENTIFIER     - Your IG account username"
echo "    IG_PASSWORD        - Your IG account password"
echo "    IG_ACCOUNT_TYPE   - 'demo' or 'live'"
echo "    DATABASE_URL      - PostgreSQL connection string"
echo "    GROQ_API_KEY      - For AI calibration (optional)"
echo ""
echo "  To uninstall and restore originals:"
echo "    bash uninstall.sh $OPENCLAW_ROOT"
echo ""
