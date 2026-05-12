#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

# =========================
# Load ENV
# =========================
set -a
source .env
set +a
MIGRATIONS=db/migration/*.sql
DB_CONTAINER=infra-wsl2-postgres-1

PSQL="docker exec -i $DB_CONTAINER psql \
  -U $DB_USER \
  -d $DB_NAME \
  -v ON_ERROR_STOP=1"

echo "==> Running migrations (MODE=$MODE)..."

run_dev() {
  node scripts/migrate.js
}

run_boot() {
   for file in $MIGRATIONS; do
      echo "Running migrate: $file"
      cat "$file" | eval "$PSQL"
  done
}

run_ci() {
  docker run --rm \
    --network ci-network \
    --env-file .env \
    app:test \
    node scripts/migrate.js
}

case "$MODE" in
  boot) run_boot ;;
  dev) run_dev ;;
  ci) run_ci ;;
  *)
    echo "Unknown MODE=$MODE"
    exit 1
    ;;
esac

echo "✅ Finished migrations"
