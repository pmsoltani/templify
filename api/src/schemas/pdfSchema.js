import { z } from "zod";
import { dateTime, id, publicId } from "./sharedSchema.js";

const publicPdfDb = z.object({
  id: id,
  public_id: publicId,
  user_id: id,
  user_public_id: publicId.nullish(),
  template_id: id,
  template_public_id: publicId.nullish(),
  created_at: dateTime,
  temp_url: z.url().nullish(),
});

const publicPdf = publicPdfDb.transform((dbData) => {
  return {
    id: dbData.public_id,
    userId: dbData.user_public_id,
    templateId: dbData.template_public_id,
    createdAt: dbData.created_at,
    tempUrl: dbData.temp_url,
  };
});

const publicPdfs = z.array(publicPdf);

export { publicPdf, publicPdfs };
