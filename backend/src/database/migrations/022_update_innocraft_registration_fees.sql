-- Update InnoCraft's base fee to the revised school-pool rate.
-- College-pool payments are calculated as ₹800 in payment.service.js.
UPDATE events
SET
  fee = 600.00,
  description = 'InnoCraft is a team hackathon for school and college participants. Teams of exactly four register together through one team leader, select a school or college pool, and build a prototype during the event.',
  updated_at = NOW()
WHERE slug = 'innocraft';
