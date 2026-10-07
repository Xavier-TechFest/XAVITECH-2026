-- ==============================================================================
-- Migration: 017_add_profile_photo_to_participants.sql
-- Description: Adds profile_photo columns to registration_participants for Part 2
-- ==============================================================================

ALTER TABLE registration_participants
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS profile_photo_public_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS profile_photo_resource_type VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS profile_photo_mime_type VARCHAR(128) NULL;
