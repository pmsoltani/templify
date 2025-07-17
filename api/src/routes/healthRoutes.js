import express from "express";
import * as healthController from "../controllers/healthController.js";
import registerRoute from "../utils/registerRoute.js";

const router = express.Router();

const noCacheMiddleware = (req, res, next) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};
router.use(noCacheMiddleware); // Apply no-cache middleware to all health routes

registerRoute(router, "get", "/", healthController.getHealth);

// Kubernetes-style health checks
registerRoute(router, "get", "/live", healthController.getLiveness);
registerRoute(router, "get", "/ready", healthController.getReadiness);

export default router;
