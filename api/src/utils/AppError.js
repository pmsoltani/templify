class AppError extends Error {
  /**
   * @param {string} message The error message.
   * @param {number} statusCode The HTTP status code.
   * @param {object|null} details Optional object with extra error details.
   */
  constructor(message, statusCode, options = {}) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // To distinguish from programming errors
    if (options.details) this.details = options.details;
    if (options.logData) this.logData = options.logData;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
