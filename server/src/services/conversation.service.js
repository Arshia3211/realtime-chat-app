import { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUserSelect } from '../utils/userSelect.js';

// Every query is a network round trip to the database, so these functions keep
// them few and run independent ones in parallel.

// Upper bound for the conversation list until it gets cursor pagination.
const CONVERSATION_LIST_LIMIT = 100;

// Conversation + active members + latest message, loaded in ONE query (SQL joins).
const withDetails = {
  relationLoadStrategy: 'join',
  include: {
    members: {
      where: { leftAt: null },
      select: { userId: true, role: true, joinedAt: true, user: { select: publicUserSelect } },
      orderBy: { joinedAt: 'asc' },
    },
    messages: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, type: true, content: true, senderId: true, createdAt: true, deletedAt: true },
    },
  },
};

// Sorted user ids joined with ":" — identical for both participants, so the
// unique constraint on directKey prevents duplicate one-to-one conversations.
export const buildDirectKey = (userIdA, userIdB) => [userIdA, userIdB].sort().join(':');

// Returns the caller's membership or throws 404. Non-members get the same answer
// as for a missing conversation, so ids can't be probed.
export const assertMembership = async (conversationId, userId) => {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership || membership.leftAt) {
    throw ApiError.notFound('Conversation not found');
  }
  return membership;
};

// Unread = messages from others, not deleted, newer than the member's read cursor.
// Without `conversationId` it counts across all of the user's conversations.
const getUnreadCounts = async (userId, conversationId = null) => {
  const rows = await prisma.$queryRaw`
    SELECT m."conversationId" AS "conversationId", COUNT(*)::int AS "count"
    FROM conversation_members cm
    JOIN messages m ON m."conversationId" = cm."conversationId"
    WHERE cm."userId" = ${userId}::uuid
      AND cm."leftAt" IS NULL
      ${conversationId ? Prisma.sql`AND cm."conversationId" = ${conversationId}::uuid` : Prisma.empty}
      AND m."deletedAt" IS NULL
      AND m."senderId" IS DISTINCT FROM ${userId}::uuid
      AND (cm."lastReadAt" IS NULL OR m."createdAt" > cm."lastReadAt")
    GROUP BY m."conversationId"
  `;
  return new Map(rows.map((row) => [row.conversationId, row.count]));
};

// Shapes a conversation for the API: `lastMessage` instead of a messages array,
// and deleted message content never leaves the server.
const serialize = (conversation, unreadCount = 0) => {
  const { messages, directKey: _directKey, avatarPublicId: _avatarPublicId, ...rest } = conversation;
  const last = messages?.[0] ?? null;
  return {
    ...rest,
    lastMessage: last && { ...last, content: last.deletedAt ? null : last.content },
    unreadCount,
  };
};

const activeMemberFilter = (userId) => ({ members: { some: { userId, leftAt: null } } });

export const listConversations = async (userId) => {
  const [conversations, unread] = await Promise.all([
    prisma.conversation.findMany({
      ...withDetails,
      where: activeMemberFilter(userId),
      // Most recent activity first; brand-new conversations sort by creation time.
      orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: CONVERSATION_LIST_LIMIT,
    }),
    getUnreadCounts(userId),
  ]);
  return conversations.map((conversation) => serialize(conversation, unread.get(conversation.id) ?? 0));
};

// Membership is part of the query, so a non-member gets the same 404 as a missing id.
export const getConversation = async (conversationId, userId) => {
  const [conversation, unread] = await Promise.all([
    prisma.conversation.findFirst({ ...withDetails, where: { id: conversationId, ...activeMemberFilter(userId) } }),
    getUnreadCounts(userId, conversationId),
  ]);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  return serialize(conversation, unread.get(conversationId) ?? 0);
};

// Inserts the conversation and both memberships in a single atomic statement
// (Prisma's nested create would need a multi-round-trip transaction).
const insertDirectConversation = async (directKey, userId, otherUserId) => {
  const [row] = await prisma.$queryRaw`
    WITH conversation AS (
      INSERT INTO conversations (id, type, "directKey", "createdById", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'DIRECT'::"ConversationType", ${directKey}, ${userId}::uuid, now(), now())
      RETURNING id
    )
    INSERT INTO conversation_members (id, "conversationId", "userId", role, "joinedAt", "updatedAt")
    SELECT gen_random_uuid(), conversation.id, member_id, 'MEMBER'::"MemberRole", now(), now()
    FROM conversation, unnest(ARRAY[${userId}::uuid, ${otherUserId}::uuid]) AS member_id
    RETURNING "conversationId"
  `;
  return row.conversationId;
};

// P2002 comes from Prisma model queries; raw queries report P2010 with the
// driver's original Postgres code (23505 = unique_violation).
const isUniqueViolation = (error) =>
  error.code === 'P2002' ||
  (error.code === 'P2010' && error.meta?.driverAdapterError?.cause?.originalCode === '23505');

// Returns the existing one-to-one conversation with `otherUserId`, or creates it.
export const getOrCreateDirectConversation = async (userId, otherUserId) => {
  if (userId === otherUserId) {
    throw ApiError.badRequest("You can't start a conversation with yourself");
  }

  const directKey = buildDirectKey(userId, otherUserId);
  const [existing, otherUser] = await Promise.all([
    prisma.conversation.findUnique({ ...withDetails, where: { directKey } }),
    prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true } }),
  ]);

  if (!otherUser) throw ApiError.notFound('User not found');

  if (existing) {
    const unread = await getUnreadCounts(userId, existing.id);
    return { conversation: serialize(existing, unread.get(existing.id) ?? 0), created: false };
  }

  try {
    const conversationId = await insertDirectConversation(directKey, userId, otherUserId);
    return { conversation: await getConversation(conversationId, userId), created: true };
  } catch (error) {
    // Both users started the chat at the same moment: the unique directKey let only
    // one insert succeed (SQLSTATE 23505). Return the conversation that won.
    if (!isUniqueViolation(error)) throw error;

    const winner = await prisma.conversation.findUnique({ ...withDetails, where: { directKey } });
    if (!winner) throw error;
    return { conversation: serialize(winner), created: false };
  }
};

// Moves the caller's read cursor to now (clears the unread badge). One query:
// updating zero rows means the caller isn't an active member.
export const markAsRead = async (conversationId, userId) => {
  const { count } = await prisma.conversationMember.updateMany({
    where: { conversationId, userId, leftAt: null },
    data: { lastReadAt: new Date() },
  });
  if (count === 0) throw ApiError.notFound('Conversation not found');
};
