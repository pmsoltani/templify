import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nanoid from "../config/nanoid.js";
import { ENTITIES } from "../config/constants.js";
import AppError from "../utils/AppError.js";

/**
 * Generates a JSON Web Token (JWT) for user authentication sessions.
 * @param {object} user The user object to encode in the payload.
 * @returns {string} The signed JWT.
 */
const generateAuthToken = (user) => {
  const payload = { id: user.public_id, email: user.email };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "1d" };

  return jwt.sign(payload, secret, options);
};

/** * Generates a password hash using bcrypt.
 * @param {string} password The plaintext password to hash.
 * @returns {Promise<string>} The hashed password.
 */
const generatePasswordHash = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Generates a cryptographically secure, random hexadecimal token.
 * Used for API keys, confirmation tokens, etc.
 * @param {number} bytes The number of random bytes to generate. Defaults to 32.
 * @returns {string} A random hex string.
 */
const generateSecureRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

/**
 * Generates a unique public ID for a given entity type by prefixing a nanoid
 * with the entity's prefix.
 * @param {string} entityType - The type of entity for which to generate the ID.
 * @returns {string} The generated unique ID.
 * @throws {AppError} Throws an error if the entity type is unknown or has no prefix.
 */
const generatePublicId = (entityType) => {
  const prefix = ENTITIES[entityType].prefix;
  if (!prefix) {
    const error = new AppError(`Unknown entity type: ${entityType}`, 500);
    error.isOperational = false;
    throw error;
  }
  return `${prefix}${nanoid()}`;
};

/** * Compares a plaintext password with a hashed password.
 * @param {string} plainPassword The plaintext password to compare.
 * @param {string} hashedPassword The hashed password to compare against.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export {
  generateAuthToken,
  generatePasswordHash,
  generatePublicId,
  generateSecureRandomToken,
  verifyPassword,
};
