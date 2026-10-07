-- ==============================================================================
-- Migration: 019_create_payment_transactions.sql
-- Description: Creates payment_transactions table for Easebuzz gateway integration
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    gateway VARCHAR(32) NOT NULL DEFAULT 'EASEBUZZ',
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(16) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'INITIATED',
    gateway_reference VARCHAR(128) NULL,
    gateway_payment_mode VARCHAR(64) NULL,
    gateway_response JSONB NULL,
    failure_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_payment_status CHECK (status IN ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'))
);

-- Performance & audit lookup indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_registration_id ON payment_transactions(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_ref ON payment_transactions(gateway_reference);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER trigger_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
