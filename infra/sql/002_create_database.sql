------------------------ CREATE DATABASE -------------------------
-- SELECT format(
--     'CREATE DATABASE %I OWNER %I ENCODING ''UTF8'' TEMPLATE template0',
--     :'db_name',
--     :'db_user'
-- )
-- \gexec
-- -- WHERE NOT EXISTS (
-- --     SELECT FROM pg_database WHERE datname = :'db_name'
-- -- )\gexec

-- STEP 1: snapshot state
SELECT EXISTS (
   SELECT FROM pg_database WHERE datname = :'db_name'
) AS db_exists_before \gset


-- STEP 2: create if needed
SELECT format(
    'CREATE DATABASE %I OWNER %I ENCODING ''UTF8'' TEMPLATE template0',
    :'db_name',
    :'db_user'
)
WHERE :'db_exists_before' = 'f'
\gexec


-- STEP 3: correct logging
SELECT
   CASE
      WHEN :'db_exists_before' = 't'
      THEN 'DATABASE EXISTS (SKIP CREATE)'
      ELSE 'DATABASE CREATED'
   END AS status;

------------------- GRANT -------------------------
GRANT ALL PRIVILEGES ON DATABASE :"db_name" TO :"db_user";
