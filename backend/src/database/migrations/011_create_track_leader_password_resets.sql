-- ==============================================================================
-- Migration: 011_create_track_leader_password_resets.sql
-- Description: Phase 8 Part 5 Enhancement: Track Leader password reset table.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS track_leader_password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookup and token validation
CREATE INDEX IF NOT EXISTS idx_track_leader_resets_token_hash ON track_leader_password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_track_leader_resets_user_id ON track_leader_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_track_leader_resets_active ON track_leader_password_resets(user_id, expires_at) WHERE used_at IS NULL;
