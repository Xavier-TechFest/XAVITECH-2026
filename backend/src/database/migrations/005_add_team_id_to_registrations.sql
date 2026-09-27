-- ==============================================================================
-- Migration: 005_add_team_id_to_registrations.sql
-- Description: Adds nullable team_id foreign key to registrations table
-- ==============================================================================

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_id UUID NULL REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON registrations(team_id);
