import pool from "../../config/db.js";
import { invalidateCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js"
import { OVERVIEW_CACHE_KEY } from "../overview/overview.service.js";

export async function listVehicles({ search, includeInactive, page, limit } = {}) {
    let where = 'WHERE 1 = 1';
    const params = [];

    if (!includeInactive) {
        where += ' AND v.deleted = 0';
    }

    if (search) {
        where += ' AND (v.plate_number LIKE ? OR v.brand_model LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    const baseSql = `
    SELECT
        v.vehicle_id, v.brand_model, v.plate_number, v.deleted,
        p.name_th AS plate_province,
        t.type_name, t.color AS type_color,
        d.driver_id, d.prefix, d.first_name, d.last_name,
        (COALESCE(doc_stats.doc_count, 0) < 2 OR COALESCE(doc_stats.expired_count, 0) > 0) AS documents_incomplete
    FROM vehicles v
    JOIN provinces p ON p.province_id = v.plate_province_id
    LEFT JOIN vehicle_type t ON t.type_id = v.type_id
    LEFT JOIN drivers d ON d.driver_id = v.driver_id
    LEFT JOIN (
        SELECT vehicle_id,
            COUNT(*) AS doc_count,
            SUM(CASE WHEN days_remaining < 0 THEN 1 ELSE 0 END) AS expired_count
        FROM view_current_documents
        GROUP BY vehicle_id
    ) doc_stats ON doc_stats.vehicle_id = v.vehicle_id
    ${where}
    ORDER BY v.vehicle_id DESC
  `;

    const mapRow = (r) => ({
        vehicle_id: r.vehicle_id,
        brand_model: r.brand_model,
        plate_number: r.plate_number,
        plate_province: r.plate_province,
        type_name: r.type_name,
        type_color: r.type_color,
        deleted: r.deleted,
        driver: r.driver_id ? { driver_id: r.driver_id, name: `${r.prefix}${r.first_name} ${r.last_name}` } : null,
        documents_incomplete: Boolean(r.documents_incomplete),
    });

    // ไม่ส่ง page/limit มา -> คืนทั้งหมดเหมือนพฤติกรรมเดิม (หน้าเว็บปัจจุบันแบ่งหน้าแบบ client-side)
    // ส่งมา -> แบ่งหน้าฝั่ง server แทน สำหรับ dataset ที่โตขึ้นในอนาคต
    if (page === undefined && limit === undefined) {
        const [rows] = await pool.execute(baseSql, params);
        return rows.map(mapRow);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM vehicles v ${where}`, params);

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(`${baseSql} LIMIT ? OFFSET ?`, [...params, safeLimit, offset]);
    return { vehicles: rows.map(mapRow), total, page: safePage, limit: safeLimit };
}

export async function getVehicleById(vehicleId) {
  const [rows] = await pool.execute(
    `SELECT
        v.vehicle_id, v.brand_model, v.plate_number, v.deleted, v.created_at, v.updated_at,
        p.province_id AS plate_province_id, p.name_th AS plate_province,
        t.type_id, t.type_name, t.color AS type_color,
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
    type: row.type_id ? { type_id: row.type_id, type_name: row.type_name, color: row.type_color } : null,
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

    // เอกสารแนบ (พรบ.+ภาษี/ประกัน) เป็นข้อมูลเสริม บันทึกก็ต่อเมื่อผู้ใช้กรอกมา
    if (data.act_tax) {
      await conn.execute(
        'INSERT INTO vehicle_act_tax (vehicle_id, insurance_company, last_paid_date, expire_date, premium_amount, fee_amount) VALUES (?, ?, ?, ?, ?, ?)',
        [vehicleId, data.act_tax.insurance_company, data.act_tax.last_paid_date, data.act_tax.expire_date, data.act_tax.premium_amount, data.act_tax.fee_amount]
      );
    }

    if (data.insurance) {
      await conn.execute(
        'INSERT INTO vehicle_insurances (vehicle_id, insurance_company, last_paid_date, expire_date) VALUES (?, ?, ?, ?)',
        [vehicleId, data.insurance.insurance_company, data.insurance.last_paid_date, data.insurance.expire_date]
      );
    }

    await conn.commit();
    invalidateCache(OVERVIEW_CACHE_KEY);
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

  invalidateCache(OVERVIEW_CACHE_KEY);
  return getVehicleById(vehicleId);
}

// soft delete เท่านั้น เพราะ vehicle_act_tax/vehicle_insurances/maintenances/violations
// อ้างอิง vehicle_id แบบ ON DELETE RESTRICT ทั้งหมด ต้องเก็บประวัติไว้เสมอ
export async function softDeleteVehicle(vehicleId) {
  await getVehicleById(vehicleId);
  await pool.execute('UPDATE vehicles SET deleted = 1 WHERE vehicle_id = ?', [vehicleId]);
  invalidateCache(OVERVIEW_CACHE_KEY);
  return { vehicle_id: vehicleId, deleted: true };
}

export async function restoreVehicle(vehicleId) {
  await getVehicleById(vehicleId);
  await pool.execute('UPDATE vehicles SET deleted = 0 WHERE vehicle_id = ?', [vehicleId]);
  invalidateCache(OVERVIEW_CACHE_KEY);
  return { vehicle_id: vehicleId, deleted: false };
}