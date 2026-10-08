-- ==============================================================================
-- Migration: 022_sync_event_registration_windows.sql
-- Description: Synchronize registration windows and status fields for all 13 official XAVITECH events.
-- Ensures all 13 canonical events have active registration windows so registrations are accepted.
-- ==============================================================================

UPDATE events
SET
  registration_start_at = NULL,
  registration_end_at = NULL,
  registration_open = true,
  is_active = true,
  updated_at = NOW()
WHERE id IN (
  '213a4266-b523-4317-b80e-c0120965cbe4', -- INNOCRAFT
  'abeecd1f-e07d-43e5-8970-691e6ed010b2', -- WEBWEAVE
  'b631bfc9-ac25-4958-9bb0-c908ae8967b8', -- RUNTIME RUSH
  'c83ca21b-9787-4c8d-9bb4-0a1ac7c5b793', -- DATA ANALYTICS
  '15328fe9-412b-4f0a-93fc-96ff567f6f93', -- DEBUG DERBY
  '770970ed-6e63-4bd7-b9e9-ff4874acd060', -- MODEL UNITED NATIONS
  'b5c3b61d-2b26-45d2-9ff4-92cce891b727', -- TECH QUIZ
  '218f1371-b8e6-4d59-8e90-e0a5d0f000f6', -- BATTLE OF BOTS
  'ae0bcfc2-517a-4b86-be13-88abe1ce5ea0', -- IDEATHON
  '620c5d8b-9e67-4a6c-82e3-0366c071d153', -- BATTLEFIELD BLITZ
  '74693e7b-9409-4934-a154-dc351f9ceb73', -- CIPHER CHASE
  '2dfb0b0d-ffba-4cbc-993f-72aa907da3b7', -- DEATH RACE
  'f3c690be-8655-4d7f-a7e9-75d3e84a5e54'  -- HACK THE SKILLS
);
