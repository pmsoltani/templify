import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepository.js";
import * as mailer from "../services/mailerService.js";

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email and/or password." });
    }
    if (await userRepo.getByEmail(email)) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const newUser = await userRepo.create(email, passwordHash, confirmationToken);

    await mailer.sendConfirmationEmail(email, confirmationToken);

    res.status(201).json({
      message: "User created successfully! Check your email for the confirmation link.",
      user: { id: newUser.id, email: newUser.email },
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

    const user = await userRepo.confirmAndSetApiKey(token);
    if (!user) return res.status(404).json({ error: "Invalid confirmation token." });

    res.json({ message: "Email confirmed successfully! Log in to get your API key" });
  } catch (err) {
    console.error("Confirmation Error:", err);
    res.status(500).json({ error: "An error occurred during confirmation." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email and/or password." });
    }
    const user = await userRepo.getByEmail(email);

    if (
      !user ||
      !user.is_confirmed ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({ error: "Invalid credentials/user not confirmed." });
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ accessToken });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    // Re-fetch the up-to-date user from DB using the req data from authenticateToken
    const user = await userRepo.getById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { register, confirm, login, getMe };
