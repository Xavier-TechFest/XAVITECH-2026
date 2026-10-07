-- ==============================================================================
-- Migration: 013_update_battle_of_bots_track_mapping.sql
-- Description: Remap "Battle of Bots" (battle-of-bots) to Track B — Coding & Development
-- ==============================================================================

-- Remap Battle of Bots to Track B (Coding & Development)
-- Resolves Track B UUID dynamically by slug ('coding-development')
UPDATE events
SET 
  track_id = (SELECT id FROM tracks WHERE slug = 'coding-development'),
  category = 'TRACK B — Coding & Development Track',
  updated_at = NOW()
WHERE slug = 'battle-of-bots';
