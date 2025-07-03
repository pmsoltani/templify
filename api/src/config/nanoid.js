import { customAlphabet } from "nanoid";
import AppError from "../utils/AppError.js";
import { NANO_ALPHABET, ENTITIES } from "./constants.js";

const nanoid = customAlphabet(NANO_ALPHABET, 14);

const generateId = (entityType) => {
  const prefix = ENTITIES[entityType].prefix;
  if (!prefix) {
    const error = new AppError(`Unknown entity type: ${entityType}`, 500);
    error.isOperational = false;
    throw error;
  }
  return `${prefix}${nanoid()}`;
};

export default generateId;
