/**
 * Check-in Model / Query Definitions Placeholder
 *
 * Target PostgreSQL / Supabase table: `checkins`
 * Schema fields:
 * - id (UUID, PK)
 * - registration_id (UUID, FK -> registrations.id)
 * - event_id (UUID, FK -> events.id)
 * - scanned_by (UUID, FK -> users.id, e.g. admin or volunteer)
 * - scanned_at (TIMESTAMP)
 * - status (VARCHAR: 'CHECKED_IN' | 'DENIED')
 * - notes (TEXT, NULLABLE)
 */

export const CheckInModel = {
  tableName: 'checkins',

  recordCheckIn: async (checkInData) => {
    // Placeholder query
    return { id: 'placeholder-checkin-id', ...checkInData };
  },

  findByRegistrationId: async (registrationId) => {
    // Placeholder query
    return null;
  },
};

export default CheckInModel;
