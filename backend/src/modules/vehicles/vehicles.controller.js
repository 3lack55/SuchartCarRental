import { getVehicles } from "./vehicles.service.js";

export async function getVehiclesController(req, res, next) {
    try {
        const vehicles = await getVehicles();
        res.json({ success: true, data: vehicles });
    } catch (err) {
        next(err);
    }
}