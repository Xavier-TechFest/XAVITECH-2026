import config from './env.config.js';

/**
 * Brevo (formerly Sendinblue) Configuration Placeholder
 *
 * Used for sending transactional confirmation emails, QR digital passes,
 * and registration updates.
 *
 * Future implementation:
 *   import * as brevo from '@getbrevo/brevo';
 *   const apiInstance = new brevo.TransactionalEmailsApi();
 *   apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevo.apiKey);
 */

export const getBrevoStatus = () => {
  const isConfigured = Boolean(config.brevo.apiKey);

  return {
    configured: isConfigured,
    service: 'Brevo Email Service',
    sender: config.brevo.senderEmail,
    senderName: config.brevo.senderName,
  };
};

export default {
  getBrevoStatus,
};
