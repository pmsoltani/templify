import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepository.js";
import AppError from "../utils/AppError.js";
import { publicUser } from "../schemas/userSchema.js";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) throw new AppError("Missing authentication token.", 401);

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    throw new AppError("Invalid token.", 401);
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

export { authenticateToken, authenticateApiKey };
