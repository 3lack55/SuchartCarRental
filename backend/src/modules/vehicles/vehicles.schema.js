import Joi from 'joi';

// เอกสารแนบรถ (พ.ร.บ.+ภาษีรถยนต์ รวมเป็นเอกสารเดียว / ประกันภาคสมัครใจ) — เก็บแค่ผู้ให้บริการ+วันที่ ไม่เก็บจำนวนเงิน
// ส่งมาก็ต่อเมื่อมีข้อมูลจริง
const documentSchema = Joi.object({
  insurance_company: Joi.string().max(100).required(),
  last_paid_date: Joi.date().iso().required(),
  expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required(),
});

export const createVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10).required(),
  plate_province_id: Joi.number().integer().required(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
  act_tax: documentSchema.allow(null),
  insurance: documentSchema.allow(null),
});

export const updateVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10),
  plate_province_id: Joi.number().integer(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
}).min(1);