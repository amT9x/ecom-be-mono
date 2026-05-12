#!/usr/bin/env bash
set -e

MIGRATION_DIR="./db/migration"

for file in "$MIGRATION_DIR"/*.sql; do
  filename=$(basename "$file")

  if [[ ! "$filename" =~ ^[0-9]+_.*\.sql$ ]]; then
    echo "❌ Invalid migration name: $filename"
    exit 1
  fi
done

echo "✅ migration structure valid"
