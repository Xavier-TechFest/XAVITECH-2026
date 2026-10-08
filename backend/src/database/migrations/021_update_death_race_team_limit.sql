-- Death Race's approved operational proposal specifies teams of 2 to 4 members.
UPDATE events
SET min_team_size = 2,
    max_team_size = 4,
    updated_at = NOW()
WHERE slug = 'velocityx';
