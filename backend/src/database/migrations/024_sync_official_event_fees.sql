-- ==============================================================================
-- Migration: 024_sync_official_event_fees.sql
-- Description: Authoritative fee and capacity synchronization for all 13
--              official XAVITECH 2026 events.
-- ==============================================================================

-- 1. Unscripted Nations (MUN): ₹500 per delegate (Individual)
UPDATE events
SET fee = 500.00,
    registration_type = 'INDIVIDUAL',
    min_team_size = 1,
    max_team_size = 1,
    updated_at = NOW()
WHERE slug = 'unscripted-nations';

-- 2. Cipher Chase: ₹400 per team, exactly 4 members
UPDATE events
SET fee = 400.00,
    registration_type = 'TEAM',
    min_team_size = 4,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'cipher-chase';

-- 3. VelocityX (Death Race): ₹700 per team, 2 to 4 members
UPDATE events
SET fee = 700.00,
    registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'velocityx';

-- 4. Debug Derby: Authoritative fee is ₹200.00 (Individual)
UPDATE events
SET fee = 200.00,
    registration_type = 'INDIVIDUAL',
    min_team_size = 1,
    max_team_size = 1,
    updated_at = NOW()
WHERE slug = 'debug-derby';

-- 5. Runtime Rush: Base participant fee is ₹150.00 (1 participant = ₹150, 2 participants = ₹300)
UPDATE events
SET fee = 150.00,
    registration_type = 'TEAM',
    min_team_size = 1,
    max_team_size = 2,
    updated_at = NOW()
WHERE slug = 'runtime-rush';

-- 6. InnoCraft: Base fee ₹800.00 (School pool ₹800, College pool ₹1,000), team of 4
UPDATE events
SET fee = 800.00,
    registration_type = 'TEAM',
    min_team_size = 4,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'innocraft';

-- 7. WebWeave: ₹300.00 per team of 2
UPDATE events
SET fee = 300.00,
    registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 2,
    updated_at = NOW()
WHERE slug = 'webweave';

-- 8. Data Analytics / VLookUp: ₹300.00 per team of 2
UPDATE events
SET fee = 300.00,
    registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 2,
    updated_at = NOW()
WHERE slug = 'vlookup';

-- 9. Battlefield Blitz / Loot Goblins: ₹200.00 per player (4 core + 1 sub, min 4, max 5)
UPDATE events
SET fee = 200.00,
    registration_type = 'TEAM',
    min_team_size = 4,
    max_team_size = 5,
    updated_at = NOW()
WHERE slug = 'loot-goblins';

-- 10. Tech Quiz / Circuit of Minds: ₹300.00 per team of 2
UPDATE events
SET fee = 300.00,
    registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 2,
    updated_at = NOW()
WHERE slug = 'circuit-of-minds';

-- 11. Battle of Bots: ₹550.00 per team of 1 to 3
UPDATE events
SET fee = 550.00,
    registration_type = 'TEAM',
    min_team_size = 1,
    max_team_size = 3,
    updated_at = NOW()
WHERE slug = 'battle-of-bots';

-- 12. Ideathon / ThoughtLab: ₹500.00 per team of 2 to 4
UPDATE events
SET fee = 500.00,
    registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'thoughtlab';

-- 13. Hack the Skill: ₹300.00 per team of 1 to 4
UPDATE events
SET fee = 300.00,
    registration_type = 'TEAM',
    min_team_size = 1,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'hack-the-skill';
