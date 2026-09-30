import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/env.config.js';
import logger from './utils/logger.util.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.util.js';

const app = express();

// =============================================================================
// CORS Configuration
// =============================================================================
const normalizeOrigin = (origin) => {
  if (!origin || typeof origin !== 'string') return '';
  return origin.trim().replace(/\/+$/, '').toLowerCase();
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, and mobile requests with no origin
    if (!origin) return callback(null, true);

    const normalizedIncoming = normalizeOrigin(origin);

    // Disallow wildcard '*' when credentials are enabled (CORS specification compliance)
    if (normalizedIncoming === '*') {
      return callback(new Error('Wildcard origin is not permitted when credentials are enabled'));
    }

    // Direct match against normalized config origins
    const isConfigured = config.corsOrigins.some(
      (allowed) => normalizeOrigin(allowed) === normalizedIncoming
    );

    // Whitelist production Vercel app domain and Vercel preview deployments
    const isVercelProduction = normalizedIncoming === 'https://xavitech-2026.vercel.app';
    const isVercelPreview = /^https:\/\/xavitech-2026[a-z0-9-]*\.vercel\.app$/.test(normalizedIncoming);

    if (isConfigured || isVercelProduction || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =============================================================================
// Body & Cookie Parsing Middlewares
// =============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Fallback compatibility mount: Also mount under root (/) so requests missing /api
// (e.g. misconfigured clients calling /admin/* or /track-leader/*) are seamlessly handled
app.use('/', apiRoutes);

// =============================================================================
// Error Handling Middlewares
// =============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
