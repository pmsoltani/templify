import * as userRepo from "../repositories/userRepository.js";
import * as authService from "../services/authService.js";
import * as secretService from "../services/secretService.js";
import AppError from "../utils/AppError.js";

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email." });
    if (!password) return res.status(400).json({ error: "Missing password." });
    if (await userRepo.getByEmailOrNewEmail(email)) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const userDb = await authService.register(email, password);
    res.status(201).json({
      message: "User created successfully! Check your email for the confirmation link.",
      user: { id: userDb.id, email: userDb.email },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const confirm = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing confirmation token." });

    await authService.confirmEmail(token);
    res.json({ message: "Email confirmed successfully!" });
  } catch (err) {
    console.error("Confirmation Error:", err);
    res.status(500).json({ error: "An error occurred during confirmation." });
  }
};

const resendConfirmation = async (req, res) => {
  try {
    await authService.resendConfirmation(req.body.email);
    res.json({ message: "If an account exists, confirmation link will be sent." });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  try {
    await authService.sendPasswordResetEmail(req.body.email);
    res.json({ message: "If an account exists, reset link will be sent." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Missing token and/or new password." });
    }

    await authService.resetPassword(token, password);
    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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
