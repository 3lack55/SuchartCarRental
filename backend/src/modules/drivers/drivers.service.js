import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";

const DRIVERS_CACHE_KEY = "drivers.list";
const DRIVERS_CACHE_TTL = 3600; // 1 hour in seconds

export async function getDrivers() {
    return getOrSetCache(DRIVERS_CACHE_KEY, DRIVERS_CACHE_TTL, async () => {
        const [results] = await pool.execute(`SELECT * FROM drivers;`);
        return results;
    });
}