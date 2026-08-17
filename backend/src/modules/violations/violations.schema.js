import Joi from 'joi';

export const createViolationSchema = Joi.object({
    driver_id: Joi.number().integer().required(),
    vehicle_id: Joi.number().integer().required(),
    reason_id: Joi.number().integer().required(),
    incident_datetime: Joi.date().iso().required(),
    fine: Joi.number().min(0).required(),
    is_paid: Joi.boolean().default(false),
});

// แก้ไข: ไม่บังคับกรอกทุกฟิลด์ แต่ถ้าส่งมาต้องผ่าน validation เดียวกัน
export const updateViolationSchema = Joi.object({
    driver_id: Joi.number().integer(),
    vehicle_id: Joi.number().integer(),
    reason_id: Joi.number().integer(),
    incident_datetime: Joi.date().iso(),
    fine: Joi.number().min(0),
    is_paid: Joi.boolean(),
}).min(1);
