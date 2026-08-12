import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";

const VEHICLES_CACHE_KEY = "vehicles.list";
const VEHICLES_CACHE_TTL = 3600; // 1 hour in seconds

export async function getVehicles() {
    return getOrSetCache(VEHICLES_CACHE_KEY, VEHICLES_CACHE_TTL, async () => {
        const [results] = await pool.execute(`
            SELECT 
	            v.vehicle_id,
	            v.brand_model as model,
                concat(v.plate_number, ' ', p.name_th) as plate,
                v.type_id,
                vt.type_name,
                d.driver_id,
                d.first_name,
                d.last_name,
                v.created_at
            FROM vehicles AS v 
            LEFT JOIN provinces AS p ON v.plate_province_id = p.province_id
            LEFT JOIN vehicle_type AS vt ON v.type_id = vt.type_id
            LEFT JOIN drivers AS d ON v.driver_id = d.driver_id;
        `);
        return results;
    });
}