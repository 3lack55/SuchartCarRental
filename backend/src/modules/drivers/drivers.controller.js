import { getDrivers } from "./drivers.service.js";

export async function getDriversController(req, res, next) {
    try {
        const drivers = await getDrivers();
        res.json({ success: true, data: drivers });
    } catch (err) {
        next(err);
    }
}