import * as vehiclesService from './vehicles.service.js';

export async function listVehiclesController(req, res, next) {
  try {
    const { search, includeInactive } = req.query;
    const vehicles = await vehiclesService.listVehicles({
      search,
      includeInactive: includeInactive === 'true',
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
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleController(req, res, next) {
  try {
    const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleController(req, res, next) {
  try {
    const result = await vehiclesService.softDeleteVehicle(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}