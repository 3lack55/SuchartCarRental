import { Router } from "express";
import { getOverviewController } from "./overview.controller.js";
import { authenticate } from "../../middleware/auth.js";

const overviewRouter = Router();

overviewRouter.get("/", authenticate, getOverviewController);

export default overviewRouter; 