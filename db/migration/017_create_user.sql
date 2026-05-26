CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
    id UUID PRIMARY KEY,

    email CITEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER',

    version INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL,

    CONSTRAINT users_role_check
    CHECK (role IN ('USER', 'ADMIN'))
);

CREATE INDEX users_created_at_idx
ON users(created_at DESC);
