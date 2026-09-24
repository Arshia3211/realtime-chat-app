import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { singleImage } from '../middleware/upload.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  changePasswordSchema,
  searchUsersQuerySchema,
  updateProfileSchema,
  userIdParamsSchema,
} from '../validators/user.validators.js';

// User routes — mounted at /api/users. All require authentication.
const router = Router();

router.use(requireAuth);

// `/me` routes come before `/:userId` so "me" isn't treated as an id.
router.patch('/me', validateBody(updateProfileSchema), userController.updateMe);
router.patch('/me/password', authLimiter, validateBody(changePasswordSchema), userController.changePassword);
router.put('/me/avatar', ...singleImage('file'), userController.updateAvatar);
router.delete('/me/avatar', userController.removeAvatar);

router.get('/search', validateQuery(searchUsersQuerySchema), userController.search);
router.get('/:userId', validateParams(userIdParamsSchema), userController.getById);

export default router;
