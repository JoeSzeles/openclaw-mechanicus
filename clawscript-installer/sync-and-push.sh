#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALLER_DIR="$SCRIPT_DIR"
REPO_URL="https://github.com/JoeSzeles/clawscript.git"
CLONE_DIR="/tmp/clawscript-push-$$"

trap 'rm -rf "$CLONE_DIR"' EXIT

echo "╔════════════════════════════════════════════╗"
echo "║  ClawScript Sync & Push to GitHub          ║"
echo "╚════════════════════════════════════════════╝"
echo ""

echo "[1/6] Running sync-clawscript.sh to pull canonical sources..."
if [ -f "$ROOT_DIR/.openclaw/canvas/sync-clawscript.sh" ]; then
  bash "$ROOT_DIR/.openclaw/canvas/sync-clawscript.sh"
else
  echo "  (sync-clawscript.sh not found, assuming installer is already up to date)"
fi

echo ""
echo "[2/6] Cloning $REPO_URL..."
git clone --quiet "$REPO_URL" "$CLONE_DIR"
echo "  Cloned to $CLONE_DIR"

echo ""
echo "[3/6] Mirroring installer contents to clone..."
find "$CLONE_DIR" -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +
find "$INSTALLER_DIR" -mindepth 1 -maxdepth 1 -not -name '.git' -not -name 'sync-and-push.sh' -exec cp -r {} "$CLONE_DIR/" \;
cp "$INSTALLER_DIR/sync-and-push.sh" "$CLONE_DIR/sync-and-push.sh"
echo "  All files mirrored (including deletions)"

echo ""
echo "[4/6] Checking for changes..."
cd "$CLONE_DIR"
git add -A

CHANGED_FILES=$(git diff --cached --stat | tail -1)
if [ -z "$CHANGED_FILES" ] || echo "$CHANGED_FILES" | grep -q "0 files changed"; then
  echo "  No content changes. GitHub is already up to date."
  exit 0
fi
echo "  $CHANGED_FILES"

echo ""
echo "[5/6] Running tests..."
if node test/test-clawscript-parser.cjs > /tmp/cs-test-output-$$.log 2>&1; then
  PASS_COUNT=$(grep "^Total:" /tmp/cs-test-output-$$.log | sed 's/.*Passed: \([0-9]*\).*/\1/' || echo "?")
  echo "  All $PASS_COUNT tests passed"
else
  echo "  TESTS FAILED! Aborting push."
  tail -20 /tmp/cs-test-output-$$.log
  rm -f /tmp/cs-test-output-$$.log
  exit 1
fi
rm -f /tmp/cs-test-output-$$.log

echo ""
echo "[6/6] Bumping version, committing, and pushing..."
VERSION_FILE="$INSTALLER_DIR/VERSION"
if [ ! -f "$VERSION_FILE" ]; then
  echo "1.0.0" > "$VERSION_FILE"
fi
CURRENT_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "  $CURRENT_VERSION -> $NEW_VERSION (built $BUILD_DATE)"

echo "$NEW_VERSION" > "$VERSION_FILE"
cp "$VERSION_FILE" "$CLONE_DIR/VERSION"
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$INSTALLER_DIR/package.json"
cp "$INSTALLER_DIR/package.json" "$CLONE_DIR/package.json"

cd "$CLONE_DIR"
git add -A
git config user.email "agent@openclaw.ai"
git config user.name "OpenClaw Agent"

git commit -m "v$NEW_VERSION: sync from OpenClaw workspace

$CHANGED_FILES
Built: $BUILD_DATE"

git push origin main 2>&1

echo ""
echo "════════════════════════════════════════════"
echo "  Pushed v$NEW_VERSION to GitHub"
echo "  $CHANGED_FILES"
echo "════════════════════════════════════════════"
