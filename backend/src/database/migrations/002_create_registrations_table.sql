-- ==============================================================================
-- Migration: 002_create_registrations_table.sql
-- Description: Creates events and registrations tables for XAVITECH-2026 Phase 4
-- ==============================================================================

-- 1. Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    registration_type VARCHAR(32) NOT NULL DEFAULT 'INDIVIDUAL',
    min_team_size INTEGER NULL DEFAULT 1,
    max_team_size INTEGER NULL DEFAULT 1,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    registration_open BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_event_registration_type CHECK (registration_type IN ('INDIVIDUAL', 'TEAM')),
    CONSTRAINT check_event_fee CHECK (fee >= 0)
);

-- Performance & lookup indexes for events
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active_registration_open ON events(is_active, registration_open);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Trigger for events updated_at
DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    registration_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_registration_type CHECK (registration_type IN ('INDIVIDUAL', 'TEAM')),
    CONSTRAINT check_registration_status CHECK (status IN (
        'DRAFT',
        'PAYMENT_PENDING',
        'PAYMENT_SUCCESS',
        'CONFIRMED',
        'PAYMENT_FAILED',
        'CANCELLED'
    ))
);

-- Performance & lookup indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Trigger for registrations updated_at
DROP TRIGGER IF EXISTS trigger_registrations_updated_at ON registrations;
CREATE TRIGGER trigger_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Seed initial events for testing and festival operations
INSERT INTO events (name, slug, description, category, registration_type, min_team_size, max_team_size, fee, is_active, registration_open)
VALUES 
  (
    'Crucible — Flagship 12-Hour Hackathon',
    'crucible',
    'Crucible is Xavier University flagship hackathon where top product teams, system engineers, and developers gather for 12 intense hours.',
    'TECHNICAL & CODING',
    'TEAM',
    2,
    4,
    1499.00,
    true,
    true
  ),
  (
    'Code Sprint — Competitive Algorithmic Arena',
    'code-sprint',
    'Test your raw algorithmic speed, spatial reasoning, and data structure proficiency under rigorous time constraints.',
    'TECHNICAL & CODING',
    'INDIVIDUAL',
    1,
    1,
    899.00,
    true,
    true
  ),
  (
    'Systems Debugging Crucible',
    'debugging-crucible',
    'Hunt vulnerabilities, reverse-engineer broken legacy systems, and patch deep memory leaks under intense live pressure.',
    'TECHNICAL & CODING',
    'INDIVIDUAL',
    1,
    1,
    499.00,
    true,
    true
  ),
  (
    'Web Craft — Full-Stack Web Sprint',
    'web-craft',
    'Build production-grade, highly performant web applications evaluated on architecture, responsiveness, and UX aesthetics.',
    'TECHNICAL & CODING',
    'TEAM',
    2,
    3,
    999.00,
    true,
    true
  ),
  (
    'Closed Invitational Duel',
    'closed-duel',
    'Exclusive closed arena for invited competitive programming finalists.',
    'TECHNICAL & CODING',
    'INDIVIDUAL',
    1,
    1,
    299.00,
    true,
    false
  ),
  (
    'Archived Retro Workshop',
    'retro-workshop',
    'Archived workshop session from previous season.',
    'WORKSHOP',
    'INDIVIDUAL',
    1,
    1,
    0.00,
    false,
    false
  )
ON CONFLICT (slug) DO NOTHING;
