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

echo ""
echo "==> CI START"
echo ""

##################################################
# FULL WORKFLOW CI
##################################################
"$PIPELINE" validate
"$PIPELINE" build
"$PIPELINE" network
"$PIPELINE" postgres
"$WAIT_DB" wait-db
"$PIPELINE" build-test-int
"$PIPELINE" app
"$PIPELINE" app-health-check
"$MIGRATE" ci
"$PIPELINE" debug
"$PIPELINE" test-int
