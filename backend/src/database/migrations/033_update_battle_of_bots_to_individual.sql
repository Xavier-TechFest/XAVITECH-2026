-- ==============================================================================
-- Migration: 033_update_battle_of_bots_to_individual.sql
-- Description: Convert Battle of Bots (battle-of-bots) to INDIVIDUAL event at ₹150.00
-- Source of Truth: XAVITECH 2026 Official Event Configuration
-- ==============================================================================

UPDATE events
SET 
  registration_type = 'INDIVIDUAL',
  min_team_size = 1,
  max_team_size = 1,
  fee = 150.00,
  description = 'Battle of Bots is an AI prompt battle for individual participants. Event rules will be shared by the organizers.',
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE slug = 'battle-of-bots';
