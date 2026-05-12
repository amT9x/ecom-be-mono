#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-ci}"

run_ci() {
    echo "==> Waiting app ready..."

    for i in $(seq 1 30); do
        if curl -sf http://localhost:3000/ready >/dev/null; then
            echo "✅ App ready"
            exit 0
        fi

        echo "App not ready yet..."
        sleep 2
    done

    echo "❌ App never became ready"
    docker logs app-test
    exit 1
}

case "$MODE" in
    ci) run_ci ;;
    *)
        echo "wait_ready only used in CI mode"
        exit 1
        ;;
esac
