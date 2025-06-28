import express from "express";
import cors from "cors";
import apiRoutes from "./src/routes/api.js";
import db from "./src/config/database.js";
import { initializeBrowser, closeBrowserInstance } from "./src/config/puppeteer.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

const runServer = async () => {
  try {
    console.log("Starting server...");
    await initializeBrowser();
    await db.query("SELECT 1");
    console.log("Database connection verified.");

    const corsOptions = {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
    };
    app.use(cors(corsOptions));

    app.use(express.json()); // Middleware to parse JSON request bodies
    app.use("/api", apiRoutes);
    app.get("/", (req, res) => res.json({ message: "Welcome to Templify!" }));

    // Global error handler (must be after all routes)
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log("Received shutdown signal, closing resources...");
      await closeBrowserInstance();
      await db.end();
      console.log("Database pool closed.");
      server.close(() => {
        console.log("HTTP server closed. Exiting process.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown); // Ctrl+C in the terminal (dev)
    process.on("SIGINT", gracefulShutdown); // Graceful shutdown
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with an error code
  }
};

runServer();
