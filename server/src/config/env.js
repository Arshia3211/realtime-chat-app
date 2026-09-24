import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

// Variables that must be present before the server can run in production.
// In development they are reported as warnings so the scaffold can boot
// before a database or third-party services are configured.
const REQUIRED_IN_PRODUCTION = [
  'CLIENT_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const message = `Missing environment variables: ${missing.join(', ')}`;
  if (isProduction) {
    throw new Error(message);
  }
  console.warn(`[env] ${message} (ok for now in development)`);
}

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = Object.freeze({
  nodeEnv: NODE_ENV,
  isProduction,
  port: toInt(process.env.PORT, 5000),

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL ?? 'http://localhost:5000',

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },
});
