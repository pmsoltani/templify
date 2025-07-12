import { z } from "zod";
import {
  dateTime,
  id,
  publicId,
  templateDescription,
  templateHtmlEntrypoint,
  templateName,
} from "./sharedSchema.js";

const margin = z
  .string()
  .regex(/^(\d+\.?\d*)(px|mm|cm|in|pt|pc)$/, "Invalid margin format")
  .optional()
  .default("20mm");

const templateSettings = z.object({
  format: z
    .enum(["A5", "A4", "A3", "A2", "A1", "A0", "Letter", "Legal"])
    .optional()
    .default("A4"),
  orientation: z.enum(["portrait", "landscape"]).optional().default("portrait"),
  margin: z
    .object({ top: margin, right: margin, bottom: margin, left: margin })
    .optional()
    .default({ top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" }),
  printBackground: z.boolean().optional().default(true),
  displayHeaderFooter: z.boolean().optional().default(false),
  headerTemplate: z.string().optional().default(""),
  footerTemplate: z.string().optional().default(""),
});

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

const updateSettings = z.object({
  body: z.object({ settings: templateSettings.optional() }),
});

const publicTemplateDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.optional().nullable(),
  name: templateName,
  html_entrypoint: templateHtmlEntrypoint,
  description: templateDescription.nullable(),
  settings: templateSettings.optional(),
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
    settings: dbData.settings,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicTemplates = z.array(publicTemplate);

export { create, publicTemplate, publicTemplates, update, updateSettings };
