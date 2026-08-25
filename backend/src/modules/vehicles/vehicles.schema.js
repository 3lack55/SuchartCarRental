import Joi from 'joi';

// พ.ร.บ. + ภาษีรถยนต์ (รวมเป็นเอกสารเดียว ต่ออายุพร้อมกันเสมอ) — ส่งมาก็ต่อเมื่อมีข้อมูลจริง
const actTaxSchema = Joi.object({
  insurance_company: Joi.string().max(100).required(),
  last_paid_date: Joi.date().iso().required(),
  expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required(),
  premium_amount: Joi.number().min(0).required(),
  fee_amount: Joi.number().min(0).required(),
});

// ประกันภาคสมัครใจ
const insuranceSchema = Joi.object({
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
  act_tax: actTaxSchema.allow(null),
  insurance: insuranceSchema.allow(null),
});

export const updateVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10),
  plate_province_id: Joi.number().integer(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
}).min(1);