import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", userController.get);
registerRoute(router, "patch", "/", userController.updateEmail);
registerRoute(router, "put", "/password", userController.updatePassword);
registerRoute(router, "post", "/regenerate-key", userController.regenerateApiKey);
registerRoute(router, "delete", "/", userController.remove);

export default router;
