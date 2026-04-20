DROP INDEX IF EXISTS idx_products_created_at;

CREATE INDEX idx_products_created_at
ON products(created_at DESC);

DROP INDEX IF EXISTS idx_products_cursor;

CREATE INDEX idx_products_cursor
ON products(created_at DESC, id DESC);

DROP INDEX IF EXISTS idx_products_active;

CREATE INDEX idx_products_active
ON products(is_active);
