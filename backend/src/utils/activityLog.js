import { recordActivity } from '../modules/activity-logs/logs.service.js';

// เรียกหลัง service สำเร็จแล้วเสมอ ไม่ throw ออกไป กัน request หลักพังเพราะ log ล้มเหลว
export async function logActivity(req, { action, entity_type, entity_id, description }) {
  try {
    await recordActivity({
      user_id: req.user?.user_id ?? null,
      username: req.user?.username ?? 'system',
      action,
      entity_type,
      entity_id,
      description,
      ip_address: req.ip,
    });
  } catch (err) {
    console.error('[activity log failed]', err);
  }
}
