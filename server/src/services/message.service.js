import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { assertMembership } from './conversation.service.js';

// Each query is a network round trip, so reads load relations with SQL joins
// and sending is a single statement.

const senderSelect = { id: true, username: true, displayName: true, avatarUrl: true };

const withDetails = {
  relationLoadStrategy: 'join',
  select: {
    id: true,
    conversationId: true,
    type: true,
    content: true,
    senderId: true,
    replyToId: true,
    editedAt: true,
    deletedAt: true,
    createdAt: true,
    sender: { select: senderSelect },
    replyTo: {
      select: {
        id: true,
        type: true,
        content: true,
        senderId: true,
        deletedAt: true,
        sender: { select: { id: true, displayName: true } },
      },
    },
  },
};

// Deleted content never leaves the server (for the message or a quoted reply).
const serialize = (message) => ({
  ...message,
  content: message.deletedAt ? null : message.content,
  replyTo: message.replyTo && {
    ...message.replyTo,
    content: message.replyTo.deletedAt ? null : message.replyTo.content,
  },
});

// Newest-first page of history, returned oldest → newest for display.
// `before` is the id of the oldest message the client already has.
export const listMessages = async (conversationId, userId, { before, limit }) => {
  const cursorMessage = before
    ? prisma.message.findFirst({ where: { id: before, conversationId }, select: { createdAt: true, id: true } })
    : null;

  // Membership check and cursor lookup are independent: run them together.
  const [, cursor] = await Promise.all([assertMembership(conversationId, userId), cursorMessage]);
  if (before && !cursor) throw ApiError.badRequest('Invalid cursor');

  const rows = await prisma.message.findMany({
    ...withDetails,
    where: {
      conversationId,
      // Strictly older than the cursor; `id` breaks ties between equal timestamps.
      ...(cursor && {
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1, // one extra row tells us whether older messages exist
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit).reverse();
  return {
    messages: page.map(serialize),
    hasMore,
    nextCursor: hasMore ? page[0].id : null,
  };
};

// Inserts the message, bumps the conversation's activity time and marks it read
// for the sender — atomically, in one round trip. Nothing is inserted unless the
// sender is an active member and the reply target (if any) is in the same conversation.
const insertTextMessage = async ({ conversationId, senderId, content, replyToId }) => {
  const rows = await prisma.$queryRaw`
    WITH allowed AS (
      SELECT 1
      FROM conversation_members
      WHERE "conversationId" = ${conversationId}::uuid AND "userId" = ${senderId}::uuid AND "leftAt" IS NULL
        AND (
          ${replyToId ?? null}::uuid IS NULL
          OR EXISTS (
            SELECT 1 FROM messages
            WHERE id = ${replyToId ?? null}::uuid AND "conversationId" = ${conversationId}::uuid
          )
        )
    ),
    inserted AS (
      INSERT INTO messages (id, "conversationId", "senderId", type, content, "replyToId", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), ${conversationId}::uuid, ${senderId}::uuid, 'TEXT'::"MessageType",
             ${content}, ${replyToId ?? null}::uuid, now(), now()
      FROM allowed
      RETURNING id, "createdAt"
    ),
    touched_conversation AS (
      UPDATE conversations SET "lastMessageAt" = inserted."createdAt", "updatedAt" = now()
      FROM inserted WHERE conversations.id = ${conversationId}::uuid
    ),
    sender_read AS (
      UPDATE conversation_members SET "lastReadAt" = inserted."createdAt", "updatedAt" = now()
      FROM inserted
      WHERE conversation_members."conversationId" = ${conversationId}::uuid
        AND conversation_members."userId" = ${senderId}::uuid
    )
    SELECT id FROM inserted
  `;
  return rows[0]?.id ?? null;
};

export const sendTextMessage = async (conversationId, senderId, { content, replyToId }) => {
  const messageId = await insertTextMessage({ conversationId, senderId, content, replyToId });

  if (!messageId) {
    // Nothing inserted: find out why (rare path, so the extra queries are fine).
    await assertMembership(conversationId, senderId);
    throw ApiError.badRequest('The message you are replying to is not in this conversation', {
      fieldErrors: { replyToId: ['Invalid reply target'] },
    });
  }

  const message = await prisma.message.findUnique({ ...withDetails, where: { id: messageId } });
  return serialize(message);
};
