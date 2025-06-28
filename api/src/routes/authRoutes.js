import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import registerRoute from "../utils/registerRoute.js";
import validate from "../middlewares/validate.js";
import * as authSchema from "../schemas/authSchema.js";

const router = express.Router();

registerRoute(router, "post", "/register", validate(authSchema.register), authController.register); // prettier-ignore
registerRoute(router, "get", "/confirm", validate(authSchema.confirm), authController.confirm); // prettier-ignore
registerRoute(router, "post", "/login", validate(authSchema.login), authController.login); // prettier-ignore
registerRoute(router, "post", "/logout", authenticateToken, authController.logout);
registerRoute(router, "post", "/forgot-password", validate(authSchema.forgotPassword), authController.forgotPassword); // prettier-ignore
registerRoute(router, "post", "/reset-password", validate(authSchema.resetPassword), authController.resetPassword); // prettier-ignore
registerRoute(router, "post", "/resend-confirmation", validate(authSchema.resendConfirmation), authController.resendConfirmation); // prettier-ignore

export default router;
