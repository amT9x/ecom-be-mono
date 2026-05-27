CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_refresh_tokens_token
ON refresh_tokens(token);

CREATE INDEX ix_refresh_tokens_user_id
ON refresh_tokens(user_id);

CREATE INDEX ix_refresh_tokens_expires_at
ON refresh_tokens(expires_at);

CREATE INDEX ix_refresh_tokens_revoked_at
ON refresh_tokens(revoked_at);
