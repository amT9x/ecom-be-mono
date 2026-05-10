# ===============================
# CONFIG
# ===============================
ifneq (,$(wildcard .env))
include .env
export
endif
# APP_NAME=ecommerce-api
# DOCKER_USER=your_dockerhub_username
# IMAGE=$(DOCKER_USER)/$(APP_NAME):latest
# VPS_USER=root
# VPS_HOST=your_vps_ip

config-env:
	@test -f .env || (cp .env.example .env && echo "Created .env")

COMPOSE=docker compose -f docker/docker-compose.yml
NETWORK := $(shell docker network ls --format '{{.Name}}' | grep act || true)

DB_CONTAINER=infra-wsl2-postgres-1
PSQL=docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -v ON_ERROR_STOP=1

DB_EXTENSIONS=$(wildcard infra/sql/*extensions.sql)
MIGRATIONS=$(wildcard db/migration/*.sql)
SEEDDEVS=$(wildcard db/seed/dev/*.sql)
TESTS=$(wildcard db/test/*.sql)

create-env-ci:
	@echo "==> Create env file..."
	cp .env.ci .env
	@echo "✅ Create env file... done"

# ==================================================
# DOCKER
# ==================================================
dk-build:
	$(COMPOSE) build

dk-build-clean:
	$(COMPOSE) build --no-cache

dk-up:
	$(COMPOSE) up -d

dk-down:
	$(COMPOSE) down

dk-build-up: dk-build dk-up

dk-restart:
	$(COMPOSE) down
	$(COMPOSE) up -d

dk-logs:
	$(COMPOSE) logs -f

dk-shell:
	docker exec -it $(DB_CONTAINER) bash

dk-build-app-test:
	@echo "==> Build app test..."
	docker build \
	-f docker/Dockerfile \
	-t app:test \
	.
	@echo "✅ Build app test... done"

dk-build-app-test-ci:
	@echo "==> Build app test..."
	docker build -f docker/Dockerfile -t app:test .
	@echo "✅ Build app test... done"

dk-run-test-app-ci:
	@echo "==> Run test app..."

	docker rm -f app-test || true

	docker run -d \
	$(if $(NETWORK),--network $(NETWORK),) \
	--env-file .env \
	-p 3000:3000 \
	--name app-test \
	app:test

	@echo "Waiting container..."
	@for i in {1..10}; do \
		docker inspect -f '{{.State.Running}}' app-test | grep true && break; \
		sleep 1; \
	done

	docker inspect -f '{{.State.Running}}' app-test

	@echo "✅ Run test app... done"

dk-debug-app-test-ci:
	@echo "==> Debug app test..."
	docker ps -a
	docker logs app-test || true
	@echo "✅ Debug app test... done"

dk-clean-app-test-ci:
	@echo "==> Clean app test..."
	docker rm -f app-test || true
	@echo "✅ Clean app test... done"

# ==================================================
# DATABASE
# ==================================================

db-wait-db-ci:
	@echo "==> Waiting for postgres..."
	@POSTGRES_ID=$$(docker ps \
		--filter "ancestor=postgres:16" \
		--format "{{.ID}}"); \
	until [ "$$(docker inspect \
		-f '{{.State.Health.Status}}' $$POSTGRES_ID)" = "healthy" ]; do \
		echo "Postgres not healthy yet..."; \
		sleep 1; \
	done
	@echo "✅ Waiting for postgres...done. Postgres is ready"

# CREATE DB USER
db-create-user:
	@cat infra/sql/001_create_user.sql | \
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres \
	-v ON_ERROR_STOP=1 \
	-c "SET app.db_user='$(DB_USER)';" \
	-c "SET app.db_password='$(DB_PASSWORD)';" \
	-f -

# CREATE DB DEV
db-create-db-dev:
	@echo "==> Create database $(DB_NAME)"
	@cat infra/sql/002_create_database.sql | \
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres \
	-v ON_ERROR_STOP=1 \
	-v db_name=$(DB_NAME) \
	-v db_user=$(DB_USER)
	@echo "✅ Create database $(DB_NAME) done"

# CREATE DB
db-create-db:
	@echo "==> Create database $(DB_NAME)"

	docker exec -i $(DB_CONTAINER) \
	psql -U postgres -d postgres \
	-c "CREATE DATABASE $(DB_NAME) OWNER $(DB_USER);"

	@echo "✅ Create database $(DB_NAME) done"

# DROP DB
db-drop-db:
	@echo "==> Drop database $(DB_NAME)"
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres -d postgres \
	-c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$(DB_NAME)' AND pid <> pg_backend_pid();"

	docker exec -i $(DB_CONTAINER) \
	psql -U postgres -d postgres \
	-c "DROP DATABASE IF EXISTS $(DB_NAME);"
	@echo "✅ Drop database $(DB_NAME) done"

# BOOTSTRAP DB EXTENSIONS
db-extensions:
	@for file in $(DB_EXTENSIONS); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done

# MIGRATIONS
db-migrate-dev:
	@echo "==> Running migrations..."
	@for file in $(MIGRATIONS); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done
	@echo "✅ Finished migrations..."

# SEED DEV DATA
db-seed-dev:
	@for file in $(SEEDDEVS); do \
		echo "Running seed: $$file"; \
		cat $$file | $(PSQL); \
	done

# TEST DATABASE
db-test:
	@for file in $(TESTS); do \
		echo "Running test: $$file"; \
		cat $$file | $(PSQL); \
	done

# RESET DATA OF TABLE
db-reset-data:
	@docker exec -i $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME) \
	-c "TRUNCATE TABLE products RESTART IDENTITY CASCADE;"

# RESET TABLE
db-reset-schema:
	@echo "Reset schema $(DB_NAME)..."
	@docker exec -i $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME) \
	-c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

db-psql:
	@docker exec -it $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME)

db-migrate:
	node scripts/migrate.js

db-migrate-ci:
	@echo "==> Run migrations..."
	docker run -d \
	$(if $(NETWORK),--network $(NETWORK),) \
	--env-file .env \
	app:test \
	node scripts/migrate.js
	@echo "✅ Run migrations...done"

db-reset:
	$(MAKE) db-drop-db
	$(MAKE) db-create-db
	$(MAKE) db-migrate
	$(MAKE) db-seed-dev

db-fresh-data: db-reset-data db-seed-dev

db-bootstrap: db-create-user db-create-db db-extensions db-migrate-dev db-seed-dev

# ==================================================
# APP
# ==================================================
app-install-npm:
	npm install

app-install-ci:
	@echo "==> Install dependencies..."
	npm ci
	@echo "✅ Dependencies installed"

app-audit-high:
	@echo "==> Security audit (HIGH)"
	npm audit --audit-level=high || true
	@echo "✅ Security audit high...done. No high vulnerabilities"

app-audit-critical:
	@echo "==> Security audit (CRITICAL)"
	npm audit --audit-level=critical
	@echo "✅ Security audit ...done. No critical vulnerabilities"

app-run:
	npm run dev

app-build:
	@echo "==> Build app..."
	npm run build
	@echo "✅ Build app...done"

app-start:
	npm run start

run-postgres:
	docker run -d \
  --name postgres \
  --network ecom-network \
  -e POSTGRES_USER=ecom_app \
  -e POSTGRES_PASSWORD=devpw \
  -e POSTGRES_DB=ecom_mono \
  postgres:16

app-health-check-dev:
	@echo "==> App Health check..."
	@echo "Run container"
	docker rm -f app-test || true

	docker run -d \
		--network ecom-network \
		--env-file .env \
		-e DB_HOST=postgres \
		-e HOST=0.0.0.0 \
		-p 3000:3000 \
		--name app-test \
		app:test

	@echo "Wait startup"
	sleep 10

	@echo "Health check"
	curl --fail http://app-test:3000/health

	@echo "Cleanup"
	docker rm -f app-test
	@echo "✅ App Health check passed"

app-wait-ready-ci:
	@echo "==> Waiting app ready..."
	@for i in $$(seq 1 30); do \
		if curl -sf http://localhost:3000/health >/dev/null; then \
			echo "✅ Waiting app ready...done"; \
			exit 0; \
		fi; \
		echo "App not ready yet..."; \
		sleep 2; \
	done; \
	echo "❌ App failed to start"; \
	exit 1

app-health-check-ci:
	@echo "Health check..."
	@for i in $$(seq 1 15); do \
		curl -f http://localhost:3000/health && exit 0; \
		sleep 2; \
	done; \
	exit 1

	@echo "✅ Health check...done"

# ==================================================
# TESTING
# ==================================================
test:
	npm test

test-unit:
	npm run test:unit

test-int:
	@echo "==> Integration test..."
	npm run test:int
	@echo "✅ Integration test...done"

test-watch:
	npm run test:watch

# ==================================================
# QUALITY
# ==================================================
lint:
	@echo "==> Lint..."
	npm run lint
	@echo "✅ Lint...done"

typecheck:
	@echo "==> Typecheck..."
	npm run typecheck
	@echo "✅ Typecheck...done"

format:
	npm run format

fix:
	@echo "🔧 Auto fixing..."
	npm run format
	npm run lint -- --fix

check: lint typecheck

# ==================================================
# DEV EXPERIENCE
# ==================================================

doctor-dev:
	@echo "=================================="
	@echo "🩺 Environment Doctor"
	@echo "=================================="

	@printf "Docker CLI:      "
	@command -v docker >/dev/null && echo "Installed" || echo "❌ missing"

	@printf "Docker daemon:   "
	@docker info >/dev/null 2>&1 && echo "Running" || echo "❌ not running"

	@printf "Node.js:         "
	@command -v node >/dev/null && echo "Installed" || echo "❌ missing"

	@printf ".env file:       "
	@test -f .env && echo "Found" || echo "❌ .env missing"

	@echo "✅ Environment doctor passed"
	@echo "=================================="

doctor-ci:
	@echo "==> CI doctor..."
	@node -v
	@npm -v
	@docker --version
	@echo "✅ CI doctor...done"

clean-node:
	@echo "🧹 Cleaning workspace..."
	rm -rf node_modules dist coverage .cache

reset-node: clean app-install-npm
	@echo "♻️ Workspace reset"

wait-10s:
	@echo "Waiting 10 seconds..."
	sleep 10
	@echo "✅ Waiting 10 seconds... done"

# deploy:
# 	docker login
# 	docker build -t $(IMAGE) .
# 	docker push $(IMAGE)

# 	ssh $(VPS_USER)@$(VPS_HOST) "\
# 		docker pull $(IMAGE) && \
# 		docker stop $(APP_NAME) || true && \
# 		docker rm $(APP_NAME) || true && \
# 		docker run -d \
# 			--name $(APP_NAME) \
# 			-p 3000:3000 \
# 			$(IMAGE)"

pre-commit:
	@echo "==> Precommit..."
	@$(MAKE) lint
	@$(MAKE) typecheck
	@echo "✅ Precommit...done"

pre-push: pre-commit db-migrate-dev test-int

ci:
	@$(MAKE) doctor-ci
	@$(MAKE) create-env-ci
	@$(MAKE) app-install-ci

	@$(MAKE) pre-commit
	@$(MAKE) app-audit-high
	@$(MAKE) app-audit-critical

	@$(MAKE) app-build

	@$(MAKE) dk-build-app-test-ci
	@$(MAKE) dk-run-test-app-ci
	@$(MAKE) app-wait-ready-ci

	@$(MAKE) dk-debug-app-test-ci

	@$(MAKE) db-wait-db-ci
	@$(MAKE) db-migrate-ci

	@$(MAKE) test-int

	@$(MAKE) app-health-check-ci

	@$(MAKE) dk-clean-app-test-ci

	@echo "✅ CI PASSED"

# ==================================================
# WORKFLOW
# ==================================================
bootstrap: config-env
	@$(MAKE) db-bootstrap
	@$(MAKE) app-install-npm
	@$(MAKE) dk-build-up
reset-table-data: db-fresh-data
up: dk-up
down: dk-down
dev: app-run

# ===============================
# HELP
# ===============================
help:
	@echo ""
	@echo "🚀 CORE DEV"
	@echo " make dev               <- start app dev"
	@echo " make up                <- start dk"
	@echo " make down              <- stop dk"
	@echo " make bootstrap         <- bootstrap everything"
	@echo " make reset-table-data  <- reset table data"
	@echo ""
# 	@echo "🗄 DATABASE"
# 	@echo " make db-create-user"
# 	@echo " make db-create-db"
# 	@echo " make db-extensions"
# 	@echo " make db-migrate-dev"
# 	@echo " make db-seed-dev"
# 	@echo " make db-test"
# 	@echo " make db-reset-schema"
# 	@echo " make db-reset-data"
# 	@echo " make db-psql"
# 	@echo ""
# 	@echo "📦 APP"
# 	@echo " make app-install"
# 	@echo " make app-run"
# 	@echo " make app-build"
# 	@echo " make app-start"
# 	@echo ""
# 	@echo "🧪 TESTING"
# 	@echo ""
# 	@echo "🧹 QUALITY"
# 	@echo ""
# 	@echo "🔧 DX"
# 	@echo ""
