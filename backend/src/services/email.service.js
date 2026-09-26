import logger from '../utils/logger.util.js';

/**
 * Brevo Email Service Placeholder
 *
 * Dispatches transactional emails including:
 * - Registration confirmation
 * - QR code / digital pass delivery
 * - Payment receipts
 * - Important event updates
 */

export const emailService = {
  sendConfirmationEmail: async ({ toEmail, recipientName, eventTitle, registrationCode, qrAttachment }) => {
    logger.info(`[Placeholder] Sending confirmation email via Brevo to ${toEmail}`);
    return {
      messageId: 'brevo_placeholder_msg_id',
      sent: true,
    };
  },

  sendPaymentFailureEmail: async ({ toEmail, recipientName, eventTitle }) => {
    logger.info(`[Placeholder] Sending payment failure notice to ${toEmail}`);
    return {
      messageId: 'brevo_placeholder_msg_id',
      sent: true,
    };
  },
};

export default emailService;
