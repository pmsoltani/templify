import * as eventRepo from "../repositories/eventRepository.js";
import * as secretService from "../services/secretService.js";
import { ALLOWED_ACTIONS } from "../config/constants.js";
import AppError from "../utils/AppError.js";

const log = async (userPublicId, action, status, options = {}) => {
  const { cost = 0, details = null, ipAddress = null, userAgent = null } = options;
  const publicId = secretService.generatePublicId("event");
  if (!ALLOWED_ACTIONS.includes(action)) {
    const err = new AppError(`Invalid action: ${action}.`, 500);
    err.isOperational = false;
    throw err;
  }
  await eventRepo.create(
    userPublicId,
    publicId,
    action,
    status,
    cost,
    details,
    ipAddress,
    userAgent
  );
};

export { log };
