import { z } from "zod";
import { dateTime, email, id, publicId, text } from "./sharedSchema.js";

const hubTemplate = z.object({
  name: text,
  description: text.nullish(),
  category: text.nullish(),
  tags: z.array(text).optional(),
});

const publish = z.object({ body: hubTemplate });

const update = z.object({
  body: hubTemplate.partial().refine(
    (data) => {
      return (
        data.name !== undefined ||
        data.description !== undefined ||
        data.category !== undefined ||
        data.tags !== undefined
      );
    },
    { message: "At least one field must be provided for update." }
  ),
});

const hubTemplateDb = z.object({
  id: id,
  public_id: publicId,
  template_id: id,
  template_public_id: publicId.nullish(),
  author_id: id,
  author_email: email.nullish(),
  author_public_id: publicId.nullish(),
  name: text,
  entrypoint: text,
  description: text.nullish(),
  category: text.nullish(),
  tags: z.array(text).nullish(),
  downloads: z.number().int().min(0),
  featured: z.boolean(),
  approved: z.boolean(),
  created_at: dateTime,
  updated_at: dateTime,
});

const publicHubTemplate = hubTemplateDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    templateId: dbData.template_public_id,
    authorId: dbData.author_public_id,
    authorEmail: dbData.author_email,
    name: dbData.name,
    entrypoint: dbData.entrypoint,
    description: dbData.description,
    category: dbData.category,
    tags: dbData.tags || [],
    downloads: dbData.downloads,
    featured: dbData.featured,
    approved: dbData.approved,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
});

const publicHubTemplates = z.array(publicHubTemplate);

export { hubTemplateDb, publicHubTemplate, publicHubTemplates, publish, update };
