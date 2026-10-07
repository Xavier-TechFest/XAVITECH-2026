import multer from 'multer';

// 5MB maximum file size limit
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_DOCUMENT_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

/**
 * Configure multer memory storage
 */
const storage = multer.memoryStorage();

/**
 * Common file filter for document uploads
 */
const fileFilter = (req, file, cb) => {
  const mimeType = (file.mimetype || '').toLowerCase();
  const originalName = (file.originalname || '').toLowerCase();

  // Determine if this upload is intended strictly for a profile photo
  const docType = (req.body?.documentType || req.query?.documentType || req.params?.documentType || '').toLowerCase();
  const isProfilePhoto = docType === 'profile_photo' || docType === 'profilephoto';

  const allowedList = isProfilePhoto ? ALLOWED_IMAGE_MIMES : ALLOWED_DOCUMENT_MIMES;

  const hasValidMime = allowedList.includes(mimeType);
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => originalName.endsWith(ext));

  if (!hasValidMime || !hasValidExt) {
    if (isProfilePhoto && (mimeType === 'application/pdf' || originalName.endsWith('.pdf'))) {
      const err = new Error('PDF files are not accepted for profile photos. Please upload a JPG, PNG, or WEBP image.');
      err.statusCode = 400;
      return cb(err, false);
    }

    const err = new Error(
      isProfilePhoto
        ? 'Invalid image format. Allowed formats: JPEG, PNG, WEBP (Max 5MB).'
        : 'Invalid document format. Allowed formats: PDF, JPEG, PNG, WEBP (Max 5MB).'
    );
    err.statusCode = 400;
    return cb(err, false);
  }

  cb(null, true);
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware handling single document file upload on field 'file' or 'document'
 */
export const uploadSingleDocument = (req, res, next) => {
  const upload = multerInstance.single('file');

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 5MB. Please choose a smaller file.',
          error: 'LIMIT_FILE_SIZE',
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
        error: err.code,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Invalid file uploaded.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a file under the "file" field.',
      });
    }

    next();
  });
};

export default uploadSingleDocument;
