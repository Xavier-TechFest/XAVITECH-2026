import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const parseCorsOrigins = (rawOrigins) => {
  if (!rawOrigins) return ['http://localhost:3000'];
  return rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigins: parseCorsOrigins(process.env.CLIENT_URL),

  // PostgreSQL / Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
  },

  // Future phase placeholders (Phase 2: Auth, Phase 3: Payment, Phase 4: Email)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@xavitech2026.com',
    senderName: process.env.BREVO_SENDER_NAME || 'XAVITECH 2026',
  },

  payment: {
    keyId: process.env.PAYMENT_GATEWAY_KEY_ID || '',
    keySecret: process.env.PAYMENT_GATEWAY_KEY_SECRET || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
};

export default config;
