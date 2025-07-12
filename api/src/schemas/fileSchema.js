import { z } from "zod";
import { dateTime, fileName, id, publicId, text } from "./sharedSchema.js";

const create = z.object({ body: z.object({ name: fileName.optional() }) });

const update = z.object({ body: z.object({ name: fileName.optional() }) });

const publicFileDb = z.object({
  id: id,
  public_id: publicId,
  template_id: id,
  template_public_id: publicId.nullish(),
  name: fileName,
  size: z.number().int(),
  mime: text,
  created_at: dateTime,
  updated_at: dateTime,
});

const publicFile = publicFileDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    templateId: dbData.template_public_id,
    name: dbData.name,
    size: dbData.size,
    mime: dbData.mime,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicFiles = z.array(publicFile);

export { create, publicFile, publicFiles, update };
