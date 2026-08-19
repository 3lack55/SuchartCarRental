import * as vehiclesService from './vehicles.service.js';
import { logActivity } from '../../utils/activityLog.js';

export async function listVehiclesController(req, res, next) {
  try {
    const { search, includeInactive, page, limit } = req.query;
    const vehicles = await vehiclesService.listVehicles({
      search,
      includeInactive: includeInactive === 'true',
      page,
      limit,
    });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
}

export async function getVehicleController(req, res, next) {
  try {
    const vehicle = await vehiclesService.getVehicleById(req.params.id);
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function createVehicleController(req, res, next) {
  try {
    const vehicle = await vehiclesService.createVehicle(req.body);
    await logActivity(req, {
      action: 'vehicle.create',
      entity_type: 'vehicle',
      entity_id: vehicle.vehicle_id,
      description: `เพิ่มรถยนต์ทะเบียน "${vehicle.plate_number}"`,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleController(req, res, next) {
  try {
    const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
    await logActivity(req, {
      action: 'vehicle.update',
      entity_type: 'vehicle',
      entity_id: vehicle.vehicle_id,
      description: `แก้ไขข้อมูลรถยนต์ทะเบียน "${vehicle.plate_number}"`,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleController(req, res, next) {
  try {
    const result = await vehiclesService.softDeleteVehicle(req.params.id);
    await logActivity(req, {
      action: 'vehicle.delete',
      entity_type: 'vehicle',
      entity_id: result.vehicle_id,
      description: `ลบรถยนต์ vehicle_id=${result.vehicle_id}`,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function restoreVehicleController(req, res, next) {
  try {
    const result = await vehiclesService.restoreVehicle(req.params.id);
    await logActivity(req, {
      action: 'vehicle.restore',
      entity_type: 'vehicle',
      entity_id: result.vehicle_id,
      description: `กู้คืนรถยนต์ vehicle_id=${result.vehicle_id}`,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}