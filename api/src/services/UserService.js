import * as eventRepo from "../repositories/eventRepository.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import * as fileService from "./fileService.js";
import * as mailer from "./mailerService.js";
import * as secretService from "./secretService.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";

export default class AuthService {
  constructor(context = {}) {
    this.context = context;
  }

  async get() {
    const publicId = this.context.user.id;
    const logData = { userPublicId: publicId, action: "USER_GET" };
    const userDb = await userRepo.getByPublicId(publicId);
    if (!userDb) throw new AppError("User not found.", 404, { logData });
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return userDb;
  }

  async updateEmail(newEmail) {
    const logData = { userPublicId: this.context.user.id, action: "USER_EMAIL_UPDATE" };
    if (this.context.user.email === newEmail) {
      throw new AppError("Cannot use the current email.", 400, { logData });
    }
    const existingUser = await userRepo.getByEmailOrNewEmail(newEmail);
    if (existingUser) throw new AppError("Email already in use.", 409, { logData });

    const confirmationToken = secretService.generateSecureRandomToken();
    await userRepo.update(this.context.user.id, {
      new_email: newEmail,
      confirmation_token: confirmationToken,
      is_confirmed: false,
    });
    await mailer.sendConfirmationEmail(newEmail, confirmationToken);
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
  }

  async updatePassword(currentPassword, newPassword) {
    const publicId = this.context.user.id;
    const logData = { userPublicId: publicId, action: "USER_PASSWORD_UPDATE" };
    const userDb = await userRepo.getByPublicId(publicId);
    const isValid = await secretService.verifyPassword(
      currentPassword,
      userDb.password_hash
    );
    if (!isValid) throw new AppError("Invalid current password.", 401, { logData });

    const newPasswordHash = await secretService.generatePasswordHash(newPassword);
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return userRepo.update(publicId, { password_hash: newPasswordHash });
  }

  async regenerateApiKey() {
    const publicId = this.context.user.id;
    const newApiKey = secretService.generateSecureRandomToken();
    await log(publicId, "USER_APIKEY_GENERATE", "SUCCESS", this.context);
    return userRepo.update(publicId, { api_key: newApiKey });
  }

  async remove(password) {
    const publicId = this.context.user.id;
    const logData = { userPublicId: publicId, action: "USER_ACCOUNT_REMOVE" };
    const userDb = await userRepo.getByPublicId(publicId);
    const isValid = await secretService.verifyPassword(password, userDb.password_hash);
    if (!isValid) throw new AppError("Invalid password.", 401, { logData });

    // Anonymize user data
    await eventRepo.anonymizeByUserId(userDb.id);

    // Remove all user's PDFs
    const pdfsDb = await pdfRepo.getAllByUserPublicId(publicId);
    const pdfKeys = pdfsDb.map((pdf) => pdf.storage_object_key);
    await fileService.removePdfs(pdfKeys);

    // Remove all user's templates
    const templatesDb = await templateRepo.getAllByUserPublicId(publicId);
    for (const template of templatesDb) {
      const bucketPath = `userFiles/${publicId}/templates/${template.public_id}/`;
      await fileService.removeTemplate(bucketPath);
    }

    await userRepo.remove(publicId); // Postgres will cascade delete the related records
    await log(logData.userPublicId, logData.action, "SUCCESS"); // Don't add context
  }
}
