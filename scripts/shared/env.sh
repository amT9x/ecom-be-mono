#!/usr/bin/env bash

set -euo pipefail

NODE_ENV="${NODE_ENV:-development}"

ENV_FILE=".env"

if [ "$NODE_ENV" = "test" ]; then
  ENV_FILE=".env.test"
fi

if [ "$NODE_ENV" != "production" ]; then
  echo "==> Loading env: $ENV_FILE"

  set -a
  source "$ENV_FILE"
  set +a
fi

export APP_CONTAINER="${APP_CONTAINER:-app-test}"
export DB_CONTAINER="${DB_CONTAINER:-postgres}"
export CI_NETWORK="${CI_NETWORK:-ci-network}"
export MIGRATIONS=db/migration/*.sql
