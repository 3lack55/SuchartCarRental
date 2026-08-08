import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { loginSchema, registerSchema, updatePasswordSchema } from './auth.schema.js';
import { loginController, registerController, meController, updatePasswordController } from './auth.controller.js';

const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10, // 10 ครั้งต่อ 15 นาที ต่อ IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'ลองเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอสักครู่' },
});

authRouter.post('/login', loginLimiter, validate(loginSchema), loginController);

authRouter.post('/register', authenticate, requireRole('admin'), validate(registerSchema), registerController);

authRouter.get('/me', authenticate, meController);

authRouter.patch('/updatePassword', authenticate, validate(updatePasswordSchema), updatePasswordController);

export default authRouter;