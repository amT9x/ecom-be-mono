BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_order_product'
  ) THEN
    ALTER TABLE order_items
    ADD CONSTRAINT unique_order_product
    UNIQUE(order_id, product_id);
  END IF;
END$$;

COMMIT;
