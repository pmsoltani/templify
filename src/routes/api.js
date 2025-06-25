import express from "express";
import upload from "../config/multer.js";
import * as authController from "../controllers/authController.js";
import * as templateController from "../controllers/templateController.js";
import { authenticateToken, authenticateApiKey } from "../middlewares/authenticate.js";

const router = express.Router();

// --- Public Routes ---
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Templify API!",
    endpoints: {
      register: "POST /api/register",
      confirm: "GET /api/confirm",
      login: "POST /api/login",
      me: "GET /api/me",
      uploadTemplate: "POST /api/templates",
      generatePdf: "POST /api/templates/:id/generate",
    },
  });
});
router.post("/register", authController.register);
router.get("/confirm", authController.confirm);
router.post("/login", authController.login);

// --- Authenticated Routes ---
router.get("/me", authenticateToken, authController.getMe);
router.get("/templates", authenticateToken, templateController.listUserTemplates);
router.post(
  "/templates",
  authenticateToken,
  upload.single("templateZip"),
  templateController.uploadTemplate
);
router.post(
  "/templates/:id/generate",
  authenticateApiKey,
  templateController.generatePdf
);

export default router;
