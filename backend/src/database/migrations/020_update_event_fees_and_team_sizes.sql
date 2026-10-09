-- Update the five event registration amounts and team sizes confirmed by organizers.

UPDATE events
SET fee = 500.00,
    updated_at = NOW()
WHERE slug = 'unscripted-nations';

UPDATE events
SET registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 2,
    fee = 300.00,
    updated_at = NOW()
WHERE slug = 'circuit-of-minds';

UPDATE events
SET registration_type = 'TEAM',
    min_team_size = 4,
    max_team_size = 5,
    fee = 200.00,
    updated_at = NOW()
WHERE slug = 'loot-goblins';

UPDATE events
SET registration_type = 'TEAM',
    min_team_size = 4,
    max_team_size = 4,
    fee = 400.00,
    updated_at = NOW()
WHERE slug = 'cipher-chase';

UPDATE events
SET registration_type = 'TEAM',
    min_team_size = 2,
    max_team_size = 3,
    fee = 700.00,
    updated_at = NOW()
WHERE slug = 'velocityx';
