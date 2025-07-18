import express from "express";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";
import pdfRoutes from "./pdfRoutes.js";
import templateRoutes from "./templateRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/", authRoutes);
router.use("/me", userRoutes);
router.use("/templates", templateRoutes);
router.use("/pdfs", pdfRoutes);
router.use("/health", healthRoutes);

export default router;
