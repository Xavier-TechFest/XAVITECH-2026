-- ==============================================================================
-- Migration: 009_create_track_leader_sessions.sql
-- Description: Phase 8 Part 2: Track Leader authentication support, email uniqueness index,
--              password change flag, and dedicated track_leader_sessions table.
-- ==============================================================================

-- 1. Ensure email uniqueness across all users table (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(LOWER(email));

-- 2. Add must_change_password flag for future password provisioning/reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- 3. Create dedicated track_leader_sessions table
CREATE TABLE IF NOT EXISTS track_leader_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_agent TEXT NULL,
    ip_address VARCHAR(64) NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Performance & active session lookup indexes
CREATE INDEX IF NOT EXISTS idx_track_leader_sessions_token_hash ON track_leader_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_track_leader_sessions_user_id ON track_leader_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_track_leader_sessions_active ON track_leader_sessions(user_id, expires_at) WHERE revoked_at IS NULL;
