import { Router } from "express";
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createDriverSchema, updateDriverSchema } from './drivers.schema.js';
import {
    listDriversController,
    getDriverController,
    createDriverController,
    updateDriverController,
    deleteDriverController,
    restoreDriverController,
} from './drivers.controller.js';

const driversRouter = Router();

driversRouter.get('/', authenticate, listDriversController);
driversRouter.get('/:id', authenticate, getDriverController);
driversRouter.post('/', authenticate, requireRole('admin', 'manager'), validate(createDriverSchema), createDriverController);
driversRouter.put('/:id', authenticate, requireRole('admin', 'manager'), validate(updateDriverSchema), updateDriverController);
driversRouter.delete('/:id', authenticate, requireRole('admin'), deleteDriverController);
driversRouter.patch('/:id/restore', authenticate, requireRole('admin'), restoreDriverController);

export default driversRouter;