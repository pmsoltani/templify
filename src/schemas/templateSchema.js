import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string("Template name is required"),
    htmlEntrypoint: z.string().optional().default("template.html"),
    description: z.string().optional(),
  }),
  file: z,
});

export { create };
