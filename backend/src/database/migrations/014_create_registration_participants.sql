-- ==============================================================================
-- Migration: 014_create_registration_participants.sql
-- Description: Creates normalized registration_participants table for XAVITECH-2026
--              Stores participant snapshot details per registration.
-- ==============================================================================

-- 1. Create registration_participants table
CREATE TABLE IF NOT EXISTS registration_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    team_member_id UUID NULL REFERENCES team_members(id) ON DELETE SET NULL,
    participant_order INTEGER NOT NULL CHECK (participant_order > 0),
    participant_role VARCHAR(32) NOT NULL CHECK (participant_role IN ('LEADER', 'MEMBER')),
    full_name VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    standard_class VARCHAR(64) NOT NULL,
    id_card_url TEXT NULL,
    id_card_public_id TEXT NULL,
    id_card_resource_type VARCHAR(32) NULL,
    id_card_mime_type VARCHAR(128) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_reg_participant_order UNIQUE (registration_id, participant_order)
);

-- 2. Partial unique index: Exactly one LEADER allowed per registration
CREATE UNIQUE INDEX IF NOT EXISTS uq_reg_participant_leader
    ON registration_participants (registration_id)
    WHERE participant_role = 'LEADER';

-- 3. Lookup & Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reg_participants_reg_id ON registration_participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_participants_team_member_id ON registration_participants(team_member_id);
CREATE INDEX IF NOT EXISTS idx_reg_participants_email ON registration_participants(email);
CREATE INDEX IF NOT EXISTS idx_reg_participants_mobile ON registration_participants(mobile_number);

-- 4. Trigger for updated_at column
DROP TRIGGER IF EXISTS trigger_registration_participants_updated_at ON registration_participants;
CREATE TRIGGER trigger_registration_participants_updated_at
    BEFORE UPDATE ON registration_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security (RLS) matching application standard
ALTER TABLE registration_participants ENABLE ROW LEVEL SECURITY;
