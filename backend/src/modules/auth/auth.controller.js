import * as authService from './auth.service.js';

export async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerController(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// endpoint เช็คว่า token ยังใช้ได้อยู่ไหม + คืนข้อมูล user ปัจจุบัน (ใช้ตอน frontend restore session)
export async function meController(req, res, next) {
  res.json({ success: true, data: req.user });
}

export async function updatePasswordController(req, res, next) {
  try {
    const user_id = req.body.user_id || req.params.user_id || req.user.user_id; // ใช้ user_id จาก body, params หรือ token
    const newPassword = req.body.newPassword;
    const result = await authService.updatePassword(user_id, newPassword);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}