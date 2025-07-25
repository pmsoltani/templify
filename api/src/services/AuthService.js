import * as userRepo from "../repositories/userRepository.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import * as mailer from "./mailerService.js";
import * as secretService from "./secretService.js";

export default class AuthService {
  constructor(context = {}) {
    this.context = context;
  }

  async register(email, password) {
    if (await userRepo.getByEmailOrNewEmail(email)) {
      throw new AppError("Email already in use.", 409);
    }
    const passwordHash = await secretService.generatePasswordHash(password);
    const confirmationToken = secretService.generateSecureRandomToken();
    const publicId = secretService.generatePublicId("user");
    const userDb = await userRepo.create(
      email,
      passwordHash,
      confirmationToken,
      "user",
      publicId
    );
    await mailer.sendConfirmationEmail(email, confirmationToken);
    await log(publicId, "USER_REGISTER", "SUCCESS", this.context);
    return userDb;
  }

  async login(email, password) {
    const userDb = await userRepo.getByEmail(email);
    if (!userDb) throw new AppError("Invalid credentials.", 401);

    const logData = { userPublicId: userDb.public_id, action: "USER_LOGIN" };
    const isValid = await secretService.verifyPassword(password, userDb.password_hash);
    if (!isValid) throw new AppError("Invalid credentials.", 401, { logData });
    if (!userDb.is_confirmed) {
      throw new AppError("User has not confirmed.", 401, { logData });
    }

    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return secretService.generateAuthToken(userDb);
  }

  async logout(user) {
    await log(user.id, "USER_LOGOUT", "SUCCESS", this.context);
    return true;
  }

  async confirm(token) {
    let userDb = await userRepo.getByConfirmationToken(token);
    if (!userDb) throw new AppError("Invalid confirmation token.", 401);

    const updateData = { is_confirmed: true, confirmation_token: null };
    if (userDb.new_email) {
      updateData.email = userDb.new_email;
      updateData.new_email = null;
    }
    const publicId = userDb.public_id;
    userDb = await userRepo.update(publicId, updateData);
    await log(publicId, "USER_CONFIRM_EMAIL", "SUCCESS", this.context);
    return userDb;
  }

  async resendConfirmation(email) {
    const userDb = await userRepo.getByEmailOrNewEmail(email);
    if (userDb && !userDb.is_confirmed && userDb.confirmation_token) {
      await mailer.sendConfirmationEmail(email, userDb.confirmation_token);
      await log(userDb.public_id, "USER_RESEND_CONFIRM_EMAIL", "SUCCESS", this.context);
    }
    return true;
  }

  async forgot(email) {
    const userDb = await userRepo.getByEmail(email);

    // Only send an email if the user was found!
    if (userDb) {
      const resetToken = secretService.generateSecureRandomToken();

      const expires = new Date(Date.now() + 3600000); // Expire in 1 hour
      await userRepo.update(userDb.public_id, {
        password_reset_token: resetToken,
        password_reset_expires: expires,
      });
      await mailer.sendResetEmail(email, resetToken);
      await log(userDb.public_id, "USER_PASSWORD_FORGOT", "SUCCESS", this.context);
    }
    return true; // Always send a success response so as not to reveal if an email exists.
  }

  async reset(token, newPassword) {
    const userDb = await userRepo.getByResetToken(token);
    if (!userDb) throw new AppError("Invalid or expired password reset token.", 401);

    const newPasswordHash = await secretService.generatePasswordHash(newPassword);
    log(userDb.public_id, "USER_PASSWORD_RESET", "SUCCESS", this.context);
    return userRepo.update(userDb.public_id, {
      password_hash: newPasswordHash,
      password_reset_token: null,
      password_reset_expires: null,
    });
  }
}
