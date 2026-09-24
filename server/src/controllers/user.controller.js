import * as userService from '../services/user.service.js';

export const search = async (req, res) => {
  const users = await userService.searchUsers(req.user.id, req.validatedQuery);
  res.json({ success: true, data: { users } });
};

export const getById = async (req, res) => {
  const user = await userService.getPublicProfile(req.validatedParams.userId);
  res.json({ success: true, data: { user } });
};

export const updateMe = async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: { user } });
};

export const changePassword = async (req, res) => {
  const { signedOutSessions } = await userService.changePassword(req.user.id, req.user.sessionId, req.body);
  res.json({
    success: true,
    message:
      signedOutSessions > 0
        ? `Password updated. Signed out ${signedOutSessions} other device${signedOutSessions === 1 ? '' : 's'}.`
        : 'Password updated.',
  });
};

export const updateAvatar = async (req, res) => {
  const user = await userService.updateAvatar(req.user.id, req.image);
  res.json({ success: true, data: { user } });
};

export const removeAvatar = async (req, res) => {
  const user = await userService.removeAvatar(req.user.id);
  res.json({ success: true, data: { user } });
};
