import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireRole, authenticate } from '../../middleware/auth.js';
import { createViolationSchema, updateViolationSchema } from './violations.schema.js';
import {
    listViolationsController,
    getViolationController,
    createViolationController,
    updateViolationController,
    deleteViolationController,
} from './violations.controller.js';

const violationsRouter = Router();

violationsRouter.get('/', authenticate, listViolationsController);
violationsRouter.get('/:id', authenticate, getViolationController);
violationsRouter.post('/', authenticate, requireRole('admin', 'manager', 'staff'), validate(createViolationSchema), createViolationController);
violationsRouter.put('/:id', authenticate, requireRole('admin', 'manager', 'staff'), validate(updateViolationSchema), updateViolationController);
violationsRouter.delete('/:id', authenticate, requireRole('admin', 'manager'), deleteViolationController);

export default violationsRouter;
