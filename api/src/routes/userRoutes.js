import express from "express";
import * as userController from "../controllers/userController.js";
import {
  authenticateToken,
  preventChangesToDemoUser,
} from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import * as userSchema from "../schemas/userSchema.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", userController.get);
registerRoute(router, "post", "/regenerate-key", userController.regenerateApiKey);

router.use(catchAsync(preventChangesToDemoUser));

registerRoute(router, "patch", "/", validate(userSchema.updateEmail), userController.updateEmail); // prettier-ignore
registerRoute(router, "put", "/password", validate(userSchema.updatePassword), userController.updatePassword); // prettier-ignore
registerRoute(router, "delete", "/", validate(userSchema.remove), userController.remove); // prettier-ignore

export default router;
