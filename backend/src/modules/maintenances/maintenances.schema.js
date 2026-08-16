import Joi from 'joi';

const itemSchema = Joi.object({
    service_item_id: Joi.number().integer().required(),
    quantity: Joi.number().positive().default(1),
    unit_price: Joi.number().min(0).required(),
    remark: Joi.string().max(255).allow(null, ''),
});

export const createMaintenanceSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    service_date: Joi.date().iso().required(),
    garage_name: Joi.string().max(100).required(),
    garage_type: Joi.string().valid('center', 'shop').required(),
    receipt_number: Joi.string().max(50).allow(null, ''),
    mileage: Joi.number().integer().min(0).required(),
    next_service_mileage: Joi.number().integer().min(0).allow(null),
    items: Joi.array().items(itemSchema).min(1).required().messages({
        'array.min': 'ต้องมีรายการซ่อมอย่างน้อย 1 รายการ',
    }),
});

// แก้ไข: แทนที่รายการย่อยทั้งหมดด้วยชุดใหม่เสมอ (ง่ายและตรงกับการแก้ใบเสร็จจริงมากกว่า patch ทีละบรรทัด)
export const updateMaintenanceSchema = createMaintenanceSchema;