import { z } from "zod";
import { dateTime, email, id, password, publicId, token } from "./sharedSchema.js";

const updateEmail = z.object({ body: z.object({ email }) });

const updatePassword = z.object({
  body: z.object({ currentPassword: password, newPassword: password }),
});

const remove = z.object({ body: z.object({ password }) });

const publicUserDb = z.object({
  id: id,
  public_id: publicId,
  email: email,
  is_confirmed: z.boolean(),
  api_key: token.nullable(),
  created_at: dateTime,
  updated_at: dateTime,
});

const publicUser = publicUserDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    email: dbData.email,
    isConfirmed: dbData.is_confirmed,
    apiKey: dbData.api_key,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicUsers = z.array(publicUser);

export { publicUser, publicUserDb, publicUsers, remove, updateEmail, updatePassword };
