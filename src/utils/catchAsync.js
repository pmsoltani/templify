/**
 * A wrapper for async route handlers to catch any errors and pass them
 * to the global error handler.
 * @param {Function} fn The async controller function to wrap.
 * @returns {Function} A new function that Express can run.
 */
const catchAsync = (fn) => {
  return (req, res, next) => fn(req, res, next).catch(next);
};

export default catchAsync;
