import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";

const PROVINCE_LOOKUPS_CACHE_KEY = "PROVINCE_LOOKUPS";
const PROVINCE_LOOKUPS_CACHE_TTL = 0; 

const VEHICLE_TYPE_CACHE_KEY = "VEHICLE_TYPE";
const VEHICLE_TYPE_CACHE_TTL = 0; 

export async function getProvinceLookup() {
    return getOrSetCache(PROVINCE_LOOKUPS_CACHE_KEY, PROVINCE_LOOKUPS_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT province_id, name_th FROM provinces ORDER BY name_th');
        return rows;
    });
}

export async function getVehicleType() {
    return getOrSetCache(VEHICLE_TYPE_CACHE_KEY, VEHICLE_TYPE_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT type_id, type_name FROM vehicle_type ORDER BY type_name');
        return rows;
    });
}