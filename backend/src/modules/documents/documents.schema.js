import Joi from 'joi';

// act_tax (พ.ร.บ. + ภาษีรถยนต์ รวมเป็นเอกสารเดียว ต่ออายุพร้อมกันเสมอ), insurance (ประกันภาคสมัครใจ)
// amount (ยอดชำระ) ไม่บังคับกรอก ใช้สรุปค่าใช้จ่ายต่ออายุเอกสารรายปีเท่านั้น
// coverage_amount (ทุนประกัน) มีความหมายเฉพาะ document_type = 'insurance' เท่านั้น (พ.ร.บ. วงเงินคุ้มครองตายตัวตามกฎหมาย
// ไม่ใช่ข้อมูลที่กรอกรายฉบับ) ฝั่ง service จะไม่บันทึกค่านี้ให้ act_tax แม้ส่งมาก็ตาม
export const createDocumentSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    document_type: Joi.string().valid('act_tax', 'insurance').required(),
    provider: Joi.string().max(100).allow(null, ''),
    last_paid_date: Joi.date().iso().required(),
    expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required().messages({
        'date.greater': 'วันหมดอายุต้องอยู่หลังวันที่ชำระล่าสุด',
    }),
    amount: Joi.number().min(0).precision(2).allow(null),
    coverage_amount: Joi.number().min(0).precision(2).allow(null),
});

// แก้ไข: ไม่บังคับกรอกทุกฟิลด์ แต่ถ้าส่งมาต้องผ่าน validation เดียวกัน
export const updateDocumentSchema = Joi.object({
    provider: Joi.string().max(100).allow(null, ''),
    last_paid_date: Joi.date().iso(),
    expire_date: Joi.date().iso(),
    amount: Joi.number().min(0).precision(2).allow(null),
    coverage_amount: Joi.number().min(0).precision(2).allow(null),
}).min(1);
