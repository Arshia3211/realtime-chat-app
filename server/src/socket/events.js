// Socket.IO event names. Keep in sync with client/src/lib/socketEvents.js.
// `connection` / `disconnect` are built into Socket.IO; the rest are handled
// in later phases (see README roadmap).
export const SOCKET_EVENTS = Object.freeze({
  // Messaging (Phase 7)
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',

  // Typing indicators (Phase 8)
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',

  // Presence (Phase 8)
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  // Receipts (Phase 9)
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',

  // Message mutations (Phase 10)
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_REACTION: 'message_reaction',
});
