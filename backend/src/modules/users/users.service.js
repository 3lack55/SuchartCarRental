import pool from '../../config/db.js';
import { hashPassword } from '../../utils/hash.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listUsers() {
  const [rows] = await pool.execute(
    'SELECT user_id, username, role, is_active, last_login, created_at, updated_at FROM users ORDER BY user_id ASC'
  );
  return rows;
}

export async function getUserById(userId) {
  const [rows] = await pool.execute(
    'SELECT user_id, username, role, is_active, last_login, created_at, updated_at FROM users WHERE user_id = ?',
    [userId]
  );
  const user = rows[0];
  if (!user) {
    throw new AppError('ไม่พบผู้ใช้งานนี้', 404);
  }
  return user;
}

export async function createUser({ username, password, role }) {
  const [existing] = await pool.execute('SELECT user_id FROM users WHERE username = ?', [username]);
  if (existing.length > 0) {
    throw new AppError('username นี้ถูกใช้งานแล้ว', 409);
  }

  const password_hash = await hashPassword(password);

  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, password_hash, role]
  );

  return getUserById(result.insertId);
}

async function countActiveAdmins(excludeUserId) {
  const sql = excludeUserId
    ? "SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND is_active = 1 AND user_id != ?"
    : "SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND is_active = 1";
  const params = excludeUserId ? [excludeUserId] : [];
  const [[{ total }]] = await pool.query(sql, params);
  return total;
}

export async function updateUserRole(targetUserId, role, actingUser) {
  const targetId = Number(targetUserId);
  if (targetId === actingUser.user_id) {
    throw new AppError('ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้', 400);
  }

  const target = await getUserById(targetId);

  if (target.role === 'admin' && role !== 'admin') {
    const remainingAdmins = await countActiveAdmins(targetId);
    if (remainingAdmins < 1) {
      throw new AppError('ไม่สามารถลดสิทธิ์ผู้ดูแลระบบคนสุดท้ายได้', 400);
    }
  }

  await pool.execute('UPDATE users SET role = ? WHERE user_id = ?', [role, targetId]);
  return getUserById(targetId);
}

export async function updateUserStatus(targetUserId, isActive, actingUser) {
  const targetId = Number(targetUserId);
  if (targetId === actingUser.user_id) {
    throw new AppError('ไม่สามารถระงับการใช้งานบัญชีของตัวเองได้', 400);
  }

  const target = await getUserById(targetId);

  if (!isActive && target.role === 'admin') {
    const remainingAdmins = await countActiveAdmins(targetId);
    if (remainingAdmins < 1) {
      throw new AppError('ไม่สามารถระงับการใช้งานผู้ดูแลระบบคนสุดท้ายได้', 400);
    }
  }

  await pool.execute('UPDATE users SET is_active = ? WHERE user_id = ?', [isActive ? 1 : 0, targetId]);
  return getUserById(targetId);
}

export async function resetUserPassword(targetUserId, newPassword) {
  const targetId = Number(targetUserId);
  await getUserById(targetId); // throw 404 ถ้าไม่มีจริง

  const password_hash = await hashPassword(newPassword);
  await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, targetId]);
  return getUserById(targetId);
}
