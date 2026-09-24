import { env } from './env.js';

// Shared by Express and Socket.IO so both accept the same origins.
// CLIENT_URL may be a comma-separated list for multiple frontends.
export const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
