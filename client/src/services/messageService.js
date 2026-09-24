import { api } from './api'

// Endpoints: server/src/routes/message.routes.js (Phase 6, mutations in Phase 10)
export const messageService = {
  getMessages: (conversationId, { cursor, limit } = {}) =>
    api.get(`/messages/conversation/${conversationId}`, { params: { cursor, limit } }).then((res) => res.data),
  sendMessage: (conversationId, data) =>
    api.post(`/messages/conversation/${conversationId}`, data).then((res) => res.data),
  editMessage: (messageId, content) => api.patch(`/messages/${messageId}`, { content }).then((res) => res.data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`).then((res) => res.data),
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }).then((res) => res.data),
  removeReaction: (messageId, emoji) =>
    api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`).then((res) => res.data),
}
