import { create } from 'zustand'

// Conversations list, the open conversation and its messages.
// Messages are keyed by conversation id so switching chats keeps loaded history.
export const useChatStore = create((set) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  // { [conversationId]: userId[] } — who is currently typing (Phase 8)
  typingByConversation: {},

  setConversations: (conversations) => set({ conversations }),
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
    set({ conversations: [], activeConversationId: null, messagesByConversation: {}, typingByConversation: {} }),
}))
