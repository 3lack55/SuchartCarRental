import Joi from 'joi';

export const createDriverSchema = Joi.object({
    prefix: Joi.string().max(10).required(),
    first_name: Joi.string().max(30).required(),
    last_name: Joi.string().max(30).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก',
    }),
    hire_date: Joi.date().iso().allow(null),
});

// ตอนแก้ไข ไม่บังคับกรอกทุกฟิลด์ แต่ถ้าส่งมาต้องผ่าน validation เดียวกัน
export const updateDriverSchema = Joi.object({
    prefix: Joi.string().max(10),
    first_name: Joi.string().max(30),
    last_name: Joi.string().max(30),
    phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
        'string.pattern.base': 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก',
    }),
    hire_date: Joi.date().iso().allow(null),
}).min(1); // ต้องส่งมาอย่างน้อย 1 ฟิลด์