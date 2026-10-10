-- ==============================================================================
-- Migration: 027_rename_battlefield_blitz_to_battleground_blitz.sql
-- Description:
--   Renames the canonical display name of the BGMI event (slug: 'loot-goblins')
--   from 'BATTLEFIELD BLITZ' to 'BATTLEGROUND BLITZ'.
--   Preserves the event slug 'loot-goblins', UUID, fees, team sizes, and all registrations.
-- ==============================================================================

UPDATE events
SET
  name = 'BATTLEGROUND BLITZ',
  description = 'Battleground Blitz is XAVITECH 2026''s BGMI esports competition. Each squad registers four core players and may add one optional substitute. Matches use Advanced Custom Rooms in a best-of-three format across Erangel, Miramar, and Rondo.',
  updated_at = NOW()
WHERE slug = 'loot-goblins';
