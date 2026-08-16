import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireRole, authenticate } from '../../middleware/auth.js';
import { createMaintenanceSchema, updateMaintenanceSchema } from './maintenances.schema.js';
import {
    listMaintenancesController,
    getMaintenanceController,
    createMaintenanceController,
    updateMaintenanceController,
    deleteMaintenanceController,
} from './maintenances.controller.js';

const maintenanceRouter = Router();

maintenanceRouter.get('/', authenticate, listMaintenancesController);
maintenanceRouter.get('/:id', authenticate, getMaintenanceController);
maintenanceRouter.post('/', authenticate, requireRole('admin', 'manager', 'staff'), validate(createMaintenanceSchema), createMaintenanceController);
maintenanceRouter.put('/:id', authenticate, requireRole('admin', 'manager', 'staff'), validate(updateMaintenanceSchema), updateMaintenanceController);
maintenanceRouter.delete('/:id', authenticate, requireRole('admin', 'manager'), deleteMaintenanceController);

export default maintenanceRouter;