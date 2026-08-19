import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { createUserSchema, updateUserRoleSchema, updateUserStatusSchema, resetUserPasswordSchema } from './users.schema.js';
import {
  listUsersController,
  createUserController,
  updateUserRoleController,
  updateUserStatusController,
  resetUserPasswordController,
} from './users.controller.js';

const usersRouter = Router();

usersRouter.use(authenticate, requireRole('admin'));

usersRouter.get('/', listUsersController);
usersRouter.post('/', validate(createUserSchema), createUserController);
usersRouter.patch('/:id/role', validate(updateUserRoleSchema), updateUserRoleController);
usersRouter.patch('/:id/status', validate(updateUserStatusSchema), updateUserStatusController);
usersRouter.patch('/:id/password', validate(resetUserPasswordSchema), resetUserPasswordController);

export default usersRouter;
