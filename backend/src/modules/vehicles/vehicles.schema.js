import Joi from 'joi';
 
export const createVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10).required(),
  plate_province_id: Joi.number().integer().required(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
});
 
export const updateVehicleSchema = Joi.object({
  brand_model: Joi.string().max(100).allow(null, ''),
  plate_number: Joi.string().max(10),
  plate_province_id: Joi.number().integer(),
  driver_id: Joi.number().integer().allow(null),
  type_id: Joi.number().integer().allow(null),
}).min(1);