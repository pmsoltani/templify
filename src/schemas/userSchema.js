import { z } from "zod";
import { email, password } from "./sharedSchema.js";

const updateEmail = z.object({ body: z.object({ email }) });

const updatePassword = z.object({
  body: z.object({ currentPassword: password, newPassword: password }),
});

const remove = z.object({ body: z.object({ password }) });

export { updateEmail, updatePassword, remove };
