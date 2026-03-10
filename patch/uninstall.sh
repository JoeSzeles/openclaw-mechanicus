#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=".mechanicus-backup"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  OpenClaw Mechanicus Patch Uninstaller                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

detect_openclaw() {
  if [ -n "${1:-}" ] && [ -d "$1" ]; then
    echo "$1"
    return
  fi
  local home="${HOME:-$(eval echo ~)}"
  for candidate in "$home/openclaw" "./openclaw" "."; do
    if [ -d "$candidate/$BACKUP_DIR" ]; then
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
  echo "ERROR: Could not find OpenClaw installation with Mechanicus backup."
  echo "Usage: bash uninstall.sh /path/to/openclaw"
  exit 1
fi

BACKUP_PATH="$OPENCLAW_ROOT/$BACKUP_DIR"
INSTALLED_LIST="$BACKUP_PATH/installed-files.txt"
BACKED_UP_LIST="$BACKUP_PATH/backed-up-files.txt"

if [ ! -f "$INSTALLED_LIST" ]; then
  echo "ERROR: No installation record found at $INSTALLED_LIST"
  echo "Mechanicus does not appear to be installed here."
  exit 1
fi

echo "OpenClaw root: $OPENCLAW_ROOT"
echo ""

removed=0
restored=0
skipped=0

echo "[1/3] Removing new files added by Mechanicus..."

while IFS= read -r rel; do
  target="$OPENCLAW_ROOT/$rel"
  if [ -f "$BACKUP_PATH/$rel" ]; then
    continue
  fi
  if [ -f "$target" ]; then
    rm -f "$target"
    removed=$((removed + 1))
  fi
done < "$INSTALLED_LIST"

echo "  Removed $removed new files"
echo ""

echo "[2/3] Restoring original files from backup..."

if [ -f "$BACKED_UP_LIST" ]; then
  while IFS= read -r rel; do
    backup_file="$BACKUP_PATH/$rel"
    target="$OPENCLAW_ROOT/$rel"
    if [ -f "$backup_file" ]; then
      mkdir -p "$(dirname "$target")"
      cp "$backup_file" "$target"
      restored=$((restored + 1))
    else
      skipped=$((skipped + 1))
    fi
  done < "$BACKED_UP_LIST"
fi

echo "  Restored $restored original files"
if [ "$skipped" -gt 0 ]; then
  echo "  Skipped $skipped (backup file missing)"
fi
echo ""

echo "[3/3] Cleaning up backup directory..."

rm -rf "$BACKUP_PATH"
echo "  Removed $BACKUP_DIR/"

find "$OPENCLAW_ROOT" -type d -empty -delete 2>/dev/null || true

echo ""
echo "════════════════════════════════════════════════════════"
echo "  UNINSTALL COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Removed:  $removed new files"
echo "  Restored: $restored original files"
echo ""
echo "  OpenClaw has been restored to its pre-patch state."
echo ""
