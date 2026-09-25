import { z } from 'zod';

// Keep in sync with client/src/lib/validations/message.js.
export const MESSAGE_MAX_LENGTH = 4000;

export const messageConversationParamsSchema = z.object({
  conversationId: z.uuid('Invalid conversation id'),
});

export const listMessagesQuerySchema = z.object({
  // Id of the oldest message already loaded; returns messages older than it.
  before: z.uuid('Invalid cursor').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const sendMessageSchema = z.object({
  content: z
    .string({ error: 'Message is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(MESSAGE_MAX_LENGTH, `Message must be at most ${MESSAGE_MAX_LENGTH} characters`),
  replyToId: z.uuid('Invalid reply target').optional(),
});
