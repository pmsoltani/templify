import * as userRepo from "../repositories/userRepository.js";
import * as userService from "../services/userService.js";

const get = async (req, res) => {
  try {
    const userDb = await userRepo.getById(req.user.userId);
    if (!userDb) return res.status(404).json({ error: "User not found." });

    res.json({ message: "", user: { email: userDb.email, apiKey: userDb.api_key } });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateEmail = async (req, res) => {
  try {
    if (req.user.email === req.body.email) {
      return res.status(400).json({ error: "Cannot use the current email." });
    }
    await userService.updateEmail(req.user.userId, req.body.email);
    res.json({ message: "Check your new email for the confirmation link." });
    // TODO: Log the user out after email change
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing current and/or new password." });
    }
    await userService.updatePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: "Password updated successfully." });
    // TODO: Log the user out after email change
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const regenerateApiKey = async (req, res) => {
  try {
    const userDb = await userService.regenerateApiKey(req.user.userId);
    res.json({ message: "API Key regenerated successfully.", apiKey: userDb.api_key });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Missing password." });

    await userService.remove(req.user.userId, password);
    res.status(204).send();
    // TODO: Log the user out after email change
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export { get, updateEmail, updatePassword, regenerateApiKey, remove };
