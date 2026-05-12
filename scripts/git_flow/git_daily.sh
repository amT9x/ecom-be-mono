#!/usr/bin/env bash

set -euo pipefail

echo "Checking repository..."

BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"

# Protect main branch
if [ "$BRANCH" = "main" ]; then
    echo '❌ Working directly on "main" is not allowed'
    exit 0
fi

# Working tree status
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Code changes detected — review and commit before continuing"
else
    echo "✅ Working tree clean"
fi

echo "🔄 Syncing remote..."
git fetch --prune

LOCAL=$(git rev-parse @)

UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "none")

if [ "$UPSTREAM" = "none" ]; then
    echo "No upstream branch."
    echo "👉 Run: git push -u origin HEAD"
    exit 0
fi

REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Up to date."

elif [ "$LOCAL" = "$BASE" ]; then
    echo "⬇️ Remote ahead."
    echo "👉 Run: make git-sync"

elif [ "$REMOTE" = "$BASE" ]; then
    echo "⬆️ You have local commits."
    echo "👉 Run: git push"

else
    echo "⚠️ Branch diverged."
    echo "👉 Run: git pull --rebase"
fi
