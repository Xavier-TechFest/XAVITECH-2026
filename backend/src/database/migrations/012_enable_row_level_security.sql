-- ==============================================================================
-- Migration: 012_enable_row_level_security.sql
-- Description: Enables standard Row Level Security (RLS) across all 11 application tables.
--              Protects the database against unauthorized direct PostgREST access via the public anon key.
--              Backend Express API queries using the service_role key automatically bypass RLS.
-- ==============================================================================

-- 1. Core user and authentication tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_leader_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_leader_password_resets ENABLE ROW LEVEL SECURITY;

-- 2. Tracks, events, and track assignments
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_leader_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Registrations, teams, and team members
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 4. Schema migrations tracking table
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
