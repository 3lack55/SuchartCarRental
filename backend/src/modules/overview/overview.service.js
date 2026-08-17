import pool from '../../config/db.js';
import { getOrSetCache } from '../../config/cache.js';

export const OVERVIEW_CACHE_KEY = 'overview.dashboard';
const OVERVIEW_CACHE_TTL = 60; // วินาที

export async function getOverview() {
    return getOrSetCache(OVERVIEW_CACHE_KEY, OVERVIEW_CACHE_TTL, async () => {
        const [results] = await pool.execute(`SELECT * FROM view_dashboard_overview;`);
        return results[0];
    });
}