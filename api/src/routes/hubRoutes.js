import express from "express";
import * as hubController from "../controllers/hubController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import * as hubSchema from "../schemas/hubSchema.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

// Public routes - no authentication required
registerRoute(router, "get", "/", hubController.getAll);
registerRoute(router, "get", "/:publicId", hubController.getByPublicId);

// Protected routes - require authentication
router.use(catchAsync(authenticateToken));

registerRoute(router, "post", "/:publicId/import", hubController.importTemplate);
registerRoute(router, "patch", "/:publicId", validate(hubSchema.update), hubController.update); // prettier-ignore
registerRoute(router, "delete", "/:publicId", hubController.remove);

export default router;
