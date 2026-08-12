import { getOverview } from "./overview.service.js";

export async function getOverviewController(req, res, next) {
    try {
        const overviewData = await getOverview();
        res.json({ success: true, data: overviewData });
    } catch (err) {
        next(err);
    }
}