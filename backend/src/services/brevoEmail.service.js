import config from '../config/env.config.js';
import logger from '../utils/logger.util.js';

/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Handles transactional welcome and credential reset emails for Track Leaders.
 */

// Transport hook allowing tests to mock/stub Brevo delivery deterministically
let customTransport = null;

export const setMockEmailTransport = (transportFn) => {
  customTransport = transportFn;
};

export const restoreEmailTransport = () => {
  customTransport = null;
};

/**
 * Get centralized email configuration from application environment.
 */
export const getEmailConfig = () => {
  const apiKey = config.brevo.apiKey || process.env.BREVO_API_KEY || '';
  const senderEmail =
    config.brevo.senderEmail || process.env.BREVO_SENDER_EMAIL || 'noreply@xavitech2026.com';
  const senderName =
    config.brevo.senderName || process.env.BREVO_SENDER_NAME || 'XAVITECH 2026';
  const rawFrontendUrl =
    config.brevo.frontendUrl ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:3000';
  const frontendUrl = rawFrontendUrl.replace(/\/$/, '');
  const sendEnabled =
    process.env.EMAIL_SEND_ENABLED === 'true' ||
    (config.env === 'production' && Boolean(apiKey));

  return {
    apiKey,
    senderEmail,
    senderName,
    frontendUrl,
    sendEnabled,
    isConfigured: Boolean(apiKey),
  };
};

/**
 * Internal email dispatch function calling Brevo REST API v3 or active mock transport.
 *
 * @param {Object} payload
 * @returns {Promise<{ success: boolean, emailSent: boolean, messageId?: string, error?: string }>}
 */
const sendTransactionalEmail = async ({ toEmail, toName, subject, htmlContent, textContent }) => {
  const emailConfig = getEmailConfig();

  // If a mock transport is registered (e.g. during automated tests), invoke it
  if (customTransport) {
    try {
      const mockResult = await customTransport({
        sender: { name: emailConfig.senderName, email: emailConfig.senderEmail },
        to: [{ email: toEmail, name: toName || toEmail }],
        subject,
        htmlContent,
        textContent,
      });

      if (mockResult && mockResult.success === false) {
        logger.warn(`[MockEmail] Track Leader credential email delivery failed for ${toEmail}`);
        return {
          success: false,
          emailSent: false,
          error: mockResult.error || 'EMAIL_DELIVERY_FAILED',
        };
      }

      logger.info(`[MockEmail] Track Leader credential email sent to ${toEmail}`);
      return {
        success: true,
        emailSent: true,
        messageId: mockResult?.messageId || 'mock_msg_' + Date.now(),
      };
    } catch (mockErr) {
      logger.error(`[MockEmail] Error in mock email transport: ${mockErr.message}`);
      return {
        success: false,
        emailSent: false,
        error: mockErr.message,
      };
    }
  }

  // If Brevo API key is not configured or sending is disabled in development
  if (!emailConfig.isConfigured || !emailConfig.sendEnabled) {
    logger.warn(
      `[Brevo] Email dispatch skipped (BREVO_API_KEY not configured or EMAIL_SEND_ENABLED false) for ${toEmail}`
    );
    return {
      success: false,
      emailSent: false,
      error: 'BREVO_NOT_CONFIGURED',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': emailConfig.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: emailConfig.senderName,
          email: emailConfig.senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail,
          },
        ],
        subject,
        htmlContent,
        textContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok || response.status === 201 || response.status === 200) {
      logger.info(
        `Track Leader credential email sent to ${toEmail} (MessageId: ${data.messageId || 'unknown'})`
      );
      return {
        success: true,
        emailSent: true,
        messageId: data.messageId,
      };
    }

    logger.error(
      `Track Leader credential email failed for ${toEmail}: status ${response.status} - ${data.message || 'Unknown Brevo API error'}`
    );
    return {
      success: false,
      emailSent: false,
      error: data.message || 'Brevo API rejected email',
    };
  } catch (netErr) {
    logger.error(`Track Leader credential email network error for ${toEmail}: ${netErr.message}`);
    return {
      success: false,
      emailSent: false,
      error: netErr.message || 'Network error communicating with Brevo',
    };
  }
};

/**
 * Brevo Email Service
 */
export const brevoEmailService = {
  getEmailConfig,
  setMockEmailTransport,
  restoreEmailTransport,

  /**
   * Send Welcome & Initial Credential Email to a newly created Track Leader.
   *
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.trackName
   * @param {string} params.temporaryPassword
   * @param {string} [params.loginUrl]
   * @returns {Promise<{ success: boolean, emailSent: boolean, messageId?: string, error?: string }>}
   */
  sendTrackLeaderWelcomeEmail: async ({
    name,
    email,
    trackName,
    temporaryPassword,
    loginUrl,
  }) => {
    const emailConfig = getEmailConfig();
    const finalLoginUrl = loginUrl || `${emailConfig.frontendUrl}/track-leader/login`;
    const leaderName = name || 'Track Leader';
    const assignedTrack = trackName || 'Official Track';

    const subject = 'Welcome to XAVITECH 2026 — Track Leader Access';

    // Plaintext fallback
    const textContent = `Hello ${leaderName},

You have been added as a Track Leader for XAVITECH 2026.

Assigned Track:
${assignedTrack}

Login Email:
${email}

Temporary Password:
${temporaryPassword}

Login:
${finalLoginUrl}

Important:
Please log in using these credentials and change your password after your first login.

Regards,
XAVITECH 2026 Team`;

    // Responsive HTML version
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #080b11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 30px auto; background-color: #0e131f; border: 1px solid #1e2638; border-radius: 16px; overflow: hidden; }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid #1e2638; text-align: left; }
    .brand { font-family: monospace, Courier, monospace; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 1px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: bold; color: #35e0c9; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .card { background-color: #131929; border: 1px solid #232d42; border-radius: 12px; padding: 20px; margin: 24px 0; font-family: monospace; }
    .row { margin-bottom: 12px; }
    .row:last-child { margin-bottom: 0; }
    .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 4px; }
    .value { font-size: 14px; color: #ffffff; font-weight: bold; }
    .password-value { font-size: 16px; color: #35e0c9; letter-spacing: 1px; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background-color: #35e0c9; color: #080b11; font-family: monospace; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .notice { background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #fbbf24; margin-top: 24px; }
    .footer { padding: 24px 32px; border-top: 1px solid #1e2638; font-size: 11px; color: #64748b; font-family: monospace; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">XAVITECH 2026</div>
      <div class="badge">Track Leader Access</div>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 0;">Hello ${leaderName},</p>
      <p>You have been assigned as an official Track Leader for <strong>XAVITECH 2026</strong>. Please find your login credentials and assignment below.</p>
      
      <div class="card">
        <div class="row">
          <span class="label">Assigned Track</span>
          <span class="value" style="color: #35e0c9;">${assignedTrack}</span>
        </div>
        <div class="row">
          <span class="label">Login Email</span>
          <span class="value">${email}</span>
        </div>
        <div class="row">
          <span class="label">Temporary Password</span>
          <span class="value password-value">${temporaryPassword}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${finalLoginUrl}" class="btn" target="_blank">Login to Track Leader Portal</a>
      </div>

      <div class="notice">
        <strong>Security Notice:</strong> This is a one-time temporary password. You will be prompted to update your password immediately after your first login.
      </div>
    </div>
    <div class="footer">
      XAVITECH 2026 Technical Operations Team &bull; Do not reply directly to this automated email.
    </div>
  </div>
</body>
</html>`;

    return sendTransactionalEmail({
      toEmail: email,
      toName: leaderName,
      subject,
      htmlContent,
      textContent,
    });
  },

  /**
   * Send Credential Reset Email with a newly generated temporary password.
   *
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.trackName
   * @param {string} params.temporaryPassword
   * @param {string} [params.loginUrl]
   * @returns {Promise<{ success: boolean, emailSent: boolean, messageId?: string, error?: string }>}
   */
  sendTrackLeaderCredentialResetEmail: async ({
    name,
    email,
    trackName,
    temporaryPassword,
    loginUrl,
  }) => {
    const emailConfig = getEmailConfig();
    const finalLoginUrl = loginUrl || `${emailConfig.frontendUrl}/track-leader/login`;
    const leaderName = name || 'Track Leader';
    const assignedTrack = trackName || 'Official Track';

    const subject = 'XAVITECH 2026 — Your Track Leader Credentials Have Been Reset';

    // Plaintext fallback
    const textContent = `Hello ${leaderName},

Your Track Leader credentials for XAVITECH 2026 have been reset by an administrator.

Assigned Track:
${assignedTrack}

Login Email:
${email}

New Temporary Password:
${temporaryPassword}

Login:
${finalLoginUrl}

Important:
Please log in using these new credentials and update your password immediately. All previous active sessions have been revoked.

Regards,
XAVITECH 2026 Team`;

    // Responsive HTML version
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #080b11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 30px auto; background-color: #0e131f; border: 1px solid #1e2638; border-radius: 16px; overflow: hidden; }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid #1e2638; text-align: left; }
    .brand { font-family: monospace, Courier, monospace; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 1px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: bold; color: #fbbf24; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .card { background-color: #131929; border: 1px solid #232d42; border-radius: 12px; padding: 20px; margin: 24px 0; font-family: monospace; }
    .row { margin-bottom: 12px; }
    .row:last-child { margin-bottom: 0; }
    .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 4px; }
    .value { font-size: 14px; color: #ffffff; font-weight: bold; }
    .password-value { font-size: 16px; color: #fbbf24; letter-spacing: 1px; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background-color: #35e0c9; color: #080b11; font-family: monospace; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .notice { background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #fbbf24; margin-top: 24px; }
    .footer { padding: 24px 32px; border-top: 1px solid #1e2638; font-size: 11px; color: #64748b; font-family: monospace; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">XAVITECH 2026</div>
      <div class="badge">Credentials Reset</div>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 0;">Hello ${leaderName},</p>
      <p>An administrator has reset your Track Leader credentials for <strong>XAVITECH 2026</strong>. All previously active sessions have been invalidated.</p>
      
      <div class="card">
        <div class="row">
          <span class="label">Assigned Track</span>
          <span class="value" style="color: #35e0c9;">${assignedTrack}</span>
        </div>
        <div class="row">
          <span class="label">Login Email</span>
          <span class="value">${email}</span>
        </div>
        <div class="row">
          <span class="label">New Temporary Password</span>
          <span class="value password-value">${temporaryPassword}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${finalLoginUrl}" class="btn" target="_blank">Login with New Password</a>
      </div>

      <div class="notice">
        <strong>Important:</strong> Please log in and choose a new password. If you did not request this reset, contact the festival administrator immediately.
      </div>
    </div>
    <div class="footer">
      XAVITECH 2026 Technical Operations Team &bull; Do not reply directly to this automated email.
    </div>
  </div>
</body>
</html>`;

    return sendTransactionalEmail({
      toEmail: email,
      toName: leaderName,
      subject,
      htmlContent,
      textContent,
    });
  },
};

export default brevoEmailService;
