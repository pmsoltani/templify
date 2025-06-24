import jwt from "jsonwebtoken";
import * as db from "../services/databaseService.js";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Missing token." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
};

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "Missing API key." });

  try {
    const user = await db.getUserByApiKey(apiKey);
    if (!user || !user.is_confirmed) {
      return res.status(403).json({ error: "Invalid API key or user not confirmed." });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { authenticateToken, authenticateApiKey };
