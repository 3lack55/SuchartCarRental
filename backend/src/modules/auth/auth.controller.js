import * as authService from './auth.service.js';
import { logActivity } from '../../utils/activityLog.js';

export async function loginController(req, res, next) {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    await logActivity(
      { user: { user_id: result.user.user_id, username: result.user.username }, ip: req.ip },
      { action: 'auth.login_success', entity_type: 'user', entity_id: result.user.user_id, description: `เข้าสู่ระบบสำเร็จ "${result.user.username}"` }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    await logActivity(
      { user: null, ip: req.ip },
      { action: 'auth.login_failed', entity_type: 'user', entity_id: null, description: `เข้าสู่ระบบไม่สำเร็จ (username: "${username}")` }
    );
    next(err);
  }
}

// endpoint เช็คว่า token ยังใช้ได้อยู่ไหม + คืนข้อมูล user ปัจจุบัน (ใช้ตอน frontend restore session)
export async function meController(req, res, next) {
  res.json({ success: true, data: req.user });
}

// เปลี่ยนรหัสผ่านของตัวเองเท่านั้น — ใช้ user_id จาก token เสมอ ห้ามรับจาก body/params
// (ก่อนหน้านี้รับ user_id จาก body ได้ ทำให้ user คนไหนก็เปลี่ยนรหัสผ่านของคนอื่นได้หมด)
export async function updatePasswordController(req, res, next) {
  try {
    const user_id = req.user.user_id;
    const newPassword = req.body.newPassword;
    const result = await authService.updatePassword(user_id, newPassword);
    await logActivity(req, {
      action: 'auth.password_update',
      entity_type: 'user',
      entity_id: Number(user_id),
      description: `เปลี่ยนรหัสผ่านของตัวเอง user_id=${user_id}`,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}