import pool from "../../config/db.js";
import { AppError } from "../../middleware/errorHandler.js";
import { invalidateCache } from "../../config/cache.js";
import { OVERVIEW_CACHE_KEY } from "../overview/overview.service.js";

// map ประเภทเอกสาร -> ตาราง/คอลัมน์จริงในฐานข้อมูล ใช้เป็น whitelist กันเอา document_type ที่ validate แล้วไปต่อ SQL ตรงๆ
const DOCUMENT_TABLES = {
    act_tax: { table: 'vehicle_act_tax', idColumn: 'act_tax_id' },
    insurance: { table: 'vehicle_insurances', idColumn: 'insurance_id' },
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

// coverage_amount (ทุนประกัน) มีอยู่แค่ในตาราง vehicle_insurances เท่านั้น ต้อง select แยกตามประเภทเอกสาร
function coverageAmountSelect(documentType) {
    return documentType === 'insurance' ? ', d.coverage_amount' : '';
}

export async function getDocumentById(documentType, documentId) {
    const config = getConfig(documentType);

    const [rows] = await pool.execute(
        `SELECT d.${config.idColumn} AS document_id, d.vehicle_id, v.plate_number, p.name_th AS plate_province,
            d.insurance_company AS provider, d.last_paid_date, d.expire_date, d.amount${coverageAmountSelect(documentType)},
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

    const [rows] = await pool.execute(
        `SELECT d.${config.idColumn} AS document_id, d.vehicle_id, v.plate_number, p.name_th AS plate_province,
            d.insurance_company AS provider, d.last_paid_date, d.expire_date, d.amount${coverageAmountSelect(documentType)},
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

// สรุปเอกสารแบบ 1 แถวต่อรถ (พรบ.และภาษี + ประกันภาคสมัครใจ) ใช้ view_document_summary ที่ pivot view_current_documents ไว้แล้ว
export async function getDocumentSummary({ search } = {}) {
    let sql = `
        SELECT vehicle_id, plate_number, plate_province,
            act_tax_document_id, act_tax_expire_date, act_tax_days_remaining,
            insurance_document_id, insurance_expire_date, insurance_days_remaining
        FROM view_document_summary
        WHERE 1 = 1
    `;
    const params = [];

    if (search) {
        sql += ' AND plate_number LIKE ?';
        params.push(`%${search}%`);
    }

    sql += ' ORDER BY plate_number ASC';

    const [rows] = await pool.execute(sql, params);
    return rows.map((r) => ({
        vehicle_id: r.vehicle_id,
        plate_number: r.plate_number,
        plate_province: r.plate_province,
        act_tax: r.act_tax_document_id
            ? { document_id: r.act_tax_document_id, expire_date: r.act_tax_expire_date, days_remaining: r.act_tax_days_remaining }
            : null,
        insurance: r.insurance_document_id
            ? { document_id: r.insurance_document_id, expire_date: r.insurance_expire_date, days_remaining: r.insurance_days_remaining }
            : null,
    }));
}

// สรุปค่าใช้จ่ายต่ออายุเอกสารรายปี (พรบ.+ภาษี, ประกัน) จัดกลุ่มตาม "ปีที่จ่ายเงินจริง" (last_paid_date)
// ไม่ใช้ expire_date เพราะนั่นคือปีที่เอกสารหมดอายุ ไม่ใช่ปีที่เสียเงิน และไม่ใช้ view_current_documents
// เพราะ view นั้นกรองเหลือแค่ record ล่าสุด ตัดประวัติการต่ออายุทิ้งหมด ต้องอ่านตารางจริงตรงๆ
// record เก่าที่ไม่มี amount (NULL) จะถูกนับเป็น 0 บาทด้วย COALESCE แต่ปีนั้นยังคงถูกนับรวมอยู่
export async function getYearlyDocumentCost() {
    const [rows] = await pool.execute(`
        SELECT
            yearly.year AS year,
            SUM(CASE WHEN yearly.document_type = 'act_tax' THEN yearly.total ELSE 0 END) AS act_tax_cost,
            SUM(CASE WHEN yearly.document_type = 'insurance' THEN yearly.total ELSE 0 END) AS insurance_cost
        FROM (
            SELECT YEAR(last_paid_date) AS year, 'act_tax' AS document_type, COALESCE(SUM(amount), 0) AS total
            FROM vehicle_act_tax
            GROUP BY YEAR(last_paid_date)
            UNION ALL
            SELECT YEAR(last_paid_date) AS year, 'insurance' AS document_type, COALESCE(SUM(amount), 0) AS total
            FROM vehicle_insurances
            GROUP BY YEAR(last_paid_date)
        ) yearly
        GROUP BY yearly.year
        ORDER BY yearly.year DESC
    `);

    return rows.map((r) => ({
        year: r.year,
        act_tax_cost: Number(r.act_tax_cost),
        insurance_cost: Number(r.insurance_cost),
        total_cost: Number(r.act_tax_cost) + Number(r.insurance_cost),
    }));
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

    const isInsurance = data.document_type === 'insurance';
    const columns = ['vehicle_id', 'insurance_company', 'last_paid_date', 'expire_date', 'amount', ...(isInsurance ? ['coverage_amount'] : [])];
    const values = [data.vehicle_id, data.provider || null, data.last_paid_date, data.expire_date, data.amount ?? null, ...(isInsurance ? [data.coverage_amount ?? null] : [])];

    const [result] = await pool.execute(
        `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
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
    if (data.provider !== undefined) fieldMap.insurance_company = data.provider;
    if (data.amount !== undefined) fieldMap.amount = data.amount;
    if (documentType === 'insurance' && data.coverage_amount !== undefined) fieldMap.coverage_amount = data.coverage_amount;

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
