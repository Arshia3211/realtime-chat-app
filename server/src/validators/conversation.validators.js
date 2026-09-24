import { z } from 'zod';

export const conversationIdParamsSchema = z.object({
  conversationId: z.uuid('Invalid conversation id'),
});

export const createDirectConversationSchema = z.object({
  userId: z.uuid('Invalid user id'),
});
