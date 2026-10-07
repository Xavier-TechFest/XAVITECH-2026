-- ==============================================================================
-- Migration: 018_sync_all_events_with_frontend_source_of_truth.sql
-- Description: Synchronize all 13 official XAVITECH 2026 events with
--              frontend/lib/eventsData.ts (the authoritative source of truth).
-- ==============================================================================

-- 1. INNOCRAFT (Track A — Flagship Innovation)
-- Format: Team of exactly 4. Base fee: 800 (School pool ₹800, College pool ₹1,000)
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 4,
  max_team_size = 4,
  fee = 800.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'innocraft';

-- 2. WEBWEAVE (Track B — Coding & Development)
-- Format: Team of exactly 2. Fee: 300
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'webweave';

-- 3. RUNTIME RUSH (Track B — Coding & Development)
-- Format: Flexible team of 1 to 2. Fee: 300
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 2,
  fee = 300.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'runtime-rush';

-- 4. VLOOKUP / DATA ANALYTICS (Track B — Coding & Development)
-- Format: Team of exactly 2. Fee: 300
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'vlookup';

-- 5. DEBUG DERBY (Track B — Coding & Development)
-- Format: Individual delegate. Fee: 200
UPDATE events
SET
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 200.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'debug-derby';

-- 6. UNSCRIPTED NATIONS / MUN (Track D — Knowledge & Leadership)
-- Format: Individual delegate. Fee: 400
UPDATE events
SET
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 400.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'unscripted-nations';

-- 7. CIRCUIT OF MINDS / TECH QUIZ (Track D — Knowledge & Leadership)
-- Format: Team of exactly 2. Fee: 300
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'circuit-of-minds';

-- 8. BATTLE OF BOTS (Track B — Coding & Development)
-- Format: Flexible team of 1 to 3. Fee: 550
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 3,
  fee = 550.00,
  track = 'TRACK B — Coding & Development Track',
  category = 'TRACK B — Coding & Development Track',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'battle-of-bots';

-- 9. THOUGHTLAB / IDEATHON (Track D — Knowledge & Leadership)
-- Format: Team of 2 to 4. Fee: 500
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 4,
  fee = 500.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'thoughtlab';

-- 10. LOOT GOBLINS / BATTLEFIELD BLITZ (Track C — Gaming & Adventure)
-- Format: Team of 4 to 5 (4 core + 1 sub). Fee: 200 per player
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 4,
  max_team_size = 5,
  fee = 200.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'loot-goblins';

-- 11. CIPHER CHASE (Track C — Gaming & Adventure)
-- Format: Team of 20 to 30. Fee: 200
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 20,
  max_team_size = 30,
  fee = 200.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'cipher-chase';

-- 12. VELOCITYX / DEATH RACE (Track C — Gaming & Adventure)
-- Format: Team of 2 to 3. Fee: TBA (retaining 200.00 DB placeholder)
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 3,
  fee = 200.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'velocityx';

-- 13. HACK THE SKILL / HACK THE SKILLS WORKSHOP (Track E — Creative Learning)
-- Format: Flexible team of 1 to 4. Fee: 300
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 4,
  fee = 300.00,
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE slug = 'hack-the-skill';
