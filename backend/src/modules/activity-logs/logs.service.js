import pool from '../../config/db.js';

export async function recordActivity({ user_id, username, action, entity_type, entity_id, description, ip_address }) {
  await pool.execute(
    'INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id ?? null, username, action, entity_type ?? null, entity_id ?? null, description ?? null, ip_address ?? null]
  );
}

export async function listActivityLogs({ search, action, userId, dateFrom, dateTo, page = 1, limit = 50 } = {}) {
  let sql = 'SELECT log_id, user_id, username, action, entity_type, entity_id, description, ip_address, created_at FROM activity_logs WHERE 1 = 1';
  let countSql = 'SELECT COUNT(*) AS total FROM activity_logs WHERE 1 = 1';
  const params = [];

  if (search) {
    sql += ' AND (username LIKE ? OR description LIKE ?)';
    countSql += ' AND (username LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (action) {
    sql += ' AND action LIKE ?';
    countSql += ' AND action LIKE ?';
    params.push(`${action}%`);
  }

  if (userId) {
    sql += ' AND user_id = ?';
    countSql += ' AND user_id = ?';
    params.push(userId);
  }

  if (dateFrom) {
    sql += ' AND created_at >= ?';
    countSql += ' AND created_at >= ?';
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ' AND created_at <= ?';
    countSql += ' AND created_at <= ?';
    params.push(dateTo);
  }

  const [[{ total }]] = await pool.query(countSql, params);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
  const offset = (safePage - 1) * safeLimit;

  sql += ' ORDER BY created_at DESC, log_id DESC LIMIT ? OFFSET ?';
  const [rows] = await pool.query(sql, [...params, safeLimit, offset]);

  return { logs: rows, total, page: safePage, limit: safeLimit };
}
