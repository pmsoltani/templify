import express from "express";
import upload from "../config/multer.js";
import * as templateController from "../controllers/templateController.js";
import {
  authenticateToken,
  authenticateTokenOrApiKey,
} from "../middlewares/authenticate.js";
import registerRoute from "../utils/registerRoute.js";
import catchAsync from "../utils/catchAsync.js";
import validate from "../middlewares/validate.js";
import * as templateSchema from "../schemas/templateSchema.js";

const router = express.Router();

// Route for generating a PDF (requires JWT or API Key)
registerRoute(router, "post", "/:id/generate", authenticateTokenOrApiKey, templateController.generatePdf); // prettier-ignore

// Routes for managing templates (require JWT)
router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", templateController.getAllByUserId);
registerRoute(router, "post", "/", upload.single("templateZip"), validate(templateSchema.create), templateController.create); // prettier-ignore
registerRoute(router, "put", "/:id", upload.single("templateZip"), validate(templateSchema.update), templateController.update); // prettier-ignore
registerRoute(router, "delete", "/:id", templateController.remove);

export default router;
