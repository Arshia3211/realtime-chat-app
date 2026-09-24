import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import { env } from './env.js';

// Single shared Prisma Client instance for the whole process.
// The generated client lives in src/generated/prisma (run `npm run prisma:generate`).
const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({
  adapter,
  log: env.isProduction ? ['error'] : ['warn', 'error'],
});

// Lightweight round-trip used by startup and the health check.
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.code ?? error.message };
  }
};

// Verifies the database is reachable at startup. Production refuses to start
// without it; development keeps running so the frontend can still be worked on.
export const connectDatabase = async () => {
  if (!env.databaseUrl) {
    console.warn('[db] DATABASE_URL is not set — database features are unavailable');
    return false;
  }

  const { ok, error } = await checkDatabaseConnection();
  if (ok) {
    console.log('[db] connected to PostgreSQL');
    return true;
  }

  const message = `[db] could not connect to PostgreSQL (${error})`;
  if (env.isProduction) {
    throw new Error(message);
  }
  console.warn(`${message} — continuing without a database in development`);
  return false;
};

export const disconnectDatabase = () => prisma.$disconnect();
