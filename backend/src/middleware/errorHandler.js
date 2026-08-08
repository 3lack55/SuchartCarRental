export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
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
  });
}

// ใช้จับ route ที่ไม่มีอยู่จริง (404) ผูกไว้หลัง route ทั้งหมด ก่อน errorHandler
export function notFoundHandler(req, res, next) {
  next(new AppError(`ไม่พบ endpoint: ${req.method} ${req.originalUrl}`, 404));
}