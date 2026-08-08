import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().min(1).required(),
});

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(8).max(20).required().messages({
    'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    'string.max': 'รหัสผ่านต้องมีความยาวไม่เกิน 20 ตัวอักษร',
  }),
  role: Joi.string().valid('admin', 'manager', 'staff').default('staff'),
});

export const updatePasswordSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  newPassword: Joi.string().min(8).max(20).required().messages({
    'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    'string.max': 'รหัสผ่านต้องมีความยาวไม่เกิน 20 ตัวอักษร',
  }),
});