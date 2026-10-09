-- ==============================================================================
-- Migration: 021_sync_official_xavitech_events.sql
-- Description: Synchronize official XAVITECH 2026 event metadata with the
--              authoritative public frontend specifications (frontend/lib/eventsData.ts).
--
-- CRITICAL SAFETY NOTE:
-- All existing event UUIDs are strictly PRESERVED because active registrations,
-- teams, participants, payments, and track leader assignments already reference them.
-- Destructive operations (DROP/DELETE/INSERT new UUIDs) are strictly prohibited.
-- All updates are performed strictly with explicit WHERE id = '<existing UUID>'.
-- ==============================================================================

-- 1. INNOCRAFT (Track A — Flagship Innovation / Hackathon)
-- UUID: 213a4266-b523-4317-b80e-c0120965cbe4
-- Format: Team of exactly 4. Base fee: 800.00 (School pool ₹800, College pool ₹1,000)
UPDATE events
SET
  name = 'INNOCRAFT',
  slug = 'innocraft',
  track = 'TRACK A — HACKATHON',
  category = 'TRACK A — HACKATHON',
  event_type = 'Hackathon',
  track_id = '10c9c617-8d32-4fb8-9dcf-6cc063596119',
  description = 'InnoCraft is a team hackathon for school and college participants. Teams register together through one team leader.',
  registration_type = 'TEAM',
  min_team_size = 4,
  max_team_size = 4,
  fee = 800.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '213a4266-b523-4317-b80e-c0120965cbe4';

-- 2. WEBWEAVE (Track B — Coding & Development / Web Development Challenge)
-- UUID: abeecd1f-e07d-43e5-8970-691e6ed010b2
-- Format: Team of exactly 2. Fee: 300.00
UPDATE events
SET
  name = 'WEBWEAVE',
  slug = 'webweave',
  track = 'TRACK B — CODING & DEVELOPMENT',
  category = 'TRACK B — CODING & DEVELOPMENT',
  event_type = 'Web Development Challenge',
  track_id = '5f365b36-7989-4db1-8241-45ddbac40233',
  description = 'WebWeave is a team web development challenge for school students in Class 10 and above and undergraduate students, including BCA students. Teams of two bring their own laptop and charger, then build around one shared theme in a four-hour build phase.',
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'abeecd1f-e07d-43e5-8970-691e6ed010b2';

-- 3. RUNTIME RUSH (Track B — Coding & Development / Coding Challenge)
-- UUID: b631bfc9-ac25-4958-9bb0-c908ae8967b8
-- Format: Solo or team of 2 (1 to 2 members). Fee: 300.00
UPDATE events
SET
  name = 'RUNTIME RUSH',
  slug = 'runtime-rush',
  track = 'TRACK B — CODING & DEVELOPMENT',
  category = 'TRACK B — CODING & DEVELOPMENT',
  event_type = 'Coding Challenge',
  track_id = '5f365b36-7989-4db1-8241-45ddbac40233',
  description = 'Runtime Rush is a coding challenge open to school and college students. Participate individually or register with one teammate. Participants compete using Java, C, C++, Python, or JavaScript.',
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 2,
  fee = 300.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'b631bfc9-ac25-4958-9bb0-c908ae8967b8';

-- 4. DATA ANALYTICS (Track B — Coding & Development / Data Analytics Challenge, previously VLookUp)
-- UUID: c83ca21b-9787-4c8d-9bb4-0a1ac7c5b793
-- Format: Team of exactly 2. Fee: 300.00
UPDATE events
SET
  name = 'DATA ANALYTICS',
  slug = 'vlookup',
  track = 'TRACK B — CODING & DEVELOPMENT',
  category = 'TRACK B — CODING & DEVELOPMENT',
  event_type = 'Data Analytics Challenge',
  track_id = '5f365b36-7989-4db1-8241-45ddbac40233',
  description = 'XAVITECH 2026 Data Analytics is a team competition for pairs. Participants should know Excel and Power BI. The event is open to Class 7–12, undergraduate, and postgraduate students over 16 years old.',
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'c83ca21b-9787-4c8d-9bb4-0a1ac7c5b793';

-- 5. DEBUG DERBY (Track B — Coding & Development / Debugging Challenge)
-- UUID: 15328fe9-412b-4f0a-93fc-96ff567f6f93
-- Format: Individual delegate. Fee: 200.00
UPDATE events
SET
  name = 'DEBUG DERBY',
  slug = 'debug-derby',
  track = 'TRACK B — CODING & DEVELOPMENT',
  category = 'TRACK B — CODING & DEVELOPMENT',
  event_type = 'Debugging Challenge',
  track_id = '5f365b36-7989-4db1-8241-45ddbac40233',
  description = 'Debug Derby is an individual programming challenge for Class 11, Class 12, and undergraduate students. Participants compete in two debugging rounds with a combined duration of 90 minutes: basic debugging followed by advanced debugging. A verified HackerRank account is required at least 24 hours before the event.',
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 200.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '15328fe9-412b-4f0a-93fc-96ff567f6f93';

-- 6. MODEL UNITED NATIONS (Track D — Stage & Central Events / MUN, previously Unscripted Nations)
-- UUID: 770970ed-6e63-4bd7-b9e9-ff4874acd060
-- Format: Individual delegate. Fee: 400.00
UPDATE events
SET
  name = 'MODEL UNITED NATIONS',
  slug = 'unscripted-nations',
  track = 'TRACK D — STAGE & CENTRAL EVENTS',
  category = 'TRACK D — STAGE & CENTRAL EVENTS',
  event_type = 'MUN',
  track_id = '8f47c501-bc6d-4aef-9036-5ad79da0c427',
  description = 'XAVITECH 2026 Model United Nations (MUN) is an individual delegate event for the United Nations Commission on Science and Technology for Development (CSTD).',
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 400.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '770970ed-6e63-4bd7-b9e9-ff4874acd060';

-- 7. TECH QUIZ (Track D — Stage & Central Events / Tech Quiz, previously Circuit of Minds)
-- UUID: b5c3b61d-2b26-45d2-9ff4-92cce891b727
-- Format: Fixed team of 2. Fee: 300.00
UPDATE events
SET
  name = 'TECH QUIZ',
  slug = 'circuit-of-minds',
  track = 'TRACK D — STAGE & CENTRAL EVENTS',
  category = 'TRACK D — STAGE & CENTRAL EVENTS',
  event_type = 'Tech Quiz',
  track_id = '8f47c501-bc6d-4aef-9036-5ad79da0c427',
  description = 'Tech Quiz is a team-based event with fixed two-member teams.',
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 2,
  fee = 300.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'b5c3b61d-2b26-45d2-9ff4-92cce891b727';

-- 8. BATTLE OF BOTS (Track B — Coding & Development / AI Prompt Battle)
-- UUID: 218f1371-b8e6-4d59-8e90-e0a5d0f000f6
-- Format: Flexible team of 1 to 3. Fee: 550.00
UPDATE events
SET
  name = 'BATTLE OF BOTS',
  slug = 'battle-of-bots',
  track = 'TRACK B — CODING & DEVELOPMENT',
  category = 'TRACK B — CODING & DEVELOPMENT',
  event_type = 'AI Prompt Battle',
  track_id = '5f365b36-7989-4db1-8241-45ddbac40233',
  description = 'Battle of Bots is an AI prompt battle open to individual participants and teams of up to three. Event rules will be shared by the organizers. Further event details are to be announced.',
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 3,
  fee = 550.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '218f1371-b8e6-4d59-8e90-e0a5d0f000f6';

-- 9. IDEATHON (Track D — Stage & Central Events / Ideathon, previously ThoughtLab)
-- UUID: ae0bcfc2-517a-4b86-be13-88abe1ce5ea0
-- Format: Team of 2 to 4. Fee: 500.00
UPDATE events
SET
  name = 'IDEATHON',
  slug = 'thoughtlab',
  track = 'TRACK D — STAGE & CENTRAL EVENTS',
  category = 'TRACK D — STAGE & CENTRAL EVENTS',
  event_type = 'Ideathon',
  track_id = '8f47c501-bc6d-4aef-9036-5ad79da0c427',
  description = 'XAVITECH 2026 Ideathon is a team event for groups of two to four. A team leader submits the registration, adds one teammate, and invites any remaining members to join through a link.',
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 4,
  fee = 500.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'ae0bcfc2-517a-4b86-be13-88abe1ce5ea0';

-- 10. BATTLEFIELD BLITZ (Track C — Gaming & Adventure / BGMI Esports, previously Loot Goblins)
-- UUID: 620c5d8b-9e67-4a6c-82e3-0366c071d153
-- Format: Team of 4 to 5 (4 core + 1 substitute). Fee: 200.00 per player
UPDATE events
SET
  name = 'BATTLEFIELD BLITZ',
  slug = 'loot-goblins',
  track = 'TRACK C — GAMING & ADVENTURE',
  category = 'TRACK C — GAMING & ADVENTURE',
  event_type = 'BGMI',
  track_id = 'fbe20cf1-51e5-4f06-8c9a-6c6b813c5e1d',
  description = 'Battlefield Blitz is XAVITECH 2026''s BGMI esports competition. Each squad registers four core players and may add one optional substitute. Matches use Advanced Custom Rooms in a best-of-three format across Erangel, Miramar, and Rondo.',
  registration_type = 'TEAM',
  min_team_size = 4,
  max_team_size = 5,
  fee = 200.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '620c5d8b-9e67-4a6c-82e3-0366c071d153';

-- 11. CIPHER CHASE (Track C — Gaming & Adventure / Tech Treasure Hunt)
-- UUID: 74693e7b-9409-4934-a154-dc351f9ceb73
-- Format: Team of 20 to 30. Fee: 200.00
UPDATE events
SET
  name = 'CIPHER CHASE',
  slug = 'cipher-chase',
  track = 'TRACK C — GAMING & ADVENTURE',
  category = 'TRACK C — GAMING & ADVENTURE',
  event_type = 'Tech Treasure Hunt',
  track_id = 'fbe20cf1-51e5-4f06-8c9a-6c6b813c5e1d',
  description = 'Cipher Chase is a campus treasure hunt for teams of 20–30 students. Clues may use QR codes, Morse code, binary code, and other puzzle formats. Teams must stay within their assigned area and follow the event rules.',
  registration_type = 'TEAM',
  min_team_size = 20,
  max_team_size = 30,
  fee = 200.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '74693e7b-9409-4934-a154-dc351f9ceb73';

-- 12. DEATH RACE (Track C — Gaming & Adventure / Death Race, previously VelocityX)
-- UUID: 2dfb0b0d-ffba-4cbc-993f-72aa907da3b7
-- Format: Team of 2 to 3. Fee: 200.00
UPDATE events
SET
  name = 'DEATH RACE',
  slug = 'velocityx',
  track = 'TRACK C — GAMING & ADVENTURE',
  category = 'TRACK C — GAMING & ADVENTURE',
  event_type = 'Death Race',
  track_id = 'fbe20cf1-51e5-4f06-8c9a-6c6b813c5e1d',
  description = 'Death Race is a team-based competition.',
  registration_type = 'TEAM',
  min_team_size = 2,
  max_team_size = 3,
  fee = 200.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = '2dfb0b0d-ffba-4cbc-993f-72aa907da3b7';

-- 13. HACK THE SKILLS (Track E — Workshops & Knowledge / Workshop, previously Hack the Skill)
-- UUID: f3c690be-8655-4d7f-a7e9-75d3e84a5e54
-- Format: Solo or team of 1 to 4. Fee: 300.00
UPDATE events
SET
  name = 'HACK THE SKILLS',
  slug = 'hack-the-skill',
  track = 'TRACK E — WORKSHOPS & KNOWLEDGE',
  category = 'TRACK E — WORKSHOPS & KNOWLEDGE',
  event_type = 'Workshop',
  track_id = '5e66cb62-e040-4395-b693-3b467c055bf1',
  description = 'Hack the Skills is a technical workshop open to students from Class 8 through postgraduate level. Register individually or as a team of two to four. Workshop schedule and venue details will be announced later.',
  registration_type = 'TEAM',
  min_team_size = 1,
  max_team_size = 4,
  fee = 300.00,
  currency = 'INR',
  is_active = true,
  registration_open = true,
  updated_at = NOW()
WHERE id = 'f3c690be-8655-4d7f-a7e9-75d3e84a5e54';
