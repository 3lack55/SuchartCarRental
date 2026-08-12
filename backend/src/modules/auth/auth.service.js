import pool from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function login(username, password) {
  const [rows] = await pool.execute(
    'SELECT user_id, username, password_hash, role, is_active FROM users WHERE username = ?',
    [username]
  );

  const user = rows[0];

  // ข้อความ error ตั้งใจให้เหมือนกันทั้งกรณี username ไม่มีและ password ผิด
  if (!user) {
    throw new AppError('username หรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  if (!user.is_active) {
    throw new AppError('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ', 403);
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('username หรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  await pool.execute('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

  const token = signToken({
    user_id: user.user_id,
    username: user.username,
    role: user.role,
  });

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      deleted: !user.is_active,
    },
  };
}

// สมัคร user ใหม่ — แนะนำให้ผูก requireRole('admin') ไว้ที่ route เสมอ
// ไม่ควรเปิดให้สมัครเองแบบ public สำหรับระบบ internal ใช้งานแบบนี้
export async function register({ username, password, role }) {
  const [existing] = await pool.execute('SELECT user_id FROM users WHERE username = ?', [username]);
  if (existing.length > 0) {
    throw new AppError('username นี้ถูกใช้งานแล้ว', 409);
  }

  const password_hash = await hashPassword(password);

  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, password_hash, role]
  );

  return { user_id: result.insertId, username, role };
}

export async function updatePassword(user_id, newPassword) {
  if (!user_id || !newPassword) {
    throw new AppError('user_id และ newPassword ต้องถูกส่งมา', 400);
  }
  
  const [user] = await pool.execute('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
  if (!user.length) {
    throw new AppError('ไม่พบผู้ใช้งานนี้', 404);
  }

  const password_hash = await hashPassword(newPassword);

  await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, user_id]);

  return { success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' };
}