import { z } from "zod";
import { id, publicId, dateTime } from "./sharedSchema.js";

const publicPdfDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.optional().nullable(),
  template_id: id,
  template_public_id: publicId.optional().nullable(),
  created_at: dateTime,
});

const publicPdf = publicPdfDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    userId: dbData.user_public_id,
    templateId: dbData.template_public_id,
    createdAt: dbData.created_at,
  };
});

const publicPdfs = z.array(publicPdf);

export { publicPdf, publicPdfs };
