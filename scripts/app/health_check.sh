#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

run_dev() {
    echo "==> App Health check (DEV)..."

    docker rm -f app-test 2>/dev/null || true

    docker run -d \
        --network ecom-network \
        --env-file .env \
        -e DB_HOST=postgres \
        -e HOST=0.0.0.0 \
        -p 3000:3000 \
        --name app-test \
        app:test

    echo "Wait startup..."
    sleep 10

    curl --fail http://app-test:3000/health

    docker rm -f app-test

    echo "✅ DEV health check passed"
}

run_ci() {
    echo "==> App Health check (CI)..."

    for i in $(seq 1 30); do
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' app-test 2>/dev/null || echo "starting")

        if [ "$STATUS" = "healthy" ]; then
            echo "✅ CI health check passed"
            exit 0
        fi

        echo "Status: $STATUS"
        sleep 2
    done

    echo "❌ App not healthy"
    docker logs app-test
    exit 1
}

case "$MODE" in
    dev) run_dev ;;
    ci)  run_ci ;;
    *)
        echo "Usage: health_check.sh [dev|ci]"
        exit 1
        ;;
esac
