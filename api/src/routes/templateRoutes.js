import express from "express";
import upload from "../config/multer.js";
import * as fileController from "../controllers/fileController.js";
import * as templateController from "../controllers/templateController.js";
import {
  authenticateToken,
  authenticateTokenOrApiKey,
} from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import * as fileSchema from "../schemas/fileSchema.js";
import * as templateSchema from "../schemas/templateSchema.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

// Route for generating a PDF (requires JWT or API Key)
registerRoute(router, "post", "/:id/generate", authenticateTokenOrApiKey, templateController.generatePdf); // prettier-ignore

// Routes for managing templates (require JWT)
router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", templateController.getAllByUserId);
registerRoute(router, "post", "/", upload.single("templateZip"), validate(templateSchema.create), templateController.create); // prettier-ignore
registerRoute(router, "post", "/slim", upload.none(), templateController.createSlim); // prettier-ignore
registerRoute(router, "put", "/:templateId", upload.single("templateZip"), validate(templateSchema.update), templateController.update); // prettier-ignore
registerRoute(router, "delete", "/:templateId", templateController.remove);

// File sub-routes
registerRoute(router, "get", "/:templateId/files", fileController.getAllByTemplateId);
registerRoute(router, "post", "/:templateId/files", upload.single("templateFile"), validate(fileSchema.create), fileController.create); // prettier-ignore
registerRoute(router, "put", "/:templateId/files/:fileId", upload.single("templateFile"), validate(fileSchema.update), fileController.update); // prettier-ignore
registerRoute(router, "get", "/:templateId/files/:fileId/content", fileController.getContent); // prettier-ignore
registerRoute(router, "delete", "/:templateId/files/:fileId", fileController.remove);

export default router;
