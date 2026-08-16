import pool from "../../config/db.js";
import { getOrSetCache } from "../../config/cache.js";

const PROVINCE_LOOKUPS_CACHE_KEY = "PROVINCE_LOOKUPS";
const PROVINCE_LOOKUPS_CACHE_TTL = 0;

const VEHICLE_TYPE_CACHE_KEY = "VEHICLE_TYPE";
const VEHICLE_TYPE_CACHE_TTL = 0;

const SERVICE_CATALOG_CACHE_KEY = "SERVICE_CATALOG";
const SERVICE_CATALOG_CACHE_TTL = 0;

export async function getProvinceLookup() {
    return getOrSetCache(PROVINCE_LOOKUPS_CACHE_KEY, PROVINCE_LOOKUPS_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT province_id, name_th FROM provinces ORDER BY name_th');
        return rows;
    });
}

export async function getVehicleTypeLookup() {
    return getOrSetCache(VEHICLE_TYPE_CACHE_KEY, VEHICLE_TYPE_CACHE_TTL, async () => {
        const [rows] = await pool.execute('SELECT type_id, type_name FROM vehicle_type ORDER BY type_name');
        return rows;
    });
}

export async function getServiceCatalog() {
    return getOrSetCache(SERVICE_CATALOG_CACHE_KEY, SERVICE_CATALOG_CACHE_TTL, async () => {
        const [types] = await pool.execute('SELECT service_type_id, service_type_name FROM service_type ORDER BY service_type_id');
        const [categories] = await pool.execute(
            'SELECT service_category_id, service_category_name, service_type_id FROM service_category ORDER BY service_category_id'
        );
        const [items] = await pool.execute(
            'SELECT service_item_id, service_item_name, service_category_id FROM service_items ORDER BY service_item_id'
        );

        const catalog = types.map((t) => ({
            service_type_id: t.service_type_id,
            service_type_name: t.service_type_name,
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