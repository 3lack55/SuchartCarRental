import { Router } from "express";
import { getDocumentsController } from "./documents.controller.js";

const documentsRouter = Router();

documentsRouter.get("/allDocuments", getDocumentsController);

export default documentsRouter;