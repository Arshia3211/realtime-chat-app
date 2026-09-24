import { Router } from 'express';

// Conversation routes — mounted at /api/conversations
// Implemented in Phase 5 / Phase 12 (groups). Planned endpoints:
//   GET    /
//   POST   /direct
//   POST   /group
//   GET    /:conversationId
//   PATCH  /:conversationId
//   POST   /:conversationId/members
//   DELETE /:conversationId/members/:userId
//   POST   /:conversationId/leave
//   POST   /:conversationId/read

const router = Router();

export default router;
