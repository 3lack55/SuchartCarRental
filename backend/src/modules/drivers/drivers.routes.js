import { Router } from "express";
import { getDriversController } from "./drivers.controller.js";
import { authenticate } from "../../middleware/auth.js";    

const driversRouter = Router();

driversRouter.get("/allDrivers", authenticate, getDriversController);

export default driversRouter;