-- health check
SELECT 1 AS db_alive;

-- list products
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- pagination
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;

-- get by id
SELECT *
FROM products
WHERE id = (
    SELECT id FROM products LIMIT 1
);

-- soft delete check
UPDATE products
SET is_active = false
WHERE id = (
    SELECT id FROM products LIMIT 1
);

SELECT *
FROM products
WHERE is_active = true;

-- explain performance
EXPLAIN ANALYZE
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT 10;
