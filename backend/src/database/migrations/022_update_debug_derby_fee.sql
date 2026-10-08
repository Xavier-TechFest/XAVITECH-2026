-- Align the Debug Derby registration fee with the participant handbook.

UPDATE events
SET fee = 150.00,
    updated_at = NOW()
WHERE slug = 'debug-derby';
