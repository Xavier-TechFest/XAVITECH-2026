-- ==============================================================================
-- Migration: 006_create_admin_and_sessions.sql
-- Description: Adds admin password_hash to users, enforces single-admin constraint,
--              and creates admin_sessions table for multi-session support.
-- ==============================================================================

-- 1. Modify users table to support password-based admin users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;
ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL;

-- 2. Enforce database-level constraint: EXACTLY ONE ADMIN account can exist
-- PostgreSQL partial unique index ensures only a single row can hold role = 'ADMIN'
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users(role) WHERE role = 'ADMIN';

-- 3. Create admin_sessions table for multi-device concurrent admin logins
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_agent TEXT NULL,
    ip_address VARCHAR(64) NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance & active session lookup indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(admin_user_id, expires_at) WHERE revoked_at IS NULL;
