import { z } from "zod";
import {
  id,
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

const publicTemplate = z.object({
  id: id,
  user: id,
  name: templateName,
  htmlEntrypoint: templateHtmlEntrypoint,
  description: templateDescription,
  createdAt: dateTime,
  updatedAt: dateTime,
});

const publicTemplates = z.array(publicTemplate);

export { create, update, publicTemplate, publicTemplates };
