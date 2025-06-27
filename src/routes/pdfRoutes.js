import express from "express";
import * as pdfController from "../controllers/pdfController.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import catchAsync from "../utils/catchAsync.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

router.use(catchAsync(authenticateToken));

registerRoute(router, "get", "/", pdfController.getAll);
registerRoute(router, "get", "/:id/download", pdfController.getDownloadLink);

export default router;
