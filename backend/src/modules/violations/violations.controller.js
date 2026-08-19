import * as violationsService from './violations.service.js';
import { logActivity } from '../../utils/activityLog.js';

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
        await logActivity(req, {
            action: 'violation.create',
            entity_type: 'violation',
            entity_id: violation.violation_id,
            description: `เพิ่มบันทึกการฝ่าฝืนกฎจราจร ทะเบียน "${violation.plate_number}"`,
        });
        res.status(201).json({ success: true, data: violation });
    } catch (err) {
        next(err);
    }
}

export async function updateViolationController(req, res, next) {
    try {
        const violation = await violationsService.updateViolation(req.params.id, req.body);
        await logActivity(req, {
            action: 'violation.update',
            entity_type: 'violation',
            entity_id: violation.violation_id,
            description: `แก้ไขบันทึกการฝ่าฝืนกฎจราจร ทะเบียน "${violation.plate_number}"`,
        });
        res.json({ success: true, data: violation });
    } catch (err) {
        next(err);
    }
}

export async function deleteViolationController(req, res, next) {
    try {
        const result = await violationsService.deleteViolation(req.params.id);
        await logActivity(req, {
            action: 'violation.delete',
            entity_type: 'violation',
            entity_id: result.violation_id,
            description: `ลบบันทึกการฝ่าฝืนกฎจราจร violation_id=${result.violation_id}`,
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}
