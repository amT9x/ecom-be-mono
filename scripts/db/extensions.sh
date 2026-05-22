#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

source scripts/shared/env.sh

# =========================
# Load ENV
# =========================
set -a
source .env
set +a
DB_EXTENSIONS=infra/sql/*extensions.sql
DB_CONTAINER=infra-wsl2-postgres-1

DB_USER="${DB_USER:-$(echo "$DB_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')}"
DB_NAME="${DB_NAME:-$(echo "$DB_URL" | sed -E 's|.*/([^/?]+).*|\1|')}"

PSQL="docker exec -i $DB_CONTAINER psql \
  -U $DB_USER \
  -d $DB_NAME \
  -v ON_ERROR_STOP=1"

echo "==> Running extensions (MODE=$MODE)..."

run_dev() {
   for file in $DB_EXTENSIONS; do
      echo "Running extension: $file"
      cat "$file" | eval "$PSQL"
  done
}

case "$MODE" in
  dev) run_dev ;;
  *)
    echo "Unknown MODE=$MODE"
    exit 1
    ;;
esac

echo "✅ Finished extensions"
