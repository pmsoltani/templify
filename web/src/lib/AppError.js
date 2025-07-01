/**
 * A custom error class for standardizing API errors on the client-side.
 */
export default class AppError extends Error {
  /**
   * @param {string} message The primary error message from the API.
   * @param {number} statusCode The HTTP status code from the response.
   * @param {object|null} details Any extra validation details from the API.
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
