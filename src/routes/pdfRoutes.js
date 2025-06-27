import express from "express";
import * as pdfController from "../controllers/pdfController.js";
import { authenticateToken } from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", pdfController.getAll);
router.get("/:id/download", pdfController.getDownloadLink);

export default router;
