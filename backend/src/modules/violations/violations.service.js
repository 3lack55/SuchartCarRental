import pool from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { invalidateCache } from '../../config/cache.js';
import { OVERVIEW_CACHE_KEY } from '../overview/overview.service.js';

const VIOLATION_DETAIL_COLUMNS = `
    violation_id, incident_datetime, fine, is_paid,
    driver_id, driver_name, driver_phone,
    vehicle_id, plate_number, plate_province,
    reason_id, reason_name
`;

export async function listViolations({ search, driverId, vehicleId, isPaid } = {}) {
    let sql = `SELECT ${VIOLATION_DETAIL_COLUMNS} FROM view_violation_detail WHERE 1 = 1`;
    const params = [];

    if (driverId) {
        sql += ' AND driver_id = ?';
        params.push(driverId);
    }

    if (vehicleId) {
        sql += ' AND vehicle_id = ?';
        params.push(vehicleId);
    }

    if (isPaid !== undefined) {
        sql += ' AND is_paid = ?';
        params.push(isPaid ? 1 : 0);
    }

    if (search) {
        sql += ' AND (driver_name LIKE ? OR plate_number LIKE ? OR reason_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY incident_datetime DESC, violation_id DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
}

export async function getViolationById(violationId) {
    const [rows] = await pool.execute(
        `SELECT ${VIOLATION_DETAIL_COLUMNS} FROM view_violation_detail WHERE violation_id = ?`,
        [violationId]
    );

    const violation = rows[0];
    if (!violation) {
        throw new AppError('ไม่พบข้อมูลการฝ่าฝืนนี้', 404);
    }

    return violation;
}

async function assertDriverExists(conn, driverId) {
    const [rows] = await conn.execute('SELECT driver_id FROM drivers WHERE driver_id = ? AND deleted = 0', [driverId]);
    if (rows.length === 0) {
        throw new AppError('ไม่พบคนขับนี้ หรือคนขับพ้นสภาพไปแล้ว', 400);
    }
}

async function assertVehicleExists(conn, vehicleId) {
    const [rows] = await conn.execute('SELECT vehicle_id FROM vehicles WHERE vehicle_id = ? AND deleted = 0', [vehicleId]);
    if (rows.length === 0) {
        throw new AppError('ไม่พบรถคันนี้ หรือรถถูกปลดระวางไปแล้ว', 400);
    }
}

export async function createViolation(data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await assertDriverExists(conn, data.driver_id);
        await assertVehicleExists(conn, data.vehicle_id);

        const [result] = await conn.execute(
            `INSERT INTO violations (driver_id, vehicle_id, reason_id, incident_datetime, fine, is_paid)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [data.driver_id, data.vehicle_id, data.reason_id, data.incident_datetime, data.fine, data.is_paid ? 1 : 0]
        );

        await conn.commit();
        invalidateCache(OVERVIEW_CACHE_KEY);
        return getViolationById(result.insertId);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function updateViolation(violationId, data) {
    await getViolationById(violationId); // throw 404 ถ้าไม่มีจริง

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        if (data.driver_id) await assertDriverExists(conn, data.driver_id);
        if (data.vehicle_id) await assertVehicleExists(conn, data.vehicle_id);

        const fields = Object.keys(data);
        const setClause = fields.map((f) => `${f} = ?`).join(', ');
        const values = fields.map((f) => (f === 'is_paid' ? (data[f] ? 1 : 0) : data[f]));

        await conn.execute(`UPDATE violations SET ${setClause} WHERE violation_id = ?`, [...values, violationId]);

        await conn.commit();
        invalidateCache(OVERVIEW_CACHE_KEY);
        return getViolationById(violationId);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// hard delete ได้ตรงๆ เพราะตาราง violations ไม่มี column deleted และไม่มีตารางอื่นอ้างอิง violation_id
export async function deleteViolation(violationId) {
    await getViolationById(violationId);
    await pool.execute('DELETE FROM violations WHERE violation_id = ?', [violationId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { violation_id: violationId, deleted: true };
}
