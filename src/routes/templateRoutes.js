import express from "express";
import upload from "../config/multer.js";
import * as templateController from "../controllers/templateController.js";
import { authenticateToken, authenticateApiKey } from "../middlewares/authenticate.js";
import registerRoute from "../utils/registerRoute.js";
import catchAsync from "../utils/catchAsync.js";

const router = express.Router();

// Route for generating a PDF (requires API Key)
registerRoute(
  router,
  "post",
  "/:id/generate",
  authenticateApiKey,
  templateController.generatePdf
);

// Routes for managing templates (require JWT)
router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", templateController.listUserTemplates);
registerRoute(
  router,
  "post",
  "/",
  upload.single("templateZip"),
  templateController.create
);
registerRoute(
  router,
  "put",
  "/:id",
  upload.single("templateZip"),
  templateController.update
);
registerRoute(router, "delete", "/:id", templateController.remove);

export default router;
