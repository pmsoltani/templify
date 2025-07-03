import { z } from "zod";
import { id, publicId, email, password, token, dateTime } from "./sharedSchema.js";

const updateEmail = z.object({ body: z.object({ email }) });

const updatePassword = z.object({
  body: z.object({ currentPassword: password, newPassword: password }),
});

const remove = z.object({ body: z.object({ password }) });

const publicUserDb = z.object({
  id: id,
  public_id: publicId,
  email: email,
  api_key: token.nullable(),
  created_at: dateTime,
  updated_at: dateTime,
});

const publicUser = publicUserDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    email: dbData.email,
    apiKey: dbData.api_key,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicUsers = z.array(publicUser);

export { updateEmail, updatePassword, remove, publicUser, publicUsers, publicUserDb };
