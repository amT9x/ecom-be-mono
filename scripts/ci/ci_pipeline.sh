#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-help}"

NETWORK="ci-network"
APP_CONTAINER="app-test"
DB_CONTAINER="postgres"
IMAGE="app:test"

# =========================
# BUILD APP
# =========================
build_app() {
  echo "==> Build app test..."
  docker build -f docker/Dockerfile --target production -t "$IMAGE" .
  echo "✅ Build app test done"
}

build_test_int() {
  echo "==> Build test-int image..."

  docker build \
    -f docker/Dockerfile \
    --target test \
    -t test-int-runner .

  echo "✅ Build test-int done"
}

# =========================
# CREATE NETWORK
# =========================
create_network() {
  echo "==> Create network ci..."
  docker network create "$NETWORK" 2>/dev/null || true
  echo "✅ Network ready"
}

# =========================
# RUN POSTGRES
# =========================
run_postgres() {
  echo "==> Starting postgres..."

  docker rm -f "$DB_CONTAINER" 2>/dev/null || true

  docker run -d \
    --name "$DB_CONTAINER" \
    --network "$NETWORK" \
    -e POSTGRES_USER=test \
    -e POSTGRES_PASSWORD=test \
    -e POSTGRES_DB=testdb \
    --health-cmd="pg_isready -U test" \
    --health-interval=5s \
    --health-timeout=3s \
    --health-retries=10 \
    postgres:16

  echo "✅ Postgres started"
}

# =========================
# RUN APP
# =========================
run_app() {
  echo "==> Run test app..."

  docker rm -f "$APP_CONTAINER" 2>/dev/null || true

  docker run -d \
    --network "$NETWORK" \
    -e DB_URL=postgresql://test:test@postgres:5432/testdb \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e NODE_ENV=test \
    -e APP_NAME=ecom-test \
    -p 3000:3000 \
    --name "$APP_CONTAINER" \
    "$IMAGE"

  echo "Waiting container..."

  for i in {1..10}; do
    if docker inspect -f '{{.State.Running}}' "$APP_CONTAINER" | grep true >/dev/null; then
      break
    fi
    sleep 1
  done

  docker inspect -f '{{.State.Running}}' "$APP_CONTAINER"

  echo "✅ App running"
}

run_test_int() {
  echo "==> Run test-int..."

  docker run --rm \
    --network "$NETWORK" \
    -e NODE_ENV=test \
    -e DB_URL=postgresql://test:test@postgres:5432/testdb \
    test-int-runner

  echo "✅ Test-int done"
}


# =========================
# DEBUG
# =========================
debug_app() {
  echo "==> Debug app test..."
  docker ps -a
  docker logs "$APP_CONTAINER" || true
  echo "✅ Debug done"
}

# =========================
# CLEAN CI
# =========================
clean_ci() {
  echo "==> Clean CI containers..."
  docker rm -f "$APP_CONTAINER" "$DB_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK" 2>/dev/null || true
  echo "✅ Clean done"
}

# =========================
# CLEAN ACT
# =========================
clean_act() {
  echo "==> Cleaning act containers..."
  docker rm -f $(docker ps -aq --filter "name=act-") 2>/dev/null || true
  echo "✅ Act clean done"
}

# =========================
# PIPELINE (FULL CI)
# =========================
pipeline() {
  build_app
  create_network
  run_postgres
  run_app
  debug_app
}

# =========================
# DISPATCH
# =========================
case "$ACTION" in
  build) build_app ;;
  build-test-int) build_test_int ;;
  network) create_network ;;
  postgres) run_postgres ;;
  app) run_app ;;
  test-int) run_test_int ;;
  debug) debug_app ;;
  clean) clean_ci ;;
  clean-act) clean_act ;;
  pipeline) pipeline ;;
  *)
    echo "Usage:"
    echo "  pipeline.sh build"
    echo "  pipeline.sh network"
    echo "  pipeline.sh postgres"
    echo "  pipeline.sh app"
    echo "  pipeline.sh debug"
    echo "  pipeline.sh clean"
    echo "  pipeline.sh pipeline"
    ;;
esac
