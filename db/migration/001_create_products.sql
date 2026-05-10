CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_products_created_at
ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_cursor
ON products (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_products_active
ON products(is_active);
