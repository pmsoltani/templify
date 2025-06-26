import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", userController.get);
router.patch("/", userController.updateEmail);
router.put("/password", userController.updatePassword);
router.post("/regenerate-key", userController.regenerateApiKey);
router.delete("/", userController.remove);

export default router;
