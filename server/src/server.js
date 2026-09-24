import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/prisma.js';
import { initSocket } from './socket/index.js';

const httpServer = http.createServer(app);
const io = initSocket(httpServer);

const start = async () => {
  await connectDatabase();

  httpServer.listen(env.port, () => {
    console.log(`[server] ${env.nodeEnv} server listening on http://localhost:${env.port}`);
    console.log(`[server] accepting client origin(s): ${env.clientUrl}`);
  });
};

const shutdown = (signal) => {
  console.log(`[server] ${signal} received, shutting down...`);
  io.close();
  httpServer.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  // Force exit if open connections keep the server alive.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
