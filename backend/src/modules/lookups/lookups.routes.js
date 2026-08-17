import { getProvinceLookupController, getVehicleTypeController, getServiceCatalogController, getViolationReasonsController } from "./lookups.controller.js";
import { Router } from "express";

const lookupsRouter = Router();

lookupsRouter.get('/provinces', getProvinceLookupController);

lookupsRouter.get('/vehicle-types', getVehicleTypeController);

lookupsRouter.get('/service-catalog', getServiceCatalogController);

lookupsRouter.get('/violation-reasons', getViolationReasonsController);

export default lookupsRouter;