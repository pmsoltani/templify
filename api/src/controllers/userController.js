import { publicUser } from "../schemas/userSchema.js";
import UserService from "../services/UserService.js";
import getContext from "../utils/getContext.js";

const get = async (req, res) => {
  const userDb = await new UserService(getContext(req)).get();

  res.json({
    message: "User retrieved successfully!",
    data: { user: publicUser.parse(userDb) },
  });
};

const updateEmail = async (req, res) => {
  await new UserService(getContext(req)).updateEmail(req.body.email);
  res.json({ message: "Check your new email for the confirmation link." });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await new UserService(getContext(req)).updatePassword(currentPassword, newPassword);
  res.json({ message: "Password updated successfully." });
};

const regenerateApiKey = async (req, res) => {
  const userDb = await new UserService(getContext(req)).regenerateApiKey();
  res.json({
    message: "API Key regenerated successfully!",
    data: { user: publicUser.parse(userDb) },
  });
};

const remove = async (req, res) => {
  await new UserService(getContext(req)).remove(req.body.password);
  res.status(204).send();
};

export { get, regenerateApiKey, remove, updateEmail, updatePassword };
