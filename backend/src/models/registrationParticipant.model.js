import { getSupabaseClient } from '../config/database.js';

/**
 * Registration Participant Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase operations for the `registration_participants` table.
 */
export const RegistrationParticipantModel = {
  tableName: 'registration_participants',

  /**
   * Bulk insert participant records for a registration.
   *
   * @param {Array<Object>} participants
   * @returns {Promise<Array<Object>>}
   */
  createParticipants: async (participants) => {
    if (!Array.isArray(participants) || participants.length === 0) {
      return [];
    }

    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registration_participants')
      .insert(participants)
      .select();

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Fetch all participants belonging to a specific registration ID.
   *
   * @param {string} registrationId - Registration UUID
   * @returns {Promise<Array<Object>>}
   */
  getParticipantsByRegistrationId: async (registrationId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('registration_participants')
      .select('*')
      .eq('registration_id', registrationId)
      .order('participant_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Delete all participant records for a registration.
   *
   * @param {string} registrationId - Registration UUID
   * @returns {Promise<boolean>}
   */
  deleteParticipantsByRegistrationId: async (registrationId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { error } = await client
      .from('registration_participants')
      .delete()
      .eq('registration_id', registrationId);

    if (error) {
      throw error;
    }

    return true;
  },
};

export default RegistrationParticipantModel;
