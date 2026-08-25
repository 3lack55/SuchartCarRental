import Joi from 'joi';

export const vehicleTypeSchema = Joi.object({
  name: Joi.string().trim().min(1).max(30).required(),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
});

export const violationReasonSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

export const serviceTypeSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
});

export const serviceCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  service_type_id: Joi.number().integer().required(),
});

export const serviceItemSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  service_category_id: Joi.number().integer().required(),
});
