import * as templateRepo from "../repositories/templateRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import * as fileService from "./fileService.js";
import * as mailer from "./mailerService.js";
import * as secretService from "./secretService.js";

const updateEmail = async (userId, newEmail) => {
  const existingUser = await userRepo.getByEmailOrNewEmail(newEmail);
  if (existingUser) throw new Error("Email already in use.");

  const confirmationToken = secretService.generateSecureRandomToken();
  await userRepo.update(userId, {
    new_email: newEmail,
    confirmation_token: confirmationToken,
    is_confirmed: false,
  });
  await mailer.sendConfirmationEmail(newEmail, confirmationToken);
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const userDb = await userRepo.getById(userId);
  const isValid = await secretService.verifyPassword(
    currentPassword,
    userDb.password_hash
  );
  if (!isValid) throw new Error("Invalid current password.");

  const newPasswordHash = await secretService.generatePasswordHash(newPassword);
  return userRepo.update(userId, { password_hash: newPasswordHash });
};

const regenerateApiKey = async (userId) => {
  const newApiKey = secretService.generateSecureRandomToken();
  return userRepo.update(userId, { api_key: newApiKey });
};

const remove = async (userId, password) => {
  const userDb = await userRepo.getById(userId);
  const isValid = await secretService.verifyPassword(password, userDb.password_hash);
  if (!isValid) throw new Error("Invalid password.");

  // Remove all user's templates
  const templates = await templateRepo.getAllByUserId(userId);
  for (const template of templates) {
    const bucketPath = `userFiles/${userId}/${template.id}/`;
    await fileService.removeTemplate(bucketPath);
  }
  return userRepo.remove(userId);
};

export { updateEmail, updatePassword, regenerateApiKey, remove };
