import { z } from "zod";
import {
  DEFAULT_PDF_MARGIN,
  DEFAULT_PDF_SETTINGS,
  PDF_FORMATS,
  PDF_ORIENTATIONS,
} from "../config/pdfSettings.js";
import { dateTime, id, publicId, text } from "./sharedSchema.js";

const margin = text
  .regex(/^(\d+\.?\d*)(px|mm|cm|in|pt|pc)$/, "Invalid margin format")
  .default(DEFAULT_PDF_MARGIN);

const templateSettings = z
  .strictObject({
    format: z.enum(PDF_FORMATS),
    orientation: z.enum(PDF_ORIENTATIONS),
    margin: z.strictObject({
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    }),
    printBackground: z.boolean(),
    displayHeaderFooter: z.boolean(),
    headerTemplate: text,
    footerTemplate: text,
  })
  .partial()
  .optional()
  .transform((data) => ({ ...DEFAULT_PDF_SETTINGS, ...data }));

const create = z.object({
  body: z.object({
    name: text,
    entrypoint: text.nullish().transform((val) => (val ? val : "template.html")),
    description: text.nullish(),
    settings: templateSettings,
  }),
});

const update = z.object({
  body: z
    .object({
      name: text.nullish(),
      entrypoint: text.nullish(),
      description: text.nullish(),
    })
    .refine(
      (data) => {
        return (
          data.name !== undefined ||
          data.entrypoint !== undefined ||
          data.description !== undefined
        );
      },
      { error: "At least one field must be provided for update." }
    ),
});

const updateSettings = z.object({ body: z.object({ settings: templateSettings }) });

const publicTemplateDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.nullish(),
  name: text,
  entrypoint: text,
  description: text.nullish(),
  settings: templateSettings,
  created_at: dateTime,
  updated_at: dateTime,
});

const publicTemplate = publicTemplateDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    userId: dbData.user_public_id,
    name: dbData.name,
    entrypoint: dbData.entrypoint,
    description: dbData.description,
    settings: dbData.settings,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicTemplates = z.array(publicTemplate);

export { create, publicTemplate, publicTemplates, update, updateSettings };
