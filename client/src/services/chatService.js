import { api } from './api'

// Conversation endpoints: server/src/routes/conversation.routes.js
// Group endpoints (create group, rename, members, leave) arrive in Phase 12.
export const chatService = {
  getConversations: () => api.get('/conversations').then((res) => res.data),
  getConversation: (conversationId) => api.get(`/conversations/${conversationId}`).then((res) => res.data),
  // Returns the existing one-to-one conversation with this user, or creates it.
  openDirect: (userId) => api.post('/conversations/direct', { userId }).then((res) => res.data),
  markAsRead: (conversationId) => api.post(`/conversations/${conversationId}/read`).then((res) => res.data),
}
