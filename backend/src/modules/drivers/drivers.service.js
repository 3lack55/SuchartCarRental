import pool from "../../config/db.js";
import { invalidateCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js"
import { OVERVIEW_CACHE_KEY } from "../overview/overview.service.js";

export async function listDrivers({ search, includeInactive } = {}) {
    let sql = `
        SELECT d.driver_id, d.prefix, d.first_name, d.last_name, d.phone, d.hire_date, d.deleted,
            (SELECT COUNT(*) FROM violations v WHERE v.driver_id = d.driver_id AND v.is_paid = 0) AS unpaid_violations_count
        FROM drivers d
        WHERE 1 = 1
  `;
    const params = [];

    if (!includeInactive) {
        sql += ' AND d.deleted = 0';
    }

    if (search) {
        sql += ' AND (CONCAT(d.prefix, d.first_name, " ", d.last_name) LIKE ? OR d.phone LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY d.driver_id DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
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

async function assertNameNotTaken(firstName, lastName, excludeDriverId) {
    const sql = excludeDriverId
        ? 'SELECT driver_id FROM drivers WHERE first_name = ? AND last_name = ? AND driver_id != ?'
        : 'SELECT driver_id FROM drivers WHERE first_name = ? AND last_name = ?';
    const params = excludeDriverId ? [firstName, lastName, excludeDriverId] : [firstName, lastName];

    const [existing] = await pool.execute(sql, params);
    if (existing.length > 0) {
        throw new AppError('มีคนขับชื่อ-นามสกุลนี้อยู่ในระบบแล้ว', 409);
    }
}

export async function createDriver(data) {
    const [existing] = await pool.execute('SELECT driver_id FROM drivers WHERE phone = ?', [data.phone]);
    if (existing.length > 0) {
        throw new AppError('เบอร์โทรนี้มีอยู่ในระบบแล้ว', 409);
    }
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
        const [existing] = await pool.execute(
            'SELECT driver_id FROM drivers WHERE phone = ? AND driver_id != ?',
            [data.phone, driverId]
        );
        if (existing.length > 0) {
            throw new AppError('เบอร์โทรนี้มีอยู่ในระบบแล้ว', 409);
        }
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
    await pool.execute('UPDATE drivers SET deleted = 1 WHERE driver_id = ?', [driverId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { driver_id: driverId, deleted: true };
}

export async function restoreDriver(driverId) {
    await getDriverById(driverId);
    await pool.execute('UPDATE drivers SET deleted = 0 WHERE driver_id = ?', [driverId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { driver_id: driverId, deleted: false };
}
