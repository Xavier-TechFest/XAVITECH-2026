import { v2 as cloudinary } from 'cloudinary';
import config from './env.config.js';
import logger from '../utils/logger.util.js';

if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  logger.info('Cloudinary initialized successfully with secure transport.');
} else {
  logger.warn('Cloudinary credentials missing or incomplete in environment.');
}

export const isCloudinaryConfigured = () => config.cloudinary.isConfigured;

export { cloudinary };
export default cloudinary;
