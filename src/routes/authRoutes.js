import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import catchAsync from "../utils/catchAsync.js";

const router = express.Router();

router.post("/register", authController.register);
router.get("/confirm", authController.confirm);
router.post("/login", catchAsync(authController.login));
router.post("/logout", authenticateToken, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-confirmation", authController.resendConfirmation);

export default router;
