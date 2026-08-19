import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { listLogsController } from './logs.controller.js';

const logsRouter = Router();

logsRouter.get('/', authenticate, requireRole('admin'), listLogsController);

export default logsRouter;
