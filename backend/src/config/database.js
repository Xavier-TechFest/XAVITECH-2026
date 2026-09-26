import { createClient } from '@supabase/supabase-js';
import config from './env.config.js';
import logger from '../utils/logger.util.js';

let supabaseInstance = null;

/**
 * Get or initialize the Supabase client instance.
 * Returns null gracefully if credentials are not configured yet.
 */
export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, serviceRoleKey, anonKey } = config.supabase;
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  } catch (error) {
    logger.error('Failed to initialize Supabase client:', error.message);
    return null;
  }
};

/**
 * Reusable database connection / test function.
 * Tests connectivity without throwing fatal errors or halting server boot.
 */
export const testDbConnection = async () => {
  const { url, serviceRoleKey, anonKey } = config.supabase;
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured in environment variables (SUPABASE_URL and SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY).',
    };
  }

  try {
    const client = getSupabaseClient();
    if (!client) {
      return {
        connected: false,
        message: 'Could not instantiate Supabase client.',
      };
    }

    // Ping Supabase to test connectivity
    const { error } = await client.auth.getSession();
    if (error) {
      return {
        connected: false,
        message: `Supabase connection issue: ${error.message}`,
      };
    }

    return {
      connected: true,
      message: 'PostgreSQL (Supabase) connection verified successfully.',
    };
  } catch (error) {
    return {
      connected: false,
      message: `Database connection test failed: ${error.message}`,
    };
  }
};

export const supabase = getSupabaseClient();

export default {
  supabase,
  getSupabaseClient,
  testDbConnection,
};
