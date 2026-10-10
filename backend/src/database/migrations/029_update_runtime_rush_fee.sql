-- ==============================================================================
-- Migration: 029_update_runtime_rush_fee.sql
-- Description:
--   Updates Runtime Rush (runtime-rush) authoritative registration fee to ₹250.00 per participant.
--   Preserves event format (TEAM, min 1, max 2).
--   Fee model: ₹250 per participant (Individual = ₹250, Team of 2 = ₹500).
-- ==============================================================================

UPDATE events
SET
  fee = 250.00,
  updated_at = NOW()
WHERE slug = 'runtime-rush';
