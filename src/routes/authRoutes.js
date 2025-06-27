import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

registerRoute(router, "post", "/register", authController.register);
registerRoute(router, "get", "/confirm", authController.confirm);
registerRoute(router, "post", "/login", authController.login);
registerRoute(router, "post", "/logout", authenticateToken, authController.logout);
registerRoute(router, "post", "/forgot-password", authController.forgotPassword);
registerRoute(router, "post", "/reset-password", authController.resetPassword);
registerRoute(
  router,
  "post",
  "/resend-confirmation",
  authController.resendConfirmation
);

export default router;
