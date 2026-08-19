import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(8).max(20).required().messages({
    'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    'string.max': 'รหัสผ่านต้องมีความยาวไม่เกิน 20 ตัวอักษร',
  }),
  role: Joi.string().valid('admin', 'manager', 'staff').default('staff'),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'manager', 'staff').required(),
});

export const updateUserStatusSchema = Joi.object({
  is_active: Joi.boolean().required(),
});

export const resetUserPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(20).required().messages({
    'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    'string.max': 'รหัสผ่านต้องมีความยาวไม่เกิน 20 ตัวอักษร',
  }),
});
