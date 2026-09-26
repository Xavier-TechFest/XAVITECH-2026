import UserModel from '../models/user.model.js';
import logger from '../utils/logger.util.js';

/**
 * Format database user record into standardized API response object
 */
export const formatUserResponse = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    firebaseUid: user.firebase_uid,
    email: user.email,
    name: user.name || null,
    profileImage: user.profile_image || null,
    phone: user.phone || null,
    collegeName: user.college_name || null,
    role: user.role || 'USER',
    isActive: user.is_active !== false,
  };
};

/**
 * User Service
 * Business logic layer for user synchronization and profile operations.
 */
export const userService = {
  /**
   * Retrieves existing user or creates a new record in PostgreSQL from verified Firebase user data.
   * Firebase is the source of truth for uid and email.
   * Does not overwrite user-customized profile fields (phone, college, custom name) on repeat logins.
   */
  getOrCreateUserFromFirebase: async (firebaseUser) => {
    const { uid, email, name, picture } = firebaseUser;

    if (!uid) {
      throw new Error('Firebase UID is required to synchronize user');
    }

    // 1. Check if user already exists
    let user = await UserModel.findByFirebaseUid(uid);

    if (user) {
      // If email changed in Firebase, keep PostgreSQL email in sync
      if (email && user.email !== email) {
        user = await UserModel.updateByFirebaseUid(uid, { email });
      }
      return formatUserResponse(user);
    }

    // 2. User does not exist, create record
    try {
      const newUser = await UserModel.create({
        firebase_uid: uid,
        email: email || '',
        name: name || null,
        profile_image: picture || null,
        role: 'USER',
        is_active: true,
      });

      logger.info(`Synchronized new user from Firebase: ${uid} (${email})`);
      return formatUserResponse(newUser);
    } catch (createError) {
      // Handle potential race condition if user was created concurrently
      if (createError.code === '23505' || createError.message?.includes('duplicate key')) {
        const existing = await UserModel.findByFirebaseUid(uid);
        if (existing) {
          return formatUserResponse(existing);
        }
      }
      throw createError;
    }
  },

  /**
   * Get user by Firebase UID
   */
  getUserByFirebaseUid: async (firebaseUid) => {
    const user = await UserModel.findByFirebaseUid(firebaseUid);
    return formatUserResponse(user);
  },

  /**
   * Get user profile details
   */
  getUserProfile: async (firebaseUid) => {
    const user = await UserModel.findByFirebaseUid(firebaseUid);
    if (!user) {
      return null;
    }
    return formatUserResponse(user);
  },

  /**
   * Updates only safe, user-editable profile fields.
   * Strictly uses verified firebaseUid from token, ignoring any body-supplied identifiers.
   */
  updateUserProfile: async (firebaseUid, updateData) => {
    const allowedFields = {};

    if (updateData.name !== undefined) {
      allowedFields.name = typeof updateData.name === 'string' ? updateData.name.trim() : updateData.name;
    }

    if (updateData.phone !== undefined) {
      allowedFields.phone = typeof updateData.phone === 'string' ? updateData.phone.trim() : updateData.phone;
    }

    // Support both camelCase and snake_case keys from clients
    const college = updateData.collegeName !== undefined ? updateData.collegeName : updateData.college_name;
    if (college !== undefined) {
      allowedFields.college_name = typeof college === 'string' ? college.trim() : college;
    }

    const image = updateData.profileImage !== undefined ? updateData.profileImage : updateData.profile_image;
    if (image !== undefined) {
      allowedFields.profile_image = typeof image === 'string' ? image.trim() : image;
    }

    if (Object.keys(allowedFields).length === 0) {
      const current = await UserModel.findByFirebaseUid(firebaseUid);
      return formatUserResponse(current);
    }

    const updated = await UserModel.updateByFirebaseUid(firebaseUid, allowedFields);
    return formatUserResponse(updated);
  },
};

export default userService;
