export class AppError extends Error {
  // data (ไม่บังคับ): payload เสริมให้ frontend ใช้ตัดสินใจต่อได้ เช่น { conflict: 'soft-deleted', entity, id }
  // สำหรับกรณีที่ต้อง disambiguate มากกว่าแค่ข้อความ error ธรรมดา
  constructor(message, statusCode = 500, data = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.data = data;
  }
}

// ต้องผูกเป็น middleware ตัวสุดท้ายใน app.js (หลัง route ทั้งหมด)
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง';

  if (!err.isOperational) {
    console.error('[unhandled error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.data !== undefined ? { data: err.data } : {}),
  });
}

// ใช้จับ route ที่ไม่มีอยู่จริง (404) ผูกไว้หลัง route ทั้งหมด ก่อน errorHandler
export function notFoundHandler(req, res, next) {
  next(new AppError(`ไม่พบ endpoint: ${req.method} ${req.originalUrl}`, 404));
}