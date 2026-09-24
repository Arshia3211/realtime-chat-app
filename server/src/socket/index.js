import { Server } from 'socket.io';
import { allowedOrigins } from '../config/cors.js';

let io = null;

// Attaches Socket.IO to the shared HTTP server so REST and WebSocket traffic
// run on the same port.
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Phase 7: add JWT handshake auth via io.use(...) and register
  // per-feature handlers (message, typing, presence, receipts) here.

  io.on('connection', (socket) => {
    console.log(`[socket] connected ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected ${socket.id} (${reason})`);
    });
  });

  return io;
};

// Lets services emit events (e.g. after a REST call creates a message).
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
  }
  return io;
};
