import { getProvinceLookup, getVehicleTypeLookup, getServiceCatalog, getViolationReasonsLookup } from "./lookups.service.js";

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
        const vType = await getVehicleTypeLookup();
        res.json({ success: true, data: vType });
    } catch (err) {
        next(err);
    }
}

export async function getServiceCatalogController(req, res, next) {
    try {
        const catalog = await getServiceCatalog();
        res.json({ success: true, data: catalog});
    } catch (err) {
        next(err);
    }

}

export async function getViolationReasonsController(req, res, next) {
    try {
        const reasons = await getViolationReasonsLookup();
        res.json({ success: true, data: reasons });
    } catch (err) {
        next(err);
    }
}