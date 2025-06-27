/**
 * The global error handling middleware, catching all errors passed via next(err).
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development: send detailed error.
  let data = { status: err.status, message: err.message };
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({ ...data, error: err, stack: err.stack });
  }

  // Production: for operational errors we trust, send the message to the client.
  if (err.isOperational) return res.status(err.statusCode).json(data);

  // Production: for programming or unknown errors, don't leak details.
  console.error("ERROR", err);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
};

export default errorHandler;
