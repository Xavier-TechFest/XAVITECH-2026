-- Migration: 020_add_event_registration_management.sql
-- Adds capacity and registration window timestamps to the events table
-- for admin-controlled event registration lifecycle management.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_start_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS registration_end_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS capacity INTEGER NULL;

-- Ensure capacity is strictly positive if specified
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_capacity_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_capacity_check
      CHECK (capacity IS NULL OR capacity > 0);
  END IF;
END $$;

-- Ensure window consistency if both timestamps are set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_registration_window_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_registration_window_check
      CHECK (
        registration_start_at IS NULL OR 
        registration_end_at IS NULL OR 
        registration_start_at <= registration_end_at
      );
  END IF;
END $$;

-- Index registration window columns for query performance
CREATE INDEX IF NOT EXISTS idx_events_registration_window
  ON events (registration_start_at, registration_end_at);
