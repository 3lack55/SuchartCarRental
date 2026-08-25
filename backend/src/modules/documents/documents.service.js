import pool from "../../config/db.js";
import { AppError } from "../../middleware/errorHandler.js";
import { invalidateCache } from "../../config/cache.js";
import { OVERVIEW_CACHE_KEY } from "../overview/overview.service.js";

// map ประเภทเอกสาร -> ตาราง/คอลัมน์จริงในฐานข้อมูล ใช้เป็น whitelist กันเอา document_type ที่ validate แล้วไปต่อ SQL ตรงๆ
const DOCUMENT_TABLES = {
    act_tax: { table: 'vehicle_act_tax', idColumn: 'act_tax_id', hasProvider: true, amountColumns: ['premium_amount', 'fee_amount'] },
    insurance: { table: 'vehicle_insurances', idColumn: 'insurance_id', hasProvider: true, amountColumns: [] },
};

function getConfig(documentType) {
    const config = DOCUMENT_TABLES[documentType];
    if (!config) {
        throw new AppError('ประเภทเอกสารไม่ถูกต้อง', 400);
    }
    return config;
}

// รายการเอกสารล่าสุด (renewal ล่าสุด) ของแต่ละคัน/ประเภท ใช้ view_current_documents ที่กรองเอาแค่ record ล่าสุดให้แล้ว
export async function listCurrentDocuments({ search, documentType, status } = {}) {
    let sql = `
        SELECT document_type, document_id, vehicle_id, plate_number, plate_province,
            provider, last_paid_date, expire_date, days_remaining
        FROM view_current_documents
        WHERE 1 = 1
    `;
    const params = [];

    if (documentType) {
        sql += ' AND document_type = ?';
        params.push(documentType);
    }

    if (search) {
        sql += ' AND plate_number LIKE ?';
        params.push(`%${search}%`);
    }

    if (status === 'expired') {
        sql += ' AND days_remaining < 0';
    } else if (status === 'expiring') {
        sql += ' AND days_remaining BETWEEN 0 AND 30';
    } else if (status === 'valid') {
        sql += ' AND days_remaining > 30';
    }

    sql += ' ORDER BY days_remaining ASC';

    const [rows] = await pool.execute(sql, params);
    return rows;
}

function amountSelectClause(config, alias = 'd') {
    return config.amountColumns.map((col) => `${alias}.${col} AS ${col}`);
}

// ดึงจากตารางจริงตรงๆ เพื่อเอาฟิลด์ยอดเงิน (premium_amount/fee_amount) มาด้วย ซึ่ง view ไม่มี
export async function getDocumentById(documentType, documentId) {
    const config = getConfig(documentType);

    const providerSelect = config.hasProvider ? 'd.insurance_company AS provider' : 'NULL AS provider';
    const amountSelects = amountSelectClause(config);

    const [rows] = await pool.execute(
        `SELECT d.${config.idColumn} AS document_id, d.vehicle_id, v.plate_number, p.name_th AS plate_province,
            ${providerSelect}, d.last_paid_date, d.expire_date, ${amountSelects.join(', ')}${amountSelects.length ? ',' : ''}
            (TO_DAYS(d.expire_date) - TO_DAYS(CURDATE())) AS days_remaining
        FROM ${config.table} d
        JOIN vehicles v ON v.vehicle_id = d.vehicle_id
        JOIN provinces p ON p.province_id = v.plate_province_id
        WHERE d.${config.idColumn} = ?`,
        [documentId]
    );

    const document = rows[0];
    if (!document) {
        throw new AppError('ไม่พบข้อมูลเอกสารนี้', 404);
    }

    return { document_type: documentType, ...document };
}

// ประวัติทั้งหมดของรถคันนี้ + ประเภทเอกสารนี้ (ทุกรอบต่ออายุ เรียงล่าสุดก่อน) ดึงจากตารางจริงเพราะ view เก็บแค่รอบล่าสุด
export async function listDocumentHistory(documentType, vehicleId) {
    const config = getConfig(documentType);

    const providerSelect = config.hasProvider ? 'd.insurance_company AS provider' : 'NULL AS provider';
    const amountSelects = amountSelectClause(config);

    const [rows] = await pool.execute(
        `SELECT d.${config.idColumn} AS document_id, d.vehicle_id, v.plate_number, p.name_th AS plate_province,
            ${providerSelect}, d.last_paid_date, d.expire_date, ${amountSelects.join(', ')}${amountSelects.length ? ',' : ''}
            (TO_DAYS(d.expire_date) - TO_DAYS(CURDATE())) AS days_remaining
        FROM ${config.table} d
        JOIN vehicles v ON v.vehicle_id = d.vehicle_id
        JOIN provinces p ON p.province_id = v.plate_province_id
        WHERE d.vehicle_id = ?
        ORDER BY d.expire_date DESC`,
        [vehicleId]
    );

    return rows.map((row) => ({ document_type: documentType, ...row }));
}

async function assertVehicleExists(vehicleId) {
    const [rows] = await pool.execute('SELECT vehicle_id FROM vehicles WHERE vehicle_id = ? AND deleted = 0', [vehicleId]);
    if (rows.length === 0) {
        throw new AppError('ไม่พบรถคันนี้ หรือรถถูกปลดระวางไปแล้ว', 400);
    }
}

// เอกสารใหม่ = ต่ออายุ: insert แถวใหม่เสมอ (ไม่ทับของเดิม) เพื่อเก็บประวัติการต่ออายุไว้ครบ
export async function createDocument(data) {
    const config = getConfig(data.document_type);
    await assertVehicleExists(data.vehicle_id);

    const columns = ['vehicle_id', 'last_paid_date', 'expire_date'];
    const values = [data.vehicle_id, data.last_paid_date, data.expire_date];

    if (config.hasProvider) {
        columns.push('insurance_company');
        values.push(data.provider);
    }

    for (const col of config.amountColumns) {
        columns.push(col);
        values.push(data[col]);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const [result] = await pool.execute(
        `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
    );

    invalidateCache(OVERVIEW_CACHE_KEY);
    return getDocumentById(data.document_type, result.insertId);
}

// แก้ไข: สำหรับแก้ข้อมูลผิดพลาดของ record ที่มีอยู่ (ไม่ใช่การต่ออายุ)
export async function updateDocument(documentType, documentId, data) {
    const config = getConfig(documentType);
    await getDocumentById(documentType, documentId); // throw 404 ถ้าไม่มีจริง

    const fieldMap = {};
    if (data.last_paid_date) fieldMap.last_paid_date = data.last_paid_date;
    if (data.expire_date) fieldMap.expire_date = data.expire_date;
    if (config.hasProvider && data.provider) fieldMap.insurance_company = data.provider;
    for (const col of config.amountColumns) {
        if (data[col] !== undefined) fieldMap[col] = data[col];
    }

    const fields = Object.keys(fieldMap);
    if (fields.length === 0) {
        throw new AppError('ไม่มีข้อมูลให้แก้ไข', 400);
    }

    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => fieldMap[f]);

    await pool.execute(`UPDATE ${config.table} SET ${setClause} WHERE ${config.idColumn} = ?`, [...values, documentId]);

    invalidateCache(OVERVIEW_CACHE_KEY);
    return getDocumentById(documentType, documentId);
}

// hard delete ได้ตรงๆ เพราะตาราง vehicle_act_tax/vehicle_insurances ไม่มี column deleted
export async function deleteDocument(documentType, documentId) {
    const config = getConfig(documentType);
    await getDocumentById(documentType, documentId);

    await pool.execute(`DELETE FROM ${config.table} WHERE ${config.idColumn} = ?`, [documentId]);
    invalidateCache(OVERVIEW_CACHE_KEY);
    return { document_type: documentType, document_id: documentId, deleted: true };
}
