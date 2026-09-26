import app from './app.js';
import config from './config/env.config.js';
import logger from './utils/logger.util.js';
import { testDbConnection } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  logger.info(`====================================================`);
  logger.info(`🚀 XAVITECH-2026 Backend running on port ${PORT}`);
  logger.info(`🌱 Environment: ${config.env}`);
  logger.info(`👉 Healthcheck: http://localhost:${PORT}/api/health`);
  logger.info(`👉 API Root:    http://localhost:${PORT}/api`);
  logger.info(`🌐 Allowed CORS: ${config.corsOrigins.join(', ')}`);
  logger.info(`====================================================`);

  // Verify database connectivity
  const dbStatus = await testDbConnection();
  if (dbStatus.connected) {
    logger.info(`✅ ${dbStatus.message}`);
  } else {
    logger.warn(`⚠️  Database connection notice: ${dbStatus.message}`);
  }

  // Verify Firebase Admin initialization
  const firebaseStatus = initializeFirebase();
  if (firebaseStatus.initialized) {
    logger.info(`✅ ${firebaseStatus.message}`);
  } else {
    logger.warn(`⚠️  Firebase Admin notice: ${firebaseStatus.message}`);
  }
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
