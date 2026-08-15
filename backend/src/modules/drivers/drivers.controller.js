import * as driversService from './drivers.service.js';

export async function listDriversController(req, res, next) {
    try {
        const { search, includeInactive } = req.query;
        const drivers = await driversService.listDrivers({
            search,
            includeInactive: includeInactive === 'true',
        });
        res.json({ success: true, data: drivers });
    } catch (err) {
        next(err);
    }
}

export async function getDriverController(req, res, next) {
    try {
        const driver = await driversService.getDriverById(req.params.id);
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
}

export async function createDriverController(req, res, next) {
    try {
        const driver = await driversService.createDriver(req.body);
        res.status(201).json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
}

export async function updateDriverController(req, res, next) {
    try {
        const driver = await driversService.updateDriver(req.params.id, req.body);
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
}

export async function deleteDriverController(req, res, next) {
    try {
        const result = await driversService.softDeleteDriver(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}