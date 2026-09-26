import express from 'express';
import cors from 'cors';
import config from './config/env.config.js';
import logger from './utils/logger.util.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.util.js';

const app = express();

// =============================================================================
// CORS Configuration
// =============================================================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, and mobile requests with no origin
    if (!origin) return callback(null, true);

    if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// =============================================================================
// Body Parsing Middlewares
// =============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logging for development
if (config.env === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// =============================================================================
// Root Health Check Route
// =============================================================================
app.get('/health', (req, res) => {
  return sendSuccess(res, 'XAVITECH backend is running');
});

// =============================================================================
// API Routes Aggregator (/api/*)
// =============================================================================
app.use('/api', apiRoutes);

// =============================================================================
// Error Handling Middlewares
// =============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
