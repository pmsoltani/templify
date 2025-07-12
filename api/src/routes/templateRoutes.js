import express from "express";
import upload from "../config/multer.js";
import * as fileController from "../controllers/fileController.js";
import * as templateController from "../controllers/templateController.js";
import {
  authenticateToken,
  authenticateTokenOrApiKey,
} from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import * as templateSchema from "../schemas/templateSchema.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

// Route for generating a PDF (requires JWT or API Key)
registerRoute(router, "post", "/:templateId/generate", authenticateTokenOrApiKey, templateController.generatePdf); // prettier-ignore

// Routes for managing templates (require JWT)
router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", templateController.getAllByUserId);
registerRoute(router, "post", "/", upload.array("files"), templateController.create); // prettier-ignore
registerRoute(router, "get", "/:templateId", templateController.get); // prettier-ignore
registerRoute(router, "patch", "/:templateId", validate(templateSchema.update), templateController.updateInfo); // prettier-ignore
registerRoute(router, "delete", "/:templateId", templateController.remove);
registerRoute(router, "post", "/:templateId/preview", templateController.generatePdfPreview); // prettier-ignore
registerRoute(router, "patch", "/:templateId/settings", validate(templateSchema.updateSettings), templateController.updateInfo); // prettier-ignore
registerRoute(router, "get", "/:templateId/variables", templateController.getVariables); // prettier-ignore

// File sub-routes
registerRoute(router, "get", "/:templateId/files", fileController.getAllByTemplateId);
registerRoute(router, "post", "/:templateId/files", upload.single("file"), fileController.create); // prettier-ignore
registerRoute(router, "get", "/:templateId/files/:fileId/content", fileController.getContent); // prettier-ignore
registerRoute(router, "patch", "/:templateId/files/:fileId/content", fileController.updateContent); // prettier-ignore
registerRoute(router, "delete", "/:templateId/files/:fileId", fileController.remove);

export default router;
