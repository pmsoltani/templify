import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import templateRoutes from "./templateRoutes.js";
import pdfRoutes from "./pdfRoutes.js";

const router = express.Router();

router.use("/", authRoutes);
router.use("/me", userRoutes);
router.use("/templates", templateRoutes);
router.use("/pdfs", pdfRoutes);

export default router;
