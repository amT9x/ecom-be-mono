#!/usr/bin/env bash
set -euo pipefail

make doctor MODE=ci
make app-install-ci

make pre-commit
make app-audit-high
make app-audit-critical

make app-build

make create-network-ci

make run-postgres-ci
make wait-db MODE=ci DB_CONTAINER=postgres

make build-app-ci
make build-test-int-ci
make run-app-ci

make app-health-check MODE=ci

make debug-app-ci

make db-migrate MODE=ci

# make app-wait-ready-ci

make run-test-int-ci

make clean-containers

make clean-network

echo "✅ CI PASSED"
