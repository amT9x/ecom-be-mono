CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    currency TEXT NOT NULL DEFAULT 'VND',

    status TEXT NOT NULL DEFAULT 'PENDING',

    provider TEXT NOT NULL,

    provider_reference TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT fk_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    payment_id UUID NOT NULL,

    event_type TEXT NOT NULL,

    payload JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT fk_payment
        FOREIGN KEY(payment_id)
        REFERENCES payments(id)
        ON DELETE CASCADE
);
