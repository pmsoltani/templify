import { z } from "zod";
import { dateTime, id, publicId, text } from "./sharedSchema.js";

const margin = text
  .regex(/^(\d+\.?\d*)(px|mm|cm|in|pt|pc)$/, "Invalid margin format")
  .optional()
  .default("20mm");

const templateSettings = z.strictObject({
  format: z
    .enum(["A5", "A4", "A3", "A2", "A1", "A0", "Letter", "Legal"])
    .optional()
    .default("A4"),
  orientation: z.enum(["portrait", "landscape"]).optional().default("portrait"),
  margin: z
    .strictObject({ top: margin, right: margin, bottom: margin, left: margin })
    .optional()
    .default({ top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" }),
  printBackground: z.boolean().optional().default(true),
  displayHeaderFooter: z.boolean().optional().default(false),
  headerTemplate: text.optional().default(""),
  footerTemplate: text.optional().default(""),
});

const templateSettingsFull = templateSettings.optional().transform((val) => {
  if (val === undefined) return templateSettings.parse({});
  return val;
});

const create = z.object({
  body: z.object({
    name: text,
    htmlEntrypoint: text.default("template.html"),
    description: text.nullish(),
    settings: templateSettingsFull,
  }),
});

const update = z.object({
  body: z
    .object({
      name: text.nullish(),
      htmlEntrypoint: text.nullish(),
      description: text.nullish(),
    })
    .refine(
      (data) => {
        return (
          data.name !== undefined ||
          data.htmlEntrypoint !== undefined ||
          data.description !== undefined
        );
      },
      { error: "At least one field must be provided for update." }
    ),
});

const updateSettings = z.object({ body: z.object({ settings: templateSettingsFull }) });

const publicTemplateDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.nullish(),
  name: text,
  html_entrypoint: text,
  description: text.nullish(),
  settings: templateSettingsFull,
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
