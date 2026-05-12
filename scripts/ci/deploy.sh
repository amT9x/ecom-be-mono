#!/usr/bin/env bash

set -e

# ===============================
# CONFIG
# ===============================

APP_NAME=""
DOCKER_USER=""
IMAGE="$DOCKER_USER/$APP_NAME:"

VPS_USER=""
VPS_HOST=""

# ===============================
# BUILD & PUSH IMAGE
# ===============================

echo "🐳 Docker login..."
docker login

echo "🔨 Building image..."
docker build -t $IMAGE .

echo "📤 Pushing image..."
docker push $IMAGE

# ===============================
# DEPLOY TO VPS
# ===============================

echo "🚀 Deploying to VPS..."

ssh $VPS_USER@$VPS_HOST << EOF
docker pull $IMAGE

docker stop $APP_NAME || true
docker rm $APP_NAME || true

docker run -d \
  --name $APP_NAME \
  -p 3000:3000 \
  $IMAGE
EOF

echo "✅ Deploy completed!"
