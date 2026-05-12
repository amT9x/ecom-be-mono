#!/usr/bin/env bash

set -euo pipefail

read -rp "Branch name (feat/...): " name

if [ -z "$name" ]; then
    echo "Branch name cannot be empty"
    exit 1
fi

git switch -c "$name"

echo "Created branch: $name"
echo
echo "Next step:"
echo "  git push -u origin $name"
