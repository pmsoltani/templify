import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepository.js";
import { publicUser } from "../schemas/userSchema.js";
import AppError from "../utils/AppError.js";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) throw new AppError("Missing authentication token.", 401);

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid token.", 403);
  }
};

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) throw new AppError("Missing API key.", 401);
  const userDb = await userRepo.getByApiKey(apiKey);
  if (!userDb || !userDb.is_confirmed) {
    throw new AppError("Invalid API key or user not confirmed.", 403);
  }
  req.user = publicUser.parse(userDb);
  next();
};

const authenticateTokenOrApiKey = async (req, res, next) => {
  try {
    await authenticateToken(req, res, next);
  } catch (err) {
    // Only check for API key if no token is provided (401), other errors (like 403)
    // mean that token was provided but was invalid, so we don't fall back to API key.
    if (err.statusCode !== 401) throw err;
    await authenticateApiKey(req, res, next);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(`Access denied. Must be: ${roles.join(", ")}.`, 403);
    }
    next();
  };
};

const preventChangesToDemoUser = (req, res, next) => {
  if (req.user.email === process.env.DEMO_EMAIL) {
    throw new AppError("Cannot modify demo user.", 403);
  }
  next();
};

export {
  authenticateApiKey,
  authenticateToken,
  authenticateTokenOrApiKey,
  authorize,
  preventChangesToDemoUser,
};
