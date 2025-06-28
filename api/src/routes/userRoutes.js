import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";
import validate from "../middlewares/validate.js";
import * as userSchema from "../schemas/userSchema.js";

const router = express.Router();

router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", userController.get);
registerRoute(router, "patch", "/", validate(userSchema.updateEmail), userController.updateEmail); // prettier-ignore
registerRoute(router, "put", "/password", validate(userSchema.updatePassword), userController.updatePassword); // prettier-ignore
registerRoute(router, "post", "/regenerate-key", userController.regenerateApiKey);
registerRoute(router, "delete", "/", validate(userSchema.remove), userController.remove); // prettier-ignore

export default router;
