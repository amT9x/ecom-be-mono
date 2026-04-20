# ===============================
# CONFIG
# ===============================
include .env
export

DB_CONTAINER=infra-postgres-1
PSQL=docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME)

INIT=$(wildcard db/init/*.sql)
MIGRATIONS=$(wildcard db/migration/*.sql)
SEEDS=$(wildcard db/seed/*.sql)
TESTS=$(wildcard db/test/*.sql)

# ===============================
# HELP
# ===============================
help:
	@echo "Available commands:"
	@echo " make db               -> create database"
	@echo " make bootstrap-db     -> install extensions"
	@echo " make migrate          -> run migrations"
	@echo " make seed             -> seed data"
	@echo " make test             -> run db tests"
	@echo " make reset-data       -> truncate data"
	@echo " make reset-schema     -> recreate schema"
	@echo " make data-all         -> seed + test"
	@echo " make all              -> migrate + seed + test"

# ===============================
# CREATE DB
# ===============================
db:
	@echo "Create database if not exists..."
	@docker exec -i $(DB_CONTAINER) \
	psql -U postgres -d postgres -tc \
	"SELECT 1 FROM pg_database WHERE datname='$(DB_NAME)'" \
	| grep -q 1 || \
	docker exec -i $(DB_CONTAINER) \
	psql -U postgres -d postgres \
	-c "CREATE DATABASE $(DB_NAME) OWNER $(DB_USER);"

# ===============================
# BOOTSTRAP DB EXTENSIONS
# ===============================
bootstrap-db:
	@for file in $(INIT); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done

# ===============================
# MIGRATIONS
# ===============================
migrate:
	@for file in $(MIGRATIONS); do \
		echo "Running migrate: $$file"; \
		cat $$file | $(PSQL); \
	done

# ===============================
# SEED DATA
# ===============================
seed:
	@for file in $(SEEDS); do \
		echo "Running seed: $$file"; \
		cat $$file | $(PSQL); \
	done

# ===============================
# TEST DATABASE
# ===============================
test:
	@for file in $(TESTS); do \
		echo "Running test: $$file"; \
		cat $$file | $(PSQL); \
	done

# ===============================
# RESET DATA OF TABLE
# ===============================
reset-data:
	@docker exec -i $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME) \
	-c "TRUNCATE TABLE products RESTART IDENTITY CASCADE;"

# ===============================
# RESET TABLE
# ===============================
reset-schema:
	@echo "Reset schema $(DB_NAME)..."
	@docker exec -i $(DB_CONTAINER) \
	psql -U $(DB_USER) -d $(DB_NAME) \
	-c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# ===============================
# FULL FLOW
# ===============================
data-all: seed test
all: migrate seed test
