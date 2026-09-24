import { api } from './api'

// Conversation endpoints: server/src/routes/conversation.routes.js (Phase 5, groups in Phase 12)
export const chatService = {
  getConversations: () => api.get('/conversations').then((res) => res.data),
  getConversation: (conversationId) => api.get(`/conversations/${conversationId}`).then((res) => res.data),
  createDirect: (userId) => api.post('/conversations/direct', { userId }).then((res) => res.data),
  createGroup: (data) => api.post('/conversations/group', data).then((res) => res.data),
  updateConversation: (conversationId, data) =>
    api.patch(`/conversations/${conversationId}`, data).then((res) => res.data),
  addMembers: (conversationId, userIds) =>
    api.post(`/conversations/${conversationId}/members`, { userIds }).then((res) => res.data),
  removeMember: (conversationId, userId) =>
    api.delete(`/conversations/${conversationId}/members/${userId}`).then((res) => res.data),
  leave: (conversationId) => api.post(`/conversations/${conversationId}/leave`).then((res) => res.data),
  markAsRead: (conversationId) => api.post(`/conversations/${conversationId}/read`).then((res) => res.data),
}
