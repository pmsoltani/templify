import * as userRepo from "../repositories/userRepository.js";
import * as mailer from "../services/mailerService.js";
import * as secretService from "../services/secretService.js";

const register = async (email, password) => {
  const passwordHash = await secretService.generatePasswordHash(password);
  const confirmationToken = secretService.generateSecureRandomToken();
  const userDb = await userRepo.create(email, passwordHash, confirmationToken);

  await mailer.sendConfirmationEmail(email, confirmationToken);
  return userDb;
};

const confirmEmail = async (token) => {
  let userDb = await userRepo.getByConfirmationToken(token);
  if (!userDb) throw new Error("Invalid confirmation token.");

  const updateData = { is_confirmed: true, confirmation_token: null };
  if (userDb.new_email) {
    updateData.email = userDb.new_email;
    updateData.new_email = null;
  }
  userDb = await userRepo.update(userDb.id, updateData);
  return userDb;
};

const resendConfirmation = async (email) => {
  const userDb = await userRepo.getByEmailOrNewEmail(email);
  if (userDb && !userDb.is_confirmed && userDb.confirmation_token) {
    await mailer.sendConfirmationEmail(email, userDb.confirmation_token);
  }
  return true;
};

const sendPasswordResetEmail = async (email) => {
  const userDb = await userRepo.getByEmail(email);

  // Only send an email if the user was found!
  if (userDb) {
    const resetToken = secretService.generateSecureRandomToken();

    const expires = new Date(Date.now() + 3600000); // Expire in 1 hour
    await userRepo.update(userDb.id, {
      password_reset_token: resetToken,
      password_reset_expires: expires,
    });
    await mailer.sendPasswordResetEmail(email, resetToken);
  }
  return true; // Always send a success response so as not to reveal if an email exists.
};

const resetPassword = async (token, newPassword) => {
  const userDb = await userRepo.getByResetToken(token);
  if (!userDb) throw new Error("Password reset token is invalid or has expired.");

  const newPasswordHash = await secretService.generatePasswordHash(newPassword);
  return userRepo.update(userDb.id, {
    password_hash: newPasswordHash,
    password_reset_token: null,
    password_reset_expires: null,
  });
};

export {
  register,
  confirmEmail,
  resendConfirmation,
  sendPasswordResetEmail,
  resetPassword,
};
