import * as driversService from './drivers.service.js';
import { logActivity } from '../../utils/activityLog.js';

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
        await logActivity(req, {
            action: 'driver.create',
            entity_type: 'driver',
            entity_id: driver.driver_id,
            description: `เพิ่มคนขับ "${driver.prefix}${driver.first_name} ${driver.last_name}"`,
        });
        res.status(201).json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
}

export async function updateDriverController(req, res, next) {
    try {
        const driver = await driversService.updateDriver(req.params.id, req.body);
        await logActivity(req, {
            action: 'driver.update',
            entity_type: 'driver',
            entity_id: driver.driver_id,
            description: `แก้ไขข้อมูลคนขับ "${driver.prefix}${driver.first_name} ${driver.last_name}"`,
        });
        res.json({ success: true, data: driver });
    } catch (err) {
        next(err);
    }
}

export async function deleteDriverController(req, res, next) {
    try {
        const result = await driversService.softDeleteDriver(req.params.id);
        await logActivity(req, {
            action: 'driver.delete',
            entity_type: 'driver',
            entity_id: result.driver_id,
            description: `ลบคนขับ driver_id=${result.driver_id}`,
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function restoreDriverController(req, res, next) {
    try {
        const result = await driversService.restoreDriver(req.params.id);
        await logActivity(req, {
            action: 'driver.restore',
            entity_type: 'driver',
            entity_id: result.driver_id,
            description: `กู้คืนคนขับ driver_id=${result.driver_id}`,
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}