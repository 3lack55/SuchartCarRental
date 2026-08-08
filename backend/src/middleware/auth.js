import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

// ผูกกับ route ที่ต้อง login ก่อนถึงจะเข้าถึงได้
// อ่าน token จาก header: Authorization: Bearer <token>
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('กรุณาเข้าสู่ระบบก่อนใช้งาน', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { user_id, username, role }
    next();
  } catch (err) {
    return next(new AppError('token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่', 401));
  }
}

// ผูกต่อจาก authenticate เสมอ ใช้จำกัดว่า role ไหนเข้าได้บ้าง
// ตัวอย่าง: router.delete('/vehicles/:id', authenticate, requireRole('admin'), controller)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 403));
    }
    next();
  };
}