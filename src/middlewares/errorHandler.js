/**
 * The global error handling middleware, catching all errors passed via next(err).
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let errorResponse = { status: err.status, message: err.message };
  if (err.details) errorResponse.details = err.details;
  if (process.env.NODE_ENV === "development") errorResponse.stack = err.stack;
  if (err.isOperational) return res.status(err.statusCode).json(errorResponse);

  // In production, don't leak details for programming or unknown errors.
  console.error("ERROR", err);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
};

export default errorHandler;
