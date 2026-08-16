import * as maintenancesService from './maintenances.service.js';

export async function listMaintenancesController(req, res, next) {
    try {
        const { search, vehicle_id } = req.query;
        const maintenances = await maintenancesService.listMaintenances({
            search,
            vehicleId: vehicle_id ? Number(vehicle_id) : undefined,
        });
        res.json({ success: true, data: maintenances });
    } catch (err) {
        next(err);
    }
}

export async function getMaintenanceController(req, res, next) {
    try {
        const maintenance = await maintenancesService.getMaintenanceById(req.params.id);
        res.json({ success: true, data: maintenance });
    } catch (err) {
        next(err);
    }
}

export async function createMaintenanceController(req, res, next) {
    try {
        const maintenance = await maintenancesService.createMaintenance(req.body);
        res.status(201).json({ success: true, data: maintenance });
    } catch (err) {
        next(err);
    }
}

export async function updateMaintenanceController(req, res, next) {
    try {
        const maintenance = await maintenancesService.updateMaintenance(req.params.id, req.body);
        res.json({ success: true, data: maintenance });
    } catch (err) {
        next(err);
    }
}

export async function deleteMaintenanceController(req, res, next) {
    try {
        const result = await maintenancesService.deleteMaintenance(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}