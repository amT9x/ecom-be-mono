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

DB_CONTAINER=infra-wsl2-postgres-1
PSQL=docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -v ON_ERROR_STOP=1

DB_EXTENSIONS=$(wildcard infra/sql/*extensions.sql)
MIGRATIONS=$(wildcard db/migration/*.sql)
SEEDDEVS=$(wildcard db/seed/dev/*.sql)
TESTS=$(wildcard db/test/*.sql)

# ==================================================
# INFRA
# ==================================================
infra-build:
	$(COMPOSE) build

infra-build-clean:
	$(COMPOSE) build --no-cache

infra-up:
	$(COMPOSE) up -d

infra-down:
	$(COMPOSE) down

infra-build-up: infra-build infra-up

infra-restart:
	$(COMPOSE) down
	$(COMPOSE) up -d

infra-logs:
	$(COMPOSE) logs -f

infra-shell:
	docker exec -it $(DB_CONTAINER) bash

infra-build-app-test:
	@echo "==> Build app test..."
	docker build \
	-f docker/Dockerfile \
	-t app:test \
	.
	@echo "✅ Build app test... done"

# ==================================================
# DATABASE
# ==================================================

# CREATE DB USER
db-create-user:
	@cat infra/sql/001_create_user.sql | \
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres \
	-v ON_ERROR_STOP=1 \
	-c "SET app.db_user='$(DB_USER)';" \
	-c "SET app.db_password='$(DB_PASSWORD)';" \
	-f -

# CREATE DB
db-create-db:
	@cat infra/sql/002_create_database.sql | \
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres \
	-v ON_ERROR_STOP=1 \
	-v db_name=$(DB_NAME) \
	-v db_user=$(DB_USER)

# BOOTSTRAP DB EXTENSIONS
db-extensions:
	@for file in $(DB_EXTENSIONS); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done

# MIGRATIONS
db-migrate:
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

db-fresh-data: db-reset-data db-seed-dev

db-bootstrap: db-create-user db-create-db db-extensions db-migrate db-seed-dev

# ==================================================
# APP
# ==================================================
app-install:
	npm install

app-install-ci:
	@echo "==> Install dependencies..."
	npm ci
	@echo "✅ Dependencies installed"

app-audit:
	@echo "==> Audit dependencies..."
	npm audit --audit-level=high
	@echo "✅ Audit passed"

app-run:
	npm run dev

app-build:
	@echo "==> Build app..."
	npm run build
	@echo "✅ Build app passed"

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

app-health-check:
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
	curl --fail http://localhost:3000/health

	@echo "Cleanup"
	docker rm -f app-test
	@echo "✅ App Health check passed"

# ==================================================
# TESTING
# ==================================================
test:
	npm test

test-unit:
	npm run test:unit

test-int:
	@echo "==> Run integration test..."
	npm run test:int
	@echo "✅ Integration test passed"

test-watch:
	npm run test:watch

# ==================================================
# QUALITY
# ==================================================
lint:
	@echo "==> Lint"
	npm run lint
	@echo "✅ Lint passed"

typecheck:
	@echo "==> Typecheck"
	npm run typecheck
	@echo "✅ Typecheck passed"

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

doctor:
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

clean:
	@echo "🧹 Cleaning workspace..."
	rm -rf node_modules dist coverage .cache

reset: clean app-install
	@echo "♻️ Workspace reset"

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

ci:
	@$(MAKE) doctor
	@$(MAKE) app-install-ci
	@$(MAKE) lint
	@$(MAKE) typecheck
	@$(MAKE) app-audit
	@$(MAKE) db-migrate
	@$(MAKE) test-int
	@$(MAKE) app-build
	@$(MAKE) infra-build-app-test
	@$(MAKE) app-health-check
	@echo "✅ CI PASSED"

# ==================================================
# WORKFLOW
# ==================================================
bootstrap: config-env
	@$(MAKE) db-bootstrap
	@$(MAKE) app-install
	@$(MAKE) infra-build-up
reset-table-data: db-fresh-data
up: infra-up
down: infra-down
dev: app-run

# ===============================
# HELP
# ===============================
help:
	@echo ""
	@echo "🚀 CORE DEV"
	@echo " make dev               <- start app dev"
	@echo " make up                <- start infra"
	@echo " make down              <- stop infra"
	@echo " make bootstrap         <- bootstrap everything"
	@echo " make reset-table-data  <- reset table data"
	@echo ""
# 	@echo "🗄 DATABASE"
# 	@echo " make db-create-user"
# 	@echo " make db-create-db"
# 	@echo " make db-extensions"
# 	@echo " make db-migrate"
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
