import Joi from 'joi';

// tax ไม่มีผู้ให้บริการ (provider), insurance ไม่มีจำนวนเงิน (amount) — บังคับ/ห้ามตามประเภทเอกสาร
export const createDocumentSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    document_type: Joi.string().valid('tax', 'act', 'insurance').required(),
    provider: Joi.string().max(100).when('document_type', {
        is: 'tax',
        then: Joi.forbidden(),
        otherwise: Joi.required(),
    }),
    last_paid_date: Joi.date().iso().required(),
    expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required().messages({
        'date.greater': 'วันหมดอายุต้องอยู่หลังวันที่ชำระล่าสุด',
    }),
    amount: Joi.number().min(0).when('document_type', {
        is: 'insurance',
        then: Joi.forbidden(),
        otherwise: Joi.required(),
    }),
});

// แก้ไข: ไม่บังคับกรอกทุกฟิลด์ แต่ถ้าส่งมาต้องผ่าน validation เดียวกัน
export const updateDocumentSchema = Joi.object({
    provider: Joi.string().max(100),
    last_paid_date: Joi.date().iso(),
    expire_date: Joi.date().iso(),
    amount: Joi.number().min(0),
}).min(1);
