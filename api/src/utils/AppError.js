class AppError extends Error {
  /**
   * @param {string} message The error message.
   * @param {number} statusCode The HTTP status code.
   * @param {object|null} details Optional object with extra error details.
   */
  constructor(message, statusCode, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // To distinguish from programming errors
    if (details) this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
