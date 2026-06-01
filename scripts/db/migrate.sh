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
  echo "==>Running migrations"
  docker run --rm \
    --network ci-network \
    -e NODE_ENV=test \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e APP_NAME=ecom-test \
    -e DB_URL=postgresql://test:test@postgres:5432/testdb \
    -e REDIS_URL=redis://redis:6379 \
    -e JWT_SECRET=test-secret \
    -e JWT_REFRESH_SECRET=test-refresh-secret \
    -e JWT_ACCESS_EXPIRES_IN_15M=15m \
    -e JWT_ACCESS_EXPIRES_IN_1H=1h \
    -e JWT_ACCESS_EXPIRES_IN_7D=7d \
    -e JWT_ACCESS_EXPIRES_IN_30D=30d \
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
