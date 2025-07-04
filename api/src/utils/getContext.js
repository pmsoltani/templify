/**
 * Extracts context information from the HTTP request object.
 *
 * @param {Object} req - The HTTP request object.
 * @returns {Object} The context obj containing ipAddress, userAgent, & optionally user.
 */
const getContext = (req) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "unknown";
  const context = { ipAddress, userAgent };
  if (req.user) context.user = req.user;
  return context;
};

export default getContext;
