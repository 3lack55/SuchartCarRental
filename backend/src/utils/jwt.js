import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Please set it in the backend .env file.');
}

// payload ควรมีแค่ข้อมูลที่จำเป็นตอน authorize เช่น user_id, role
// ห้ามใส่ password_hash หรือข้อมูล sensitive อื่นลงใน token เด็ดขาด (token ถอดรหัสอ่านได้ ไม่ได้เข้ารหัส)
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// คืนค่า decoded payload ถ้า token ถูกต้อง, throw error ถ้า token หมดอายุ/ไม่ถูกต้อง
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}