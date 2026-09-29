-- ==============================================================================
-- Migration: 008_create_tracks_and_update_roles.sql
-- Description: Phase 8 Part 1: Track foundation, event-to-track mapping, and final role cleanup (USER, ADMIN, TRACK_LEADER)
-- ==============================================================================

-- 1. Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance & lookup indexes for tracks
CREATE INDEX IF NOT EXISTS idx_tracks_slug ON tracks(slug);
CREATE INDEX IF NOT EXISTS idx_tracks_is_active ON tracks(is_active);

-- Trigger to maintain updated_at on tracks
DROP TRIGGER IF EXISTS trigger_tracks_updated_at ON tracks;
CREATE TRIGGER trigger_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Seed the 5 official XAVITECH 2026 tracks (Idempotent upsert)
INSERT INTO tracks (name, slug, description, is_active)
VALUES
  ('Flagship Innovation', 'flagship-innovation', 'Track A — Flagship Innovation Track', true),
  ('Coding & Development', 'coding-development', 'Track B — Coding & Development Track', true),
  ('Gaming & Adventure', 'gaming-adventure', 'Track C — Gaming & Adventure Track', true),
  ('Knowledge & Leadership', 'knowledge-leadership', 'Track D — Knowledge & Leadership Track', true),
  ('Creative Learning', 'creative-learning', 'Track E — Creative Learning Track', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. Add track_id foreign key column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS track_id UUID REFERENCES tracks(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_events_track_id ON events(track_id);

-- 4. Backfill track_id for all 13 official XAVITECH events

-- Track A — Flagship Innovation
UPDATE events 
SET track_id = (SELECT id FROM tracks WHERE slug = 'flagship-innovation') 
WHERE slug = 'innocraft';

-- Track B — Coding & Development
UPDATE events 
SET track_id = (SELECT id FROM tracks WHERE slug = 'coding-development') 
WHERE slug IN ('runtime-rush', 'debug-derby', 'vlookup', 'webweave');

-- Track C — Gaming & Adventure
UPDATE events 
SET track_id = (SELECT id FROM tracks WHERE slug = 'gaming-adventure') 
WHERE slug IN ('loot-goblins', 'velocityx', 'cipher-chase');

-- Track D — Knowledge & Leadership
UPDATE events 
SET track_id = (SELECT id FROM tracks WHERE slug = 'knowledge-leadership') 
WHERE slug IN ('unscripted-nations', 'circuit-of-minds', 'thoughtlab', 'battle-of-bots');

-- Track E — Creative Learning
UPDATE events 
SET track_id = (SELECT id FROM tracks WHERE slug = 'creative-learning') 
WHERE slug = 'hack-the-skill';

-- 5. Update users role check constraint: allow only USER, ADMIN, TRACK_LEADER
-- Drops old check_user_role constraint (which allowed VOLUNTEER) and establishes final 3 roles.
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role;
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('USER', 'ADMIN', 'TRACK_LEADER'));
