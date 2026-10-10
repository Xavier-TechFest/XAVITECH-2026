-- ==============================================================================
-- Migration: 028_update_innocraft_and_hack_the_skill_fees.sql
-- Description:
--   1. Updates InnoCraft (innocraft) authoritative base fee to ₹800.00 (School pool ₹800, College pool ₹1,000).
--   2. Updates Hack the Skill (hack-the-skill) fee to ₹200.00 per participant.
-- ==============================================================================

-- 1. InnoCraft: Base fee is ₹800.00 (School pool rate; College pool is ₹1,000.00)
UPDATE events
SET
  fee = 800.00,
  updated_at = NOW()
WHERE slug = 'innocraft';

-- 2. Hack the Skill: Authoritative fee is ₹200.00 per participant
UPDATE events
SET
  fee = 200.00,
  updated_at = NOW()
WHERE slug = 'hack-the-skill';
