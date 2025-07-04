import * as eventRepo from "../repositories/eventRepository.js";
import * as secretService from "../services/secretService.js";

const log = async (userPublicId, action, status, options = {}) => {
  const { cost = 0, details = null, ipAddress = null, userAgent = null } = options;
  const publicId = secretService.generatePublicId("event");
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
