import { getSupabaseClient } from '../config/database.js';

/**
 * User Model / Data Access Layer
 * Encapsulates all PostgreSQL / Supabase queries for the `users` table.
 */
export const UserModel = {
  tableName: 'users',

  /**
   * Find user by Firebase UID
   */
  findByFirebaseUid: async (firebaseUid) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Find user by email address
   */
  findByEmail: async (email) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Find user by database UUID
   */
  findById: async (id) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Create a new user record
   */
  create: async (userData) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Update an existing user by Firebase UID
   */
  updateByFirebaseUid: async (firebaseUid, updateData) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update(updateData)
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Update an existing user by database ID
   */
  update: async (id, updateData) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Deactivate a user account
   */
  deactivate: async (firebaseUid) => {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update({ is_active: false })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },
};

export default UserModel;
