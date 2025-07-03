import * as templateRepo from "../repositories/templateRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import * as fileService from "./fileService.js";
import * as mailer from "./mailerService.js";
import * as secretService from "./secretService.js";
import AppError from "../utils/AppError.js";

const updateEmail = async (userId, newEmail) => {
  const existingUser = await userRepo.getByEmailOrNewEmail(newEmail);
  if (existingUser) throw new AppError("Email already in use.", 409);

  const confirmationToken = secretService.generateSecureRandomToken();
  await userRepo.update(userId, {
    new_email: newEmail,
    confirmation_token: confirmationToken,
    is_confirmed: false,
  });
  await mailer.sendConfirmationEmail(newEmail, confirmationToken);
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const userDb = await userRepo.getByPublicId(userId);
  const isValid = await secretService.verifyPassword(
    currentPassword,
    userDb.password_hash
  );
  if (!isValid) throw new AppError("Invalid current password.", 401);

  const newPasswordHash = await secretService.generatePasswordHash(newPassword);
  return userRepo.update(userId, { password_hash: newPasswordHash });
};

const regenerateApiKey = async (userId) => {
  const newApiKey = secretService.generateSecureRandomToken();
  return userRepo.update(userId, { api_key: newApiKey });
};

const remove = async (userId, password) => {
  const userDb = await userRepo.getByPublicId(userId);
  const isValid = await secretService.verifyPassword(password, userDb.password_hash);
  if (!isValid) throw new AppError("Invalid password.", 401);

  // Remove all user's templates
  const templates = await templateRepo.getAllByUserId(userId);
  for (const template of templates) {
    const bucketPath = `userFiles/${userId}/${template.id}/`;
    await fileService.removeTemplate(bucketPath);
  }
  return userRepo.remove(userId);
};

export { updateEmail, updatePassword, regenerateApiKey, remove };
