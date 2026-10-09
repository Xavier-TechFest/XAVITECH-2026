-- Align Runtime Rush and Debug Derby fees with current registration details.

UPDATE events
SET fee = 150.00,
    updated_at = NOW()
WHERE slug = 'runtime-rush';

UPDATE events
SET fee = 150.00,
    updated_at = NOW()
WHERE slug = 'debug-derby';
