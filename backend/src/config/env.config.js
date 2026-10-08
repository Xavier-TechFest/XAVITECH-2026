import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env regardless of execution cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const normalizeOrigin = (origin) => {
  if (!origin || typeof origin !== 'string') return '';
  return origin.trim().replace(/\/+$/, '').toLowerCase();
};

const parseCorsOrigins = (...inputs) => {
  const defaultOrigins = [
    'https://xavitech.in',
    'https://www.xavitech.in',
    'https://xavitech-2026.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const originsSet = new Set(defaultOrigins.map((origin) => normalizeOrigin(origin)));

  inputs.forEach((raw) => {
    if (!raw || typeof raw !== 'string') return;
    raw.split(',').forEach((item) => {
      const normalized = normalizeOrigin(item);
      if (normalized && normalized !== '*') {
        originsSet.add(normalized);
      }
    });
  });

  return Array.from(originsSet);
};

const formatPrivateKey = (key) => {
  if (!key) return '';
  let formatted = key.replace(/\\n/g, '\n');
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.slice(1, -1);
  }
  return formatted.trim();
};

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const resolveServerUrl = () => {
  const configured = normalizeOrigin(
    process.env.SERVER_URL || process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL
  );
  if (configured) {
    if (isProduction && (configured.includes('localhost') || configured.includes('127.0.0.1'))) {
      return 'https://xavitech-2026.onrender.com';
    }
    return configured;
  }
  if (isProduction) {
    return 'https://xavitech-2026.onrender.com';
  }
  return `http://localhost:${parseInt(process.env.PORT, 10) || 5000}`;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: normalizeOrigin(process.env.CLIENT_URL || process.env.FRONTEND_URL) || 'https://xavitech.in',
  frontendUrl: normalizeOrigin(process.env.FRONTEND_URL || process.env.CLIENT_URL) || 'https://xavitech.in',
  serverUrl: resolveServerUrl(),
  corsOrigins: parseCorsOrigins(
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS,
    process.env.CORS_ORIGIN
  ),

  // PostgreSQL / Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
  },

  // Firebase Admin (Phase 2 - Google Login Verification)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  },

  // Brevo (Transactional Email Service - Phase 8 Part 4)
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@xavitech2026.com',
    senderName: process.env.BREVO_SENDER_NAME || 'XAVITECH 2026',
    frontendUrl: normalizeOrigin(process.env.FRONTEND_URL || process.env.CLIENT_URL) || 'https://xavitech.in',
    sendEnabled: process.env.EMAIL_SEND_ENABLED === 'true' || Boolean(process.env.BREVO_API_KEY),
  },


  // Easebuzz Payment Gateway Integration
  easebuzz: {
    key: process.env.EASEBUZZ_KEY || '',
    salt: process.env.EASEBUZZ_SALT || '',
    env: (process.env.EASEBUZZ_ENV || 'production').toLowerCase(),
    liveEnabled: process.env.EASEBUZZ_LIVE_ENABLED === 'true',
    liveTestEventSlug: (process.env.EASEBUZZ_LIVE_TEST_EVENT_SLUG || '').trim().toLowerCase(),
    testFeeOverrideEnabled: process.env.EASEBUZZ_TEST_FEE_OVERRIDE_ENABLED === 'true',
    testFeeAmount: parseFloat(process.env.EASEBUZZ_TEST_FEE_AMOUNT) || 1.00,
    callbackUrl: normalizeOrigin(process.env.EASEBUZZ_CALLBACK_URL || process.env.PAYMENT_CALLBACK_URL) || '',
    subMerchantId: process.env.EASEBUZZ_SUB_MERCHANT_ID || '',
    get baseUrl() {
      return this.env === 'prod' || this.env === 'production'
        ? 'https://pay.easebuzz.in'
        : 'https://testpay.easebuzz.in';
    },
    get isConfigured() {
      return Boolean(this.key && this.salt && !this.key.includes('your_easebuzz'));
    },
  },

  // Legacy payment gateway reference
  payment: {
    keyId: process.env.EASEBUZZ_KEY || process.env.PAYMENT_GATEWAY_KEY_ID || '',
    keySecret: process.env.EASEBUZZ_SALT || process.env.PAYMENT_GATEWAY_KEY_SECRET || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },

  // Admin Authentication (Phase 6)
  admin: {
    secretKey: process.env.ADMIN_SECRET_KEY || '',
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },

  // Cloudinary (Phase 2 Document Uploads)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    isConfigured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('your_cloudinary') &&
      !process.env.CLOUDINARY_API_KEY.includes('your_cloudinary') &&
      !process.env.CLOUDINARY_API_SECRET.includes('your_cloudinary')
    ),
  },
};

export default config;
