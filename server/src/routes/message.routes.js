import { Router } from 'express';

// Message routes — mounted at /api/messages
// Implemented in Phase 6 / Phase 10. Planned endpoints:
//   GET    /conversation/:conversationId?cursor=&limit=
//   POST   /conversation/:conversationId
//   PATCH  /:messageId
//   DELETE /:messageId
//   POST   /:messageId/reactions
//   DELETE /:messageId/reactions/:emoji

const router = Router();

export default router;
