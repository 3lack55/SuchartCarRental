import { Router } from "express";
import { validate } from '../../middleware/validate.js';
import { requireRole, authenticate } from '../../middleware/auth.js';
import { createDocumentSchema, updateDocumentSchema } from './documents.schema.js';
import {
    listDocumentsController,
    getDocumentController,
    getDocumentHistoryController,
    createDocumentController,
    updateDocumentController,
    deleteDocumentController,
} from "./documents.controller.js";

const documentsRouter = Router();

documentsRouter.get('/', authenticate, listDocumentsController);
documentsRouter.get('/:type/history/:vehicleId', authenticate, getDocumentHistoryController);
documentsRouter.get('/:type/:id', authenticate, getDocumentController);
documentsRouter.post('/', authenticate, requireRole('admin', 'manager', 'staff'), validate(createDocumentSchema), createDocumentController);
documentsRouter.put('/:type/:id', authenticate, requireRole('admin', 'manager', 'staff'), validate(updateDocumentSchema), updateDocumentController);
documentsRouter.delete('/:type/:id', authenticate, requireRole('admin', 'manager'), deleteDocumentController);

export default documentsRouter;
