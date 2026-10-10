-- ==============================================================================
-- Migration: 030_sync_registration_participant_institution_and_phone.sql
-- Description: Backfill institution_name and mobile_number from custom_fields 
--              for historical registration_participants records where submitted 
--              values were trapped in custom_fields due to camelCase payload.
--              Cleans up redundant keys from custom_fields.
-- ==============================================================================

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
