import express from "express";
import multer from "multer";

import * as authController from "../controllers/authController.js";
import * as templateController from "../controllers/templateController.js";
import { authenticateToken, authenticateApiKey } from "../middleware/authenticate.js";

const router = express.Router();

// Multer setup for file uploads: set where to temporarily store the uploaded zip file.
const upload = multer({ dest: "storage/temp/" });

// --- Public Routes ---
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Templify API!",
    endpoints: {
      register: "POST /api/register",
      confirmEmail: "GET /api/confirm",
      login: "POST /api/login",
      me: "GET /api/me",
      uploadTemplate: "POST /api/templates",
      generatePdf: "POST /api/templates/:id/generate",
    },
  });
});
router.post("/register", authController.register);
router.get("/confirm", authController.confirmEmail);
router.post("/login", authController.login);

// --- Authenticated Routes ---
router.get("/me", authenticateToken, authController.getMe);
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

export { router };
