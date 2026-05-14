#!/usr/bin/env bash
set -euo pipefail

make doctor MODE=ci
make app-install-ci

make pre-commit
make app-audit-high
make app-audit-critical

make app-build

make dk-create-network-ci

make dk-run-postgres-ci
make wait-db MODE=ci DB_CONTAINER=postgres

make dk-build-app-ci
make dk-run-app-ci

make app-health-check MODE=ci

make dk-debug-app-ci

make db-migrate MODE=ci

# make app-wait-ready-ci

make test-int

make dk-clean-ci

echo "✅ CI PASSED"
