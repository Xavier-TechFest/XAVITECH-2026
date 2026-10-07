import { getSupabaseClient } from '../config/database.js';

/**
 * Payment Model / Data Access Layer
 * Manages PostgreSQL / Supabase records in the `payment_transactions` table.
 */
export const PaymentModel = {
  tableName: 'payment_transactions',

  /**
   * Create a new payment transaction record.
   */
  createTransaction: async ({
    registration_id,
    transaction_id,
    amount,
    currency = 'INR',
    gateway = 'EASEBUZZ',
    status = 'INITIATED',
    gateway_reference = null,
    gateway_response = null,
  }) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('payment_transactions')
      .insert({
        registration_id,
        transaction_id,
        amount,
        currency,
        gateway,
        status,
        gateway_reference,
        gateway_response,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find a transaction by its merchant transaction ID (txnid).
   */
  findByTransactionId: async (transactionId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('payment_transactions')
      .select(`
        *,
        registration:registrations (
          id,
          registration_id,
          user_id,
          event_id,
          registration_type,
          status,
          user:users (id, name, email, phone),
          event:events (id, name, slug, fee, registration_type)
        )
      `)
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Find all transactions for a given registration UUID.
   */
  findByRegistrationId: async (registrationId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('payment_transactions')
      .select('*')
      .eq('registration_id', registrationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Find the latest transaction for a registration UUID.
   */
  findLatestByRegistrationId: async (registrationId) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const { data, error } = await client
      .from('payment_transactions')
      .select('*')
      .eq('registration_id', registrationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Update transaction status and metadata.
   */
  updateTransactionStatus: async (
    transactionId,
    {
      status,
      gateway_reference = null,
      gateway_payment_mode = null,
      gateway_response = null,
      failure_reason = null,
    }
  ) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database client is not available');
    }

    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (gateway_reference !== undefined && gateway_reference !== null) {
      updatePayload.gateway_reference = gateway_reference;
    }
    if (gateway_payment_mode !== undefined && gateway_payment_mode !== null) {
      updatePayload.gateway_payment_mode = gateway_payment_mode;
    }
    if (gateway_response !== undefined && gateway_response !== null) {
      updatePayload.gateway_response = gateway_response;
    }
    if (failure_reason !== undefined && failure_reason !== null) {
      updatePayload.failure_reason = failure_reason;
    }

    const { data, error } = await client
      .from('payment_transactions')
      .update(updatePayload)
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

export default PaymentModel;
