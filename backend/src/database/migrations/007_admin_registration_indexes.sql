-- ==============================================================================
-- Migration: 007_admin_registration_indexes.sql
-- Description: Performance optimization indexes for Admin registration search, filtering, and sorting
-- ==============================================================================

-- 1. Index on registrations.created_at for sorted pagination queries
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- 2. Index on teams.created_at for sorted team listing queries
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- 3. Index on teams.team_name for team search lookups
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
