import express from "express";
import upload from "../config/multer.js";
import * as templateController from "../controllers/templateController.js";
import { authenticateToken, authenticateApiKey } from "../middlewares/authenticate.js";
import registerRoute from "../utils/registerRoute.js";
import catchAsync from "../utils/catchAsync.js";
import validate from "../middlewares/validate.js";
import * as templateSchema from "../schemas/templateSchema.js";

const router = express.Router();

// Route for generating a PDF (requires API Key)
registerRoute(router, "post", "/:id/generate", authenticateApiKey, templateController.generatePdf); // prettier-ignore

// Routes for managing templates (require JWT)
router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", templateController.listUserTemplates);
registerRoute(router, "post", "/", upload.single("templateZip"), validate(templateSchema.create), templateController.create); // prettier-ignore
registerRoute(router, "put", "/:id", upload.single("templateZip"), templateController.update); // prettier-ignore
registerRoute(router, "delete", "/:id", templateController.remove);

export default router;
