-- ==============================================================================
-- Migration: 015_make_registration_participants_fields_flexible.sql
-- Description: Makes city, student_id, standard_class, mobile_number, and email
--              flexible in registration_participants table, and adds custom_fields JSONB.
-- ==============================================================================

ALTER TABLE registration_participants 
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN student_id DROP NOT NULL,
  ALTER COLUMN standard_class DROP NOT NULL,
  ALTER COLUMN mobile_number DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE registration_participants 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
