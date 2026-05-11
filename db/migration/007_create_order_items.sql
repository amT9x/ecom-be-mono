CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id),

    quantity INT NOT NULL,
    price NUMERIC(12,2) NOT NULL
);
