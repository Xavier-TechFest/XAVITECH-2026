import config from './env.config.js';

/**
 * Firebase Admin SDK Configuration Placeholder
 *
 * Used for server-side verification of Google Login Firebase ID tokens
 * received from the frontend client.
 *
 * Future implementation:
 *   import admin from 'firebase-admin';
 *   admin.initializeApp({
 *     credential: admin.credential.cert({
 *       projectId: config.firebase.projectId,
 *       clientEmail: config.firebase.clientEmail,
 *       privateKey: config.firebase.privateKey,
 *     }),
 *   });
 */

export const getFirebaseStatus = () => {
  const isConfigured = Boolean(
    config.firebase.projectId &&
    config.firebase.clientEmail &&
    config.firebase.privateKey
  );

  return {
    configured: isConfigured,
    service: 'Firebase Admin Authentication',
    projectId: config.firebase.projectId || 'Not set',
  };
};

export default {
  getFirebaseStatus,
};
