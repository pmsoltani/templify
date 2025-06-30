import * as userRepo from "../repositories/userRepository.js";
import * as authService from "../services/authService.js";
import AppError from "../utils/AppError.js";

const register = async (req, res) => {
  const { email, password } = req.body;
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
  await authService.confirm(req.query.token);
  res.json({ message: "Email confirmed successfully!" });
};

const resendConfirmation = async (req, res) => {
  await authService.resendConfirmation(req.body.email);
  res.json({ message: "If an account exists, confirmation link will be sent." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const accessToken = await authService.login(email, password);
  res.json({ message: "Logged in successfully!", accessToken: accessToken });
};

const logout = (req, res) => {
  res.json({ message: "Logged out successfully." });
};

const forgot = async (req, res) => {
  await authService.sendResetEmail(req.body.email);
  res.json({ message: "If an account exists, reset link will be sent." });
};

const reset = async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ message: "Password has been reset successfully." });
};

export { register, confirm, resendConfirmation, login, logout, forgot, reset };
