import * as maintenancesService from './maintenances.service.js';
import { logActivity } from '../../utils/activityLog.js';

export async function listMaintenancesController(req, res, next) {
    try {
        const { search, vehicle_id, page, limit } = req.query;
        const maintenances = await maintenancesService.listMaintenances({
            search,
            vehicleId: vehicle_id ? Number(vehicle_id) : undefined,
            page,
            limit,
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
        await logActivity(req, {
            action: 'maintenance.create',
            entity_type: 'maintenance',
            entity_id: maintenance.maintenance_id,
            description: `เพิ่มใบซ่อมบำรุงทะเบียน "${maintenance.plate_number}" ที่ "${maintenance.garage_name}"`,
        });
        res.status(201).json({ success: true, data: maintenance });
    } catch (err) {
        next(err);
    }
}

export async function updateMaintenanceController(req, res, next) {
    try {
        const maintenance = await maintenancesService.updateMaintenance(req.params.id, req.body);
        await logActivity(req, {
            action: 'maintenance.update',
            entity_type: 'maintenance',
            entity_id: maintenance.maintenance_id,
            description: `แก้ไขใบซ่อมบำรุงทะเบียน "${maintenance.plate_number}"`,
        });
        res.json({ success: true, data: maintenance });
    } catch (err) {
        next(err);
    }
}

export async function deleteMaintenanceController(req, res, next) {
    try {
        const result = await maintenancesService.deleteMaintenance(req.params.id);
        await logActivity(req, {
            action: 'maintenance.delete',
            entity_type: 'maintenance',
            entity_id: result.maintenance_id,
            description: `ลบใบซ่อมบำรุง maintenance_id=${result.maintenance_id}`,
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}