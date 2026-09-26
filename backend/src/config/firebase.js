import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import config from './env.config.js';
import logger from '../utils/logger.util.js';

let firebaseApp = null;
let firebaseAuth = null;

/**
 * Initializes the Firebase Admin SDK using credentials from environment variables.
 * Ensures singleton initialization.
 */
export const initializeFirebase = () => {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, initialized: true };
  }

  const { projectId, clientEmail, privateKey } = config.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    return {
      app: null,
      auth: null,
      initialized: false,
      message: 'Firebase credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not fully configured in environment variables.',
    };
  }

  try {
    firebaseApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    firebaseAuth = getAuth(firebaseApp);
    logger.info(`✅ Firebase Admin initialized successfully for project: ${projectId}`);
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      initialized: true,
      message: `Firebase Admin initialized successfully for project: ${projectId}`,
    };
  } catch (error) {
    logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return {
      app: null,
      auth: null,
      initialized: false,
      message: `Firebase Admin initialization error: ${error.message}`,
    };
  }
};

/**
 * Get or initialize the Firebase Auth instance.
 */
export const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    const { auth } = initializeFirebase();
    return auth;
  }
  return firebaseAuth;
};

/**
 * Returns configuration & initialization status of Firebase Admin.
 */
export const getFirebaseStatus = () => {
  const { projectId, clientEmail, privateKey } = config.firebase;
  const isConfigured = Boolean(projectId && clientEmail && privateKey);

  return {
    configured: isConfigured,
    initialized: getApps().length > 0,
    service: 'Firebase Admin Authentication',
    projectId: projectId || 'Not set',
  };
};

export default {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseStatus,
};
