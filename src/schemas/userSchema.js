import { z } from "zod";
import { id, email, password, token, dateTime } from "./sharedSchema.js";

const updateEmail = z.object({ body: z.object({ email }) });

const updatePassword = z.object({
  body: z.object({ currentPassword: password, newPassword: password }),
});

const remove = z.object({ body: z.object({ password }) });

const publicUser = z.object({
  id: id,
  email: email,
  apiKey: token.optional(),
  createdAt: dateTime,
  updatedAt: dateTime,
});

export { updateEmail, updatePassword, remove, publicUser };
