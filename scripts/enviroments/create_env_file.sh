#!/bin/sh

echo "==> Checking .env file..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env"
else
  echo "✅ .env already exists"
fi
