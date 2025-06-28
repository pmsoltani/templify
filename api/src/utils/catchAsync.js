/**
 * A universal wrapper for both async and sync route handlers. It catches rejected
 * promises from async functions and passes them to the global error handler.
 * It safely ignores the return value of sync functions.
 * @param {Function} fn The handler function to wrap.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
