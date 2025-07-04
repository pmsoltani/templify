import { publicUser } from "../schemas/userSchema.js";
import AuthService from "../services/AuthService.js";
import getContext from "../utils/getContext.js";

const register = async (req, res) => {
  const { email, password } = req.body;
  const userDb = await new AuthService(getContext(req)).register(email, password);
  res.status(201).json({
    message: "User created successfully! Check your email for the confirmation link.",
    data: { user: publicUser.parse(userDb) },
  });
};

const confirm = async (req, res) => {
  await new AuthService(getContext(req)).confirm(req.query.token);
  res.json({ message: "Email confirmed successfully!" });
};

const resendConfirmation = async (req, res) => {
  await new AuthService(getContext(req)).resendConfirmation(req.body.email);
  res.json({ message: "If an account exists, confirmation link will be sent." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const accessToken = await new AuthService(getContext(req)).login(email, password);
  res.json({ message: "Logged in successfully!", data: { accessToken: accessToken } });
};

const logout = async (req, res) => {
  const user = req.user;
  await new AuthService(getContext(req)).logout(user);
  res.json({ message: "Logged out successfully." });
};

const forgot = async (req, res) => {
  await new AuthService(getContext(req)).forgot(req.body.email);
  res.json({ message: "If an account exists, reset link will be sent." });
};

const reset = async (req, res) => {
  const { token, password } = req.body;
  await new AuthService(getContext(req)).reset(token, password);
  res.json({ message: "Password has been reset successfully." });
};

export { register, confirm, resendConfirmation, login, logout, forgot, reset };
