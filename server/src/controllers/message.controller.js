import * as messageService from '../services/message.service.js';

export const list = async (req, res) => {
  const result = await messageService.listMessages(
    req.validatedParams.conversationId,
    req.user.id,
    req.validatedQuery,
  );
  res.json({ success: true, data: result });
};

export const send = async (req, res) => {
  const message = await messageService.sendTextMessage(req.validatedParams.conversationId, req.user.id, req.body);
  res.status(201).json({ success: true, data: { message } });
};
