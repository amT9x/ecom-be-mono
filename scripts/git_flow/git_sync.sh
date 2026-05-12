#!/usr/bin/env bash

set -euo pipefail

echo "Checking repository..."

if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Repository not clean:"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch: $CURRENT_BRANCH"
echo "🔄 Syncing remote..."

git fetch --prune

if ! git switch main; then
    echo "❌ Cannot switch to main"
    exit 1
fi

if git pull --ff-only; then
    echo "✅ Main branch updated"
else
    echo "Run: git pull --rebase origin main"
    exit 1
fi

if [ "$CURRENT_BRANCH" != "main" ]; then
    git switch "$CURRENT_BRANCH"
    echo "✅ Returned to branch: $CURRENT_BRANCH"
    echo "👉 Continue your work."
fi
