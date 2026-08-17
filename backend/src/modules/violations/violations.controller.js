import * as violationsService from './violations.service.js';

export async function listViolationsController(req, res, next) {
    try {
        const { search, driver_id, vehicle_id, is_paid } = req.query;
        const violations = await violationsService.listViolations({
            search,
            driverId: driver_id ? Number(driver_id) : undefined,
            vehicleId: vehicle_id ? Number(vehicle_id) : undefined,
            isPaid: is_paid === undefined ? undefined : is_paid === 'true',
        });
        res.json({ success: true, data: violations });
    } catch (err) {
        next(err);
    }
}

export async function getViolationController(req, res, next) {
    try {
        const violation = await violationsService.getViolationById(req.params.id);
        res.json({ success: true, data: violation });
    } catch (err) {
        next(err);
    }
}

export async function createViolationController(req, res, next) {
    try {
        const violation = await violationsService.createViolation(req.body);
        res.status(201).json({ success: true, data: violation });
    } catch (err) {
        next(err);
    }
}

export async function updateViolationController(req, res, next) {
    try {
        const violation = await violationsService.updateViolation(req.params.id, req.body);
        res.json({ success: true, data: violation });
    } catch (err) {
        next(err);
    }
}

export async function deleteViolationController(req, res, next) {
    try {
        const result = await violationsService.deleteViolation(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}
