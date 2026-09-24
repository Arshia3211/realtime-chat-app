import { create } from 'zustand'

const byLatestActivity = (a, b) =>
  new Date(b.lastMessageAt ?? b.createdAt) - new Date(a.lastMessageAt ?? a.createdAt)

// Conversations list, the open conversation and its messages.
// Messages are keyed by conversation id so switching chats keeps loaded history.
export const useChatStore = create((set) => ({
  conversations: [],
  conversationsStatus: 'idle', // idle | loading | ready | error
  conversationsError: null,
  activeConversationId: null,
  messagesByConversation: {},
  // { [conversationId]: userId[] } — who is currently typing (Phase 8)
  typingByConversation: {},

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
      conversations: state.conversations.map((c) => (c.id === conversationId ? { ...c, ...updates } : c)),
    })),

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((message) =>
          message.id === messageId ? { ...message, ...updates } : message,
        ),
      },
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
}))
