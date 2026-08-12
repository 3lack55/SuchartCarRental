import { Router } from "express";
import { getVehiclesController } from "./vehicles.controller.js";
import { authenticate } from "../../middleware/auth.js";

const vehiclesRouter = Router();

vehiclesRouter.get("/allVehicles", authenticate, getVehiclesController);

export default vehiclesRouter;
