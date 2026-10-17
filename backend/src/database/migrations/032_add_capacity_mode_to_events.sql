-- ==============================================================================
-- Migration: 032_add_capacity_mode_to_events.sql
-- Description: Adds capacity_mode column to events table to support:
--              1. PER_REGISTRATION (default) — each eligible registration consumes 1 slot
--              2. PER_DELEGATE — each eligible participant/delegate consumes 1 slot
--              Non-destructive, safe, backward-compatible additive migration.
-- ==============================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS capacity_mode VARCHAR(32) NOT NULL DEFAULT 'PER_REGISTRATION';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_capacity_mode_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_capacity_mode_check
      CHECK (capacity_mode IN ('PER_REGISTRATION', 'PER_DELEGATE'));
  END IF;
END $$;
