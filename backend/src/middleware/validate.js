import { AppError } from './errorHandler.js';

// abortEarly: false เพื่อคืน error ครบทุกฟิลด์ในครั้งเดียว ไม่ใช่แค่ตัวแรกที่เจอ
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(message, 400));
    }

    req.body = value; // ใช้ค่าที่ผ่าน validate แล้ว (Joi แปลง type ให้ตรงตาม schema ด้วย)
    next();
  };
}