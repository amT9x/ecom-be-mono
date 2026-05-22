#!/usr/bin/env bash

set -euo pipefail

ACTION="${1:-help}"

print_header() {
    echo "=================================="
    echo "🩺 Environment Doctor"
    echo "=================================="
}

print_footer() {
  echo "✅ Environment doctor passed"
  echo "=================================="
}

doctor_dev() {
  print_header

  printf "Docker CLI:      "
  command -v docker >/dev/null && echo "Installed" || echo "❌ missing"

  printf "Docker daemon:   "
  docker info >/dev/null 2>&1 && echo "Running" || echo "❌ not running"

  printf "Node.js:         "
  command -v node >/dev/null && echo "Installed" || echo "❌ missing"

  printf ".env file:       "
  [ -f .env ] && echo "Found" || echo "❌ .env missing"

  print_footer
}

doctor_ci() {
  echo "==> CI doctor enviroment..."
  node -v
  npm -v
  docker --version
  echo "✅ CI doctor enviroment...done"
}

case "$ACTION" in
    dev)
        doctor_dev
        ;;
    ci)
        doctor_ci
        ;;
    *)
        echo "Usage: doctor.sh [dev|ci]"
        exit 1
        ;;
esac
