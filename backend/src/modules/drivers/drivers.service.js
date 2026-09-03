import pool from "../../config/db.js";
import { invalidateCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js"
import { OVERVIEW_CACHE_KEY } from "../overview/overview.service.js";

export async function listDrivers({ search, includeInactive, page, limit } = {}) {
    let where = 'WHERE 1 = 1';
    const params = [];

    if (!includeInactive) {
        where += ' AND d.deleted = 0';
    }

    if (search) {
        where += ' AND (CONCAT(d.prefix, d.first_name, " ", d.last_name) LIKE ? OR d.phone LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    const baseSql = `
        SELECT d.driver_id, d.prefix, d.first_name, d.last_name, d.phone, d.hire_date, d.deleted,
            (SELECT COUNT(*) FROM violations v WHERE v.driver_id = d.driver_id AND v.is_paid = 0) AS unpaid_violations_count
        FROM drivers d
        ${where}
        ORDER BY d.driver_id DESC
  `;

    // ไม่ส่ง page/limit มา -> คืนทั้งหมดเหมือนพฤติกรรมเดิม (หน้าเว็บปัจจุบันแบ่งหน้าแบบ client-side)
    // ส่งมา -> แบ่งหน้าฝั่ง server แทน สำหรับ dataset ที่โตขึ้นในอนาคต
    if (page === undefined && limit === undefined) {
        const [rows] = await pool.execute(baseSql, params);
        return rows;
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM drivers d ${where}`, params);

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(`${baseSql} LIMIT ? OFFSET ?`, [...params, safeLimit, offset]);
    return { drivers: rows, total, page: safePage, limit: safeLimit };
}

export async function getDriverById(driverId) {
    const [driverRows] = await pool.execute(
        'SELECT driver_id, prefix, first_name, last_name, phone, hire_date, deleted, created_at, updated_at FROM drivers WHERE driver_id = ?',
        [driverId]
    );

    const driver = driverRows[0];
    if (!driver) {
        throw new AppError('ไม่พบข้อมูลคนขับ', 404);
    }

    const [vehicles] = await pool.execute(
        `SELECT v.vehicle_id, v.brand_model, v.plate_number, p.name_th AS plate_province
        FROM vehicles v
        JOIN provinces p ON p.province_id = v.plate_province_id
        WHERE v.driver_id = ? AND v.deleted = 0`,
        [driverId]
    );

    const [violations] = await pool.execute(
        `SELECT violation_id, incident_datetime, fine, is_paid, plate_number, reason_name
        FROM view_violation_detail
        WHERE driver_id = ?
        ORDER BY incident_datetime DESC`,
        [driverId]
    );

    const unpaid_violations = violations.filter((v) => v.is_paid === 0).length;

    return { ...driver, vehicles, violations, unpaid_violations };
}

// เช็คแยก 2 รอบ: active (deleted=0) แจ้ง 409 ปกติเหมือนเดิม, soft-deleted (deleted=1) แจ้ง 409 พร้อม data
// ให้ frontend เสนอ "กู้คืน" แทน เพราะ unique key ของ DB ไม่ได้ตัด soft-deleted row ออก ต้องกู้คืนก่อนถึงจะสร้างใหม่ด้วยค่าเดิมได้
async function assertNameNotTaken(firstName, lastName, excludeDriverId) {
    const params = excludeDriverId ? [firstName, lastName, excludeDriverId] : [firstName, lastName];
    const excludeClause = excludeDriverId ? ' AND driver_id != ?' : '';

    const [existingActive] = await pool.execute(
        `SELECT driver_id FROM drivers WHERE first_name = ? AND last_name = ?${excludeClause} AND deleted = 0`,
        params
    );
    if (existingActive.length > 0) {
        throw new AppError('มีคนขับชื่อ-นามสกุลนี้อยู่ในระบบแล้ว', 409);
    }

    const [existingDeleted] = await pool.execute(
        `SELECT driver_id FROM drivers WHERE first_name = ? AND last_name = ?${excludeClause} AND deleted = 1`,
        params
    );
    if (existingDeleted.length > 0) {
        throw new AppError(
            'มีคนขับชื่อ-นามสกุลนี้เคยถูกลบไปแล้ว ต้องการกู้คืนหรือไม่?',
            409,
            { conflict: 'soft-deleted', entity: 'driver', id: existingDeleted[0].driver_id }
        );
    }
}

async function assertPhoneNotTaken(phone, excludeDriverId) {
    const params = excludeDriverId ? [phone, excludeDriverId] : [phone];
    const excludeClause = excludeDriverId ? ' AND driver_id != ?' : '';

    const [existingActive] = await pool.execute(
        `SELECT driver_id FROM drivers WHERE phone = ?${excludeClause} AND deleted = 0`,
        params
    );
    if (existingActive.length > 0) {
        throw new AppError('เบอร์โทรนี้มีอยู่ในระบบแล้ว', 409);
    }

    const [existingDeleted] = await pool.execute(
        `SELECT driver_id FROM drivers WHERE phone = ?${excludeClause} AND deleted = 1`,
        params
    );
    if (existingDeleted.length > 0) {
        throw new AppError(
            'เบอร์โทรนี้เคยถูกลบไปแล้ว ต้องการกู้คืนหรือไม่?',
            409,
            { conflict: 'soft-deleted', entity: 'driver', id: existingDeleted[0].driver_id }
        );
    }
}

export async function createDriver(data) {
    await assertPhoneNotTaken(data.phone);
    await assertNameNotTaken(data.first_name, data.last_name);

    const [result] = await pool.execute(
        'INSERT INTO drivers (prefix, first_name, last_name, phone, hire_date) VALUES (?, ?, ?, ?, ?)',
        [data.prefix, data.first_name, data.last_name, data.phone, data.hire_date || null]
    );

    invalidateCache(OVERVIEW_CACHE_KEY);
    return getDriverById(result.insertId);
}

export async function updateDriver(driverId, data) {
    const current = await getDriverById(driverId); // ตรวจว่ามีอยู่จริงก่อน ไม่งั้น throw 404 ให้เอง

    if (data.phone) {
        await assertPhoneNotTaken(data.phone, driverId);
    }

    if (data.first_name || data.last_name) {
        await assertNameNotTaken(data.first_name ?? current.first_name, data.last_name ?? current.last_name, driverId);
    }

    const fields = Object.keys(data);
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f]);

    await pool.execute(`UPDATE drivers SET ${setClause} WHERE driver_id = ?`, [...values, driverId]);

    return getDriverById(driverId);
}

export async function softDeleteDriver(driverId) {
    await getDriverById(driverId);

    // soft delete เป็นแค่ UPDATE deleted=1 ไม่ใช่ DELETE จริง FK ON DELETE SET NULL ของ vehicles.driver_id
    // จึงไม่ทำงาน ต้องเคลียร์รถที่คนขับคนนี้ดูแลอยู่กลับเป็น "ยังไม่มีคนขับ" เอง
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('UPDATE drivers SET deleted = 1 WHERE driver_id = ?', [driverId]);
        await conn.execute('UPDATE vehicles SET driver_id = NULL WHERE driver_id = ?', [driverId]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }

    invalidateCache(OVERVIEW_CACHE_KEY);
    return { driver_id: driverId, deleted: true };
}

export async function restoreDriver(driverId) {
    await getDriverById(driverId);
    await pool.execute('UPDATE drivers SET deleted = 0 WHERE driver_id = ?', [driverId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { driver_id: driverId, deleted: false };
}
