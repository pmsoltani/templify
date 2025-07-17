import { APP_INFO } from "../config/constants.js";
import db from "../config/database.js";
import { getBrowserInstance } from "../config/puppeteer.js";

const getHealth = async (req, res) => {
  const startTime = Date.now();
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: APP_INFO.name,
    version: APP_INFO.version,
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    checks: {},
  };

  // Database health check
  try {
    const dbStart = Date.now();
    await db.query("SELECT 1");
    healthCheck.checks.database = {
      status: "healthy",
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.checks.database = {
      status: "unhealthy",
      error: error.message,
    };
  }

  // Memory usage check
  const memoryUsage = process.memoryUsage();
  healthCheck.checks.memory = {
    status: "healthy",
    usage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    },
  };

  // Puppeteer browser instance check
  try {
    const browser = getBrowserInstance();
    if (browser && (await browser).connected) {
      healthCheck.checks.browser = {
        status: "healthy",
        connected: true,
      };
    } else {
      throw new Error("Browser not connected");
    }
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.checks.browser = {
      status: "unhealthy",
      error: error.message,
    };
  }

  healthCheck.responseTime = Date.now() - startTime;

  const statusCode = healthCheck.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthCheck);
};

const getLiveness = async (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    service: process.env.APP_NAME || APP_INFO.name,
  });
};

const getReadiness = async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      service: process.env.APP_NAME || APP_INFO.name,
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      service: process.env.APP_NAME || APP_INFO.name,
      error: error.message,
    });
  }
};

export { getHealth, getLiveness, getReadiness };
