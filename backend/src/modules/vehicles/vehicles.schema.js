import Joi from 'joi';

// เอกสารแนบรถ (พ.ร.บ.+ภาษีรถยนต์ รวมเป็นเอกสารเดียว / ประกันภาคสมัครใจ) — เก็บแค่ผู้ให้บริการ+วันที่ ไม่เก็บจำนวนเงิน
// ส่งมาก็ต่อเมื่อมีข้อมูลจริง
const documentSchema = Joi.object({
  insurance_company: Joi.string().max(100).allow(null, ''),
  last_paid_date: Joi.date().iso().required(),
  expire_date: Joi.date().iso().greater(Joi.ref('last_paid_date')).required(),
});

// ปีที่ซื้อเกินปีหน้าไม่ได้ (กันกรอกปีในอนาคตเพี้ยนๆ) เดือนกรอกได้ก็ต่อเมื่อมีปีแล้วเท่านั้น
const purchaseYearMonthFields = {
  purchase_year: Joi.number().integer().min(1980).max(new Date().getFullYear() + 1).allow(null),
  purchase_month: Joi.number().integer().min(1).max(12).allow(null),
};

function rejectMonthWithoutYear(value, helpers) {
  if (value.purchase_month != null && value.purchase_year == null) {
    return helpers.message('กรุณาเลือกปีที่ซื้อก่อนเลือกเดือน');
  }
  return value;
}

export const createVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10).required(),
  plate_province_id: Joi.number().integer().required(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
  ...purchaseYearMonthFields,
  act_tax: documentSchema.allow(null),
  insurance: documentSchema.allow(null),
}).custom(rejectMonthWithoutYear);

export const updateVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10),
  plate_province_id: Joi.number().integer(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
  ...purchaseYearMonthFields,
}).min(1).custom(rejectMonthWithoutYear);