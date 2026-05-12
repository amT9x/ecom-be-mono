#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"
CONTAINER="${DB_CONTAINER:-postgres-ci}"

echo "==> Waiting for postgres..."

for i in $(seq 1 60); do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "starting")

    if [ "$STATUS" = "healthy" ]; then
        echo "✅ Waiting for postgres...done. Postgres is ready"
        exit 0
    fi

    echo "Postgres status: $STATUS"
    sleep 2
done

echo "❌ Postgres never became healthy"
docker logs "$CONTAINER"
exit 1
