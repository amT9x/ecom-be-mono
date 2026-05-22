#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-dev}"
NODE_ENV="${NODE_ENV:-development}"

migrate_dev() {
  npx tsx scripts/db/migrate.ts
}

migrate_boot() {
  DB_CONTAINER=infra-wsl2-postgres-1

  DB_USER="${DB_USER:-$(echo "$DB_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')}"
  DB_NAME="${DB_NAME:-$(echo "$DB_URL" | sed -E 's|.*/([^/?]+).*|\1|')}"
  echo "DB_USER: $DB_USER"
  echo "DB_NAME: $DB_NAME"

  PSQL="docker exec -i $DB_CONTAINER psql \
    -U $DB_USER \
    -d $DB_NAME \
    -v ON_ERROR_STOP=1"

  for file in $MIGRATIONS; do
    echo "Running migrate: $file"
    cat "$file" | eval "$PSQL"
  done
}

migrate_ci() {
  docker run --rm \
    --network ci-network \
    -e DB_URL=postgresql://test:test@postgres:5432/testdb \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e NODE_ENV=test \
    -e APP_NAME=ecom-test \
    app:test \
    node dist/scripts/db/migrate.js

  echo "✅ Finished migrations"
}

case "$ACTION" in
  boot) migrate_boot ;;
  dev) migrate_dev ;;
  ci) migrate_ci ;;
  *)
    echo "Usage:"
    echo "  migrate.sh [boot|dev|ci]"
    ;;
esac
