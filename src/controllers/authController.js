import * as userRepo from "../repositories/userRepository.js";
import * as authService from "../services/authService.js";
import * as secretService from "../services/secretService.js";
import AppError from "../utils/AppError.js";

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw new AppError("Missing email.", 400);
  if (!password) throw new AppError("Missing password.", 400);
  if (await userRepo.getByEmailOrNewEmail(email)) {
    throw new AppError("Email already in use.", 409);
  }

  const userDb = await authService.register(email, password);
  res.status(201).json({
    message: "User created successfully! Check your email for the confirmation link.",
    user: { id: userDb.id, email: userDb.email },
  });
};

const confirm = async (req, res) => {
  const { token } = req.query;
  if (!token) throw new AppError("Missing confirmation token.", 400);

  await authService.confirmEmail(token);
  res.json({ message: "Email confirmed successfully!" });
};

const resendConfirmation = async (req, res) => {
  const email = req.body.email;
  if (!email) throw new AppError("Missing email.", 400);
  await authService.resendConfirmation(email);
  res.json({ message: "If an account exists, confirmation link will be sent." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw new AppError("Missing email.", 400);
  if (!password) throw new AppError("Missing password.", 400);

  const userDb = await userRepo.getByEmail(email);
  if (
    !userDb ||
    !(await secretService.verifyPassword(password, userDb.password_hash))
  ) {
    throw new AppError("Invalid credentials.", 401);
  }
  if (!userDb.is_confirmed) throw new AppError("User has not confirmed.", 401);

  res.json({ accessToken: secretService.generateAuthToken(userDb) });
};

const logout = (req, res) => {
  res.json({ message: "Logged out successfully." });
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;
  if (!email) throw new AppError("Missing email.", 400);
  await authService.sendPasswordResetEmail(email);
  res.json({ message: "If an account exists, reset link will be sent." });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError("Missing token or new password.", 400);

  await authService.resetPassword(token, password);
  res.json({ message: "Password has been reset successfully." });
};

export {
  register,
  confirm,
  resendConfirmation,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
