import pool from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { invalidateCache } from '../../config/cache.js';
import { OVERVIEW_CACHE_KEY } from '../overview/overview.service.js';

export async function listMaintenances({ search, vehicleId } = {}) {
    let sql = `
    SELECT maintenance_id, vehicle_id, plate_number, plate_province, model,
        service_date, garage_name, garage_type, receipt_number,
        mileage, next_service_mileage, total_items, total_cost
    FROM view_maintenance_summary
    WHERE 1 = 1
  `;
    const params = [];

    if (vehicleId) {
        sql += ' AND vehicle_id = ?';
        params.push(vehicleId);
    }

    if (search) {
        sql += ' AND (garage_name LIKE ? OR plate_number LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY service_date DESC, maintenance_id DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
}

export async function getMaintenanceById(maintenanceId) {
    const [headerRows] = await pool.execute(
        `SELECT m.maintenance_id, m.vehicle_id, v.plate_number, p.name_th AS plate_province,
            m.service_date, m.garage_name, m.garage_type, m.receipt_number,
            m.mileage, m.next_service_mileage, m.created_at, m.updated_at
        FROM maintenances m
        JOIN vehicles v ON v.vehicle_id = m.vehicle_id
        JOIN provinces p ON p.province_id = v.plate_province_id
         WHERE m.maintenance_id = ?`,
        [maintenanceId]
    );

    const header = headerRows[0];
    if (!header) {
        throw new AppError('ไม่พบใบซ่อมนี้', 404);
    }

    const [items] = await pool.execute(
        `SELECT detail_id, service_type_id, service_type_name, service_category_id, service_category_name,
            service_item_id, service_item_name, quantity, unit_price, line_total, remark
        FROM view_maintenance_line_items
        WHERE maintenance_id = ?
        ORDER BY detail_id`,
        [maintenanceId]
    );

    const total_cost = items.reduce((sum, i) => sum + Number(i.line_total), 0);

    return { ...header, items, total_cost };
}

async function assertVehicleExists(conn, vehicleId) {
    const [rows] = await conn.execute('SELECT vehicle_id FROM vehicles WHERE vehicle_id = ? AND deleted = 0', [vehicleId]);
    if (rows.length === 0) {
        throw new AppError('ไม่พบรถคันนี้ หรือรถถูกปลดระวางไปแล้ว', 400);
    }
}

export async function createMaintenance(data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await assertVehicleExists(conn, data.vehicle_id);

        const [result] = await conn.execute(
            `INSERT INTO maintenances (vehicle_id, service_date, garage_name, garage_type, receipt_number, mileage, next_service_mileage)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.vehicle_id, data.service_date, data.garage_name, data.garage_type,
                    data.receipt_number || null, data.mileage, data.next_service_mileage ?? null,
                ]
        );

        const maintenanceId = result.insertId;

        for (const item of data.items) {
            await conn.execute(
                `INSERT INTO maintenance_details (maintenance_id, service_item_id, quantity, unit_price, remark)
                VALUES (?, ?, ?, ?, ?)`, [maintenanceId, item.service_item_id, item.quantity, item.unit_price, item.remark || null]
            );
        }

        await conn.commit();
        invalidateCache(OVERVIEW_CACHE_KEY);
        return getMaintenanceById(maintenanceId);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function updateMaintenance(maintenanceId, data) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [existing] = await conn.execute('SELECT maintenance_id FROM maintenances WHERE maintenance_id = ?', [maintenanceId]);
        if (existing.length === 0) {
            throw new AppError('ไม่พบใบซ่อมนี้', 404);
        }

        await assertVehicleExists(conn, data.vehicle_id);

        await conn.execute(
            `UPDATE maintenances
            SET vehicle_id = ?, service_date = ?, garage_name = ?, garage_type = ?,
                receipt_number = ?, mileage = ?, next_service_mileage = ?
            WHERE maintenance_id = ?`,
                [
                    data.vehicle_id, data.service_date, data.garage_name, data.garage_type,
                    data.receipt_number || null, data.mileage, data.next_service_mileage ?? null,
                    maintenanceId,
                ]
        );

        // แทนที่รายการย่อยทั้งหมด: ลบของเก่าทิ้งแล้วใส่ชุดใหม่ ง่ายกว่า diff ทีละบรรทัดและตรงกับพฤติกรรม "แก้ใบเสร็จ" จริง
        await conn.execute('DELETE FROM maintenance_details WHERE maintenance_id = ?', [maintenanceId]);

        for (const item of data.items) {
            await conn.execute(
                `INSERT INTO maintenance_details (maintenance_id, service_item_id, quantity, unit_price, remark)
                VALUES (?, ?, ?, ?, ?)`, [maintenanceId, item.service_item_id, item.quantity, item.unit_price, item.remark || null]
            );
        }

        await conn.commit();
        invalidateCache(OVERVIEW_CACHE_KEY);
        return getMaintenanceById(maintenanceId);
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

// hard delete ได้ตรงๆ เพราะตาราง maintenances ไม่มี column deleted (ไม่ได้ออกแบบ soft delete ไว้)
// และไม่มีตารางอื่นอ้างอิง maintenance_id แบบ RESTRICT — maintenance_details cascade ลบตามให้อัตโนมัติ
export async function deleteMaintenance(maintenanceId) {
    await getMaintenanceById(maintenanceId); // throw 404 ถ้าไม่มีจริง
    await pool.execute('DELETE FROM maintenances WHERE maintenance_id = ?', [maintenanceId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { maintenance_id: maintenanceId, deleted: true };
}