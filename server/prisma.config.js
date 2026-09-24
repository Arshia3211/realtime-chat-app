import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ quiet: true });

// Prisma 7 reads the connection URL from here instead of schema.prisma.
// DATABASE_URL is only required for commands that talk to the database
// (migrate, db push, studio). `prisma generate` / `prisma validate` work without it.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
