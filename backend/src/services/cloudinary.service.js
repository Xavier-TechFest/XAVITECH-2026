import { Readable } from 'stream';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import logger from '../utils/logger.util.js';

/**
 * Service encapsulating Cloudinary storage operations.
 */
class CloudinaryService {
  /**
   * Constructs standardized Cloudinary folder path according to spec:
   * xavitech-2026/registrations/:registrationId/participants/:participantId/:folderCategory
   *
   * @param {string} registrationId
   * @param {string} participantId
   * @param {'documents'|'profile'} category
   * @returns {string}
   */
  getFolderPath(registrationId, participantId, category = 'documents') {
    const cleanReg = String(registrationId).trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanPart = String(participantId).trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanCat = category === 'profile' ? 'profile' : 'documents';
    return `xavitech-2026/registrations/${cleanReg}/participants/${cleanPart}/${cleanCat}`;
  }

  /**
   * Uploads a file buffer to Cloudinary using streaming upload.
   *
   * @param {Buffer} buffer - File buffer from multer memoryStorage
   * @param {Object} options - Upload options
   * @param {string} options.folder - Destination folder
   * @param {string} [options.resourceType='auto'] - 'auto' | 'image' | 'raw'
   * @param {string} [options.publicId] - Optional explicit public ID
   * @returns {Promise<Object>} Cloudinary upload response { secure_url, public_id, resource_type, format, bytes }
   */
  async uploadBuffer(buffer, options = {}) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('A valid file buffer is required for upload');
    }

    // Fallback mock mode when credentials are not configured (e.g. CI/local dev test suites)
    if (!isCloudinaryConfigured() || process.env.MOCK_CLOUDINARY === 'true') {
      logger.info('Using simulated Cloudinary upload (Cloudinary credentials not configured or MOCK_CLOUDINARY=true).');
      const mockId = `${options.folder || 'xavitech-2026/documents'}/mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const resourceType = options.resourceType || 'image';
      return {
        secure_url: `https://res.cloudinary.com/xavitech-mock/${resourceType}/upload/v1/${mockId}`,
        public_id: mockId,
        resource_type: resourceType,
        format: options.format || 'jpg',
        bytes: buffer.length,
        created_at: new Date().toISOString(),
      };
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder,
        resource_type: options.resourceType || 'auto',
        overwrite: true,
        invalidate: true,
      };

      if (options.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload stream failed:', error);
            return reject(error);
          }
          resolve(result);
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Deletes an asset from Cloudinary by its public ID.
   *
   * @param {string} publicId - Cloudinary asset public ID
   * @param {string} [resourceType='image'] - 'image' | 'raw' | 'video'
   * @returns {Promise<Object>} Cloudinary destroy result { result: 'ok' | 'not found' }
   */
  async deleteAsset(publicId, resourceType = 'image') {
    if (!publicId) return { result: 'ignored' };

    if (!isCloudinaryConfigured() || process.env.MOCK_CLOUDINARY === 'true') {
      logger.info(`Simulated Cloudinary asset deletion for: ${publicId}`);
      return { result: 'ok' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType || 'image',
        invalidate: true,
      });
      return result;
    } catch (err) {
      logger.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
      // Attempt deletion with 'raw' resource type if 'image' returned not found
      if (resourceType !== 'raw') {
        try {
          const rawResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw',
            invalidate: true,
          });
          return rawResult;
        } catch {
          // Ignore secondary failure
        }
      }
      throw err;
    }
  }

  /**
   * Safe rollback helper: attempts to delete an asset if a database transaction fails.
   * Does not throw, only logs errors to preserve the original exception.
   *
   * @param {string} publicId
   * @param {string} [resourceType='image']
   */
  async rollbackAsset(publicId, resourceType = 'image') {
    if (!publicId) return;
    try {
      logger.warn(`Rolling back newly uploaded Cloudinary asset: ${publicId}`);
      await this.deleteAsset(publicId, resourceType);
    } catch (rollbackError) {
      logger.error(`Rollback failed for asset ${publicId}:`, rollbackError);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
