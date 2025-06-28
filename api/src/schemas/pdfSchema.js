import { z } from "zod";
import { id, dateTime } from "./sharedSchema.js";

const publicPdfDb = z.object({
  id: id,
  user_id: id,
  template_id: id,
  created_at: dateTime,
});

const publicPdf = publicPdfDb.transform((dbData) => {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    templateId: dbData.template_id,
    createdAt: dbData.created_at,
  };
});

const publicPdfs = z.array(publicPdf);

export { publicPdf, publicPdfs };
