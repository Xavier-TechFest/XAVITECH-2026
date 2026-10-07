import documentService from '../services/document.service.js';
import { sendSuccess } from '../utils/response.util.js';

/**
 * Controller for managing participant documents and Cloudinary uploads.
 */
export const uploadParticipantDocument = async (req, res, next) => {
  try {
    const { registrationId, participantId } = req.params;
    const documentType = req.body?.documentType || req.query?.documentType || 'id_card';

    const result = await documentService.uploadParticipantDocument(
      req.user,
      registrationId,
      participantId,
      req.file,
      documentType
    );

    return sendSuccess(res, 'Document uploaded successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getParticipantDocuments = async (req, res, next) => {
  try {
    const { registrationId, participantId } = req.params;

    const result = await documentService.getParticipantDocuments(
      req.user,
      registrationId,
      participantId
    );

    return sendSuccess(res, 'Participant documents retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteParticipantDocument = async (req, res, next) => {
  try {
    const { registrationId, participantId, documentType } = req.params;

    const result = await documentService.deleteParticipantDocument(
      req.user,
      registrationId,
      participantId,
      documentType
    );

    return sendSuccess(res, 'Document removed successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadParticipantDocument,
  getParticipantDocuments,
  deleteParticipantDocument,
};
