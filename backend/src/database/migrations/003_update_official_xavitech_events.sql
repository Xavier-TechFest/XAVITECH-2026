-- ==============================================================================
-- Migration: 003_update_official_xavitech_events.sql
-- Description: Updates official final XAVITECH 2026 events, fees, tracks, and team-size configuration
-- ==============================================================================

-- 1. Ensure track, event_type, and currency columns exist on events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS track VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

-- 2. Upsert the 13 official XAVITECH 2026 events
INSERT INTO events (
    name,
    slug,
    event_type,
    track,
    category,
    registration_type,
    min_team_size,
    max_team_size,
    fee,
    currency,
    is_active,
    registration_open
)
VALUES 
  -- TRACK A — Flagship Innovation Track
  (
    'Innocrаft',
    'innocraft',
    'Hackathon',
    'TRACK A — Flagship Innovation Track',
    'TRACK A — Flagship Innovation Track',
    'TEAM',
    3,
    4,
    700.00,
    'INR',
    true,
    true
  ),

  -- TRACK B — Coding & Development Track
  (
    'Runtime Rush',
    'runtime-rush',
    'Code Sprint',
    'TRACK B — Coding & Development Track',
    'TRACK B — Coding & Development Track',
    'INDIVIDUAL',
    1,
    1,
    100.00,
    'INR',
    true,
    true
  ),
  (
    'Debug Derby',
    'debug-derby',
    'Debugging Challenge',
    'TRACK B — Coding & Development Track',
    'TRACK B — Coding & Development Track',
    'INDIVIDUAL',
    1,
    1,
    200.00,
    'INR',
    true,
    true
  ),
  (
    'VLookUp',
    'vlookup',
    'Data Analytics Challenge',
    'TRACK B — Coding & Development Track',
    'TRACK B — Coding & Development Track',
    'TEAM',
    2,
    2,
    200.00,
    'INR',
    true,
    true
  ),
  (
    'WebWeave',
    'webweave',
    'Web Development Challenge',
    'TRACK B — Coding & Development Track',
    'TRACK B — Coding & Development Track',
    'TEAM',
    2,
    3,
    400.00,
    'INR',
    true,
    true
  ),

  -- TRACK C — Gaming & Adventure Track
  (
    'Loot Goblins',
    'loot-goblins',
    'BGMI',
    'TRACK C — Gaming & Adventure Track',
    'TRACK C — Gaming & Adventure Track',
    'TEAM',
    4,
    4,
    600.00,
    'INR',
    true,
    true
  ),
  (
    'VelocityX',
    'velocityx',
    'Death Race',
    'TRACK C — Gaming & Adventure Track',
    'TRACK C — Gaming & Adventure Track',
    'TEAM',
    1,
    2,
    200.00,
    'INR',
    true,
    true
  ),
  (
    'Cipher Chase',
    'cipher-chase',
    'Tech Treasure Hunt',
    'TRACK C — Gaming & Adventure Track',
    'TRACK C — Gaming & Adventure Track',
    'TEAM',
    3,
    4,
    400.00,
    'INR',
    true,
    true
  ),

  -- TRACK D — Knowledge & Leadership Track
  (
    'Unscripted Nations',
    'unscripted-nations',
    'MUN',
    'TRACK D — Knowledge & Leadership Track',
    'TRACK D — Knowledge & Leadership Track',
    'INDIVIDUAL',
    1,
    1,
    350.00,
    'INR',
    true,
    true
  ),
  (
    'Circuit of Minds',
    'circuit-of-minds',
    'Tech Quiz',
    'TRACK D — Knowledge & Leadership Track',
    'TRACK D — Knowledge & Leadership Track',
    'TEAM',
    1,
    2,
    100.00,
    'INR',
    true,
    true
  ),
  (
    'ThoughtLab',
    'thoughtlab',
    'Ideathon',
    'TRACK D — Knowledge & Leadership Track',
    'TRACK D — Knowledge & Leadership Track',
    'TEAM',
    2,
    4,
    500.00,
    'INR',
    true,
    true
  ),
  (
    'Battle of Bots',
    'battle-of-bots',
    'AI Prompt Battle',
    'TRACK D — Knowledge & Leadership Track',
    'TRACK D — Knowledge & Leadership Track',
    'TEAM',
    1,
    2,
    100.00,
    'INR',
    true,
    true
  ),

  -- TRACK E — Creative Learning Track
  (
    'Hack the Skill',
    'hack-the-skill',
    'Workshop',
    'TRACK E — Creative Learning Track',
    'TRACK E — Creative Learning Track',
    'INDIVIDUAL',
    1,
    1,
    150.00,
    'INR',
    true,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  event_type = EXCLUDED.event_type,
  track = EXCLUDED.track,
  category = EXCLUDED.category,
  registration_type = EXCLUDED.registration_type,
  min_team_size = EXCLUDED.min_team_size,
  max_team_size = EXCLUDED.max_team_size,
  fee = EXCLUDED.fee,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active,
  registration_open = EXCLUDED.registration_open,
  updated_at = NOW();

-- 3. Safely preserve existing user registrations by re-linking old placeholder event IDs to their official counterparts
UPDATE registrations
SET event_id = (SELECT id FROM events WHERE slug = 'innocraft')
WHERE event_id IN (SELECT id FROM events WHERE slug = 'crucible');

UPDATE registrations
SET event_id = (SELECT id FROM events WHERE slug = 'runtime-rush')
WHERE event_id IN (SELECT id FROM events WHERE slug = 'code-sprint');

-- 4. Delete obsolete placeholder events that have no user registrations referencing them
DELETE FROM events
WHERE slug NOT IN (
  'innocraft',
  'runtime-rush',
  'debug-derby',
  'vlookup',
  'webweave',
  'loot-goblins',
  'velocityx',
  'cipher-chase',
  'unscripted-nations',
  'circuit-of-minds',
  'thoughtlab',
  'battle-of-bots',
  'hack-the-skill'
)
AND id NOT IN (SELECT DISTINCT event_id FROM registrations);

-- 5. Safety fallback: Ensure any obsolete event with remaining foreign keys is strictly deactivated and hidden
UPDATE events
SET is_active = false, registration_open = false
WHERE slug NOT IN (
  'innocraft',
  'runtime-rush',
  'debug-derby',
  'vlookup',
  'webweave',
  'loot-goblins',
  'velocityx',
  'cipher-chase',
  'unscripted-nations',
  'circuit-of-minds',
  'thoughtlab',
  'battle-of-bots',
  'hack-the-skill'
);
