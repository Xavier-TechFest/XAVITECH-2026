-- Allow InnoCraft teams of 2–4 participants and remove any team-size penalty.
UPDATE events
SET
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 4,
  description = 'InnoCraft is a team hackathon for school and college participants. Teams may register 2, 3, or 4 members through one team leader. Teams with fewer than 4 members receive no marks deduction or penalty.',
  updated_at = NOW()
WHERE slug = 'innocraft';
