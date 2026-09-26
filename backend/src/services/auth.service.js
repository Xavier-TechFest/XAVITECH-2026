/**
 * Authentication Service Placeholder
 *
 * Handles Firebase token verification and synchronizing user profiles
 * in PostgreSQL / Supabase upon Google login.
 */

export const authService = {
  verifyFirebaseToken: async (idToken) => {
    // Placeholder: In production, verify idToken via Firebase Admin SDK
    return {
      uid: 'placeholder-firebase-uid',
      email: 'user@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.png',
    };
  },

  syncUser: async (firebaseUserData) => {
    // Placeholder: Look up user in DB by firebase_uid or email, create if not present
    return {
      id: 'placeholder-user-id',
      ...firebaseUserData,
      role: 'USER',
    };
  },
};

export default authService;
