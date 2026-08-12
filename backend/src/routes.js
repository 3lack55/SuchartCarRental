import { Router } from "express";
import authRoutes from './modules/auth/auth.routes.js';
import overviewRouter from './modules/overview/overview.routes.js';
import driversRouter from './modules/drivers/drivers.routes.js';
import vehiclesRouter from './modules/vehicles/vehicles.routes.js';
import documentsRouter from './modules/documents/documents.routes.js';

const appRouter = Router();

appRouter.use('/auth', authRoutes);
appRouter.use('/overview', overviewRouter);
appRouter.use('/drivers', driversRouter);
appRouter.use('/vehicles', vehiclesRouter);
appRouter.use('/documents', documentsRouter);

export default appRouter;