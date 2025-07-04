const getContext = (req) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "unknown";
  return { ipAddress, userAgent };
};

export default getContext;
