BEGIN;

-- 1. create enum type if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_status'
  ) THEN
    CREATE TYPE order_status AS ENUM (
      'PENDING',
      'CONFIRMED',
      'CANCELLED',
      'PAID'
    );
  END IF;
END$$;

-- 2. remove default (IMPORTANT)
ALTER TABLE orders
ALTER COLUMN status DROP DEFAULT;

-- 3. convert column type
ALTER TABLE orders
ALTER COLUMN status TYPE order_status
USING status::order_status;

-- 4. add default back
ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'PENDING';

COMMIT;
