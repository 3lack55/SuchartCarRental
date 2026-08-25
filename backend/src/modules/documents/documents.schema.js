import Joi from 'joi';

// act_tax (พ.ร.บ. + ภาษีรถยนต์ รวมเป็นเอกสารเดียว ต่ออายุพร้อมกันเสมอ), insurance (ประกันภาคสมัครใจ ไม่มีจำนวนเงิน)
export const createDocumentSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    document_type: Joi.string().valid('act_tax', 'insurance').required(),
    provider: Joi.string().max(100).required(),
    last_paid_date: Joi.date().iso().required(),
    expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required().messages({
        'date.greater': 'วันหมดอายุต้องอยู่หลังวันที่ชำระล่าสุด',
    }),
    premium_amount: Joi.number().min(0).when('document_type', {
        is: 'act_tax',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    fee_amount: Joi.number().min(0).when('document_type', {
        is: 'act_tax',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
});

// แก้ไข: ไม่บังคับกรอกทุกฟิลด์ แต่ถ้าส่งมาต้องผ่าน validation เดียวกัน
export const updateDocumentSchema = Joi.object({
    provider: Joi.string().max(100),
    last_paid_date: Joi.date().iso(),
    expire_date: Joi.date().iso(),
    premium_amount: Joi.number().min(0),
    fee_amount: Joi.number().min(0),
}).min(1);
