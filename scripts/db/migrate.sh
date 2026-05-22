#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

# =========================
# Load ENV
# =========================
if [ "$MODE" != "ci" ]; then
  set -a
  source .env
  set +a
fi

echo "==> Running migrations (MODE=$MODE)..."

run_dev() {
  npx tsx scripts/db/migrate.ts
}

run_boot() {
  MIGRATIONS=db/migration/*.sql
  DB_CONTAINER=infra-wsl2-postgres-1

  DB_USER="${DB_USER:-$(echo "$DB_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')}"
  DB_NAME="${DB_NAME:-$(echo "$DB_URL" | sed -E 's|.*/([^/?]+).*|\1|')}"

  PSQL="docker exec -i $DB_CONTAINER psql \
    -U $DB_USER \
    -d $DB_NAME \
    -v ON_ERROR_STOP=1"

  for file in $MIGRATIONS; do
    echo "Running migrate: $file"
    cat "$file" | eval "$PSQL"
  done
}

run_ci() {
  docker run --rm \
    --network ci-network \
    -e DB_URL=postgresql://test:test@postgres:5432/testdb \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e NODE_ENV=test \
    -e APP_NAME=ecom-test \
    app:test \
    node dist/scripts/db/migrate.js
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
