# ===============================
# CONFIG
# ===============================
MAKEFLAGS += --no-print-directory
ifneq (,$(wildcard .env))
include .env
export
endif

create-env-file:
	@echo "==> Creating .env file"
	@test -f .env || (cp .env.example .env && echo "Created .env")
	@echo "✅ Creating .env file...done"

COMPOSE=docker compose -f docker/docker-compose.yml

# ==================================================
# DOCKER
# ==================================================
dk-build:
	$(COMPOSE) build

dk-up:
	$(COMPOSE) up -d

dk-down:
	$(COMPOSE) down

# ==================================================
# DATABASE
# ==================================================

db-create-user:
	@./scripts/db/manage.sh create-user

db-drop-user:
	@./scripts/db/manage.sh drop-user

db-create-db:
	@./scripts/db/manage.sh create-db

db-drop-db:
	@./scripts/db/manage.sh drop-db

db-access-user-postgres:
	@./scripts/db/manage.sh access-user-postgres

db-access-db-ecomdb:
	@./scripts/db/manage.sh access-db-ecomdb

db-access-db-testdb:
	@./scripts/db/manage.sh access-db-testdb

db-seed:
	@./scripts/db/seed.sh

db-migrate:
	@env -u DB_URL NODE_ENV=$(NODE_ENV) ./scripts/db/migrate.sh $(ACTION)

db-reset:
	$(MAKE) db-drop-db
	$(MAKE) db-create-db
	$(MAKE) db-migrate
	$(MAKE) db-seed

db-fresh-data:
	@./scripts/db/manage.sh reset-data
	$(MAKE) db-seed

db-bootstrap:
	$(MAKE) db-create-db
	@./scripts/db/extensions.sh
	@./scripts/db/migrate.sh ACTION=boot
# 	$(MAKE) db-seed

# ==================================================
# GIT FLOW
# ==================================================
.PHONY: git
git:
	@echo "Git workflow:"
	@echo "  make git-daily"
	@echo "  make git-sync"
	@echo "  make git-new-branch"

.PHONY: git-daily
git-daily:
	@./scripts/git_flow/git_daily.sh

.PHONY: git-sync
git-sync:
	@./scripts/git_flow/git_sync.sh

.PHONY: git-new-branch
git-new-branch:
	@./scripts/git_flow/git_new_branch.sh

.PHONY: pre-commit
pre-commit:
	@echo "==> Precommit..."
	npm run lint
	npm run typecheck
	@echo "✅ Precommit...done"

.PHONY: pre-commit-fix
pre-commit-fix:
	@echo "==> Commit..."
	npm run format
	npm run lint -- --fix
	@echo "✅ Commit...done"

.PHONY: pre-push
pre-push:
	@echo "==> Prepush..."
	@$(MAKE) pre-commit
	@./scripts/db/pre_push.sh
	@echo "✅ Prepush...done"

# ==================================================
# DEV ENVIROMENTs
# ==================================================
doctor:
	@./scripts/enviroments/doctor.sh $(MODE)

act:
	act pull-request -j validate-pr --rebuild

clean-ci:
	@./scripts/ci/pipeline.sh clean-ci

clean-node:
	rm -rf node_modules dist coverage .cache

# ==================================================
# WORKFLOW
# ==================================================
bootstrap:
	@$(MAKE) create-env-file
	@$(MAKE) db-bootstrap
	npm install
	@$(MAKE) dk-build
	@$(MAKE) dk-up

up:
	@$(MAKE) dk-up

down:
	@$(MAKE) dk-down

dev:
	npm run dev

ci:
	@./scripts/ci/run.sh

# ===============================
# HELP
# ===============================
help:
	@echo ""
	@echo "🚀 CORE"
	@echo "  make bootstrap   Setup project first time"
	@echo "  make dev         Run app locally"
	@echo "  make up          Start docker services"
	@echo "  make down        Stop docker services"
	@echo ""
	@echo "🗄 DATABASE"
	@echo "  make db-migrate"
	@echo "  make db-seed"
	@echo "  make db-reset"
	@echo ""
	@echo "🧪 QUALITY"
	@echo "  make test"
	@echo "  make lint"
	@echo "  make typecheck"
	@echo "  make fix"
	@echo ""
	@echo "🌿 GIT"
	@echo "  make git-daily"
	@echo "  make git-sync"
	@echo "  make git-new-branch"
	@echo "  make pre-push"
	@echo ""
