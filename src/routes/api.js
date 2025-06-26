import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import templateRoutes from "./templateRoutes.js";

const router = express.Router();

router.use("/", authRoutes);
router.use("/me", userRoutes);
router.use("/templates", templateRoutes);

export default router;
