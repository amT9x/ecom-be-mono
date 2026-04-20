DO $$
DECLARE
    v_user text := current_setting('app.db_user');
    v_password text := current_setting('app.db_password');
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = v_user) THEN

      EXECUTE format(
         'CREATE ROLE %I LOGIN PASSWORD %L',
         v_user,
         v_password
      );

      RAISE NOTICE 'ROLE CREATED: %', v_user;

   ELSE

      EXECUTE format(
         'ALTER ROLE %I WITH LOGIN PASSWORD %L',
         v_user,
         v_password
      );

      RAISE NOTICE 'ROLE EXISTS -> UPDATED: %', v_user;

   END IF;
END
$$;
