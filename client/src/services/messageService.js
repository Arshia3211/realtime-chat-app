import { api } from './api'

// Endpoints: server/src/routes/message.routes.js
// Editing, deleting and reactions arrive in Phase 10.
export const messageService = {
  // `before` = id of the oldest message already loaded (omit for the newest page).
  getMessages: (conversationId, { before, limit } = {}) =>
    api.get(`/messages/conversation/${conversationId}`, { params: { before, limit } }).then((res) => res.data),
  sendMessage: (conversationId, { content, replyToId }) =>
    api.post(`/messages/conversation/${conversationId}`, { content, replyToId }).then((res) => res.data),
}
