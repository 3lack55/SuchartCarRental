import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireRole, authenticate } from '../../middleware/auth.js';
import { createVehicleSchema, updateVehicleSchema } from './vehicles.schema.js';
import {
  listVehiclesController,
  getVehicleController,
  createVehicleController,
  updateVehicleController,
  deleteVehicleController,
} from './vehicles.controller.js';

const vehiclesRouter = Router();

vehiclesRouter.get('/', authenticate, listVehiclesController);
vehiclesRouter.get('/:id', authenticate, getVehicleController);
vehiclesRouter.post('/', authenticate, requireRole('admin', 'manager'), validate(createVehicleSchema), createVehicleController);
vehiclesRouter.put('/:id', authenticate, requireRole('admin', 'manager'), validate(updateVehicleSchema), updateVehicleController);
vehiclesRouter.delete('/:id', authenticate, requireRole('admin'), deleteVehicleController);

export default vehiclesRouter;
