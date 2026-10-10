-- ==============================================================================
-- Migration: 026_sync_debug_derby_fee_and_hack_the_skill_format.sql
-- Description:
--   1. Updates Debug Derby (debug-derby) authoritative fee from ₹200 to ₹150 (Individual).
--   2. Updates Hack the Skill (hack-the-skill) to INDIVIDUAL only with min/max team size = 1, fee = ₹300.
-- ==============================================================================

-- 1. Debug Derby: Authoritative fee is ₹150.00 per participant (Individual)
UPDATE events
SET
  fee = 150.00,
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE slug = 'debug-derby';

-- 2. Hack the Skill: Format is INDIVIDUAL only, ₹300.00 per participant
UPDATE events
SET
  fee = 300.00,
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE slug = 'hack-the-skill';
