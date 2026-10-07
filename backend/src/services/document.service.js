import RegistrationModel from '../models/registration.model.js';
import RegistrationParticipantModel from '../models/registrationParticipant.model.js';
import UserModel from '../models/user.model.js';
import userService from './user.service.js';
import cloudinaryService from './cloudinary.service.js';
import logger from '../utils/logger.util.js';

/**
 * Normalizes document type strings from various frontend forms / params
 * into canonical internal keys: 'id_card' | 'profile_photo'.
 *
 * @param {string} rawType
 * @returns {'id_card' | 'profile_photo'}
 */
export const normalizeDocumentType = (rawType = '') => {
  const clean = String(rawType).trim().toLowerCase().replace(/[-_]/g, '');
  if (['idcard', 'collegeid', 'studentid', 'student', 'id'].includes(clean)) {
    return 'id_card';
  }
  if (['profilephoto', 'profilepic', 'photo', 'avatar'].includes(clean)) {
    return 'profile_photo';
  }
  return 'id_card';
};

/**
 * Resolves the authenticated PostgreSQL user from Firebase auth context.
 *
 * @param {Object} firebaseUser
 * @returns {Promise<Object>}
 */
const resolvePostgresUser = async (firebaseUser) => {
  if (!firebaseUser?.uid) {
    const error = new Error('Authentication required. Missing verified Firebase user.');
    error.statusCode = 401;
    throw error;
  }

  let dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);
  if (!dbUser) {
    await userService.getOrCreateUserFromFirebase(firebaseUser);
    dbUser = await UserModel.findByFirebaseUid(firebaseUser.uid);
  }

  if (!dbUser) {
    const error = new Error('Failed to resolve authenticated database user.');
    error.statusCode = 401;
    throw error;
  }

  return dbUser;
};

/**
 * Resolves and verifies that a registration exists and belongs to the authenticated user.
 *
 * @param {Object} dbUser
 * @param {string} registrationIdentifier - UUID or registration_id
 * @returns {Promise<Object>}
 */
const resolveAndAuthorizeRegistration = async (dbUser, registrationIdentifier) => {
  let registration = await RegistrationModel.getRegistrationById(registrationIdentifier);
  if (!registration) {
    registration = await RegistrationModel.getRegistrationByRegistrationId(registrationIdentifier);
  }

  if (!registration) {
    const error = new Error(`Registration '${registrationIdentifier}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Strict ownership verification: registration must belong to authenticated user
  if (registration.user_id !== dbUser.id) {
    const error = new Error('Forbidden: You are not authorized to manage documents for this registration.');
    error.statusCode = 403;
    throw error;
  }

  return registration;
};

/**
 * Resolves a participant record belonging strictly to the specified registration.
 *
 * @param {Object} registration
 * @param {string|number} participantIdentifier - UUID or participant_order index (e.g. 1 or '0')
 * @returns {Promise<Object>}
 */
const resolveRegistrationParticipant = async (registration, participantIdentifier) => {
  let participant = null;

  // 1. Try finding by UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(participantIdentifier || '').trim()
  );

  if (isUUID) {
    participant = await RegistrationParticipantModel.getParticipantById(participantIdentifier);
  }

  // 2. If not found or numeric index provided, try participant order
  if (!participant && !Number.isNaN(Number(participantIdentifier))) {
    const orderNum = Number(participantIdentifier);
    // Support both 0-based and 1-based order input
    const orderIndex = orderNum === 0 ? 1 : orderNum;
    participant = await RegistrationParticipantModel.getParticipantByRegistrationAndOrder(
      registration.id,
      orderIndex
    );
  }

  // 3. Fallback: inspect registration's preloaded participants
  if (!participant && Array.isArray(registration.participants)) {
    participant = registration.participants.find(
      (p) =>
        p.id === participantIdentifier ||
        String(p.participant_order) === String(participantIdentifier)
    );
  }

  if (!participant || participant.registration_id !== registration.id) {
    const error = new Error(
      `Participant '${participantIdentifier}' not found for registration '${registration.registration_id || registration.id}'.`
    );
    error.statusCode = 404;
    throw error;
  }

  return participant;
};

class DocumentService {
  /**
   * Upload or replace a document for a specific registration participant.
   *
   * @param {Object} firebaseUser - Authenticated user from Firebase token
   * @param {string} registrationId - Registration UUID or code
   * @param {string|number} participantId - Participant UUID or order index
   * @param {Object} file - Multer file object
   * @param {string} [rawDocType='id_card'] - Document type
   * @returns {Promise<Object>}
   */
  async uploadParticipantDocument(firebaseUser, registrationId, participantId, file, rawDocType = 'id_card') {
    if (!file || !file.buffer) {
      const error = new Error('No valid file buffer provided for upload.');
      error.statusCode = 400;
      throw error;
    }

    const docType = normalizeDocumentType(rawDocType);
    const mimeType = (file.mimetype || '').toLowerCase();

    // Strict profile photo validation: PDF is disallowed
    if (docType === 'profile_photo' && (mimeType === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf'))) {
      const error = new Error('PDF files are not permitted for profile photos. Please upload a JPG, PNG, or WEBP image.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Resolve and authenticate user & registration ownership
    const dbUser = await resolvePostgresUser(firebaseUser);
    const registration = await resolveAndAuthorizeRegistration(dbUser, registrationId);
    const participant = await resolveRegistrationParticipant(registration, participantId);

    // 2. Build organized Cloudinary destination folder
    const folderCategory = docType === 'profile_photo' ? 'profile' : 'documents';
    const folder = cloudinaryService.getFolderPath(
      registration.registration_id || registration.id,
      participant.id,
      folderCategory
    );

    // 3. Upload file to Cloudinary
    let uploadResult;
    try {
      uploadResult = await cloudinaryService.uploadBuffer(file.buffer, {
        folder,
        resourceType: 'auto',
      });
    } catch (uploadError) {
      logger.error('Failed to upload file to Cloudinary:', uploadError);
      const error = new Error(`Cloudinary upload failed: ${uploadError.message || 'Storage error'}`);
      error.statusCode = 500;
      throw error;
    }

    // 4. Track previous asset IDs for replacement cleanup
    const oldPublicId =
      docType === 'profile_photo' ? participant.profile_photo_public_id : participant.id_card_public_id;
    const oldResourceType =
      docType === 'profile_photo' ? participant.profile_photo_resource_type : participant.id_card_resource_type;

    // 5. Prepare database update object
    const updates = {};
    if (docType === 'profile_photo') {
      updates.profile_photo_url = uploadResult.secure_url;
      updates.profile_photo_public_id = uploadResult.public_id;
      updates.profile_photo_resource_type = uploadResult.resource_type;
      updates.profile_photo_mime_type = mimeType;
    } else {
      updates.id_card_url = uploadResult.secure_url;
      updates.id_card_public_id = uploadResult.public_id;
      updates.id_card_resource_type = uploadResult.resource_type;
      updates.id_card_mime_type = mimeType;
    }

    // 6. Persist to PostgreSQL with rollback guarantee
    let updatedParticipant;
    try {
      updatedParticipant = await RegistrationParticipantModel.updateParticipant(
        participant.id,
        updates
      );
    } catch (dbError) {
      logger.error('Database update failed after Cloudinary upload. Initiating rollback...', dbError);
      await cloudinaryService.rollbackAsset(uploadResult.public_id, uploadResult.resource_type);
      const error = new Error('Failed to record document metadata in database. Asset upload was rolled back.');
      error.statusCode = 500;
      throw error;
    }

    // 7. Cleanup old Cloudinary asset if replaced
    if (oldPublicId && oldPublicId !== uploadResult.public_id) {
      cloudinaryService
        .deleteAsset(oldPublicId, oldResourceType)
        .catch((cleanupErr) => logger.warn(`Failed to cleanup replaced asset ${oldPublicId}:`, cleanupErr));
    }

    logger.info(
      `Successfully uploaded ${docType} for participant ${participant.id} (Registration: ${registration.registration_id})`
    );

    return {
      success: true,
      documentType: docType,
      participantId: participant.id,
      participantOrder: participant.participant_order,
      document: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        mimeType: mimeType,
        resourceType: uploadResult.resource_type,
        bytes: uploadResult.bytes || file.size,
        fileName: file.originalname,
      },
      participant: {
        id: updatedParticipant.id,
        fullName: updatedParticipant.full_name,
        idCardUrl: updatedParticipant.id_card_url,
        profilePhotoUrl: updatedParticipant.profile_photo_url,
      },
    };
  }

  /**
   * Delete an existing document for a participant.
   *
   * @param {Object} firebaseUser
   * @param {string} registrationId
   * @param {string|number} participantId
   * @param {string} rawDocType
   * @returns {Promise<Object>}
   */
  async deleteParticipantDocument(firebaseUser, registrationId, participantId, rawDocType) {
    const docType = normalizeDocumentType(rawDocType);

    // 1. Resolve and authenticate user & registration ownership
    const dbUser = await resolvePostgresUser(firebaseUser);
    const registration = await resolveAndAuthorizeRegistration(dbUser, registrationId);
    const participant = await resolveRegistrationParticipant(registration, participantId);

    // 2. Identify target public ID
    const targetPublicId =
      docType === 'profile_photo' ? participant.profile_photo_public_id : participant.id_card_public_id;
    const targetResourceType =
      docType === 'profile_photo' ? participant.profile_photo_resource_type : participant.id_card_resource_type;

    if (!targetPublicId) {
      return {
        success: true,
        message: 'No document found to remove.',
        participantId: participant.id,
      };
    }

    // 3. Clear database columns
    const updates = {};
    if (docType === 'profile_photo') {
      updates.profile_photo_url = null;
      updates.profile_photo_public_id = null;
      updates.profile_photo_resource_type = null;
      updates.profile_photo_mime_type = null;
    } else {
      updates.id_card_url = null;
      updates.id_card_public_id = null;
      updates.id_card_resource_type = null;
      updates.id_card_mime_type = null;
    }

    await RegistrationParticipantModel.updateParticipant(participant.id, updates);

    // 4. Destroy asset in Cloudinary
    await cloudinaryService.deleteAsset(targetPublicId, targetResourceType);

    logger.info(`Successfully deleted ${docType} for participant ${participant.id}`);

    return {
      success: true,
      message: `${docType === 'profile_photo' ? 'Profile photo' : 'ID card'} removed successfully.`,
      participantId: participant.id,
      documentType: docType,
    };
  }

  /**
   * Retrieve document metadata for a participant with ownership enforcement.
   *
   * @param {Object} firebaseUser
   * @param {string} registrationId
   * @param {string|number} participantId
   * @returns {Promise<Object>}
   */
  async getParticipantDocuments(firebaseUser, registrationId, participantId) {
    const dbUser = await resolvePostgresUser(firebaseUser);
    const registration = await resolveAndAuthorizeRegistration(dbUser, registrationId);
    const participant = await resolveRegistrationParticipant(registration, participantId);

    return {
      participantId: participant.id,
      participantOrder: participant.participant_order,
      fullName: participant.full_name,
      documents: {
        idCard: participant.id_card_url
          ? {
              url: participant.id_card_url,
              publicId: participant.id_card_public_id,
              mimeType: participant.id_card_mime_type,
              resourceType: participant.id_card_resource_type,
            }
          : null,
        profilePhoto: participant.profile_photo_url
          ? {
              url: participant.profile_photo_url,
              publicId: participant.profile_photo_public_id,
              mimeType: participant.profile_photo_mime_type,
              resourceType: participant.profile_photo_resource_type,
            }
          : null,
      },
    };
  }
}

export const documentService = new DocumentService();
export default documentService;
