import cors from "cors";
import express from "express";
import { APP_INFO } from "./src/config/constants.js";
import db from "./src/config/database.js";
import { closeBrowserInstance, initializeBrowser } from "./src/config/puppeteer.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import apiRoutes from "./src/routes/api.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1); // To get the client's real IP when behind a reverse proxy.

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
    app.get("/", (req, res) => res.json({ message: `Welcome to ${APP_INFO.name}!` }));

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
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit with an error code
  }
};

runServer();
