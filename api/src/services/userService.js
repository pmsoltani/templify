import * as templateRepo from "../repositories/templateRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import * as fileService from "./fileService.js";
import * as mailer from "./mailerService.js";
import * as secretService from "./secretService.js";
import AppError from "../utils/AppError.js";

const updateEmail = async (publicId, newEmail) => {
  const existingUser = await userRepo.getByEmailOrNewEmail(newEmail);
  if (existingUser) throw new AppError("Email already in use.", 409);

  const confirmationToken = secretService.generateSecureRandomToken();
  await userRepo.update(publicId, {
    new_email: newEmail,
    confirmation_token: confirmationToken,
    is_confirmed: false,
  });
  await mailer.sendConfirmationEmail(newEmail, confirmationToken);
};

const updatePassword = async (publicId, currentPassword, newPassword) => {
  const userDb = await userRepo.getByPublicId(publicId);
  const isValid = await secretService.verifyPassword(
    currentPassword,
    userDb.password_hash
  );
  if (!isValid) throw new AppError("Invalid current password.", 401);

  const newPasswordHash = await secretService.generatePasswordHash(newPassword);
  return userRepo.update(publicId, { password_hash: newPasswordHash });
};

const regenerateApiKey = async (publicId) => {
  const newApiKey = secretService.generateSecureRandomToken();
  return userRepo.update(publicId, { api_key: newApiKey });
};

const remove = async (publicId, password) => {
  const userDb = await userRepo.getByPublicId(publicId);
  const isValid = await secretService.verifyPassword(password, userDb.password_hash);
  if (!isValid) throw new AppError("Invalid password.", 401);

  // Remove all user's templates
  const templatesDb = await templateRepo.getAllByUserPublicId(publicId);
  for (const template of templatesDb) {
    const bucketPath = `userFiles/${publicId}/${template.id}/`;
    await fileService.removeTemplate(bucketPath);
  }

  return userRepo.remove(publicId); // Postgres will cascade delete the related records
};

export { updateEmail, updatePassword, regenerateApiKey, remove };
