import { getProvinceLookupController, getVehicleTypeController, getServiceCatalogController } from "./lookups.controller.js";
import { Router } from "express";

const lookupsRouter = Router();

lookupsRouter.get('/provinces', getProvinceLookupController);

lookupsRouter.get('/vehicle-types', getVehicleTypeController);

lookupsRouter.get('/service-catalog', getVehicleTypeController);

export default lookupsRouter;