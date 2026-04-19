-- =========================================
-- 0. RESET (dev only)
-- =========================================
DROP TABLE IF EXISTS products;

-- =========================================
-- 1. TABLE: products
-- =========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- =========================================
-- 2. INDEX
-- =========================================
CREATE INDEX idx_products_created_at
ON products(created_at DESC);

CREATE INDEX idx_products_cursor
ON products (created_at DESC, id DESC);

CREATE INDEX idx_products_active
ON products(is_active);

-- =========================================
-- 3. SEED DATA (TEST PAGINATION)
-- =========================================
INSERT INTO products(name, price, stock, description)
SELECT
    'Product ' || i,
    (random() * 1000)::numeric(10,2),
    (random() * 50)::int,
    'Demo product ' || i
FROM generate_series(1, 100) AS s(i);

-- =========================================
-- 4. HEALTH CHECK
-- =========================================
SELECT 1 AS db_alive;

-- =========================================
-- 5. READ (GET /products)
-- =========================================
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- =========================================
-- 6. PAGINATION (GET /products?page=2)
-- =========================================
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;

-- =========================================
-- 7. GET BY ID (GET /products/:id)
-- =========================================
SELECT *
FROM products
WHERE id = (
    SELECT id FROM products LIMIT 1
);

-- =========================================
-- 8. CREATE PRODUCT (POST)
-- =========================================
INSERT INTO products(name, price, stock)
VALUES ('Macbook M3', 1999.99, 5)
RETURNING *;

-- =========================================
-- 9. UPDATE PRODUCT (PUT/PATCH)
-- =========================================
UPDATE products
SET price = 1799.99,
    updated_at = now()
WHERE id = (
    SELECT id FROM products LIMIT 1
)
RETURNING *;

-- =========================================
-- 10. SOFT DELETE
-- =========================================
UPDATE products
SET is_active = false
WHERE id = (
    SELECT id FROM products LIMIT 1
);

-- middleware filter simulation
SELECT *
FROM products
WHERE is_active = true;

-- =========================================
-- 11. HARD DELETE
-- =========================================
DELETE FROM products
WHERE id = (
    SELECT id FROM products OFFSET 1 LIMIT 1
);

-- =========================================
-- 12. COUNT FOR PAGINATION META
-- =========================================
SELECT COUNT(*) FROM products WHERE is_active = true;

-- =========================================
-- 13. DEBUG SLOW QUERY
-- =========================================
EXPLAIN ANALYZE
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10;
