import { Router } from 'express';
import * as conversationController from '../controllers/conversation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  conversationIdParamsSchema,
  createDirectConversationSchema,
} from '../validators/conversation.validators.js';

// Conversation routes — mounted at /api/conversations. All require authentication.
// Group endpoints (create group, rename, add/remove members, leave) arrive in Phase 12.
const router = Router();

router.use(requireAuth);

router.get('/', conversationController.list);
router.post('/direct', validateBody(createDirectConversationSchema), conversationController.createDirect);
router.get('/:conversationId', validateParams(conversationIdParamsSchema), conversationController.getById);
router.post('/:conversationId/read', validateParams(conversationIdParamsSchema), conversationController.markAsRead);

export default router;
