# ===============================
# CONFIG
# ===============================
ifneq (,$(wildcard .env))
include .env
export
endif

config-env:
	@test -f .env || (cp .env.example .env && echo "Created .env")

COMPOSE=docker compose -f docker/docker-compose.yml

create-env-ci:
	@echo "==> Create env file..."
	cp .env.ci .env
	@echo "✅ Create env file... done"

# ==================================================
# DOCKER
# ==================================================
dk-build:
	$(COMPOSE) build

dk-up:
	$(COMPOSE) up -d

dk-down:
	$(COMPOSE) down

dk-logs:
	$(COMPOSE) logs -f

dk-build-app-ci:
	@./scripts/docker/ci_pipeline.sh build

dk-create-network-ci:
	@./scripts/docker/ci_pipeline.sh network

dk-run-postgres-ci:
	@./scripts/docker/ci_pipeline.sh postgres

dk-run-app-ci:
	@./scripts/docker/ci_pipeline.sh app

dk-debug-app-ci:
	@./scripts/docker/ci_pipeline.sh debug

dk-clean-ci:
	@./scripts/docker/ci_pipeline.sh clean

dk-clean-act:
	@./scripts/docker/ci_pipeline.sh clean-act

dk-ci-pipeline:
	@./scripts/docker/ci_pipeline.sh pipeline

# ==================================================
# DATABASE
# ==================================================
wait-db:
	@./scripts/db/wait_db.sh $(MODE)

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

db-access-user-ecom:
	@./scripts/db/manage.sh access-user-ecom

db-extensions:
	@./scripts/db/extensions.sh

db-seed:
	@./scripts/db/seed.sh

db-test:
	@./scripts/db/test.sh

db-reset-data:
	@./scripts/db/manage.sh reset-data

db-reset-schema:
	@./scripts/db/manage.sh reset-schema

db-migrate:
	@./scripts/db/migrate.sh $(MODE)

db-pre-push:
	@./scripts/db/pre_push.sh

db-reset:
	$(MAKE) db-drop-db
	$(MAKE) db-create-db
	$(MAKE) db-migrate MODE=dev
	$(MAKE) db-seed

db-fresh-data: db-reset-data db-seed

db-bootstrap:
	$(MAKE) db-create-db
	$(MAKE) db-extensions
	$(MAKE) db-migrate MODE=boot
	$(MAKE) db-seed

# ==================================================
# APP
# ==================================================
app-install-npm:
	npm install

app-install-ci:
	npm ci

app-audit-high:
	npm audit --audit-level=high || true

app-audit-critical:
	npm audit --audit-level=critical

app-run:
	npm run dev

app-build:
	npm run build

app-start:
	npm run start

.PHONY: app-health-check
app-health-check:
	@./scripts/app/health_check.sh $(MODE)

.PHONY: app-wait-ready
app-wait-ready:
	@./scripts/app/wait_ready.sh $(MODE)

# ==================================================
# TESTING
# ==================================================
test:
	npm test

test-unit:
	npm run test:unit

test-int:
	npm run test:int

test-watch:
	npm run test:watch

# ==================================================
# QUALITY
# ==================================================
lint:
	npm run lint

typecheck:
	npm run typecheck

fix:
	npm run format
	npm run lint -- --fix

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
	@$(MAKE) lint
	@$(MAKE) typecheck
	@echo "✅ Precommit...done"

.PHONY: pre-push
pre-push:
	@echo "==> Prepush..."
	@$(MAKE) pre-commit
	@$(MAKE) db-pre-push
	@$(MAKE) test-int
	@echo "✅ Prepush...done"

# ==================================================
# DEV ENVIROMENTs
# ==================================================
doctor:
	@./scripts/enviroments/doctor.sh $(MODE)

act:
	act pull-request -j validate-pr --rebuild

clean-node:
	rm -rf node_modules dist coverage .cache

reset-node: clean app-install-npm

wait-10s:
	sleep 10

# ==================================================
# WORKFLOW
# ==================================================
bootstrap: config-env
	@$(MAKE) db-bootstrap
	@$(MAKE) app-install-npm
	@$(MAKE) dk-build-up
up: dk-up
down: dk-down
dev: app-run
ci:
	@./scripts/ci/run.sh
deploy:
	@./scripts/ci/deploy.sh

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
	@echo "  make db-pre-push"
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
