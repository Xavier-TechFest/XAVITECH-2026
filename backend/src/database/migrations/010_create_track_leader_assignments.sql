-- =============================================================================
-- Migration 010: Create track_leader_assignments table
-- Establishes explicit Track Leader -> Track relationship.
-- Enforces that a Track Leader has exactly ONE active assigned track at any time.
-- Retains audit history of reassignments.
-- =============================================================================

CREATE TABLE IF NOT EXISTS track_leader_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_leader_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a Track Leader can only have at most ONE active track assignment at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_assignment_per_leader
  ON track_leader_assignments (track_leader_user_id)
  WHERE is_active = true;

-- Indexes for performance on lookups by track or user
CREATE INDEX IF NOT EXISTS idx_tla_track_id
  ON track_leader_assignments (track_id);

CREATE INDEX IF NOT EXISTS idx_tla_leader_user_id
  ON track_leader_assignments (track_leader_user_id);
