#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
MODE="${MODE:-dev}"

# =========================
# Load ENV
# =========================
set -a
source .env
set +a

DB_CONTAINER="${DB_CONTAINER:-infra-wsl2-postgres-1}"

DB_USER="${DB_USER:-$(echo "$DB_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')}"
DB_NAME="${DB_NAME:-$(echo "$DB_URL" | sed -E 's|.*/([^/?]+).*|\1|')}"

PSQL_BASE="docker exec -i $DB_CONTAINER psql -U postgres -d postgres -v ON_ERROR_STOP=1"
PSQL_ECOM="docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1"

echo "==> DB Action: $ACTION (MODE=$MODE)"

create_user_dev() {
  cat infra/sql/001_create_user.sql | \
  docker exec -i "$DB_CONTAINER" \
    psql -U postgres \
      -v ON_ERROR_STOP=1 \
      -c "SET app.db_user='$DB_USER';" \
      -c "SET app.db_password='$DB_PASSWORD';" \
      -f -

  echo "✅ User created"
}

create_db() {
  echo "==> Create database $DB_NAME (dev sql)"

  cat infra/sql/002_create_database.sql | \
  docker exec -i "$DB_CONTAINER" \
    psql -U postgres \
    -v ON_ERROR_STOP=1 \
    -v db_name="$DB_NAME" \
    -v db_user="$DB_USER"

  echo "✅ Create database $DB_NAME done"
}

# create_db() {
#   echo "==> Create database $DB_NAME"

#   $PSQL \
#     -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

#   echo "✅ Create database $DB_NAME done"
# }

drop_user() {
  echo "==> Drop database user $DB_USER"

  docker exec -i "$DB_CONTAINER" \
    psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    -c "REASSIGN OWNED BY $DB_USER TO postgres;" \
    -c "DROP OWNED BY $DB_USER;" \
    -c "DROP ROLE IF EXISTS $DB_USER;"

  echo "✅ Drop database user $DB_USER done"
}

drop_db() {
  $PSQL_BASE -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname='$DB_NAME'
      AND pid <> pg_backend_pid();
  "

  $PSQL_BASE -c "DROP DATABASE IF EXISTS $DB_NAME;"
  echo "✅ Database $DB_NAME dropped"
}

reset_data() {
  echo "==> Reset table data..."

  $PSQL_ECOM -c "TRUNCATE TABLE products RESTART IDENTITY CASCADE;"

  echo "✅ Table data reset"
}

reset_schema() {
  echo "==> Reset schema $DB_NAME..."

  $PSQL_ECOM -c "DROP SCHEMA public CASCADE;"
  $PSQL_ECOM -c "CREATE SCHEMA public;"

  echo "✅ Schema reset"
}

access_user_postgres() {
  docker exec -it infra-wsl2-postgres-1 psql -U postgres
}

access_db_ecomdb() {
	docker exec -it infra-wsl2-postgres-1 psql -U ecom_app -d ecom_mono
}

access_db_testdb() {
	docker exec -it infra-wsl2-postgres-1 psql -U test -d testdb
}


case "$ACTION" in
  create-user-dev) create_user-dev ;;
  create-db) create_db ;;
  create-db-dev) create_db_dev ;;
  drop-user) drop_user ;;
  drop-db) drop_db ;;
  reset-data) reset_data ;;
  reset-schema) reset_schema ;;
  access-user-postgres) access_user_postgres ;;
  access-db-ecomdb) access_db_ecomdb ;;
  access-db-testdb) access_db_testdb ;;
  *)
    echo "Usage: $0 {create-user|create-db|drop-db}"
    exit 1
    ;;
esac
