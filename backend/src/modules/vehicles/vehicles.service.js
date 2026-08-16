import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js"

const VEHICLES_CACHE_KEY = "vehicles.list";
const VEHICLES_CACHE_TTL = 3600; // 1 hour in seconds

export async function listVehicles({ search, includeInactive } = {}) {
    let sql = `
    SELECT
        v.vehicle_id, v.brand_model, v.plate_number, v.deleted,
        p.name_th AS plate_province,
        t.type_name,
        d.driver_id, d.prefix, d.first_name, d.last_name
    FROM vehicles v
    JOIN provinces p ON p.province_id = v.plate_province_id
    LEFT JOIN vehicle_type t ON t.type_id = v.type_id
    LEFT JOIN drivers d ON d.driver_id = v.driver_id
    WHERE 1 = 1
  `;
    const params = [];

    if (!includeInactive) {
        sql += ' AND v.deleted = 0';
    }

    if (search) {
        sql += ' AND (v.plate_number LIKE ? OR v.brand_model LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY v.vehicle_id DESC';

    const [rows] = await pool.execute(sql, params);

    return rows.map((r) => ({
        vehicle_id: r.vehicle_id,
        brand_model: r.brand_model,
        plate_number: r.plate_number,
        plate_province: r.plate_province,
        type_name: r.type_name,
        deleted: r.deleted,
        driver: r.driver_id ? { driver_id: r.driver_id, name: `${r.prefix}${r.first_name} ${r.last_name}` } : null,
    }));
}

export async function getVehicleById(vehicleId) {
  const [rows] = await pool.execute(
    `SELECT
        v.vehicle_id, v.brand_model, v.plate_number, v.deleted, v.created_at, v.updated_at,
        p.province_id AS plate_province_id, p.name_th AS plate_province,
        t.type_id, t.type_name,
        d.driver_id, d.prefix, d.first_name, d.last_name, d.phone AS driver_phone
     FROM vehicles v
     JOIN provinces p ON p.province_id = v.plate_province_id
     LEFT JOIN vehicle_type t ON t.type_id = v.type_id
     LEFT JOIN drivers d ON d.driver_id = v.driver_id
     WHERE v.vehicle_id = ?`,
    [vehicleId]
  );
 
  const row = rows[0];
  if (!row) {
    throw new AppError('ไม่พบข้อมูลรถคันนี้', 404);
  }
 
  // สถานะเอกสารล่าสุดของคันนี้ (ใช้ view_current_documents ที่กรองเอาแค่ record ล่าสุดต่อประเภทให้แล้ว)
  const [documents] = await pool.execute(
    `SELECT document_type, provider, last_paid_date, expire_date, days_remaining
     FROM view_current_documents
     WHERE vehicle_id = ?`,
    [vehicleId]
  );
 
  const [maintenances] = await pool.execute(
    `SELECT maintenance_id, service_date, garage_name, garage_type, total_items, total_cost
     FROM view_maintenance_summary
     WHERE vehicle_id = ?
     ORDER BY service_date DESC
     LIMIT 5`,
    [vehicleId]
  );
 
  const [[{ unpaid_count }]] = await pool.execute(
    'SELECT COUNT(*) AS unpaid_count FROM violations WHERE vehicle_id = ? AND is_paid = 0',
    [vehicleId]
  );
 
  return {
    vehicle_id: row.vehicle_id,
    brand_model: row.brand_model,
    plate_number: row.plate_number,
    plate_province_id: row.plate_province_id,
    plate_province: row.plate_province,
    deleted: row.deleted,
    created_at: row.created_at,
    updated_at: row.updated_at,
    type: row.type_id ? { type_id: row.type_id, type_name: row.type_name } : null,
    driver: row.driver_id
      ? { driver_id: row.driver_id, name: `${row.prefix}${row.first_name} ${row.last_name}`, phone: row.driver_phone }
      : null,
    documents,
    recent_maintenances: maintenances,
    unpaid_violations: unpaid_count,
  };
}
 
async function assertPlateNotDuplicate(plateNumber, plateProvinceId, excludeVehicleId = null) {
  let sql = 'SELECT vehicle_id FROM vehicles WHERE plate_number = ? AND plate_province_id = ?';
  const params = [plateNumber, plateProvinceId];
 
  if (excludeVehicleId) {
    sql += ' AND vehicle_id != ?';
    params.push(excludeVehicleId);
  }
 
  const [existing] = await pool.execute(sql, params);
  if (existing.length > 0) {
    throw new AppError('ทะเบียนรถนี้มีอยู่ในระบบแล้ว (จังหวัดเดียวกัน)', 409);
  }
}
 
export async function createVehicle(data) {
  await assertPlateNotDuplicate(data.plate_number, data.plate_province_id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO vehicles (brand_model, plate_number, plate_province_id, driver_id, type_id) VALUES (?, ?, ?, ?, ?)',
      [data.brand_model || null, data.plate_number, data.plate_province_id, data.driver_id || null, data.type_id || null]
    );
    const vehicleId = result.insertId;

    // เอกสารแนบ (พรบ./ภาษี/ประกัน) เป็นข้อมูลเสริม บันทึกก็ต่อเมื่อผู้ใช้กรอกมา
    if (data.act) {
      await conn.execute(
        'INSERT INTO vehicle_acts (vehicle_id, insurance_company, last_paid_date, expire_date, premium_amount) VALUES (?, ?, ?, ?, ?)',
        [vehicleId, data.act.insurance_company, data.act.last_paid_date, data.act.expire_date, data.act.premium_amount]
      );
    }

    if (data.tax) {
      await conn.execute(
        'INSERT INTO vehicle_taxes (vehicle_id, last_paid_date, expire_date, fee_amount) VALUES (?, ?, ?, ?)',
        [vehicleId, data.tax.last_paid_date, data.tax.expire_date, data.tax.fee_amount]
      );
    }

    if (data.insurance) {
      await conn.execute(
        'INSERT INTO vehicle_insurances (vehicle_id, insurance_company, last_paid_date, expire_date) VALUES (?, ?, ?, ?)',
        [vehicleId, data.insurance.insurance_company, data.insurance.last_paid_date, data.insurance.expire_date]
      );
    }

    await conn.commit();
    return getVehicleById(vehicleId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
 
export async function updateVehicle(vehicleId, data) {
  const current = await getVehicleById(vehicleId);
 
  if (data.plate_number || data.plate_province_id) {
    await assertPlateNotDuplicate(
      data.plate_number || current.plate_number,
      data.plate_province_id,
      vehicleId
    );
  }
 
  const fields = Object.keys(data);
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => data[f]);
 
  await pool.execute(`UPDATE vehicles SET ${setClause} WHERE vehicle_id = ?`, [...values, vehicleId]);
 
  return getVehicleById(vehicleId);
}
 
// soft delete เท่านั้น เพราะ vehicle_taxes/vehicle_acts/vehicle_insurances/maintenances/violations
// อ้างอิง vehicle_id แบบ ON DELETE RESTRICT ทั้งหมด ต้องเก็บประวัติไว้เสมอ
export async function softDeleteVehicle(vehicleId) {
  await getVehicleById(vehicleId);
  await pool.execute('UPDATE vehicles SET deleted = 1 WHERE vehicle_id = ?', [vehicleId]);
  return { vehicle_id: vehicleId, deleted: true };
}