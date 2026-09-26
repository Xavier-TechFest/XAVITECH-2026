/**
 * Payment Model / Query Definitions Placeholder
 *
 * Target PostgreSQL / Supabase table: `payments`
 * Schema fields:
 * - id (UUID, PK)
 * - registration_id (UUID, FK -> registrations.id)
 * - order_id (VARCHAR, UNIQUE)
 * - payment_id (VARCHAR, NULLABLE)
 * - signature (VARCHAR, NULLABLE)
 * - amount (NUMERIC)
 * - currency (VARCHAR, DEFAULT 'INR')
 * - status (VARCHAR: 'INITIATED' | 'SUCCESS' | 'FAILED')
 * - gateway_payload (JSONB, NULLABLE)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 */

export const PaymentModel = {
  tableName: 'payments',

  createOrder: async (orderData) => {
    // Placeholder query
    return { id: 'placeholder-payment-id', ...orderData };
  },

  findByOrderId: async (orderId) => {
    // Placeholder query
    return null;
  },

  updateStatus: async (orderId, status, details = {}) => {
    // Placeholder query
    return { orderId, status, ...details };
  },
};

export default PaymentModel;
