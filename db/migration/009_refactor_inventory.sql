BEGIN;

-- 1. remove old identity
ALTER TABLE inventory DROP CONSTRAINT inventory_pkey;
ALTER TABLE inventory DROP CONSTRAINT inventory_product_id_key;
DROP INDEX IF EXISTS idx_inventory_product_id;

-- 2. rename columns FIRST
ALTER TABLE inventory RENAME COLUMN quantity TO total_stock;
ALTER TABLE inventory RENAME COLUMN reserved TO reserved_stock;

-- 3. remove id
ALTER TABLE inventory DROP COLUMN id;

-- 4. set new primary key
ALTER TABLE inventory ADD PRIMARY KEY (product_id);

-- 5. add invariants
ALTER TABLE inventory
ADD CONSTRAINT inventory_total_stock_positive
CHECK (total_stock >= 0);

ALTER TABLE inventory
ADD CONSTRAINT inventory_reserved_stock_positive
CHECK (reserved_stock >= 0);

ALTER TABLE inventory
ADD CONSTRAINT inventory_reserved_not_exceed
CHECK (reserved_stock <= total_stock);

COMMIT;
