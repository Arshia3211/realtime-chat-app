import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { messageLimiter } from '../middleware/rateLimiter.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  listMessagesQuerySchema,
  messageConversationParamsSchema,
  sendMessageSchema,
} from '../validators/message.validators.js';

// Message routes — mounted at /api/messages. All require authentication.
// Editing, deleting and reactions arrive in Phase 10:
//   PATCH  /:messageId
//   DELETE /:messageId
//   POST   /:messageId/reactions
//   DELETE /:messageId/reactions/:emoji
const router = Router();

router.use(requireAuth);

router.get(
  '/conversation/:conversationId',
  validateParams(messageConversationParamsSchema),
  validateQuery(listMessagesQuerySchema),
  messageController.list,
);
router.post(
  '/conversation/:conversationId',
  messageLimiter,
  validateParams(messageConversationParamsSchema),
  validateBody(sendMessageSchema),
  messageController.send,
);

export default router;
