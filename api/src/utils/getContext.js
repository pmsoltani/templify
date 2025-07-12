/**
 * Retrieves the client's IP address from the request object.
 *
 * Checks the 'x-forwarded-for' header first (to account for proxies),
 * then falls back to various properties on the request object.
 *
 * @param {import('express').Request} req - The HTTP request object.
 * @returns {string|null} The client's IP address, or null if not found.
 */
const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim(); // The first IP is the real one.
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || null;
};

/**
 * Extracts context information from the HTTP request object.
 *
 * @param {Object} req - The HTTP request object.
 * @returns {Object} The context obj containing ipAddress, userAgent, & optionally user.
 */
const getContext = (req) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers["user-agent"] || "unknown";
  const context = { ipAddress, userAgent };
  if (req.user) context.user = req.user;
  return context;
};

export default getContext;
