import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js"

const DRIVERS_CACHE_KEY = "drivers.list";
const DRIVERS_CACHE_TTL = 3600; // 1 hour in seconds

export async function listDrivers({ search, includeInactive } = {}) {
    let sql = `
        SELECT driver_id, prefix, first_name, last_name, phone, hire_date, deleted
        FROM drivers
        WHERE 1 = 1
  `;
    const params = [];

    if (!includeInactive) {
        sql += ' AND deleted = 0';
    }

    if (search) {
        sql += ' AND (CONCAT(prefix, first_name, " ", last_name) LIKE ? OR phone LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY driver_id DESC';

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

export async function createDriver(data) {
    const [existing] = await pool.execute('SELECT driver_id FROM drivers WHERE phone = ?', [data.phone]);
    if (existing.length > 0) {
        throw new AppError('เบอร์โทรนี้มีอยู่ในระบบแล้ว', 409);
    }

    const [result] = await pool.execute(
        'INSERT INTO drivers (prefix, first_name, last_name, phone, hire_date) VALUES (?, ?, ?, ?, ?)',
        [data.prefix, data.first_name, data.last_name, data.phone, data.hire_date || null]
    );

    return getDriverById(result.insertId);
}

export async function updateDriver(driverId, data) {
    await getDriverById(driverId); // ตรวจว่ามีอยู่จริงก่อน ไม่งั้น throw 404 ให้เอง

    if (data.phone) {
        const [existing] = await pool.execute(
            'SELECT driver_id FROM drivers WHERE phone = ? AND driver_id != ?',
            [data.phone, driverId]
        );
        if (existing.length > 0) {
            throw new AppError('เบอร์โทรนี้มีอยู่ในระบบแล้ว', 409);
        }
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
    return { driver_id: driverId, deleted: true };
}
