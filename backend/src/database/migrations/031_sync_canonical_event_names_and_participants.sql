-- ==============================================================================
-- Migration: 031_sync_canonical_event_names_and_participants.sql
-- Description:
-- 1. Updates canonical public event names in `events` table (e.g. CIRCUIT OF MINDS)
--    while preserving competition subtitle/descriptors in `event_type`.
-- 2. Backfills any remaining registration participant institution and mobile records
--    from custom_fields.
-- ==============================================================================

-- 1. Update Canonical Event Names and Subtitles
-- Circuit of Minds (Track D)
UPDATE events
SET
  name = 'CIRCUIT OF MINDS',
  event_type = 'Tech Quiz',
  updated_at = NOW()
WHERE slug = 'circuit-of-minds';

-- ThoughtLab (Track D)
UPDATE events
SET
  name = 'THOUGHTLAB',
  event_type = 'Ideathon',
  updated_at = NOW()
WHERE slug = 'thoughtlab';

-- Unscripted Nations (Track D)
UPDATE events
SET
  name = 'UNSCRIPTED NATIONS',
  event_type = 'Model United Nations',
  updated_at = NOW()
WHERE slug = 'unscripted-nations';

-- VLookUp (Track B)
UPDATE events
SET
  name = 'VLOOKUP',
  event_type = 'Data Analytics',
  updated_at = NOW()
WHERE slug = 'vlookup';

-- VelocityX (Track C)
UPDATE events
SET
  name = 'VELOCITYX',
  event_type = 'Death Race',
  updated_at = NOW()
WHERE slug = 'velocityx';

-- Hack the Skill (Track E)
UPDATE events
SET
  name = 'HACK THE SKILL',
  event_type = 'Workshop',
  updated_at = NOW()
WHERE slug = 'hack-the-skill';

-- 2. Backfill institution_name and mobile_number from custom_fields for any unmigrated participants
UPDATE registration_participants
SET 
  institution_name = COALESCE(
    NULLIF(TRIM(institution_name), ''),
    NULLIF(TRIM(custom_fields->>'institutionName'), ''),
    NULLIF(TRIM(custom_fields->>'institution_name'), ''),
    NULLIF(TRIM(custom_fields->>'institution'), ''),
    NULLIF(TRIM(custom_fields->>'college'), ''),
    ''
  ),
  mobile_number = COALESCE(
    NULLIF(TRIM(mobile_number), ''),
    NULLIF(TRIM(custom_fields->>'mobileNumber'), ''),
    NULLIF(TRIM(custom_fields->>'mobile_number'), ''),
    NULLIF(TRIM(custom_fields->>'mobile'), ''),
    NULLIF(TRIM(custom_fields->>'phone'), ''),
    ''
  ),
  custom_fields = (custom_fields - 'institutionName' - 'mobileNumber')
WHERE 
  (institution_name IS NULL OR TRIM(institution_name) = '')
  OR (mobile_number IS NULL OR TRIM(mobile_number) = '')
  OR (custom_fields ? 'institutionName')
  OR (custom_fields ? 'mobileNumber');
