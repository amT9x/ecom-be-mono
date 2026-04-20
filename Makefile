# ===============================
# CONFIG
# ===============================
include .env.example
export

COMPOSE=docker compose -f docker/docker-compose.yml

DB_CONTAINER=infra-postgres-1
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
	@for file in $(MIGRATIONS); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done

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

app-run:
	npm run dev

app-build:
	npm run build

app-start:
	npm run start

# ==================================================
# TESTING
# ==================================================

# ==================================================
# QUALITY
# ==================================================

# ==================================================
# WORKFLOW
# ==================================================
bootstrap: db-bootstrap infra-build-up
reset-table-data: db-fresh-data
up: infra-up
down: infra-down
dev: app-run
# ci: install lint typecheck test

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
