import pool from "../../config/db.js";
import getOrSetCache from "../../config/cache.js";

const DOCUMENTS_CACHE_KEY = "documents.list";
const DOCUMENTS_CACHE_TTL = 3600; // 1 hour in seconds

export async function getDocuments() {
    return getOrSetCache(DOCUMENTS_CACHE_KEY, DOCUMENTS_CACHE_TTL, async () => {
        const [rows] = await pool.query("SELECT * FROM view_document_expiry ORDER BY days_remaining;");
        return rows;
    });
}