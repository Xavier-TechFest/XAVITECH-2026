-- ==============================================================================
-- Migration: 016_update_debug_derby_registration_mode.sql
-- Description: Update Debug Derby (debug-derby) to INDIVIDUAL registration mode
-- Source of Truth: frontend/lib/eventsData.ts (Individual, min=1, max=1, fee=200)
-- ==============================================================================

UPDATE events
SET 
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 200.00,
  updated_at = NOW()
WHERE slug = 'debug-derby';
