#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE="$SCRIPT_DIR/pipeline.sh"
WAIT_DB="$(cd "$SCRIPT_DIR/../db" && pwd)/wait_db.sh"
MIGRATE="$(cd "$SCRIPT_DIR/../db" && pwd)/migrate.sh"

cleanup() {
  status=$?

  echo ""
  echo "==> Cleanup..."

  "$PIPELINE" clean-containers || true
  "$PIPELINE" clean-network || true

  if [ "$status" -eq 0 ]; then
    echo ""
    echo "✅ CI PASSED"
    echo ""
  fi
}
trap cleanup EXIT

validate_stage() {
  "$PIPELINE" validate
}

infra_stage() {
  "$PIPELINE" network
  "$PIPELINE" postgres
  "$WAIT_DB" wait-db
}

application_stage() {
  "$PIPELINE" build
  "$PIPELINE" build-test-int
  "$PIPELINE" app
  "$PIPELINE" app-health-check
}

database_stage() {
  "$MIGRATE" ci
}

test_stage() {
  "$PIPELINE" debug
  "$PIPELINE" test-int
}

main() {
  echo ""
  echo "==> CI START"
  echo ""

  validate_stage
  infra_stage
  application_stage
  database_stage
  test_stage
}

main "$@"
