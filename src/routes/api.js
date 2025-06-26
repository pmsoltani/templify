import express from "express";
import upload from "../config/multer.js";
import * as authController from "../controllers/authController.js";
import * as templateController from "../controllers/templateController.js";
import * as userController from "../controllers/userController.js";
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
      templates: "GET /api/templates",
      uploadTemplate: "POST /api/templates",
      generatePdf: "POST /api/templates/:id/generate",
      deleteTemplate: "DELETE /api/templates/:id",
      updateTemplate: "PUT /api/templates/:id",
    },
  });
});
router.post("/register", authController.register);
router.get("/confirm", authController.confirm);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-confirmation", authController.resendConfirmation);

// --- Authenticated Routes ---
router.get("/me", authenticateToken, userController.get);
router.patch("/me/email", authenticateToken, userController.updateEmail);
router.patch("/me/password", authenticateToken, userController.updatePassword);
router.post("/me/regenerate-key", authenticateToken, userController.regenerateApiKey);
router.delete("/me", authenticateToken, userController.remove);

router.post("/logout", authenticateToken, authController.logout);

router.get("/templates", authenticateToken, templateController.listUserTemplates);
router.post(
  "/templates",
  authenticateToken,
  upload.single("templateZip"),
  templateController.create
);
router.post(
  "/templates/:id/generate",
  authenticateApiKey,
  templateController.generatePdf
);
router.delete("/templates/:id", authenticateToken, templateController.remove);
router.put(
  "/templates/:id",
  authenticateToken,
  upload.single("templateZip"),
  templateController.update
);

export default router;
