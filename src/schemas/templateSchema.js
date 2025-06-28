import { z } from "zod";
import { templateDescription, templateHtmlEntrypoint } from "./sharedSchema.js";

const create = z.object({
  body: z.object({
    name: z.string("Template name is required"),
    htmlEntrypoint: templateHtmlEntrypoint,
    description: templateDescription,
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    htmlEntrypoint: templateHtmlEntrypoint,
    description: templateDescription,
  }),
});

export { create, update };
