import { getProvinceLookupController, getVehicleTypeController } from "./lookups.controller.js";
import { Router } from "express";

const lookupsRouter = Router();

lookupsRouter.get('/provinces', getProvinceLookupController);

lookupsRouter.get('/vehicle-types', getVehicleTypeController);

export default lookupsRouter;