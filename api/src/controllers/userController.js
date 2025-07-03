import * as userRepo from "../repositories/userRepository.js";
import * as userService from "../services/userService.js";
import AppError from "../utils/AppError.js";
import { publicUser } from "../schemas/userSchema.js";

const get = async (req, res) => {
  const userDb = await userRepo.getByPublicId(req.user.id);
  if (!userDb) throw new AppError("User not found.", 404);

  res.json({
    message: "User retrieved successfully!",
    data: { user: publicUser.parse(userDb) },
  });
};

const updateEmail = async (req, res) => {
  const newEmail = req.body.email;
  if (req.user.email === newEmail) {
    throw new AppError("Cannot use the current email.", 400);
  }
  await userService.updateEmail(req.user.id, newEmail);
  res.json({ message: "Check your new email for the confirmation link." });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.updatePassword(req.user.id, currentPassword, newPassword);
  res.json({ message: "Password updated successfully." });
};

const regenerateApiKey = async (req, res) => {
  const userDb = await userService.regenerateApiKey(req.user.id);
  res.json({
    message: "API Key regenerated successfully!",
    data: { user: publicUser.parse(userDb) },
  });
};

const remove = async (req, res) => {
  console.log("Removing user:", req.user);
  await userService.remove(req.user.id, req.body.password);
  res.status(204).send();
};

export { get, updateEmail, updatePassword, regenerateApiKey, remove };
