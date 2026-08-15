import { getProvinceLookup, getVehicleType } from "./lookups.service.js";

export async function getProvinceLookupController(req, res, next) {
    try {
        const provinces = await getProvinceLookup();
        res.json({ success: true, data: provinces });
    } catch (err) {
        next(err);
    }
}

export async function getVehicleTypeController(req, res, next) {
    try {
        const vType = await getVehicleType();
        res.json({ success: true, data: vType });
    } catch (err) {
        next(err);
    }
}