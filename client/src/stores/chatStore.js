import { create } from 'zustand'

const byLatestActivity = (a, b) =>
  new Date(b.lastMessageAt ?? b.createdAt) - new Date(a.lastMessageAt ?? a.createdAt)

// Optimistic messages carry a client-side `status` until the server confirms them.
const isPending = (message) => Boolean(message.status)

// Server messages in chronological order (id breaks timestamp ties, like the API);
// optimistic messages that haven't been confirmed yet always stay at the end.
const byTimeThenId = (a, b) => {
  if (isPending(a) !== isPending(b)) return isPending(a) ? 1 : -1
  const diff = new Date(a.createdAt) - new Date(b.createdAt)
  if (diff !== 0) return diff
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

// Union of two message lists without duplicates (by id), in display order.
const mergeMessages = (existing, incoming) => {
  const byId = new Map(existing.map((message) => [message.id, message]))
  incoming.forEach((message) => byId.set(message.id, message))
  return [...byId.values()].sort(byTimeThenId)
}

export const EMPTY_MESSAGES = Object.freeze({
  items: [],
  hasMore: false,
  nextCursor: null,
  status: 'idle', // idle | loading | ready | error
  error: null,
  isLoadingOlder: false,
})

// Conversations list, the open conversation and each conversation's messages.
// Messages are keyed by conversation id so switching chats keeps loaded history.
export const useChatStore = create((set) => {
  const patchMessages = (conversationId, patch) =>
    set((state) => {
      const current = state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: { ...current, ...patch(current) },
        },
      }
    })

  return {
    conversations: [],
    conversationsStatus: 'idle', // idle | loading | ready | error
    conversationsError: null,
    activeConversationId: null,
    messagesByConversation: {},
    // { [conversationId]: userId[] } — who is currently typing (Phase 8)
    typingByConversation: {},

    // ── Conversations ────────────────────────────────────────────────────
    setConversationsLoading: () => set({ conversationsStatus: 'loading', conversationsError: null }),
    setConversations: (conversations) =>
      set({ conversations: [...conversations].sort(byLatestActivity), conversationsStatus: 'ready' }),
    setConversationsError: (conversationsError) => set({ conversationsStatus: 'error', conversationsError }),

    // Inserts or replaces one conversation and keeps the list ordered.
    upsertConversation: (conversation) =>
      set((state) => ({
        conversations: [conversation, ...state.conversations.filter((c) => c.id !== conversation.id)].sort(
          byLatestActivity,
        ),
      })),

    updateConversation: (conversationId, updates) =>
      set((state) => ({
        conversations: state.conversations
          .map((c) => (c.id === conversationId ? { ...c, ...updates } : c))
          .sort(byLatestActivity),
      })),

    setActiveConversation: (activeConversationId) => set({ activeConversationId }),

    // ── Messages ─────────────────────────────────────────────────────────
    setMessagesLoading: (conversationId) =>
      patchMessages(conversationId, (current) => ({
        status: current.items.length ? current.status : 'loading',
        error: null,
      })),

    setMessagesError: (conversationId, error) =>
      patchMessages(conversationId, (current) => ({
        status: current.items.length ? 'ready' : 'error',
        error,
        isLoadingOlder: false,
      })),

    setLoadingOlder: (conversationId, isLoadingOlder) =>
      patchMessages(conversationId, () => ({ isLoadingOlder })),

    // Merges a page from the API. `older` = the page came from scrolling up.
    // A refresh of the newest page keeps the cached history and its cursor — unless
    // the page doesn't overlap the cache (more new messages than one page), in which
    // case the cache is replaced so there's never a silent gap in the middle.
    receiveMessagesPage: (conversationId, { messages, hasMore, nextCursor }, { older = false } = {}) =>
      patchMessages(conversationId, (current) => {
        const cached = current.items.filter((message) => !isPending(message))
        const cachedIds = new Set(cached.map((message) => message.id))
        const overlaps = messages.some((message) => cachedIds.has(message.id))
        const keepHistory = older || (cached.length > 0 && (overlaps || !hasMore))

        return {
          items: keepHistory
            ? mergeMessages(current.items, messages)
            : mergeMessages(current.items.filter(isPending), messages),
          hasMore: keepHistory && !older ? current.hasMore : hasMore,
          nextCursor: keepHistory && !older ? current.nextCursor : nextCursor,
          status: 'ready',
          error: null,
          isLoadingOlder: older ? false : current.isLoadingOlder,
        }
      }),

    // Adds a message (optimistic or from the server) if it isn't there yet.
    addMessage: (conversationId, message) =>
      patchMessages(conversationId, (current) => ({ items: mergeMessages(current.items, [message]) })),

    // Swaps an optimistic message for the server's copy.
    confirmMessage: (conversationId, clientId, message) =>
      patchMessages(conversationId, (current) => ({
        items: mergeMessages(
          current.items.filter((item) => item.clientId !== clientId),
          [message],
        ),
      })),

    updateMessage: (conversationId, messageId, updates) =>
      patchMessages(conversationId, (current) => ({
        items: current.items.map((message) => (message.id === messageId ? { ...message, ...updates } : message)),
      })),

    removeMessage: (conversationId, messageId) =>
      patchMessages(conversationId, (current) => ({
        items: current.items.filter((message) => message.id !== messageId),
      })),

    setTypingUsers: (conversationId, userIds) =>
      set((state) => ({
        typingByConversation: { ...state.typingByConversation, [conversationId]: userIds },
      })),

    reset: () =>
      set({
        conversations: [],
        conversationsStatus: 'idle',
        conversationsError: null,
        activeConversationId: null,
        messagesByConversation: {},
        typingByConversation: {},
      }),
  }
})
