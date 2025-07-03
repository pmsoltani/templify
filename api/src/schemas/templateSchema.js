import { z } from "zod";
import {
  id,
  publicId,
  dateTime,
  templateName,
  templateDescription,
  templateHtmlEntrypoint,
} from "./sharedSchema.js";

const create = z.object({
  body: z.object({
    name: templateName,
    htmlEntrypoint: templateHtmlEntrypoint,
    description: templateDescription,
  }),
});

const update = z.object({
  body: z.object({
    name: templateName.optional(),
    htmlEntrypoint: templateHtmlEntrypoint,
    description: templateDescription,
  }),
});

const publicTemplateDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.optional().nullable(),
  name: templateName,
  html_entrypoint: templateHtmlEntrypoint,
  description: templateDescription.nullable(),
  created_at: dateTime,
  updated_at: dateTime,
});

const publicTemplate = publicTemplateDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    userId: dbData.user_public_id,
    name: dbData.name,
    htmlEntrypoint: dbData.html_entrypoint,
    description: dbData.description,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicTemplates = z.array(publicTemplate);

export { create, update, publicTemplate, publicTemplates };
