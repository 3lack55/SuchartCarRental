import pool from "../../config/db.js";
import { getOrSetCache, invalidateCache } from "../../config/cache.js";
import { AppError } from "../../middleware/errorHandler.js";

const PROVINCE_LOOKUPS_CACHE_KEY = "PROVINCE_LOOKUPS";
const PROVINCE_LOOKUPS_CACHE_TTL = 0;

const VEHICLE_TYPE_CACHE_KEY = "VEHICLE_TYPE";
const VEHICLE_TYPE_CACHE_TTL = 0;

const SERVICE_CATALOG_CACHE_KEY = "SERVICE_CATALOG";
const SERVICE_CATALOG_CACHE_TTL = 0;

const VIOLATION_REASONS_CACHE_KEY = "VIOLATION_REASONS";
const VIOLATION_REASONS_CACHE_TTL = 0;

export async function getProvinceLookup() {
    return getOrSetCache(PROVINCE_LOOKUPS_CACHE_KEY, PROVINCE_LOOKUPS_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT province_id, name_th FROM provinces ORDER BY name_th');
        return rows;
    });
}

export async function getVehicleTypeLookup() {
    return getOrSetCache(VEHICLE_TYPE_CACHE_KEY, VEHICLE_TYPE_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT type_id, type_name, color FROM vehicle_type ORDER BY type_name');
        return rows;
    });
}

export async function getServiceCatalog() {
    return getOrSetCache(SERVICE_CATALOG_CACHE_KEY, SERVICE_CATALOG_CACHE_TTL, async () => {
        const [types] = await pool.execute('SELECT service_type_id, service_type_name, color FROM service_type ORDER BY service_type_id');
        const [categories] = await pool.execute(
            'SELECT service_category_id, service_category_name, service_type_id FROM service_category ORDER BY service_category_id'
        );
        const [items] = await pool.execute(
            'SELECT service_item_id, service_item_name, service_category_id FROM service_items ORDER BY service_item_id'
        );

        const catalog = types.map((t) => ({
            service_type_id: t.service_type_id,
            service_type_name: t.service_type_name,
            color: t.color,
            categories: categories
                .filter((c) => c.service_type_id === t.service_type_id)
                .map((c) => ({
                    service_category_id: c.service_category_id,
                    service_category_name: c.service_category_name,
                    items: items
                        .filter((i) => i.service_category_id === c.service_category_id)
                        .map((i) => ({ service_item_id: i.service_item_id, service_item_name: i.service_item_name })),
                })),
        }));

        return catalog;
    });
}

export async function getViolationReasonsLookup() {
    return getOrSetCache(VIOLATION_REASONS_CACHE_KEY, VIOLATION_REASONS_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT reason_id, reason_name FROM violations_reasons ORDER BY reason_name');
        return rows;
    });
}

// helper สำหรับตาราง lookup ที่ห้ามมีชื่อซ้ำในขอบเขตเดียวกัน (เช่น ซ้ำได้ถ้าอยู่คนละ service_type_id)
async function assertNameUnique(table, idColumn, nameColumn, name, excludeId, message, scopeColumn, scopeValue) {
    let sql = `SELECT ${idColumn} FROM ${table} WHERE ${nameColumn} = ?`;
    const params = [name];

    if (scopeColumn) {
        sql += ` AND ${scopeColumn} = ?`;
        params.push(scopeValue);
    }
    if (excludeId) {
        sql += ` AND ${idColumn} != ?`;
        params.push(excludeId);
    }

    const [rows] = await pool.execute(sql, params);
    if (rows.length > 0) {
        throw new AppError(message, 409);
    }
}

// ตารางที่ถูกอ้างอิงแบบ ON DELETE RESTRICT (service_type/category/items, violations_reasons)
// จะลบไม่ได้ถ้ายังมีข้อมูลอื่นอ้างอิงอยู่ -> แปลง FK error (errno 1451) เป็นข้อความที่เข้าใจง่าย
async function deleteRowOrThrow(sql, params, notFoundMessage, conflictMessage) {
    try {
        const [result] = await pool.execute(sql, params);
        if (result.affectedRows === 0) {
            throw new AppError(notFoundMessage, 404);
        }
    } catch (err) {
        if (err.errno === 1451) {
            throw new AppError(conflictMessage, 409);
        }
        throw err;
    }
}

// ---------- ประเภทรถ (vehicle_type) ----------

export async function createVehicleType(name, color) {
    await assertNameUnique('vehicle_type', 'type_id', 'type_name', name, null, 'ประเภทรถนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('INSERT INTO vehicle_type (type_name, color) VALUES (?, ?)', [name, color || null]);
    invalidateCache(VEHICLE_TYPE_CACHE_KEY);
    return { type_id: result.insertId, type_name: name, color: color || null };
}

export async function updateVehicleType(typeId, name, color) {
    await assertNameUnique('vehicle_type', 'type_id', 'type_name', name, typeId, 'ประเภทรถนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('UPDATE vehicle_type SET type_name = ?, color = ? WHERE type_id = ?', [name, color || null, typeId]);
    if (result.affectedRows === 0) {
        throw new AppError('ไม่พบประเภทรถนี้', 404);
    }
    invalidateCache(VEHICLE_TYPE_CACHE_KEY);
    return { type_id: Number(typeId), type_name: name, color: color || null };
}

// รถที่อ้างอิงประเภทนี้อยู่จะถูกตั้งค่า type_id เป็น NULL อัตโนมัติ (ON DELETE SET NULL) จึงลบได้เสมอ
export async function deleteVehicleType(typeId) {
    await deleteRowOrThrow(
        'DELETE FROM vehicle_type WHERE type_id = ?',
        [typeId],
        'ไม่พบประเภทรถนี้',
        'ไม่สามารถลบประเภทรถนี้ได้'
    );
    invalidateCache(VEHICLE_TYPE_CACHE_KEY);
    return { type_id: Number(typeId), deleted: true };
}

// ---------- สาเหตุการฝ่าฝืนกฎจราจร (violations_reasons) ----------

export async function createViolationReason(name) {
    await assertNameUnique('violations_reasons', 'reason_id', 'reason_name', name, null, 'สาเหตุนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('INSERT INTO violations_reasons (reason_name) VALUES (?)', [name]);
    invalidateCache(VIOLATION_REASONS_CACHE_KEY);
    return { reason_id: result.insertId, reason_name: name };
}

export async function updateViolationReason(reasonId, name) {
    await assertNameUnique('violations_reasons', 'reason_id', 'reason_name', name, reasonId, 'สาเหตุนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('UPDATE violations_reasons SET reason_name = ? WHERE reason_id = ?', [name, reasonId]);
    if (result.affectedRows === 0) {
        throw new AppError('ไม่พบสาเหตุนี้', 404);
    }
    invalidateCache(VIOLATION_REASONS_CACHE_KEY);
    return { reason_id: Number(reasonId), reason_name: name };
}

export async function deleteViolationReason(reasonId) {
    await deleteRowOrThrow(
        'DELETE FROM violations_reasons WHERE reason_id = ?',
        [reasonId],
        'ไม่พบสาเหตุนี้',
        'ไม่สามารถลบสาเหตุนี้ได้ เนื่องจากมีการฝ่าฝืนกฎจราจรที่อ้างอิงสาเหตุนี้อยู่'
    );
    invalidateCache(VIOLATION_REASONS_CACHE_KEY);
    return { reason_id: Number(reasonId), deleted: true };
}

// ---------- แคตตาล็อกบริการซ่อมบำรุง (service_type / service_category / service_items) ----------

export async function createServiceType(name, color) {
    await assertNameUnique('service_type', 'service_type_id', 'service_type_name', name, null, 'ประเภทบริการนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('INSERT INTO service_type (service_type_name, color) VALUES (?, ?)', [name, color || null]);
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_type_id: result.insertId, service_type_name: name, color: color || null };
}

export async function updateServiceType(serviceTypeId, name, color) {
    await assertNameUnique('service_type', 'service_type_id', 'service_type_name', name, serviceTypeId, 'ประเภทบริการนี้มีอยู่ในระบบแล้ว');
    const [result] = await pool.execute('UPDATE service_type SET service_type_name = ?, color = ? WHERE service_type_id = ?', [name, color || null, serviceTypeId]);
    if (result.affectedRows === 0) {
        throw new AppError('ไม่พบประเภทบริการนี้', 404);
    }
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_type_id: Number(serviceTypeId), service_type_name: name, color: color || null };
}

export async function deleteServiceType(serviceTypeId) {
    await deleteRowOrThrow(
        'DELETE FROM service_type WHERE service_type_id = ?',
        [serviceTypeId],
        'ไม่พบประเภทบริการนี้',
        'ไม่สามารถลบประเภทบริการนี้ได้ เนื่องจากยังมีหมวดหมู่บริการอยู่ภายใต้ประเภทนี้'
    );
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_type_id: Number(serviceTypeId), deleted: true };
}

export async function createServiceCategory(name, serviceTypeId) {
    await assertNameUnique(
        'service_category', 'service_category_id', 'service_category_name', name, null,
        'หมวดหมู่บริการนี้มีอยู่ในประเภทบริการนี้แล้ว', 'service_type_id', serviceTypeId
    );
    const [result] = await pool.execute(
        'INSERT INTO service_category (service_category_name, service_type_id) VALUES (?, ?)',
        [name, serviceTypeId]
    );
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_category_id: result.insertId, service_category_name: name, service_type_id: serviceTypeId };
}

export async function updateServiceCategory(categoryId, name, serviceTypeId) {
    await assertNameUnique(
        'service_category', 'service_category_id', 'service_category_name', name, categoryId,
        'หมวดหมู่บริการนี้มีอยู่ในประเภทบริการนี้แล้ว', 'service_type_id', serviceTypeId
    );
    const [result] = await pool.execute(
        'UPDATE service_category SET service_category_name = ?, service_type_id = ? WHERE service_category_id = ?',
        [name, serviceTypeId, categoryId]
    );
    if (result.affectedRows === 0) {
        throw new AppError('ไม่พบหมวดหมู่บริการนี้', 404);
    }
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_category_id: Number(categoryId), service_category_name: name, service_type_id: serviceTypeId };
}

export async function deleteServiceCategory(categoryId) {
    await deleteRowOrThrow(
        'DELETE FROM service_category WHERE service_category_id = ?',
        [categoryId],
        'ไม่พบหมวดหมู่บริการนี้',
        'ไม่สามารถลบหมวดหมู่บริการนี้ได้ เนื่องจากยังมีรายการบริการอยู่ภายใต้หมวดหมู่นี้'
    );
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_category_id: Number(categoryId), deleted: true };
}

export async function createServiceItem(name, categoryId) {
    await assertNameUnique(
        'service_items', 'service_item_id', 'service_item_name', name, null,
        'รายการบริการนี้มีอยู่ในหมวดหมู่นี้แล้ว', 'service_category_id', categoryId
    );
    const [result] = await pool.execute(
        'INSERT INTO service_items (service_item_name, service_category_id) VALUES (?, ?)',
        [name, categoryId]
    );
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_item_id: result.insertId, service_item_name: name, service_category_id: categoryId };
}

export async function updateServiceItem(itemId, name, categoryId) {
    await assertNameUnique(
        'service_items', 'service_item_id', 'service_item_name', name, itemId,
        'รายการบริการนี้มีอยู่ในหมวดหมู่นี้แล้ว', 'service_category_id', categoryId
    );
    const [result] = await pool.execute(
        'UPDATE service_items SET service_item_name = ?, service_category_id = ? WHERE service_item_id = ?',
        [name, categoryId, itemId]
    );
    if (result.affectedRows === 0) {
        throw new AppError('ไม่พบรายการบริการนี้', 404);
    }
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_item_id: Number(itemId), service_item_name: name, service_category_id: categoryId };
}

export async function deleteServiceItem(itemId) {
    await deleteRowOrThrow(
        'DELETE FROM service_items WHERE service_item_id = ?',
        [itemId],
        'ไม่พบรายการบริการนี้',
        'ไม่สามารถลบรายการบริการนี้ได้ เนื่องจากมีการใช้งานในประวัติการซ่อมบำรุงแล้ว'
    );
    invalidateCache(SERVICE_CATALOG_CACHE_KEY);
    return { service_item_id: Number(itemId), deleted: true };
}