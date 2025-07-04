import * as eventService from "../services/eventService.js";
import getContext from "../utils/getContext.js";

/**
 * The global error handling middleware, catching all errors passed via next(err).
 * It now also handles automatic logging for operational errors.
 */
const errorHandler = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isOperational && err.logData) {
    try {
      const userPublicId = err.logData.userPublicId || req.user?.id;
      if (!userPublicId) throw new Error("User hasn't been authenticated.");
      const action = err.logData.action;
      const context = {
        details: { reason: err.message, ...err.logData.details },
        ...getContext(req),
      };
      eventService.log(userPublicId, action, "FAILURE", context); // Log without await
    } catch (logError) {
      if (logError.message !== "User hasn't been authenticated.") {
        console.error("CRITICAL: Failed to log an error event!", logError);
      }
    }
  }

  let errorResponse = { status: err.status, message: err.message };
  if (err.details) errorResponse.details = err.details;
  if (process.env.NODE_ENV === "development") errorResponse.stack = err.stack;
  if (err.isOperational) return res.status(err.statusCode).json(errorResponse);

  // In production, don't leak details for programming or unknown errors.
  console.error("ERROR", err);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
};

export default errorHandler;
