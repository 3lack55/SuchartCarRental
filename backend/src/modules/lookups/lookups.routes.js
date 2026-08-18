import {
    getProvinceLookupController,
    getVehicleTypeController,
    getServiceCatalogController,
    getViolationReasonsController,
    createVehicleTypeController,
    updateVehicleTypeController,
    deleteVehicleTypeController,
    createViolationReasonController,
    updateViolationReasonController,
    deleteViolationReasonController,
    createServiceTypeController,
    updateServiceTypeController,
    deleteServiceTypeController,
    createServiceCategoryController,
    updateServiceCategoryController,
    deleteServiceCategoryController,
    createServiceItemController,
    updateServiceItemController,
    deleteServiceItemController,
} from "./lookups.controller.js";
import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireRole, authenticate } from "../../middleware/auth.js";
import {
    vehicleTypeSchema,
    violationReasonSchema,
    serviceTypeSchema,
    serviceCategorySchema,
    serviceItemSchema,
} from "./lookups.schema.js";

const lookupsRouter = Router();

lookupsRouter.get('/provinces', getProvinceLookupController);

lookupsRouter.get('/vehicle-types', getVehicleTypeController);
lookupsRouter.post('/vehicle-types', authenticate, requireRole('admin', 'manager'), validate(vehicleTypeSchema), createVehicleTypeController);
lookupsRouter.put('/vehicle-types/:id', authenticate, requireRole('admin', 'manager'), validate(vehicleTypeSchema), updateVehicleTypeController);
lookupsRouter.delete('/vehicle-types/:id', authenticate, requireRole('admin'), deleteVehicleTypeController);

lookupsRouter.get('/service-catalog', getServiceCatalogController);

lookupsRouter.post('/service-types', authenticate, requireRole('admin', 'manager'), validate(serviceTypeSchema), createServiceTypeController);
lookupsRouter.put('/service-types/:id', authenticate, requireRole('admin', 'manager'), validate(serviceTypeSchema), updateServiceTypeController);
lookupsRouter.delete('/service-types/:id', authenticate, requireRole('admin'), deleteServiceTypeController);

lookupsRouter.post('/service-categories', authenticate, requireRole('admin', 'manager'), validate(serviceCategorySchema), createServiceCategoryController);
lookupsRouter.put('/service-categories/:id', authenticate, requireRole('admin', 'manager'), validate(serviceCategorySchema), updateServiceCategoryController);
lookupsRouter.delete('/service-categories/:id', authenticate, requireRole('admin'), deleteServiceCategoryController);

lookupsRouter.post('/service-items', authenticate, requireRole('admin', 'manager'), validate(serviceItemSchema), createServiceItemController);
lookupsRouter.put('/service-items/:id', authenticate, requireRole('admin', 'manager'), validate(serviceItemSchema), updateServiceItemController);
lookupsRouter.delete('/service-items/:id', authenticate, requireRole('admin'), deleteServiceItemController);

lookupsRouter.get('/violation-reasons', getViolationReasonsController);
lookupsRouter.post('/violation-reasons', authenticate, requireRole('admin', 'manager'), validate(violationReasonSchema), createViolationReasonController);
lookupsRouter.put('/violation-reasons/:id', authenticate, requireRole('admin', 'manager'), validate(violationReasonSchema), updateViolationReasonController);
lookupsRouter.delete('/violation-reasons/:id', authenticate, requireRole('admin'), deleteViolationReasonController);

export default lookupsRouter;
