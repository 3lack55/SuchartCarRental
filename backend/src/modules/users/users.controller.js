import * as usersService from './users.service.js';
import { logActivity } from '../../utils/activityLog.js';

export async function listUsersController(req, res, next) {
  try {
    const users = await usersService.listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function createUserController(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    await logActivity(req, {
      action: 'user.create',
      entity_type: 'user',
      entity_id: user.user_id,
      description: `เพิ่มผู้ใช้งานใหม่ "${user.username}" (สิทธิ์ ${user.role})`,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRoleController(req, res, next) {
  try {
    const user = await usersService.updateUserRole(req.params.id, req.body.role, req.user);
    await logActivity(req, {
      action: 'user.role_update',
      entity_type: 'user',
      entity_id: user.user_id,
      description: `เปลี่ยนสิทธิ์ผู้ใช้งาน "${user.username}" เป็น ${user.role}`,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatusController(req, res, next) {
  try {
    const user = await usersService.updateUserStatus(req.params.id, req.body.is_active, req.user);
    await logActivity(req, {
      action: 'user.status_update',
      entity_type: 'user',
      entity_id: user.user_id,
      description: `${user.is_active ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}บัญชีผู้ใช้งาน "${user.username}"`,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function resetUserPasswordController(req, res, next) {
  try {
    const user = await usersService.resetUserPassword(req.params.id, req.body.newPassword);
    await logActivity(req, {
      action: 'user.password_reset',
      entity_type: 'user',
      entity_id: user.user_id,
      description: `รีเซ็ตรหัสผ่านผู้ใช้งาน "${user.username}"`,
    });
    res.json({ success: true, data: { user_id: user.user_id, username: user.username } });
  } catch (err) {
    next(err);
  }
}
