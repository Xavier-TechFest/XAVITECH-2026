-- ==============================================================================
-- Migration: 025_sync_innocraft_and_mun_formats.sql
-- Description: 
--   1. Expands events.registration_type constraint to allow 'BOTH' for dual-format events.
--   2. Updates Unscripted Nations (MUN) to 'BOTH' format with min 1, max 2, base fee ₹500.00.
--   3. Updates InnoCraft base fee to ₹600.00 (School pool ₹600, College pool ₹800).
--   4. Clears test/stale registration start windows ensuring open registration.
-- ==============================================================================

-- 1. Expand events table check constraint to support dual-format events ('BOTH')
ALTER TABLE events DROP CONSTRAINT IF EXISTS check_event_registration_type;
ALTER TABLE events ADD CONSTRAINT check_event_registration_type CHECK (registration_type IN ('INDIVIDUAL', 'TEAM', 'BOTH'));

-- 2. Update Unscripted Nations (MUN) to BOTH format
UPDATE events
SET
  registration_type = 'BOTH',
  min_team_size = 1,
  max_team_size = 2,
  fee = 500.00,
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE slug = 'unscripted-nations';

-- 3. Update InnoCraft base fee to ₹600.00 (School pool rate)
UPDATE events
SET
  fee = 600.00,
  registration_type = 'TEAM',
  min_team_size = 4,
  max_team_size = 4,
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE slug = 'innocraft';
