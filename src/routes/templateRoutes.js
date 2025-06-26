import express from "express";
import upload from "../config/multer.js";
import * as templateController from "../controllers/templateController.js";
import { authenticateToken, authenticateApiKey } from "../middlewares/authenticate.js";

const router = express.Router();

// Routes for managing templates (require JWT)
router.get("/", authenticateToken, templateController.listUserTemplates);
router.post(
  "/",
  authenticateToken,
  upload.single("templateZip"),
  templateController.create
);
router.put(
  "/:id",
  authenticateToken,
  upload.single("templateZip"),
  templateController.update
);
router.delete("/:id", authenticateToken, templateController.remove);

// Route for generating a PDF (requires API Key)
router.post("/:id/generate", authenticateApiKey, templateController.generatePdf);

export default router;
