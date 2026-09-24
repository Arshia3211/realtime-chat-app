import { Router } from 'express';
import { checkDatabaseConnection } from '../config/prisma.js';
import authRoutes from './auth.routes.js';
import conversationRoutes from './conversation.routes.js';
import messageRoutes from './message.routes.js';
import notificationRoutes from './notification.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const database = await checkDatabaseConnection();

  res.status(database.ok ? 200 : 503).json({
    success: database.ok,
    status: database.ok ? 'ok' : 'degraded',
    database: database.ok ? 'up' : 'down',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', uploadRoutes);
router.use('/notifications', notificationRoutes);

export default router;
