import crypto from 'crypto';
import config from '../config/env.config.js';
import logger from '../utils/logger.util.js';
import { REGISTRATION_STATUS } from '../utils/constants.util.js';
import { resolvePostgresUser } from './registration.service.js';
import RegistrationModel from '../models/registration.model.js';
import RegistrationParticipantModel from '../models/registrationParticipant.model.js';
import EventModel from '../models/event.model.js';
import PaymentModel from '../models/payment.model.js';
import { generateInitiateHash, verifyResponseHash } from '../utils/easebuzz.util.js';

/**
 * Generate a unique merchant transaction reference.
 * Max 40 characters alphanumeric/hyphen.
 */
export const generateTransactionId = (registrationCode = 'XVT') => {
  const cleanCode = String(registrationCode || 'XVT').replace(/[^a-zA-Z0-9]/g, '').slice(-6);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-${cleanCode}-${timestamp}-${random}`.slice(0, 36);
};

/**
 * Calculate the exact server-side payable fee for a registration.
 * Never trust amount sent from frontend client.
 */
export const calculatePayableAmount = (event, registration, participants = []) => {
  if (!event) return 0;

  const baseFee = Number(event.fee || 0);

  // 1. Temporary Controlled Live Test Override (Debug Derby only when both live & test override flags are active)
  if (
    config.easebuzz.liveEnabled &&
    config.easebuzz.testFeeOverrideEnabled &&
    event.slug === 'debug-derby'
  ) {
    logger.info(`[TEST MODE] Applying temporary live test fee override of ₹${config.easebuzz.testFeeAmount} for Debug Derby`);
    return Number(config.easebuzz.testFeeAmount.toFixed(2));
  }

  // Resolve participant count across all calling signatures
  let resolvedCount = Array.isArray(participants) ? participants.length : 0;
  if (resolvedCount === 0 && registration) {
    if (Array.isArray(registration.participants) && registration.participants.length > 0) {
      resolvedCount = registration.participants.length;
    } else if (registration.team) {
      const memberCount = Array.isArray(registration.team.members) ? registration.team.members.length : 0;
      resolvedCount = 1 + memberCount;
    } else if (typeof registration.totalTeamSize === 'number' && registration.totalTeamSize > 0) {
      resolvedCount = registration.totalTeamSize;
    } else if (typeof registration.participantCount === 'number' && registration.participantCount > 0) {
      resolvedCount = registration.participantCount;
    } else if (typeof registration.participant_count === 'number' && registration.participant_count > 0) {
      resolvedCount = registration.participant_count;
    }
  }

  // 2. InnoCraft (Hackathon): Pool-based fee (School: 800, College: 1000)
  if (event.slug === 'innocraft') {
    const participantList = Array.isArray(participants) && participants.length > 0
      ? participants
      : (Array.isArray(registration?.participants) ? registration.participants : []);
    const leader = participantList.find((p) => p.participant_order === 1 || p.participantOrder === 1) || participantList[0];
    const pool = leader?.custom_fields?.pool ||
      (leader?.custom_fields && leader.custom_fields['Participant pool']) ||
      leader?.pool ||
      registration?.pool ||
      registration?.custom_fields?.pool ||
      (registration?.custom_fields && registration.custom_fields['Participant pool']) ||
      registration?.team?.custom_fields?.pool;
    if (pool && String(pool).toLowerCase().includes('college')) {
      return 1000.0;
    }
    return 800.0;
  }

  // 3. Loot Goblins (BGMI Esports / Battleground Blitz): ₹200 per player (4 core + optional substitute)
  if (event.slug === 'loot-goblins' || event.slug === 'battleground-blitz' || event.slug === 'battlefield-blitz') {
    const count = resolvedCount > 0 ? resolvedCount : (event.min_team_size || 4);
    const unitFee = baseFee > 0 ? baseFee : 200.0;
    return Number((unitFee * count).toFixed(2));
  }

  // 4. Runtime Rush charges ₹150 for each registered participant (1 participant = ₹150, 2 participants = ₹300).
  if (event.slug === 'runtime-rush') {
    const count = resolvedCount > 0 ? resolvedCount : 1;
    const unitFee = baseFee > 0 && baseFee <= 150 ? baseFee : 150.0;
    return Number((unitFee * count).toFixed(2));
  }

  // 5. Model United Nations (MUN / Unscripted Nations): ₹500 per delegate (Individual: ₹500, Team of 2: ₹1,000)
  if (event.slug === 'unscripted-nations' || event.slug === 'model-united-nations' || event.slug === 'mun') {
    const isTeam =
      registration?.registration_type === 'TEAM' ||
      registration?.registrationType === 'TEAM' ||
      (resolvedCount && resolvedCount > 1);
    const count = isTeam ? (resolvedCount > 0 ? resolvedCount : 2) : 1;
    const unitFee = 500.0;
    return Number((unitFee * count).toFixed(2));
  }

  // 6. VelocityX (Death Race): ₹700 per team
  if (event.slug === 'velocityx' || event.slug === 'death-race') {
    const fee = baseFee > 0 ? baseFee : 700.0;
    return Number(fee.toFixed(2));
  }

  // 7. Cipher Chase: ₹400 per team
  if (event.slug === 'cipher-chase') {
    const fee = baseFee > 0 ? baseFee : 400.0;
    return Number(fee.toFixed(2));
  }

  // 8. Debug Derby: ₹150 per participant
  if (event.slug === 'debug-derby') {
    const fee = baseFee > 0 ? baseFee : 150.0;
    return Number(fee.toFixed(2));
  }

  // 9. Hack the Skill: ₹200 per participant
  if (event.slug === 'hack-the-skill' || event.slug === 'hack-the-skills') {
    const count = resolvedCount > 0 ? resolvedCount : 1;
    const unitFee = baseFee > 0 ? baseFee : 200.0;
    return Number((unitFee * count).toFixed(2));
  }

  // 10. All other events have standard flat team or individual fee configured in DB
  return Number(baseFee.toFixed(2));
};

/**
 * Payment Service
 * Encapsulates Easebuzz order generation, hash calculation,
 * server-side amount verification, webhook / callback handling, and status synchronization.
 */
export const paymentService = {
  /**
   * Initiate payment for an authenticated user's registration.
   */
  initiatePayment: async (firebaseUser, registrationIdentifier) => {
    const user = await resolvePostgresUser(firebaseUser);

    if (!registrationIdentifier || typeof registrationIdentifier !== 'string') {
      const error = new Error('Registration ID is required to initiate payment');
      error.statusCode = 400;
      throw error;
    }

    const cleanId = registrationIdentifier.trim();

    // 1. Fetch registration
    let registration = await RegistrationModel.getRegistrationByRegistrationId(cleanId);
    if (!registration) {
      registration = await RegistrationModel.getRegistrationById(cleanId);
    }

    if (!registration) {
      const error = new Error('Registration not found with the provided identifier');
      error.statusCode = 404;
      throw error;
    }

    // 2. Strict ownership check
    if (registration.user_id !== user.id && user.role !== 'ADMIN') {
      logger.warn(
        `Unauthorized payment initiation attempt: User ${user.id} (${user.email}) attempted payment on registration ${cleanId} owned by ${registration.user_id}`
      );
      const error = new Error('Access denied. You do not have permission to pay for this registration.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Status eligibility checks
    if (registration.status === REGISTRATION_STATUS.CONFIRMED || registration.status === REGISTRATION_STATUS.PAYMENT_SUCCESS) {
      const error = new Error('This registration is already confirmed and paid.');
      error.statusCode = 400;
      throw error;
    }

    if (registration.status === REGISTRATION_STATUS.CANCELLED) {
      const error = new Error('This registration has been cancelled and cannot be paid.');
      error.statusCode = 400;
      throw error;
    }

    if (registration.status !== REGISTRATION_STATUS.PAYMENT_PENDING) {
      const error = new Error(
        `Registration is currently in ${registration.status} status. Only registrations in PAYMENT_PENDING status can proceed to checkout.`
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Fetch Event & Participants for Server-Side Fee Calculation
    const event = await EventModel.getEventById(registration.event_id);
    if (!event || !event.is_active || !event.registration_open) {
      const error = new Error('This event is no longer active or registration is currently closed.');
      error.statusCode = 400;
      throw error;
    }

    if (event.registration_end_at && new Date() > new Date(event.registration_end_at)) {
      const error = new Error('Registration window for this event has closed.');
      error.statusCode = 400;
      throw error;
    }

    const participants = await RegistrationParticipantModel.getParticipantsByRegistrationId(registration.id);
    const payableAmount = calculatePayableAmount(event, registration, participants);

    // Guard: Zero or unconfirmed (TBA) registration fee cannot initiate payment
    if (!payableAmount || payableAmount <= 0) {
      const error = new Error('Cannot initiate payment for an event with zero or unconfirmed (TBA) registration fee.');
      error.statusCode = 400;
      throw error;
    }

    // 5. LIVE Payment Feature Flag & Event Restrictions
    const isLive = config.easebuzz.liveEnabled;
    const testSlug = config.easebuzz.liveTestEventSlug;

    if (isLive) {
      if (testSlug && event.slug !== testSlug) {
        const error = new Error(
          `Online payment is currently restricted for testing. Event "${event.slug}" is not enabled for live payments.`
        );
        error.statusCode = 403;
        throw error;
      }

      if (!config.easebuzz.isConfigured) {
        const error = new Error('Easebuzz payment gateway credentials are not configured on the server.');
        error.statusCode = 503;
        throw error;
      }
    }

    // 6. Generate Unique Transaction Reference
    const transactionId = generateTransactionId(registration.registration_id);

    // 7. Persist payment transaction record in database
    await PaymentModel.createTransaction({
      registration_id: registration.id,
      transaction_id: transactionId,
      amount: payableAmount,
      currency: 'INR',
      gateway: 'EASEBUZZ',
      status: 'INITIATED',
    });

    const primaryParticipant = participants.find((p) => p.participant_order === 1) || participants[0] || {};
    const customerName = (primaryParticipant.full_name || user.name || 'Participant').trim().replace(/[^a-zA-Z\s]/g, '') || 'Participant';
    const customerEmail = (primaryParticipant.email || user.email || '').trim();
    const customerPhone = (primaryParticipant.mobile_number || user.phone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';

    // 8. If LIVE payment is enabled, dispatch initiateLink to Easebuzz API
    if (isLive && config.easebuzz.isConfigured) {
      const formattedAmount = payableAmount.toFixed(2);
      const productInfo = `XAVITECH 2026 - ${event.name}`.slice(0, 100);
      const returnUrl = config.easebuzz.callbackUrl || `${config.serverUrl}/api/payments/callback`;

      logger.info(`Initiating live Easebuzz checkout: txnid=${transactionId}, amount=₹${formattedAmount}, returnUrl=${returnUrl}`);

      const hash = generateInitiateHash({
        key: config.easebuzz.key,
        txnid: transactionId,
        amount: formattedAmount,
        productinfo: productInfo,
        firstname: customerName,
        email: customerEmail,
        udf1: registration.registration_id,
        udf2: event.slug,
        udf3: user.id,
        udf4: '',
        udf5: '',
        salt: config.easebuzz.salt,
      });

      const params = new URLSearchParams();
      params.append('key', config.easebuzz.key);
      params.append('txnid', transactionId);
      params.append('amount', formattedAmount);
      params.append('productinfo', productInfo);
      params.append('firstname', customerName);
      params.append('email', customerEmail);
      params.append('phone', customerPhone);
      params.append('surl', returnUrl);
      params.append('furl', returnUrl);
      params.append('hash', hash);
      params.append('udf1', registration.registration_id);
      params.append('udf2', event.slug);
      params.append('udf3', user.id);

      if (config.easebuzz.subMerchantId) {
        params.append('sub_merchant_id', config.easebuzz.subMerchantId);
      }

      try {
        const easebuzzResponse = await fetch(`${config.easebuzz.baseUrl}/payment/initiateLink`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: params.toString(),
        });

        const easebuzzData = await easebuzzResponse.json();

        if (easebuzzData && easebuzzData.status === 1 && easebuzzData.data) {
          const accessKey = easebuzzData.data;
          const paymentUrl = `${config.easebuzz.baseUrl}/pay/${accessKey}`;

          await PaymentModel.updateTransactionStatus(transactionId, {
            status: 'PENDING',
            gateway_reference: accessKey,
          });

          return {
            transactionId,
            registrationId: registration.registration_id,
            amount: payableAmount,
            currency: 'INR',
            accessKey,
            paymentUrl,
            liveMode: true,
            event: {
              name: event.name,
              slug: event.slug,
            },
          };
        } else {
          const failureReason = easebuzzData?.error_desc || easebuzzData?.data || 'Failed to initiate gateway checkout link';
          logger.error(`Easebuzz initiation failed: ${failureReason}`, easebuzzData);

          await PaymentModel.updateTransactionStatus(transactionId, {
            status: 'FAILED',
            failure_reason: failureReason,
            gateway_response: easebuzzData,
          });

          const error = new Error(`Payment gateway returned error: ${failureReason}`);
          error.statusCode = 502;
          throw error;
        }
      } catch (gatewayErr) {
        if (gatewayErr.statusCode) throw gatewayErr;
        logger.error('Error connecting to Easebuzz gateway:', gatewayErr);
        const error = new Error('Unable to connect to payment gateway service. Please try again.');
        error.statusCode = 502;
        throw error;
      }
    }

    // 9. Non-live / Integration Mode (Simulated checkout for non-live testing)
    const mockAccessKey = `mock_ebz_${transactionId}`;
    await PaymentModel.updateTransactionStatus(transactionId, {
      status: 'PENDING',
      gateway_reference: mockAccessKey,
    });

    return {
      transactionId,
      registrationId: registration.registration_id,
      amount: payableAmount,
      currency: 'INR',
      accessKey: mockAccessKey,
      paymentUrl: `/payment/checkout?txnid=${transactionId}`,
      liveMode: false,
      event: {
        name: event.name,
        slug: event.slug,
      },
    };
  },

  /**
   * Process Easebuzz callback or webhook payload.
   * Performs reverse hash verification, amount check, and idempotent registration update.
   */
  processCallback: async (payload) => {
    if (!payload || typeof payload !== 'object') {
      const error = new Error('Invalid payment callback payload');
      error.statusCode = 400;
      throw error;
    }

    const txnid = (payload.txnid || '').trim();
    if (!txnid) {
      const error = new Error('Missing transaction reference (txnid) in callback');
      error.statusCode = 400;
      throw error;
    }

    // 1. Look up payment transaction
    const transaction = await PaymentModel.findByTransactionId(txnid);
    if (!transaction) {
      const error = new Error(`Payment transaction not found for txnid: ${txnid}`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Idempotency Check: If transaction is already successful, do not duplicate actions
    if (transaction.status === 'SUCCESS') {
      logger.info(`Transaction ${txnid} already processed successfully (Idempotent callback).`);
      return {
        alreadyProcessed: true,
        status: 'SUCCESS',
        transactionId: txnid,
        registrationId: transaction.registration?.registration_id,
      };
    }

    // 3. Cryptographic Signature Verification
    if (config.easebuzz.isConfigured) {
      const isValidSignature = verifyResponseHash(payload, config.easebuzz.salt);
      if (!isValidSignature) {
        logger.error(`Tampered callback or invalid reverse hash for txnid: ${txnid}`);
        await PaymentModel.updateTransactionStatus(txnid, {
          status: 'FAILED',
          failure_reason: 'Tampered response / Invalid gateway reverse hash',
          gateway_response: payload,
        });

        const error = new Error('Payment response signature verification failed');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Server-Side Amount Verification (prevent tampered payment amounts)
    const paidAmount = Number(payload.amount || 0);
    const expectedAmount = Number(transaction.amount || 0);
    if (Math.abs(paidAmount - expectedAmount) > 0.05) {
      logger.error(`Payment amount mismatch for txnid: ${txnid}. Expected: ${expectedAmount}, Received: ${paidAmount}`);
      await PaymentModel.updateTransactionStatus(txnid, {
        status: 'FAILED',
        failure_reason: `Amount mismatch: Expected ₹${expectedAmount}, received ₹${paidAmount}`,
        gateway_response: payload,
      });

      const error = new Error('Payment amount mismatch detected');
      error.statusCode = 400;
      throw error;
    }

    // 5. Evaluate Gateway Payment Status
    const rawStatus = String(payload.status || '').toLowerCase();
    const easepayid = payload.easepayid || null;
    const mode = payload.mode || null;

    if (rawStatus === 'success') {
      // Payment Successful
      await PaymentModel.updateTransactionStatus(txnid, {
        status: 'SUCCESS',
        gateway_reference: easepayid,
        gateway_payment_mode: mode,
        gateway_response: payload,
      });

      // Update registration to CONFIRMED
      await RegistrationModel.updateRegistrationStatus(
        transaction.registration_id,
        REGISTRATION_STATUS.CONFIRMED
      );

      logger.info(
        `✅ Payment SUCCESS for transaction ${txnid} (Registration: ${transaction.registration_id}, EasepayID: ${easepayid})`
      );

      return {
        success: true,
        status: 'SUCCESS',
        transactionId: txnid,
        gatewayReference: easepayid,
        registrationId: transaction.registration?.registration_id,
      };
    } else if (rawStatus === 'usercancelled') {
      // User cancelled at checkout
      await PaymentModel.updateTransactionStatus(txnid, {
        status: 'CANCELLED',
        gateway_reference: easepayid,
        gateway_payment_mode: mode,
        failure_reason: 'Payment cancelled by user',
        gateway_response: payload,
      });

      logger.warn(`Payment CANCELLED by user for transaction ${txnid}`);

      return {
        success: false,
        status: 'CANCELLED',
        transactionId: txnid,
        registrationId: transaction.registration?.registration_id,
      };
    } else {
      // Payment Failed
      const failureReason = payload.error_Message || payload.error_desc || 'Payment failed at gateway';
      await PaymentModel.updateTransactionStatus(txnid, {
        status: 'FAILED',
        gateway_reference: easepayid,
        gateway_payment_mode: mode,
        failure_reason: failureReason,
        gateway_response: payload,
      });

      logger.warn(`Payment FAILED for transaction ${txnid}: ${failureReason}`);

      return {
        success: false,
        status: 'FAILED',
        failureReason,
        transactionId: txnid,
        registrationId: transaction.registration?.registration_id,
      };
    }
  },

  /**
   * Fetch payment status by transaction ID with ownership verification.
   */
  getPaymentStatus: async (firebaseUser, transactionId) => {
    const user = await resolvePostgresUser(firebaseUser);

    if (!transactionId || typeof transactionId !== 'string') {
      const error = new Error('Transaction ID is required');
      error.statusCode = 400;
      throw error;
    }

    const transaction = await PaymentModel.findByTransactionId(transactionId.trim());
    if (!transaction) {
      const error = new Error('Payment transaction not found');
      error.statusCode = 404;
      throw error;
    }

    // Ownership check: User must own the associated registration (or be Admin)
    if (transaction.registration?.user_id !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied. You do not have permission to view this payment.');
      error.statusCode = 403;
      throw error;
    }

    return {
      transactionId: transaction.transaction_id,
      registrationId: transaction.registration?.registration_id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      gatewayReference: transaction.gateway_reference,
      paymentMode: transaction.gateway_payment_mode,
      failureReason: transaction.failure_reason,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      registrationStatus: transaction.registration?.status,
    };
  },
};

export default paymentService;
