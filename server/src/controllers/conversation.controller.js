import * as conversationService from '../services/conversation.service.js';

export const list = async (req, res) => {
  const conversations = await conversationService.listConversations(req.user.id);
  res.json({ success: true, data: { conversations } });
};

export const getById = async (req, res) => {
  const conversation = await conversationService.getConversation(req.validatedParams.conversationId, req.user.id);
  res.json({ success: true, data: { conversation } });
};

// 201 when a new conversation was created, 200 when an existing one is returned.
export const createDirect = async (req, res) => {
  const { conversation, created } = await conversationService.getOrCreateDirectConversation(
    req.user.id,
    req.body.userId,
  );
  res.status(created ? 201 : 200).json({ success: true, data: { conversation, created } });
};

export const markAsRead = async (req, res) => {
  await conversationService.markAsRead(req.validatedParams.conversationId, req.user.id);
  res.json({ success: true });
};
